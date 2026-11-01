import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildReportRewritePresentation } from "../lib/reports/report-presentation";
import { ResumeFeedbackResponseSchema } from "../lib/validation/schemas";

// The public sample is Jordan's report: real output from the production prompt on a fictional resume
// (tests/fixtures/sample). It must stay real output, and it must not promise what reports don't deliver.
const sample = ResumeFeedbackResponseSchema.parse(JSON.parse(readFileSync(
  path.join(process.cwd(), "public/sample-report.json"), "utf8",
)));
const resume = readFileSync(path.join(process.cwd(), "tests/fixtures/sample/jordan-miller-resume.txt"), "utf8");
const generated = JSON.parse(readFileSync(
  path.join(process.cwd(), "tests/fixtures/sample/jordan-miller-report.generated.json"), "utf8",
));

assert.deepEqual(JSON.parse(JSON.stringify(sample)), JSON.parse(JSON.stringify(ResumeFeedbackResponseSchema.parse(generated.payload))),
  "the sample is the generated payload, unedited");
assert.equal(generated.model, "gpt-6.1-terra", "the sample records the production model it was generated with");
assert.match(generated.prompt_sha256, /^[0-9a-f]{64}$/, "the sample records the prompt it was generated with");

const presentation = buildReportRewritePresentation(sample.top_fixes, sample.rewrites);
assert.equal(presentation.fixes.length, 3);
assert.deepEqual(sample.rewrites, [], "until answer-to-line ships (plan 2.2), the sample shows no rewrites (D3)");

const requirements = [
  { request: /Name the customer success role/i, source: "Results-driven, detail-oriented professional seeking a challenging role where I can utilize my skills." },
  { request: /32-account portfolio detail/i, source: "- Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue" },
  { request: /renewal-risk reviews/i, source: "- Introduced monthly renewal-risk reviews across the portfolio" },
];
for (const [index, { fix, rewrite }] of presentation.fixes.entries()) {
  assert.match(fix.fix || "", requirements[index].request);
  const evidence = typeof fix.evidence === "string" ? fix.evidence : fix.evidence?.excerpt;
  assert.equal(evidence, requirements[index].source, "every recommendation must preserve its actual quoted source");
  assert.ok(resume.includes(evidence!), `fix ${index + 1} quotes a line that is on Jordan's resume`);
  assert.equal(rewrite, undefined, "a fact question must not be padded with a synthetic rewrite");
}

// The homepage hero draws Jordan's resume; the lines it shows must be the resume the sample read.
for (const line of [
  "Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue",
  "Introduced monthly renewal-risk reviews across the portfolio",
  "Ran quarterly business reviews with customer leadership teams",
  "Assisted account managers with various tasks as needed",
]) assert.ok(resume.includes(line), `Jordan's resume includes "${line}"`);

// After plan 1.3 the Verdict and the Critical Miss tell one story: both are about the objective.
assert.match(sample.first_impression, /objective/i, "the Verdict names the Critical Miss's problem");
assert.equal(sample.top_fixes[0].evidence.section, "OBJECTIVE");

// The homepage quotes this report word for word.
const homepage = readFileSync(path.join(process.cwd(), "lib/marketing/jordan-example.ts"), "utf8");
for (const quote of [
  "Your current title points to customer success, but",
  "the objective could apply to almost any role.",
  sample.top_fixes[0].evidence.excerpt,
  "Are you pursuing another customer success role?",
]) {
  assert.ok(JSON.stringify(sample).includes(quote.replace(/"/g, '\\"')), `the sample report says "${quote}"`);
  assert.ok(homepage.includes(quote), `the homepage example quotes "${quote}"`);
}

console.log("Sample report content contracts passed");
