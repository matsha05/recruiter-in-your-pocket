/**
 * Critical Miss judge - pairwise and absolute modes.
 *
 * Pairwise asks which of two reports picked the more important thing to fix
 * first. It runs once in each side order; when the orders disagree, the
 * comparison is a tie, which cancels position bias instead of hiding it.
 *
 * Absolute scores one report's Critical Miss on the rubric criteria. Any
 * claim the resume doesn't support is a veto.
 *
 * Count checks each Critical Miss in one report on its own: would that
 * problem cost an interview on its own, and, when a resume's labeled problems
 * are given, which one does its fix address. The gate uses it to catch a
 * report that stops short on a bad resume or pads a strong one.
 *
 * Code checks the judge, too: a veto counts only when its quoted claim really
 * appears in that report, and cited resume lines that aren't verbatim are
 * reported.
 */

import { callJudge, DEFAULT_JUDGE_CONFIG, SpendLedger } from "./client";
import {
    ABSOLUTE_RESPONSE_FORMAT,
    ABSOLUTE_SYSTEM_PROMPT,
    COUNT_RESPONSE_FORMAT,
    COUNT_SYSTEM_PROMPT,
    PAIRWISE_RESPONSE_FORMAT,
    PAIRWISE_SYSTEM_PROMPT,
} from "./prompt";
import type {
    AbsoluteRawScore,
    AbsoluteResult,
    CountKeyProblem,
    CountRawVerdict,
    CountResult,
    CriticalMissView,
    JudgeCase,
    JudgeConfig,
    PairwiseOrderResult,
    PairwiseOutcome,
    PairwiseRawVerdict,
    PairwiseResult,
    UnsupportedClaim,
} from "./types";
import { containsQuote, renderView, viewText } from "./view";

function resumeBlock(input: JudgeCase) {
    return [
        `REVIEW DATE: ${input.review_date}`,
        "",
        "RESUME (verbatim)",
        "<<<",
        input.resume_text.trim(),
        ">>>",
    ].join("\n");
}

export function pairwiseUserMessage(input: JudgeCase, first: CriticalMissView, second: CriticalMissView) {
    return [
        resumeBlock(input),
        "",
        "FIRST REPORT",
        renderView(first),
        "",
        "SECOND REPORT",
        renderView(second),
        "",
        "Which report picked the more important thing to fix first? Return JSON only.",
    ].join("\n");
}

export function absoluteUserMessage(input: JudgeCase, view: CriticalMissView) {
    return [
        resumeBlock(input),
        "",
        "REPORT",
        renderView(view),
        "",
        "Score this report's Critical Miss. Return JSON only.",
    ].join("\n");
}

export function countUserMessage(input: JudgeCase, view: CriticalMissView, problems?: CountKeyProblem[]) {
    const labeled = problems?.length
        ? [
            "",
            "LABELED PROBLEMS (each would cost an interview on its own; use them only to fill in matches)",
            ...problems.flatMap((problem) => [
                `${problem.id}: ${problem.problem}`,
                ...problem.lines.map((line) => `  Resume line: "${line}"`),
            ]),
        ]
        : [];
    return [
        resumeBlock(input),
        ...labeled,
        "",
        "REPORT",
        renderView(view),
        "",
        `Check each of the report's ${view.misses.length} Critical Miss${view.misses.length === 1 ? "" : "es"} on its own. Return JSON only.`,
    ].join("\n");
}

/** Keep only claims whose quote is really in the report; return the rest as dropped. */
export function verifyClaims(claims: UnsupportedClaim[], view: CriticalMissView) {
    const body = viewText(view);
    const kept: UnsupportedClaim[] = [];
    const dropped: UnsupportedClaim[] = [];
    for (const claim of Array.isArray(claims) ? claims : []) {
        if (claim && typeof claim.quote === "string" && containsQuote(body, claim.quote)) kept.push(claim);
        else dropped.push(claim);
    }
    return { kept, dropped };
}

export function uncitedLines(lines: string[], resumeText: string) {
    return (Array.isArray(lines) ? lines : []).filter((line) => !containsQuote(resumeText, line));
}

/**
 * Map one order's verdict back to report identities. A verified veto decides
 * the order on its own: the vetoed side loses clearly, and two vetoed sides tie.
 */
export function resolveOrder(
    order: "XY" | "YX",
    raw: PairwiseRawVerdict,
    views: { X: CriticalMissView; Y: CriticalMissView },
): Pick<PairwiseOrderResult, "winner" | "strength" | "vetoes" | "dropped_claims"> {
    const firstIs = order === "XY" ? "X" : "Y";
    const secondIs = order === "XY" ? "Y" : "X";
    const first = verifyClaims(raw.first?.unsupported_claims, views[firstIs]);
    const second = verifyClaims(raw.second?.unsupported_claims, views[secondIs]);
    const vetoes = { X: [] as UnsupportedClaim[], Y: [] as UnsupportedClaim[] };
    vetoes[firstIs] = first.kept;
    vetoes[secondIs] = second.kept;
    const dropped_claims = [...first.dropped, ...second.dropped];

    if (vetoes.X.length > 0 || vetoes.Y.length > 0) {
        if (vetoes.X.length > 0 && vetoes.Y.length > 0) {
            return { winner: "tie", strength: "none", vetoes, dropped_claims };
        }
        return { winner: vetoes.X.length > 0 ? "Y" : "X", strength: "clear", vetoes, dropped_claims };
    }

    const winner: PairwiseOutcome = raw.winner === "first"
        ? firstIs
        : raw.winner === "second" ? secondIs : "tie";
    const strength = winner === "tie" ? "none" : raw.strength === "clear" ? "clear" : "slight";
    return { winner, strength, vetoes, dropped_claims };
}

/** Combine the two orders. Disagreement is a tie; "clear" needs both orders to say clear. */
export function combineOrders(orders: Array<Pick<PairwiseOrderResult, "winner" | "strength" | "vetoes">>) {
    const winners = new Set(orders.map((order) => order.winner));
    const ordersAgree = winners.size === 1;
    const veto = {
        X: orders.some((order) => order.vetoes.X.length > 0),
        Y: orders.some((order) => order.vetoes.Y.length > 0),
    };
    if (!ordersAgree) return { winner: "tie" as PairwiseOutcome, strength: "none" as const, orders_agree: false, veto };
    const winner = orders[0].winner;
    if (winner === "tie") return { winner, strength: "none" as const, orders_agree: true, veto };
    const strength = orders.every((order) => order.strength === "clear") ? "clear" as const : "slight" as const;
    return { winner, strength, orders_agree: true, veto };
}

export interface JudgeRuntime {
    config?: JudgeConfig;
    ledger: SpendLedger;
    /** Tests pass a fake; every real call goes to the OpenAI API. */
    fetchImpl?: typeof fetch;
    /** Waits between retries; tests pass zeros. */
    backoffMs?: number[];
}

export async function judgePairwise(
    input: JudgeCase,
    views: { X: CriticalMissView; Y: CriticalMissView },
    runtime: JudgeRuntime,
): Promise<PairwiseResult> {
    const config = runtime.config || DEFAULT_JUDGE_CONFIG;
    const orders: PairwiseOrderResult[] = [];
    for (const order of ["XY", "YX"] as const) {
        const [first, second] = order === "XY" ? [views.X, views.Y] : [views.Y, views.X];
        const call = await callJudge<PairwiseRawVerdict>(
            PAIRWISE_SYSTEM_PROMPT,
            pairwiseUserMessage(input, first, second),
            PAIRWISE_RESPONSE_FORMAT,
            config,
            runtime.ledger,
            runtime.fetchImpl,
            runtime.backoffMs,
        );
        orders.push({
            order,
            ...resolveOrder(order, call.output, views),
            raw: call.output,
            uncited_lines: uncitedLines(call.output.cited_resume_lines, input.resume_text),
            usage: call.usage,
            cost_usd: call.costUsd,
            latency_ms: call.latencyMs,
        });
    }
    return {
        case_id: input.id,
        ...combineOrders(orders),
        orders,
        cost_usd: orders.reduce((sum, order) => sum + order.cost_usd, 0),
    };
}

export async function judgeAbsolute(
    input: JudgeCase,
    view: CriticalMissView,
    runtime: JudgeRuntime,
): Promise<AbsoluteResult> {
    const config = runtime.config || DEFAULT_JUDGE_CONFIG;
    const call = await callJudge<AbsoluteRawScore>(
        ABSOLUTE_SYSTEM_PROMPT,
        absoluteUserMessage(input, view),
        ABSOLUTE_RESPONSE_FORMAT,
        config,
        runtime.ledger,
        runtime.fetchImpl,
        runtime.backoffMs,
    );
    const { kept, dropped } = verifyClaims(call.output.unsupported_claims, view);
    const veto = kept.length > 0;
    return {
        case_id: input.id,
        veto,
        overall: veto ? 1 : call.output.right_thing_first,
        raw: { ...call.output, unsupported_claims: kept },
        dropped_claims: dropped,
        uncited_lines: uncitedLines(call.output.cited_resume_lines, input.resume_text),
        usage: call.usage,
        cost_usd: call.costUsd,
        latency_ms: call.latencyMs,
    };
}

/**
 * One answer per Critical Miss, in the report's order. An answer that skips,
 * repeats or reorders a Critical Miss is an error rather than a guess, and
 * without labeled problems every match is "none".
 */
export async function judgeCount(
    input: JudgeCase,
    view: CriticalMissView,
    runtime: JudgeRuntime,
    problems?: CountKeyProblem[],
): Promise<CountResult> {
    const config = runtime.config || DEFAULT_JUDGE_CONFIG;
    const keyed = Boolean(problems?.length);
    const call = await callJudge<CountRawVerdict>(
        COUNT_SYSTEM_PROMPT,
        countUserMessage(input, view, problems),
        COUNT_RESPONSE_FORMAT,
        config,
        runtime.ledger,
        runtime.fetchImpl,
        runtime.backoffMs,
    );
    const misses = Array.isArray(call.output.misses) ? call.output.misses : [];
    if (misses.length !== view.misses.length || misses.some((miss, index) => miss.number !== index + 1)) {
        throw new Error(`count answer for ${input.id} covers ${misses.map((miss) => miss.number).join(",") || "no"} Critical Misses; the report has ${view.misses.length}`);
    }
    const labeledIds = new Set<string>((problems || []).map((problem) => problem.id));
    return {
        case_id: input.id,
        keyed,
        raw: {
            ...call.output,
            misses: misses.map((miss) => ({ ...miss, matches: labeledIds.has(miss.matches) ? miss.matches : "none" })),
        },
        usage: call.usage,
        cost_usd: call.costUsd,
        latency_ms: call.latencyMs,
    };
}
