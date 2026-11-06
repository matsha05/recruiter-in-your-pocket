import { z } from "zod";
import { ResumeFeedbackResponseSchema } from "../validation/resume-report-schema";
import { WorklistReportSchema, isWorklistReport } from "../llm/worklist-schema";

export { isWorklistReport };

/**
 * Which report the resume route writes (Matt, November 5, 2026: the worklist report replaces the Critical
 * Miss report). RIYP_WORKLIST_REPORT: "0"/"false"/"off" writes the v2 report; unset or on writes the
 * worklist report. The flag is the kill switch for the launch, not a product setting.
 */
export const WORKLIST_REPORT_DEFAULT = false;

export function isWorklistReportEnabled(value = process.env.RIYP_WORKLIST_REPORT) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["1", "true", "on"].includes(normalized)) return true;
  if (["0", "false", "off"].includes(normalized)) return false;
  return WORKLIST_REPORT_DEFAULT;
}

export function resumePromptVersion() {
  return isWorklistReportEnabled() ? "resume_v3" : "resume_v2";
}

export function resumeSchemaVersion() {
  return isWorklistReportEnabled() ? "report_v3" : "report_v1";
}

/**
 * Any report a person can hold: a v2 Critical Miss report, which the saved reports are, or a worklist
 * report. Persistence, recovery and the client check the shape with this, so a saved v2 report keeps
 * opening after the worklist ships.
 */
export const AnyReportSchema = z.union([WorklistReportSchema, ResumeFeedbackResponseSchema]);
export type AnyReport = z.infer<typeof AnyReportSchema>;

export function parseAnyReport(value: unknown) {
  return isWorklistReport(value) ? WorklistReportSchema.safeParse(value) : ResumeFeedbackResponseSchema.safeParse(value);
}
