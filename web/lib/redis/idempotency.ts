import "server-only";
import { getRedisClient } from "@/lib/redis/client";

/**
 * Idempotency key storage using Upstash Redis.
 * 
 * Used to prevent duplicate processing of:
 * - Stripe webhook events
 * - OpenAI requests (dedupe by input hash)
 * - Any operation that should only happen once
 */

const DEFAULT_TTL_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * Check if an idempotency key has been processed.
 * If not, mark it as processed and return false.
 * If already processed, return true.
 * 
 * Uses Redis SET NX (only set if not exists) for atomicity.
 */
export async function checkIdempotencyKey(
    key: string,
    ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<{ alreadyProcessed: boolean }> {
    const redis = getRedisClient();

    if (!redis) {
        // Without Redis, we can't guarantee idempotency across instances
        // Log warning and allow processing (fail-open)
        console.warn("[Idempotency] Redis not configured, skipping idempotency check");
        return { alreadyProcessed: false };
    }

    try {
        const redisKey = `idempotency:${key}`;

        // SET NX = only set if not exists, returns null if key already exists
        const result = await redis.set(redisKey, Date.now().toString(), {
            nx: true,
            ex: ttlSeconds
        });

        return { alreadyProcessed: result === null };
    } catch (err) {
        console.error("[Idempotency] Redis error:", err);
        // Fail-open: allow processing on error
        return { alreadyProcessed: false };
    }
}

/**
 * Get or set a cached value with TTL.
 * Useful for caching expensive computations (e.g., OpenAI responses by input hash).
 */
export async function getOrSetCache<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttlSeconds: number = 60 * 60 // 1 hour default
): Promise<{ value: T; cacheHit: boolean }> {
    const redis = getRedisClient();

    if (!redis) {
        const value = await computeFn();
        return { value, cacheHit: false };
    }

    try {
        const redisKey = `cache:${key}`;

        // Try to get cached value
        const cached = await redis.get<string>(redisKey);
        if (cached) {
            return { value: JSON.parse(cached) as T, cacheHit: true };
        }

        // Compute and cache
        const value = await computeFn();
        await redis.set(redisKey, JSON.stringify(value), { ex: ttlSeconds });

        return { value, cacheHit: false };
    } catch (err) {
        console.error("[Cache] Redis error:", err);
        const value = await computeFn();
        return { value, cacheHit: false };
    }
}
