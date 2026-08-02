import crypto from "crypto";
import { logError, logWarn } from "../observability/logger";
import { buildGroundedReportTrustMetadata } from "./report-trust";

type StoreContext = { request_id: string; route: string; user_id?: string };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function resolveUserSavedJobId(supabase: any, userId: string, value: string | null) {
  if (!value || !UUID_PATTERN.test(value)) return null;
  const { data, error } = await supabase.from("saved_jobs").select("id")
    .eq("id", value).eq("user_id", userId).maybeSingle();
  return error || !data?.id ? null : data.id as string;
}

function persistenceError() {
  const error = new Error("We could not safely save this report. Your report credit was restored; please try again.") as Error & {
    code: string;
    httpStatus: number;
  };
  error.code = "REPORT_PERSISTENCE_FAILED";
  error.httpStatus = 503;
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
  const { error: reportInsertError } = await input.supabase.from("reports").insert({
    id: reportId,
    user_id: input.userId,
    resume_hash: crypto.createHash("sha256").update(input.resumeText).digest("hex"),
    score: input.payload.score,
    score_label: input.payload.score_label || null,
    report_json: input.payload,
    ...buildGroundedReportTrustMetadata(input.payload),
    ...(input.savedJobId ? { saved_job_id: input.savedJobId } : {}),
    resume_preview: resumePreview(input.resumeText),
    job_description_text: input.jobDescriptionText || null,
    target_role: input.payload.job_alignment?.role_fit?.best_fit_roles?.[0] || null,
    created_at: new Date().toISOString(),
  });
  if (reportInsertError) {
    logError({
      msg: "report.persistence_failed",
      ...input.context,
      outcome: "provider_error",
      err: {
        name: "ReportPersistenceError",
        message: "Report insert failed",
        code: String(reportInsertError.code || "REPORT_INSERT_FAILED"),
      },
    });
    throw persistenceError();
  }
  if (input.savedJobId) {
    const { error } = await input.supabase.from("saved_jobs")
      .update({ latest_report_id: reportId, updated_at: new Date().toISOString() })
      .eq("id", input.savedJobId).eq("user_id", input.userId);
    if (error) {
      logWarn({
        msg: "saved_job.report_link_failed",
        ...input.context,
        outcome: "provider_error",
        err: { name: "SavedJobUpdateError", message: "Saved job link update failed", code: String(error.code || "SAVED_JOB_UPDATE_FAILED") },
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
  const { error } = await input.supabase.from("reports").delete()
    .eq("id", input.reportId).eq("user_id", input.userId);
  if (error) {
    logError({
      msg: "report.rollback_failed",
      ...input.context,
      outcome: "internal_error",
      err: { name: "ReportRollbackError", message: "Report rollback failed", code: String(error.code || "REPORT_ROLLBACK_FAILED") },
    });
  }
}

export async function persistReceiptValidatedReport(input: {
  supabase: any;
  userId: string;
  payload: any;
}) {
  const reportId = crypto.randomUUID();
  const serialized = JSON.stringify(input.payload);
  const preview = String(
    input.payload.summary || input.payload.score_comment_short || input.payload.score_comment_long || "Resume report",
  ).trim().slice(0, 200);
  const { error } = await input.supabase.from("reports").insert({
    id: reportId,
    user_id: input.userId,
    resume_hash: crypto.createHash("sha256").update(serialized).digest("hex"),
    score: input.payload.score,
    score_label: input.payload.score_label || null,
    report_json: input.payload,
    ...buildGroundedReportTrustMetadata(input.payload),
    resume_preview: preview || "Resume report",
    target_role: input.payload.job_alignment?.role_fit?.best_fit_roles?.[0] || null,
    created_at: new Date().toISOString(),
  });
  if (error) throw persistenceError();
  return reportId;
}
