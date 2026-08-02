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
import { assertReportGrounding, ResumeFeedbackResponseSchema } from "../lib/validation/schemas";
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

for (const [source, candidate] of [
  ["Partnered with X on hiring workflows.", "Partnered with Y on hiring workflows."],
  ["Partnered with Li on hiring workflows.", "Partnered with Wu on hiring workflows."],
]) {
  assert.equal(compareSourceBoundRewrite({ sourceText: source, sourceLocator: source, candidate }).safe, false);
  assert.ok(auditNarrativeClaim(candidate, source).length > 0, `${source} must preserve the short source entity`);
}

const domainAcronymSource = "Supported HR operations.";
const domainAcronymMutation = "Supported IT operations.";
const domainAcronymDeletion = "Supported operations.";
assert.equal(compareSourceBoundRewrite({
  sourceText: domainAcronymSource,
  sourceLocator: domainAcronymSource,
  candidate: domainAcronymMutation,
}).safe, false, "domain acronym mutations must fail rewrite validation");
assert.ok(
  auditNarrativeClaim(domainAcronymMutation, domainAcronymSource).length > 0,
  "domain acronym mutations must fail narrative validation",
);
assert.ok(
  auditNarrativeClaim(domainAcronymDeletion, domainAcronymSource).length > 0,
  "domain acronym deletions must fail narrative validation",
);
assert.equal(resolveRewriteCopyPolicy({
  sourceText: domainAcronymSource,
  original: domainAcronymSource,
  draft: domainAcronymMutation,
}).copyable, false, "a mutated domain acronym must never be copyable");
assert.equal(resolveRewriteCopyPolicy({
  sourceText: domainAcronymSource,
  original: domainAcronymSource,
  draft: domainAcronymDeletion,
}).copyable, false, "a deleted domain acronym must never be copyable");

const detailedScope = "Managed a team of 25+ engineers across platform delivery.";
assert.ok(
  auditNarrativeClaim("Managed platform delivery.", detailedScope).length > 0,
  "narrative claims must not delete a material team scope",
);

const usefulParaphrase = {
  label: "Clarity",
  original: "Built customer workflows in HubSpot.",
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
}).copyable, true, "a source-faithful semantic paraphrase must remain copyable");
assert.equal(compareSourceBoundRewrite({
  sourceText: usefulParaphrase.original,
  sourceLocator: usefulParaphrase.original,
  candidate: "Created customer pipelines using HubSpot.",
}).safe, false, "the semantic alias must not admit arbitrary substitute nouns");
const retainedParaphrase = removeUnsafeRewrites({ rewrites: [usefulParaphrase] }, usefulParaphrase.original);
assert.equal(retainedParaphrase.removed.length, 0, "a useful source-faithful paraphrase must not disappear");
assert.deepEqual(retainedParaphrase.report.rewrites, [usefulParaphrase]);

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

const unsafePublicClaim = "Salesforce Administrator";
const renderedClaimProbe = {
  score_comment_short: unsafePublicClaim,
  first_impression: unsafePublicClaim,
  summary: unsafePublicClaim,
  first_impression_takeaway: unsafePublicClaim,
  biggest_gap_example: unsafePublicClaim,
  strengths: [unsafePublicClaim],
  gaps: [unsafePublicClaim],
  top_fixes: [{
    fix: unsafePublicClaim,
    why: unsafePublicClaim,
    evidence: { excerpt: "Built customer workflows in HubSpot.", section: unsafePublicClaim },
    section_ref: unsafePublicClaim,
  }],
  rewrites: [{ original: "Built customer workflows in HubSpot.", better: "Built customer workflows in HubSpot.", label: unsafePublicClaim }],
  ideas: { questions: [{ question: unsafePublicClaim, why: unsafePublicClaim }] },
  job_alignment: {
    jd_match_summary: unsafePublicClaim,
    positioning_suggestion: unsafePublicClaim,
    role_fit: {
      best_fit_roles: [unsafePublicClaim],
      stretch_roles: [unsafePublicClaim],
      seniority_read: unsafePublicClaim,
    },
  },
};
const renderedAuditPaths = new Set(
  auditReportNarrative(renderedClaimProbe, "Built customer workflows in HubSpot.").map(({ path: issuePath }) => issuePath),
);
for (const renderedPath of [
  "score_comment_short",
  "first_impression",
  "summary",
  "first_impression_takeaway",
  "biggest_gap_example",
  "strengths[0]",
  "gaps[0]",
  "top_fixes[0].fix",
  "top_fixes[0].why",
  "top_fixes[0].evidence.section",
  "top_fixes[0].section_ref",
  "rewrites[0].label",
  "ideas.questions[0].question",
  "ideas.questions[0].why",
  "job_alignment.jd_match_summary",
  "job_alignment.positioning_suggestion",
  "job_alignment.role_fit.best_fit_roles[0]",
  "job_alignment.role_fit.stretch_roles[0]",
  "job_alignment.role_fit.seniority_read",
]) {
  assert.ok(renderedAuditPaths.has(renderedPath), `${renderedPath} must be covered by the public narrative audit`);
}

const hubspotSource = "Built customer workflows in HubSpot.";
const reviewItem = {
  grade: "B",
  priority: "medium",
  working: "The workflow is readable.",
  missing: "The customer count is missing.",
  fix: "Add customer count.",
};
const schemaValidReport = {
  contract_version: "v2",
  score: 72,
  score_label: "Clear story",
  score_comment_short: "HubSpot workflow context is visible.",
  score_comment_long: "HubSpot workflow context is visible. The customer context needs detail.",
  score_plain: "HubSpot work is visible.",
  first_impression: "HubSpot workflow context is visible.",
  biggest_gap_example: "“Built customer workflows in HubSpot.” needs customer count.",
  first_impression_takeaway: "HubSpot context reads clearly",
  summary: "HubSpot workflow context is visible. The customer context needs detail. The next edit can clarify scope.",
  strengths: ["HubSpot appears on the page.", "The workflow context is readable.", "The customer focus is visible."],
  gaps: ["The customer count is missing.", "The workflow scope needs detail.", "The result needs context."],
  rewrites: [],
  top_fixes: [{
    fix: "Add customer count to the customer bullet.",
    why: "The customer scope is not explicit.",
    confidence: "high",
    evidence: { excerpt: hubspotSource, section: "Experience" },
    impact_level: "high",
    effort: "quick",
    section_ref: "Work Experience",
  }],
  next_steps: ["Add customer count.", "Add workflow scope.", "Add customer context."],
  subscores: { impact: 72, clarity: 72, story: 72, readability: 72 },
  section_review: {
    Summary: reviewItem,
    "Work Experience": reviewItem,
    Skills: reviewItem,
    Education: reviewItem,
  },
  job_alignment: {
    jd_match_score: 72,
    jd_match_summary: "HubSpot workflow work is visible.",
    jd_keywords: { matched: ["HubSpot"], missing: ["customer count"], match_count: 1, total_count: 2 },
    strongly_aligned: ["HubSpot workflow context is visible.", "The customer focus is visible.", "The workflow work is readable."],
    underplayed: ["The customer count needs context.", "The workflow scope needs context."],
    missing: ["The result needs context."],
    role_fit: {
      best_fit_roles: ["HubSpot", "Customer", "Workflows"],
      stretch_roles: ["HubSpot"],
      seniority_read: "Senior",
      industry_signals: ["HubSpot"],
      company_stage_fit: "Company",
    },
    positioning_suggestion: "Keep HubSpot workflow context visible.",
  },
  ideas: {
    questions: Array.from({ length: 5 }, () => ({
      question: "What customer count can you verify?",
      archetype: "SCALING",
      why: "The answer adds context.",
    })),
  },
};
const validSchemaResult = ResumeFeedbackResponseSchema.safeParse(schemaValidReport);
assert.equal(validSchemaResult.success, true, "the adversarial control must remain schema-valid");
assert.equal(assertReportGrounding(validSchemaResult.data, hubspotSource).ok, true, "the control report must be grounded");

const adversarialRoleReport = structuredClone(schemaValidReport);
adversarialRoleReport.job_alignment.role_fit.best_fit_roles[0] = unsafePublicClaim;
const adversarialSchemaResult = ResumeFeedbackResponseSchema.safeParse(adversarialRoleReport);
assert.equal(adversarialSchemaResult.success, true, "the critic role mutation must remain schema-valid");
const adversarialGrounding = assertReportGrounding(adversarialSchemaResult.data, hubspotSource);
assert.equal(adversarialGrounding.ok, false, "an unbound rendered role must fail grounding");
assert.ok(
  adversarialGrounding.inventedSpecifics.some((issue) => issue.includes("job_alignment.role_fit.best_fit_roles[0]")),
  "the grounding error must identify the rendered best-fit role",
);

const roleJobDescription = "We are hiring a Salesforce Administrator.";
assert.equal(
  assertReportGrounding(adversarialSchemaResult.data, hubspotSource, roleJobDescription).ok,
  true,
  "a rendered best-fit role may be grounded independently in the supplied job description",
);
const splitRoleGrounding = assertReportGrounding(
  adversarialSchemaResult.data,
  `${hubspotSource}\nSalesforce platform work.`,
  "We need an Administrator for the business systems team.",
);
assert.equal(
  splitRoleGrounding.ok,
  false,
  "role tokens split between resume and job description must not be concatenated into false support",
);
assert.ok(
  splitRoleGrounding.inventedSpecifics.some((issue) => issue.includes("job_alignment.role_fit.best_fit_roles[0]")),
  "the split-provenance role error must identify the rendered best-fit role",
);

const compositeRoleJobDescription = "Salesforce platform experience is preferred. The Workday Administrator owns HR systems.";
const compositeBestFitGrounding = assertReportGrounding(
  adversarialSchemaResult.data,
  hubspotSource,
  compositeRoleJobDescription,
);
assert.equal(
  compositeBestFitGrounding.ok,
  false,
  "an unordered single-line token bag must not manufacture a best-fit role",
);
assert.ok(
  compositeBestFitGrounding.inventedSpecifics.some((issue) => issue.includes("job_alignment.role_fit.best_fit_roles[0]")),
  "the composite best-fit role error must identify the rendered field",
);
assert.equal(
  assertReportGrounding(
    adversarialSchemaResult.data,
    hubspotSource,
    compositeRoleJobDescription.replace(". The", ".\nThe"),
  ).ok,
  false,
  "newline formatting must not change the composite best-fit role verdict",
);

const fabricatedRoleReport = structuredClone(schemaValidReport);
fabricatedRoleReport.job_alignment.role_fit.best_fit_roles[0] = "Workday Administrator";
const fabricatedRoleSchemaResult = ResumeFeedbackResponseSchema.safeParse(fabricatedRoleReport);
assert.equal(fabricatedRoleSchemaResult.success, true, "the fabricated role probe must remain schema-valid");
const fabricatedRoleGrounding = assertReportGrounding(
  fabricatedRoleSchemaResult.data,
  hubspotSource,
  roleJobDescription,
);
assert.equal(fabricatedRoleGrounding.ok, false, "a role absent from both sources must fail grounding");
assert.ok(
  fabricatedRoleGrounding.inventedSpecifics.some((issue) => issue.includes("job_alignment.role_fit.best_fit_roles[0]")),
  "the fabricated role error must identify the rendered best-fit role",
);

const jdGroundedStretchReport = structuredClone(schemaValidReport);
jdGroundedStretchReport.job_alignment.role_fit.stretch_roles[0] = unsafePublicClaim;
const jdGroundedStretchSchemaResult = ResumeFeedbackResponseSchema.safeParse(jdGroundedStretchReport);
assert.equal(jdGroundedStretchSchemaResult.success, true, "the stretch-role probe must remain schema-valid");
assert.equal(
  assertReportGrounding(jdGroundedStretchSchemaResult.data, hubspotSource, roleJobDescription).ok,
  true,
  "a rendered stretch role may be grounded independently in the supplied job description",
);
const compositeStretchGrounding = assertReportGrounding(
  jdGroundedStretchSchemaResult.data,
  hubspotSource,
  compositeRoleJobDescription,
);
assert.equal(
  compositeStretchGrounding.ok,
  false,
  "an unordered single-line token bag must not manufacture a stretch role",
);
assert.ok(
  compositeStretchGrounding.inventedSpecifics.some((issue) => issue.includes("job_alignment.role_fit.stretch_roles[0]")),
  "the composite stretch-role error must identify the rendered field",
);
assert.equal(
  assertReportGrounding(
    jdGroundedStretchSchemaResult.data,
    hubspotSource,
    compositeRoleJobDescription.replace(". The", ".\nThe"),
  ).ok,
  false,
  "newline formatting must not change the composite stretch-role verdict",
);

const punctuatedRoleJobDescriptions = [
  "Primary role: Salesforce / Administrator; owns CRM systems.",
  "Primary role: Salesforce-Administrator; owns CRM systems.",
  "Primary role: Salesforce—Administrator; owns CRM systems.",
];
for (const report of [adversarialSchemaResult.data, jdGroundedStretchSchemaResult.data]) {
  for (const jobDescription of punctuatedRoleJobDescriptions) {
    assert.equal(
      assertReportGrounding(report, hubspotSource, jobDescription).ok,
      true,
      "punctuation inside an otherwise contiguous role label must remain grounded",
    );
  }
}
const multilineRoleJobDescription = "Role overview\nSalesforce Administrator\nOwn CRM systems.";
const flattenedRoleJobDescription = multilineRoleJobDescription.replace(/\n/gu, " • ");
for (const report of [adversarialSchemaResult.data, jdGroundedStretchSchemaResult.data]) {
  for (const jobDescription of [multilineRoleJobDescription, flattenedRoleJobDescription]) {
    assert.equal(
      assertReportGrounding(report, hubspotSource, jobDescription).ok,
      true,
      "legitimate role evidence must survive multiline or flattened bullet formatting",
    );
  }
}

const fabricatedStretchReport = structuredClone(schemaValidReport);
fabricatedStretchReport.job_alignment.role_fit.stretch_roles[0] = "Workday Administrator";
const fabricatedStretchSchemaResult = ResumeFeedbackResponseSchema.safeParse(fabricatedStretchReport);
assert.equal(fabricatedStretchSchemaResult.success, true, "the fabricated stretch-role probe must remain schema-valid");
const fabricatedStretchGrounding = assertReportGrounding(
  fabricatedStretchSchemaResult.data,
  hubspotSource,
  roleJobDescription,
);
assert.equal(fabricatedStretchGrounding.ok, false, "a stretch role absent from both sources must fail grounding");
assert.ok(
  fabricatedStretchGrounding.inventedSpecifics.some((issue) => issue.includes("job_alignment.role_fit.stretch_roles[0]")),
  "the fabricated role error must identify the rendered stretch role",
);

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
