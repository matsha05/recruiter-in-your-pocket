import assert from "node:assert/strict";
import { renderReportHtml } from "../lib/backend/pdf";
import { auditReportNarrative } from "../lib/llm/source-fidelity";
import { normalizeReportForPdf } from "../lib/reports/pdf-export";
import { getScoreLabel } from "../lib/score-utils";
import { assertReportGrounding, ResumeFeedbackResponseSchema } from "../lib/validation/schemas";
import {
  auditedPublicNarrativePaths,
  hubspotJobDescription,
  hubspotSource,
  renderedClaimProbe,
  schemaValidReport,
  unsafePublicClaim,
} from "./helpers/report-fidelity-fixture";

const partialAnchorClaims = [
  "Built payroll automation in HubSpot.",
  "Built payroll workflows in HubSpot.",
  "Built customer payroll workflows in HubSpot.",
] as const;
const processFormCases = [
  ["billing", "billed"],
  ["onboarding", "onboarded"],
  ["hiring", "hired"],
  ["tracking", "tracked"],
] as const;
const mixedPolaritySource = "Did not build payroll automation; built customer workflows in HubSpot.";
const mixedPolarityMutation = "Built customer payroll automation workflows in HubSpot.";

const narrativePathsFor = (claim: string, source: string) => {
  const probe = JSON.parse(JSON.stringify(renderedClaimProbe).replaceAll(unsafePublicClaim, claim));
  return new Set(auditReportNarrative(probe, source).map(({ path }) => path));
};

const renderedAuditPaths = narrativePathsFor(unsafePublicClaim, hubspotSource);
for (const renderedPath of auditedPublicNarrativePaths) {
  assert.ok(renderedAuditPaths.has(renderedPath), `${renderedPath} must be covered by the public narrative audit`);
}

for (const claim of ["Built payroll automation.", ...partialAnchorClaims]) {
  const issuePaths = narrativePathsFor(claim, hubspotSource);
  for (const renderedPath of auditedPublicNarrativePaths) {
    assert.ok(issuePaths.has(renderedPath), `${renderedPath} must reject ungrounded prose: ${claim}`);
  }
}

for (const [claim, source, label] of [
  ["The customer count is visible.", hubspotSource, "unsourced positive count"],
  ["payroll automation is visible.", "Did not build payroll automation.", "negated-source positive presence"],
  ...processFormCases.map(([processNoun, actionVerb]) => [
    `HubSpot ${actionVerb} customers.`,
    `Built customer ${processNoun} workflows in HubSpot.`,
    `${processNoun}/${actionVerb} form mutation`,
  ] as const),
  [mixedPolarityMutation, mixedPolaritySource, "cross-clause polarity mutation"],
] as const) {
  const issuePaths = narrativePathsFor(claim, source);
  for (const renderedPath of auditedPublicNarrativePaths) {
    assert.ok(issuePaths.has(renderedPath), `${renderedPath} must reject ${label}`);
  }
}

const validSchemaResult = ResumeFeedbackResponseSchema.safeParse(schemaValidReport);
assert.equal(validSchemaResult.success, true, "the adversarial control must remain schema-valid");
assert.equal(validSchemaResult.data.score_label, getScoreLabel(schemaValidReport.score));
const controlGrounding = assertReportGrounding(validSchemaResult.data, hubspotSource, hubspotJobDescription);
assert.equal(
  controlGrounding.ok,
  true,
  `the control report must be grounded: ${JSON.stringify(controlGrounding.inventedSpecifics)}`,
);

const assertKeywordRejected = (
  report: typeof schemaValidReport,
  jobDescription: string,
  expectedPath: string,
  label: string,
) => {
  const schemaResult = ResumeFeedbackResponseSchema.safeParse(report);
  assert.equal(schemaResult.success, true, `${label} must remain schema-valid`);
  const grounding = assertReportGrounding(schemaResult.data, hubspotSource, jobDescription);
  assert.equal(grounding.ok, false, `${label} must fail grounding`);
  assert.ok(grounding.inventedSpecifics.some((issue) => issue.includes(expectedPath)), `${label} must identify ${expectedPath}`);
};

const absentMatchedKeywordReport = structuredClone(schemaValidReport);
absentMatchedKeywordReport.job_alignment.jd_keywords.matched[0] = "Salesforce";
assertKeywordRejected(
  absentMatchedKeywordReport,
  hubspotJobDescription,
  "job_alignment.jd_keywords.matched[0]",
  "a matched keyword absent from resume and JD",
);
assertKeywordRejected(
  structuredClone(schemaValidReport),
  "The role requires customer count reporting.",
  "job_alignment.jd_keywords.matched[0]",
  "a matched keyword absent from the JD",
);

const presentMissingKeywordReport = structuredClone(schemaValidReport);
presentMissingKeywordReport.job_alignment.jd_keywords = {
  matched: [],
  missing: ["HubSpot"],
  match_count: 0,
  total_count: 1,
};
assertKeywordRejected(
  presentMissingKeywordReport,
  hubspotJobDescription,
  "job_alignment.jd_keywords.missing[0]",
  "a missing keyword already present in the resume",
);

const absentFromJdMissingKeywordReport = structuredClone(schemaValidReport);
absentFromJdMissingKeywordReport.job_alignment.jd_keywords.missing[0] = "Salesforce";
assertKeywordRejected(
  absentFromJdMissingKeywordReport,
  hubspotJobDescription,
  "job_alignment.jd_keywords.missing[0]",
  "a missing keyword absent from the JD",
);

for (const [label, mutate] of [
  ["match count mismatch", (report: typeof schemaValidReport) => { report.job_alignment.jd_keywords.match_count = 2; }],
  ["total count mismatch", (report: typeof schemaValidReport) => { report.job_alignment.jd_keywords.total_count = 3; }],
  ["normalized duplicate", (report: typeof schemaValidReport) => {
    report.job_alignment.jd_keywords.matched = ["HubSpot", " hubspot "];
  }],
  ["matched and missing overlap", (report: typeof schemaValidReport) => {
    report.job_alignment.jd_keywords.missing = [" hubspot "];
  }],
  ["whitespace-only keyword", (report: typeof schemaValidReport) => {
    report.job_alignment.jd_keywords.missing = ["   "];
  }],
] as const) {
  const report = structuredClone(schemaValidReport);
  mutate(report);
  assert.equal(ResumeFeedbackResponseSchema.safeParse(report).success, false, `${label} must fail schema validation`);
}

const unsafeEnhancementNote = "Add Salesforce-driven 45% revenue growth for 10,000 customers.";
const unsafeEnhancementReport = {
  ...structuredClone(schemaValidReport),
  rewrites: [{
    label: "Clarity",
    original: hubspotSource,
    better: "Created customer journeys using HubSpot.",
    enhancement_note: unsafeEnhancementNote,
  }],
};
const unsafeEnhancementSchema = ResumeFeedbackResponseSchema.safeParse(unsafeEnhancementReport);
assert.equal(unsafeEnhancementSchema.success, true, "the unsafe enhancement-note probe must remain schema-valid");
const unsafeEnhancementGrounding = assertReportGrounding(
  unsafeEnhancementSchema.data,
  hubspotSource,
  hubspotJobDescription,
);
assert.equal(unsafeEnhancementGrounding.ok, false, "invented enhancement-note facts must fail grounding");
assert.ok(
  unsafeEnhancementGrounding.inventedSpecifics.some((issue) => issue.includes("rewrites[0].enhancement_note")),
  "the grounding error must identify the rendered enhancement note",
);
const normalizedUnsafeEnhancement = normalizeReportForPdf(unsafeEnhancementSchema.data);
assert.ok(normalizedUnsafeEnhancement, "the PDF preservation probe must normalize");
assert.equal(normalizedUnsafeEnhancement?.rewrites[0].enhancement_note, unsafeEnhancementNote);
assert.ok(
  renderReportHtml(normalizedUnsafeEnhancement!).includes(unsafeEnhancementNote),
  "the regression must cover the note's rendered PDF/HTML surface",
);

const safeEnhancementReport = structuredClone(unsafeEnhancementReport);
safeEnhancementReport.rewrites[0].enhancement_note = "Add customer count.";
const safeEnhancementSchema = ResumeFeedbackResponseSchema.safeParse(safeEnhancementReport);
assert.equal(safeEnhancementSchema.success, true, "the safe enhancement-note control must remain schema-valid");
assert.equal(
  assertReportGrounding(safeEnhancementSchema.data, hubspotSource, hubspotJobDescription).ok,
  true,
  "a source-bound advice note must remain useful",
);

const assertRejectedScoreComment = (report: typeof schemaValidReport, source: string, label: string) => {
  const schemaResult = ResumeFeedbackResponseSchema.safeParse(report);
  assert.equal(schemaResult.success, true, `${label} probe must remain schema-valid`);
  const grounding = assertReportGrounding(schemaResult.data, source, hubspotJobDescription);
  assert.equal(grounding.ok, false, `${label} must fail grounding`);
  assert.ok(
    grounding.inventedSpecifics.some((issue) => issue.includes("score_comment_short")),
    `${label} error must identify score_comment_short`,
  );
};

const unanchoredScoreReport = structuredClone(schemaValidReport);
unanchoredScoreReport.score_comment_short = "Built payroll automation.";
assertRejectedScoreComment(unanchoredScoreReport, hubspotSource, "unanchored score comment");

for (const partialAnchorClaim of partialAnchorClaims) {
  const partialAnchorScoreReport = structuredClone(schemaValidReport);
  partialAnchorScoreReport.score_comment_short = partialAnchorClaim;
  assertRejectedScoreComment(partialAnchorScoreReport, hubspotSource, `partial-anchor claim ${partialAnchorClaim}`);
}

const countPresenceReport = structuredClone(schemaValidReport);
countPresenceReport.score_comment_short = "The customer count is visible.";
assertRejectedScoreComment(countPresenceReport, hubspotSource, "positive count assertion");

const safeInterpretationReport = structuredClone(schemaValidReport);
safeInterpretationReport.gaps[0] = "The customer count is missing.";
safeInterpretationReport.next_steps[0] = "Add customer count.";
safeInterpretationReport.ideas.questions[0] = {
  question: "What customer count can you verify?",
  archetype: "SCALING",
  why: "The answer adds context.",
};
const safeInterpretationSchema = ResumeFeedbackResponseSchema.safeParse(safeInterpretationReport);
assert.equal(safeInterpretationSchema.success, true, "the safe interpretation probe must remain schema-valid");
assert.equal(
  assertReportGrounding(safeInterpretationSchema.data, hubspotSource, hubspotJobDescription).ok,
  true,
  "missing/advice/question templates must remain grounded without asserting an absent count",
);

for (const [processNoun, actionVerb] of processFormCases) {
  const source = `Built customer ${processNoun} workflows in HubSpot.`;
  const actionReport = structuredClone(schemaValidReport);
  actionReport.score_comment_short = `HubSpot ${actionVerb} customers.`;
  actionReport.biggest_gap_example = `“${source}” needs customer count.`;
  actionReport.top_fixes[0].evidence.excerpt = source;
  assertRejectedScoreComment(actionReport, source, `${processNoun}/${actionVerb} action`);
}

const mixedPolarityReport = structuredClone(schemaValidReport);
mixedPolarityReport.score_comment_short = mixedPolarityMutation;
mixedPolarityReport.biggest_gap_example = `“${mixedPolaritySource}” needs customer count.`;
mixedPolarityReport.top_fixes[0].evidence.excerpt = mixedPolaritySource;
assertRejectedScoreComment(mixedPolarityReport, mixedPolaritySource, "mixed-polarity score comment");

const contrastPolaritySource = "Did not build payroll automation, but built customer workflows in HubSpot.\nHubSpot customer workflows.";
const contrastPositiveExcerpt = "built customer workflows in HubSpot.";
const contrastFalseNegativeReport = structuredClone(schemaValidReport);
contrastFalseNegativeReport.score_comment_short = "Did not build customer workflows in HubSpot.";
contrastFalseNegativeReport.biggest_gap_example = `“${contrastPositiveExcerpt}” needs customer count.`;
contrastFalseNegativeReport.top_fixes[0].evidence.excerpt = contrastPositiveExcerpt;
assertRejectedScoreComment(
  contrastFalseNegativeReport,
  contrastPolaritySource,
  "contrast-boundary false negative",
);

const contrastPositiveReport = structuredClone(contrastFalseNegativeReport);
contrastPositiveReport.score_comment_short = hubspotSource;
const contrastPositiveSchema = ResumeFeedbackResponseSchema.safeParse(contrastPositiveReport);
assert.equal(contrastPositiveSchema.success, true, "the contrast positive control must remain schema-valid");
const contrastPositiveGrounding = assertReportGrounding(
  contrastPositiveSchema.data,
  contrastPolaritySource,
  hubspotJobDescription,
);
assert.equal(
  contrastPositiveGrounding.ok,
  true,
  `the locally sourced positive clause must remain usable in a full report: ${JSON.stringify(contrastPositiveGrounding)}`,
);

console.log("report narrative fidelity tests passed");
