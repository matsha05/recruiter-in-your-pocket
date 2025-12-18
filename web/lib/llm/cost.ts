export type TokenUsage = {
  prompt_tokens: number;
  completion_tokens: number;
};

type ModelPrice = {
  input_per_1k_usd: number;
  output_per_1k_usd: number;
};

const MODEL_PRICING_USD: Record<string, ModelPrice> = {
  // Best-effort estimates; keep conservative and explicit.
  // Prices are expressed per-1k tokens.
  // gpt-4o-mini: $0.15 / 1M input, $0.60 / 1M output.
  "gpt-4o-mini": { input_per_1k_usd: 0.00015, output_per_1k_usd: 0.0006 },
  // Unknown/variable pricing: keep at 0 until explicitly set.
  "gpt-4.1-mini": { input_per_1k_usd: 0, output_per_1k_usd: 0 }
};

export function estimateCostUsd(model: string, usage: TokenUsage | null): number {
  if (!usage) return 0;
  const price = MODEL_PRICING_USD[model];
  if (!price) return 0;
  const input = (usage.prompt_tokens / 1000) * price.input_per_1k_usd;
  const output = (usage.completion_tokens / 1000) * price.output_per_1k_usd;
  const total = input + output;
  if (!Number.isFinite(total) || total < 0) return 0;
  return Math.round(total * 1e6) / 1e6;
}
