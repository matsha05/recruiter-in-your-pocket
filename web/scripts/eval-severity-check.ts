/**
 * Eval for the severity check (prompts/severity_check_v1.txt).
 *
 * Runs the check on saved resume reports: each shown report (raw_output) of a saved live run, with its
 * fixture's resume. Production's report and first fix are what the source run generated; only the check
 * is new, so its gate is the count checks and absolute-mode vetoes (npm run eval:judge -- severity).
 *
 *   Paid:   RIYP_ALLOW_PAID_EVALS=true OPENAI_API_KEY=... node scripts/run-ts-test.cjs scripts/eval-severity-check.ts \
 *             <saved live_run.json> [--filter <id substring>] [--today 2026-11-01] [--budget-usd 2] [--label name]
 *   Mock:   USE_MOCK_OPENAI=1 node scripts/run-ts-test.cjs scripts/eval-severity-check.ts <saved live_run.json>
 *   Re-score (no cost): --rescore <severity_run.json> settles the saved answers again through the current
 *     validator, so a validator change is measured on the same answers.
 *
 * Writes tests/fixtures/results/<timestamp>_severity_run.json (gitignored) and summary_severity_<label>.md.
 * Each result keeps the source report as pre_severity_output and the check's answer, latency and cost.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { runAllChecks } from "../lib/evals/checks";
import { resumeTextFromFixture } from "../lib/evals/fixture-input";
import { evaluateReportIntegrity } from "../lib/evals/integrity-checks";
import { generateMarkdownReport } from "../lib/evals/report";
import type { ErrorCode, EvalRunOutput, FixtureResult, WarningCode } from "../lib/evals/types";
import { estimateMaximumCostUsd } from "../lib/llm/cost";
import { resolveOpenAIModel } from "../lib/llm/model-config";
import { PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS } from "../lib/llm/model-config";
import { requestSeverityCheck, SEVERITY_CHECK_PROMPT_SHA256, SEVERITY_CHECK_PROMPT_VERSION, severityCheckMessages } from "../lib/llm/severity-check-model";
import { applySeverityCheck, settleSeverityCheck, type SeverityOutcome } from "../lib/reports/severity-check-service";

// run-ts-test.cjs leaves this script's own path in argv.
const args = process.argv.slice(2).filter((value) => !value.endsWith("eval-severity-check.ts"));

function flag(name: string) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

const positional = args.filter((value, index, all) => !value.startsWith("--") && !all[index - 1]?.startsWith("--"));
const rescorePath = flag("--rescore");
const sourcePath = rescorePath || positional[0];
if (!sourcePath) {
  console.error("Usage: eval-severity-check.ts <saved live_run.json> | --rescore <severity_run.json>");
  process.exit(1);
}
const today = flag("--today") || "2026-11-01";
const budgetUsd = Number(flag("--budget-usd") || 2);
const filter = flag("--filter") || "";
const label = (flag("--label") || "severity").replace(/[^a-z0-9_-]/giu, "_");
const mock = ["1", "true"].includes(String(process.env.USE_MOCK_OPENAI || "").toLowerCase());
const paidAllowed = process.env.RIYP_ALLOW_PAID_EVALS === "true" && Boolean(process.env.OPENAI_API_KEY);
if (!rescorePath && !mock && !paidAllowed) {
  console.error("Refusing to call a paid model: set RIYP_ALLOW_PAID_EVALS=true and OPENAI_API_KEY, or USE_MOCK_OPENAI=1.");
  process.exit(1);
}

const root = path.resolve(process.cwd(), "..");
const sourceBytes = fs.readFileSync(path.resolve(process.cwd(), sourcePath));
const source = JSON.parse(sourceBytes.toString("utf8")) as EvalRunOutput & { results: Array<FixtureResult & Record<string, any>> };
const calibration = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/calibration.json"), "utf8"));
const model = resolveOpenAIModel("severity_check");

let spent = 0;
let calls = 0;

async function checkOne(original: FixtureResult & Record<string, any>): Promise<FixtureResult & Record<string, any>> {
  const fixture = calibration.fixtures.find((item: any) => item.id === original.fixture_id);
  if (!fixture) throw new Error(`Missing fixture definition: ${original.fixture_id}`);
  const resumeText = resumeTextFromFixture(fs.readFileSync(path.join(root, "tests/resumes", fixture.path), "utf8"));
  const report = original.pre_severity_output ?? original.raw_output;
  if (!report || original.status === "FAIL" && !original.pre_severity_output) {
    return { ...original, severity_check: { outcome: "skipped", detail: "no shown report in the source run" } };
  }
  let outcome: SeverityOutcome;
  if (rescorePath) {
    const saved = original.severity_check;
    if (!saved?.answer) return original;
    const settled = settleSeverityCheck({ payload: report, answer: saved.answer, resumeText });
    outcome = { ...settled, latency_ms: saved.latency_ms, call_latency_ms: saved.call_latency_ms, cost_usd: saved.cost_usd, model: saved.model, prompt_version: saved.prompt_version };
  } else {
    // Budget for the worst case before each call: the whole prompt uncached and the full completion ceiling.
    const promptChars = severityCheckMessages({ resumeText, report, today }).reduce((total, message) => total + message.content.length, 0);
    const worst = estimateMaximumCostUsd(model, Math.ceil(promptChars / 3), PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS) ?? 0.1;
    if (spent + worst > budgetUsd) {
      return { ...original, severity_check: { outcome: "skipped", detail: `budget: $${spent.toFixed(4)} spent of $${budgetUsd}` } };
    }
    spent += worst;
    calls += 1;
    outcome = await applySeverityCheck({ payload: report, resumeText, today, request: (args) => requestSeverityCheck(args) });
    spent += (outcome.cost_usd ?? worst) - worst;
  }
  const checks = runAllChecks({
    output: outcome.payload,
    resumeText,
    fixture,
    globalBanned: calibration.global_banned_phrases,
    globalDiscouraged: calibration.global_discouraged_phrases,
    expectedContractVersion: calibration.contract_version,
  });
  const errors = checks.errors.map((item) => ({ code: (item.code || "E_SCHEMA") as ErrorCode, message: item.message || "Validation failed" }));
  const warnings = checks.warnings.map((item) => ({ code: (item.code || "W_SPECIFICITY_LOW") as WarningCode, message: item.message || "Review recommended" }));
  const { payload, ...check } = outcome;
  console.log(`   ${original.fixture_id}: ${outcome.outcome} (${outcome.reason}), ${outcome.critical_count} Critical Miss${outcome.critical_count === 1 ? "" : "es"}${outcome.more_critical ? ", more" : ""}, ${outcome.latency_ms} ms`);
  return {
    ...original,
    status: errors.length > 0 ? "FAIL" : warnings.length > 0 ? "WARN" : "PASS",
    errors,
    warnings,
    // The judge reads model_output first: here it is the report a reader sees after the check.
    model_output: payload,
    raw_output: payload,
    source_model_output: original.source_model_output ?? original.model_output,
    pre_severity_output: report,
    integrity: evaluateReportIntegrity(payload),
    severity_check: check,
  };
}

async function pool<T, R>(items: T[], concurrency: number, work: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await work(items[index]);
    }
  }));
  return results;
}

function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

async function main() {
  const selected = source.results.filter((result) => !filter || result.fixture_id.includes(filter));
  console.log(`${rescorePath ? "Re-scoring" : "Checking"} ${selected.length} reports from ${source.metadata.run_id} with ${SEVERITY_CHECK_PROMPT_VERSION}${rescorePath ? "" : `, ceiling $${budgetUsd}`}`);
  const results = await pool(selected, 3, checkOne);
  const checked = results.filter((result) => result.severity_check && result.severity_check.outcome !== "skipped");
  const latencies = checked.map((result) => Number(result.severity_check.latency_ms) || 0);
  const callLatencies = checked.map((result) => Number(result.severity_check.call_latency_ms) || 0);
  const tally = (key: string) => Object.fromEntries([...new Set(checked.map((result) => String(result.severity_check[key])))].map((value) => [value, checked.filter((result) => String(result.severity_check[key]) === value).length]));
  const costUsd = Math.round(checked.reduce((total, result) => total + (Number(result.severity_check.cost_usd) || 0), 0) * 1e8) / 1e8;
  const stamp = new Date().toISOString().replace(/[:.]/gu, "-");
  const output = {
    metadata: {
      ...source.metadata,
      run_id: `${source.metadata.run_id}_severity_${stamp}`,
      timestamp: new Date().toISOString(),
      source_run_sha256: createHash("sha256").update(sourceBytes).digest("hex"),
      source_cost_usd: source.metadata.actual_cost_usd,
      // What this run spent: the severity calls only (the reports came from the source run).
      actual_cost_usd: rescorePath ? 0 : costUsd,
      calls_made: rescorePath ? 0 : calls,
      severity_check: {
        prompt_version: SEVERITY_CHECK_PROMPT_VERSION,
        prompt_sha256: SEVERITY_CHECK_PROMPT_SHA256,
        model,
        today,
        mode: rescorePath ? "rescore" : mock ? "mock" : "live",
        reports: checked.length,
        cost_usd: costUsd,
        latency_ms: { mean: Math.round(latencies.reduce((a, b) => a + b, 0) / Math.max(1, latencies.length)), p50: percentile(latencies, 0.5), p90: percentile(latencies, 0.9), max: Math.max(0, ...latencies) },
        call_latency_ms: { mean: Math.round(callLatencies.reduce((a, b) => a + b, 0) / Math.max(1, callLatencies.length)), p50: percentile(callLatencies, 0.5), p90: percentile(callLatencies, 0.9), max: Math.max(0, ...callLatencies) },
        outcomes: tally("outcome"),
        reasons: tally("reason"),
        critical_counts: tally("critical_count"),
        more_critical: checked.filter((result) => result.severity_check.more_critical === true).length,
      },
    },
    summary: {
      total: results.length,
      passed: results.filter((result) => result.status === "PASS").length,
      warned: results.filter((result) => result.status === "WARN").length,
      failed: results.filter((result) => result.status === "FAIL").length,
    },
    results,
  };
  const resultsDir = path.join(root, "tests/fixtures/results");
  const jsonPath = path.join(resultsDir, `${stamp}_severity_run.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
  const meta = output.metadata.severity_check;
  const rows = results.map((result) => {
    const check = result.severity_check || {};
    const misses = ((result.raw_output as { top_fixes?: any[] } | undefined)?.top_fixes || []).filter((fix) => fix.critical).map((fix) => fix.fix).slice(1);
    return `| ${result.fixture_id} | ${result.status} | ${check.outcome ?? ""} (${check.reason ?? check.detail ?? ""}) | ${check.critical_count ?? ""}${check.more_critical ? " + more" : ""} | ${(check.added || []).join(", ")}${check.promoted?.length ? ` promoted Fix ${check.promoted.map((index: number) => index + 1).join(", Fix ")}` : ""} | ${check.latency_ms ?? ""} | ${misses.join(" / ").replace(/\|/gu, "/")} |`;
  });
  const markdown = [
    generateMarkdownReport(output as unknown as EvalRunOutput),
    "",
    "## Severity check",
    "",
    `- Prompt: \`${meta.prompt_version}\` (SHA-256 \`${meta.prompt_sha256}\`), model \`${meta.model}\`, today ${meta.today}, mode ${meta.mode}`,
    `- Source run: \`${source.metadata.run_id}\` (SHA-256 \`${output.metadata.source_run_sha256}\`)`,
    `- Reports checked: ${meta.reports}; outcomes ${JSON.stringify(meta.outcomes)}; reasons ${JSON.stringify(meta.reasons)}`,
    `- Critical Misses per report: ${JSON.stringify(meta.critical_counts)}; more than three: ${meta.more_critical}`,
    `- Latency (call plus validation), ms: mean ${meta.latency_ms.mean}, p50 ${meta.latency_ms.p50}, p90 ${meta.latency_ms.p90}, max ${meta.latency_ms.max}; the call alone: mean ${meta.call_latency_ms.mean}, p90 ${meta.call_latency_ms.p90}`,
    `- Cost: $${meta.cost_usd.toFixed(8)} in ${output.metadata.calls_made} calls (token-calculated)`,
    "",
    "| Fixture | Status | Outcome | Critical Misses | Added | Latency ms | Added or promoted |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
  const summaryPath = path.join(resultsDir, `summary_severity_${label}.md`);
  fs.writeFileSync(summaryPath, markdown);
  console.log(`Saved ${path.relative(root, jsonPath)} and ${path.relative(root, summaryPath)}`);
  console.log(JSON.stringify({ ...output.summary, severity: meta }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
