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
import { scoreTestRetest, type ReportIntegrityMetrics } from "./integrity-checks";

// ============================================
// MARKDOWN REPORT GENERATION
// ============================================

export function generateMarkdownReport(run: EvalRunOutput): string {
    const lines: string[] = [];
    const isDryRun = run.metadata.execution_mode === "dry_run";

    // Header
    lines.push(isDryRun ? "# PromptOps Fixture Validation Report" : "# PromptOps Live Eval Report");
    lines.push("");
    if (!isDryRun) {
        lines.push(`**Run ID:** ${run.metadata.run_id}`);
        lines.push(`**Timestamp:** ${run.metadata.timestamp}`);
    }
    lines.push(`**Tier:** ${run.metadata.tier}`);
    lines.push(`**Prompt Version:** ${run.metadata.prompt_version_hash}`);
    lines.push(`**Contract Version:** ${run.metadata.contract_version}`);
    lines.push(`**Execution Mode:** ${isDryRun ? "Dry run (no model calls)" : "Live model evaluation"}`);
    if (!isDryRun) lines.push(`**Model:** ${run.metadata.model}`);
    if (!isDryRun && run.metadata.reasoning_effort) {
        lines.push(`**Reasoning effort:** ${run.metadata.reasoning_effort}`);
    }
    if (!isDryRun && run.metadata.resume_prompt_sha256) {
        lines.push(`**Resume prompt SHA-256:** ${run.metadata.resume_prompt_sha256}`);
    }
    if (!isDryRun && run.metadata.resume_ideas_prompt_sha256) {
        lines.push(`**Resume ideas prompt SHA-256:** ${run.metadata.resume_ideas_prompt_sha256}`);
    }
    if (!isDryRun && run.metadata.incomplete_retry_reasoning_effort) {
        lines.push(`**Incomplete-response retry:** ${run.metadata.incomplete_retry_reasoning_effort} reasoning`);
    }
    if (!isDryRun && run.metadata.validation_mode === "saved_output_replay") {
        lines.push("**Validation Mode:** Saved output replay through current candidate");
        if (run.metadata.validation_timestamp) {
            lines.push(`**Validation Timestamp:** ${run.metadata.validation_timestamp}`);
        }
        if (run.metadata.source_runs && run.metadata.source_runs.length > 1) {
            lines.push(`**Source runs:** ${run.metadata.source_runs.map((source) => `${source.run_id} (SHA-256 ${source.sha256})`).join(", ")}`);
        } else if (run.metadata.source_run_sha256) {
            lines.push(`**Source run SHA-256:** ${run.metadata.source_run_sha256}`);
        }
    }
    if (isDryRun) {
        lines.push("");
        lines.push("> This report validates fixture files and configuration only. It is not evidence of model output quality.");
    }
    lines.push("");

    // Summary
    lines.push("## Summary");
    lines.push("");
    lines.push(`| Metric | Value |`);
    lines.push(`|:-------|:------|`);
    lines.push(`| Total Fixtures | ${run.summary.total} |`);
    lines.push(`| ${isDryRun ? "Validated" : "✅ Passed"} | ${run.summary.passed} |`);
    lines.push(`| ⚠️ Warned | ${run.summary.warned} |`);
    lines.push(`| ❌ Failed | ${run.summary.failed} |`);
    lines.push(`| ${isDryRun ? "Fixture Validation Rate" : "Pass Rate"} | ${((run.summary.passed / run.summary.total) * 100).toFixed(1)}% |`);
    lines.push("");

    // Cost
    lines.push("## Cost");
    lines.push("");
    lines.push(`| Metric | Value |`);
    lines.push(`|:-------|:------|`);
    lines.push(`| API Calls | ${run.metadata.calls_made} |`);
    lines.push(`| Token-calculated API Cost | $${run.metadata.actual_cost_usd.toFixed(6)} |`);
    lines.push(`| Input Tokens | ${run.metadata.token_usage.prompt_tokens.toLocaleString("en-US")} |`);
    lines.push(`| Cached Input Tokens | ${(run.metadata.token_usage.cached_prompt_tokens || 0).toLocaleString("en-US")} |`);
    lines.push(`| Output Tokens | ${run.metadata.token_usage.completion_tokens.toLocaleString("en-US")} |`);
    lines.push(`| Reasoning Tokens | ${(run.metadata.token_usage.reasoning_tokens || 0).toLocaleString("en-US")} |`);
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

    lines.push(...integritySection(run));
    lines.push(...retestSection(run));

    // Passed (summary only)
    const passed = run.results.filter(r => r.status === "PASS");
    if (passed.length > 0) {
        lines.push(isDryRun ? "## Validated Fixtures" : "## ✅ Passed");
        lines.push("");
        lines.push(
            isDryRun
                ? `${passed.length} fixture files were found. Their model outputs were not evaluated.`
                : `${passed.length} fixtures passed all checks.`
        );
        lines.push("");
        lines.push("<details>");
        lines.push("<summary>Expand to see fixture IDs</summary>");
        lines.push("");
        for (const result of passed) {
            lines.push(
                isDryRun
                    ? `- ${result.fixture_id}`
                    : `- ${result.fixture_id} (score: ${result.actual_score})`
            );
        }
        lines.push("</details>");
        lines.push("");
    }

    return lines.join("\n");
}

// ============================================
// REPORT INTEGRITY
// ============================================

function measured(run: EvalRunOutput) {
    return run.results.filter((result): result is FixtureResult & { integrity: ReportIntegrityMetrics } => Boolean(result.integrity));
}

function reports(count: number) {
    return `${count} ${count === 1 ? "report" : "reports"}`;
}

function humanKind(kind: string | undefined) {
    return kind ? kind.replace(/_/g, " ") : "";
}

function criticalMissLabel(metrics: ReportIntegrityMetrics) {
    const { critical_miss: miss } = metrics;
    const base = miss.category === "bullet_edit" ? "line edit" : miss.category === "structural" ? `structural (${humanKind(miss.kind)})` : "none";
    const optional = miss.nothing_critical ? ", nothing critical" : "";
    const flagged = miss.structural_flagged.length > 0 ? `; flagged: ${miss.structural_flagged.map(humanKind).join(", ")}` : "";
    return `${base}${optional}${flagged}${miss.outranked ? " (outranked)" : ""}`;
}

/** Validation removed the model's first fix, so another fix became the Critical Miss. */
function criticalMissDropped(result: FixtureResult) {
    return (result.normalization_changes || []).some((change) => /^top_fixes\[0\]\.dropped_/.test(change));
}

export function integritySummary(run: EvalRunOutput) {
    const results = measured(run).map((result) => result.integrity);
    const sum = (pick: (metrics: ReportIntegrityMetrics) => number) => results.reduce((total, metrics) => total + pick(metrics), 0);
    const count = (test: (metrics: ReportIntegrityMetrics) => boolean) => results.filter(test).length;
    return {
        reports: results.length,
        withRewrites: count((metrics) => metrics.rewrites > 0),
        rewrites: sum((metrics) => metrics.rewrites),
        collisions: { model: sum((metrics) => metrics.keep_fix_collisions.model), shown: sum((metrics) => metrics.keep_fix_collisions.shown) },
        collisionReports: count((metrics) => metrics.keep_fix_collisions.model > 0),
        criticalMissInKeep: {
            model: count((metrics) => metrics.keep_fix_collisions.critical_miss_in_keep.model),
            shown: count((metrics) => metrics.keep_fix_collisions.critical_miss_in_keep.shown),
        },
        repeats: { model: sum((metrics) => metrics.repeated_observations.model), shown: sum((metrics) => metrics.repeated_observations.shown) },
        slots: { model: sum((metrics) => metrics.slot_mapping.model.length), shown: sum((metrics) => metrics.slot_mapping.shown.length) },
        lineEdits: count((metrics) => metrics.critical_miss.category === "bullet_edit"),
        structural: count((metrics) => metrics.critical_miss.category === "structural"),
        structuralKinds: [...new Set(results.map((metrics) => metrics.critical_miss.kind).filter((kind): kind is NonNullable<typeof kind> => Boolean(kind)))]
            .map((kind) => `${humanKind(kind)} ${count((metrics) => metrics.critical_miss.kind === kind)}`),
        nothingCritical: count((metrics) => metrics.critical_miss.nothing_critical),
        criticalMissDropped: measured(run).filter(criticalMissDropped).length,
        outranked: count((metrics) => metrics.critical_miss.outranked),
        mismatches: count((metrics) => metrics.verdict_critical_miss.agreement === "mismatch"),
        noConcern: count((metrics) => metrics.verdict_critical_miss.agreement === "no_concern"),
        headings: {
            total: sum((metrics) => metrics.fix_headings?.count ?? 0),
            maxWords: results.reduce((max, metrics) => Math.max(max, metrics.fix_headings?.max_words ?? 0), 0),
            over12: sum((metrics) => metrics.fix_headings?.over_12_words ?? 0),
            withLocation: sum((metrics) => metrics.fix_headings?.with_location ?? 0),
            withCondition: sum((metrics) => metrics.fix_headings?.with_condition ?? 0),
        },
    };
}

function integritySection(run: EvalRunOutput): string[] {
    const results = measured(run);
    if (results.length === 0) return [];
    const summary = integritySummary(run);
    const lines: string[] = [];
    lines.push("## Report Integrity");
    lines.push("");
    lines.push("What a customer reads, measured on each validated report. These checks are reported, not gated; the status counts above are unchanged. **Model** is the report as generated. **Shown** is the report after the deterministic post-generation pass that the web report and PDF both apply.");
    lines.push("");
    lines.push("| Check | Model | Shown |");
    lines.push("|:------|:------|:------|");
    lines.push(`| Reports with a rewrite | ${summary.withRewrites} of ${summary.reports} (${summary.rewrites} rewrites) | same |`);
    lines.push(`| Keep/fix collisions on one line | ${summary.collisions.model} in ${reports(summary.collisionReports)} | ${summary.collisions.shown} |`);
    lines.push(`| Critical Miss line also in Keep | ${reports(summary.criticalMissInKeep.model)} | ${reports(summary.criticalMissInKeep.shown)} |`);
    lines.push(`| Repeated observations | ${summary.repeats.model} | ${summary.repeats.shown} |`);
    lines.push(`| Field-slot mapping issues | ${summary.slots.model} | ${summary.slots.shown} |`);
    lines.push(`| Critical Miss is a line edit / structural | ${summary.lineEdits} / ${summary.structural}${summary.structuralKinds.length > 0 ? ` (${summary.structuralKinds.join(", ")})` : ""} | same |`);
    lines.push(`| Nothing critical (Critical Miss marked low impact) | ${reports(summary.nothingCritical)} | same |`);
    lines.push(`| Model's first fix dropped by validation | ${reports(summary.criticalMissDropped)} | same |`);
    lines.push(`| Structural issue flagged, Critical Miss is a line edit | ${reports(summary.outranked)} | same |`);
    lines.push(`| Verdict and Critical Miss disagree | ${reports(summary.mismatches)} | same |`);
    lines.push(`| Verdict raises no concern | ${reports(summary.noConcern)} | same |`);
    lines.push(`| Fix headings over 12 words | ${summary.headings.over12} of ${summary.headings.total} (longest ${summary.headings.maxWords} words) | same |`);
    lines.push(`| Fix headings that open with a location / carry a condition | ${summary.headings.withLocation} / ${summary.headings.withCondition} | same |`);
    lines.push("");
    lines.push("| Fixture | Score | Rewrites | Keep/fix | Repeats | Slot issues | Critical Miss | Verdict and Critical Miss |");
    lines.push("|:--------|:------|:---------|:---------|:--------|:------------|:--------------|:--------------------------|");
    for (const result of results) {
        const metrics = result.integrity;
        const collisions = `${metrics.keep_fix_collisions.model} → ${metrics.keep_fix_collisions.shown}${metrics.keep_fix_collisions.critical_miss_in_keep.model ? " (Critical Miss in Keep)" : ""}`;
        lines.push(`| ${result.fixture_id} | ${result.actual_score} | ${metrics.rewrites} | ${collisions} | ${metrics.repeated_observations.model} → ${metrics.repeated_observations.shown} | ${metrics.slot_mapping.model.length} → ${metrics.slot_mapping.shown.length} | ${criticalMissLabel(metrics)} | ${metrics.verdict_critical_miss.agreement.replace("_", " ")} |`);
    }
    lines.push("");

    const details = results.flatMap((result) => {
        const metrics = result.integrity;
        const items = [
            ...metrics.verdict_critical_miss.reasons,
            ...metrics.verdict_critical_miss.notes,
            ...metrics.slot_mapping.model.map((issue) => `Model slot: ${issue}`),
            ...metrics.slot_mapping.shown.map((issue) => `Shown slot: ${issue}`),
            ...(metrics.repeated_observations.shown > 0 ? metrics.repeated_observations.examples.map((example) => `Shown repeat: ${example}`) : []),
        ];
        return items.length > 0 ? [`- **${result.fixture_id}**: ${items.join(" ")}`] : [];
    });
    if (details.length > 0) {
        lines.push("<details>");
        lines.push("<summary>Integrity details</summary>");
        lines.push("");
        lines.push(...details);
        lines.push("</details>");
        lines.push("");
    }
    return lines;
}

function retestSection(run: EvalRunOutput): string[] {
    if (run.metadata.execution_mode === "dry_run") return [];
    const retest = scoreTestRetest(run.results);
    const lines: string[] = ["## Score Test-Retest", ""];
    if (retest.length === 0) {
        lines.push("Each fixture was generated once, so test-retest was not measured. Use `--repeat <n>`, or replay several saved runs of the same fixtures together.");
        lines.push("");
        return lines;
    }
    lines.push("| Fixture | Scores | Range | Mean | SD |");
    lines.push("|:--------|:-------|:------|:-----|:---|");
    for (const item of retest) {
        const note = item.unvalidated > 0 ? ` (${item.unvalidated} from reports that failed validation)` : "";
        lines.push(`| ${item.fixture_id} | ${item.scores.join(", ")}${note} | ${item.range} | ${item.mean} | ${item.sd} |`);
    }
    lines.push("");
    return lines;
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

function generateDiffReport(
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
    const isDryRun = run.metadata.execution_mode === "dry_run";
    console.log("");
    console.log("========================================");
    console.log(isDryRun ? "   PROMPTOPS FIXTURE VALIDATION REPORT  " : "       PROMPTOPS LIVE EVAL REPORT       ");
    console.log("========================================");
    console.log("");
    console.log(`Tier: ${run.metadata.tier}`);
    console.log(`Fixtures: ${run.summary.total}`);
    console.log(`Mode: ${isDryRun ? "dry run; no model calls" : "live model evaluation"}`);
    console.log(`Cost: $${run.metadata.actual_cost_usd.toFixed(6)} (from returned token usage)`);
    if (!isDryRun) {
        console.log(`Tokens: ${run.metadata.token_usage.prompt_tokens} input, ${run.metadata.token_usage.completion_tokens} output, ${run.metadata.token_usage.reasoning_tokens || 0} reasoning`);
    }
    console.log("");
    console.log(`${isDryRun ? "VALIDATED" : "✅ PASS"}: ${run.summary.passed}`);
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

    if (measured(run).length > 0) {
        const summary = integritySummary(run);
        console.log("REPORT INTEGRITY (reported, not gated; model → shown after the post-generation pass):");
        console.log(`  Rewrites: ${summary.rewrites} across ${summary.withRewrites}/${summary.reports} reports`);
        console.log(`  Keep/fix collisions: ${summary.collisions.model} → ${summary.collisions.shown} (Critical Miss in Keep: ${summary.criticalMissInKeep.model} → ${summary.criticalMissInKeep.shown})`);
        console.log(`  Repeated observations: ${summary.repeats.model} → ${summary.repeats.shown}`);
        console.log(`  Field-slot mapping issues: ${summary.slots.model} → ${summary.slots.shown}`);
        console.log(`  Critical Miss: ${summary.lineEdits} line edits, ${summary.structural} structural${summary.structuralKinds.length > 0 ? ` (${summary.structuralKinds.join(", ")})` : ""}; ${summary.outranked} reports flag a structural issue the Critical Miss skips`);
        console.log(`  Verdict and Critical Miss: ${summary.mismatches} disagree, ${summary.noConcern} Verdicts raise no concern; ${summary.nothingCritical} reports say nothing is critical; validation dropped the model's first fix in ${summary.criticalMissDropped}`);
        console.log(`  Fix headings: ${summary.headings.over12}/${summary.headings.total} over 12 words (longest ${summary.headings.maxWords}); ${summary.headings.withLocation} open with a location, ${summary.headings.withCondition} carry a condition`);
        const retest = scoreTestRetest(run.results);
        console.log(retest.length > 0
            ? `  Score test-retest: ${retest.map((item) => `${item.fixture_id} ${item.scores.join("/")} (range ${item.range})`).join("; ")}`
            : "  Score test-retest: not measured (each fixture ran once)");
        console.log("");
    }

    console.log("========================================");
}
