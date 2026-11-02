#!/usr/bin/env npx tsx
/**
 * Critical Miss judge - CLI.
 *
 * Usage (from web/):
 *   npm run eval:judge -- calibrate [--set blind-pick|contrast|all|count|key] [--ids bp-01,cp-03] [--repeat 2] [--mode pairwise|absolute] [--key <path>]
 *   npm run eval:judge -- score <live_run.json> [--limit 5]
 *   npm run eval:judge -- compare <production_live_run.json> <candidate_live_run.json> [--key <count-check-key.json>]
 *     (prints the prompt-change gate verdict, count checks included, and exits nonzero on FAIL)
 *   npm run eval:judge -- severity <severity_run.json>
 *     (the severity check's gate: count checks and absolute-mode vetoes on added Critical Misses; exits nonzero on FAIL)
 *   npm run eval:judge -- self-preference [--author gpt-6.1-sol] [--judges gpt-6.1-sol,gpt-6-astra]
 *
 * Common flags: --budget-usd <n> (default 1), --model gpt-6.1-sol|gpt-6-astra,
 * --effort low|medium|high, --seed <n>,
 * --concurrency <n> (default 3), --label <text>, --max-misses <1-3> (score/compare; by
 * default a report shows every flagged Critical Miss, or its first fix when unflagged).
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
import { judgeAbsolute, judgeCount, judgePairwise } from "../lib/evals/judge/modes";
import {
    COUNT_KEY_PATH,
    keyCheckView,
    loadCountCalibration,
    loadCountKey,
    outcomeFor,
    outcomeLine,
    type CountCheckOutcome,
} from "../lib/evals/judge/count";
import { JUDGE_PROMPT_VERSION, judgePromptSha256 } from "../lib/evals/judge/prompt";
import { gateLines, gateVerdict, type GateResume } from "../lib/evals/judge/gate";
import { absoluteMarkdown, calibrationMarkdown, compareMarkdown, countCalibrationMarkdown, type CountCalibrationRow, type RunMeta } from "../lib/evals/judge/report";
import type { AbsoluteResult, CriticalMissView, JudgeCase, JudgeConfig, PairwiseResult } from "../lib/evals/judge/types";
import { authoredShare, writeCriticalMiss } from "../lib/evals/judge/self-preference";
import { isJudgeableFixture, shownView } from "../lib/evals/judge/view";

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

/** --max-misses when given; otherwise undefined, so each report shows what a reader sees. */
function maxMissesFlag(flags: Flags) {
    return flags["max-misses"] === undefined ? undefined : numberFlag(flags, "max-misses", 1);
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
    if (set === "count") return calibrateCount(flags, cfg, ledger);
    if (set === "key") return keyCheck(flags, cfg, ledger);
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

/**
 * The count prompt on hand-labeled fictional reports. Every report gets a blind
 * call (is each Critical Miss critical on its own?); reports on bad resumes also
 * get the keyed call the gate uses (which labeled problem does each address?).
 */
async function calibrateCount(flags: Flags, cfg: JudgeConfig, ledger: SpendLedger) {
    let resumes = loadCountCalibration();
    if (typeof flags.ids === "string") {
        const ids = new Set(flags.ids.split(","));
        resumes = resumes.map((resume) => ({ ...resume, reports: resume.reports.filter((report) => ids.has(report.id) || ids.has(resume.id)) }))
            .filter((resume) => resume.reports.length > 0);
    }
    const repeat = Math.max(1, Math.floor(numberFlag(flags, "repeat", 1)));
    const tasks = Array.from({ length: repeat }, (_, run) => resumes.flatMap((resume) => resume.reports.flatMap((report) => [
        { resume, report, run, keyed: false },
        ...(resume.kind === "bad" ? [{ resume, report, run, keyed: true }] : []),
    ]))).flat();
    console.log(`Calibrating the count prompt: ${tasks.length} calls on ${cfg.model}, ceiling $${ledger.ceilingUsd}`);
    const results = await pool(tasks, numberFlag(flags, "concurrency", 3), async ({ resume, report, run, keyed }): Promise<CountCalibrationRow> => {
        const result = await judgeCount(resume.input, report.view, { config: cfg, ledger }, keyed ? resume.problems : undefined);
        const outcome = outcomeFor({ fixture_id: resume.id, kind: resume.kind, problems: resume.problems }, report.view, result);
        const row: CountCalibrationRow = { resume: resume.id, kind: resume.kind, report, run, keyed, result, outcome };
        console.log(`   ${report.id} ${keyed ? "keyed" : "blind"} run ${run + 1}: ${result.raw.misses.map((miss) => `${miss.critical_on_its_own ? "critical" : "not"}${keyed ? `/${miss.matches}` : ""}`).join(", ")}`);
        return row;
    });
    reportErrors(results.filter((r): r is Error => r instanceof Error));
    const rows = results.filter((r): r is CountCalibrationRow => !(r instanceof Error));
    const runMeta = meta("Critical Miss judge: count calibration", cfg, ledger);
    save("calibrate-count", flags, { meta: runMeta, judge_prompt_version: JUDGE_PROMPT_VERSION, rows }, countCalibrationMarkdown(runMeta, rows));
}

/**
 * Vet a count-check key before gating on it: each bad resume's three labeled
 * problems, shown as one report's Critical Misses, get a blind count call. A
 * label the judge doesn't rate critical on its own would be counted against
 * the candidate by the pairwise half of the gate, so fix it in the key first.
 */
async function keyCheck(flags: Flags, cfg: JudgeConfig, ledger: SpendLedger) {
    const fixtures = new Map(loadCalibrationData().fixtures.map((fixture) => [fixture.id, fixture]));
    const keyPath = countKeyPath(flags);
    const loaded = loadCountKey(keyPath, fixtures, readFixtureResume);
    if (!loaded.key || loaded.errors.length > 0) throw new Error(`The key can't be used:\n${loaded.errors.join("\n")}`);
    const bad = loaded.key.resumes.filter((resume) => resume.kind === "bad");
    console.log(`Key check: ${bad.length} bad resumes from ${path.relative(process.cwd(), keyPath)} on ${cfg.model}, ceiling $${ledger.ceilingUsd}`);
    const results = await pool(bad, numberFlag(flags, "concurrency", 3), async (resume) => {
        const fixture = fixtures.get(resume.fixture_id)!;
        const input = { id: resume.fixture_id, resume_text: readFixtureResume(fixture), review_date: String(loaded.key!.date || new Date().toISOString()).slice(0, 10) };
        const result = await judgeCount(input, keyCheckView(resume), { config: cfg, ledger });
        const rows = resume.problems.map((problem, index) => ({ fixture_id: resume.fixture_id, id: problem.id, kind: (problem as { kind?: string }).kind || "", problem: problem.problem, critical: result.raw.misses[index].critical_on_its_own, note: result.raw.misses[index].note }));
        for (const row of rows) console.log(`   ${row.fixture_id} ${row.id}: ${row.critical ? "critical" : "NOT critical on its own"}`);
        return rows;
    });
    reportErrors(results.filter((r): r is Error => r instanceof Error));
    const rows = results.filter((r): r is Exclude<typeof r, Error> => !(r instanceof Error)).flat();
    const disputed = rows.filter((row) => !row.critical);
    const runMeta = meta("Critical Miss judge: key check", cfg, ledger);
    const lines = [
        `# ${runMeta.title}`,
        "",
        `- Run: ${runMeta.timestamp}; calls ${ledger.calls}; spend $${ledger.spentUsd.toFixed(4)}`,
        `- Key: \`${path.relative(path.resolve(process.cwd(), ".."), keyPath)}\``,
        `- Judge prompt SHA-256: \`${runMeta.judge_prompt_sha256}\``,
        `- Labeled problems the blind judge rates critical on their own: ${rows.length - disputed.length} of ${rows.length}`,
        "",
        "| Resume | Problem | Kind | Blind judge | Note |",
        "| --- | --- | --- | --- | --- |",
        ...rows.map((row) => `| ${row.fixture_id} | ${row.id} | ${row.kind} | ${row.critical ? "critical" : "**not critical**"} | ${row.note.replace(/\|/g, "/").replace(/\n/g, " ")} |`),
        "",
    ];
    save("key-check", flags, { meta: runMeta, key: path.basename(keyPath), rows }, lines.join("\n"));
    if (disputed.length) process.exitCode = 1;
}

function countKeyPath(flags: Flags) {
    return path.resolve(process.cwd(), "..", String(typeof flags.key === "string" ? flags.key : COUNT_KEY_PATH));
}

// ============================================
// LIVE RUN FILES
// ============================================

interface RunCase {
    fixture_id: string;
    input: JudgeCase;
    view: CriticalMissView;
    /** The saved report, for views other than the one asked for. */
    report: unknown;
}

function loadCalibrationData(): CalibrationData {
    return JSON.parse(readFileSync(path.resolve(process.cwd(), "../tests/fixtures/calibration.json"), "utf8"));
}

function readFixtureResume(fixture: { path: string }) {
    return resumeTextFromFixture(readFileSync(path.resolve(process.cwd(), `../tests/resumes/${fixture.path}`), "utf8"));
}

/**
 * The first shown report per synthetic fixture, in run order. FAIL results were
 * withheld from customers, so they are skipped like a customer would never see them.
 */
function loadRunCases(file: string, maxMisses: number | undefined) {
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
        const report = result.model_output ?? result.raw_output;
        const view = shownView(report, maxMisses);
        if (!view) continue;
        cases.set(result.fixture_id, {
            fixture_id: result.fixture_id,
            input: { id: result.fixture_id, resume_text: readFixtureResume(fixture!), review_date: reviewDate },
            view,
            report,
        });
    }
    return { run, cases, skipped };
}

async function score(file: string, flags: Flags) {
    const cfg = judgeConfig(flags);
    const ledger = new SpendLedger(numberFlag(flags, "budget-usd", 1));
    const { run, cases, skipped } = loadRunCases(file, maxMissesFlag(flags));
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

/**
 * The count checks on the candidate run: one count call per keyed resume, on
 * the Critical Misses a reader sees (whatever --max-misses says). Bad resumes
 * get the keyed call; strong ones the blind call.
 */
async function countChecks(candidate: Map<string, RunCase>, flags: Flags, cfg: JudgeConfig, ledger: SpendLedger) {
    const fixtures = new Map(loadCalibrationData().fixtures.map((fixture) => [fixture.id, fixture]));
    const keyPath = countKeyPath(flags);
    const loaded = loadCountKey(keyPath, fixtures, readFixtureResume);
    if (!loaded.key || loaded.errors.length > 0) return { key_path: keyPath, key_errors: loaded.errors, outcomes: [] as CountCheckOutcome[] };
    console.log(`Count checks: ${loaded.key.resumes.length} keyed resumes from ${path.relative(process.cwd(), keyPath)}`);
    const results = await pool(loaded.key.resumes, numberFlag(flags, "concurrency", 3), async (resume): Promise<CountCheckOutcome> => {
        const found = candidate.get(resume.fixture_id);
        const view = found ? shownView(found.report) : null;
        if (!found || !view) return { fixture_id: resume.fixture_id, kind: resume.kind, pass: false, flagged: 0, problem: "no shown candidate report" };
        try {
            const result = await judgeCount(found.input, view, { config: cfg, ledger }, resume.kind === "bad" ? resume.problems : undefined);
            // On a bad resume, a blind call checks the key's severity: pairwise never sees the key.
            let blind: Awaited<ReturnType<typeof judgeCount>> | undefined;
            let blindError: string | undefined;
            if (resume.kind === "bad") {
                try {
                    blind = await judgeCount(found.input, view, { config: cfg, ledger });
                } catch (error) {
                    blindError = error instanceof Error ? error.message : String(error);
                }
            }
            const outcome = { ...outcomeFor(resume, view, result, blind), ...(blindError ? { blind_error: blindError } : {}) };
            console.log(`   ${outcomeLine(outcome)} → ${outcome.pass ? "pass" : "FAIL"}`);
            return outcome;
        } catch (error) {
            return { fixture_id: resume.fixture_id, kind: resume.kind, pass: false, flagged: view.misses.length, problem: `judge error: ${error instanceof Error ? error.message : String(error)}` };
        }
    });
    const outcomes = results.map((result, index) => result instanceof Error
        ? { fixture_id: loaded.key!.resumes[index].fixture_id, kind: loaded.key!.resumes[index].kind, pass: false, flagged: 0, problem: `judge error: ${result.message}` }
        : result);
    return { key_path: keyPath, key_errors: [] as string[], outcomes };
}

/**
 * Production is X (first file), the candidate is Y (second). Every synthetic
 * fixture with a shown production report is a gate resume; a candidate with no
 * shown report for it counts against the candidate. The count checks run on
 * the candidate's keyed resumes. Prints the gate verdict and exits nonzero on FAIL.
 */
async function compare(fileX: string, fileY: string, flags: Flags) {
    const cfg = judgeConfig(flags);
    const ledger = new SpendLedger(numberFlag(flags, "budget-usd", 1));
    const maxMisses = maxMissesFlag(flags);
    const x = loadRunCases(fileX, maxMisses);
    const y = loadRunCases(fileY, maxMisses);
    const skipped = [...new Set([...x.skipped, ...y.skipped])];
    for (const id of y.cases.keys()) {
        if (!x.cases.has(id)) skipped.push(`${id}: no shown production report`);
    }
    let ids = [...x.cases.keys()];
    const limited = Boolean(flags.limit);
    if (limited) ids = ids.slice(0, numberFlag(flags, "limit", ids.length));
    const names = {
        X: `${x.run.metadata.run_id} (${path.basename(fileX)}; ${x.run.metadata.model}, prompt ${String(x.run.metadata.resume_prompt_sha256 || "").slice(0, 8)})`,
        Y: `${y.run.metadata.run_id} (${path.basename(fileY)}; ${y.run.metadata.model}, prompt ${String(y.run.metadata.resume_prompt_sha256 || "").slice(0, 8)})`,
    };
    console.log(`Comparing ${ids.length} fixtures: X (production) = ${names.X}, Y (candidate) = ${names.Y}; ceiling $${ledger.ceilingUsd}`);
    const resumes = await pool(ids, numberFlag(flags, "concurrency", 3), async (id): Promise<GateResume> => {
        const caseX = x.cases.get(id)!;
        const caseY = y.cases.get(id);
        if (!caseY) return { fixture_id: id, problem: "no shown candidate report" };
        // Both runs read the same fixture; the later run's date is the review date.
        const input = { ...caseX.input, review_date: [caseX.input.review_date, caseY.input.review_date].sort()[1] };
        try {
            const pairwise = await judgePairwise(input, { X: caseX.view, Y: caseY.view }, { config: cfg, ledger });
            const candidate_absolute = await judgeAbsolute(input, caseY.view, { config: cfg, ledger });
            console.log(`   ${id}: ${pairwise.winner}${pairwise.winner === "tie" ? "" : ` ${pairwise.strength}`}${candidate_absolute.veto ? "; candidate veto" : ""}`);
            return { fixture_id: id, pairwise, candidate_absolute };
        } catch (error) {
            return { fixture_id: id, problem: `judge error: ${error instanceof Error ? error.message : String(error)}` };
        }
    });
    const gateResumes = resumes.map((resume, index) => resume instanceof Error
        ? { fixture_id: ids[index], problem: `judge error: ${resume.message}` }
        : resume);
    // A --limit run can't pass anyway, so it skips the count calls.
    const count = limited ? undefined : await countChecks(y.cases, flags, cfg, ledger);
    const verdict = gateVerdict(gateResumes, { limited, count });
    const rows = gateResumes
        .filter((resume): resume is GateResume & { pairwise: PairwiseResult } => Boolean(resume.pairwise))
        .map((resume) => ({ fixture_id: resume.fixture_id, result: resume.pairwise, candidate_absolute: resume.candidate_absolute }));
    const runMeta = meta("Critical Miss judge: pairwise comparison and gate", cfg, ledger);
    save("compare", flags, { meta: runMeta, names, gate: verdict, resumes: gateResumes, count, skipped },
        compareMarkdown(runMeta, names, rows, skipped, gateLines(verdict), count?.outcomes || []));
    console.log(`\n${gateLines(verdict).join("\n")}`);
    if (!verdict.pass) process.exitCode = 1;
}

// ============================================
// SEVERITY CHECK GATE
// ============================================

function normalizedQuote(value: string) {
    return value.toLowerCase().replace(/[“”"‘’']/g, "").replace(/\s+/g, " ").trim();
}

/**
 * The severity check's gate (wave 3). Production's first fix never changes, so the preference bar does
 * not apply. Under-count: every labeled bad resume flags at least 2 of its 3 labeled problems. Over-count:
 * no labeled strong resume gets an added Critical Miss. Vetoes: one absolute-mode call on every report the
 * check extended; a veto counts against the check unless every unsupported claim is quoted from the
 * first fix or the Verdict, which production wrote. Exits nonzero on FAIL.
 */
async function severity(file: string, flags: Flags) {
    const cfg = judgeConfig(flags);
    const ledger = new SpendLedger(numberFlag(flags, "budget-usd", 1));
    const { run, cases, skipped } = loadRunCases(file, undefined);
    const extended = [...cases.values()].filter((item) => item.view.misses.length > 1);
    console.log(`Severity gate on ${run.metadata.run_id}: ${cases.size} judgeable reports, ${extended.length} with added Critical Misses; ceiling $${ledger.ceilingUsd}`);
    const absolute = await pool(extended, numberFlag(flags, "concurrency", 3), async (item) => {
        const result = await judgeAbsolute(item.input, item.view, { config: cfg, ledger });
        const production = normalizedQuote(`${item.view.verdict} ${item.view.misses[0].fix} ${item.view.misses[0].why}`);
        const added = normalizedQuote(item.view.misses.slice(1).map((miss) => `${miss.fix} ${miss.why}`).join(" "));
        const claims = result.raw.unsupported_claims || [];
        const productionOnly = claims.length > 0 && claims.every((claim) => {
            const quote = normalizedQuote(claim.quote);
            return quote && production.includes(quote) && !added.includes(quote);
        });
        const addedVeto = result.veto && !productionOnly;
        console.log(`   ${item.fixture_id}: ${item.view.misses.length} Critical Misses, overall ${result.overall}${result.veto ? (addedVeto ? " (veto on an added Critical Miss)" : " (veto on production's first fix)") : ""}`);
        return { fixture_id: item.fixture_id, misses: item.view.misses.length, more_than_three: Boolean(item.view.more_than_three), added_veto: addedVeto, result };
    });
    reportErrors(absolute.filter((row): row is Error => row instanceof Error));
    const rows = absolute.filter((row): row is Exclude<typeof row, Error> => !(row instanceof Error));
    const count = await countChecks(cases, flags, cfg, ledger);
    // Not gated: on extended reports outside the key, does the blind count call rate each added Critical Miss critical on its own?
    const keyed = new Set(count.outcomes.map((outcome) => outcome.fixture_id));
    const unkeyed = await pool(extended.filter((item) => !keyed.has(item.fixture_id)), numberFlag(flags, "concurrency", 3), async (item) => {
        const blind = await judgeCount(item.input, item.view, { config: cfg, ledger });
        const added = blind.raw.misses.filter((miss) => miss.number > 1);
        return { fixture_id: item.fixture_id, added: added.length, not_critical: added.filter((miss) => !miss.critical_on_its_own).map((miss) => ({ number: miss.number, note: miss.note })) };
    });
    reportErrors(unkeyed.filter((row): row is Error => row instanceof Error));
    const blindRows = unkeyed.filter((row): row is Exclude<typeof row, Error> => !(row instanceof Error));
    const blindAdded = blindRows.reduce((total, row) => total + row.added, 0);
    const blindPadding = blindRows.reduce((total, row) => total + row.not_critical.length, 0);
    const bad = count.outcomes.filter((outcome) => outcome.kind === "bad");
    const strong = count.outcomes.filter((outcome) => outcome.kind === "strong");
    // Stricter than the prompt-change gate: a strong resume passes only with exactly one Critical Miss.
    const strongPass = (outcome: CountCheckOutcome) => !outcome.problem && outcome.flagged === 1 && !outcome.more_than_three;
    const addedVetoes = rows.filter((row) => row.added_veto);
    const failures = [
        ...(count.key_errors.length ? [`count key errors: ${count.key_errors.join("; ")}`] : []),
        ...(bad.length !== 8 ? [`${bad.length} labeled bad resumes judged, expected 8`] : []),
        ...(strong.length !== 4 ? [`${strong.length} labeled strong resumes judged, expected 4`] : []),
        ...bad.filter((outcome) => !outcome.pass).map((outcome) => `under-count: ${outcomeLine(outcome)}`),
        ...strong.filter((outcome) => !strongPass(outcome)).map((outcome) => `over-count: ${outcomeLine(outcome)}`),
        ...addedVetoes.map((row) => `veto on an added Critical Miss: ${row.fixture_id}`),
        ...(absolute.length !== rows.length ? [`${absolute.length - rows.length} absolute calls failed`] : []),
    ];
    const pass = failures.length === 0;
    const lines = [
        `## SEVERITY GATE: ${pass ? "PASS" : "FAIL"}`,
        "",
        `- Under-count, labeled bad resumes: ${bad.filter((outcome) => outcome.pass).length} of ${bad.length} flag at least 2 of 3 labeled problems (bar: all 8)`,
        `- Over-count, labeled strong resumes: ${strong.filter(strongPass).length} of ${strong.length} with no added Critical Miss (bar: all 4)`,
        `- Vetoes on added Critical Misses (absolute mode): ${addedVetoes.length} in ${rows.length} extended reports (bar: 0); vetoes on production's first fix: ${rows.filter((row) => row.result.veto && !row.added_veto).length}`,
        `- Not gated: on ${blindRows.length} extended reports outside the key, the blind count call rates ${blindAdded - blindPadding} of ${blindAdded} added Critical Misses critical on their own`,
        ...failures.map((failure) => `- Fails: ${failure}`),
        "- The smoke and golden no-regression check applies separately.",
    ];
    const runMeta = meta(`Critical Miss judge: severity check gate for ${run.metadata.run_id}`, cfg, ledger);
    const markdown = [
        `# ${runMeta.title}`,
        "",
        `- Run: ${runMeta.timestamp}`,
        `- Judge: \`${cfg.model}\`, reasoning ${cfg.reasoningEffort}, seed ${cfg.seed}`,
        `- Judge prompt SHA-256: \`${runMeta.judge_prompt_sha256}\``,
        `- Calls: ${ledger.calls}; token-calculated spend: $${ledger.spentUsd.toFixed(4)}`,
        `- Source: \`${path.basename(file)}\` (${run.metadata.model}, prompt ${String(run.metadata.resume_prompt_sha256 || "").slice(0, 8)})`,
        "",
        ...lines,
        "",
        "## Count checks",
        "",
        ...count.outcomes.map((outcome) => `- ${outcome.kind}: ${outcomeLine(outcome)} → ${(outcome.kind === "bad" ? outcome.pass : strongPass(outcome)) ? "pass" : "FAIL"}`),
        "",
        "## Absolute mode on extended reports",
        "",
        "| Fixture | Critical Misses | Overall (1-5) | Veto | Unsupported claims | Rationale |",
        "| --- | --- | --- | --- | --- | --- |",
        ...rows.map((row) => `| ${row.fixture_id} | ${row.misses}${row.more_than_three ? " + more" : ""} | ${row.result.overall} | ${row.result.veto ? (row.added_veto ? "**added**" : "first fix") : ""} | ${(row.result.raw.unsupported_claims || []).map((claim) => `"${claim.quote}": ${claim.why}`).join("; ").replace(/\|/g, "/")} | ${String(row.result.raw.rationale || "").replace(/\|/g, "/").replace(/\n/g, " ")} |`),
        "",
        "## Added Critical Misses outside the key (blind count call, not gated)",
        "",
        ...blindRows.map((row) => `- ${row.fixture_id}: ${row.added - row.not_critical.length} of ${row.added} critical on their own${row.not_critical.length ? `; not: ${row.not_critical.map((miss) => `#${miss.number} (${String(miss.note || "").replace(/\n/g, " ")})`).join("; ")}` : ""}`),
        "",
        ...(skipped.length ? [`Skipped (never sent to the judge): ${skipped.join("; ")}`, ""] : []),
    ].join("\n");
    save("severity", flags, { meta: runMeta, source_run: run.metadata.run_id, source_file: path.basename(file), pass, failures, absolute: rows, count, unkeyed_blind: blindRows, skipped }, markdown);
    console.log(`\n${lines.join("\n")}`);
    if (!pass) process.exitCode = 1;
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
    if (command === "severity" && files.length === 1) return severity(files[0], flags);
    if (command === "self-preference") return selfPreference(flags);
    console.log("Usage: npm run eval:judge -- calibrate | score <run.json> | compare <runX.json> <runY.json> | severity <severity_run.json> | self-preference");
    process.exitCode = 1;
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
