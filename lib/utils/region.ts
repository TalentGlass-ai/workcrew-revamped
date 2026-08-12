// lib/utils/region.ts

import type { NextRequest } from 'next/server';
import { prisma } from '../prisma';

export type PaymentRegion = 'global' | 'india';

interface RegionDetectionOptions {
  ipAddress?: string;
  organizationCountry?: string | null;
  userCountry?: string | null;
}

/**
 * Determines payment region from stored profile data and/or CDN country header.
 * Priority: org country > user country > CDN header > default global.
 */
export function detectPaymentRegion(options: RegionDetectionOptions): PaymentRegion {
  const { organizationCountry, userCountry, ipAddress } = options;

  const orgCountry = organizationCountry?.toUpperCase();
  if (orgCountry) return orgCountry === 'IN' ? 'india' : 'global';

  const uCountry = userCountry?.toUpperCase();
  if (uCountry) return uCountry === 'IN' ? 'india' : 'global';

  // CDN country header (ipAddress param re-used for the header value to keep signature compat)
  if (ipAddress) return ipAddress.toUpperCase() === 'IN' ? 'india' : 'global';

  return 'global';
}

/**
 * Reads the CDN country code from a Next.js request.
 * Vercel Edge sets x-vercel-ip-country; Cloudflare sets CF-IPCountry.
 * Returns the ISO 3166-1 alpha-2 code (e.g. "IN", "US") or null.
 */
export function getCountryFromRequest(req: NextRequest): string | null {
  return (
    req.headers.get('x-vercel-ip-country') ??
    req.headers.get('cf-ipcountry') ??
    null
  );
}

/**
 * Resolve the payment region for the given user ID.
 * Checks org.country → user.country → CDN header → default global.
 */
export async function resolveRegionForUser(
  userId: string,
  req: NextRequest,
): Promise<PaymentRegion> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      country: true,
      organization: { select: { country: true } },
    },
  });

  return detectPaymentRegion({
    organizationCountry: user?.organization?.country ?? null,
    userCountry: user?.country ?? null,
    ipAddress: getCountryFromRequest(req) ?? undefined,
  });
}

/**
 * Gets the appropriate payment service based on region.
 */
// Returns the regional payment service, or null when that provider's keys are
// not configured — callers should return billingNotConfigured() (503).
export function getPaymentServiceForRegion(region: PaymentRegion) {
  if (region === 'india') {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
    const { RazorpayService } = require('../services/razorpay-service');
    return new RazorpayService(
      process.env.RAZORPAY_KEY_ID,
      process.env.RAZORPAY_KEY_SECRET
    );
  } else {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    const { StripeService } = require('../services/stripe-service');
    return new StripeService(process.env.STRIPE_SECRET_KEY);
  }
}
