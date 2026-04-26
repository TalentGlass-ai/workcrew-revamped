import { NextRequest, NextResponse } from 'next/server';
import { getPaymentServiceForRegion } from '../../../../lib/utils/region';
import { prisma } from '../../../../lib/prisma';
import { SecurityUtils } from '../../../../lib/utils/security';
import { AuditLogger } from '../../../../lib/services/audit-logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      await AuditLogger.logSecurityEvent(
        undefined,
        undefined,
        'webhook_missing_signature',
        {
          gateway: 'razorpay',
          ipAddress: clientIP,
          userAgent,
          bodyLength: body.length,
        },
        'high'
      );
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Validate webhook signature using security utils
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isValidSignature = SecurityUtils.validateRazorpayWebhook(body, signature, webhookSecret);
    if (!isValidSignature) {
      await AuditLogger.logSecurityEvent(
        undefined,
        undefined,
        'webhook_invalid_signature',
        {
          gateway: 'razorpay',
          ipAddress: clientIP,
          userAgent,
          signatureProvided: !!signature,
        },
        'critical'
      );
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      await AuditLogger.logSecurityEvent(
        undefined,
        undefined,
        'webhook_invalid_payload',
        {
          gateway: 'razorpay',
          ipAddress: clientIP,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'high'
      );
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Get payment service for India region (Razorpay)
    const paymentService = getPaymentServiceForRegion('india');

    // Handle webhook with enhanced error handling
    const result = await paymentService.handleWebhook(webhookData, signature);

    // Check idempotency using database
    const eventId = result.id;
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId_gateway: { eventId, gateway: 'razorpay' } },
    });

    if (existingEvent) {
      console.log(`Duplicate Razorpay event ${eventId}, skipping`);
      await AuditLogger.logBillingEvent(
        undefined,
        undefined,
        'webhook_duplicate_event',
        {
          gateway: 'razorpay',
          eventId,
          eventType: result.type,
          ipAddress: clientIP,
        },
        'low'
      );
      return NextResponse.json({ received: true });
    }

    // Store event for idempotency with sanitized data
    const sanitizedPayload = SecurityUtils.sanitizeForLogging(webhookData);
    await prisma.webhookEvent.create({
      data: {
        eventId,
        gateway: 'razorpay',
        eventType: result.type,
        payload: JSON.stringify(sanitizedPayload),
        processedAt: new Date(),
      },
    });

    // Update database based on event
    await updateDatabaseFromWebhook(result, 'razorpay');

    // Log successful processing
    await AuditLogger.logBillingEvent(
      undefined,
      undefined,
      'webhook_processed',
      {
        gateway: 'razorpay',
        eventId,
        eventType: result.type,
        processingTime: Date.now() - startTime,
        ipAddress: clientIP,
      },
      'low'
    );

    console.log(`Processed Razorpay webhook: ${result.type} (${eventId})`);

    // Return with security headers
    const response = NextResponse.json({ received: true });
    Object.entries(SecurityUtils.getSecurityHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('Razorpay webhook error:', error);

    // Log error with context
    await AuditLogger.logSecurityEvent(
      undefined,
      undefined,
      'webhook_processing_error',
      {
        gateway: 'razorpay',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        processingTime: Date.now() - startTime,
        ipAddress: clientIP,
        userAgent,
      },
      'high'
    );

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function updateDatabaseFromWebhook(result: any, gateway: 'stripe' | 'razorpay') {
  const { type, data } = result;

  switch (type) {
    case 'subscription.created':
    case 'subscription.updated':
      await handleSubscriptionEvent(data, gateway);
      break;

    case 'subscription.cancelled':
      await handleSubscriptionCancellation(data, gateway);
      break;

    case 'payment.captured':
      await handlePaymentSucceeded(data, gateway);
      break;

    case 'payment.failed':
      await handlePaymentFailed(data, gateway);
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
      currentPeriodStart: data.current_start ? new Date(data.current_start * 1000) : undefined,
      currentPeriodEnd: data.current_end ? new Date(data.current_end * 1000) : undefined,
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
      [subscriptionField]: data.subscription_id,
    },
  });

  if (!subscription) {
    console.error(`Subscription not found for ${gateway} payment ${data.id}`);
    return;
  }

  // Update or create invoice
  const invoiceData = {
    subscriptionId: subscription.id,
    amount: data.amount / 100, // Convert from paisa
    status: 'paid',
    paidAt: new Date(),
    [`${gateway}InvoiceId`]: data.invoice_id || data.id,
  };

  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      [`${gateway}InvoiceId`]: data.invoice_id || data.id,
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
      amount: data.amount / 100,
      currency: data.currency,
      status: 'succeeded',
      gateway,
      region: gateway === 'stripe' ? 'global' : 'india',
      [`${gateway}PaymentId`]: data.id,
    },
  });

  console.log(`Recorded successful payment for invoice ${data.invoice_id || data.id}`);
}

async function handlePaymentFailed(data: any, gateway: 'stripe' | 'razorpay') {
  const subscriptionField = gateway === 'stripe' ? 'stripeSubscriptionId' : 'razorpaySubscriptionId';

  // Find subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      [subscriptionField]: data.subscription_id,
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
        amount: data.amount / 100,
        currency: data.currency,
        status: 'failed',
        gateway,
        region: gateway === 'stripe' ? 'global' : 'india',
        [`${gateway}PaymentId`]: data.id,
      },
    });
  }

  console.log(`Recorded failed payment for subscription ${data.subscription_id}`);
}