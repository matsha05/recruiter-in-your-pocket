/**
 * Critical Miss judge - markdown summaries for calibration, scoring and comparison runs.
 */

import type { CalibrationRecord } from "./calibration";
import type { AbsoluteResult, PairwiseResult } from "./types";

const pct = (n: number, d: number) => (d === 0 ? "n/a" : `${Math.round((100 * n) / d)}%`);
const usd = (value: number) => `$${value.toFixed(4)}`;

function outcomeLabel(result: Pick<PairwiseResult, "winner" | "strength">, names: { X: string; Y: string }) {
    if (result.winner === "tie") return "no real difference";
    return `${names[result.winner]} (${result.strength})`;
}

function orderNote(result: PairwiseResult) {
    const [first, second] = result.orders;
    if (!first || !second) return "";
    const show = (order: typeof first) => (order.winner === "tie" ? "tie" : `${order.winner} ${order.strength}`);
    return `${show(first)} / ${show(second)}`;
}

function vetoNote(result: PairwiseResult) {
    const sides = (["X", "Y"] as const).filter((side) => result.veto[side]);
    return sides.length ? `veto ${sides.join(", ")}` : "";
}

export interface RunMeta {
    title: string;
    timestamp: string;
    model: string;
    reasoning_effort: string;
    seed: number;
    judge_prompt_sha256: string;
    calls: number;
    cost_usd: number;
}

function header(meta: RunMeta) {
    return [
        `# ${meta.title}`,
        "",
        `- Run: ${meta.timestamp}`,
        `- Judge: \`${meta.model}\`, reasoning ${meta.reasoning_effort}, seed ${meta.seed}`,
        `- Judge prompt SHA-256: \`${meta.judge_prompt_sha256}\``,
        `- Calls: ${meta.calls}; token-calculated spend: ${usd(meta.cost_usd)}`,
        "",
    ];
}

export function calibrationMarkdown(meta: RunMeta, records: CalibrationRecord[]): string {
    const lines = header(meta);
    const firstRun = records.filter((record) => record.repeat === 0);

    for (const set of ["blind-pick", "contrast"] as const) {
        const rows = firstRun.filter((record) => record.pair.set === set);
        if (rows.length === 0) continue;
        const decisive = rows.filter((record) => record.pair.expected !== "tie");
        const ties = rows.filter((record) => record.pair.expected === "tie");
        const count = (list: CalibrationRecord[], grade: string) => list.filter((record) => record.grade === grade).length;

        lines.push(set === "blind-pick" ? "## Matt's blind pick" : "## Contrast pairs", "");
        lines.push(`- Decisive: ${count(decisive, "right")} of ${decisive.length} right; ${count(decisive, "tie_on_decisive")} judged no real difference; ${count(decisive, "wrong_slight")} slight wrong; **${count(decisive, "wrong_clear")} clear wrong**.`);
        if (ties.length) {
            lines.push(`- Expected no difference: ${count(ties, "right")} of ${ties.length} judged no real difference; ${count(ties, "acceptable")} slight preference; ${count(ties, "wrong_clear")} clear preference.`);
        }
        lines.push(`- Side orders disagreed (counted as a tie): ${rows.filter((record) => !record.result.orders_agree).length} of ${rows.length}.`);
        if (set === "blind-pick") {
            const named = rows.filter((record) => record.result.winner !== "tie");
            const production = named.filter((record) => record.result.winner === record.pair.production_side).length;
            lines.push(`- Judge preferred the production prompt in ${production} of ${named.length} items where it named a winner (Matt: 5 of 6).`);
        }
        lines.push("");
        lines.push("| Item | Rule | Expected | Judge | Orders (XY / YX) | Grade | Note |");
        lines.push("| --- | --- | --- | --- | --- | --- | --- |");
        const names = { X: "A", Y: "B" };
        for (const record of rows) {
            const expected = record.pair.expected === "tie" ? "no difference" : names[record.pair.expected];
            const notes = [vetoNote(record.result), record.pair.note ? record.pair.note.replace(/\|/g, "/").slice(0, 90) : ""]
                .filter(Boolean).join("; ");
            lines.push(`| ${record.pair.id} | ${record.pair.rule} | ${expected} | ${outcomeLabel(record.result, names)} | ${orderNote(record.result)} | ${record.grade} | ${notes} |`);
        }
        lines.push("");
    }

    const repeats = new Map<string, CalibrationRecord[]>();
    for (const record of records) {
        const key = `${record.pair.set}:${record.pair.id}`;
        repeats.set(key, [...(repeats.get(key) || []), record]);
    }
    const retested = [...repeats.values()].filter((list) => list.length > 1);
    if (retested.length > 0) {
        const same = retested.filter((list) => list.every((record) => record.result.winner === list[0].result.winner)).length;
        const sameStrength = retested.filter((list) => list.every((record) =>
            record.result.winner === list[0].result.winner && record.result.strength === list[0].result.strength)).length;
        const allRuns = retested.flat();
        const flips = allRuns.filter((record) => !record.result.orders_agree).length;
        const orderCalls = allRuns.flatMap((record) => record.result.orders);
        const firstWins = orderCalls.filter((order) => order.raw.winner === "first").length;
        const secondWins = orderCalls.filter((order) => order.raw.winner === "second").length;
        lines.push("## Stability", "");
        lines.push(`- Test-retest: ${same} of ${retested.length} pairs got the same combined winner on every run (${pct(same, retested.length)}); ${sameStrength} also kept the same strength.`);
        lines.push(`- Side-order flips: ${flips} of ${allRuns.length} pair-runs (${pct(flips, allRuns.length)}) had the two orders disagree.`);
        lines.push(`- Position: across ${orderCalls.length} single-order calls, the first-shown report won ${firstWins} times and the second ${secondWins}.`);
        lines.push("");
        lines.push("| Pair | Runs (combined winner, strength) |");
        lines.push("| --- | --- |");
        for (const list of retested) {
            lines.push(`| ${list[0].pair.set}:${list[0].pair.id} | ${list.map((record) => `${record.result.winner}${record.result.winner === "tie" ? "" : ` ${record.result.strength}`} [${orderNote(record.result)}]`).join("; ")} |`);
        }
        lines.push("");
    }

    const dropped = records.flatMap((record) => record.result.orders.flatMap((order) => order.dropped_claims));
    const uncited = records.flatMap((record) => record.result.orders.flatMap((order) => order.uncited_lines));
    lines.push("## Judge self-checks", "");
    lines.push(`- Veto claims dropped because the quote wasn't in the report: ${dropped.length}.`);
    lines.push(`- Resume lines the judge cited that aren't verbatim in the resume: ${uncited.length}.`);
    lines.push("");
    return lines.join("\n");
}

export function absoluteMarkdown(meta: RunMeta, rows: Array<{ label: string; result: AbsoluteResult }>): string {
    const lines = header(meta);
    const scored = rows.filter((row) => row.result);
    const mean = (pick: (row: typeof scored[number]) => number) =>
        scored.length ? (scored.reduce((sum, row) => sum + pick(row), 0) / scored.length).toFixed(2) : "n/a";
    lines.push("## Summary", "");
    lines.push(`- Reports scored: ${scored.length}`);
    lines.push(`- Vetoes (a claim the resume doesn't support): ${scored.filter((row) => row.result.veto).length}`);
    lines.push(`- Mean right-thing-first (1-5, veto = 1): ${mean((row) => row.result.overall)}`);
    lines.push(`- Mean criteria: stakes ${mean((row) => row.result.raw.criteria.first_read_stakes.score)}, concrete fact ${mean((row) => row.result.raw.criteria.concrete_fact.score)}, specific ask ${mean((row) => row.result.raw.criteria.specific_ask.score)}, consequence ${mean((row) => row.result.raw.criteria.recruiter_consequence.score)}, honest ask ${mean((row) => row.result.raw.criteria.honest_ask.score)}`);
    lines.push("");
    lines.push("| Report | Overall | Stakes | Fact | Specific | Consequence | Honest | Gap | Veto | Rationale |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const row of scored) {
        const c = row.result.raw.criteria;
        const veto = row.result.veto ? row.result.raw.unsupported_claims.map((claim) => `"${claim.quote}"`).join("; ").replace(/\|/g, "/") : "";
        lines.push(`| ${row.label} | ${row.result.overall} | ${c.first_read_stakes.score} | ${c.concrete_fact.score} | ${c.specific_ask.score} | ${c.recruiter_consequence.score} | ${c.honest_ask.score} | ${c.gap_handling.applies ? c.gap_handling.score : "-"} | ${veto} | ${row.result.raw.rationale.replace(/\|/g, "/").replace(/\n/g, " ")} |`);
    }
    lines.push("");
    return lines.join("\n");
}

export function compareMarkdown(
    meta: RunMeta,
    names: { X: string; Y: string },
    rows: Array<{ fixture_id: string; result: PairwiseResult }>,
    skipped: string[],
): string {
    const lines = header(meta);
    const xWins = rows.filter((row) => row.result.winner === "X");
    const yWins = rows.filter((row) => row.result.winner === "Y");
    const ties = rows.filter((row) => row.result.winner === "tie");
    lines.push("## Summary", "");
    lines.push(`- X = ${names.X}`);
    lines.push(`- Y = ${names.Y}`);
    lines.push(`- Fixtures compared: ${rows.length}`);
    lines.push(`- X preferred: ${xWins.length} (${xWins.filter((row) => row.result.strength === "clear").length} clear)`);
    lines.push(`- Y preferred: ${yWins.length} (${yWins.filter((row) => row.result.strength === "clear").length} clear)`);
    lines.push(`- No real difference: ${ties.length} (side orders disagreed in ${ties.filter((row) => !row.result.orders_agree).length})`);
    lines.push(`- Vetoes: X ${rows.filter((row) => row.result.veto.X).length}, Y ${rows.filter((row) => row.result.veto.Y).length}`);
    if (skipped.length) lines.push(`- Skipped: ${skipped.join("; ")}`);
    lines.push("");
    lines.push("| Fixture | Judge | Orders (XY / YX) | Vetoes | Rationale (first order) |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const row of rows) {
        lines.push(`| ${row.fixture_id} | ${outcomeLabel(row.result, { X: "X", Y: "Y" })} | ${orderNote(row.result)} | ${vetoNote(row.result)} | ${row.result.orders[0]?.raw.rationale.replace(/\|/g, "/").replace(/\n/g, " ") || ""} |`);
    }
    lines.push("");
    return lines.join("\n");
}
