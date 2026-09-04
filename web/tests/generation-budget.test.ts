import assert from "node:assert/strict";
import {
  configuredDailyGenerationLimit,
  DAILY_CAPACITY_EXHAUSTED_MESSAGE,
  reserveDailyGenerationCapacity,
} from "../lib/operations/generationBudget";

class FakeRedis {
  count = 0;
  calls: Array<{ keys: string[]; args: Array<string | number> }> = [];

  async eval<T>(_script: string, keys: string[], args: Array<string | number>): Promise<T> {
    this.calls.push({ keys, args });
    const limit = Number(args[0]);
    if (this.count >= limit) return [0, this.count] as T;
    this.count += 1;
    return [1, this.count] as T;
  }
}

async function run() {
  assert.equal(configuredDailyGenerationLimit({ RIYP_MAX_DAILY_GENERATIONS: "250" }), 250);
  assert.equal(configuredDailyGenerationLimit({ RIYP_MAX_DAILY_GENERATIONS: "0" }), null);
  assert.equal(configuredDailyGenerationLimit({ RIYP_MAX_DAILY_GENERATIONS: "not-a-number" }), null);
  assert.equal(
    DAILY_CAPACITY_EXHAUSTED_MESSAGE,
    "Today's report capacity has been reached. Please try again tomorrow.",
  );

  const local = await reserveDailyGenerationCapacity({ env: { NODE_ENV: "development" }, redis: null });
  assert.equal(local.allowed, true, "unconfigured local development stays usable");
  assert.equal(local.reason, "disabled");

  const production = await reserveDailyGenerationCapacity({ env: { NODE_ENV: "production" }, redis: null });
  assert.equal(production.allowed, false, "unconfigured production fails closed");
  assert.equal(production.reason, "unconfigured");

  const paused = await reserveDailyGenerationCapacity({
    env: { NODE_ENV: "production", RIYP_DISABLE_GENERATION: "true", RIYP_MAX_DAILY_GENERATIONS: "2" },
    redis: new FakeRedis(),
  });
  assert.equal(paused.allowed, false);
  assert.equal(paused.reason, "paused");

  const redis = new FakeRedis();
  const env = { NODE_ENV: "production", RIYP_MAX_DAILY_GENERATIONS: "2" };
  const first = await reserveDailyGenerationCapacity({ env, redis, now: new Date("2026-07-21T12:00:00Z") });
  const second = await reserveDailyGenerationCapacity({ env, redis, now: new Date("2026-07-21T23:59:00Z") });
  const blocked = await reserveDailyGenerationCapacity({ env, redis, now: new Date("2026-07-21T23:59:59Z") });
  assert.deepEqual([first.allowed, second.allowed, blocked.allowed], [true, true, false]);
  assert.equal(blocked.reason, "limit_reached");
  assert.equal(redis.calls[0].keys[0], "ops:generation:daily:2026-07-21");
  assert.equal(redis.calls[0].args[1], 48 * 60 * 60, "daily key self-expires");

  console.log("✅ PASS: generation kill switch and atomic daily spend ceiling fail closed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
