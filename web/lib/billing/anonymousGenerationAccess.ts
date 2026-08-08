import "server-only";

import { getRedisClient } from "../redis/client";
import {
  COMPLETE_WITH_RECOVERY_SCRIPT,
  anonymousRecoveryStorageKey,
  completeLocalAnonymousAccessWithRecovery,
  deleteLocalAnonymousEntry,
  readLocalAnonymousEntry,
  validateAnonymousRecoveryCommit,
  writeLocalAnonymousEntry,
  type AnonymousReportRecoveryCommit,
} from "../reports/anonymous-report-recovery";
import { allowsExplicitLocalAnonymousAccessFallback } from "./anonymousAccessFallback";
export { allowsExplicitLocalAnonymousAccessFallback } from "./anonymousAccessFallback";

const HOLD_TTL_SECONDS = 10 * 60;
const COMMITTED_TTL_SECONDS = 40 * 24 * 60 * 60;
const IDENTITY_PATTERN = /^[0-9a-f]{64}$/i;

const RESERVE_SCRIPT = `
local primary = redis.call("GET", KEYS[1])
local shadow = redis.call("GET", KEYS[2])
if primary and string.sub(primary, 1, 10) == "committed:" and not shadow then
  local ttl = redis.call("PTTL", KEYS[1])
  if ttl < 0 then ttl = ARGV[3] end
  if ttl == 0 then ttl = 1 end
  redis.call("SET", KEYS[2], primary, "PX", ttl, "NX")
  return 0
end
if shadow and string.sub(shadow, 1, 10) == "committed:" and not primary then
  local ttl = redis.call("PTTL", KEYS[2])
  if ttl < 0 then ttl = ARGV[3] end
  if ttl == 0 then ttl = 1 end
  redis.call("SET", KEYS[1], shadow, "PX", ttl, "NX")
  return 0
end
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
  completeWithRecovery(input: {
    identityHash: string;
    shadowHash: string;
    monthKey: string;
    reservationId: string;
    recovery: AnonymousReportRecoveryCommit;
  }): Promise<"created" | "idempotent" | "conflict">;
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

function localState(keys: string[]) {
  const primary = readLocalAnonymousEntry(keys[0])?.value;
  const shadow = readLocalAnonymousEntry(keys[1])?.value;
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
          [
            reservationId,
            String(HOLD_TTL_SECONDS),
            String(COMMITTED_TTL_SECONDS * 1000),
          ]
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

    const entries = keys.map((key) => readLocalAnonymousEntry(key));
    const primary = entries[0];
    const shadow = entries[1];
    if (primary?.value.startsWith("committed:") && !shadow) {
      writeLocalAnonymousEntry(
        keys[1], primary.value, Math.max(1, Math.ceil((primary.expiresAtMs - Date.now()) / 1000))
      );
      return false;
    }
    if (shadow?.value.startsWith("committed:") && !primary) {
      writeLocalAnonymousEntry(
        keys[0], shadow.value, Math.max(1, Math.ceil((shadow.expiresAtMs - Date.now()) / 1000))
      );
      return false;
    }
    if (entries.some(Boolean)) return false;
    for (const key of keys) {
      writeLocalAnonymousEntry(key, `reserved:${reservationId}`, HOLD_TTL_SECONDS);
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

    const entries = keys.map((key) => readLocalAnonymousEntry(key));
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
      writeLocalAnonymousEntry(key, committed, COMMITTED_TTL_SECONDS);
    }
    return true;
  },

  async completeWithRecovery({
    identityHash, shadowHash, monthKey, reservationId, recovery,
  }) {
    const keys = ledgerKeys(identityHash, shadowHash, monthKey);
    validateAnonymousRecoveryCommit(recovery, {
      recovery_id: recovery.recoveryId,
      reservation_id: reservationId,
      identity_hash: identityHash,
      shadow_hash: shadowHash,
      month_key: monthKey,
    });
    const redis = getRedisClient();
    if (redis) {
      try {
        const result = Number(await redis.eval(
          COMPLETE_WITH_RECOVERY_SCRIPT,
          [...keys, anonymousRecoveryStorageKey(recovery.recoveryId)],
          [
            reservationId,
            String(COMMITTED_TTL_SECONDS),
            String(recovery.ttlSeconds),
            recovery.serializedEnvelope,
          ]
        ));
        return result === 1 ? "created" : result === 2 ? "idempotent" : "conflict";
      } catch (error) {
        if (!allowsExplicitLocalAnonymousAccessFallback()) unavailable(error);
      }
    } else if (!allowsExplicitLocalAnonymousAccessFallback()) unavailable();
    return completeLocalAnonymousAccessWithRecovery({ accessKeys: keys, reservationId, recovery });
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

    const entries = keys.map((key) => readLocalAnonymousEntry(key));
    if (entries.every((entry) => !entry)) return { status: "available", action: "none" };
    if (entries.some((entry) => entry?.value.startsWith("committed:"))) {
      return { status: "committed", action: "none" };
    }
    if (entries.some((entry) => entry && entry.value !== `reserved:${reservationId}`)) {
      return { status: "conflict", action: "none" };
    }
    for (const key of keys) deleteLocalAnonymousEntry(key);
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

    const entries = keys.map((key) => readLocalAnonymousEntry(key));
    if (entries.some((entry) => entry?.value.startsWith("committed:"))) {
      for (const [index, key] of keys.entries()) {
        if (!entries[index]) {
          writeLocalAnonymousEntry(key, `committed:${receiptId}`, COMMITTED_TTL_SECONDS);
        }
      }
      return "committed";
    }
    const state = localState(keys);
    if (state.status === "reserved") return "reserved";
    for (const key of keys) {
      writeLocalAnonymousEntry(key, `committed:${receiptId}`, COMMITTED_TTL_SECONDS);
    }
    return "committed";
  },
};
