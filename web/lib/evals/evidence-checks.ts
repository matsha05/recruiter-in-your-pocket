import {
  containsExactEvidence,
  findAlreadySatisfiedFix,
  findBiggestGapContradictions,
  findFixEvidenceMismatch,
  findNonActionableFix,
  findRewriteFidelityIssues,
  findUnsupportedAgencyUpgrade,
  findUnsupportedOutcomeClaims,
  isAcceptedAbsenceMarker,
} from "../llm/grounding";
import type { CheckResult, ErrorCode } from "./types";
import { EVIDENCE_MAX_LENGTH as MAX_LEN } from "./types";

const concreteMetricPattern = /\b\d+(?:\.\d+)?\s*(?:%|x|×|k|m|b|teams?|users?|customers?|projects?|features?|partners?|regions?|weeks?|months?|years?|hrs?|hours?|days?)?\b/gi;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\w\d%\s]/g, "").replace(/\s+/g, " ").trim();
}

function stripBracketPlaceholders(value: string) {
  return value.replace(/\[[^\]]+\]/g, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsLiteral(text: string, value: string) {
  return new RegExp(escapeRegExp(value)).test(text);
}

function findUngroundedSpecifics(text: string, resumeText: string): string[] {
    const normResume = normalize(resumeText);
    const matches = stripBracketPlaceholders(text).match(concreteMetricPattern) || [];
    const ungrounded = new Set<string>();

    for (const match of matches) {
        const numericValue = match.match(/\d+(?:\.\d+)?/)?.[0];
        if (!numericValue) continue;

        const normMetric = normalize(match);
        const numberPattern = new RegExp(`\\b${escapeRegExp(numericValue)}\\b`);
        const isGrounded =
            (normMetric.length > 0 && containsLiteral(normResume, normMetric)) ||
            numberPattern.test(normResume);

        if (!isGrounded) {
            ungrounded.add(match.trim());
        }
    }

    return Array.from(ungrounded);
}

export function checkEvidence(
    topFixes: Array<{ fix: string; evidence?: { excerpt?: string; section?: string } }>,
    resumeText: string
): CheckResult[] {
    const results: CheckResult[] = [];

    let hasAnyEvidence = false;

    for (let i = 0; i < topFixes.length; i++) {
        const fix = topFixes[i];
        const evidence = fix.evidence;

        if (!evidence?.excerpt) {
            results.push({
                passed: false,
                code: "E_NO_EVIDENCE",
                message: `Fix ${i + 1} is missing evidence excerpt`,
                details: { fix_index: i }
            });
            continue;
        }

        hasAnyEvidence = true;

        // Check evidence length
        if (evidence.excerpt.length > MAX_LEN) {
            results.push({
                passed: false,
                code: "E_EVIDENCE_TOO_LONG",
                message: `Fix ${i + 1} evidence is ${evidence.excerpt.length} chars (max ${MAX_LEN})`,
                details: { fix_index: i }
            });
        }

        // Check section is present
        if (!evidence.section) {
            results.push({
                passed: false,
                code: "E_MISSING_REQUIRED_SECTION",
                message: `Fix ${i + 1} evidence missing section label`,
                details: { fix_index: i }
            });
        }

        // Normalized substring check
        if (!containsExactEvidence(resumeText, evidence.excerpt) && !isAcceptedAbsenceMarker(evidence.excerpt, resumeText)) {
            results.push({
                passed: false,
                code: "E_EVIDENCE_NOT_VERBATIM",
                message: `Fix ${i + 1} evidence must be a verbatim resume excerpt`,
                details: { fix_index: i, excerpt_preview: evidence.excerpt.slice(0, 50) }
            });
        }

        const alreadySatisfied = findAlreadySatisfiedFix(fix.fix, evidence.excerpt, resumeText);
        if (alreadySatisfied.length > 0) {
            results.push({
                passed: false,
                code: "E_FIX_ALREADY_SATISFIED",
                message: `Fix ${i + 1} contradicts the resume: ${alreadySatisfied.join(", ")}`,
                details: { fix_index: i }
            });
        }

        const mismatch = findFixEvidenceMismatch(fix.fix, evidence.excerpt, resumeText);
        if (mismatch.length > 0) {
            results.push({
                passed: false,
                code: "E_FIX_EVIDENCE_MISMATCH",
                message: `Fix ${i + 1} is not supported by its evidence: ${mismatch.join(", ")}`,
                details: { fix_index: i }
            });
        }

        const nonActionable = findNonActionableFix(fix.fix);
        if (nonActionable.length > 0) {
            results.push({
                passed: false,
                code: "E_FIX_NOT_ACTIONABLE",
                message: `Fix ${i + 1} is not executable: ${nonActionable.join(", ")}`,
                details: { fix_index: i }
            });
        }
    }

    // For v2 prompt, evidence excerpts ARE required
    if (!hasAnyEvidence) {
        results.push({
            passed: false,
            code: "E_NO_EVIDENCE",
            message: "No evidence excerpts found in top_fixes"
        });
    }

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

// ============================================
export function checkRewriteGrounding(
    rewrites: Array<{ original?: string; better?: string }>,
    resumeText: string
): CheckResult[] {
    const results: CheckResult[] = [];

    for (let i = 0; i < rewrites.length; i++) {
        const rewrite = rewrites[i];
        const original = rewrite.original || "";
        if (!containsExactEvidence(resumeText, original)) {
            results.push({
                passed: false,
                code: "E_REWRITE_ORIGINAL_NOT_VERBATIM",
                message: `Rewrite ${i + 1} original must be a verbatim resume excerpt`,
                details: { rewrite_index: i, original_preview: original.slice(0, 50) }
            });
        }

        const better = rewrite.better || "";
        const ungroundedSpecifics = findUngroundedSpecifics(better, resumeText);
        if (ungroundedSpecifics.length > 0) {
            results.push({
                passed: false,
                code: "E_REWRITE_INVENTED_SPECIFIC",
                message: `Rewrite ${i + 1} includes ungrounded specifics: ${ungroundedSpecifics.join(", ")}`,
                details: { rewrite_index: i, better_preview: better.slice(0, 80), ungrounded_specifics: ungroundedSpecifics }
            });
        }

        const unsupportedAgency = findUnsupportedAgencyUpgrade(original, better, resumeText);
        if (unsupportedAgency.length > 0) {
            results.push({
                passed: false,
                code: "E_REWRITE_OWNERSHIP_INFLATION",
                message: `Rewrite ${i + 1} upgrades unsupported ownership: ${unsupportedAgency.join(", ")}`,
                details: { rewrite_index: i, original_preview: original.slice(0, 80), unsupported_agency: unsupportedAgency }
            });
        }


        const unsupportedOutcomes = findUnsupportedOutcomeClaims(original, better, resumeText);
        if (unsupportedOutcomes.length > 0) {
            results.push({
                passed: false,
                code: "E_REWRITE_OUTCOME_INFLATION",
                message: `Rewrite ${i + 1} adds unsupported outcomes: ${unsupportedOutcomes.join(", ")}`,
                details: { rewrite_index: i, original_preview: original.slice(0, 80), unsupported_outcomes: unsupportedOutcomes }
            });
        }

        const fidelityIssues = findRewriteFidelityIssues(original, better, resumeText);
        for (const issue of fidelityIssues) {
            const code: ErrorCode = issue.startsWith("rewrite no longer")
                ? "E_REWRITE_SOURCE_DRIFT"
                : issue.startsWith("rewrite makes no material change")
                    ? "E_REWRITE_NO_MATERIAL_CHANGE"
                    : "E_REWRITE_DROPPED_EVIDENCE";
            results.push({
                passed: false,
                code,
                message: `Rewrite ${i + 1} failed source fidelity: ${issue}`,
                details: { rewrite_index: i, original_preview: original.slice(0, 80) }
            });
        }
    }

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

export function checkBiggestGapEvidence(value: string, resumeText: string): CheckResult[] {
    const results: CheckResult[] = [];
    const quote = value.match(/["“]([^"”]+)["”]/)?.[1];
    if (!quote || !containsExactEvidence(resumeText, quote)) {
        results.push({
            passed: false,
            code: "E_BIGGEST_GAP_NOT_VERBATIM",
            message: "biggest_gap_example must contain an exact quote from the resume"
        });
        return results;
    }
    const contradictions = findBiggestGapContradictions(value, resumeText);
    if (contradictions.length > 0) {
        results.push({
            passed: false,
            code: "E_BIGGEST_GAP_CONTRADICTS_SOURCE",
            message: `biggest_gap_example contradicts its quote: ${contradictions.join(", ")}`,
        });
    }
    if (results.length === 0) results.push({ passed: true });
    return results;
}
