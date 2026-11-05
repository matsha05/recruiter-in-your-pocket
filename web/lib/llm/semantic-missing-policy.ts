import { baseNarrativeStopWords, normalizeNarrativeToken, sourceClauseIsNegated } from "./narrative-token-policy";
import { narrativeEvidenceClauses } from "./source-evidence-segmentation";
import { canonicalizeUserSourceText } from "../security/inputSanitization";
import { hasNamedSection, hasSkillsSection, hasWorkExperience } from "./source-sections";

export type SemanticMissingDisposition =
  | "not_semantic_missing_path"
  | "contradicts_positive_source"
  | "supported_absence"
  | "defer";

const semanticMissingPathPattern = /^(?:gaps\[\d+\]|section_review\..+\.missing|job_alignment\.missing\[\d+\])$/u;
const jobMissingPathPattern = /^job_alignment\.missing\[\d+\]$/u;
const sectionMissingPathPattern = /^section_review\.(.+)\.missing$/u;

const semanticMissingWords = new Set([
  ...baseNarrativeStopWords,
  "absent", "absence", "add", "appear", "appears", "blurry", "clear", "clearly", "context",
  "detail", "evidence", "explicit", "explicitly", "gap", "lacks", "lack", "lacking", "missing",
  "need", "needed", "needs", "not", "page", "present", "presence", "proof", "readable", "resume",
  "section", "show", "shown", "shows", "unclear", "vague", "visible", "weak", "weakness",
].flatMap((word) => [word, normalizeNarrativeToken(word)]));

const sectionHeadings: Record<string, readonly string[]> = {
  summary: ["summary", "professional summary", "profile", "professional profile"],
  skills: ["skills", "technical skills", "core skills", "core competencies"],
  education: ["education", "academic background", "academic experience"],
  "work experience": ["experience", "work experience", "professional experience", "employment history", "work history"],
};

function normalizeHeading(value: string) {
  return canonicalizeUserSourceText(value)
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}%\s]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function sourceHasSectionHeading(sourceText: string, section: string) {
  // Skills can sit under Additional Information and work history under dated role lines; the canonicalizer's
  // detectors read those shapes, so the audit uses the same ones.
  if (section === "skills") return hasSkillsSection(sourceText);
  if (section === "work experience") return hasWorkExperience(sourceText);
  const names = sectionHeadings[section];
  if (!names) return false;
  if (section === "education") return hasNamedSection(canonicalizeUserSourceText(sourceText), [...names]);
  return canonicalizeUserSourceText(sourceText).split(/\r?\n/u).some((line) => {
    const normalized = normalizeHeading(line);
    return names.some((name) => normalized === name || normalized.startsWith(`${name} `));
  });
}

/**
 * A section review that says the section is absent, in the exact sentinel or the generic "Section not
 * present.", is judged by the section detector, not by whether its words appear in a bullet (a welder's
 * "pipe sections" is not a Skills section). The canonicalizer rewrites the generic form to the sentinel.
 */
function exactSectionAbsence(path: string, value: string, resumeText: string): SemanticMissingDisposition | null {
  const sectionPath = path.match(sectionMissingPathPattern)?.[1];
  if (!sectionPath) return null;
  const section = normalizeHeading(sectionPath);
  if (!sectionHeadings[section]) return null;
  const normalizedValue = normalizeHeading(value);
  const expectedSection = normalizedValue.match(/^no (summary|skills|education) section present$/u)?.[1];
  if (expectedSection && section !== expectedSection) return null;
  if (!expectedSection && normalizedValue !== "section not present") return null;
  return sourceHasSectionHeading(resumeText, section)
    ? "contradicts_positive_source"
    : "supported_absence";
}

function subjectTokens(value: string) {
  const source = canonicalizeUserSourceText(value).replace(/\[[^\]]+\]/gu, " ");
  return new Set((source.match(/[\p{L}\p{M}][\p{L}\p{M}\d'’-]*/gu) || [])
    .map(normalizeNarrativeToken)
    .filter((token) => token.length > 2 && !semanticMissingWords.has(token)));
}

function hasPositiveAnchor(subject: ReadonlySet<string>, sourceText?: string) {
  if (!sourceText?.trim() || subject.size === 0) return false;
  return narrativeEvidenceClauses(sourceText).some((clause) => {
    if (sourceClauseIsNegated(clause)) return false;
    const clauseTokens = subjectTokens(clause);
    return Array.from(subject).every((token) => clauseTokens.has(token));
  });
}

export function semanticMissingDisposition(input: {
  path: string;
  value: string;
  resumeText: string;
  jobDescription?: string;
}): SemanticMissingDisposition {
  if (!semanticMissingPathPattern.test(input.path)) return "not_semantic_missing_path";

  const sectionAbsence = exactSectionAbsence(input.path, input.value, input.resumeText);
  if (sectionAbsence) return sectionAbsence;

  const subject = subjectTokens(input.value);
  if (hasPositiveAnchor(subject, input.resumeText)) return "contradicts_positive_source";
  if (jobMissingPathPattern.test(input.path) && hasPositiveAnchor(subject, input.jobDescription)) {
    return "supported_absence";
  }
  return "defer";
}
