/**
 * Critical Miss judge - OpenAI call with structured output and a spend ceiling.
 */

import { calculateCostUsd, normalizeTokenUsage, type TokenUsage } from "../../llm/cost";
import { getChatCompletionTuning } from "../../llm/model-config";
import type { JudgeConfig } from "./types";

/**
 * The generator is gpt-6.1-terra. The judge uses a different, more capable model
 * from the same configured family: gpt-6.1-sol (twice Terra's token price).
 * gpt-6-astra is configured too but costs five times Sol.
 */
export const DEFAULT_JUDGE_CONFIG: JudgeConfig = {
    model: "gpt-6.1-sol",
    reasoningEffort: "medium",
    seed: 20261101,
    maxCompletionTokens: 12_000,
};

export const GENERATOR_MODEL = "gpt-6.1-terra";

/** Judge models with verified pricing in lib/llm/cost.ts. Calibrated results name the model they ran on. */
export const JUDGE_MODELS = ["gpt-6.1-sol", "gpt-6-astra"];

export class JudgeBudgetError extends Error {}

/** Shared spend tracker: refuses a call once the ceiling is reached. */
export class SpendLedger {
    spentUsd = 0;
    calls = 0;
    constructor(readonly ceilingUsd: number) {}

    assertRoom() {
        if (this.spentUsd >= this.ceilingUsd) {
            throw new JudgeBudgetError(
                `Judge spend $${this.spentUsd.toFixed(4)} reached the $${this.ceilingUsd.toFixed(2)} ceiling after ${this.calls} calls.`,
            );
        }
    }

    record(costUsd: number) {
        this.spentUsd += costUsd;
        this.calls += 1;
    }
}

export interface JudgeCallResult<T> {
    output: T;
    usage?: TokenUsage;
    costUsd: number;
    latencyMs: number;
    responseModel: string;
}

type Fetch = typeof fetch;

export async function callJudge<T>(
    system: string,
    user: string,
    responseFormat: unknown,
    config: JudgeConfig,
    ledger: SpendLedger,
    fetchImpl: Fetch = fetch,
): Promise<JudgeCallResult<T>> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is required");
    if (config.model === GENERATOR_MODEL) {
        throw new Error(`The judge must not run on the generator's model (${GENERATOR_MODEL}).`);
    }
    ledger.assertRoom();

    const startedAt = Date.now();
    let spentUsd = 0;
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
        let res: Response;
        try {
            res = await fetchImpl("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: config.model,
                ...getChatCompletionTuning(config.model, {
                    maxCompletionTokens: config.maxCompletionTokens,
                    reasoningEffort: config.reasoningEffort,
                }),
                seed: config.seed,
                response_format: responseFormat,
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: user },
                ],
            }),
            });
        } catch (error) {
            // A dropped connection never reached the model; retry it like a 5xx.
            lastError = error instanceof Error ? error : new Error(String(error));
            continue;
        }

        if (!res.ok) {
            const body = (await res.text()).slice(0, 500);
            lastError = new Error(`OpenAI API error ${res.status}: ${body}`);
            if (res.status === 429 || res.status >= 500) continue;
            throw lastError;
        }

        const data = await res.json();
        const usage = normalizeTokenUsage(data) || undefined;
        const responseModel = typeof data?.model === "string" ? data.model : config.model;
        const costUsd = usage ? calculateCostUsd(responseModel, usage) : null;
        if (costUsd === null) throw new Error(`No verified pricing for judge model "${responseModel}"`);
        ledger.record(costUsd);
        spentUsd += costUsd;

        const choice = data?.choices?.[0];
        if (choice?.message?.refusal) throw new Error(`Judge refused: ${choice.message.refusal}`);
        if (choice?.finish_reason !== "stop") {
            lastError = new Error(`Judge ended with finish_reason=${choice?.finish_reason || "missing"}`);
            ledger.assertRoom();
            continue;
        }
        const content = choice?.message?.content;
        if (!content) throw new Error("Judge returned no content");
        return {
            output: JSON.parse(content) as T,
            usage,
            costUsd: spentUsd,
            latencyMs: Date.now() - startedAt,
            responseModel,
        };
    }
    throw lastError || new Error("Judge call failed");
}
