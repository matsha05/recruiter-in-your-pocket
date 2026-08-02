import assert from "node:assert/strict";
import { validateResumeModelPayload } from "../lib/backend/validation";
import { checkEvidence, checkRewriteGrounding } from "../lib/evals/evidence-checks";
import { containsExactEvidence, isAcceptedAbsenceMarker } from "../lib/llm/grounding";
import {
  auditReportNarrative,
  canonicalSourceIdentity,
  compareSourceBoundRewrite,
  resolveUniqueSourceLine,
} from "../lib/llm/source-fidelity";
import {
  bracketPlaceholderKeys,
  replaceBracketPlaceholders,
  unsupportedBracketPayloads,
} from "../lib/llm/report-placeholder-policy";
import { resolveRewriteCopyPolicy } from "../lib/reports/report-presentation";
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
for (const [source, excerpt] of [["1,0", "0"], ["10,000", "000"], ["10,000", "10"]] as const) {
  assert.equal(containsExactEvidence(source, excerpt), false, `${excerpt} must not split ${source}`);
}

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

assert.equal(
  canonicalSourceIdentity("Built customer work\u2063flows in HubSpot."),
  canonicalSourceIdentity(hubspotSource),
  "validator source identity must remove the same format controls as provider input",
);
assert.equal(
  resolveUniqueSourceLine(hubspotSource, `Built customer work\u2063flows in HubSpot.\n${hubspotSource}`).status,
  "ambiguous",
  "provider-visible duplicate locators must remain validator-ambiguous",
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

for (const bracketed of [
  "［onboarding revenue increase］",
  "﹇customer onboarding completed﹈",
]) {
  assert.ok(unsupportedBracketPayloads(`Add ${bracketed}.`).length > 0, `${bracketed} must normalize before policy checks`);
  const report: any = structuredClone(schemaValidReport);
  report.rewrites = [{
    label: "Clarity",
    original: hubspotSource,
    better: `Created customer journeys using HubSpot ${bracketed}.`,
    enhancement_note: "Add ［verified result］.",
  }];
  assert.throws(
    () => validateResumeModelPayload(report, hubspotSource, {
      forceGrounding: true,
      jobDescription: hubspotJobDescription,
    }),
    /evidence grounding contract/,
    `${bracketed} must not reach report rendering or export`,
  );
}

const compatibilitySafePlaceholder = "Created customer journeys using HubSpot ［verified result］.";
assert.deepEqual(bracketPlaceholderKeys(compatibilitySafePlaceholder), ["verified result"]);
assert.equal(
  replaceBracketPlaceholders(compatibilitySafePlaceholder, (key) => key === "verified result" ? "28% faster" : key),
  "Created customer journeys using HubSpot 28% faster.",
  "compatibility placeholders must use the same normalized key for fact replacement",
);
assert.equal(
  resolveRewriteCopyPolicy({
    sourceText: hubspotSource,
    original: hubspotSource,
    draft: compatibilitySafePlaceholder,
  }).reason,
  "unresolved_placeholders",
  "safe compatibility placeholders must remain visible and non-copyable until filled",
);

const positiveCountSource = `${hubspotSource}\nCustomer count: 45.`;
const polarityCases: Array<[string, (report: any) => void]> = [
  ["gaps[0]", (report) => { report.gaps[0] = "The customer count is missing."; }],
  ["section_review.Summary.missing", (report) => {
    report.section_review.Summary.missing = "The customer count is unclear.";
  }],
  ["job_alignment.missing[0]", (report) => { report.job_alignment.missing[0] = "HubSpot is missing."; }],
];
for (const [expectedPath, mutate] of polarityCases) {
  const report: any = structuredClone(schemaValidReport);
  report.gaps[0] = "The workflow scope needs detail.";
  for (const item of Object.values(report.section_review) as any[]) {
    item.missing = "The workflow scope needs detail.";
  }
  mutate(report);
  assert.ok(
    auditReportNarrative(report, positiveCountSource, hubspotJobDescription)
      .some((issue) => issue.path === expectedPath && issue.unsupportedFacts.includes("contradicts positive source evidence")),
    `${expectedPath} must reject missing/unclear claims contradicted by positive source evidence`,
  );
  assert.throws(
    () => validateResumeModelPayload(report, positiveCountSource, {
      forceGrounding: true,
      jobDescription: hubspotJobDescription,
    }),
    /contradicted positive source evidence/,
    `${expectedPath} must fail the full model validation boundary before rendering/export`,
  );
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
