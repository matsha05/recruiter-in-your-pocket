import { sourceStatesOutcomeFamily } from "./narrative-meaning";
import { normalizeNarrativeToken } from "./narrative-token-policy";
import { canonicalizeUserSourceText } from "../security/inputSanitization";
import { evidenceContainsExactEntity, evidenceContainsOnlyNegatedEntity } from "./source-evidence-segmentation";
import { evidenceContainsRequirement } from "./requirement-evidence";

type NarrativeFact = { key: string; display: string };

const directFactualAssertionPattern = /^\s*(?:did\s+not\s+(?:build|create|design|implement|lead|manage|own|drive|deliver|launch|coordinate|migrate|develop|generate|save|scale|move|transition|promote|support|increase|improve|reduce|grow|boost|raise|enhance|lower|cut|decrease|double|triple|achieve|ship|accelerate|earn)|(?:(?:[\p{Lu}\p{Lt}][\p{L}\p{M}\d.+#'’-]*)\s+)?(?:built|created|designed|implemented|led|managed|owned|drove|delivered|launched|coordinated|migrated|developed|generated|saved|scaled|moved|transitioned|promoted|supported|increased|improved|reduced|grew|boosted|raised|enhanced|lowered|cut|decreased|doubled|tripled|achieved|shipped|accelerated|earned))\b/iu;

const numberWords = new Map([
  ["one", "1"], ["two", "2"], ["three", "3"], ["four", "4"], ["five", "5"], ["six", "6"],
  ["seven", "7"], ["eight", "8"], ["nine", "9"], ["ten", "10"], ["eleven", "11"], ["twelve", "12"],
]);

function metricIdentity(value: string) {
  const normalized = canonicalizeUserSourceText(value).toLocaleLowerCase().replace(/,/gu, "")
    .replace(/\b(?:exceeding|greater than|more than|over)\s+/gu, ">")
    .replace(/\b(?:less than|under)\s+/gu, "<")
    .replace(/\b(?:about|approximately|roughly)\s+/gu, "~")
    .replace(/\bup to\s+/gu, "≤");
  const numeric = normalized.match(/[<>≤≥~≈]?[+\-−]?\s*(?:[$€£¥₹]\s*)?\d+(?:\.\d+)?(?:\s*%|[kmbx×](?![\p{L}\p{N}]))?\+?/u)?.[0];
  if (numeric) return numeric.replace(/\s+/gu, "");
  for (const [word, digit] of numberWords) {
    if (new RegExp(`\\b${word}\\b`, "u").test(normalized)) return digit;
  }
  return normalized.replace(/\s+/gu, " ").trim();
}

const roleAliases: Record<string, string[]> = {
    "annual-recurring-revenue": ["annual", "recurring", "revenue"],
    bba: ["bachelor", "business", "administration"],
    ba: ["bachelor", "arts"], bs: ["bachelor", "science"], bsc: ["bachelor", "science"],
    ms: ["master", "science"], msc: ["master", "science"], mba: ["master", "business", "administration"],
    phd: ["doctor", "philosophy"],
    bsba: ["bachelor", "science", "business", "administration"],
    ceo: ["chief", "executive", "officer"], cfo: ["chief", "financial", "officer"],
    cio: ["chief", "information", "officer"], cmo: ["chief", "marketing", "officer"],
    coo: ["chief", "operating", "officer"], cpo: ["chief", "product", "officer"],
    cto: ["chief", "technology", "officer"], kpi: ["key", "performance", "indicator"],
    kpis: ["key", "performance", "indicator"], rest: ["rest"], restful: ["rest"],
    pm: ["product", "manager"], pms: ["product", "manager"], vp: ["vice", "president"],
};

function entityIdentityTokens(value: string) {
  if (/^CI\/CD$/iu.test(value.trim())) return ["continuous", "integration", "delivery"];
  const tokenAliases: Record<string, string> = { apis: "api", arr: "annual-recurring-revenue", restful: "rest" };
  const tokens = (canonicalizeUserSourceText(value).replace(/\b([A-Z]{2,})s\b/gu, "$1").replace(/\b([\p{L}])\.(?=[\p{L}]\b)/gu, "$1")
    .replace(/([\p{Ll}\p{M}])([\p{Lu}])/gu, "$1 $2")
    .match(/[\p{L}\p{M}\d]+(?:[+#]|\.[\p{L}\p{M}\d]+)*/gu) || [])
    .map(normalizeNarrativeToken)
    .map((token) => tokenAliases[token] || token)
    .filter((token) => token.length > 1);
  return tokens.flatMap(token => roleAliases[token] || [token]);
}

/**
 * "multi-disciplinary" and "multidisciplinary" are one word. Resume tokens keep the
 * hyphenated form and add the joined one; claim tokens are compared joined. A claim
 * that matched before still matches.
 */
export function withJoinedSpellings(tokens: Set<string>) {
  const joined = new Set(tokens);
  for (const token of tokens) if (token.includes("-")) joined.add(token.replace(/-/gu, ""));
  return joined;
}

/** "delivery speed" in a source line supports the claim's "delivery-speed", which joinedSpellings reads as "deliveryspeed". */
export function withJoinedPairs(tokens: Set<string>, line: string) {
  const words = canonicalizeUserSourceText(line).toLocaleLowerCase().match(/[\p{L}\p{M}\d]+/gu) || [];
  for (let index = 0; index + 1 < words.length; index += 1) {
    tokens.add(normalizeNarrativeToken(`${words[index]}-${words[index + 1]}`).replace(/-/gu, ""));
  }
  return tokens;
}

export function joinedSpellings(tokens: Set<string>) {
  return new Set(Array.from(tokens, (token) => token.replace(/-/gu, "")));
}

export function auditableNarrativeValue(path: string, value: string, sourceText = "", reportScore?: number) {
  // A report's displayed score is metadata, but any other number still needs support.
  if (path === "score_plain" && Number.isFinite(reportScore)) {
    value = value.replace(new RegExp(`\\b(?:At|score (?:of|is)) ${reportScore}\\b`, "i"), "At this score");
  }
  // A quoted line that reports something is the sentence's subject: "“Rebuilt the funnel” reports ..."
  // means it, the line, reports. Any other quote is blanked, so "“Feb 2023” is the latest ..." stays a description.
  const reportingQuote = /^\s*["“][^"”]+["”](?=\s+(?:reports|shows|lists|says|states|gives|names|mentions|describes|notes|covers|includes)\b)/u;
  let auditable = (path !== "biggest_gap_example" ? value
    : reportingQuote.test(value) ? value.replace(reportingQuote, "It") : value.replace(/["“][^"”]+["”]/u, " ")).replace(/\bU\.S\./gu, "US");
  // A suggested label ("a dated line such as "Career break"") proposes wording; it claims nothing.
  // Only a sentence-case label qualifies, so a suggested title or employer is still checked.
  // A comma or period the sentence closes inside the quotes ("Job search and coursework,") is still the label's.
  auditable = auditable.replace(/\b(line|label|heading|entry)\s+(?:such as|like)\s+["“]\p{Lu}[\p{Ll} -]{0,40}[,.]?["”](?:\s+or\s+["“]\p{Lu}[\p{Ll} -]{0,40}[,.]?["”])*/gu, "$1");
  if (path.startsWith("section_review.Education.")) auditable = auditable.replace(/\b(?:B\.S|B\.Ed|M\.S|M\.Div)\.?/gu, (degree) => sourceText.includes(degree) ? " " : degree);
  return /[\p{L}\p{N}]/u.test(auditable) ? auditable : "";
}

/**
 * Commentary on the previous sentence: an anaphoric subject ("That detail", "This line", "It") and an
 * evaluative predicate ("is worth keeping because it shows ..."). Its descriptive words paraphrase a
 * sentence the audit already checked, so they need no anchor of their own, but every concrete claim
 * in it (a number, a name, an agency or outcome claim) still has to be in the resume.
 */
export function isAnaphoricCommentary(value: string) {
  return /^\s*(?:that|this|it)(?:\s+(?:detail|line|example|number|figure|sentence|bullet|point|quote|context|result|metric|title|date|phrase|wording|pairing|contrast))?\s+(?:is|’s|'s|remains|stays|also\s+is)\s+(?:worth\s+(?:keeping|noting|stating|leading\s+with|a\s+closer\s+look)|the\s+(?:strongest|clearest|most\s+concrete)\b|what\s+(?:a\s+)?(?:reader|recruiter|reviewer)s?\b)/iu.test(value.normalize("NFC"))
    || /^\s*(?:that|this|it)(?:\s+\p{L}+)?\s+(?:matters|counts|stands\s+out|earns\s+its\s+place)\b/iu.test(value.normalize("NFC"));
}

export function isDirectFactualAssertion(value: string) {
  if (/\b(?:can|could|may|might) (?:mean|refer to|describe)\b/iu.test(value)) return false;
  // "The managed finance-process deliverables ..." uses the participle as an adjective.
  if (/^\s*(?:the|a|an|this|that|these|those|your|its|their)\s+\p{L}+ed\b/iu.test(value)) return false;
  // A question asserts nothing: "What led you to build ..." is not the claim "What led".
  if (/\?\s*$/u.test(value) || /^\s*(?:what|which|how|why|when|where|who)\b/iu.test(value)) return false;
  // "less developed" and "well built" describe a quality, not work someone did.
  if (/^\s*(?:less|more|most|least|well|fully|under|over|not\s+(?:yet|as))\s/iu.test(value)) return false;
  return directFactualAssertionPattern.test(value.normalize("NFC"));
}

/**
 * @param supplementarySourceText A second text an entity may come from: the posting, for a claim about what the
 * resume lacks ("does not list an RN license or BLS certification, both required for the posted role"). Only
 * entities and symbols read it, and only the caller decides when (never for a positive claim about the person).
 */
export function factSupportedAcrossSource(fact: NarrativeFact, sourceFacts: NarrativeFact[], sourceTokens: Set<string>, sourceText = "", requirePositiveEntity = false, supplementarySourceText = "", claim = "") {
  // "an IT-focused application" needs IT in the source, like "SQL-based reporting" needs SQL.
  const toolModifier = fact.key.startsWith("entity:") && fact.display.match(/^([A-Z][A-Z0-9]*(?:[.+#][A-Z0-9]+)*)-(based|focused|oriented|heavy|facing|reporting)$/u);
  if (toolModifier && sourceText) return toolModifier[2] !== "reporting"
    ? evidenceContainsExactEntity(toolModifier[1], sourceText, true)
    : evidenceContainsRequirement(`${toolModifier[1]} reporting`, sourceText);
  // An entity named only in negative evidence cannot establish positive presence.
  if (requirePositiveEntity && /^(?:entity|symbol):/u.test(fact.key)
    && evidenceContainsOnlyNegatedEntity(fact.display, sourceText)) return false;
  if (sourceFacts.some((sourceFact) => sourceFact.key.toLocaleLowerCase() === fact.key.toLocaleLowerCase())) return true;
  if (fact.key.startsWith("metric:") || fact.key.startsWith("metric-word:")) {
    const identity = metricIdentity(fact.display);
    // A figure the claim attributes to the posting ("the job's approximately $4M portfolio") may come from it.
    if (supplementarySourceText && /\b(?:job|posting|role|position|listing|requirement)(?:['\u2019]s|s)?\b/iu.test(claim)
      && Array.from(supplementarySourceText.matchAll(/(?:exceeding|greater\s+than|more\s+than|over|less\s+than|under|about|approximately|roughly|up\s+to)?\s*[<>≤≥~≈]?\s*[+\-−]?\s*(?:[$€£¥₹]\s*)?\d[\d,]*(?:\.\d+)?(?:\s*%|[kmbx×](?![\p{L}\p{N}]))?\+?/giu))
        .some((match) => metricIdentity(match[0]) === identity)) return true;
    return sourceFacts.some((sourceFact) => (
      (sourceFact.key.startsWith("metric:") || sourceFact.key.startsWith("metric-word:"))
      && [identity, ...(identity.endsWith("+") ? [`>${identity.slice(0, -1)}`] : []),
        ...(identity.startsWith(">") ? [`${identity.slice(1)}+`] : [])].includes(metricIdentity(sourceFact.display))
    ));
  }
  if (fact.key.startsWith("entity:") || fact.key.startsWith("symbol:")) {
    if (evidenceContainsExactEntity(fact.display, sourceText, requirePositiveEntity)) return true;
    if (supplementarySourceText && evidenceContainsExactEntity(fact.display, supplementarySourceText, true)) return true;
    const available = new Set([
      ...Array.from(sourceTokens).flatMap(token => [token, ...entityIdentityTokens(token)]),
      ...sourceFacts.flatMap((sourceFact) => entityIdentityTokens(sourceFact.display)),
      // "P.E." splits into single letters as source tokens, so read the source's initialisms whole.
      ...(sourceText.match(/\b(?:\p{L}\.){2,}/gu) || []).flatMap(entityIdentityTokens),
    ]);
    const required = entityIdentityTokens(fact.display);
    return required.length > 0 && required.every((token) => available.has(token));
  }
  return false;
}

export function unsupportedPresenceDimensions(claim: string, sourceFacts: NarrativeFact[]) {
  const normalized = claim.normalize("NFKC").toLocaleLowerCase();
  const hasMetric = sourceFacts.some((fact) => fact.key.startsWith("metric:") || fact.key.startsWith("metric-word:"));
  const hasOutcome = hasMetric || sourceFacts.some((fact) => fact.key.startsWith("outcome:"));
  const unsupported: string[] = [];
  if (/\b(?:count|metric|number|scale|scope|size)\b/u.test(normalized) && !hasMetric) unsupported.push("measurable scope");
  if (/\b(?:impact|outcome|result)s?\b/u.test(normalized) && !hasOutcome) unsupported.push("verified outcome");
  return unsupported;
}

function countsRequestedExamples(fact: NarrativeFact, claim: string) {
  if (!fact.key.startsWith("metric-word:")) return false;
  const quantity = fact.display.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const quantityMatch = new RegExp(`\\b${quantity}\\b`, "iu").exec(claim);
  const prefix = claim.slice(0, quantityMatch?.index ?? 0);
  const requestHead = prefix.match(/^\s*(?:(?:first|then|finally),?\s+)?(?:(?:in|on|under|for|within)\b[^,;.!?]*,\s*)?(?:(?:you|(?:your|the)\s+[\p{L}\p{M} -]{1,60})\s+(?:can|could|should|need\s+to|needs\s+to)\s+)?(?:add|bring|choose|describe|explain|give|highlight|identify|include|keep|list|mention|move|name|note|pick|put|replace|review|revise|rewrite|select|show|specify|state|surface|use|write)\b/iu);
  const requestTail = requestHead ? prefix.slice(requestHead[0].length) : prefix;
  const questionRequest = /\b(?:what|which|how)\b/iu.test(prefix) && /\?\s*$/u.test(claim);
  // "A verified result from one client project would help" proposes an example; it doesn't count clients.
  const hypothetical = /^\s*(?:a|an)\s/iu.test(prefix)
    && /^one(?:\s+(?!(?:that|which|who)\b)[\p{L}-]+){0,4}\s+(?:would|could)\b/iu.test(claim.slice(quantityMatch?.index ?? 0));
  if ((!requestHead && !questionRequest && !hypothetical)
    || /\b(?:that|managed|served|led|owned|delivered|supported|handled)\b/iu.test(requestTail)) return false;
  // In a request or question, "one X" picks an example ("Name one type of employee concern"); it doesn't count Xs.
  if (/^one\b/iu.test(fact.display)) return true;
  if (new RegExp(`\\b${quantity}(?:\\s+or\\s+[\\p{L}-]+){0,2}\\s+(?:problems?|situations?|examples?|artifacts?|decisions?|cases?)\\b`, "iu").test(claim)) return true;
  // Hyphenated project names can otherwise look like a count of customers.
  if (/^one customer$/iu.test(fact.display)
    && /\bone customer-[\p{L}-]+(?:\s+[\p{L}-]+){0,5}\s+project\b/iu.test(claim)
    && /\b(?:name|describe|choose|include|give)\b/iu.test(claim)) return true;
  // A request to describe one project selects an example; it does not assert a project count.
  return /^(?:one|1)\b/iu.test(fact.display)
    && /\bprojects?$/iu.test(fact.display)
    && /\b(?:name|describe|choose|include|give)\b|^\s*(?:what|which|how)\b/iu.test(claim);
}

const countWords = "two|three|four|five|six|seven|eight|nine|ten|eleven|twelve";

/** "Beyond one team" compares with a stated count; it is supported only when the resume states two or more. */
function comparesBeyondOne(fact: NarrativeFact, claim: string, sourceText: string) {
  const noun = fact.key.startsWith("metric-word:") ? fact.display.match(/^one\s+([\p{L}-]+?)s?$/iu)?.[1] : undefined;
  if (!noun || !new RegExp(`\\b(?:beyond|more than|past|outside)\\s+one\\s+${noun}\\b`, "iu").test(claim)) return false;
  return new RegExp(`\\b(?:[2-9]|\\d{2,}|${countWords})\\+?\\s+(?:[\\p{L}-]+\\s+){0,2}${noun}s\\b`, "iu").test(sourceText);
}

function presenceStem(token: string) {
  const stem = token.replace(/(?:ing|ed|e)$/u, "");
  return stem.length >= 4 ? stem : token;
}

export function assessmentNarrativeIssues(input: {
  claim: string;
  sourceText: string;
  claimFacts: NarrativeFact[];
  claimTokens: Set<string>;
  sourceCandidates: Array<{ facts: NarrativeFact[]; tokens: Set<string> }>;
  assertsPresence: boolean;
  interpretive: boolean;
  directFactualAssertion: boolean;
  skipSpecificFacts: boolean;
  requirePresenceAnchor: boolean;
  contradictsNegativeSource: boolean;
  /** Check agency, outcome and causal claims even when the sentence is not a direct assertion. */
  checkTrackedClaims?: boolean;
  /** The posting, for entities in a claim about what the resume lacks. See factSupportedAcrossSource. */
  supplementarySourceText?: string;
  /** Claim tokens that are single words (no hyphen), the only ones a shared word root may anchor. */
  rootAnchorTokens?: Set<string>;
}) {
  const sourceFacts = input.sourceCandidates.flatMap((candidate) => candidate.facts);
  const sourceTokens = new Set(input.sourceCandidates.flatMap((candidate) => Array.from(candidate.tokens)));
  // The presence anchor needs one shared word; "practice" anchors to "Practicing".
  // An outcome noun ("growth") is neutral when the resume states an outcome ("Expanded ..."):
  // it neither anchors the claim nor counts against it.
  const sourceStems = new Set(Array.from(sourceTokens, presenceStem));
  // "internship" anchors to "Intern" and "consulting" to "Consultant": the anchor asks whether the claim is
  // about something on the page, so a shared six-letter root is enough for a single word. A hyphenated
  // compound is not anchored by its first half ("delivery-quality" is not the resume's "delivery speed").
  const sourceRoots = new Set(Array.from(sourceTokens).filter((token) => token.length >= 6).map((token) => token.slice(0, 6)));
  const sourceHasOutcome = sourceFacts.some((fact) => fact.key.startsWith("outcome:"));
  const presenceTokens = Array.from(input.claimTokens)
    .filter((token) => !(sourceHasOutcome && /^(?:growth|increase|improvement|reduction|expansion|gain)$/u.test(token)));
  const anchors = (token: string) => sourceTokens.has(token) || sourceStems.has(presenceStem(token))
    || (token.length >= 6 && input.rootAnchorTokens?.has(token) === true && sourceRoots.has(token.slice(0, 6)))
    // "COO" anchors to "Chief Operating Officer".
    || Boolean(roleAliases[token]?.length && roleAliases[token].every((part) => sourceTokens.has(part)));
  const assertive = input.directFactualAssertion;
  const peopleManagementAssessment = /\b(?:people|staff|team) (?:oversight|management)\b/iu.test(input.claim)
    && input.sourceCandidates.some(candidate => candidate.facts.some(fact => fact.key === "agency:manage")
      && ["people", "staff", "team", "employee"].some(token => candidate.tokens.has(token)));
  const factsToCheck = input.claimFacts.filter((fact) => (
    (!input.skipSpecificFacts && /^(?:entity|metric|metric-word|symbol):/u.test(fact.key)
      && !(!assertive && countsRequestedExamples(fact, input.claim))
      && !comparesBeyondOne(fact, input.claim, input.sourceText))
    || (assertive && /^(?:agency|outcome|causal):/u.test(fact.key))
    // Commentary: an agency or outcome claim must be in the resume, in any form the resume uses.
    || (!assertive && input.checkTrackedClaims && /^(?:agency|outcome|causal):/u.test(fact.key)
      && !(fact.key.startsWith("outcome:") && sourceStatesOutcomeFamily(fact.key, input.sourceText)))
  ));
  const unsupportedTokens = assertive
    ? Array.from(input.claimTokens).filter((token) => !sourceTokens.has(token))
    : input.requirePresenceAnchor && input.assertsPresence && presenceTokens.length > 0 && !peopleManagementAssessment
      && !/\b(?:count|impact|metric|number|outcome|result|scale|scope|size)s?\b/iu.test(input.claim)
      && !presenceTokens.some(anchors)
      ? presenceTokens
    : [];
  const unsupported = [
    ...(input.contradictsNegativeSource ? ["contradicts negative source evidence"] : []),
    ...factsToCheck
      .filter((fact) => !factSupportedAcrossSource(fact, sourceFacts, sourceTokens, assertive ? "" : input.sourceText, input.assertsPresence, assertive ? "" : input.supplementarySourceText || "", input.claim))
      .map((fact) => fact.display),
    ...unsupportedTokens,
    ...(input.assertsPresence ? unsupportedPresenceDimensions(input.claim, sourceFacts) : []),
  ];
  return unsupported.length > 0
    ? [{ claim: input.claim, unsupportedFacts: Array.from(new Set(unsupported)) }]
    : [];
}
