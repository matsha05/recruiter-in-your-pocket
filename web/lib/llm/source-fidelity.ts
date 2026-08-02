import {
  baseNarrativeStopWords,
  interpretationContextForPath,
  narrativeTokenPolicy,
  normalizeNarrativeToken,
  sourceClauseIsNegated,
} from "./narrative-token-policy";
import { evidenceContainsIdentityPhrase, narrativeEvidenceClauses } from "./source-evidence-segmentation";
import { isAllowedReportNarrativeException } from "./report-narrative-exceptions";
import { unsupportedBracketPayloads } from "./report-placeholder-policy";
import { assertsNegativePresence } from "./report-polarity-policy";

export const EXACT_ABSENCE_SENTINELS = [
  "No summary section present",
  "No skills section present",
  "No education section present",
  "No job description provided",
  "No matching job description provided",
  "No LinkedIn profile provided",
] as const;

const absenceSentinels = new Set<string>(EXACT_ABSENCE_SENTINELS);
const leadingBulletPattern = /^(?:[•●◦▪▫‣⁃]\s*|[-*]\s+(?=[\p{L}\p{N}]))/u;
const sourceContinuationPattern = /[\p{L}\p{M}\p{N}\p{Pc}]/u;
const meaningBearingEdgePattern = /[+\-−<>=≤≥$€£¥₹%&/.*#]/u;
const trailingMeaningBearingEdgePattern = /[+\-−<>=≤≥$€£¥₹%&/*#]/u;

export type VerifiedFact = { key: string; value: string };

export type SourceFidelityIssue = {
  code:
    | "source_unavailable"
    | "source_missing"
    | "source_ambiguous"
    | "unsupported_fact"
    | "dropped_fact"
    | "unsupported_content";
  detail: string;
};

export type RewriteComparison = {
  safe: boolean;
  sourceLine?: string;
  issues: SourceFidelityIssue[];
};

export type NarrativeFidelityIssue = {
  path: string;
  claim: string;
  unsupportedFacts: string[];
};

export function isExactAbsenceSentinel(value: string) {
  return absenceSentinels.has(value.normalize("NFC").trim().replace(/\s+/gu, " "));
}

export function canonicalSourceIdentity(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .replace(leadingBulletPattern, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function sourceLines(sourceText: string) {
  return sourceText
    .split(/\r?\n/u)
    .map((line) => canonicalSourceIdentity(line))
    .filter(Boolean);
}

function isSourceBoundary(value: string, side: "before" | "after") {
  return !value
    || (!sourceContinuationPattern.test(value)
      && !(side === "before" ? meaningBearingEdgePattern : trailingMeaningBearingEdgePattern).test(value));
}

function countUnicodeBoundedExcerpts(source: string, excerpt: string) {
  let count = 0;
  let start = source.indexOf(excerpt);
  while (start !== -1) {
    const before = start === 0 ? "" : Array.from(source.slice(0, start)).at(-1) || "";
    const afterIndex = start + excerpt.length;
    const after = afterIndex === source.length ? "" : Array.from(source.slice(afterIndex)).at(0) || "";
    const afterText = source.slice(afterIndex);
    const splitsNumericLiteral = /\p{N}$/u.test(excerpt) && /^[.,]\p{N}/u.test(afterText);
    if (isSourceBoundary(before, "before") && isSourceBoundary(after, "after") && !splitsNumericLiteral) count += 1;
    start = source.indexOf(excerpt, start + 1);
  }
  return count;
}

function containsUnicodeBoundedExcerpt(source: string, excerpt: string) {
  return countUnicodeBoundedExcerpts(source, excerpt) > 0;
}

export function containsBoundedSourceExcerpt(sourceText: string, excerpt: string) {
  const normalize = (value: string) => value.normalize("NFKC").replace(/\s+/gu, " ").trim();
  const source = normalize(sourceText);
  const candidate = normalize(excerpt);
  return Boolean(source && candidate && containsUnicodeBoundedExcerpt(source, candidate));
}

function isMeaningfulExcerpt(value: string) {
  const words = value.match(/[\p{L}\p{M}\p{N}]+/gu) || [];
  return words.length >= 3 && Array.from(value).length >= 12;
}

export function resolveUniqueSourceLine(locator: string, sourceText?: string) {
  if (!sourceText?.trim()) return { status: "unavailable" as const };
  if (isExactAbsenceSentinel(locator)) return { status: "absence" as const, line: locator };

  const identity = canonicalSourceIdentity(locator);
  if (!identity) return { status: "missing" as const };

  const lines = sourceLines(sourceText);
  const exact = lines.filter((line) => line === identity);
  if (exact.length === 1) return { status: "resolved" as const, line: exact[0] };
  if (exact.length > 1) return { status: "ambiguous" as const };
  if (!isMeaningfulExcerpt(identity)) return { status: "missing" as const };

  const bounded = lines.flatMap((line) => Array.from(
    { length: countUnicodeBoundedExcerpts(line, identity) },
    () => line,
  ));
  if (bounded.length === 1) return { status: "resolved" as const, line: bounded[0] };
  if (bounded.length > 1) return { status: "ambiguous" as const };
  return { status: "missing" as const };
}

type ProtectedFact = { key: string; display: string };

const commonCapitalizedWords = new Set([
  "A", "Across", "Add", "After", "All", "An", "And", "Annual", "At", "Before", "Built", "Candidate",
  "Company", "Coordinated", "Created", "Details", "Did", "Do", "Education", "Experience", "For",
  "From", "Generated", "How", "If", "In", "Keep", "Led", "Maintained", "Managed", "Marketing", "No", "Of",
  "On", "Operations", "Product", "Ran", "Recorded", "Recruiter", "Resume", "Role", "Sales", "Scaled", "Senior",
  "Skills", "Strong", "Summary", "Supported", "The", "This", "To", "Use", "What",
  "When", "Where", "Which", "Who", "Why", "With", "Work", "Your",
]);

const metricPattern = /(?:(?:teams?|groups?|organizations?|departments?)\s+of\s+)?[<>≤≥~≈]?\s*[+\-−]?\s*(?:[$€£¥₹]\s*)?\d[\d,]*(?:\.\d+)?(?:\s*(?:%|[kmb]|x|×))?\+?(?:\s*(?:[-–]\s*)?(?:people|persons?|members?|hires?|employees?|engineers?|scientists?|designers?|researchers?|teams?|groups?|users?|customers?|clients?|countries?|regions?|projects?|releases?|records?|reports?|meetings?|schedules?|days?|weeks?|months?|years?))?/giu;
const writtenMetricPattern = /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)(?:[- ]person|\s+(?:people|members?|hires?|employees?|engineers?|scientists?|designers?|researchers?|teams?|groups?|users?|customers?|clients?|countries?|regions?|projects?|releases?))\b/giu;
const symbolicEntityPattern = /\.NET\b|\bR&D\b|\bA\/B\b|\bC\+\+(?=\W|$)/gu;
const acronymPattern = /\b[A-Z][A-Z0-9]*(?:[.+#/-][A-Z0-9]+)*\b/gu;
const titlePhrasePattern = /\b[A-Z][\p{L}\p{M}\d'’.-]*(?:\s+[A-Z][\p{L}\p{M}\d'’.-]*){1,3}\b/gu;
const singleNamePattern = /\b[A-Z][\p{L}\p{M}\d.+#'’-]{2,}\b/gu;
const shortNamePattern = /\b[A-Z](?:[\p{Ll}\p{M}])?\b/gu;

const ownershipPatterns: Array<[string, RegExp]> = [
  ["agency:lead", /\b(?:lead|leads|leading|led)\b/giu],
  ["agency:own", /\b(?:own|owns|owned|owning)\b/giu],
  ["agency:drive", /\b(?:drive|drives|driving|drove|driven)\b/giu],
  ["agency:manage", /\b(?:manage|manages|managed|managing)\b/giu],
  ["agency:direct", /\b(?:direct|directs|directed|directing|spearhead|spearheaded|head|headed)\b/giu],
  ["agency:build", /\b(?:build|builds|built|building|architect|architected|design|designed|implement|implemented|create|created)\b/giu],
  ["agency:support", /\b(?:support|supports|supported|supporting|assist|assisted|help|helped|contribute|contributed|participate|participated|collaborate|collaborated|coordinate|coordinated|partner|partnered)\b/giu],
];

const outcomePatterns: Array<[string, RegExp]> = [
  ["outcome:improve", /\b(?:improved|increased|enhanced|boosted|raised)\b/giu],
  ["outcome:reduce", /\b(?:reduced|lowered|cut|decreased)\b/giu],
  ["outcome:growth", /\b(?:grew|grown|scaled|doubled|tripled)\b/giu],
  ["outcome:financial", /\b(?:generated|saved|earned)\b/giu],
  ["outcome:delivery", /\b(?:delivered|achieved|shipped|launched|accelerated)\b/giu],
  ["outcome:promotion", /\b(?:promoted|promotion|promotions)\b/giu],
  ["outcome:expansion", /\b(?:expanded|expansion|implemented|implementation)\b/giu],
];

const qualifierPatterns: Array<[string, RegExp]> = [
  ["qualifier:global", /\b(?:global|globally|company-wide|organization-wide|enterprise-wide)\b/giu],
  ["qualifier:end-to-end", /\bend[- ]to[- ]end\b/giu],
  ["qualifier:cross-functional", /\bcross[- ]functional\b/giu],
  ["qualifier:multiple", /\b(?:multiple|several|numerous)\b/giu],
  ["qualifier:major", /\b(?:major|significant|material|mission-critical|high-stakes)\b/giu],
  ["causal:through", /\bthrough\b/giu],
  ["causal:resulting", /\b(?:resulting in|leading to|led to|because of|thereby)\b/giu],
];

function normalizedFactDisplay(value: string) {
  return value.normalize("NFKC").replace(/\s+/gu, " ").trim();
}

function addMatches(target: Map<string, ProtectedFact>, kind: string, value: string) {
  const display = normalizedFactDisplay(value);
  if (!display) return;
  target.set(`${kind}:${display}`, { key: `${kind}:${display}`, display });
}

function protectedFacts(value: string) {
  const withoutPlaceholders = value.normalize("NFKC").replace(/\[[^\]]+\]/gu, "");
  const facts = new Map<string, ProtectedFact>();

  for (const match of withoutPlaceholders.matchAll(metricPattern)) addMatches(facts, "metric", match[0].toLowerCase());
  for (const match of withoutPlaceholders.matchAll(writtenMetricPattern)) addMatches(facts, "metric-word", match[0].toLowerCase());
  for (const match of withoutPlaceholders.matchAll(symbolicEntityPattern)) addMatches(facts, "symbol", match[0]);
  for (const match of withoutPlaceholders.matchAll(acronymPattern)) {
    if (match[0].length > 1) addMatches(facts, "entity", match[0]);
  }
  for (const match of withoutPlaceholders.matchAll(titlePhrasePattern)) {
    const words = match[0].split(/\s+/u);
    while (words.length > 0 && commonCapitalizedWords.has(words[0])) words.shift();
    while (words.length > 0 && commonCapitalizedWords.has(words.at(-1) || "")) words.pop();
    if (words.length > 1) addMatches(facts, "entity", words.join(" "));
  }
  for (const match of withoutPlaceholders.matchAll(singleNamePattern)) {
    if (!commonCapitalizedWords.has(match[0])) addMatches(facts, "entity", match[0]);
  }
  for (const match of withoutPlaceholders.matchAll(shortNamePattern)) {
    if (match[0] !== "I" && !commonCapitalizedWords.has(match[0])) addMatches(facts, "entity", match[0]);
  }
  for (const [key, pattern] of [...ownershipPatterns, ...outcomePatterns, ...qualifierPatterns]) {
    if (pattern.test(withoutPlaceholders)) facts.set(key, { key, display: key.split(":").at(-1) || key });
    pattern.lastIndex = 0;
  }
  return Array.from(facts.values());
}

const semanticTokenAliases = new Map([
  ["journey", "workflow"],
]);

function materialTokens(value: string, ignoredTokens = baseNarrativeStopWords) {
  let untracked = value.normalize("NFKC").replace(/\[[^\]]+\]/gu, "");
  for (const [, pattern] of [...ownershipPatterns, ...outcomePatterns, ...qualifierPatterns]) {
    untracked = untracked.replace(pattern, " ");
    pattern.lastIndex = 0;
  }
  return new Set((untracked.match(/[\p{L}\p{M}][\p{L}\p{M}\d'’-]*/gu) || [])
    .map(normalizeNarrativeToken)
    .map((token) => semanticTokenAliases.get(token) || token)
    .filter((token) => token.length > 2 && !ignoredTokens.has(token)));
}

export function compareSourceBoundRewrite(input: {
  sourceText?: string;
  sourceLocator: string;
  candidate: string;
  verifiedFacts?: readonly VerifiedFact[];
}): RewriteComparison {
  const resolution = resolveUniqueSourceLine(input.sourceLocator, input.sourceText);
  if (resolution.status === "unavailable") {
    return { safe: false, issues: [{ code: "source_unavailable", detail: "source resume unavailable" }] };
  }
  if (resolution.status === "ambiguous") {
    return { safe: false, issues: [{ code: "source_ambiguous", detail: "source locator is not unique" }] };
  }
  if (resolution.status !== "resolved") {
    return { safe: false, issues: [{ code: "source_missing", detail: "source locator is not a bounded resume line" }] };
  }

  const verifiedText = (input.verifiedFacts || []).map((fact) => fact.value).join("\n");
  const allowedFactKeys = new Set([
    ...protectedFacts(resolution.line).map((fact) => fact.key),
    ...protectedFacts(verifiedText).map((fact) => fact.key),
  ]);
  const candidateFacts = protectedFacts(input.candidate);
  const originalFacts = protectedFacts(resolution.line);
  const issues: SourceFidelityIssue[] = [];

  const unsupportedPlaceholders = unsupportedBracketPayloads(input.candidate);
  if (unsupportedPlaceholders.length > 0) {
    issues.push({ code: "unsupported_fact", detail: `unsupported bracket facts: ${unsupportedPlaceholders.join(", ")}` });
  }

  const unsupported = candidateFacts.filter((fact) => !allowedFactKeys.has(fact.key));
  if (unsupported.length > 0) {
    issues.push({ code: "unsupported_fact", detail: `unsupported facts: ${unsupported.map((fact) => fact.display).join(", ")}` });
  }

  const candidateFactKeys = new Set(candidateFacts.map((fact) => fact.key));
  const dropped = originalFacts.filter((fact) => !candidateFactKeys.has(fact.key));
  if (dropped.length > 0) {
    issues.push({ code: "dropped_fact", detail: `dropped source facts: ${dropped.map((fact) => fact.display).join(", ")}` });
  }

  const allowedTokens = new Set([
    ...materialTokens(resolution.line),
    ...materialTokens(verifiedText),
  ]);
  const unsupportedTokens = Array.from(materialTokens(input.candidate)).filter((token) => !allowedTokens.has(token));
  if (unsupportedTokens.length > 0) {
    issues.push({ code: "unsupported_content", detail: `unsupported content: ${unsupportedTokens.join(", ")}` });
  }
  const candidateTokens = materialTokens(input.candidate);
  const droppedTokens = Array.from(materialTokens(resolution.line)).filter((token) => !candidateTokens.has(token));
  if (droppedTokens.length > 0) {
    issues.push({ code: "dropped_fact", detail: `dropped source content: ${droppedTokens.join(", ")}` });
  }

  return { safe: issues.length === 0, sourceLine: resolution.line, issues };
}

function claimSegments(value: string) {
  return value
    .split(/(?<=[!?])\s+|(?<=\.)\s+(?=[A-Z“"\[])/u)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function narrativeSourceClauses(sourceText: string) {
  return narrativeEvidenceClauses(sourceText)
    .map((clause) => canonicalSourceIdentity(clause))
    .filter(Boolean);
}

export function auditNarrativeClaim(
  value: string,
  sourceText: string,
  options: {
    interpretationContext?: "observation" | "missing" | "advice" | "question";
    rejectPositiveSourceAbsence?: boolean;
  } = {},
) {
  const candidates = narrativeSourceClauses(sourceText).map((line) => ({
    facts: protectedFacts(line),
    tokens: materialTokens(line),
    negated: sourceClauseIsNegated(line),
  }));
  return claimSegments(value).flatMap((claim) => {
    const unsupportedPlaceholders = unsupportedBracketPayloads(claim);
    if (unsupportedPlaceholders.length > 0) return [{ claim, unsupportedFacts: unsupportedPlaceholders }];
    const facts = protectedFacts(claim);
    const claimFactKeys = new Set(facts.map((fact) => fact.key));
    const hasTrackedClaim = facts.some((fact) => /^(?:agency|outcome|qualifier|causal):/u.test(fact.key));
    const hasPolarityBearingClaim = hasTrackedClaim || sourceClauseIsNegated(claim);
    const policy = narrativeTokenPolicy(claim, options.interpretationContext || "observation", hasPolarityBearingClaim);
    const claimTokens = materialTokens(claim, policy.ignoredTokens);
    const eligibleCandidates = candidates.filter(({ negated }) =>
      policy.sourcePolarity === "any" || negated === (policy.sourcePolarity === "negative")
    );
    const supporting = eligibleCandidates.filter(({ facts: sourceFacts }) => {
      const sourceFactKeys = new Set(sourceFacts.map((fact) => fact.key));
      return facts.every((fact) => sourceFactKeys.has(fact.key));
    });
    if (supporting.length === 0) {
      return [{ claim, unsupportedFacts: facts.map((fact) => fact.display) }];
    }

    const sourceAnchored = supporting.filter(({ tokens }) => {
      const overlap = Array.from(claimTokens).filter((token) => tokens.has(token)).length;
      return claimTokens.size >= 1
        && overlap === claimTokens.size;
    });
    if (sourceAnchored.length === 0) {
      if (facts.length === 0 && claimTokens.size === 0) return [];
      const unsupportedTokens = Array.from(claimTokens).filter((token) =>
        !supporting.some(({ tokens }) => tokens.has(token))
      );
      const unsupportedFacts = unsupportedTokens.length > 0
        ? unsupportedTokens
        : facts.map((fact) => fact.display);
      return [{ claim, unsupportedFacts }];
    }
    if (
      options.rejectPositiveSourceAbsence
      && assertsNegativePresence(claim)
      && sourceAnchored.some(({ negated }) => !negated)
    ) return [{ claim, unsupportedFacts: ["contradicts positive source evidence"] }];
    const hasCompleteUntrackedMatch = sourceAnchored.some(({ facts: sourceFacts }) =>
      sourceFacts
        .filter((fact) => !/^(?:agency|outcome|qualifier|causal):/u.test(fact.key))
        .every((fact) => claimFactKeys.has(fact.key))
    );
    if (!hasTrackedClaim && (hasCompleteUntrackedMatch || policy.interpretive)) return [];
    const hasCompleteMatch = sourceAnchored.some(({ facts: sourceFacts }) =>
      sourceFacts.every((fact) => claimFactKeys.has(fact.key))
    );
    if (hasCompleteMatch) return [];
    const dropped = sourceAnchored[0].facts.filter((fact) => !claimFactKeys.has(fact.key));
    return [{ claim, unsupportedFacts: dropped.map((fact) => `dropped ${fact.display}`) }];
  });
}

function reportNarrativeStrings(report: any) {
  const values: Array<{ path: string; value: string }> = [];
  const add = (path: string, value: unknown) => {
    if (typeof value === "string" && value.trim()) values.push({ path, value });
  };
  const addArray = (path: string, entries: unknown) => {
    if (Array.isArray(entries)) entries.forEach((entry, index) => add(`${path}[${index}]`, entry));
  };

  for (const key of [
    "score_comment_short", "score_comment_long", "score_plain", "first_impression",
    "biggest_gap_example", "first_impression_takeaway", "summary", "layout_notes",
  ]) add(key, report?.[key]);
  for (const key of ["strengths", "gaps", "next_steps"]) addArray(key, report?.[key]);
  (report?.top_fixes || []).forEach((fix: any, index: number) => {
    add(`top_fixes[${index}].fix`, fix?.fix || fix?.text);
    add(`top_fixes[${index}].why`, fix?.why);
    add(`top_fixes[${index}].evidence.section`, fix?.evidence?.section);
    add(`top_fixes[${index}].section_ref`, fix?.section_ref);
  });
  Object.entries(report?.section_review || {}).forEach(([section, item]: [string, any]) => {
    for (const key of ["working", "missing", "fix"]) add(`section_review.${section}.${key}`, item?.[key]);
  });
  (report?.ideas?.questions || []).forEach((question: any, index: number) => {
    add(`ideas.questions[${index}].question`, question?.question);
    add(`ideas.questions[${index}].why`, question?.why);
  });
  (report?.rewrites || []).forEach((rewrite: any, index: number) => {
    // original/better use exact evidence and rewrite validation; audit the remaining rendered copy here.
    for (const key of ["label", "enhancement_note"]) add(`rewrites[${index}].${key}`, rewrite?.[key]);
  });
  const alignment = report?.job_alignment;
  add("job_alignment.jd_match_summary", alignment?.jd_match_summary);
  addArray("job_alignment.jd_keywords.matched", alignment?.jd_keywords?.matched);
  addArray("job_alignment.jd_keywords.missing", alignment?.jd_keywords?.missing);
  for (const key of ["strongly_aligned", "underplayed", "missing"]) addArray(`job_alignment.${key}`, alignment?.[key]);
  add("job_alignment.role_fit.seniority_read", alignment?.role_fit?.seniority_read);
  addArray("job_alignment.role_fit.best_fit_roles", alignment?.role_fit?.best_fit_roles);
  addArray("job_alignment.role_fit.stretch_roles", alignment?.role_fit?.stretch_roles);
  addArray("job_alignment.role_fit.industry_signals", alignment?.role_fit?.industry_signals);
  add("job_alignment.role_fit.company_stage_fit", alignment?.role_fit?.company_stage_fit);
  add("job_alignment.positioning_suggestion", alignment?.positioning_suggestion);
  return values;
}

function isJobDescriptionGroundableRole(path: string) {
  return /^job_alignment\.role_fit\.(?:best_fit_roles|stretch_roles)\[\d+\]$/u.test(path);
}

function jobDescriptionKeywordKind(path: string) {
  return path.match(/^job_alignment\.jd_keywords\.(matched|missing)\[\d+\]$/u)?.[1];
}

export function auditReportNarrative(report: any, resumeText: string, jobDescription?: string): NarrativeFidelityIssue[] {
  return reportNarrativeStrings(report).flatMap(({ path, value }) => {
    if (isAllowedReportNarrativeException(report, path, value, jobDescription)) return [];
    const keywordKind = jobDescriptionKeywordKind(path);
    if (keywordKind) {
      const inResume = evidenceContainsIdentityPhrase(value, resumeText);
      const inJobDescription = Boolean(jobDescription?.trim() && evidenceContainsIdentityPhrase(value, jobDescription));
      const grounded = keywordKind === "matched" ? inResume && inJobDescription : !inResume && inJobDescription;
      return grounded ? [] : [{ path, claim: value, unsupportedFacts: [`${keywordKind} JD keyword provenance`] }];
    }
    if (isJobDescriptionGroundableRole(path)) {
      const groundedInResume = evidenceContainsIdentityPhrase(value, resumeText);
      const groundedInJobDescription = Boolean(
        jobDescription?.trim() && evidenceContainsIdentityPhrase(value, jobDescription),
      );
      if (groundedInResume || groundedInJobDescription) return [];
      const issues = auditNarrativeClaim(value, resumeText);
      return (issues.length > 0 ? issues : [{ claim: value, unsupportedFacts: [value] }])
        .map((issue) => ({ path, ...issue }));
    }
    const resumeIssues = auditNarrativeClaim(value, resumeText, {
      interpretationContext: interpretationContextForPath(path),
      rejectPositiveSourceAbsence: /^rewrites\[\d+\]\.enhancement_note$/u.test(path),
    });
    if (resumeIssues.length === 0) return [];
    return resumeIssues.map((issue) => ({ path, ...issue }));
  });
}

export function removeUnsafeRewrites<T extends { rewrites?: unknown }>(report: T, resumeText: string) {
  const rewrites = Array.isArray(report.rewrites) ? report.rewrites : [];
  const removed: Array<{ index: number; issues: SourceFidelityIssue[] }> = [];
  const safeRewrites = rewrites.filter((rewrite: any, index: number) => {
    if (typeof rewrite?.original !== "string" || typeof rewrite?.better !== "string") return true;
    const comparison = compareSourceBoundRewrite({
      sourceText: resumeText,
      sourceLocator: rewrite.original,
      candidate: rewrite.better,
    });
    if (comparison.safe) return true;
    removed.push({ index, issues: comparison.issues });
    return false;
  });
  return { report: { ...report, rewrites: safeRewrites }, removed };
}
