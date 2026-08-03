import crypto from "node:crypto";
import type {
  GenerationAccessReservation,
  GenerationAccessRpcClient,
} from "../billing/generationAccess";
import { buildGroundedReportTrustMetadata } from "./report-trust";

type AtomicReportResult = {
  reportId: string;
  reportDigest: string;
  idempotent: boolean;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => JSON.stringify(entry) !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function digest(value: unknown) {
  return crypto.createHash("sha256").update(stableJson(value)).digest("hex");
}

function resumePreview(text: string) {
  let preview = text.slice(0, 200).trim();
  const lastSpace = preview.lastIndexOf(" ");
  if (lastSpace > 150) preview = `${preview.slice(0, lastSpace)}...`;
  else if (text.length > 200) preview += "...";
  return preview.slice(0, 200);
}

function firstRecord(value: unknown): Record<string, unknown> | null {
  const record = Array.isArray(value) ? value[0] : value;
  return record && typeof record === "object" ? record as Record<string, unknown> : null;
}

function finalizedResult(value: unknown, expectedDigest: string): AtomicReportResult | null {
  const record = firstRecord(value);
  const reportId = typeof record?.report_id === "string" ? record.report_id : "";
  const returnedDigest = typeof record?.report_digest === "string"
    ? record.report_digest
    : expectedDigest;
  if (
    record?.status !== "committed"
    || record?.report_final !== true
    || !UUID_PATTERN.test(reportId)
    || returnedDigest !== expectedDigest
  ) return null;
  return {
    reportId,
    reportDigest: expectedDigest,
    idempotent: record.idempotent === true || record.action !== "committed",
  };
}

function finalizationError(message: string, accessConsumed: boolean | null = null) {
  const error = new Error(message) as Error & {
    code: string;
    httpStatus: number;
    accessConsumed: boolean | null;
  };
  error.code = "REPORT_FINALIZATION_FAILED";
  error.httpStatus = 503;
  error.accessConsumed = accessConsumed;
  return error;
}

export function buildAtomicGeneratedReport(input: {
  reservation: GenerationAccessReservation;
  userId: string;
  payload: any;
  resumeText: string;
  savedJobId?: string | null;
  jobDescriptionText?: string | null;
}) {
  if (
    !input.reservation.reservationId
    || input.reservation.userId !== input.userId
    || input.reservation.entitlementKind === "anonymous_free"
    || input.reservation.entitlementKind === "bypass"
  ) throw finalizationError("The report reservation cannot be finalized atomically.");

  const trust = buildGroundedReportTrustMetadata(input.payload, input.userId);
  const resumeHash = digest(input.resumeText);
  const reportDigest = digest({
    reservationId: input.reservation.reservationId,
    userId: input.userId,
    resumeHash,
    savedJobId: input.savedJobId || null,
    jobDescriptionText: input.jobDescriptionText || null,
    report: input.payload,
    trust,
  });
  return {
    reportDigest,
    args: {
      p_user_id: input.userId,
      p_reservation_id: input.reservation.reservationId,
      p_report_digest: reportDigest,
      p_resume_hash: resumeHash,
      p_score: input.payload.score,
      p_score_label: input.payload.score_label || null,
      p_report_json: input.payload,
      p_evidence_json: trust.evidence_json,
      p_evidence_version: trust.evidence_version,
      p_evidence_summary: trust.evidence_summary,
      p_confidence_band: trust.confidence_band,
      p_resume_preview: resumePreview(input.resumeText),
      p_job_description_text: input.jobDescriptionText || null,
      p_target_role: input.payload.job_alignment?.role_fit?.best_fit_roles?.[0] || null,
      p_saved_job_id: input.savedJobId || null,
    },
  };
}

export async function finalizeAuthenticatedGeneratedReport(input: {
  admin: GenerationAccessRpcClient;
  reservation: GenerationAccessReservation;
  userId: string;
  payload: any;
  resumeText: string;
  savedJobId?: string | null;
  jobDescriptionText?: string | null;
}): Promise<AtomicReportResult> {
  const built = buildAtomicGeneratedReport(input);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data, error } = await input.admin.rpc("finalize_generation_report", built.args);
      if (!error) {
        const result = finalizedResult(data, built.reportDigest);
        if (result) return result;
      }
    } catch {
      // Retry the idempotent transaction, then inspect authoritative finality.
    }
  }

  try {
    const { data, error } = await input.admin.rpc("get_generation_access_status", {
      p_user_id: input.userId,
      p_reservation_id: input.reservation.reservationId!,
    });
    if (!error) {
      const result = finalizedResult(data, built.reportDigest);
      if (result) return { ...result, idempotent: true };
      const record = firstRecord(data);
      const consumed = record?.status === "committed"
        ? true
        : record?.status === "released" || record?.status === "expired"
          ? false
          : null;
      throw finalizationError("The report could not be finalized safely.", consumed);
    }
  } catch (error) {
    if ((error as { code?: unknown })?.code === "REPORT_FINALIZATION_FAILED") throw error;
  }
  throw finalizationError("The report finalization status could not be confirmed.");
}
