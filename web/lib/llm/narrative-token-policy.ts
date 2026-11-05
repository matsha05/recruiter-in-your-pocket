export type NarrativeInterpretationContext = "observation" | "assessment" | "missing" | "advice" | "question";
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
  "its", "it", "was", "were", "are", "has", "have", "had", "but", "only", "while", "yet", "using", "via",
  "though", "although", "toward", "towards", "also", "before",
  // Contracted negations carry no fact of their own ("its dates aren't clear").
  "isn't", "isn’t", "aren't", "aren’t", "wasn't", "wasn’t", "weren't", "weren’t", "doesn't", "doesn’t", "don't", "don’t", "didn't", "didn’t",
]);

const styleWords = normalizedSet([
  "appear", "blurry", "clear", "clearly", "context", "explicit", "focus", "missing", "need", "unstated",
  "not", "page", "present", "read", "readable", "strong", "unclear", "visible", "work",
]);
const actionWords = normalizedSet([
  "add", "answer", "ask", "bullet", "can", "choose", "clarify", "could", "define", "describe", "document", "edit", "explain", "include", "keep",
  "make", "name", "next", "quantify", "rewrite", "show", "specify", "surface", "use", "verify", "what", "you",
]);
export const assessmentDimensionWords = normalizedSet([
  "count", "detail", "fact", "impact", "metric", "outcome", "result", "scale", "scope", "size",
]);
const assessmentWords = normalizedSet([
  "about", "activity", "afterward", "all", "annual", "area", "background", "base", "breadth", "broad", "broader", "career", "some",
  "contain", "contracting", "conversion", "credible", "concrete", "deal", "delivery", "dense", "describe", "description",
  "development", "duty", "earlier", "effect", "evidence", "experience", "experienced", "exposure", "few", "finance", "first",
  "foundation", "general", "give", "history", "individual", "leadership", "learning", "like", "limited", "limiting",
  "list", "little", "long", "many", "measurable", "measured", "most", "mostly", "operation", "ownership", "page",
  "participation", "partly", "pastoral", "performance", "process", "progression", "quantified", "reach", "real", "recent",
  "relevant", "remain", "repeatedly", "responsibility", "responsibility-based", "resume", "role", "senior", "signal",
  "analytics-led", "appropriately", "become", "change", "concise", "contribution", "coverage", "date", "decision", "degree", "direction", "graduation", "headline", "institution", "iteration", "lane", "less", "listed", "often", "other", "range", "rarely", "setting", "specific", "statement", "still", "stop", "story", "strong", "strongest", "technical-to-product", "tenure", "than", "then", "thin", "too", "training", "transition", "which", "year",
  // The report's audience and its "worth keeping" reaction describe the read, not the resume.
  "reader", "reviewer", "worth", "keeping", "task", "deliverable", "subject",
  // Connectives that relate two stated facts without adding one ("an initiative tied to 1,000+ hires").
  "tied", "linked", "associated",
  "typo", "make", "slower", "current", "completed", "complete", "school", "location", "core", "job", "organized", "sequence", "straightforward", "included", "presented", "order", "scan", "section", "title", "employer", "figure", "score", "starting", "point",
  "uneven", "unevenly", "unusually", "useful", "utilization", "verified", "volume", "well", "workforce",
  // The report describing its own read, not the resume (live judgment run, Nov 5 2026: "a clear picture of
  // your customer-facing work", "the bullets leave the actual design choices largely out of view",
  // "Both degrees include schools", "Keeping both figures helps show that the role involves more").
  "picture", "view", "leave", "leaves", "left", "out", "largely", "actual", "choice", "choices", "both", "each", "every",
  "help", "helps", "helped", "more", "involve", "involves", "stated", "important", "comparison", "unanswered", "relationship",
  "here", "set", "different", "call", "calls", "sense", "idea", "impression", "glance", "question", "questions",
  // The report reading the person's schedule or the shape of the pasted text ("shows availability",
  // "The supplied text appears as one continuous passage, so check that your original file separates roles").
  "availability", "willingness", "flexibility", "field", "fields", "completion", "text", "file", "passage", "paragraph",
  "format", "formatting", "layout", "continuous", "supplied", "pasted", "original", "separate", "separates", "check", "so", "one",
  "accomplishment", "accomplishments", "achievement", "achievements",
  // How the score reads the page ("The score reflects the specific workloads shown across your roles").
  "reflect", "shown", "across", "workload",
  // Seniority reads, matching the report's own level scale ("Early career" ... "Director-level").
  // Bare "entry", "junior", and "executive" stay out: they also name duties and job titles.
  "entry-level", "early-career", "mid-level", "mid-career", "senior-level", "lead-level", "director-level", "level",
]);

const sourceNegationPattern = /\b(?:did\s+not|does\s+not|do\s+not|not|never|no|without|didn['’]t|doesn['’]t|don['’]t)\b/iu;
const questionPattern = /\?\s*$|^\s*(?:what|how|which|where|when|who|why|can|could|would|should|do|did|is|are)\b/iu;
// Advice may open with a condition or a location: "If you hold the license, add ...", "For the posted role, add ...".
const advicePattern = /^\s*(?:(?:first|then|finally),?\s+|(?:if|when|unless|for|in|on|under|within|above|below)\b[^,;.!?]{1,120},\s*)?(?:add|ask|choose|clarify|compare|complete|correct|define|describe|document|edit|explain|expand|identify|include|keep|make|name|quantify|reorder|replace|resolve|revise|rewrite|separate|sharpen|show|specify|state|surface|tighten|turn|say|use|verify)\b|\b(?:can|should|could|would|needs?\s+to)\b/iu;
// "does not list", "aren't shown here" and "leaves ... unanswered" describe what the resume lacks, like "not shown".
const absencePattern = /^\s*no\b|\b(?:absent|blurry|seldom|rarely|hardly|cannot\s+tell|missing|needs?|lacks?|unclear|omitted|without|(?:not|isn['’]t|aren['’]t|wasn['’]t|weren['’]t|is\s+not|are\s+not|was\s+not|were\s+not)\s+(?:yet\s+)?(?:choose|clear|explicit|included|present|shown|stated|visible|listed|documented|described|mentioned|named|here|there)|(?:do|does|did)\s+not\s+(?:choose|include|make\b[^.!?]{0,50}\bexplicit|name|show|state|list|document|mention|describe|record|specify|address|establish|cover|say|explain))\b/iu;
// "SQL ownership is explicit" asserts presence; "a role with explicit retention targets" describes the posting.
const positivePresencePattern = /\b(?:adds?|appears?|clear(?:ly)?|contains?|explicit(?!\s+\p{L})|includes?|included|(?<![-‐‑‒–—])points?(?![-‐‑‒–—])|present|readable|shows?|shown|visible)\b/iu;
const assessmentCuePattern = /\b(?:blurry|compete|credible|dense|difficult|easier|fit|harder|limited|read|reader|recruiter|relevant|resume|story|strong|thin|unclear|uneven|useful|weak)\b/iu;

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
    || path === "first_impression_takeaway"
  ) return "advice";
  if (/^ideas\.questions\[\d+\]\.(?:question|why)$/u.test(path)) return "question";
  return "assessment";
}

export function narrativeTokenPolicy(
  value: string,
  context: NarrativeInterpretationContext,
  hasTrackedClaim: boolean,
  directFactualAssertion = false,
) {
  const normalized = value.normalize("NFC");
  const lexicalQuestion = questionPattern.test(normalized);
  const lexicalAdvice = advicePattern.test(normalized);
  const lexicalAbsence = absencePattern.test(normalized);
  const isQuestion = context === "question" || lexicalQuestion;
  const isAdvice = context === "advice" || lexicalAdvice;
  const isAbsence = context === "missing" || lexicalAbsence;
  const isAssessment = context === "assessment";
  // Comparative clarity describes a limitation; retain any other positive cue in the clause.
  const presenceText = normalized
    .replace(/\b(?:less|not\s+as)\s+(?:clear(?:ly)?|visible|apparent|evident)\b/giu, " ")
    .replace(/\b(?:(?:do|does|did)\s+not|don['’]t|doesn['’]t|didn['’]t)\s+(?:yet\s+)?(?:show|include|contain|add|appear)\b/giu, " ")
    // "aren't shown here" and "isn't clear" negate the presence cue that follows them.
    .replace(/\b(?:isn['’]t|aren['’]t|wasn['’]t|weren['’]t|is\s+not|are\s+not|was\s+not|were\s+not|not|never)\s+(?:yet\s+|always\s+|fully\s+|clearly\s+)?(?:clear(?:ly)?|shown|visible|present|included|explicit|stated|listed|readable|apparent|evident)\b/giu, " ");
  const assertsPresence = !lexicalQuestion
    && !lexicalAdvice
    && !lexicalAbsence
    && positivePresencePattern.test(presenceText);
  const allowAssessmentDimensions = !assertsPresence && (isQuestion || isAdvice || isAbsence);
  const ignoredTokens = new Set([...baseNarrativeStopWords, ...styleWords, ...actionWords]);
  if (allowAssessmentDimensions || isAssessment) {
    for (const token of assessmentDimensionWords) ignoredTokens.add(token);
  }
  for (const token of assessmentWords) ignoredTokens.add(token);

  let sourcePolarity: NarrativeSourcePolarity = "positive";
  if (hasTrackedClaim && directFactualAssertion && sourceNegationPattern.test(normalized) && !lexicalAbsence) sourcePolarity = "negative";
  else if (!directFactualAssertion && (isQuestion || isAdvice || isAbsence || isAssessment)) sourcePolarity = "any";

  return {
    ignoredTokens,
    interpretive: isQuestion || isAdvice || isAbsence || positivePresencePattern.test(normalized)
      || (isAssessment && assessmentCuePattern.test(normalized)),
    assessment: isAssessment,
    assertsPresence,
    lexicalAbsence,
    sourcePolarity,
  };
}
