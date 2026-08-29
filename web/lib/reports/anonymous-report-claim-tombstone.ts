import "server-only";

import crypto from "node:crypto";
import { allowsExplicitLocalAnonymousAccessFallback } from "../billing/anonymousAccessFallback";
import { getRedisClient } from "../redis/client";
import {
  ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS,
  AnonymousReportRecoveryError,
  anonymousRecoveryStorageKey,
  isAnonymousRecoveryId,
  parseAnonymousReportRecovery,
  readLocalAnonymousEntry,
  serializedAnonymousReportRecovery,
  writeLocalAnonymousEntryUntil,
  type AnonymousReportRecoveryEnvelope,
} from "./anonymous-report-recovery";

const HASH_PATTERN = /^[0-9a-f]{64}$/u;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

const REPLACE_WITH_CLAIM_SCRIPT = `
local committed = "committed:" .. ARGV[1]
local current = redis.call("GET", KEYS[3])
if redis.call("GET", KEYS[1]) ~= committed
  or redis.call("GET", KEYS[2]) ~= committed then
  return 0
end
if current == ARGV[3] then return 2 end
if current ~= ARGV[2] then return 0 end
if not redis.call("SET", KEYS[3], ARGV[3], "PX", ARGV[4], "XX") then return 0 end
return 1
`;

type ClaimTombstone = {
  version: 1;
  kind: "claimed";
  recovery_id: string;
  identity_hash: string;
  claimant_hash: string;
  report_id: string;
  created_at: string;
  expires_at: string;
  signature: string;
};

export type AnonymousReportClaimLookup =
  | { status: "owned"; reportId: string }
  | { status: "consumed" };

function signingSecret() {
  const secret = process.env.ANONYMOUS_REPORT_RECOVERY_SECRET || process.env.SESSION_SECRET;
  if (!secret) throw new AnonymousReportRecoveryError();
  return secret;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function claimantHash(userId: string) {
  return crypto.createHmac("sha256", signingSecret())
    .update(`anonymous-report-claimant-v1\n${userId.toLowerCase()}`)
    .digest("hex");
}

function unsignedTombstone(tombstone: ClaimTombstone) {
  const { signature: _signature, ...unsigned } = tombstone;
  return unsigned;
}

function signTombstone(tombstone: ClaimTombstone) {
  return crypto.createHmac("sha256", signingSecret())
    .update(`anonymous-report-claim-tombstone-v1\n${stableJson(unsignedTombstone(tombstone))}`)
    .digest("hex");
}

function signaturesMatch(supplied: unknown, expected: string) {
  if (typeof supplied !== "string" || !HASH_PATTERN.test(supplied)) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

function decodeStoredValue(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return JSON.stringify(value);
  return null;
}

function parseTombstone(value: unknown, now = Date.now()): ClaimTombstone | null {
  const text = decodeStoredValue(value);
  if (!text || Buffer.byteLength(text, "utf8") > 4 * 1024) return null;
  try {
    const parsed = JSON.parse(text) as ClaimTombstone;
    const keys = Object.keys(parsed);
    const createdAt = Date.parse(String(parsed.created_at || ""));
    const expiresAt = Date.parse(String(parsed.expires_at || ""));
    if (
      keys.length !== 9
      || parsed.version !== 1
      || parsed.kind !== "claimed"
      || !isAnonymousRecoveryId(parsed.recovery_id)
      || !HASH_PATTERN.test(parsed.identity_hash)
      || !HASH_PATTERN.test(parsed.claimant_hash)
      || !UUID_PATTERN.test(parsed.report_id)
      || !Number.isFinite(createdAt)
      || !Number.isFinite(expiresAt)
      || createdAt > now + 5 * 60 * 1000
      || expiresAt <= now
      || expiresAt > createdAt + ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS * 1000
      || !signaturesMatch(parsed.signature, signTombstone(parsed))
    ) return null;
    return parsed;
  } catch {
    return null;
  }
}

function accessKeys(envelope: AnonymousReportRecoveryEnvelope) {
  return [
    `generation:anonymous:${envelope.month_key}:${envelope.identity_hash}`,
    `generation:anonymous:${envelope.month_key}:network:${envelope.shadow_hash}`,
  ];
}

function validateClaimInput(recoveryId: string, identityHash: string, userId: string) {
  return isAnonymousRecoveryId(recoveryId)
    && HASH_PATTERN.test(identityHash)
    && UUID_PATTERN.test(userId);
}

async function readClaimValue(recoveryId: string) {
  const key = anonymousRecoveryStorageKey(recoveryId);
  const redis = getRedisClient();
  if (redis) {
    try {
      return await redis.get<unknown>(key);
    } catch (error) {
      if (!allowsExplicitLocalAnonymousAccessFallback()) {
        throw new AnonymousReportRecoveryError();
      }
    }
  } else if (!allowsExplicitLocalAnonymousAccessFallback()) {
    throw new AnonymousReportRecoveryError();
  }
  return readLocalAnonymousEntry(key)?.value || null;
}

export async function loadAnonymousReportClaimTombstone(input: {
  recoveryId: string;
  identityHash: string;
  userId: string;
}): Promise<AnonymousReportClaimLookup | null> {
  if (!validateClaimInput(input.recoveryId, input.identityHash, input.userId)) return null;
  const tombstone = parseTombstone(await readClaimValue(input.recoveryId));
  if (!tombstone || tombstone.identity_hash !== input.identityHash.toLowerCase()) return null;
  return tombstone.claimant_hash === claimantHash(input.userId)
    ? { status: "owned", reportId: tombstone.report_id }
    : { status: "consumed" };
}

export async function replaceAnonymousReportRecoveryWithClaimTombstone(input: {
  envelope: AnonymousReportRecoveryEnvelope;
  userId: string;
  reportId: string;
  now?: number;
}) {
  const now = input.now ?? Date.now();
  if (
    !UUID_PATTERN.test(input.userId)
    || !UUID_PATTERN.test(input.reportId)
    || !parseAnonymousReportRecovery(serializedAnonymousReportRecovery(input.envelope), now)
  ) throw new AnonymousReportRecoveryError();
  const tombstone: ClaimTombstone = {
    version: 1,
    kind: "claimed",
    recovery_id: input.envelope.recovery_id,
    identity_hash: input.envelope.identity_hash,
    claimant_hash: claimantHash(input.userId),
    report_id: input.reportId.toLowerCase(),
    created_at: input.envelope.created_at,
    expires_at: input.envelope.expires_at,
    signature: "",
  };
  tombstone.signature = signTombstone(tombstone);
  const serializedTombstone = JSON.stringify(tombstone);
  const expectedRecovery = serializedAnonymousReportRecovery(input.envelope);
  const expiresAt = Date.parse(input.envelope.expires_at);
  const ttlMilliseconds = Math.floor(expiresAt - now);
  if (ttlMilliseconds < 1) throw new AnonymousReportRecoveryError();
  const keys = accessKeys(input.envelope);
  const recoveryKey = anonymousRecoveryStorageKey(input.envelope.recovery_id);
  const redis = getRedisClient();
  if (redis) {
    try {
      const result = Number(await redis.eval(
        REPLACE_WITH_CLAIM_SCRIPT,
        [...keys, recoveryKey],
        [input.envelope.reservation_id, expectedRecovery, serializedTombstone, String(ttlMilliseconds)],
      ));
      return result === 1 ? "created" : result === 2 ? "idempotent" : "conflict";
    } catch {
      try {
        if (decodeStoredValue(await redis.get<unknown>(recoveryKey)) === serializedTombstone) {
          return "idempotent";
        }
      } catch {
        // A later request can reconcile the signed tombstone once Redis recovers.
      }
      if (!allowsExplicitLocalAnonymousAccessFallback()) {
        throw new AnonymousReportRecoveryError();
      }
    }
  } else if (!allowsExplicitLocalAnonymousAccessFallback()) {
    throw new AnonymousReportRecoveryError();
  }
  const committed = `committed:${input.envelope.reservation_id}`;
  if (keys.some((key) => readLocalAnonymousEntry(key)?.value !== committed)) return "conflict";
  const current = readLocalAnonymousEntry(recoveryKey)?.value;
  if (current === serializedTombstone) return "idempotent";
  if (current !== expectedRecovery) return "conflict";
  writeLocalAnonymousEntryUntil(recoveryKey, serializedTombstone, expiresAt);
  return "created";
}
