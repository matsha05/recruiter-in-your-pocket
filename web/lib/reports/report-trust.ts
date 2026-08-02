import { ResumeFeedbackResponseSchema, type ResumeFeedbackResponse } from "../validation/schemas";

export const GROUNDED_REPORT_EVIDENCE_VERSION = "v2:source-grounded";

export function buildGroundedReportTrustMetadata(payload: any) {
  const evidence = (Array.isArray(payload?.top_fixes) ? payload.top_fixes : [])
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
  const confidence_band = confidenceValues.includes("low")
    ? "low"
    : confidenceValues.includes("medium") ? "medium" : evidence.length > 0 ? "high" : null;
  return {
    evidence_json: evidence.length > 0 ? evidence : null,
    evidence_version: GROUNDED_REPORT_EVIDENCE_VERSION,
    evidence_summary: evidence.length > 0
      ? `${evidence.length} grounded fix${evidence.length === 1 ? "" : "es"} with ${confidence_band || "medium"} overall confidence.`
      : null,
    confidence_band,
  };
}

export function parseTrustedStoredReport(
  reportJson: unknown,
  evidenceVersion: unknown,
): ResumeFeedbackResponse | null {
  if (evidenceVersion !== GROUNDED_REPORT_EVIDENCE_VERSION) return null;
  const parsed = ResumeFeedbackResponseSchema.safeParse(reportJson);
  return parsed.success ? parsed.data : null;
}
