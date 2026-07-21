import caseInterviewPrompt from "../../prompts/case_interview_v1.txt";
import caseNegotiationPrompt from "../../prompts/case_negotiation_v1.txt";
import caseResumePrompt from "../../prompts/case_resume_v1.txt";
import linkedinPrompt from "../../prompts/linkedin_v1.txt";
import linkedinV2Prompt from "../../prompts/linkedin_v2.txt";
import resumeIdeasPrompt from "../../prompts/resume_ideas_v1.txt";
import resumePrompt from "../../prompts/resume_v2.txt";

type Mode = "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation" | "linkedin" | "linkedin_v2";

const promptCache = new Map<string, string>();

const promptByMode: Record<Mode, string> = {
  resume: resumePrompt,
  resume_ideas: resumeIdeasPrompt,
  case_resume: caseResumePrompt,
  case_interview: caseInterviewPrompt,
  case_negotiation: caseNegotiationPrompt,
  linkedin: linkedinPrompt,
  linkedin_v2: linkedinV2Prompt,
};

export async function loadPromptForMode(mode: Mode): Promise<string> {
  const cached = promptCache.get(mode);
  if (cached) return cached;

  const content = promptByMode[mode].trim();
  if (!content) {
    throw new Error(`Prompt asset for ${mode} is empty.`);
  }

  promptCache.set(mode, content);
  return content;
}

export const JSON_INSTRUCTION =
  "You must respond ONLY with valid JSON. The output must be a JSON object that exactly matches the expected schema. This message contains the word json.";

export const baseTone = `
You are a calm recruiter with real hiring experience.

Speak plainly. Use "we" when speaking from the recruiter perspective.

Be direct, human, and specific. No hype, no corporate filler, no em dashes.
`.trim();
