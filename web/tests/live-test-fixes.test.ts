import assert from "node:assert/strict";
import { htmlToResumeText } from "../lib/backend/docx-text";
import { rejoinWrappedLines, separateGluedDates, tidyPdfText } from "../lib/backend/pdf-text";
import { PASS_SPENT_LABEL, accountBalanceLine, isBalanceKnown, isPassSpent, readAuthoritativePassAccess } from "../lib/billing/accountPassStatus";
import { WorklistReportSchema } from "../lib/llm/worklist-schema";
import { loadSavedReportRevision } from "../lib/reports/saved-report-revision";
import { reportPdfFileName } from "../lib/reports/report-document";
import { renderReportHtml } from "../lib/backend/pdf";
import { normalizeReportForPdf } from "../lib/reports/pdf-export";
import { readFileSync } from "node:fs";
import path from "node:path";
import { splitVerdict } from "../lib/reports/report-opening";
import { fileReadFindings } from "../lib/reports/file-read";
import { ACROSS_SHAPES_NOTE, compareAcrossShapes, fitHeading, fitListRoles, hasRoleSection } from "../lib/reports/worklist-presentation";

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

// ---- A PDF's wrapped bullet is one line (live walk, November 17, 2026) ----
{
  // pdf-parse's text of a synthetic resume printed to PDF: each bullet the page wrapped is two lines, and the
  // right-aligned dates run into the title. Every card on it quoted half a bullet.
  const extracted = readFileSync(path.join(process.cwd(), "tests/fixtures/pdf-extracted-wrapped-resume.txt"), "utf8");
  const tidy = tidyPdfText(extracted).split("\n");
  for (const bullet of [
    "Cut average dock-to-truck time from 52 minutes to 31 minutes by redesigning wave planning and moving carrier check-in to a mobile app",
    "Run outbound operations for a 420,000 sq ft distribution center shipping 38,000 orders a week to retail and e-commerce customers across the Midwest",
    "Lead 6 shift supervisors and 140 associates across three shifts; reduced 90-day associate turnover from 48% to 29% with a new onboarding buddy program",
    "Helped with the rollout of a new warehouse management system and trained associates on handheld scanners",
  ]) assert.ok(tidy.includes(bullet), `whole again: ${bullet.slice(0, 40)}`);
  assert.ok(tidy.includes("Senior Operations Manager, Buckeye Freight Logistics, Columbus, OH April 2021 – Present"), "the date gets its space back");
  assert.ok(tidy.includes("EXPERIENCE") && tidy.includes("EDUCATION") && tidy.includes("SKILLS"), "headings stay on their own lines");
  assert.ok(tidy.includes("Operations Supervisor, Buckeye Freight Logistics, Columbus, OH June 2017 – March 2021"), "a role line is never joined onto the bullet above it");
  assert.equal(tidy.filter((line) => line.trim()).length, 17, "seventeen lines, one per thing a reader sees");
  // What is never joined: a new bullet, a capital, a date, a line after a short one, and a page with no long lines.
  const long = "Managed onboarding for enterprise customers across three regions and four product lines with";
  const filler = ["Supported account managers with weekly renewal reports for the largest customers in the book", "Coordinated quarterly reviews with customer leadership teams and product managers each month"];
  const join = (a: string, b: string) => rejoinWrappedLines([...filler, a, b].join("\n")).split("\n").slice(2);
  assert.deepEqual(join(long, "partner teams in support"), [`${long} partner teams in support`]);
  assert.deepEqual(join(long, "• Built the renewal dashboard"), [long, "• Built the renewal dashboard"]);
  assert.deepEqual(join(long, "Built the renewal dashboard"), [long, "Built the renewal dashboard"]);
  assert.deepEqual(join(long, "2019 – 2021"), [long, "2019 – 2021"]);
  assert.deepEqual(join("Short line", "and more"), ["Short line", "and more"]);
  assert.equal(rejoinWrappedLines("Customer Success Manager\nand more"), "Customer Success Manager\nand more", "too few lines to judge the margin by");
  assert.equal(separateGluedDates("Analyst, Acme Corp.Jan 2020 – Present"), "Analyst, Acme Corp. Jan 2020 – Present");
  assert.equal(separateGluedDates("Engineer, Initech2018 – 2021"), "Engineer, Initech 2018 – 2021");
  assert.equal(separateGluedDates("Windows Server 2019 administration"), "Windows Server 2019 administration", "a year that isn't glued is left alone");
  assert.equal(tidyPdfText(tidyPdfText(extracted)), tidyPdfText(extracted), "running it twice changes nothing");
}

// ---- A LinkedIn review's PDF is named for what it is (live walk, November 17, 2026) ----
assert.equal(reportPdfFileName({ document: "linkedin", cards: [] }), "linkedin-profile-review.pdf");
assert.equal(reportPdfFileName({ cards: [] }), "resume-report.pdf");
assert.equal(reportPdfFileName(null), "resume-report.pdf");

// ---- The PDF's score band holds its five rungs on one row (new-visitor walk, November 20, 2026) ----
{
  // The scale was a four-column grid from the four-band report; the worklist's fifth rung wrapped under the first.
  const html = renderReportHtml(normalizeReportForPdf(JSON.parse(readFileSync(path.join(process.cwd(), "public/sample-report.json"), "utf8")), null)!);
  assert.equal(html.match(/class="band-bar/gu)?.length, 5, "five rungs");
  assert.ok(/\.band-scale \{[^}]*grid-auto-flow: column/u.test(html), "laid out in one row, however many there are");
  assert.ok(!/\.band-scale \{[^}]*repeat\(4/u.test(html));
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

// ---- The role list holds directions, not the titles a person moved past (live check, November 13, 2026) ----
{
  // A branch manager of five years was offered "Branch Manager, Assistant Branch Manager, Personal Banker" under
  // "Roles to consider". The prompt now lists a second title only for a second direction; and a list of one,
  // the job the first pass already names, is not repeated under the cards.
  const fit = (roles: string[], posting = "") => ({ fit: { roles, why: "", level: "", note: "Where the work points.", posting: { summary: posting, missing: [], covered: [], lead: [], trim: [] } } }) as never;
  assert.deepEqual(fitListRoles(fit(["Branch Manager"])), [], "one title: the first pass already says it");
  assert.equal(hasRoleSection(fit(["Branch Manager"])), true, "the note still stands on its own");
  assert.equal(hasRoleSection({ fit: { roles: ["Branch Manager"], why: "", level: "", note: "", posting: { summary: "", missing: [], covered: [], lead: [], trim: [] } } } as never), false, "no note and one title: no section at all");
  assert.deepEqual(fitListRoles(fit(["Shift Supervisor", "Freelance Web Developer"])), ["Shift Supervisor", "Freelance Web Developer"], "two directions are listed");
  assert.deepEqual(fitListRoles(fit(["Data Analyst", " Data Analyst ", "", "Product Analyst"])), ["Data Analyst", "Product Analyst"], "blanks and repeats go");
  assert.deepEqual(fitListRoles(fit(["A", "B", "C", "D", "E"])), ["A", "B", "C", "D"], "four at most");
  const profile = { ...(fit(["Talent Acquisition Partner"]) as object), document: "linkedin" } as never;
  assert.deepEqual(fitListRoles(profile), ["Talent Acquisition Partner"], "a profile lists the titles on it, even one");
  assert.equal(fitHeading(fit(["Branch Manager"])), "Where your experience points.", "with no list, the heading promises no roles");
  assert.equal(fitHeading(fit(["Shift Supervisor", "Freelance Web Developer"])), "Roles your experience points toward.");
  assert.equal(fitHeading(profile), "The words a recruiter would search for.");
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

// ---- Compare my revision loads a worklist report (live walk, November 17, 2026) ----
// The loader checked the older report shape only, so every report since November 6 said "Comparison unavailable".
void (async () => {
  const id = "bb93817d-f14d-4081-a39a-b143930f8530";
  const worklist = { ...JSON.parse(readFileSync(path.join(process.cwd(), "public/sample-report.json"), "utf8")), report_id: id };
  // The report endpoint returns the posting fields it stores, without the lists a posting read adds.
  worklist.fit = { ...worklist.fit, posting: { summary: "", missing: [] } };
  const originalFetch = global.fetch;
  const reply = (payload: unknown, status = 200) => { global.fetch = (async () => new Response(JSON.stringify(payload), { status })) as typeof fetch; };
  try {
    reply({ ok: true, report: worklist });
    const loaded = await loadSavedReportRevision(id, new AbortController().signal);
    assert.equal(loaded.state, "ready", "a worklist report is a baseline");
    assert.equal(loaded.baseline?.id, id);
    assert.equal((loaded.baseline as { verdict?: string } | null)?.verdict, worklist.verdict, "every field is kept for the comparison");
    const profile = { ...worklist, document: "linkedin" };
    reply({ ok: true, report: profile });
    assert.equal((await loadSavedReportRevision(id, new AbortController().signal)).state, "ready", "a LinkedIn review is one too");
    reply({ ok: true, report: { ...worklist, cards: "not a list" } });
    assert.equal((await loadSavedReportRevision(id, new AbortController().signal)).state, "error", "a malformed report is still refused");
    reply({ ok: true, report: { ...worklist, report_id: "22222222-2222-4222-8222-222222222222" } });
    assert.equal((await loadSavedReportRevision(id, new AbortController().signal)).state, "error", "and so is another report's id");
  } finally {
    global.fetch = originalFetch;
  }
  console.log("live-test fixes: revision baseline from a worklist report");
})().catch((error) => { console.error(error); process.exit(1); });
