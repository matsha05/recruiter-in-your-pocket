import "server-only";
import { getRedisClient } from "@/lib/redis/client";

type Bucket = { windowStartMs: number; count: number };

const localBuckets = new Map<string, Bucket>();

function allowsExplicitLocalFallback(): boolean {
  const explicitTestFallback = ["1", "true"].includes(
    String(process.env.RIYP_ALLOW_TEST_RATE_LIMIT_FALLBACK || "").toLowerCase()
  );
  const mockOnly = ["1", "true"].includes(
    String(process.env.USE_MOCK_OPENAI || "").toLowerCase()
  );
  const localAppUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(
    String(process.env.NEXT_PUBLIC_APP_URL || "")
  );

  return explicitTestFallback && mockOnly && localAppUrl;
}

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
      const nowMs = Date.now();
      const windowBucket = Math.floor(nowMs / windowMs);
      const redisKey = `ratelimit:${key}:${windowBucket}`;
      const resetMs = windowMs - (nowMs % windowMs);

      // MULTI keeps the counter and expiry together. The bucketed key makes the
      // window reset deterministic even if a previous key survives too long.
      const [count] = await redis
        .multi()
        .incr(redisKey)
        .pexpire(redisKey, windowMs * 2)
        .exec();

      if (count > limit) {
        return { ok: false, remaining: 0, resetMs };
      }

      return { ok: true, remaining: Math.max(0, limit - count), resetMs };
    } catch (err) {
      console.warn("[RateLimit] Redis error:", err);
      if (process.env.NODE_ENV === "production" && !allowsExplicitLocalFallback()) {
        return { ok: false, remaining: 0, resetMs: windowMs };
      }
    }
  }

  if (process.env.NODE_ENV === "production" && !allowsExplicitLocalFallback()) {
    return { ok: false, remaining: 0, resetMs: windowMs };
  }

  // Local development remains usable without external infrastructure.
  return rateLimitSync(key, limit, windowMs, Date.now());
}

/**
 * Synchronous in-memory rate limit (legacy, per-instance only).
 * Use rateLimitAsync for cross-instance limiting.
 */
function rateLimitSync(
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
function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  nowMs: number = Date.now()
): RateLimitResult {
  return rateLimitSync(key, limit, windowMs, nowMs);
}
