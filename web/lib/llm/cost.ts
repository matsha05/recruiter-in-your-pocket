export type TokenUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens?: number;
  cached_prompt_tokens?: number;
  reasoning_tokens?: number;
};

type ModelPrice = {
  input_per_million_usd: number;
  cached_input_per_million_usd: number;
  output_per_million_usd: number;
};

const MODEL_PRICING_USD: Record<string, ModelPrice> = {
  // Standard API pricing per 1M text tokens, verified against OpenAI model
  // pages on 2026-07-19. Snapshot aliases inherit their family price below.
  "gpt-5-nano": {
    input_per_million_usd: 0.05,
    cached_input_per_million_usd: 0.005,
    output_per_million_usd: 0.4,
  },
  "gpt-4o-mini": {
    input_per_million_usd: 0.15,
    cached_input_per_million_usd: 0.075,
    output_per_million_usd: 0.6,
  },
  "gpt-4.1-mini": {
    input_per_million_usd: 0.4,
    cached_input_per_million_usd: 0.1,
    output_per_million_usd: 1.6,
  },
};

function pricingKey(model: string) {
  const normalized = model.trim().toLowerCase();
  if (/^gpt-5-nano(?:-|$)/.test(normalized)) return "gpt-5-nano";
  if (/^gpt-4o-mini(?:-|$)/.test(normalized)) return "gpt-4o-mini";
  if (/^gpt-4\.1-mini(?:-|$)/.test(normalized)) return "gpt-4.1-mini";
  return null;
}

export function getModelPrice(model: string): ModelPrice | null {
  const key = pricingKey(model);
  return key ? MODEL_PRICING_USD[key] : null;
}

export function normalizeTokenUsage(data: any): TokenUsage | null {
  const usage = data?.usage || data;
  const promptTokens = Number(usage?.prompt_tokens);
  const completionTokens = Number(usage?.completion_tokens);
  if (!Number.isFinite(promptTokens) || !Number.isFinite(completionTokens)) return null;

  const totalTokens = Number(usage?.total_tokens);
  const cachedPromptTokens = Number(usage?.prompt_tokens_details?.cached_tokens);
  const reasoningTokens = Number(usage?.completion_tokens_details?.reasoning_tokens);

  return {
    prompt_tokens: Math.max(0, promptTokens),
    completion_tokens: Math.max(0, completionTokens),
    ...(Number.isFinite(totalTokens) ? { total_tokens: Math.max(0, totalTokens) } : {}),
    ...(Number.isFinite(cachedPromptTokens)
      ? { cached_prompt_tokens: Math.min(Math.max(0, cachedPromptTokens), Math.max(0, promptTokens)) }
      : {}),
    ...(Number.isFinite(reasoningTokens) ? { reasoning_tokens: Math.max(0, reasoningTokens) } : {}),
  };
}

export function calculateCostUsd(model: string, usage: TokenUsage | null): number | null {
  if (!usage) return null;
  const price = getModelPrice(model);
  if (!price) return null;

  const cachedInput = Math.min(
    Math.max(0, usage.cached_prompt_tokens || 0),
    Math.max(0, usage.prompt_tokens),
  );
  const uncachedInput = Math.max(0, usage.prompt_tokens - cachedInput);
  const output = Math.max(0, usage.completion_tokens);
  const total =
    (uncachedInput / 1_000_000) * price.input_per_million_usd
    + (cachedInput / 1_000_000) * price.cached_input_per_million_usd
    + (output / 1_000_000) * price.output_per_million_usd;

  if (!Number.isFinite(total) || total < 0) return null;
  return Math.round(total * 1e8) / 1e8;
}

export function estimateCostUsd(model: string, usage: TokenUsage | null): number {
  return calculateCostUsd(model, usage) ?? 0;
}

export function estimateMaximumCostUsd(
  model: string,
  inputTokens: number,
  maxCompletionTokens: number,
): number | null {
  return calculateCostUsd(model, {
    prompt_tokens: Math.max(0, inputTokens),
    completion_tokens: Math.max(0, maxCompletionTokens),
    cached_prompt_tokens: 0,
  });
}
