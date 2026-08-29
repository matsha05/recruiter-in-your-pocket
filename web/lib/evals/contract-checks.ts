import type { BaselineFixture, CheckResult } from "./types";
import {
  MIN_TOP_FIXES as MIN_FIXES,
  SCORE_DRIFT_ERROR_THRESHOLD as ERROR_THRESH,
  SCORE_DRIFT_WARN_THRESHOLD as WARN_THRESH,
  SUBSCORE_DRIFT_WARN_THRESHOLD as SUB_WARN,
} from "./types";

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
        const drift = actual < expected.min
            ? actual - expected.min
            : actual - expected.max;
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
