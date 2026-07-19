const limitedOwnershipPattern = /\b(supported|assisted|helped|contributed|participated)\b/i;
const elevatedOwnershipPattern = /\b(led|owned|drove|managed|spearheaded|directed|headed)\b/gi;
const outcomePattern = /\b(improvement|improvements|improved|improving|increase|increased|increasing|reduction|reductions|reduced|reducing|streamlined|streamlining|enhanced|enhancing|boosted|boosting|grew|growth|saved|saving|cut|accelerated|accelerating|raised|lowered|resulted|resulting)\b/gi;

function removeBracketPlaceholders(value: string) {
  return value.replace(/\[[^\]]+\]/g, "");
}

function normalizeForLookup(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function sourceContextFor(original: string, sourceText?: string) {
  if (!sourceText) return original;
  const needle = normalizeForLookup(original);
  if (!needle) return original;

  const containingLine = sourceText
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(line => normalizeForLookup(line).includes(needle));

  return containingLine || original;
}

export function containsExactEvidence(sourceText: string, excerpt: string) {
  const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();
  return normalizeWhitespace(sourceText).includes(normalizeWhitespace(excerpt));
}

export function findAlreadySatisfiedFix(
  fix: string,
  evidenceExcerpt: string,
  resumeText: string,
): string[] {
  if (/\[[^\]]+\]/.test(fix)) return [];

  const sourceLine = sourceContextFor(evidenceExcerpt, resumeText);
  const findings: string[] = [];
  const asksForGenericMetric = /\b(add|include|clarify|highlight|show|provide|quantify)\b[^.]{0,45}\b(metric|metrics|number|numbers|quantifiable|outcome|outcomes|result|results|achievement|achievements)\b/i.test(fix);
  const lineHasImpactMetric = /(?:\d+(?:\.\d+)?\s*%|\$\s*\d|\b\d+(?:\.\d+)?\s*(?:x|k|m|b|users?|customers?|patients?|officers?)\b)/i.test(sourceLine);
  if (asksForGenericMetric && lineHasImpactMetric) findings.push("metric already present in cited bullet");

  const asksForGenericScope = /\b(add|include|clarify|show|provide)\b[^.]{0,45}\b(team size|team sizes|project scope|project scopes|size and scope|scope)\b/i.test(fix);
  const lineHasScope = /\b\d+(?:\.\d+)?\s*(?:person|people|member|designer|researcher|engineer|scientist|team|user|client|country|region|project|budget)s?\b/i.test(sourceLine);
  if (asksForGenericScope && lineHasScope) findings.push("scope already present in cited bullet");

  const asksForTools = /\b(add|include|name|mention|list|highlight)\b[^.]{0,45}\b(tool|tools|software|platform|platforms|technology|technologies)\b/i.test(fix);
  const resumeHasNamedToolList = /\b(?:tools?|software|platforms?|prototyping|analytics|stack)\b[^\n]{0,80}\([^)]+(?:,|\|)[^)]+\)/i.test(resumeText)
    || /\b(Figma|Sketch|Python|TensorFlow|PyTorch|Spark|AWS|Marketo|HubSpot|Salesforce|Workday|SAP|Oracle|Tableau|Power BI)\b/i.test(resumeText);
  if (asksForTools && resumeHasNamedToolList) findings.push("named tools already present in resume");

  return findings;
}

/**
 * A rewrite cannot safely promote collaborative/supporting work into leadership
 * unless the source line itself contains evidence of that stronger ownership.
 */
export function findUnsupportedAgencyUpgrade(original: string, rewrite: string, sourceText?: string): string[] {
  const sourceContext = sourceContextFor(original, sourceText);
  if (!limitedOwnershipPattern.test(sourceContext)) return [];

  const originalElevated = new Set(
    Array.from(sourceContext.matchAll(elevatedOwnershipPattern), match => match[0].toLowerCase()),
  );
  const rewriteElevated = Array.from(
    rewrite.matchAll(elevatedOwnershipPattern),
    match => match[0].toLowerCase(),
  );

  return Array.from(new Set(rewriteElevated.filter(verb => !originalElevated.has(verb))));
}

/**
 * Outcome language is unsafe when the source line contains only activity. A
 * bracketed outcome is explicitly a question for the candidate and is allowed.
 */
export function findUnsupportedOutcomeClaims(original: string, rewrite: string, sourceText?: string): string[] {
  const sourceContext = sourceContextFor(original, sourceText);
  if (outcomePattern.test(removeBracketPlaceholders(sourceContext))) {
    outcomePattern.lastIndex = 0;
    return [];
  }
  outcomePattern.lastIndex = 0;

  const matches = Array.from(
    removeBracketPlaceholders(rewrite).matchAll(outcomePattern),
    match => match[0].toLowerCase(),
  );
  outcomePattern.lastIndex = 0;
  return Array.from(new Set(matches));
}
