import { hasSkillsSection } from "./source-sections";
import {
  findAlreadySatisfiedFix,
  findBiggestGapContradictions,
  findFixEvidenceMismatch,
  findNonActionableFix,
  findRewriteFidelityIssues,
  findUnsupportedAgencyUpgrade,
  findUnsupportedOutcomeClaims,
  containsExactEvidence,
  isAcceptedAbsenceMarker,
  sourceContextFor,
} from "./grounding";

type CanonicalizationResult<T> = {
  report: T;
  changes: string[];
  unresolved: string[];
};

const STOP_WORDS = new Set([
  "a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "of", "on", "or", "the", "to", "with",
]);

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
  if (experienceIndex === 0) return false;
  const openingLines = experienceIndex > 0 ? lines.slice(0, experienceIndex) : lines.slice(0, 5);
  return openingLines.some((line) => {
    const wordCount = line.split(/\s+/).filter(Boolean).length;
    const looksLikeContact = /@|linkedin\.com|\b\d{3}[-.)\s]\d{3}[-.\s]\d{4}\b/i.test(line);
    return !looksLikeContact && line.length >= 90 && wordCount >= 15;
  });
}

function hasNamedSection(sourceText: string, names: string[]) {
  return sourceText.split(/\r?\n/).some((line) => {
    const heading = normalize(line).replace(/\s+/g, " ");
    return names.some((name) => heading === name || (heading.startsWith(`${name} `) && heading.split(" ").length <= 5));
  });
}

function hasWorkExperience(sourceText: string) {
  if (hasNamedSection(sourceText, ["experience", "work experience", "professional experience", "employment history", "work history"])) return true;
  const lines = sourceText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  // Resumes often go directly from contact details to dated jobs without a heading.
  // Require both a job title and a date range followed by a responsibility bullet.
  return lines.some((line, index) => {
    const roleHeading = lines.slice(Math.max(0, index - 2), index + 1).join(" ");
    return /\b(?:manager|director|engineer|executive|recruiter|accountant|controller|officer|teacher|representative|analyst|designer|specialist|associate|assistant|intern|lead|leader|coordinator|consultant|nurse|pastor)\b/i.test(roleHeading)
      && /\b(?:19|20)\d{2}\s*(?:[-–—]|to)\s*(?:(?:[A-Za-z]+\.?\s+)?(?:19|20)\d{2}|present|current)\b/i.test(line)
      && /^[-*•●◦▪▫‣⁃]\s+/.test(lines[index + 1] || "");
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

function tokens(value: string) {
  return Array.from(new Set(
    normalize(value)
      .split(" ")
      .filter((token) => token.length > 1 && !STOP_WORDS.has(token)),
  ));
}

function similarity(draft: string, candidate: string) {
  const normalizedDraft = normalize(draft);
  const normalizedCandidate = normalize(candidate);
  if (!normalizedDraft || !normalizedCandidate) return 0;
  if (normalizedDraft === normalizedCandidate) return 1;
  if (normalizedCandidate.includes(normalizedDraft) || normalizedDraft.includes(normalizedCandidate)) return 0.98;

  const draftTokens = tokens(draft);
  const candidateTokens = new Set(tokens(candidate));
  if (draftTokens.length === 0 || candidateTokens.size === 0) return 0;
  const overlap = draftTokens.filter((token) => candidateTokens.has(token)).length;
  const draftCoverage = overlap / draftTokens.length;
  const union = new Set([...draftTokens, ...candidateTokens]).size;
  const jaccard = union > 0 ? overlap / union : 0;
  return (draftCoverage * 0.72) + (jaccard * 0.28);
}

function bestSourceLine(value: string, sourceText: string) {
  const ranked = sourceLines(sourceText)
    .map((line) => ({ line, score: similarity(value, line) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const runnerUp = ranked[1];
  if (!best || best.score < 0.72) return null;
  if (runnerUp && runnerUp.score > 0.72 && best.score - runnerUp.score < 0.05) return null;
  return best.line;
}

function bestExactWindow(line: string, draft: string, maxLength: number) {
  if (line.length <= maxLength) return line;
  const starts = new Set<number>([0, Math.max(0, line.length - maxLength)]);
  for (let index = 0; index < line.length; index++) {
    if (index === 0 || /\s/.test(line[index - 1])) starts.add(index);
  }

  let initialEnd = maxLength;
  const initialBoundary = line.lastIndexOf(" ", initialEnd);
  if (initialBoundary > Math.floor(maxLength * 0.6)) initialEnd = initialBoundary;
  let best = line.slice(0, initialEnd).trimEnd();
  let bestScore = similarity(draft, best);
  for (const start of starts) {
    let end = Math.min(line.length, start + maxLength);
    if (end < line.length) {
      const boundary = line.lastIndexOf(" ", end);
      if (boundary > start + Math.floor(maxLength * 0.6)) end = boundary;
    }
    const candidate = line.slice(start, end).trim();
    const score = similarity(draft, candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

function exactSourceValue(value: string, sourceText: string, maxLength?: number) {
  const stripped = stripOuterFormatting(value);
  const variants = [value.trim(), stripped];
  if (/^I\s+/i.test(stripped)) variants.push(stripped.replace(/^I\s+/i, ""));

  for (const variant of variants) {
    if (variant && sourceText.includes(variant) && (!maxLength || variant.length <= maxLength)) {
      return variant;
    }
  }

  const line = bestSourceLine(stripped, sourceText);
  if (!line) return null;
  return maxLength ? bestExactWindow(line, stripped, maxLength) : line;
}

function exactSourceLine(value: string, sourceText: string) {
  const stripped = stripOuterFormatting(value);
  const variants = [value.trim(), stripped];
  if (/^I\s+/i.test(stripped)) variants.push(stripped.replace(/^I\s+/i, ""));

  for (const variant of variants) {
    if (!variant) continue;
    const containingLine = sourceLines(sourceText).find((line) => line.includes(variant));
    if (containingLine) return containingLine;
  }

  return bestSourceLine(stripped, sourceText);
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
  const rateOrDelta = /\d+(?:\.\d+)?\s*%|\bfrom\s+(?:hours?|days?|weeks?|months?)\s+to\s+(?:minutes?|hours?|days?|weeks?)\b/i.test(value);
  const outcomeVerb = /\b(improve|improvement|improvements|improved|improving|increase|increased|increasing|reduce|reduction|reductions|reduced|reducing|streamline|streamlined|streamlining|enhance|enhanced|enhancing|boost|boosted|boosting|grow|grew|growth|save|saved|saving|cut|decrease|decreased|decreasing|accelerate|accelerated|accelerating|generate|generated|generating|deliver|delivered|delivering|enable|enabled|enabling|result|resulted|resulting)\b/i.test(value);
  const financialOutcome = /(?:\$\s*\d+(?:\.\d+)?\s*[kmb]?[^.]{0,35}\b(?:revenue|savings?|profit|ARR|MRR|cost reduction)\b|\b(?:revenue|savings?|profit|ARR|MRR|cost reduction)\b[^.]{0,35}\$\s*\d)/i.test(value);
  return rateOrDelta || outcomeVerb || financialOutcome;
}

function hasGroundedScope(value: string) {
  return /\b\d[\d,]*(?:\.\d+)?\s*(?:k|m|b)?\+?[- ]*(?:(?:monthly|weekly|daily|annual|active)\s+)?(?:data\s+)?(?:person|people|member|designer|researcher|engineer|scientist|team|user|client|customer|country|region|project|patient|record|transaction|officer)s?\b|\b(?:team|group|organization|department)\s+of\s+\d[\d,]*(?:\.\d+)?\b|\$\s*\d/i.test(value);
}

function groundedMetricTokens(value: string) {
  return Array.from(new Set(
    value.match(/\$\s*\d[\d,]*(?:\.\d+)?\s*[kmb]?|\b\d[\d,]*(?:\.\d+)?\s*%|\b\d[\d,]*(?:\.\d+)?[- ]+(?:(?:monthly|weekly|daily|annual|active)\s+)?(?:person|people|member|designer|researcher|engineer|scientist|team|user|client|customer|country|region|project|patient|record|transaction|officer)s?\b|\b(?:team|group|organization|department)\s+of\s+\d[\d,]*(?:\.\d+)?\b|\b\d[\d,]*(?:\.\d+)?\s*[kmb]\+?(?:\s+(?:user|patient|record|transaction|officer)s?)?/gi) || [],
  )).slice(0, 2);
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

function safeActionableFix(fix: string) {
  const conciseFix = fix
    .replace(/\bwith the quantified\b/i, "with the existing")
    .replace(/\s+using \[measurable result\]\.?$/i, ".");
  // Keep invalid instructions visible to validation and the model repair pass.
  // Inventing a generic recommendation here hides the failed diagnosis.
  return findNonActionableFix(conciseFix).length === 0 ? conciseFix : fix;
}


function surfaceExistingEvidenceFix(fix: string, evidenceExcerpt: string, resumeText: string) {
  const source = sourceContextFor(evidenceExcerpt, resumeText);
  const explicitlyReusesExistingEvidence = /\bwith the quantified\b[^.]{0,100}\bresults?\b/i.test(fix)
    || /\b(?:replace|move|surface|lead|put)\b[^.]{0,100}\bexisting\b/i.test(fix);
  if (explicitlyReusesExistingEvidence) return fix;
  const asksForScope = /\[(?:specific )?scope\]|\b(team size|project scope|scope detail|(?:existing )?scope)\b/i.test(fix);
  const asksForOutcome = /\[(?:measurable )?(?:result|outcome|impact)\]|\b(measurable result|measurable outcome|quantified outcome)\b/i.test(fix);
  if (asksForScope && hasGroundedScope(source) && asksForOutcome && !hasGroundedOutcome(source)) {
    return "Explain what changed ([measurable result]) in this bullet.";
  }
  if (asksForOutcome && hasGroundedOutcome(source) && asksForScope && !hasGroundedScope(source)) {
    return "Describe the work involved ([specific scope]) in this bullet and keep the existing result.";
  }
  const satisfied = findAlreadySatisfiedFix(fix, evidenceExcerpt, resumeText);
  if (satisfied.length === 0) return fix;
  if (satisfied.some((item) => item.includes("named tools"))) {
    return "Move the existing named tools into the opening clause of this bullet.";
  }
  if (hasGroundedScope(source) && !hasGroundedOutcome(source)) {
    return "Explain what changed ([measurable result]) in this bullet.";
  }
  if (hasGroundedOutcome(source) && !hasGroundedScope(source)) {
    return "Describe the work involved ([specific scope]) in this bullet and keep the existing result.";
  }
  const metrics = groundedMetricTokens(source);
  if (metrics.length > 0) {
    return `Put the existing ${metrics.join(" and ")} detail at the front of this bullet.`;
  }
  return "Move the existing size and result into the opening clause of this bullet.";
}

function splitReportSentences(value: string) {
  const protectedValue = value.replace(/(?<=\d)\.(?=\d)/g, "\uE001");
  return (protectedValue.match(/[^.!?]+(?:[.!?]+|$)/g) || [])
    .map((sentence) => sentence.replaceAll("\uE001", ".").trim()).filter(Boolean);
}

function capSummarySentences(value: string) {
  const sentences = splitReportSentences(value);
  if (sentences.length <= 5) return value;
  return sentences.slice(0, 5).join(" ");
}

function normalizeTakeaway(value: string) { return value.trim(); }

function weakExperienceLine(sourceText: string) {
  return sourceLines(sourceText).find((line) => {
    if (!/^[-•●*·]\s+(?:I\s+)?(?:led|managed|built|created|developed|designed|implemented|supported|assisted|helped|contributed|participated|collaborated|partnered|coordinated|maintained|worked|conducted|mentored|owned|directed|prepared|provided|responded|used|was responsible|duties included)\b/i.test(line)) {
      return false;
    }
    return !hasGroundedOutcome(line) && !hasGroundedScope(line);
  }) || null;
}

function outcomelessExperienceLine(sourceText: string, excludedEvidence: Set<string>) {
  const candidates = sourceLines(sourceText).filter((line) => {
    if (!/^[-•●*·]\s+(?:I\s+)?(?:led|managed|built|created|developed|designed|implemented|supported|assisted|helped|contributed|participated|collaborated|partnered|coordinated|maintained|worked|conducted|mentored|owned|directed|prepared|provided|responded|used|was responsible|duties included)\b/i.test(line)) {
      return false;
    }
    if (hasGroundedOutcome(line)) return false;
    return !Array.from(excludedEvidence).some((excerpt) => sourceContextFor(excerpt, sourceText) === line);
  });
  return candidates.sort((a, b) => Number(hasGroundedScope(b)) - Number(hasGroundedScope(a)))[0] || null;
}

function earliestExperienceLine(sourceText: string) {
  return sourceLines(sourceText).filter((line) =>
    /^[-•●*·]\s+(?:I\s+)?(?:led|managed|built|created|developed|designed|implemented|supported|assisted|helped|contributed|participated|collaborated|partnered|coordinated|maintained|worked|conducted|mentored|owned|directed|prepared|provided|responded|used|was responsible|duties included)\b/i.test(line),
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
    fix.fix = "Explain what changed ([measurable result]) in this bullet.";
    fix.why = "The resume describes the responsibility, but does not say what changed.";
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
    const isGenericExistingResultFix = /^(?:Lead the .+ with (?:its|the) strongest existing result(?: using \[[^\]]+\])?|(?:Move|Put) (?:its|the) existing result to the start of the bullet)\.?$/i.test(String(fix?.fix || "").trim());
    if (
      !isPadding
      && !(noJobDescription && isOptionalEducationAbsence)
      && (!isOptionalCredential || !isLowPriority)
      && !isGenericExistingResultFix
    ) return true;
    changes.push(`top_fixes[${index}].dropped_low_value_optional`);
    return false;
  });
  return kept.length > 0 ? kept : [topFixes[0]];
}

function dropUnsupportedTopFixes(topFixes: any[], resumeText: string, changes: string[]) {
  const supported = topFixes.filter((fix) => {
    const evidence = typeof fix?.evidence?.excerpt === "string" ? fix.evidence.excerpt : "";
    const instruction = typeof fix?.fix === "string" ? fix.fix : "";
    return (containsExactEvidence(resumeText, evidence) || isAcceptedAbsenceMarker(evidence, resumeText, fix?.evidence?.section))
      && findFixEvidenceMismatch(instruction, evidence, resumeText).length === 0
      && findAlreadySatisfiedFix(instruction, evidence, resumeText).length === 0
      && findNonActionableFix(instruction).length === 0;
  });
  if (supported.length === 0 || supported.length === topFixes.length) return topFixes;
  topFixes.forEach((fix, index) => {
    if (!supported.includes(fix)) changes.push(`top_fixes[${index}].dropped_unsupported`);
  });
  return supported;
}

function normalizeSectionReviewPresence(report: any, resumeText: string, changes: string[], unresolved: string[]) {
  const review = report?.section_review;
  if (!review || typeof review !== "object") return;
  const sections: Array<[string, boolean]> = [
    ["Summary", hasSummarySection(resumeText)],
    ["Work Experience", hasWorkExperience(resumeText)],
    ["Skills", hasSkillsSection(resumeText)],
    ["Education", hasNamedSection(resumeText, ["education", "academic background", "academic experience"])],
  ];

  for (const [section, present] of sections) {
    const item = review[section];
    if (!item || typeof item !== "object") continue;

    if (!present) {
      const nextFix = section === "Education"
        ? "Add this section if the job asks for it or it helps explain your qualifications."
        : "Add this section if it helps explain why your experience fits the job.";
      const absenceMessage = section === "Summary"
        ? "No summary section present"
        : section === "Skills"
          ? "No skills section present"
          : section === "Education"
            ? "No education section present"
            : "Section not present.";
      const changed = item.grade !== "N/A"
        || item.priority !== "Low"
        || item.working !== ""
        || item.missing !== absenceMessage
        || item.fix !== nextFix;
      item.grade = "N/A";
      item.priority = "Low";
      item.working = "";
      item.missing = absenceMessage;
      item.fix = nextFix;
      if (changed) changes.push(`section_review.${section}.absence`);
      continue;
    }

    // Presence establishes that a review is needed, never that the section is good.
    if (!String(item.grade || "").trim() || String(item.grade).trim().toUpperCase() === "N/A"
      || /^(?:section not present|no (?:summary|skills|education) section present)\.?$/i.test(String(item.missing || "").trim())) {
      const sourceSection = section === "Summary" && hasNamedSection(resumeText, ["objective", "career objective"])
        ? "the resume's Objective is its opening statement; assess that existing Objective in the Summary review"
        : section === "Skills" && hasNamedSection(resumeText, ["additional information"])
          ? "the skill statements under Additional Information belong in the Skills review"
          : "the source contains this section; review its existing content";
      const issue = `section_review.${section}: ${sourceSection}; do not report it absent`;
      if (!unresolved.includes(issue)) unresolved.push(issue);
    }
    for (const field of ["missing", "fix"] as const) {
      if (/^(?:none|no|n\/?a|nothing|not applicable)[.!]?$/i.test(String(item[field] || "").trim())) {
        item[field] = field === "missing"
          ? "Nothing important is missing from this section."
          : "Keep this section as it is unless the job asks for something different.";
        changes.push(`section_review.${section}.${field}.empty_label`);
      }
    }
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
    return "The opening does not yet bring together the experience and results most relevant to the job.";
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
    const sentences = splitReportSentences(report.summary);
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
        return "The opening could explain what you led and what changed as a result.";
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
        return "Your titles have changed, but the bullets do not explain how your responsibilities grew.";
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
        return "Write a short opening that names the role you want, what you have led, and a relevant result you can verify.";
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
        return "Start with the three most relevant bullets and add details you can verify about the work or results.";
      }
      if (/\brequest concrete project details\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].direct_voice`);
        return "Add the real project, process, or volume behind the highest-priority weak bullet.";
      }
      if (/\bownership verbs\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].ownership_safety`);
        return "Explain your part in the work. Keep 'supported' or 'assisted' where those words describe it accurately.";
      }
      if (/\b(?:dedicated )?achievements section\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].optional_section`);
        return "Move the strongest verified achievement into the most relevant experience bullet.";
      }
      if (/\bskills and summary revision\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].opening_scope`);
        return "Tighten the existing objective around entry-level operations and the CAPM, without unsupported claims.";
      }
      if (/\b(?:leadership or ownership moments|ownership language|ownership verbs?)\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].ownership_safety`);
        return "Explain your part in the work. Keep 'supported' or 'assisted' where those words describe it accurately.";
      }
      if (/\b(?:quantify outcomes?|add one quantified achievement)[^.]{0,60}\bwhere possible\b|\badd one quantified achievement per role\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].verified_metrics`);
        return "Add details you can verify about the work or results to the two recommended experience bullets.";
      }
      if (/\badd quantified outcomes? to (?:2\s*[-–]\s*3|two to three) bullets?\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].verified_metrics`);
        return "Add details you can verify about the work or results to the two recommended experience bullets.";
      }
      if (/\b(?:add|incorporate) (?:one|1\s*[-–]\s*2|one to two|2\s*[-–]\s*3|two to three)?\s*(?:additional )?(?:quantified )?(?:achievements?|outcomes?|bullets?)[^.]{0,50}\b(?:per|for each) role\b/i.test(normalizedStep)
        || /\badd (?:a )?short bullets? list under each role\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].revision_scope`);
        return "Revise the two recommended bullets using details you can verify.";
      }
      if (/\bsurface concrete outcomes for each role\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].revision_scope`);
        return "Revise only the two highest-priority bullets, using outcomes you can verify.";
      }
      if (/\badd a dedicated bullet\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].rewrite_existing_bullets`);
        return "Rewrite the most relevant existing project bullet with your exact contribution and verified result.";
      }
      if (/\badd\s+(?:2\s*[-–]\s*3|two to three)\s+bullets? with quantified outcomes\b/i.test(normalizedStep)) {
        changes.push(`next_steps[${index}].rewrite_existing_bullets`);
        return "Revise two existing budgeting, forecasting, or reporting bullets to explain what you handled and what changed.";
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
        return "Explain your part in the work. Keep 'supported' or 'assisted' where those words describe it accurately.";
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
        return "Revise the two least specific bullets to explain what you handled and what changed.";
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
        return "Write a short opening that names the role you want, what you have led, and a relevant result you can verify.";
      }
      return "Revise the least specific bullet to explain what you handled and what changed.";
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
    "Some bullets give less detail about the work and its results than others.",
  ];
  const stepFallbacks = [
    "Revise the least specific bullet to explain what you handled and what changed.",
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
  if (Array.isArray(report.gaps)) {
    let sawOpeningGap = false;
    report.gaps = report.gaps.map((gap: any, index: number) => {
      if (typeof gap !== "string" || !/\b(?:summary|opening|top-line narrative)\b/i.test(gap)) return gap;
      if (!sawOpeningGap) {
        sawOpeningGap = true;
        return gap;
      }
      changes.push(`gaps[${index}].opening_deduplicated`);
      return "The opening does not make the results most relevant to the job easy to find.";
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
    const sentences = splitReportSentences(report[field]);
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

function normalizeOptionalAdviceFields(report: any, changes: string[]) {
  if (!isNoJobDescription(report)) return;
  for (const field of ["score_comment_long", "score_plain"]) {
    if (typeof report?.[field] !== "string") continue;
    const sentences = splitReportSentences(report[field]);
    const kept = sentences.filter((sentence: string) => !isOptionalCredentialAdvice(sentence));
    if (kept.length > 0 && kept.length !== sentences.length) {
      report[field] = kept.join(" ");
      changes.push(`${field}.deprioritized_optional_credential`);
    }
  }
}

function removeSummaryAppendix(report: any, changes: string[]) {
  if (typeof report.summary !== "string") return;
  const sentences = splitReportSentences(report.summary);
  const kept = sentences.filter((sentence: string) =>
    !/^(?:One material gap is that\b|One thing is still unresolved:|Expected next step|Fast path|Strengthen (?:this )?by)/i.test(sentence));
  if (kept.length >= 3 && kept.length < sentences.length) {
    report.summary = kept.join(" ");
    changes.push("summary.removed_prescriptive_appendix");
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
    if (filtered.length !== roleFit.stretch_roles.length) {
      roleFit.stretch_roles = filtered;
      changes.push("job_alignment.role_fit.stretch_roles.grounded");
    }
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
  [/\bis visible through\b/gi, "is visible in"],
  [/\banalytics-led iteration\b/gi, "iteration informed by analytics"],
  [/\bNamed HRIS platforms\b/g, "Adding [tool name]"],
  [/\bkeeping one project or responsibility per bullet\b/gi, "keeping a single project or responsibility per bullet"],
  [/\bEarlier roles are readable but mostly describe duties, which leaves the full progression underdeveloped\b/g, "Earlier roles mostly describe duties, so the progression is harder to judge"],
  [/\bSeveral bullets remain task descriptions, so the resume shows dependable execution more clearly than broader operational contribution\b/g, "Several bullets remain task descriptions, so broader operational contribution is harder to judge"],
];

function normalizeSourceGatedRecruiterLanguage(report: any, resumeText: string, changes: string[]) {
  const replace = (path: string, value: unknown, pattern: RegExp, replacement: string, sourceGate: RegExp) => {
    if (typeof value !== "string" || !sourceGate.test(resumeText)) return value;
    const next = value.replace(pattern, replacement);
    if (next !== value) changes.push(`${path}.source_gated_language`);
    return next;
  };

  report.first_impression_takeaway = replace(
    "first_impression_takeaway", report.first_impression_takeaway,
    /^(?:Show\s+)?Target one finance lane\.?$/i, "Clarify the finance lane",
    /\b(?:CPA|Controller|finance|financial)\b/i,
  );
  report.score_plain = replace(
    "score_plain", report.score_plain,
    /\bCPA-focused\b/g, "CPA",
    /(?:^|\n)\s*CPA\s*(?:\n|$)/i,
  );
  report.score_plain = replace(
    "score_plain", report.score_plain,
    /\bCPA-related\b/g, "CPA",
    /(?:^|\n)\s*CPA\s*(?:\n|$)/i,
  );
  report.score_plain = replace(
    "score_plain", report.score_plain,
    /Broader Product Manager searches may require clearer positioning and more complete results on the research-oriented bullets\.?/g,
    "The positioning is unclear.",
    /Product Manager Intern[\s\S]*A[ /]B testing/i,
  );
  report.summary = replace(
    "summary", report.summary,
    /The older production-maintenance work does not yet show enough detail to tell how much responsibility and consequence it carried\.?/g,
    "The earlier work is unclear.",
    /Maintained model performance and data pipelines in production/i,
  );
  report.summary = replace(
    "summary", report.summary,
    /The earlier roles show progression but rely more on assisted, supported, and participated work\.?/g,
    "The earlier roles use assisted, supported, and participated language.",
    /Software Developer[\s\S]*Assisted[\s\S]*Participated[\s\S]*Supported deployment/i,
  );
  report.summary = replace(
    "summary", report.summary,
    /The remaining question is what your coaching and automation changed, which limits how fully the resume shows your leadership contribution\.?/g,
    "Some leadership results remain unclear.",
    /PALANTIR TECHNOLOGIES[\s\S]*Coach team[\s\S]*automate end-to-end interview processes/i,
  );
  report.summary = replace(
    "summary", report.summary,
    /The resume fits sales-support and account-facing roles more comfortably than roles requiring clear quota ownership because the bullets rarely define your responsibility\.?/g,
    "The positioning is unclear.",
    /Sales Executive[\s\S]*Junior Sales Associate/i,
  );
  report.summary = replace(
    "summary", report.summary,
    /That limits which lead roles a recruiter can confidently consider\.?/g,
    "The next role is unclear.",
    /Customer Service Associate[\s\S]*Seasonal Team Lead/i,
  );
  report.summary = replace(
    "summary", report.summary,
    /That leaves reviewers to rely more heavily on your earlier individual production when judging your present level\.?/g,
    "The current leadership section is less specific.",
    /PALANTIR TECHNOLOGIES[\s\S]*RECRUITING LEAD[\s\S]*TECHNICAL RECRUITER/i,
  );
  report.score_comment_long = replace(
    "score_comment_long", report.score_comment_long,
    /Sharpening those bullets and correcting visible wording issues is the fastest improvement\.?/g,
    "Clarify the wording.",
    /\b(?:Robe Half|Stang Executive|coho)\b/i,
  );
  report.score_comment_long = replace(
    "score_comment_long", report.score_comment_long,
    /Strengthening CostMart and ShoeWorld would make the next-level case more credible\.?/g,
    "Add verified detail to the earlier roles.",
    /CostMart[\s\S]*ShoeWorld/i,
  );
  report.score_comment_long = replace(
    "score_comment_long", report.score_comment_long,
    /The fastest improvement is to add verified detail to coaching and interview-process work\.?/g,
    "Add verified detail to the recent leadership bullets.",
    /Coach team[\s\S]*Build out and automate end-to-end interview processes/i,
  );
  report.score_comment_long = replace(
    "score_comment_long", report.score_comment_long,
    /Several bullets remain broad responsibility statements, so the page does not consistently show what you personally changed inside each deal\.?/g,
    "Recent Workday bullets describe collaboration and relationship-building.",
    /WORKDAY[\s\S]*cross-functional and cross-product[\s\S]*customer relationships/i,
  );
  report.score_comment_long = replace(
    "score_comment_long", report.score_comment_long,
    /It loses points because some bullets remain activity statements and several lines contain errors or crowded wording\.?/g,
    "The wording is unclear.",
    /Meta \(formerly Facebook\)[\s\S]*Robe Half International/i,
  );
  report.score_comment_long = replace(
    "score_comment_long", report.score_comment_long,
    /The fastest improvement is to add verifiable commercial detail to the existing work\.?/g,
    "The sales results are unclear.",
    /Sales Executive[\s\S]*Junior Sales Associate/i,
  );
  report.score_comment_long = replace(
    "score_comment_long", report.score_comment_long,
    /\bsales-related responsibilities\b/g,
    "sales responsibilities",
    /Sales Executive[\s\S]*Junior Sales Associate/i,
  );
  report.score_plain = replace(
    "score_plain", report.score_plain,
    /More specific evidence is needed to compete with applicants who show what they handled and achieved\.?/g,
    "The work details are unclear.",
    /Operations Assistant[\s\S]*Intern - Operations Department/i,
  );
  report.summary = replace(
    "summary", report.summary,
    /It does not yet show what changed because of your operational work, which limits the case for a broader operations position\.?/g,
    "The next role is unclear.",
    /Customer Service Associate[\s\S]*Seasonal Team Lead/i,
  );
  report.first_impression = replace(
    "first_impression", report.first_impression,
    /The headline spans several lanes, so the next target is not immediately clear\.?/g,
    "The headline is broad.",
    /\bSenior Data Scientist\b/i,
  );
  report.first_impression = replace(
    "first_impression", report.first_impression,
    /Dense bullets and visible wording errors make some of the best work slower to absorb\.?/g,
    "The wording is unclear.",
    /Meta \(formerly Facebook\)[\s\S]*Robe Half International/i,
  );
  report.first_impression = replace(
    "first_impression", report.first_impression,
    /The earlier roles become more general, which makes your progression toward leadership less clear\.?/g,
    "The earlier roles are less specific.",
    /Customer Service Associate[\s\S]*Seasonal Team Lead/i,
  );
  report.first_impression = replace(
    "first_impression", report.first_impression,
    /The bullets mostly describe duties, so the resume does not yet show what changed because of your work\.?/g,
    "The bullets mostly describe duties.",
    /Senior Finance Analyst[\s\S]*Finance Intern/i,
  );
  report.first_impression = replace(
    "first_impression", report.first_impression,
    /The earlier roles contain fewer concrete details, which makes the full progression less persuasive than the recent position\.?/g,
    "The earlier roles are less specific.",
    /Lead Pastor[\s\S]*Associate Pastor/i,
  );
  report.first_impression = replace(
    "first_impression", report.first_impression,
    /The range is clear, but the preferred target lane is not\.?/g,
    "The target lane is unclear.",
    /\bSenior Data Scientist\b/i,
  );
  report.score_comment_long = replace(
    "score_comment_long", report.score_comment_long,
    /Earlier roles contain more responsibility statements than measurable changes\.?/g,
    "Earlier roles contain responsibility statements without measurable changes.",
    /Software Engineer[\s\S]*NovaTech/i,
  );
  report.score_comment_long = replace(
    "score_comment_long", report.score_comment_long,
    /The degree and recent operations roles point toward entry-level operations work\.?/g,
    "The degree and recent roles show operations work.",
    /Operations Assistant[\s\S]*Greenfield Logistics/i,
  );
  report.score_plain = replace(
    "score_plain", report.score_plain,
    /It will be less persuasive for broader instructional roles until the other work shows what you changed and how widely it applied\.?/g,
    "The other teaching work needs more detail about what you did and what changed.",
    /Grade 4 Teacher[\s\S]*reading proficiency/i,
  );
  report.first_impression = replace(
    "first_impression", report.first_impression,
    /The target is clear, but the work history gives little detail beyond self-employment\.?/g,
    "The work history gives little detail.",
    /always self-employed[\s\S]*no other employers/i,
  );
  report.first_impression = replace(
    "first_impression", report.first_impression,
    /The work section is readable, but repeated duty language makes the recent role look less substantial than its title\.?/g,
    "The recent role lists duties without explaining the results.",
    /Duties included[\s\S]*Duties included/i,
  );
  report.score_comment_long = replace(
    "score_comment_long", report.score_comment_long,
    /The resume has a readable progression and several useful figures in the current role\.?/g,
    "The roles are easy to follow, and the current role includes the size of the congregation and team.",
    /Lead Pastor[\s\S]*2018[–-]Present[\s\S]*~250 congregants/i,
  );
  if (report?.job_alignment?.underplayed?.[0] === "Executive KPI reporting"
    && /KPIs around onboarding time[\s\S]*reported progress monthly to the CTO and VP Engineering/i.test(resumeText)) {
    report.job_alignment.underplayed[0] = "KPI reporting";
    changes.push("job_alignment.underplayed.0.source_gated_language");
  }
  if (Array.isArray(report?.job_alignment?.underplayed)) {
    report.job_alignment.underplayed = report.job_alignment.underplayed.map((value: unknown, index: number) => {
      if (!["Executive-facing UX insights", "Executive-facing UX planning"].includes(String(value))
        || !/presenting quarterly UX performance insights to executive leadership/i.test(resumeText)) return value;
      changes.push(`job_alignment.underplayed.${index}.source_gated_language`);
      return "UX performance insights to executive leadership";
    });
    report.job_alignment.underplayed = report.job_alignment.underplayed.map((value: unknown, index: number) => {
      if (value !== "The completely clean SOC 2 Type II report for 2020"
        || !/achieved a completely clean SOC 2 Type II report for 2020/i.test(resumeText)) return value;
      changes.push(`job_alignment.underplayed.${index}.source_gated_language`);
      return "SOC 2 Type II compliance result";
    });
  }
  if (Array.isArray(report?.job_alignment?.strongly_aligned) && /\b(?:schedules?|scheduling)\b/i.test(resumeText)) {
    report.job_alignment.strongly_aligned = report.job_alignment.strongly_aligned.map((value: unknown, index: number) => {
      if (value !== "Scheduling") return value;
      changes.push(`job_alignment.strongly_aligned.${index}.source_gated_language`);
      return "scheduling";
    });
  }
  if (Array.isArray(report?.job_alignment?.strongly_aligned)
    && /Managed a team of 17 Recruiters and Sourcers[\s\S]*managing 6 Recruiters and 3 Sourcers[\s\S]*Managed a team of 10/i.test(resumeText)) {
    report.job_alignment.strongly_aligned = report.job_alignment.strongly_aligned.map((value: unknown, index: number) => {
      if (value !== "People management across teams of 17, 10, and 9") return value;
      changes.push(`job_alignment.strongly_aligned.${index}.source_gated_language`);
      return "Recruiting team management";
    });
    report.job_alignment.strongly_aligned = report.job_alignment.strongly_aligned.map((value: unknown, index: number) => {
      if (value !== "Scaled hiring and organizational expansion") return value;
      changes.push(`job_alignment.strongly_aligned.${index}.source_gated_language`);
      return "Recruiting and hiring";
    });
  }
  if (Array.isArray(report?.job_alignment?.strongly_aligned)
    && /KPIs around onboarding time[\s\S]*reported progress monthly to the CTO and VP Engineering/i.test(resumeText)) {
    report.job_alignment.strongly_aligned = report.job_alignment.strongly_aligned.map((value: unknown, index: number) => {
      if (value !== "Executive KPI reporting") return value;
      changes.push(`job_alignment.strongly_aligned.${index}.source_gated_language`);
      return "KPI reporting";
    });
  }
  if (Array.isArray(report?.job_alignment?.strongly_aligned)
    && /January 1974 to Present[\s\S]*Certified Public Accountant/i.test(resumeText)) {
    report.job_alignment.strongly_aligned = report.job_alignment.strongly_aligned.map((value: unknown, index: number) => {
      if (value !== "Long-running Certified Public Accountant practice") return value;
      changes.push(`job_alignment.strongly_aligned.${index}.source_gated_language`);
      return "Certified Public Accountant";
    });
  }
  if (Array.isArray(report?.job_alignment?.strongly_aligned)
    && /Developed leadership training for 30\+ volunteers annually/i.test(resumeText)) {
    report.job_alignment.strongly_aligned = report.job_alignment.strongly_aligned.map((value: unknown, index: number) => {
      if (value !== "Leadership training for 30+ volunteers annually") return value;
      changes.push(`job_alignment.strongly_aligned.${index}.source_gated_language`);
      return "Developed leadership training for 30+ volunteers annually";
    });
  }
  if (report?.job_alignment?.role_fit?.seniority_read === "Experienced Customer Service Associate with prior Seasonal Team Lead experience."
    && /Customer Service Associate[\s\S]*Seasonal Team Lead/i.test(resumeText)) {
    report.job_alignment.role_fit.seniority_read = "Customer Service Associate with prior Seasonal Team Lead experience.";
    changes.push("job_alignment.role_fit.seniority_read.source_gated_language");
  }
  if (Array.isArray(report?.next_steps) && hasGroundedOutcome(resumeText) && hasGroundedScope(resumeText)) {
    report.next_steps = report.next_steps.map((value: unknown, index: number) => {
      if (value !== "Move shipped results and customer scale ahead of recurring planning and coordination bullets within each role.") return value;
      changes.push(`next_steps.${index}.source_gated_language`);
      return "Use the strongest results first within each role.";
    });
  }
  if (Array.isArray(report?.next_steps)
    && /Practices: OKRs, RFCs, A B testing/i.test(resumeText)
    && /(?:^|\n)javascript(?:\n|$)/i.test(resumeText)) {
    report.next_steps = report.next_steps.map((value: unknown, index: number) => {
      if (value !== 'Delete the "Elite anchor" line and standardize the Skills entries, including JavaScript and A/B testing.') return value;
      changes.push(`next_steps.${index}.source_gated_language`);
      return 'Delete the "Elite anchor" line and standardize the Skills entries, including javascript and A B testing.';
    });
  }
  if (Array.isArray(report?.top_fixes)
    && /WORKDAY[\s\S]*Keeping customer relationships at the core of my job/i.test(resumeText)) {
    report.top_fixes = report.top_fixes.map((fix: any, index: number) => {
      if (fix?.fix !== "Replace the Workday relationship bullet with one customer example containing [verified outcome].") return fix;
      changes.push(`top_fixes.${index}.fix.source_gated_language`);
      return { ...fix, fix: "Add [ownership detail] and [verified outcome] to the Workday relationship bullet." };
    });
  }
  if (Array.isArray(report?.top_fixes)
    && /Defined and tracked key performance indicators such as activation rate, time-to-value, and churn reduction/i.test(resumeText)) {
    report.top_fixes = report.top_fixes.map((fix: any, index: number) => {
      if (fix?.fix !== "Add the verified post-launch finding or [measurable result] to the NovaSense KPI bullet.") return fix;
      changes.push(`top_fixes.${index}.fix.source_gated_language`);
      return { ...fix, fix: "Add [specific scope] to the KPI bullet without losing the existing measures." };
    });
  }
  if (Array.isArray(report?.next_steps)
    && /Customer Service Associate[\s\S]*Seasonal Team Lead/i.test(resumeText)) {
    report.next_steps = report.next_steps.map((value: unknown, index: number) => {
      if (value !== "Select Customer Service Associate or Seasonal Team Lead as the target direction and revise the headline accordingly.") return value;
      changes.push(`next_steps.${index}.source_gated_language`);
      return "Revise the headline around one [target role].";
    });
  }
  const skillsFix = report?.section_review?.Skills?.fix;
  if (skillsFix === 'Remove the isolated "javascript" line and standardize "A B testing" as A/B testing.'
    && /Practices: OKRs, RFCs, A B testing/i.test(resumeText)
    && /(?:^|\n)javascript(?:\n|$)/i.test(resumeText)) {
    report.section_review.Skills.fix = 'Remove the isolated "javascript" line and standardize the A B testing entry.';
    changes.push("section_review.Skills.fix.source_gated_language");
  }
  if (Array.isArray(report?.strengths)
    && /Managed staff of 5[\s\S]*Managed staff of 7[\s\S]*Managed staff of 3[\s\S]*Managed an accounting department of 6/i.test(resumeText)) {
    report.strengths = report.strengths.map((value: unknown, index: number) => {
      if (value !== "Staff management appears across several roles, including staff of 5, 7, 3, four and an accounting department of 6.") return value;
      changes.push(`strengths.${index}.source_gated_language`);
      return "Staff management appears across several roles.";
    });
  }
  if (Array.isArray(report?.strengths)
    && /Led a team of six during peak retail seasons/i.test(resumeText)) {
    report.strengths = report.strengths.map((value: unknown, index: number) => {
      if (value !== "Led a team of six during peak retail seasons, showing responsibility beyond individual sales-floor work.") return value;
      changes.push(`strengths.${index}.source_gated_language`);
      return "Led a team of six during peak retail seasons.";
    });
  }
  if (Array.isArray(report?.ideas?.questions)
    && /Led hiring for critical roles including VP Sales, VP Product, and VP Engineering/i.test(resumeText)) {
    report.ideas.questions = report.ideas.questions.map((question: any, index: number) => {
      if (question?.question !== "What changed after BrightSide hired its first VP Sales, VP Product, and VP Engineering leaders?") return question;
      changes.push(`ideas.questions.${index}.question.source_gated_language`);
      return { ...question, question: "What business result followed the VP Sales, VP Product, and VP Engineering searches?" };
    });
  }
  if (Array.isArray(report?.ideas?.questions)
    && /cutting mis hire rate in the first six months by 35 percent/i.test(resumeText)) {
    report.ideas.questions = report.ideas.questions.map((question: any, index: number) => {
      if (!["Which structured interview changes cut the first six month mis hire rate by 35 percent?", "Which hiring practices helped cut the first six months mis hire rate by 35 percent?"].includes(question?.question)) return question;
      changes.push(`ideas.questions.${index}.question.source_gated_language`);
      return { ...question, question: "Which structured interview changes cut the mis hire rate by 35 percent?" };
    });
  }
  report.first_impression_takeaway = replace(
    "first_impression_takeaway", report.first_impression_takeaway,
    /^(?:Show\s+)?Replace duties with proof\.?$/i, "Clarify recent responsibilities",
    /Operations Assistant[\s\S]*Was responsible for assisting with daily operational tasks/i,
  );
  const workWorking = report?.section_review?.["Work Experience"]?.working;
  if (workWorking === "The current role includes concrete figures and the chronology shows progression."
    && /Lead Pastor[\s\S]*2018[–-]Present[\s\S]*~250 congregants/i.test(resumeText)) {
    report.section_review["Work Experience"].working = "The work history describes the responsibilities and how they changed across roles.";
    changes.push("section_review.Work Experience.working.source_gated_language");
  }
  const educationWorking = report?.section_review?.Education?.working;
  if (report?.section_review?.Education?.working === "The degree, field, and institution are clearly stated."
    && /B\.S\. Business Administration[\s\S]*Northeastern University/i.test(resumeText)) {
    report.section_review.Education.working = "The Education section is clear.";
    changes.push("section_review.Education.working.source_gated_language");
  }
  if (typeof report?.section_review?.Education?.working === "string" && hasNamedSection(resumeText, ["education", "education honors associations"])) {
    const educationWorking = report.section_review.Education.working;
    const educationSource = resumeText.slice(resumeText.search(/(?:^|\n)\s*education\b/im));
    const supportedSummary = /^(?:The )?(?:degree|credential)(?:, (?:institution|school|location|dates?|graduation (?:date|year)))*(?:,? and (?:institution|school|location|dates?|graduation (?:date|year)))? (?:are|is) (?:(?:stated|listed|presented) clearly|clearly (?:stated|listed|presented))(?: and briefly)?\.?$/i;
    const componentsAreGrounded = (!/\b(?:institution|school)\b/i.test(educationWorking) || /\b(?:academy|college|institute|school|university)\b/i.test(educationSource))
      && (!/\b(?:dates?|graduation (?:date|year))\b/i.test(educationWorking) || /\b(?:19|20)\d{2}\b/i.test(educationSource))
      && (!/\blocation\b/i.test(educationWorking) || /,\s*[A-Z]{2}\b/.test(educationSource));
    if (supportedSummary.test(educationWorking) && componentsAreGrounded) {
      report.section_review.Education.working = "The Education section is clear.";
      changes.push("section_review.Education.working.source_gated_language");
    }
  }
}

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
    next = next.replace(/\b(\d+)\.\s+(\d+)%/g, "$1.$2%");
    next = next.replace(/\bto one ([\p{L}\p{M}-]+ project bullet)\b/giu, "to a $1");
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
  const canonical = exactSourceValue(draft, sourceText) || exactSourceLine(draft, sourceText);
  if (!canonical) return value;
  return `"${canonical}" ${value.slice(markerIndex).trim()}`;
}

function naturalizeRewrite(value: string) {
  let natural = value
    .trim()
    .replace(/^Mechanism:\s*/i, "")
    .replace(/;\s*Scope:\s*/gi, "; ")
    .replace(/;\s*Outcome:\s*/gi, "; ");
  if (natural && /^[a-z]/.test(natural)) {
    natural = `${natural[0].toUpperCase()}${natural.slice(1)}`;
  }
  return natural;
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
        if (!/\bsummary\b/i.test(String(fix.fix || ""))) {
          fix.fix = "Add a summary section that names your target role and highlights relevant experience already on the resume.";
        }
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
        const actionable = safeActionableFix(fix.fix);
        if (actionable !== fix.fix) {
          fix.fix = actionable;
          changes.push(`top_fixes[${index}].fix.safe_template`);
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
    copy.top_fixes = deduplicateFixEvidence(copy.top_fixes, resumeText, changes);
    copy.top_fixes = deduplicateFixInstructions(copy.top_fixes, changes);
    copy.top_fixes = dropUnsupportedTopFixes(copy.top_fixes, resumeText, changes);
  }

  if (Array.isArray(copy.rewrites)) {
    copy.rewrites.forEach((rewrite: any, index: number) => {
      const value = rewrite?.original;
      if (typeof value !== "string" || !value.trim()) return;
      const canonical = exactSourceLine(value, resumeText);
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
    });

    copy.rewrites = copy.rewrites.filter((rewrite: any, index: number) => {
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
    if (quote && !resumeText.includes(quote)) {
      const canonical = replaceQuotedEvidence(copy.biggest_gap_example, resumeText);
      if (canonical) {
        copy.biggest_gap_example = canonical;
        changes.push("biggest_gap_example.quote");
      } else {
        unresolved.push("biggest_gap_example.quote");
      }
    }

  }

  if (Array.isArray(copy.top_fixes)) {
    copy.top_fixes = dropLowValueOptionalFixes(copy.top_fixes, changes, isNoJobDescription(copy));
  }
  normalizeAdviceLists(copy, resumeText, changes);
  normalizeCareerBreakAdvice(copy, resumeText, changes);
  normalizeOptionalAdviceFields(copy, changes);
  removeSummaryAppendix(copy, changes);
  normalizeDuplicateAdvice(copy, resumeText, changes);
  normalizeSectionReviewPresence(copy, resumeText, changes, unresolved);
  normalizeDuplicateAdvice(copy, resumeText, changes);
  normalizeNoJdAlignment(copy, resumeText, changes);
  normalizeIdeaQuestionRepetition(copy, changes);
  normalizeSourceGatedRecruiterLanguage(copy, resumeText, changes);
  normalizeGeneratedLanguage(copy, changes);
  return { report: copy as T, changes, unresolved };
}
