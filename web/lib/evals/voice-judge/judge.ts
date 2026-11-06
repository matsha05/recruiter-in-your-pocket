/**
 * Voice judge - batching and the call.
 *
 * Strings go to the model in batches so a run over the inventory stays within
 * a few dollars; each call returns one result per id. The zero-cost lexical
 * checks run on every string whether or not the model is called, and the
 * report shows both, so a tic the model missed is still visible.
 *
 * Shares the Critical Miss judge's client: the same model family (never the
 * generator's model), the same spend ledger, the same retry on a dropped
 * connection or a 5xx.
 */

import { callJudge, SpendLedger } from "../judge/client";
import { lexicalTics } from "./lexical";
import { VOICE_JUDGE_SYSTEM_PROMPT, VOICE_RESPONSE_FORMAT } from "./prompt";
import type { BatchRawScore, BatchResult, CopyString, StringScore, VoiceJudgeConfig } from "./types";
import { TICS, VERDICTS } from "./types";

export const DEFAULT_VOICE_JUDGE_CONFIG: VoiceJudgeConfig = {
    model: "gpt-6.1-sol",
    reasoningEffort: "low",
    seed: 20261106,
    maxCompletionTokens: 6_000,
    batchSize: 12,
};

export function batches<T>(items: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let index = 0; index < items.length; index += size) out.push(items.slice(index, index + size));
    return out;
}

/** The user message: the strings with their moment and kind, nothing about where they came from in code. */
export function batchUserMessage(items: CopyString[]): string {
    const lines = items.map((item) => {
        const kind = item.kind ? ` · ${describeKind(item.kind)}` : "";
        return `[${item.id}] (${item.moment}${kind}) ${item.text}`;
    });
    return ["STRINGS", ...lines].join("\n");
}

/** The inventory's kinds, in words the judge can use. */
export function describeKind(kind: string): string {
    if (kind === "jsx-text") return "text on the screen";
    if (kind.startsWith("attr:aria")) return "screen-reader label";
    if (kind === "attr:placeholder") return "placeholder";
    if (kind === "attr:alt") return "image description";
    if (kind === "attr:title" || kind === "key:title") return "title";
    if (kind === "key:description") return "description or meta description";
    if (kind === "key:label" || kind === "attr:label") return "label";
    if (/cta|buttonText/.test(kind)) return "button";
    if (kind === "key:message" || kind.startsWith("call:")) return "message to the reader";
    if (kind === "key:subject") return "email subject";
    if (kind === "key:q") return "FAQ question";
    if (kind === "key:a") return "FAQ answer";
    return kind.replace(/^key:/, "").replace(/^attr:/, "");
}

function cleanRaw(raw: unknown): BatchRawScore {
    const results = Array.isArray((raw as BatchRawScore)?.results) ? (raw as BatchRawScore).results : [];
    return {
        results: results.map((result) => ({
            ...result,
            id: String(result.id),
            tics: Array.isArray(result.tics) ? result.tics.filter((tic) => (TICS as readonly string[]).includes(tic)) : [],
            verdict: (VERDICTS as readonly string[]).includes(result.verdict) ? result.verdict : "no",
            rewrite: typeof result.rewrite === "string" ? result.rewrite.trim() : "",
            reason: typeof result.reason === "string" ? result.reason.trim() : "",
        })),
    };
}

/** Map one call's answer back onto the strings; a missing id is reported, an unknown id dropped. */
export function mergeBatch(items: CopyString[], raw: BatchRawScore): { scores: StringScore[]; missing: string[] } {
    const byId = new Map(raw.results.map((result) => [result.id, result]));
    const scores: StringScore[] = [];
    const missing: string[] = [];
    for (const item of items) {
        const result = byId.get(item.id);
        if (!result) {
            missing.push(item.id);
            continue;
        }
        scores.push({
            ...result,
            id: item.id,
            text: item.text,
            moment: item.moment,
            where: item.where,
            kind: item.kind,
            // A rewrite that only restates the original is no rewrite.
            rewrite: result.verdict === "us" || result.rewrite === item.text ? "" : result.rewrite,
            lexical_tics: lexicalTics(item),
        });
    }
    return { scores, missing };
}

export async function judgeBatch(
    items: CopyString[],
    config: VoiceJudgeConfig,
    ledger: SpendLedger,
    fetchImpl: typeof fetch = fetch,
): Promise<BatchResult> {
    const call = await callJudge<BatchRawScore>(
        VOICE_JUDGE_SYSTEM_PROMPT,
        batchUserMessage(items),
        VOICE_RESPONSE_FORMAT,
        { model: config.model, reasoningEffort: config.reasoningEffort, seed: config.seed, maxCompletionTokens: config.maxCompletionTokens },
        ledger,
        fetchImpl,
    );
    const { scores, missing } = mergeBatch(items, cleanRaw(call.output));
    return { scores, missing, usage: call.usage, cost_usd: call.costUsd, latency_ms: call.latencyMs, response_model: call.responseModel };
}

export interface RunProgress {
    done: number;
    total: number;
    spent_usd: number;
}

/** Judge every string, a batch at a time, stopping at the ledger's ceiling. */
export async function judgeStrings(
    items: CopyString[],
    config: VoiceJudgeConfig,
    ledger: SpendLedger,
    options: { concurrency?: number; onProgress?: (progress: RunProgress) => void; fetchImpl?: typeof fetch } = {},
): Promise<{ scores: StringScore[]; missing: string[]; errors: string[]; calls: number; cost_usd: number }> {
    const groups = batches(items, config.batchSize);
    const concurrency = Math.max(1, options.concurrency ?? 3);
    const scores: StringScore[] = [];
    const missing: string[] = [];
    const errors: string[] = [];
    let calls = 0;
    let costUsd = 0;
    let next = 0;
    const worker = async () => {
        while (next < groups.length) {
            const index = next++;
            const group = groups[index];
            try {
                const result = await judgeBatch(group, config, ledger, options.fetchImpl);
                scores.push(...result.scores);
                missing.push(...result.missing);
                calls += 1;
                costUsd += result.cost_usd;
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                errors.push(`batch ${index + 1} (${group[0]?.id}…): ${message}`);
                if (/ceiling/.test(message)) return;
            }
            options.onProgress?.({ done: Math.min(items.length, (index + 1) * config.batchSize), total: items.length, spent_usd: ledger.spentUsd });
        }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, groups.length) }, worker));
    scores.sort((a, b) => items.findIndex((item) => item.id === a.id) - items.findIndex((item) => item.id === b.id));
    return { scores, missing, errors, calls, cost_usd: costUsd };
}

/** The inventory's entries as judge input. */
export function inventoryStrings(inventory: { entries: Array<{ text: string; file: string; line: number; kind: string; routes: string[]; moment: string; table?: string }> }): CopyString[] {
    return inventory.entries.map((entry, index) => ({
        id: `s${index + 1}`,
        text: entry.text,
        moment: entry.moment,
        kind: entry.kind,
        where: `${entry.file}:${entry.line}`,
        routes: entry.routes,
    }));
}
