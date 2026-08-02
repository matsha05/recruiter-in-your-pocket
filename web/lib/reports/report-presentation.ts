import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { isAcceptedAbsenceMarker } from "../llm/grounding";
import {
  canonicalSourceIdentity as comparatorCanonicalSourceIdentity,
  compareSourceBoundRewrite,
  type VerifiedFact,
} from "../llm/source-line-comparator";

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

const ACCEPTED_ABSENCE_SENTINELS = new Set([
  "No summary section present",
  "No skills section present",
  "No education section present",
  "No job description provided",
  "No matching job description provided",
  "No LinkedIn profile provided",
]);

const MEANINGFUL_WORD_PATTERN = /[\p{L}\p{M}\p{N}]+/gu;
const SOURCE_CONTINUATION_PATTERN = /[\p{L}\p{M}\p{N}\p{Pc}]/u;
const MEANING_BEARING_EDGE_PATTERN = /[+\-−<>=≤≥$€£¥₹%&/.*#]/u;
const MIN_SHORTENED_TOKENS = 3;
const MIN_SHORTENED_CODE_POINTS = 12;

function evidenceFor(fix: ReportFix) {
  if (!fix.evidence) return "";
  return typeof fix.evidence === "string" ? fix.evidence : fix.evidence.excerpt || "";
}

function normalizeAbsenceCandidate(value: string) {
  return value
    .normalize("NFC")
    .trim()
    .replace(/\s+/gu, " ")
    .trim();
}

function looksLikeAbsenceClaim(value: string) {
  return /^\s*[([{"'“”]*no\b/iu.test(value)
    && /\b(?:summary|skills|education|job description|linkedin profile)\b/iu.test(value);
}

function acceptedAbsenceKey(value: string) {
  const normalized = normalizeAbsenceCandidate(value);
  if (!ACCEPTED_ABSENCE_SENTINELS.has(normalized)) return undefined;
  return isAcceptedAbsenceMarker(value) ? normalized : undefined;
}

export function canonicalSourceIdentity(value: string) {
  return comparatorCanonicalSourceIdentity(value);
}

function isMeaningfulShortenedExcerpt(value: string) {
  const words = value.match(MEANINGFUL_WORD_PATTERN) || [];
  return words.length >= MIN_SHORTENED_TOKENS
    && Array.from(value).length >= MIN_SHORTENED_CODE_POINTS;
}

function isSourceBoundary(value: string) {
  return !value
    || (!SOURCE_CONTINUATION_PATTERN.test(value) && !MEANING_BEARING_EDGE_PATTERN.test(value));
}

function containsUnicodeBoundedExcerpt(source: string, excerpt: string) {
  let start = source.indexOf(excerpt);

  while (start !== -1) {
    const before = start === 0 ? "" : Array.from(source.slice(0, start)).at(-1) || "";
    const afterIndex = start + excerpt.length;
    const after = afterIndex === source.length ? "" : Array.from(source.slice(afterIndex)).at(0) || "";

    if (isSourceBoundary(before) && isSourceBoundary(after)) return true;
    start = source.indexOf(excerpt, start + 1);
  }

  return false;
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

  const evidenceAbsence = acceptedAbsenceKey(evidence);
  const originalAbsence = acceptedAbsenceKey(original);
  if (
    evidenceAbsence
    || originalAbsence
    || looksLikeAbsenceClaim(evidence)
    || looksLikeAbsenceClaim(original)
  ) {
    return Boolean(evidenceAbsence && evidenceAbsence === originalAbsence);
  }

  const evidenceIdentity = canonicalSourceIdentity(evidence);
  const originalIdentity = canonicalSourceIdentity(original);
  if (!evidenceIdentity || !originalIdentity) return false;
  if (evidenceIdentity === originalIdentity) return true;

  // A top-fix excerpt may be a shortened verbatim window into rewrite.original.
  // It must remain byte-for-byte meaningful after canonical whitespace and sit
  // on real line-word boundaries. The direction is intentionally one-way:
  // rewrite.original may contain more source text, never less.
  if (!isMeaningfulShortenedExcerpt(evidenceIdentity)) return false;

  return containsUnicodeBoundedExcerpt(originalIdentity, evidenceIdentity);
}

export function buildReportRewritePresentation(
  fixes: ReportFix[],
  rewrites: ReportRewrite[],
): { fixes: PresentedFix[]; independentRewrites: IndependentRewrite[] } {
  const renderableRewrites = rewrites
    .map((rewrite, originalIndex) => ({ rewrite, originalIndex }))
    .filter(({ rewrite }) => isRenderableRewrite(rewrite));

  const rewriteCandidatesByFix = fixes.map((fix) => renderableRewrites
    .filter(({ rewrite }) => rewriteMatchesFix(fix, rewrite))
    .map(({ originalIndex }) => originalIndex));

  const fixCandidatesByRewrite = new Map<number, number[]>();
  rewriteCandidatesByFix.forEach((rewriteIndexes, fixIndex) => {
    rewriteIndexes.forEach((rewriteIndex) => {
      const fixIndexes = fixCandidatesByRewrite.get(rewriteIndex) || [];
      fixIndexes.push(fixIndex);
      fixCandidatesByRewrite.set(rewriteIndex, fixIndexes);
    });
  });

  const attachedRewriteIndexes = new Set<number>();
  const presentedFixes = fixes.map((fix, fixIndex) => {
    const candidates = rewriteCandidatesByFix[fixIndex];
    if (candidates.length !== 1) return { fix, rewrite: undefined };

    const rewriteIndex = candidates[0];
    if ((fixCandidatesByRewrite.get(rewriteIndex) || []).length !== 1) {
      return { fix, rewrite: undefined };
    }

    attachedRewriteIndexes.add(rewriteIndex);
    return { fix, rewrite: rewrites[rewriteIndex] };
  });

  return {
    fixes: presentedFixes,
    independentRewrites: renderableRewrites
      .filter(({ originalIndex }) => !attachedRewriteIndexes.has(originalIndex)),
  };
}

export function buildIndependentQuestionPresentation(questions: ReportQuestion[]) {
  return questions
    .map((question, originalIndex) => ({ question, originalIndex }))
    .filter(({ question }) => typeof question?.question === "string" && question.question.trim().length > 0);
}

export type FallbackDraftSafetyIssue = {
  kind: "missing_source" | "fidelity" | "unsupported_agency" | "unsupported_outcome";
  detail: string;
};

export function assessFallbackDraftSafety(
  original: string,
  rewrite: string,
  sourceText = original,
  verifiedFacts: readonly VerifiedFact[] = [],
) {
  const issues: FallbackDraftSafetyIssue[] = [];
  if (!original.trim() || !rewrite.trim()) {
    issues.push({ kind: "missing_source", detail: "missing source or rewrite text" });
    return { copyable: false, issues };
  }

  const comparison = compareSourceBoundRewrite({
    sourceText,
    sourceLocator: original,
    candidate: rewrite,
    verifiedFacts,
  });
  issues.push(...comparison.issues.map((issue): FallbackDraftSafetyIssue => ({
    kind: issue.code === "agency_upgraded"
      ? "unsupported_agency"
      : issue.code === "unsupported_outcome"
        ? "unsupported_outcome"
        : issue.code === "source_missing" || issue.code === "source_ambiguous"
          ? "missing_source"
          : "fidelity",
    detail: issue.detail,
  })));

  return { copyable: issues.length === 0, issues };
}
