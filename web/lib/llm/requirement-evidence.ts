import { canonicalizeUserSourceText } from "../security/inputSanitization";
import { normalizeNarrativeToken } from "./narrative-token-policy";
import { evidenceContainsExactEntity, isPositiveEvidenceClause, narrativeEvidenceClauses } from "./source-evidence-segmentation";

// Requirement labels are summaries, not quotations. Normalize only ordinary
// grammatical forms here; factual assertions and source-bound rewrites do not
// use this matcher.
const requirementForms: Record<string, string> = {
  collaborated: "collaborate", collaborating: "collaborate", collaboration: "collaborate",
  communicated: "communicate", communicating: "communicate", communication: "communicate",
  documented: "document", documenting: "document", documentation: "document",
  coordinated: "coordinate", coordinating: "coordinate", coordination: "coordinate",
  prepared: "prepare", preparing: "prepare", preparation: "prepare",
  reported: "report", reporting: "report",
  scheduled: "schedule", scheduling: "schedule",
  processes: "process",
  operational: "operation",
};
const connectors = new Set(["a", "an", "at", "in", "of", "the", "with"]);
const factualAction = /\b(?:lead|led|leadership|manage|managed|management|own|owned|ownership|direct|directed|built|created|launched|increased|reduced|grew|growth|revenue)\b/iu;
const nominalActions = new Set(["collaborate", "communicate", "document", "coordinate", "prepare", "report", "schedule"]);
const scopeModifiers = new Set(["product", "business", "technical"]);

function requirementTokens(value: string) {
  const normalized = canonicalizeUserSourceText(value)
    .replace(/[’‘]/gu, "'").replace(/♯/gu, "#")
    .replace(/\bworked\s+with\b/giu, "collaborate with")
    .replace(/\bpresent(?:ed|ing)\b/giu, "communicate");
  return (normalized.match(/(?:\.[\p{L}\p{M}\d]+|[\p{L}\p{M}\d][\p{L}\p{M}\d']*[+#]*)(?:[.&/](?:[\p{L}\p{M}\d][\p{L}\p{M}\d']*[+#]*))*/gu) || [])
    .map((token) => Object.hasOwn(requirementForms, token.toLocaleLowerCase())
      ? requirementForms[token.toLocaleLowerCase()] : normalizeNarrativeToken(token))
    .filter((token) => !connectors.has(token));
}

function containsGrammaticalUnit(required: string[], available: string[]) {
  const variants = [required];
  if (required.length === 2 && required[1] === "report") variants.push([required[0], "for", "report"]);
  if (required.length > 1 && nominalActions.has(required.at(-1)!)) {
    variants.push([required.at(-1)!, ...required.slice(0, -1)]);
  }
  if (required.length > 1 && nominalActions.has(required[0])) {
    variants.push([...required.slice(1), required[0]]);
  }
  return variants.some((variant) => available.some((_, start) => {
    let cursor = start;
    return variant.every((token, index) => {
      // A generic label may describe a specifically scoped noun, e.g.
      // documenting product requirements -> requirements documentation.
      if (index > 0 && ["requirement", "priority", "report"].includes(token)
        && scopeModifiers.has(available[cursor]) && !variant.includes(available[cursor])) cursor++;
      return available[cursor++] === token;
    });
  }));
}

function contextualJobRequirement(required: string[], sourceText: string, clause: string) {
  // A JD can name its role once, then refer to that role's priorities. This
  // domain inference is never available to resume evidence or personal goals.
  if (required.join(" ") !== "product priority"
    || !canonicalizeUserSourceText(sourceText).split(/\r?\n/u).slice(0, 3).some((line) => /^Product Manager\s*$/iu.test(line.trim()))
    || !/\b(?:role|position|job)\b[^.!?;]*\b(?:asks?\s+for|requires?|involves?)\b/iu.test(clause)
    || /\b(?:personal|private|household|family)\b/iu.test(clause)) return false;
  return containsGrammaticalUnit(["communicate", "priority"], requirementTokens(clause));
}

export function evidenceContainsRequirement(value: string, sourceText: string, options: { jobDescription?: boolean } = {}) {
  if (evidenceContainsExactEntity(value, sourceText, true)) return true;
  // Never infer quantities, ownership, or outcomes from a bag of related words.
  if (/[\d$€£¥₹%]/u.test(value) || factualAction.test(value)) return false;
  const required = requirementTokens(value);
  if (required.length === 0) return false;
  return narrativeEvidenceClauses(sourceText).some((clause) => {
    if (!isPositiveEvidenceClause(clause)) return false;
    return containsGrammaticalUnit(required, requirementTokens(clause))
      || (options.jobDescription === true && contextualJobRequirement(required, sourceText, clause));
  });
}
