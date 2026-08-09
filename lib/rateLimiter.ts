const counts = new Map<string, { count: number; reset: number }>();

// ponytail: in-memory — replace with Upstash/Redis when horizontally scaling
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = counts.get(key);
  if (!entry || entry.reset < now) {
    counts.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
