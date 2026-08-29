import { ResumeFeedbackResponseSchema } from "./resume-report-schema";

const invalidResumeCompletion = {
  ok: false as const,
  errorCode: "STREAM_COMPLETION_INVALID",
  message: "The report could not be completed safely. Please try again.",
  accessConsumed: true,
  attemptConsumed: true,
  attemptDisposition: "consumed" as const,
  creditRestored: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseResumeStreamCompletion(event: unknown, mode: string) {
  if (!isRecord(event)) return { valid: false as const, failure: invalidResumeCompletion };
  if (mode !== "resume") return { valid: true as const, report: event.data };
  if (event.ok !== true || !isRecord(event.data) || event.data.contract_version !== "v2") {
    return { valid: false as const, failure: invalidResumeCompletion };
  }

  const parsedReport = ResumeFeedbackResponseSchema.safeParse(event.data);
  return parsedReport.success
    ? { valid: true as const, report: parsedReport.data }
    : { valid: false as const, failure: invalidResumeCompletion };
}
