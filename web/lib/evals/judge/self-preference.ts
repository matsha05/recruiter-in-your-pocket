/**
 * Critical Miss judge - self-preference probe.
 *
 * A judge may favor text written by its own model. To measure that, the judge
 * model writes its own Critical Miss for each blind-pick resume (without the
 * rubric, so it isn't writing to the test), and two judges compare it against
 * the production report's Critical Miss. Self-preference is how much more often
 * the author's own model prefers the authored side than the other judge does.
 *
 * In normal use both sides come from the same generator, so this bias can't
 * favor one prompt over another; the probe checks the judge's reliability.
 */

import { callJudge, type SpendLedger } from "./client";
import type { CriticalMissView, JudgeCase, JudgeConfig } from "./types";

const WRITER_SYSTEM_PROMPT = `You are an experienced recruiter reading one resume. Name the one thing this resume should fix first, the way a sharp recruiter friend would tell them.
Write for the resume owner, as "you". Use only facts on the resume; never invent numbers, scope or results. Quote the resume line the fix is about exactly.
Return JSON only:
- verdict: one or two sentences, your first impression of the resume.
- fix: one sentence saying exactly what to change and where.
- why: one or two sentences on why it matters to a reviewer for this kind of role.
- resume_line: the exact resume line the fix is about, copied character for character.`;

const WRITER_RESPONSE_FORMAT = {
    type: "json_schema",
    json_schema: {
        name: "riyp_critical_miss_author_v1",
        strict: true,
        schema: {
            type: "object",
            properties: {
                verdict: { type: "string" },
                fix: { type: "string" },
                why: { type: "string" },
                resume_line: { type: "string" },
            },
            required: ["verdict", "fix", "why", "resume_line"],
            additionalProperties: false,
        },
    },
} as const;

export async function writeCriticalMiss(
    input: JudgeCase,
    config: JudgeConfig,
    ledger: SpendLedger,
): Promise<{ view: CriticalMissView; cost_usd: number }> {
    const call = await callJudge<{ verdict: string; fix: string; why: string; resume_line: string }>(
        WRITER_SYSTEM_PROMPT,
        `RESUME (verbatim)\n<<<\n${input.resume_text.trim()}\n>>>\n\nReturn JSON only.`,
        WRITER_RESPONSE_FORMAT,
        config,
        ledger,
    );
    return {
        view: {
            label: "Critical Miss",
            verdict: call.output.verdict,
            misses: [{ fix: call.output.fix, why: call.output.why, resume_lines: [call.output.resume_line] }],
        },
        cost_usd: call.costUsd,
    };
}

/** Preference for the authored side: 1 for a win, 0.5 for a tie, 0 for a loss. */
export function authoredShare(winners: Array<"X" | "Y" | "tie">, authored: "X" | "Y") {
    if (winners.length === 0) return 0;
    return winners.reduce((sum, winner) => sum + (winner === authored ? 1 : winner === "tie" ? 0.5 : 0), 0) / winners.length;
}
