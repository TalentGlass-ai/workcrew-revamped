import { NextRequest, NextResponse } from 'next/server';
import { getPaymentServiceForRegion } from '../../../../lib/utils/region';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Get payment service for global region (Stripe)
    const paymentService = getPaymentServiceForRegion('global');

    // Handle webhook
    const result = await paymentService.handleWebhook(JSON.parse(body), signature);

    // Check idempotency using database
    const eventId = result.id;
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId_gateway: { eventId, gateway: 'stripe' } },
    });

    if (existingEvent) {
      console.log(`Duplicate Stripe event ${eventId}, skipping`);
      return NextResponse.json({ received: true });
    }

    // Store event for idempotency
    await prisma.webhookEvent.create({
      data: {
        eventId,
        gateway: 'stripe',
        eventType: result.type,
        payload: body,
        processedAt: new Date(),
      },
    });

    // Update database based on event
    await updateDatabaseFromWebhook(result, 'stripe');

    console.log(`Processed Stripe webhook: ${result.type} (${eventId})`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function updateDatabaseFromWebhook(result: any, gateway: 'stripe' | 'razorpay') {
  const { type, data } = result;

  switch (type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionEvent(data, gateway);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionCancellation(data, gateway);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(data, gateway);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(data, gateway);
      break;

    case 'customer.subscription.trial_will_end':
      await handleTrialEnding(data, gateway);
      break;

    default:
      console.log(`Unhandled ${gateway} event type: ${type}`);
  }
}

async function handleSubscriptionEvent(data: any, gateway: 'stripe' | 'razorpay') {
  const subscriptionField = gateway === 'stripe' ? 'stripeSubscriptionId' : 'razorpaySubscriptionId';

  // Update subscription status and dates
  await prisma.subscription.updateMany({
    where: {
      [subscriptionField]: data.id,
    },
    data: {
      status: data.status,
      currentPeriodStart: data.current_period_start ? new Date(data.current_period_start * 1000) : undefined,
      currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end * 1000) : undefined,
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
    },
  });

  console.log(`Updated subscription ${data.id} status to ${data.status}`);
}

async function handleSubscriptionCancellation(data: any, gateway: 'stripe' | 'razorpay') {
  const subscriptionField = gateway === 'stripe' ? 'stripeSubscriptionId' : 'razorpaySubscriptionId';

  await prisma.subscription.updateMany({
    where: {
      [subscriptionField]: data.id,
    },
    data: {
      status: 'canceled',
      cancelAtPeriodEnd: false,
    },
  });

  console.log(`Canceled subscription ${data.id}`);
}

async function handlePaymentSucceeded(data: any, gateway: 'stripe' | 'razorpay') {
  const subscriptionField = gateway === 'stripe' ? 'stripeSubscriptionId' : 'razorpaySubscriptionId';

  // Find subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      [subscriptionField]: data.subscription,
    },
  });

  if (!subscription) {
    console.error(`Subscription not found for ${gateway} invoice ${data.id}`);
    return;
  }

  // Update or create invoice
  const invoiceData = {
    subscriptionId: subscription.id,
    amount: data.amount_due / 100, // Convert from cents
    status: 'paid',
    paidAt: new Date(),
    [`${gateway}InvoiceId`]: data.id,
  };

  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      [`${gateway}InvoiceId`]: data.id,
    },
  });

  let invoice;
  if (existingInvoice) {
    invoice = await prisma.invoice.update({
      where: { id: existingInvoice.id },
      data: invoiceData,
    });
  } else {
    invoice = await prisma.invoice.create({
      data: invoiceData,
    });
  }

  // Create payment record
  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: data.amount_due / 100,
      currency: data.currency,
      status: 'succeeded',
      gateway,
      region: gateway === 'stripe' ? 'global' : 'india',
      [`${gateway}PaymentIntentId`]: data.payment_intent,
    },
  });

  console.log(`Recorded successful payment for invoice ${data.id}`);
}

async function handlePaymentFailed(data: any, gateway: 'stripe' | 'razorpay') {
  const subscriptionField = gateway === 'stripe' ? 'stripeSubscriptionId' : 'razorpaySubscriptionId';

  // Find subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      [subscriptionField]: data.subscription,
    },
  });

  if (!subscription) {
    console.error(`Subscription not found for failed ${gateway} payment ${data.id}`);
    return;
  }

  // Update subscription status to past_due
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'past_due' },
  });

  // Create failed payment record
  const invoice = await prisma.invoice.findFirst({
    where: {
      subscriptionId: subscription.id,
      status: 'open',
    },
  });

  if (invoice) {
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: data.amount_due / 100,
        currency: data.currency,
        status: 'failed',
        gateway,
        region: gateway === 'stripe' ? 'global' : 'india',
        [`${gateway}PaymentIntentId`]: data.payment_intent,
      },
    });
  }

  console.log(`Recorded failed payment for subscription ${data.subscription}`);
}

async function handleTrialEnding(data: any, gateway: 'stripe' | 'razorpay') {
  // TODO: Send notification to customer about trial ending
  console.log(`Trial ending for subscription ${data.id}`);
}