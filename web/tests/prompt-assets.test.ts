import assert from "node:assert/strict";
import { loadPromptForMode } from "../lib/backend/prompts";

const modes = [
  "resume",
  "resume_ideas",
  "case_resume",
  "case_interview",
  "case_negotiation",
  "linkedin",
  "linkedin_v3",
] as const;

void Promise.all(modes.map((mode) => loadPromptForMode(mode)))
  .then((prompts) => {
    for (const [index, prompt] of prompts.entries()) {
      assert.ok(prompt.length > 100, `${modes[index]} prompt must be bundled and non-empty`);
    }
    // The LinkedIn profile review (linkedin_v3.txt) writes the worklist contract and never reads what the PDF omits.
    const profilePrompt = prompts[modes.indexOf("linkedin_v3")];
    assert.equal(prompts[modes.indexOf("linkedin")], profilePrompt);
    assert.match(profilePrompt, /"contract_version": "v3"/);
    assert.match(profilePrompt, /WHAT YOU ARE READING/);
    assert.match(profilePrompt, /never mention, judge or guess at it: the photo, the banner, recommendations/);
    assert.doesNotMatch(profilePrompt, /your resume/);
    const resumePrompt = prompts[0];
    if (/"contract_version": "v3"/.test(resumePrompt)) {
      // The worklist prompt (resume_v3.txt): judgment first, cards, no Critical Miss anywhere in it.
      assert.match(resumePrompt, /THE WRITE-UP/);
      assert.match(resumePrompt, /THE CARDS/);
      // The retired name appears once, inside the never-write list, and nowhere else.
      assert.equal((resumePrompt.match(/Critical Miss/g) || []).length, 1);
    } else {
      assert.match(resumePrompt, /REPORT RHYTHM/);
      assert.match(resumePrompt, /Do not begin the summary with the legacy template "You read as"/);
      assert.doesNotMatch(resumePrompt, /Sentence one must begin with "You read as/);
    }
    console.log("prompt-assets tests passed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
