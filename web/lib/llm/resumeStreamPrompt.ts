import { loadPromptForMode } from "../backend/prompts";
import { logDetectedPromptInjection } from "../observability/resume-stream-security";
import { resolveEffectiveJobDescription } from "../security/effectiveJobDescription";
import type { Mode } from "../backend/validation";
import { resolveOpenAIModel } from "./model-config";
import { buildResumeProviderMessages } from "./resume-provider-messages";

export async function prepareResumeStreamPrompt(input: {
  text: string;
  mode: Mode;
  jobDescription?: string | null;
  requestId: string;
  route: string;
  userIdForLogs?: string;
}) {
  const effectiveJobDescription = resolveEffectiveJobDescription(input.jobDescription);
  const prepared = buildResumeProviderMessages({
    mode: input.mode,
    systemPrompt: await loadPromptForMode(input.mode),
    text: input.text,
    effectiveJobDescription,
  });
  logDetectedPromptInjection({
    request_id: input.requestId,
    route: input.route,
    resume: prepared.sanitization,
    jobDescription: effectiveJobDescription.sanitization,
  });
  return {
    messages: prepared.messages,
    model: resolveOpenAIModel(input.mode),
    canonicalResumeText: prepared.sanitization.sanitizedText,
    effectiveJobDescription,
  };
}
