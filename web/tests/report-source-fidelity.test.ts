import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  auditNarrativeClaim,
  auditReportNarrative,
  compareSourceBoundRewrite,
  isExactAbsenceSentinel,
  removeUnsafeRewrites,
  resolveUniqueSourceLine,
} from "../lib/llm/source-fidelity";
import { isAcceptedAbsenceMarker } from "../lib/llm/grounding";
import {
  buildIndependentQuestionPresentation,
  buildReportRewritePresentation,
  resolveRewriteCopyPolicy,
  rewriteMatchesFix,
} from "../lib/reports/report-presentation";
import type { ReportData } from "../components/workspace/report/ReportTypes";

type LockedCase = { id: string; source: string; safe: string; unsafe: string };
const fixturePaths = [
  path.join(process.cwd(), "tests/fixtures/source-fidelity/cases-01-06.json"),
  path.join(process.cwd(), "tests/fixtures/source-fidelity/cases-07-12.json"),
];
const fixtureRaw = fixturePaths.map((fixturePath) => fs.readFileSync(fixturePath, "utf8"));
assert.equal(
  crypto.createHash("sha256").update(fixtureRaw.join("")).digest("hex"),
  "d88d1ded5c4aeee439c4df484f2c6ce0ccc8baef8da09104fadf3a05d6d6a69a",
  "the locked synthetic source-audit fixture changed",
);
const cases = fixtureRaw.flatMap((raw) => JSON.parse(raw) as LockedCase[]);
assert.equal(cases.length, 12);
assert.equal(new Set(cases.map(({ id }) => id)).size, 12);
assert.ok(cases.every(({ source, safe }) => source !== safe), "positive controls must be useful edits");

let rejectedUnsafeRewrites = 0;
let rejectedUnsafeNarratives = 0;
for (const testCase of cases) {
  const safe = compareSourceBoundRewrite({
    sourceText: testCase.source,
    sourceLocator: testCase.source,
    candidate: testCase.safe,
  });
  assert.equal(safe.safe, true, `${testCase.id}: safe rewrite failed (${JSON.stringify(safe.issues)})`);
  assert.deepEqual(auditNarrativeClaim(testCase.safe, testCase.source), []);

  const unsafe = compareSourceBoundRewrite({
    sourceText: testCase.source,
    sourceLocator: testCase.source,
    candidate: testCase.unsafe,
  });
  assert.equal(unsafe.safe, false, `${testCase.id}: unsafe rewrite must fail closed`);
  rejectedUnsafeRewrites += Number(!unsafe.safe);
  const narrativeIssues = auditNarrativeClaim(testCase.unsafe, testCase.source);
  assert.ok(narrativeIssues.length > 0, `${testCase.id}: unsafe narrative must fail closed`);
  rejectedUnsafeNarratives += Number(narrativeIssues.length > 0);
}
assert.equal(rejectedUnsafeRewrites, 12);
assert.equal(rejectedUnsafeNarratives, 12);

for (const [source, candidate] of [
  ["Partnered with X on hiring workflows.", "Partnered with Y on hiring workflows."],
  ["Partnered with Li on hiring workflows.", "Partnered with Wu on hiring workflows."],
]) {
  assert.equal(compareSourceBoundRewrite({ sourceText: source, sourceLocator: source, candidate }).safe, false);
  assert.ok(auditNarrativeClaim(candidate, source).length > 0, `${source} must preserve the short source entity`);
}

const domainSource = "Supported HR operations.";
for (const mutation of ["Supported IT operations.", "Supported operations."]) {
  assert.ok(auditNarrativeClaim(mutation, domainSource).length > 0, "domain acronym changes must fail narrative validation");
  assert.equal(resolveRewriteCopyPolicy({
    sourceText: domainSource,
    original: domainSource,
    draft: mutation,
  }).copyable, false, "domain acronym changes must never be copyable");
}
assert.equal(compareSourceBoundRewrite({
  sourceText: domainSource,
  sourceLocator: domainSource,
  candidate: "Supported IT operations.",
}).safe, false, "domain acronym mutations must fail rewrite validation");
assert.ok(
  auditNarrativeClaim("Managed platform delivery.", "Managed a team of 25+ engineers across platform delivery.").length > 0,
  "narrative claims must not delete a material team scope",
);

const hubspotSource = "Built customer workflows in HubSpot.";
const partialAnchorClaims = [
  "Built payroll automation in HubSpot.",
  "Built payroll workflows in HubSpot.",
  "Built customer payroll workflows in HubSpot.",
] as const;
for (const claim of ["Built payroll automation.", ...partialAnchorClaims]) {
  assert.ok(auditNarrativeClaim(claim, hubspotSource).length > 0, `unanchored claim must fail: ${claim}`);
}
assert.ok(
  auditNarrativeClaim("The customer count is visible.", hubspotSource).length > 0,
  "a positive presence assertion must source the asserted count",
);
for (const interpretation of [
  "The customer count is missing.",
  "Add customer count.",
  "What customer count can you verify?",
]) {
  assert.deepEqual(auditNarrativeClaim(interpretation, hubspotSource), [], `safe interpretation failed: ${interpretation}`);
}

for (const [processNoun, actionVerb] of [
  ["billing", "billed"],
  ["onboarding", "onboarded"],
  ["hiring", "hired"],
  ["tracking", "tracked"],
] as const) {
  const source = `Built customer ${processNoun} workflows in HubSpot.`;
  const action = `HubSpot ${actionVerb} customers.`;
  assert.ok(auditNarrativeClaim(action, source).length > 0, `${processNoun} must not imply ${actionVerb}`);
  assert.deepEqual(auditNarrativeClaim(`HubSpot customer ${processNoun} workflows are visible.`, source), []);
  assert.deepEqual(auditNarrativeClaim(action, action), [], `explicitly sourced ${actionVerb} must remain usable`);
}

const mixedPolaritySource = "Did not build payroll automation; built customer workflows in HubSpot.";
assert.ok(
  auditNarrativeClaim("Built customer payroll automation workflows in HubSpot.", mixedPolaritySource).length > 0,
  "a positive claim must not combine negated and positive clauses",
);
assert.deepEqual(auditNarrativeClaim("Did not build payroll automation.", mixedPolaritySource), []);
assert.deepEqual(auditNarrativeClaim("payroll automation is missing.", mixedPolaritySource), []);
assert.ok(auditNarrativeClaim("payroll automation is visible.", mixedPolaritySource).length > 0);

const usefulParaphrase = {
  label: "Clarity",
  original: hubspotSource,
  better: "Created customer journeys using HubSpot.",
  enhancement_note: "Add verified context.",
};
assert.equal(compareSourceBoundRewrite({
  sourceText: usefulParaphrase.original,
  sourceLocator: usefulParaphrase.original,
  candidate: usefulParaphrase.better,
}).safe, true, "same-agency paraphrases must remain useful");
assert.equal(resolveRewriteCopyPolicy({
  sourceText: usefulParaphrase.original,
  original: usefulParaphrase.original,
  draft: usefulParaphrase.better,
}).copyable, true);
assert.equal(compareSourceBoundRewrite({
  sourceText: usefulParaphrase.original,
  sourceLocator: usefulParaphrase.original,
  candidate: "Created customer pipelines using HubSpot.",
}).safe, false, "semantic aliases must not admit arbitrary nouns");
const retained = removeUnsafeRewrites({ rewrites: [usefulParaphrase] }, usefulParaphrase.original);
assert.equal(retained.removed.length, 0);
assert.deepEqual(retained.report.rewrites, [usefulParaphrase]);

const mixedReport = {
  summary: cases[0].unsafe,
  rewrites: [
    { original: cases[0].source, better: cases[0].safe },
    { original: cases[1].source, better: cases[1].unsafe },
  ],
};
const mixedSource = `${cases[0].source}\n${cases[1].source}`;
const filtered = removeUnsafeRewrites(mixedReport, mixedSource);
assert.equal(filtered.removed.length, 1);
assert.deepEqual(filtered.report.rewrites, [mixedReport.rewrites[0]]);
assert.equal(filtered.report.summary, mixedReport.summary);
assert.ok(auditReportNarrative(mixedReport, mixedSource).some(({ path: issuePath }) => issuePath === "summary"));

assert.equal(isExactAbsenceSentinel("No education section present"), true);
assert.equal(isExactAbsenceSentinel("(No education section present)"), false);
assert.equal(isExactAbsenceSentinel("no education section present"), false);
assert.equal(isAcceptedAbsenceMarker("No education section present", "EXPERIENCE\nBuilt products."), true);
assert.equal(isAcceptedAbsenceMarker("No education section present", "EDUCATION\nState University"), false);
assert.equal(isAcceptedAbsenceMarker("(No education section present)", "EXPERIENCE\nBuilt products."), false);

assert.equal(resolveUniqueSourceLine("IT", "Positioned product strategy").status, "missing");
assert.equal(resolveUniqueSourceLine("Built .NET services", "Built .NET services across R&D.").status, "resolved");
assert.equal(resolveUniqueSourceLine("NET services", "Built .NET services across R&D.").status, "missing");
assert.equal(resolveUniqueSourceLine("Led platform migration", "Led platform migration.\nLed platform migration.").status, "ambiguous");

const sourceForFacts = "Built a billing service.";
const verifiedDraft = "Built a billing service; saved $2M.";
assert.equal(compareSourceBoundRewrite({
  sourceText: sourceForFacts,
  sourceLocator: sourceForFacts,
  candidate: verifiedDraft,
  verifiedFacts: [{ key: "verified result", value: "saved $2M" }],
}).safe, true);
assert.equal(compareSourceBoundRewrite({
  sourceText: sourceForFacts,
  sourceLocator: sourceForFacts,
  candidate: verifiedDraft.replace("$2M", "$3M"),
  verifiedFacts: [{ key: "verified result", value: "saved $2M" }],
}).safe, false, "edited candidate facts must be rechecked");

assert.deepEqual(resolveRewriteCopyPolicy({ original: cases[0].source, draft: cases[0].safe }).reason, "source_unavailable");
assert.equal(resolveRewriteCopyPolicy({ original: cases[0].source, draft: cases[0].safe }).copyable, false);
assert.deepEqual(resolveRewriteCopyPolicy({
  sourceText: cases[0].source,
  original: cases[0].source,
  draft: `${cases[0].safe} [verified result]`,
}).reason, "unresolved_placeholders");

type ReportFix = NonNullable<ReportData["top_fixes"]>[number];
type ReportRewrite = NonNullable<ReportData["rewrites"]>[number];
const teamFix: ReportFix = { fix: "Add a verified result.", evidence: { excerpt: "Managed a team of 25+ engineers", section: "Experience" } };
const platformFix: ReportFix = { fix: "Add a verified result.", evidence: { excerpt: "Built .NET services", section: "Experience" } };
const teamRewrite: ReportRewrite = { original: "Managed a team of 25+ engineers.", better: "Managed a team of 25+ engineers." };
const platformRewrite: ReportRewrite = { original: "Built .NET services for billing.", better: "Built .NET services for billing." };
const reordered = buildReportRewritePresentation([platformFix, teamFix], [teamRewrite, platformRewrite]);
assert.equal(reordered.fixes[0].rewrite, platformRewrite);
assert.equal(reordered.fixes[1].rewrite, teamRewrite);
assert.deepEqual(reordered.independentRewrites, []);

const ambiguous = buildReportRewritePresentation(
  [{ fix: "Clarify the migration.", evidence: { excerpt: "Led platform migration", section: "Experience" } }],
  [
    { original: "Led platform migration for analytics.", better: "Led platform migration for analytics." },
    { original: "Led platform migration for commerce.", better: "Led platform migration for commerce." },
  ],
);
assert.equal(ambiguous.fixes[0].rewrite, undefined);
assert.equal(ambiguous.independentRewrites.length, 2);
assert.equal(rewriteMatchesFix(
  { fix: "Add a summary.", evidence: { excerpt: "No summary section present", section: "Summary" } },
  { original: "(No summary section present)", better: "Add a summary." },
), false);
assert.deepEqual(buildIndependentQuestionPresentation([
  { question: "Which result can you verify?", why: "It would make the scope easier to judge." },
  { question: "   ", why: "This should not render." },
  { question: "What did you personally own?", why: "It separates team scope from personal agency." },
]).map(({ originalIndex }) => originalIndex), [0, 2]);

for (const relativePath of [
  "components/workspace/ReportPanel.tsx",
  "components/workspace/ResumeModeSection.tsx",
  "components/workspace/report/ReportStream.tsx",
  "components/workspace/report/FixCanvas.tsx",
  "components/workspace/report/IndependentAdvice.tsx",
  "lib/api.ts",
  "lib/backend/validation.ts",
  "lib/llm/grounding.ts",
  "lib/llm/narrative-token-policy.ts",
  "lib/llm/resume-provider-messages.ts",
  "lib/llm/source-fidelity.ts",
  "lib/reports/report-presentation.ts",
  "lib/validation/schemas.ts",
  "tests/helpers/report-fidelity-fixture.ts",
  "tests/report-narrative-fidelity.test.ts",
  "tests/report-role-fidelity.test.ts",
  "tests/report-source-fidelity.test.ts",
]) {
  const lineCount = fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").split("\n").length;
  assert.ok(lineCount < 500, `${relativePath} must stay under 500 lines (found ${lineCount})`);
}

const productSource = [
  "components/workspace/report/FixCanvas.tsx",
  "components/workspace/report/IndependentAdvice.tsx",
  "components/workspace/report/ReportStream.tsx",
].map((relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), "utf8")).join("\n");
for (const forbiddenPlaceholder of ["verified metric", "verified detail"]) {
  assert.equal(productSource.includes(`[${forbiddenPlaceholder}]`), false);
}

console.log(`report source fidelity tests passed (${rejectedUnsafeRewrites}/12 rewrites, ${rejectedUnsafeNarratives}/12 narratives rejected)`);
