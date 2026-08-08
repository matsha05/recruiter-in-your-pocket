export type NarrativeInterpretationContext = "observation" | "missing" | "advice" | "question";
export type NarrativeSourcePolarity = "positive" | "negative" | "any";

export function normalizeNarrativeToken(token: string) {
  const lower = token.normalize("NFKC").toLocaleLowerCase();
  if (lower.endsWith("ies") && lower.length > 4) return `${lower.slice(0, -3)}y`;
  if (
    lower.endsWith("s")
    && !lower.endsWith("ss")
    && !lower.endsWith("us")
    && !lower.endsWith("is")
    && lower.length > 3
  ) return lower.slice(0, -1);
  return lower;
}

function normalizedSet(words: readonly string[]) {
  return new Set(words.flatMap((word) => [word, normalizeNarrativeToken(word)]));
}

export const baseNarrativeStopWords = normalizedSet([
  "a", "an", "and", "as", "at", "be", "by", "for", "from", "in", "into", "is", "of",
  "on", "or", "the", "to", "with", "that", "this", "these", "those", "your", "their",
  "its", "it", "was", "were", "are", "has", "have", "had", "while", "using", "via",
]);

const styleWords = normalizedSet([
  "appear", "blurry", "clear", "clearly", "context", "explicit", "focus", "missing", "need",
  "not", "page", "present", "read", "readable", "strong", "unclear", "visible", "work",
]);
const actionWords = normalizedSet([
  "add", "answer", "ask", "bullet", "can", "clarify", "could", "edit", "include", "keep",
  "name", "next", "quantify", "rewrite", "show", "specify", "surface", "use", "verify", "what", "you",
]);
const assessmentDimensionWords = normalizedSet([
  "count", "detail", "fact", "metric", "outcome", "result", "scale", "scope", "size",
]);

const sourceNegationPattern = /\b(?:did\s+not|does\s+not|do\s+not|not|never|no|without|didn['’]t|doesn['’]t|don['’]t)\b/iu;
const questionPattern = /\?\s*$|^\s*(?:what|how|which|where|when|who|why|can|could|would|should|do|did|is|are)\b/iu;
const advicePattern = /^\s*(?:add|ask|clarify|edit|include|keep|name|quantify|rewrite|show|specify|surface|use)\b|\b(?:can|should|could|needs?\s+to)\b/iu;
const absencePattern = /\b(?:absent|blurry|missing|needs?|lacks?|unclear|not\s+(?:clear|explicit|included|present|visible))\b/iu;
const positivePresencePattern = /\b(?:appears?|clear(?:ly)?|explicit|included|present|readable|shows?|shown|visible)\b/iu;

export function sourceClauseIsNegated(value: string) {
  return sourceNegationPattern.test(value.normalize("NFC"));
}

export function interpretationContextForPath(path: string): NarrativeInterpretationContext {
  if (
    /^(?:gaps|job_alignment\.(?:underplayed|missing))\[\d+\]$/u.test(path)
    || /^section_review\..+\.missing$/u.test(path)
    || path === "biggest_gap_example"
  ) return "missing";
  if (
    /^next_steps\[\d+\]$/u.test(path)
    || /^top_fixes\[\d+\]\.(?:fix|why)$/u.test(path)
    || /^section_review\..+\.fix$/u.test(path)
    || path === "job_alignment.positioning_suggestion"
  ) return "advice";
  if (/^ideas\.questions\[\d+\]\.(?:question|why)$/u.test(path)) return "question";
  return "observation";
}

export function narrativeTokenPolicy(
  value: string,
  context: NarrativeInterpretationContext,
  hasTrackedClaim: boolean,
) {
  const normalized = value.normalize("NFC");
  const lexicalQuestion = questionPattern.test(normalized);
  const lexicalAdvice = advicePattern.test(normalized);
  const lexicalAbsence = absencePattern.test(normalized);
  const isQuestion = context === "question" || lexicalQuestion;
  const isAdvice = context === "advice" || lexicalAdvice;
  const isAbsence = context === "missing" || lexicalAbsence;
  const assertsPresence = !lexicalQuestion
    && !lexicalAdvice
    && !lexicalAbsence
    && positivePresencePattern.test(normalized);
  const allowAssessmentDimensions = !assertsPresence && (isQuestion || isAdvice || isAbsence);
  const ignoredTokens = new Set([...baseNarrativeStopWords, ...styleWords, ...actionWords]);
  if (allowAssessmentDimensions) {
    for (const token of assessmentDimensionWords) ignoredTokens.add(token);
  }

  let sourcePolarity: NarrativeSourcePolarity = "positive";
  if (hasTrackedClaim && sourceNegationPattern.test(normalized) && !lexicalAbsence) sourcePolarity = "negative";
  else if (!hasTrackedClaim && !assertsPresence && (isQuestion || isAdvice || isAbsence)) sourcePolarity = "any";

  return {
    ignoredTokens,
    interpretive: isQuestion || isAdvice || isAbsence || positivePresencePattern.test(normalized),
    sourcePolarity,
  };
}
