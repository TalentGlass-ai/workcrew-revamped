// lib/utils/region.ts

/**
 * Detects the payment region based on IP address and profile settings
 */

export type PaymentRegion = 'global' | 'india';

interface RegionDetectionOptions {
  ipAddress?: string;
  organizationRegion?: string;
  userRegion?: string;
}

/**
 * Detects the appropriate payment region
 * Priority: profile-based > IP-based
 */
export function detectPaymentRegion(options: RegionDetectionOptions): PaymentRegion {
  const { ipAddress, organizationRegion, userRegion } = options;

  // Profile-based detection (highest priority)
  if (organizationRegion) {
    return organizationRegion.toLowerCase() === 'india' ? 'india' : 'global';
  }

  if (userRegion) {
    return userRegion.toLowerCase() === 'india' ? 'india' : 'global';
  }

  // IP-based detection
  if (ipAddress) {
    return isIndianIP(ipAddress) ? 'india' : 'global';
  }

  // Default to global
  return 'global';
}

/**
 * Simple IP-based India detection
 * In production, use a proper geolocation service
 */
function isIndianIP(ipAddress: string): boolean {
  // This is a simplified implementation
  // In production, use a service like MaxMind GeoIP or similar

  // For demo purposes, check if IP starts with common Indian ranges
  // This is not accurate, just for illustration
  const indianRanges = [
    '103.', // Some Indian IPs
    '106.',
    '110.',
    '112.',
    '113.',
    '114.',
    '115.',
    '116.',
    '117.',
    '118.',
    '119.',
    '120.',
    '121.',
    '122.',
    '123.',
    '124.',
    '125.',
    '126.',
    '127.',
    // Add more ranges as needed
  ];

  return indianRanges.some(range => ipAddress.startsWith(range));
}

/**
 * Gets the appropriate payment service based on region
 */
export function getPaymentServiceForRegion(region: PaymentRegion) {
  if (region === 'india') {
    const { RazorpayService } = require('../services/razorpay-service');
    return new RazorpayService(
      process.env.RAZORPAY_KEY_ID!,
      process.env.RAZORPAY_KEY_SECRET!
    );
  } else {
    const { StripeService } = require('../services/stripe-service');
    return new StripeService(process.env.STRIPE_SECRET_KEY!);
  }
}