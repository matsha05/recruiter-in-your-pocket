/**
 * Voice judge - Markdown summaries for a calibration run and a copy run.
 */

import type { Agreement, StringScore, TicId } from "./types";

export interface VoiceRunMeta {
    title: string;
    timestamp: string;
    model: string;
    reasoning_effort: string;
    seed: number;
    prompt_version: string;
    prompt_sha256: string;
    calls: number;
    cost_usd: number;
    strings: number;
    errors: string[];
    missing: string[];
}

const pct = (n: number, d: number) => (d === 0 ? "n/a" : `${Math.round((100 * n) / d)}%`);
const cell = (value: string | undefined) => (value || "").replace(/\|/g, "\\|").replace(/\n/g, " ");

function header(meta: VoiceRunMeta): string[] {
    const lines = [
        `# ${meta.title}`,
        "",
        `- Run: ${meta.timestamp}`,
        `- Judge: \`${meta.model}\`, reasoning ${meta.reasoning_effort}, seed ${meta.seed}`,
        `- Prompt: \`${meta.prompt_version}\`, SHA-256 \`${meta.prompt_sha256}\``,
        `- Strings: ${meta.strings}; calls: ${meta.calls}; token-calculated spend: $${meta.cost_usd.toFixed(4)}`,
    ];
    if (meta.missing.length) lines.push(`- Left out of the judge's answer (not scored): ${meta.missing.join(", ")}`);
    if (meta.errors.length) lines.push(`- Errors: ${meta.errors.join("; ")}`);
    lines.push("");
    return lines;
}

export function calibrationMarkdown(meta: VoiceRunMeta, result: Agreement, labelledBy: string): string {
    const lines = header(meta);
    lines.push(
        `Labels: ${labelledBy}.`,
        "",
        "| Measure | All lines | Held out (text not in the prompt) |",
        "| --- | --- | --- |",
        `| Judged | ${result.judged} of ${result.rated} | ${result.held_out.judged} |`,
        `| Exact agreement (us, flat, no) | ${result.exact} (${pct(result.exact, result.judged)}) | ${result.held_out.exact} (${pct(result.held_out.exact, result.held_out.judged)}) |`,
        `| Us or not | ${result.us_or_not} (${pct(result.us_or_not, result.judged)}) | ${result.held_out.us_or_not} (${pct(result.held_out.us_or_not, result.held_out.judged)}) |`,
        `| Cohen's kappa | ${result.kappa.toFixed(2)} | ${result.held_out.kappa.toFixed(2)} |`,
        "",
        `The call a gate depends on: of ${result.no_catch.labelled_no} lines labelled "no", the judge failed ${result.no_catch.caught}; of its ${result.no_catch.judge_no} "no" verdicts, ${result.no_catch.correct} were labelled "no".`,
        "",
        `Too kind (the judge passed a line the labels don't): ${result.judge_too_kind.length}. Too harsh (the judge failed a line the labels pass): ${result.judge_too_harsh.length}.`,
        "",
        "## Every disagreement",
        "",
        "| # | Line | Label | Judge | Judge's reason | Judge's rewrite | Label note |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    );
    for (const row of result.rows.filter((entry) => !entry.agree)) {
        lines.push(`| ${row.id}${row.in_prompt ? " (in prompt)" : ""} | ${cell(row.text)} | ${row.human} | ${row.judge ?? "not judged"} | ${cell(row.judge_reason)} | ${cell(row.judge_rewrite)} | ${cell(row.human_note)} |`);
    }
    lines.push("", "## Every line", "", "| # | Line | Label | Judge | Judge's rewrite |", "| --- | --- | --- | --- | --- |");
    for (const row of result.rows) lines.push(`| ${row.id} | ${cell(row.text)} | ${row.human} | ${row.judge ?? "-"} | ${cell(row.judge_rewrite)} |`);
    lines.push("");
    return lines.join("\n");
}

export function copyRunMarkdown(meta: VoiceRunMeta, scores: StringScore[], groupOf: (score: StringScore) => string): string {
    const lines = header(meta);
    const verdicts = { us: 0, flat: 0, no: 0 } as Record<string, number>;
    const tics = new Map<TicId, number>();
    for (const score of scores) {
        verdicts[score.verdict] += 1;
        for (const tic of new Set([...score.tics, ...score.lexical_tics])) tics.set(tic, (tics.get(tic) || 0) + 1);
    }
    lines.push(
        "| Verdict | Strings |",
        "| --- | --- |",
        `| us | ${verdicts.us} |`,
        `| flat | ${verdicts.flat} |`,
        `| no | ${verdicts.no} |`,
        "",
        "| Tic | Strings |",
        "| --- | --- |",
        ...[...tics.entries()].sort((a, b) => b[1] - a[1]).map(([tic, total]) => `| ${tic} | ${total} |`),
        "",
        "Strings the judge passed are not listed. The rewrites are proposals: the read-aloud in docs/copy-system.md §7 decides.",
        "",
    );
    const groups = new Map<string, StringScore[]>();
    for (const score of scores.filter((entry) => entry.verdict !== "us" || entry.lexical_tics.length)) {
        const key = groupOf(score);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(score);
    }
    for (const [group, items] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        lines.push(`## ${group}`, "", "| Where | String | Verdict | Tics | Rewrite | Reason |", "| --- | --- | --- | --- | --- | --- |");
        for (const item of items) {
            const allTics = [...new Set([...item.tics, ...item.lexical_tics])].join(", ");
            lines.push(`| \`${item.where || item.id}\` | ${cell(item.text)} | ${item.verdict} | ${allTics} | ${cell(item.rewrite)} | ${cell(item.reason)} |`);
        }
        lines.push("");
    }
    return lines.join("\n");
}

/** The zero-cost run: only what the pattern checks found. */
export function lexicalMarkdown(title: string, rows: Array<{ where: string; text: string; tics: TicId[]; group: string }>): string {
    const lines = [`# ${title}`, "", `Pattern checks only, no model call. ${rows.length} strings flagged.`, ""];
    const groups = new Map<string, typeof rows>();
    for (const row of rows) {
        if (!groups.has(row.group)) groups.set(row.group, []);
        groups.get(row.group)!.push(row);
    }
    for (const [group, items] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        lines.push(`## ${group}`, "", "| Where | String | Tics |", "| --- | --- | --- |");
        for (const item of items) lines.push(`| \`${item.where}\` | ${cell(item.text)} | ${item.tics.join(", ")} |`);
        lines.push("");
    }
    return lines.join("\n");
}
