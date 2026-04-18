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

    const { amount, currency = 'USD', metadata } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Determine region (default to global for now, can be enhanced)
    const region = 'global'; // TODO: detect based on user/org location
    const paymentService = getPaymentServiceForRegion(region);

    // Create payment intent
    const result = await paymentService.createPaymentIntent({
      amount,
      currency,
      metadata: {
        userId: session.user.id,
        ...metadata,
      },
    });

    // Log the payment intent creation
    console.log(`Payment intent created: ${result.paymentIntentId} for user ${session.user.id}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}