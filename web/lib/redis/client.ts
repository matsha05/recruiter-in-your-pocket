import "server-only";
import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client for rate limiting, idempotency, and short-lived state.
 * 
 * Environment variables required:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 * 
 * These are automatically configured when using Vercel + Upstash integration.
 */

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
    if (redis) return redis;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        if (process.env.NODE_ENV === "production") {
            console.warn("[Redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured");
        }
        return null;
    }

    redis = new Redis({ url, token });
    return redis;
}

/**
 * Check if Redis is available and configured
 */
export function isRedisConfigured(): boolean {
    return Boolean(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
    );
}
