import path from "path";
import { readFile } from "fs/promises";

type Mode = "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation" | "linkedin" | "linkedin_v2";

const promptCache = new Map<string, string>();

function promptPathForMode(mode: Mode): string {
  // Resolve from web/ directory at runtime
  if (mode === "linkedin") return path.join(process.cwd(), "prompts", "linkedin_v1.txt");
  if (mode === "linkedin_v2") return path.join(process.cwd(), "prompts", "linkedin_v2.txt");
  if (mode === "case_negotiation") return path.join(process.cwd(), "prompts", "case_negotiation_v1.txt");
  if (mode === "case_resume") return path.join(process.cwd(), "prompts", "case_resume_v1.txt");
  if (mode === "case_interview") return path.join(process.cwd(), "prompts", "case_interview_v1.txt");
  return path.join(process.cwd(), "prompts", mode === "resume" ? "resume_v2.txt" : "resume_ideas_v1.txt");
}

export async function loadPromptForMode(mode: Mode): Promise<string> {
  const filePath = promptPathForMode(mode);
  const cached = promptCache.get(filePath);
  if (cached) return cached;

  const content = (await readFile(filePath, "utf8")).trim();
  promptCache.set(filePath, content);
  return content;
}

export const JSON_INSTRUCTION =
  "You must respond ONLY with valid JSON. The output must be a JSON object that exactly matches the expected schema. This message contains the word json.";

export const baseTone = `
You are a calm recruiter with real hiring experience.

Speak plainly. Use "we" when speaking from the recruiter perspective.

Be direct, human, and specific. No hype, no corporate filler, no em dashes.
`.trim();
