import { canonicalizeUserSourceText } from "../security/inputSanitization";
import { sourceClauseIsNegated } from "./narrative-token-policy";
import { memoizeByText } from "./source-memo";

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

// Split once per text and reused across every claim audited against the same resume. Read-only.
export const narrativeEvidenceClauses: (sourceText: string) => string[] = memoizeByText((sourceText: string) => protectIdentityDots(canonicalizeUserSourceText(sourceText))
  .split(/(?:\r?\n)+|[.!?;]+|\s*[•●◦▪▫‣⁃|]\s*/u)
  .map((segment) => segment.replaceAll(protectedIdentityDot, "."))
  .flatMap(contrastClauses)
  .filter(Boolean), 32);

const protectedIdentityDot = "\uE000";

function protectIdentityDots(sourceText: string) {
  return sourceText
    .replace(/\b(Sr|Jr)\.(?=\s*[\p{L}\p{M}])/giu, "$1 ")
    .replace(/(^|[^\p{L}\p{M}\d])\.(?=[\p{L}\p{M}\d]+)/gu, `$1${protectedIdentityDot}`)
    .replace(/\b([\p{L}\p{M}\d]+)\.(?=(?:js|ts)\b)/giu, `$1${protectedIdentityDot}`)
    .replace(/(?<=\d)\.(?=\d)/gu, protectedIdentityDot);
}

export const roleEvidenceSegments: (sourceText: string) => string[] = memoizeByText((sourceText: string) => protectIdentityDots(canonicalizeUserSourceText(sourceText))
  .split(/(?:\r?\n)+|[.!?;]+|\s*[•●◦▪▫‣⁃|]\s*/u)
  .map((segment) => segment.replaceAll(protectedIdentityDot, ".").trim())
  .filter(Boolean), 32);

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

// Restrict negative presence to the identity's own grammatical phrase. A
// modifier such as "without supervision" does not negate a preceding tool.
export function evidenceContainsOnlyNegatedEntity(value: string, sourceText: string) {
  const claim = identityTokens(value);
  if (claim.length === 0) return false;
  const protectedSource = canonicalizeUserSourceText(sourceText).replace(identityPattern, (token) =>
    claim.includes(identityTokens(token)[0]) ? token.replaceAll(".", protectedIdentityDot) : token
  );
  const occurrences: boolean[] = [];
  for (const clause of narrativeEvidenceClauses(protectedSource)) {
    const candidate = identityTokens(clause);
    for (let start = 0; start < candidate.length; start++) {
      if (!claim.every((token, offset) => candidate[start + offset] === token)) continue;
      const before = candidate.slice(0, start).join(" ");
      const after = candidate.slice(start + claim.length).join(" ");
      const negatedBefore = /\b(?:no|without|lacks?|lacked|lacking|not|never|unable|cannot|can't|don't|doesn't|didn't)(?:\s+(?:any|prior|previous|experience|knowledge|background|skills?|proficiency|expertise|in|with|of|using|uses?|used|to|work|working|have|has|had|been|able|report|reporting))*$/iu.test(before);
      const negatedAfter = /^(?:(?:experience|knowledge|skills?|proficiency|expertise)\s+)?(?:(?:is|are|was|were|has been|have been)\s+)?(?:absent|excluded|not\s+(?:used|included|part of)|never\s+used)\b/iu.test(after);
      // "No SQL errors" negates errors, not SQL; require an identity/capability
      // head after a bare no/without prefix rather than an arbitrary noun.
      const bareNegativePrefix = /\b(?:no|without)$/iu.test(before);
      const entityHead = !after || /^(?:experience|knowledge|background|skills?|proficiency|expertise|use|usage|familiarity|for|in|during|since|at|with|and|or)\b/iu.test(after);
      occurrences.push((negatedBefore && (!bareNegativePrefix || entityHead)) || negatedAfter);
    }
  }
  return occurrences.length > 0 && occurrences.every(Boolean);
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
