import { loadPromptForMode } from "../backend/prompts";
import { logDetectedPromptInjection } from "../observability/resume-stream-security";
import { resolveEffectiveJobDescription } from "../security/effectiveJobDescription";
import type { Mode } from "../backend/validation";
import { resolveOpenAIModel } from "./model-config";
import { buildResumeProviderMessages } from "./resume-provider-messages";
import type { ReportDocument } from "../reports/report-document";

export async function prepareResumeStreamPrompt(input: {
  text: string;
  mode: Mode;
  jobDescription?: string | null;
  /** A LinkedIn profile export is read by its own prompt; everything after the prompt is the resume report's pipeline. */
  document?: ReportDocument | null;
  requestId: string;
  route: string;
  userIdForLogs?: string;
}) {
  const effectiveJobDescription = resolveEffectiveJobDescription(input.jobDescription);
  const prepared = buildResumeProviderMessages({
    mode: input.mode,
    systemPrompt: await loadPromptForMode(input.document === "linkedin" ? "linkedin_v3" : input.mode),
    document: input.document ?? null,
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
