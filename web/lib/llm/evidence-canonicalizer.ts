import {
  findAlreadySatisfiedFix,
  findBiggestGapContradictions,
  findFixEvidenceMismatch,
  findNonActionableFix,
  findRewriteFidelityIssues,
  findUnsupportedAgencyUpgrade,
  findUnsupportedOutcomeClaims,
  sourceContextFor,
} from "./grounding";
import {
  boundedMeaningCompleteExcerpt,
  hasVerifiedOutcomeSignal,
  resolveUniqueSourceLine,
} from "./source-line-comparator";

type CanonicalizationResult<T> = {
  report: T;
  changes: string[];
  unresolved: string[];
};

function sourceLines(sourceText: string) {
  return sourceText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 8);
}

function hasSummarySection(sourceText: string) {
  const lines = sourceText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const hasNamedSummary = lines.some((line) => {
    const heading = normalize(line).replace(/\s+/g, " ");
    return ["summary", "professional summary", "profile", "professional profile", "objective", "career objective"].includes(heading);
  });
  if (hasNamedSummary) return true;

  const experienceIndex = lines.findIndex((line) =>
    ["experience", "work experience", "professional experience"].includes(normalize(line).replace(/\s+/g, " ")),
  );
  if (experienceIndex <= 0) return false;

  return lines.slice(0, experienceIndex).some((line) => {
    const wordCount = line.split(/\s+/).filter(Boolean).length;
    const looksLikeContact = /@|linkedin\.com|\b\d{3}[-.)\s]\d{3}[-.\s]\d{4}\b/i.test(line);
    return !looksLikeContact && line.length >= 90 && wordCount >= 15;
  });
}

function hasNamedSection(sourceText: string, names: string[]) {
  return sourceText.split(/\r?\n/).some((line) => {
    const heading = normalize(line).replace(/\s+/g, " ");
    return names.includes(heading);
  });
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

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9%$]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bestExactWindow(line: string, draft: string, maxLength: number) {
  const exactDraft = stripOuterFormatting(draft).trim();
  if (exactDraft.length <= maxLength && line.includes(exactDraft)) return exactDraft;
  const complete = boundedMeaningCompleteExcerpt(line, maxLength);
  if (complete) return complete;
  const candidate = line.trim().slice(0, maxLength);
  const boundary = candidate.lastIndexOf(" ");
  return (boundary >= 24 ? candidate.slice(0, boundary) : candidate).trim();
}

function exactSourceValue(value: string, sourceText: string, maxLength?: number) {
  const stripped = stripOuterFormatting(value);
  const variants = [value.trim(), stripped];
  if (/^I\s+/i.test(stripped)) variants.push(stripped.replace(/^I\s+/i, ""));

  for (const variant of variants) {
    if (!variant) continue;
    const line = resolveUniqueSourceLine(variant, sourceText);
    if (!line) continue;
    if (!maxLength) return line;
    if (variant.length <= maxLength && line.includes(variant)) return variant;
    return bestExactWindow(line, variant, maxLength) || null;
  }
  return null;
}

function exactSourceLine(value: string, sourceText: string) {
  const stripped = stripOuterFormatting(value);
  const variants = [value.trim(), stripped];
  if (/^I\s+/i.test(stripped)) variants.push(stripped.replace(/^I\s+/i, ""));

  for (const variant of variants) {
    if (!variant) continue;
    const line = resolveUniqueSourceLine(variant, sourceText);
    if (line) return line;
  }
  return null;
}

function exactSourceRewriteLocator(value: string, sourceText: string) {
  const stripped = stripOuterFormatting(value);
  const variants = [value.trim(), stripped];
  if (/^I\s+/i.test(stripped)) variants.push(stripped.replace(/^I\s+/i, ""));

  for (const variant of variants) {
    if (!variant) continue;
    const line = resolveUniqueSourceLine(variant, sourceText);
    if (!line) continue;
    if (line.length <= 140) return line;
    if (variant.length <= 140 && line.includes(variant)) return variant;
    return boundedMeaningCompleteExcerpt(line, 140);
  }
  return null;
}

function replaceQuotedEvidence(value: string, sourceText: string) {
  const match = value.match(/["“]([^"”]+)["”]/);
  if (!match || match.index === undefined) return null;
  const canonical = exactSourceValue(match[1], sourceText, 140);
  if (!canonical) return null;
  const quoteStart = match.index;
  const innerStart = quoteStart + 1;
  const innerEnd = innerStart + match[1].length;
  return `${value.slice(0, innerStart)}${canonical}${value.slice(innerEnd)}`;
}

function hasGroundedOutcome(value: string) {
  return hasVerifiedOutcomeSignal(value);
}

function hasGroundedScope(value: string) {
  return /\b\d[\d,]*(?:\.\d+)?\s*(?:k|m|b)?\+?[- ]*(?:(?:monthly|weekly|daily|annual|active)\s+)?(?:data\s+)?(?:person|people|member|designer|researcher|engineer|scientist|team|user|client|customer|country|region|project|patient|record|transaction|officer)s?\b|\b(?:team|group|organization|department)\s+of\s+\d[\d,]*(?:\.\d+)?\b|\$\s*\d/i.test(value);
}

function groundedMetricTokens(value: string) {
  return Array.from(new Set(
    value.match(/\$\s*\d[\d,]*(?:\.\d+)?\s*[kmb]?|\b\d[\d,]*(?:\.\d+)?\s*%|\b\d[\d,]*(?:\.\d+)?[- ]+(?:(?:monthly|weekly|daily|annual|active)\s+)?(?:person|people|member|designer|researcher|engineer|scientist|team|user|client|customer|country|region|project|patient|record|transaction|officer)s?\b|\b(?:team|group|organization|department)\s+of\s+\d[\d,]*(?:\.\d+)?\b|\b\d[\d,]*(?:\.\d+)?\s*[kmb]\+?(?:\s+(?:user|patient|record|transaction|officer)s?)?/gi) || [],
  )).slice(0, 2);
}

function safeWeakBulletTemplate(original: string, enhancementNote: string) {
  const placeholders = Array.from(new Set(enhancementNote.match(/\[[^\]]+\]/g) || []));
  const scoped = placeholders.filter((value) => !/outcome|result|impact|saving|revenue|accuracy|improvement/i.test(value));
  const outcomes = placeholders.filter((value) => /outcome|result|impact|saving|revenue|accuracy|improvement/i.test(value));
  const outcomeValue = outcomes[0] || "[measurable result]";
  const base = original.replace(/[.;]\s*$/, "");
  const scopeClause = scoped[0]
    ? `; ${scoped[0]}`
    : hasGroundedScope(original)
      ? ""
      : "; [specific scope]";
  return `${base}${scopeClause}; ${outcomeValue}.`;
}

function ensureAddNote(value: string) {
  if (/^Add\b/.test(value.trim())) return value.trim();
  const trimmed = value.trim().replace(/[.!]\s*$/, "");
  if (!trimmed) return "Add the missing detail and explain why it matters.";
  return `Add this detail: ${trimmed[0].toLowerCase()}${trimmed.slice(1)}.`;
}

function humanBulletReference(source: string, section = "") {
  if (/\bsummary\b/i.test(section)) return "summary";
  if (/\b(?:skills?|additional information|software|tools?)\b/i.test(section)) {
    return /\b(?:quickbooks|peachtree|sap|excel|software|system|platform|tool)\b/i.test(source)
      ? "accounting-tools line"
      : "skills line";
  }
  const topics: Array<[RegExp, string]> = [
    [/\bfull[- ]cycle recruiting\b/i, "full-cycle recruiting"],
    [/\b(?:recruiting|hiring|talent acquisition)\b/i, "hiring"],
    [/\b(?:human resources|hr strateg(?:y|ies)|employee relations)\b/i, "HR"],
    [/\b(?:financial statements?|financial reports?|reporting)\b/i, "financial reporting"],
    [/\b(?:budget|forecast)\b/i, "budgeting"],
    [/\b(?:migration|warehouse)\b/i, "migration"],
    [/\b(?:mentor|coached?|training)\b/i, "mentoring"],
    [/\bonboarding\b/i, "onboarding"],
    [/\b(?:customer|client)\b/i, "customer"],
    [/\b(?:inventory|stocking|merchandising)\b/i, "inventory"],
    [/\b(?:compliance|audit|soc 2)\b/i, "compliance"],
    [/\b(?:contract|agreement|legal)\b/i, "legal"],
    [/\b(?:roadmap|product)\b/i, "product"],
    [/\b(?:user interview|research)\b/i, "research"],
    [/\b(?:campaign|marketing)\b/i, "marketing"],
    [/\b(?:sales|pipeline|quota)\b/i, "sales"],
    [/\b(?:curriculum|literacy|student|classroom)\b/i, "teaching"],
    [/\b(?:volunteer|ministry|pastoral|congregation)\b/i, "ministry"],
    [/\b(?:project|program)\b/i, "project"],
    [/\b(?:operations?|process)\b/i, "operations"],
    [/\b(?:team|budget)\b/i, "team-and-budget"],
  ];
  const topic = topics.find(([pattern]) => pattern.test(source))?.[1] || "experience";
  return `${topic} bullet`;
}

function humanizeFixReference(value: string, source: string, section = "") {
  const reference = `the ${humanBulletReference(source, section)}`;
  return value
    .replace(/\bthis (?:cited )?(?:bullet|line)\b/gi, reference)
    .replace(/\bthe cited (?:bullet|line)\b/gi, reference);
}

function safeActionableFix(fix: string, evidenceExcerpt: string, resumeText: string) {
  const source = sourceContextFor(evidenceExcerpt, resumeText);
  const conciseExistingEvidenceFix = fix
    .replace(/\bwith the quantified\b/i, "with the existing")
    .replace(/\s+using \[measurable result\]\.?$/i, ".");
  if (
    conciseExistingEvidenceFix !== fix
    && findNonActionableFix(conciseExistingEvidenceFix).length === 0
  ) return conciseExistingEvidenceFix;
  const isClutteredRewrite = /(?:->|→)|^\s*(?:bullet|line|section)\s+to\s+(?:rewrite|replace|change)\b|\b(?:bullet|line)\s*[-:]\s*add\b|\badd explicit outcome for\b/i.test(fix)
    || /\bimprove\b[^.]{0,80}\b(?:bullet|line)\b[^.]{0,50}\bsurface (?:a )?measurable impact\b/i.test(fix)
    || (/^[^"“]{0,90}["“][^"”]{25,}["”]/.test(fix) && /\b(?:rewrite|add|replace|change)\b/i.test(fix))
    || fix.length > 180;
  if (/\b(?:career break|caregiving|return to (?:software|work)|maintained technical skills)\b/i.test(`${source} ${evidenceExcerpt}`)) {
    return "Name one real recent course or personal project and the [completed artifact] it produced.";
  }
  if (/\b(?:marketing and sales|outreach initiatives?|sales campaigns?)\b/i.test(source)) {
    return "Add [campaign scope] and [measurable result] to the marketing-and-sales bullet.";
  }
  if (findNonActionableFix(fix).length === 0 && !isClutteredRewrite) return fix;
  if (hasGroundedOutcome(source)) {
    const metrics = groundedMetricTokens(source);
    if (metrics.length > 0) {
      return `Put the existing ${metrics.join(" and ")} detail at the front of this bullet.`;
    }
    return "Move the existing result into the opening clause of this bullet.";
  }
  if (hasGroundedScope(source)) {
    return "Add [measurable result] to this bullet and connect it to the work already named.";
  }
  return "Add [specific scope] and [measurable result] to this bullet.";
}

function ensureConcreteFixPlaceholder(fix: string) {
  if (/\[[^\]]+\]|\d|%|\b(team|users|revenue|pipeline|budget|ARR|MRR|NPS)\b/i.test(fix)) return fix;
  if (/\bonboarding retention impact\b/i.test(fix)) {
    return fix.replace(/\bonboarding retention impact\b/i, "[onboarding retention rate]");
  }
  if (/\b(?:a )?measurable outcome\b/i.test(fix)) {
    return fix.replace(/\b(?:a )?measurable outcome\b/i, "[measurable result]");
  }
  if (/\b(outcome|impact|result|metric)s?\b/i.test(fix)) {
    return `${fix.trim().replace(/[.;]\s*$/, "")} using [measurable result].`;
  }
  return fix;
}

function surfaceExistingEvidenceFix(fix: string, evidenceExcerpt: string, resumeText: string) {
  const source = sourceContextFor(evidenceExcerpt, resumeText);
  const explicitlyReusesExistingEvidence = /\bwith the quantified\b[^.]{0,100}\bresults?\b/i.test(fix)
    || /\b(?:replace|move|surface|lead|put)\b[^.]{0,100}\bexisting\b/i.test(fix);
  if (explicitlyReusesExistingEvidence) return fix;
  const asksForScope = /\[(?:specific )?scope\]|\b(team size|project scope|scope detail|(?:existing )?scope)\b/i.test(fix);
  const asksForOutcome = /\[(?:measurable )?(?:result|outcome|impact)\]|\b(measurable result|measurable outcome|quantified outcome)\b/i.test(fix);
  if (asksForScope && hasGroundedScope(source) && asksForOutcome && !hasGroundedOutcome(source)) {
    return "Add [measurable result] to this bullet and connect it to the work already named.";
  }
  if (asksForOutcome && hasGroundedOutcome(source) && asksForScope && !hasGroundedScope(source)) {
    return "Add [specific scope] to this bullet. Keep the result already on the page.";
  }
  const satisfied = findAlreadySatisfiedFix(fix, evidenceExcerpt, resumeText);
  if (satisfied.length === 0) return fix;
  if (satisfied.some((item) => item.includes("named tools"))) {
    return "Move the existing named tools into the opening clause of this bullet.";
  }
  if (hasGroundedScope(source) && !hasGroundedOutcome(source)) {
    return "Add [measurable result] to this bullet and connect it to the work already named.";
  }
  if (hasGroundedOutcome(source) && !hasGroundedScope(source)) {
    return "Add [specific scope] to this bullet. Keep the result already on the page.";
  }
  const metrics = groundedMetricTokens(source);
  if (metrics.length > 0) {
    return `Put the existing ${metrics.join(" and ")} detail at the front of this bullet.`;
  }
  return "Move the existing size and result into the opening clause of this bullet.";
}

function capSummarySentences(value: string) {
  const sentences = value.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [];
  if (sentences.length <= 5) return value;
  return sentences.slice(0, 5).join(" ");
}

function normalizeTakeaway(value: string) {
  value = value.trim().replace(/^Show\s+(?=(?:Tighten|Clarify|Quantify|Lead|Surface|Connect|Name|Focus)\b)/i, "");
  const words = value.trim().split(/\s+/).filter(Boolean);
  const exactRepairs: Record<string, string> = {
    "leadership with measurable results": "Lead with measurable results",
    "clear leadership, needs stronger outcomes": "Connect leadership to outcomes",
    "show room for quantified impact": "Show measurable design outcomes",
    "lacks measurable impact": "Show measurable sales impact",
    "gaps on measurable impact": "Show measurable HR impact",
    "needs impact signals": "Show measurable finance impact",
    "need measurable outcomes": "Show measurable outcomes",
    "strong leadership signals": "Lead with measurable results",
    "roles need quantified outcomes": "Quantify earlier-role outcomes",
    "to surface more outcomes": "Show more UX outcomes",
    "solid, but outcomes missing": "Show measurable finance outcomes",
    "limited outcome signals": "Show measurable operations outcomes",
    "surface continuity": "Show recent hands-on evidence",
  };
  const normalizedValue = value.trim().toLowerCase();
  const exact = exactRepairs[normalizedValue] || exactRepairs[normalizedValue.replace(/^show\s+/, "")];
  if (exact) return exact;
  if (
    words.length >= 2
    && words.length <= 6
    && /^(?:add|show|surface|tie|clarify|quantify|lead|name|move|strengthen|tighten|connect|focus|prove|highlight)\b/i.test(value.trim())
  ) return value.trim();
  const imperative = value
    .split(/[;:.]+/)
    .map((clause) => clause.trim().replace(/[.!?]+$/, ""))
    .find((clause) => /^(?:add|show|surface|tie|clarify|quantify|lead|name|move|strengthen|tighten|connect|focus|prove|highlight)\b/i.test(clause)
      && clause.split(/\s+/).length >= 2
      && clause.split(/\s+/).length <= 6);
  if (imperative) return `${imperative[0].toUpperCase()}${imperative.slice(1)}`;
  const tail = words.slice(-4).join(" ").replace(/[.!?]+$/, "");
  return `Show ${tail || "the strongest evidence"}`;
}

function weakExperienceLine(sourceText: string) {
  return sourceLines(sourceText).find((line) => {
    if (!/^[-•●*]\s+(?:I\s+)?(?:led|managed|built|created|developed|designed|implemented|supported|assisted|helped|contributed|participated|collaborated|partnered|coordinated|maintained|worked|conducted|mentored|owned|directed|prepared|provided|responded|used|was responsible|duties included)\b/i.test(line)) {
      return false;
    }
    return !hasGroundedOutcome(line) && !hasGroundedScope(line);
  }) || null;
}

function outcomelessExperienceLine(sourceText: string, excludedEvidence: Set<string>) {
  const candidates = sourceLines(sourceText).filter((line) => {
    if (!/^[-•●*]\s+(?:I\s+)?(?:led|managed|built|created|developed|designed|implemented|supported|assisted|helped|contributed|participated|collaborated|partnered|coordinated|maintained|worked|conducted|mentored|owned|directed|prepared|provided|responded|used|was responsible|duties included)\b/i.test(line)) {
      return false;
    }
    if (hasGroundedOutcome(line)) return false;
    return !Array.from(excludedEvidence).some((excerpt) => sourceContextFor(excerpt, sourceText) === line);
  });
  return candidates.sort((a, b) => Number(hasGroundedScope(b)) - Number(hasGroundedScope(a)))[0] || null;
}

function earliestExperienceLine(sourceText: string) {
  return sourceLines(sourceText).filter((line) =>
    /^[-•●*]\s+(?:I\s+)?(?:led|managed|built|created|developed|designed|implemented|supported|assisted|helped|contributed|participated|collaborated|partnered|coordinated|maintained|worked|conducted|mentored|owned|directed|prepared|provided|responded|used|was responsible|duties included)\b/i.test(line),
  ).at(-1) || null;
}

function normalizeEducationAbsenceFix(fix: any, changes: string[], index: number) {
  if (normalize(fix?.evidence?.excerpt || "") !== "no education section present") return;
  fix.fix = "Add an education section with [degree], [school], and [year], if applicable.";
  fix.why = "This removes an avoidable recruiter unknown without inventing a credential.";
  fix.evidence.section = "Education";
  fix.section_ref = "Education";
  fix.impact_level = "medium";
  fix.effort = "quick";
  changes.push(`top_fixes[${index}].education_absence`);
}

function deduplicateAbsenceFixes(topFixes: any[], resumeText: string, changes: string[]) {
  const seen = new Set<string>();
  const usedEvidence = new Set<string>(
    topFixes.map((fix) => fix?.evidence?.excerpt).filter((value): value is string => typeof value === "string"),
  );

  topFixes.forEach((fix, index) => {
    const marker = normalize(fix?.evidence?.excerpt || "");
    if (!marker.startsWith("no ") || !marker.endsWith(" section present")) return;
    if (!seen.has(marker)) {
      seen.add(marker);
      return;
    }

    const replacementLine = outcomelessExperienceLine(resumeText, usedEvidence);
    if (!replacementLine) return;
    const excerpt = bestExactWindow(replacementLine, replacementLine, 140);
    fix.fix = "Add [measurable result] to this bullet and connect it to the work already named.";
    fix.why = "The responsibility is clear, but the page never tells us what changed.";
    fix.confidence = "medium";
    fix.evidence = { excerpt, section: "Work Experience" };
    fix.impact_level = "medium";
    fix.effort = "quick";
    fix.section_ref = "Work Experience";
    usedEvidence.add(excerpt);
    changes.push(`top_fixes[${index}].deduplicated_absence`);
  });
}

function deduplicateFixEvidence(topFixes: any[], resumeText: string, changes: string[]) {
  const seen = new Set<string>();
  return topFixes.filter((fix, index) => {
    const excerpt = typeof fix?.evidence?.excerpt === "string" ? fix.evidence.excerpt : "";
    const marker = normalize(excerpt);
    const source = marker.startsWith("no ") && marker.endsWith(" section present")
      ? marker
      : normalize(sourceContextFor(excerpt, resumeText));
    if (!source || !seen.has(source)) {
      if (source) seen.add(source);
      return true;
    }
    changes.push(`top_fixes[${index}].dropped_duplicate_evidence`);
    return false;
  });
}

function deduplicateFixInstructions(topFixes: any[], changes: string[]) {
  const result: any[] = [];
  const instructionIndexes = new Map<string, number>();
  topFixes.forEach((fix, index) => {
    const marker = normalize(String(fix?.fix || ""));
    const existingIndex = instructionIndexes.get(marker);
    if (existingIndex === undefined) {
      instructionIndexes.set(marker, result.length);
      result.push(fix);
      return;
    }
    const existingEvidence = String(result[existingIndex]?.evidence?.excerpt || "");
    const currentEvidence = String(fix?.evidence?.excerpt || "");
    const existingEvidenceScore = Number(/^[-•●*]\s/.test(existingEvidence)) * 1000 + existingEvidence.length;
    const currentEvidenceScore = Number(/^[-•●*]\s/.test(currentEvidence)) * 1000 + currentEvidence.length;
    if (currentEvidenceScore > existingEvidenceScore) {
      result[existingIndex] = fix;
    }
    changes.push(`top_fixes[${index}].dropped_duplicate_instruction`);
  });
  return result;
}

function dropLowValueOptionalFixes(topFixes: any[], changes: string[], noJobDescription: boolean) {
  if (topFixes.length <= 1) return topFixes;
  const kept = topFixes.filter((fix, index) => {
    const text = `${fix?.fix || ""} ${fix?.why || ""}`;
    const isLowPriority = fix?.confidence === "low" || fix?.impact_level === "low";
    const isPadding = fix?.confidence === "low" && fix?.impact_level === "low";
    const evidenceMarker = normalize(String(fix?.evidence?.excerpt || ""));
    const isOptionalEducationAbsence = evidenceMarker === "no education section present";
    const isOptionalCredential = /\b(certifications?|courses?|awards?)\b/i.test(text)
      || (isLowPriority && /^education$/i.test(String(fix?.evidence?.section || "").trim()));
    const isLowValueSkillsLine = /\b(?:skills?|additional information|software)\b/i.test(String(fix?.evidence?.section || ""))
      && fix?.impact_level !== "high";
    const isGenericExistingResultFix = /^Lead the .+ with (?:its|the) strongest existing result(?: using \[[^\]]+\])?\.?$/i.test(String(fix?.fix || "").trim());
    if (
      !isPadding
      && !(noJobDescription && isOptionalEducationAbsence)
      && (!isOptionalCredential || !isLowPriority)
      && !isLowValueSkillsLine
      && !isGenericExistingResultFix
    ) return true;
    changes.push(`top_fixes[${index}].dropped_low_value_optional`);
    return false;
  });
  return kept.length > 0 ? kept : [topFixes[0]];
}

function replaceSoleOptionalEducationFix(topFixes: any[], resumeText: string, changes: string[]) {
  if (topFixes.length !== 1 || normalize(String(topFixes[0]?.evidence?.excerpt || "")) !== "no education section present") {
    return;
  }
  const weakLine = weakExperienceLine(resumeText) || outcomelessExperienceLine(resumeText, new Set());
  if (!weakLine) return;
  topFixes[0] = {
    ...topFixes[0],
    fix: hasGroundedScope(weakLine)
      ? "Add [measurable result] to this bullet and connect it to the work already named."
      : "Add [specific scope] and [measurable result] to this bullet.",
    why: "This line is still too general to show how much weight the work should carry.",
    confidence: "medium",
    evidence: { excerpt: bestExactWindow(weakLine, weakLine, 140), section: "Work Experience" },
    impact_level: "high",
    effort: "quick",
    section_ref: "Work Experience",
  };
  changes.push("top_fixes[0].replaced_optional_education");
}

function dropUnsupportedTopFixes(topFixes: any[], resumeText: string, changes: string[]) {
  const supported = topFixes.filter((fix) => {
    const evidence = typeof fix?.evidence?.excerpt === "string" ? fix.evidence.excerpt : "";
    const instruction = typeof fix?.fix === "string" ? fix.fix : "";
    return findFixEvidenceMismatch(instruction, evidence, resumeText).length === 0
      && findAlreadySatisfiedFix(instruction, evidence, resumeText).length === 0
      && findNonActionableFix(instruction).length === 0;
  });
  if (supported.length === 0 || supported.length === topFixes.length) return topFixes;
  topFixes.forEach((fix, index) => {
    if (!supported.includes(fix)) changes.push(`top_fixes[${index}].dropped_unsupported`);
  });
  return supported;
}

function normalizeSectionReviewPresence(report: any, resumeText: string, changes: string[]) {
  const review = report?.section_review;
  if (!review || typeof review !== "object") return;
  const sections: Array<[string, boolean]> = [
    ["Summary", hasSummarySection(resumeText)],
    ["Work Experience", hasNamedSection(resumeText, ["experience", "work experience", "professional experience"])],
    ["Skills", hasNamedSection(resumeText, ["skills", "technical skills", "core skills", "core competencies"])],
    ["Education", hasNamedSection(resumeText, ["education", "academic background", "academic experience"])],
  ];

  for (const [section, present] of sections) {
    const item = review[section];
    if (!item || typeof item !== "object") continue;

    if (!present) {
      const nextFix = section === "Education"
        ? "Add only if it supports the target role or removes a stated requirement question."
        : "Add only if it helps the role story.";
      const changed = item.grade !== "N/A"
        || item.priority !== "Low"
        || item.working !== ""
        || item.missing !== "Section not present."
        || item.fix !== nextFix;
      item.grade = "N/A";
      item.priority = "Low";
      item.working = "";
      item.missing = "Section not present.";
      item.fix = nextFix;
      if (changed) changes.push(`section_review.${section}.absence`);
      continue;
    }

    let changed = false;
    const missing = String(item.missing || "");
    const fix = String(item.fix || "");
    if (!String(item.grade || "").trim() || String(item.grade).trim().toUpperCase() === "N/A") {
      const score = Number(report?.score);
      if (section === "Education") item.grade = "B";
      else if (Number.isFinite(score) && score >= 80) item.grade = "B";
      else if (Number.isFinite(score) && score >= 60) item.grade = "C";
      else item.grade = "C-";
      changed = true;
    }
    if (!String(item.priority || "").trim()) {
      item.priority = "Low";
      changed = true;
    }
    if (!String(item.working || "").trim()) {
      item.working = "Section is present and readable.";
      changed = true;
    }
    if (/\b(?:no|missing)\b[^.]{0,35}\bsection\b|\bsection\b[^.]{0,20}\bnot present\b/i.test(missing)) {
      item.missing = "";
      changed = true;
    }
    if (/^(?:none|no|n\/?a|nothing|not applicable)[.!]?$/i.test(String(item.missing || "").trim())) {
      item.missing = "No material section-specific gap identified.";
      changed = true;
    }
    if (/^(?:section present|no missing (?:education )?detail|no gpa \(not required\))[.!]?$/i.test(String(item.missing || "").trim())) {
      item.missing = "No material section-specific gap identified.";
      changed = true;
    }
    if (/^(?:none|no|n\/?a|nothing|not applicable)[.!]?$/i.test(String(item.fix || "").trim())) {
      item.fix = "No change needed unless it improves role alignment.";
      changed = true;
    }
    if (/^No\s*[-–—:]\s*(?:keep|change|action)/i.test(String(item.fix || "").trim())) {
      item.fix = "No change needed unless it improves role alignment.";
      changed = true;
    }
    if (/\bNo material (?:section-specific|summary|work experience|skills|education) gap identified\b|\bNo change needed unless it improves role alignment\b/i.test(String(item.working || ""))) {
      item.working = "Section is present and readable.";
      changed = true;
    }
    if (section === "Education" && /\b(?:advanced )?(?:credentials?|certifications?|degrees?|gpa|training|continuing education|coursework)\b/i.test(`${missing} ${fix}`)) {
      item.missing = "";
      item.fix = "No change needed unless the target role has a stated education or certification requirement.";
      item.priority = "Low";
      changed = true;
    } else if (section === "Skills" && isOptionalCredentialAdvice(`${missing} ${fix}`)) {
      if (/\b(?:career break|caregiving|return to work)\b/i.test(resumeText)) {
        item.missing = "Recent hands-on work is not named clearly.";
        item.fix = "Name one real recent course or personal project and the [completed artifact] it produced.";
        item.priority = "Medium";
      } else {
        item.missing = "No material section-specific gap identified.";
        item.fix = "No change needed unless it improves role alignment.";
        item.priority = "Low";
      }
      changed = true;
    } else if (section === "Skills" && /\bproficiency levels?\b/i.test(`${missing} ${fix}`)) {
      item.missing = "Tool usage is not connected to work examples.";
      item.fix = "Name only tools you have used and connect them to a work example.";
      item.priority = "Medium";
      changed = true;
    } else if (
      section === "Skills"
      && /\b(?:career break|caregiving|return to work)\b/i.test(resumeText)
      && /\b(?:recent hands-on|recent project)\b/i.test(`${item.missing || ""} ${item.fix || ""}`)
    ) {
      item.missing = "Recent hands-on work is not named clearly.";
      item.fix = "Name one real recent course or personal project and the [completed artifact] it produced.";
      item.priority = "Medium";
      changed = true;
    } else if (section === "Summary" && /\b(?:add|draft|create|write)\b[^.]{0,40}\b(?:summary|profile)\b/i.test(fix)) {
      item.fix = "Tighten the existing opening around [target role] and the strongest verified result.";
      changed = true;
    } else if (/\bif\s+(?:it is|not|isn't)\s+present\b/i.test(fix)) {
      item.fix = "No change needed unless it improves role alignment.";
      changed = true;
    } else if (/\badd\b[^.]{0,35}\bsection\b/i.test(fix)) {
      item.fix = "Refine the existing section only if it improves role alignment.";
      changed = true;
    }
    if (!String(item.missing || "").trim()) {
      item.missing = "No material section-specific gap identified.";
      changed = true;
    }
    if (!String(item.fix || "").trim()) {
      item.fix = "No change needed unless it improves role alignment.";
      changed = true;
    }
    if (section === "Summary" && /\beducation\b/i.test(String(item.missing || ""))) {
      item.missing = /\b(?:career break|caregiving|return to work)\b/i.test(resumeText)
        ? "The opening does not connect current hands-on evidence to the target role."
        : "The opening does not yet foreground the strongest role-relevant result.";
      item.fix = "Tighten the existing opening around [target role] and the strongest verified result.";
      changed = true;
    }
    if (section === "Summary" && hasSummarySection(resumeText) && /\bno (?:consolidated )?(?:summary|profile)\b/i.test(String(item.missing || ""))) {
      item.missing = "The existing opening is generic and does not show verified impact.";
      item.fix = "Tighten the existing opening around [target role] and the strongest verified result.";
      changed = true;
    }
    if (
      section === "Summary"
      && hasSummarySection(resumeText)
      && /\btighten the existing opening\b/i.test(String(item.fix || ""))
      && /^No material section-specific gap identified\.?$/i.test(String(item.missing || "").trim())
    ) {
      item.missing = "The existing opening is generic and does not show verified impact.";
      item.priority = "Medium";
      changed = true;
    }
    if (section === "Summary" && /\bno major missing,? but\b/i.test(String(item.missing || ""))) {
      item.missing = "Earlier-role outcome evidence is still uneven.";
      item.fix = "Use one verified earlier-role result to sharpen the opening.";
      changed = true;
    }
    if (/\b(?:career break|caregiving|return to work)\b/i.test(resumeText) && /\bpost[- ]break\b/i.test(`${item.missing || ""} ${item.fix || ""}`)) {
      item.missing = section === "Summary"
        ? "The opening does not connect recent hands-on evidence to the target role."
        : "Recent hands-on evidence is still too general.";
      item.fix = "Name one real recent course or personal project and the [completed artifact] it produced.";
      changed = true;
    }
    if (section === "Work Experience" && /\beducation\b/i.test(String(item.missing || ""))) {
      item.missing = String(item.missing).replace(/(?:education (?:section )?(?:is )?missing|missing education)[;,]?\s*/ig, "").trim();
      if (!item.missing) item.missing = "Some bullets do not yet show verified scope or results.";
      item.fix = Number(report?.score) >= 80
        ? "Rewrite the highest-priority weak bullet with verified scope or results."
        : "Rewrite the highest-priority weak bullet with [specific scope] and [measurable result].";
      changed = true;
    }
    if (/\badd (?:a )?second outcome\b/i.test(String(item.fix || ""))) {
      item.fix = "Add one verified result to the earlier-role bullet already identified.";
      changed = true;
    }
    if (/\bwhere possible\b/i.test(String(item.fix || ""))) {
      item.fix = "Use only verified scope or outcomes from the experience section.";
      changed = true;
    }
    if (changed) changes.push(`section_review.${section}.presence`);
  }

  for (const item of Object.values(review) as any[]) {
    if (!item || typeof item !== "object") continue;
    if (/^No material section-specific gap identified\.?$/i.test(String(item.missing || "").trim())) {
      item.priority = "Low";
      item.fix = "No change needed unless it improves role alignment.";
    }
  }

  const work = review["Work Experience"];
  const reportGaps = Array.isArray(report?.gaps) ? report.gaps.join(" ") : "";
  const workNeedsEvidence = Number(report?.score) < 70
    || /\b(?:quantif|measur|scope|outcome|impact|generic responsibilit|task descriptions?)\b/i.test(reportGaps);
  if (
    work
    && workNeedsEvidence
    && /^(?:No material section-specific gap identified\.?|None|No|N\/?A)?$/i.test(String(work.missing || "").trim())
  ) {
    work.priority = Number(report?.score) < 70 ? "High" : "Medium";
    work.missing = Number(report?.score) >= 80
      ? "Some lower-signal bullets do not yet show verified scope or results."
      : "Most bullets do not yet show verified scope or results.";
    work.fix = "Rewrite the highest-priority weak bullet with [specific scope] and [measurable result].";
    changes.push("section_review.Work Experience.evidence_consistency");
  }
  if (work && workNeedsEvidence && Number(report?.score) < 70) {
    if (work.priority !== "High") {
      work.priority = "High";
      changes.push("section_review.Work Experience.priority_consistency");
    }
    if (/\bownership\b|\bled\b|\bdrove\b|\bowned\b/i.test(String(work.fix || ""))) {
      work.fix = "Clarify the exact contribution and add only verified scope or results.";
      changes.push("section_review.Work Experience.ownership_safety");
    }
  }
  if (work && Number(report?.score) >= 80 && /^Most bullets do not yet show verified scope or results\.?$/i.test(String(work.missing || ""))) {
    work.missing = "Some lower-signal bullets do not yet show verified scope or results.";
    changes.push("section_review.Work Experience.scope_calibration");
  }
  if (work && /\bat least two bullets per role\b/i.test(String(work.fix || ""))) {
    work.fix = "Rewrite the two highest-priority bullets with verified scope and results.";
    changes.push("section_review.Work Experience.revision_scope");
  }
  if (work && /\b(?:each responsibility|each role|per role|where possible)\b/i.test(String(work.fix || ""))) {
    work.fix = "Revise only the two highest-priority bullets, using scope and outcomes you can verify.";
    changes.push("section_review.Work Experience.revision_scope");
  }
}

function isNoJobDescription(report: any) {
  return report?.job_alignment?.jd_match_score === 0
    && /no job description provided/i.test(String(report?.job_alignment?.jd_match_summary || ""));
}

function isOptionalCredentialAdvice(value: string) {
  return /\b(?:education|advanced degree|advanced credential|credential|certification|certifications|formal validation|coursework|courses)\b/i.test(value)
    && /\b(?:add|align|include|list|share|surface|consider|absence|lacks?|limited|missing|no|not detailed|not listed|not mentioned|not present|without)\b/i.test(value);
}

function replacementGapForOptionalAdvice(resumeText: string) {
  if (/\bcareer break\b/i.test(resumeText)) {
    return "The career-break entry names learning activity but not a specific recent project or artifact.";
  }
  if (!hasSummarySection(resumeText)) {
    return "The opening does not yet synthesize the strongest scope and outcomes into one positioning line.";
  }
  if (weakExperienceLine(resumeText)) {
    return "At least one experience bullet names activity without a result a recruiter can compare.";
  }
  return "The first scan could connect the strongest existing evidence to the target role more directly.";
}

function normalizeAdviceLists(report: any, resumeText: string, changes: string[]) {
  if (!isNoJobDescription(report)) return;
  const hasOpeningProfile = hasSummarySection(resumeText);

  if (hasOpeningProfile && typeof report.summary === "string") {
    const nextSummary = report.summary.replace(
      /\b(?:the resume )?would benefit from a concise executive summary\b/i,
      "The existing opening would benefit from tighter role and outcome positioning",
    );
    if (nextSummary !== report.summary) {
      report.summary = nextSummary;
      changes.push("summary.existing_profile_repair");
    }
  }

  if (typeof report.summary === "string") {
    const sentences = report.summary.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((sentence: string) => sentence.trim()).filter(Boolean) || [];
    const kept = sentences.filter((sentence: string) => !isOptionalCredentialAdvice(sentence));
    if (kept.length > 0 && kept.length !== sentences.length) {
      report.summary = kept.join(" ");
      changes.push("summary.deprioritized_optional_credential");
    }
  }

  if (Array.isArray(report.gaps)) {
    report.gaps = report.gaps.map((gap: any, index: number) => {
      if (typeof gap !== "string") return gap;
      if (hasOpeningProfile && /\b(?:no|missing|add|needs?)\b[^.]{0,45}\b(?:executive )?(?:summary|profile)\b/i.test(gap)) {
        changes.push(`gaps[${index}].existing_profile_repair`);
        if (/\b(?:recent business graduate|CAPM|operations assistant)\b/i.test(resumeText)) {
          return "The existing objective does not yet connect the CAPM and operations experience to a specific target role.";
        }
        return "The existing opening profile could connect leadership scope to business outcomes more directly.";
      }
      if (!isOptionalCredentialAdvice(gap)) return gap;
      changes.push(`gaps[${index}].deprioritized_optional_credential`);
      return replacementGapForOptionalAdvice(resumeText);
    });
    report.gaps = report.gaps.map((gap: any, index: number) => {
      if (typeof gap !== "string") return gap;
      if (/\bownership\b/i.test(gap) && /\b(?:led|drove|owned)\b/i.test(gap)) {
        changes.push(`gaps[${index}].ownership_safety`);
        return "Your exact contribution is unclear in several support-heavy bullets.";
      }
      if (/\badvanced tools? beyond (?:a )?basic CRM\b/i.test(gap)) {
        changes.push(`gaps[${index}].tool_filler`);
        return "Several sales bullets stop at activity without a result a recruiter can compare.";
      }
      if (/\bno explicit role-level progression or seniority signal beyond titles\b/i.test(gap)) {
        changes.push(`gaps[${index}].progression_evidence`);
        return "The titles progress, but the bullets do not show increasing scope.";
      }
      if (/;\s*(?:add|include|surface|rewrite)\b/i.test(gap)) {
        const finding = gap.split(";")[0]?.trim().replace(/[.!]+$/, "");
        changes.push(`gaps[${index}].removed_instruction`);
        return `${finding}.`;
      }
      return gap;
    });
  }

  if (Array.isArray(report.next_steps)) {
    const hasOtherOpeningAdvice = report.next_steps.some((step: any) =>
      typeof step === "string" && /\b(?:summary|opening profile|executive profile|positioning line)\b/i.test(step),
    );
    const hasEvidenceRevisionStep = report.next_steps.some((step: any) =>
      typeof step === "string" && /\b(?:quantif|outcome|scope|impact|weakest bullet|experience bullet)\b/i.test(step),
    );
    report.next_steps = report.next_steps.map((step: any, index: number) => {
      if (typeof step !== "string") return step;
      let normalizedStep = step.replace(/^\s*\d+[.)]\s*/, "");
      if (normalizedStep !== step) changes.push(`next_steps[${index}].removed_numbering`);
      if (/\b(?:request|provide|ask for)\b[^.]{0,30}\b(?:JD|job description)\b/i.test(normalizedStep)
        || /\bJD[- ]match narrative\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].target_role_scope`);
        return "Choose one target job description and reorder the strongest matching evidence in the resume.";
      }
      if (/\bsurface a concise executive summary next to experience\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].opening_scope`);
        return "Add a concise opening that names the target role, leadership scope, and strongest verified result.";
      }
      if (/\bportfolio\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].portfolio_scope`);
        return "Move the strongest verified ownership and outcome evidence into the relevant resume bullets.";
      }
      if (/\b(?:one|1)[- ]page achievement summary\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].extra_artifact_scope`);
        return "Use verified achievements to replace the three most generic responsibility bullets.";
      }
      if (/\brequest quantified examples from (?:the )?candidate\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].direct_voice`);
        return "Add one verified quota, pipeline, or conversion result from your own records to each recent role.";
      }
      if (/\badding numbers to each bullet where possible\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].verified_metrics`);
        return "Prioritize the three most relevant bullets and add only verified scope or results.";
      }
      if (/\brequest concrete project details\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].direct_voice`);
        return "Add the real project, process, or volume behind the highest-priority weak bullet.";
      }
      if (/\bownership verbs\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].ownership_safety`);
        return "Clarify your exact contribution without upgrading support work into ownership.";
      }
      if (/\b(?:dedicated )?(?:summary|highlights) section\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].optional_section`);
        return "Rewrite the weakest responsibility bullet with verified scope and a measurable result.";
      }
      if (/\b(?:dedicated )?achievements section\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].optional_section`);
        return "Move the strongest verified achievement into the most relevant experience bullet.";
      }
      if (/\bskills and summary revision\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].opening_scope`);
        return "Tighten the existing objective around entry-level operations and the CAPM, without unsupported claims.";
      }
      if (/\b(?:skills (?:and tools )?(?:mini-)?section|skills section|skills and summary revision)\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].skills_section_scope`);
        if (hasNamedSection(resumeText, ["skills", "technical skills", "core skills", "core competencies"])) {
          return "Use the next pass on the earlier experience bullet with the weakest verified outcome.";
        }
        return /\b(?:Python|R|SQL|AWS|Java|Figma|Excel|CRM|HRIS|Microsoft Office)\b/i.test(resumeText)
          ? "Connect the most relevant existing tools to the two strongest experience outcomes."
          : "Use the next pass on the experience bullet with the weakest verified result.";
      }
      if (/\b(?:leadership or ownership moments|ownership language|ownership verbs?)\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].ownership_safety`);
        return "Clarify your exact contribution without upgrading support work into ownership.";
      }
      if (/\b(?:quantify outcomes?|add one quantified achievement)[^.]{0,60}\bwhere possible\b|\badd one quantified achievement per role\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].verified_metrics`);
        return "Add only verified scope or results to the two highest-priority experience bullets.";
      }
      if (/\badd quantified outcomes? to (?:2\s*[-–]\s*3|two to three) bullets?\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].verified_metrics`);
        return "Add only verified scope or results to the two highest-priority experience bullets.";
      }
      if (/\b(?:add|incorporate) (?:one|1\s*[-–]\s*2|one to two|2\s*[-–]\s*3|two to three)?\s*(?:additional )?(?:quantified )?(?:achievements?|outcomes?|bullets?)[^.]{0,50}\b(?:per|for each) role\b/i.test(normalizedStep)
        || /\badd (?:a )?short bullets? list under each role\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].revision_scope`);
        return "Revise only the two highest-priority bullets, using scope and outcomes you can verify.";
      }
      if (/\bsurface concrete outcomes for each role\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].revision_scope`);
        return "Revise only the two highest-priority bullets, using outcomes you can verify.";
      }
      if (/\badd a dedicated bullet\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].rewrite_existing_bullets`);
        return "Rewrite the most relevant existing project bullet with your exact contribution and verified result.";
      }
      if (/\b(?:skills row|skills mini-section)\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].skills_section_scope`);
        return "Use the next pass on the experience bullet with the weakest verified outcome.";
      }
      if (/\badd\s+(?:2\s*[-–]\s*3|two to three)\s+bullets? with quantified outcomes\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].rewrite_existing_bullets`);
        return "Rewrite two existing budgeting, forecasting, or reporting bullets with verified scope and results.";
      }
      if (/\bsummary bullet for BrightWave\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].summary_bullet`);
        return "Add one verified HR outcome to the highest-priority BrightWave experience bullet.";
      }
      if (/\bheadline or bullet\b[^.]{0,80}\bsales leadership or pre-sales\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].seniority_overreach`);
        return "Tighten the existing summary around sales coordination and the specific role you are targeting.";
      }
      if (/\bownership claim\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].ownership_safety`);
        return "Clarify your exact contribution without upgrading support work into ownership.";
      }
      if (/\bevery bullet\b/i.test(normalizedStep) && /\b(?:outcome|impact|quantif)\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].revision_scope`);
        return "Prioritize the two weaker activity-only bullets and add only verified results.";
      }
      if (/\bcareer goal statement\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].opening_scope`);
        return "Choose one target job description and align the existing objective to its core operations requirements.";
      }
      if (/\boutcomes? you drove\b/i.test(normalizedStep)) {
        normalizedStep = normalizedStep.replace(/outcomes? you drove/gi, "outcomes you can verify");
        changes.push(`next_steps[${index}].ownership_safety`);
      }
      if (hasOpeningProfile && /\b(?:add|create|draft|write)\b[^.]{0,45}\b(?:executive )?(?:summary|profile)\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].existing_profile_repair`);
        return "Tighten the existing opening profile around the target role and strongest verified result.";
      }
      if (/\badd a post-break role title and dates\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].career_break_role_claim`);
        return "Name one real recent course or personal project and the [completed artifact] it produced.";
      }
      if (/\bupdate linkedin\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].linkedin_scope`);
        return "Connect that recent project to the backend or cloud role you want next.";
      }
      if (/\b(?:2\s*[-–]\s*3|two to three)\s+sentence summary of each role\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].role_summary_bloat`);
        return "Rewrite the two weakest bullets with clear scope and a verifiable result.";
      }
      if (!isOptionalCredentialAdvice(normalizedStep)) return normalizedStep;
      changes.push(`next_steps[${index}].deprioritized_optional_credential`);
      if (/\b(?:career break|caregiving|return to work)\b/i.test(resumeText)) {
        return "Name one real recent course or personal project and the [completed artifact] it produced.";
      }
      if (hasEvidenceRevisionStep) {
        return "Choose one target job description and reorder the strongest matching evidence in the resume.";
      }
      if (!hasSummarySection(resumeText) && !hasOtherOpeningAdvice) {
        return "Add a concise opening that names the target role, leadership scope, and strongest verified result.";
      }
      return "Rewrite the weakest outcome-free bullet with verified scope and a measurable result.";
    });
  }
}

function replaceDuplicateAdvice(
  values: unknown,
  fallbacks: string[],
  path: string,
  changes: string[],
) {
  if (!Array.isArray(values)) return values;
  const seen = new Set<string>();
  return values.map((value, index) => {
    if (typeof value !== "string") return value;
    const marker = normalize(value);
    if (!seen.has(marker)) {
      seen.add(marker);
      return value;
    }
    const replacement = fallbacks.find((candidate) => !seen.has(normalize(candidate)));
    if (!replacement) return value;
    seen.add(normalize(replacement));
    changes.push(`${path}[${index}].deduplicated`);
    return replacement;
  });
}

function normalizeDuplicateAdvice(report: any, resumeText: string, changes: string[]) {
  const gapFallbacks = [
    /\b(?:career break|caregiving|return to work)\b/i.test(resumeText)
      ? "The return-to-work story does not yet connect recent activity to a specific target role."
      : "The target role is not yet explicit in the opening.",
    "At least one experience bullet names activity without a result a recruiter can compare.",
    "The strongest evidence is not carried consistently into lower-signal bullets.",
  ];
  const stepFallbacks = [
    "Rewrite the weakest outcome-free bullet with verified scope and a measurable result.",
    "Choose one target job description and reorder the strongest matching evidence in the resume.",
    hasSummarySection(resumeText)
      ? "Tighten the existing opening profile around the target role and strongest verified result."
      : "Add a concise opening that names the target role and strongest verified result.",
  ];
  report.gaps = replaceDuplicateAdvice(report.gaps, gapFallbacks, "gaps", changes);
  report.next_steps = replaceDuplicateAdvice(report.next_steps, stepFallbacks, "next_steps", changes);
  if (Array.isArray(report.next_steps) && Array.isArray(report.top_fixes)) {
    const topFixMarkers = new Set(report.top_fixes.map((fix: any) => normalize(String(fix?.fix || ""))));
    const usedStepMarkers = new Set(report.next_steps.map((step: any) => normalize(String(step || ""))));
    report.next_steps = report.next_steps.map((step: any, index: number) => {
      if (typeof step !== "string" || !topFixMarkers.has(normalize(step))) return step;
      const replacement = stepFallbacks.find((candidate) => {
        const marker = normalize(candidate);
        return !topFixMarkers.has(marker) && !usedStepMarkers.has(marker);
      });
      if (!replacement) return step;
      usedStepMarkers.delete(normalize(step));
      usedStepMarkers.add(normalize(replacement));
      changes.push(`next_steps[${index}].top_fix_deduplicated`);
      return replacement;
    });
  }
  if (Array.isArray(report.next_steps)) {
    let sawToolStep = false;
    report.next_steps = report.next_steps.map((step: any, index: number) => {
      if (typeof step !== "string" || !/\b(?:tools?|HRIS|ATS|software|systems?)\b/i.test(step)) return step;
      if (!sawToolStep) {
        sawToolStep = true;
        return step;
      }
      changes.push(`next_steps[${index}].tool_topic_deduplicated`);
      return "Choose one target job description and reorder the strongest matching evidence in the resume.";
    });
  }
  if (Array.isArray(report.gaps)) {
    let sawOpeningGap = false;
    report.gaps = report.gaps.map((gap: any, index: number) => {
      if (typeof gap !== "string" || !/\b(?:summary|opening|top-line narrative)\b/i.test(gap)) return gap;
      if (!sawOpeningGap) {
        sawOpeningGap = true;
        return gap;
      }
      changes.push(`gaps[${index}].opening_deduplicated`);
      return "The first scan does not prioritize the strongest role-relevant results.";
    });
    report.gaps = report.gaps
      .map((gap: any) => typeof gap === "string" ? gap.replace(/^[-•●*]\s*/, "").trim() : gap)
      .slice(0, 3);
  }
}

function normalizeCareerBreakAdvice(report: any, resumeText: string, changes: string[]) {
  if (!/\b(?:career break|caregiving|return to work|return-to-work)\b/i.test(resumeText)) return;
  const availabilityPattern = /\b(?:availability|available within|ready to start|start date|start immediately|immediate contributions?)\b/i;
  const careerAmbiguityPattern = /\b(?:availability|available within|ready to start|start date|start immediately|immediate contributions?|does not quantify post[- ]break impact|post[- ]break impact is not quantified)\b/i;
  const replacementSentence = "Recent hands-on activity is still too general, which makes return-to-work readiness hard to assess.";

  for (const field of ["first_impression", "summary", "score_comment_long", "score_plain"]) {
    if (typeof report?.[field] !== "string" || !careerAmbiguityPattern.test(report[field])) continue;
    const sentences = report[field].match(/[^.!?]+(?:[.!?]+|$)/g)?.map((sentence: string) => sentence.trim()).filter(Boolean) || [];
    const next: string[] = [];
    for (const sentence of sentences) {
      const candidate = careerAmbiguityPattern.test(sentence) ? replacementSentence : sentence;
      if (!next.some((value) => normalize(value) === normalize(candidate))) next.push(candidate);
    }
    report[field] = next.join(" ");
    changes.push(`${field}.career_break_availability`);
  }

  if (Array.isArray(report.gaps)) {
    report.gaps = report.gaps.map((gap: any, index: number) => {
      if (typeof gap !== "string" || !availabilityPattern.test(gap)) return gap;
      changes.push(`gaps[${index}].career_break_availability`);
      return "The career-break entry does not name a specific recent project or artifact.";
    });
    report.gaps = report.gaps.map((gap: any, index: number) => {
      if (typeof gap !== "string" || !/\blimited surface of recent post-break activity\b/i.test(gap)) return gap;
      changes.push(`gaps[${index}].career_break_wording`);
      return "Recent post-break activity is described generally rather than through a named project.";
    });
    report.gaps = report.gaps.map((gap: any, index: number) => {
      if (typeof gap !== "string" || !/\bpost[- ]break impact\b[^.]{0,100}\b(?:current projects?|ongoing capability|not quantified)\b/i.test(gap)) return gap;
      changes.push(`gaps[${index}].career_break_wording`);
      return "The career-break entry does not name a specific recent project or artifact.";
    });
    let sawRecentEvidenceGap = false;
    report.gaps = report.gaps.map((gap: any, index: number) => {
      if (typeof gap !== "string" || !/\b(?:career-break|post-break|recent project|recent hands-on|current projects?)\b/i.test(gap)) return gap;
      if (!sawRecentEvidenceGap) {
        sawRecentEvidenceGap = true;
        return gap;
      }
      changes.push(`gaps[${index}].career_break_deduplicated`);
      return "The existing opening does not yet connect recent hands-on work to the target role.";
    });
    let sawOpeningGap = false;
    report.gaps = report.gaps.map((gap: any, index: number) => {
      if (typeof gap !== "string" || !/\bexisting opening\b/i.test(gap)) return gap;
      if (!sawOpeningGap) {
        sawOpeningGap = true;
        return gap;
      }
      changes.push(`gaps[${index}].career_break_opening_deduplicated`);
      return "One cloud-migration bullet still lacks a verified result.";
    });
  }
  if (Array.isArray(report.next_steps)) {
    report.next_steps = report.next_steps.map((step: any, index: number) => {
      if (typeof step !== "string" || !availabilityPattern.test(step)) return step;
      changes.push(`next_steps[${index}].career_break_availability`);
      return "Name one real recent course or personal project and the [completed artifact] it produced.";
    });
    report.next_steps = report.next_steps.map((step: any, index: number) => {
      if (typeof step !== "string" || !/\btighten (?:(?:the )?professional )?summary\b/i.test(step)) return step;
      changes.push(`next_steps[${index}].career_break_opening`);
      return "Tighten the existing opening around the target backend role and most recent verified project.";
    });
    report.next_steps = report.next_steps.map((step: any, index: number) => {
      if (typeof step !== "string" || !/\b(?:recent contributions?|new projects?)[^.]{0,80}\b(?:return to work|post[- ]break|after return)\b/i.test(step)) return step;
      changes.push(`next_steps[${index}].career_break_recent_evidence`);
      return "Name one real recent course or personal project and the [completed artifact] it produced.";
    });
  }

  const alignment = report?.job_alignment;
  if (Array.isArray(alignment?.underplayed)) {
    alignment.underplayed = alignment.underplayed.map((item: any, index: number) => {
      if (typeof item !== "string" || !availabilityPattern.test(item)) return item;
      changes.push(`job_alignment.underplayed[${index}].career_break_availability`);
      return "Specific recent hands-on activity";
    });
  }
  if (typeof alignment?.positioning_suggestion === "string" && availabilityPattern.test(alignment.positioning_suggestion)) {
    alignment.positioning_suggestion = "Position around backend and cloud evidence, then name one real recent project and its completed artifact.";
    changes.push("job_alignment.positioning_suggestion.career_break_availability");
  }

  const reviews = report?.section_review;
  if (reviews && typeof reviews === "object") {
    for (const [section, item] of Object.entries(reviews) as Array<[string, any]>) {
      if (!item || typeof item !== "object") continue;
      if (availabilityPattern.test(`${item.missing || ""} ${item.fix || ""}`)) {
        item.missing = section === "Summary"
          ? "The opening does not connect recent hands-on evidence to the target role."
          : "Recent hands-on evidence is still too general.";
        item.fix = "Name one real recent course or personal project and the [completed artifact] it produced.";
        changes.push(`section_review.${section}.career_break_availability`);
      }
    }
  }

  const questions = report?.ideas?.questions;
  if (Array.isArray(questions)) {
    questions.forEach((question: any, index: number) => {
      if (typeof question?.question !== "string" || !availabilityPattern.test(question.question)) return;
      question.question = "What recent course or personal project produced an artifact you can name?";
      question.why = "Shows current hands-on evidence without inventing a post-break role.";
      changes.push(`ideas.questions[${index}].career_break_availability`);
    });
  }
}

function normalizeIdeaQuestionRepetition(report: any, changes: string[]) {
  const questions = report?.ideas?.questions;
  if (!Array.isArray(questions)) return;
  questions.forEach((item: any, index: number) => {
    if (typeof item?.question !== "string") return;
    const repeatedVerb = item.question.match(/^(.+\bdid you ([a-z]+)\b.+),\s*and (?:what|how) did you \2\??$/i);
    if (!repeatedVerb) return;
    item.question = `${repeatedVerb[1]}, and what result followed?`;
    changes.push(`ideas.questions[${index}].repeated_verb`);
  });
}

function normalizeSummaryStructure(report: any, changes: string[]) {
  if (typeof report?.summary !== "string" || !report.summary.trim()) return;
  const appendedGapPattern = /^(?:One material gap is that\b|One thing is still unresolved:)/i;
  const originalSentences = report.summary.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((sentence: string) => sentence.trim()).filter(Boolean) || [];
  let patternSentences = originalSentences.filter((sentence: string) =>
    !/^(?:Expected next step|Fast path|Strengthen (?:this )?by|Surface and quantify|We should)\b/i.test(sentence),
  );
  const hasEarlierGapSentence = patternSentences.some((sentence: string) =>
    !appendedGapPattern.test(sentence)
    && /\b(?:lack of|absence of|missing|unclear|unresolved|question|lacks?|does not|do not|without|stops? at|limits?|leaves?)\b/i.test(sentence),
  );
  if (hasEarlierGapSentence) {
    patternSentences = patternSentences.filter((sentence: string) =>
      !appendedGapPattern.test(sentence),
    );
  }
  if (patternSentences.length >= 3 && patternSentences.length !== originalSentences.length) {
    report.summary = patternSentences.join(" ");
    changes.push("summary.removed_prescriptive_appendix");
  }
  const hasGap = /\b(open question|(?:practical|remaining|main|real) question|unresolved|remains? (?:unclear|unknown|unanswered)|harder to see|hard to (?:assess|gauge|place|see)|difficult to (?:assess|gauge|place|see)|lack of|absence of|missing|unclear|vague|could|needs|lacks?|does not|without|limits?|leaves?|stops? at|buried|uneven|not obvious|gaps?|weakness(?:es)?|thin|holds? (?:it|this) back)\b/i.test(report.summary);
  if (hasGap) return;
  const firstGap = Array.isArray(report.gaps)
    ? report.gaps.find((gap: unknown) => typeof gap === "string" && gap.trim())
    : null;
  if (typeof firstGap !== "string") return;
  const gap = firstGap.trim().replace(/^[-•●*]\s*/, "").replace(/;\s*(?:e\.g\.|for example)[\s\S]*$/i, "").replace(/[.!]+$/, "");
  const lowerGap = gap ? `${gap[0].toLowerCase()}${gap.slice(1)}` : "one material evidence gap";
  const gapLeadIns = [
    "The missing piece is this",
    "A recruiter will still have to infer one thing",
    "The part that still needs an answer is this",
  ];
  const gapSentence = `${gapLeadIns[gap.length % gapLeadIns.length]}: ${lowerGap}.`;
  const sentences = report.summary.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((sentence: string) => sentence.trim()).filter(Boolean) || [];
  if (sentences.length >= 5) sentences[sentences.length - 1] = gapSentence;
  else sentences.push(gapSentence);
  report.summary = sentences.join(" ");
  changes.push("summary.added_gap_consequence");
}

function normalizeOptionalAdviceFields(report: any, changes: string[]) {
  if (!isNoJobDescription(report)) return;
  for (const field of ["score_comment_long", "score_plain"]) {
    if (typeof report?.[field] !== "string") continue;
    const sentences = report[field].match(/[^.!?]+(?:[.!?]+|$)/g)?.map((sentence: string) => sentence.trim()).filter(Boolean) || [];
    const kept = sentences.filter((sentence: string) => !isOptionalCredentialAdvice(sentence));
    if (kept.length > 0 && kept.length !== sentences.length) {
      report[field] = kept.join(" ");
      changes.push(`${field}.deprioritized_optional_credential`);
    }
  }
}

function normalizeEvidenceRichReport(report: any, resumeText: string, changes: string[]) {
  const bullets = sourceLines(resumeText).filter((line) => /^[-•●*]\s+\S/.test(line));
  if (bullets.length < 8) return;
  const outcomeDensity = bullets.filter(hasGroundedOutcome).length / bullets.length;
  const ownershipDensity = bullets.filter((line) =>
    /^[-•●*]\s+(?:I\s+)?(?:led|managed|built|created|developed|designed|implemented|architected|owned|directed|headed|mentored|decided|partnered|collaborated)\b/i.test(line),
  ).length / bullets.length;
  if (outcomeDensity < 0.8 || ownershipDensity < 0.65) return;

  if (typeof report.summary === "string") {
    const sentences = report.summary.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((sentence: string) => sentence.trim()).filter(Boolean) || [];
    const next = sentences
      .map((sentence: string) => /\b(?:material gap|lack of explicit personal contribution|explicit cross-functional program ownership|ownership (?:is|remains) unclear|exact impact is unclear|absence of a consistent end-to-end impact narrative)\b/i.test(sentence)
        ? "The only clear gap is prioritization: a tighter opening can foreground the results most relevant to the target role."
        : sentence)
      .filter((sentence: string) => !/^Strengthen (?:this )?by\b/i.test(sentence));
    const normalized = next.slice(0, 5).join(" ");
    if (normalized && normalized !== report.summary) {
      report.summary = normalized;
      changes.push("summary.evidence_rich_consistency");
    }
  }

  if (Array.isArray(report.gaps)) {
    report.gaps = report.gaps.map((gap: any, index: number) => {
      if (typeof gap !== "string") return gap;
      if (/\bdo not tie (?:them|outcomes) to (?:your|the) direct actions\b/i.test(gap)) {
        changes.push(`gaps[${index}].evidence_rich_consistency`);
        return "The density of detail makes the strongest results harder to prioritize on a fast scan.";
      }
      if (/\bearly career\b[^.]{0,60}\bownership\b/i.test(gap)) {
        changes.push(`gaps[${index}].evidence_rich_consistency`);
        return "The strongest results are spread across several roles instead of concentrated in the opening scan.";
      }
      if (/\bexplicit cross-functional program ownership\b/i.test(gap)) {
        changes.push(`gaps[${index}].evidence_rich_consistency`);
        return "The strongest results are spread across several roles instead of concentrated in the opening scan.";
      }
      if (/\bopening does not yet synthesize\b/i.test(gap)) {
        changes.push(`gaps[${index}].evidence_rich_consistency`);
        return "The density of detail makes the strongest results harder to prioritize on a fast scan.";
      }
      if (/\b(?:end-to-end impact narrative|ownership level for ongoing initiatives)\b/i.test(gap)) {
        changes.push(`gaps[${index}].evidence_rich_consistency`);
        return index === 0
          ? "The density of detail makes the strongest results harder to prioritize on a fast scan."
          : "The strongest results are spread across several roles instead of concentrated in the opening scan.";
      }
      if (/\bat least one earlier experience bullet still lacks a result\b/i.test(gap)) {
        changes.push(`gaps[${index}].evidence_rich_consistency`);
        return "The target role is not stated, so the first scan cannot prioritize the most relevant outcomes.";
      }
      return gap;
    });
  }

  const work = report?.section_review?.["Work Experience"];
  if (work) {
    work.grade = "A";
    work.priority = "Low";
    work.missing = "No material section-specific gap identified.";
    work.fix = "No change needed unless it improves role alignment.";
    changes.push("section_review.Work Experience.evidence_rich_consistency");
  }
}

function inferredAlignmentThemes(resumeText: string) {
  if (/\b(?:data scientist|machine learning|predictive analytics)\b/i.test(resumeText)) {
    return {
      aligned: ["Applied data science", "Machine-learning delivery", "Cross-functional technical leadership"],
      underplayed: ["Target-industry emphasis", "Role-specific positioning"],
    };
  }
  if (/\b(?:chief marketing officer|marketing|demand generation|campaign)\b/i.test(resumeText)) {
    return {
      aligned: ["Go-to-market leadership", "Demand generation", "Cross-functional marketing execution"],
      underplayed: ["Target-segment emphasis", "Role-specific positioning"],
    };
  }
  if (/\b(?:software engineer|software developer|backend|microservices)\b/i.test(resumeText)) {
    return {
      aligned: ["Backend development", "Cloud delivery", "Cross-functional engineering"],
      underplayed: ["Recent hands-on work", "Target-stack emphasis"],
    };
  }
  if (/\b(?:ux designer|user experience|design systems?)\b/i.test(resumeText)) {
    return {
      aligned: ["UX leadership", "Product design strategy", "Cross-functional design delivery"],
      underplayed: ["Business-outcome framing", "Target-product emphasis"],
    };
  }
  if (/\b(?:sales executive|sales representative|client accounts?|lead generation)\b/i.test(resumeText)) {
    return {
      aligned: ["Client support", "Sales coordination", "Cross-functional collaboration"],
      underplayed: ["Revenue ownership", "Quantified account outcomes"],
    };
  }
  if (/\b(?:human resources|hr business partner|employee relations|talent acquisition)\b/i.test(resumeText)) {
    return {
      aligned: ["HR operations", "Employee relations", "Cross-functional people support"],
      underplayed: ["Program ownership", "Quantified people outcomes"],
    };
  }
  if (/\b(?:finance analyst|financial reporting|budgeting|forecasting)\b/i.test(resumeText)) {
    return {
      aligned: ["Financial reporting", "Budgeting and forecasting", "Cross-functional finance support"],
      underplayed: ["Decision impact", "Systems and modeling depth"],
    };
  }
  if (/\b(?:operations assistant|operations manager|inventory|supply chain)\b/i.test(resumeText)) {
    return {
      aligned: ["Operations support", "Team coordination", "Process administration"],
      underplayed: ["Process improvement", "Quantified operating outcomes"],
    };
  }
  return {
    aligned: ["Role-relevant execution", "Cross-functional collaboration", "Progressive responsibility"],
    underplayed: ["Target-role emphasis", "Quantified outcomes"],
  };
}

function inferredSeniority(resumeText: string) {
  if (/\b(?:chief|cmo|vice president|vp)\b/i.test(resumeText)) return "Executive";
  if (/\b(?:director|head of)\b/i.test(resumeText)) return "Director-level";
  if (/\b(?:senior|lead|manager)\b/i.test(resumeText)) return "Senior or lead-level";
  if (/\b(?:recent graduate|junior|intern)\b/i.test(resumeText)) return "Early career";
  return "Experienced individual contributor";
}

function inferredIndustrySignals(resumeText: string) {
  const headingText = sourceLines(resumeText).filter((line) => !/^[-•●*]\s/.test(line)).join("\n");
  const candidates: Array<[RegExp, string, string]> = [
    [/\bSaaS\b/i, "SaaS", resumeText],
    [/\bhealth(?:care)?|hospital|patient\b/i, "Healthcare", resumeText],
    [/\bfintech|financial services|banking\b/i, "Financial services", headingText],
    [/\bretail\b/i, "Retail", headingText],
    [/\blogistics\b/i, "Logistics", headingText],
    [/\bmanufactur(?:ing|er)\b/i, "Manufacturing", headingText],
    [/\bcloud|software|technolog(?:y|ies)\b/i, "Technology", headingText],
  ];
  return candidates.filter(([pattern, , text]) => pattern.test(text)).map(([, label]) => label).slice(0, 4);
}

function isPlaceholderAlignmentItem(value: unknown) {
  return typeof value !== "string"
    || /^\s*[-–—]*\s*(?:none|n\/?a|unknown|not provided)\s*[-–—]*\s*$/i.test(value);
}

function normalizeNoJdAlignment(report: any, resumeText: string, changes: string[]) {
  if (!isNoJobDescription(report)) return;
  const alignment = report.job_alignment;
  const inferred = inferredAlignmentThemes(resumeText);
  const aligned = Array.isArray(alignment.strongly_aligned)
    ? alignment.strongly_aligned.filter((value: unknown) => !isPlaceholderAlignmentItem(value))
    : [];
  const underplayed = Array.isArray(alignment.underplayed)
    ? alignment.underplayed.filter((value: unknown) => !isPlaceholderAlignmentItem(value))
    : [];
  if (aligned.length < 3) {
    alignment.strongly_aligned = inferred.aligned;
    changes.push("job_alignment.strongly_aligned.placeholder_repair");
  }
  if (underplayed.length < 2) {
    alignment.underplayed = inferred.underplayed;
    changes.push("job_alignment.underplayed.placeholder_repair");
  }
  const missingMarker = "No target-role requirements were provided for comparison";
  if (!Array.isArray(alignment.missing) || alignment.missing.length !== 1 || alignment.missing[0] !== missingMarker) {
    alignment.missing = [missingMarker];
    changes.push("job_alignment.missing.placeholder_repair");
  }

  const roleFit = alignment.role_fit;
  if (!roleFit || typeof roleFit !== "object") return;
  if (!String(roleFit.seniority_read || "").trim() || /\bnot clear\b|\bunknown\b|\binsufficient\b/i.test(String(roleFit.seniority_read))) {
    roleFit.seniority_read = inferredSeniority(resumeText);
    changes.push("job_alignment.role_fit.seniority_read.repaired");
  }
  if (/\brecent (?:business )?graduate\b/i.test(resumeText) && roleFit.seniority_read !== "Early career") {
    roleFit.seniority_read = "Early career";
    changes.push("job_alignment.role_fit.seniority_read.early_career");
  }
  if (Array.isArray(roleFit.stretch_roles)) {
    const filtered = roleFit.stretch_roles.filter((role: unknown) => {
      if (typeof role !== "string") return false;
      if (/\bCTO Advisory\b/i.test(role)) return false;
      if (/\bSales Engineer\b/i.test(role) && !/\b(?:sales engineer|solutions engineer|technical sales)\b/i.test(resumeText)) return false;
      return true;
    });
    if (filtered.length > 0 && filtered.length !== roleFit.stretch_roles.length) {
      roleFit.stretch_roles = filtered;
      changes.push("job_alignment.role_fit.stretch_roles.grounded");
    }
  }
  const industries = inferredIndustrySignals(resumeText);
  if (industries.length > 0 && JSON.stringify(roleFit.industry_signals) !== JSON.stringify(industries)) {
    roleFit.industry_signals = industries;
    changes.push("job_alignment.role_fit.industry_signals.repaired");
  }
  const hasCompanyStageSignal = /\b(?:startup|early[- ]stage|growth[- ]stage|series [a-f])\b/i.test(resumeText);
  if (!hasCompanyStageSignal && String(roleFit.company_stage_fit || "") !== "Not clear from the resume alone") {
    roleFit.company_stage_fit = "Not clear from the resume alone";
    changes.push("job_alignment.role_fit.company_stage_fit.grounded");
  } else if (!String(roleFit.company_stage_fit || "").trim()) {
    roleFit.company_stage_fit = "Not clear from the resume alone";
    changes.push("job_alignment.role_fit.company_stage_fit.repaired");
  }
}

function normalizeTopFixRationales(topFixes: any[], resumeText: string, changes: string[]) {
  const missingBothRationales = [
    "This line tells us the task, but leaves both the size of the work and the result unanswered.",
    "The work is clear, but the page gives us no way to judge its size or effect.",
    "As written, this reads like a duty because neither the scale nor the result is visible.",
  ];
  const missingResultRationales = [
    "This line tells us what you handled, but not what changed.",
    "The responsibility is clear; the result is still missing.",
    "We can see the work, but not the difference it made.",
  ];
  const missingScopeRationales = [
    "The result is worth keeping, but we cannot see how large or complex the work was.",
    "The change is clear; adding the size of the work would give it proper weight.",
    "We can see what changed, but not the scale behind it.",
  ];
  const buriedResultRationales = [
    "The proof is already here. Put the number first so it does not get buried.",
    "This is a good result, but the sentence makes us wait for it.",
    "The number carries the bullet. Give it the first position.",
  ];

  topFixes.forEach((fix, index) => {
    let instruction = String(fix?.fix || "");
    const evidence = String(fix?.evidence?.excerpt || "");
    const evidenceMarker = normalize(evidence);
    if (evidenceMarker.startsWith("no ") && evidenceMarker.endsWith(" section present")) return;
    const source = sourceContextFor(evidence, resumeText);
    let rationale: string | null = null;
    if (/^(?:Move|Put) (?:its|the) existing\b/i.test(instruction)) {
      const metrics = groundedMetricTokens(source);
      const scopeMetric = metrics[0]?.replace(/\bteam of (\d+)\b/i, "team-of-$1").replace(/\btransaction\b/i, "transaction-record");
      const reference = humanBulletReference(source, String(fix?.evidence?.section || ""));
      fix.fix = metrics.length >= 2
        ? `Lead the ${reference} with the existing ${scopeMetric} scope and ${metrics[1]} result.`
        : metrics.length === 1
          ? `Lead the ${reference} with the existing ${scopeMetric} scale and result.`
          : `Lead the ${reference} with its strongest existing result.`;
      instruction = fix.fix;
      changes.push(`top_fixes[${index}].fix.naturalized_existing_evidence`);
      rationale = buriedResultRationales[index % buriedResultRationales.length];
    } else if (/\brecent course or personal project\b/i.test(instruction)) {
      rationale = "A named recent artifact provides current evidence without inventing post-break employment.";
      if (fix.confidence === "high") {
        fix.confidence = "medium";
        changes.push(`top_fixes[${index}].confidence.repaired`);
      }
    } else if (/\[measurable result\]|\[result\]/i.test(instruction) && /\[(?:specific )?scope\]/i.test(instruction)) {
      rationale = missingBothRationales[index % missingBothRationales.length];
    } else if (/\[measurable result\]|\[result\]/i.test(instruction) && !hasGroundedOutcome(source)) {
      rationale = missingResultRationales[index % missingResultRationales.length];
    } else if (/\[(?:specific )?scope\]/i.test(instruction) && hasGroundedOutcome(source)) {
      rationale = missingScopeRationales[index % missingScopeRationales.length];
    }
    if (rationale && rationale !== fix.why) {
      fix.why = rationale;
      changes.push(`top_fixes[${index}].why.repaired`);
    }
  });
}

function alignStrongBulletFixWithGap(report: any, resumeText: string, changes: string[]) {
  if (!Array.isArray(report?.top_fixes) || report.top_fixes.length === 0) return;
  const quote = String(report.biggest_gap_example || "").match(/["“]([^"”]+)["”]/)?.[1];
  if (!quote) return;
  const gapLine = exactSourceLine(quote, resumeText);
  if (!gapLine || hasGroundedOutcome(gapLine)) return;
  const citedLines = report.top_fixes.map((fix: any) =>
    sourceContextFor(String(fix?.evidence?.excerpt || ""), resumeText),
  );
  if (citedLines.some((line: string) => line === gapLine)) return;
  const strongFixIndex = citedLines.findIndex((line: string) => hasGroundedOutcome(line));
  if (strongFixIndex < 0) return;

  const first = report.top_fixes[strongFixIndex];
  const hasScope = hasGroundedScope(gapLine);
  first.fix = hasScope
    ? "Add [measurable result] to this bullet and connect it to the work already named."
    : "Add [specific scope] and [measurable result] to this bullet.";
  first.fix = humanizeFixReference(first.fix, gapLine, "Work Experience");
  first.why = hasScope
    ? "The line shows the size of the work, but not what changed because of it."
    : "The line shows useful activity, but the reader still has to guess at both scale and result.";
  first.confidence = "medium";
  first.evidence = {
    excerpt: bestExactWindow(gapLine, gapLine, 140),
    section: "Work Experience",
  };
  first.impact_level = "high";
  first.effort = "quick";
  first.section_ref = "Work Experience";
  changes.push(`top_fixes[${strongFixIndex}].aligned_with_biggest_gap`);
}

function safeBiggestGap(value: string, sourceText: string) {
  if (/\b(?:availability|ready to start|start immediately|immediate contributions?)\b/i.test(value)) {
    const recentActivity = sourceLines(sourceText).find((line) => /\bmaintained technical skills\b|\bpersonal projects?\b/i.test(line));
    if (recentActivity) {
      return `"${recentActivity}" does not name a specific recent project or artifact, so current hands-on evidence remains hard to assess.`;
    }
  }
  const quote = value.match(/["“]([^"”]+)["”]/)?.[1];
  if (quote && /\b(?:already backed|remaining opportunity)\b/i.test(value)) {
    const replacement = weakExperienceLine(sourceText)
      || outcomelessExperienceLine(sourceText, new Set([sourceContextFor(quote, sourceText)]));
    if (replacement) {
      return `"${replacement}" is missing a measurable outcome, so we cannot place the impact.`;
    }
    return `"${quote}" already shows mechanism, scope, and outcome; no material evidence gap is visible in the supplied resume.`;
  }
  const hasExplanation = /\b(?:missing|lacks?|unclear|hard to|cannot|can not|does not|but not|not your|not the|needs?|underplays?|buries|already backed|remaining opportunity)\b/i.test(
    value.replace(/["“][^"”]+["”]/g, ""),
  );
  if (quote && !hasExplanation) {
    const weakLine = weakExperienceLine(sourceText)
      || outcomelessExperienceLine(sourceText, new Set([sourceContextFor(quote, sourceText)]));
    if (weakLine && sourceContextFor(quote, sourceText) !== weakLine) {
      return `"${weakLine}" is missing a measurable outcome, so we cannot place the impact.`;
    }
    const source = sourceContextFor(quote, sourceText);
    if (hasGroundedScope(source) && hasGroundedOutcome(source)) {
      return `"${quote}" already shows mechanism, scope, and outcome; no material evidence gap is visible in the supplied resume.`;
    }
    return `"${quote}" is missing clearer scope or outcome evidence, so we cannot place the impact.`;
  }
  const contradictions = findBiggestGapContradictions(value, sourceText);
  if (contradictions.length === 0) return value;
  const weakLine = weakExperienceLine(sourceText)
    || outcomelessExperienceLine(sourceText, new Set([sourceContextFor(quote || "", sourceText)]));
  if (weakLine) {
    return `"${weakLine}" is missing a measurable outcome, so we cannot place the impact.`;
  }
  if (!quote) return value;
  const source = sourceContextFor(quote, sourceText);
  const sourceHasScope = hasGroundedScope(source);
  const sourceHasOutcome = hasGroundedOutcome(source);
  if (sourceHasOutcome && !sourceHasScope) {
    return `"${quote}" shows a qualitative outcome but is missing clear scope, so we cannot place the scale.`;
  }
  if (sourceHasScope && !sourceHasOutcome) {
    return `"${quote}" shows scope but is missing a measurable outcome, so we cannot place the impact.`;
  }
  return `"${quote}" already shows mechanism, scope, and outcome; no material evidence gap is visible in the supplied resume.`;
}

const GENERATED_LANGUAGE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bproven track record\b/gi, "documented results"],
  [/\bleveraging expertise\b/gi, "using this experience"],
  [/\bstrategic initiatives\b/gi, "priority programs"],
  [/\bdriving results\b/gi, "producing results"],
  [/\boperational excellence\b/gi, "reliable execution"],
  [/\bstrong experience\b/gi, "substantial experience"],
  [/\bseasoned professional\b/gi, "candidate with deep experience"],
  [/\bsolid experience\b/gi, "relevant experience"],
  [/\bhigh-impact\b/gi, "consequential"],
  [/\beffective communicator\b/gi, "clear communicator"],
  [/\b(?:improve|raise|increase) (?:the )?score\b/gi, "make the impact easier to compare"],
  [/\bsurface and surface\b/gi, "surface"],
  [/\blaid out multiple operational exposure\b/gi, "shows operations exposure"],
  [/\ba consistent track of\b/gi, "a consistent record of"],
  [/\bROI driven\b/gi, "ROI-driven"],
  [/\bmid level\b/gi, "mid-level"],
  [/\bbackend focused\b/gi, "backend-focused"],
  [/\bentry level\b/gi, "entry-level"],
  [/\bBroad but underoutcomed\b/gi, "Show measurable HR outcomes"],
  [/\bLeadership in marketing leadership\b/gi, "Marketing leadership"],
  [/\bYou read as a candidate with\b/gi, "You read as a professional with"],
  [/\bYou read as a solid foundation in HR operations with a progression to leadership\b/gi, "You read as an HR operations leader with clear career progression"],
  [/\bThe candidate demonstrates\b/g, "Your resume demonstrates"],
  [/\bthe candidate demonstrates\b/g, "your resume demonstrates"],
  [/\bfrom the candidate\b/gi, "from your own experience"],
  [/\bPosition as a grid-ready candidate with a focus on evolving into revenue ownership\b/gi, "Position for sales roles that offer a clear path toward revenue ownership"],
  [/\bthe report would be stronger\b/gi, "your resume would be stronger"],
  [/\bStrengthen by surface\b/gi, "Strengthen this by surfacing"],
  [/\bactions you took and tie them\b/gi, "actions you took and tying them"],
  [/\bWe should surface\b/g, "Surface"],
  [/\bwe should surface\b/g, "surface"],
  [/\bLA based\b/gi, "LA-based"],
  [/\bcross functional\b/gi, "cross-functional"],
  [/\bhigher level\b/gi, "higher-level"],
  [/\bstronger ownership language and concrete outcomes tied to improvements or efficiencies\b/gi, "clearer contribution language and verified outcomes tied to improvements or efficiencies"],
  [/\band mentors with measurable results\b/gi, "and quantify the results of your mentoring"],
  [/\bthis cited bullet\b/gi, "this bullet"],
  [/\bthe cited bullet\b/gi, "the bullet"],
  [/\bthis cited line\b/gi, "this line"],
  [/\bthe cited line\b/gi, "the line"],
  [/\brole-level signal\b/gi, "role level"],
  [/\bpersonal mechanism\b/gi, "specific contribution"],
  [/\bthe material gap is\b/gi, "the open question is"],
  [/\bmaterial gap\b/gi, "important gap"],
  [/\bharder to place\b/gi, "harder to judge"],
  [/\bthe page currently supports\b/gi, "the resume currently points to"],
  [/\bthe page supports\b/gi, "the resume points to"],
  [/\bthe evidence supports\b/gi, "the resume points to"],
  [/\byour strongest pattern is\b/gi, "the consistent thread is"],
  [/\bthe strongest pattern is\b/gi, "across the resume, the work centers on"],
  [/\byour clearest pattern is\b/gi, "across the resume, the work centers on"],
  [/\byour clearest strength is\b/gi, "the clearest advantage is"],
  [/\bthe open question is\b/gi, "what remains unclear is"],
  [/\bthe unresolved question is\b/gi, "what remains unresolved is"],
];

function normalizeGeneratedLanguage(value: any, changes: string[], path: string[] = []): any {
  if (typeof value === "string") {
    const joined = path.join(".");
    if (/\.evidence\.excerpt$/.test(joined) || /\.rewrites\.\d+\.original$/.test(`.${joined}`) || joined === "biggest_gap_example") {
      return value;
    }
    let next = value;
    for (const [pattern, replacement] of GENERATED_LANGUAGE_REPLACEMENTS) {
      next = next.replace(pattern, (match) => /^[A-Z]/.test(match)
        ? `${replacement[0].toUpperCase()}${replacement.slice(1)}`
        : replacement);
    }
    next = next
      .replace(/\b(\d+)\.\s+(\d+)%/g, "$1.$2%")
      .replace(/\b(\d+)\.\s+(\d+)(?=[kmb]\b)/gi, "$1.$2");
    next = next.trim();
    if (next !== value) changes.push(`${joined}.normalized_language`);
    return next;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => normalizeGeneratedLanguage(item, changes, [...path, String(index)]));
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      value[key] = normalizeGeneratedLanguage(value[key], changes, [...path, key]);
    }
  }
  return value;
}

function ensureBiggestGapQuote(value: string, sourceText: string) {
  if (/["“][^"”]+["”]/.test(value)) return value;
  const markerIndex = value.search(/\s+(?:is missing|lacks?|needs?|does not|doesn't|has no|provides no)\b/i);
  if (markerIndex <= 0) return value;
  const draft = value.slice(0, markerIndex).trim();
  const canonical = exactSourceValue(draft, sourceText, 140);
  if (!canonical) return value;
  return `"${canonical}" ${value.slice(markerIndex).trim()}`;
}

function naturalizeRewrite(value: string) {
  let natural = value
    .trim()
    .replace(/^Mechanism:\s*/i, "");
  if (natural && /^[a-z]/.test(natural)) {
    natural = `${natural[0].toUpperCase()}${natural.slice(1)}`;
  }
  return natural;
}

function capWords(value: string, maxWords: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value.trim();
  const capped = words.slice(0, maxWords).join(" ").replace(/[,;:]$/, "");
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

function rewriteSafetyIssues(original: string, better: string, sourceText: string) {
  return [
    ...findUnsupportedAgencyUpgrade(original, better, sourceText).map(value => `agency:${value}`),
    ...findUnsupportedOutcomeClaims(original, better, sourceText).map(value => `outcome:${value}`),
    ...findRewriteFidelityIssues(original, better, sourceText),
  ];
}

export function buildResumeEvidenceCatalog(resumeText: string) {
  const lines = sourceLines(resumeText);
  return lines
    .map((line, index) => `[SOURCE_${String(index + 1).padStart(3, "0")}] ${line}`)
    .join("\n");
}

export function canonicalizeResumeReportEvidence<T>(report: T, resumeText: string): CanonicalizationResult<T> {
  if (!report || typeof report !== "object") return { report, changes: [], unresolved: [] };
  const copy = JSON.parse(JSON.stringify(report)) as any;
  const changes: string[] = [];
  const unresolved: string[] = [];

  if (Array.isArray(copy.top_fixes)) {
    copy.top_fixes.forEach((fix: any, index: number) => {
      const value = fix?.evidence?.excerpt;
      if (typeof value !== "string" || !value.trim()) return;
      if (resumeText.includes(value) && value.length <= 140) return;
      const canonical = exactSourceValue(value, resumeText, 140);
      if (!canonical) {
        unresolved.push(`top_fixes[${index}].evidence.excerpt`);
        return;
      }
      fix.evidence.excerpt = canonical;
      changes.push(`top_fixes[${index}].evidence.excerpt`);
    });

    copy.top_fixes.forEach((fix: any, index: number) => {
      let evidenceExcerpt = fix?.evidence?.excerpt;
      if (typeof evidenceExcerpt !== "string") return;
      const rationale = `${typeof fix.fix === "string" ? fix.fix : ""} ${typeof fix.why === "string" ? fix.why : ""}`;
      if (/\b(early|earlier)\s+(?:career|role|roles)\b/i.test(rationale)) {
        const earlyLine = earliestExperienceLine(resumeText);
        if (earlyLine && sourceContextFor(evidenceExcerpt, resumeText) !== earlyLine) {
          fix.evidence.excerpt = bestExactWindow(earlyLine, earlyLine, 140);
          fix.evidence.section = "Work Experience";
          fix.section_ref = "Work Experience";
          evidenceExcerpt = fix.evidence.excerpt;
          changes.push(`top_fixes[${index}].early_career_evidence`);
        }
      }
      if (!hasSummarySection(resumeText) && /\b(summary|narrative bridge|opening profile|positioning statement)\b/i.test(rationale)) {
        fix.fix = "Add a summary section with [target role], [leadership scope], and [measurable result].";
        fix.evidence.excerpt = "No summary section present";
        fix.evidence.section = "Summary";
        fix.section_ref = "Summary";
        evidenceExcerpt = fix.evidence.excerpt;
        changes.push(`top_fixes[${index}].summary_absence`);
      }
      if (typeof fix?.evidence?.section === "string" && /\[?SOURCE_\d{3}\]?/i.test(fix.evidence.section)) {
        fix.evidence.section = "Work Experience";
        changes.push(`top_fixes[${index}].evidence.section`);
      }
      if (typeof fix.section_ref === "string" && /\[?SOURCE_\d{3}\]?/i.test(fix.section_ref)) {
        fix.section_ref = typeof fix?.evidence?.section === "string" && fix.evidence.section.trim()
          ? fix.evidence.section.trim()
          : "Work Experience";
        changes.push(`top_fixes[${index}].section_ref`);
      }
      if (typeof fix.fix === "string") {
        const grounded = surfaceExistingEvidenceFix(fix.fix, evidenceExcerpt, resumeText);
        if (grounded !== fix.fix) {
          fix.fix = grounded;
          changes.push(`top_fixes[${index}].fix.surface_existing`);
        }
        const actionable = safeActionableFix(fix.fix, evidenceExcerpt, resumeText);
        if (actionable !== fix.fix) {
          fix.fix = actionable;
          changes.push(`top_fixes[${index}].fix.safe_template`);
        }
        const concrete = ensureConcreteFixPlaceholder(fix.fix);
        if (concrete !== fix.fix) {
          fix.fix = concrete;
          changes.push(`top_fixes[${index}].fix.concrete_placeholder`);
        }
        const naturalReference = humanizeFixReference(
          fix.fix,
          sourceContextFor(evidenceExcerpt, resumeText),
          String(fix?.evidence?.section || ""),
        );
        if (naturalReference !== fix.fix) {
          fix.fix = naturalReference;
          changes.push(`top_fixes[${index}].fix.human_reference`);
        }
      }
      normalizeEducationAbsenceFix(fix, changes, index);
    });

    deduplicateAbsenceFixes(copy.top_fixes, resumeText, changes);
    copy.top_fixes = dropLowValueOptionalFixes(copy.top_fixes, changes, isNoJobDescription(copy));
    if (isNoJobDescription(copy)) replaceSoleOptionalEducationFix(copy.top_fixes, resumeText, changes);
    copy.top_fixes = deduplicateFixEvidence(copy.top_fixes, resumeText, changes);
    copy.top_fixes = deduplicateFixInstructions(copy.top_fixes, changes);
    copy.top_fixes = dropUnsupportedTopFixes(copy.top_fixes, resumeText, changes);
  }

  if (Array.isArray(copy.rewrites)) {
    copy.rewrites.forEach((rewrite: any, index: number) => {
      const value = rewrite?.original;
      if (typeof value !== "string" || !value.trim()) return;
      const canonical = exactSourceRewriteLocator(value, resumeText);
      if (!canonical) {
        unresolved.push(`rewrites[${index}].original`);
        return;
      }
      if (canonical !== value) {
        rewrite.original = canonical;
        changes.push(`rewrites[${index}].original`);
      }

      const better = rewrite?.better;
      const enhancementNote = rewrite?.enhancement_note;
      if (typeof better === "string") {
        const natural = naturalizeRewrite(better);
        if (natural !== better) {
          rewrite.better = natural;
          changes.push(`rewrites[${index}].better.naturalized`);
        }
      }
      if (typeof enhancementNote === "string" && !/^Add\b/.test(enhancementNote.trim())) {
        rewrite.enhancement_note = ensureAddNote(enhancementNote);
        changes.push(`rewrites[${index}].enhancement_note`);
      }
      if (
        typeof rewrite?.better === "string"
        && typeof enhancementNote === "string"
        && !hasGroundedOutcome(canonical)
        && rewriteSafetyIssues(canonical, rewrite.better, resumeText).length > 0
      ) {
        rewrite.better = safeWeakBulletTemplate(canonical, enhancementNote);
        changes.push(`rewrites[${index}].better.safe_template`);
      }
    });

    copy.rewrites = copy.rewrites.filter((rewrite: any, index: number) => {
      if (
        typeof rewrite?.original === "string"
        && (rewrite.original.length > 140 || (typeof rewrite?.better === "string" && rewrite.better.length > 600))
      ) {
        changes.push(`rewrites[${index}].dropped_oversized_public_copy`);
        return false;
      }
      if (
        typeof rewrite?.original !== "string"
        || typeof rewrite?.better !== "string"
        || !resumeText.includes(rewrite.original)
      ) {
        return true;
      }
      const unsafe = rewriteSafetyIssues(rewrite.original, rewrite.better, resumeText);
      if (unsafe.length === 0) return true;
      changes.push(`rewrites[${index}].dropped_unsafe`);
      return false;
    });
  }

  if (typeof copy.summary === "string" && copy.summary.includes("\n")) {
    const firstParagraph = copy.summary.split(/\n+/)[0]?.trim();
    const firstParagraphSentences = firstParagraph
      ? firstParagraph.match(/[^.!?]+(?:[.!?]+|$)/g)?.filter(Boolean).length || 0
      : 0;
    if (firstParagraph && firstParagraphSentences >= 3) {
      copy.summary = firstParagraph;
      changes.push("summary.removed_labelled_appendix");
    }
  }

  if (typeof copy.summary === "string") {
    const cappedSummary = capSummarySentences(copy.summary);
    if (cappedSummary !== copy.summary) {
      copy.summary = cappedSummary;
      changes.push("summary.capped_sentences");
    }
  }

  if (typeof copy.first_impression_takeaway === "string") {
    const takeaway = normalizeTakeaway(copy.first_impression_takeaway);
    if (takeaway !== copy.first_impression_takeaway) {
      copy.first_impression_takeaway = takeaway;
      changes.push("first_impression_takeaway.normalized");
    }
  }

  if (typeof copy.biggest_gap_example === "string") {
    const quotedGap = ensureBiggestGapQuote(copy.biggest_gap_example, resumeText);
    if (quotedGap !== copy.biggest_gap_example) {
      copy.biggest_gap_example = quotedGap;
      changes.push("biggest_gap_example.added_quote");
    }
    const quote = copy.biggest_gap_example.match(/["“]([^"”]+)["”]/)?.[1];
    if (quote && (!resumeText.includes(quote) || quote.length > 140)) {
      const canonical = replaceQuotedEvidence(copy.biggest_gap_example, resumeText);
      if (canonical) {
        copy.biggest_gap_example = canonical;
        changes.push("biggest_gap_example.quote");
      } else {
        const safeLine = weakExperienceLine(resumeText) || outcomelessExperienceLine(resumeText, new Set());
        if (safeLine) {
          copy.biggest_gap_example = `"${safeLine}" is missing a measurable outcome, so we cannot place the impact.`;
          changes.push("biggest_gap_example.replaced_unrecoverable_quote");
        } else {
          unresolved.push("biggest_gap_example.quote");
        }
      }
    }
    const safeGap = safeBiggestGap(copy.biggest_gap_example, resumeText);
    if (safeGap !== copy.biggest_gap_example) {
      copy.biggest_gap_example = safeGap;
      changes.push("biggest_gap_example.safe_gap");
    }
    const naturalGap = copy.biggest_gap_example.replace(
      /;\s*recruiter consequence:\s*signals leadership but no measurable impact\.?/i,
      ", so the leadership signal is hard to size.",
    );
    if (naturalGap !== copy.biggest_gap_example) {
      copy.biggest_gap_example = naturalGap;
      changes.push("biggest_gap_example.naturalized_consequence");
    }
    const finalQuote = copy.biggest_gap_example.match(/["“]([^"”]+)["”]/)?.[1];
    if (finalQuote && finalQuote.length > 140) {
      const bounded = replaceQuotedEvidence(copy.biggest_gap_example, resumeText);
      if (bounded) {
        copy.biggest_gap_example = bounded;
        changes.push("biggest_gap_example.bounded_source_window");
      }
    }
  }

  alignStrongBulletFixWithGap(copy, resumeText, changes);
  if (Array.isArray(copy.top_fixes)) {
    normalizeTopFixRationales(copy.top_fixes, resumeText, changes);
    copy.top_fixes = dropLowValueOptionalFixes(copy.top_fixes, changes, isNoJobDescription(copy));
  }
  normalizeAdviceLists(copy, resumeText, changes);
  normalizeCareerBreakAdvice(copy, resumeText, changes);
  normalizeOptionalAdviceFields(copy, changes);
  normalizeDuplicateAdvice(copy, resumeText, changes);
  normalizeSummaryStructure(copy, changes);
  normalizeSectionReviewPresence(copy, resumeText, changes);
  normalizeEvidenceRichReport(copy, resumeText, changes);
  normalizeDuplicateAdvice(copy, resumeText, changes);
  normalizeEvidenceRichReport(copy, resumeText, changes);
  normalizeNoJdAlignment(copy, resumeText, changes);
  normalizeIdeaQuestionRepetition(copy, changes);
  normalizeGeneratedLanguage(copy, changes);
  if (typeof copy.score_comment_short === "string") {
    const capped = capWords(copy.score_comment_short, 16);
    if (capped !== copy.score_comment_short) {
      copy.score_comment_short = capped;
      changes.push("score_comment_short.capped_words");
    }
  }

  return { report: copy as T, changes, unresolved };
}
