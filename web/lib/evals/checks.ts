/**
 * PromptOps Eval Harness - Validation Checks
 */

import type {
    CheckResult,
    ErrorCode,
    WarningCode,
    Fixture,
    BaselineFixture,
    EVIDENCE_MAX_LENGTH,
    SCORE_DRIFT_WARN_THRESHOLD,
    SCORE_DRIFT_ERROR_THRESHOLD,
    SUBSCORE_DRIFT_WARN_THRESHOLD,
    MIN_TOP_FIXES,
    CONCRETE_PATTERNS
} from "./types";

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

// ============================================
// SCHEMA VALIDATION
// ============================================

export function checkSchema(output: unknown, expectedContractVersion: string): CheckResult[] {
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

    // Required fields - aligned with V2 prompt output schema
    // V2 uses: score, score_comment_long (not 'summary'), strengths, gaps, top_fixes
    const requiredFields = ["score", "strengths", "gaps", "top_fixes"];
    for (const field of requiredFields) {
        if (!(field in obj)) {
            results.push({
                passed: false,
                code: "E_MISSING_REQUIRED_SECTION",
                message: `Missing required field: ${field}`
            });
        }
    }

    // Summary can be either 'summary' or 'score_comment_long' (V2)
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

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

// ============================================
// SCORE CHECKS
// ============================================

export function checkScoreRange(
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

export function checkSubscoreDrift(
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

export function checkEvidence(
    topFixes: Array<{ fix: string; evidence?: { excerpt?: string; section?: string } }>,
    resumeText: string
): CheckResult[] {
    const results: CheckResult[] = [];
    const normResume = normalize(resumeText);

    let hasAnyEvidence = false;

    for (let i = 0; i < topFixes.length; i++) {
        const fix = topFixes[i];
        const evidence = fix.evidence;

        if (!evidence?.excerpt) {
            continue; // Will be caught by E_NO_EVIDENCE if none exist
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
        if (normExcerpt.length > 10 && !normResume.includes(normExcerpt)) {
            results.push({
                passed: false,
                code: "W_EVIDENCE_PARAPHRASE",
                message: `Fix ${i + 1} evidence not verbatim match after normalization`,
                details: { fix_index: i, excerpt_preview: evidence.excerpt.slice(0, 50) }
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

export function checkSummaryStructure(summary: string): CheckResult {
    // Check for: role-level signal + strength + gap
    // This is heuristic: look for sentence count and key phrases

    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length < 2 || sentences.length > 5) {
        return {
            passed: false,
            code: "W_SUMMARY_STRUCTURE",
            message: `Summary has ${sentences.length} sentences (expected 2-3)`
        };
    }

    // Check for role-level signal (common patterns)
    const hasRoleSignal = /\b(read as|come across as|present as|appear as|senior|mid[-\s]?level|entry|lead|manager|director|engineer|pm|designer)\b/i.test(summary);

    // Check for strength indicator
    const hasStrength = /\b(clear|strong|solid|show|demonstrate|visible|evident|effective)\b/i.test(summary);

    // Check for gap indicator
    const hasGap = /\b(harder to see|missing|unclear|vague|could|needs|lacks|gap|thin)\b/i.test(summary);

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

export function checkBannedPhrases(
    output: string,
    globalBanned: string[],
    fixtureBanned: string[] = []
): CheckResult[] {
    const results: CheckResult[] = [];
    const normalizedOutput = output.toLowerCase();

    const allBanned = [...globalBanned, ...fixtureBanned];

    for (const phrase of allBanned) {
        if (normalizedOutput.includes(phrase.toLowerCase())) {
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

export function checkDiscouragedPhrases(
    output: string,
    globalDiscouraged: string[]
): CheckResult[] {
    const results: CheckResult[] = [];
    const normalizedOutput = output.toLowerCase();

    for (const phrase of globalDiscouraged) {
        if (normalizedOutput.includes(phrase.toLowerCase())) {
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
// SPECIFICITY CHECK
// ============================================

export function checkSpecificity(
    topFixes: Array<{ fix: string }>
): CheckResult[] {
    const results: CheckResult[] = [];

    for (let i = 0; i < topFixes.length; i++) {
        const fixText = topFixes[i].fix;
        const hasConcreteToken = PATTERNS.some(p => p.test(fixText));

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

    // Summary structure
    if (typeof obj.summary === "string") {
        addResult(checkSummaryStructure(obj.summary));
    }

    // Phrase checks - serialize output for phrase checking
    const outputStr = JSON.stringify(obj);
    for (const r of checkBannedPhrases(outputStr, input.globalBanned, input.fixture.banned_phrases)) {
        addResult(r);
    }
    for (const r of checkDiscouragedPhrases(outputStr, input.globalDiscouraged)) {
        addResult(r);
    }

    return { errors, warnings };
}
