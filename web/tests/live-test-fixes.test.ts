import assert from "node:assert/strict";
import { htmlToResumeText } from "../lib/backend/docx-text";
import { PASS_SPENT_LABEL, accountBalanceLine, isBalanceKnown, isPassSpent, readAuthoritativePassAccess } from "../lib/billing/accountPassStatus";
import { WorklistReportSchema } from "../lib/llm/worklist-schema";
import { splitVerdict } from "../lib/reports/report-opening";
import { fileReadFindings } from "../lib/reports/file-read";
import { ACROSS_SHAPES_NOTE, compareAcrossShapes } from "../lib/reports/worklist-presentation";

// Findings from the live customer test of November 12, 2026.

// ---- A Word file's soft line break is a line break ----
{
  // mammoth's HTML for a heading typed above the first job with Shift+Enter, as in the tested resume.
  const html = "<p><strong>Dana Okafor</strong></p><p>dana@example.com / 555-201-8890 </p>"
    + "<p><strong>Professional Experience</strong><em><br /></em><strong>Northwind</strong>, Staff Recruiter</p>"
    + "<p>Boulder, CO\t\tApr 2024 &ndash; Present</p><ul><li>Closed 40 hires &amp; cut time to fill</li><li>Ran R&#38;D hiring</li></ul>"
    + "<table><tr><td><p>Education</p></td></tr></table><p>BA, State University</p>";
  const text = htmlToResumeText(html);
  const lines = text.split("\n");
  assert.ok(lines.includes("Professional Experience"), "the heading is on its own line");
  assert.ok(lines.includes("Northwind, Staff Recruiter"), "and the job under it on the next");
  assert.ok(!text.includes("ExperienceNorthwind"), "never glued together");
  assert.ok(text.includes("Closed 40 hires & cut time to fill") && text.includes("Ran R&D hiring"), "entities are decoded");
  assert.ok(!/[<>]/u.test(text), "no markup is left");
  assert.ok(!/\n{3,}/u.test(text), "one blank line between paragraphs, as before");
  const experience = fileReadFindings(text).find((finding) => finding.id === "experience");
  assert.equal(experience?.state, "found", "so the upload screen finds the Experience heading");
  // The glued text is what the old extraction produced, and why the screen said the heading was missing.
  assert.equal(fileReadFindings(text.replace("Professional Experience\n", "Professional Experience")).find((finding) => finding.id === "experience")?.state, "missing");
  assert.equal(htmlToResumeText(""), "");
}

// ---- A pass with every report used is not "the free report" ----
{
  const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const spent = readAuthoritativePassAccess(true, { ok: true, passes: [{ tier: "pass", uses_remaining: 0, expires_at: soon, revoked_at: null }] });
  assert.equal(spent.membership, "free", "the plan logic still treats it as having no reports");
  assert.equal(spent.postingReads, true, "but its posting reads still run");
  assert.equal(isPassSpent({ ...spent, freeUsesLeft: 0 }), true);
  assert.equal(isPassSpent({ ...spent, freeUsesLeft: 1 }), false, "a free report still to use is said first");
  assert.equal(isPassSpent({ membership: "free", postingReads: false, freeUsesLeft: 0 }), false, "no pass: the free report really is what was used");
  assert.equal(isPassSpent({ membership: "credit", postingReads: true, freeUsesLeft: 0 }), false, "reports left on the pass");
  assert.equal(isPassSpent(null), false);
  assert.ok(!/free/iu.test(PASS_SPENT_LABEL));
}

// ---- Nothing is said about the balance until it is known (live check, November 13, 2026) ----
{
  // The session hook sets who is signed in first and what they have left a moment later. In that moment a
  // pass holder read "0 free reports left" on My reports.
  const justSignedIn: { id: string; membership?: string; freeUsesLeft?: number } = { id: "u1" };
  assert.equal(isBalanceKnown(justSignedIn), false);
  assert.equal(accountBalanceLine(justSignedIn), null, "no line at all, rather than a wrong one");
  assert.equal(accountBalanceLine(null), null);
  assert.equal(isBalanceKnown({ freeUsesLeft: 0 }), true, "the free-report read alone is an answer");
  assert.equal(accountBalanceLine({ membership: "free", postingReads: false, freeUsesLeft: 1 }), "1 free report left");
  assert.equal(accountBalanceLine({ membership: "free", postingReads: false, freeUsesLeft: 0 }), "0 free reports left");
  assert.equal(accountBalanceLine({ membership: "free", postingReads: true, freeUsesLeft: 0 }), PASS_SPENT_LABEL);
  assert.equal(accountBalanceLine({ membership: "credit", paidUsesLeft: 1, postingReads: true }), "1 report left on your pass");
  assert.equal(accountBalanceLine({ membership: "credit", paidUsesLeft: 4, postingReads: true }), "4 reports left on your pass");
  assert.equal(accountBalanceLine({ membership: "lifetime" }), "Lifetime access");
  assert.equal(accountBalanceLine({ membership: "monthly" }), "Monthly plan");
}

// ---- An older report beside a worklist report ----
{
  const card = (line: string, kind = "line") => ({ kind, where: "Experience", line, cannot_tell: "What you owned.", example: "", question: "" });
  const current = { cards: [card("Led hiring for the security team."), card("Onboarded 80 sourcers in 2022."), card("Great team player", "keep")] } as never;
  const earlier = [
    { line: "Onboarded 80 sourcers in 2022.", note: "Say what changed." },
    { line: "Managed vendor relationships.", note: "Say which vendors." },
  ];
  const mixed = compareAcrossShapes(earlier, current);
  assert.deepEqual(mixed.still.map((problem) => problem.line), ["Onboarded 80 sourcers in 2022."]);
  assert.deepEqual(mixed.gone.map((problem) => problem.line), ["Managed vendor relationships."]);
  assert.equal(mixed.now.length, 2, "the newer report's lines are there to show: the side that came out empty");
  assert.equal(mixed.title, "1 of the 2 lines the earlier report led with is off the list.");
  assert.equal(mixed.intro, "One is still there, and 2 lines need work in this version.");
  assert.equal(mixed.note, ACROSS_SHAPES_NOTE);

  const allGone = compareAcrossShapes([earlier[1]], current);
  assert.equal(allGone.title, "The line the earlier report led with is off the list.");
  assert.equal(allGone.intro, "2 lines need work in this version.");
  const allStill = compareAcrossShapes([earlier[0]], current);
  assert.equal(allStill.title, "The line the earlier report led with is still on the list.");
  const clean = compareAcrossShapes([earlier[1]], { cards: [] } as never);
  assert.equal(clean.intro, "Nothing in this version needs work.");
  assert.equal(compareAcrossShapes([], current).title, "2 lines need work in this version.");
  // The copy never says a line was fixed, and never sets the two scores against each other.
  for (const result of [mixed, allGone, allStill, clean]) assert.ok(!/fixed|\bup \d|\bdown \d/iu.test(`${result.title} ${result.intro} ${result.note}`));
}

// ---- A verdict of two or three sentences: the first is the heading, the rest reads on under it ----
{
  const verdict = "Stripe, Netflix and Airbnb get my attention, and your recruiting work backs up the names. I'd want to talk to you. Which seat do you want next?";
  const split = splitVerdict(verdict);
  assert.equal(split.lead, "Stripe, Netflix and Airbnb get my attention, and your recruiting work backs up the names.");
  assert.equal(split.rest, "I'd want to talk to you. Which seat do you want next?");
  assert.deepEqual(splitVerdict("Nine years of payments work, with the results attached."), { lead: "Nine years of payments work, with the results attached.", rest: null }, "a one-sentence verdict from an earlier report is shown whole");
  // The schema takes the longer verdict and still refuses a runaway one.
   
  const sample = require("../public/sample-report.json");
  assert.equal(WorklistReportSchema.safeParse(sample).success, true);
  assert.equal(WorklistReportSchema.safeParse({ ...sample, verdict: "x".repeat(420) }).success, true);
  assert.equal(WorklistReportSchema.safeParse({ ...sample, verdict: "x".repeat(421) }).success, false);
}

console.log("live-test fixes: Word line breaks, spent pass, older report beside a worklist report");
