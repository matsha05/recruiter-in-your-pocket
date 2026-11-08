import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { getScoreLabel } from "../score-utils";
import { isWorklistReport, type WorklistCard, type WorklistReport } from "../llm/worklist-schema";
import { withCriticalFirst } from "./report-presentation";
import { parseStoredLineAnswers } from "./line-answers";
import { reconcileReport } from "./report-integrity";
import { blankAnswersFromStored, composeExample } from "./worklist-presentation";

/** The worklist report's content for the PDF (contract v3): the same order as the web report. */
export type WorklistForPdf = {
  verdict: string;
  write_up: string[];
  lifted_by_employer: boolean;
  cards: Array<WorklistCard & {
    /** The example with the person's answers in the blanks, kept with a saved report. */
    filled?: string;
  }>;
  fit: WorklistReport["fit"];
  /** Lines written to screening software, printed before anything else, as on the web report. */
  screener_text?: WorklistReport["screener_text"];
};

export type ReportForPdf = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  rewrites: Array<{ label?: string; original: string; better: string; enhancement_note?: string }>;
  next_steps: string[];
  score_label?: string;
  score_comment_short?: string;
  first_impression?: string;
  subscores?: { impact?: number; clarity?: number; story?: number; readability?: number };
  /**
   * `why` is present only when it is a reason; `questions` are the details to add, as on the web report.
   * `line` is the quoted resume line the fix marks, and `section` where it sits. `critical` is the
   * severity check's flag, Critical Misses first; a report without flags leaves it out.
   */
  top_fixes?: Array<{ fix?: string; why?: string; questions?: string[]; line?: string; section?: string; critical?: boolean;
    /** The reader's revised line, kept with the saved report (W3); printed under the marked line. */
    revised?: string }>;
  /** More than three Critical Misses; set only with three flagged. */
  more_critical?: boolean;
  /** Structural gaps shown in the opening read. */
  structural_gaps?: string[];
  job_alignment?: {
    positioning_suggestion?: string;
    role_fit?: {
      best_fit_roles?: string[];
      stretch_roles?: string[];
      seniority_read?: string;
      industry_signals?: string[];
      company_stage_fit?: string;
    };
  };
  /** Present for a worklist report; the v2 fields above are then empty and unused by the renderer. */
  worklist?: WorklistForPdf;
};

function clampScore(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(99, Math.round(numeric)));
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asTrimmedString(item))
    .filter((item): item is string => Boolean(item));
}

function asRewrites(value: unknown): ReportForPdf["rewrites"] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const original = asTrimmedString((item as { original?: unknown }).original);
    const better = asTrimmedString((item as { better?: unknown }).better);
    if (!original || !better) return [];

    const label = asTrimmedString((item as { label?: unknown }).label) || undefined;
    const enhancement_note =
      asTrimmedString((item as { enhancement_note?: unknown }).enhancement_note) || undefined;

    return [{ label, original, better, enhancement_note }];
  });
}

type SourceFix = NonNullable<ReportData["top_fixes"]>[number];

/** Fixes with the evidence the integrity pass needs to tell resume lines apart. */
function asSourceFixes(value: unknown): SourceFix[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const fix = asTrimmedString((item as { fix?: unknown }).fix) || undefined;
    const why = asTrimmedString((item as { why?: unknown }).why) || undefined;
    const impact_level = asTrimmedString((item as { impact_level?: unknown }).impact_level) || undefined;
    const critical = (item as { critical?: unknown }).critical;
    if (!fix && !why) return [];

    const rawEvidence = (item as { evidence?: unknown }).evidence;
    const evidence = typeof rawEvidence === "string"
      ? asTrimmedString(rawEvidence) || undefined
      : rawEvidence && typeof rawEvidence === "object"
        ? {
          excerpt: asTrimmedString((rawEvidence as { excerpt?: unknown }).excerpt) || undefined,
          section: asTrimmedString((rawEvidence as { section?: unknown }).section) || undefined,
        }
        : undefined;
    return [{ fix, why, evidence, impact_level, ...(typeof critical === "boolean" ? { critical } : {}) }];
  });
}

function asQuestions(value: unknown): NonNullable<NonNullable<ReportData["ideas"]>["questions"]> {
  const questions = value && typeof value === "object" ? (value as { questions?: unknown }).questions : undefined;
  if (!Array.isArray(questions)) return [];
  return questions.flatMap((item) => {
    const question = item && typeof item === "object" ? asTrimmedString((item as { question?: unknown }).question) : null;
    if (!question) return [];
    const why = asTrimmedString((item as { why?: unknown }).why) || undefined;
    return [{ question, why }];
  });
}

function asSubscores(value: unknown): ReportForPdf["subscores"] | undefined {
  if (!value || typeof value !== "object") return undefined;

  const impact = clampScore((value as { impact?: unknown }).impact) ?? undefined;
  const clarity = clampScore((value as { clarity?: unknown }).clarity) ?? undefined;
  const story = clampScore((value as { story?: unknown }).story) ?? undefined;
  const readability = clampScore((value as { readability?: unknown }).readability) ?? undefined;

  if (
    typeof impact === "undefined" &&
    typeof clarity === "undefined" &&
    typeof story === "undefined" &&
    typeof readability === "undefined"
  ) {
    return undefined;
  }

  return { impact, clarity, story, readability };
}

function asJobAlignment(value: unknown): ReportForPdf["job_alignment"] | undefined {
  if (!value || typeof value !== "object") return undefined;

  const positioning_suggestion =
    asTrimmedString((value as { positioning_suggestion?: unknown }).positioning_suggestion) || undefined;
  const roleFit = (value as { role_fit?: unknown }).role_fit;
  type RoleFit = NonNullable<NonNullable<ReportForPdf["job_alignment"]>["role_fit"]>;

  let role_fit: RoleFit | undefined;
  if (roleFit && typeof roleFit === "object") {
    const best_fit_roles = asStringArray((roleFit as { best_fit_roles?: unknown }).best_fit_roles);
    const stretch_roles = asStringArray((roleFit as { stretch_roles?: unknown }).stretch_roles);
    const seniority_read =
      asTrimmedString((roleFit as { seniority_read?: unknown }).seniority_read) || undefined;
    const industry_signals = asStringArray((roleFit as { industry_signals?: unknown }).industry_signals);
    const company_stage_fit =
      asTrimmedString((roleFit as { company_stage_fit?: unknown }).company_stage_fit) || undefined;

    if (
      best_fit_roles.length > 0 ||
      stretch_roles.length > 0 ||
      seniority_read ||
      industry_signals.length > 0 ||
      company_stage_fit
    ) {
      role_fit = {
        best_fit_roles: best_fit_roles.length > 0 ? best_fit_roles : undefined,
        stretch_roles: stretch_roles.length > 0 ? stretch_roles : undefined,
        seniority_read,
        industry_signals: industry_signals.length > 0 ? industry_signals : undefined,
        company_stage_fit,
      };
    }
  }

  if (!positioning_suggestion && !role_fit) return undefined;
  return { positioning_suggestion, role_fit };
}

function deriveSummary(report: Record<string, unknown>): string | null {
  return (
    asTrimmedString(report.summary) ||
    asTrimmedString(report.first_impression) ||
    asTrimmedString(report.score_comment_long) ||
    asTrimmedString(report.score_comment_short) ||
    asTrimmedString(report.score_plain) ||
    "Here's where to start."
  );
}

function deriveNextSteps(
  report: Record<string, unknown>,
  topFixes: NonNullable<ReportForPdf["top_fixes"]>,
  reconciledNextSteps: string[],
) {
  // A next step that only repeated a fix was removed by the integrity pass; don't refill the list with fixes.
  if (asStringArray(report.next_steps).length > 0) return reconciledNextSteps;

  const fromTopFixes = topFixes
    .map((fix) => fix.fix)
    .filter((item): item is string => Boolean(item));
  if (fromTopFixes.length > 0) return fromTopFixes;

  return asStringArray(report.gaps).slice(0, 4);
}

export function normalizeReportForPdf(report: unknown, lineAnswers?: unknown): ReportForPdf | null {
  if (!report || typeof report !== "object") return null;
  const storedAnswers = parseStoredLineAnswers(lineAnswers);
  if (isWorklistReport(report)) {
    const score = clampScore(report.score);
    if (score === null) return null;
    return {
      score,
      summary: report.verdict,
      strengths: [],
      gaps: [],
      rewrites: [],
      next_steps: [],
      score_label: getScoreLabel(score),
      worklist: {
        verdict: report.verdict,
        write_up: report.write_up,
        lifted_by_employer: report.lifted_by_employer,
        cards: report.cards.map((card, index) => {
          const stored = blankAnswersFromStored(card.example, storedAnswers?.[String(index)]);
          const filled = stored && !stored.left ? composeExample(card.example, stored.answers) : null;
          return filled ? { ...card, filled } : { ...card };
        }),
        fit: report.fit,
        ...(report.screener_text?.length ? { screener_text: report.screener_text } : {}),
      },
    };
  }

  const candidate = report as Record<string, unknown>;
  const score = clampScore(candidate.score);
  if (score === null) return null;

  // The same post-generation pass as the web report, so Keep, fixes and notes agree.
  // Critical Misses first, as on the web report.
  const { top_fixes: sourceFixes = [] } = withCriticalFirst({ top_fixes: asSourceFixes(candidate.top_fixes) });
  const rewrites = asRewrites(candidate.rewrites);
  const integrity = reconcileReport({
    first_impression: asTrimmedString(candidate.first_impression) || undefined,
    score_comment_short: asTrimmedString(candidate.score_comment_short) || undefined,
    biggest_gap_example: asTrimmedString(candidate.biggest_gap_example) || undefined,
    strengths: asStringArray(candidate.strengths),
    gaps: asStringArray(candidate.gaps),
    top_fixes: sourceFixes,
    rewrites,
    ideas: { questions: asQuestions(candidate.ideas) },
    next_steps: asStringArray(candidate.next_steps),
  });
  const top_fixes = sourceFixes.map((fix, index) => {
    const excerpt = typeof fix.evidence === "string" ? fix.evidence : fix.evidence?.excerpt;
    return {
      fix: fix.fix,
      why: integrity.fixWhyIsReason[index] ? fix.why : undefined,
      questions: integrity.fixQuestions[index].length > 0 ? integrity.fixQuestions[index] : undefined,
      line: excerpt?.replace(/^[-•*]\s+/u, "") || undefined,
      section: (typeof fix.evidence === "object" ? fix.evidence?.section : undefined) || fix.section_ref || undefined,
      ...(typeof fix.critical === "boolean" ? { critical: fix.critical } : {}),
      ...(storedAnswers?.[String(index)]?.line ? { revised: storedAnswers[String(index)].line as string } : {}),
    };
  });
  const normalized: ReportForPdf = {
    score,
    summary: deriveSummary(candidate) || "Here's where to start.",
    strengths: integrity.report.strengths || [],
    gaps: integrity.report.gaps || [],
    rewrites,
    next_steps: deriveNextSteps(candidate, top_fixes, integrity.report.next_steps || []),
    score_label: getScoreLabel(score),
    score_comment_short: asTrimmedString(candidate.score_comment_short) || undefined,
    first_impression: asTrimmedString(candidate.first_impression) || undefined,
    subscores: asSubscores(candidate.subscores),
    top_fixes,
    ...(candidate.more_critical === true ? { more_critical: true } : {}),
    structural_gaps: integrity.structuralGaps.length > 0 ? integrity.structuralGaps.map(({ text }) => text) : undefined,
    job_alignment: asJobAlignment(candidate.job_alignment),
  };

  return normalized;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export function parsePdfExportRequest(value: unknown): { report_id: string } | null {
  if (!value || typeof value !== "object") return null;
  const reportId = asTrimmedString((value as { report_id?: unknown }).report_id);
  return reportId && UUID_PATTERN.test(reportId) ? { report_id: reportId } : null;
}

export function buildPdfExportRequest(report: unknown): { report_id: string } | null {
  if (!report || typeof report !== "object") return null;
  const candidate = report as { report_id?: unknown; id?: unknown };
  return parsePdfExportRequest({ report_id: candidate.report_id || candidate.id });
}

export function attachStoredReportId<T>(report: T, reportId: unknown): T {
  const parsed = parsePdfExportRequest({ report_id: reportId });
  if (!parsed || !report || typeof report !== "object") return report;
  return { ...report, report_id: parsed.report_id };
}
