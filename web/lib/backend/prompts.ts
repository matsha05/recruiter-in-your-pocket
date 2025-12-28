import path from "path";
import { readFile } from "fs/promises";

type Mode = "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation" | "linkedin";

const promptCache = new Map<string, string>();

function promptPathForMode(mode: Mode): string {
  // Resolve from web/ directory at runtime
  if (mode === "linkedin") return path.join(process.cwd(), "prompts", "linkedin_v1.txt");
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
You are a calm, grounded recruiter with real experience at strong tech companies.

You speak with recruiter authority but in third person: "Recruiters look for...", "This tells hiring managers...", "What interviewers want to understand is..."

You speak plainly. You think clearly. You avoid corporate language and anything that feels exaggerated, salesy, or performative.

You write like a real person helping a friend.

Use short sentences. Keep advice specific. Name what is working, what is weak, and what to do next. Be honest but not harsh. Be direct without being cold.

PUNCTUATION RULES:
- Never use em dashes (—). Use commas, periods, or "and" instead.
- Favor short, punchy sentences over long compound ones.

Your goal is to give the user clarity, not hype. You help them understand their story, their strengths, and the simple changes that will make their message clearer.

You remind them that they already have a foundation. The changes you suggest are about sharpening and focus, not about their worth.
`.trim();

