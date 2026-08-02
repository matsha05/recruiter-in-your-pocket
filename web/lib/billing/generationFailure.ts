import type { AnonymousFreeCookieMeta } from "./generationAccess";
import {
  releaseGenerationAccess,
  releaseReasonForError,
  type GenerationAccessReservation,
  type GenerationAccessRpcClient,
} from "./generationAccess";
import { logError } from "../observability/logger";

export type GenerationFailureDisposition = {
  attemptConsumed: boolean;
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
  if (input.attemptConsumed) {
    return {
      attemptConsumed: true,
      creditRestored: false,
      anonymousCookieMeta: reservation?.anonymousCookieMeta || null,
      releaseError: null,
      retryMessage: "This report attempt was used because generation had already started.",
    };
  }
  if (!reservation) {
    return {
      attemptConsumed: false,
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
      creditRestored: true,
      anonymousCookieMeta: restoredAnonymousCookie(reservation),
      releaseError: null,
      retryMessage: "Your report credit was restored; please try again.",
    };
  } catch (releaseError) {
    const anonymousUnavailable = reservation.entitlementKind === "anonymous_free";
    return {
      attemptConsumed: anonymousUnavailable,
      creditRestored: false,
      anonymousCookieMeta: anonymousUnavailable ? reservation.anonymousCookieMeta : null,
      releaseError,
      retryMessage: "We could not confirm that your report credit was restored. Check your remaining reports before retrying.",
    };
  }
}

export function appendFailureDisposition(message: string, disposition: GenerationFailureDisposition) {
  const base = message.trim()
    .replace(/\s*(?:Your report credit was restored; please try again|This report attempt was used because generation had already started|We could not confirm that your report credit was restored\. Check your remaining reports before retrying)[.!?]*$/iu, "")
    .replace(/[.!?]+$/u, "");
  return disposition.retryMessage ? `${base}. ${disposition.retryMessage}` : `${base}.`;
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
