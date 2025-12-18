import "server-only";

type Bucket = { windowStartMs: number; count: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult =
  | { ok: true; remaining: number; resetMs: number }
  | { ok: false; remaining: 0; resetMs: number };

export function rateLimit(key: string, limit: number, windowMs: number, nowMs: number = Date.now()): RateLimitResult {
  const bucket = buckets.get(key);
  if (!bucket || nowMs - bucket.windowStartMs >= windowMs) {
    buckets.set(key, { windowStartMs: nowMs, count: 1 });
    return { ok: true, remaining: Math.max(0, limit - 1), resetMs: windowMs };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetMs: Math.max(0, windowMs - (nowMs - bucket.windowStartMs)) };
  }

  bucket.count += 1;
  return { ok: true, remaining: Math.max(0, limit - bucket.count), resetMs: Math.max(0, windowMs - (nowMs - bucket.windowStartMs)) };
}

