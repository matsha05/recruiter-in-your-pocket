export type ReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
// "revise_line" is the guarded polish of a revised resume line. It writes a resume bullet, so it runs on the
// resume model (Matt, Nov 1), never on OPENAI_MODEL. "severity_check" reads a finished resume report for
// further Critical Misses, so it runs on the resume model at the resume report's effort.
export type LlmMode = "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation" | "linkedin" | "revise_line" | "severity_check";

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
// Only documented Chat Completions families belong here; this is not a
// blanket assumption about future GPT-6 model parameters.
const GPT_6_REASONING_PATTERN = /^gpt-(?:6\.1-(?:terra|sol)|6-(?:astra|luna))(?:-\d{4}-\d{2}-\d{2})?$/;

// Production and release evaluations share this per-call ceiling. The bounded
// repair may make another call; the request budget accounts for those calls.
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
  if (GPT_6_REASONING_PATTERN.test(model.trim().toLowerCase())) {
    if (effort === "minimal") return "low";
    if (effort === "none" && /^gpt-(?:6\.1-sol|6-astra)(?:-|$)/i.test(model.trim())) return "low";
    return effort;
  }
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
  if (mode === "resume" || mode === "revise_line" || mode === "severity_check") {
    return String(process.env.OPENAI_RESUME_MODEL || "").trim() || "gpt-6.1-terra";
  }
  return String(process.env.OPENAI_MODEL || "").trim() || "gpt-4o-mini";
}

export function resolveReasoningEffortForMode(
  mode: LlmMode,
  model: string,
  explicitEffort?: ReasoningEffort,
) {
  if (explicitEffort) return explicitEffort;
  // One short rewrite under a strict guard, with the literal line already on screen: low effort keeps it quick.
  if (mode === "revise_line") return "low";
  const modeEffort = mode === "resume" || mode === "severity_check"
    ? parseReasoningEffort(process.env.OPENAI_RESUME_REASONING_EFFORT)
    : undefined;
  return modeEffort
    || parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT)
    || defaultReasoningEffortForModel(model);
}

// A failed draft needs a stronger reasoning pass within the existing call/token limits.
export function resolveResumeRepairReasoningEffort(model: string, initialEffort?: ReasoningEffort) {
  return increaseReasoningEffort(resolveReasoningEffortForMode("resume", model, initialEffort));
}

export function getChatCompletionTuning(
  model: string,
  options: ChatCompletionTuningOptions = {},
): ChatCompletionTuning {
  const maxCompletionTokens = Number.isInteger(options.maxCompletionTokens)
    && Number(options.maxCompletionTokens) > 0
    ? Number(options.maxCompletionTokens)
    : undefined;

  if (isGpt5ReasoningModel(model) || GPT_6_REASONING_PATTERN.test(model.trim().toLowerCase())) {
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
