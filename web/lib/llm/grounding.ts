import {
  compareSourceBoundRewrite,
  hasVerifiedOutcomeSignal,
  resolveUniqueSourceLine,
} from "./source-line-comparator";

function hasOutcomeSignal(value: string) {
  return hasVerifiedOutcomeSignal(value);
}

function normalizeMarker(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\d%\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const ABSENCE_MARKERS = new Set([
  "no summary section present",
  "no skills section present",
  "no education section present",
  "no job description provided",
  "no matching job description provided",
  "no linkedin profile provided",
]);

function hasSectionHeading(sourceText: string, names: string[]) {
  return sourceText.split(/\r?\n/).some((line) => {
    const normalized = normalizeMarker(line);
    return names.some((name) => normalized === name || normalized.startsWith(`${name} `));
  });
}

export function isAcceptedAbsenceMarker(value: string, sourceText?: string) {
  const marker = normalizeMarker(value);
  if (!ABSENCE_MARKERS.has(marker)) return false;
  if (!sourceText) return true;

  if (marker === "no summary section present") {
    return !hasSectionHeading(sourceText, ["summary", "professional summary", "profile", "professional profile"]);
  }
  if (marker === "no skills section present") {
    return !hasSectionHeading(sourceText, ["skills", "technical skills", "core skills", "core competencies"]);
  }
  if (marker === "no education section present") {
    return !hasSectionHeading(sourceText, ["education", "academic background", "academic experience"]);
  }

  return true;
}

export function sourceContextFor(original: string, sourceText?: string) {
  if (!sourceText) return original;
  return resolveUniqueSourceLine(original, sourceText) || original;
}

export function containsExactEvidence(sourceText: string, excerpt: string) {
  return resolveUniqueSourceLine(excerpt, sourceText) !== null;
}

export function findAlreadySatisfiedFix(
  fix: string,
  evidenceExcerpt: string,
  resumeText: string,
): string[] {
  const sourceLine = sourceContextFor(evidenceExcerpt, resumeText);
  const findings: string[] = [];
  const asksForGenericMetric = /\b(add|include|clarify|highlight|show|provide|quantify)\b[^.]{0,45}\b(metric|metrics|number|numbers|quantifiable)\b/i.test(fix);
  const asksForOutcome = /\b(add|include|clarify|highlight|show|provide|quantify)\b[^.]{0,45}\b(outcome|outcomes|result|results|impact|achievement|achievements)\b/i.test(fix);
  const lineHasImpactMetric = /(?:\d[\d,]*(?:\.\d+)?\s*%|\$\s*\d|\b\d[\d,]*(?:\.\d+)?\s*(?:x|k|m|b|users?|customers?|patients?|officers?)\b)/i.test(sourceLine);
  if (asksForGenericMetric && lineHasImpactMetric) findings.push("metric already present in cited bullet");
  if (asksForOutcome && !asksForGenericMetric && hasOutcomeSignal(sourceLine)) findings.push("outcome already present in cited bullet");

  const asksForGenericScope = /\b(add|include|clarify|show|provide)\b[^.]{0,80}\b(team size|team sizes|project scope|project scopes|size and scope|scope)\b/i.test(fix);
  const lineHasScope = /\b\d[\d,]*(?:\.\d+)?\s*(?:k|m|b)?\+?[- ]*(?:(?:monthly|weekly|daily|annual|active)\s+)?(?:data\s+)?(?:person|people|member|designer|researcher|engineer|scientist|team|user|client|customer|country|region|project|budget|record|transaction|patient|officer)s?\b/i.test(sourceLine)
    || /\b(?:team|group|organization|department)\s+of\s+\d[\d,]*(?:\.\d+)?\b/i.test(sourceLine);
  if (asksForGenericScope && lineHasScope) findings.push("scope already present in cited bullet");

  const asksForTools = /\[(?:tool|software|framework|platform|technology)(?: name)?\]/i.test(fix)
    || /\b(?:name|mention|list|highlight)\b[^.]{0,60}\b(?:tool|tools|software|frameworks?|platforms?|technologies|technology stack)\b/i.test(fix)
    || /\b(?:add|include)\b[^.]{0,60}\b(?:tool name|named tools?|software used|framework name|platform name|technology stack)\b/i.test(fix);
  const resumeHasNamedToolList = /\b(?:tools?|software|platforms?|prototyping|analytics|stack)\b[^\n]{0,80}\([^)]+(?:,|\|)[^)]+\)/i.test(resumeText)
    || /\b(Figma|Sketch|Python|TensorFlow|PyTorch|Spark|AWS|Marketo|HubSpot|Salesforce|Workday|SAP|Oracle|Tableau|Power BI)\b/i.test(resumeText);
  if (asksForTools && resumeHasNamedToolList) findings.push("named tools already present in resume");

  const asksForTime = /\b(cycle[- ]?time|timeframe|time to market|time-to-market|duration|speed)\b/i.test(fix);
  const lineHasTime = /\b(?:time[- ]?to[- ]?market|cycle[- ]?time)\b|\b\d+(?:\.\d+)?\s*(?:days?|weeks?|months?|years?)\b/i.test(sourceLine);
  if (asksForTime && lineHasTime) findings.push("time measure already present in cited bullet");

  const asksForRate = /\b(adoption|conversion|retention|success|engagement)\s+(?:rate|metric|change)\b/i.test(fix);
  const lineHasRequestedRate = /\b(adoption|conversion|retention|success|engagement)\b[^\n]{0,45}\d+(?:\.\d+)?\s*%/i.test(sourceLine);
  if (asksForRate && lineHasRequestedRate) findings.push("requested rate already present in cited bullet");

  const asksForBudget = /\b(budget|spend|cost)\s+(?:amount|size|baseline)\b/i.test(fix);
  if (asksForBudget && /\$\s*\d/i.test(sourceLine)) findings.push("budget amount already present in cited bullet");

  const asksForSavings = /\b(cost savings|savings|money saved)\b/i.test(fix);
  if (asksForSavings && /\$\s*\d|\b(?:saved|saving|reduced costs?|cut costs?)\b/i.test(sourceLine)) {
    findings.push("savings evidence already present in cited bullet");
  }

  const asksForOwnership = /\b(add|include|clarify|highlight|show|surface|specify)\b[^.]{0,60}\b(ownership|owner|accountability|responsibility)\b/i.test(fix);
  const lineHasOwnership = /\b(led|owned|drove|managed|spearheaded|directed|headed|built|decided|architected|implemented)\b/i.test(sourceLine);
  if (asksForOwnership && lineHasOwnership) findings.push("ownership already present in cited bullet");

  return findings;
}

const FIX_TARGET_PATTERN = /\[[^\]]+\]|\d|%|\b(team size|budget|revenue|pipeline|cycle[- ]?time|timeframe|conversion|adoption|retention|tool name|named tools?|system name|user count|customer count|region count|project count|cost|savings|accuracy|volume|frequency|baseline|before and after|existing scope|existing outcome|existing result|opening clause|opening line|first bullet|top bullet|summary|skills section|education section|job title|ownership verb|(?:this|the|hiring|experience|recruiting|budgeting|mentoring|customer|project|product|operations|marketing|sales|teaching|ministry|compliance|legal|research|migration|inventory|HR) bullet)\b|["“][^"”]{4,}["”]/i;

export function findNonActionableFix(fix: string): string[] {
  const findings: string[] = [];
  const isLabelWithoutDirection = /^\s*(?:bullet|line|section)\s+to\s+(?:rewrite|replace|change|shorten|combine)\b/i.test(fix);
  if (!/\b(add|move|surface|cut|remove|replace|rewrite|merge|lead|name|quantify|specify|change|combine|shorten)\b/i.test(fix)) {
    findings.push("missing a concrete edit action");
  }
  if (!FIX_TARGET_PATTERN.test(fix)) {
    findings.push("missing a specific fact or placeholder to add");
  }
  if (
    /\b(rewrite|replace|change|shorten|combine)\b/i.test(fix)
    && (
      isLabelWithoutDirection
      || !/\b(?:by|to|with)\b\s+(?!(?:rewrite|replace|change|shorten|combine)\b)\S+/i.test(fix)
    )
  ) {
    findings.push("does not say how to change the cited text");
  }
  return findings;
}

const FIX_EVIDENCE_TOPICS: Array<{ label: string; pattern: RegExp }> = [
  { label: "recruiting", pattern: /\b(recruit(?:ing|ment|er)?|hiring|talent acquisition|candidate)s?\b/i },
  { label: "budget", pattern: /\b(budget|spend|expense|resource allocation)s?\b/i },
  { label: "training", pattern: /\b(training|learning|development program|upskill|workshop)s?\b/i },
  { label: "mentoring", pattern: /\b(mentor(?:ing|ship|ed)?|mentee|coaching)s?\b/i },
  { label: "compliance", pattern: /\b(compliance|employment law|policy|policies|audit)s?\b/i },
  { label: "launch", pattern: /\b(launch|time[- ]?to[- ]?market|go[- ]?to[- ]?market)s?\b/i },
  { label: "acquisition cost", pattern: /\b(CAC|customer acquisition cost|acquisition cost)s?\b/i },
  { label: "accessibility", pattern: /\b(accessibility|accessible|WCAG)s?\b/i },
];

export function findFixEvidenceMismatch(
  fix: string,
  evidenceExcerpt: string,
  resumeText: string,
): string[] {
  const findings: string[] = [];
  const normalizedMarker = normalizeMarker(evidenceExcerpt);

  if (ABSENCE_MARKERS.has(normalizedMarker)) {
    if (!isAcceptedAbsenceMarker(evidenceExcerpt, resumeText)) {
      findings.push("absence marker is contradicted by the resume");
    }
    const expectedSection = normalizedMarker.match(/^no (summary|skills|education) section present$/)?.[1];
    if (expectedSection && !new RegExp(`\\b${expectedSection}\\b`, "i").test(fix)) {
      findings.push(`absence marker does not support this ${expectedSection}-unrelated fix`);
    }
    return findings;
  }

  const sourceLine = sourceContextFor(evidenceExcerpt, resumeText);
  for (const topic of FIX_EVIDENCE_TOPICS) {
    if (topic.pattern.test(fix) && !topic.pattern.test(sourceLine)) {
      findings.push(`cited evidence does not support the ${topic.label} fix`);
    }
  }

  return findings;
}

function contentTokens(value: string) {
  const stop = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "of", "on", "or", "the", "to", "with"]);
  return Array.from(new Set(
    value
      .replace(/\[[^\]]+\]/g, " ")
      .toLowerCase()
      .replace(/[^a-z0-9%$]+/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2 && !stop.has(token)),
  ));
}

function groundedNumbers(value: string) {
  const numeric = value.match(/(?:\$\s*)?\d+(?:\.\d+)?\s*(?:%|x|k|m|b)?/gi) || [];
  const writtenDurations = value.match(/\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:days?|weeks?|months?|years?)\b/gi) || [];
  return Array.from(new Set([...numeric, ...writtenDurations]))
    .map((item) => item.toLowerCase().replace(/\s+/g, ""));
}

export function findRewriteFidelityIssues(original: string, rewrite: string, sourceText?: string): string[] {
  const source = sourceText || original;
  const sourceLine = sourceContextFor(original, sourceText);
  const comparison = compareSourceBoundRewrite({ sourceText: source, sourceLocator: original, candidate: rewrite });
  const fidelityIssues = comparison.issues.filter((issue) => !["agency_upgraded", "unsupported_outcome"].includes(issue.code));
  const findings: string[] = [];

  const sourceTokens = contentTokens(sourceLine);
  const rewriteTokens = new Set(contentTokens(rewrite));
  const overlap = sourceTokens.filter((token) => rewriteTokens.has(token)).length;
  const coverage = sourceTokens.length > 0 ? overlap / sourceTokens.length : 1;
  if (fidelityIssues.length > 0 && sourceTokens.length >= 4 && coverage < 0.34) {
    findings.push("rewrite no longer describes the cited source bullet");
  }
  if (fidelityIssues.some((issue) => issue.code === "no_material_change")) {
    findings.push("rewrite makes no material change");
  }
  if (fidelityIssues.some((issue) => issue.code === "metric_dropped")) {
    const rewriteNumbers = new Set(groundedNumbers(rewrite));
    const droppedNumbers = groundedNumbers(sourceLine).filter((number) => !rewriteNumbers.has(number));
    if (droppedNumbers.length > 0) {
      findings.push(`rewrite drops grounded specifics: ${droppedNumbers.join(", ")}`);
    }
  }
  if (findings.length > 0) return findings;
  return fidelityIssues.map((issue) => issue.detail);
}

export function findBiggestGapContradictions(value: string, resumeText: string): string[] {
  const quote = value.match(/["“]([^"”]+)["”]/)?.[1];
  if (!quote) return [];
  const sourceLine = sourceContextFor(quote, resumeText);
  const findings: string[] = [];
  const claimsMissingScope = /(?:\b(?:missing|lacks?|without|unclear|no)\b[^.]{0,60}\bscope\b|\bnot (?:full|enough|clear)[^.]{0,30}\bscope\b|\bdoes not (?:show|state|name|quantify)[^.]{0,40}\bscope\b)/i.test(value);
  const sourceHasScope = /\b\d[\d,]*(?:\.\d+)?\s*(?:(?:monthly|weekly|daily|annual|active)\s+)?(?:person|people|member|designer|researcher|engineer|scientist|team|user|client|customer|country|region|project|patient|budget)s?\b/i.test(sourceLine)
    || /\b(?:team|group|organization|department)\s+of\s+\d[\d,]*(?:\.\d+)?\b/i.test(sourceLine)
    || /\$\s*\d/i.test(sourceLine);
  if (claimsMissingScope && sourceHasScope) findings.push("quoted source already includes scope");

  const claimsMissingOutcome = /(?:\b(?:missing|lacks?|without|unclear|no)\b[^.]{0,70}\b(?:outcome|impact|result|metric)s?\b|\bdoes not (?:show|state|name|quantify)[^.]{0,50}\b(?:outcome|impact|result|metric)s?\b)/i.test(value);
  const sourceHasOutcome = hasOutcomeSignal(sourceLine);
  if (claimsMissingOutcome && sourceHasOutcome) findings.push("quoted source already includes an outcome");

  const claimsMissingOwnership = /\b(?:add|missing|lacks?|needs?|without|unclear)\b[^.]{0,60}\b(?:ownership|accountability|responsibility)\b/i.test(value);
  const sourceHasOwnership = /\b(led|owned|drove|managed|spearheaded|directed|headed|built|decided|architected|implemented)\b/i.test(sourceLine);
  if (claimsMissingOwnership && sourceHasOwnership) findings.push("quoted source already includes ownership");

  const claimsMissingTime = /\b(?:add|missing|lacks?|needs?|without|unclear)\b[^.]{0,50}\b(?:timeframe|time frame|duration)\b/i.test(value);
  const sourceHasTime = /\byear[- ]over[- ]year\b|\b(?:within|over|in)\s+\d[\d,]*(?:\.\d+)?\s*(?:days?|weeks?|months?|years?)\b/i.test(sourceLine);
  if (claimsMissingTime && sourceHasTime) findings.push("quoted source already includes a timeframe");

  return findings;
}

/**
 * A rewrite cannot safely promote collaborative/supporting work into leadership
 * unless the source line itself contains evidence of that stronger ownership.
 */
export function findUnsupportedAgencyUpgrade(original: string, rewrite: string, sourceText?: string): string[] {
  const source = sourceText || original;
  return compareSourceBoundRewrite({ sourceText: source, sourceLocator: original, candidate: rewrite })
    .issues
    .filter((issue) => issue.code === "agency_upgraded")
    .map((issue) => issue.detail);
}

/**
 * Outcome language is unsafe when the source line contains only activity. A
 * bracketed outcome is explicitly a question for the candidate and is allowed.
 */
export function findUnsupportedOutcomeClaims(original: string, rewrite: string, sourceText?: string): string[] {
  const source = sourceText || original;
  return compareSourceBoundRewrite({ sourceText: source, sourceLocator: original, candidate: rewrite })
    .issues
    .filter((issue) => issue.code === "unsupported_outcome")
    .map((issue) => issue.detail);
}
