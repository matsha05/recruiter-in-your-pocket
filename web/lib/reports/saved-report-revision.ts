import type { ReportData } from "../../components/workspace/report/ReportTypes";
import { ResumeFeedbackResponseSchema } from "../validation/resume-report-schema";

const REPORT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getSavedReportRevisionHref(reportId: string): string | null {
  return REPORT_ID_PATTERN.test(reportId)
    ? `/workspace?revision=${encodeURIComponent(reportId)}`
    : null;
}

export type SavedRevisionFailure = "invalid" | "signed_out" | "not_found" | "untrusted" | "error";
export type SavedRevisionResult =
  | { state: "ready"; baseline: ReportData }
  | { state: SavedRevisionFailure; baseline: null };

/** Ownership and report trust are checked by the authenticated report endpoint. */
export async function loadSavedReportRevision(reportId: string, signal: AbortSignal): Promise<SavedRevisionResult> {
  if (!getSavedReportRevisionHref(reportId)) return { state: "invalid", baseline: null };

  const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
    signal,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (response.status === 401) return { state: "signed_out", baseline: null };
  if (response.status === 403 || response.status === 404) return { state: "not_found", baseline: null };
  if (response.status === 409) return { state: "untrusted", baseline: null };
  if (!response.ok) return { state: "error", baseline: null };

  const payload = await response.json();
  const report = payload?.report;
  if (payload?.ok !== true || report?.report_id !== reportId || !ResumeFeedbackResponseSchema.safeParse(report).success) {
    return { state: "error", baseline: null };
  }

  // Validate the canonical contract, then preserve every original field for comparison.
  // Resume text and job-description metadata are deliberately outside this handoff.
  return { state: "ready", baseline: { ...report, id: reportId } };
}

export function savedRevisionErrorMessage(state: SavedRevisionFailure): string {
  switch (state) {
    case "invalid": return "This comparison link is incomplete. Open a saved report and choose Compare my revision.";
    case "signed_out": return "Sign in to the account that saved this report, then try again.";
    case "not_found": return "This report was deleted or is not available to this account. Choose another saved report or start a new one.";
    case "untrusted": return "This saved report cannot be used for comparison. Start a new report with your current resume.";
    default: return "We could not load the original report for comparison. Try again or start a new report.";
  }
}
