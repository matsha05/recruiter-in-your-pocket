import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { validateResumeModelPayload } from "../lib/backend/validation";
import { renderReportHtml } from "../lib/backend/pdf";
import { makeValidatedReportReceipt, validatedReportReceiptClaim } from "../lib/reports/report-receipt";
import { checkEvidence, checkRewriteGrounding } from "../lib/evals/evidence-checks";
import { containsExactEvidence, isAcceptedAbsenceMarker } from "../lib/llm/grounding";
import { supportsInferredIndustrySignal } from "../lib/llm/source-industry-signals";
import { narrativeMeaningIssues } from "../lib/llm/narrative-meaning";
import {
  auditNarrativeClaim,
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
import { normalizeReportForPdf } from "../lib/reports/pdf-export";
import { assertReportGrounding, ResumeFeedbackResponseSchema } from "../lib/validation/schemas";
import {
  hubspotJobDescription,
  hubspotSource,
  schemaValidReport,
} from "./helpers/report-fidelity-fixture";

assert.deepEqual(auditNarrativeClaim("Resolve those points to make the narrative cleaner.", hubspotSource, {
  interpretationContext: "assessment", rejectPositiveSourceAbsence: true,
}), [], "an imperative is editorial advice even inside an assessment field");
assert.ok(auditNarrativeClaim("Resolve the $10M Salesforce rollout.", hubspotSource, {
  interpretationContext: "assessment", rejectPositiveSourceAbsence: true,
}).length > 0, "imperative wording must not exempt invented entities or amounts");

assert.equal(supportsInferredIndustrySignal("Technology", "Led recruiting for Cloud Sales and AI and ML Software Engineering hiring."), true);
assert.equal(supportsInferredIndustrySignal("Technology", "SOFTWARE: Excel, Workday. Managed accounting staff."), false,
  "software proficiency alone must not establish the employer industry");
const staffSource = "Managed staff of 5 at North. Managed staff of 7 at South. Managed staff of 3 at East. Managed staff of four at West. Managed staff of 6 at Central.";
assert.deepEqual(auditNarrativeClaim("Managed staff of 5, 7, 3, four, and 6 makes people oversight visible throughout the work history.",
  staffSource, { interpretationContext: "assessment" }), [], "separate the sourced responsibilities from the explanation of what they show");
assert.ok(auditNarrativeClaim("Managed staff of 50 makes people oversight visible throughout the work history.",
  staffSource, { interpretationContext: "assessment" }).length > 0, "assessment wording must not license a changed staff count");
assert.ok(auditNarrativeClaim("This makes people oversight visible throughout the work history.",
  "Managed a budget of $5M.", { interpretationContext: "assessment" }).length > 0, "budget management is not people management");
assert.deepEqual(narrativeMeaningIssues("Graduation timing conflicts between the top line and the Education entry.",
  "Header: 2017. Education: Dec. 2013."), []);

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

for (const { bracketed, omitted } of [
  { bracketed: "［onboarding revenue increase］", omitted: true },
  { bracketed: "﹇customer onboarding completed﹈", omitted: false },
]) {
  assert.ok(unsupportedBracketPayloads(`Add ${bracketed}.`).length > 0, `${bracketed} must normalize before policy checks`);
  const report: any = structuredClone(schemaValidReport);
  report.rewrites = [{
    label: "Clarity",
    original: hubspotSource,
    better: `Created customer journeys using HubSpot ${bracketed}.`,
    enhancement_note: "Add ［verified result］.",
  }];
  const validate = () => validateResumeModelPayload(report, hubspotSource, {
    forceGrounding: true,
    jobDescription: hubspotJobDescription,
  });
  if (!omitted) {
    assert.throws(validate, /evidence grounding contract/,
      `${bracketed} must still fail the final source-fidelity guard`);
    continue;
  }
  const validated = validate();
  assert.deepEqual(validated.rewrites, [],
    `${bracketed} must be omitted rather than converted into a synthesized replacement draft`);
  assert.equal(renderReportHtml(normalizeReportForPdf(validated)!).includes(bracketed), false,
    `${bracketed} must not reach report export`);
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
const semanticControlSource = [
  "SUMMARY", "Customer operations profile.", "WORK EXPERIENCE", hubspotSource,
  "SKILLS", "HubSpot", "EDUCATION", "State University", "Growth-stage company.", "Show HubSpot.",
].join("\n");
const semanticNoEducationSource = semanticControlSource.replace("\nEDUCATION\nState University", "");

process.env.SESSION_SECRET ||= "report-fidelity-regression-secret";
const relationshipSwapCases = [
  {
    source: "Reduced cycle time from 10 days to 5 days.",
    candidate: "Reduced cycle time from 5 days to 10 days.",
  },
  {
    source: "Grew revenue by 20% and reduced cost by 10%.",
    candidate: "Grew revenue by 10% and reduced cost by 20%.",
  },
  {
    source: "Led payroll migration and supported benefits rollout.",
    candidate: "Led benefits rollout and supported payroll migration.",
  },
] as const;
for (const { source, candidate } of relationshipSwapCases) {
  const report: any = structuredClone(schemaValidReport);
  report.summary = `HubSpot workflow context is visible. ${candidate} The customer context needs detail.`;
  assert.throws(
    () => {
      const validated = validateResumeModelPayload(report, `${semanticControlSource}\n${source}`, {
        forceGrounding: true,
        jobDescription: hubspotJobDescription,
      });
      const receipt = makeValidatedReportReceipt(validated);
      return validatedReportReceiptClaim(validated, receipt);
    },
    /evidence grounding contract/,
    `relationship swap must fail before a validated receipt can be minted: ${candidate}`,
  );
}

const validRelationshipReport: any = structuredClone(schemaValidReport);
validRelationshipReport.summary = `HubSpot workflow context is visible. ${relationshipSwapCases[1].source} The customer context needs detail.`;
const validRelationshipPayload = validateResumeModelPayload(
  validRelationshipReport,
  `${semanticControlSource}\n${relationshipSwapCases[1].source}`,
  { forceGrounding: true, jobDescription: hubspotJobDescription },
);
const validRelationshipReceipt = makeValidatedReportReceipt(validRelationshipPayload);
assert.ok(
  validatedReportReceiptClaim(validRelationshipPayload, validRelationshipReceipt),
  "a source-backed relationship must survive the validated receipt round trip",
);

const jdOnlyRelationshipControl: any = structuredClone(schemaValidReport);
jdOnlyRelationshipControl.job_alignment.jd_keywords.missing[0] = "Salesforce administration";
assert.doesNotThrow(
  () => validateResumeModelPayload(jdOnlyRelationshipControl, semanticControlSource, {
    forceGrounding: true,
    jobDescription: `${hubspotJobDescription} Salesforce administration is required.`,
  }),
  "a JD-only requirement absent from the resume must keep its path-specific allowance",
);

function semanticMissingBrowserHtml(report: any) {
  const values = [
    ...(report.gaps || []),
    ...Object.values(report.section_review || {}).map((item: any) => item?.missing),
    ...(report.job_alignment?.missing || []),
  ].filter((value) => typeof value === "string");
  return renderToStaticMarkup(createElement(
    "article",
    null,
    values.map((value, index) => createElement("p", { key: `${index}-${value}` }, value)),
  ));
}

function semanticMissingValue(report: any, path: string) {
  if (path === "gaps[0]") return report.gaps[0];
  if (path === "section_review.Summary.missing") return report.section_review.Summary.missing;
  return report.job_alignment.missing[0];
}
const polarityCases: Array<[string, string, (report: any) => void]> = [
  ["gaps[0]", "explicit absence", (report) => { report.gaps[0] = "The customer count is missing."; }],
  ["gaps[0]", "euphemistic absence", (report) => { report.gaps[0] = "The customer count is blurry."; }],
  ["gaps[0]", "bare missing subject", (report) => { report.gaps[0] = "Customer count"; }],
  ["section_review.Summary.missing", "explicit absence", (report) => {
    report.section_review.Summary.missing = "The customer count is unclear.";
  }],
  ["section_review.Summary.missing", "euphemistic absence", (report) => {
    report.section_review.Summary.missing = "The customer count is blurry.";
  }],
  ["section_review.Summary.missing", "bare missing subject", (report) => {
    report.section_review.Summary.missing = "Customer count";
  }],
  ["job_alignment.missing[0]", "explicit absence", (report) => { report.job_alignment.missing[0] = "HubSpot is missing."; }],
  ["job_alignment.missing[0]", "euphemistic absence", (report) => { report.job_alignment.missing[0] = "HubSpot is blurry."; }],
  ["job_alignment.missing[0]", "bare missing subject", (report) => { report.job_alignment.missing[0] = "HubSpot"; }],
];
for (const [expectedPath, label, mutate] of polarityCases) {
  const report: any = structuredClone(schemaValidReport);
  report.gaps[0] = "The workflow scope needs detail.";
  for (const item of Object.values(report.section_review) as any[]) {
    item.missing = "The workflow scope needs detail.";
  }
  mutate(report);
  const unsafeValue = semanticMissingValue(report, expectedPath);
  assert.ok(
    semanticMissingBrowserHtml(report).includes(unsafeValue),
    `${expectedPath} ${label} must exercise a browser-visible report field`,
  );
  if (expectedPath === "gaps[0]") {
    assert.ok(
      renderReportHtml(normalizeReportForPdf(report)!).includes(unsafeValue),
      `${expectedPath} ${label} must exercise the PDF HTML sink`,
    );
  }
  assert.ok(
    auditReportNarrative(report, positiveCountSource, hubspotJobDescription)
      .some((issue) => issue.path === expectedPath && issue.unsupportedFacts.includes("contradicts positive source evidence")),
    `${expectedPath} must reject ${label} contradicted by positive source evidence`,
  );
  for (const [surface, render] of [
    ["browser", semanticMissingBrowserHtml],
    ["PDF", (validated: any) => renderReportHtml(normalizeReportForPdf(validated)!)],
  ] as const) {
    let renderBoundaryReached = false;
    assert.throws(
      () => {
        const validated = validateResumeModelPayload(report, positiveCountSource, {
          forceGrounding: true,
          jobDescription: hubspotJobDescription,
        });
        renderBoundaryReached = true;
        render(validated);
      },
      /contradicted positive source evidence/,
      `${expectedPath} ${label} must fail before the ${surface} sink`,
    );
    assert.equal(renderBoundaryReached, false, `${surface} rendering must not receive the contradicted report`);
  }
}

const genuineGapReport: any = structuredClone(schemaValidReport);
genuineGapReport.gaps[0] = "Customer count";
assert.doesNotThrow(
  () => validateResumeModelPayload(genuineGapReport, semanticControlSource, {
    forceGrounding: true,
    jobDescription: hubspotJobDescription,
  }),
  "a bare missing subject must remain useful when the resume really omits it",
);

const absentEducationReport: any = structuredClone(schemaValidReport);
absentEducationReport.section_review = Object.fromEntries(
  Object.entries(absentEducationReport.section_review).map(([section, item]) => [section, structuredClone(item)]),
);
absentEducationReport.section_review.Education.missing = "No education section present";
assert.doesNotThrow(
  () => validateResumeModelPayload(absentEducationReport, semanticNoEducationSource, {
    forceGrounding: true,
    jobDescription: hubspotJobDescription,
  }),
  "the exact section sentinel must remain valid when that section is genuinely absent",
);
assert.throws(
  () => validateResumeModelPayload(absentEducationReport, `${semanticControlSource}\nEDUCATION\nState University`, {
    forceGrounding: true,
    jobDescription: hubspotJobDescription,
  }),
  /contradicted positive source evidence/,
  "the exact section sentinel must fail when its heading exists",
);

const genuineJdGapReport: any = structuredClone(schemaValidReport);
genuineJdGapReport.job_alignment.missing[0] = "Salesforce";
assert.doesNotThrow(
  () => validateResumeModelPayload(genuineJdGapReport, semanticControlSource, {
    forceGrounding: true,
    jobDescription: `${hubspotJobDescription} Salesforce administration is required.`,
  }),
  "a JD requirement absent from the resume must remain a valid job-alignment gap",
);

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
