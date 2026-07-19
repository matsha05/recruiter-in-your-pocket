import "server-only";
import { Redis } from "@upstash/redis";
import { getRedisRestConfig } from "./config";

/**
 * Upstash Redis client for rate limiting, idempotency, and short-lived state.
 * 
 * Supported environment pairs:
 * - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * - KV_REST_API_URL + KV_REST_API_TOKEN (legacy Vercel Marketplace alias)
 */

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
    if (redis) return redis;

    const config = getRedisRestConfig();

    if (!config) {
        if (process.env.NODE_ENV === "production") {
            console.warn("[Redis] No compatible REST credential pair is configured");
        }
        return null;
    }

    redis = new Redis({ url: config.url, token: config.token });
    return redis;
}
