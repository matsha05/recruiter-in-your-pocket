import assert from "node:assert/strict";
import {
  candidateNameOf,
  fixPositionLabel,
  formatReadTime,
  readAsChip,
  splitVerdict,
  targetRoleOf,
} from "../lib/reports/report-opening";

// The Verdict's first sentence leads the phone's first screen; the rest waits behind "Read the rest".
assert.deepEqual(
  splitVerdict("Your current role centers on customer relationships and renewals for a defined SaaS portfolio. The objective and soft-skill statements take up space without explaining what you do differently."),
  {
    lead: "Your current role centers on customer relationships and renewals for a defined SaaS portfolio.",
    rest: "The objective and soft-skill statements take up space without explaining what you do differently.",
  },
);

assert.deepEqual(
  splitVerdict("Backend ownership stands out quickly, particularly the 99.9% uptime and approximately 20% improvement in API response times. The caregiving break is clearly dated, but the summary has no later role."),
  {
    lead: "Backend ownership stands out quickly, particularly the 99.9% uptime and approximately 20% improvement in API response times.",
    rest: "The caregiving break is clearly dated, but the summary has no later role.",
  },
  "a decimal inside the first sentence doesn't end it",
);

// Three sentences: the lead is the first, the rest is the other two, joined.
assert.deepEqual(
  splitVerdict("Your senior marketing role is easy to place: you managed four marketers.  The 35% MQL increase is worth keeping. Your freelance work is less detailed."),
  {
    lead: "Your senior marketing role is easy to place: you managed four marketers.",
    rest: "The 35% MQL increase is worth keeping. Your freelance work is less detailed.",
  },
);

// Fallbacks: one sentence, a short first sentence, an abbreviation, a lowercase continuation.
const single = "Your internship and capstone point toward entry-level software engineering work.";
assert.deepEqual(splitVerdict(single), { lead: single, rest: null });
const short = "Clear and specific. Your ledger work connects a technical change to a concrete payment problem.";
assert.deepEqual(splitVerdict(short), { lead: short, rest: null }, "a first sentence under 40 characters stays with the rest");
const abbreviation = "You spent eight years at Northwind Traders Inc. The bullets there describe support more than ownership.";
assert.deepEqual(splitVerdict(abbreviation), { lead: abbreviation, rest: null }, "an abbreviation before the split keeps the Verdict whole");
const lowercase = "Your resume lists coursework and responsibilities across three internships. the capstone shows what you built.";
assert.deepEqual(splitVerdict(lowercase), { lead: lowercase, rest: null }, "a continuation that starts in lowercase is not trusted as a sentence break");
assert.deepEqual(splitVerdict("  "), { lead: "", rest: null });

// The header row's role and "Read as" chip come from role_fit, and only when they read as a chip.
assert.equal(targetRoleOf({ best_fit_roles: ["Customer Success Manager", "Account Manager"] }), "Customer Success Manager");
assert.equal(targetRoleOf({ best_fit_roles: [] }), null);
assert.equal(targetRoleOf(undefined), null);
assert.equal(readAsChip({ seniority_read: "Early career" }), "early career");
assert.equal(readAsChip({ seniority_read: "Entry level." }), "entry level");
assert.equal(readAsChip({ seniority_read: "Senior IC" }), "senior IC");
assert.equal(readAsChip({ seniority_read: "VP level" }), "VP level", "a leading acronym keeps its case");
assert.equal(readAsChip({ seniority_read: "The current title is Customer Success Manager; the resume does not state whether you manage people." }), null, "a sentence is not a chip");
assert.equal(readAsChip({ seniority_read: "Lead and design manager level, based on the title." }), null);
assert.equal(readAsChip({ seniority_read: "" }), null);
assert.equal(readAsChip(undefined), null);

// The name comes from the resume's first line, and only when that line looks like a name.
assert.equal(candidateNameOf("JORDAN A. MILLER\nDenver, CO · jmiller@example.com\n"), "Jordan A. Miller");
assert.equal(candidateNameOf("\n  Daniel Okafor\nColumbus, OH"), "Daniel Okafor");
assert.equal(candidateNameOf("María José O'Neil-Ruiz\nMadrid"), "María José O'Neil-Ruiz");
assert.equal(candidateNameOf("Senior product manager who led onboarding improvements across product, sales, and support."), null, "a sentence isn't a name");
assert.equal(candidateNameOf("jmiller@example.com\nJordan Miller"), null, "an email first line gives no name");
assert.equal(candidateNameOf("EXPERIENCE\nAcme"), null, "one word isn't a name");
assert.equal(candidateNameOf("Alex Rivera 2024 resume"), null, "digits aren't part of a name");
assert.equal(candidateNameOf("Restored original resume"), null, "lowercase words aren't a name");
assert.equal(candidateNameOf("Senior Software Engineer\nAlex Rivera"), null, "a job title isn't a name");
assert.equal(candidateNameOf("Curriculum Vitae"), null);
assert.equal(candidateNameOf("Alex Rivera\nProgram Manager"), "Alex Rivera");
assert.equal(candidateNameOf(""), null);
assert.equal(candidateNameOf(undefined), null);

// The read time is the clock, rounded to the second.
assert.equal(formatReadTime(72_400), "read in 1 min 12 s");
assert.equal(formatReadTime(48_200), "read in 48 s");
assert.equal(formatReadTime(120_000), "read in 2 min");
assert.equal(formatReadTime(400), null);
assert.equal(formatReadTime(Number.NaN), null);

// Fix cards say where they sit among the fixes, so a phone that hides the heading still orders them.
assert.equal(fixPositionLabel(1, 3), "Fix 2 of 3");
assert.equal(fixPositionLabel(2, 3), "Fix 3 of 3");
assert.equal(fixPositionLabel(0, 1), "Fix 1");

console.log("report-opening tests passed");
