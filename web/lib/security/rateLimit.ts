import "server-only";
import { getRedisClient } from "@/lib/redis/client";

type Bucket = { windowStartMs: number; count: number };

const localBuckets = new Map<string, Bucket>();

export type RateLimitResult =
  | { ok: true; remaining: number; resetMs: number }
  | { ok: false; remaining: 0; resetMs: number };

/**
 * Rate limit using Upstash Redis (if configured) with fallback to in-memory.
 * 
 * Redis-backed rate limiting works across all serverless instances.
 * In-memory fallback is per-instance (less reliable but better than nothing).
 */
export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const redisKey = `ratelimit:${key}`;
      const windowSec = Math.ceil(windowMs / 1000);

      // Atomic increment + set expiry
      const count = await redis.incr(redisKey);

      // Set expiry only on first request of the window
      if (count === 1) {
        await redis.expire(redisKey, windowSec);
      }

      // Get TTL for reset time
      const ttl = await redis.ttl(redisKey);
      const resetMs = ttl > 0 ? ttl * 1000 : windowMs;

      if (count > limit) {
        return { ok: false, remaining: 0, resetMs };
      }

      return { ok: true, remaining: Math.max(0, limit - count), resetMs };
    } catch (err) {
      // Fall through to in-memory on Redis error
      console.warn("[RateLimit] Redis error, falling back to in-memory:", err);
    }
  }

  // In-memory fallback (per-instance, less reliable in serverless)
  return rateLimitSync(key, limit, windowMs, Date.now());
}

/**
 * Synchronous in-memory rate limit (legacy, per-instance only).
 * Use rateLimitAsync for cross-instance limiting.
 */
export function rateLimitSync(
  key: string,
  limit: number,
  windowMs: number,
  nowMs: number = Date.now()
): RateLimitResult {
  const bucket = localBuckets.get(key);
  if (!bucket || nowMs - bucket.windowStartMs >= windowMs) {
    localBuckets.set(key, { windowStartMs: nowMs, count: 1 });
    return { ok: true, remaining: Math.max(0, limit - 1), resetMs: windowMs };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetMs: Math.max(0, windowMs - (nowMs - bucket.windowStartMs)) };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.count),
    resetMs: Math.max(0, windowMs - (nowMs - bucket.windowStartMs))
  };
}

/**
 * Legacy sync API for backwards compatibility.
 * @deprecated Use rateLimitAsync for Redis-backed limiting.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  nowMs: number = Date.now()
): RateLimitResult {
  return rateLimitSync(key, limit, windowMs, nowMs);
}
