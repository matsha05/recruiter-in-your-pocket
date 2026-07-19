export type RedisRestConfig = {
  url: string;
  token: string;
  source: "upstash" | "vercel-kv";
};

type RedisEnvironment = Record<string, string | undefined>;

/**
 * Resolve the REST credentials used by @upstash/redis.
 *
 * New Upstash integrations expose UPSTASH_REDIS_REST_*, while existing Vercel
 * Marketplace integrations may expose the compatible KV_REST_API_* aliases.
 */
export function getRedisRestConfig(
  env: RedisEnvironment = process.env
): RedisRestConfig | null {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
      source: "upstash",
    };
  }

  if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
    return {
      url: env.KV_REST_API_URL,
      token: env.KV_REST_API_TOKEN,
      source: "vercel-kv",
    };
  }

  return null;
}

export function isRedisRestConfigured(
  env: RedisEnvironment = process.env
): boolean {
  return getRedisRestConfig(env) !== null;
}
