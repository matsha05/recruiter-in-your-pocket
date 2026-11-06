#!/usr/bin/env npx tsx
/**
 * Voice judge - CLI. A local check on product copy; it never runs in production.
 *
 * Usage (from web/):
 *   npm run copy:judge -- calibrate [--set <set.json> --ratings <ratings.json>] [--budget-usd 1]
 *     Scores the calibration lines (default: the forty-line tuning set) and reports agreement with the hand
 *     labels. The held-out set is docs/copy/calibration/heldout-2026-11-06.json with heldout-ratings-2026-11-06.json.
 *     --min-kappa <n> and --min-no-caught <share> make it exit nonzero below the bar (the launch gate uses both).
 *   npm run copy:judge -- inventory [--tables home,workspace] [--moments marketing,pricing] [--limit 200] [--budget-usd 4]
 *     Scores the inventory (docs/copy/inventory/inventory.json; run `npm run copy:inventory` first), unique strings only.
 *   npm run copy:judge -- file <strings.json> [--budget-usd 1]
 *     Scores a JSON array of { "text", "moment", "kind"? }: new copy, before a PR.
 *
 * Flags: --dry-run (pattern checks only: no model call, no key, no spend), --out <dir> (default
 * docs/copy/judge for calibrate and inventory; stdout only for file), --label <text>, --model, --effort,
 * --batch <n>, --concurrency <n>.
 *
 * Every model call is paid: it needs RIYP_ALLOW_PAID_EVALS=true and OPENAI_API_KEY, and the spend ceiling
 * (--budget-usd, default 1) stops the run when it is reached. The judge runs on gpt-6.1-sol, never on the
 * report's generator model.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { JudgeBudgetError, SpendLedger } from "../lib/evals/judge/client";
import { agreement, calibrationStrings, loadCalibrationRatings, loadCalibrationSet } from "../lib/evals/voice-judge/calibration";
import { DEFAULT_VOICE_JUDGE_CONFIG, inventoryStrings, judgeStrings } from "../lib/evals/voice-judge/judge";
import { lexicalTics, looksLikeCode } from "../lib/evals/voice-judge/lexical";
import { VOICE_JUDGE_PROMPT_VERSION, voiceJudgePromptSha256 } from "../lib/evals/voice-judge/prompt";
import { calibrationMarkdown, copyRunMarkdown, lexicalMarkdown, type VoiceRunMeta } from "../lib/evals/voice-judge/report";
import type { CopyString, VoiceJudgeConfig } from "../lib/evals/voice-judge/types";

const argv = process.argv.slice(2);
const command = argv[0];
const flag = (name: string) => {
    const index = argv.indexOf(name);
    return index === -1 ? null : argv[index + 1] ?? null;
};
const has = (name: string) => argv.includes(name);
const list = (name: string) => (flag(name) || "").split(",").map((value) => value.trim()).filter(Boolean);

const repoRoot = path.resolve(process.cwd(), "..");
const dryRun = has("--dry-run");
const budgetUsd = Number(flag("--budget-usd") || 1);
const outDir = path.resolve(repoRoot, flag("--out") || "docs/copy/judge");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");

const judgeConfig: VoiceJudgeConfig = {
    ...DEFAULT_VOICE_JUDGE_CONFIG,
    ...(flag("--model") ? { model: flag("--model")! } : {}),
    ...(flag("--effort") ? { reasoningEffort: flag("--effort") as VoiceJudgeConfig["reasoningEffort"] } : {}),
    ...(flag("--batch") ? { batchSize: Number(flag("--batch")) } : {}),
};

function usage(code = 1): never {
    console.error("Usage: npm run copy:judge -- calibrate | inventory [--tables …] [--moments …] | file <strings.json>  [--dry-run] [--budget-usd n]");
    process.exit(code);
}

function requirePaid() {
    if (dryRun) return;
    if (process.env.RIYP_ALLOW_PAID_EVALS !== "true" || !process.env.OPENAI_API_KEY) {
        console.error("Refusing to call a paid model: set RIYP_ALLOW_PAID_EVALS=true and OPENAI_API_KEY, or pass --dry-run for the free pattern checks.");
        process.exit(2);
    }
    if (!Number.isFinite(budgetUsd) || budgetUsd <= 0 || budgetUsd > 5) {
        console.error("--budget-usd must be above 0 and at most 5 (the copy-judge cap in docs/promptops/shipping-gate.md).");
        process.exit(2);
    }
}

function meta(title: string, strings: number, calls: number, costUsd: number, errors: string[], missing: string[]): VoiceRunMeta {
    return {
        title,
        timestamp: new Date().toISOString(),
        model: judgeConfig.model,
        reasoning_effort: judgeConfig.reasoningEffort,
        seed: judgeConfig.seed,
        prompt_version: VOICE_JUDGE_PROMPT_VERSION,
        prompt_sha256: voiceJudgePromptSha256(),
        calls,
        cost_usd: costUsd,
        strings,
        errors,
        missing,
    };
}

function write(name: string, markdown: string, json: unknown) {
    mkdirSync(outDir, { recursive: true });
    const base = path.join(outDir, name);
    writeFileSync(`${base}.md`, markdown);
    writeFileSync(`${base}.json`, JSON.stringify(json, null, 2) + "\n");
    console.log(`Wrote ${path.relative(repoRoot, base)}.md and .json`);
}

const progress = ({ done, total, spent_usd }: { done: number; total: number; spent_usd: number }) =>
    process.stderr.write(`\r  ${done}/${total} strings, $${spent_usd.toFixed(4)}   `);

async function calibrate() {
    const set = flag("--set") ? loadCalibrationSet(flag("--set")!) : loadCalibrationSet();
    const ratings = flag("--ratings") ? loadCalibrationRatings(flag("--ratings")!) : loadCalibrationRatings();
    const items = calibrationStrings(set);
    if (dryRun) {
        for (const item of items) console.log(`${item.id.padEnd(7)} ${lexicalTics(item).join(", ") || "-"}  ${item.text}`);
        return;
    }
    requirePaid();
    const ledger = new SpendLedger(budgetUsd);
    const run = await judgeStrings(items, judgeConfig, ledger, { concurrency: Number(flag("--concurrency") || 3), onProgress: progress });
    process.stderr.write("\n");
    const result = agreement(set, ratings, run.scores);
    const setName = path.basename(flag("--set") || "set-2026-11-06.json", ".json");
    const runMeta = meta(`Voice judge calibration, ${setName}`, items.length, run.calls, run.cost_usd, run.errors, run.missing);
    write(`calibration-${flag("--label") || stamp}`, calibrationMarkdown(runMeta, result, ratings.rated_by), { meta: runMeta, agreement: result, scores: run.scores });
    const minKappa = flag("--min-kappa") ? Number(flag("--min-kappa")) : null;
    const minNoCaught = flag("--min-no-caught") ? Number(flag("--min-no-caught")) : null;
    const noCaughtShare = result.no_catch.labelled_no ? result.no_catch.caught / result.no_catch.labelled_no : 1;
    const misses: string[] = [];
    if (minKappa !== null && result.kappa < minKappa) misses.push(`kappa ${result.kappa.toFixed(2)} is below ${minKappa}`);
    if (minNoCaught !== null && noCaughtShare < minNoCaught) misses.push(`it failed ${result.no_catch.caught} of ${result.no_catch.labelled_no} "no" lines, below ${Math.round(minNoCaught * 100)}%`);
    if (run.errors.length || run.missing.length) misses.push(`${run.errors.length} errors and ${run.missing.length} lines left unjudged`);
    if (misses.length && (minKappa !== null || minNoCaught !== null)) {
        console.error(`Calibration below the bar: ${misses.join("; ")}.`);
        process.exitCode = 1;
    }
    console.log(`Exact ${result.exact}/${result.judged}, us-or-not ${result.us_or_not}/${result.judged}, kappa ${result.kappa.toFixed(2)}; "no" caught ${result.no_catch.caught}/${result.no_catch.labelled_no}, "no" right ${result.no_catch.correct}/${result.no_catch.judge_no}. Spend $${run.cost_usd.toFixed(4)}.`);
}

function inventoryItems(): { items: CopyString[]; tableOf: Map<string, string> } {
    const file = path.join(repoRoot, "docs/copy/inventory/inventory.json");
    if (!existsSync(file)) {
        console.error("No inventory: run `npm run copy:inventory` first.");
        process.exit(2);
    }
    const inventory = JSON.parse(readFileSync(file, "utf8"));
    const tables = new Set(list("--tables"));
    const moments = new Set(list("--moments"));
    const all = inventoryStrings(inventory);
    const tableOf = new Map<string, string>();
    inventory.entries.forEach((entry: { table: string }, index: number) => tableOf.set(`s${index + 1}`, entry.table));
    const seen = new Set<string>();
    const items: CopyString[] = [];
    for (const item of all) {
        if (tables.size && !tables.has(tableOf.get(item.id) || "")) continue;
        if (moments.size && !moments.has(item.moment)) continue;
        if (looksLikeCode(item.text)) continue;
        const key = `${item.moment}\u0000${item.text}`;
        if (seen.has(key)) continue;
        seen.add(key);
        items.push(item);
    }
    const limit = Number(flag("--limit") || 0);
    return { items: limit > 0 ? items.slice(0, limit) : items, tableOf };
}

async function judgeAndWrite(title: string, name: string, items: CopyString[], groupOf: (id: string, where?: string) => string, toStdout = false) {
    if (dryRun) {
        const rows = items
            .map((item) => ({ where: item.where || item.id, text: item.text, tics: lexicalTics(item), group: groupOf(item.id, item.where) }))
            .filter((row) => row.tics.length);
        const markdown = lexicalMarkdown(`${title} (pattern checks)`, rows);
        if (toStdout || !has("--out")) console.log(markdown);
        else write(`${name}-lexical`, markdown, rows);
        console.error(`${rows.length} of ${items.length} strings flagged by the pattern checks. No model call, no spend.`);
        return;
    }
    requirePaid();
    const ledger = new SpendLedger(budgetUsd);
    console.error(`Judging ${items.length} strings in batches of ${judgeConfig.batchSize}, ceiling $${budgetUsd.toFixed(2)}.`);
    const run = await judgeStrings(items, judgeConfig, ledger, { concurrency: Number(flag("--concurrency") || 3), onProgress: progress });
    process.stderr.write("\n");
    const runMeta = meta(title, items.length, run.calls, run.cost_usd, run.errors, run.missing);
    const markdown = copyRunMarkdown(runMeta, run.scores, (score) => groupOf(score.id, score.where));
    if (toStdout) console.log(markdown);
    else write(name, markdown, { meta: runMeta, scores: run.scores });
    const verdicts = run.scores.reduce((acc, score) => ({ ...acc, [score.verdict]: (acc[score.verdict] || 0) + 1 }), {} as Record<string, number>);
    console.error(`us ${verdicts.us || 0}, flat ${verdicts.flat || 0}, no ${verdicts.no || 0}; ${run.calls} calls, $${run.cost_usd.toFixed(4)}.`);
}

async function main() {
    if (command === "calibrate") return calibrate();
    if (command === "inventory") {
        const { items, tableOf } = inventoryItems();
        const label = flag("--label") || (list("--tables").join("-") || "inventory");
        return judgeAndWrite(`Voice judge on the copy inventory: ${label}`, `inventory-${label}-${stamp}`, items, (id) => tableOf.get(id) || "unknown");
    }
    if (command === "file") {
        const file = argv[1];
        if (!file || !existsSync(file)) usage();
        const raw = JSON.parse(readFileSync(file, "utf8"));
        const items: CopyString[] = (Array.isArray(raw) ? raw : raw.strings).map((entry: Partial<CopyString>, index: number) => ({
            id: entry.id || `f${index + 1}`,
            text: String(entry.text || ""),
            moment: entry.moment || "shared",
            kind: entry.kind,
            where: entry.where,
        }));
        return judgeAndWrite(`Voice judge on ${path.basename(file)}`, `file-${path.basename(file, ".json")}-${stamp}`, items, (_id, where) => (where || "").split(":")[0] || "strings", !has("--out"));
    }
    usage();
}

main().catch((error) => {
    if (error instanceof JudgeBudgetError) console.error(error.message);
    else console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
});
