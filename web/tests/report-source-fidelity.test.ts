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

type LockedCase = {
  id: string;
  source: string;
  safe: string;
  unsafe: string;
};

const fixturePaths = [
  path.join(process.cwd(), "tests/fixtures/source-fidelity/cases-01-06.json"),
  path.join(process.cwd(), "tests/fixtures/source-fidelity/cases-07-12.json"),
];
const fixtureRaw = fixturePaths.map((fixturePath) => fs.readFileSync(fixturePath, "utf8"));
const fixtureSha256 = crypto.createHash("sha256").update(fixtureRaw.join("")).digest("hex");
assert.equal(
  fixtureSha256,
  "d88d1ded5c4aeee439c4df484f2c6ce0ccc8baef8da09104fadf3a05d6d6a69a",
  "the locked synthetic source-audit fixture changed",
);

const cases = fixtureRaw.flatMap((raw) => JSON.parse(raw) as LockedCase[]);
assert.equal(cases.length, 12);
assert.equal(new Set(cases.map(({ id }) => id)).size, 12);
assert.ok(cases.every(({ source, safe }) => source !== safe), "positive controls must be edited, useful rewrites");

let rejectedUnsafeRewrites = 0;
let rejectedUnsafeNarratives = 0;
for (const testCase of cases) {
  const safeComparison = compareSourceBoundRewrite({
    sourceText: testCase.source,
    sourceLocator: testCase.source,
    candidate: testCase.safe,
  });
  assert.equal(
    safeComparison.safe,
    true,
    `${testCase.id}: edited source facts must remain usable (${JSON.stringify(safeComparison.issues)})`,
  );
  assert.deepEqual(auditNarrativeClaim(testCase.safe, testCase.source), [], `${testCase.id}: exact narrative must pass`);

  const unsafeComparison = compareSourceBoundRewrite({
    sourceText: testCase.source,
    sourceLocator: testCase.source,
    candidate: testCase.unsafe,
  });
  assert.equal(unsafeComparison.safe, false, `${testCase.id}: unsafe rewrite must fail closed`);
  rejectedUnsafeRewrites += Number(!unsafeComparison.safe);

  const narrativeIssues = auditNarrativeClaim(testCase.unsafe, testCase.source);
  assert.ok(narrativeIssues.length > 0, `${testCase.id}: unsafe narrative must fail closed`);
  rejectedUnsafeNarratives += Number(narrativeIssues.length > 0);
}
assert.equal(rejectedUnsafeRewrites, 12);
assert.equal(rejectedUnsafeNarratives, 12);

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
assert.equal(filtered.report.summary, mixedReport.summary, "rewrite filtering must not erase useful report sections");
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
}).safe, true, "candidate-supplied facts may unlock a source-preserving draft");
assert.equal(compareSourceBoundRewrite({
  sourceText: sourceForFacts,
  sourceLocator: sourceForFacts,
  candidate: verifiedDraft.replace("$2M", "$3M"),
  verifiedFacts: [{ key: "verified result", value: "saved $2M" }],
}).safe, false, "edited candidate facts must be rechecked");

const savedPolicy = resolveRewriteCopyPolicy({
  original: cases[0].source,
  draft: cases[0].safe,
});
assert.deepEqual(savedPolicy.reason, "source_unavailable");
assert.equal(savedPolicy.copyable, false, "saved reports without source must disable Copy");
assert.equal(resolveRewriteCopyPolicy({
  sourceText: cases[0].source,
  original: cases[0].source,
  draft: `${cases[0].safe} [verified result]`,
}).reason, "unresolved_placeholders");
assert.equal(resolveRewriteCopyPolicy({
  sourceText: cases[0].source,
  original: cases[0].source,
  draft: cases[0].safe,
}).copyable, true);

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
assert.equal(ambiguous.independentRewrites.length, 2, "ambiguous rewrites must remain independent");
assert.equal(rewriteMatchesFix(
  { fix: "Add a summary.", evidence: { excerpt: "No summary section present", section: "Summary" } },
  { original: "(No summary section present)", better: "Add a summary." },
), false, "absence aliases must not bind");

const independentQuestions = buildIndependentQuestionPresentation([
  { question: "Which result can you verify?", why: "It would make the scope easier to judge." },
  { question: "   ", why: "This should not render." },
  { question: "What did you personally own?", why: "It separates team scope from personal agency." },
]);
assert.deepEqual(independentQuestions.map(({ originalIndex }) => originalIndex), [0, 2]);

for (const relativePath of [
  "components/workspace/ReportPanel.tsx",
  "components/workspace/ResumeModeSection.tsx",
  "components/workspace/report/ReportStream.tsx",
  "components/workspace/report/FixCanvas.tsx",
  "components/workspace/report/IndependentAdvice.tsx",
  "lib/api.ts",
  "lib/backend/validation.ts",
  "lib/llm/grounding.ts",
  "lib/llm/source-fidelity.ts",
  "lib/reports/report-presentation.ts",
  "lib/validation/schemas.ts",
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
  assert.equal(
    productSource.includes(`[${forbiddenPlaceholder}]`),
    false,
    `product UI must not synthesize the ${forbiddenPlaceholder} placeholder`,
  );
}

console.log(`report source fidelity tests passed (${rejectedUnsafeRewrites}/12 rewrites, ${rejectedUnsafeNarratives}/12 narratives rejected)`);
