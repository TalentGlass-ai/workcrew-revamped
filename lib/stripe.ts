import Stripe from 'stripe';
import { NextResponse } from 'next/server';

/** Stripe client, or null when STRIPE_SECRET_KEY is not configured. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

/** 503 response for billing routes when the payment provider isn't configured. */
export function billingNotConfigured(): NextResponse {
  return NextResponse.json(
    { error: 'Billing is not configured on this environment.', code: 'BILLING_NOT_CONFIGURED' },
    { status: 503 },
  );
}
