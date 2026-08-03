import {
  sanitizeUserInput,
  wrapUserContent,
  type SanitizationResult,
} from "./inputSanitization";

export type EffectiveJobDescription = {
  hasValue: boolean;
  text: string;
  promptBlock: string;
  persistenceText: string | null;
  validationOptions: { jobDescription?: string };
  sanitization: SanitizationResult | null;
};

export function hasEffectiveJobDescriptionValue(jobDescription: string | null | undefined) {
  return typeof jobDescription === "string" && jobDescription.trim().length > 0;
}

export function resolveEffectiveJobDescription(
  jobDescription: string | null | undefined,
): EffectiveJobDescription {
  const sanitization = typeof jobDescription === "string" && jobDescription.length > 0
    ? sanitizeUserInput(jobDescription)
    : null;
  const text = sanitization?.sanitizedText.trim() || "";
  const hasValue = hasEffectiveJobDescriptionValue(text);

  return {
    hasValue,
    text,
    promptBlock: hasValue ? wrapUserContent(text, "job_description") : "",
    persistenceText: hasValue ? text : null,
    validationOptions: hasValue ? { jobDescription: text } : {},
    sanitization,
  };
}
