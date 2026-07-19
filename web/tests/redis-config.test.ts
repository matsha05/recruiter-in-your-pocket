import assert from "node:assert/strict";
import { getRedisRestConfig, isRedisRestConfigured } from "../lib/redis/config";

assert.deepEqual(
  getRedisRestConfig({
    UPSTASH_REDIS_REST_URL: "https://upstash.example",
    UPSTASH_REDIS_REST_TOKEN: "upstash-token",
    KV_REST_API_URL: "https://kv.example",
    KV_REST_API_TOKEN: "kv-token",
  }),
  {
    url: "https://upstash.example",
    token: "upstash-token",
    source: "upstash",
  },
  "the canonical Upstash pair should take precedence"
);

assert.deepEqual(
  getRedisRestConfig({
    KV_REST_API_URL: "https://kv.example",
    KV_REST_API_TOKEN: "kv-token",
  }),
  {
    url: "https://kv.example",
    token: "kv-token",
    source: "vercel-kv",
  },
  "the compatible Vercel KV pair should be accepted"
);

assert.equal(
  getRedisRestConfig({ KV_REST_API_URL: "https://kv.example" }),
  null,
  "partial credentials must never enable Redis"
);
assert.equal(isRedisRestConfigured({}), false);

console.log("redis-config tests passed");
