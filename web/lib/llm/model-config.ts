export type ReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
export type LlmMode = "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation" | "linkedin";

type ChatCompletionTuningOptions = {
  temperature?: number;
  maxCompletionTokens?: number;
  reasoningEffort?: ReasoningEffort;
};

type ProductionChatCompletionTuningOptions = Omit<ChatCompletionTuningOptions, "maxCompletionTokens">;

export type ChatCompletionTuning = {
  temperature?: number;
  reasoning_effort?: ReasoningEffort;
  verbosity?: "low" | "medium" | "high";
  max_completion_tokens?: number;
};

const GPT_5_REASONING_PATTERN = /^gpt-5(?:\.\d+)?(?:-(?:sol|terra|luna|mini|nano))?(?:-\d{4}-\d{2}-\d{2})?$/;

// July 28 Luna/low-reasoning release evidence (23 single-call reports) averaged
// 1,961 and maxed at 2,232 completion tokens, including reasoning. An 8k cap
// leaves more than 3.5x observed headroom without preserving the old 24k risk.
export const PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS = 8_000;
export const PRODUCTION_OPENAI_MAX_RETRIES = 1;

export function resolveProductionOpenAIRetryLimit(value: unknown): number {
  const configured = Number(value);
  if (!Number.isInteger(configured)) return PRODUCTION_OPENAI_MAX_RETRIES;
  return Math.max(0, Math.min(configured, PRODUCTION_OPENAI_MAX_RETRIES));
}

export function isGpt5ReasoningModel(model: string) {
  return GPT_5_REASONING_PATTERN.test(model.trim().toLowerCase());
}

export function parseReasoningEffort(value: unknown): ReasoningEffort | undefined {
  const normalized = String(value || "").trim().toLowerCase();
  if (["none", "minimal", "low", "medium", "high", "xhigh", "max"].includes(normalized)) {
    return normalized as ReasoningEffort;
  }
  return undefined;
}

export function increaseReasoningEffort(value: ReasoningEffort): ReasoningEffort {
  if (value === "none" || value === "minimal") return "low";
  if (value === "low") return "medium";
  if (value === "medium") return "high";
  return value;
}

export function defaultReasoningEffortForModel(model: string): ReasoningEffort {
  return /^gpt-5(?:\.\d+)?-(?:nano|luna)(?:-|$)/i.test(model.trim()) ? "low" : "medium";
}

function reasoningEffortForModel(model: string, effort: ReasoningEffort): ReasoningEffort {
  if (/^gpt-5(?:-(?:mini|nano))?(?:-\d{4}-\d{2}-\d{2})?$/i.test(model.trim())) {
    return ["minimal", "low", "medium", "high"].includes(effort)
      ? effort
      : defaultReasoningEffortForModel(model);
  }
  return effort;
}

export function resolveOpenAIModel(mode: LlmMode, explicitModel?: string) {
  const explicit = String(explicitModel || "").trim();
  if (explicit) return explicit;
  if (mode === "resume") {
    return String(process.env.OPENAI_RESUME_MODEL || "").trim() || "gpt-5.6-luna";
  }
  return String(process.env.OPENAI_MODEL || "").trim() || "gpt-4o-mini";
}

export function resolveReasoningEffortForMode(
  mode: LlmMode,
  model: string,
  explicitEffort?: ReasoningEffort,
) {
  if (explicitEffort) return explicitEffort;
  const modeEffort = mode === "resume"
    ? parseReasoningEffort(process.env.OPENAI_RESUME_REASONING_EFFORT)
    : undefined;
  return modeEffort
    || parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT)
    || defaultReasoningEffortForModel(model);
}

export function getChatCompletionTuning(
  model: string,
  options: ChatCompletionTuningOptions = {},
): ChatCompletionTuning {
  const maxCompletionTokens = Number.isInteger(options.maxCompletionTokens)
    && Number(options.maxCompletionTokens) > 0
    ? Number(options.maxCompletionTokens)
    : undefined;

  if (isGpt5ReasoningModel(model)) {
    const reasoningEffort = options.reasoningEffort
      || parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT)
      || defaultReasoningEffortForModel(model);
    return {
      reasoning_effort: reasoningEffortForModel(model, reasoningEffort),
      verbosity: /^gpt-5(?:\.\d+)?-(?:nano|luna)(?:-|$)/i.test(model.trim()) ? "low" : "medium",
      ...(maxCompletionTokens ? { max_completion_tokens: maxCompletionTokens } : {}),
    };
  }

  return {
    temperature: options.temperature ?? 0,
    ...(maxCompletionTokens ? { max_completion_tokens: maxCompletionTokens } : {}),
  };
}

export function getProductionChatCompletionTuning(
  model: string,
  options: ProductionChatCompletionTuningOptions = {},
): ChatCompletionTuning {
  return getChatCompletionTuning(model, {
    ...options,
    maxCompletionTokens: PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS,
  });
}

export function getTuningMetadata(tuning: ChatCompletionTuning) {
  return {
    temperature: typeof tuning.temperature === "number" ? tuning.temperature : null,
    top_p: null,
    reasoning_effort: tuning.reasoning_effort || null,
    max_completion_tokens: tuning.max_completion_tokens || null,
  };
}
