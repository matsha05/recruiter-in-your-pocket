export type ReasoningEffort = "minimal" | "low" | "medium" | "high";
export type LlmMode = "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation" | "linkedin";

type ChatCompletionTuningOptions = {
  temperature?: number;
  maxCompletionTokens?: number;
  reasoningEffort?: ReasoningEffort;
};

export type ChatCompletionTuning = {
  temperature?: number;
  reasoning_effort?: ReasoningEffort;
  verbosity?: "low" | "medium" | "high";
  max_completion_tokens?: number;
};

const ORIGINAL_GPT_5_PATTERN = /^gpt-5(?:-(?:mini|nano))?(?:-\d{4}-\d{2}-\d{2})?$/;

export function isOriginalGpt5Model(model: string) {
  return ORIGINAL_GPT_5_PATTERN.test(model.trim().toLowerCase());
}

export function parseReasoningEffort(value: unknown): ReasoningEffort | undefined {
  const normalized = String(value || "").trim().toLowerCase();
  if (["minimal", "low", "medium", "high"].includes(normalized)) {
    return normalized as ReasoningEffort;
  }
  return undefined;
}

export function increaseReasoningEffort(value: ReasoningEffort): ReasoningEffort {
  if (value === "minimal") return "low";
  if (value === "low") return "medium";
  return "high";
}

export function defaultReasoningEffortForModel(model: string): ReasoningEffort {
  return /^gpt-5-nano(?:-|$)/i.test(model.trim()) ? "low" : "medium";
}

export function resolveOpenAIModel(mode: LlmMode, explicitModel?: string) {
  const explicit = String(explicitModel || "").trim();
  if (explicit) return explicit;
  if (mode === "resume") {
    return String(process.env.OPENAI_RESUME_MODEL || "").trim() || "gpt-5-nano-2025-08-07";
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

  if (isOriginalGpt5Model(model)) {
    return {
      reasoning_effort:
        options.reasoningEffort
        || parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT)
        || defaultReasoningEffortForModel(model),
      verbosity: /^gpt-5-nano(?:-|$)/i.test(model.trim()) ? "low" : "medium",
      ...(maxCompletionTokens ? { max_completion_tokens: maxCompletionTokens } : {}),
    };
  }

  return {
    temperature: options.temperature ?? 0,
    ...(maxCompletionTokens ? { max_completion_tokens: maxCompletionTokens } : {}),
  };
}

export function getTuningMetadata(tuning: ChatCompletionTuning) {
  return {
    temperature: typeof tuning.temperature === "number" ? tuning.temperature : null,
    top_p: null,
    reasoning_effort: tuning.reasoning_effort || null,
    max_completion_tokens: tuning.max_completion_tokens || null,
  };
}
