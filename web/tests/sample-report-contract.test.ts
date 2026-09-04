import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  bracketPlaceholderKeys,
  unsupportedBracketPayloads,
} from "../lib/llm/report-placeholder-policy";
import { compareSourceBoundRewrite } from "../lib/llm/source-fidelity";
import { buildReportRewritePresentation, resolveRewriteCopyPolicy } from "../lib/reports/report-presentation";
import { ResumeFeedbackResponseSchema } from "../lib/validation/schemas";

const sample = ResumeFeedbackResponseSchema.parse(JSON.parse(readFileSync(
  path.join(process.cwd(), "public/sample-report.json"), "utf8",
)));
const presentation = buildReportRewritePresentation(sample.top_fixes, sample.rewrites);
assert.equal(presentation.fixes.length, 3);
assert.equal(presentation.independentRewrites.length, 0, "each sample rewrite must attach to the cited fix");

const requirements = [
  {
    requests: [/who you onboarded/i, /how many people each week/i, /what improved/i],
    keys: ["teams", "specific scope", "measurable result"],
    explanations: [/teams you supported/i, /number of people onboarded each week/i, /productivity changed.*how you measured it/i],
  },
  {
    requests: [/what improved.*launch/i],
    keys: ["verified before-and-after result"],
    explanations: [/before-and-after launch result/i, /how was it measured/i, /result you can verify/i],
  },
  {
    requests: [/teams you brought together/i, /decision you made.*roadmap/i],
    keys: ["functions", "ownership detail"],
    explanations: [/teams you coordinated/i, /what you personally decided/i],
  },
];

for (const [index, { fix, rewrite }] of presentation.fixes.entries()) {
  const requirement = requirements[index];
  assert.ok(rewrite, `fix ${index + 1} must demonstrate the requested edit`);
  for (const request of requirement.requests) {
    assert.match(fix.fix || "", request);
  }
  const evidence = typeof fix.evidence === "string" ? fix.evidence : fix.evidence?.excerpt;
  assert.equal(rewrite.original, evidence, "the before line must remain the fix's actual quoted source");
  assert.deepEqual(bracketPlaceholderKeys(rewrite.better), requirement.keys,
    `FixCanvas must show a fact field for every detail requested by fix ${index + 1}`);
  for (const explanation of requirement.explanations) {
    assert.match(rewrite.enhancement_note || "", explanation, "generic fact fields must state which missing detail belongs there");
  }
  assert.deepEqual(unsupportedBracketPayloads(rewrite.better), [], "sample fields must use the same accepted placeholders as real reports");
  const comparison = compareSourceBoundRewrite({
    sourceText: rewrite.original,
    sourceLocator: rewrite.original,
    candidate: rewrite.better,
  });
  assert.equal(comparison.safe, true,
    `sample fix ${index + 1} must preserve the cited facts without unsupported additions: ${JSON.stringify(comparison.issues)}`);
  assert.equal(resolveRewriteCopyPolicy({
    sourceText: rewrite.original, original: rewrite.original, draft: rewrite.better,
  }).reason, "unresolved_placeholders", "the example must not become copyable while facts are unknown");
}

assert.match(sample.next_steps[1], /before-and-after launch result.*teams you coordinated.*decision you made/i,
  "the closing next move must ask for the same facts demonstrated in the fixes");
console.log("Sample report content contracts passed");
