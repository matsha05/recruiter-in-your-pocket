import "server-only";

import { getRedisClient } from "../redis/client";

const HOLD_TTL_SECONDS = 10 * 60;
const COMMITTED_TTL_SECONDS = 40 * 24 * 60 * 60;
const IDENTITY_PATTERN = /^[0-9a-f]{64}$/i;

const RESERVE_SCRIPT = `
local primary = redis.call("GET", KEYS[1])
local shadow = redis.call("GET", KEYS[2])
if primary or shadow then
  return 0
end
redis.call("SET", KEYS[1], "reserved:" .. ARGV[1], "EX", ARGV[2], "NX")
redis.call("SET", KEYS[2], "reserved:" .. ARGV[1], "EX", ARGV[2], "NX")
return 1
`;

const COMMIT_SCRIPT = `
local primary = redis.call("GET", KEYS[1])
local shadow = redis.call("GET", KEYS[2])
local reserved = "reserved:" .. ARGV[1]
local committed = "committed:" .. ARGV[1]
if (primary == committed or not primary) and (shadow == committed or not shadow)
  and (primary == committed or shadow == committed) then
  redis.call("SET", KEYS[1], committed, "EX", ARGV[2])
  redis.call("SET", KEYS[2], committed, "EX", ARGV[2])
  return 1
end
if (primary ~= reserved and primary) or (shadow ~= reserved and shadow)
  or (not primary and not shadow) then
  return 0
end
redis.call("SET", KEYS[1], committed, "EX", ARGV[2])
redis.call("SET", KEYS[2], committed, "EX", ARGV[2])
return 1
`;

const RELEASE_SCRIPT = `
local primary = redis.call("GET", KEYS[1])
local shadow = redis.call("GET", KEYS[2])
local reserved = "reserved:" .. ARGV[1]
if not primary and not shadow then
  return 0
end
if (primary and string.sub(primary, 1, 10) == "committed:")
  or (shadow and string.sub(shadow, 1, 10) == "committed:") then
  return 2
end
if (primary and primary ~= reserved) or (shadow and shadow ~= reserved) then
  return 3
end
redis.call("DEL", KEYS[1])
redis.call("DEL", KEYS[2])
return 1
`;

const RECONCILE_COMMITTED_SCRIPT = `
local primary = redis.call("GET", KEYS[1])
local shadow = redis.call("GET", KEYS[2])
local committed = "committed:" .. ARGV[1]
if (primary and string.sub(primary, 1, 10) == "committed:")
  or (shadow and string.sub(shadow, 1, 10) == "committed:") then
  if not primary then redis.call("SET", KEYS[1], committed, "EX", ARGV[2], "NX") end
  if not shadow then redis.call("SET", KEYS[2], committed, "EX", ARGV[2], "NX") end
  return 1
end
if (primary and string.sub(primary, 1, 9) == "reserved:")
  or (shadow and string.sub(shadow, 1, 9) == "reserved:") then
  return 2
end
redis.call("SET", KEYS[1], committed, "EX", ARGV[2])
redis.call("SET", KEYS[2], committed, "EX", ARGV[2])
return 1
`;

const INSPECT_SCRIPT = `
local primary = redis.call("GET", KEYS[1])
local shadow = redis.call("GET", KEYS[2])
if primary and string.sub(primary, 1, 10) == "committed:" then return primary end
if shadow and string.sub(shadow, 1, 10) == "committed:" then return shadow end
if primary and string.sub(primary, 1, 9) == "reserved:" then return primary end
if shadow and string.sub(shadow, 1, 9) == "reserved:" then return shadow end
return ""
`;

type LocalEntry = {
  value: string;
  expiresAtMs: number;
};

const localEntries = new Map<string, LocalEntry>();

type AnonymousAccessEnvironment = Record<string, string | undefined>;

export function allowsExplicitLocalAnonymousAccessFallback(
  env: AnonymousAccessEnvironment = process.env
): boolean {
  const explicitTestFallback = ["1", "true"].includes(
    String(env.RIYP_ALLOW_TEST_ANONYMOUS_ACCESS_FALLBACK || "").toLowerCase()
  );
  const mockOnly = ["1", "true"].includes(
    String(env.USE_MOCK_OPENAI || "").toLowerCase()
  );
  const localAppUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(
    String(env.NEXT_PUBLIC_APP_URL || "")
  );

  return explicitTestFallback && mockOnly && localAppUrl;
}

export class AnonymousGenerationAccessError extends Error {
  code = "ANONYMOUS_ACCESS_DEPENDENCY_UNAVAILABLE";

  constructor(message = "Anonymous report access is temporarily unavailable.") {
    super(message);
    this.name = "AnonymousGenerationAccessError";
  }
}

export type AnonymousGenerationAccessBackend = {
  reserve(input: {
    identityHash: string;
    shadowHash: string;
    monthKey: string;
    reservationId: string;
  }): Promise<boolean>;
  commit(input: {
    identityHash: string;
    shadowHash: string;
    monthKey: string;
    reservationId: string;
  }): Promise<boolean>;
  release(input: {
    identityHash: string;
    shadowHash: string;
    monthKey: string;
    reservationId: string;
  }): Promise<{
    status: "released" | "committed" | "available" | "conflict";
    action: "released" | "none";
  }>;
  status(input: {
    identityHash: string;
    shadowHash: string;
    monthKey: string;
  }): Promise<"available" | "reserved" | "committed">;
  inspect(input: {
    identityHash: string;
    shadowHash: string;
    monthKey: string;
  }): Promise<{
    status: "available" | "reserved" | "committed";
    reservationId: string | null;
  }>;
  reconcileCommitted(input: {
    identityHash: string;
    shadowHash: string;
    monthKey: string;
    receiptId: string;
  }): Promise<"reserved" | "committed">;
};

export function resolveAnonymousFreeUsesRemaining(
  status: "available" | "reserved" | "committed",
  cookieUsed: number,
  limit: number
) {
  if (status !== "available") return 0;
  return Math.max(0, limit - Math.max(0, cookieUsed));
}

function stateFromValue(value: unknown) {
  if (typeof value !== "string") {
    return { status: "available" as const, reservationId: null };
  }
  if (value.startsWith("reserved:")) {
    return { status: "reserved" as const, reservationId: value.slice(9) || null };
  }
  if (value.startsWith("committed:")) {
    return { status: "committed" as const, reservationId: value.slice(10) || null };
  }
  return { status: "available" as const, reservationId: null };
}

function ledgerKeys(identityHash: string, shadowHash: string, monthKey: string) {
  if (!IDENTITY_PATTERN.test(identityHash) || !IDENTITY_PATTERN.test(shadowHash)) {
    throw new AnonymousGenerationAccessError();
  }
  return [
    `generation:anonymous:${monthKey}:${identityHash.toLowerCase()}`,
    `generation:anonymous:${monthKey}:network:${shadowHash.toLowerCase()}`,
  ];
}

function localEntry(key: string) {
  const entry = localEntries.get(key);
  if (entry && entry.expiresAtMs <= Date.now()) {
    localEntries.delete(key);
    return null;
  }
  return entry || null;
}

function localState(keys: string[]) {
  const primary = localEntry(keys[0])?.value;
  const shadow = localEntry(keys[1])?.value;
  const value = [primary, shadow].find((item) => item?.startsWith("committed:"))
    || [primary, shadow].find((item) => item?.startsWith("reserved:"));
  return stateFromValue(value);
}

function unavailable(cause?: unknown): never {
  const error = new AnonymousGenerationAccessError();
  if (cause !== undefined) {
    (error as Error & { cause?: unknown }).cause = cause;
  }
  throw error;
}

/**
 * The signed cookie remains a user-facing hint. This ledger is the
 * authoritative anonymous entitlement. A durable signed identity is primary;
 * a separately salted network hash closes simple both-cookie resets. Raw
 * network addresses are never stored, and shared networks can affect access.
 * Hosted environments fail closed if shared state is unavailable.
 */
export const anonymousGenerationAccessBackend: AnonymousGenerationAccessBackend = {
  async reserve({ identityHash, shadowHash, monthKey, reservationId }) {
    const keys = ledgerKeys(identityHash, shadowHash, monthKey);
    const redis = getRedisClient();

    if (redis) {
      try {
        const result = await redis.eval(
          RESERVE_SCRIPT,
          keys,
          [reservationId, String(HOLD_TTL_SECONDS)]
        );
        return Number(result) === 1;
      } catch (error) {
        if (
          process.env.NODE_ENV === "production"
          && !allowsExplicitLocalAnonymousAccessFallback()
        ) unavailable(error);
      }
    } else if (
      process.env.NODE_ENV === "production"
      && !allowsExplicitLocalAnonymousAccessFallback()
    ) {
      unavailable();
    }

    if (localState(keys).status !== "available") return false;
    for (const key of keys) {
      localEntries.set(key, {
        value: `reserved:${reservationId}`,
        expiresAtMs: Date.now() + HOLD_TTL_SECONDS * 1000,
      });
    }
    return true;
  },

  async commit({ identityHash, shadowHash, monthKey, reservationId }) {
    const keys = ledgerKeys(identityHash, shadowHash, monthKey);
    const redis = getRedisClient();

    if (redis) {
      try {
        const result = await redis.eval(
          COMMIT_SCRIPT,
          keys,
          [reservationId, String(COMMITTED_TTL_SECONDS)]
        );
        return Number(result) === 1;
      } catch (error) {
        if (
          process.env.NODE_ENV === "production"
          && !allowsExplicitLocalAnonymousAccessFallback()
        ) unavailable(error);
      }
    } else if (
      process.env.NODE_ENV === "production"
      && !allowsExplicitLocalAnonymousAccessFallback()
    ) {
      unavailable();
    }

    const entries = keys.map((key) => localEntry(key));
    const reserved = `reserved:${reservationId}`;
    const committed = `committed:${reservationId}`;
    const values = entries.map((entry) => entry?.value);
    if (values.some((value) => value === committed)) {
      if (values.some((value) => value && value !== committed)) return false;
    } else if (
      values.every((value) => !value)
      || values.some((value) => value && value !== reserved)
    ) return false;
    for (const key of keys) {
      localEntries.set(key, {
        value: committed,
        expiresAtMs: Date.now() + COMMITTED_TTL_SECONDS * 1000,
      });
    }
    return true;
  },

  async release({ identityHash, shadowHash, monthKey, reservationId }) {
    const keys = ledgerKeys(identityHash, shadowHash, monthKey);
    const redis = getRedisClient();

    if (redis) {
      try {
        const result = await redis.eval(RELEASE_SCRIPT, keys, [reservationId]);
        if (Number(result) === 1) return { status: "released", action: "released" };
        if (Number(result) === 2) return { status: "committed", action: "none" };
        if (Number(result) === 0) return { status: "available", action: "none" };
        return { status: "conflict", action: "none" };
      } catch (error) {
        if (
          process.env.NODE_ENV === "production"
          && !allowsExplicitLocalAnonymousAccessFallback()
        ) unavailable(error);
      }
    } else if (
      process.env.NODE_ENV === "production"
      && !allowsExplicitLocalAnonymousAccessFallback()
    ) {
      unavailable();
    }

    const entries = keys.map((key) => localEntry(key));
    if (entries.every((entry) => !entry)) return { status: "available", action: "none" };
    if (entries.some((entry) => entry?.value.startsWith("committed:"))) {
      return { status: "committed", action: "none" };
    }
    if (entries.some((entry) => entry && entry.value !== `reserved:${reservationId}`)) {
      return { status: "conflict", action: "none" };
    }
    for (const key of keys) localEntries.delete(key);
    return { status: "released", action: "released" };
  },

  async status({ identityHash, shadowHash, monthKey }) {
    const keys = ledgerKeys(identityHash, shadowHash, monthKey);
    const redis = getRedisClient();

    if (redis) {
      try {
        const value = await redis.eval(INSPECT_SCRIPT, keys, []);
        return stateFromValue(value).status;
      } catch (error) {
        if (
          process.env.NODE_ENV === "production"
          && !allowsExplicitLocalAnonymousAccessFallback()
        ) unavailable(error);
      }
    } else if (
      process.env.NODE_ENV === "production"
      && !allowsExplicitLocalAnonymousAccessFallback()
    ) {
      unavailable();
    }

    return localState(keys).status;
  },

  async inspect({ identityHash, shadowHash, monthKey }) {
    const keys = ledgerKeys(identityHash, shadowHash, monthKey);
    const redis = getRedisClient();
    if (redis) {
      try {
        return stateFromValue(await redis.eval(INSPECT_SCRIPT, keys, []));
      } catch (error) {
        if (
          process.env.NODE_ENV === "production"
          && !allowsExplicitLocalAnonymousAccessFallback()
        ) unavailable(error);
      }
    } else if (
      process.env.NODE_ENV === "production"
      && !allowsExplicitLocalAnonymousAccessFallback()
    ) {
      unavailable();
    }
    return localState(keys);
  },

  async reconcileCommitted({ identityHash, shadowHash, monthKey, receiptId }) {
    const keys = ledgerKeys(identityHash, shadowHash, monthKey);
    const redis = getRedisClient();
    if (redis) {
      try {
        const result = await redis.eval(
          RECONCILE_COMMITTED_SCRIPT,
          keys,
          [receiptId, String(COMMITTED_TTL_SECONDS)]
        );
        if (Number(result) === 1) return "committed";
        if (Number(result) === 2) return "reserved";
        unavailable();
      } catch (error) {
        if (
          process.env.NODE_ENV === "production"
          && !allowsExplicitLocalAnonymousAccessFallback()
        ) unavailable(error);
      }
    } else if (
      process.env.NODE_ENV === "production"
      && !allowsExplicitLocalAnonymousAccessFallback()
    ) {
      unavailable();
    }

    const entries = keys.map((key) => localEntry(key));
    if (entries.some((entry) => entry?.value.startsWith("committed:"))) {
      for (const [index, key] of keys.entries()) {
        if (!entries[index]) {
          localEntries.set(key, {
            value: `committed:${receiptId}`,
            expiresAtMs: Date.now() + COMMITTED_TTL_SECONDS * 1000,
          });
        }
      }
      return "committed";
    }
    const state = localState(keys);
    if (state.status === "reserved") return "reserved";
    for (const key of keys) {
      localEntries.set(key, {
        value: `committed:${receiptId}`,
        expiresAtMs: Date.now() + COMMITTED_TTL_SECONDS * 1000,
      });
    }
    return "committed";
  },
};
