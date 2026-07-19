/**
 * PromptOps Eval Harness - Batch Runner
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";
import type {
    EvalOptions,
    EvalRunOutput,
    EvalRunMetadata,
    FixtureResult,
    CalibrationData,
    Baseline,
    BaselineFixture,
    Status
} from "./types";
import { runAllChecks } from "./checks";
import { generateMarkdownReport, printSummary } from "./report";
import { runJudge, type JudgeResult } from "./judge";
import { RESUME_REPORT_RESPONSE_FORMAT } from "../llm/response-format";

// ============================================
// COST ESTIMATION
// ============================================

const COST_PER_CALL_USD = 0.025; // Conservative estimate for gpt-4o-mini
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function estimateCost(calls: number): number {
    return calls * COST_PER_CALL_USD;
}

function paidEvalsExplicitlyAllowed(): boolean {
    return TRUE_VALUES.has(String(process.env.RIYP_ALLOW_PAID_EVALS || "").trim().toLowerCase());
}

// ============================================
// RUNNER
// ============================================

export async function runEval(options: EvalOptions): Promise<EvalRunOutput> {
    const startTime = Date.now();
    const runId = `eval_${Date.now()}`;

    console.log(`\n🚀 Starting eval run: ${runId}`);
    console.log(`   Tier: ${options.tier}`);
    console.log(`   Budget: $${options.budgetUsd}`);
    console.log(`   Max calls: ${options.maxCalls}`);
    console.log(`   Concurrency: ${options.concurrency}`);
    console.log(`   Dry run: ${options.dryRun}`);

    // Load calibration data
    const calibrationPath = path.resolve(process.cwd(), "../tests/fixtures/calibration.json");
    if (!existsSync(calibrationPath)) {
        throw new Error(`Calibration file not found: ${calibrationPath}`);
    }

    const calibrationData: CalibrationData = JSON.parse(await readFile(calibrationPath, "utf-8"));
    console.log(`   Loaded ${calibrationData.fixtures.length} fixtures from calibration.json`);

    // Filter fixtures by tier
    let fixtures = calibrationData.fixtures.filter(f => f.tier === options.tier);

    if (options.fixtureFilter) {
        fixtures = fixtures.filter(f =>
            f.id.includes(options.fixtureFilter!) ||
            f.tags.some(t => t.includes(options.fixtureFilter!))
        );
    }

    if (options.limit !== undefined) {
        if (!Number.isInteger(options.limit) || options.limit <= 0) {
            throw new Error("--limit must be a positive integer.");
        }
        fixtures = fixtures.slice(0, options.limit);
    }

    console.log(`   Running ${fixtures.length} fixtures for tier "${options.tier}"`);

    if (!options.dryRun && !paidEvalsExplicitlyAllowed()) {
        throw new Error(
            "Live evaluations are disabled. Set RIYP_ALLOW_PAID_EVALS=true only after approving model spend."
        );
    }

    // Load baseline if provided
    let baseline: Baseline | null = null;
    if (options.baseline) {
        if (existsSync(options.baseline)) {
            baseline = JSON.parse(await readFile(options.baseline, "utf-8"));
            console.log(`   Baseline loaded: ${options.baseline}`);
        } else {
            console.warn(`   ⚠️ Baseline not found: ${options.baseline}`);
        }
    }

    // Check budget
    const estimatedCost = estimateCost(fixtures.length);
    if (estimatedCost > options.budgetUsd) {
        throw new Error(
            `Estimated cost $${estimatedCost.toFixed(2)} exceeds budget $${options.budgetUsd}. ` +
            `Reduce fixtures or increase --budget-usd.`
        );
    }

    if (fixtures.length > options.maxCalls) {
        throw new Error(
            `Fixture count ${fixtures.length} exceeds --max-calls ${options.maxCalls}.`
        );
    }

    // Initialize results
    const results: FixtureResult[] = [];
    let callsMade = 0;
    let actualCost = 0;

    // Process fixtures
    if (options.dryRun) {
        console.log("\n📋 DRY RUN - Validating fixtures without API calls\n");

        for (const fixture of fixtures) {
            const resumePath = path.resolve(process.cwd(), `../tests/resumes/${fixture.path}`);
            const exists = existsSync(resumePath);

            results.push({
                fixture_id: fixture.id,
                status: exists ? "PASS" : "FAIL",
                errors: exists ? [] : [{ code: "E_SCHEMA", message: `Resume file not found: ${fixture.path}` }],
                warnings: [],
                actual_score: 0,
                expected_range: [fixture.expected_score.min, fixture.expected_score.max]
            });

            console.log(`  ${exists ? "✅" : "❌"} ${fixture.id} - ${fixture.path}`);
        }
    } else {
        console.log("\n🔄 Running evaluations...\n");

        // Process in batches for concurrency control
        for (let i = 0; i < fixtures.length; i += options.concurrency) {
            const batch = fixtures.slice(i, i + options.concurrency);

            // Check budget before batch
            if (actualCost + estimateCost(batch.length) > options.budgetUsd) {
                console.error(`\n❌ Budget exceeded. Stopping at ${callsMade} calls.`);
                break;
            }

            const batchResults = await Promise.all(
                batch.map(fixture => processFixture(
                    fixture,
                    calibrationData,
                    baseline,
                    options
                ))
            );

            for (const result of batchResults) {
                results.push(result);
                callsMade++;
                actualCost += COST_PER_CALL_USD;

                const statusIcon = result.status === "PASS" ? "✅" :
                    result.status === "WARN" ? "⚠️" : "❌";
                console.log(`  ${statusIcon} ${result.fixture_id} (score: ${result.actual_score})`);
            }
        }
    }

    // Calculate summary
    const summary = {
        total: results.length,
        passed: results.filter(r => r.status === "PASS").length,
        warned: results.filter(r => r.status === "WARN").length,
        failed: results.filter(r => r.status === "FAIL").length
    };

    // Build metadata
    const metadata: EvalRunMetadata = {
        run_id: runId,
        timestamp: new Date().toISOString(),
        execution_mode: options.dryRun ? "dry_run" : "live",
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0,
        top_p: 1,
        prompt_version_hash: options.promptVersion || "v1",
        contract_version: calibrationData.contract_version,
        tier: options.tier,
        budget_usd: options.budgetUsd,
        actual_cost_usd: actualCost,
        calls_made: callsMade,
        max_calls: options.maxCalls,
        concurrency: options.concurrency,
        baseline_path: options.baseline
    };

    const output: EvalRunOutput = { metadata, summary, results };

    // Save results
    await saveResults(output, options);

    // Print summary
    printSummary(output);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nCompleted in ${duration}s`);

    return output;
}

// ============================================
// FIXTURE PROCESSING
// ============================================

async function processFixture(
    fixture: CalibrationData["fixtures"][0],
    calibrationData: CalibrationData,
    baseline: Baseline | null,
    options: EvalOptions
): Promise<FixtureResult> {
    const resumePath = path.resolve(process.cwd(), `../tests/resumes/${fixture.path}`);

    // Read resume
    let resumeText: string;
    try {
        resumeText = await readFile(resumePath, "utf-8");
    } catch {
        return {
            fixture_id: fixture.id,
            status: "FAIL",
            errors: [{ code: "E_SCHEMA", message: `Resume file not found: ${fixture.path}` }],
            warnings: [],
            actual_score: 0,
            expected_range: [fixture.expected_score.min, fixture.expected_score.max]
        };
    }

    // Call the analysis API
    let output: unknown;
    try {
        output = await callAnalysisAPI(resumeText);
    } catch (err: any) {
        return {
            fixture_id: fixture.id,
            status: "FAIL",
            errors: [{ code: "E_SCHEMA", message: `API call failed: ${err.message}` }],
            warnings: [],
            actual_score: 0,
            expected_range: [fixture.expected_score.min, fixture.expected_score.max]
        };
    }

    // Get baseline for this fixture
    const baselineFixture = baseline?.fixtures?.[fixture.id];

    // Run all checks
    const checkResult = runAllChecks({
        output,
        resumeText,
        fixture,
        baseline: baselineFixture,
        globalBanned: calibrationData.global_banned_phrases,
        globalDiscouraged: calibrationData.global_discouraged_phrases,
        expectedContractVersion: calibrationData.contract_version
    });

    // Determine status
    let status: Status = "PASS";
    if (checkResult.errors.length > 0) {
        status = "FAIL";
    } else if (checkResult.warnings.length > 0) {
        status = "WARN";
    }

    // Extract score and subscores
    const obj = output as Record<string, unknown>;
    const actualScore = typeof obj.score === "number" ? obj.score : 0;
    const subscores = obj.subscores as Record<string, number> | undefined;

    // Calculate drifts
    let scoreDrift: number | undefined;
    let subscoreDrifts: Record<string, number> | undefined;

    if (baselineFixture) {
        scoreDrift = actualScore - baselineFixture.score;

        if (subscores && baselineFixture.subscores) {
            subscoreDrifts = {};
            for (const [key, val] of Object.entries(subscores)) {
                const baseVal = baselineFixture.subscores[key as keyof typeof baselineFixture.subscores];
                if (baseVal !== undefined) {
                    subscoreDrifts[key] = val - baseVal;
                }
            }
        }
    }

    // Extract evidence flags
    const evidenceFlags: Array<{ fix_index: number; issue: string }> = [];
    for (const issue of [...checkResult.errors, ...checkResult.warnings]) {
        if (issue.code === "E_EVIDENCE_NOT_VERBATIM" || issue.code === "W_EVIDENCE_PARAPHRASE") {
            const match = issue.message.match(/Fix (\d+)/);
            if (match) {
                evidenceFlags.push({ fix_index: parseInt(match[1]) - 1, issue: "not_verbatim" });
            }
        }
    }

    const result: FixtureResult = {
        fixture_id: fixture.id,
        status,
        errors: checkResult.errors,
        warnings: checkResult.warnings,
        actual_score: actualScore,
        expected_range: [fixture.expected_score.min, fixture.expected_score.max],
        score_drift: scoreDrift,
        subscores,
        subscore_drifts: subscoreDrifts,
        evidence_flags: evidenceFlags.length > 0 ? evidenceFlags : undefined,
        raw_output: output
    };

    // Run LLM-as-Judge if requested
    if (options.withJudge) {
        try {
            const judgeResult = await runJudge({
                resumeText,
                feedbackOutput: output
            });
            result.judge_result = {
                evidence_score: judgeResult.evidence_score,
                actionability_score: judgeResult.actionability_score,
                tone_score: judgeResult.tone_score,
                methodology_score: judgeResult.methodology_score,
                final_score: judgeResult.final_score
            };
        } catch (err: any) {
            console.warn(`   ⚠️ Judge failed for ${fixture.id}: ${err.message}`);
        }
    }

    return result;
}

// ============================================
// API CALL - Real OpenAI Integration
// ============================================

async function callAnalysisAPI(resumeText: string): Promise<unknown> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY environment variable is required");
    }

    // Load the prompt
    const promptPath = path.resolve(process.cwd(), "prompts/resume_v2.txt");
    let systemPrompt: string;
    try {
        systemPrompt = await readFile(promptPath, "utf-8");
    } catch {
        throw new Error(`Prompt file not found: ${promptPath}`);
    }

    // Add JSON instruction
    const JSON_INSTRUCTION = `
IMPORTANT: You must respond with valid JSON only. No markdown, no code blocks, no extra text.
The response must be a single JSON object matching the schema described above.
Include contract_version: "v2" in your response.
`;

    const messages = [
        { role: "system" as const, content: systemPrompt + JSON_INSTRUCTION },
        { role: "user" as const, content: `Resume Text:\n\n${resumeText}` }
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            temperature: 0,
            response_format: RESUME_REPORT_RESPONSE_FORMAT,
            messages
        })
    });

    if (!res.ok) {
        const textBody = await res.text();
        throw new Error(`OpenAI API error ${res.status}: ${textBody.slice(0, 200)}`);
    }

    const data = await res.json();
    const choice = data?.choices?.[0];
    if (choice?.message?.refusal) {
        throw new Error(`OpenAI refused the report: ${choice.message.refusal}`);
    }
    if (choice?.finish_reason !== "stop") {
        throw new Error(`OpenAI report ended with finish_reason=${choice?.finish_reason || "missing"}`);
    }
    const content = choice?.message?.content;

    if (!content) {
        throw new Error("No content in OpenAI response");
    }

    try {
        return JSON.parse(content);
    } catch {
        throw new Error("Failed to parse OpenAI response as JSON");
    }
}

// ============================================
// SAVE RESULTS
// ============================================

async function saveResults(output: EvalRunOutput, options: EvalOptions): Promise<void> {
    const resultsDir = path.resolve(process.cwd(), "../tests/fixtures/results");

    // Ensure directory exists
    if (!existsSync(resultsDir)) {
        await mkdir(resultsDir, { recursive: true });
    }

    // Save JSON
    const jsonPath = path.join(
        resultsDir,
        `${output.metadata.timestamp.replace(/[:.]/g, "-")}_${output.metadata.execution_mode}_run.json`
    );
    await writeFile(jsonPath, JSON.stringify(output, null, 2));
    console.log(`\n📄 Results saved: ${jsonPath}`);

    // Save markdown summary
    const mdPath = path.join(
        resultsDir,
        output.metadata.execution_mode === "dry_run"
            ? "summary_latest_dry_run.md"
            : "summary_latest_live.md"
    );
    await writeFile(mdPath, generateMarkdownReport(output));
    console.log(`📄 Summary saved: ${mdPath}`);
}
