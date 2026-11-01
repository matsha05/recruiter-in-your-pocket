/**
 * The "Was this the right thing to fix first?" answer (plan item 2.6), shared by
 * the report and /api/report-feedback. It carries the model's Critical Miss
 * wording and the reader's answer, never the resume or its quoted line.
 */

export interface ReportFeedback {
  reportId?: string;
  criticalMiss: string;
  right: boolean;
  note?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const MAX_TEXT = 600;

function text(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/gu, " ") : "";
}

export function parseReportFeedback(value: unknown): ReportFeedback | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const criticalMiss = text(body.criticalMiss);
  const note = text(body.note);
  const reportId = text(body.reportId);
  if (typeof body.right !== "boolean" || !criticalMiss || criticalMiss.length > MAX_TEXT || note.length > MAX_TEXT) return null;
  if (reportId && !UUID.test(reportId)) return null;
  return {
    reportId: reportId || undefined,
    criticalMiss,
    right: body.right,
    note: note || undefined,
  };
}

/** Sends the answer. Resolves false when it wasn't recorded, so the report can say so. */
export async function sendReportFeedback(feedback: ReportFeedback, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await fetchImpl("/api/report-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    });
    return response.ok;
  } catch {
    return false;
  }
}
