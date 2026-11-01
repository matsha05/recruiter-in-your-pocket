/**
 * Eval for the guarded polish of a revised line (prompts/revise_line_v1.txt).
 *
 * Cases: the Critical Miss of each of the 13 saved production-prompt outputs, with realistic answers
 * (the ones in tests/revised-line.test.ts) and with adversarial answers that tempt embellishment. Each
 * case asks the model once; the guard is then applied strict (production) and with joining words.
 *
 *   Mock (no cost):  USE_MOCK_OPENAI=1 node scripts/run-ts-test.cjs scripts/eval-revise-line.ts
 *   Paid (cap $5):   RIYP_ALLOW_PAID_EVALS=true OPENAI_API_KEY=... node scripts/run-ts-test.cjs scripts/eval-revise-line.ts
 *
 * Writes tests/fixtures/results/summary_revise_line_<date>.md and a raw *_run.json (gitignored).
 */

import fs from "node:fs";
import path from "node:path";
import { calculateCostUsd, normalizeTokenUsage } from "../lib/llm/cost";
import { resolveOpenAIModel } from "../lib/llm/model-config";
import { REVISE_LINE_PROMPT_SHA256, REVISE_LINE_PROMPT_VERSION } from "../lib/llm/revise-line-model";
import { reconcileReport } from "../lib/reports/report-integrity";
import { composeRevisedLine, liftQuestions, liftSourceLine } from "../lib/reports/revised-line";
import { checkPolishedLine } from "../lib/reports/revised-line-polish";
import { polishRevisedLine, type PolishOutcome } from "../lib/reports/revised-line-polish-service";

const BUDGET_USD = 5;
const mock = ["1", "true"].includes(String(process.env.USE_MOCK_OPENAI || "").toLowerCase());
const paidAllowed = process.env.RIYP_ALLOW_PAID_EVALS === "true" && Boolean(process.env.OPENAI_API_KEY);
if (!mock && !paidAllowed) {
  console.error("Refusing to call a paid model: set RIYP_ALLOW_PAID_EVALS=true and OPENAI_API_KEY, or USE_MOCK_OPENAI=1.");
  process.exit(1);
}

const outputs = JSON.parse(fs.readFileSync(path.join(process.cwd(), "tests/fixtures/report-integrity/live-outputs-83b2a2d1.json"), "utf8"));
const golden = path.join(process.cwd(), "..", "tests/resumes/golden");
const goldenFiles = fs.readdirSync(golden);

// Answers a candidate might type (fictional), matched to each Critical Miss's questions.
const realistic: Record<string, string[]> = {
  synth_data_scientist_senior_elite_1: ["compared 30-day readmissions at 12 partner hospitals against the year before launch"],
  synth_marketing_manager_vp_elite_1: ["moved launch reviews to a single go/no-go gate run by product marketing", "success meant hitting the revenue target within 90 days"],
  synth_software_engineer_mid_strong_1: ["moved the billing service off the monolith", "wrote the data migration scripts and ran the cutover"],
  synth_ux_designer_director_strong_1: ["a color-contrast standard for all text", "product teams checked it in design review before handoff"],
  synth_sales_executive_mid_foundation_1: ["built the pricing pages for 12 enterprise proposals"],
  synth_hr_manager_director_foundation_1: ["screened candidates for engineering and sales and ran onboarding for 40 new hires a year"],
  synth_finance_analyst_senior_weak_1: ["monthly P&L and cash-flow statements", "used by the CFO and 6 regional directors"],
  synth_operations_manager_entry_weak_1: ["delivery logs and weekly stock reports", "the warehouse supervisor and store managers"],
  synth_project_manager_vp_strong_1: ["a vendor delay on the payments integration", "added a second vendor and a two-week buffer"],
  synth_product_manager_entry_elite_1: ["users skipped setup because it asked for data they didn't have", "made setup skippable the top backlog item"],
};
// Answers that tempt the model to embellish: hype, vague scope, an inflated role.
const adversarial: string[][] = [
  ["we crushed it", "a lot of stuff for basically everyone"],
  ["I basically ran the whole thing", "huge impact across the company"],
];

interface Case { id: string; kind: "realistic" | "adversarial"; source: string; answers: string[] }

const cases: Case[] = [];
const seen = new Map<string, number>();
for (const run of outputs.runs) {
  const count = (seen.get(run.fixture_id) || 0) + 1;
  seen.set(run.fixture_id, count);
  const file = goldenFiles.find((name) => name.startsWith(run.fixture_id.replace(/_1$/u, "_")))!;
  const resume = fs.readFileSync(path.join(golden, file), "utf8");
  const integrity = reconcileReport(run.report);
  const miss = integrity.report.top_fixes![0];
  const excerpt = typeof miss.evidence === "string" ? miss.evidence : miss.evidence!.excerpt!;
  const source = liftSourceLine(excerpt, resume).line;
  const asked = Math.max(1, liftQuestions(integrity.fixQuestions[0]).length);
  const id = `${run.fixture_id.replace(/^synth_/u, "").replace(/_1$/u, "")}${count > 1 ? `#${count}` : ""}`;
  cases.push({ id, kind: "realistic", source, answers: realistic[run.fixture_id].slice(0, asked) });
  // Adversarial sets once per resume, not per repeat run.
  if (count === 1) adversarial.forEach((set, index) => cases.push({ id: `${id}~adv${index + 1}`, kind: "adversarial", source, answers: set.slice(0, Math.max(1, asked)) }));
}

const model = mock ? "mock" : resolveOpenAIModel("revise_line");

(async () => {
  const results: Array<Case & { literal: string; result: PolishOutcome; joinersOk: boolean | null; costUsd: number; ms: number }> = [];
  let spent = 0;
  for (const item of cases) {
    if (spent >= BUDGET_USD) {
      console.error(`Stopping: spend reached $${spent.toFixed(2)} of the $${BUDGET_USD} cap.`);
      break;
    }
    const literal = composeRevisedLine(item.source, item.answers.map((value) => ({ kind: "answered" as const, value })))!;
    const started = Date.now();
    const result = await polishRevisedLine({ line: item.source, answers: item.answers, allowJoiners: false });
    const ms = Date.now() - started;
    const usage = "usage" in result ? normalizeTokenUsage(result.usage) : null;
    const costUsd = usage ? calculateCostUsd("model" in result ? result.model : model, usage) ?? 0 : 0;
    spent += costUsd;
    const proposed = result.outcome === "polished" ? result.line : result.outcome === "fallback" ? result.proposed : null;
    const joiners = proposed ? checkPolishedLine({ sourceLine: item.source, answers: item.answers, literal, polished: proposed }, { allowJoiners: true }) : null;
    results.push({ ...item, literal, result, joinersOk: joiners ? joiners.ok : null, costUsd, ms });
    process.stdout.write(result.outcome === "polished" ? "P" : result.outcome === "fallback" ? "f" : "E");
  }
  process.stdout.write("\n");

  const count = (filter: (entry: (typeof results)[number]) => boolean) => results.filter(filter).length;
  const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "n/a");
  const lines: string[] = [];
  const date = new Date().toISOString().slice(0, 10);
  lines.push(`# Revised-line polish eval (${date})`, "");
  lines.push(`- Prompt: \`${REVISE_LINE_PROMPT_VERSION}\` (SHA-256 \`${REVISE_LINE_PROMPT_SHA256}\`)`);
  lines.push(`- Model: \`${model}\` via \`resolveOpenAIModel("revise_line")\`${mock ? " (mock: no model call)" : ""}`);
  const sortedMs = results.map((entry) => entry.ms).sort((a, b) => a - b);
  const percentile = (p: number) => sortedMs.length ? sortedMs[Math.min(sortedMs.length - 1, Math.floor(p * sortedMs.length))] : 0;
  lines.push(`- Reasoning effort: low. Latency per call: median ${(percentile(0.5) / 1000).toFixed(1)}s, 95th percentile ${(percentile(0.95) / 1000).toFixed(1)}s (timeout 10s).`);
  lines.push(`- Cases: ${results.length} (${count((entry) => entry.kind === "realistic")} realistic, ${count((entry) => entry.kind === "adversarial")} adversarial). Cost: $${spent.toFixed(4)} (cap $${BUDGET_USD}).`, "");
  lines.push("| | Realistic | Adversarial | All |", "|:--|--:|--:|--:|");
  for (const [label, filter] of [
    ["Polished (guard passed, strict)", (entry: (typeof results)[number]) => entry.result.outcome === "polished"],
    ["Would pass with joining words", (entry: (typeof results)[number]) => entry.joinersOk === true],
    ["Fell back to the literal line", (entry: (typeof results)[number]) => entry.result.outcome !== "polished"],
    ["Model error or timeout", (entry: (typeof results)[number]) => entry.result.outcome === "error"],
  ] as const) {
    const realisticAll = results.filter((entry) => entry.kind === "realistic");
    const adversarialAll = results.filter((entry) => entry.kind === "adversarial");
    lines.push(`| ${label} | ${pct(realisticAll.filter(filter).length, realisticAll.length)} | ${pct(adversarialAll.filter(filter).length, adversarialAll.length)} | ${pct(results.filter(filter).length, results.length)} |`);
  }
  const reasons = new Map<string, number>();
  for (const entry of results) if (entry.result.outcome !== "polished") reasons.set(entry.result.reason, (reasons.get(entry.result.reason) || 0) + 1);
  lines.push("", "Fallback reasons:", "");
  for (const [reason, value] of [...reasons].sort((a, b) => b[1] - a[1])) lines.push(`- ${reason}: ${value}`);
  lines.push("", "## Before and after (realistic answers)", "");
  for (const entry of results.filter((item) => item.kind === "realistic").slice(0, 10)) {
    const after = entry.result.outcome === "polished" ? entry.result.line : `(kept the literal line: ${entry.result.reason}${"detail" in entry.result ? `, ${entry.result.detail}` : ""})`;
    lines.push(`- **${entry.id}**`, `  - Before: ${entry.literal}`, `  - After: ${after}`);
  }
  lines.push("", "## Adversarial answers", "");
  for (const entry of results.filter((item) => item.kind === "adversarial")) {
    const shown = entry.result.outcome === "polished" ? entry.result.line : entry.literal;
    const proposed = entry.result.outcome === "fallback" ? ` Proposed: "${entry.result.proposed}"` : "";
    lines.push(`- ${entry.id}: ${entry.result.outcome} (${entry.result.reason}). Shown: "${shown}".${proposed}`);
  }

  const dir = path.join(process.cwd(), "..", "tests/fixtures/results");
  const stamp = new Date().toISOString().replace(/[:.]/gu, "-");
  if (!mock) fs.writeFileSync(path.join(dir, `summary_revise_line_${date}.md`), `${lines.join("\n")}\n`);
  fs.writeFileSync(path.join(dir, `revise_line_${mock ? "mock" : "live"}_${stamp}_run.json`), JSON.stringify({ prompt: REVISE_LINE_PROMPT_VERSION, model, spent, results }, null, 2));
  console.log(lines.join("\n"));
})().catch((error) => { console.error(error); process.exit(1); });
