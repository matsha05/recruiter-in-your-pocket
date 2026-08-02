import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { validateResumeModelPayload } from "../lib/backend/validation";
import {
  compareSourceBoundRewrite,
  MAX_PUBLIC_SOURCE_EXCERPT,
} from "../lib/llm/source-line-comparator";
import {
  recoverUniqueSourceLine,
  repairResumeReportSourceFidelity,
} from "../lib/llm/source-fidelity";

function issueCodes(sourceText: string, sourceLocator: string, candidate: string) {
  return compareSourceBoundRewrite({ sourceText, sourceLocator, candidate }).issues.map((issue) => issue.code);
}

assert.equal(
  recoverUniqueSourceLine(
    "Reduced annual churn by 5% across 40 enterprise customer accounts after the pricing change.",
    "- Reduced annual churn by -5% across 40 enterprise customer accounts after the pricing change.",
  ),
  null,
  "lexical overlap must never erase a meaning-bearing sign",
);
assert.equal(
  recoverUniqueSourceLine(
    "Supported migration work",
    "- Supported migration work for Finance.\n- Supported migration work for Sales.",
  ),
  null,
  "ambiguous source windows fail closed",
);
assert.equal(
  recoverUniqueSourceLine("5%", "Revenue changed -5%."),
  null,
  "a short locator cannot bind through a meaning-bearing sign",
);
assert.equal(
  recoverUniqueSourceLine("NET services", "Built .NET services for the payments platform."),
  null,
  "a short locator cannot bind through meaning-bearing punctuation",
);

const comparatorCases: Array<{ source: string; candidate: string; code: string }> = [
  { source: "Created onboarding materials.", candidate: "Led onboarding materials.", code: "agency_upgraded" },
  { source: "Revenue changed -5%.", candidate: "Revenue changed 5%.", code: "metric_sign_changed" },
  { source: "SLA >99%.", candidate: "SLA 99%.", code: "metric_qualifier_changed" },
  { source: "Managed a $25M budget.", candidate: "Managed a 25% budget.", code: "metric_unit_changed" },
  { source: "Worked with over 150 beta users.", candidate: "Worked with 150 beta users.", code: "metric_qualifier_changed" },
  { source: "Served 10,000+ customers.", candidate: "Served 10,000 customers.", code: "metric_qualifier_changed" },
  { source: "Served 25 customers.", candidate: "Served 25.", code: "metric_unit_changed" },
  { source: "Completed migration in 3 months.", candidate: "Completed migration in 3 years.", code: "metric_unit_changed" },
  { source: "Worked with around 150 users.", candidate: "Worked with 150 users.", code: "metric_qualifier_changed" },
  { source: "Worked with at most 150 users.", candidate: "Worked with 150 users.", code: "metric_qualifier_changed" },
  { source: "Managed a minimum of 12 stores.", candidate: "Managed 12 stores.", code: "metric_qualifier_changed" },
  { source: "Managed 12 stores and supported 8 warehouses.", candidate: "Managed 12 warehouses and supported 8 stores.", code: "metric_entity_changed" },
  { source: "Managed a team of six engineers.", candidate: "Managed a team of seven engineers.", code: "metric_added" },
  { source: "Shipped a feature used by 10,000+ customers.", candidate: "Shipped a module used by 10,000+ customers.", code: "entity_scope_changed" },
  { source: "Managed a team of 25+.", candidate: "Managed teams of 25+.", code: "entity_scope_changed" },
  { source: "Created onboarding materials for sales teams.", candidate: "Created onboarding materials.", code: "entity_scope_changed" },
  { source: "Projected a 20% improvement.", candidate: "Delivered a 20% improvement.", code: "modality_strengthened" },
  { source: "Expected a 20% improvement.", candidate: "Delivered a 20% improvement.", code: "modality_strengthened" },
  { source: "Targeted a 20% improvement.", candidate: "Achieved a 20% improvement.", code: "modality_strengthened" },
  { source: "Contributed to a 25% uplift.", candidate: "Drove a 25% uplift.", code: "modality_strengthened" },
  { source: "Helped improve activation.", candidate: "Improved activation.", code: "modality_strengthened" },
  { source: "Supported reduction in churn.", candidate: "Reduced churn.", code: "modality_strengthened" },
  { source: "Worked on migration.", candidate: "Completed migration.", code: "modality_strengthened" },
  { source: "Supported a migration led by the program manager.", candidate: "Led the migration.", code: "agency_upgraded" },
  { source: "Updated the guide, improving clarity.", candidate: "Updated the guide, increasing revenue.", code: "unsupported_outcome" },
  { source: "Improved activation 25% and reduced churn 10%.", candidate: "Improved activation 10% and reduced churn 25%.", code: "metric_entity_changed" },
  { source: "Built .NET services for A/B testing with R&D.", candidate: "Built NET services for AB testing with R and D.", code: "source_content_dropped" },
  { source: "Migrated the SaaS platform to AWS.", candidate: "Migrated the platform.", code: "source_content_dropped" },
];
for (const testCase of comparatorCases) {
  assert.ok(
    issueCodes(testCase.source, testCase.source, testCase.candidate).includes(testCase.code as never),
    `${testCase.source} -> ${testCase.candidate} must report ${testCase.code}`,
  );
}

const unsafeSemanticCases = [
  ["Never managed staff; supported the manager.", "Managed staff."],
  ["Could reduce churn by 20%.", "Reduced churn by 20%."],
  ["Expected to increase revenue by 20%.", "Increased revenue by 20%."],
  ["Projected to reduce costs by 20%.", "Reduced costs by 20%."],
  ["Aimed to improve activation by 20%.", "Improved activation by 20%."],
  ["Associated with a 20% increase in revenue.", "Increased revenue by 20%."],
  ["Supported roughly 150 users.", "Supported 150 users."],
  ["Reduced processing time from 5 hours to 5 minutes.", "Reduced processing time from 5 minutes to 5 hours."],
  ["Completed a 3-month program.", "Completed a 3-year program."],
  ["Managed a 6-person team.", "Managed a 7-person team."],
  ["Managed a six-person team.", "Managed a seven-person team."],
  ["Supported pediatric nurses.", "Supported surgical doctors."],
  ["Led Acme delivery.", "Led Globex delivery."],
  ["Improved retention 25% for customers while supporting clients.", "Improved retention 25% for clients while supporting customers."],
] as const;
for (const [sourceLine, candidate] of unsafeSemanticCases) {
  const comparison = compareSourceBoundRewrite({ sourceText: sourceLine, sourceLocator: sourceLine, candidate });
  assert.equal(comparison.safe, false, `${sourceLine} -> ${candidate} must fail closed`);
}

const safeEquivalenceCases = [
  ["Managed a team of six engineers.", "Managed a team of 6 engineers."],
  ["Delivered six projects.", "Delivered 6 projects."],
  ["Completed work in six months.", "Completed work in 6 months."],
  ["Served 10,000+ customers.", "Supported 10,000+ customers."],
  ["Was responsible for preparing financial reports.", "Prepared financial reports."],
  ["Handled 25 client accounts.", "Supported 25 client accounts."],
  ["Supported a reduction in churn.", "Supported work that reduced churn."],
  ["Expected a 20% improvement.", "Projected a 20% improvement."],
  ["Supported around 150 users.", "Supported approximately 150 users."],
] as const;
for (const [sourceLine, candidate] of safeEquivalenceCases) {
  const comparison = compareSourceBoundRewrite({ sourceText: sourceLine, sourceLocator: sourceLine, candidate });
  assert.equal(
    comparison.safe,
    true,
    `${sourceLine} -> ${candidate} should remain safe: ${comparison.issues.map((issue) => `${issue.code}:${issue.detail}`).join(", ")}`,
  );
}

const crossLineSource = [
  "- Created onboarding materials for new hires.",
  "- Increased activation by 25% for an unrelated product.",
].join("\n");
assert.ok(
  issueCodes(
    crossLineSource,
    "Created onboarding materials for new hires.",
    "Created onboarding materials for new hires, increasing activation by 25%.",
  ).includes("metric_added"),
  "a number elsewhere in the resume cannot authorize a cross-line transplant",
);

const crossLineNarrativeSource = [
  "Built a readmission-risk platform for hospital teams.",
  "Created decision-support workflows for clinical reviewers.",
].join("\n");
assert.ok(
  issueCodes(
    crossLineNarrativeSource,
    "Built a readmission-risk platform for hospital teams.",
    "Built a readmission-risk platform with decision-support workflows for hospital teams.",
  ).includes("cross_line_transplant"),
  "nonnumeric content from another line cannot be transplanted into a bound rewrite",
);

const longLine = `Created a process ${"with bounded private context ".repeat(1_500)}.`;
const longComparison = compareSourceBoundRewrite({
  sourceText: longLine,
  sourceLocator: "Created a process",
  candidate: "Created a process; [verified result].",
});
assert.ok(!longComparison.binding.excerpt || longComparison.binding.excerpt.text.length <= MAX_PUBLIC_SOURCE_EXCERPT);
assert.equal(JSON.stringify(longComparison).includes(longLine), false, "comparator receipts never expose a complete arbitrary source line");

const decimalReport = {
  first_impression: "The $3.2M result at Example Inc. is clear. The 99.9% uptime result is also clear.",
  summary: "The $3.2M result at Example Inc. is clear. The 99.9% uptime result is also clear. Keep both facts.",
};
const decimalResume = "- Delivered $3.2M for Example Inc. while maintaining 99.9% uptime.";
assert.deepEqual(
  repairResumeReportSourceFidelity(decimalReport, decimalResume),
  { report: decimalReport, changes: [] },
  "narrow repairs must not split decimals or abbreviations",
);

const repairedUngroundedQuestion = repairResumeReportSourceFidelity({
  ideas: {
    questions: [{
      question: "How did the six-person Scrum team handle release risks for the 10,000-customer module?",
      why: "Probe delivery risk.",
    }],
  },
}, "Worked on release planning with a delivery team.").report as any;
assert.equal(
  JSON.stringify(repairedUngroundedQuestion).includes("10,000"),
  false,
  "question repair must not emit hard-coded metrics absent from the source",
);
assert.equal(JSON.stringify(repairedUngroundedQuestion).includes("6 engineers"), false);

const repairedGroundedQuestion = repairResumeReportSourceFidelity({
  ideas: {
    questions: [{
      question: "How did the six-person Scrum team handle release risks for the 10,000-customer module?",
      why: "Probe delivery risk.",
    }],
  },
}, [
  "Managed weekly planning with a Scrum team of 6 engineers.",
  "Owned delivery for a feature used by 10,000+ customers.",
].join("\n")).report as any;
assert.match(repairedGroundedQuestion.ideas.questions[0].question, /Scrum team of 6 engineers/);
assert.match(repairedGroundedQuestion.ideas.questions[0].question, /feature used by 10,000\+ customers/);
assert.doesNotMatch(repairedGroundedQuestion.ideas.questions[0].question, /10,000-customer module/);

type LockedSource = {
  results: Array<{ caseId: string; fixtureId: string; report: Record<string, unknown> }>;
};
type LockedManifest = {
  cases: Array<{ id: string; fixtureId: string; resumePath: string }>;
};

const manifest = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "gauntlet/manifest.json"), "utf8")) as LockedManifest;
const source = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "gauntlet/sources/eval-1785271781375-synthetic-12.json"), "utf8")) as LockedSource;
function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
}
function assertNoNewFactPlaceholders(value: unknown, rawValue: unknown, fieldPath = "report") {
  if (typeof value === "string") {
    const factPlaceholder = /\[verified (?:metric|detail)\]/;
    assert.equal(
      factPlaceholder.test(value) && !factPlaceholder.test(String(rawValue || "")),
      false,
      `${fieldPath} gained a fact placeholder instead of a source-backed repair`,
    );
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertNoNewFactPlaceholders(entry, (rawValue as any)?.[index], `${fieldPath}.${index}`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      assertNoNewFactPlaceholders(child, (rawValue as any)?.[key], `${fieldPath}.${key}`);
    }
  }
}
const rejectedClaims: Record<string, string[]> = {
  "staff-ml-elite": [
    "by setting expectations for experiment design, readable dashboards, and defensible decision memos",
  ],
  "vp-talent-elite": [
    "through R D and enterprise sales hiring",
    "requisition approval for R D and enterprise sales hiring",
  ],
  "data-science-senior-elite": [
    "team sizes of 8, 5, and 4",
    "dashboards used by 500+ compliance officers; [verified detail]",
  ],
  "marketing-vp-elite": [
    "does not identify the company size",
    "[company revenue or employee scale]",
    "contributing to a 25% uplift; [verified detail]",
  ],
  "operations-entry-weak": [
    "How many records, reports, meetings, or schedules did you manage",
  ],
  "product-entry-elite": [
    "four-person team, 150 beta users",
    "without losing the result already on the page",
    "The result is worth keeping",
    "moved from technical work into product management at BrightLeaf",
    "How did onboarding personalization expand",
    "six-person Scrum team",
    "10,000-customer module",
    "a module used by 10,000+ customers",
  ],
  "project-management-vp-strong": [
    "teams of 25+",
    "with a focus on; [verified detail]",
  ],
  "sales-mid-foundation": [
    "does not show quota, revenue, pipeline",
  ],
  "hr-director-foundation": [
    "justified each promotion",
  ],
  "finance-senior-weak": [
    "recur across multiple roles",
    "Which finance process did you own",
  ],
  "ux-director-strong": [
    "client-facing web; [verified detail]",
  ],
};

let validatedCases = 0;
let changedCases = 0;
let softwareControl: Record<string, any> | undefined;
let softwareResume = "";
for (const testCase of manifest.cases) {
  const selected = source.results.find((result) => result.caseId === testCase.id);
  assert.ok(selected, `missing locked source report for ${testCase.id}`);
  assert.equal(selected!.fixtureId, testCase.fixtureId);
  const resumeText = fs.readFileSync(path.resolve(process.cwd(), "../tests/resumes", testCase.resumePath), "utf8");
  const raw = structuredClone(selected!.report);
  const effective = validateResumeModelPayload(structuredClone(raw), resumeText, { forceGrounding: true });
  validatedCases += 1;
  if (JSON.stringify(effective) !== JSON.stringify(raw)) changedCases += 1;

  const serialized = JSON.stringify(effective);
  assertNoNewFactPlaceholders(effective, raw, testCase.id);
  const questionText = (effective.ideas?.questions || []).map((item: any) => item.question).join("\n");
  for (const field of allStrings(effective)) {
    for (const quote of field.matchAll(/["“]([^"”]+)["”]/g)) {
      assert.ok(quote[1].length <= MAX_PUBLIC_SOURCE_EXCERPT, `${testCase.id} contains an oversized quoted source locator`);
    }
  }
  for (const rejected of rejectedClaims[testCase.id] || []) {
    assert.equal(serialized.includes(rejected), false, `${testCase.id} still contains rejected claim: ${rejected}`);
  }
  for (const fix of (effective.top_fixes || [])) {
    assert.ok(fix.evidence.excerpt.length <= MAX_PUBLIC_SOURCE_EXCERPT, `${testCase.id} evidence exceeds short-excerpt contract`);
    assert.ok(resumeText.includes(fix.evidence.excerpt) || /^No .* present$/.test(fix.evidence.excerpt));
  }
  const second = validateResumeModelPayload(structuredClone(effective), resumeText, { forceGrounding: true });
  assert.deepEqual(second, effective, `${testCase.id} finalization must be idempotent`);

  if (testCase.id === "software-engineering-mid-strong") {
    softwareControl = structuredClone(raw);
    softwareResume = resumeText;
    assert.doesNotMatch(questionText, /Why did you choose|prevent recurrence|from requirements through deployment|What changed in your testing or review process/);
  }
  if (testCase.id === "product-entry-elite") {
    assert.match(serialized, /over 150 beta users/);
    assert.match(serialized, /feature used by 10,000\+ customers/);
  }
  if (testCase.id === "vp-talent-elite") {
    assert.ok(
      effective.top_fixes.every((fix: any) => fix.evidence.excerpt !== "Partnered with Finance to establish a headcount forecasting and requisition approval process that improved budget adherence and reduced last"),
      "the clipped VP Talent evidence locator must be replaced with a bounded complete excerpt",
    );
    assert.equal(effective.job_alignment.role_fit.industry_signals.includes("Financial services"), false);
    assert.doesNotMatch(questionText, /What changed in quality of hire|Which recruiter behavior changed|CEO and board priorities shape/);
  }
  if (testCase.id === "staff-ml-elite") {
    assert.equal(effective.job_alignment.role_fit.industry_signals.includes("Financial services"), false);
    assert.equal(effective.job_alignment.role_fit.industry_signals.includes("Logistics"), false);
    assert.match(effective.first_impression, /Staff ML resume/);
    assert.match(effective.summary, /forecasting across three product categories/);
    assert.doesNotMatch(effective.summary, /\[verified (?:metric|detail)\]/);
    assert.doesNotMatch(questionText, /Describe a personalization incident|choose the ranking tradeoff|How did Legal and Policy change|launch decisions|architecture or operating model to serve/);
  }
  if (testCase.id === "data-science-senior-elite") {
    assert.doesNotMatch(effective.first_impression, /\buptime\b/i);
    assert.doesNotMatch(serialized, /scalesbut|team leadership at team leadership|leadership at several team scales 5, and 4|\$3\. 2M/);
    assert.match(effective.summary, /over \$3\.2M in hospital savings/);
    assert.match(effective.strengths[0], /over \$3\.2M in annual savings/);
    assert.match(effective.gaps[0], /leading a cross-functional team of 8 data scientists and engineers/);
    assert.match(effective.gaps[0], /mentoring 5 junior data scientists/);
    assert.match(effective.gaps[0], /leading a team of 4 data scientists/);
    assert.doesNotMatch(effective.gaps[0], /\[verified (?:metric|detail)\]/);
    assert.doesNotMatch(questionText, /marketing and sales leadership use the A\/B testing framework/);
    assert.doesNotMatch(questionText, /readmission[^?]*(?:150K|decision support)|(?:150K|decision support)[^?]*readmission/i);
  }
  if (testCase.id === "marketing-vp-elite") {
    assert.notEqual(effective.first_impression_takeaway, "Show Tighten executive positioning");
    assert.doesNotMatch(questionText, /What tradeoff did you manage|reach agreement|without losing consistency/);
  }
  if (testCase.id === "ux-director-strong") {
    assert.equal(effective.rewrites.some((rewrite: any) => /^define UX strategy/i.test(rewrite.original)), false);
    assert.doesNotMatch(questionText, /What quality risk did you manage|resolve disagreements|replaced the prior process/);
  }
  if (testCase.id === "project-management-vp-strong") {
    assert.doesNotMatch(serialized, /teams of 25\+|team of 25\+ and 50|scalesbut/);
    assert.doesNotMatch(serialized, /over 15 years of experience level/i);
    assert.doesNotMatch(questionText, /team expanded/);
    assert.doesNotMatch(questionText, /100\+[^?]*(?:mission|limited resources|decision-making)|(?:mission|limited resources|decision-making)[^?]*100\+/i);
  }
  if (testCase.id === "sales-mid-foundation") {
    assert.doesNotMatch(questionText, /Describe a difficult customer inquiry|what happened afterward|What changed after you contributed|How did you coordinate marketing and sales outreach/);
  }
  if (testCase.id === "finance-senior-weak") {
    assert.doesNotMatch(questionText, /what finance issue did the collaboration resolve|What changed when you supported|what changed afterward/i);
  }
  if (testCase.id === "operations-entry-weak") {
    assert.doesNotMatch(questionText, /from planning through completion|what changed afterward|Which departments did you coordinate with/i);
  }
  if (testCase.id === "product-entry-elite") {
    assert.doesNotMatch(questionText, /Scrum team of 6 engineers delivered the feature|while the Scrum team/);
    assert.match(questionText, /Scrum team of 6 engineers/);
    assert.match(questionText, /feature used by 10,000\+ customers/);
    assert.doesNotMatch(questionText, /Which user insight led/);
    assert.doesNotMatch(questionText, /How did your earlier background shape/);
  }
  if (testCase.id === "hr-director-foundation") {
    assert.doesNotMatch(questionText, /What did you resolve with finance and operations|What changed after you coordinated|which responsibilities became broader/);
  }
}
assert.equal(validatedCases, 12);
assert.ok(changedCases > 0);

assert.ok(softwareControl && softwareResume, "software privacy control fixture must be available");
const canarySentence = "Project Chimera at Example Inc. generated $7.77M with 88.88% uptime on Oracle Cloud.";
const canaryProbe = structuredClone(softwareControl!);
canaryProbe.score_comment_short = canarySentence;
canaryProbe.score_comment_long = canarySentence;
canaryProbe.score_plain = canarySentence;
canaryProbe.first_impression = canarySentence;
canaryProbe.summary = `${canarySentence} The résumé contains relevant experience. Any additional result should be verified.`;
canaryProbe.strengths[0] = canarySentence;
canaryProbe.next_steps[0] = canarySentence;
canaryProbe.section_review.Summary.working = canarySentence;
canaryProbe.job_alignment.jd_match_summary = canarySentence;
canaryProbe.job_alignment.strongly_aligned[0] = canarySentence;
canaryProbe.job_alignment.role_fit.seniority_read = canarySentence;
canaryProbe.job_alignment.positioning_suggestion = canarySentence;
canaryProbe.layout_notes = canarySentence;
canaryProbe.ideas.questions[0].question = "How did Project Chimera at Example Inc. generate $7.77M with 88.88% uptime on Oracle Cloud?";
canaryProbe.ideas.questions[0].why = canarySentence;
const canaryFinal = validateResumeModelPayload(canaryProbe, softwareResume, { forceGrounding: true });
const canarySerialized = JSON.stringify(canaryFinal);
assert.doesNotMatch(
  canarySerialized,
  /Project Chimera|Example Inc\.|\$7\.77M|88\.88%|Oracle Cloud/,
  "force-grounded public narrative and questions must remove unsupported named and numeric canaries",
);
assert.deepEqual(
  validateResumeModelPayload(structuredClone(canaryFinal), softwareResume, { forceGrounding: true }),
  canaryFinal,
  "canary repair must remain idempotent",
);

const privateLongLine = `Created a process with context ${"private candidate detail ".repeat(1_800)}.`;
const privacyProbe = structuredClone(softwareControl!);
privacyProbe.biggest_gap_example = `"${privateLongLine}" lacks a measurable outcome, so its impact is unclear.`;
privacyProbe.rewrites = [{
  label: "Privacy probe",
  original: "Created a process with context",
  better: "Created a process with context; [verified result].",
  enhancement_note: "Add only a verified result.",
}];
const privateFinal = validateResumeModelPayload(privacyProbe, `${softwareResume}\n${privateLongLine}`, { forceGrounding: true });
assert.ok(privateFinal.rewrites.every((rewrite: any) => rewrite.original.length <= MAX_PUBLIC_SOURCE_EXCERPT));
assert.equal(JSON.stringify(privateFinal).includes(privateLongLine), false, "a long source line must never persist in the public report");
const privateGapQuote = privateFinal.biggest_gap_example.match(/["“]([^"”]+)["”]/)?.[1] || "";
assert.ok(privateGapQuote.length > 0 && privateGapQuote.length <= MAX_PUBLIC_SOURCE_EXCERPT);
assert.match(privateFinal.biggest_gap_example, /missing|lacks|does not/i);

const workspaceSource = fs.readFileSync(path.resolve(process.cwd(), "components/workspace/WorkspaceClient.tsx"), "utf8");
assert.doesNotMatch(workspaceSource, /repairResumeReportSourceFidelity/);
assert.doesNotMatch(workspaceSource, /setReport\([^\n]*partial/);
assert.match(workspaceSource, /report_first_meaningful_chunk_received/);
const reportStreamSource = fs.readFileSync(path.resolve(process.cwd(), "components/workspace/report/ReportStream.tsx"), "utf8");
assert.match(reportStreamSource, /assessFallbackDraftSafety\(draftSource, draft, resumeText \|\| draftSource, verifiedFacts\)/);
assert.match(reportStreamSource, /<details id="section-score" open/);

console.log(`report source fidelity tests passed (${validatedCases} locked reports, ${changedCases} changed)`);
