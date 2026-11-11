#!/usr/bin/env node
/**
 * Blind pairwise read of two worklist runs on the same synthetic resumes: the shipped prompt's run and a
 * candidate's. For each resume both runs reported on, a different model from the generator's (the Critical
 * Miss judge's, gpt-6.1-sol) reads the resume and the two reports' verdict, write-up and cards, and says
 * which is the better report under docs/evals/worklist-rubric.md. Each pair is read in both side orders;
 * a preference counts only when both orders agree, and anything else is a tie.
 *
 * It reads the folders docs/audits/2026-11-worklist-run/tools/run-worklist.cjs writes.
 *
 * Paid. Refuses to run unless RIYP_ALLOW_PAID_EVALS=true. Synthetic inputs only.
 * The rubric is a draft and this judge is NOT calibrated against Matt's blind picks, so its result is a
 * regression check ("did the candidate get worse?"), never proof that one prompt is better.
 *
 *   RIYP_ALLOW_PAID_EVALS=true node --env-file=.env.local scripts/run-ts-script.cjs \
 *     scripts/judge-worklist-pairs.ts <shipped-dir> <candidate-dir> [--budget-usd 5] [--out file] [--limit n]
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { callJudge, DEFAULT_JUDGE_CONFIG, JudgeBudgetError, SpendLedger } from "../lib/evals/judge/client";

const ROOT = path.resolve(__dirname, "../..");
const RUBRIC_FILE = path.join(ROOT, "docs/evals/worklist-rubric.md");
const MANIFEST_DIR = path.join(ROOT, "docs/audits/2026-11-worklist-run");

type Card = { kind: string; where?: string; line?: string; cannot_tell?: string; example?: string; question?: string };
type Run = {
    case_id: string;
    resume_file: string;
    job_description_file: string | null;
    today: string;
    outcome: string;
    shipped_report?: { verdict: string; write_up: string; cards: Card[] };
};
type Side = "first" | "second";
type Verdict = {
    first_unsupported: string[];
    second_unsupported: string[];
    winner: Side | "no_real_difference";
    strength: "clear" | "slight" | "none";
    deciding: string;
    rationale: string;
};

function rubric() {
    const source = readFileSync(RUBRIC_FILE, "utf8");
    const start = source.indexOf("## The criteria");
    const end = source.indexOf("## Calibration plan");
    if (start < 0 || end < 0) throw new Error("docs/evals/worklist-rubric.md no longer has the sections this judge reads.");
    return source.slice(start, end).trim();
}

const SYSTEM = `You compare two reports written about the same resume. Each report is a recruiter's read: a one-sentence verdict, a short write-up, and one card per line of the resume that needs work. A card quotes the line (or states a structural problem), says what a recruiter can't tell from it, gives the line again with the missing facts as [bracketed blanks], and asks one question that fills the blanks. A "keep" card names a line the rest should read like. An "upgrade" card is optional polish on a strong resume and never counts as work.

You are not told which prompt, model or run wrote either report. Position means nothing.

Judge by this rubric. Ignore its source keys (M5, M1, B, P, R) and skip W7: you are not shown the score.

${rubric()}

Then answer:
- first_unsupported / second_unsupported: each statement that report makes about the resume that the resume doesn't support (the veto, V). Empty when there is none. Quote it.
- winner: "first", "second" or "no_real_difference".
- strength: "clear" when a named rule decides it, "slight" when both are reasonable and it is a judgment call, "none" with no_real_difference.
- deciding: the one criterion that decided it (V, W1, W2, W3, W4, W5, W6), or "none".
- rationale: two sentences at most, naming the lines that decided it.`;

const strings = { type: "array", items: { type: "string" } } as const;
const RESPONSE_FORMAT = {
    type: "json_schema",
    json_schema: {
        name: "riyp_worklist_pairwise_draft_v1",
        strict: true,
        schema: {
            type: "object",
            properties: {
                first_unsupported: strings,
                second_unsupported: strings,
                winner: { type: "string", enum: ["first", "second", "no_real_difference"] },
                strength: { type: "string", enum: ["clear", "slight", "none"] },
                deciding: { type: "string", enum: ["V", "W1", "W2", "W3", "W4", "W5", "W6", "none"] },
                rationale: { type: "string" },
            },
            required: ["first_unsupported", "second_unsupported", "winner", "strength", "deciding", "rationale"],
            additionalProperties: false,
        },
    },
} as const;

function view(report: NonNullable<Run["shipped_report"]>) {
    const cards = report.cards.map((card, index) => {
        const parts = [`Card ${index + 1} (${card.kind})${card.where ? `, ${card.where}` : ""}`];
        if (card.line) parts.push(`Line: "${card.line}"`);
        if (card.cannot_tell) parts.push(`What a recruiter can't tell: ${card.cannot_tell}`);
        if (card.example) parts.push(`Example: ${card.example}`);
        if (card.question) parts.push(`Question: ${card.question}`);
        return parts.join("\n");
    });
    return [`Verdict: ${report.verdict}`, `Write-up:\n${report.write_up}`, cards.length ? cards.join("\n\n") : "(no cards)"].join("\n\n");
}

function load(dir: string) {
    const runs = new Map<string, Run>();
    for (const name of readdirSync(dir).filter((entry) => entry.endsWith("__run1.json")).sort()) {
        const run = JSON.parse(readFileSync(path.join(dir, name), "utf8")) as Run;
        runs.set(run.case_id, run);
    }
    return runs;
}

function flag(name: string) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
    const [shippedDir, candidateDir] = [process.argv[2], process.argv[3]];
    if (!shippedDir || !candidateDir) throw new Error("Usage: judge-worklist-pairs.ts <shipped-dir> <candidate-dir> [--budget-usd n] [--out file] [--limit n]");
    if (process.env.RIYP_ALLOW_PAID_EVALS !== "true") throw new Error("Refusing a paid call: set RIYP_ALLOW_PAID_EVALS=true.");
    const ledger = new SpendLedger(Number(flag("--budget-usd") || 5));
    const out = flag("--out") || path.join(candidateDir, "..", "..", "judged", "worklist-pairs.json");
    const limit = Number(flag("--limit") || 0);
    mkdirSync(path.dirname(out), { recursive: true });

    const shipped = load(shippedDir);
    const candidate = load(candidateDir);
    let ids = [...candidate.keys()].filter((id) => shipped.get(id)?.shipped_report && candidate.get(id)?.shipped_report);
    if (limit > 0) ids = ids.slice(0, limit);
    const skipped = [...candidate.keys()].filter((id) => !ids.includes(id));

    type Row = { case_id: string; result: "candidate" | "shipped" | "tie"; strength: "clear" | "slight" | "none"; orders: Array<{ candidate_is: Side; verdict: Verdict }>; candidate_unsupported: string[]; shipped_unsupported: string[]; error?: string };
    const rows: Row[] = [];

    async function judgeOne(id: string): Promise<Row> {
        const a = shipped.get(id)!;
        const b = candidate.get(id)!;
        const resume = readFileSync(path.resolve(MANIFEST_DIR, b.resume_file), "utf8").trim();
        const posting = b.job_description_file ? readFileSync(path.resolve(MANIFEST_DIR, b.job_description_file), "utf8").trim() : "";
        const orders: Row["orders"] = [];
        for (const candidateIs of ["second", "first"] as Side[]) {
            const first = candidateIs === "first" ? b : a;
            const second = candidateIs === "first" ? a : b;
            const user = [
                `REVIEW DATE: ${b.today}`,
                `RESUME\n${resume}`,
                ...(posting ? [`JOB POSTING THE RESUME WAS READ AGAINST\n${posting}`] : []),
                `FIRST REPORT\n${view(first.shipped_report!)}`,
                `SECOND REPORT\n${view(second.shipped_report!)}`,
            ].join("\n\n=====\n\n");
            const judged = await callJudge<Verdict>(SYSTEM, user, RESPONSE_FORMAT, DEFAULT_JUDGE_CONFIG, ledger);
            orders.push({ candidate_is: candidateIs, verdict: judged.output });
        }
        const picks = orders.map(({ candidate_is, verdict }) =>
            verdict.winner === "no_real_difference" ? "tie" : verdict.winner === candidate_is ? "candidate" : "shipped");
        const result = picks[0] === picks[1] ? (picks[0] as Row["result"]) : "tie";
        const strength = result === "tie" ? "none" : orders.every(({ verdict }) => verdict.strength === "clear") ? "clear" : "slight";
        const unsupported = (who: "candidate" | "shipped") => orders.flatMap(({ candidate_is, verdict }) => {
            const side = who === "candidate" ? candidate_is : candidate_is === "first" ? "second" : "first";
            return side === "first" ? verdict.first_unsupported : verdict.second_unsupported;
        });
        return { case_id: id, result, strength, orders, candidate_unsupported: unsupported("candidate"), shipped_unsupported: unsupported("shipped") };
    }

    const queue = [...ids];
    let stopped = false;
    await Promise.all(Array.from({ length: Number(flag("--concurrency") || 4) }, async () => {
        while (queue.length && !stopped) {
            const id = queue.shift()!;
            try {
                const row = await judgeOne(id);
                rows.push(row);
                console.log(`${id}: ${row.result}${row.strength !== "none" ? ` (${row.strength})` : ""}${row.candidate_unsupported.length ? `, candidate unsupported ×${row.candidate_unsupported.length}` : ""}${row.shipped_unsupported.length ? `, shipped unsupported ×${row.shipped_unsupported.length}` : ""}`);
            } catch (error) {
                if (error instanceof JudgeBudgetError) { stopped = true; console.error(error.message); return; }
                rows.push({ case_id: id, result: "tie", strength: "none", orders: [], candidate_unsupported: [], shipped_unsupported: [], error: (error as Error).message });
                console.error(`${id}: judge error: ${(error as Error).message}`);
            }
        }
    }));
    rows.sort((x, y) => x.case_id.localeCompare(y.case_id));

    const judged = rows.filter((row) => !row.error);
    const count = (test: (row: Row) => boolean) => judged.filter(test).length;
    const totals = {
        compared: judged.length,
        candidate_preferred: count((row) => row.result === "candidate"),
        candidate_clear: count((row) => row.result === "candidate" && row.strength === "clear"),
        shipped_preferred: count((row) => row.result === "shipped"),
        shipped_clear: count((row) => row.result === "shipped" && row.strength === "clear"),
        ties: count((row) => row.result === "tie"),
        // A claim counts only when both side orders flagged that report.
        candidate_reports_flagged_in_both_orders: count((row) => row.orders.every(({ candidate_is, verdict }) => (candidate_is === "first" ? verdict.first_unsupported : verdict.second_unsupported).length > 0)),
        shipped_reports_flagged_in_both_orders: count((row) => row.orders.every(({ candidate_is, verdict }) => (candidate_is === "first" ? verdict.second_unsupported : verdict.first_unsupported).length > 0)),
        errors: rows.length - judged.length,
        not_compared: skipped,
        stopped_on_budget: stopped,
        judge_model: DEFAULT_JUDGE_CONFIG.model,
        judge_calls: ledger.calls,
        judge_cost_usd: Math.round(ledger.spentUsd * 1e6) / 1e6,
        shipped_dir: shippedDir,
        candidate_dir: candidateDir,
    };
    writeFileSync(out, `${JSON.stringify({ totals, rows }, null, 2)}\n`);
    console.log(JSON.stringify(totals, null, 2));
    console.log(`Saved ${out}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
