import { NextRequest, NextResponse } from 'next/server';
import { detectPaymentRegion, getPaymentServiceForRegion } from '../../../../lib/utils/region';
import { PrismaClient } from '@prisma/client';
import { auth } from '../../../../auth';

const prisma = new PrismaClient();

// GET /api/billing/payment-methods - List payment methods
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    // Get payment methods for user or organization
    const where = organizationId
      ? { organizationId, status: 'active' }
      : { userId: session.user.id, status: 'active' };

    const paymentMethods = await prisma.paymentMethod.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Payment methods fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

// POST /api/billing/payment-methods - Add payment method
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethodId, organizationId, setAsDefault = false } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID required' }, { status: 400 });
    }

    // Determine region and service
    const region = detectPaymentRegion({
      organizationRegion: organizationId ? undefined : undefined, // TODO: get from org profile
      userRegion: undefined, // TODO: get from user profile
      ipAddress: request.headers.get('x-forwarded-for') as string || request.headers.get('x-real-ip') as string
    });
    const paymentService = getPaymentServiceForRegion(region);

    // Determine gateway based on region
    const gateway = region === 'india' ? 'razorpay' : 'stripe';

    // Add payment method
    const result = await paymentService.addPaymentMethod(
      organizationId || session.user.id,
      paymentMethodId
    );

    // If setting as default, unset other defaults first
    if (setAsDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          OR: [
            { userId: session.user.id },
            { organizationId },
          ],
        },
        data: { isDefault: false },
      });
    }

    // Save to database
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: organizationId ? undefined : session.user.id,
        organizationId,
        gateway,
        gatewayMethodId: paymentMethodId,
        type: result.type,
        last4: result.last4,
        brand: result.brand,
        expiryMonth: result.expiryMonth,
        expiryYear: result.expiryYear,
        isDefault: setAsDefault,
      },
    });

    console.log(`Payment method added: ${paymentMethod.id} for ${organizationId ? 'org' : 'user'} ${organizationId || session.user.id}`);

    return NextResponse.json({ paymentMethod });
  } catch (error) {
    console.error('Payment method add error:', error);
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
}

// PUT /api/billing/payment-methods - Update payment method (set default)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethodId, setAsDefault } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID required' }, { status: 400 });
    }

    // Find the payment method
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        OR: [
          { userId: session.user.id },
          { organizationId: { in: await prisma.organization.findMany({ where: { users: { some: { id: session.user.id } } }, select: { id: true } }).then(orgs => orgs.map(o => o.id)) } },
        ],
      },
    });

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    if (setAsDefault) {
      // Unset other defaults
      await prisma.paymentMethod.updateMany({
        where: {
          OR: [
            { userId: paymentMethod.userId },
            { organizationId: paymentMethod.organizationId },
          ],
        },
        data: { isDefault: false },
      });
    }

    // Update payment method
    const updatedMethod = await prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data: { isDefault: setAsDefault },
    });

    console.log(`Payment method updated: ${paymentMethodId}, default: ${setAsDefault}`);

    return NextResponse.json({ paymentMethod: updatedMethod });
  } catch (error) {
    console.error('Payment method update error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

// DELETE /api/billing/payment-methods - Remove payment method
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get('id');

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID required' }, { status: 400 });
    }

    // Find the payment method
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        OR: [
          { userId: session.user.id },
          { organizationId: { in: await prisma.organization.findMany({ where: { users: { some: { id: session.user.id } } }, select: { id: true } }).then(orgs => orgs.map(o => o.id)) } },
        ],
      },
    });

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    // Determine region and service
    const region = paymentMethod.gateway === 'razorpay' ? 'india' : 'global';
    const paymentService = getPaymentServiceForRegion(region);

    // Remove from gateway
    await paymentService.removePaymentMethod(
      paymentMethod.organizationId || paymentMethod.userId!,
      paymentMethod.gatewayMethodId
    );

    // Remove from database
    await prisma.paymentMethod.delete({
      where: { id: paymentMethodId },
    });

    console.log(`Payment method removed: ${paymentMethodId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment method remove error:', error);
    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}