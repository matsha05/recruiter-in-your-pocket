import assert from "node:assert/strict";
import { validateResumeModelPayload } from "../lib/backend/validation";
import { canonicalizeResumeReportEvidence } from "../lib/llm/evidence-canonicalizer";
import { canonicalizeOptionalReportMetadata } from "../lib/llm/optional-report-metadata";
import { auditReportNarrative } from "../lib/llm/source-fidelity";
import { ResumeFeedbackResponseSchema } from "../lib/validation/schemas";
import { hubspotJobDescription, hubspotSource, schemaValidReport } from "./helpers/report-fidelity-fixture";

const keywordPath = "job_alignment.jd_keywords";
const industryPath = "job_alignment.role_fit.industry_signals";
const options = { jobDescription: hubspotJobDescription };
const reportWith = (keywords: any, industries: any = ["HubSpot"]) => {
  const report: any = structuredClone(schemaValidReport);
  report.job_alignment.jd_keywords = keywords;
  report.job_alignment.role_fit.industry_signals = industries;
  return report;
};
const keywords = (matched: string[], missing: string[]) => ({
  matched, missing, match_count: matched.length, total_count: matched.length + missing.length,
});
function deepFreeze(value: any): any {
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

// Mixed labels must retain their original spelling and order, while omission
// records refer to positions in the original arrays, not the filtered arrays.
const mixedSource = `${hubspotSource}\nUsed Excel and Snowflake.`;
const mixedJob = "The role requires HubSpot, Excel, customer workflows, customer count, SQL, and Salesforce.";
const mixed = reportWith(
  keywords(["Salesforce", "EXCEL", "Snowflake", "hUbSpOt"], ["customer count", "customer workflows", "Python", "SQL"]),
  ["Software products", "HubSpot"],
);
const mixedBefore = structuredClone(mixed);
deepFreeze(mixed);
const mixedResult = canonicalizeOptionalReportMetadata(mixed, mixedSource, { jobDescription: mixedJob });
assert.deepEqual(mixed, mixedBefore, "optional metadata canonicalization must not mutate the input report");
assert.deepEqual(mixedResult.report.job_alignment.jd_keywords, keywords(["EXCEL", "hUbSpOt"], ["customer count", "SQL"]));
assert.deepEqual(mixedResult.report.job_alignment.role_fit.industry_signals, ["HubSpot"]);
assert.deepEqual(mixedResult.changes, [
  `${keywordPath}.matched[0].omitted_unverified`,
  `${keywordPath}.matched[2].omitted_unverified`,
  `${keywordPath}.missing[1].omitted_unverified`,
  `${keywordPath}.missing[2].omitted_unverified`,
  `${keywordPath}.counts_recomputed`,
  `${industryPath}[0].omitted_unverified`,
]);
const mixedAgain = canonicalizeOptionalReportMetadata(mixedResult.report, mixedSource, { jobDescription: mixedJob });
assert.deepEqual(mixedAgain.report, mixedResult.report, "optional metadata canonicalization must be idempotent");
assert.deepEqual(mixedAgain.changes, [], "an unchanged second pass must not emit removal or count records");

// A matched chip requires both sources; a missing chip requires a positive JD
// requirement and absence from the resume. Failed matches are never promoted.
for (const { label, source, job, kind, keep } of [
  { label: "HubSpot", source: hubspotSource, job: hubspotJobDescription, kind: "matched", keep: true },
  { label: "HubSpot", source: hubspotSource, job: "The role requires Excel.", kind: "matched", keep: false },
  { label: "HubSpot", source: "Used Excel.", job: hubspotJobDescription, kind: "matched", keep: false },
  { label: "customer count", source: hubspotSource, job: hubspotJobDescription, kind: "missing", keep: true },
  { label: "HubSpot", source: hubspotSource, job: hubspotJobDescription, kind: "missing", keep: false },
  { label: "Salesforce", source: hubspotSource, job: hubspotJobDescription, kind: "missing", keep: false },
  { label: "HubSpot", source: "No HubSpot experience.", job: hubspotJobDescription, kind: "matched", keep: false },
  { label: "HubSpot", source: hubspotSource, job: "No HubSpot experience required.", kind: "matched", keep: false },
] as const) {
  const input = reportWith(keywords(kind === "matched" ? [label] : [], kind === "missing" ? [label] : []), []);
  const result = canonicalizeOptionalReportMetadata(input, source, { jobDescription: job });
  assert.deepEqual(result.report.job_alignment.jd_keywords[kind], keep ? [label] : [], `${kind}: ${label} (${source}; ${job})`);
  assert.deepEqual(result.report.job_alignment.jd_keywords[kind === "matched" ? "missing" : "matched"], [],
    "omission must not move a label into the other category");
  assert.deepEqual(result.changes, keep ? [] : [
    `${keywordPath}.${kind}[0].omitted_unverified`, `${keywordPath}.counts_recomputed`,
  ]);
}

const allInvalid = reportWith(keywords(["Salesforce"], ["Snowflake"]), []);
const allInvalidResult = canonicalizeOptionalReportMetadata(allInvalid, hubspotSource, options);
assert.deepEqual(allInvalidResult.report.job_alignment.jd_keywords, keywords([], []),
  "both required arrays and their zero counts must remain when every chip is omitted");
assert.deepEqual(canonicalizeOptionalReportMetadata(structuredClone(schemaValidReport), hubspotSource, options).changes, [],
  "supported metadata must not trigger unnecessary count recomputation");
const industryOnly = canonicalizeOptionalReportMetadata(reportWith(keywords(["HubSpot"], ["customer count"]), ["Software products"]), hubspotSource, options);
assert.deepEqual(industryOnly.changes, [`${industryPath}[0].omitted_unverified`],
  "industry omission must not recompute unchanged keyword counts");

for (const { source, industries, expected } of [
  { source: "Product Manager. Worked with engineering and design on a setup checklist.", industries: ["Software products"], expected: [] },
  { source: "Worked in Real Estate. Earlier work in Pharmacy.", industries: ["Pharmacy", "Real Estate"], expected: ["Pharmacy", "Real Estate"] },
  { source: "Worked at a SaaS company.", industries: ["SaaS"], expected: ["SaaS"] },
  { source: "No SaaS experience.", industries: ["SaaS"], expected: [] },
  { source: "Worked outside SaaS. No experience in Real Estate or Pharmacy.", industries: ["Real Estate", "Pharmacy"], expected: [] },
] as const) {
  const result = canonicalizeOptionalReportMetadata(reportWith(keywords([], []), [...industries]), source);
  assert.deepEqual(result.report.job_alignment.role_fit.industry_signals, [...expected], source);
  assert.deepEqual(result.changes, industries.flatMap((industry, index) =>
    (expected as readonly string[]).includes(industry) ? [] : [`${industryPath}[${index}].omitted_unverified`]),
  "industry omission records must preserve original indexes");
}

// Keep malformed structures unchanged so schema validation remains responsible
// for rejecting them; evidence filtering must not silently repair their shape.
const malformedKeywords: Array<{ name: string; value: any }> = [
  { name: "non-object", value: "HubSpot" },
  { name: "non-array matched", value: { ...keywords([], []), matched: "HubSpot" } },
  { name: "non-array missing", value: { ...keywords([], []), missing: "Salesforce" } },
  { name: "missing matched array", value: { missing: [], match_count: 0, total_count: 0 } },
  { name: "missing missing array", value: { matched: [], match_count: 0, total_count: 0 } },
  { name: "non-string entry", value: { ...keywords([], []), matched: [42], match_count: 1, total_count: 1 } },
  { name: "empty entry", value: keywords(["   "], []) },
  { name: "missing counts", value: { matched: ["HubSpot"], missing: [] } },
  { name: "mismatched matched count", value: { ...keywords(["HubSpot"], []), match_count: 0 } },
  { name: "mismatched total count", value: { ...keywords(["HubSpot"], []), total_count: 7 } },
  { name: "duplicates", value: keywords(["HubSpot", " HUBSPOT "], []) },
  { name: "compatibility duplicates", value: keywords(["HubSpot", "ＨｕｂＳｐｏｔ"], []) },
  { name: "overlap", value: keywords(["HubSpot"], [" hubspot "]) },
  { name: "too many entries", value: keywords(Array.from({ length: 21 }, (_, index) => `Unsupported requirement ${index}`), []) },
];
for (const { name, value } of malformedKeywords) {
  const input = reportWith(value);
  const before = structuredClone(input);
  const result = canonicalizeOptionalReportMetadata(input, hubspotSource, options);
  assert.deepEqual(input, before, `${name}: source must stay unchanged`);
  assert.deepEqual(result.report.job_alignment.jd_keywords, value, `${name}: malformed keywords must stay unchanged`);
  assert.deepEqual(result.changes, [], `${name}: malformed metadata must not emit removal records`);
  assert.equal(ResumeFeedbackResponseSchema.safeParse(result.report).success, false, `${name}: schema must still reject`);
  assert.throws(() => validateResumeModelPayload(structuredClone(input), hubspotSource, { ...options, forceGrounding: true }),
    (error: any) => error?.code === "OPENAI_RESPONSE_SHAPE_INVALID",
    `${name}: the full validator must reject with a validation error`);
}

for (const noJob of [undefined, "", "   "]) {
  for (const state of [keywords([], []), keywords(["Salesforce"], ["Snowflake"])]) {
    const input = reportWith(state);
    const result = canonicalizeOptionalReportMetadata(input, hubspotSource, { jobDescription: noJob });
    assert.deepEqual(result.report, input, "no-JD keyword state must remain unchanged rather than infer a JD from report prose");
    assert.deepEqual(result.changes, []);
  }
}

const raw = reportWith(keywords(["Salesforce"], ["Snowflake"]), ["Software products"]);
const rawIssues = auditReportNarrative(raw, hubspotSource, hubspotJobDescription);
for (const path of [`${keywordPath}.matched[0]`, `${keywordPath}.missing[0]`, `${industryPath}[0]`]) {
  assert.ok(rawIssues.some((issue) => issue.path === path), `the raw narrative audit must stay strict at ${path}`);
}
const integratedBefore = structuredClone(raw);
const integrated = canonicalizeResumeReportEvidence(raw, hubspotSource, options);
assert.deepEqual(raw, integratedBefore, "integrated evidence canonicalization must not mutate its input");
for (const path of [`${keywordPath}.matched[0]`, `${keywordPath}.missing[0]`, `${industryPath}[0]`]) {
  assert.ok(integrated.changes.includes(`${path}.omitted_unverified`), `integrated canonicalization must record ${path}`);
}
assert.ok(integrated.changes.includes(`${keywordPath}.counts_recomputed`));
assert.deepEqual(integrated.report.job_alignment.jd_keywords, keywords([], []));
assert.deepEqual(integrated.report.job_alignment.role_fit.industry_signals, []);
const validated = validateResumeModelPayload(structuredClone(raw), hubspotSource, { ...options, forceGrounding: true });
assert.deepEqual(validated.job_alignment.jd_keywords, keywords([], []), "unverified optional chips must not block a grounded core report");
assert.deepEqual(validated.job_alignment.role_fit.industry_signals, []);

for (const claim of ["Owned the Salesforce rollout.", "Increased revenue by $10M."]) {
  const badCore = reportWith(keywords(["Salesforce"], []), ["Software products"]);
  badCore.first_impression = claim;
  assert.ok(auditReportNarrative(badCore, hubspotSource, hubspotJobDescription).some(({ path }) => path === "first_impression"),
    `strict raw audit must detect ${claim}`);
  assert.throws(() => validateResumeModelPayload(badCore, hubspotSource, { ...options, forceGrounding: true }),
    /evidence grounding contract/, `optional omission must not license an unsupported core claim: ${claim}`);
}

console.log("optional report metadata tests passed");
