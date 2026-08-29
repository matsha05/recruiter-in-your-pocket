import crypto from "node:crypto";
import {
  applyAnonymousCommitCookie,
  GenerationAccessError,
  type GenerationAccessReservation,
} from "../billing/generationAccess";
import { anonymousGenerationAccessBackend } from "../billing/anonymousGenerationAccess";
import {
  createAnonymousReportRecovery,
  loadAnonymousReportRecovery,
} from "./anonymous-report-recovery";

function unavailable(accessConsumed: boolean | null = null) {
  return new GenerationAccessError(
    "ANONYMOUS_REPORT_FINALIZATION_FAILED",
    "The completed report could not be stored safely for recovery.",
    503,
    accessConsumed,
  );
}

export async function finalizeAnonymousGeneratedReport(input: {
  reservation: GenerationAccessReservation;
  payload: unknown;
  resumeText: string;
  recoveryId: string;
}) {
  const {
    reservationId,
    anonymousIdentityHash: identityHash,
    anonymousShadowHash: shadowHash,
    anonymousMonthKey: monthKey,
  } = input.reservation;
  if (
    input.reservation.entitlementKind !== "anonymous_free"
    || !reservationId
    || !identityHash
    || !shadowHash
    || !monthKey
  ) throw unavailable(false);

  const recovery = createAnonymousReportRecovery({
    reservationId,
    identityHash,
    shadowHash,
    monthKey,
    report: input.payload,
    resumeHash: crypto.createHash("sha256").update(input.resumeText).digest("hex"),
    recoveryId: input.recoveryId,
  });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const outcome = await anonymousGenerationAccessBackend.completeWithRecovery({
        identityHash,
        shadowHash,
        monthKey,
        reservationId,
        recovery,
      });
      if (outcome === "created" || outcome === "idempotent") {
        applyAnonymousCommitCookie(input.reservation);
        return recovery.envelope;
      }
      throw unavailable(null);
    } catch (error) {
      if (error instanceof GenerationAccessError) throw error;
    }
  }

  try {
    const stored = await loadAnonymousReportRecovery({
      recoveryId: recovery.recoveryId,
      identityHash,
    });
    if (stored?.reservation_id === reservationId && stored.report_digest === recovery.envelope.report_digest) {
      applyAnonymousCommitCookie(input.reservation);
      return stored;
    }
    const state = await anonymousGenerationAccessBackend.inspect({ identityHash, shadowHash, monthKey });
    throw unavailable(state.status === "committed" ? true : state.status === "reserved" ? false : null);
  } catch (error) {
    if (error instanceof GenerationAccessError) throw error;
    throw unavailable();
  }
}
