import { NextRequest, NextResponse } from 'next/server';
import { getPaymentServiceForRegion } from '../../../../lib/utils/region';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../auth';

// Exponential backoff configuration
const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second

function calculateDelay(attempt: number): number {
  return BASE_DELAY * Math.pow(2, attempt - 1);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    // Find the payment in database
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { stripePaymentIntentId: paymentId },
          { razorpayPaymentId: paymentId },
        ],
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Check retry count
    const retryCount = payment.retryCount || 0;
    if (retryCount >= MAX_RETRIES) {
      return NextResponse.json({ error: 'Maximum retries exceeded' }, { status: 400 });
    }

    // Calculate delay
    const delay = calculateDelay(retryCount + 1);

    // Wait for delay (in production, this would be handled by a job queue)
    await new Promise(resolve => setTimeout(resolve, delay));

    // Determine region and service
    const region = payment.stripePaymentIntentId ? 'global' : 'india';
    const paymentService = getPaymentServiceForRegion(region);

    // Retry payment
    const result = await paymentService.retryFailedPayment(paymentId);

    // Update payment status and retry count
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: result.status,
        retryCount: retryCount + 1,
        lastRetryAt: new Date(),
        ...(result.status === 'succeeded' && { paidAt: new Date() }),
      },
    });

    // If payment succeeded, update related invoice
    if (result.status === 'succeeded' && payment.invoiceId) {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'paid', paidAt: new Date() },
      });
    }

    console.log(`Payment retry ${retryCount + 1}/${MAX_RETRIES}: ${paymentId}, status: ${result.status}`);

    return NextResponse.json({
      ...result,
      retryCount: retryCount + 1,
      maxRetries: MAX_RETRIES,
    });
  } catch (error) {
    console.error('Payment retry error:', error);
    return NextResponse.json(
      { error: 'Failed to retry payment' },
      { status: 500 }
    );
  }
}