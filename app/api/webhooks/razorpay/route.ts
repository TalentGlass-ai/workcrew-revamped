import { NextRequest, NextResponse } from 'next/server';
import { getPaymentServiceForRegion } from '../../../../lib/utils/region';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Store processed event IDs to prevent duplicates (in production, use Redis or DB)
const processedEvents = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Get payment service for India region (Razorpay)
    const paymentService = getPaymentServiceForRegion('india');

    // Handle webhook
    const result = await paymentService.handleWebhook(JSON.parse(body), signature);

    // Check idempotency
    const eventId = result.data.id || crypto.randomUUID();
    if (processedEvents.has(eventId)) {
      console.log(`Duplicate event ${eventId}, skipping`);
      return NextResponse.json({ received: true });
    }
    processedEvents.add(eventId);

    // Update database based on event
    await updateDatabaseFromWebhook(result, 'razorpay');

    console.log(`Processed Razorpay webhook: ${result.type}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function updateDatabaseFromWebhook(result: any, gateway: 'stripe' | 'razorpay') {
  const { data } = result;

  if (!data.subscriptionId) return;

  const subscriptionField = gateway === 'stripe' ? 'stripeSubscriptionId' : 'razorpaySubscriptionId';

  // Update subscription status
  if (data.status) {
    await prisma.subscription.updateMany({
      where: {
        [subscriptionField]: data.subscriptionId,
      },
      data: {
        status: data.status,
        ...(data.currentPeriodStart && { currentPeriodStart: data.currentPeriodStart }),
        ...(data.currentPeriodEnd && { currentPeriodEnd: data.currentPeriodEnd }),
      },
    });
  }

  // Create invoice/payment records for successful payments
  if (result.type.includes('charged') || result.type.includes('payment_succeeded')) {
    // Find subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        [subscriptionField]: data.subscriptionId,
      },
    });

    if (subscription) {
      // Find existing open invoice or create new
      let invoice = await prisma.invoice.findFirst({
        where: {
          subscriptionId: subscription.id,
          status: 'open',
        },
      });

      if (!invoice) {
        invoice = await prisma.invoice.create({
          data: {
            subscriptionId: subscription.id,
            amount: data.amount || 0,
            status: 'paid',
            paidAt: new Date(),
            [`${gateway}InvoiceId`]: data.invoiceId || data.subscriptionId,
          },
        });
      } else {
        // Update existing invoice
        invoice = await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'paid',
            paidAt: new Date(),
          },
        });
      }

      // Create payment record
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: data.amount || 0,
          status: 'succeeded',
          gateway: 'razorpay',
          region: 'india',
          [`${gateway}PaymentId`]: data.paymentId || data.id,
        },
      });
    }
  }
}