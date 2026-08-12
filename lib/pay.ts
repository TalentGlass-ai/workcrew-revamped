// Region-aware compensation formatting. Jobs carry their own `currency`
// (recruiter-set at posting); hiring is global, so nothing is assumed to be USD.

// Currencies offered in the job form. Extend freely — the formatter handles any
// valid ISO 4217 code via Intl.
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SGD', 'AED', 'JPY', 'BRL'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY = 'USD';

// Best-effort default currency from a free-text hiring location. Recruiter can
// always override. Ordered: first keyword hit wins. Falls back to USD (also for
// "Remote" and anything unrecognised).
const LOCATION_CURRENCY: { currency: Currency; keywords: string[] }[] = [
  { currency: 'INR', keywords: ['india', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata', 'gurgaon', 'gurugram', 'noida', 'ahmedabad'] },
  { currency: 'GBP', keywords: ['united kingdom', 'uk', 'england', 'london', 'manchester', 'scotland', 'wales', 'edinburgh', 'bristol'] },
  { currency: 'AED', keywords: ['uae', 'united arab emirates', 'dubai', 'abu dhabi'] },
  { currency: 'SGD', keywords: ['singapore'] },
  { currency: 'JPY', keywords: ['japan', 'tokyo', 'osaka'] },
  { currency: 'BRL', keywords: ['brazil', 'brasil', 'sao paulo', 'são paulo', 'rio de janeiro'] },
  { currency: 'CAD', keywords: ['canada', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary'] },
  { currency: 'AUD', keywords: ['australia', 'sydney', 'melbourne', 'brisbane', 'perth'] },
  { currency: 'EUR', keywords: ['germany', 'france', 'spain', 'italy', 'netherlands', 'ireland', 'portugal', 'belgium', 'austria', 'greece', 'finland', 'berlin', 'paris', 'madrid', 'barcelona', 'amsterdam', 'munich', 'dublin', 'lisbon', 'europe', 'eurozone'] },
  { currency: 'USD', keywords: ['united states', 'usa', 'u.s.', 'new york', 'san francisco', 'seattle', 'austin', 'boston', 'chicago', 'los angeles'] },
];

export function currencyForLocation(location?: string | null): Currency {
  if (!location) return DEFAULT_CURRENCY;
  const s = location.toLowerCase();
  for (const { currency, keywords } of LOCATION_CURRENCY) {
    if (keywords.some((k) => s.includes(k))) return currency;
  }
  return DEFAULT_CURRENCY;
}

/** Format a single amount compactly in its currency, e.g. $120K, ₹15L, €90K. */
export function formatAmount(amount: number, currency?: string | null): string {
  const cur = currency || DEFAULT_CURRENCY;
  // Locale drives the compact style — en-IN renders lakh/crore for INR.
  const locale = cur === 'INR' ? 'en-IN' : 'en';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cur,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    // Unknown/invalid currency code — fall back to a plain compact number + code
    return `${new Intl.NumberFormat('en', { notation: 'compact' }).format(amount)} ${cur}`;
  }
}

/** Format a min–max compensation range for a job. */
export function formatPay(
  min?: number | null,
  max?: number | null,
  currency?: string | null,
): string {
  if (!min && !max) return 'Not disclosed';
  if (min && max) return `${formatAmount(min, currency)}–${formatAmount(max, currency)}`;
  return min ? `From ${formatAmount(min, currency)}` : `Up to ${formatAmount(max!, currency)}`;
}
