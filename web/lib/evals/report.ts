/**
 * PromptOps Eval Harness - Report Generation
 */

import type {
    EvalRunOutput,
    FixtureResult,
    EvalRunMetadata,
    ErrorCode,
    WarningCode
} from "./types";

// ============================================
// MARKDOWN REPORT GENERATION
// ============================================

export function generateMarkdownReport(run: EvalRunOutput): string {
    const lines: string[] = [];

    // Header
    lines.push("# PromptOps Eval Report");
    lines.push("");
    lines.push(`**Run ID:** ${run.metadata.run_id}`);
    lines.push(`**Timestamp:** ${run.metadata.timestamp}`);
    lines.push(`**Tier:** ${run.metadata.tier}`);
    lines.push(`**Prompt Version:** ${run.metadata.prompt_version_hash}`);
    lines.push(`**Contract Version:** ${run.metadata.contract_version}`);
    lines.push("");

    // Summary
    lines.push("## Summary");
    lines.push("");
    lines.push(`| Metric | Value |`);
    lines.push(`|:-------|:------|`);
    lines.push(`| Total Fixtures | ${run.summary.total} |`);
    lines.push(`| ✅ Passed | ${run.summary.passed} |`);
    lines.push(`| ⚠️ Warned | ${run.summary.warned} |`);
    lines.push(`| ❌ Failed | ${run.summary.failed} |`);
    lines.push(`| Pass Rate | ${((run.summary.passed / run.summary.total) * 100).toFixed(1)}% |`);
    lines.push("");

    // Cost
    lines.push("## Cost");
    lines.push("");
    lines.push(`| Metric | Value |`);
    lines.push(`|:-------|:------|`);
    lines.push(`| API Calls | ${run.metadata.calls_made} |`);
    lines.push(`| Actual Cost | $${run.metadata.actual_cost_usd.toFixed(4)} |`);
    lines.push(`| Budget | $${run.metadata.budget_usd.toFixed(2)} |`);
    lines.push("");

    // Blocking Failures (E_ codes)
    const failures = run.results.filter(r => r.status === "FAIL");
    if (failures.length > 0) {
        lines.push("## ❌ Blocking Failures");
        lines.push("");
        lines.push("These must be fixed before shipping.");
        lines.push("");

        for (const result of failures) {
            lines.push(formatFixtureResult(result, "FAIL"));
            lines.push("");
        }
    }

    // Warnings (W_ codes)
    const warnings = run.results.filter(r => r.status === "WARN");
    if (warnings.length > 0) {
        lines.push("## ⚠️ Warnings (Review Recommended)");
        lines.push("");

        for (const result of warnings) {
            lines.push(formatFixtureResult(result, "WARN"));
            lines.push("");
        }
    }

    // Passed (summary only)
    const passed = run.results.filter(r => r.status === "PASS");
    if (passed.length > 0) {
        lines.push("## ✅ Passed");
        lines.push("");
        lines.push(`${passed.length} fixtures passed all checks.`);
        lines.push("");
        lines.push("<details>");
        lines.push("<summary>Expand to see fixture IDs</summary>");
        lines.push("");
        for (const result of passed) {
            lines.push(`- ${result.fixture_id} (score: ${result.actual_score})`);
        }
        lines.push("</details>");
        lines.push("");
    }

    return lines.join("\n");
}

function formatFixtureResult(result: FixtureResult, focus: "FAIL" | "WARN"): string {
    const lines: string[] = [];

    lines.push(`### ${result.fixture_id}`);
    lines.push("");
    lines.push(`**Status:** ${result.status}`);
    lines.push(`**Score:** ${result.actual_score} (expected: ${result.expected_range[0]}–${result.expected_range[1]})`);

    if (result.score_drift !== undefined) {
        lines.push(`**Score Drift:** ${result.score_drift > 0 ? "+" : ""}${result.score_drift}`);
    }

    // Error codes
    if (result.errors.length > 0) {
        lines.push("");
        lines.push("**Errors (ship blockers):**");
        for (const err of result.errors) {
            lines.push(`- \`${err.code}\`: ${err.message}`);
        }
    }

    // Warning codes
    if (result.warnings.length > 0) {
        lines.push("");
        lines.push("**Warnings:**");
        for (const warn of result.warnings) {
            lines.push(`- \`${warn.code}\`: ${warn.message}`);
        }
    }

    // Subscore drifts
    if (result.subscore_drifts && Object.keys(result.subscore_drifts).length > 0) {
        lines.push("");
        lines.push("**Subscore Drifts:**");
        for (const [key, drift] of Object.entries(result.subscore_drifts)) {
            if (Math.abs(drift) > 10) {
                lines.push(`- ${key}: ${drift > 0 ? "+" : ""}${drift}`);
            }
        }
    }

    // Evidence flags
    if (result.evidence_flags && result.evidence_flags.length > 0) {
        lines.push("");
        lines.push("**Evidence Issues:**");
        for (const flag of result.evidence_flags) {
            lines.push(`- Fix ${flag.fix_index + 1}: ${flag.issue}`);
        }
    }

    return lines.join("\n");
}

// ============================================
// JSON DIFF (vs Baseline)
// ============================================

export interface DiffEntry {
    fixture_id: string;
    changed_fields: Array<{
        field: string;
        baseline: unknown;
        current: unknown;
        drift?: number;
    }>;
    new_errors: ErrorCode[];
    new_warnings: WarningCode[];
}

export function generateDiffReport(
    currentResults: FixtureResult[],
    baseline: Record<string, { score: number; subscores?: Record<string, number> }>
): DiffEntry[] {
    const diffs: DiffEntry[] = [];

    for (const result of currentResults) {
        const baselineFixture = baseline[result.fixture_id];
        if (!baselineFixture) continue;

        const changedFields: DiffEntry["changed_fields"] = [];

        // Score diff
        if (result.actual_score !== baselineFixture.score) {
            changedFields.push({
                field: "score",
                baseline: baselineFixture.score,
                current: result.actual_score,
                drift: result.actual_score - baselineFixture.score
            });
        }

        // Subscore diffs
        if (result.subscores && baselineFixture.subscores) {
            for (const [key, val] of Object.entries(result.subscores)) {
                const baseVal = baselineFixture.subscores[key];
                if (baseVal !== undefined && val !== baseVal) {
                    changedFields.push({
                        field: `subscores.${key}`,
                        baseline: baseVal,
                        current: val,
                        drift: val - baseVal
                    });
                }
            }
        }

        if (changedFields.length > 0 || result.errors.length > 0 || result.warnings.length > 0) {
            diffs.push({
                fixture_id: result.fixture_id,
                changed_fields: changedFields,
                new_errors: result.errors.map(e => e.code),
                new_warnings: result.warnings.map(w => w.code)
            });
        }
    }

    return diffs;
}

// ============================================
// CONSOLE OUTPUT
// ============================================

export function printSummary(run: EvalRunOutput): void {
    console.log("");
    console.log("========================================");
    console.log("         PROMPTOPS EVAL REPORT          ");
    console.log("========================================");
    console.log("");
    console.log(`Tier: ${run.metadata.tier}`);
    console.log(`Fixtures: ${run.summary.total}`);
    console.log(`Cost: $${run.metadata.actual_cost_usd.toFixed(4)}`);
    console.log("");
    console.log(`✅ PASS: ${run.summary.passed}`);
    console.log(`⚠️  WARN: ${run.summary.warned}`);
    console.log(`❌ FAIL: ${run.summary.failed}`);
    console.log("");

    if (run.summary.failed > 0) {
        console.log("BLOCKING FAILURES:");
        for (const r of run.results.filter(r => r.status === "FAIL")) {
            console.log(`  ${r.fixture_id}: ${r.errors.map(e => e.code).join(", ")}`);
        }
        console.log("");
    }

    if (run.summary.warned > 0) {
        console.log("WARNINGS:");
        for (const r of run.results.filter(r => r.status === "WARN")) {
            console.log(`  ${r.fixture_id}: ${r.warnings.map(w => w.code).join(", ")}`);
        }
        console.log("");
    }

    console.log("========================================");
}
