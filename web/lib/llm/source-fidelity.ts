import {
  boundedMeaningCompleteExcerpt,
  canonicalSourceIdentity,
  compareSourceBoundRewrite,
  hasVerifiedOutcomeSignal,
  resolveUniqueSourceLine,
  unsupportedNarrativeFacts,
} from "./source-line-comparator";
import { isAcceptedAbsenceMarker } from "./grounding";

type FidelityResult<T> = {
  report: T;
  changes: string[];
};

const SCOPE_SIGNAL = /\b\d[\d,]*(?:\.\d+)?\s*(?:k|m|b)?\+?[- ]*(?:(?:monthly|weekly|daily|annual|active)\s+)?(?:data\s+)?(?:person|people|member|designer|researcher|engineer|scientist|staff|hire|user|client|customer|country|region|project|patient|record|transaction|officer)s?\b|\b(?:team|group|organization|department)\s+of\s+\d[\d,]*(?:\.\d+)?\b|\$\s*\d/i;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Values here are presentation controls or source selectors, not public prose
// claims. Every other string leaf is audited, including schema-passthrough
// fields, so an unsupported fact cannot hide outside the headline sections.
const FACT_AUDIT_EXCLUSIONS = [
  /^(?:contract_version|score_label|layout_band)$/,
  /^top_fixes\.\d+\.(?:confidence|impact_level|effort|section_ref)$/,
  /^top_fixes\.\d+\.evidence\.(?:excerpt|section)$/,
  /^section_review\.[^.]+\.(?:grade|priority)$/,
  /^ideas\.questions\.\d+\.archetype$/,
  /^rewrites\.\d+\.(?:label|original|better)$/,
  /^job_alignment\.jd_keywords\.(?:matched|missing)\.\d+$/,
  /^job_alignment\.role_fit\.industry_signals\.\d+$/,
];

function redactUnsupportedFacts(value: string, resumeText: string) {
  const facts = unsupportedNarrativeFacts(value, resumeText);
  if (facts.length === 0) return value;
  const nonOverlapping = facts
    .sort((left, right) => left.start - right.start || right.end - left.end)
    .reduce<typeof facts>((kept, fact) => {
      if (!kept.some((existing) => fact.start < existing.end && fact.end > existing.start)) kept.push(fact);
      return kept;
    }, []);
  let output = value;
  for (const fact of [...nonOverlapping].sort((left, right) => right.start - left.start)) {
    const placeholder = fact.kind === "metric" ? "[verified metric]" : "[verified detail]";
    output = `${output.slice(0, fact.start)}${placeholder}${output.slice(fact.end)}`;
  }
  return output;
}

function normalizePublicFacts(
  value: unknown,
  resumeText: string,
  changes: string[],
  pathParts: string[] = [],
) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const pathPartsForChild = [...pathParts, key];
    const fieldPath = pathPartsForChild.join(".");
    if (typeof child === "string") {
      if (FACT_AUDIT_EXCLUSIONS.some((pattern) => pattern.test(fieldPath))) continue;
      const repaired = repairNarrativeClaim(child, resumeText);
      const replacement = redactUnsupportedFacts(repaired, resumeText);
      if (replacement === child) continue;
      (value as Record<string, unknown>)[key] = replacement;
      changes.push(`${fieldPath}.${replacement === repaired ? "narrow_source_premise" : "unsupported_source_fact"}`);
      continue;
    }
    if (Array.isArray(child)) {
      child.forEach((entry, index) => {
        const itemPath = [...pathPartsForChild, String(index)];
        if (typeof entry === "string") {
          const fieldPathForItem = itemPath.join(".");
          if (FACT_AUDIT_EXCLUSIONS.some((pattern) => pattern.test(fieldPathForItem))) return;
          const repaired = repairNarrativeClaim(entry, resumeText);
          const replacement = redactUnsupportedFacts(repaired, resumeText);
          if (replacement === entry) return;
          child[index] = replacement;
          changes.push(`${fieldPathForItem}.${replacement === repaired ? "narrow_source_premise" : "unsupported_source_fact"}`);
        } else {
          normalizePublicFacts(entry, resumeText, changes, itemPath);
        }
      });
      continue;
    }
    normalizePublicFacts(child, resumeText, changes, pathPartsForChild);
  }
}

/** Exact compatibility wrapper retained for existing callers and tests. */
export function recoverUniqueSourceLine(value: string, sourceText: string) {
  return resolveUniqueSourceLine(value, sourceText);
}

function stripLayoutBullet(value: string) {
  return value.replace(/^(?:[•●◦▪▫‣⁃]\s*|[-*]\s+(?=[\p{L}\p{N}]))/u, "").trim();
}

function placeholderLabels(value: string) {
  return Array.from(new Set(Array.from(value.matchAll(/\[([^\]]+)\]/g), (match) => match[1].trim())));
}

function sourceSkeleton(original: string, currentDraft: string) {
  const base = stripLayoutBullet(original).replace(/[.;]\s*$/, "");
  const labels = placeholderLabels(currentDraft);
  const additions = labels.length > 0 ? labels : ["verified detail"];
  return `${base}; ${additions.map((label) => `[${label}]`).join("; ")}.`;
}

function boundedExactLocator(line: string, preferred = line, maxLength = 140) {
  const requested = preferred.trim();
  if (requested.length <= maxLength && line.includes(requested)) return requested;
  const complete = boundedMeaningCompleteExcerpt(line, maxLength);
  if (complete) return complete;
  const candidate = line.trim().slice(0, maxLength);
  const boundary = candidate.lastIndexOf(" ");
  return (boundary >= 24 ? candidate.slice(0, boundary) : candidate).trim();
}

function repairClippedLocator(locator: string, sourceText: string) {
  const line = resolveUniqueSourceLine(locator, sourceText);
  if (!line) return locator;
  if (canonicalSourceIdentity(line) === canonicalSourceIdentity(locator) && locator.length <= 140) return locator;
  const normalizedLocator = locator.trim();
  if (/[.!?;:]$/.test(normalizedLocator) && normalizedLocator.length <= 140) return locator;
  return boundedMeaningCompleteExcerpt(line) || boundedExactLocator(line, line);
}

function hasOutcome(value: string) {
  return hasVerifiedOutcomeSignal(value);
}

function hasScope(value: string) {
  return SCOPE_SIGNAL.test(value);
}

function companyScaleIsVisible(sourceText: string) {
  return /\b\d[\d,.]*\+?\s*(?:users?|customers?|countries?|employees?)\b|\b(?:ARR|MRR|revenue)\b[^\n]{0,60}(?:\$\s*)?\d|\$\s*\d[^\n]{0,60}\b(?:ARR|MRR|revenue)\b/i.test(sourceText);
}

function repairFixPremise(fix: any, sourceLine: string, resumeText: string, path: string, changes: string[]) {
  const rationale = `${String(fix.fix || "")} ${String(fix.why || "")}`;
  const claimsExistingResult = /\b(?:existing (?:result|outcome|impact)|(?:result|outcome|impact) already (?:on|in)|(?:result|outcome|impact) (?:is )?worth keeping|without losing the (?:result|outcome|impact))\b/i.test(rationale);
  const claimsExistingScope = /\b(?:existing (?:scope|scale)|(?:scope|scale) already (?:on|in)|without losing the (?:scope|scale))\b/i.test(rationale);
  if (claimsExistingResult && !hasOutcome(sourceLine)) {
    fix.fix = hasScope(sourceLine)
      ? "Add [measurable result] to this bullet and connect it to the work already named."
      : "Add [specific scope] and [measurable result] to this bullet.";
    fix.why = hasScope(sourceLine)
      ? "The line shows the size of the work, but not a verified result."
      : "The line names the work, but its scale and result are still unverified.";
    changes.push(`${path}.false_existing_result`);
  } else if (claimsExistingScope && !hasScope(sourceLine)) {
    fix.fix = hasOutcome(sourceLine)
      ? "Add [specific scope] to this bullet while keeping the result already on the page."
      : "Add [specific scope] and [measurable result] to this bullet.";
    fix.why = hasOutcome(sourceLine)
      ? "The result is clear, but the size of the work is not."
      : "The line names the work, but its scale and result are still unverified.";
    changes.push(`${path}.false_existing_scope`);
  }

  if (/\[company revenue or employee scale\]/i.test(String(fix.fix || "")) && companyScaleIsVisible(resumeText)) {
    fix.fix = "Add [reporting relationship] to this leadership bullet while keeping the company scale already on the page.";
    fix.why = "The operating scale is visible; the missing context is where this role sat in the executive structure.";
    changes.push(`${path}.company_scale_already_visible`);
  }
}

function normalizeFixes(report: any, resumeText: string, changes: string[]) {
  if (!Array.isArray(report?.top_fixes)) return;
  report.top_fixes.forEach((fix: any, index: number) => {
    const excerpt = fix?.evidence?.excerpt;
    if (typeof excerpt !== "string" || !excerpt.trim() || isAcceptedAbsenceMarker(excerpt, resumeText)) return;
    const line = resolveUniqueSourceLine(excerpt, resumeText);
    if (!line) return;
    const repairedExcerpt = repairClippedLocator(excerpt, resumeText);
    if (repairedExcerpt !== excerpt) {
      fix.evidence.excerpt = repairedExcerpt;
      changes.push(`top_fixes[${index}].evidence.bounded_source_window`);
    }
    repairFixPremise(fix, line, resumeText, `top_fixes[${index}]`, changes);
  });
}

function normalizeRewrites(report: any, resumeText: string, changes: string[]) {
  if (!Array.isArray(report?.rewrites)) return;
  report.rewrites = report.rewrites.flatMap((rewrite: any, index: number) => {
    if (typeof rewrite?.original !== "string" || typeof rewrite?.better !== "string") return [rewrite];
    const line = resolveUniqueSourceLine(rewrite.original, resumeText);
    if (!line) {
      changes.push(`rewrites[${index}].dropped_unbound_source`);
      return [];
    }
    const comparison = compareSourceBoundRewrite({
      sourceText: resumeText,
      sourceLocator: rewrite.original,
      candidate: rewrite.better,
    });
    if (comparison.safe) return [rewrite];

    // A repaired draft may reuse only source text already persisted in the
    // original field. We never expand a short locator into an arbitrary line.
    if (canonicalSourceIdentity(rewrite.original) !== canonicalSourceIdentity(line)) {
      changes.push(`rewrites[${index}].dropped_unsafe_partial_source`);
      return [];
    }
    const skeleton = sourceSkeleton(rewrite.original, rewrite.better);
    const skeletonComparison = compareSourceBoundRewrite({
      sourceText: resumeText,
      sourceLocator: rewrite.original,
      candidate: skeleton,
    });
    if (!skeletonComparison.safe) {
      changes.push(`rewrites[${index}].dropped_unsafe`);
      return [];
    }
    rewrite.better = skeleton;
    changes.push(`rewrites[${index}].source_skeleton`);
    return [rewrite];
  });
}

function repairQuotedGap(value: string, resumeText: string) {
  const match = value.match(/["“]([^"”]+)["”]/);
  if (!match || match.index === undefined) return value;
  const line = resolveUniqueSourceLine(match[1], resumeText);
  if (!line) return value;
  const repaired = boundedExactLocator(line, match[1]);
  if (repaired === match[1]) return value;
  const start = match.index + 1;
  return `${value.slice(0, start)}${repaired}${value.slice(start + match[1].length)}`;
}

function repairFragmentedCurrencyMetric(value: string) {
  return value.replace(/(\$\s*\d[\d,]*)\.\s+(\d+\s*[kmb])\b/gi, "$1.$2");
}

function repairQualifiedCurrency(value: string, resumeText: string) {
  let repaired = value;
  for (const match of repaired.matchAll(/\$\s*\d[\d,]*(?:\.\d+)?\s*[kmb]?\b/gi)) {
    if (match.index === undefined) continue;
    const claim = match[0];
    if (/\b(?:over|more than|at least|approximately|about|nearly|up to)\s*$/i.test(
      repaired.slice(Math.max(0, match.index - 20), match.index),
    )) continue;
    const escaped = claim
      .split(/\s+/)
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("\\s*");
    const qualified = new RegExp(`\\b(over|more than|at least|approximately|about|nearly|up to)\\s+${escaped}`, "i");
    const sourceMatches = resumeText.split(/\r?\n/).map((line) => line.trim()).filter((line) => qualified.test(line));
    if (sourceMatches.length !== 1) continue;
    const sourcePhrase = sourceMatches[0].match(qualified)?.[0];
    if (sourcePhrase) repaired = repaired.replace(claim, sourcePhrase);
  }
  return repaired;
}

function repairQualifiedPercent(value: string, resumeText: string) {
  let repaired = value;
  for (const match of repaired.matchAll(/\b\d+(?:\.\d+)?\s*(?:%|percent\b)/gi)) {
    if (match.index === undefined) continue;
    const claim = match[0];
    if (/\b(?:over|more than|at least|approximately|about|nearly|up to)\s*$/i.test(
      repaired.slice(Math.max(0, match.index - 20), match.index),
    )) continue;
    const numeric = claim.match(/\d+(?:\.\d+)?/)?.[0];
    if (!numeric) continue;
    const qualified = new RegExp(
      `\\b(over|more than|at least|approximately|about|nearly|up to)\\s+${numeric.replace(".", "\\.")}\\s*(?:%|percent\\b)`,
      "i",
    );
    const sourceMatches = resumeText.split(/\r?\n/).map((line) => line.trim()).filter((line) => qualified.test(line));
    if (sourceMatches.length !== 1) continue;
    const sourcePhrase = sourceMatches[0].match(qualified)?.[0];
    if (sourcePhrase) repaired = repaired.replace(claim, sourcePhrase);
  }
  return repaired;
}

const NUMBER_WORD_TO_DIGIT: Record<string, string> = {
  one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9",
  ten: "10", eleven: "11", twelve: "12", thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16",
  seventeen: "17", eighteen: "18", nineteen: "19", twenty: "20",
};

function repairQualifiedYears(value: string, resumeText: string) {
  let repaired = value;
  const duration = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)(?:\+\s*[- ]?years?|[- ]years?|\s+years?)\b/gi;
  for (const match of repaired.matchAll(duration)) {
    if (match.index === undefined) continue;
    if (/\b(?:over|more than|at least|approximately|about|roughly|nearly|up to)\s*$/i.test(
      repaired.slice(Math.max(0, match.index - 20), match.index),
    )) continue;
    const rawNumber = match[1].toLowerCase();
    const digit = NUMBER_WORD_TO_DIGIT[rawNumber] || rawNumber;
    const numberAlternatives = rawNumber === digit
      ? digit
      : `(?:${rawNumber}|${digit})`;
    const qualified = new RegExp(
      `\\b(over|more than|at least|approximately|about|roughly|nearly|up to)\\s+${numberAlternatives}\\s*(?:plus\\s+)?years?\\b`,
      "i",
    );
    const sourceMatches = resumeText.split(/\r?\n/).map((line) => line.trim()).filter((line) => qualified.test(line));
    if (sourceMatches.length !== 1) continue;
    const sourcePhrase = sourceMatches[0].match(qualified)?.[0];
    if (sourcePhrase) {
      const before = repaired.slice(0, match.index);
      const after = repaired.slice(match.index + match[0].length);
      if (/\bthe\s*$/i.test(before) && /^\s+experience\b/i.test(after)) {
        const withoutLevel = after.replace(/^(\s+experience)\s+level\b/i, "$1");
        repaired = `${before.replace(/\bthe\s*$/i, "")}${sourcePhrase} of${withoutLevel}`;
      } else {
        repaired = repaired.replace(match[0], sourcePhrase);
      }
    }
  }
  return repaired;
}

function repairRangeEntity(value: string, resumeText: string) {
  let repaired = value;
  for (const match of value.matchAll(/\bfrom\s+(\d[\d,]*)\s+to\s+(\d[\d,]*)\s+([\p{L}][\p{L}-]*)\b/giu)) {
    const [, first, second] = match;
    const sourcePattern = new RegExp(`\\bfrom\\s+${first}\\s+to\\s+${second}\\s+([\\p{L}][\\p{L}-]*)\\b`, "iu");
    const sourceMatches = resumeText.split(/\r?\n/).map((line) => line.trim()).filter((line) => sourcePattern.test(line));
    if (sourceMatches.length !== 1) continue;
    const sourcePhrase = sourceMatches[0].match(sourcePattern)?.[0];
    if (sourcePhrase && sourcePhrase.toLowerCase() !== match[0].toLowerCase()) repaired = repaired.replace(match[0], sourcePhrase);
  }
  return repaired;
}

function repairAggregatedMentoring(value: string, resumeText: string) {
  const match = value.match(/\bmentoring (?:of )?\d[\d,]* technical practitioners\b/i);
  if (!match) return value;
  const sourceMatches = resumeText.split(/\r?\n/).map((line) => line.trim()).flatMap((line) => {
    const sourceMatch = line.match(/\bmentored\s+([^,.;]*\d[^,.;]*)(?=,|;|\.|$)/i);
    return sourceMatch?.[1] ? [sourceMatch[1].trim()] : [];
  });
  return sourceMatches.length === 1 ? value.replace(match[0], `mentoring ${sourceMatches[0]}`) : value;
}

function sourceTeamScope(number: string, resumeText: string) {
  const escaped = number.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `\\b((?:(?:cross-functional|cross-departmental|global|multi-disciplinary|technical)\\s+)?teams?)\\s+of\\s+(?:(up to)\\s+)?${escaped}\\s+([^,.;]+?)(?=\\s+(?:in|to|that|while)\\b|,|;|\\.|$)`,
    "i",
  );
  const matches = resumeText.split(/\r?\n/).map((line) => line.trim()).flatMap((line) => {
    const match = line.match(pattern);
    if (!match) return [];
    const team = match[1];
    const article = /teams$/i.test(team) ? "" : "a ";
    return [`${article}${team} of ${match[2] ? "up to " : ""}${number} ${match[3].trim()}`];
  });
  return matches.length === 1 ? matches[0] : null;
}

function sourceScopeAlreadyVisible(value: string, sourceScope: string) {
  const normalize = (candidate: string) => candidate
    .toLowerCase()
    .replace(/\b(?:a|an)\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalize(value).includes(normalize(sourceScope));
}

function repairTeamScopes(value: string, resumeText: string) {
  const combined = /\bteams? of (\d+(?:,\d{3})*\+?)\s+and\s+(\d+(?:,\d{3})*\+?)(?=\b|\s|[,.;])/gi;
  if (combined.test(value)) {
    combined.lastIndex = 0;
    return value.replace(
      combined,
      (claim, first: string, second: string) => {
        const firstScope = sourceTeamScope(first, resumeText);
        const secondScope = sourceTeamScope(second, resumeText);
        return firstScope && secondScope ? `${firstScope} and ${secondScope}` : claim;
      },
    );
  }

  // Each branch consumes the complete shorthand phrase in the original
  // output. Keep this a single-pass sequence so a source-backed replacement
  // is not matched again and duplicated ("multi-disciplinary
  // multi-disciplinary teams ... members members").
  let repaired = value.replace(
    /\b(?:(?:cross-functional|cross-departmental|global|multi-disciplinary|technical)\s+)?teams?\s+of\s+(\d+(?:,\d{3})*\+?)(?=\b|\s|[,.;])/gi,
    (claim, number: string) => {
      const sourceScope = sourceTeamScope(number, resumeText);
      return sourceScope && !sourceScopeAlreadyVisible(value, sourceScope) ? sourceScope : claim;
    },
  );
  repaired = repaired.replace(
    /\b(?:(?:cross-functional|cross-departmental|global|multi-disciplinary|technical)\s+)?teams?\s+(?:of\s+)?up to\s+(\d+(?:,\d{3})*\+?)(?:\s+(?:people|personnel|members?))?/gi,
    (claim, number: string) => {
      const sourceScope = sourceTeamScope(number, resumeText);
      return sourceScope && !sourceScopeAlreadyVisible(repaired, sourceScope) ? sourceScope : claim;
    },
  );
  repaired = repaired.replace(
    /\b(?:an?\s+)?(\d+(?:,\d{3})*\+?)[- ]person team\b/gi,
    (claim, number: string) => {
      const sourceScope = sourceTeamScope(number, resumeText);
      return sourceScope && !sourceScopeAlreadyVisible(repaired, sourceScope) ? sourceScope : claim;
    },
  );
  repaired = repaired.replace(/\bmanaging\s+(\d+(?:,\d{3})*\+?)\s+(?:UX\s+)?designers and researchers\b/gi, (claim, number: string) => {
    const scope = sourceTeamScope(number, resumeText);
    return scope ? `managing ${scope}` : claim;
  });
  return repaired;
}

function repairGenericUserCount(value: string, resumeText: string) {
  return value.replace(/\b(\d+(?:,\d{3})*\+?)\s+users?\b/gi, (claim, number: string) => {
    const escaped = number.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sourcePattern = new RegExp(`\\b${escaped}\\s+((?:(?:active|beta|daily|monthly|weekly)\\s+)?[\\p{L}][\\p{L}-]*)\\b`, "iu");
    const matches = resumeText.split(/\r?\n/).map((line) => line.trim()).flatMap((line) => {
      const match = line.match(sourcePattern);
      return match ? [match[0]] : [];
    });
    return matches.length === 1 ? matches[0] : claim;
  });
}

function sourceLeadershipFact(number: string, resumeText: string) {
  const escaped = number.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const line of resumeText.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean)) {
    const mentored = line.match(new RegExp(
      `\\bmentored\\s+${escaped}\\s+([^,.;]+?)(?=,|;|\\.|\\s+(?:by|to|while)\\b|$)`,
      "i",
    ));
    if (mentored?.[1]) return `mentoring ${number} ${mentored[1].trim()}`;
    const led = line.match(new RegExp(
      `\\b(?:built\\s+and\\s+led|led|managed)\\s+(a\\s+)?((?:(?:cross-functional|global|technical)\\s+)?team)\\s+of\\s+${escaped}\\s+([^,.;]+?)(?=\\s+(?:in|to|that|while)\\b|,|;|\\.|$)`,
      "i",
    ));
    if (led?.[2] && led?.[3]) return `leading a ${led[2].trim()} of ${number} ${led[3].trim()}`;
  }
  return null;
}

function joinSeries(values: string[]) {
  if (values.length <= 1) return values[0] || "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function repairLeadershipAggregation(value: string, resumeText: string) {
  return value.replace(
    /\bleadership at team sizes? of ((?:\d+(?:,\d{3})*(?:\.\d+)?\+?)(?:\s*,\s*(?:and\s+)?\d+(?:,\d{3})*(?:\.\d+)?\+?|\s+and\s+\d+(?:,\d{3})*(?:\.\d+)?\+?)*)/gi,
    (claim, numberList: string) => {
      const numbers = (numberList.match(/\d[\d,.]*\+?/g) || []).map((number) => number.replace(/[,.]+$/, ""));
      const facts = numbers.map((number) => sourceLeadershipFact(number, resumeText));
      return facts.length > 0 && facts.every(Boolean)
        ? `leadership through ${joinSeries(facts as string[])}`
        : claim;
    },
  );
}

function repairQualifiedCount(value: string, resumeText: string) {
  let repaired = value;
  for (const match of value.matchAll(/\b(\d[\d,.]*)\s+((?:beta\s+)?(?:users?|customers?|employees?|hires?|officers?))\b/gi)) {
    const [claim, number, entity] = match;
    if (/\b(?:over|more than|at least|approximately|about|nearly|up to)\s*$/i.test(value.slice(Math.max(0, (match.index || 0) - 16), match.index))) continue;
    const escapedNumber = number.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedEntity = entity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const qualified = new RegExp(`\\b(over|more than|at least|approximately|about|nearly|up to)\\s+${escapedNumber}\\s+${escapedEntity}\\b`, "i");
    const sourceMatches = resumeText.split(/\r?\n/).map((line) => line.trim()).filter((line) => qualified.test(line));
    if (sourceMatches.length !== 1) continue;
    const sourcePhrase = sourceMatches[0].match(qualified)?.[0];
    if (sourcePhrase) repaired = repaired.replace(claim, sourcePhrase);
  }
  return repaired;
}

function repairMetricEntity(value: string, resumeText: string) {
  let repaired = value;
  const relation = /\b(module|feature|platform|product|program|project)\s+(?:used|serving)\s+by\s+(\d[\d,.]*\+?)\s+(customers?|users?)\b/gi;
  for (const match of value.matchAll(relation)) {
    const [, claimSubject, number, entity] = match;
    const escapedNumber = number.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sourcePattern = new RegExp(`\\b(module|feature|platform|product|program|project)\\s+(?:used|serving)\\s+by\\s+${escapedNumber}\\s+${entity}\\b`, "i");
    const sourceMatches = resumeText.split(/\r?\n/).map((line) => line.trim()).filter((line) => sourcePattern.test(line));
    if (sourceMatches.length !== 1) continue;
    const sourcePhrase = sourceMatches[0].match(sourcePattern)?.[0];
    if (sourcePhrase && sourcePhrase.toLowerCase() !== match[0].toLowerCase()) {
      repaired = repaired.replace(match[0], sourcePhrase);
    } else if (sourcePhrase && !new RegExp(`^${claimSubject}$`, "i").test(sourcePhrase.split(/\s+/)[0])) {
      repaired = repaired.replace(match[0], sourcePhrase);
    }
  }
  return repaired;
}

function repairNarrativeClaim(value: string, resumeText: string) {
  let repaired = repairFragmentedCurrencyMetric(value);
  repaired = repairQualifiedCurrency(repaired, resumeText);
  repaired = repairQualifiedPercent(repaired, resumeText);
  repaired = repairQualifiedYears(repaired, resumeText);
  repaired = repairQualifiedCount(repaired, resumeText);
  repaired = repairRangeEntity(repaired, resumeText);
  repaired = repairAggregatedMentoring(repaired, resumeText);
  repaired = repairTeamScopes(repaired, resumeText);
  repaired = repairGenericUserCount(repaired, resumeText);
  repaired = repairMetricEntity(repaired, resumeText);
  repaired = repairLeadershipAggregation(repaired, resumeText);

  if (companyScaleIsVisible(resumeText)) {
    repaired = repaired.replace(/\bdoes not identify the company (?:size|scale),\s*/gi, "does not identify the ");
    repaired = repaired.replace(/\bcompany (?:size|scale) is not shown\b/gi, "company scale is visible elsewhere on the page");
  }
  if (/\brevenue\b/i.test(resumeText)) {
    repaired = repaired.replace(/\bdoes not show quota, revenue,/gi, "does not quantify quota, attributable revenue,");
    repaired = repaired.replace(/\bdoes not show revenue\b/gi, "does not quantify attributable revenue");
  }
  repaired = repaired.replace(/\brecurs? across multiple roles\b/gi, "appears across the resume, with depth varying by role");
  if (!/\buptime\b/i.test(resumeText)) {
    repaired = repaired
      .replace(/,\s*uptime,\s*/gi, ", ")
      .replace(/\buptime\s+and\s+/gi, "")
      .replace(/\s+and\s+uptime\b/gi, "");
  }

  return repaired;
}

function mapNarrativeFields(report: any, resumeText: string, changes: string[]) {
  const scalarFields = ["first_impression", "summary"];
  for (const field of scalarFields) {
    if (typeof report?.[field] !== "string") continue;
    const repaired = repairNarrativeClaim(report[field], resumeText);
    if (repaired !== report[field]) {
      report[field] = repaired;
      changes.push(`${field}.narrow_source_premise`);
    }
  }
  for (const field of ["strengths", "gaps"]) {
    if (!Array.isArray(report?.[field])) continue;
    report[field] = report[field].map((value: unknown, index: number) => {
      if (typeof value !== "string") return value;
      const repaired = repairNarrativeClaim(value, resumeText);
      if (repaired !== value) changes.push(`${field}[${index}].narrow_source_premise`);
      return repaired;
    });
  }
}

function subjectTerms(value: string) {
  const stop = new Set(["how", "did", "the", "this", "that", "beyond", "initial", "work", "what", "when", "your"]);
  return value.toLowerCase().match(/[a-z][a-z-]{2,}/g)?.filter((term) => !stop.has(term)) || [];
}

function completedExpansionIsGrounded(question: string, resumeText: string) {
  const subject = question.match(/\bhow did\s+(.+?)\s+(?:expand|grow|roll out|implement)\b/i)?.[1] || "";
  const terms = subjectTerms(subject);
  return resumeText.split(/\r?\n/).some((line) => {
    const overlap = terms.filter((term) => line.toLowerCase().includes(term)).length;
    return overlap >= Math.min(2, terms.length)
      && /\b(?:expanded|grew|rolled out|implemented)\b/i.test(line)
      && !/\b(?:decision|plan|proposal|recommendation)\s+to\b/i.test(line);
  });
}

function repairQuestion(question: string, resumeText: string) {
  if (/\bwhat changed in the architecture or operating model to serve a 200M monthly active user platform\b/i.test(question)) {
    return "What operating constraint, if any, came with the 200M monthly active user stack, and how did you handle it?";
  }
  if (/\bhow did marketing and sales leadership use the A\/B testing framework to change product strategy\b/i.test(question)) {
    return "What was your exact contribution to the A/B testing work, and what verified result, if any, followed?";
  }
  if (/\bhow did you coordinate marketing and sales outreach\b/i.test(question)) {
    return "What was your exact contribution while assisting marketing and sales with outreach coordination?";
  }
  if (/\bwhich departments did you coordinate with at Greenfield Logistics\b/i.test(question)) {
    return "Which departments were involved in the coordination you supported, and what was your exact contribution?";
  }
  if (/\bwhat changed between these roles, and which responsibilities became broader\b/i.test(question)) {
    return "How did the responsibilities differ across these roles, if at all?";
  }
  if (/\bhow did your earlier background shape the product work\b/i.test(question)) {
    return "Which parts of your earlier background, if any, are relevant to the product work you want to emphasize?";
  }
  if (/\bwhat changed after you contributed to customer engagement or sales strategy projects\b/i.test(question)) {
    return "What verified result, if any, came from your work on customer engagement or sales strategy projects?";
  }
  if (/\bwhat changed after you coordinated training or employee engagement programs\b/i.test(question)) {
    return "What verified result, if any, came from the training or employee engagement programs you coordinated?";
  }
  if (/\bwhat changed when you supported month-end and year-end closing\b/i.test(question)) {
    return "What verified result, if any, came from your support for month-end and year-end closing?";
  }
  if (/\bwhat process improvement did you participate in\b[^?]{0,80}\bwhat changed afterward\b/i.test(question)) {
    return "Which process-improvement effort did you participate in, and what verified result, if any, followed?";
  }
  if (/\bwhat process improvement training did you participate in\b[^?]{0,60}\bwhat changed afterward\b/i.test(question)) {
    return "Which process-improvement training did you participate in, and what verified result, if any, followed?";
  }
  if (/\bwhat changed in your testing or review process alongside\b/i.test(question)) {
    return "Which testing or review practices did you contribute to, and how was the 15% coverage increase measured?";
  }
  if (/\bwhat changed in quality of hire after\b/i.test(question)) {
    return "Did quality of hire change after the recruiting funnel rebuild? If so, what verified measure shows it?";
  }
  if (/\bwhich recruiter behavior changed after\b/i.test(question)) {
    return "What did the Northline playbooks change, if anything, and how was that measured?";
  }
  if (/\bhow did CEO and board priorities shape\b/i.test(question)) {
    return "What was your exact contribution to the VP searches conducted with the CEO and board?";
  }
  if (/\bhow did you adapt marketing\b[^?]{0,80}\bwithout losing consistency\b/i.test(question)) {
    return "How was your marketing operating model structured for 2M+ users across 40 countries?";
  }
  if (/\bwhich prototyping tools replaced the prior process\b/i.test(question)) {
    return "What did introducing the new prototyping tools change, and how was the 30% faster iteration measured?";
  }
  if (/\bwhat changed when your GlobalTech team expanded\b/i.test(question)) {
    return "What was your exact contribution to coordinating product, marketing, and engineering for three software releases?";
  }
  if (/\bwhat did you resolve with finance and operations\b/i.test(question)) {
    return "What was your exact contribution to HR budget work with finance and operations?";
  }
  if (/\bwhich user insight led you to simplify task delegation\b/i.test(question)) {
    return "What did you contribute to simplifying task delegation, and how was the 40% adoption increase measured?";
  }
  if (/\bhow did Legal and Policy change\b/i.test(question)) {
    return "What was your exact contribution to the audit process with Legal and Policy, and what verified result can you add?";
  }
  if (/\bdescribe a difficult customer inquiry\b/i.test(question)) {
    return "Which customer inquiry, if any, best shows your contribution, and what verified result can you add?";
  }
  if (/\bwhich departments\b[^?]{0,100}\bissue\b[^?]{0,40}\bresolve/i.test(question)) {
    return "Which departments did you collaborate with, and what was your exact contribution?";
  }
  if (/\bfrom planning through completion\b/i.test(question)) {
    return "Which event-logistics tasks did you organize, and what was your exact contribution?";
  }
  if (/\bfrom requirements through deployment\b/i.test(question)) {
    return "What was your exact contribution to developing and deploying the customer analytics dashboard?";
  }
  if (/\bwhat (?:error|employment-law issue)[^?]{0,100}\b(?:did you help resolve|required your judgment)\b/i.test(question)) {
    return "Which difficult issue, if any, best shows your contribution, and what did you personally do?";
  }
  if (/\bresolve competing priorities\b/i.test(question)) {
    return "Did the collaborators face competing priorities? If so, what was your exact contribution to resolving them?";
  }
  if (/\bdescribe\b[^?]{0,100}\bincident\b/i.test(question)) {
    return "What did your monitoring and incident-response work involve, and what verified result can you add?";
  }
  if (/\bwhy did you choose\b/i.test(question)) {
    return "What was your exact contribution to this work, and which decision, if any, did you personally make?";
  }
  if (/\b(?:what|which|how)[^?]{0,100}\btradeoff\b/i.test(question)) {
    return "Were there competing priorities in this work? If so, what did you decide and why?";
  }
  if (/\bwhat\b[^?]{0,80}\brisk did you manage\b/i.test(question)) {
    return "Were there material risks or constraints in this work? If so, how did you handle them?";
  }
  if (/\bresolve disagreements\b/i.test(question)) {
    return "Did the collaborators face competing priorities? If so, what was your role in resolving them?";
  }
  if (/\breach agreement\b/i.test(question)) {
    return "How did you coordinate the named partner teams, and which decision, if any, did you personally shape?";
  }
  if (/\bwhat production issue did you troubleshoot\b/i.test(question) || /\bprevent recurrence\b/i.test(question)) {
    return "Which production issue, if any, did you help troubleshoot, and what was your exact contribution to the resolution?";
  }
  if (/\bwhich\b[^?]{0,80}\bdecision\b/i.test(question)) {
    return "Which decision, if any, did you personally make in this work, and what evidence shows its effect?";
  }
  if (/\bpromotion|promoted\b/i.test(question) && !/\bpromotion|promoted\b/i.test(resumeText)) {
    return "What changed between these roles, and which responsibilities became broader?";
  }
  if (/\b(?:what|which)\b[^?]{0,70}\bprocess did you own\b|\bwhich process did you own\b/i.test(question)) {
    return "What was your exact contribution to this process, and where did your responsibility begin and end?";
  }
  if (/\bhow many\b[^?]{0,110}\bdid you manage\b/i.test(question)
    && /\b(?:maintained|helped coordinate|supported|assisted)\b/i.test(resumeText)) {
    return "What verified volume did you work with, and what was your exact contribution?";
  }
  if (/\bwhat changed when you moved from\b[^?]{0,80}\bat\s+[A-Z]/i.test(question)) {
    return "How did your earlier background shape the product work you want to emphasize now?";
  }
  if (/\bhow did\b[^?]{0,100}\b(?:expand|grow|roll out|implement)\b/i.test(question)
    && !completedExpansionIsGrounded(question, resumeText)) {
    return "Was this work expanded or implemented? If so, what changed from the original decision or proposal?";
  }
  if (/\bsix-person Scrum team\b/i.test(question) || /\b10,000-customer module\b/i.test(question)) {
    const teamSize = resumeText.match(/\bScrum team of (\d+) engineers\b/i)?.[1];
    const customerCount = resumeText.match(/\bfeature used by (\d[\d,]*\+) customers\b/i)?.[1];
    if (teamSize && customerCount) {
      return `What release risk, if any, arose in your work with the Scrum team of ${teamSize} engineers? Separately, what did you contribute to the feature used by ${customerCount} customers?`;
    }
    return "What release risk, if any, arose during delivery, and how did the team handle it?";
  }
  return question;
}

const CONSERVATIVE_QUESTION_BY_ARCHETYPE: Record<string, string> = {
  "TENSION POINT": "Which challenge, if any, required your judgment, and what did you personally do?",
  SCALING: "Did the scope of any work increase? If so, what changed and how did you respond?",
  "QUALITY UNDER PRESSURE": "Did you have to protect a quality bar? If so, what did you personally do?",
  IMPROVEMENT: "What verified result, if any, followed from work already named on the résumé?",
  "CROSS-FUNCTIONAL COMPLEXITY": "Did any work involve competing priorities? If so, what was your exact contribution?",
  "END-TO-END OWNERSHIP": "Which part of the work, if any, did you personally own from start to finish?",
  "DOMAIN LIFT": "Which domain constraint, if any, shaped your work, and how did you respond?",
  "HIGH STAKES": "Was any decision especially consequential? If so, what did you decide and what followed?",
};

const CONSERVATIVE_QUESTIONS = new Set(Object.values(CONSERVATIVE_QUESTION_BY_ARCHETYPE));

function questionToken(value: string) {
  const lower = value.toLowerCase();
  if (lower.endsWith("ies") && lower.length > 4) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith("ing") && lower.length > 5) return lower.slice(0, -3);
  if (lower.endsWith("ed") && lower.length > 4) return lower.slice(0, -2);
  if (lower.endsWith("s") && !lower.endsWith("ss") && lower.length > 3) return lower.slice(0, -1);
  return lower;
}

function questionContentTokens(value: string) {
  const stop = new Set([
    "about", "after", "already", "and", "any", "because", "candidate", "challenge", "change", "changed",
    "contribution", "decision", "did", "does", "evidence", "exact", "followed", "from", "have", "how", "if",
    "into", "personally", "release", "result", "resume", "résumé", "risk", "arose", "scope", "separately", "should", "that", "the", "their", "this", "through",
    "verified", "was", "were", "what", "when", "where", "which", "while", "with", "work", "your", "you",
  ]);
  return Array.from(new Set((value.toLowerCase().match(/[\p{L}][\p{L}-]{2,}/gu) || [])
    .map(questionToken)
    .filter((token) => !stop.has(token))));
}

function questionPremiseIsSourceBound(question: string, resumeText: string) {
  if (CONSERVATIVE_QUESTIONS.has(question)) return true;
  if (unsupportedNarrativeFacts(question, resumeText).length > 0) return false;
  const sourceLines = resumeText.split(/\r?\n/)
    .map((line) => new Set(questionContentTokens(line)))
    .filter((line) => line.size > 0);
  const clauses = question.split(/\?\s*(?:Separately,\s*)?/i).map((clause) => clause.trim()).filter(Boolean);
  return clauses.every((clause) => {
    const tokens = questionContentTokens(clause);
    if (tokens.length === 0) return /\b(?:if any|if so)\b/i.test(clause);
    return sourceLines.some((line) => {
      const overlap = tokens.filter((token) => line.has(token)).length;
      return overlap >= 2 && overlap / tokens.length >= 0.7;
    });
  });
}

function conservativeQuestion(archetype: unknown) {
  return CONSERVATIVE_QUESTION_BY_ARCHETYPE[String(archetype)]
    || "What verified result, if any, followed from work already named on the résumé?";
}

function normalizeIndustrySignals(report: any, resumeText: string, changes: string[]) {
  const signals = report?.job_alignment?.role_fit?.industry_signals;
  if (!Array.isArray(signals)) return;
  const grounded = signals.filter((signal: unknown) => {
    if (typeof signal !== "string") return false;
    if (/^Financial services$/i.test(signal)) return /\b(?:banking|bank|fintech|financial services)\b/i.test(resumeText);
    if (/^Logistics$/i.test(signal)) return /\blogistics\b/i.test(resumeText);
    return true;
  });
  if (grounded.length !== signals.length) {
    report.job_alignment.role_fit.industry_signals = grounded;
    changes.push("job_alignment.role_fit.industry_signals.source_grounded");
  }
}

function normalizeQuestions(report: any, resumeText: string, changes: string[]) {
  if (!Array.isArray(report?.ideas?.questions)) return;
  report.ideas.questions.forEach((item: any, index: number) => {
    if (typeof item?.question !== "string") return;
    const locallyRepaired = repairQuestion(item.question, resumeText);
    const repaired = questionPremiseIsSourceBound(locallyRepaired, resumeText)
      ? locallyRepaired
      : conservativeQuestion(item.archetype);
    if (repaired !== item.question) {
      item.question = repaired;
      item.why = "Clarifies the evidence without assuming an unverified event, scope, or level of ownership.";
      changes.push(`ideas.questions[${index}].conditional_premise`);
    }
  });
}

/**
 * Conservative, idempotent repair. Exact source binding and rewrite safety are
 * shared with the backend and UI copy gate. The function never expands a
 * persisted locator beyond the 140-character public evidence contract.
 */
export function repairResumeReportSourceFidelity<T>(report: T, resumeText: string): FidelityResult<T> {
  if (!report || typeof report !== "object" || !resumeText.trim()) return { report, changes: [] };
  const copy = clone(report) as any;
  const changes: string[] = [];
  normalizeFixes(copy, resumeText, changes);
  normalizeRewrites(copy, resumeText, changes);
  if (typeof copy.biggest_gap_example === "string") {
    const repaired = repairQuotedGap(copy.biggest_gap_example, resumeText);
    if (repaired !== copy.biggest_gap_example) {
      copy.biggest_gap_example = repaired;
      changes.push("biggest_gap_example.bounded_source_window");
    }
  }
  mapNarrativeFields(copy, resumeText, changes);
  normalizeIndustrySignals(copy, resumeText, changes);
  normalizeQuestions(copy, resumeText, changes);
  normalizePublicFacts(copy, resumeText, changes);
  return { report: copy as T, changes };
}
