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
import {
  ANONYMOUS_COMMITTED_TTL_SECONDS,
  ANONYMOUS_HOLD_TTL_SECONDS,
} from "./anonymousLedgerTimings";
import { allowsExplicitLocalAnonymousAccessFallback } from "./anonymousAccessFallback";
export { allowsExplicitLocalAnonymousAccessFallback } from "./anonymousAccessFallback";

/**
 * # The anonymous free-report ledger
 *
 * One free report per calendar month for a visitor who is not signed in. The
 * ledger is the authority; the signed `rip_free_meta` cookie is a hint the
 * browser carries, and the Postgres reservation table only covers accounts.
 *
 * ## Keys
 *
 * Two Redis keys per visit, both scoped to the month:
 *
 * - identity key `generation:anonymous:{month}:{identityHash}`: a hash of the
 *   signed, durable `rip_anon_id` cookie. This is the visitor.
 * - network key `generation:anonymous:{month}:network:{shadowHash}`: a salted
 *   hash of the request's network address. It exists for one reason: a visitor
 *   who clears both cookies gets a fresh identity, and without this key could
 *   mint a report every time. It is not a judgment about the network.
 *
 * Each key holds one of `reserved:{reservationId}` or `committed:{reservationId}`
 * or nothing.
 *
 * ## States and transitions (per key pair)
 *
 *     available ──reserve──▶ reserved ──commit / completeWithRecovery──▶ committed
 *         ▲                     │                                            │
 *         └──release / hold TTL─┘                     committed TTL (month over)
 *
 * - available: neither key holds anything. A reservation may be taken.
 * - reserved: both keys hold `reserved:{id}` for ANONYMOUS_HOLD_TTL_SECONDS.
 *   A generation is in flight. Nothing else may reserve.
 * - committed: both keys hold `committed:{id}` for ANONYMOUS_COMMITTED_TTL_SECONDS.
 *   A report was minted. The month is spent for this identity and this network.
 *
 * Reserve is refused, without writing anything, when:
 * - the identity key is committed ("identity": this visitor already used it),
 * - the network key is committed ("network": a report was minted on this
 *   network this month by someone, possibly this visitor after clearing cookies),
 * - either key is reserved ("hold": a generation is still in flight).
 *
 * ## Invariants
 *
 * 1. A key is written only by a reservation made with that key, by that
 *    reservation's commit, or by that reservation's release. A refusal never
 *    writes, so the identity key alone can never mark a network, and a network
 *    can never mark a fresh identity. A visitor who used their report at home
 *    and then opens the app at a cafe is refused there, but leaves the cafe's
 *    network untouched for everyone else.
 * 2. Both keys move together inside one Lua script. There is no state where
 *    one key is reserved and the other committed by the same reservation.
 * 3. Reads never write. `status` and `inspect` are pure; `GET /api/free-status`
 *    only reads the ledger and may refresh the browser's cookie from the
 *    identity key, never from the network key.
 * 4. The signed cookie refuses a reservation on its own when it says the
 *    report was used, but it never seeds the ledger. Only a minted report
 *    (commit or completeWithRecovery) writes `committed:`.
 *
 * ## The recovery envelope (per recovery id)
 *
 * A completed anonymous report is stored for the browser that generated it
 * under `generation:anonymous:recovery:{recoveryId}`, written in the same Lua
 * script that commits the reservation (`completeWithRecovery`), so a report
 * is never minted without its envelope and never stored without its commit.
 *
 *     none ──(reservation held)──▶ pending ──completeWithRecovery──▶ stored
 *                                                                       │
 *                     claim into an account ◀───────────────────────────┤
 *                            │                                          │
 *                            ▼                                          ▼
 *                        tombstoned ───────── envelope TTL ────────▶ expired
 *
 * - pending: the identity key is reserved and no envelope exists yet.
 * - stored (restored to the browser on request): the envelope exists and both
 *   ledger keys from the envelope hold `committed:{its reservation}`.
 * - tombstoned: the envelope has been replaced by a signed tombstone naming the
 *   account that saved it. The report is no longer served to the browser.
 * - expired: the identity key is committed but nothing is stored under the
 *   recovery id. It will not reappear.
 * - never: the recovery id is bound to another identity, or the request has no
 *   identity. Terminal for this browser.
 *
 * The claim order and its recovery are documented in
 * `app/api/reports/recovery/route.ts`. All lifetimes live in
 * `anonymousLedgerTimings.ts`.
 */

const HOLD_TTL_SECONDS = ANONYMOUS_HOLD_TTL_SECONDS;
const COMMITTED_TTL_SECONDS = ANONYMOUS_COMMITTED_TTL_SECONDS;
const IDENTITY_PATTERN = /^[0-9a-f]{64}$/i;

// Returns 1 when reserved. Every other value is a refusal, and names its cause
// for monitoring only: 2 = this anonymous id already used its report,
// 3 = a report was minted on this network, 4 = a generation is still in flight.
// A refusal writes nothing (invariant 1).
const RESERVE_SCRIPT = `
local primary = redis.call("GET", KEYS[1])
local shadow = redis.call("GET", KEYS[2])
if primary and string.sub(primary, 1, 10) == "committed:" then return 2 end
if shadow and string.sub(shadow, 1, 10) == "committed:" then return 3 end
if primary or shadow then return 4 end
redis.call("SET", KEYS[1], "reserved:" .. ARGV[1], "EX", ARGV[2])
redis.call("SET", KEYS[2], "reserved:" .. ARGV[1], "EX", ARGV[2])
return 1
`;

const RESERVE_REFUSAL_REASONS: Record<number, AnonymousReserveRefusal> = {
  2: "identity",
  3: "network",
  4: "hold",
};

// Only the holder's own reservation can commit. A key the holder's reservation
// wrote that has since expired is rewritten, because the report was minted on
// exactly this identity and this network.
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

// Pure read of both keys (invariant 3).
const INSPECT_SCRIPT = `
return { redis.call("GET", KEYS[1]) or "", redis.call("GET", KEYS[2]) or "" }
`;

export class AnonymousGenerationAccessError extends Error {
  code = "ANONYMOUS_ACCESS_DEPENDENCY_UNAVAILABLE";

  constructor(message = "Anonymous report access is temporarily unavailable.") {
    super(message);
    this.name = "AnonymousGenerationAccessError";
  }
}

export type AnonymousReserveRefusal = "identity" | "network" | "hold" | "unknown";

export type AnonymousReserveResult =
  | { reserved: true }
  | { reserved: false; refusal: AnonymousReserveRefusal };

export type AnonymousLedgerKeyStatus = "available" | "reserved" | "committed";

export type AnonymousLedgerInspection = {
  /** The pair's state: committed if either key is, else reserved if either is. */
  status: AnonymousLedgerKeyStatus;
  reservationId: string | null;
  /** The visitor's own key. Only this key may refresh the browser's cookie. */
  identity: AnonymousLedgerKeyStatus;
  /** The network key. Committed means a report was minted on this network. */
  network: AnonymousLedgerKeyStatus;
};

export type AnonymousGenerationAccessBackend = {
  reserve(input: {
    identityHash: string;
    shadowHash: string;
    monthKey: string;
    reservationId: string;
  }): Promise<boolean>;
  /** Same decision and writes as reserve, plus the cause of a refusal. */
  reserveWithReason(input: {
    identityHash: string;
    shadowHash: string;
    monthKey: string;
    reservationId: string;
  }): Promise<AnonymousReserveResult>;
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
  }): Promise<AnonymousLedgerKeyStatus>;
  inspect(input: {
    identityHash: string;
    shadowHash: string;
    monthKey: string;
  }): Promise<AnonymousLedgerInspection>;
};

export function resolveAnonymousFreeUsesRemaining(
  status: AnonymousLedgerKeyStatus,
  cookieUsed: number,
  limit: number
) {
  if (status !== "available") return 0;
  return Math.max(0, limit - Math.max(0, cookieUsed));
}

function keyState(value: unknown): { status: AnonymousLedgerKeyStatus; reservationId: string | null } {
  if (typeof value !== "string") {
    return { status: "available", reservationId: null };
  }
  if (value.startsWith("reserved:")) {
    return { status: "reserved", reservationId: value.slice(9) || null };
  }
  if (value.startsWith("committed:")) {
    return { status: "committed", reservationId: value.slice(10) || null };
  }
  return { status: "available", reservationId: null };
}

/**
 * Folds the two key values into one inspection. Committed wins over reserved,
 * and the identity key wins over the network key at the same rank, so a
 * caller that only needs "which reservation" gets the visitor's own.
 */
export function inspectionFromValues(primaryValue: unknown, shadowValue: unknown): AnonymousLedgerInspection {
  const primary = keyState(primaryValue);
  const shadow = keyState(shadowValue);
  const ranked = [primary, shadow];
  const leading = ranked.find((item) => item.status === "committed")
    || ranked.find((item) => item.status === "reserved")
    || { status: "available" as const, reservationId: null };
  return {
    status: leading.status,
    reservationId: leading.reservationId,
    identity: primary.status,
    network: shadow.status,
  };
}

function inspectionFromScriptResult(result: unknown): AnonymousLedgerInspection {
  const values = Array.isArray(result) ? result : [];
  return inspectionFromValues(values[0], values[1]);
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

function localInspection(keys: string[]) {
  return inspectionFromValues(
    readLocalAnonymousEntry(keys[0])?.value,
    readLocalAnonymousEntry(keys[1])?.value,
  );
}

function unavailable(cause?: unknown): never {
  const error = new AnonymousGenerationAccessError();
  if (cause !== undefined) {
    (error as Error & { cause?: unknown }).cause = cause;
  }
  throw error;
}

function failClosedWithoutSharedState(cause?: unknown) {
  if (
    process.env.NODE_ENV === "production"
    && !allowsExplicitLocalAnonymousAccessFallback()
  ) unavailable(cause);
}

/**
 * The signed cookie remains a user-facing hint. This ledger is the
 * authoritative anonymous entitlement. A durable signed identity is primary;
 * a separately salted network hash closes simple both-cookie resets. Raw
 * network addresses are never stored. Hosted environments fail closed if
 * shared state is unavailable.
 */
async function reserveWithReason({
  identityHash, shadowHash, monthKey, reservationId,
}: {
  identityHash: string;
  shadowHash: string;
  monthKey: string;
  reservationId: string;
}): Promise<AnonymousReserveResult> {
  const keys = ledgerKeys(identityHash, shadowHash, monthKey);
  const redis = getRedisClient();

  if (redis) {
    try {
      const result = Number(await redis.eval(
        RESERVE_SCRIPT,
        keys,
        [reservationId, String(HOLD_TTL_SECONDS)]
      ));
      return result === 1
        ? { reserved: true }
        : { reserved: false, refusal: RESERVE_REFUSAL_REASONS[result] ?? "unknown" };
    } catch (error) {
      failClosedWithoutSharedState(error);
    }
  } else {
    failClosedWithoutSharedState();
  }

  // Local mirror of RESERVE_SCRIPT: a refusal writes nothing.
  const inspection = localInspection(keys);
  if (inspection.identity === "committed") return { reserved: false, refusal: "identity" };
  if (inspection.network === "committed") return { reserved: false, refusal: "network" };
  if (inspection.identity !== "available" || inspection.network !== "available") {
    return { reserved: false, refusal: "hold" };
  }
  for (const key of keys) {
    writeLocalAnonymousEntry(key, `reserved:${reservationId}`, HOLD_TTL_SECONDS);
  }
  return { reserved: true };
}

export const anonymousGenerationAccessBackend: AnonymousGenerationAccessBackend = {
  async reserve(input) {
    return (await reserveWithReason(input)).reserved;
  },

  reserveWithReason,

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
        failClosedWithoutSharedState(error);
      }
    } else {
      failClosedWithoutSharedState();
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
        failClosedWithoutSharedState(error);
      }
    } else {
      failClosedWithoutSharedState();
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

  async status(input) {
    return (await this.inspect(input)).status;
  },

  async inspect({ identityHash, shadowHash, monthKey }) {
    const keys = ledgerKeys(identityHash, shadowHash, monthKey);
    const redis = getRedisClient();
    if (redis) {
      try {
        return inspectionFromScriptResult(await redis.eval(INSPECT_SCRIPT, keys, []));
      } catch (error) {
        failClosedWithoutSharedState(error);
      }
    } else {
      failClosedWithoutSharedState();
    }
    return localInspection(keys);
  },
};
