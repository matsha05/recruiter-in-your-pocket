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

export function fixPlanHeadingForCount(count: number) {
  if (count === 0) return "Review the suggestions below.";
  if (count === 1) return "Start with this change.";
  if (count === 2) return "Start with these two changes.";
  return "Start with these three changes.";
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
