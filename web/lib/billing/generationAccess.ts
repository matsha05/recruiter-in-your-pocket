import crypto from "node:crypto";
import {
  FREE_RUN_LIMIT,
  getCurrentMonthKey,
  type ParsedFreeMeta,
} from "../backend/freeCookie";
import { anonymousGenerationAccessBackend } from "./anonymousGenerationAccess";
import { assertGenerationCapacity } from "../operations/generationBudget";
import {
  accessResolution,
  firstRpcRecord,
  queryAuthenticatedAccessState,
  resolutionFromRpcData,
  type GenerationAccessResolution,
} from "./generationAccessFinality";
import type {
  AnonymousFreeCookieMeta,
  GenerationAccessReservation,
  GenerationAccessRpcClient,
  GenerationPassSnapshot,
  GenerationReleaseReason,
  GenerationReportKind,
} from "./generationAccessTypes";
export type {
  AnonymousFreeCookieMeta,
  GenerationAccessReservation,
  GenerationAccessRpcClient,
  GenerationAccessTier,
  GenerationEntitlementKind,
  GenerationPassSnapshot,
  GenerationReleaseReason,
  GenerationReportKind,
} from "./generationAccessTypes";

type RpcError = { code?: string; message?: string } | null;

export class GenerationAccessError extends Error {
  code: string;
  httpStatus: number;
  accessConsumed: boolean | null;

  constructor(
    code: string,
    message: string,
    httpStatus = 503,
    accessConsumed: boolean | null = null
  ) {
    super(message);
    this.name = "GenerationAccessError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.accessConsumed = accessConsumed;
  }
}

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const anonymousCookieMetaAfterCommit = new WeakMap<
  GenerationAccessReservation,
  AnonymousFreeCookieMeta
>();

export function isMockGenerationProviderEnabled() {
  return TRUE_VALUES.has(String(process.env.USE_MOCK_OPENAI || "").trim().toLowerCase());
}

/**
 * A real provider call must never run when identity or atomic reservation
 * infrastructure is unavailable. Mock runs stay dependency-free for local and
 * contract testing, and authenticated mock sessions still require the RPC.
 */
export function assertGenerationAccessDependencies(input: {
  authClientAvailable: boolean;
  adminClientAvailable: boolean;
  mockProvider?: boolean;
}) {
  const mockProvider = input.mockProvider ?? isMockGenerationProviderEnabled();
  if (mockProvider) return;

  if (!input.authClientAvailable || !input.adminClientAvailable) {
    throw new GenerationAccessError(
      "ACCESS_DEPENDENCY_UNAVAILABLE",
      "Report access is temporarily unavailable. Please try again in a moment."
    );
  }
}

export function assertGenerationAuthLookup(error: unknown) {
  if (!error) return;
  const candidate = error as { name?: unknown; code?: unknown };
  const name = String(candidate.name || "");
  const code = String(candidate.code || "").toLowerCase();

  // Supabase returns this for a legitimate anonymous request with no session.
  if (name === "AuthSessionMissingError" || code === "auth_session_missing") return;

  throw new GenerationAccessError(
    "ACCESS_DEPENDENCY_UNAVAILABLE",
    "Report access is temporarily unavailable. Please try again in a moment."
  );
}

function numberOrZero(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.floor(numeric));
}

function parsePass(value: unknown): GenerationPassSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const pass = value as Record<string, unknown>;
  if (typeof pass.id !== "string" || typeof pass.tier !== "string") return null;

  return {
    id: pass.id,
    tier: pass.tier,
    expires_at: typeof pass.expires_at === "string" ? pass.expires_at : null,
    uses_remaining: numberOrZero(pass.uses_remaining),
    created_at: typeof pass.created_at === "string" ? pass.created_at : null,
  };
}

function unavailableFromRpc(
  operation: "reserve" | "commit" | "release",
  _error?: RpcError,
  accessConsumed: boolean | null = null
) {
  const code = operation === "reserve"
    ? "ACCESS_RESERVATION_FAILED"
    : operation === "commit"
      ? "ACCESS_COMMIT_FAILED"
      : "ACCESS_RELEASE_FAILED";

  return new GenerationAccessError(
    code,
    `Report access could not be ${operation === "reserve" ? "reserved" : operation === "commit" ? "confirmed" : "released"}. Please try again.`,
    503,
    accessConsumed
  );
}

export async function reserveGenerationAccess(input: {
  userId: string | null;
  admin: GenerationAccessRpcClient | null;
  reportKind: GenerationReportKind;
  bypass: boolean;
  freeMeta: ParsedFreeMeta;
  anonymousIdentityHash?: string | null;
  anonymousShadowHash?: string | null;
  now?: () => Date;
  randomUUID?: () => string;
  operationId?: string | null;
  requestDigest?: string | null;
}): Promise<GenerationAccessReservation> {
  const now = input.now || (() => new Date());
  const randomUUID = input.randomUUID || (() => crypto.randomUUID());
  const freeUsed = Math.max(0, numberOrZero(input.freeMeta.used));
  const anonymousFreeRemaining = Math.max(0, FREE_RUN_LIMIT - freeUsed);

  if (input.bypass) {
    return {
      access: "full",
      accessTier: "pass_full",
      entitlementKind: "bypass",
      reservationId: null,
      userId: input.userId,
      activePass: null,
      freeUsesRemaining: input.userId ? 0 : anonymousFreeRemaining,
      anonymousCookieMeta: null,
      anonymousIdentityHash: null,
      anonymousMonthKey: null,
    };
  }

  if (!input.userId) {
    if (anonymousFreeRemaining <= 0) {
      return {
        access: "preview",
        accessTier: "preview",
        entitlementKind: null,
        reservationId: null,
        userId: null,
        activePass: null,
        freeUsesRemaining: 0,
        anonymousCookieMeta: null,
        anonymousIdentityHash: null,
        anonymousMonthKey: null,
      };
    }

    const reservedAt = now().toISOString();
    const anonymousIdentityHash = input.anonymousIdentityHash || null;
    const anonymousShadowHash = input.anonymousShadowHash || null;
    const anonymousMonthKey = getCurrentMonthKey();
    if (!anonymousIdentityHash || !anonymousShadowHash) {
      throw new GenerationAccessError(
        "ACCESS_DEPENDENCY_UNAVAILABLE",
        "Report access is temporarily unavailable. Please try again in a moment."
      );
    }

    const reservationId = randomUUID();
    let reserved = false;
    try {
      reserved = await anonymousGenerationAccessBackend.reserve({
        identityHash: anonymousIdentityHash,
        shadowHash: anonymousShadowHash,
        monthKey: anonymousMonthKey,
        reservationId,
      });
    } catch {
      throw new GenerationAccessError(
        "ACCESS_DEPENDENCY_UNAVAILABLE",
        "Report access is temporarily unavailable. Please try again in a moment."
      );
    }

    if (!reserved) {
      return {
        access: "preview",
        accessTier: "preview",
        entitlementKind: null,
        reservationId: null,
        userId: null,
        activePass: null,
        freeUsesRemaining: 0,
        anonymousCookieMeta: null,
        anonymousIdentityHash: null,
        anonymousMonthKey: null,
      };
    }

    const reservation: GenerationAccessReservation = {
      access: "full",
      accessTier: "free_full",
      entitlementKind: "anonymous_free",
      reservationId,
      userId: null,
      activePass: null,
      freeUsesRemaining: Math.max(0, anonymousFreeRemaining - 1),
      // A reservation is not a use. This becomes non-null only after commit,
      // so streaming responses cannot write a consumed cookie while provider
      // output is still pending validation.
      anonymousCookieMeta: null,
      anonymousIdentityHash,
      anonymousShadowHash,
      anonymousMonthKey,
    };
    anonymousCookieMetaAfterCommit.set(reservation, {
      used: Math.min(FREE_RUN_LIMIT, freeUsed + 1),
      last_free_ts: reservedAt,
      reset_month: anonymousMonthKey,
    });
    return reservation;
  }

  if (!input.admin) {
    throw new GenerationAccessError(
      "ACCESS_DEPENDENCY_UNAVAILABLE",
      "Report access is temporarily unavailable. Please try again in a moment."
    );
  }

  const operationId = input.operationId && UUID_PATTERN.test(input.operationId)
    ? input.operationId.toLowerCase()
    : null;
  const requestDigest = input.requestDigest && /^[0-9a-f]{64}$/iu.test(input.requestDigest)
    ? input.requestDigest.toLowerCase()
    : null;
  if (operationId && (!requestDigest || input.reportKind !== "resume_feedback")) {
    throw unavailableFromRpc("reserve");
  }
  const requestedReservationId = operationId ? null : randomUUID();
  const { data, error } = operationId
    ? await input.admin.rpc("begin_generation_operation", {
      p_user_id: input.userId,
      p_operation_id: operationId,
      p_report_kind: input.reportKind,
      p_request_digest: requestDigest,
    })
    : await input.admin.rpc("reserve_generation_access", {
      p_user_id: input.userId,
      p_reservation_id: requestedReservationId,
      p_report_kind: input.reportKind,
    });

  if (error) throw unavailableFromRpc("reserve", error);

  const result = firstRpcRecord(data);
  if (!result || typeof result.allowed !== "boolean") {
    throw unavailableFromRpc("reserve");
  }

  const returnedReservationId = typeof result.reservation_id === "string"
    ? result.reservation_id
    : null;
  const accessTier = result.access_tier;
  const entitlementKind = result.entitlement_kind;

  if (!result.allowed) {
    if (
      operationId
      && result.operation_state === "committed"
      && returnedReservationId
      && UUID_PATTERN.test(returnedReservationId)
      && (accessTier === "free_full" || accessTier === "pass_full")
      && (entitlementKind === "free" || entitlementKind === "pass_credit" || entitlementKind === "pass_unlimited")
    ) {
      if (
        result.report_final !== true
        || typeof result.report_id !== "string"
        || !UUID_PATTERN.test(result.report_id)
      ) throw unavailableFromRpc("reserve");
      return {
        access: "full", accessTier, entitlementKind, reservationId: returnedReservationId,
        userId: input.userId, activePass: parsePass(result.pass),
        freeUsesRemaining: numberOrZero(result.free_uses_remaining),
        anonymousCookieMeta: null, anonymousIdentityHash: null, anonymousMonthKey: null,
        recoveredReportId: result.report_id,
        operationId,
      };
    }
    if (result.operation_state === "pending") {
      throw new GenerationAccessError(
        "GENERATION_OPERATION_PENDING",
        "This report is still processing. Retry shortly to recover the same result.",
        409,
        null,
      );
    }
    if (result.operation_state === "terminal") {
      throw new GenerationAccessError(
        "GENERATION_OPERATION_TERMINAL",
        "The prior report attempt ended without a completed report. Start a new attempt.",
        409,
        false,
      );
    }
    return {
      access: "preview",
      accessTier: "preview",
      entitlementKind: null,
      reservationId: null,
      userId: input.userId,
      activePass: null,
      freeUsesRemaining: 0,
      anonymousCookieMeta: null,
      anonymousIdentityHash: null,
      anonymousMonthKey: null,
    };
  }

  if (
    !returnedReservationId
    || !UUID_PATTERN.test(returnedReservationId)
    || (requestedReservationId !== null && returnedReservationId !== requestedReservationId)
    || (operationId !== null && result.operation_state !== "execute")
    || (accessTier !== "free_full" && accessTier !== "pass_full")
    || (entitlementKind !== "free" && entitlementKind !== "pass_credit" && entitlementKind !== "pass_unlimited")
  ) {
    throw unavailableFromRpc("reserve");
  }

  return {
    access: "full",
    accessTier,
    entitlementKind,
    reservationId: returnedReservationId,
    userId: input.userId,
    activePass: parsePass(result.pass),
    freeUsesRemaining: numberOrZero(result.free_uses_remaining),
    anonymousCookieMeta: null,
    anonymousIdentityHash: null,
    anonymousMonthKey: null,
    operationId,
  };
}

export function applyAnonymousCommitCookie(reservation: GenerationAccessReservation) {
  const cookieMeta = anonymousCookieMetaAfterCommit.get(reservation);
  if (!cookieMeta) throw unavailableFromRpc("commit", null, true);
  reservation.anonymousCookieMeta = cookieMeta;
}

export async function commitGenerationAccess(
  reservation: GenerationAccessReservation,
  admin: GenerationAccessRpcClient | null
): Promise<GenerationAccessResolution> {
  if (reservation.entitlementKind === "anonymous_free") {
    const reservationId = reservation.reservationId;
    const identityHash = reservation.anonymousIdentityHash;
    const shadowHash = reservation.anonymousShadowHash;
    const monthKey = reservation.anonymousMonthKey;
    if (!reservationId || !identityHash || !shadowHash || !monthKey) {
      throw unavailableFromRpc("commit");
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        if (await anonymousGenerationAccessBackend.commit({
          identityHash,
          shadowHash,
          monthKey,
          reservationId,
        })) {
          applyAnonymousCommitCookie(reservation);
          return accessResolution("committed", "committed");
        }
      } catch {
        // Retry the idempotent transition, then inspect authoritative state.
      }
    }

    try {
      const state = await anonymousGenerationAccessBackend.inspect({ identityHash, shadowHash, monthKey });
      if (state.status === "committed" && state.reservationId === reservationId) {
        applyAnonymousCommitCookie(reservation);
        return accessResolution("committed", "committed");
      }
      const consumed = state.status === "committed" ? true : state.status === "reserved" ? false : null;
      throw unavailableFromRpc("commit", null, consumed);
    } catch (error) {
      if (error instanceof GenerationAccessError) throw error;
      throw unavailableFromRpc("commit");
    }
  }

  if (!reservation.userId || !reservation.reservationId) {
    return accessResolution("committed", "committed");
  }
  if (!admin) throw unavailableFromRpc("commit");

  let lastResolution = accessResolution("unknown");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data, error } = await admin.rpc("commit_generation_access", {
        p_user_id: reservation.userId,
        p_reservation_id: reservation.reservationId,
      });
      if (error) continue;
      const resolution = resolutionFromRpcData(data, "committed");
      if (resolution.state === "committed") return resolution;
      lastResolution = resolution;
    } catch {
      // Retry the idempotent transition, then query authoritative state.
    }
  }

  const resolution = await queryAuthenticatedAccessState(
    admin,
    reservation.userId,
    reservation.reservationId
  );
  if (resolution.state === "committed") {
    return { ...resolution, action: "committed" };
  }
  throw unavailableFromRpc(
    "commit",
    null,
    resolution.state === "unknown"
      ? lastResolution.accessConsumed
      : resolution.accessConsumed
  );
}

/**
 * Reserve from the shared paid-AI ceiling immediately before provider work.
 * The entitlement itself remains pending until validated output is ready.
 */
export async function markGenerationProviderCallStarted(
  _reservation: GenerationAccessReservation
) {
  if (!isMockGenerationProviderEnabled()) {
    await assertGenerationCapacity();
  }
}

export async function releaseGenerationAccess(
  reservation: GenerationAccessReservation | null,
  admin: GenerationAccessRpcClient | null,
  reason: GenerationReleaseReason
): Promise<GenerationAccessResolution> {
  if (reservation?.entitlementKind === "anonymous_free") {
    if (
      !reservation.reservationId
      || !reservation.anonymousIdentityHash
      || !reservation.anonymousShadowHash
      || !reservation.anonymousMonthKey
    ) {
      return accessResolution("unknown");
    }

    try {
      const result = await anonymousGenerationAccessBackend.release({
        identityHash: reservation.anonymousIdentityHash,
        shadowHash: reservation.anonymousShadowHash,
        monthKey: reservation.anonymousMonthKey,
        reservationId: reservation.reservationId,
      });
      if (result.status === "committed") return accessResolution("committed");
      if (result.status !== "released") return accessResolution("unknown");
      reservation.anonymousCookieMeta = null;
      anonymousCookieMetaAfterCommit.delete(reservation);
      return accessResolution("released", "released");
    } catch {
      try {
        const state = await anonymousGenerationAccessBackend.inspect({
          identityHash: reservation.anonymousIdentityHash,
          shadowHash: reservation.anonymousShadowHash,
          monthKey: reservation.anonymousMonthKey,
        });
        if (state.status === "committed") return accessResolution("committed");
      } catch {
        // The caller must present this as unknown rather than promise a refund.
      }
      return accessResolution("unknown");
    }
  }

  if (!reservation?.userId || !reservation.reservationId) {
    return accessResolution("released");
  }
  if (!admin) return accessResolution("unknown");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data, error } = await admin.rpc("release_generation_access", {
        p_user_id: reservation.userId,
        p_reservation_id: reservation.reservationId,
        p_reason_code: reason,
      });
      if (error) continue;
      const resolution = resolutionFromRpcData(data);
      if (resolution.state !== "unknown") return resolution;
    } catch {
      // Retry the reserved-only transition, then query authoritative state.
    }
  }

  return queryAuthenticatedAccessState(admin, reservation.userId, reservation.reservationId);
}

export function releaseReasonForError(error: unknown): GenerationReleaseReason {
  const candidate = error as { code?: unknown; name?: unknown } | null;
  const code = String(candidate?.code || "");
  const name = String(candidate?.name || "");

  if (code === "CLIENT_CANCELED") return "client_disconnect";
  if (code === "OPENAI_TIMEOUT") return "provider_timeout";
  if (code.startsWith("OPENAI_RESPONSE_")) return "validation_error";
  if (code.startsWith("OPENAI_")) return "provider_error";
  if (name === "AbortError") return "client_disconnect";
  return "internal_error";
}
