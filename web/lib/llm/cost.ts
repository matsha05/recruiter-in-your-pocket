export type TokenUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens?: number;
  cached_prompt_tokens?: number;
  cache_write_prompt_tokens?: number;
  reasoning_tokens?: number;
};

type ModelPrice = {
  input_per_million_usd: number;
  cached_input_per_million_usd: number;
  cache_write_input_per_million_usd?: number;
  output_per_million_usd: number;
  long_context_threshold_tokens?: number;
};

const MODEL_PRICING_USD: Record<string, ModelPrice> = {
  // Standard API pricing per 1M text tokens. GPT-5.6 and GPT-6 prices verified
  // against https://developers.openai.com/api/docs/models on 2026-10-30.
  // Chat Completions uses the default 30-minute cache-write price.
  // Batch/Flex/Fast/regional processing prices are outside this estimate.
  "gpt-5-nano": {
    input_per_million_usd: 0.05,
    cached_input_per_million_usd: 0.005,
    output_per_million_usd: 0.4,
  },
  "gpt-5.6-luna": {
    input_per_million_usd: 0.2,
    cached_input_per_million_usd: 0.02,
    cache_write_input_per_million_usd: 0.25,
    output_per_million_usd: 1.2,
    long_context_threshold_tokens: 272_000,
  },
  "gpt-5.6-terra": {
    input_per_million_usd: 2,
    cached_input_per_million_usd: 0.2,
    cache_write_input_per_million_usd: 2.5,
    output_per_million_usd: 12,
    long_context_threshold_tokens: 272_000,
  },
  "gpt-6.1-terra": {
    input_per_million_usd: 1,
    cached_input_per_million_usd: 0.05,
    cache_write_input_per_million_usd: 1.25,
    output_per_million_usd: 5,
    long_context_threshold_tokens: 272_000,
  },
  "gpt-6.1-sol": {
    input_per_million_usd: 2,
    cached_input_per_million_usd: 0.1,
    cache_write_input_per_million_usd: 2.5,
    output_per_million_usd: 10,
    long_context_threshold_tokens: 272_000,
  },
  "gpt-6-astra": {
    input_per_million_usd: 10,
    cached_input_per_million_usd: 1,
    cache_write_input_per_million_usd: 12.5,
    output_per_million_usd: 50,
    long_context_threshold_tokens: 272_000,
  },
  "gpt-6-luna": {
    input_per_million_usd: 0.1,
    cached_input_per_million_usd: 0.01,
    cache_write_input_per_million_usd: 0.125,
    output_per_million_usd: 0.5,
    long_context_threshold_tokens: 272_000,
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
  const family = model.trim().toLowerCase().replace(/-\d{4}-\d{2}-\d{2}$/, "");
  return Object.hasOwn(MODEL_PRICING_USD, family) ? family : null;
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
  const cacheWritePromptTokens = Number(usage?.prompt_tokens_details?.cache_write_tokens);
  const reasoningTokens = Number(usage?.completion_tokens_details?.reasoning_tokens);

  return {
    prompt_tokens: Math.max(0, promptTokens),
    completion_tokens: Math.max(0, completionTokens),
    ...(Number.isFinite(totalTokens) ? { total_tokens: Math.max(0, totalTokens) } : {}),
    ...(Number.isFinite(cachedPromptTokens)
      ? { cached_prompt_tokens: Math.min(Math.max(0, cachedPromptTokens), Math.max(0, promptTokens)) }
      : {}),
    ...(Number.isFinite(cacheWritePromptTokens)
      ? { cache_write_prompt_tokens: Math.min(
        Math.max(0, cacheWritePromptTokens),
        Math.max(0, promptTokens - (Number.isFinite(cachedPromptTokens) ? Math.max(0, cachedPromptTokens) : 0)),
      ) }
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
  const cacheWriteInput = Math.min(
    Math.max(0, usage.cache_write_prompt_tokens || 0),
    Math.max(0, usage.prompt_tokens - cachedInput),
  );
  const uncachedInput = Math.max(0, usage.prompt_tokens - cachedInput - cacheWriteInput);
  const output = Math.max(0, usage.completion_tokens);
  const longContext = price.long_context_threshold_tokens !== undefined
    && usage.prompt_tokens > price.long_context_threshold_tokens;
  const inputMultiplier = longContext ? 2 : 1;
  const outputMultiplier = longContext ? 1.5 : 1;
  const total =
    ((uncachedInput / 1_000_000) * price.input_per_million_usd
      + (cachedInput / 1_000_000) * price.cached_input_per_million_usd
      + (cacheWriteInput / 1_000_000) * (price.cache_write_input_per_million_usd ?? price.input_per_million_usd)) * inputMultiplier
    + (output / 1_000_000) * price.output_per_million_usd * outputMultiplier;

  if (!Number.isFinite(total) || total < 0) return null;
  return Math.round(total * 1e8) / 1e8;
}

export function estimateCostUsd(model: string, usage: TokenUsage | null): number | null {
  return calculateCostUsd(model, usage);
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
    // Budget for a cold cache; realized cost above only counts returned writes.
    cache_write_prompt_tokens: Math.max(0, inputTokens),
  });
}
