import crypto from "node:crypto";
import {
  FREE_RUN_LIMIT,
  getCurrentMonthKey,
  type ParsedFreeMeta,
} from "../backend/freeCookie";
import { anonymousGenerationAccessBackend } from "./anonymousGenerationAccess";
import { assertGenerationCapacity } from "../operations/generationBudget";

export type GenerationReportKind = "resume_feedback" | "resume_ideas";
export type GenerationAccessTier = "free_full" | "pass_full" | "preview";
export type GenerationEntitlementKind =
  | "free"
  | "pass_credit"
  | "pass_unlimited"
  | "anonymous_free"
  | "bypass";

export type GenerationPassSnapshot = {
  id: string;
  tier: string;
  expires_at: string | null;
  uses_remaining: number;
  created_at?: string | null;
};

export type AnonymousFreeCookieMeta = {
  used: number;
  last_free_ts: string | null;
  reset_month: string;
};

export type GenerationAccessReservation = {
  access: "full" | "preview";
  accessTier: GenerationAccessTier;
  entitlementKind: GenerationEntitlementKind | null;
  reservationId: string | null;
  userId: string | null;
  activePass: GenerationPassSnapshot | null;
  freeUsesRemaining: number;
  anonymousCookieMeta: AnonymousFreeCookieMeta | null;
  anonymousIdentityHash: string | null;
  anonymousMonthKey: string | null;
};

export type GenerationReleaseReason =
  | "provider_error"
  | "provider_timeout"
  | "validation_error"
  | "client_disconnect"
  | "delivery_error"
  | "internal_error";

type RpcError = { code?: string; message?: string } | null;

export type GenerationAccessRpcClient = {
  rpc(
    functionName: string,
    args: Record<string, unknown>
  ): PromiseLike<{ data: unknown; error: RpcError }>;
};

export class GenerationAccessError extends Error {
  code: string;
  httpStatus: number;

  constructor(code: string, message: string, httpStatus = 503) {
    super(message);
    this.name = "GenerationAccessError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const anonymousProviderStarted = new WeakSet<GenerationAccessReservation>();

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

function firstRecord(value: unknown): Record<string, unknown> | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || typeof candidate !== "object") return null;
  return candidate as Record<string, unknown>;
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

function unavailableFromRpc(operation: "reserve" | "commit" | "release", _error?: RpcError) {
  const code = operation === "reserve"
    ? "ACCESS_RESERVATION_FAILED"
    : operation === "commit"
      ? "ACCESS_COMMIT_FAILED"
      : "ACCESS_RELEASE_FAILED";

  return new GenerationAccessError(
    code,
    `Report access could not be ${operation === "reserve" ? "reserved" : operation === "commit" ? "confirmed" : "released"}. Please try again.`
  );
}

export async function reserveGenerationAccess(input: {
  userId: string | null;
  admin: GenerationAccessRpcClient | null;
  reportKind: GenerationReportKind;
  bypass: boolean;
  freeMeta: ParsedFreeMeta;
  anonymousIdentityHash?: string | null;
  now?: () => Date;
  randomUUID?: () => string;
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
    const anonymousMonthKey = getCurrentMonthKey();
    if (!anonymousIdentityHash) {
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

    return {
      access: "full",
      accessTier: "free_full",
      entitlementKind: "anonymous_free",
      reservationId,
      userId: null,
      activePass: null,
      freeUsesRemaining: Math.max(0, anonymousFreeRemaining - 1),
      anonymousCookieMeta: {
        used: Math.min(FREE_RUN_LIMIT, freeUsed + 1),
        last_free_ts: reservedAt,
        reset_month: getCurrentMonthKey(),
      },
      anonymousIdentityHash,
      anonymousMonthKey,
    };
  }

  if (!input.admin) {
    throw new GenerationAccessError(
      "ACCESS_DEPENDENCY_UNAVAILABLE",
      "Report access is temporarily unavailable. Please try again in a moment."
    );
  }

  const reservationId = randomUUID();
  const { data, error } = await input.admin.rpc("reserve_generation_access", {
    p_user_id: input.userId,
    p_reservation_id: reservationId,
    p_report_kind: input.reportKind,
  });

  if (error) throw unavailableFromRpc("reserve", error);

  const result = firstRecord(data);
  if (!result || typeof result.allowed !== "boolean") {
    throw unavailableFromRpc("reserve");
  }

  if (!result.allowed) {
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

  const returnedReservationId = typeof result.reservation_id === "string"
    ? result.reservation_id
    : null;
  const accessTier = result.access_tier;
  const entitlementKind = result.entitlement_kind;

  if (
    returnedReservationId !== reservationId
    || (accessTier !== "free_full" && accessTier !== "pass_full")
    || (entitlementKind !== "free" && entitlementKind !== "pass_credit" && entitlementKind !== "pass_unlimited")
  ) {
    throw unavailableFromRpc("reserve");
  }

  return {
    access: "full",
    accessTier,
    entitlementKind,
    reservationId,
    userId: input.userId,
    activePass: parsePass(result.pass),
    freeUsesRemaining: numberOrZero(result.free_uses_remaining),
    anonymousCookieMeta: null,
    anonymousIdentityHash: null,
    anonymousMonthKey: null,
  };
}

export async function commitGenerationAccess(
  reservation: GenerationAccessReservation,
  admin: GenerationAccessRpcClient | null
) {
  if (reservation.entitlementKind === "anonymous_free") {
    if (
      !reservation.reservationId
      || !reservation.anonymousIdentityHash
      || !reservation.anonymousMonthKey
    ) {
      throw unavailableFromRpc("commit");
    }

    let committed = false;
    try {
      committed = await anonymousGenerationAccessBackend.commit({
        identityHash: reservation.anonymousIdentityHash,
        monthKey: reservation.anonymousMonthKey,
        reservationId: reservation.reservationId,
      });
    } catch {
      throw unavailableFromRpc("commit");
    }
    if (!committed) throw unavailableFromRpc("commit");
    return;
  }

  if (!reservation.userId || !reservation.reservationId) return;
  if (!admin) throw unavailableFromRpc("commit");

  const { data, error } = await admin.rpc("commit_generation_access", {
    p_user_id: reservation.userId,
    p_reservation_id: reservation.reservationId,
  });

  if (error) throw unavailableFromRpc("commit", error);
  const result = firstRecord(data);
  if (!result || result.ok !== true || result.status !== "committed") {
    throw unavailableFromRpc("commit");
  }
}

/**
 * Anonymous access becomes attempt-based once provider work begins. Committing
 * the shared hold before the costly call prevents deliberate disconnects or
 * response failures from refunding a replayable anonymous request.
 * Authenticated reservations keep their post-validation lifecycle.
 */
export async function markGenerationProviderCallStarted(
  reservation: GenerationAccessReservation
) {
  if (!isMockGenerationProviderEnabled()) {
    await assertGenerationCapacity();
  }
  if (reservation.entitlementKind !== "anonymous_free") return;
  await commitGenerationAccess(reservation, null);
  anonymousProviderStarted.add(reservation);
}

export async function releaseGenerationAccess(
  reservation: GenerationAccessReservation | null,
  admin: GenerationAccessRpcClient | null,
  reason: GenerationReleaseReason
) {
  if (reservation?.entitlementKind === "anonymous_free") {
    if (anonymousProviderStarted.has(reservation)) return;
    if (
      !reservation.reservationId
      || !reservation.anonymousIdentityHash
      || !reservation.anonymousMonthKey
    ) {
      throw unavailableFromRpc("release");
    }

    let released = false;
    try {
      released = await anonymousGenerationAccessBackend.release({
        identityHash: reservation.anonymousIdentityHash,
        monthKey: reservation.anonymousMonthKey,
        reservationId: reservation.reservationId,
      });
    } catch {
      throw unavailableFromRpc("release");
    }
    if (!released) throw unavailableFromRpc("release");
    return;
  }

  if (!reservation?.userId || !reservation.reservationId) return;
  if (!admin) throw unavailableFromRpc("release");

  const { data, error } = await admin.rpc("release_generation_access", {
    p_user_id: reservation.userId,
    p_reservation_id: reservation.reservationId,
    p_reason_code: reason,
  });

  if (error) throw unavailableFromRpc("release", error);
  const result = firstRecord(data);
  if (!result || result.ok !== true) throw unavailableFromRpc("release");
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
