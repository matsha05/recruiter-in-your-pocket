import assert from "node:assert/strict";
import { validateResumeFeedbackRequest } from "../lib/backend/validation";
import { buildResumeProviderMessages } from "../lib/llm/resume-provider-messages";
import { validateWorklistPayload } from "../lib/llm/worklist-validator";
import { WorklistReportSchema } from "../lib/llm/worklist-schema";
import { parseAnyReport } from "../lib/reports/report-shape";
import {
  isLinkedInReport,
  looksLikeLinkedInExport,
  reportDocumentKind,
  withReportDocument,
} from "../lib/reports/report-document";
import { PROFILE_BANDS, WORKLIST_BANDS, worklistBandsFor } from "../lib/reports/score-band";
import { cardsHeading, fitHeading, reportWording, upgradesLead, wordingFor } from "../lib/reports/worklist-presentation";
import { resolveEffectiveJobDescription } from "../lib/security/effectiveJobDescription";

/**
 * The LinkedIn profile review (Nov 10, 2026): the worklist report written from LinkedIn's PDF export. One
 * request field names the document; the prompt, the wording and the bands follow it; everything else is the
 * resume report's pipeline.
 */

// LinkedIn's "Save to PDF" export, as text: the side column first, then the profile.
const EXPORT = `Contact
priya@example.com
www.linkedin.com/in/priya-natarajan-8a1b2c3 (LinkedIn)

Top Skills
Go
PostgreSQL
Kafka

Priya Natarajan
Senior Backend Engineer at Northwind Pay
San Francisco Bay Area

Summary
Passionate engineer with a track record of delivering scalable solutions.

Experience

Northwind Pay
Senior Backend Engineer
March 2021 - Present (4 years 9 months)
San Francisco Bay Area
Worked on payouts and ledger services.

Kestrel Labs
Software Engineer
June 2018 - February 2021 (2 years 9 months)

Education
University of Michigan
Bachelor of Science, Computer Science · (2014 - 2018)

Page 1 of 1`;

// ---- The request ----
{
  const resume = validateResumeFeedbackRequest({ text: EXPORT });
  assert.equal(resume.ok, true);
  assert.equal(resume.value?.document, null, "a request that names no document is a resume");

  const profile = validateResumeFeedbackRequest({ text: EXPORT, document: "linkedin" });
  assert.equal(profile.ok, true);
  assert.equal(profile.value?.document, "linkedin");
  assert.equal(profile.value?.mode, "resume", "a profile review runs in the resume mode, so every resume gate applies to it");

  assert.equal(validateResumeFeedbackRequest({ text: EXPORT, document: "cover_letter" }).ok, false, "an unknown document is refused, never read as a resume");
  assert.equal(validateResumeFeedbackRequest({ text: EXPORT, mode: "linkedin" }).ok, false, "the old LinkedIn mode stays unreachable from this route");
}

// ---- Telling an export from any other file ----
{
  assert.equal(looksLikeLinkedInExport(EXPORT), true);
  assert.equal(looksLikeLinkedInExport("Jordan Lee\nMarketing Coordinator\n\nExperience\nNorthwind, 2021 to 2024\nlinkedin.com/company/northwind"), false, "a resume with an Experience heading is not a profile export");
  assert.equal(looksLikeLinkedInExport("Contact\nwww.linkedin.com/in/jordan-lee (LinkedIn)\nJordan Lee\nOpen to work"), false, "a profile with no Experience section has nothing to review");
}

// ---- The prompt the model gets ----
{
  const none = resolveEffectiveJobDescription(null);
  const profile = buildResumeProviderMessages({ mode: "resume", systemPrompt: "PROFILE PROMPT", text: EXPORT, effectiveJobDescription: none, document: "linkedin", today: "2026-11-10" });
  const user = profile.messages[2].content;
  assert.match(user, /Review the following LinkedIn profile, exported by LinkedIn as a PDF/);
  assert.match(user, /SOURCE CATALOG/, "a profile's quotes are checked against the same catalog as a resume's");
  assert.match(user, /Senior Backend Engineer at Northwind Pay/);
  assert.doesNotMatch(user, /Analyze the following resume content/);

  const resume = buildResumeProviderMessages({ mode: "resume", systemPrompt: "RESUME PROMPT", text: EXPORT, effectiveJobDescription: none, today: "2026-11-10" });
  assert.match(resume.messages[2].content, /Analyze the following resume content/);
}

// ---- The report: same contract, marked after validation ----
const draft = {
  contract_version: "v3",
  score: 64,
  lifted_by_employer: false,
  verdict: "Four years of payments work, shown as a job title and one line.",
  write_up: [
    "Your profile says you're a Senior Backend Engineer at Northwind Pay, and before that a Software Engineer at Kestrel Labs. That's most of what it says.",
    "Let's start with the headline, then the Northwind job.",
  ],
  cards: [
    {
      kind: "line",
      where: "Headline",
      line: "Senior Backend Engineer at Northwind Pay",
      cannot_tell: "This is the default LinkedIn fills in. It shows beside your name in search results, and it doesn't say what kind of backend work you do.",
      example: "Senior Backend Engineer | [what you build] | Go, PostgreSQL, Kafka",
      question: "What do you build at Northwind, in three or four words?",
    },
    {
      kind: "line",
      where: "Northwind Pay, description",
      line: "Worked on payouts and ledger services.",
      cannot_tell: "It names the systems and not what you did to them. Which part was yours?",
      example: "[What you did] on payouts and ledger services, which [what changed]",
      question: "What did you change on payouts or the ledger, and what was different afterward?",
    },
    {
      kind: "structure",
      where: "Kestrel Labs, description",
      line: "The Software Engineer job at Kestrel Labs has no description.",
      cannot_tell: "A recruiter knows where you worked and for how long, and nothing about what you built there.",
      example: "[What you built] for [who used it], which [what changed]",
      question: "What were the two or three things you built at Kestrel Labs?",
    },
  ],
  fit: {
    roles: ["Senior Backend Engineer"],
    why: "Your headline and your current job both say so.",
    level: "senior, the title on your current job",
    note: "This profile fits searches for backend engineers. It would fit payments searches too once the work is on it.",
    posting: { summary: "", missing: [] },
  },
};
{
  const validated = validateWorklistPayload(draft, EXPORT, { forceGrounding: true });
  assert.equal(validated.cards.length, 3, "a profile's quoted parts ground against the export exactly as resume lines do");
  assert.equal(reportDocumentKind(validated), "resume", "the model never marks the document");

  const marked = withReportDocument(validated, "linkedin");
  assert.equal(isLinkedInReport(marked), true);
  assert.equal(withReportDocument(validated, null), validated, "a resume report is returned as it is");

  // The mark survives the shapes a report passes through on its way to My reports and back.
  const reparsed = WorklistReportSchema.parse(marked);
  assert.equal(reparsed.document, "linkedin");
  const any = parseAnyReport(marked);
  assert.equal(any.success && isLinkedInReport(any.data), true);
  assert.equal("document" in WorklistReportSchema.parse(validated), false, "a resume report gains no field, so stored signatures still match");

  // A misquoted headline is refused, as a misquoted resume line is.
  const misquoted = { ...draft, cards: [{ ...draft.cards[0], line: "Senior Backend Engineer at Northwind" }, ...draft.cards.slice(1)] };
  assert.throws(() => validateWorklistPayload({ ...misquoted, cards: [{ ...misquoted.cards[0], line: "Staff Backend Engineer at Northwind Pay" }] }, EXPORT, { forceGrounding: true }), /not on the resume as written/);
  // An example that brings in a tool the profile never names is refused.
  const invented = { ...draft, cards: [{ ...draft.cards[0], example: "Senior Backend Engineer | Payments | Go, PostgreSQL, Rust" }] };
  assert.throws(() => validateWorklistPayload(invented, EXPORT, { forceGrounding: true }), /outside a bracket/);

  // ---- The wording follows the mark ----
  assert.equal(cardsHeading(marked).title, "Parts of your profile that need work.");
  assert.equal(cardsHeading(validated).title, "Lines that need work.");
  assert.equal(wordingFor(marked).header, "Your LinkedIn profile review");
  assert.match(wordingFor(marked).sourceLimits || "", /photo, your banner, your recommendations and your full skills list/);
  assert.equal(wordingFor(validated).sourceLimits, null);
  // The Open to Work frame: advice labelled as ours, with no number, and only on a profile review.
  assert.match(wordingFor(marked).sourceAdvice || "", /^It also can't show whether the green Open to Work frame is on your photo\. Our advice:/);
  assert.doesNotMatch(wordingFor(marked).sourceAdvice || "", /\d/);
  assert.equal(wordingFor(validated).sourceAdvice, null);
  // After the cards a profile review lists search words, where a resume report lists roles.
  assert.equal(fitHeading(marked), "The words a recruiter would search for.");
  assert.equal(fitHeading({ ...validated, fit: { ...validated.fit, roles: ["Customer Success Manager", "Account Manager"] } }), "Roles your experience points toward.");
  assert.equal(fitHeading({ ...validated, fit: { ...validated.fit, roles: ["Customer Success Manager"] } }), "Where your experience points.", "a resume's note alone promises no roles");
  const clean = { ...marked, cards: [] };
  assert.match(upgradesLead(clean), /Your profile probably isn't what stands between you and a recruiter's message/);
  for (const text of Object.values(reportWording("linkedin")).filter((value): value is string => typeof value === "string")) {
    assert.doesNotMatch(text, /resume/i, `a profile review never calls the profile a resume: "${text}"`);
    assert.doesNotMatch(text, /—/u);
  }
  assert.doesNotMatch(reportWording("linkedin").addressed(2), /resume/i);
}

// ---- The bands ----
{
  assert.equal(PROFILE_BANDS.length, WORKLIST_BANDS.length, "a profile sits on the same five thresholds");
  assert.deepEqual(PROFILE_BANDS.slice(0, 4).map((band) => band.name), WORKLIST_BANDS.slice(0, 4).map((band) => band.name));
  assert.equal(PROFILE_BANDS[4].name, "Nothing left to fix", "a profile is never sent, so its top band isn't Ready to send");
  assert.equal(worklistBandsFor("linkedin"), PROFILE_BANDS);
  assert.equal(worklistBandsFor("resume"), WORKLIST_BANDS);
  for (const band of PROFILE_BANDS) assert.doesNotMatch(band.anchor, /resume|send/i);
}

// ---- Every part of the profile, and how it stands (Nov 11, 2026) ----
{
  const { LINKEDIN_REPORT_JSON_SCHEMA, WORKLIST_REPORT_JSON_SCHEMA } = require("../lib/llm/worklist-schema");
  assert.ok(LINKEDIN_REPORT_JSON_SCHEMA.required.includes("parts"), "the profile contract asks for the parts");
  assert.equal(WORKLIST_REPORT_JSON_SCHEMA.required.includes("parts"), false, "the resume contract is untouched");
  assert.equal("parts" in WORKLIST_REPORT_JSON_SCHEMA.properties, false);

  const withParts = {
    ...draft,
    parts: [
      { name: "Headline", detail: "", status: "fine" },
      { name: "About", detail: "", status: "empty" },
      { name: "Northwind Pay", detail: "Senior Backend Engineer", status: "fine" },
      { name: "Kestrel Labs", detail: "Software Engineer", status: "empty" },
      { name: "Globex Corporation", detail: "Intern", status: "fine" },
      { name: "Top skills", detail: "", status: "fine" },
      { name: "Top skills", detail: "", status: "fine" },
    ],
  };
  const validated = validateWorklistPayload(withParts, EXPORT, { forceGrounding: true });
  const parts = validated.parts ?? [];
  assert.deepEqual(parts.map((part) => part.name), ["Headline", "About", "Northwind Pay", "Kestrel Labs", "Top skills"], "an employer that isn't on the profile is dropped, and a part is listed once");
  assert.equal(parts[0].status, "needs_work", "a part with a card that needs work is never shown as fine");
  assert.equal(parts[2].status, "needs_work");
  assert.equal(parts[3].status, "empty", "an empty part stays empty when it has a card");
  assert.equal(parts[4].status, "fine");

  const thin = validateWorklistPayload({ ...draft, parts: withParts.parts.slice(0, 2) }, EXPORT, { forceGrounding: true });
  assert.equal(thin.parts, undefined, "two parts aren't a picture of the profile; the strip is left off");
  assert.equal(validateWorklistPayload(draft, EXPORT, { forceGrounding: true }).parts, undefined, "a report without parts keeps its shape");

  const marked = withReportDocument(validated, "linkedin");
  assert.equal(WorklistReportSchema.parse(marked).parts?.length, 5, "the parts survive a save and a reload");
}

// ---- A posting on a profile review ----
{
  const { wordingFor } = require("../lib/reports/worklist-presentation");
  const profile = wordingFor({ document: "linkedin" });
  const resume = wordingFor({});
  assert.match(profile.postingMissingLabel, /profile/);
  assert.doesNotMatch(profile.postingMissingLabel + profile.postingMissingHow + profile.postingLeadLabel + profile.postingLeadHow, /resume/i, "a profile's posting lists never say resume");
  assert.match(resume.postingMissingLabel, /resume/);

  const none = resolveEffectiveJobDescription("Senior Backend Engineer, Payments. Required: Go, PostgreSQL, Kafka, on-call for the payouts path.");
  const withPosting = buildResumeProviderMessages({ mode: "resume", systemPrompt: "PROFILE PROMPT", text: EXPORT, effectiveJobDescription: none, document: "linkedin", today: "2026-11-11" });
  const system = withPosting.messages.filter((message) => message.role === "system").map((message) => message.content).join("\n");
  assert.doesNotMatch(system, /job_alignment/, "the resume's posting block is not added to the profile prompt");
  assert.match(withPosting.messages[withPosting.messages.length - 1].content, /on-call for the payouts path/, "the posting reaches the profile review");

  const prompt = require("node:fs").readFileSync(require("node:path").join(__dirname, "../prompts/linkedin_v3.txt"), "utf8");
  assert.match(prompt, /WITH A JOB POSTING/);
  assert.match(prompt, /\nPARTS\n/);
}

console.log("LinkedIn profile review tests passed.");
