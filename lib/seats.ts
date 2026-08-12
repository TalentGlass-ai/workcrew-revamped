// Seat limits per organization plan tier. A "seat" is an org member plus any
// active pending invite (so you can't over-invite past the limit).
//
// ponytail: static tier→limit map keyed off Organization.subscriptionPlan.
// Read Plan.limits (Json) from the org's active Subscription instead if tiers
// ever become dynamically priced/configurable.

export const SEAT_LIMITS: Record<string, number> = {
  free: 2,
  growth: 5,
  pro: 15,
  enterprise: Infinity,
};

export function seatLimit(plan: string | null | undefined): number {
  return SEAT_LIMITS[plan ?? 'free'] ?? SEAT_LIMITS.free;
}

/** True when a new seat can still be added under the plan. */
export function hasSeatAvailable(plan: string | null | undefined, used: number): boolean {
  return used < seatLimit(plan);
}
