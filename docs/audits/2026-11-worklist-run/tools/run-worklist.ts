/**
 * Worklist run (docs/audits/2026-11-worklist-run/): sends synthetic resumes through the same path as
 * /api/resume-feedback with the worklist prompt (RIYP_WORKLIST_REPORT=1): provider messages, the worklist
 * validator, the one repair pass, then the severity check and its card merge. Saves one JSON and one text
 * file per run. The JSON holds the model's drafts and the severity answer, so lib/evals/live-judgment-replay
 * can replay them through a later validator with no model call.
 *
 * Paid. Refuses to run unless RIYP_ALLOW_PAID_EVALS=true is on the command. Stops when the next call's
 * worst case would pass --budget-usd. No product code is changed; this only calls it.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { callOpenAIChat, extractJsonFromText } from "@/lib/backend/openai";
import { loadPromptForMode } from "@/lib/backend/prompts";
import { ensureLayoutAndContentFields, validateResumeFeedbackRequest } from "@/lib/backend/validation";
import { calculateCostUsd, estimateMaximumCostUsd, normalizeTokenUsage, type TokenUsage } from "@/lib/llm/cost";
import { PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS, resolveOpenAIModel, resolveReasoningEffortForMode, resolveResumeRepairReasoningEffort } from "@/lib/llm/model-config";
import { isRepairableResumeResponseError } from "@/lib/llm/reportRepair";
import { buildResumeProviderMessages } from "@/lib/llm/resume-provider-messages";
import { SEVERITY_CHECK_PROMPT_SHA256 } from "@/lib/llm/severity-check-model";
import { validateWorklistPayload } from "@/lib/llm/worklist-validator";
import { buildWorklistRepairMessages } from "@/lib/llm/worklist-repair";
import { blanksOf } from "@/lib/llm/worklist-grounding";
import { isWorklistReportEnabled } from "@/lib/reports/report-shape";
import { applySeverityCheck } from "@/lib/reports/severity-check-service";
import { isSeverityCheckEnabled, isSeverityCheckEnabledForWorklist } from "@/lib/reports/severity-check";
import { getScoreLabel } from "@/lib/score-utils";
import { resolveEffectiveJobDescription } from "@/lib/security/effectiveJobDescription";

type Case = { id: string; batch: string; resume: string; job_description?: string; runs?: number; note?: string };
type Manifest = { cases: Case[] };

const args = process.argv.slice(2);
function flag(name: string) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}
const manifestPath = flag("--manifest");
const batch = flag("--batch");
const only = flag("--only");
const runsDefault = Number(flag("--runs") || 1);
const budgetUsd = Number(flag("--budget-usd") || 1);
const concurrency = Number(flag("--concurrency") || 3);
const outDir = flag("--out") || path.join(path.dirname(manifestPath || "."), "outputs");
const today = flag("--today") || new Date().toISOString().slice(0, 10);
const label = (flag("--label") || batch || "run").replace(/[^a-z0-9_-]/giu, "_");

if (!manifestPath || !batch) {
  console.error("Usage: run-worklist.cjs --manifest <manifest.json> --batch <name> [--runs n] [--budget-usd n] [--only id] [--concurrency n] [--today YYYY-MM-DD] [--out dir]");
  process.exit(1);
}
if (process.env.RIYP_ALLOW_PAID_EVALS !== "true") {
  console.error("Refusing to call a paid model: put RIYP_ALLOW_PAID_EVALS=true on the command.");
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set (web/.env.local).");
  process.exit(1);
}
if (["1", "true"].includes(String(process.env.USE_MOCK_OPENAI || "").toLowerCase())) {
  console.error("USE_MOCK_OPENAI is set; this run needs the real model.");
  process.exit(1);
}
if (!isWorklistReportEnabled()) {
  console.error("RIYP_WORKLIST_REPORT=1 is required: this run measures the worklist prompt.");
  process.exit(1);
}

const manifestDir = path.dirname(path.resolve(manifestPath));
const manifest = JSON.parse(fs.readFileSync(path.resolve(manifestPath), "utf8")) as Manifest;
const selected = manifest.cases.filter((c) => c.batch === batch && (!only || c.id === only));
if (selected.length === 0) {
  console.error(`No cases in batch "${batch}".`);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const sha256 = (value: string) => createHash("sha256").update(value, "utf8").digest("hex");
const model = resolveOpenAIModel("resume");
const effort = resolveReasoningEffortForMode("resume", model);
const severityOn = isSeverityCheckEnabled() && isSeverityCheckEnabledForWorklist();

let spent = 0;
let reserved = 0;
let calls = 0;
const ledger: Array<Record<string, unknown>> = [];

function readInput(file: string) {
  return fs.readFileSync(path.resolve(manifestDir, file), "utf8");
}

type Usage = { usage: TokenUsage | null; cost_usd: number | null; model: string; latency_ms: number };

function usageOf(data: any, startedAt: number): Usage {
  const usage = normalizeTokenUsage(data);
  const responseModel = typeof data?.model === "string" ? data.model : model;
  return { usage, cost_usd: usage ? calculateCostUsd(responseModel, usage) : null, model: responseModel, latency_ms: Date.now() - startedAt };
}

function worstCase(messages: Array<{ content: string }>) {
  const chars = messages.reduce((total, message) => total + message.content.length, 0);
  return estimateMaximumCostUsd(model, Math.ceil(chars / 3), PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS) ?? 0.2;
}

function reserve(amount: number, what: string) {
  if (spent + reserved + amount > budgetUsd) {
    throw Object.assign(new Error(`Budget guard: $${(spent + reserved).toFixed(4)} committed of $${budgetUsd}; ${what} could add $${amount.toFixed(4)}.`), { code: "BUDGET" });
  }
  reserved += amount;
}
function settle(amount: number, actual: number | null) {
  reserved -= amount;
  spent += actual ?? amount;
}
function sum(list: Array<{ cost_usd: number | null }>) {
  return Math.round(list.reduce((total, call) => total + (call.cost_usd ?? 0), 0) * 1e8) / 1e8;
}

async function runOnce(testCase: Case, run: number) {
  const startedAt = Date.now();
  const text = readInput(testCase.resume);
  const jobDescription = testCase.job_description ? readInput(testCase.job_description) : undefined;
  const record: Record<string, any> = {
    case_id: testCase.id,
    batch: testCase.batch,
    run,
    note: testCase.note ?? null,
    resume_file: testCase.resume,
    resume_sha256: sha256(text),
    resume_words: text.split(/\s+/u).filter(Boolean).length,
    job_description_file: testCase.job_description ?? null,
    today,
    model,
    reasoning_effort: effort,
    severity_check: severityOn,
    started_at: new Date(startedAt).toISOString(),
    calls: [] as Usage[],
  };

  const request = validateResumeFeedbackRequest({ text, mode: "resume", ...(jobDescription ? { jobDescription } : {}) });
  if (!request.ok) {
    record.outcome = "request_refused";
    record.request_refusal = { message: request.message, fieldErrors: request.fieldErrors };
    record.cost_usd = 0;
    return record;
  }

  const effectiveJobDescription = resolveEffectiveJobDescription(jobDescription);
  const systemPrompt = await loadPromptForMode("resume");
  record.resume_prompt_sha256 = sha256(systemPrompt.trim());
  record.severity_prompt_sha256 = SEVERITY_CHECK_PROMPT_SHA256;
  const { messages, sanitization } = buildResumeProviderMessages({ mode: "resume", systemPrompt, text, effectiveJobDescription, today });
  const resumeText = sanitization.sanitizedText;
  const validationOptions = { forceGrounding: true, ...effectiveJobDescription.validationOptions };

  const worst = worstCase(messages);
  reserve(worst, `${testCase.id} run ${run}`);
  let data: any;
  let callUsage: Usage;
  try {
    const callStart = Date.now();
    data = await callOpenAIChat(messages, "resume", model);
    callUsage = usageOf(data, callStart);
    calls += 1;
  } catch (error: any) {
    settle(worst, null);
    record.outcome = "provider_error";
    record.provider_error = { code: error?.code, message: String(error?.message || error).slice(0, 500) };
    record.cost_usd = worst;
    return record;
  }
  settle(worst, callUsage.cost_usd);
  record.calls.push({ kind: "report", ...callUsage });

  let parsed: any;
  let payload: any;
  try {
    parsed = extractJsonFromText(data?.choices?.[0]?.message?.content);
    record.model_output = parsed;
    payload = ensureLayoutAndContentFields(validateWorklistPayload(parsed, resumeText, validationOptions));
  } catch (error: any) {
    record.initial_validation_error = { code: error?.code, message: String(error?.message || error).slice(0, 600), issues: error?.internal?.schemaIssues ?? null };
    if (!isRepairableResumeResponseError(error)) {
      record.outcome = "validation_refused";
      record.cost_usd = sum(record.calls);
      return record;
    }
    const repairMessages = buildWorklistRepairMessages(messages, String(data?.choices?.[0]?.message?.content || ""), error);
    const repairWorst = worstCase(repairMessages);
    reserve(repairWorst, `${testCase.id} run ${run} repair`);
    try {
      const callStart = Date.now();
      const repaired = await callOpenAIChat(repairMessages, "resume", model, { reasoningEffort: resolveResumeRepairReasoningEffort(model) });
      const repairUsage = usageOf(repaired, callStart);
      calls += 1;
      settle(repairWorst, repairUsage.cost_usd);
      record.calls.push({ kind: "repair", ...repairUsage });
      parsed = extractJsonFromText(repaired?.choices?.[0]?.message?.content);
      record.model_output_repaired = parsed;
      payload = ensureLayoutAndContentFields(validateWorklistPayload(parsed, resumeText, validationOptions));
      record.repaired = true;
    } catch (repairError: any) {
      if (reserved >= repairWorst) settle(repairWorst, null);
      record.outcome = "repair_failed";
      record.repair_error = { code: repairError?.code, message: String(repairError?.message || repairError).slice(0, 600), issues: repairError?.internal?.schemaIssues ?? null };
      record.cost_usd = sum(record.calls);
      return record;
    }
  }
  record.validated_report = structuredClone(payload);

  let shipped = payload;
  if (severityOn) {
    const severityWorst = estimateMaximumCostUsd(model, Math.ceil((resumeText.length * 2 + 6000) / 3), PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS) ?? 0.1;
    reserve(severityWorst, `${testCase.id} run ${run} severity`);
    const severity = await applySeverityCheck({ payload, resumeText, validationOptions, today });
    settle(severityWorst, severity.outcome === "error" ? 0 : severity.cost_usd);
    if (severity.outcome !== "error") calls += 1;
    const { payload: merged, ...severityMeta } = severity;
    shipped = merged;
    record.severity = severityMeta;
    record.calls.push({ kind: "severity", usage: null, cost_usd: severity.cost_usd, model: severity.model ?? model, latency_ms: severity.call_latency_ms ?? severity.latency_ms });
  }
  record.shipped_report = shipped;

  const cards = Array.isArray(shipped.cards) ? shipped.cards : [];
  record.presentation = {
    score: shipped.score,
    band: getScoreLabel(shipped.score),
    model_score: parsed?.score ?? null,
    lifted_by_employer: shipped.lifted_by_employer === true,
    verdict: shipped.verdict,
    write_up_paragraphs: Array.isArray(shipped.write_up) ? shipped.write_up.length : 0,
    write_up_words: Array.isArray(shipped.write_up) ? shipped.write_up.join(" ").split(/\s+/u).filter(Boolean).length : 0,
    cards: cards.map((card: any) => ({ kind: card.kind, where: card.where, line: card.line, blanks: blanksOf(card.example || "").length, question: card.question })),
    card_count: cards.length,
    kinds: cards.reduce((tally: Record<string, number>, card: any) => ({ ...tally, [card.kind]: (tally[card.kind] || 0) + 1 }), {}),
    structural_from_model: (record.validated_report.cards || []).filter((card: any) => card.kind === "structure" || card.kind === "dates").length,
    severity_added: record.severity?.added ?? [],
    severity_skipped: record.severity?.skipped ?? [],
    severity_outcome: record.severity ? `${record.severity.outcome} (${record.severity.reason})` : "off",
    fit: shipped.fit,
  };
  record.outcome = "report";
  record.cost_usd = sum(record.calls);
  record.latency_ms = Date.now() - startedAt;
  return record;
}

function renderText(record: Record<string, any>) {
  const p = record.presentation;
  const lines: string[] = [];
  lines.push(`# ${record.case_id}, run ${record.run}`);
  lines.push(`Resume: ${record.resume_file} (${record.resume_words} words)${record.job_description_file ? `, posting: ${record.job_description_file}` : ""}`);
  lines.push(`Model: ${record.model}, effort ${record.reasoning_effort}, today ${record.today}; prompt ${String(record.resume_prompt_sha256 || "").slice(0, 8)}; severity check ${record.severity_check ? "on" : "off"}`);
  lines.push(`Outcome: ${record.outcome}; cost $${Number(record.cost_usd || 0).toFixed(4)}; ${record.repaired ? "repair ran; " : ""}${record.latency_ms ? `${(record.latency_ms / 1000).toFixed(1)}s` : ""}`);
  if (record.note) lines.push(`Case note: ${record.note}`);
  if (record.request_refusal) lines.push(`\nRequest refused before any call: ${record.request_refusal.message}`);
  if (record.provider_error) lines.push(`\nProvider error: ${record.provider_error.code} ${record.provider_error.message}`);
  if (record.initial_validation_error) lines.push(`\nValidator refused the first draft: ${record.initial_validation_error.message}`);
  if (record.repair_error) lines.push(`Repair failed: ${record.repair_error.message}`);
  if (!p) return lines.join("\n") + "\n";
  const report = record.shipped_report;
  lines.push("");
  lines.push(`## ${p.band} (score ${p.score}; model wrote ${p.model_score})${p.lifted_by_employer ? "; lifted by employer" : ""}`);
  lines.push(`## Verdict\n${p.verdict}`);
  lines.push("\n## Write-up");
  for (const paragraph of report.write_up || []) lines.push(`${paragraph}\n`);
  lines.push(`## Cards (${p.card_count}; ${JSON.stringify(p.kinds)}); severity ${p.severity_outcome}; added ${JSON.stringify(p.severity_added)}`);
  (report.cards || []).forEach((card: any, index: number) => {
    lines.push(`${index + 1}. [${card.kind}] ${card.where}`);
    lines.push(`   line: "${card.line}"`);
    lines.push(`   can't tell: ${card.cannot_tell}`);
    if (card.example) lines.push(`   example: ${card.example}`);
    if (card.question) lines.push(`   question: ${card.question}`);
  });
  lines.push(`\n## Fit\nRoles: ${JSON.stringify(report.fit?.roles)}\nLevel: ${report.fit?.level}\nNote: ${report.fit?.note}`);
  if (report.fit?.posting?.summary) lines.push(`Posting: ${report.fit.posting.summary}\nMissing: ${JSON.stringify(report.fit.posting.missing)}`);
  return lines.join("\n") + "\n";
}

async function pool<T>(items: Array<() => Promise<T>>, size: number) {
  const results: T[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await items[index]();
    }
  }));
  return results;
}

async function main() {
  const jobs: Array<() => Promise<void>> = [];
  for (const testCase of selected) {
    const runs = testCase.runs ?? runsDefault;
    for (let run = 1; run <= runs; run++) {
      jobs.push(async () => {
        const stem = `${testCase.id}__run${run}`;
        const jsonPath = path.join(outDir, `${stem}.json`);
        if (fs.existsSync(jsonPath)) {
          console.log(`   skip ${stem} (exists)`);
          return;
        }
        let record: Record<string, any>;
        try {
          record = await runOnce(testCase, run);
        } catch (error: any) {
          if (error?.code === "BUDGET") {
            console.error(`   STOP ${stem}: ${error.message}`);
            return;
          }
          record = { case_id: testCase.id, batch: testCase.batch, run, outcome: "runner_error", error: String(error?.stack || error).slice(0, 1200), cost_usd: 0 };
        }
        fs.writeFileSync(jsonPath, JSON.stringify(record, null, 2));
        fs.writeFileSync(path.join(outDir, `${stem}.txt`), renderText(record));
        ledger.push({ stem, outcome: record.outcome, cost_usd: record.cost_usd, score: record.presentation?.score ?? null, band: record.presentation?.band ?? null, cards: record.presentation?.card_count ?? null, structural_from_model: record.presentation?.structural_from_model ?? null, severity_added: record.presentation?.severity_added ?? null, repaired: record.repaired ?? false, refusal: record.initial_validation_error?.message ?? null });
        console.log(`   ${stem}: ${record.outcome}${record.presentation ? ` score ${record.presentation.score} (${record.presentation.band}), ${record.presentation.card_count} cards ${JSON.stringify(record.presentation.kinds)}, severity added ${JSON.stringify(record.presentation.severity_added)}` : ""}${record.repaired ? " [repaired]" : ""} $${Number(record.cost_usd || 0).toFixed(4)}`);
      });
    }
  }
  console.log(`Batch ${batch}: ${selected.length} cases, ${jobs.length} runs, model ${model} (${effort}), today ${today}, severity ${severityOn ? "on" : "off"}, ceiling $${budgetUsd}`);
  await pool(jobs, concurrency);
  const ledgerPath = path.join(outDir, `_ledger_${label}_${new Date().toISOString().replace(/[:.]/gu, "-")}.json`);
  fs.writeFileSync(ledgerPath, JSON.stringify({ batch, model, effort, today, severity_check: severityOn, budget_usd: budgetUsd, spent_usd: Math.round(spent * 1e8) / 1e8, calls, runs: ledger }, null, 2));
  console.log(`Spent $${spent.toFixed(4)} in ${calls} calls. Ledger: ${ledgerPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
