import type { ReportData } from "@/components/workspace/report/ReportTypes";
import {
  canonicalSourceIdentity,
  compareSourceBoundRewrite,
  isExactAbsenceSentinel,
  resolveUniqueSourceLine,
  type SourceFidelityIssue,
  type VerifiedFact,
} from "../llm/source-fidelity";
import { hasBracketPlaceholders } from "../llm/report-placeholder-policy";

type ReportFix = NonNullable<ReportData["top_fixes"]>[number];
type ReportRewrite = NonNullable<ReportData["rewrites"]>[number];
type ReportQuestion = NonNullable<NonNullable<ReportData["ideas"]>["questions"]>[number];

export interface PresentedFix {
  fix: ReportFix;
  rewrite?: ReportRewrite;
}

export interface IndependentRewrite {
  rewrite: ReportRewrite;
  originalIndex: number;
}

export interface IndependentQuestion {
  question: ReportQuestion;
  originalIndex: number;
}

// The fix section's heading, in the approved word list (docs/copy-system.md §1).
export function fixPlanHeadingForCount(count: number) {
  if (count === 0) return "Review the suggestions below.";
  if (count === 1) return "Fix this first.";
  if (count === 2) return "Fix these two first.";
  return "Fix these three first.";
}

/**
 * Whether the report was read against a job posting. The validator writes the exact "No job description
 * provided." summary when there was none, so this survives a reload that loses the posting's text (1.7).
 */
export function reportHasJobDescription(report: Pick<ReportData, "job_alignment">) {
  const summary = report.job_alignment?.jd_match_summary?.trim();
  return Boolean(summary) && summary !== "No job description provided.";
}

type SeverityFlags = { top_fixes?: Array<{ critical?: unknown; [field: string]: unknown } | undefined>; more_critical?: unknown };

export interface CriticalMisses {
  /** How many of the first fixes are Critical Misses, in priority order: 1 to 3, or 0 with no fixes. */
  count: number;
  /** The severity check marked each fix, so the report can say how many there are. */
  counted: boolean;
  /** More than three exist; the report shows the three that matter most. */
  more: boolean;
}

function isFlagged(report: SeverityFlags) {
  return (report.top_fixes || []).some((fix) => typeof fix?.critical === "boolean");
}

/**
 * Critical Misses lead, each group in the report's own order. The first fix stays first unless a later
 * one is flagged and it isn't. Unflagged reports keep their order.
 */
export function withCriticalFirst<T extends SeverityFlags>(report: T): T {
  const fixes = report.top_fixes;
  if (!fixes || !isFlagged(report)) return report;
  const ordered = [...fixes.filter((fix) => fix?.critical === true), ...fixes.filter((fix) => fix?.critical !== true)];
  return ordered.every((fix, index) => fix === fixes[index]) ? report : { ...report, top_fixes: ordered };
}

/**
 * Which fixes are Critical Misses (Matt, Nov 1: "i dont want to lie to people and say they have one
 * critical miss if there are more"). A Critical Miss is a problem that could cost an interview on its own.
 * The severity check flags up to three (`critical`, listed first) and `more_critical` when there are more.
 * A report without flags still names its first fix, but it can't say how many there are.
 * Expects the fixes in display order (`withCriticalFirst`).
 */
export function readCriticalMisses(report: SeverityFlags): CriticalMisses {
  const fixes = (report.top_fixes || []).slice(0, 3);
  if (fixes.length === 0) return { count: 0, counted: false, more: false };
  if (!isFlagged(report)) return { count: 1, counted: false, more: false };
  const leading = fixes.findIndex((fix) => fix?.critical !== true);
  // A report always names one; validation can drop every flagged fix.
  const count = Math.max(1, leading === -1 ? fixes.length : leading);
  return { count, counted: true, more: count === 3 && report.more_critical === true };
}

/**
 * The count leads the fix section once the report knows it. Without it, the fix headings above stay.
 * Copy: docs/copy-system.md §1.
 */
export function criticalCountHeading(misses: CriticalMisses): { title: string; lead: string } | null {
  if (!misses.counted || misses.count === 0) return null;
  if (misses.more) {
    return {
      title: "More than three Critical Misses. Here are the three that matter most.",
      lead: "Any one of them could cost you the interview on its own. Start with the first.",
    };
  }
  // A judgment, not a guarantee: it says nothing about the rest of the report (Matt, Nov 2).
  if (misses.count === 1) return { title: "One Critical Miss. Fix it first.", lead: "It's the one most likely to cost you the interview." };
  if (misses.count === 2) return { title: "Two Critical Misses. Start with this one.", lead: "Either one could cost you the interview on its own." };
  return { title: "Three Critical Misses. Start with this one.", lead: "Any one of them could cost you the interview on its own." };
}

/**
 * What's missing, when a fix's evidence is an absence ("No summary section present") rather than a line
 * on the resume: there's no line to quote, highlight or revise. Null for a real line.
 */
export function missingFromResume(excerpt: string) {
  const value = excerpt.trim().replace(/\.$/u, "");
  return isExactAbsenceSentinel(value) ? value.replace(/ (?:present|provided)$/u, "") : null;
}

/** A fix's card label: `Critical Miss` (numbered when there are several), then `Fix 2`, `Fix 3` by position. */
export function fixLabel(index: number, misses: CriticalMisses) {
  if (index >= misses.count) return `Fix ${index + 1}`;
  return misses.count > 1 ? `Critical Miss ${index + 1}` : "Critical Miss";
}

export function questionForPlaceholder(key: string) {
  const questions: Record<string, string> = {
    teams: "Which teams were involved?",
    functions: "Which teams were involved?",
    "specific scope": "Who or what did the work cover?",
    "missing scope": "Who or what did the work cover?",
    "measurable result": "What changed, and how did you measure it?",
    "verified before-and-after result": "What was different before and after?",
    "verified outcome": "What was the outcome?",
    "verified result": "What result can you confirm?",
    result: "What was the result?",
    "ownership detail": "What did you personally decide or do?",
    "leadership scope": "What were you responsible for leading?",
    timeframe: "Over what period?",
    "team count": "How many teams were involved?",
    "team size": "How many people were on the team?",
    "number of hires": "How many people were hired?",
    "customer count": "How many customers were involved?",
    "budget size": "What was the budget?",
    budget: "What was the budget?",
    baseline: "What was the starting point?",
    "impact metric": "How did you measure the result?",
    "kpi change": "How did the measure change?",
    "cycle time": "How long did the process take?",
    "cycle-time change": "How did the time required change?",
    "cycle-time improvement": "How much faster was the process?",
    "program length": "How long did the program run?",
    "adoption rate": "What was the adoption rate?",
    "adoption result": "What did adoption look like?",
    "application scope": "What did the application cover?",
    "campaign scope": "Who or what did the campaign cover?",
    "completed artifact": "What did you deliver?",
    "conversion rate": "What was the conversion rate?",
    "onboarding retention rate": "What was the retention rate after onboarding?",
    "retention increase": "How much did retention increase?",
    "retention metric": "How did you measure retention?",
    "recruitment cycle time": "How long did hiring take?",
    "quota result": "What was the result against your quota?",
    "pain point": "What problem were you addressing?",
    "tool name": "Which tool did you use?",
    "target role": "Which role are you applying for?",
    "target role level": "What level are you applying for?",
    "target product lane": "What kind of product work are you targeting?",
    degree: "Which degree did you earn?",
    school: "Which school did you attend?",
    university: "Which university did you attend?",
    year: "Which year?",
  };
  return questions[key.trim().toLocaleLowerCase()] || `Details about ${key}`;
}

function evidenceFor(fix: ReportFix) {
  if (!fix.evidence) return "";
  return typeof fix.evidence === "string" ? fix.evidence : fix.evidence.excerpt || "";
}

function isRenderableRewrite(rewrite: ReportRewrite) {
  return typeof rewrite?.original === "string"
    && rewrite.original.trim().length > 0
    && typeof rewrite?.better === "string"
    && rewrite.better.trim().length > 0;
}

export function rewriteMatchesFix(fix: ReportFix, rewrite: ReportRewrite) {
  const evidence = evidenceFor(fix);
  const original = typeof rewrite?.original === "string" ? rewrite.original : "";
  if (!evidence.trim() || !original.trim()) return false;

  const evidenceAbsence = isExactAbsenceSentinel(evidence);
  const originalAbsence = isExactAbsenceSentinel(original);
  if (evidenceAbsence || originalAbsence || /^\s*[([{"'“”]*no\b/iu.test(evidence) || /^\s*[([{"'“”]*no\b/iu.test(original)) {
    return evidenceAbsence && originalAbsence && evidence === original;
  }

  const evidenceIdentity = canonicalSourceIdentity(evidence);
  const originalIdentity = canonicalSourceIdentity(original);
  if (!evidenceIdentity || !originalIdentity) return false;
  return resolveUniqueSourceLine(evidenceIdentity, originalIdentity).status === "resolved";
}

export function buildReportRewritePresentation(
  fixes: ReportFix[],
  rewrites: ReportRewrite[],
): { fixes: PresentedFix[]; independentRewrites: IndependentRewrite[] } {
  const renderable = rewrites
    .map((rewrite, originalIndex) => ({ rewrite, originalIndex }))
    .filter(({ rewrite }) => isRenderableRewrite(rewrite));

  const candidatesByFix = fixes.map((fix) => renderable
    .filter(({ rewrite }) => rewriteMatchesFix(fix, rewrite))
    .map(({ originalIndex }) => originalIndex));
  const fixesByRewrite = new Map<number, number[]>();
  candidatesByFix.forEach((rewriteIndexes, fixIndex) => {
    rewriteIndexes.forEach((rewriteIndex) => {
      fixesByRewrite.set(rewriteIndex, [...(fixesByRewrite.get(rewriteIndex) || []), fixIndex]);
    });
  });

  const attached = new Set<number>();
  const presentedFixes = fixes.map((fix, fixIndex) => {
    const candidates = candidatesByFix[fixIndex];
    if (candidates.length !== 1) return { fix };
    const rewriteIndex = candidates[0];
    if ((fixesByRewrite.get(rewriteIndex) || []).length !== 1) return { fix };
    attached.add(rewriteIndex);
    return { fix, rewrite: rewrites[rewriteIndex] };
  });

  return {
    fixes: presentedFixes,
    independentRewrites: renderable.filter(({ originalIndex }) => !attached.has(originalIndex)),
  };
}

export function buildIndependentQuestionPresentation(questions: ReportQuestion[]) {
  return questions
    .map((question, originalIndex) => ({ question, originalIndex }))
    .filter(({ question }) => typeof question?.question === "string" && question.question.trim().length > 0);
}

export type RewriteCopyPolicy = {
  copyable: boolean;
  reason: "ready" | "source_unavailable" | "unresolved_placeholders" | "unsafe";
  issues: SourceFidelityIssue[];
};

export function resolveRewriteCopyPolicy(input: {
  sourceText?: string;
  original: string;
  draft: string;
  verifiedFacts?: readonly VerifiedFact[];
}): RewriteCopyPolicy {
  if (!input.sourceText?.trim()) {
    return {
      copyable: false,
      reason: "source_unavailable",
      issues: [{ code: "source_unavailable", detail: "source resume unavailable" }],
    };
  }
  if (hasBracketPlaceholders(input.draft)) {
    return { copyable: false, reason: "unresolved_placeholders", issues: [] };
  }
  const comparison = compareSourceBoundRewrite({
    sourceText: input.sourceText,
    sourceLocator: input.original,
    candidate: input.draft,
    verifiedFacts: input.verifiedFacts,
  });
  if (!comparison.safe) return { copyable: false, reason: "unsafe", issues: comparison.issues };
  return { copyable: true, reason: "ready", issues: [] };
}
