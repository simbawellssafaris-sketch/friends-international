import "server-only";

// Small in-memory limiter for sign-in attempts (per server process; it resets when the server restarts).
// Supabase also rate-limits sign-ins on its side, so this is a second layer.
const buckets = new Map();

export function tooMany(key, limit = 6, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  return hits.length > limit;
}
