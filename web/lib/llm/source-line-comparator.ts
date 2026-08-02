const PUBLIC_SOURCE_EXCERPT_LIMIT = 140;

const LAYOUT_BULLET_PATTERN = /^[•●◦▪▫‣⁃]\s*/u;
const ASCII_LINE_BULLET_PATTERN = /^-\s+(?=[\p{L}\p{N}])/u;
const SOURCE_CONTINUATION_PATTERN = /[\p{L}\p{M}\p{N}\p{Pc}]/u;
const MEANING_BEARING_EDGE_PATTERN = /[+\-−<>=≤≥$€£¥₹%&\/.*#]/u;
const PLACEHOLDER_PATTERN = /\[[^\]]+\]/g;
const OUTCOME_PATTERN = /\b(?:achiev(?:e|ed|ing)|improv(?:e|ed|ing|ement)|increas(?:e|ed|ing)|reduc(?:e|ed|ing|tion)|streamlin(?:e|ed|ing)|enhanc(?:e|ed|ing)|boost(?:ed|ing)?|grew|growth|saved?|cut|accelerat(?:e|ed|ing)|generated?|result(?:ed|ing)?|enabled?)\b/gi;
const VERIFIED_OUTCOME_VERB_PATTERN = /\b(?:achieved|improved|increased|reduced|streamlined|enhanced|boosted|grew|saved|cut|decreased|accelerated|generated|resulted|enabled|raised|lowered)\b/i;

const ENTITY_TERMS = [
  "account", "accounts", "analyst", "analysts", "budget", "budgets", "campaign", "campaigns",
  "client", "clients", "customer", "customers", "department", "departments", "designer", "designers",
  "doctor", "doctors", "employee", "employees", "engineer", "engineers", "feature", "features", "finance", "hire", "hires",
  "engineering",
  "initiative", "initiatives", "marketing", "module", "modules", "officer", "officers", "organization",
  "organizations", "person", "people", "platform", "platforms", "product", "products", "program", "programs", "project", "projects",
  "record", "records", "region", "regions", "researcher", "researchers", "sales", "service", "services",
  "staff", "system", "systems", "team", "teams", "transaction", "transactions", "user", "users", "manager", "managers", "nurse", "nurses",
] as const;

const METRIC_SUBJECT_TERMS = [
  ...ENTITY_TERMS,
  "accuracy", "activation", "adoption", "availability", "backfill", "backfills", "churn", "clarity",
  "conversion", "cost", "costs", "efficiency", "engagement", "error", "errors", "latency", "performance",
  "productivity", "quality", "retention", "revenue", "satisfaction", "throughput", "uptime", "watch time",
] as const;

const OUTCOME_SUBJECT_ALIASES: Record<string, string> = {
  accuracy: "accuracy", activation: "activation", adoption: "adoption", availability: "availability",
  backfill: "backfill", backfills: "backfill", churn: "churn", clarity: "clarity", conversion: "conversion",
  cost: "cost", costs: "cost", efficiency: "efficiency", engagement: "engagement", error: "error", errors: "error",
  latency: "latency", performance: "performance", productivity: "productivity", quality: "quality",
  retention: "retention", revenue: "revenue", satisfaction: "satisfaction", throughput: "throughput",
  uptime: "uptime", "watch time": "watch time",
};

const WRITTEN_NUMBERS: Record<string, string> = {
  one: "1", two: "2", three: "3", four: "4", five: "5", six: "6",
  seven: "7", eight: "8", nine: "9", ten: "10", eleven: "11", twelve: "12",
};

const COMPLETED_WORK_PATTERN = /\b(?:achieved|built|completed|created|delivered|developed|designed|drove|expanded|generated|grew|implemented|improved|increased|launched|led|lowered|produced|raised|realized|reduced|rolled out|shipped|streamlined)\b/i;
const LIMITED_CONTRIBUTION_PATTERN = /\b(?:assisted|contributed|helped|participated|supported|worked on)\b/i;

const AGENCY_LEVELS: Array<{ level: number; pattern: RegExp }> = [
  { level: 1, pattern: /\b(?:assisted|helped|supported|participated|maintained)\b/gi },
  { level: 2, pattern: /\b(?:collaborated|contributed|coordinated|handled|partnered|served|worked alongside|worked with)\b/gi },
  { level: 3, pattern: /\b(?:built|created|developed|designed|implemented|introduced|launched|prepared|preparing|produced|shipped)\b/gi },
  { level: 4, pattern: /\b(?:directed|drove|headed|led|managed|owned|oversaw|secured|spearheaded)\b/gi },
];

const MODALITY_PAIRS: Array<{ source: RegExp; candidate: RegExp; detail: string }> = [
  {
    source: /\b(?:aimed|could|expected|may|might|planned|proposed|projected|recommended|targeted|decided to|decision to|influenc(?:e|ed|ing) the decision to)\b/i,
    candidate: /\b(?:achieved|completed|delivered|expanded|generated|grew|implemented|improved|increased|launched|lowered|produced|raised|realized|reduced|rolled out|saved|streamlined)\b/i,
    detail: "expected, targeted, planned, projected, or recommended work becomes completed work",
  },
  {
    source: /\b(?:associated with|contribut(?:e|ed|ing) to)\b/i,
    candidate: /\b(?:caused|drove|generated|grew|improved|increased|lowered|produced|raised|reduced|resulted in|saved)\b/i,
    detail: "association or contribution becomes direct causation",
  },
  {
    source: /\bwith a focus on\b/i,
    candidate: /\b(?:through|by means of|as a result of)\b/i,
    detail: "focus becomes causation",
  },
];

type SourceLineSpan = {
  text: string;
  start: number;
  end: number;
};

export type VerifiedFact = {
  key: string;
  value: string;
};

export type SourceComparisonIssueCode =
  | "source_missing"
  | "source_ambiguous"
  | "source_content_dropped"
  | "metric_added"
  | "metric_dropped"
  | "metric_sign_changed"
  | "metric_unit_changed"
  | "metric_qualifier_changed"
  | "metric_entity_changed"
  | "entity_scope_changed"
  | "named_fact_added"
  | "cross_line_transplant"
  | "agency_upgraded"
  | "modality_strengthened"
  | "unsupported_outcome"
  | "no_material_change";

export type SourceComparisonIssue = {
  code: SourceComparisonIssueCode;
  dimension: "binding" | "content" | "metric" | "scope" | "agency" | "modality";
  detail: string;
};

export type SourceBoundComparison = {
  safe: boolean;
  binding: {
    status: "exact_line" | "unique_window" | "ambiguous" | "missing";
    span?: { start: number; end: number };
    excerpt?: { text: string; truncatedBefore: boolean; truncatedAfter: boolean };
  };
  issues: SourceComparisonIssue[];
};

type MetricAtom = {
  raw: string;
  start: number;
  end: number;
  value: string;
  sign: "negative" | "positive" | "unsigned";
  unit: string;
  qualifier: string;
  entity: string;
  subject: string;
  relation: "from" | "to" | "";
};

export type UnsupportedNarrativeFact = Readonly<{
  kind: "metric" | "name";
  raw: string;
  start: number;
  end: number;
  issue: SourceComparisonIssue;
}>;

function derivedNarrativeMetricSupported(atom: MetricAtom, value: string, sourceText: string) {
  const before = value.slice(Math.max(0, atom.start - 48), atom.start);
  const after = value.slice(atom.end, atom.end + 32);
  const numericValue = Number(atom.value);
  if (!Number.isFinite(numericValue)) return false;

  // Report prose sometimes uses "one project" or "one metric" to point back
  // to a single, already-present example. The count is rhetorical rather than
  // a new scope claim, but only accept it when the source contains the named
  // kind of work at all.
  if (atom.value === "1") {
    const rhetoricalKind = [atom.entity, after.match(/^\s+(metric|project)\b/i)?.[1]?.toLowerCase()]
      .find((kind) => kind === "project" || kind === "metric");
    if (rhetoricalKind === "project" && /\bproject(?:s| ownership)?\b/i.test(sourceText)) return true;
    if (rhetoricalKind === "metric" && /\b(?:metric|measure|result|increase|reduction|improvement)\b/i.test(sourceText)) return true;
  }

  if (/^\s+roles?\b/i.test(after) && /^[a-z]+\s/i.test(atom.raw)) {
    const datedRanges = sourceText.match(
      /\b(?:19|20)\d{2}\s*[-–—]\s*(?:[A-Z][a-z]+\s+)?(?:(?:19|20)\d{2}|present|current)\b/gi,
    ) || [];
    if (datedRanges.length >= numericValue) return true;
  }

  if (atom.unit === "duration:year" && numericValue >= 4) {
    const years = Array.from(sourceText.matchAll(/\b((?:19|20)\d{2})\b/g), (match) => Number(match[1]));
    if (years.length >= 2) {
      const span = Math.max(...years) - Math.min(...years);
      if (span >= numericValue && span - numericValue <= 6) return true;
    }
  }

  if (/\bmentor(?:ed|ing)?\b/i.test(before)) {
    const mentoringLines = sourceLineSpans(sourceText).filter((line) => /\bmentor(?:ed|ing)?\b/i.test(line.text));
    if (mentoringLines.some((line) => {
      const counts = metricAtoms(line.text)
        .filter((sourceAtom) => sourceAtom.unit.startsWith("count:"))
        .map((sourceAtom) => Number(sourceAtom.value))
        .filter(Number.isFinite);
      return counts.length >= 2 && counts.reduce((sum, count) => sum + count, 0) === numericValue;
    })) return true;
  }

  return false;
}

function normalizedPhrasePresent(candidate: string, fact: string) {
  const phrase = (value: string) => normalizedWords(value)
    .split(" ")
    .map((token) => token.replace(/^[,;:]+|[.,;:]+$/g, ""))
    .filter(Boolean)
    .join(" ");
  const needle = phrase(fact);
  if (!needle) return false;
  return ` ${phrase(candidate)} `.includes(` ${needle} `);
}

function applicableVerifiedFacts(candidate: string, verifiedFacts: readonly VerifiedFact[]) {
  return verifiedFacts.filter((fact) =>
    typeof fact?.value === "string"
    && fact.value.trim().length > 0
    && normalizedPhrasePresent(candidate, fact.value),
  );
}

function stripOuterFormatting(value: string) {
  let current = value.trim();
  const pairs: Array<[string, string]> = [["\"", "\""], ["“", "”"], ["'", "'"], ["`", "`"]];
  let changed = true;
  while (changed && current.length > 1) {
    changed = false;
    for (const [open, close] of pairs) {
      if (current.startsWith(open) && current.endsWith(close)) {
        current = current.slice(open.length, -close.length).trim();
        changed = true;
      }
    }
  }
  return current;
}

export function canonicalSourceIdentity(value: string) {
  return stripOuterFormatting(value)
    .normalize("NFC")
    .trim()
    .replace(LAYOUT_BULLET_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();
}

function bindingIdentity(value: string) {
  return canonicalSourceIdentity(value).replace(ASCII_LINE_BULLET_PATTERN, "").trim();
}

function isInvariantSafeBoundary(value: string | undefined) {
  return !value
    || (!SOURCE_CONTINUATION_PATTERN.test(value) && !MEANING_BEARING_EDGE_PATTERN.test(value));
}

function containsInvariantSafeWindow(source: string, locator: string) {
  let start = source.indexOf(locator);
  while (start !== -1) {
    const before = start > 0 ? source[start - 1] : undefined;
    const afterIndex = start + locator.length;
    const after = afterIndex < source.length ? source[afterIndex] : undefined;
    if (isInvariantSafeBoundary(before) && isInvariantSafeBoundary(after)) return true;
    start = source.indexOf(locator, start + 1);
  }
  return false;
}

/** A result stated as completed work, not merely the name of a KPI such as "churn reduction". */
export function hasVerifiedOutcomeSignal(value: string) {
  const rateOrDelta = /\d+(?:\.\d+)?\s*%|\bfrom\s+(?:hours?|days?|weeks?|months?|\S+)\s+to\s+(?:minutes?|hours?|days?|weeks?|months?|\S+)\b/i.test(value);
  const financialOutcome = /(?:\$\s*\d+(?:\.\d+)?\s*[kmb]?[^.]{0,35}\b(?:revenue|savings?|profit|ARR|MRR|cost reduction)\b|\b(?:revenue|savings?|profit|ARR|MRR|cost reduction)\b[^.]{0,35}\$\s*\d)/i.test(value);
  const supportedImprovement = /\b(?:helped|helping)\b[^.;]{0,60}\b(?:improve|increase|reduce|streamline|enhance|boost|accelerate|raise|lower)\b/i.test(value);
  return VERIFIED_OUTCOME_VERB_PATTERN.test(value) || supportedImprovement || rateOrDelta || financialOutcome;
}

function sourceLineSpans(sourceText: string): SourceLineSpan[] {
  const spans: SourceLineSpan[] = [];
  let offset = 0;
  for (const raw of sourceText.split(/\r?\n/)) {
    const leading = raw.length - raw.trimStart().length;
    const text = raw.trim();
    if (text) spans.push({ text, start: offset + leading, end: offset + leading + text.length });
    offset += raw.length + 1;
  }
  return spans;
}

function resolveSourceLine(locator: string, sourceText: string) {
  const identity = bindingIdentity(locator);
  if (!identity) return { status: "missing" as const };
  const matches = sourceLineSpans(sourceText).filter((span) => {
    const lineIdentity = bindingIdentity(span.text);
    return lineIdentity === identity || containsInvariantSafeWindow(lineIdentity, identity);
  });
  if (matches.length === 0) return { status: "missing" as const };
  if (matches.length > 1) return { status: "ambiguous" as const };
  const span = matches[0];
  const lineIdentity = bindingIdentity(span.text);
  return {
    status: lineIdentity === identity ? "exact_line" as const : "unique_window" as const,
    span,
  };
}

/**
 * Exact, punctuation-preserving source binding. This deliberately performs no
 * fuzzy recovery: a sign, unit, qualifier, or entity change must never be
 * authorized by surrounding lexical overlap.
 */
export function resolveUniqueSourceLine(locator: string, sourceText: string) {
  const resolved = resolveSourceLine(locator, sourceText);
  return resolved.status === "exact_line" || resolved.status === "unique_window"
    ? resolved.span.text
    : null;
}

function sourceExcerpt(line: string, locator: string, maxLength: number) {
  const limit = Math.min(PUBLIC_SOURCE_EXCERPT_LIMIT, Math.max(1, maxLength));
  const exactLocator = stripOuterFormatting(locator).trim();
  if (exactLocator.length <= limit && line.includes(exactLocator)) {
    const start = line.indexOf(exactLocator);
    return {
      text: exactLocator,
      truncatedBefore: start > 0,
      truncatedAfter: start + exactLocator.length < line.length,
    };
  }
  if (line.length <= limit) {
    return { text: line, truncatedBefore: false, truncatedAfter: false };
  }
  return undefined;
}

/**
 * Returns a bounded, exact, meaning-complete source window. The complete line
 * remains internal and is never returned when it exceeds the public limit.
 */
export function boundedMeaningCompleteExcerpt(line: string, maxLength = PUBLIC_SOURCE_EXCERPT_LIMIT) {
  const limit = Math.min(PUBLIC_SOURCE_EXCERPT_LIMIT, Math.max(1, maxLength));
  const trimmed = line.trim();
  if (trimmed.length <= limit) return trimmed;

  const starts = new Set<number>();
  for (const match of trimmed.matchAll(/(?:[,;:—]\s+|\bto\s+)(?=[\p{L}\p{N}])/gu)) {
    if (match.index === undefined) continue;
    starts.add(match.index + match[0].length);
  }
  const candidates = Array.from(starts)
    .map((start) => trimmed.slice(start).trim())
    .filter((candidate) => candidate.length >= 24 && candidate.length <= limit)
    .sort((left, right) => right.length - left.length);
  return candidates[0] || null;
}

function normalizedWords(value: string) {
  return bindingIdentity(value)
    .toLowerCase()
    .replace(PLACEHOLDER_PATTERN, " ")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}%$€£¥₹+<>=&/.\-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalEntityTerm(value: string) {
  if (value === "engineering") return "engineer";
  if (value.endsWith("s") && ENTITY_TERMS.includes(value.slice(0, -1) as typeof ENTITY_TERMS[number])) {
    return value.slice(0, -1);
  }
  return value;
}

function canonicalOpenEntityTerm(value: string) {
  const lower = value.toLowerCase();
  const known = canonicalEntityTerm(lower);
  if (known !== lower) return known;
  if (lower.endsWith("ies") && lower.length > 4) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith("s") && !lower.endsWith("ss") && lower.length > 3) return lower.slice(0, -1);
  return lower;
}

const ENTITY_PATTERN_SOURCE = [...ENTITY_TERMS]
  .sort((left, right) => right.length - left.length)
  .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

const COUNT_ENTITY_MODIFIER_SOURCE = "(?:active|ad|annual|beta|daily|data|early-career|enterprise|global|major|monthly|new|technical|transaction|weekly)";

function immediateEntity(value: string) {
  const match = value.match(new RegExp(
    `^\\s*(?:(?:for|across|among|with|of)\\s+)?(?:(?:active|ad|annual|beta|daily|data|early-career|enterprise|global|major|monthly|new|technical|transaction|weekly)\\s+){0,2}(${ENTITY_PATTERN_SOURCE})\\b`,
    "i",
  ));
  if (match?.[1]) return canonicalEntityTerm(match[1].toLowerCase());
  const openVocabulary = value.match(
    /^\s*(?:(?:for|across|among|with|of)\s+)?(?:(?:active|ad|annual|beta|daily|data|early-career|enterprise|global|major|monthly|new|technical|transaction|weekly)\s+){0,2}([\p{L}][\p{L}-]{2,})\b/iu,
  )?.[1]?.toLowerCase() || "";
  if (!openVocabulary || [
    "and", "but", "from", "into", "more", "less", "than", "that", "the", "then", "through",
    "to", "was", "were", "while", "within", "with", "without",
  ].includes(openVocabulary)) return "";
  return canonicalOpenEntityTerm(openVocabulary);
}

function canonicalMetricSubject(value: string) {
  const lower = value.toLowerCase();
  if (OUTCOME_SUBJECT_ALIASES[lower]) return OUTCOME_SUBJECT_ALIASES[lower];
  return canonicalEntityTerm(lower);
}

function localMetricSubject(before: string, after: string) {
  const lowerBefore = before.toLowerCase();
  const candidates = METRIC_SUBJECT_TERMS.flatMap((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = Array.from(lowerBefore.matchAll(new RegExp(`\\b${escaped}\\b`, "gi")));
    const index = matches.at(-1)?.index;
    return index === undefined ? [] : [{ term, index }];
  }).sort((left, right) => right.index - left.index);
  if (candidates[0] && lowerBefore.length - (candidates[0].index + candidates[0].term.length) <= 36) {
    return canonicalMetricSubject(candidates[0].term);
  }
  const afterMatch = after.slice(0, 36).toLowerCase().match(new RegExp(`\\b(${[...METRIC_SUBJECT_TERMS]
    .sort((left, right) => right.length - left.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})\\b`, "i"));
  return canonicalMetricSubject(afterMatch?.[1] || "");
}

function normalizedMetricUnit(currency: string, magnitude: string, entity: string) {
  const normalizedMagnitude = magnitude.trim().toLowerCase().replace("percent", "%").replace(/s$/, "");
  if (currency.trim()) return `currency:${currency.trim()}:${normalizedMagnitude || "base"}`;
  if (normalizedMagnitude === "%") return "percent";
  if (normalizedMagnitude === "x") return "multiplier";
  if (["k", "m", "b", "million", "billion"].includes(normalizedMagnitude)) return `magnitude:${normalizedMagnitude}`;
  if (["second", "minute", "hour", "day", "week", "month", "year"].includes(normalizedMagnitude)) return `duration:${normalizedMagnitude}`;
  if (entity) return `count:${entity}`;
  return "scalar";
}

function normalizedQualifier(word: string, symbol: string, plus: string) {
  if (plus.trim()) return "greater-than";
  const raw = (symbol || word).toLowerCase().replace(/\s+/g, "-");
  if (["around", "approximately", "about", "roughly"].includes(raw)) return "approximate";
  if ([">", "over", "more-than"].includes(raw)) return "greater-than";
  if ([">=", "≥", "at-least", "minimum-of", "a-minimum-of"].includes(raw)) return "at-least";
  if (["<=", "≤", "at-most", "up-to"].includes(raw)) return "at-most";
  if (["<", "fewer-than", "less-than"].includes(raw)) return "less-than";
  return raw;
}

function metricRelation(before: string): MetricAtom["relation"] {
  return (before.match(/\b(from|to)\s*$/i)?.[1]?.toLowerCase() as MetricAtom["relation"] | undefined) || "";
}

function metricAtoms(value: string): MetricAtom[] {
  const visible = value.replace(PLACEHOLDER_PATTERN, " ");
  const pattern = /(?<![\p{L}\p{N}])(?:(around|at most|over|more than|at least|a minimum of|minimum of|approximately|about|roughly|nearly|up to|fewer than|less than)\s+)?([<>≤≥])?\s*([$€£¥₹]\s*)?([+\-−]?\d+(?:,\d{3})*(?:\.\d+)?)(\s*(?:%|percent|x|k|m|b|million|billion|seconds?|minutes?|hours?|days?|weeks?|months?|years?))?(\+|\s+plus)?(?=$|[\s,.;:)\]])/giu;
  const atoms: MetricAtom[] = [];
  for (const match of visible.matchAll(pattern)) {
    if (match.index === undefined) continue;
    const [, qualifierWord = "", symbolicQualifier = "", currency = "", numeric, magnitude = "", plus = ""] = match;
    const sign = numeric.startsWith("-") || numeric.startsWith("−")
      ? "negative"
      : numeric.startsWith("+") ? "positive" : "unsigned";
    const valueNumber = numeric.replace(/^[+\-−]/, "").replace(/,/g, "");
    const before = visible.slice(Math.max(0, match.index - 72), match.index);
    const after = visible.slice(match.index + match[0].length, match.index + match[0].length + 72);
    // A currency amount is already a fully typed metric. Treating the next
    // prose word as its count entity turns harmless phrasing such as
    // "$3.2M result" versus "$3.2M for Example Inc." into a false mismatch.
    // Unprefixed counts still use the open-vocabulary entity binding below.
    const percentOrMultiplier = /^\s*(?:%|percent\b|x\b)/i.test(magnitude);
    const explicitlyAttachedEntity = /^\s*(?:for|across|among|with|of)\b/i.test(after);
    const entity = currency.trim() || (percentOrMultiplier && !explicitlyAttachedEntity)
      ? ""
      : immediateEntity(after);
    const unit = normalizedMetricUnit(currency, magnitude, entity);
    const qualifier = normalizedQualifier(qualifierWord, symbolicQualifier, plus);
    const attachedSubject = localMetricSubject(before, after);
    const subject = attachedSubject === entity ? "" : attachedSubject;
    atoms.push({
      raw: match[0].trim(),
      start: match.index,
      end: match.index + match[0].length,
      value: valueNumber,
      sign,
      unit,
      qualifier,
      entity,
      subject,
      relation: metricRelation(before),
    });
  }

  const numericHyphenPattern = new RegExp(
    `(?<![\\p{L}\\p{N}])(?:(around|at most|over|more than|at least|a minimum of|minimum of|approximately|about|roughly|nearly|up to|fewer than|less than)\\s+)?([<>≤≥])?\\s*([+\\-−]?\\d+(?:,\\d{3})*(?:\\.\\d+)?)(\\+)?[-‑](seconds?|minutes?|hours?|days?|weeks?|months?|years?|${ENTITY_PATTERN_SOURCE})\\b`,
    "giu",
  );
  for (const match of visible.matchAll(numericHyphenPattern)) {
    if (match.index === undefined) continue;
    const [, qualifierWord = "", symbolicQualifier = "", numeric, plus = "", rawUnit] = match;
    const sign = numeric.startsWith("-") || numeric.startsWith("−")
      ? "negative" as const
      : numeric.startsWith("+") ? "positive" as const : "unsigned" as const;
    const entity = /^(?:seconds?|minutes?|hours?|days?|weeks?|months?|years?)$/i.test(rawUnit) ? "" : canonicalEntityTerm(rawUnit.toLowerCase());
    const before = visible.slice(Math.max(0, match.index - 72), match.index);
    const after = visible.slice(match.index + match[0].length, match.index + match[0].length + 72);
    atoms.push({
      raw: match[0].trim(),
      start: match.index,
      end: match.index + match[0].length,
      value: numeric.replace(/^[+\-−]/, "").replace(/,/g, ""),
      sign,
      unit: normalizedMetricUnit("", entity ? "" : rawUnit, entity),
      qualifier: normalizedQualifier(qualifierWord, symbolicQualifier, plus),
      entity,
      subject: localMetricSubject(before, after),
      relation: metricRelation(before),
    });
  }

  const writtenPattern = new RegExp(
    `(?<![\\p{L}\\p{N}])(?:(around|at most|over|more than|at least|a minimum of|minimum of|approximately|about|roughly|nearly|up to|fewer than|less than)\\s+)?(${Object.keys(WRITTEN_NUMBERS).join("|")})(\\s+plus|\\+)?[\\s-]+(?:${COUNT_ENTITY_MODIFIER_SOURCE}\\s+){0,2}(seconds?|minutes?|hours?|days?|weeks?|months?|years?|${ENTITY_PATTERN_SOURCE})\\b`,
    "giu",
  );
  for (const match of visible.matchAll(writtenPattern)) {
    if (match.index === undefined) continue;
    const [, qualifierWord = "", numberWord, plus = "", rawUnit] = match;
    const entity = /^(?:seconds?|minutes?|hours?|days?|weeks?|months?|years?)$/i.test(rawUnit) ? "" : canonicalEntityTerm(rawUnit.toLowerCase());
    const magnitude = entity ? "" : rawUnit;
    const before = visible.slice(Math.max(0, match.index - 72), match.index);
    const after = visible.slice(match.index + match[0].length, match.index + match[0].length + 72);
    atoms.push({
      raw: match[0].trim(),
      start: match.index,
      end: match.index + match[0].length,
      value: WRITTEN_NUMBERS[numberWord.toLowerCase()],
      sign: "unsigned",
      unit: normalizedMetricUnit("", magnitude, entity),
      qualifier: normalizedQualifier(qualifierWord, "", plus),
      entity,
      subject: localMetricSubject(before, after),
      relation: metricRelation(before),
    });
  }
  return atoms;
}

function exactMetricMatch(left: MetricAtom, right: MetricAtom) {
  return left.value === right.value
    && left.sign === right.sign
    && left.unit === right.unit
    && left.qualifier === right.qualifier
    && left.entity === right.entity
    && left.subject === right.subject
    && left.relation === right.relation;
}

function narrativeMetricMatch(left: MetricAtom, right: MetricAtom) {
  const sameCalendarYear = /^\d{4}$/.test(left.value) && /^\d{4}$/.test(right.value);
  const sameTeamCount = left.subject === "team"
    && right.subject === "team"
    && (left.entity === "person" || right.entity === "person" || !left.entity || !right.entity);
  const sameDuration = left.unit === right.unit && left.unit.startsWith("duration:");
  return left.value === right.value
    && left.sign === right.sign
    && (left.unit === right.unit || sameTeamCount || sameCalendarYear)
    && left.qualifier === right.qualifier
    && (left.entity === right.entity || sameTeamCount || sameCalendarYear || sameDuration);
}

function metricMismatchIssue(atom: MetricAtom, sourceAtoms: MetricAtom[]): SourceComparisonIssue | null {
  if (sourceAtoms.some((sourceAtom) => exactMetricMatch(sourceAtom, atom))) return null;
  const sameValue = sourceAtoms.find((sourceAtom) => sourceAtom.value === atom.value);
  if (!sameValue) {
    return { code: "metric_added", dimension: "metric", detail: `candidate adds ${atom.raw} outside the source` };
  }
  if (sameValue.sign !== atom.sign) {
    return { code: "metric_sign_changed", dimension: "metric", detail: `${sameValue.raw} becomes ${atom.raw}` };
  }
  if (sameValue.unit !== atom.unit) {
    if (sameValue.unit.startsWith("count:") && atom.unit.startsWith("count:")) {
      return {
        code: "metric_entity_changed",
        dimension: "metric",
        detail: `${sameValue.raw} changes attached entity or scope`,
      };
    }
    return { code: "metric_unit_changed", dimension: "metric", detail: `${sameValue.raw} changes unit` };
  }
  if (sameValue.qualifier !== atom.qualifier) {
    return { code: "metric_qualifier_changed", dimension: "metric", detail: `${sameValue.raw} changes qualifier` };
  }
  return {
    code: "metric_entity_changed",
    dimension: "metric",
    detail: `${sameValue.raw} changes attached entity or scope`,
  };
}

const GENERIC_NAMED_FACT_WORDS = new Set([
  "A", "An", "And", "As", "At", "For", "From", "How", "If", "In", "No", "Of", "On", "Or",
  "Our", "Resume", "The", "This", "To", "What", "When", "Where", "Which", "Who", "Why", "With", "Without", "Your",
  // Role, report, and evaluation vocabulary is classification language rather
  // than a named external fact. Mixed phrases still retain any non-generic
  // company, project, product, or provider name for verification.
  "Associate", "Director", "Engineer", "Engineering", "Experience", "Growth", "IC", "Lead", "Learning",
  "Machine", "Manager", "Principal", "Product", "Recommendations", "Resume", "Senior", "Scientist", "Staff",
  "Vice", "Work", "President", "Platform", "Ranking", "ATS", "AI", "CMO", "HR", "HRBP", "KPI", "ML", "VP",
  "Analysis", "Analyst", "Backend", "Business", "Chief", "Cloud", "Coordinator", "Corporate", "Customer",
  "Data", "Design", "Development", "Executive", "Finance", "Financial", "Human", "Java", "Logistics",
  "Marketing", "Management", "Officer", "Operations", "People", "Portfolio", "Resources", "Revenue",
  "Sales", "Science", "Services", "Software", "Supply", "Technical", "Technology", "Talent", "UX",
  "Integrated", "Production", "Quantified", "Scaled", "During", "Show", "Tighten", "FP&A",
]);

const GENERIC_NAMED_ACRONYMS = new Set([
  "AI", "ATS", "CEO", "CFO", "CHRO", "CMO", "FP&A", "HR", "HRBP", "IC", "IT", "KPI", "ML", "QA", "UX", "VP",
]);

function highConfidenceNamedFact(value: string) {
  if (/^(?:\.NET|A\/B|R&D)$/i.test(value)) return true;
  if (/^(?:AI|ATS|CEO|CFO|CHRO|CMO|FP&A|HR|HRBP|IC|IT|KPI|ML|QA|UX|VP)(?:-level)?$/i.test(value)) return false;
  const words = value.split(/\s+/).filter(Boolean);
  if (words.some((word) => /[a-z][A-Z]/.test(word))) return true;
  const acronyms = words.filter((word) => /^[A-Z]{2,}(?:[.&/+-][A-Za-z0-9]+)*$/.test(word));
  if (acronyms.some((word) => !GENERIC_NAMED_ACRONYMS.has(word))) return true;
  const canonicalWords = words.map((word) => word.toLowerCase().replace(/[^a-z]/g, "")).filter(Boolean);
  const suffixes = new Set([
    "analytics", "cloud", "company", "corp", "corporation", "inc", "llc", "ltd", "software", "systems",
    "technologies", "technology",
  ]);
  if (canonicalWords.length >= 2 && suffixes.has(canonicalWords.at(-1)!)) return true;
  if (canonicalWords.length >= 2 && ["initiative", "operation", "program", "project"].includes(canonicalWords[0])) {
    return !GENERIC_NAMED_FACT_WORDS.has(words[1]);
  }
  return false;
}

function canonicalNamedFact(value: string) {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function namedFactSpans(value: string) {
  const spans: Array<{ raw: string; start: number; end: number }> = [];
  const pattern = /\.NET\b|\bA\/B\b|\b(?:[A-Z][a-z]+|[A-Z]{2,}|[A-Za-z]*[a-z][A-Z][A-Za-z0-9]*)(?:\s+(?:[A-Z][a-z]+|[A-Z]{2,}|Inc\.?|LLC|Ltd\.?|Corp\.?|Corporation|Company|Cloud)){1,4}\b|\b[A-Z]{2,}(?:[.&/+-][A-Za-z0-9]+)*\b|\b[A-Za-z]*[a-z][A-Z][A-Za-z0-9]*\b/g;
  for (const match of value.matchAll(pattern)) {
    if (match.index === undefined) continue;
    let raw = match[0];
    let start = match.index;
    const words = raw.split(/\s+/);
    while (words.length > 1 && GENERIC_NAMED_FACT_WORDS.has(words[0])) {
      const removed = words.shift()!;
      start += removed.length + 1;
    }
    raw = words.join(" ");
    if (!raw || GENERIC_NAMED_FACT_WORDS.has(raw)) continue;
    if (!highConfidenceNamedFact(raw)) continue;
    spans.push({ raw, start, end: start + raw.length });
  }
  return spans;
}

function sourceContainsNamedFact(sourceText: string, raw: string) {
  const source = canonicalNamedFact(sourceText);
  const fact = canonicalNamedFact(raw);
  if (!fact) return true;
  const aliases = new Set([fact]);
  if (fact === "ml") aliases.add("machine learning");
  if (fact === "ai") aliases.add("artificial intelligence");
  if (/\bml\b/.test(fact)) aliases.add(fact.replace(/\bml\b/g, "machine learning"));
  if (/\bai\b/.test(fact)) aliases.add(fact.replace(/\bai\b/g, "artificial intelligence"));
  if (fact === "kpi") {
    aliases.add("key performance indicator");
    aliases.add("key performance indicators");
  }
  return Array.from(aliases).some((candidate) => (` ${source} `).includes(` ${candidate} `));
}

/**
 * Finds concrete facts in public narrative text that are not present with the
 * same value, unit, qualifier, entity, or name in the candidate-owned source.
 */
export function unsupportedNarrativeFacts(
  value: string,
  sourceText: string,
  options: { checkNames?: boolean } = {},
): UnsupportedNarrativeFact[] {
  const sourceAtoms = sourceLineSpans(sourceText).flatMap((line) => metricAtoms(line.text));
  const findings: UnsupportedNarrativeFact[] = [];
  for (const atom of metricAtoms(value)) {
    if (sourceAtoms.some((sourceAtom) => narrativeMetricMatch(sourceAtom, atom))) continue;
    if (derivedNarrativeMetricSupported(atom, value, sourceText)) continue;
    const issue = metricMismatchIssue(atom, sourceAtoms);
    if (issue) {
      findings.push({ kind: "metric", raw: atom.raw, start: atom.start, end: atom.end, issue });
    }
  }
  if (options.checkNames !== false) {
    for (const fact of namedFactSpans(value)) {
      if (sourceContainsNamedFact(sourceText, fact.raw)) continue;
      findings.push({
        kind: "name",
        ...fact,
        issue: {
          code: "named_fact_added",
          dimension: "scope",
          detail: `candidate adds named fact ${fact.raw} outside the source`,
        },
      });
    }
  }
  return findings.sort((left, right) => left.start - right.start || right.end - left.end);
}

function metricIssues(source: string, candidate: string, verifiedFacts: readonly VerifiedFact[]) {
  const issues: SourceComparisonIssue[] = [];
  const sourceAtoms = metricAtoms(source);
  const verifiedAtoms = verifiedFacts.flatMap((fact) => metricAtoms(fact.value));
  const candidateAtoms = metricAtoms(candidate);
  for (const atom of candidateAtoms) {
    if (sourceAtoms.some((sourceAtom) => exactMetricMatch(sourceAtom, atom))
      || verifiedAtoms.some((verifiedAtom) => narrativeMetricMatch(verifiedAtom, atom))) continue;
    const mismatch = metricMismatchIssue(atom, sourceAtoms);
    if (mismatch) issues.push(mismatch);
  }
  for (const atom of sourceAtoms) {
    if (!candidateAtoms.some((candidateAtom) => exactMetricMatch(atom, candidateAtom))) {
      issues.push({ code: "metric_dropped", dimension: "metric", detail: `candidate drops ${atom.raw} from the bound source line` });
    }
  }
  return issues;
}

function scopeIssues(source: string, candidate: string, verifiedFacts: readonly VerifiedFact[]) {
  const visibleCandidate = candidate.replace(PLACEHOLDER_PATTERN, " ");
  const authorizedSource = [source, ...verifiedFacts.map((fact) => fact.value)].join(" ");
  const sourceEntities = new Set(ENTITY_TERMS.filter((term) => new RegExp(`\\b${term}\\b`, "i").test(source)).map(canonicalEntityTerm));
  const authorizedEntities = new Set(ENTITY_TERMS.filter((term) => new RegExp(`\\b${term}\\b`, "i").test(authorizedSource)).map(canonicalEntityTerm));
  const candidateEntities = new Set(ENTITY_TERMS.filter((term) => new RegExp(`\\b${term}\\b`, "i").test(visibleCandidate)).map(canonicalEntityTerm));
  const introduced = Array.from(candidateEntities).filter((entity) => !authorizedEntities.has(entity));
  const dropped = Array.from(sourceEntities).filter((entity) => !candidateEntities.has(entity));
  const droppedNamedFacts = namedFactSpans(source)
    .map((fact) => fact.raw)
    .filter((fact) => !sourceContainsNamedFact(visibleCandidate, fact));
  const teamCardinalityChanged = /\b(?:a\s+)?team\s+of\b/i.test(source)
    && /\bteams\s+of\b/i.test(visibleCandidate);
  const properNounSubstitution = (() => {
    const ignored = new Set([
      ...ENTITY_TERMS,
      "built", "created", "delivered", "developed", "designed", "directed", "drove", "handled", "improved",
      "increased", "led", "managed", "owned", "prepared", "reduced", "served", "supported", "worked",
    ]);
    const extract = (value: string) => {
      const firstWordIndex = value.search(/[\p{L}\p{N}]/u);
      return new Set(Array.from(value.matchAll(/\b[A-Z][A-Za-z0-9]*(?:[.&-][A-Za-z0-9]+)*\b/g))
        .filter((match) => match.index !== firstWordIndex)
        .map((match) => match[0].toLowerCase())
        .filter((term) => !ignored.has(term)));
    };
    const sourceProper = extract(authorizedSource);
    const candidateProper = extract(visibleCandidate);
    if (sourceProper.size === 0 || candidateProper.size === 0) return false;
    return Array.from(sourceProper).some((term) => !candidateProper.has(term))
      && Array.from(candidateProper).some((term) => !sourceProper.has(term));
  })();
  if (introduced.length > 0 || dropped.length > 0 || droppedNamedFacts.length > 0 || teamCardinalityChanged || properNounSubstitution) {
    return [{
      code: droppedNamedFacts.length > 0 ? "source_content_dropped" as const : "entity_scope_changed" as const,
      dimension: droppedNamedFacts.length > 0 ? "content" as const : "scope" as const,
      detail: introduced.length > 0
        ? `candidate adds source-line scope: ${introduced.join(", ")}`
        : dropped.length > 0
          ? `candidate drops source-line scope: ${dropped.join(", ")}`
          : droppedNamedFacts.length > 0
            ? `candidate drops named source fact: ${droppedNamedFacts.join(", ")}`
          : teamCardinalityChanged
            ? "candidate changes one team into multiple teams"
            : "candidate substitutes a named source entity",
    }];
  }
  return [];
}

function strongestAgency(value: string) {
  let strongest = { level: 0, terms: [] as string[] };
  for (const { level, pattern } of AGENCY_LEVELS) {
    const terms = Array.from(value.matchAll(pattern))
      .filter((match) => {
        if (match.index === undefined) return false;
        const after = value.slice(match.index + match[0].length);
        const before = value.slice(Math.max(0, match.index - 20), match.index);
        return !/^\s+by\b/i.test(after)
          && !/(?:\bnever|\bnot|\bno|\bdid\s+not|\bdidn't)\s*$/i.test(before);
      })
      .map((match) => match[0].toLowerCase());
    if (terms.length > 0 && level >= strongest.level) {
      strongest = { level, terms };
    }
    pattern.lastIndex = 0;
  }
  return strongest;
}

function agencyIssues(source: string, candidate: string) {
  const sourceAgency = strongestAgency(source);
  const candidateAgency = strongestAgency(candidate.replace(PLACEHOLDER_PATTERN, " "));
  return candidateAgency.level > sourceAgency.level
    ? Array.from(new Set(candidateAgency.terms)).map((term) => ({
      code: "agency_upgraded" as const,
      dimension: "agency" as const,
      detail: term,
    }))
    : [];
}

function modalityIssues(source: string, candidate: string) {
  const visibleCandidate = candidate.replace(PLACEHOLDER_PATTERN, " ");
  const issues = MODALITY_PAIRS
    .filter((pair) => pair.source.test(source) && pair.candidate.test(visibleCandidate))
    .map((pair) => ({ code: "modality_strengthened" as const, dimension: "modality" as const, detail: pair.detail }));
  if (
    LIMITED_CONTRIBUTION_PATTERN.test(source)
    && !LIMITED_CONTRIBUTION_PATTERN.test(visibleCandidate)
    && COMPLETED_WORK_PATTERN.test(visibleCandidate)
  ) {
    issues.push({
      code: "modality_strengthened",
      dimension: "modality",
      detail: "supporting or contributing work becomes direct completed ownership",
    });
  }
  return issues;
}

type OutcomeClaim = { subject: string; direction: "increase" | "decrease" | "neutral" };

const OUTCOME_ACTION_PATTERN = /\b(?:achieved|accelerated|boosted|cut|decreased|delivered|enabled|enhanced|generated|grew|improve|improved|improving|increase|increased|increasing|lowered|raised|reduce|reduced|reducing|resulted|saved|streamlined)\b/gi;

function outcomeDirection(verb: string): OutcomeClaim["direction"] {
  if (/^(?:boosted|enhanced|grew|improve|improved|improving|increase|increased|increasing|raised)$/i.test(verb)) return "increase";
  if (/^(?:cut|decreased|lowered|reduce|reduced|reducing|saved)$/i.test(verb)) return "decrease";
  return "neutral";
}

function outcomeSubject(value: string) {
  const lower = value.toLowerCase();
  const matches = Object.keys(OUTCOME_SUBJECT_ALIASES).flatMap((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const index = lower.search(new RegExp(`\\b${escaped}\\b`, "i"));
    return index >= 0 ? [{ term, index }] : [];
  }).sort((left, right) => left.index - right.index || right.term.length - left.term.length);
  return matches[0] ? OUTCOME_SUBJECT_ALIASES[matches[0].term] : "";
}

function outcomeClaims(value: string) {
  const visible = value.replace(PLACEHOLDER_PATTERN, " ");
  const matches = Array.from(visible.matchAll(OUTCOME_ACTION_PATTERN));
  OUTCOME_ACTION_PATTERN.lastIndex = 0;
  const actionClaims = matches.flatMap((match, index) => {
    if (match.index === undefined) return [];
    const segmentStart = match.index + match[0].length;
    const segmentEnd = matches[index + 1]?.index ?? Math.min(visible.length, segmentStart + 72);
    const subject = outcomeSubject(visible.slice(segmentStart, segmentEnd));
    return subject ? [{ subject, direction: outcomeDirection(match[0]) }] : [];
  });
  const subjectPattern = Object.keys(OUTCOME_SUBJECT_ALIASES)
    .sort((left, right) => right.length - left.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const nominalPattern = new RegExp(
    `\\b(reduction|decrease|drop|increase|improvement|growth)\\s+(?:(?:in|of)\\s+)?(${subjectPattern})\\b`,
    "gi",
  );
  const nominalClaims = Array.from(visible.matchAll(nominalPattern)).map((match) => ({
    subject: canonicalMetricSubject(match[2]),
    direction: /^(?:reduction|decrease|drop)$/i.test(match[1]) ? "decrease" as const : "increase" as const,
  }));
  return Array.from(new Map([...actionClaims, ...nominalClaims]
    .map((claim) => [`${claim.subject}:${claim.direction}`, claim])).values());
}

function unsupportedOutcomeIssues(
  source: string,
  candidate: string,
  verifiedFacts: readonly VerifiedFact[],
): SourceComparisonIssue[] {
  const visibleCandidate = candidate
    .replace(PLACEHOLDER_PATTERN, " ")
    .replace(/\b(?:deployment\s+)?(?:result|outcome|impact|change)\s*:\s*(?=[.;]|$)/gi, " ");
  const sourceClaims = outcomeClaims(source);
  const verifiedClaims = outcomeClaims(verifiedFacts.map((fact) => fact.value).join(" "));
  const candidateClaims = outcomeClaims(visibleCandidate);
  const issues: SourceComparisonIssue[] = [];
  const hasVerifiedOutcomeReplacement = verifiedFacts.some((fact) =>
    /\b(?:outcome|result|impact)\b/i.test(fact.key) || hasVerifiedOutcomeSignal(fact.value),
  );

  for (const claim of candidateClaims) {
    const matching = [...sourceClaims, ...verifiedClaims].find((sourceClaim) => sourceClaim.subject === claim.subject);
    if (!matching) {
      issues.push({
        code: "unsupported_outcome",
        dimension: "modality",
        detail: `candidate substitutes or adds the ${claim.subject} outcome`,
      });
    } else if (
      matching.direction !== "neutral"
      && claim.direction !== "neutral"
      && matching.direction !== claim.direction
    ) {
      issues.push({
        code: "modality_strengthened",
        dimension: "modality",
        detail: `candidate reverses the direction of the ${claim.subject} outcome`,
      });
    }
  }
  for (const claim of sourceClaims) {
    if (hasVerifiedOutcomeReplacement) continue;
    if (!candidateClaims.some((candidateClaim) => candidateClaim.subject === claim.subject)) {
      issues.push({
        code: "source_content_dropped",
        dimension: "content",
        detail: `candidate drops the ${claim.subject} outcome from the bound source line`,
      });
    }
  }

  if (sourceClaims.length === 0 && candidateClaims.length === 0) {
    OUTCOME_PATTERN.lastIndex = 0;
    const sourceTokens = new Set(Array.from(source.matchAll(OUTCOME_PATTERN), (match) => match[0].toLowerCase()));
    OUTCOME_PATTERN.lastIndex = 0;
    const added = Array.from(visibleCandidate.matchAll(OUTCOME_PATTERN), (match) => match[0].toLowerCase())
      .filter((term) => !sourceTokens.has(term));
    OUTCOME_PATTERN.lastIndex = 0;
    for (const term of new Set(added)) {
      issues.push({ code: "unsupported_outcome", dimension: "modality", detail: term });
    }
  }
  return issues;
}

function contentIssues(
  source: string,
  locator: string,
  candidate: string,
  verifiedFacts: readonly VerifiedFact[],
) {
  const issues: SourceComparisonIssue[] = [];
  const sourceValue = normalizedWords(source);
  const candidateValue = normalizedWords(candidate)
    .replace(/\b(?:scope|outcome|result|impact)\s*:?\s*$/i, "")
    .trim();
  const locatorValue = normalizedWords(locator);
  if (locatorValue && locatorValue !== sourceValue && sourceValue.startsWith(locatorValue)) {
    const sourceTokens = sourceValue.split(" ");
    const candidateTokens = new Set(candidateValue.split(" "));
    const missing = sourceTokens.filter((token) => token.length > 2 && !candidateTokens.has(token));
    if (missing.length >= 2) {
      issues.push({ code: "source_content_dropped", dimension: "content", detail: "candidate preserves only a clipped prefix of the bound source line" });
    }
  }
  if (!/\[[^\]]+\]/.test(candidate) && normalizedWords(locator) === candidateValue) {
    issues.push({ code: "no_material_change", dimension: "content", detail: "candidate makes no material change" });
  }
  const visibleCandidate = candidate.replace(PLACEHOLDER_PATTERN, " ");
  const protectedTokens = source.match(/(?:\.NET\b|\bR&D\b|\bA\/B\b|[<>≤≥]\s*[+\-−]?\d[\d,.]*(?:\s*%)?|[+\-−]\d[\d,.]*(?:\s*%)?)/gi) || [];
  for (const token of protectedTokens) {
    if (!visibleCandidate.includes(token)) {
      issues.push({ code: "source_content_dropped", dimension: "content", detail: `candidate changes meaning-bearing source token ${token}` });
    }
  }
  const method = visibleCandidate.match(/\bby\s+([^,;.]{3,80})/i)?.[1];
  if (method && !/\bby\b/i.test(source)) {
    const sourceTokens = new Set(normalizedWords([source, ...verifiedFacts.map((fact) => fact.value)].join(" ")).split(" "));
    const novel = normalizedWords(method).split(" ").filter((token) => token.length > 3 && !sourceTokens.has(token));
    if (novel.length >= 1) {
      issues.push({ code: "source_content_dropped", dimension: "content", detail: "candidate adds an unsupported method to the bound source line" });
    }
  }
  const safeAdditions = new Set([
    "a", "an", "and", "approximately", "around", "as", "at", "by", "candidate", "clear", "clearly",
    "contributed", "created", "delivered", "did", "directed", "drove", "expected", "for", "from", "handled",
    "helped", "impact", "improved", "in", "into", "led", "managed", "measurable", "of", "on", "or", "outcome",
    "owned", "prepared", "projected", "redesigned", "result", "scope", "specific", "supported", "that", "the", "this", "through",
    "to", "verified", "was", "were", "with", "work", "worked",
  ]);
  const lexicalKey = (token: string) => {
    const lower = token.toLowerCase().replace(/^[.,;:]+|[.,;:]+$/g, "");
    if (/^reduc(?:e|ed|ing|tion)$/.test(lower)) return "reduce";
    if (/^increas(?:e|ed|ing)$/.test(lower)) return "increase";
    if (/^improv(?:e|ed|ing|ement)$/.test(lower)) return "improve";
    if (lower.endsWith("ies") && lower.length > 4) return `${lower.slice(0, -3)}y`;
    if (lower.endsWith("ing") && lower.length > 5) return lower.slice(0, -3);
    if (lower.endsWith("ed") && lower.length > 4) return lower.slice(0, -2);
    if (lower.endsWith("s") && !lower.endsWith("ss") && lower.length > 3) return lower.slice(0, -1);
    return lower;
  };
  const sourceLexemes = new Set(normalizedWords([source, ...verifiedFacts.map((fact) => fact.value)].join(" "))
    .split(" ").filter(Boolean).map(lexicalKey));
  const novelLexemes = normalizedWords(visibleCandidate).split(" ")
    .filter((token) => token.length > 2 && !safeAdditions.has(token.toLowerCase()))
    .map(lexicalKey)
    .filter((token) => !sourceLexemes.has(token));
  if (novelLexemes.length > 0) {
    issues.push({
      code: "cross_line_transplant",
      dimension: "content",
      detail: `candidate adds unsupported source-line content: ${Array.from(new Set(novelLexemes)).join(", ")}`,
    });
  }
  return issues;
}

export function compareSourceBoundRewrite(input: {
  sourceText: string;
  sourceLocator: string;
  candidate: string;
  verifiedFacts?: readonly VerifiedFact[];
  excerptLimit?: number;
}): SourceBoundComparison {
  const resolved = resolveSourceLine(input.sourceLocator, input.sourceText);
  if (resolved.status === "missing" || resolved.status === "ambiguous") {
    const code = resolved.status === "missing" ? "source_missing" : "source_ambiguous";
    return {
      safe: false,
      binding: { status: resolved.status },
      issues: [{ code, dimension: "binding", detail: `source locator is ${resolved.status}` }],
    };
  }
  const source = resolved.span.text;
  // Candidate-entered facts are an authorization only when their complete,
  // normalized value is present in this exact draft. A nearby or altered
  // value (for example 45% instead of 28%, or Salesforce instead of Sales)
  // receives no authorization.
  const verifiedFacts = applicableVerifiedFacts(input.candidate, input.verifiedFacts || []);
  const issues = [
    ...metricIssues(source, input.candidate, verifiedFacts),
    ...scopeIssues(source, input.candidate, verifiedFacts),
    ...agencyIssues(source, input.candidate),
    ...modalityIssues(source, input.candidate),
    ...unsupportedOutcomeIssues(source, input.candidate, verifiedFacts),
    ...contentIssues(source, input.sourceLocator, input.candidate, verifiedFacts),
  ];
  const excerpt = sourceExcerpt(source, input.sourceLocator, input.excerptLimit ?? PUBLIC_SOURCE_EXCERPT_LIMIT);
  return {
    safe: issues.length === 0,
    binding: {
      status: resolved.status,
      span: { start: resolved.span.start, end: resolved.span.end },
      ...(excerpt ? { excerpt } : {}),
    },
    issues: Array.from(new Map(issues.map((issue) => [`${issue.code}:${issue.detail}`, issue])).values()),
  };
}

export const MAX_PUBLIC_SOURCE_EXCERPT = PUBLIC_SOURCE_EXCERPT_LIMIT;
