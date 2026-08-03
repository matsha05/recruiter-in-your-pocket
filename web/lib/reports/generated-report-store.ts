import crypto from "crypto";
import { logError, logWarn } from "../observability/logger";
import { buildGroundedReportTrustMetadata } from "./report-trust";

type StoreContext = { request_id: string; route: string; user_id?: string };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HASH_PATTERN = /^[0-9a-f]{64}$/;

export async function resolveUserSavedJobId(supabase: any, userId: string, value: string | null) {
  if (!value || !UUID_PATTERN.test(value)) return null;
  const { data, error } = await supabase.from("saved_jobs").select("id")
    .eq("id", value).eq("user_id", userId).maybeSingle();
  return error || !data?.id ? null : data.id as string;
}

export async function ownedStoredReportExists(admin: any, userId: string, reportId: string) {
  if (!admin) throw persistenceError(reportId);
  if (!userId || !UUID_PATTERN.test(reportId)) return false;
  const { data, error } = await admin.from("reports").select("id")
    .eq("id", reportId).eq("user_id", userId).maybeSingle();
  if (error) throw persistenceError(reportId);
  return data?.id === reportId;
}

function persistenceError(reportId?: string) {
  const error = new Error("We could not safely save this report.") as Error & {
    code: string;
    httpStatus: number;
    reportId?: string;
  };
  error.code = "REPORT_PERSISTENCE_FAILED";
  error.httpStatus = 503;
  error.reportId = reportId;
  return error;
}

function reportRollbackError(cause?: unknown) {
  const error = new Error("We could not confirm report cleanup.") as Error & {
    code: string;
    httpStatus: number;
    cause?: unknown;
  };
  error.code = "REPORT_ROLLBACK_UNCONFIRMED";
  error.httpStatus = 503;
  error.cause = cause;
  return error;
}

function resumePreview(text: string) {
  let preview = text.slice(0, 200).trim();
  const lastSpace = preview.lastIndexOf(" ");
  if (lastSpace > 150) preview = `${preview.slice(0, lastSpace)}...`;
  else if (text.length > 200) preview += "...";
  return preview;
}

export async function persistGeneratedReport(input: {
  supabase: any;
  userId: string;
  payload: any;
  resumeText: string;
  savedJobId?: string | null;
  jobDescriptionText?: string | null;
  context: StoreContext;
}) {
  const reportId = crypto.randomUUID();
  const reportRow = {
    id: reportId,
    user_id: input.userId,
    resume_hash: crypto.createHash("sha256").update(input.resumeText).digest("hex"),
    score: input.payload.score,
    score_label: input.payload.score_label || null,
    report_json: input.payload,
    ...buildGroundedReportTrustMetadata(input.payload, input.userId),
    ...(input.savedJobId ? { saved_job_id: input.savedJobId } : {}),
    resume_preview: resumePreview(input.resumeText),
    job_description_text: input.jobDescriptionText || null,
    target_role: input.payload.job_alignment?.role_fit?.best_fit_roles?.[0] || null,
    created_at: new Date().toISOString(),
  };
  try {
    const { error: reportInsertError } = await input.supabase.from("reports").insert(reportRow);
    if (reportInsertError) throw reportInsertError;
  } catch (cause: any) {
    logError({
      msg: "report.persistence_failed",
      ...input.context,
      outcome: "provider_error",
      err: {
        name: "ReportPersistenceError",
        message: "Report insert failed",
        code: String(cause?.code || "REPORT_INSERT_FAILED"),
      },
    });
    throw persistenceError(reportId);
  }
  if (input.savedJobId) {
    try {
      const { error } = await input.supabase.from("saved_jobs")
        .update({ latest_report_id: reportId, updated_at: new Date().toISOString() })
        .eq("id", input.savedJobId).eq("user_id", input.userId);
      if (error) throw error;
    } catch (cause: any) {
      logWarn({
        msg: "saved_job.report_link_failed",
        ...input.context,
        outcome: "provider_error",
        err: { name: "SavedJobUpdateError", message: "Saved job link update failed", code: String(cause?.code || "SAVED_JOB_UPDATE_FAILED") },
      });
    }
  }
  return reportId;
}

export async function rollbackGeneratedReport(input: {
  supabase: any;
  userId: string;
  reportId: string;
  context: StoreContext;
}) {
  try {
    const { error, count } = await input.supabase.from("reports").delete({ count: "exact" })
      .eq("id", input.reportId).eq("user_id", input.userId);
    if (error || typeof count !== "number") throw error || new Error("Rollback count unavailable");
    return { confirmed: true as const, deletedCount: count };
  } catch (cause: any) {
    logError({
      msg: "report.rollback_failed",
      ...input.context,
      outcome: "internal_error",
      err: { name: "ReportRollbackError", message: "Report rollback failed", code: String(cause?.code || "REPORT_ROLLBACK_FAILED") },
    });
    throw reportRollbackError(cause);
  }
}

export async function persistReceiptValidatedReport(input: {
  admin: any;
  userId: string;
  payload: any;
  receiptHash: string;
  receiptExpiresAt: string;
  resumeHash?: string;
  createdAt?: string;
}) {
  const reportId = crypto.randomUUID();
  const serialized = JSON.stringify(input.payload);
  const resumeHash = input.resumeHash
    || crypto.createHash("sha256").update(serialized).digest("hex");
  const createdAt = input.createdAt || new Date().toISOString();
  if (!HASH_PATTERN.test(resumeHash) || !Number.isFinite(Date.parse(createdAt))) {
    throw persistenceError();
  }
  const trust = buildGroundedReportTrustMetadata(input.payload, input.userId);
  const preview = String(
    input.payload.summary || input.payload.score_comment_short || input.payload.score_comment_long || "Resume report",
  ).trim().slice(0, 200);
  if (!input.admin) throw persistenceError();
  const { data, error } = await input.admin.rpc("claim_anonymous_report_receipt", {
    p_receipt_hash: input.receiptHash,
    p_expires_at: input.receiptExpiresAt,
    p_user_id: input.userId,
    p_report_id: reportId,
    p_resume_hash: resumeHash,
    p_score: input.payload.score,
    p_score_label: input.payload.score_label || null,
    p_report_json: input.payload,
    p_evidence_json: trust.evidence_json,
    p_evidence_version: trust.evidence_version,
    p_resume_preview: preview || "Resume report",
    p_target_role: input.payload.job_alignment?.role_fit?.best_fit_roles?.[0] || null,
    p_created_at: createdAt,
  });
  if (error) throw persistenceError();
  const result = Array.isArray(data) ? data[0] : data;
  if ((result?.status === "created" || result?.status === "idempotent") && typeof result.report_id === "string") {
    return result.report_id;
  }
  if (result?.status === "consumed") {
    const consumed = new Error("This anonymous report has already been saved to an account.") as Error & {
      code: string;
      httpStatus: number;
    };
    consumed.code = "REPORT_RECEIPT_CONSUMED";
    consumed.httpStatus = 409;
    throw consumed;
  }
  throw persistenceError();
}
