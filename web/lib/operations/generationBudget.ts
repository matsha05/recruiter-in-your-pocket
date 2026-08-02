import "server-only";

import { getRedisClient } from "../redis/client";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const DAILY_CAP_SCRIPT = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
local limit = tonumber(ARGV[1])
if current >= limit then
  return {0, current}
end
local next = redis.call("INCR", KEYS[1])
if next == 1 then
  redis.call("EXPIRE", KEYS[1], tonumber(ARGV[2]))
end
return {1, next}
`;

type BudgetRedis = {
  eval<T = unknown>(script: string, keys: string[], args: Array<string | number>): Promise<T>;
};

export type GenerationBudgetStatus = {
  allowed: boolean;
  used: number;
  limit: number | null;
  reason: "ok" | "disabled" | "unconfigured" | "paused" | "limit_reached" | "storage_unavailable";
};

export const DAILY_CAPACITY_EXHAUSTED_MESSAGE =
  "Today's beta report capacity has been reached. Please try again tomorrow.";

export class GenerationBudgetError extends Error {
  code: "GENERATION_PAUSED" | "GENERATION_BUDGET_EXHAUSTED" | "GENERATION_BUDGET_UNAVAILABLE";
  httpStatus = 503;

  constructor(code: GenerationBudgetError["code"], message: string) {
    super(message);
    this.name = "GenerationBudgetError";
    this.code = code;
  }
}

function isTruthy(value: string | undefined) {
  return TRUE_VALUES.has(String(value || "").trim().toLowerCase());
}

export function configuredDailyGenerationLimit(
  env: Record<string, string | undefined> = process.env
): number | null {
  const parsed = Number(env.RIYP_MAX_DAILY_GENERATIONS);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 100_000) return null;
  return parsed;
}

function isHostedProduction(env: Record<string, string | undefined>) {
  return env.VERCEL_ENV === "production" || env.NODE_ENV === "production";
}

export async function reserveDailyGenerationCapacity(options: {
  env?: Record<string, string | undefined>;
  redis?: BudgetRedis | null;
  now?: Date;
} = {}): Promise<GenerationBudgetStatus> {
  const env = options.env ?? process.env;
  if (isTruthy(env.RIYP_DISABLE_GENERATION)) {
    return { allowed: false, used: 0, limit: configuredDailyGenerationLimit(env), reason: "paused" };
  }

  const limit = configuredDailyGenerationLimit(env);
  if (!limit) {
    return {
      allowed: !isHostedProduction(env),
      used: 0,
      limit: null,
      reason: isHostedProduction(env) ? "unconfigured" : "disabled",
    };
  }

  const redis = options.redis === undefined
    ? (getRedisClient() as unknown as BudgetRedis | null)
    : options.redis;
  if (!redis) {
    return { allowed: false, used: 0, limit, reason: "storage_unavailable" };
  }

  const day = (options.now ?? new Date()).toISOString().slice(0, 10);
  try {
    const result = await redis.eval<[number, number]>(
      DAILY_CAP_SCRIPT,
      [`ops:generation:daily:${day}`],
      [limit, 48 * 60 * 60]
    );
    const allowed = Number(result?.[0]) === 1;
    const used = Math.max(0, Number(result?.[1]) || 0);
    return { allowed, used, limit, reason: allowed ? "ok" : "limit_reached" };
  } catch {
    return { allowed: false, used: 0, limit, reason: "storage_unavailable" };
  }
}

export async function assertGenerationCapacity(): Promise<void> {
  const status = await reserveDailyGenerationCapacity();
  if (status.allowed) return;

  if (status.reason === "paused") {
    throw new GenerationBudgetError(
      "GENERATION_PAUSED",
      "Report generation is temporarily paused. Please try again shortly."
    );
  }
  if (status.reason === "limit_reached") {
    throw new GenerationBudgetError(
      "GENERATION_BUDGET_EXHAUSTED",
      DAILY_CAPACITY_EXHAUSTED_MESSAGE
    );
  }
  throw new GenerationBudgetError(
    "GENERATION_BUDGET_UNAVAILABLE",
    "Report generation is temporarily unavailable. Please try again shortly."
  );
}
