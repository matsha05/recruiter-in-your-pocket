#!/usr/bin/env npx tsx
/**
 * Critical Miss judge - CLI.
 *
 * Usage (from web/):
 *   npm run eval:judge -- calibrate [--set blind-pick|contrast|all] [--ids bp-01,cp-03] [--repeat 2] [--mode pairwise|absolute]
 *   npm run eval:judge -- score <live_run.json> [--limit 5]
 *   npm run eval:judge -- compare <live_run_X.json> <live_run_Y.json> [--limit 5]
 *   npm run eval:judge -- self-preference [--author gpt-6.1-sol] [--judges gpt-6.1-sol,gpt-6-astra]
 *
 * Common flags: --budget-usd <n> (default 1), --model gpt-6.1-sol|gpt-6-astra,
 * --effort low|medium|high, --seed <n>,
 * --concurrency <n> (default 3), --label <text>, --max-misses <1-3> (score/compare).
 *
 * Only synthetic or fictional resumes are sent to the judge model: run files
 * are filtered to fixtures tagged "synthetic", and everything else is skipped.
 * Every call is paid; the spend ceiling stops the run when it is reached.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { resumeTextFromFixture } from "../lib/evals/fixture-input";
import type { CalibrationData, EvalRunOutput, FixtureResult } from "../lib/evals/types";
import {
    gradePair,
    loadBlindPick,
    loadContrastPairs,
    unverifiedCitations,
    type CalibrationPair,
    type CalibrationRecord,
} from "../lib/evals/judge/calibration";
import { DEFAULT_JUDGE_CONFIG, GENERATOR_MODEL, JUDGE_MODELS, JudgeBudgetError, SpendLedger } from "../lib/evals/judge/client";
import { judgeAbsolute, judgePairwise } from "../lib/evals/judge/modes";
import { JUDGE_PROMPT_VERSION, judgePromptSha256 } from "../lib/evals/judge/prompt";
import { absoluteMarkdown, calibrationMarkdown, compareMarkdown, type RunMeta } from "../lib/evals/judge/report";
import type { AbsoluteResult, CriticalMissView, JudgeCase, JudgeConfig, PairwiseResult } from "../lib/evals/judge/types";
import { authoredShare, writeCriticalMiss } from "../lib/evals/judge/self-preference";
import { isJudgeableFixture, viewFromReport } from "../lib/evals/judge/view";

type Flags = Record<string, string | boolean>;

function parse(argv: string[]) {
    const positional: string[] = [];
    const flags: Flags = {};
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (!arg.startsWith("--")) {
            positional.push(arg);
            continue;
        }
        const name = arg.slice(2);
        const next = argv[i + 1];
        if (next === undefined || next.startsWith("--")) flags[name] = true;
        else {
            flags[name] = next;
            i++;
        }
    }
    return { positional, flags };
}

function numberFlag(flags: Flags, name: string, fallback: number) {
    const value = Number(flags[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function judgeConfig(flags: Flags): JudgeConfig {
    const effort = String(flags.effort || DEFAULT_JUDGE_CONFIG.reasoningEffort);
    if (!["low", "medium", "high"].includes(effort)) throw new Error(`Unsupported --effort ${effort}`);
    const seed = flags.seed === undefined ? DEFAULT_JUDGE_CONFIG.seed : Math.floor(Number(flags.seed));
    if (!Number.isFinite(seed)) throw new Error(`Unsupported --seed ${flags.seed}`);
    const model = String(flags.model || DEFAULT_JUDGE_CONFIG.model);
    if (!JUDGE_MODELS.includes(model)) {
        throw new Error(`--model must be one of ${JUDGE_MODELS.join(", ")} (never the generator, ${GENERATOR_MODEL})`);
    }
    return { ...DEFAULT_JUDGE_CONFIG, model, reasoningEffort: effort as JudgeConfig["reasoningEffort"], seed };
}

async function pool<T, R>(items: T[], concurrency: number, work: (item: T) => Promise<R>): Promise<Array<R | Error>> {
    const results: Array<R | Error> = new Array(items.length);
    let next = 0;
    async function worker() {
        while (next < items.length) {
            const index = next++;
            try {
                results[index] = await work(items[index]);
            } catch (error) {
                results[index] = error instanceof Error ? error : new Error(String(error));
                if (error instanceof JudgeBudgetError) next = items.length;
            }
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
    return results;
}

function outputPaths(command: string, label?: string) {
    const dir = path.resolve(process.cwd(), "../tests/fixtures/results/judge");
    mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const base = path.join(dir, `${stamp}_${command}${label ? `_${label.replace(/[^a-z0-9_-]+/gi, "-")}` : ""}`);
    return { json: `${base}.json`, md: `${base}.md` };
}

function meta(title: string, cfg: JudgeConfig, ledger: SpendLedger): RunMeta {
    return {
        title,
        timestamp: new Date().toISOString(),
        model: cfg.model,
        reasoning_effort: cfg.reasoningEffort,
        seed: cfg.seed,
        judge_prompt_sha256: judgePromptSha256(),
        calls: ledger.calls,
        cost_usd: ledger.spentUsd,
    };
}

function save(command: string, flags: Flags, json: unknown, markdown: string) {
    const out = outputPaths(command, typeof flags.label === "string" ? flags.label : undefined);
    writeFileSync(out.json, `${JSON.stringify(json, null, 2)}\n`);
    writeFileSync(out.md, markdown);
    console.log(`\nSaved ${path.relative(process.cwd(), out.json)}\nSaved ${path.relative(process.cwd(), out.md)}`);
}

function reportErrors(errors: Error[]) {
    for (const error of errors) console.error(`   ! ${error.message}`);
}

// ============================================
// CALIBRATE
// ============================================

async function calibrate(flags: Flags) {
    const cfg = judgeConfig(flags);
    const ledger = new SpendLedger(numberFlag(flags, "budget-usd", 1));
    const set = String(flags.set || "all");
    let pairs: CalibrationPair[] = [
        ...(set === "all" || set === "blind-pick" ? loadBlindPick() : []),
        ...(set === "all" || set === "contrast" ? loadContrastPairs() : []),
    ];
    if (typeof flags.ids === "string") {
        const ids = new Set(flags.ids.split(","));
        pairs = pairs.filter((pair) => ids.has(pair.id));
    }
    for (const pair of pairs) {
        const bad = unverifiedCitations(pair);
        if (bad.length) throw new Error(`${pair.id} cites lines that aren't in its resume: ${bad.join(" | ")}`);
    }
    const repeat = Math.max(1, Math.floor(numberFlag(flags, "repeat", 1)));
    const mode = String(flags.mode || "pairwise");
    console.log(`Calibrating ${pairs.length} pairs × ${repeat} (${mode}) on ${cfg.model}, ceiling $${ledger.ceilingUsd}`);

    if (mode === "absolute") {
        const tasks = pairs.flatMap((pair) => (["X", "Y"] as const).map((side) => ({ pair, side })));
        const results = await pool(tasks, numberFlag(flags, "concurrency", 3), async ({ pair, side }) => {
            const result = await judgeAbsolute(pair.input, pair.views[side], { config: cfg, ledger });
            console.log(`   ${pair.id} ${side === "X" ? "A" : "B"}: overall ${result.overall}${result.veto ? " (veto)" : ""}`);
            return { label: `${pair.id} ${side === "X" ? "A" : "B"}`, pair: pair.id, side, expected: pair.expected, result };
        });
        reportErrors(results.filter((r): r is Error => r instanceof Error));
        const rows = results.filter((r): r is Exclude<typeof r, Error> => !(r instanceof Error));
        save("calibrate-absolute", flags, { meta: meta("Critical Miss judge: absolute calibration", cfg, ledger), rows },
            absoluteMarkdown(meta("Critical Miss judge: absolute calibration", cfg, ledger), rows));
        return;
    }

    const tasks = Array.from({ length: repeat }, (_, run) => pairs.map((pair) => ({ pair, run }))).flat();
    const results = await pool(tasks, numberFlag(flags, "concurrency", 3), async ({ pair, run }) => {
        const result = await judgePairwise(pair.input, pair.views, { config: cfg, ledger });
        const grade = gradePair(pair.expected, result);
        console.log(`   ${pair.set}:${pair.id} run ${run + 1}: ${result.winner}${result.winner === "tie" ? "" : ` ${result.strength}`} (expected ${pair.expected}) → ${grade}`);
        const { input, views, ...rest } = pair;
        const record: CalibrationRecord = { pair: { ...rest, resume_chars: input.resume_text.length }, repeat: run, result, grade };
        return record;
    });
    reportErrors(results.filter((r): r is Error => r instanceof Error));
    const records = results.filter((r): r is CalibrationRecord => !(r instanceof Error));
    const runMeta = meta("Critical Miss judge: pairwise calibration", cfg, ledger);
    save("calibrate", flags, { meta: runMeta, judge_prompt_version: JUDGE_PROMPT_VERSION, records }, calibrationMarkdown(runMeta, records));
}

// ============================================
// LIVE RUN FILES
// ============================================

interface RunCase {
    fixture_id: string;
    input: JudgeCase;
    view: CriticalMissView;
}

function loadCalibrationData(): CalibrationData {
    return JSON.parse(readFileSync(path.resolve(process.cwd(), "../tests/fixtures/calibration.json"), "utf8"));
}

/**
 * The first shown report per synthetic fixture, in run order. FAIL results were
 * withheld from customers, so they are skipped like a customer would never see them.
 */
function loadRunCases(file: string, maxMisses: number) {
    const resolved = path.resolve(process.cwd(), file);
    if (!existsSync(resolved)) throw new Error(`Run file not found: ${file}`);
    const run = JSON.parse(readFileSync(resolved, "utf8")) as EvalRunOutput;
    const fixtures = new Map(loadCalibrationData().fixtures.map((fixture) => [fixture.id, fixture]));
    const reviewDate = String(run.metadata?.timestamp || new Date().toISOString()).slice(0, 10);
    const cases = new Map<string, RunCase>();
    const skipped: string[] = [];
    for (const result of run.results as FixtureResult[]) {
        if (cases.has(result.fixture_id)) continue;
        const fixture = fixtures.get(result.fixture_id);
        if (!isJudgeableFixture(fixture)) {
            if (!skipped.includes(`${result.fixture_id}: not synthetic`)) skipped.push(`${result.fixture_id}: not synthetic`);
            continue;
        }
        if (result.status === "FAIL") continue;
        const view = viewFromReport(result.model_output ?? result.raw_output, maxMisses);
        if (!view) continue;
        const resumeText = resumeTextFromFixture(readFileSync(path.resolve(process.cwd(), `../tests/resumes/${fixture!.path}`), "utf8"));
        cases.set(result.fixture_id, {
            fixture_id: result.fixture_id,
            input: { id: result.fixture_id, resume_text: resumeText, review_date: reviewDate },
            view,
        });
    }
    return { run, cases, skipped };
}

async function score(file: string, flags: Flags) {
    const cfg = judgeConfig(flags);
    const ledger = new SpendLedger(numberFlag(flags, "budget-usd", 1));
    const { run, cases, skipped } = loadRunCases(file, numberFlag(flags, "max-misses", 1));
    let list = [...cases.values()];
    if (flags.limit) list = list.slice(0, numberFlag(flags, "limit", list.length));
    console.log(`Scoring ${list.length} Critical Misses from ${run.metadata.run_id} on ${cfg.model}, ceiling $${ledger.ceilingUsd}`);
    const results = await pool(list, numberFlag(flags, "concurrency", 3), async (item) => {
        const result: AbsoluteResult = await judgeAbsolute(item.input, item.view, { config: cfg, ledger });
        console.log(`   ${item.fixture_id}: overall ${result.overall}${result.veto ? " (veto)" : ""}`);
        return { label: item.fixture_id, result };
    });
    reportErrors(results.filter((r): r is Error => r instanceof Error));
    const rows = results.filter((r): r is { label: string; result: AbsoluteResult } => !(r instanceof Error));
    const runMeta = meta(`Critical Miss judge: absolute scores for ${run.metadata.run_id}`, cfg, ledger);
    const markdown = `${absoluteMarkdown(runMeta, rows)}${skipped.length ? `Skipped (never sent to the judge): ${skipped.join("; ")}\n` : ""}`;
    save("score", flags, { meta: runMeta, source_run: run.metadata.run_id, source_file: path.basename(file), rows, skipped }, markdown);
}

async function compare(fileX: string, fileY: string, flags: Flags) {
    const cfg = judgeConfig(flags);
    const ledger = new SpendLedger(numberFlag(flags, "budget-usd", 1));
    const maxMisses = numberFlag(flags, "max-misses", 1);
    const x = loadRunCases(fileX, maxMisses);
    const y = loadRunCases(fileY, maxMisses);
    const skipped = [...new Set([...x.skipped, ...y.skipped])];
    let shared = [...x.cases.keys()].filter((id) => y.cases.has(id));
    for (const id of new Set([...x.cases.keys(), ...y.cases.keys()])) {
        if (!shared.includes(id)) skipped.push(`${id}: no shown report in both runs`);
    }
    if (flags.limit) shared = shared.slice(0, numberFlag(flags, "limit", shared.length));
    const names = {
        X: `${x.run.metadata.run_id} (${path.basename(fileX)})`,
        Y: `${y.run.metadata.run_id} (${path.basename(fileY)})`,
    };
    console.log(`Comparing ${shared.length} fixtures: X = ${names.X}, Y = ${names.Y}; ceiling $${ledger.ceilingUsd}`);
    const results = await pool(shared, numberFlag(flags, "concurrency", 3), async (id) => {
        const caseX = x.cases.get(id)!;
        const caseY = y.cases.get(id)!;
        // Both runs read the same fixture; the later run's date is the review date.
        const input = { ...caseX.input, review_date: [caseX.input.review_date, caseY.input.review_date].sort()[1] };
        const result: PairwiseResult = await judgePairwise(input, { X: caseX.view, Y: caseY.view }, { config: cfg, ledger });
        console.log(`   ${id}: ${result.winner}${result.winner === "tie" ? "" : ` ${result.strength}`}`);
        return { fixture_id: id, result };
    });
    reportErrors(results.filter((r): r is Error => r instanceof Error));
    const rows = results.filter((r): r is { fixture_id: string; result: PairwiseResult } => !(r instanceof Error));
    const runMeta = meta("Critical Miss judge: pairwise comparison", cfg, ledger);
    save("compare", flags, { meta: runMeta, names, rows, skipped }, compareMarkdown(runMeta, names, rows, skipped));
}

// ============================================
// SELF-PREFERENCE
// ============================================

async function selfPreference(flags: Flags) {
    const base = judgeConfig(flags);
    const author = judgeConfig({ ...flags, model: String(flags.author || DEFAULT_JUDGE_CONFIG.model) });
    const judges = String(flags.judges || JUDGE_MODELS.join(",")).split(",").map((model) => judgeConfig({ ...flags, model }));
    const ledger = new SpendLedger(numberFlag(flags, "budget-usd", 1));
    const pairs = loadBlindPick();
    console.log(`Self-preference: ${author.model} writes ${pairs.length} Critical Misses; judges ${judges.map((j) => j.model).join(", ")}; ceiling $${ledger.ceilingUsd}`);

    const authored = await pool(pairs, numberFlag(flags, "concurrency", 3), async (pair) => ({
        pair,
        written: await writeCriticalMiss(pair.input, author, ledger),
    }));
    reportErrors(authored.filter((r): r is Error => r instanceof Error));
    const items = authored.filter((r): r is Exclude<typeof r, Error> => !(r instanceof Error));

    const tasks = judges.flatMap((judge) => items.map((item) => ({ judge, item })));
    const judged = await pool(tasks, numberFlag(flags, "concurrency", 3), async ({ judge, item }) => {
        // X = the author model's Critical Miss, Y = the production report's (gpt-6.1-terra).
        const production = item.pair.views[item.pair.production_side!];
        const result = await judgePairwise(item.pair.input, { X: item.written.view, Y: production }, { config: judge, ledger });
        console.log(`   ${judge.model} on ${item.pair.id}: ${result.winner}${result.winner === "tie" ? "" : ` ${result.strength}`}`);
        return { judge: judge.model, id: item.pair.id, result };
    });
    reportErrors(judged.filter((r): r is Error => r instanceof Error));
    const rows = judged.filter((r): r is Exclude<typeof r, Error> => !(r instanceof Error));

    const share = Object.fromEntries(judges.map((judge) => [
        judge.model,
        authoredShare(rows.filter((row) => row.judge === judge.model).map((row) => row.result.winner), "X"),
    ]));
    const others = judges.filter((judge) => judge.model !== author.model);
    const selfPref = others.length ? share[author.model] - others.reduce((sum, judge) => sum + share[judge.model], 0) / others.length : null;
    const runMeta = meta(`Critical Miss judge: self-preference of ${author.model}`, base, ledger);
    const lines = [
        `# ${runMeta.title}`,
        "",
        `- Run: ${runMeta.timestamp}; calls ${ledger.calls}; spend $${ledger.spentUsd.toFixed(4)}`,
        `- Author: \`${author.model}\` wrote a Critical Miss for each of the ${items.length} blind-pick resumes (no rubric). Each was compared with the production report's Critical Miss (\`gpt-6.1-terra\`, prompt 83b2a2d1).`,
        `- Judge prompt SHA-256: \`${runMeta.judge_prompt_sha256}\``,
        "",
        "| Judge | Author's side preferred (win 1, tie 0.5) | Wins / ties / losses |",
        "| --- | --- | --- |",
        ...judges.map((judge) => {
            const mine = rows.filter((row) => row.judge === judge.model).map((row) => row.result.winner);
            return `| ${judge.model}${judge.model === author.model ? " (author)" : ""} | ${share[judge.model].toFixed(2)} | ${mine.filter((w) => w === "X").length} / ${mine.filter((w) => w === "tie").length} / ${mine.filter((w) => w === "Y").length} |`;
        }),
        "",
        selfPref === null ? "" : `Self-preference (author's own judge minus the other judges): **${selfPref >= 0 ? "+" : ""}${selfPref.toFixed(2)}**.`,
        "",
        "| Item | Authored fix | " + judges.map((judge) => judge.model).join(" | ") + " |",
        "| --- | --- | " + judges.map(() => "---").join(" | ") + " |",
        ...items.map((item) => `| ${item.pair.id} | ${item.written.view.misses[0].fix.replace(/\|/g, "/")} | ${judges.map((judge) => {
            const row = rows.find((r) => r.judge === judge.model && r.id === item.pair.id);
            return row ? `${row.result.winner === "X" ? "author" : row.result.winner === "Y" ? "production" : "tie"}${row.result.winner === "tie" ? "" : ` ${row.result.strength}`}` : "error";
        }).join(" | ")} |`),
        "",
    ];
    save("self-preference", flags, { meta: runMeta, author: author.model, share, self_preference: selfPref, authored: items.map((item) => ({ id: item.pair.id, view: item.written.view })), rows }, lines.join("\n"));
}

async function main() {
    const { positional, flags } = parse(process.argv.slice(2));
    const [command, ...files] = positional;
    if (command === "calibrate") return calibrate(flags);
    if (command === "score" && files.length === 1) return score(files[0], flags);
    if (command === "compare" && files.length === 2) return compare(files[0], files[1], flags);
    if (command === "self-preference") return selfPreference(flags);
    console.log("Usage: npm run eval:judge -- calibrate | score <run.json> | compare <runX.json> <runY.json> | self-preference");
    process.exitCode = 1;
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
