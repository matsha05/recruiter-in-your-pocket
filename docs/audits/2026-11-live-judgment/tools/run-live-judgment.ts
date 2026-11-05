/**
 * Live judgment run (docs/audits/2026-11-live-judgment.md). Sends synthetic resumes through the same
 * path as /api/resume-feedback: production prompt and model, provider messages, validator, the one repair
 * pass, then the severity check and its merge. Saves one JSON and one text file per run.
 *
 * Paid. Refuses to run unless RIYP_ALLOW_PAID_EVALS=true is on the command. Stops when the next call's
 * worst case would pass --budget-usd. No product code is changed; this only calls it.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { callOpenAIChat, extractJsonFromText } from "@/lib/backend/openai";
import { loadPromptForMode } from "@/lib/backend/prompts";
import { ensureLayoutAndContentFields, validateResumeModelPayload, validateResumeFeedbackRequest } from "@/lib/backend/validation";
import { calculateCostUsd, estimateMaximumCostUsd, normalizeTokenUsage, type TokenUsage } from "@/lib/llm/cost";
import { PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS, resolveOpenAIModel, resolveReasoningEffortForMode, resolveResumeRepairReasoningEffort } from "@/lib/llm/model-config";
import { buildResumeRepairMessages, isRepairableResumeResponseError } from "@/lib/llm/reportRepair";
import { buildResumeProviderMessages } from "@/lib/llm/resume-provider-messages";
import { SEVERITY_CHECK_PROMPT_SHA256 } from "@/lib/llm/severity-check-model";
import { reconcileReport } from "@/lib/reports/report-integrity";
import { criticalCountHeading, readCriticalMisses, withCriticalFirst } from "@/lib/reports/report-presentation";
import { applySeverityCheck } from "@/lib/reports/severity-check-service";
import { getScoreLabel } from "@/lib/score-utils";
import { resolveEffectiveJobDescription } from "@/lib/security/effectiveJobDescription";

type Case = {
  id: string;
  batch: string;
  resume: string;
  job_description?: string;
  /** Overrides --runs for this case. */
  runs?: number;
  note?: string;
};
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
  console.error("Usage: run-live-judgment.cjs --manifest <manifest.json> --batch <name> [--runs n] [--budget-usd n] [--only id] [--concurrency n] [--today YYYY-MM-DD]");
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
  // About 3 characters per token for prompt plus resume, and the production completion ceiling.
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

function fixSummary(fix: any) {
  return {
    fix: fix?.fix ?? null,
    why: fix?.why ?? null,
    excerpt: fix?.evidence?.excerpt ?? (typeof fix?.evidence === "string" ? fix.evidence : null),
    section: fix?.evidence?.section ?? null,
    critical: fix?.critical ?? null,
    confidence: fix?.confidence ?? null,
  };
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
    resume_chars: text.length,
    resume_words: text.split(/\s+/u).filter(Boolean).length,
    job_description_file: testCase.job_description ?? null,
    today,
    model,
    reasoning_effort: effort,
    started_at: new Date(startedAt).toISOString(),
    calls: [] as Usage[],
  };

  // The route's request validation runs before any model call. A refusal here costs nothing.
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
  const { messages, sanitization } = buildResumeProviderMessages({ mode: "resume", systemPrompt, text, effectiveJobDescription });
  const resumeText = sanitization.sanitizedText;
  record.injection_detected = sanitization.injectionDetected;

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
    payload = ensureLayoutAndContentFields(validateResumeModelPayload(parsed, resumeText, effectiveJobDescription.validationOptions));
  } catch (error: any) {
    record.initial_validation_error = { code: error?.code, message: String(error?.message || error).slice(0, 600) };
    if (!isRepairableResumeResponseError(error)) {
      record.outcome = "validation_refused";
      record.cost_usd = sum(record.calls);
      return record;
    }
    const repairMessages = buildResumeRepairMessages(messages, String(data?.choices?.[0]?.message?.content || ""), error);
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
      payload = ensureLayoutAndContentFields(validateResumeModelPayload(parsed, resumeText, effectiveJobDescription.validationOptions));
      record.repaired = true;
    } catch (repairError: any) {
      if (reserved >= repairWorst) settle(repairWorst, null);
      record.outcome = "repair_failed";
      record.repair_error = { code: repairError?.code, message: String(repairError?.message || repairError).slice(0, 600) };
      record.cost_usd = sum(record.calls);
      return record;
    }
  }
  record.validated_report = structuredClone(payload);

  // The severity check, as production runs it (RIYP_SEVERITY_CHECK defaults on).
  const severityWorst = estimateMaximumCostUsd(model, Math.ceil((resumeText.length * 2 + 6000) / 3), PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS) ?? 0.1;
  reserve(severityWorst, `${testCase.id} run ${run} severity`);
  const severity = await applySeverityCheck({ payload, resumeText, validationOptions: effectiveJobDescription.validationOptions, today });
  settle(severityWorst, severity.outcome === "error" ? 0 : severity.cost_usd);
  if (severity.outcome !== "error") calls += 1;
  const { payload: shipped, ...severityMeta } = severity;
  record.severity = severityMeta;
  record.calls.push({ kind: "severity", usage: null, cost_usd: severity.cost_usd, model: severity.model ?? model, latency_ms: severity.call_latency_ms ?? severity.latency_ms });
  record.shipped_report = shipped;

  // What the page shows, in the page's own order.
  const ordered = withCriticalFirst(shipped);
  const misses = readCriticalMisses(ordered);
  const heading = criticalCountHeading(misses);
  let integrity: any = null;
  try {
    const reconciled = reconcileReport(ordered as any);
    integrity = {
      structural_gaps: reconciled.structuralGaps,
      decisions: reconciled.decisions,
      fix_questions: reconciled.fixQuestions,
    };
  } catch (error: any) {
    integrity = { error: String(error?.message || error).slice(0, 300) };
  }
  record.presentation = {
    score: shipped.score,
    band: getScoreLabel(shipped.score),
    score_label_from_model: parsed?.score_label ?? null,
    model_score_before_calibration: parsed?.score ?? null,
    verdict: shipped.first_impression,
    one_line_read: shipped.score_comment_short,
    takeaway: shipped.first_impression_takeaway,
    biggest_gap_example: shipped.biggest_gap_example,
    critical_count: misses,
    heading,
    fixes: (ordered.top_fixes || []).map(fixSummary),
    first_rewrite: shipped.rewrites?.[0] ?? null,
    rewrites_count: Array.isArray(shipped.rewrites) ? shipped.rewrites.length : 0,
    keep: shipped.strengths?.[0] ?? null,
    strengths: shipped.strengths,
    gaps: shipped.gaps,
    next_steps: shipped.next_steps,
    seniority_read: shipped.job_alignment?.role_fit?.seniority_read ?? null,
    best_fit_roles: shipped.job_alignment?.role_fit?.best_fit_roles ?? null,
    jd_match_score: shipped.job_alignment?.jd_match_score ?? null,
    jd_match_summary: shipped.job_alignment?.jd_match_summary ?? null,
    jd_missing: shipped.job_alignment?.jd_keywords?.missing ?? null,
    positioning: shipped.job_alignment?.positioning_suggestion ?? null,
    severity_added: severityMeta.added,
    severity_promoted: severityMeta.promoted,
    severity_outcome: `${severityMeta.outcome} (${severityMeta.reason})`,
    severity_answer: severityMeta.answer ?? null,
    integrity,
  };
  record.outcome = "report";
  record.cost_usd = sum(record.calls);
  record.latency_ms = Date.now() - startedAt;
  return record;
}

function sum(calls: Array<{ cost_usd: number | null }>) {
  return Math.round(calls.reduce((total, call) => total + (call.cost_usd ?? 0), 0) * 1e8) / 1e8;
}

function renderText(record: Record<string, any>) {
  const p = record.presentation;
  const lines: string[] = [];
  lines.push(`# ${record.case_id}, run ${record.run}`);
  lines.push(`Resume: ${record.resume_file} (${record.resume_words} words, sha256 ${String(record.resume_sha256).slice(0, 12)})${record.job_description_file ? `, posting: ${record.job_description_file}` : ""}`);
  lines.push(`Model: ${record.model}, effort ${record.reasoning_effort}, today ${record.today}; prompt ${String(record.resume_prompt_sha256 || "").slice(0, 8)}, severity prompt ${String(record.severity_prompt_sha256 || "").slice(0, 8)}`);
  lines.push(`Outcome: ${record.outcome}; cost $${Number(record.cost_usd || 0).toFixed(4)}; ${record.repaired ? "repair ran; " : ""}${record.latency_ms ? `${(record.latency_ms / 1000).toFixed(1)}s` : ""}`);
  if (record.note) lines.push(`Case note: ${record.note}`);
  if (record.request_refusal) lines.push(`\nRequest refused before any call: ${record.request_refusal.message} ${JSON.stringify(record.request_refusal.fieldErrors)}`);
  if (record.provider_error) lines.push(`\nProvider error: ${record.provider_error.code} ${record.provider_error.message}`);
  if (record.initial_validation_error) lines.push(`\nValidator refused the first draft: ${record.initial_validation_error.code} ${record.initial_validation_error.message}`);
  if (record.repair_error) lines.push(`Repair failed: ${record.repair_error.code} ${record.repair_error.message}`);
  if (!p) return lines.join("\n") + "\n";
  lines.push("");
  lines.push(`## Band: ${p.band} (score ${p.score}; model wrote ${p.model_score_before_calibration}, label "${p.score_label_from_model}")`);
  lines.push(`## Verdict\n${p.verdict}`);
  lines.push(`One-line read: ${p.one_line_read}`);
  lines.push(`Takeaway: ${p.takeaway}`);
  lines.push(`Biggest gap example: ${p.biggest_gap_example}`);
  lines.push("");
  lines.push(`## Fixes (${p.heading ? p.heading.title : "no count heading"}${p.heading ? `; lead: "${p.heading.lead}"` : ""}); severity ${p.severity_outcome}; added ${JSON.stringify(p.severity_added)}; promoted ${JSON.stringify(p.severity_promoted)}`);
  p.fixes.forEach((fix: any, index: number) => {
    lines.push(`${index + 1}. ${fix.critical === true ? "[Critical Miss] " : fix.critical === false ? "[fix] " : "[unflagged] "}${fix.fix}`);
    lines.push(`   why: ${fix.why}`);
    lines.push(`   excerpt (${fix.section}): "${fix.excerpt}"`);
  });
  if (p.severity_answer) {
    lines.push(`Severity check answer: ${JSON.stringify(p.severity_answer)}`);
  }
  lines.push("");
  lines.push(`## First rewrite${p.rewrites_count ? ` (${p.rewrites_count} shipped)` : " (none shipped)"}`);
  if (p.first_rewrite) {
    lines.push(`original: ${p.first_rewrite.original}`);
    lines.push(`better: ${p.first_rewrite.better}`);
    lines.push(`note: ${p.first_rewrite.enhancement_note}`);
  }
  lines.push("");
  lines.push(`## Keep this one\n${p.keep}`);
  lines.push(`Other strengths: ${JSON.stringify((p.strengths || []).slice(1))}`);
  lines.push(`\n## Gaps\n${(p.gaps || []).map((g: string) => `- ${g}`).join("\n")}`);
  lines.push(`\n## Next steps\n${(p.next_steps || []).map((g: string) => `- ${g}`).join("\n")}`);
  lines.push(`\n## Role fit\nLevel: ${p.seniority_read}\nBest fit: ${JSON.stringify(p.best_fit_roles)}\nPositioning: ${p.positioning}`);
  if (p.jd_match_summary && p.jd_match_summary !== "No job description provided.") {
    lines.push(`\n## Posting\nMatch score: ${p.jd_match_score}\nSummary: ${p.jd_match_summary}\nMissing: ${JSON.stringify(p.jd_missing)}`);
  }
  if (p.integrity) {
    lines.push(`\n## Integrity pass\nStructural gaps surfaced: ${JSON.stringify(p.integrity.structural_gaps)}\nDecisions: ${JSON.stringify(p.integrity.decisions)}`);
  }
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
        ledger.push({ stem, outcome: record.outcome, cost_usd: record.cost_usd, score: record.presentation?.score ?? null, band: record.presentation?.band ?? null, critical: record.presentation?.critical_count?.count ?? null, added: record.presentation?.severity_added ?? null, repaired: record.repaired ?? false });
        console.log(`   ${stem}: ${record.outcome}${record.presentation ? ` score ${record.presentation.score} (${record.presentation.band}), ${record.presentation.critical_count.count} CM, added ${JSON.stringify(record.presentation.severity_added)}` : ""} $${Number(record.cost_usd || 0).toFixed(4)}`);
      });
    }
  }
  console.log(`Batch ${batch}: ${selected.length} cases, ${jobs.length} runs, model ${model} (${effort}), today ${today}, ceiling $${budgetUsd}`);
  await pool(jobs, concurrency);
  const ledgerPath = path.join(outDir, `_ledger_${label}_${new Date().toISOString().replace(/[:.]/gu, "-")}.json`);
  fs.writeFileSync(ledgerPath, JSON.stringify({ batch, model, effort, today, budget_usd: budgetUsd, spent_usd: Math.round(spent * 1e8) / 1e8, calls, runs: ledger }, null, 2));
  console.log(`Spent $${spent.toFixed(4)} in ${calls} calls. Ledger: ${ledgerPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
