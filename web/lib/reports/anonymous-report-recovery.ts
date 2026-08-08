import "server-only";

import crypto from "node:crypto";
import { getRedisClient } from "../redis/client";
import { allowsExplicitLocalAnonymousAccessFallback } from "../billing/anonymousAccessFallback";
import { makeValidatedReportReceipt, validatedReportReceiptClaim } from "./report-receipt";
import { ResumeFeedbackResponseSchema, type ResumeFeedbackResponse } from "../validation/schemas";

export const ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS = 24 * 60 * 60;
const COMMITTED_TTL_SECONDS = 40 * 24 * 60 * 60;
const MAX_RECOVERY_BYTES = 256 * 1024;
const HASH_PATTERN = /^[0-9a-f]{64}$/u;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/u;
const STORED_RECOVERY_VALUE = Symbol("stored-anonymous-report-recovery");

const READ_RECOVERY_SCRIPT = `
local committed = "committed:" .. ARGV[1]
if redis.call("GET", KEYS[1]) ~= committed
  or redis.call("GET", KEYS[2]) ~= committed then
  return ""
end
return redis.call("GET", KEYS[3]) or ""
`;

const DELETE_RECOVERY_SCRIPT = `
local committed = "committed:" .. ARGV[1]
if redis.call("GET", KEYS[1]) ~= committed
  or redis.call("GET", KEYS[2]) ~= committed then
  return 0
end
redis.call("DEL", KEYS[3])
return 1
`;

export const COMPLETE_WITH_RECOVERY_SCRIPT = `
local primary = redis.call("GET", KEYS[1])
local shadow = redis.call("GET", KEYS[2])
local recovery = redis.call("GET", KEYS[3])
local reserved = "reserved:" .. ARGV[1]
local committed = "committed:" .. ARGV[1]
if recovery then
  if recovery == ARGV[4] and primary == committed and shadow == committed then
    return 2
  end
  return 0
end
if primary ~= reserved or shadow ~= reserved then return 0 end
if not redis.call("SET", KEYS[3], ARGV[4], "EX", ARGV[3], "NX") then return 0 end
redis.call("SET", KEYS[1], committed, "EX", ARGV[2])
redis.call("SET", KEYS[2], committed, "EX", ARGV[2])
return 1
`;

type LocalEntry = { value: string; expiresAtMs: number };
const localEntries = new Map<string, LocalEntry>();

export type AnonymousReportRecoveryEnvelope = {
  version: 1;
  recovery_id: string;
  reservation_id: string;
  identity_hash: string;
  shadow_hash: string;
  month_key: string;
  created_at: string;
  expires_at: string;
  report_digest: string;
  report: ResumeFeedbackResponse;
  report_receipt: string;
  resume_hash: string;
  signature: string;
};

export type AnonymousReportRecoveryCommit = {
  recoveryId: string;
  serializedEnvelope: string;
  ttlSeconds: number;
};

export function serializedAnonymousReportRecovery(
  envelope: AnonymousReportRecoveryEnvelope
) {
  return (envelope as AnonymousReportRecoveryEnvelope & {
    [STORED_RECOVERY_VALUE]?: string;
  })[STORED_RECOVERY_VALUE] || JSON.stringify(envelope);
}

type RecoveryBinding = {
  recoveryId: string;
  identityHash: string;
};

export class AnonymousReportRecoveryError extends Error {
  code = "ANONYMOUS_RECOVERY_DEPENDENCY_UNAVAILABLE";

  constructor(message = "Report recovery is temporarily unavailable.") {
    super(message);
    this.name = "AnonymousReportRecoveryError";
  }
}

function unavailable(cause?: unknown): never {
  const error = new AnonymousReportRecoveryError();
  if (cause !== undefined) (error as Error & { cause?: unknown }).cause = cause;
  throw error;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => JSON.stringify(item) !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function signingSecret() {
  const secret = process.env.ANONYMOUS_REPORT_RECOVERY_SECRET || process.env.SESSION_SECRET;
  if (!secret) throw new Error("Anonymous report recovery signing is not configured");
  return secret;
}

function sign(value: unknown) {
  return crypto.createHmac("sha256", signingSecret())
    .update(`anonymous-report-recovery-v1\n${stableJson(value)}`)
    .digest("hex");
}

function unsignedEnvelope(envelope: AnonymousReportRecoveryEnvelope) {
  const { signature: _signature, ...unsigned } = envelope;
  return unsigned;
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

export function isAnonymousRecoveryId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function createAnonymousReportRecovery(input: {
  reservationId: string;
  identityHash: string;
  shadowHash: string;
  monthKey: string;
  report: unknown;
  resumeHash: string;
  recoveryId: string;
  ttlSeconds?: number;
  now?: number;
}): AnonymousReportRecoveryCommit & { envelope: AnonymousReportRecoveryEnvelope } {
  const report = ResumeFeedbackResponseSchema.parse(input.report);
  const recoveryId = input.recoveryId;
  const ttlSeconds = Math.floor(input.ttlSeconds || ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS);
  if (
    !isAnonymousRecoveryId(recoveryId)
    || !UUID_PATTERN.test(input.reservationId)
    || !HASH_PATTERN.test(input.identityHash)
    || !HASH_PATTERN.test(input.shadowHash)
    || !HASH_PATTERN.test(input.resumeHash)
    || !MONTH_PATTERN.test(input.monthKey)
    || ttlSeconds < 1
    || ttlSeconds > ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS
  ) throw new Error("Invalid anonymous report recovery input");

  const now = input.now ?? Date.now();
  const reportDigest = crypto.createHash("sha256").update(stableJson(report)).digest("hex");
  const envelope = {
    version: 1 as const,
    recovery_id: recoveryId.toLowerCase(),
    reservation_id: input.reservationId.toLowerCase(),
    identity_hash: input.identityHash.toLowerCase(),
    shadow_hash: input.shadowHash.toLowerCase(),
    month_key: input.monthKey,
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + ttlSeconds * 1000).toISOString(),
    report_digest: reportDigest,
    report,
    report_receipt: makeValidatedReportReceipt(report, now),
    resume_hash: input.resumeHash.toLowerCase(),
    signature: "",
  };
  envelope.signature = sign(unsignedEnvelope(envelope));
  const serializedEnvelope = JSON.stringify(envelope);
  if (Buffer.byteLength(serializedEnvelope, "utf8") > MAX_RECOVERY_BYTES) {
    throw new Error("Anonymous report recovery payload is too large");
  }
  return { recoveryId: envelope.recovery_id, serializedEnvelope, ttlSeconds, envelope };
}

export function parseAnonymousReportRecovery(
  serialized: unknown,
  now = Date.now()
): AnonymousReportRecoveryEnvelope | null {
  const text = decodeStoredValue(serialized);
  if (!text || Buffer.byteLength(text, "utf8") > MAX_RECOVERY_BYTES) return null;
  try {
    const value = JSON.parse(text) as Record<string, unknown>;
    const allowed = new Set([
      "version", "recovery_id", "reservation_id", "identity_hash", "shadow_hash",
      "month_key", "created_at", "expires_at", "report_digest", "report",
      "report_receipt", "resume_hash", "signature",
    ]);
    if (Object.keys(value).some((key) => !allowed.has(key))) return null;
    const createdAt = Date.parse(String(value.created_at || ""));
    const expiresAt = Date.parse(String(value.expires_at || ""));
    if (
      value.version !== 1
      || !isAnonymousRecoveryId(value.recovery_id)
      || typeof value.reservation_id !== "string" || !UUID_PATTERN.test(value.reservation_id)
      || typeof value.identity_hash !== "string" || !HASH_PATTERN.test(value.identity_hash)
      || typeof value.shadow_hash !== "string" || !HASH_PATTERN.test(value.shadow_hash)
      || typeof value.month_key !== "string" || !MONTH_PATTERN.test(value.month_key)
      || typeof value.report_digest !== "string" || !HASH_PATTERN.test(value.report_digest)
      || typeof value.resume_hash !== "string" || !HASH_PATTERN.test(value.resume_hash)
      || !Number.isFinite(createdAt) || !Number.isFinite(expiresAt)
      || createdAt > now + 5 * 60 * 1000
      || expiresAt <= now
      || expiresAt > createdAt + ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS * 1000
    ) return null;
    const parsedReport = ResumeFeedbackResponseSchema.safeParse(value.report);
    if (!parsedReport.success) return null;
    const digest = crypto.createHash("sha256").update(stableJson(parsedReport.data)).digest("hex");
    if (digest !== value.report_digest) return null;
    const envelope = { ...value, report: parsedReport.data } as AnonymousReportRecoveryEnvelope;
    if (!signaturesMatch(envelope.signature, sign(unsignedEnvelope(envelope)))) return null;
    if (!validatedReportReceiptClaim(envelope.report, envelope.report_receipt, now)) return null;
    Object.defineProperty(envelope, STORED_RECOVERY_VALUE, {
      value: text,
      configurable: false,
      enumerable: false,
      writable: false,
    });
    return envelope;
  } catch {
    return null;
  }
}

export function validateAnonymousRecoveryCommit(
  commit: AnonymousReportRecoveryCommit,
  binding: Omit<AnonymousReportRecoveryEnvelope, "version" | "created_at" | "expires_at" | "report_digest" | "report" | "report_receipt" | "resume_hash" | "signature">
) {
  const envelope = parseAnonymousReportRecovery(commit.serializedEnvelope);
  if (
    !envelope
    || commit.recoveryId.toLowerCase() !== envelope.recovery_id
    || commit.ttlSeconds < 1
    || commit.ttlSeconds > ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS
    || envelope.recovery_id !== binding.recovery_id.toLowerCase()
    || envelope.reservation_id !== binding.reservation_id.toLowerCase()
    || envelope.identity_hash !== binding.identity_hash.toLowerCase()
    || envelope.shadow_hash !== binding.shadow_hash.toLowerCase()
    || envelope.month_key !== binding.month_key
  ) throw new Error("Invalid anonymous report recovery commit");
  return envelope;
}

export function anonymousRecoveryStorageKey(recoveryId: string) {
  if (!isAnonymousRecoveryId(recoveryId)) throw new Error("Invalid recovery ID");
  return `generation:anonymous:recovery:${recoveryId.toLowerCase()}`;
}

function ledgerKeys(identityHash: string, shadowHash: string, monthKey: string) {
  return [
    `generation:anonymous:${monthKey}:${identityHash.toLowerCase()}`,
    `generation:anonymous:${monthKey}:network:${shadowHash.toLowerCase()}`,
  ];
}

export function readLocalAnonymousEntry(key: string) {
  const entry = localEntries.get(key);
  if (entry && entry.expiresAtMs <= Date.now()) {
    localEntries.delete(key);
    return null;
  }
  return entry || null;
}

export function writeLocalAnonymousEntry(key: string, value: string, ttlSeconds: number) {
  localEntries.set(key, { value, expiresAtMs: Date.now() + ttlSeconds * 1000 });
}

export function writeLocalAnonymousEntryUntil(key: string, value: string, expiresAtMs: number) {
  localEntries.set(key, { value, expiresAtMs });
}

export function deleteLocalAnonymousEntry(key: string) {
  localEntries.delete(key);
}

export function completeLocalAnonymousAccessWithRecovery(input: {
  accessKeys: string[];
  reservationId: string;
  recovery: AnonymousReportRecoveryCommit;
}) {
  const [primary, shadow] = input.accessKeys.map((key) => readLocalAnonymousEntry(key)?.value);
  const recoveryKey = anonymousRecoveryStorageKey(input.recovery.recoveryId);
  const existing = readLocalAnonymousEntry(recoveryKey)?.value;
  const committed = `committed:${input.reservationId}`;
  if (existing) {
    return existing === input.recovery.serializedEnvelope
      && primary === committed && shadow === committed ? "idempotent" as const : "conflict" as const;
  }
  const reserved = `reserved:${input.reservationId}`;
  if (primary !== reserved || shadow !== reserved) return "conflict" as const;
  writeLocalAnonymousEntry(recoveryKey, input.recovery.serializedEnvelope, input.recovery.ttlSeconds);
  for (const key of input.accessKeys) writeLocalAnonymousEntry(key, committed, COMMITTED_TTL_SECONDS);
  return "created" as const;
}

function canUseLocalFallback() {
  return allowsExplicitLocalAnonymousAccessFallback();
}

async function initialRecoveryValue(recoveryKey: string) {
  const redis = getRedisClient();
  if (redis) {
    try {
      return { redis, value: await redis.get<unknown>(recoveryKey) };
    } catch (error) {
      if (!canUseLocalFallback()) unavailable(error);
    }
  } else if (!canUseLocalFallback()) unavailable();
  return { redis: null, value: readLocalAnonymousEntry(recoveryKey)?.value || null };
}

export async function loadAnonymousReportRecovery(
  binding: RecoveryBinding
): Promise<AnonymousReportRecoveryEnvelope | null> {
  if (
    !isAnonymousRecoveryId(binding.recoveryId)
    || !HASH_PATTERN.test(binding.identityHash)
  ) return null;
  const recoveryKey = anonymousRecoveryStorageKey(binding.recoveryId);
  const initial = await initialRecoveryValue(recoveryKey);
  let envelope = parseAnonymousReportRecovery(initial.value);
  if (
    !envelope
    || envelope.identity_hash !== binding.identityHash.toLowerCase()
  ) return null;
  const keys = ledgerKeys(binding.identityHash, envelope.shadow_hash, envelope.month_key);
  if (initial.redis) {
    try {
      const value = await initial.redis.eval(
        READ_RECOVERY_SCRIPT,
        [...keys, recoveryKey],
        [envelope.reservation_id]
      );
      envelope = parseAnonymousReportRecovery(value);
    } catch (error) {
      unavailable(error);
    }
  } else {
    const committed = `committed:${envelope.reservation_id}`;
    if (keys.some((key) => readLocalAnonymousEntry(key)?.value !== committed)) return null;
    envelope = parseAnonymousReportRecovery(readLocalAnonymousEntry(recoveryKey)?.value);
  }
  return envelope
    && envelope.identity_hash === binding.identityHash.toLowerCase()
    ? envelope : null;
}

export async function deleteAnonymousReportRecovery(
  binding: RecoveryBinding & { shadowHash: string; reservationId: string; monthKey: string }
) {
  const recoveryKey = anonymousRecoveryStorageKey(binding.recoveryId);
  const keys = ledgerKeys(binding.identityHash, binding.shadowHash, binding.monthKey);
  const redis = getRedisClient();
  if (redis) {
    try {
      return Number(await redis.eval(
        DELETE_RECOVERY_SCRIPT,
        [...keys, recoveryKey],
        [binding.reservationId]
      )) === 1;
    } catch (error) {
      if (!canUseLocalFallback()) unavailable(error);
    }
  } else if (!canUseLocalFallback()) unavailable();
  const committed = `committed:${binding.reservationId}`;
  if (keys.some((key) => readLocalAnonymousEntry(key)?.value !== committed)) return false;
  deleteLocalAnonymousEntry(recoveryKey);
  return true;
}
