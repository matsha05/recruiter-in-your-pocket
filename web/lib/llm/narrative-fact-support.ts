import { normalizeNarrativeToken } from "./narrative-token-policy";
import { canonicalizeUserSourceText } from "../security/inputSanitization";

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

function entityIdentityTokens(value: string) {
  if (/^CI\/CD$/iu.test(value.trim())) return ["continuous", "integration", "delivery"];
  const tokenAliases: Record<string, string> = { apis: "api", arr: "annual-recurring-revenue", restful: "rest" };
  const tokens = (canonicalizeUserSourceText(value).replace(/\b([A-Z]{2,})s\b/gu, "$1").replace(/\b([\p{L}])\.(?=[\p{L}]\b)/gu, "$1")
    .replace(/([\p{Ll}\p{M}])([\p{Lu}])/gu, "$1 $2")
    .match(/[\p{L}\p{M}\d]+(?:[+#]|\.[\p{L}\p{M}\d]+)*/gu) || [])
    .map(normalizeNarrativeToken)
    .map((token) => tokenAliases[token] || token)
    .filter((token) => token.length > 1);
  const roleAliases: Record<string, string[]> = {
    "annual-recurring-revenue": ["annual", "recurring", "revenue"],
    bba: ["bachelor", "business", "administration"],
    bsba: ["bachelor", "science", "business", "administration"],
    ceo: ["chief", "executive", "officer"], cfo: ["chief", "financial", "officer"],
    cio: ["chief", "information", "officer"], cmo: ["chief", "marketing", "officer"],
    coo: ["chief", "operating", "officer"], cpo: ["chief", "product", "officer"],
    cto: ["chief", "technology", "officer"], kpi: ["key", "performance", "indicator"],
    kpis: ["key", "performance", "indicator"], rest: ["rest"], restful: ["rest"],
    pm: ["product", "manager"], pms: ["product", "manager"], vp: ["vice", "president"],
  };
  return tokens.flatMap(token => roleAliases[token] || [token]);
}

export function auditableNarrativeValue(path: string, value: string, sourceText = "", reportScore?: number) {
  // A report's displayed score is metadata, but any other number still needs support.
  if (path === "score_plain" && Number.isFinite(reportScore)) {
    value = value.replace(new RegExp(`\\b(?:At|score (?:of|is)) ${reportScore}\\b`, "i"), "At this score");
  }
  let auditable = (path === "biggest_gap_example" ? value.replace(/["“][^"”]+["”]/u, " ") : value).replace(/\bU\.S\./gu, "US");
  if (path.startsWith("section_review.Education.")) auditable = auditable.replace(/\b(?:B\.S|B\.Ed|M\.S|M\.Div)\.?/gu, (degree) => sourceText.includes(degree) ? " " : degree);
  return /[\p{L}\p{N}]/u.test(auditable) ? auditable : "";
}

export function isDirectFactualAssertion(value: string) {
  if (/\b(?:can|could|may|might) (?:mean|refer to|describe)\b/iu.test(value)) return false;
  return directFactualAssertionPattern.test(value.normalize("NFC"));
}

export function factSupportedAcrossSource(fact: NarrativeFact, sourceFacts: NarrativeFact[], sourceTokens: Set<string>) {
  if (sourceFacts.some((sourceFact) => sourceFact.key.toLocaleLowerCase() === fact.key.toLocaleLowerCase())) return true;
  if (fact.key.startsWith("metric:") || fact.key.startsWith("metric-word:")) {
    const identity = metricIdentity(fact.display);
    return sourceFacts.some((sourceFact) => (
      (sourceFact.key.startsWith("metric:") || sourceFact.key.startsWith("metric-word:"))
      && [identity, ...(identity.endsWith("+") ? [`>${identity.slice(0, -1)}`] : []),
        ...(identity.startsWith(">") ? [`${identity.slice(1)}+`] : [])].includes(metricIdentity(sourceFact.display))
    ));
  }
  if (fact.key.startsWith("entity:") || fact.key.startsWith("symbol:")) {
    const available = new Set([
      ...Array.from(sourceTokens).flatMap(token => [token, ...entityIdentityTokens(token)]),
      ...sourceFacts.flatMap((sourceFact) => entityIdentityTokens(sourceFact.display)),
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
  if (new RegExp(`\\b${quantity}\\s+(?:problems?|situations?|examples?|artifacts?|decisions?|cases?)\\b`, "iu").test(claim)) return true;
  // Hyphenated project names can otherwise look like a count of customers.
  if (/^one customer$/iu.test(fact.display)
    && /\bone customer-[\p{L}-]+(?:\s+[\p{L}-]+){0,5}\s+project\b/iu.test(claim)
    && /\b(?:name|describe|choose|include|give)\b/iu.test(claim)) return true;
  // A request to describe one project selects an example; it does not assert a project count.
  return /^(?:one|1)\b/iu.test(fact.display)
    && /\bprojects?$/iu.test(fact.display)
    && /\b(?:name|describe|choose|include|give)\b|^\s*(?:what|which|how)\b/iu.test(claim);
}

export function assessmentNarrativeIssues(input: {
  claim: string;
  claimFacts: NarrativeFact[];
  claimTokens: Set<string>;
  sourceCandidates: Array<{ facts: NarrativeFact[]; tokens: Set<string> }>;
  assertsPresence: boolean;
  interpretive: boolean;
  directFactualAssertion: boolean;
  skipSpecificFacts: boolean;
  requirePresenceAnchor: boolean;
  contradictsNegativeSource: boolean;
}) {
  const sourceFacts = input.sourceCandidates.flatMap((candidate) => candidate.facts);
  const sourceTokens = new Set(input.sourceCandidates.flatMap((candidate) => Array.from(candidate.tokens)));
  const assertive = input.directFactualAssertion;
  const peopleManagementAssessment = /\b(?:people|staff|team) (?:oversight|management)\b/iu.test(input.claim)
    && input.sourceCandidates.some(candidate => candidate.facts.some(fact => fact.key === "agency:manage")
      && ["people", "staff", "team", "employee"].some(token => candidate.tokens.has(token)));
  const factsToCheck = input.claimFacts.filter((fact) => (
    (!input.skipSpecificFacts && /^(?:entity|metric|metric-word|symbol):/u.test(fact.key)
      && !(!assertive && countsRequestedExamples(fact, input.claim)))
    || (assertive && /^(?:agency|outcome|causal):/u.test(fact.key))
  ));
  const unsupportedTokens = assertive
    ? Array.from(input.claimTokens).filter((token) => !sourceTokens.has(token))
    : input.requirePresenceAnchor && input.assertsPresence && input.claimTokens.size > 0 && !peopleManagementAssessment
      && !/\b(?:count|impact|metric|number|outcome|result|scale|scope|size)s?\b/iu.test(input.claim)
      && !Array.from(input.claimTokens).some((token) => sourceTokens.has(token))
      ? Array.from(input.claimTokens)
    : [];
  const unsupported = [
    ...(input.contradictsNegativeSource ? ["contradicts negative source evidence"] : []),
    ...factsToCheck
      .filter((fact) => !factSupportedAcrossSource(fact, sourceFacts, sourceTokens))
      .map((fact) => fact.display),
    ...unsupportedTokens,
    ...(input.assertsPresence ? unsupportedPresenceDimensions(input.claim, sourceFacts) : []),
  ];
  return unsupported.length > 0
    ? [{ claim: input.claim, unsupportedFacts: Array.from(new Set(unsupported)) }]
    : [];
}
