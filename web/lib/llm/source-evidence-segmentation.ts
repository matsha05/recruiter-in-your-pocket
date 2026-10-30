import { canonicalizeUserSourceText } from "../security/inputSanitization";
import { sourceClauseIsNegated } from "./narrative-token-policy";

const contrastMarker = "(?:but|however|yet|although|though|while|whereas)";
const leadingSubordinateContrast = new RegExp(
  `^\\s*(?:although|though|while|whereas)\\b\\s*([^,]+),\\s*(.+)$`,
  "iu",
);
const inlineContrastBoundary = new RegExp(`(?:\\s*,\\s*|\\s+)${contrastMarker}\\b\\s*,?\\s*`, "iu");
const leadingContrastMarker = new RegExp(`^\\s*${contrastMarker}\\b\\s*,?\\s*`, "iu");

function contrastClauses(segment: string): string[] {
  const leadingSubordinate = segment.match(leadingSubordinateContrast);
  if (leadingSubordinate) {
    return [leadingSubordinate[1], ...contrastClauses(leadingSubordinate[2])];
  }
  return segment
    .replace(leadingContrastMarker, "")
    .split(inlineContrastBoundary)
    .map((clause) => clause.trim())
    .filter(Boolean);
}

export function narrativeEvidenceClauses(sourceText: string) {
  return protectIdentityDots(canonicalizeUserSourceText(sourceText))
    .split(/(?:\r?\n)+|[.!?;]+|\s*[•●◦▪▫‣⁃|]\s*/u)
    .map((segment) => segment.replaceAll(protectedIdentityDot, "."))
    .flatMap(contrastClauses)
    .filter(Boolean);
}

const protectedIdentityDot = "\uE000";

function protectIdentityDots(sourceText: string) {
  return sourceText
    .replace(/\b(Sr|Jr)\.(?=\s*[\p{L}\p{M}])/giu, "$1 ")
    .replace(/(^|[^\p{L}\p{M}\d])\.(?=[\p{L}\p{M}\d]+)/gu, `$1${protectedIdentityDot}`)
    .replace(/\b([\p{L}\p{M}\d]+)\.(?=(?:js|ts)\b)/giu, `$1${protectedIdentityDot}`)
    .replace(/(?<=\d)\.(?=\d)/gu, protectedIdentityDot);
}

export function roleEvidenceSegments(sourceText: string) {
  return protectIdentityDots(canonicalizeUserSourceText(sourceText))
    .split(/(?:\r?\n)+|[.!?;]+|\s*[•●◦▪▫‣⁃|]\s*/u)
    .map((segment) => segment.replaceAll(protectedIdentityDot, ".").trim())
    .filter(Boolean);
}

const identityPattern = /(?:\.[\p{L}\p{M}\d]+|[\p{L}\p{M}\d][\p{L}\p{M}\d']*[+#]*)(?:[.&/](?:[\p{L}\p{M}\d][\p{L}\p{M}\d']*[+#]*))*/gu;

function identityTokens(value: string) {
  const normalized = canonicalizeUserSourceText(value).replace(/[’‘]/gu, "'").replace(/♯/gu, "#");
  return (normalized.match(identityPattern) || []).map((token) => token.toLocaleLowerCase());
}

export function isPositiveEvidenceClause(value: string) {
  return !sourceClauseIsNegated(value)
    && !/\b(?:lacks?|lacked|lacking|unable|cannot|can['’]t|absent|excludes?|excluded|excluding|avoids?|avoided|avoiding)\b/iu.test(value);
}

// Narrative sentence splitting can divide a dotted company name, and lexical
// normalization discards the casing used to recognize a CamelCase name. Check
// a complete, contiguous source identity before those lossy comparisons.
export function evidenceContainsExactEntity(value: string, sourceText: string, requirePositiveEvidence = false) {
  const claim = identityTokens(value);
  if (claim.length === 0) return false;
  const protectedSource = canonicalizeUserSourceText(sourceText).replace(identityPattern, (token) =>
    claim.includes(identityTokens(token)[0]) ? token.replaceAll(".", protectedIdentityDot) : token
  );
  return narrativeEvidenceClauses(protectedSource).some((clause) => {
    if (requirePositiveEvidence && !isPositiveEvidenceClause(clause)) return false;
    const candidate = identityTokens(clause);
    return candidate.some((token, start) =>
      token === claim[0] && claim.every((claimToken, offset) => candidate[start + offset] === claimToken)
    );
  });
}

export function evidenceContainsIdentityPhrase(value: string, sourceText: string) {
  const claim = identityTokens(value);
  if (claim.length === 0) return false;
  return roleEvidenceSegments(sourceText).some((segment) => {
    const candidate = identityTokens(segment);
    if (claim.length > candidate.length) return false;
    return candidate.some((token, start) =>
      token === claim[0] && claim.every((claimToken, offset) => candidate[start + offset] === claimToken)
    );
  });
}
