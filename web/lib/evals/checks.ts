/**
 * PromptOps Eval Harness - Validation Checks
 */

import type {
    CheckResult,
    ErrorCode,
    WarningCode,
    Fixture,
    BaselineFixture
} from "./types";
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

import {
    EVIDENCE_MAX_LENGTH as MAX_LEN,
    SCORE_DRIFT_WARN_THRESHOLD as WARN_THRESH,
    SCORE_DRIFT_ERROR_THRESHOLD as ERROR_THRESH,
    SUBSCORE_DRIFT_WARN_THRESHOLD as SUB_WARN,
    MIN_TOP_FIXES as MIN_FIXES,
    CONCRETE_PATTERNS as PATTERNS
} from "./types";

// ============================================
// TEXT NORMALIZATION
// ============================================

export function normalize(s: string): string {
    return s
        .toLowerCase()
        .replace(/[^\w\d%\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

const concreteMetricPattern = /\b\d+(?:\.\d+)?\s*(?:%|x|×|k|m|b|teams?|users?|customers?|projects?|features?|partners?|regions?|weeks?|months?|years?|hrs?|hours?|days?)?\b/gi;

function stripBracketPlaceholders(s: string): string {
    return s.replace(/\[[^\]]+\]/g, "");
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsLiteral(text: string, value: string): boolean {
    return new RegExp(escapeRegExp(value)).test(text);
}

function generatedLanguageForPhraseChecks(output: unknown): string {
    const values: string[] = [];

    function visit(value: unknown, path: string[]) {
        if (typeof value === "string") {
            const joined = path.join(".");
            if (joined.endsWith("evidence.excerpt") || /(?:^|\.)rewrites\.\d+\.original$/.test(joined)) return;
            values.push(joined === "biggest_gap_example"
                ? value.replace(/["“][^"”]+["”]/g, "")
                : value);
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((item, index) => visit(item, [...path, String(index)]));
            return;
        }
        if (value && typeof value === "object") {
            for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
                visit(child, [...path, key]);
            }
        }
    }

    visit(output, []);
    return values.join("\n");
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

// ============================================
// SCHEMA VALIDATION
// ============================================

function checkSchema(output: unknown, expectedContractVersion: string): CheckResult[] {
    const results: CheckResult[] = [];

    if (!output || typeof output !== "object") {
        results.push({ passed: false, code: "E_SCHEMA", message: "Output is not an object" });
        return results;
    }

    const obj = output as Record<string, unknown>;

    // Contract version check
    if (!obj.contract_version || obj.contract_version !== expectedContractVersion) {
        results.push({
            passed: false,
            code: "E_CONTRACT_VERSION_MISMATCH",
            message: `Expected contract_version "${expectedContractVersion}", got "${obj.contract_version || "missing"}"`
        });
    }

    const requiredFields = ["contract_version", "score", "strengths", "gaps", "top_fixes", "subscores"];
    for (const field of requiredFields) {
        if (!(field in obj)) {
            results.push({
                passed: false,
                code: "E_MISSING_REQUIRED_SECTION",
                message: `Missing required field: ${field}`
            });
        }
    }

    if (!("summary" in obj) && !("score_comment_long" in obj)) {
        results.push({
            passed: false,
            code: "E_MISSING_REQUIRED_SECTION",
            message: `Missing summary field (expected 'summary' or 'score_comment_long')`
        });
    }

    // Score validation
    if (typeof obj.score !== "number" || obj.score < 0 || obj.score > 100) {
        results.push({
            passed: false,
            code: "E_SCHEMA",
            message: `Invalid score: ${obj.score}`
        });
    }

    // Empty required fields
    if (typeof obj.summary === "string" && obj.summary.trim() === "") {
        results.push({ passed: false, code: "E_EMPTY_REQUIRED_FIELD", message: "Summary is empty" });
    }

    // TopFixes minimum count
    if (Array.isArray(obj.top_fixes) && obj.top_fixes.length < MIN_FIXES) {
        results.push({
            passed: false,
            code: "E_MISSING_REQUIRED_SECTION",
            message: `top_fixes has ${obj.top_fixes.length} items, minimum is ${MIN_FIXES}`
        });
    }

    if (Array.isArray(obj.top_fixes)) {
        obj.top_fixes.forEach((fix, index) => {
            if (!fix || typeof fix !== "object") {
                results.push({
                    passed: false,
                    code: "E_MISSING_REQUIRED_SECTION",
                    message: `top_fixes[${index}] is not an object`
                });
                return;
            }

            const item = fix as Record<string, unknown>;
            if (!["high", "medium", "low"].includes(String(item.confidence || ""))) {
                results.push({
                    passed: false,
                    code: "E_MISSING_REQUIRED_SECTION",
                    message: `top_fixes[${index}].confidence must be high, medium, or low`
                });
            }
            if (!["high", "medium", "low"].includes(String(item.impact_level || ""))) {
                results.push({
                    passed: false,
                    code: "E_MISSING_REQUIRED_SECTION",
                    message: `top_fixes[${index}].impact_level must be high, medium, or low`
                });
            }
            if (!["quick", "moderate", "high"].includes(String(item.effort || ""))) {
                results.push({
                    passed: false,
                    code: "E_MISSING_REQUIRED_SECTION",
                    message: `top_fixes[${index}].effort must be quick, moderate, or high`
                });
            }
        });
    }

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

// ============================================
// SCORE CHECKS
// ============================================

function checkScoreRange(
    actual: number,
    expected: { min: number; max: number },
    baseline?: BaselineFixture
): CheckResult[] {
    const results: CheckResult[] = [];

    // If baseline exists, compare to baseline score
    if (baseline) {
        const drift = actual - baseline.score;
        const absDrift = Math.abs(drift);

        if (absDrift > ERROR_THRESH) {
            results.push({
                passed: false,
                code: "E_SCORE_EXTREME",
                message: `Score drift ${drift > 0 ? "+" : ""}${drift} exceeds ±${ERROR_THRESH} threshold`,
                details: { drift, baseline: baseline.score, actual }
            });
        } else if (absDrift >= WARN_THRESH) {
            results.push({
                passed: false,
                code: "W_SCORE_DRIFT",
                message: `Score drift ${drift > 0 ? "+" : ""}${drift} (baseline: ${baseline.score}, actual: ${actual})`,
                details: { drift, baseline: baseline.score, actual }
            });
        }
    }

    // Also check against expected range
    if (actual < expected.min || actual > expected.max) {
        const mid = (expected.min + expected.max) / 2;
        const drift = actual - mid;
        if (Math.abs(drift) > ERROR_THRESH) {
            results.push({
                passed: false,
                code: "E_SCORE_EXTREME",
                message: `Score ${actual} outside expected range [${expected.min}, ${expected.max}] by >${ERROR_THRESH} points`
            });
        } else if (Math.abs(drift) >= WARN_THRESH) {
            results.push({
                passed: false,
                code: "W_SCORE_DRIFT",
                message: `Score ${actual} outside expected range [${expected.min}, ${expected.max}]`
            });
        }
    }

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

function checkSubscoreDrift(
    actual: Record<string, number> | undefined,
    baseline?: BaselineFixture
): CheckResult[] {
    if (!actual || !baseline?.subscores) return [{ passed: true }];

    const results: CheckResult[] = [];

    for (const [key, baseVal] of Object.entries(baseline.subscores)) {
        const actVal = actual[key];
        if (actVal !== undefined && baseVal !== undefined) {
            const drift = actVal - baseVal;
            if (Math.abs(drift) > SUB_WARN) {
                results.push({
                    passed: false,
                    code: "W_SUBSCORE_DRIFT",
                    message: `${key} drift ${drift > 0 ? "+" : ""}${drift} (baseline: ${baseVal}, actual: ${actVal})`
                });
            }
        }
    }

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

// ============================================
// EVIDENCE CHECKS
// ============================================

function checkEvidence(
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
        const normExcerpt = normalize(evidence.excerpt);
        if (normExcerpt.length > 10 && !containsExactEvidence(resumeText, evidence.excerpt) && !isAcceptedAbsenceMarker(evidence.excerpt, resumeText)) {
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
// SUMMARY STRUCTURE CHECK
// ============================================

function checkSummaryStructure(summary: string): CheckResult {
    // Check for: role-level signal + strength + gap
    // This is heuristic: look for sentence count and key phrases

    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length < 3 || sentences.length > 5) {
        return {
            passed: false,
            code: "W_SUMMARY_STRUCTURE",
            message: `Summary has ${sentences.length} sentences (expected 3-5)`
        };
    }

    // Check for role-level signal (common patterns)
    const hasRoleSignal = /\b(read as|come across as|present as|appear as|page supports|positions? you|career story|roles?|target|fit|senior|mid[-\s]?level|entry|lead|manager|director|engineer|pm|designer|teacher|counsel|pastor|analyst|recruiter|executive|controller|cfo|accounting|consulting)\b/i.test(summary);

    // Check for strength indicator
    const hasStrength = /\b(capable|credible|believable|clear(?:est)?|useful|strong(?:est)?|strengths?|show|demonstrate|visible|evident|ownership|impact|results?|outcomes?|scale|quantified|measurable|value|worth keeping|quota|revenue|adoption|reduction|increase|improvement|growth|leadership|range|foundation|focus(?:es|ed)? on|experience (?:spans|includes))\b/i.test(summary);

    // Check for gap indicator
    const hasGap = /\b(open question|(?:practical|remaining|main|real|hiring) question|unresolved|remains? (?:unclear|unknown|unanswered)|harder to see|hard to (?:assess|gauge|place|see)|difficult to (?:assess|gauge|place|see)|lack of|missing|unclear|vague|could|needs|lacks?|does not|do not|without|limits?|leaves?|stops? at|gaps?|weakness(?:es)?|thin|holds? (?:it|this) back)\b/i.test(summary);

    if (!hasRoleSignal || !hasStrength || !hasGap) {
        const missing: string[] = [];
        if (!hasRoleSignal) missing.push("role-level signal");
        if (!hasStrength) missing.push("strength indicator");
        if (!hasGap) missing.push("gap indicator");

        return {
            passed: false,
            code: "W_SUMMARY_STRUCTURE",
            message: `Summary missing: ${missing.join(", ")}`
        };
    }

    return { passed: true };
}

// ============================================
// PHRASE CHECKS
// ============================================

function checkBannedPhrases(
    output: string,
    globalBanned: string[],
    fixtureBanned: string[] = []
): CheckResult[] {
    const results: CheckResult[] = [];
    const normalizedOutput = output.toLowerCase();

    const allBanned = [...globalBanned, ...fixtureBanned];

    for (const phrase of allBanned) {
        if (containsLiteral(normalizedOutput, phrase.toLowerCase())) {
            results.push({
                passed: false,
                code: "E_BANNED_PHRASE",
                message: `Contains banned phrase: "${phrase}"`
            });
        }
    }

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

function checkDiscouragedPhrases(
    output: string,
    globalDiscouraged: string[]
): CheckResult[] {
    const results: CheckResult[] = [];
    const normalizedOutput = output.toLowerCase();

    for (const phrase of globalDiscouraged) {
        if (containsLiteral(normalizedOutput, phrase.toLowerCase())) {
            results.push({
                passed: false,
                code: "W_DISCOURAGED_PHRASE",
                message: `Contains discouraged phrase: "${phrase}"`
            });
        }
    }

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

// ============================================
// HUMAN COPY CHECK
// ============================================

export function findMechanicalCopyIssues(output: unknown): string[] {
    const prose: Array<{ path: string; value: string }> = [];

    function visit(value: unknown, path: string[]) {
        if (typeof value === "string") {
            const joined = path.join(".");
            const isSourceText = joined.endsWith("evidence.excerpt")
                || /(?:^|\.)rewrites\.\d+\.original$/.test(joined)
                || joined === "biggest_gap_example";
            const isRequiredBoilerplate = joined.startsWith("section_review.")
                || joined === "job_alignment.role_fit.company_stage_fit"
                || joined === "job_alignment.missing.0"
                || joined.endsWith(".section_ref")
                || joined.endsWith(".evidence.section")
                || joined.endsWith(".label")
                || joined.endsWith(".confidence")
                || joined.endsWith(".impact_level")
                || joined.endsWith(".effort")
                || joined.endsWith(".archetype");
            if (!isSourceText && !isRequiredBoilerplate) prose.push({ path: joined, value });
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((item, index) => visit(item, [...path, String(index)]));
            return;
        }
        if (value && typeof value === "object") {
            for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
                visit(child, [...path, key]);
            }
        }
    }

    visit(output, []);
    const issues: string[] = [];
    const sentences = new Map<string, string>();

    for (const item of prose) {
        if (/\.\.\./.test(item.value)) {
            issues.push(`${item.path} uses an ellipsis as connective tissue`);
        }

        const normalized = item.value.toLowerCase().replace(/[^a-z0-9' -]+/g, " ").replace(/\s+/g, " ").trim();
        const repeatedClause = normalized.match(/\b([a-z][a-z'-]+(?:\s+[a-z][a-z'-]+){2,5})\b.{0,140}\b\1\b/i)?.[1];
        const trailingWord = repeatedClause?.split(/\s+/).at(-1);
        const isProgressionPhrase = Boolean(trailingWord && ["to", "from", "through", "into"].includes(trailingWord));
        const isRepeatedRoleOrDomainLabel = Boolean(trailingWord && [
            "manager", "director", "executive", "engineer", "designer", "recruiter",
            "hiring", "recruiting",
        ].includes(trailingWord));
        if (repeatedClause && !isProgressionPhrase && !isRepeatedRoleOrDomainLabel) {
            issues.push(`${item.path} repeats the clause "${repeatedClause}"`);
        }

        for (const sentence of item.value.split(/(?<=[.!?])\s+/)) {
            const key = normalize(sentence);
            if (key.split(/\s+/).length < 7) continue;
            const priorPath = sentences.get(key);
            if (priorPath && priorPath !== item.path) {
                issues.push(`${item.path} repeats a full sentence from ${priorPath}`);
            } else if (!priorPath) {
                sentences.set(key, item.path);
            }
        }
    }

    return Array.from(new Set(issues));
}

function checkMechanicalCopy(output: unknown): CheckResult[] {
    const issues = findMechanicalCopyIssues(output);
    if (issues.length === 0) return [{ passed: true }];
    return issues.map((issue) => ({
        passed: false,
        code: "W_MECHANICAL_COPY" as const,
        message: issue,
    }));
}

// ============================================
// SPECIFICITY CHECK
// ============================================

function checkSpecificity(
    topFixes: Array<{ fix: string }>
): CheckResult[] {
    const results: CheckResult[] = [];

    for (let i = 0; i < topFixes.length; i++) {
        const fixText = topFixes[i].fix;
        const namesConcreteSkillGroup = /\bskills?\s+section\b/i.test(fixText)
            && (fixText.match(/,/g) || []).length >= 2;
        const namesConcreteRemoval = /^(?:remove|delete)\b/i.test(fixText)
            && /["“][^"”]+["”]|\b(?:line|entry|phrase|label|header|headline|section)\b/i.test(fixText);
        const hasConcreteToken = PATTERNS.some(p => p.test(fixText))
            || namesConcreteSkillGroup
            || namesConcreteRemoval;

        if (!hasConcreteToken) {
            results.push({
                passed: false,
                code: "W_SPECIFICITY_LOW",
                message: `Fix ${i + 1} lacks concrete tokens (digits, %, measurable nouns, time bounds)`,
                details: { fix_index: i, fix_preview: fixText.slice(0, 50) }
            });
        }
    }

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

function checkRewriteGrounding(
    rewrites: Array<{ original?: string; better?: string }>,
    resumeText: string
): CheckResult[] {
    const results: CheckResult[] = [];

    for (let i = 0; i < rewrites.length; i++) {
        const rewrite = rewrites[i];
        const original = rewrite.original || "";
        const normOriginal = normalize(original);

        if (normOriginal.length > 10 && !containsExactEvidence(resumeText, original)) {
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

function checkBiggestGapEvidence(value: string, resumeText: string): CheckResult[] {
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

// ============================================
// RUN ALL CHECKS
// ============================================

export interface AllChecksInput {
    output: unknown;
    resumeText: string;
    fixture: Fixture;
    baseline?: BaselineFixture;
    globalBanned: string[];
    globalDiscouraged: string[];
    expectedContractVersion: string;
}

export interface AllChecksResult {
    errors: Array<{ code: ErrorCode; message: string }>;
    warnings: Array<{ code: WarningCode; message: string }>;
}

export function runAllChecks(input: AllChecksInput): AllChecksResult {
    const errors: Array<{ code: ErrorCode; message: string }> = [];
    const warnings: Array<{ code: WarningCode; message: string }> = [];

    function addResult(result: CheckResult) {
        if (!result.passed && result.code) {
            const entry = { code: result.code, message: result.message || "" };
            if (result.code.startsWith("E_")) {
                errors.push(entry as { code: ErrorCode; message: string });
            } else {
                warnings.push(entry as { code: WarningCode; message: string });
            }
        }
    }

    // Schema checks
    for (const r of checkSchema(input.output, input.expectedContractVersion)) {
        addResult(r);
    }

    // If schema failed badly, skip other checks
    if (errors.some(e => e.code === "E_SCHEMA")) {
        return { errors, warnings };
    }

    const obj = input.output as Record<string, unknown>;

    if (/\[?SOURCE_\d{3}\]?/i.test(JSON.stringify(obj))) {
        addResult({
            passed: false,
            code: "E_SOURCE_TAG_LEAK",
            message: "Output exposes an internal SOURCE catalog tag",
        });
    }

    // Score checks
    for (const r of checkScoreRange(
        obj.score as number,
        input.fixture.expected_score,
        input.baseline
    )) {
        addResult(r);
    }

    // Subscore drift
    for (const r of checkSubscoreDrift(
        obj.subscores as Record<string, number> | undefined,
        input.baseline
    )) {
        addResult(r);
    }

    // Evidence checks
    if (Array.isArray(obj.top_fixes)) {
        for (const r of checkEvidence(obj.top_fixes as any[], input.resumeText)) {
            addResult(r);
        }

        // Specificity
        for (const r of checkSpecificity(obj.top_fixes as any[])) {
            addResult(r);
        }
    }

    if (Array.isArray(obj.rewrites)) {
        for (const r of checkRewriteGrounding(obj.rewrites as any[], input.resumeText)) {
            addResult(r);
        }
    }

    if (typeof obj.biggest_gap_example === "string") {
        for (const r of checkBiggestGapEvidence(obj.biggest_gap_example, input.resumeText)) {
            addResult(r);
        }
    }

    // Summary structure
    if (typeof obj.summary === "string") {
        addResult(checkSummaryStructure(obj.summary));
    }

    // Phrase checks - serialize output for phrase checking
    const outputStr = generatedLanguageForPhraseChecks(obj);
    for (const r of checkBannedPhrases(outputStr, input.globalBanned, input.fixture.banned_phrases)) {
        addResult(r);
    }
    for (const r of checkDiscouragedPhrases(outputStr, input.globalDiscouraged)) {
        addResult(r);
    }
    for (const r of checkMechanicalCopy(obj)) {
        addResult(r);
    }

    return { errors, warnings };
}
