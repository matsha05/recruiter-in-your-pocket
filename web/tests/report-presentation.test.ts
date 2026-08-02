import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ReportData } from "../components/workspace/report/ReportTypes";
import {
  assessFallbackDraftSafety,
  buildIndependentQuestionPresentation,
  buildReportRewritePresentation,
  canonicalSourceIdentity,
  fixPlanHeadingForCount,
  rewriteMatchesFix,
} from "../lib/reports/report-presentation";

type ReportFix = NonNullable<ReportData["top_fixes"]>[number];
type ReportRewrite = NonNullable<ReportData["rewrites"]>[number];

function fixFor(excerpt: string): ReportFix {
  return {
    fix: "Add the verified source detail.",
    evidence: { excerpt, section: "Work Experience" },
  };
}

function rewriteFor(original: string, better = `${original}; [verified detail].`): ReportRewrite {
  return { original, better };
}

assert.equal(fixPlanHeadingForCount(1), "One move. Start here.");
assert.equal(fixPlanHeadingForCount(2), "Two moves. In order.");
assert.equal(fixPlanHeadingForCount(3), "Three moves. In order.");
assert.equal(fixPlanHeadingForCount(5), "Three moves. In order.", "three-plus reports keep the three-move heading");

// Source identity must preserve word boundaries, operators, punctuation,
// currencies, case, and non-Latin text. These were false positives in the
// earlier lossy token matchers.
for (const [evidence, original] of [
  ["IT", "Positioned product strategy"],
  ["Owned $5M budget", "Owned €5M budget"],
  ["Hired 100+ engineers", "Hired 100 engineers"],
  ["東京 team lead", "大阪 team lead"],
  ["Revenue change -5%", "Revenue change 5%"],
  ["Revenue change −5%", "Revenue change 5%"],
  ["Revenue change +5%", "Revenue change 5%"],
  ["SLA >99%", "SLA 99%"],
  ["SLA <99%", "SLA 99%"],
  ["SLA ≤99%", "SLA 99%"],
  ["SLA ≥99%", "SLA 99%"],
  ["Budget <$5M", "Budget $5M"],
  ["Built .NET services", "Built NET services"],
  ["Led R&D programs", "Led R D programs"],
  ["Ran A/B tests", "Ran A B tests"],
  ["Owned IT systems", "Owned it systems"],
]) {
  for (const [left, right] of [[evidence, original], [original, evidence]]) {
    assert.equal(
      rewriteMatchesFix(fixFor(left), rewriteFor(right)),
      false,
      `${JSON.stringify(left)} must not identify ${JSON.stringify(right)}`,
    );
  }
}

assert.equal(
  canonicalSourceIdentity("  ●\tBuilt .NET services\nacross R&D  "),
  "Built .NET services across R&D",
  "canonical identity should remove only a known leading bullet and collapse whitespace",
);
assert.equal(canonicalSourceIdentity("-5% growth"), "-5% growth");
assert.equal(canonicalSourceIdentity("* starred source"), "* starred source");

assert.equal(
  rewriteMatchesFix(fixFor("IT"), rewriteFor("IT")),
  true,
  "an exact source line remains a valid identity even when it is short",
);
assert.equal(
  rewriteMatchesFix(
    fixFor("● Played a pivotal role in Boom of Funnel (BoF) initiatives, contributing to 1,000+ ML Gen hires"),
    rewriteFor("Played a pivotal role in Boom of Funnel (BoF) initiatives, contributing to 1,000+ ML Gen hires and providing data-driven insights."),
  ),
  true,
  "a meaningful shortened verbatim excerpt should match its full source line",
);
assert.equal(
  rewriteMatchesFix(
    fixFor("migration work across 東京 and 大阪 teams"),
    rewriteFor("Led migration work across 東京 and 大阪 teams while preserving service continuity."),
  ),
  true,
  "a meaningful Unicode verbatim window should match at whitespace boundaries",
);
assert.equal(
  rewriteMatchesFix(
    fixFor("NET platform services across three regions"),
    rewriteFor(".NET platform services across three regions with 99.9% availability."),
  ),
  false,
  "a substring cannot drop adjacent meaning-bearing punctuation",
);
assert.equal(
  rewriteMatchesFix(
    fixFor("Played a pivotal role in Boom of Funnel initiatives and provided data-driven insights."),
    rewriteFor("Played a pivotal role in Boom of Funnel initiatives"),
  ),
  false,
  "source identity is one-way; a rewrite source cannot be shorter than the cited evidence",
);

const teamFix = fixFor("Managed a team of 17 Recruiters and Sourcers");
const programFix = fixFor("Played a pivotal role in Boom of Funnel initiatives supporting 1,000+ hires");
const teamRewrite = rewriteFor(
  "Managed a team of 17 Recruiters and Sourcers, navigating two performance-related terminations.",
  "Managed 17 Recruiters and Sourcers; team result: [verified result].",
);
const programRewrite = rewriteFor(
  "Played a pivotal role in Boom of Funnel initiatives supporting 1,000+ hires and providing data-driven insights.",
  "Supported a program serving 1,000+ hires; personal decision: [verified decision].",
);
const reordered = buildReportRewritePresentation(
  [programFix, teamFix],
  [teamRewrite, programRewrite],
);
assert.equal(reordered.fixes[0].rewrite?.better, programRewrite.better);
assert.equal(reordered.fixes[1].rewrite?.better, teamRewrite.better);
assert.deepEqual(reordered.independentRewrites, []);

const ambiguousFix = fixFor("Led platform migrations across cloud services");
const ambiguousRewrites = [
  rewriteFor("Led platform migrations across cloud services for the analytics organization."),
  rewriteFor("Led platform migrations across cloud services for the commerce organization."),
];
for (const candidates of [ambiguousRewrites, [...ambiguousRewrites].reverse()]) {
  const ambiguous = buildReportRewritePresentation([ambiguousFix], candidates);
  assert.equal(ambiguous.fixes[0].rewrite, undefined, "ambiguous candidates must safely fall back");
  assert.equal(ambiguous.independentRewrites.length, 2, "ambiguous rewrites must remain independently visible");
}

const duplicateFixes = [teamFix, { ...teamFix }];
const duplicateRewrites = [teamRewrite, { ...teamRewrite, better: `${teamRewrite.better} Keep this distinct.` }];
const duplicate = buildReportRewritePresentation(duplicateFixes, duplicateRewrites);
assert.deepEqual(
  duplicate.fixes.map(({ rewrite }) => rewrite),
  [undefined, undefined],
  "duplicate sources must not be assigned by order",
);
assert.equal(duplicate.independentRewrites.length, 2);

const independentQuestions = buildIndependentQuestionPresentation([
  {
    question: "Which verified result best shows the scale of this work?",
    why: "It can surface scope that is currently implicit.",
  },
  { question: "   ", why: "This malformed empty prompt should not render." },
  {
    question: "What decision did you personally own?",
    why: "It separates personal agency from team context.",
  },
]);
assert.deepEqual(
  independentQuestions.map(({ originalIndex, question }) => ({
    originalIndex,
    question: question.question,
    why: question.why,
  })),
  [
    {
      originalIndex: 0,
      question: "Which verified result best shows the scale of this work?",
      why: "It can surface scope that is currently implicit.",
    },
    {
      originalIndex: 2,
      question: "What decision did you personally own?",
      why: "It separates personal agency from team context.",
    },
  ],
  "all valid model questions and their why text should remain independent and in source order",
);

const absenceFix = fixFor("No education section present");
assert.equal(
  rewriteMatchesFix(absenceFix, rewriteFor("No education section present")),
  true,
  "the same exact accepted absence sentinel may match",
);
assert.equal(
  rewriteMatchesFix(absenceFix, rewriteFor("(No education section present)")),
  false,
  "punctuation variants are not exact absence identities",
);
assert.equal(
  rewriteMatchesFix(absenceFix, rewriteFor("No work experience, but education section present")),
  false,
  "a sentence mentioning the same section is not an absence sentinel",
);
assert.equal(
  rewriteMatchesFix(fixFor("No summary section present"), rewriteFor("No summary on the resume")),
  false,
  "an absence alias is not an accepted source identity",
);

const malformedRewrite = { better: "A rewrite without a source." } as ReportRewrite;
assert.equal(rewriteMatchesFix(teamFix, malformedRewrite), false);
assert.doesNotThrow(() => buildReportRewritePresentation([teamFix], [malformedRewrite]));

const onboardingFallback = "Improved cross-team onboarding by clarifying expectations, responsibilities, and coordination for new hires.";
const onboardingSafety = assessFallbackDraftSafety(
  "Led onboarding work across the company, improving productivity.",
  onboardingFallback,
);
assert.equal(onboardingSafety.copyable, false);
assert.ok(
  onboardingSafety.issues.some(({ kind }) => kind === "fidelity"),
  "the current qualitative onboarding fallback must remain guidance-only when fidelity fails",
);

const unsupportedOutcome = assessFallbackDraftSafety(
  "Coordinated onboarding paperwork.",
  onboardingFallback,
);
assert.equal(unsupportedOutcome.copyable, false);
assert.ok(unsupportedOutcome.issues.some(({ kind }) => kind === "unsupported_outcome"));

const unsupportedAgency = assessFallbackDraftSafety(
  "Supported recruiting operations across several teams.",
  "Led recruiting operations across several teams.",
);
assert.equal(unsupportedAgency.copyable, false);
assert.ok(unsupportedAgency.issues.some(({ kind }) => kind === "unsupported_agency"));

assert.equal(assessFallbackDraftSafety("", "Draft text").copyable, false);
assert.equal(
  assessFallbackDraftSafety(
    "Managed launch planning across product and operations teams.",
    "Managed launch planning across product and operations teams; scope: [verified team count].",
  ).copyable,
  true,
  "a source-preserving fill-in draft may become copyable",
);

const verifiedOnboardingSource = "Led onboarding work across the company, improving productivity.";
const verifiedOnboardingFacts = [
  { key: "program length", value: "30-day program" },
  { key: "number of hires", value: "18 weekly hires" },
  { key: "teams", value: "Sales, Support, and Operations" },
  { key: "verified outcome", value: "28% shorter ramp time" },
] as const;
const verifiedOnboardingDraft = "Redesigned 30-day program onboarding for 18 weekly hires across Sales, Support, and Operations, improving 28% shorter ramp time.";
assert.equal(
  assessFallbackDraftSafety(
    verifiedOnboardingSource,
    verifiedOnboardingDraft,
    verifiedOnboardingSource,
    verifiedOnboardingFacts,
  ).copyable,
  true,
  "exact candidate-supplied facts should authorize a source-bound draft",
);
assert.equal(
  assessFallbackDraftSafety(
    verifiedOnboardingSource,
    verifiedOnboardingDraft.replace("Sales", "Salesforce"),
    verifiedOnboardingSource,
    verifiedOnboardingFacts,
  ).copyable,
  false,
  "altering a verified entity must close the copy gate",
);
assert.equal(
  assessFallbackDraftSafety(
    verifiedOnboardingSource,
    verifiedOnboardingDraft.replace("28%", "45%"),
    verifiedOnboardingSource,
    verifiedOnboardingFacts,
  ).copyable,
  false,
  "altering a verified metric must close the copy gate",
);

const sampleReport = JSON.parse(
  readFileSync(path.join(process.cwd(), "public", "sample-report.json"), "utf8"),
) as ReportData;
const samplePresentation = buildReportRewritePresentation(
  (sampleReport.top_fixes || []).slice(0, 3),
  sampleReport.rewrites || [],
);
assert.equal(
  samplePresentation.fixes.filter(({ rewrite }) => Boolean(rewrite)).length,
  3,
  "the public sample should keep three uniquely source-bound fix rewrites",
);
assert.deepEqual(
  samplePresentation.independentRewrites.map(({ rewrite }) => rewrite.original),
  ["Managed cross-functional initiatives.", "Drove process improvements."],
  "valid unmatched sample rewrites should remain accessible in source order",
);

console.log("report presentation tests passed");
