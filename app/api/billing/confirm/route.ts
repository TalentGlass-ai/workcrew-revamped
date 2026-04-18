import { NextRequest, NextResponse } from 'next/server';
import { getPaymentServiceForRegion } from '../../../../lib/utils/region';
import { PrismaClient } from '@prisma/client';
import { auth } from '../../../../auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID required' }, { status: 400 });
    }

    // Determine region - for now assume global, can be enhanced
    const region = 'global';
    const paymentService = getPaymentServiceForRegion(region);

    // Confirm payment
    const result = await paymentService.confirmPayment(paymentIntentId);

    // Update payment status in database
    await prisma.payment.updateMany({
      where: {
        stripePaymentIntentId: paymentIntentId,
      },
      data: {
        status: result.status,
        ...(result.status === 'succeeded' && { paidAt: new Date() }),
      },
    });

    // If payment succeeded, update related invoice
    if (result.status === 'succeeded') {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { invoice: true },
      });

      if (payment?.invoice) {
        await prisma.invoice.update({
          where: { id: payment.invoice.id },
          data: { status: 'paid', paidAt: new Date() },
        });
      }
    }

    console.log(`Payment confirmed: ${paymentIntentId}, status: ${result.status}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}