import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getStripe, billingNotConfigured } from '../../../../lib/stripe';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripe();
    if (!stripe) return billingNotConfigured();

    // Find or create Stripe customer by userId metadata
    const existing = await stripe.customers.search({
      query: `metadata["userId"]:"${session.user.id}"`,
      limit: 1,
    });

    const customer = existing.data[0] ?? await stripe.customers.create({
      email: session.user.email ?? undefined,
      metadata: { userId: session.user.id },
    });

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Setup intent error:', error);
    return NextResponse.json({ error: 'Failed to create setup intent' }, { status: 500 });
  }
}
