import crypto from "crypto";
import { ResumeFeedbackResponseSchema, type ResumeFeedbackResponse } from "../validation/schemas";

export const GROUNDED_REPORT_EVIDENCE_VERSION = "v3:source-grounded-signed";

type EvidenceItem = {
  fix: string;
  confidence: string;
  impact_level: string;
  effort: string;
  excerpt: string;
  section: string;
};

function signingSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required for stored report signing");
  return secret;
}

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

function evidenceItems(payload: ResumeFeedbackResponse): EvidenceItem[] {
  return (Array.isArray(payload.top_fixes) ? payload.top_fixes : [])
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
    .filter((item: EvidenceItem) => item.fix || item.excerpt);
}

function reportSignature(report: ResumeFeedbackResponse, userId: string, items: EvidenceItem[]) {
  return crypto.createHmac("sha256", signingSecret())
    .update(`stored-report-v1\n${userId}\n${stableJson(report)}\n${stableJson(items)}`)
    .digest("hex");
}

function signaturesMatch(supplied: unknown, expected: string) {
  if (typeof supplied !== "string" || !/^[a-f0-9]{64}$/u.test(supplied)) return false;
  return crypto.timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(expected, "hex"));
}

export function buildGroundedReportTrustMetadata(payload: unknown, userId: string) {
  if (!userId) throw new Error("A user ID is required for stored report signing");
  const report = ResumeFeedbackResponseSchema.parse(payload);
  const evidence = evidenceItems(report);
  const confidenceValues = evidence.map((item: any) => item.confidence);
  const confidence_band = confidenceValues.includes("low")
    ? "low"
    : confidenceValues.includes("medium") ? "medium" : evidence.length > 0 ? "high" : null;
  return {
    evidence_json: {
      items: evidence,
      signature: reportSignature(report, userId, evidence),
    },
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
  evidenceJson: unknown,
  userId: string,
): ResumeFeedbackResponse | null {
  if (evidenceVersion !== GROUNDED_REPORT_EVIDENCE_VERSION) return null;
  const parsed = ResumeFeedbackResponseSchema.safeParse(reportJson);
  if (!parsed.success || !userId || !evidenceJson || typeof evidenceJson !== "object" || Array.isArray(evidenceJson)) {
    return null;
  }
  const storedEvidence = evidenceJson as { items?: unknown; signature?: unknown };
  if (!Array.isArray(storedEvidence.items)) return null;
  const expected = reportSignature(parsed.data, userId, storedEvidence.items as EvidenceItem[]);
  return signaturesMatch(storedEvidence.signature, expected) ? parsed.data : null;
}
