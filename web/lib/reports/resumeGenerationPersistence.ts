import crypto from "node:crypto";
import type { maybeCreateSupabaseServerClient } from "../supabase/serverClient";
import { logError, logWarn } from "../observability/logger";

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof maybeCreateSupabaseServerClient>>
>;

type PersistenceContext = {
  requestId: string;
  route: string;
  userIdForLogs?: string;
};

function nowIso() {
  return new Date().toISOString();
}

function hashResumeText(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function reportPersistenceError() {
  const error = new Error("We could not safely save this report. Please try again.") as Error & {
    code: string;
    httpStatus: number;
  };
  error.code = "REPORT_PERSISTENCE_FAILED";
  error.httpStatus = 503;
  return error;
}

function buildReportTrustMetadata(payload: any) {
  const topFixes = Array.isArray(payload?.top_fixes) ? payload.top_fixes : [];
  const evidence = topFixes
    .map((fix: any) => ({
      fix: fix?.fix || "",
      confidence: fix?.confidence || "medium",
      impact_level: fix?.impact_level || "medium",
      effort: fix?.effort || "moderate",
      excerpt: typeof fix?.evidence === "string" ? fix.evidence : fix?.evidence?.excerpt || "",
      section: typeof fix?.evidence === "string"
        ? fix?.section_ref || "Resume"
        : fix?.evidence?.section || fix?.section_ref || "Resume",
    }))
    .filter((item: any) => item.fix || item.excerpt);

  const confidenceValues = evidence.map((item: any) => item.confidence);
  const confidenceBand = confidenceValues.includes("low")
    ? "low"
    : confidenceValues.includes("medium")
      ? "medium"
      : evidence.length > 0
        ? "high"
        : null;

  return {
    evidence_json: evidence.length > 0 ? evidence : null,
    evidence_version: payload?.contract_version || "v2",
    evidence_summary: evidence.length > 0
      ? `${evidence.length} grounded fix${evidence.length === 1 ? "" : "es"} with ${confidenceBand || "medium"} overall confidence.`
      : null,
    confidence_band: confidenceBand,
  };
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function resolveUserSavedJobId(
  supabase: SupabaseServerClient,
  userId: string,
  value: string | null
) {
  if (!value || !UUID_PATTERN.test(value)) return null;

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("id", value)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id as string;
}

export async function persistGeneratedResumeReport(input: {
  supabase: SupabaseServerClient;
  userId: string;
  resumeText: string;
  jobDescription: string | null | undefined;
  savedJobId: string | null;
  payload: any;
  context: PersistenceContext;
}) {
  let preview = input.resumeText.slice(0, 200).trim();
  const lastSpace = preview.lastIndexOf(" ");
  if (lastSpace > 150) preview = preview.slice(0, lastSpace) + "...";
  else if (input.resumeText.length > 200) preview += "...";

  const reportId = crypto.randomUUID();
  const { error: reportInsertError } = await input.supabase.from("reports").insert({
    id: reportId,
    user_id: input.userId,
    resume_hash: hashResumeText(input.resumeText),
    score: input.payload.score,
    score_label: input.payload.score_label || null,
    report_json: input.payload,
    ...buildReportTrustMetadata(input.payload),
    ...(input.savedJobId ? { saved_job_id: input.savedJobId } : {}),
    resume_preview: preview,
    job_description_text: input.jobDescription || null,
    target_role: input.payload.job_alignment?.role_fit?.best_fit_roles?.[0] || null,
    created_at: nowIso(),
  });

  if (reportInsertError) {
    logError({
      msg: "report.persistence_failed",
      request_id: input.context.requestId,
      route: input.context.route,
      user_id: input.context.userIdForLogs,
      outcome: "provider_error",
      err: {
        name: "ReportPersistenceError",
        message: "Report insert failed",
        code: String(reportInsertError.code || "REPORT_INSERT_FAILED"),
      },
    });
    throw reportPersistenceError();
  }

  if (input.savedJobId) {
    const { error: jobUpdateError } = await input.supabase
      .from("saved_jobs")
      .update({ latest_report_id: reportId, updated_at: nowIso() })
      .eq("id", input.savedJobId)
      .eq("user_id", input.userId);
    if (jobUpdateError) {
      logWarn({
        msg: "saved_job.report_link_failed",
        request_id: input.context.requestId,
        route: input.context.route,
        user_id: input.context.userIdForLogs,
        outcome: "provider_error",
        err: {
          name: "SavedJobUpdateError",
          message: "Saved job link update failed",
          code: String(jobUpdateError.code || "SAVED_JOB_UPDATE_FAILED"),
        },
      });
    }
  }

  return reportId;
}

export async function rollbackGeneratedResumeReport(input: {
  supabase: SupabaseServerClient;
  userId: string;
  reportId: string;
  context: PersistenceContext;
}) {
  const { error: rollbackError } = await input.supabase
    .from("reports")
    .delete()
    .eq("id", input.reportId)
    .eq("user_id", input.userId);
  if (!rollbackError) return;

  logError({
    msg: "report.rollback_failed",
    request_id: input.context.requestId,
    route: input.context.route,
    user_id: input.context.userIdForLogs,
    outcome: "internal_error",
    err: {
      name: "ReportRollbackError",
      message: "Report rollback failed",
      code: String(rollbackError.code || "REPORT_ROLLBACK_FAILED"),
    },
  });
}
