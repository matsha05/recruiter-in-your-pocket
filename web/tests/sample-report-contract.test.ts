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
    requests: [/onboarding improved productivity/i],
    source: "Led onboarding work across the company, improving productivity.",
    keys: [],
    explanations: [/how many people did you onboard/i, /which teams/i, /over what period/i, /how did you measure it/i],
  },
  {
    requests: [/result.*launch/i],
    source: "Ran a cross-team launch with clear owners and checkpoints.",
    keys: ["verified before-and-after result"],
    explanations: [/before-and-after measure/i, /launch meant to achieve/i, /result you can verify/i],
  },
  {
    requests: [/your part.*roadmap/i],
    source: "Managed stakeholder alignment and delivered quarterly roadmap on time.",
    keys: ["functions", "ownership detail"],
    explanations: [/teams you coordinated/i, /decision you personally made/i],
  },
];

for (const [index, { fix, rewrite }] of presentation.fixes.entries()) {
  const requirement = requirements[index];
  for (const request of requirement.requests) {
    assert.match(fix.fix || "", request);
  }
  const evidence = typeof fix.evidence === "string" ? fix.evidence : fix.evidence?.excerpt;
  assert.equal(evidence, requirement.source, "every recommendation must preserve its actual quoted source");
  if (requirement.keys.length === 0) {
    assert.equal(rewrite, undefined, "a useful fact question must not be padded with a synthetic rewrite");
    for (const explanation of requirement.explanations) assert.match(fix.why || "", explanation);
    continue;
  }
  assert.ok(rewrite, `fix ${index + 1} must retain its useful source-safe draft`);
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

assert.doesNotMatch(JSON.stringify(sample), /each week|per week|weekly/i,
  "the sample must not invent an onboarding frequency absent from its source");
assert.match(sample.next_steps[1], /three examples.*read them together/i,
  "the closing plan should help apply the priority edits rather than repeat every missing fact");
console.log("Sample report content contracts passed");
