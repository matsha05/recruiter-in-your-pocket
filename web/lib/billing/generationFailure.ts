import type { AnonymousFreeCookieMeta } from "./generationAccess";
import {
  releaseGenerationAccess,
  releaseReasonForError,
  type GenerationAccessReservation,
  type GenerationAccessRpcClient,
} from "./generationAccess";
import { logError } from "../observability/logger";
import { generationDispositionIsUnknown } from "./generation-cancellation";

export type GenerationFailureDisposition = {
  attemptConsumed: boolean | undefined;
  attemptDisposition: "consumed" | "restored" | "unknown" | "not_started";
  creditRestored: boolean;
  anonymousCookieMeta: AnonymousFreeCookieMeta | null;
  releaseError: unknown | null;
  retryMessage: string;
};

function restoredAnonymousCookie(reservation: GenerationAccessReservation) {
  if (!reservation.anonymousCookieMeta) return null;
  return {
    used: Math.max(0, reservation.anonymousCookieMeta.used - 1),
    last_free_ts: null,
    reset_month: reservation.anonymousCookieMeta.reset_month,
  } satisfies AnonymousFreeCookieMeta;
}

export async function settleGenerationFailure(input: {
  reservation: GenerationAccessReservation | null;
  admin: GenerationAccessRpcClient | null;
  error: unknown;
  attemptConsumed: boolean;
  release?: typeof releaseGenerationAccess;
}): Promise<GenerationFailureDisposition> {
  const { reservation } = input;
  if (generationDispositionIsUnknown(input.error)) {
    return {
      attemptConsumed: undefined,
      attemptDisposition: "unknown",
      creditRestored: false,
      anonymousCookieMeta: reservation?.anonymousCookieMeta || null,
      releaseError: null,
      retryMessage: "We could not confirm this attempt's status. Check History and your remaining reports before retrying.",
    };
  }
  if (input.attemptConsumed) {
    return {
      attemptConsumed: true,
      attemptDisposition: "consumed",
      creditRestored: false,
      anonymousCookieMeta: reservation?.anonymousCookieMeta || null,
      releaseError: null,
      retryMessage: "This report attempt was used because generation had already started.",
    };
  }
  if (!reservation) {
    return {
      attemptConsumed: false,
      attemptDisposition: "not_started",
      creditRestored: false,
      anonymousCookieMeta: null,
      releaseError: null,
      retryMessage: "",
    };
  }

  try {
    await (input.release || releaseGenerationAccess)(
      reservation,
      input.admin,
      releaseReasonForError(input.error),
    );
    return {
      attemptConsumed: false,
      attemptDisposition: "restored",
      creditRestored: true,
      anonymousCookieMeta: restoredAnonymousCookie(reservation),
      releaseError: null,
      retryMessage: "Your report credit was restored; please try again.",
    };
  } catch (releaseError) {
    return {
      attemptConsumed: undefined,
      attemptDisposition: "unknown",
      creditRestored: false,
      anonymousCookieMeta: reservation.anonymousCookieMeta,
      releaseError,
      retryMessage: "We could not confirm this attempt's status. Check History and your remaining reports before retrying.",
    };
  }
}

export function appendFailureDisposition(message: string, disposition: GenerationFailureDisposition) {
  const base = message.trim()
    .replace(/\s*(?:Your report credit was restored; please try again|This report attempt was used because generation had already started|We could not confirm that your report credit was restored\. Check your remaining reports before retrying|We could not confirm this attempt's status\. Check History and your remaining reports before retrying)[.!?]*$/iu, "")
    .replace(/[.!?]+$/u, "");
  return disposition.retryMessage ? `${base}. ${disposition.retryMessage}` : `${base}.`;
}

export function generationFailureCompletion(error: any) {
  const code = String(error?.code || "INTERNAL_SERVER_ERROR");
  if (code === "CLIENT_CANCELED") return { status: 499, outcome: "client_disconnect" as const };
  if (code === "OPENAI_TIMEOUT") return { status: 504, outcome: "timeout" as const };
  if (code === "OPENAI_NETWORK_ERROR") return { status: 502, outcome: "network_error" as const };
  if (code === "OPENAI_HTTP_ERROR") return { status: error?.httpStatus || 502, outcome: "provider_error" as const };
  if (code.startsWith("OPENAI_RESPONSE_")) return { status: error?.httpStatus || 502, outcome: "schema_invalid" as const };
  const status = typeof error?.httpStatus === "number" ? error.httpStatus : 500;
  return {
    status,
    outcome: status === 400 ? "validation_error" as const : status === 429 ? "rate_limited" as const : "internal_error" as const,
  };
}

export function logGenerationReleaseFailure(
  disposition: GenerationFailureDisposition,
  context: { request_id: string; route: string; user_id?: string },
) {
  const error: any = disposition.releaseError;
  if (!error) return;
  logError({
    msg: "billing.access_release_failed", ...context, outcome: "internal_error",
    err: {
      name: error?.name || "GenerationAccessError",
      message: error?.message || "Access release failed",
      code: String(error?.code || "ACCESS_RELEASE_FAILED"),
    },
  });
}
