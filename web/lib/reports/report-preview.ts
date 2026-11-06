/**
 * The part of a validated report that is final before the severity check and persistence: the
 * Verdict, the score and its band, and the first Critical Miss. The severity check only adds Critical
 * Misses after the first and never changes it (lib/reports/severity-check.ts), and the score is
 * calibrated inside validation, so the wait screen can show these while the tail runs. The stream
 * sends it as `{ type: "preview", ...ReportPreview }`; only the `complete` event is the report.
 */
export interface ReportPreview {
  first_impression: string;
  score: number;
  score_label: string;
  critical_miss: {
    fix: string;
    why: string;
    evidence: { excerpt: string; section: string };
  } | null;
}

export function reportPreview(payload: unknown): ReportPreview | null {
  const report = payload as Record<string, any> | null;
  if (!report || typeof report !== "object") return null;
  // The worklist report (contract v3): the verdict and the band are final after validation; it has no Critical Miss.
  if (report.contract_version === "v3") {
    if (typeof report.verdict !== "string" || typeof report.score !== "number" || typeof report.score_label !== "string") return null;
    return { first_impression: report.verdict, score: report.score, score_label: report.score_label, critical_miss: null };
  }
  if (typeof report.first_impression !== "string" || typeof report.score !== "number" || typeof report.score_label !== "string") return null;
  const first = Array.isArray(report.top_fixes) ? report.top_fixes[0] : null;
  const evidence = first?.evidence;
  const excerpt = typeof evidence === "string" ? evidence : typeof evidence?.excerpt === "string" ? evidence.excerpt : "";
  const criticalMiss = first && typeof first.fix === "string" && typeof first.why === "string"
    ? { fix: first.fix, why: first.why, evidence: { excerpt, section: typeof evidence?.section === "string" ? evidence.section : "" } }
    : null;
  return { first_impression: report.first_impression, score: report.score, score_label: report.score_label, critical_miss: criticalMiss };
}
