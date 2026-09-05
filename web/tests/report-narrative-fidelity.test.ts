import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { validateResumeModelPayload } from "../lib/backend/validation";
import { renderReportHtml } from "../lib/backend/pdf";
import { containsExactEvidence } from "../lib/llm/grounding";
import { auditNarrativeClaim, auditReportNarrative } from "../lib/llm/source-fidelity";
import { supportsInferredIndustrySignal } from "../lib/llm/source-industry-signals";
import { auditableNarrativeValue } from "../lib/llm/narrative-fact-support";
import { normalizeReportForPdf } from "../lib/reports/pdf-export";
import { RewriteEnhancementNote } from "../lib/reports/rewrite-enhancement-note";
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
const fullControlResume = [
  "SUMMARY", "Customer operations profile.", "WORK EXPERIENCE", hubspotSource,
  "SKILLS", "HubSpot", "EDUCATION", "State University", "Growth-stage company.", "Show HubSpot.",
].join("\n");

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

for (const [source, excerpt] of [
  ["Salesforce", "Salesforce"], ["$9M", "$9M"], ["C++", "C++"], [".NET", ".NET"],
] as const) assert.equal(containsExactEvidence(source, excerpt), true, `${excerpt} must remain valid short evidence`);
for (const [source, excerpt] of [
  ["Salesforce", "Sales"], ["$19M", "9M"], ["C++", "C"], [".NET", "NET"],
] as const) assert.equal(containsExactEvidence(source, excerpt), false, `${excerpt} must respect source boundaries`);

for (const excerpt of ["10,000", "Salesforce", "$9M"]) {
  const shortInventedEvidence = structuredClone(schemaValidReport);
  shortInventedEvidence.top_fixes[0].evidence.excerpt = excerpt;
  const parsed = ResumeFeedbackResponseSchema.parse(shortInventedEvidence);
  assert.ok(
    Array.from(assertReportGrounding(parsed, hubspotSource, hubspotJobDescription).missingEvidence)
      .includes("top_fixes[0].evidence.excerpt"),
    `${excerpt} must fail the grounding boundary even though it is short`,
  );
  assert.throws(
    () => validateResumeModelPayload(shortInventedEvidence, hubspotSource, { forceGrounding: true, jobDescription: hubspotJobDescription }),
    /evidence grounding contract/,
    `${excerpt} must never reach a rendered evidence surface`,
  );
}
const legitimateShortEvidence = structuredClone(schemaValidReport);
legitimateShortEvidence.top_fixes[0].evidence.excerpt = "HubSpot";
assert.doesNotThrow(() => validateResumeModelPayload(
  legitimateShortEvidence,
  fullControlResume,
  { forceGrounding: true, jobDescription: hubspotJobDescription },
));

const unmodeledPdfClaim = "$10M Salesforce revenue growth for 10,000 customers.";
const reportWithUnknownModelFields = {
  ...structuredClone(schemaValidReport),
  missing_wins: [unmodeledPdfClaim],
  generated_on: "January 1, 1900",
  unknown_top_level: unmodeledPdfClaim,
  top_fixes: [{
    ...structuredClone(schemaValidReport.top_fixes[0]),
    text: unmodeledPdfClaim,
  }],
  job_alignment: {
    ...structuredClone(schemaValidReport.job_alignment),
    legacy_banner: unmodeledPdfClaim,
  },
};
const strippedUnknownSchema = ResumeFeedbackResponseSchema.safeParse(reportWithUnknownModelFields);
assert.equal(strippedUnknownSchema.success, true, "known report fields must survive unknown-field stripping");
for (const unknownField of ["missing_wins", "generated_on", "unknown_top_level"]) {
  assert.equal(unknownField in strippedUnknownSchema.data, false, `${unknownField} must not survive model validation`);
}
assert.equal("text" in strippedUnknownSchema.data.top_fixes[0], false, "legacy top-fix text must be stripped");
assert.equal("legacy_banner" in strippedUnknownSchema.data.job_alignment, false, "unknown nested model copy must be stripped");
assert.equal(strippedUnknownSchema.data.ideas.questions.length, 5, "the supported questions surface must remain compatible");
assert.equal(
  assertReportGrounding(strippedUnknownSchema.data, hubspotSource, hubspotJobDescription).ok,
  true,
  "stripping unknown copy must preserve a grounded report",
);

for (const candidate of [reportWithUnknownModelFields, strippedUnknownSchema.data]) {
  const normalized = normalizeReportForPdf(candidate);
  assert.ok(normalized, "the supported PDF report must still normalize");
  assert.equal("missing_wins" in normalized!, false);
  assert.equal("generated_on" in normalized!, false);
  const html = renderReportHtml(normalized!);
  assert.equal(html.includes(unmodeledPdfClaim), false, "unmodeled copy must never reach PDF HTML");
  assert.equal(html.includes("January 1, 1900"), false, "the PDF date must be derived server-side");
  assert.ok(html.includes(schemaValidReport.next_steps[0]), "supported next steps must remain printable");
}

const noJobDescriptionPayload = structuredClone(schemaValidReport);
noJobDescriptionPayload.job_alignment.jd_match_score = 0;
noJobDescriptionPayload.job_alignment.jd_match_summary = "No job description provided.";
noJobDescriptionPayload.job_alignment.jd_keywords = { matched: [], missing: [], match_count: 0, total_count: 0 };
noJobDescriptionPayload.job_alignment.missing = ["No target-role requirements were provided for comparison"];
const noJobDescriptionResume = fullControlResume;
const initialNoJdValidation = validateResumeModelPayload(
  structuredClone(noJobDescriptionPayload),
  noJobDescriptionResume,
  { forceGrounding: true },
);
assert.equal(initialNoJdValidation.job_alignment.jd_match_summary, "No job description provided.");
assert.deepEqual(
  initialNoJdValidation.job_alignment.missing,
  ["No target-role requirements were provided for comparison"],
);
const repairShapedNoJdValidation = validateResumeModelPayload(
  structuredClone(initialNoJdValidation),
  noJobDescriptionResume,
  { forceGrounding: true },
);
assert.equal(repairShapedNoJdValidation.job_alignment.jd_match_summary, "No job description provided.");
assert.deepEqual(repairShapedNoJdValidation.job_alignment.jd_keywords, {
  matched: [],
  missing: [],
  match_count: 0,
  total_count: 0,
});

const noJdAliasPayload = structuredClone(noJobDescriptionPayload);
noJdAliasPayload.job_alignment.jd_match_summary = "No JD provided.";
assert.throws(
  () => validateResumeModelPayload(noJdAliasPayload, noJobDescriptionResume, { forceGrounding: true }),
  /evidence grounding contract/,
  "a no-JD alias must not receive the structural absence exemption",
);
assert.throws(
  () => validateResumeModelPayload(
    structuredClone(noJobDescriptionPayload),
    noJobDescriptionResume,
    { forceGrounding: true, jobDescription: hubspotJobDescription },
  ),
  /evidence grounding contract/,
  "the no-JD sentinel must not be exempt when a sanitized JD exists",
);

const limitedOwnershipSource = "Supported customer workflows in HubSpot.";
const limitedOwnershipReport = JSON.parse(
  JSON.stringify(schemaValidReport).replaceAll(hubspotSource, limitedOwnershipSource),
);
const limitedOwnershipResume = [
  noJobDescriptionResume.replace(hubspotSource, limitedOwnershipSource),
  ...[20, 21, 22].map((value) => `- Supported customer workflows in HubSpot, increasing adoption by ${value}%.`),
].join("\n");
const groundedNarrative = {
  score_comment_short: limitedOwnershipReport.score_comment_short,
  score_comment_long: limitedOwnershipReport.score_comment_long,
  score_plain: limitedOwnershipReport.score_plain,
};
const calibratedInitial = validateResumeModelPayload(
  limitedOwnershipReport,
  limitedOwnershipResume,
  { forceGrounding: true, jobDescription: hubspotJobDescription },
);
assert.equal(calibratedInitial.score, 78, "outcome evidence may still calibrate the numeric score");
for (const [key, value] of Object.entries(groundedNarrative)) assert.equal(calibratedInitial[key], value);
assert.equal(assertReportGrounding(calibratedInitial, limitedOwnershipResume, hubspotJobDescription).ok, true);
const calibratedRepair = validateResumeModelPayload(
  structuredClone(calibratedInitial),
  limitedOwnershipResume,
  { forceGrounding: true, jobDescription: hubspotJobDescription },
);
for (const [key, value] of Object.entries(groundedNarrative)) assert.equal(calibratedRepair[key], value);
assert.equal(assertReportGrounding(calibratedRepair, limitedOwnershipResume, hubspotJobDescription).ok, true);

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

const negatedEnhancementReport = structuredClone(unsafeEnhancementReport);
negatedEnhancementReport.rewrites[0].enhancement_note = "Add customer workflows that are not in HubSpot.";
const negatedEnhancementSchema = ResumeFeedbackResponseSchema.parse(negatedEnhancementReport);
const negatedEnhancementGrounding = assertReportGrounding(
  negatedEnhancementSchema,
  hubspotSource,
  hubspotJobDescription,
);
assert.equal(negatedEnhancementGrounding.ok, false, "advice must not invert positive source evidence");
assert.ok(negatedEnhancementGrounding.inventedSpecifics.some((issue) => issue.includes("rewrites[0].enhancement_note")));
assert.throws(
  () => validateResumeModelPayload(negatedEnhancementReport, hubspotSource, { forceGrounding: true, jobDescription: hubspotJobDescription }),
  /evidence grounding contract/,
);

const safeEnhancementReport = structuredClone(unsafeEnhancementReport);
safeEnhancementReport.rewrites[0].enhancement_note = "Add [missing scope] or [verified result].";
const safeEnhancementSchema = ResumeFeedbackResponseSchema.safeParse(safeEnhancementReport);
assert.equal(safeEnhancementSchema.success, true, "the safe enhancement-note control must remain schema-valid");
assert.equal(
  assertReportGrounding(safeEnhancementSchema.data, hubspotSource, hubspotJobDescription).ok,
  true,
  "a source-bound advice note must remain useful",
);
const safeEnhancementNote = safeEnhancementSchema.data.rewrites[0].enhancement_note;
const browserEnhancementHtml = renderToStaticMarkup(createElement(RewriteEnhancementNote, { note: safeEnhancementNote }));
const safeEnhancementPdf = renderReportHtml(normalizeReportForPdf(safeEnhancementSchema.data)!);
for (const html of [browserEnhancementHtml, safeEnhancementPdf]) {
  assert.ok(html.includes("Before you use this"));
  assert.ok(html.includes(safeEnhancementNote), "browser and PDF must render the same grounded enhancement note");
}

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

const assessmentSource = `${fullControlResume}\nIncreased adoption by 22%.`;
for (const recruiterAssessment of [
  "Several concrete outcomes are visible, with a few uneven areas still limiting the first read.",
  "Relevant experience is clear, but measurable results are limited.",
  "Useful results are present, but earlier work remains partly responsibility-based.",
  "Quantified impact is uneven across the page.",
]) {
  const assessmentReport = structuredClone(schemaValidReport);
  assessmentReport.score_comment_short = recruiterAssessment;
  assert.doesNotThrow(
    () => validateResumeModelPayload(assessmentReport, assessmentSource, {
      forceGrounding: true,
      jobDescription: hubspotJobDescription,
    }),
    `recruiter assessment language must not be treated as an invented resume fact: ${recruiterAssessment}`,
  );
}

for (const inventedAssessment of [
  "Salesforce is visible.",
  "$9M impact is visible.",
]) {
  const assessmentReport = structuredClone(schemaValidReport);
  assessmentReport.score_comment_short = inventedAssessment;
  assert.throws(
    () => validateResumeModelPayload(assessmentReport, assessmentSource, {
      forceGrounding: true,
      jobDescription: hubspotJobDescription,
    }),
    /evidence grounding contract/,
    `invented named or numeric facts must remain blocked: ${inventedAssessment}`,
  );
}

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

for (const [claim, source, label] of [
  ["Checkov creates a consistent cloud-platform focus.", "Used Checkov to ensure changes did not expose new security risks.", "tool named in a negative-risk clause"],
  ["KPI reporting is underplayed.", "Built a framework with KPIs around onboarding time and incident rates.", "singular KPI against plural KPIs"],
  ["REST APIs are easy to scan.", "Implemented RESTful API endpoints.", "REST and RESTful equivalence"],
  ["CI/CD is easy to scan.", "Practices: Continuous Integration/Delivery.", "CI/CD expansion"],
  ["The $12M+ budget stands out.", "Managed budgets exceeding $12M.", "greater-than metric equivalence"],
  ["Bring the portal work serving over 200,000 users forward.", "Designed portals serving over 200,000 monthly users.", "monthly must not parse as a million suffix"],
  ["Expanded small-group ministry from six to eighteen active groups provides a concrete program-growth result.", "Expanded small-group ministry from six to eighteen active groups.", "direction followed by assessment wording"],
  ["Scaling the Solutions Engineering Org from <5 to 300+ employees shows substantial expansion.", "Scaled the Solutions Engineering Org from <5 to 300+ employees, managing teams across regions.", "direction followed by comma gerund"],
] as const) {
  assert.deepEqual(
    auditNarrativeClaim(claim, source, { interpretationContext: "assessment", rejectPositiveSourceAbsence: true }),
    [],
    label,
  );
}
assert.equal(auditableNarrativeValue("strengths[0]", "U.S. tax responsibility"), "US tax responsibility");
assert.equal(
  supportsInferredIndustrySignal("Education", "Elementary teacher responsible for a classroom of 28 students."),
  true,
  "canonical industry labels must be supported by deterministic source evidence",
);
console.log("report narrative fidelity tests passed");
