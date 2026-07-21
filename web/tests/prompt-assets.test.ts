import assert from "node:assert/strict";
import { loadPromptForMode } from "../lib/backend/prompts";

const modes = [
  "resume",
  "resume_ideas",
  "case_resume",
  "case_interview",
  "case_negotiation",
  "linkedin",
  "linkedin_v2",
] as const;

void Promise.all(modes.map((mode) => loadPromptForMode(mode)))
  .then((prompts) => {
    for (const [index, prompt] of prompts.entries()) {
      assert.ok(prompt.length > 100, `${modes[index]} prompt must be bundled and non-empty`);
    }
    console.log("prompt-assets tests passed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
