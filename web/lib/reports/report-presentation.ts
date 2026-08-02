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
  if (count === 1) return "One move. Start here.";
  if (count === 2) return "Two moves. In order.";
  return "Three moves. In order.";
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
