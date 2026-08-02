import assert from "node:assert/strict";
import { validateResumeModelPayload } from "../lib/backend/validation";
import { checkEvidence, checkRewriteGrounding } from "../lib/evals/evidence-checks";
import { containsExactEvidence, isAcceptedAbsenceMarker } from "../lib/llm/grounding";
import { auditReportNarrative, compareSourceBoundRewrite } from "../lib/llm/source-fidelity";
import { assertReportGrounding, ResumeFeedbackResponseSchema } from "../lib/validation/schemas";
import {
  hubspotJobDescription,
  hubspotSource,
  schemaValidReport,
} from "./helpers/report-fidelity-fixture";

for (const sentinel of [
  "No job description provided",
  "No matching job description provided",
  "No LinkedIn profile provided",
]) {
  assert.equal(isAcceptedAbsenceMarker(sentinel, hubspotSource, "Experience"), false);
  const report = structuredClone(schemaValidReport);
  report.top_fixes[0].evidence.excerpt = sentinel;
  assert.equal(
    assertReportGrounding(ResumeFeedbackResponseSchema.parse(report), hubspotSource, hubspotJobDescription).ok,
    false,
    `${sentinel} must not stand in for resume evidence`,
  );
}
assert.equal(isAcceptedAbsenceMarker("No education section present", hubspotSource, "Education"), true);
assert.equal(isAcceptedAbsenceMarker("No education section present", hubspotSource, "Summary"), false);
assert.equal(containsExactEvidence("1.0", "1"), false, "numeric evidence must not split a decimal literal");

for (const [source, excerpt] of [
  ["Built C＋＋ services", "C"],
  ["Built ．NET services", "NET"],
  ["Generated ＄9M", "9M"],
  ["Supported Sales／force workflows", "Sales"],
] as const) {
  assert.equal(containsExactEvidence(source, excerpt), false, `${excerpt} must not cross a compatibility boundary`);
  assert.ok(checkEvidence([{ fix: "Add [measurable result].", evidence: { excerpt, section: "Experience" } }], source)
    .some(({ passed }) => !passed), "eval evidence must mirror the production boundary");
}

const ambiguousSource = [
  "Built customer workflows in HubSpot for billing.",
  "Built customer workflows in HubSpot for onboarding.",
].join("\n");
const ambiguousReport: any = structuredClone(schemaValidReport);
ambiguousReport.rewrites = [{
  label: "Clarity",
  original: "customer workflows in HubSpot",
  better: "Created customer workflows using HubSpot.",
  enhancement_note: "Add [measurable result].",
}];
for (const attempt of ["initial", "repair"]) {
  assert.throws(
    () => validateResumeModelPayload(structuredClone(ambiguousReport), ambiguousSource, { forceGrounding: true }),
    /ambiguous source evidence/,
    `${attempt} validation must preserve ambiguous locator status`,
  );
}
assert.ok(checkRewriteGrounding(ambiguousReport.rewrites, ambiguousSource).some(({ passed }) => !passed));
const flattenedDuplicate = `${hubspotSource} ${hubspotSource}`;
const flattenedDuplicateReport: any = structuredClone(schemaValidReport);
flattenedDuplicateReport.rewrites = [{
  label: "Clarity",
  original: hubspotSource,
  better: "Created customer journeys using HubSpot.",
  enhancement_note: "Add [measurable result].",
}];
assert.throws(
  () => validateResumeModelPayload(flattenedDuplicateReport, flattenedDuplicate, { forceGrounding: true }),
  /ambiguous source evidence/,
  "two bounded occurrences on one flattened line must remain ambiguous",
);

for (const source of [
  "Built customer billing workflows in HubSpot.",
  "Built customer onboarding workflows in HubSpot.",
  "Built workflows for enterprise customers in HubSpot.",
]) {
  const candidate = "Created customer workflows using HubSpot.";
  assert.equal(
    compareSourceBoundRewrite({ sourceText: source, sourceLocator: source, candidate }).safe,
    false,
    `rewrite must not drop material source scope from: ${source}`,
  );
}

for (const enhancementNote of [
  "Add that customer workflows are missing from HubSpot.",
  "Add that customer workflows are missing in HubSpot.",
  "Add that customer workflows are not visible in HubSpot.",
  "Add that customer workflows are not present in HubSpot.",
  "Add that customer workflows are unclear in HubSpot.",
  "Add that customer workflows are not clear in HubSpot.",
  "Add that customer workflows are ｍｉｓｓｉｎｇ ｉｎ HubSpot.",
  "Add that customer work\u2063flows are unclear in HubSpot.",
]) {
  const report: any = structuredClone(schemaValidReport);
  report.rewrites = [{
    label: "Clarity", original: hubspotSource, better: "Created customer journeys using HubSpot.", enhancement_note: enhancementNote,
  }];
  assert.ok(auditReportNarrative(report, hubspotSource, hubspotJobDescription)
    .some(({ path }) => path === "rewrites[0].enhancement_note"), enhancementNote);
}

const safePlaceholderReport: any = structuredClone(schemaValidReport);
safePlaceholderReport.rewrites = [{
  label: "Clarity",
  original: hubspotSource,
  better: "Created customer journeys using HubSpot.",
  enhancement_note: "Add [missing scope] or [verified result].",
}];
assert.equal(
  auditReportNarrative(safePlaceholderReport, hubspotSource, hubspotJobDescription)
    .some(({ path }) => path === "rewrites[0].enhancement_note"),
  false,
  "explicit neutral placeholders must remain valid advice",
);

for (const factualPlaceholder of [
  "onboarding revenue increase",
  "customer onboarding completed",
]) {
  for (const field of ["enhancement_note", "better"] as const) {
    const report: any = structuredClone(schemaValidReport);
    report.rewrites = [{
      label: "Clarity",
      original: hubspotSource,
      better: "Created customer journeys using HubSpot.",
      enhancement_note: "Add [measurable result].",
    }];
    report.rewrites[0][field] = field === "better"
      ? `Created customer journeys using HubSpot [${factualPlaceholder}].`
      : `Add [${factualPlaceholder}].`;
    assert.throws(
      () => validateResumeModelPayload(report, hubspotSource, {
        forceGrounding: true,
        jobDescription: hubspotJobDescription,
      }),
      /evidence grounding contract/,
      `${field} must reject [${factualPlaceholder}]`,
    );
  }
}

for (const unsupportedWidthFact of ["＄９Ｍ", "Ｃ＋＋", "４５％"]) {
  const candidate = `Created customer journeys using HubSpot and ${unsupportedWidthFact}.`;
  assert.equal(
    compareSourceBoundRewrite({ sourceText: hubspotSource, sourceLocator: hubspotSource, candidate }).safe,
    false,
    `NFKC fact ${unsupportedWidthFact} must not bypass rewrite fidelity`,
  );
}

for (const field of ["enhancement_note", "better"] as const) {
  const report: any = structuredClone(schemaValidReport);
  report.rewrites = [{
    label: "Clarity",
    original: hubspotSource,
    better: "Created customer journeys using HubSpot.",
    enhancement_note: "Add [missing scope] or [verified result].",
  }];
  report.rewrites[0][field] = field === "better"
    ? "Created customer journeys using HubSpot [for 45% Salesforce revenue growth]."
    : "Add [Salesforce-driven 45% revenue growth for 10,000 customers].";
  assert.throws(
    () => validateResumeModelPayload(report, hubspotSource, { forceGrounding: true, jobDescription: hubspotJobDescription }),
    /evidence grounding contract/,
    `factual bracket payload in ${field} must fail closed`,
  );
}

console.log("report fidelity regression tests passed");
