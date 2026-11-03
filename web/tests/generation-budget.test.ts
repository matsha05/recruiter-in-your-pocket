import assert from "node:assert/strict";
import {
  configuredDailyGenerationLimit,
  configuredDailyPaidGenerationLimit,
  DAILY_CAP_DEADLINE_MS,
  DAILY_CAPACITY_EXHAUSTED_MESSAGE,
  GenerationBudgetError,
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
    "We've reached today's report limit. It resets tomorrow.",
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

  // Free traffic that exhausts its ceiling must not block a paying customer.
  const shared = new FakeRedis();
  const paidRedis = {
    calls: [] as string[],
    async eval<T>(_script: string, keys: string[], args: Array<string | number>): Promise<T> {
      this.calls.push(keys[0]);
      return (keys[0].includes(":paid:") ? [1, 1] : shared.eval(_script, keys, args)) as T;
    },
  };
  const capEnv = { NODE_ENV: "production", RIYP_MAX_DAILY_GENERATIONS: "1" };
  const day = new Date("2026-10-30T12:00:00Z");
  await reserveDailyGenerationCapacity({ env: capEnv, redis: paidRedis, now: day });
  const freeBlocked = await reserveDailyGenerationCapacity({ env: capEnv, redis: paidRedis, now: day });
  const paidAllowed = await reserveDailyGenerationCapacity({ env: capEnv, redis: paidRedis, now: day, tier: "paid" });
  assert.equal(freeBlocked.allowed, false, "free ceiling still applies to free traffic");
  assert.equal(paidAllowed.allowed, true, "pass holders draw from their own ceiling");
  assert.equal(paidRedis.calls[2], "ops:generation:daily:paid:2026-10-30");
  assert.equal(configuredDailyPaidGenerationLimit({ RIYP_MAX_DAILY_GENERATIONS: "250" }), 250);
  assert.equal(
    configuredDailyPaidGenerationLimit({ RIYP_MAX_DAILY_GENERATIONS: "250", RIYP_MAX_DAILY_PAID_GENERATIONS: "500" }),
    500,
  );
  const pausedPaid = await reserveDailyGenerationCapacity({
    env: { ...capEnv, RIYP_DISABLE_GENERATION: "1" }, redis: paidRedis, tier: "paid",
  });
  assert.equal(pausedPaid.reason, "paused", "the kill switch still stops paid generation");

  // A Redis that never answers is an outage: the cap fails closed within its deadline instead of holding the person.
  const hanging = { async eval<T>(): Promise<T> { return new Promise<T>(() => undefined); } };
  const startedAt = Date.now();
  const hung = await reserveDailyGenerationCapacity({ env: capEnv, redis: hanging, deadlineMs: 20 });
  assert.equal(hung.allowed, false);
  assert.equal(hung.reason, "storage_unavailable");
  assert.ok(Date.now() - startedAt < 1_000, "the deadline, not the hung call, decides when the cap answers");
  assert.ok(DAILY_CAP_DEADLINE_MS <= 10_000, "the cap waits seconds, not the whole function budget");
  const unavailable = new GenerationBudgetError("GENERATION_BUDGET_UNAVAILABLE", "x", "storage_unavailable");
  assert.equal(unavailable.reason, "storage_unavailable", "the refusal names its cause for logs and Sentry");
  assert.equal(unavailable.httpStatus, 503);

  console.log("✅ PASS: generation kill switch and atomic daily spend ceiling fail closed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
