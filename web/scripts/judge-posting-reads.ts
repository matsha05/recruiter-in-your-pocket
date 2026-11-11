#!/usr/bin/env node
/**
 * Judges what a posting read says about a resume and a posting: the "missing" list, the lines to move
 * up ("lead") and the lines to trim. Reads the outputs of scripts/run-posting-reads.ts and asks a
 * different model from the generator's (the Critical Miss judge's, gpt-6.1-sol) one question per item,
 * with the resume and the posting in front of it:
 *
 *   - a lead line: does it answer something the posting asks for?
 *   - a missing item: is it really absent from the resume?
 *   - a trim line: does the posting ask for what it shows?
 *   - and, once per read: a must-have the resume answers plainly that the read never mentions.
 *
 * Paid. Refuses to run unless RIYP_ALLOW_PAID_EVALS=true. Synthetic inputs only.
 * Not calibrated against Matt's reads; nothing here is a launch gate.
 *
 *   RIYP_ALLOW_PAID_EVALS=true node --env-file=.env.local scripts/run-ts-script.cjs \
 *     scripts/judge-posting-reads.ts <outputs-dir> [--budget-usd 1] [--out summary.json]
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { callJudge, DEFAULT_JUDGE_CONFIG, SpendLedger } from "../lib/evals/judge/client";

const INPUTS = path.resolve(__dirname, "../../docs/audits/2026-11-first-read/resumes");

type Move = { line: string; why: string };
type Covered = { requirement: string; line: string };
type Saved = {
    id: string;
    resume: string;
    posting: string | null;
    report: { fit: { posting: { summary: string; missing: string[]; lead?: Move[]; trim?: Move[]; covered?: Covered[] } } };
};

type Verdict = {
    lead: Array<{ number: number; answers: "yes" | "partly" | "no"; requirement: string; note: string }>;
    missing: Array<{ number: number; absent: "yes" | "partly" | "no"; note: string }>;
    trim: Array<{ number: number; posting_asks: "yes" | "no"; note: string }>;
    covered: Array<{ number: number; answers: "yes" | "partly" | "no"; in_posting: "yes" | "no"; note: string }>;
    overlooked: Array<{ requirement: string; resume_line: string }>;
    contradiction: boolean;
    contradiction_note: string;
};

const SYSTEM = `You check one part of a resume report: what it says about a resume against a job posting.

You are given the resume, the posting, and three lists the report wrote:
- MISSING: things the report says the posting asks for and the resume doesn't show.
- MOVE UP: resume lines the report says answer the posting and should sit higher.
- TRIM: resume lines the report says the posting doesn't ask about, to cut first if room is needed.

Judge each item against the resume and the posting only. Be literal and strict.

MOVE UP, per line: does the line answer something the posting asks for?
- "yes": the line shows the thing a named requirement or responsibility asks for.
- "partly": related work, but it shows less than the requirement asks (a neighbouring tool, a smaller scope).
- "no": the posting doesn't ask for what the line shows, or the report misreads the line.
Name the requirement in the posting's words.

MISSING, per item: is it absent from the resume?
- "yes": no line on the resume shows it.
- "partly": the resume touches it but doesn't show what the posting asks.
- "no": a line on the resume plainly shows it, so calling it missing is wrong.

TRIM, per line: does the posting ask for what the line shows? "yes" means trimming it would cost the candidate
something this posting wants. "no" means it is safe to trim for this posting.

COVERED, per row: the report says this resume line answers this requirement of the posting.
- answers "yes": the line shows the main thing the requirement asks for. "partly": related, but it shows less than
  the requirement asks. "no": it only shares a word with the requirement, or the report misreads the line.
- in_posting "yes" when the posting really asks for this requirement, "no" when the report made it up or bent it.

OVERLOOKED: at most two. A requirement the posting states as required that a resume line plainly answers, where
that requirement and that line appear in none of the lists. Leave it empty unless it is plain. A line
already near the top of the latest role is not overlooked.

CONTRADICTION: true when a MISSING item is answered by one of the MOVE UP lines.

Notes are one short sentence each. An empty list gets an empty array.`;

const text = { type: "string" } as const;
const RESPONSE_FORMAT = {
    type: "json_schema",
    json_schema: {
        name: "riyp_posting_read_check_v1",
        strict: true,
        schema: {
            type: "object",
            properties: {
                lead: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            number: { type: "integer" },
                            answers: { type: "string", enum: ["yes", "partly", "no"] },
                            requirement: text,
                            note: text,
                        },
                        required: ["number", "answers", "requirement", "note"],
                        additionalProperties: false,
                    },
                },
                missing: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            number: { type: "integer" },
                            absent: { type: "string", enum: ["yes", "partly", "no"] },
                            note: text,
                        },
                        required: ["number", "absent", "note"],
                        additionalProperties: false,
                    },
                },
                trim: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            number: { type: "integer" },
                            posting_asks: { type: "string", enum: ["yes", "no"] },
                            note: text,
                        },
                        required: ["number", "posting_asks", "note"],
                        additionalProperties: false,
                    },
                },
                covered: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            number: { type: "integer" },
                            answers: { type: "string", enum: ["yes", "partly", "no"] },
                            in_posting: { type: "string", enum: ["yes", "no"] },
                            note: text,
                        },
                        required: ["number", "answers", "in_posting", "note"],
                        additionalProperties: false,
                    },
                },
                overlooked: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: { requirement: text, resume_line: text },
                        required: ["requirement", "resume_line"],
                        additionalProperties: false,
                    },
                },
                contradiction: { type: "boolean" },
                contradiction_note: text,
            },
            required: ["lead", "missing", "trim", "covered", "overlooked", "contradiction", "contradiction_note"],
            additionalProperties: false,
        },
    },
} as const;

function numbered(items: string[]) {
    return items.length ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : "(none)";
}

function flag(name: string) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
    const dir = process.argv[2];
    if (!dir) throw new Error("Usage: judge-posting-reads.ts <outputs-dir> [--budget-usd n] [--out file]");
    if (process.env.RIYP_ALLOW_PAID_EVALS !== "true") throw new Error("Refusing a paid call: set RIYP_ALLOW_PAID_EVALS=true.");
    const ledger = new SpendLedger(Number(flag("--budget-usd") || 1));
    // Beside the outputs, never among them: the Report Lab reads every JSON in that folder as a report.
    const out = flag("--out") || path.join(dir, "..", "judged", "posting-reads.json");
    mkdirSync(path.dirname(out), { recursive: true });

    const files = readdirSync(dir).filter((name) => name.endsWith(".json") && !name.startsWith("_")).sort();
    const rows: Array<{ id: string; lists: Saved["report"]["fit"]["posting"]; verdict: Verdict; cost_usd: number }> = [];
    for (const name of files) {
        const saved = JSON.parse(readFileSync(path.join(dir, name), "utf8")) as Saved;
        if (!saved.posting) continue;
        const lists = saved.report.fit.posting;
        const lead = lists.lead ?? [];
        const trim = lists.trim ?? [];
        const covered = lists.covered ?? [];
        const user = [
            `RESUME\n${readFileSync(path.join(INPUTS, saved.resume), "utf8").trim()}`,
            `POSTING\n${readFileSync(path.join(INPUTS, saved.posting), "utf8").trim()}`,
            `MISSING\n${numbered(lists.missing)}`,
            `MOVE UP\n${numbered(lead.map((move) => `"${move.line}" (the report's reason: ${move.why})`))}`,
            `COVERED\n${numbered(covered.map((item) => `Requirement: ${item.requirement} | Resume line: "${item.line}"`))}`,
            `TRIM\n${numbered(trim.map((move) => `"${move.line}" (the report's reason: ${move.why})`))}`,
        ].join("\n\n---\n\n");
        const judged = await callJudge<Verdict>(SYSTEM, user, RESPONSE_FORMAT, DEFAULT_JUDGE_CONFIG, ledger);
        const verdict = judged.output;
        rows.push({ id: saved.id, lists, verdict, cost_usd: judged.costUsd });
        const count = <T,>(items: T[], test: (item: T) => boolean) => items.filter(test).length;
        console.log(
            `${saved.id}: move up ${count(verdict.lead, (v) => v.answers === "yes")} yes / ${count(verdict.lead, (v) => v.answers === "partly")} partly / ${count(verdict.lead, (v) => v.answers === "no")} no of ${lead.length}; ` +
            `missing ${count(verdict.missing, (v) => v.absent === "no")} wrong, ${count(verdict.missing, (v) => v.absent === "partly")} partly of ${lists.missing.length}; ` +
            `trim ${count(verdict.trim, (v) => v.posting_asks === "yes")} wrong of ${trim.length}; ` +
            `covered ${count(verdict.covered, (v) => v.answers === "yes")} yes / ${count(verdict.covered, (v) => v.answers === "partly")} partly / ${count(verdict.covered, (v) => v.answers === "no")} no of ${covered.length}, ${count(verdict.covered, (v) => v.in_posting === "no")} not in posting; ` +
            `overlooked ${verdict.overlooked.length}; contradiction ${verdict.contradiction ? "YES" : "no"}`,
        );
    }

    const leads = rows.flatMap((row) => row.verdict.lead);
    const missing = rows.flatMap((row) => row.verdict.missing);
    const trims = rows.flatMap((row) => row.verdict.trim);
    const covereds = rows.flatMap((row) => row.verdict.covered);
    const totals = {
        reads: rows.length,
        lead: { total: leads.length, yes: leads.filter((v) => v.answers === "yes").length, partly: leads.filter((v) => v.answers === "partly").length, no: leads.filter((v) => v.answers === "no").length },
        missing: { total: missing.length, absent: missing.filter((v) => v.absent === "yes").length, partly: missing.filter((v) => v.absent === "partly").length, wrong: missing.filter((v) => v.absent === "no").length },
        trim: { total: trims.length, safe: trims.filter((v) => v.posting_asks === "no").length, wrong: trims.filter((v) => v.posting_asks === "yes").length },
        covered: { total: covereds.length, yes: covereds.filter((v) => v.answers === "yes").length, partly: covereds.filter((v) => v.answers === "partly").length, no: covereds.filter((v) => v.answers === "no").length, not_in_posting: covereds.filter((v) => v.in_posting === "no").length },
        overlooked: rows.reduce((sum, row) => sum + row.verdict.overlooked.length, 0),
        contradictions: rows.filter((row) => row.verdict.contradiction).length,
        judge_model: DEFAULT_JUDGE_CONFIG.model,
        judge_calls: ledger.calls,
        judge_cost_usd: Math.round(ledger.spentUsd * 1e6) / 1e6,
    };
    writeFileSync(out, `${JSON.stringify({ totals, rows }, null, 2)}\n`);
    console.log(JSON.stringify(totals, null, 2));
    console.log(`Saved ${out}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
