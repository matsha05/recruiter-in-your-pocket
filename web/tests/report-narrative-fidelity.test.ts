import assert from "node:assert/strict";
import { auditReportNarrative } from "../lib/llm/source-fidelity";
import { assertReportGrounding, ResumeFeedbackResponseSchema } from "../lib/validation/schemas";
import {
  auditedPublicNarrativePaths,
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
const controlGrounding = assertReportGrounding(validSchemaResult.data, hubspotSource);
assert.equal(
  controlGrounding.ok,
  true,
  `the control report must be grounded: ${JSON.stringify(controlGrounding.inventedSpecifics)}`,
);

const assertRejectedScoreComment = (report: typeof schemaValidReport, source: string, label: string) => {
  const schemaResult = ResumeFeedbackResponseSchema.safeParse(report);
  assert.equal(schemaResult.success, true, `${label} probe must remain schema-valid`);
  const grounding = assertReportGrounding(schemaResult.data, source);
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
  assertReportGrounding(safeInterpretationSchema.data, hubspotSource).ok,
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

console.log("report narrative fidelity tests passed");
