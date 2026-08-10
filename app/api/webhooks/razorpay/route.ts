import { NextRequest, NextResponse } from 'next/server';
import { getPaymentServiceForRegion } from '../../../../lib/utils/region';
import { prisma } from '../../../../lib/prisma';
import { SecurityUtils } from '../../../../lib/utils/security';
import { AuditLogger } from '../../../../lib/services/audit-logger';
import { sendEmail, emailTemplates, getBillingEmail } from '../../../../lib/email';

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
  // data = { subscription?: { entity: {...} }, payment?: { entity: {...} } }

  switch (type) {
    case 'subscription.created':
    case 'subscription.activated':
    case 'subscription.updated':
      await handleSubscriptionEvent(data.subscription?.entity, gateway);
      break;

    case 'subscription.cancelled':
    case 'subscription.completed':
      await handleSubscriptionCancellation(data.subscription?.entity, gateway);
      break;

    case 'subscription.charged':
    case 'payment.captured':
      await handlePaymentSucceeded(data, gateway);
      break;

    case 'subscription.halted':
    case 'payment.failed':
      await handlePaymentFailed(data, gateway);
      break;

    default:
      console.log(`Unhandled ${gateway} event type: ${type}`);
  }
}

async function handleSubscriptionEvent(sub: any, _gateway: 'stripe' | 'razorpay') {
  if (!sub?.id) return;
  await prisma.subscription.updateMany({
    where: { razorpaySubscriptionId: sub.id },
    data: {
      status: sub.status,
      currentPeriodStart: sub.current_start ? new Date(sub.current_start * 1000) : undefined,
      currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : undefined,
    },
  });

  const subscription = await prisma.subscription.findFirst({ where: { razorpaySubscriptionId: sub.id } });
  if (subscription) {
    const email = await getBillingEmail(subscription);
    if (email) {
      const tpl = emailTemplates.subscriptionUpdated(subscription.planId, sub.status);
      await sendEmail(email, tpl.subject, tpl.html);
    }
  }

  console.log(`Updated Razorpay subscription ${sub.id} to ${sub.status}`);
}

async function handleSubscriptionCancellation(sub: any, _gateway: 'stripe' | 'razorpay') {
  if (!sub?.id) return;

  const subscription = await prisma.subscription.findFirst({ where: { razorpaySubscriptionId: sub.id } });

  await prisma.subscription.updateMany({
    where: { razorpaySubscriptionId: sub.id },
    data: { status: 'canceled', cancelAtPeriodEnd: false },
  });

  if (subscription) {
    const email = await getBillingEmail(subscription);
    if (email) {
      const periodEnd = sub.current_end ? new Date(sub.current_end * 1000) : new Date();
      const tpl = emailTemplates.subscriptionCancelled(subscription.planId, periodEnd);
      await sendEmail(email, tpl.subject, tpl.html);
    }
  }

  console.log(`Canceled Razorpay subscription ${sub.id}`);
}

async function handlePaymentSucceeded(data: any, _gateway: 'stripe' | 'razorpay') {
  const payment = data.payment?.entity;
  const sub = data.subscription?.entity;
  if (!payment) return;

  const subscriptionId = payment.subscription_id ?? sub?.id;
  if (!subscriptionId) {
    console.error(`No subscription ID on Razorpay payment ${payment.id}`);
    return;
  }

  const subscription = await prisma.subscription.findFirst({
    where: { razorpaySubscriptionId: subscriptionId },
  });
  if (!subscription) {
    console.error(`Subscription not found for Razorpay payment ${payment.id}`);
    return;
  }

  const existingInvoice = await prisma.invoice.findFirst({
    where: { razorpayInvoiceId: payment.invoice_id ?? payment.id },
  });

  const invoiceFields = {
    subscriptionId: subscription.id,
    amount: Number(payment.amount) / 100,
    currency: payment.currency ?? 'INR',
    status: 'paid' as const,
    paidAt: new Date(),
    razorpayInvoiceId: payment.invoice_id ?? payment.id,
  };

  const invoice = existingInvoice
    ? await prisma.invoice.update({ where: { id: existingInvoice.id }, data: invoiceFields })
    : await prisma.invoice.create({ data: invoiceFields });

  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: Number(payment.amount) / 100,
      currency: payment.currency ?? 'INR',
      status: 'succeeded',
      gateway: 'razorpay',
      region: 'india',
      razorpayPaymentId: payment.id,
    },
  });

  const email = await getBillingEmail(subscription);
  if (email) {
    const tpl = emailTemplates.paymentSucceeded(Number(payment.amount) / 100, payment.currency ?? 'INR', new Date());
    await sendEmail(email, tpl.subject, tpl.html);
  }

  console.log(`Recorded Razorpay payment ${payment.id}`);
}

async function handlePaymentFailed(data: any, _gateway: 'stripe' | 'razorpay') {
  const payment = data.payment?.entity;
  const sub = data.subscription?.entity;

  const subscriptionId = payment?.subscription_id ?? sub?.id;
  if (!subscriptionId) return;

  const subscription = await prisma.subscription.findFirst({
    where: { razorpaySubscriptionId: subscriptionId },
  });
  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'past_due' },
  });

  if (payment) {
    const invoice = await prisma.invoice.findFirst({
      where: { subscriptionId: subscription.id, status: 'open' },
    });
    if (invoice) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: Number(payment.amount) / 100,
          currency: payment.currency ?? 'INR',
          status: 'failed',
          gateway: 'razorpay',
          region: 'india',
          razorpayPaymentId: payment.id,
        },
      });
    }
  }

  const email = await getBillingEmail(subscription);
  if (email) {
    const tpl = emailTemplates.paymentFailed(
      payment ? Number(payment.amount) / 100 : undefined,
      payment?.currency ?? 'INR',
    );
    await sendEmail(email, tpl.subject, tpl.html);
  }

  console.log(`Recorded Razorpay payment failure for subscription ${subscriptionId}`);
}