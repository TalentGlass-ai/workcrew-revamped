import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

// Maps plan keys to Stripe price IDs via env vars.
// Set STRIPE_PRICE_<PLAN>_<BILLING> in production.
const PRICE_ID: Record<string, string | undefined> = {
  starter_monthly:    process.env.STRIPE_PRICE_STARTER_MONTHLY,
  starter_yearly:     process.env.STRIPE_PRICE_STARTER_YEARLY,
  growth_monthly:     process.env.STRIPE_PRICE_GROWTH_MONTHLY,
  growth_yearly:      process.env.STRIPE_PRICE_GROWTH_YEARLY,
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
  enterprise_yearly:  process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
};

const PLAN_AMOUNTS: Record<string, number> = {
  starter_monthly: 99,  starter_yearly: 89,
  growth_monthly:  199, growth_yearly:  179,
  enterprise_monthly: 399, enterprise_yearly: 359,
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'trialing', 'past_due'] },
      },
      include: {
        usages: {
          where: { periodStart: { lte: now }, periodEnd: { gte: now } },
          orderBy: { metric: 'asc' },
        },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: session.user.id, status: 'active' },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json({ subscription, paymentMethods });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { planKey, billing = 'monthly' } = await request.json();
    if (!planKey) return NextResponse.json({ error: 'planKey required' }, { status: 400 });

    const key = `${planKey}_${billing}`;
    const priceId = PRICE_ID[key];
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    if (!priceId) {
      // Stripe price IDs not configured — fall back to a one-time PaymentIntent
      // so the checkout UI still works in development/testing.
      const amount = PLAN_AMOUNTS[key];
      if (!amount) return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });

      const pi = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        metadata: { userId: session.user.id, planKey, billing },
        automatic_payment_methods: { enabled: true },
      });
      return NextResponse.json({ clientSecret: pi.client_secret, mode: 'payment' });
    }

    // Find or create Stripe customer
    const existing = await stripe.customers.search({
      query: `metadata["userId"]:"${session.user.id}"`,
      limit: 1,
    });
    const customer = existing.data[0] ?? await stripe.customers.create({
      email: session.user.email ?? undefined,
      metadata: { userId: session.user.id },
    });

    // Create subscription with incomplete payment behavior so we get a clientSecret
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { userId: session.user.id, planKey, billing },
    });

    const clientSecret = (subscription.latest_invoice as any)?.payment_intent?.client_secret;
    if (!clientSecret) {
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
    }

    return NextResponse.json({ clientSecret, subscriptionId: subscription.id, mode: 'subscription' });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { subscriptionId } = await request.json();
    if (!subscriptionId) return NextResponse.json({ error: 'subscriptionId required' }, { status: 400 });

    const sub = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId: session.user.id },
    });
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (sub.stripeSubscriptionId) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { cancelAtPeriodEnd: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
