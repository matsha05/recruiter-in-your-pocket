import "server-only";

import { getRedisClient } from "../redis/client";

const HOLD_TTL_SECONDS = 10 * 60;
const COMMITTED_TTL_SECONDS = 40 * 24 * 60 * 60;
const IDENTITY_PATTERN = /^[0-9a-f]{64}$/i;

const RESERVE_SCRIPT = `
local current = redis.call("GET", KEYS[1])
if current then
  return 0
end
redis.call("SET", KEYS[1], "reserved:" .. ARGV[1], "EX", ARGV[2], "NX")
return 1
`;

const COMMIT_SCRIPT = `
local current = redis.call("GET", KEYS[1])
local reserved = "reserved:" .. ARGV[1]
local committed = "committed:" .. ARGV[1]
if current == committed then
  return 1
end
if current ~= reserved then
  return 0
end
redis.call("SET", KEYS[1], committed, "EX", ARGV[2])
return 1
`;

const RELEASE_SCRIPT = `
local current = redis.call("GET", KEYS[1])
local reserved = "reserved:" .. ARGV[1]
if not current then
  return 0
end
if string.sub(current, 1, 10) == "committed:" then
  return 2
end
if current ~= reserved then
  return 3
end
redis.call("DEL", KEYS[1])
return 1
`;

const RECONCILE_COMMITTED_SCRIPT = `
local current = redis.call("GET", KEYS[1])
if not current then
  redis.call("SET", KEYS[1], "committed:" .. ARGV[1], "EX", ARGV[2], "NX")
  return 1
end
if string.sub(current, 1, 10) == "committed:" then
  return 1
end
if string.sub(current, 1, 9) == "reserved:" then
  return 2
end
return 3
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
    monthKey: string;
    reservationId: string;
  }): Promise<boolean>;
  commit(input: {
    identityHash: string;
    monthKey: string;
    reservationId: string;
  }): Promise<boolean>;
  release(input: {
    identityHash: string;
    monthKey: string;
    reservationId: string;
  }): Promise<{
    status: "released" | "committed" | "available" | "conflict";
    action: "released" | "none";
  }>;
  status(input: {
    identityHash: string;
    monthKey: string;
  }): Promise<"available" | "reserved" | "committed">;
  inspect(input: {
    identityHash: string;
    monthKey: string;
  }): Promise<{
    status: "available" | "reserved" | "committed";
    reservationId: string | null;
  }>;
  reconcileCommitted(input: {
    identityHash: string;
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

function ledgerKey(identityHash: string, monthKey: string) {
  if (!IDENTITY_PATTERN.test(identityHash)) {
    throw new AnonymousGenerationAccessError();
  }
  return `generation:anonymous:${monthKey}:${identityHash.toLowerCase()}`;
}

function localEntry(key: string) {
  const entry = localEntries.get(key);
  if (entry && entry.expiresAtMs <= Date.now()) {
    localEntries.delete(key);
    return null;
  }
  return entry || null;
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
 * authoritative anonymous entitlement, keyed by a durable signed identity and
 * month, so an IP change cannot mint another provider call.
 * Hosted environments fail closed if shared state is unavailable.
 */
export const anonymousGenerationAccessBackend: AnonymousGenerationAccessBackend = {
  async reserve({ identityHash, monthKey, reservationId }) {
    const key = ledgerKey(identityHash, monthKey);
    const redis = getRedisClient();

    if (redis) {
      try {
        const result = await redis.eval(
          RESERVE_SCRIPT,
          [key],
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

    if (localEntry(key)) return false;
    localEntries.set(key, {
      value: `reserved:${reservationId}`,
      expiresAtMs: Date.now() + HOLD_TTL_SECONDS * 1000,
    });
    return true;
  },

  async commit({ identityHash, monthKey, reservationId }) {
    const key = ledgerKey(identityHash, monthKey);
    const redis = getRedisClient();

    if (redis) {
      try {
        const result = await redis.eval(
          COMMIT_SCRIPT,
          [key],
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

    const entry = localEntry(key);
    const reserved = `reserved:${reservationId}`;
    const committed = `committed:${reservationId}`;
    if (entry?.value === committed) return true;
    if (entry?.value !== reserved) return false;
    localEntries.set(key, {
      value: committed,
      expiresAtMs: Date.now() + COMMITTED_TTL_SECONDS * 1000,
    });
    return true;
  },

  async release({ identityHash, monthKey, reservationId }) {
    const key = ledgerKey(identityHash, monthKey);
    const redis = getRedisClient();

    if (redis) {
      try {
        const result = await redis.eval(RELEASE_SCRIPT, [key], [reservationId]);
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

    const entry = localEntry(key);
    if (!entry) return { status: "available", action: "none" };
    if (entry.value.startsWith("committed:")) {
      return { status: "committed", action: "none" };
    }
    if (entry.value !== `reserved:${reservationId}`) {
      return { status: "conflict", action: "none" };
    }
    localEntries.delete(key);
    return { status: "released", action: "released" };
  },

  async status({ identityHash, monthKey }) {
    const key = ledgerKey(identityHash, monthKey);
    const redis = getRedisClient();

    if (redis) {
      try {
        const value = await redis.get<string>(key);
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

    return stateFromValue(localEntry(key)?.value).status;
  },

  async inspect({ identityHash, monthKey }) {
    const key = ledgerKey(identityHash, monthKey);
    const redis = getRedisClient();
    if (redis) {
      try {
        return stateFromValue(await redis.get<string>(key));
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
    return stateFromValue(localEntry(key)?.value);
  },

  async reconcileCommitted({ identityHash, monthKey, receiptId }) {
    const key = ledgerKey(identityHash, monthKey);
    const redis = getRedisClient();
    if (redis) {
      try {
        const result = await redis.eval(
          RECONCILE_COMMITTED_SCRIPT,
          [key],
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

    const state = stateFromValue(localEntry(key)?.value);
    if (state.status === "committed") return "committed";
    if (state.status === "reserved") return "reserved";
    localEntries.set(key, {
      value: `committed:${receiptId}`,
      expiresAtMs: Date.now() + COMMITTED_TTL_SECONDS * 1000,
    });
    return "committed";
  },
};
