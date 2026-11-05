import assert from "node:assert/strict";
import { marginNoteFromFix } from "../lib/reports/revised-line";
import Module from "node:module";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { validateResumeModelPayload } from "../lib/backend/validation";
import { renderReportHtml } from "../lib/backend/pdf";
import { auditNarrativeClaim, compareSourceBoundRewrite } from "../lib/llm/source-fidelity";
import { narrativeMeaningIssues } from "../lib/llm/narrative-meaning";
import { relationshipBindingIssues } from "../lib/llm/source-relationship-fidelity";
import { saveReceiptValidatedReport } from "../lib/reports/client-report-save";
import { buildPdfExportRequest, normalizeReportForPdf } from "../lib/reports/pdf-export";
import { makeValidatedReportReceipt, validatedReportReceiptClaim } from "../lib/reports/report-receipt";
import { ResumeFeedbackResponseSchema } from "../lib/validation/resume-report-schema";
import {
  hubspotJobDescription,
  hubspotSource,
  schemaValidReport,
} from "./helpers/report-fidelity-fixture";

const resumeControl = [
  "SUMMARY",
  "Customer operations profile.",
  "WORK EXPERIENCE",
  hubspotSource,
  "SKILLS",
  "HubSpot",
  "EDUCATION",
  "State University",
  "Growth-stage company.",
  "Show HubSpot.",
].join("\n");
process.env.SESSION_SECRET ||= "relationship-fidelity-receipt-secret";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};
const runtimeModule = Module as RuntimeModule;
const originalLoad = runtimeModule._load;
(require as any).extensions[".tsx"] = (require as any).extensions[".ts"];
runtimeModule._load = function loadReportStream(request, parent, isMain) {
  if (request.endsWith(".module.css")) return {};
  if (request === "@phosphor-icons/react") {
    return new Proxy({}, { get: () => () => null });
  }
  if (request.startsWith("@/")) {
    return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
  }
  return originalLoad(request, parent, isMain);
};
const { ReportStream } = require("../components/workspace/report/ReportStream.tsx") as {
  ReportStream: (props: any) => any;
};
runtimeModule._load = originalLoad;

const completeReport = structuredClone(schemaValidReport) as any;
completeReport.score_comment_short = "PRIMARY SHORT COPY.";
completeReport.first_impression = "DETAILED OPENING SENTINEL.";
completeReport.summary = "DETAILED SUMMARY SENTINEL one. DETAILED SUMMARY SENTINEL two. DETAILED SUMMARY SENTINEL three.";
completeReport.score_comment_long = "DETAILED SCORE REASON SENTINEL one. DETAILED SCORE REASON SENTINEL two.";
completeReport.score_plain = "DETAILED SCORE MEANING SENTINEL.";
completeReport.biggest_gap_example = "DETAILED GAP EXAMPLE SENTINEL";
completeReport.strengths = [
  "VISIBLE STRENGTH ONE",
  "VISIBLE STRENGTH TWO",
  "VISIBLE STRENGTH THREE",
  "REMAINING STRENGTH SENTINEL",
];
// Distinct wording: notes that share most of their words read as one repeated observation and render once.
completeReport.gaps = [
  "VISIBLE GAP ONE",
  "REMAINING GAP TWO SENTINEL",
  "THIRD OPEN GAP MARKER",
];
completeReport.section_review.Summary = {
  grade: "A",
  priority: "high",
  working: "SECTION WORKING SENTINEL",
  missing: "SECTION MISSING SENTINEL",
  fix: "SECTION FIX SENTINEL",
};
completeReport.next_steps = [
  "NEXT STEP ONE SENTINEL",
  "NEXT STEP TWO SENTINEL",
  "NEXT STEP THREE SENTINEL",
];
completeReport.job_alignment = {
  ...completeReport.job_alignment,
  jd_match_score: 74,
  positioning_suggestion: "VISIBLE ROLE POSITIONING",
  jd_match_summary: "DETAILED JOB SUMMARY SENTINEL",
  strongly_aligned: ["ALIGNED DETAIL SENTINEL", "ALIGNED DETAIL TWO", "ALIGNED DETAIL THREE"],
  underplayed: ["UNDERPLAYED DETAIL SENTINEL", "UNDERPLAYED DETAIL TWO"],
  missing: ["MISSING DETAIL SENTINEL"],
  jd_keywords: {
    matched: ["MATCHED KEYWORD SENTINEL"],
    missing: ["MISSING KEYWORD SENTINEL"],
    match_count: 1,
    total_count: 2,
  },
  role_fit: {
    best_fit_roles: ["VISIBLE ROLE ONE", "VISIBLE ROLE TWO", "VISIBLE ROLE THREE", "EXTRA ROLE SENTINEL"],
    stretch_roles: ["STRETCH ROLE SENTINEL"],
    seniority_read: "VISIBLE SENIORITY",
    industry_signals: ["INDUSTRY SENTINEL"],
    company_stage_fit: "COMPANY STAGE SENTINEL",
  },
};
assert.doesNotThrow(
  () => ResumeFeedbackResponseSchema.parse(completeReport),
  "the UI completeness fixture must stay inside the client-visible v2 schema",
);

const completeReportHtml = renderToStaticMarkup(createElement(ReportStream, {
  report: completeReport,
  hasJobDescription: true,
}));
// The Critical Miss is the first marked line: its quoted source, the fix as a margin note, its reason
// once, and its question as an answer field that builds the revised line.
const factOnlyStart = completeReportHtml.indexOf('id="section-fix-1"');
assert.notEqual(factOnlyStart, -1, "a recommendation without a rewrite must remain visible");
const factOnlyEnd = ['data-testid="structural-gaps"', 'data-testid="keep-note"', 'id="section-fix-2"']
  .map((marker) => completeReportHtml.indexOf(marker, factOnlyStart)).filter((at) => at > factOnlyStart)
  .reduce((first, at) => Math.min(first, at), completeReportHtml.length);
const factOnlyHtml = completeReportHtml.slice(factOnlyStart, factOnlyEnd);
assert.ok(factOnlyHtml.includes(hubspotSource.replace(/^[-•*]\s+/u, "")), "the original evidence must survive when no rewrite is supplied");
assert.ok(factOnlyHtml.includes(marginNoteFromFix(completeReport.top_fixes[0].fix)), "the fix is the line's margin note");
assert.equal(completeReportHtml.split(completeReport.top_fixes[0].why).length - 1, 1, "the Critical Miss gives its reason once");
assert.ok(factOnlyHtml.includes(completeReport.top_fixes[0].why), "the Critical Miss row carries the why");
assert.match(factOnlyHtml, /What customer count can you verify\?/, "the lift asks the question written for its line");
assert.ok(factOnlyHtml.includes('data-testid="line-lift"'));
assert.doesNotMatch(factOnlyHtml, /Suggested wording|View draft template|Why this is stronger/,
  "a fact-only recommendation must not promise or praise an absent rewrite");
const scoreStart = completeReportHtml.indexOf('<details id="section-score"');
assert.notEqual(scoreStart, -1, "score explanations must remain available beside the score");
const scoreEnd = completeReportHtml.indexOf("</details>", scoreStart);
const scoreHtml = completeReportHtml.slice(scoreStart, scoreEnd + "</details>".length);
for (const expected of ["DETAILED SCORE REASON SENTINEL", "DETAILED SCORE MEANING SENTINEL"]) {
  assert.ok(scoreHtml.includes(expected), `the score disclosure must retain ${expected}`);
}
// The full recruiter notes and the five interview questions were cut from the report (Matt, Nov 5, 2026):
// nothing the marked rows already say is repeated below them, and the detail fields stay in the data.
assert.equal(completeReportHtml.includes('id="section-full-notes"'), false, "no full recruiter notes disclosure");
assert.equal(completeReportHtml.includes("Questions only you can answer"), false, "no interview-style question list");
assert.equal(completeReportHtml.includes("Full recruiter notes"), false);
const openingHtml = completeReportHtml.slice(completeReportHtml.indexOf('id="section-first-impression"'), completeReportHtml.indexOf('id="section-fixes"'));
assert.ok(openingHtml.includes("DETAILED OPENING SENTINEL"), "the recruiter's first impression must lead the report as the Verdict");
for (const cut of ["SECTION WORKING SENTINEL", "SECTION MISSING SENTINEL", "SECTION FIX SENTINEL", "STRETCH ROLE SENTINEL", "INDUSTRY SENTINEL", "COMPANY STAGE SENTINEL", "MATCHED KEYWORD SENTINEL"]) {
  assert.equal(completeReportHtml.includes(cut), false, `the cut notes no longer render ${cut}`);
}
for (const alreadyVisible of ["PRIMARY SHORT COPY", "VISIBLE STRENGTH ONE", "VISIBLE ROLE POSITIONING", "VISIBLE ROLE ONE", "VISIBLE SENIORITY"]) {
  assert.equal(completeReportHtml.split(alreadyVisible).length - 1, 1, `${alreadyVisible} renders once`);
}

const exactRelationshipCases = [
  {
    label: "actor/action/object assignment",
    source: "Alice designed checkout and Bob implemented billing.",
    rejected: "Alice implemented billing and Bob designed checkout.",
    accepted: "Bob implemented billing and Alice designed checkout.",
  },
  {
    label: "coordinated metric assignment",
    source: "Increased conversion by 12% and retention by 8%.",
    rejected: "Increased conversion by 8% and retention by 12%.",
    accepted: "Increased retention by 8% and conversion by 12%.",
  },
  {
    label: "coordinated direction assignment",
    source: "Increased conversion from 10% to 12% and retention from 5% to 8%.",
    rejected: "Increased conversion from 5% to 8% and retention from 10% to 12%.",
    accepted: "Increased retention from 5% to 8% and conversion from 10% to 12%.",
  },
  {
    label: "nonnumeric direction",
    source: "Migrated data from Oracle to Postgres.",
    rejected: "Migrated data from Postgres to Oracle.",
    accepted: "Migrated data from Oracle to Postgres.",
  },
  {
    label: "ASCII arrow direction",
    source: "Migrated data Oracle -> Postgres.",
    rejected: "Migrated data Postgres -> Oracle.",
    accepted: "Migrated data Oracle -> Postgres.",
  },
  {
    label: "Unicode arrow direction",
    source: "Migrated records Oracle → Postgres.",
    rejected: "Migrated records Postgres → Oracle.",
    accepted: "Migrated records Oracle → Postgres.",
  },
  {
    label: "standalone fat arrow direction",
    source: "Oracle => Postgres.",
    rejected: "Postgres => Oracle.",
    accepted: "Oracle => Postgres.",
  },
  {
    label: "long arrow with multiword endpoints",
    source: "Migrated customer data Oracle Database ⟶ Postgres Warehouse.",
    rejected: "Migrated customer data Postgres Warehouse ⟶ Oracle Database.",
    accepted: "Migrated customer data Oracle Database ⟶ Postgres Warehouse.",
  },
  {
    label: "ASCII arrow with multiword endpoints",
    source: "Moved records Legacy Oracle -> Managed Postgres.",
    rejected: "Moved records Managed Postgres -> Legacy Oracle.",
    accepted: "Moved records Legacy Oracle -> Managed Postgres.",
  },
  {
    label: "boosted metric assignment",
    source: "Alice boosted checkout by 12% and Bob boosted billing by 8%.",
    rejected: "Alice boosted checkout by 8% and Bob boosted billing by 12%.",
    accepted: "Bob boosted billing by 8% and Alice boosted checkout by 12%.",
  },
  {
    label: "comma-gapped boosted metrics",
    source: "Boosted conversion by 12%, retention by 8%.",
    rejected: "Boosted conversion by 8%, retention by 12%.",
    accepted: "Boosted retention by 8%, conversion by 12%.",
  },
  {
    label: "raised metric assignment",
    source: "Raised conversion by 12%, retention by 8%.",
    rejected: "Raised conversion by 8%, retention by 12%.",
    accepted: "Raised retention by 8%, conversion by 12%.",
  },
  {
    label: "semicolon-gapped boosted metrics",
    source: "Boosted conversion by 12%; retention by 8%.",
    rejected: "Boosted conversion by 8%; retention by 12%.",
    accepted: "Boosted retention by 8%; conversion by 12%.",
  },
  {
    label: "passive actor assignment",
    source: "The migration was led by Alice and supported by Bob.",
    rejected: "The migration was led by Bob and supported by Alice.",
    accepted: "The migration was supported by Bob and led by Alice.",
  },
  {
    label: "comma passive actor assignment",
    source: "Checkout, led by Alice, and billing, supported by Bob.",
    rejected: "Checkout, led by Bob, and billing, supported by Alice.",
    accepted: "Checkout, led by Alice, and billing, supported by Bob.",
  },
  {
    label: "complete passive comma clauses",
    source: "Checkout was led by Alice, billing was supported by Bob.",
    rejected: "Checkout was led by Bob, billing was supported by Alice.",
    accepted: "Billing was supported by Bob, checkout was led by Alice.",
  },
] as const;

function reportWithSummary(claim: string) {
  const report: any = structuredClone(schemaValidReport);
  report.summary = `HubSpot workflow context is visible. ${claim} The customer context needs detail.`;
  report.score_comment_short = claim;
  return report;
}

function validateSummary(claim: string, source: string) {
  return validateResumeModelPayload(reportWithSummary(claim), `${resumeControl}\n${source}`, {
    forceGrounding: true,
    jobDescription: hubspotJobDescription,
  });
}

for (const testCase of exactRelationshipCases) {
  assert.ok(relationshipBindingIssues(testCase.rejected, testCase.source).length > 0, testCase.label);
  assert.deepEqual(relationshipBindingIssues(testCase.accepted, testCase.source), [], `${testCase.label} valid control`);
  assert.equal(compareSourceBoundRewrite({
    sourceText: testCase.source, sourceLocator: testCase.source, candidate: testCase.rejected,
  }).safe, false, `${testCase.label} rewrite mutation`);
  assert.equal(compareSourceBoundRewrite({
    sourceText: testCase.source, sourceLocator: testCase.source, candidate: testCase.accepted,
  }).safe, true, `${testCase.label} rewrite control`);
  let receiptBoundaryReached = false;
  assert.throws(
    () => {
      const validated = validateSummary(testCase.rejected, testCase.source);
      receiptBoundaryReached = true;
      return makeValidatedReportReceipt(validated);
    },
    /evidence grounding contract/,
    `${testCase.label} swap must fail in the production model validator`,
  );
  assert.equal(receiptBoundaryReached, false, `${testCase.label} must fail before receipt minting`);
  const validated = validateSummary(testCase.accepted, testCase.source);
  assert.ok(validated.summary.includes(testCase.accepted), `${testCase.label} must retain its exact assignment`);
}

const jdSource = "Increased conversion by 12% and retention by 8%.";
const jdRejected = "Increased conversion by 8% and retention by 12%.";
const jdRelationshipReport = (claim: string) => {
  const report: any = structuredClone(schemaValidReport);
  report.job_alignment.missing[0] = claim;
  return report;
};
assert.throws(
  () => validateResumeModelPayload(jdRelationshipReport(jdRejected), resumeControl, {
    forceGrounding: true,
    jobDescription: `${hubspotJobDescription} ${jdSource}`,
  }),
  /evidence grounding contract/,
  "a JD-only missing claim must be relationship-audited before the absence allowance",
);
assert.doesNotThrow(
  () => validateResumeModelPayload(jdRelationshipReport(jdSource), resumeControl, {
    forceGrounding: true,
    jobDescription: `${hubspotJobDescription} ${jdSource}`,
  }),
  "the exact JD relationship must retain the valid missing-claim allowance",
);
const jdArrowSource = "Migrate customer data Oracle -> Postgres.";
assert.throws(
  () => validateResumeModelPayload(jdRelationshipReport("Migrate customer data Postgres -> Oracle."), resumeControl, {
    forceGrounding: true,
    jobDescription: `${hubspotJobDescription} ${jdArrowSource}`,
  }),
  /evidence grounding contract/,
  "a JD-only arrow direction must be audited before the missing-path allowance",
);
assert.doesNotThrow(
  () => validateResumeModelPayload(jdRelationshipReport(jdArrowSource), resumeControl, {
    forceGrounding: true,
    jobDescription: `${hubspotJobDescription} ${jdArrowSource}`,
  }),
  "the exact JD arrow direction must retain the valid missing-path allowance",
);

for (const ambiguous of [
  "Migrated data Oracle ->.",
  "Alice designed checkout, Bob implemented billing.",
]) {
  assert.ok(
    relationshipBindingIssues(ambiguous, ambiguous).some((issue) => issue.startsWith("unresolved relationship binding:")),
    `complex unresolved clauses must fail closed: ${ambiguous}`,
  );
}

async function assertReceiptWireSavePdfChain() {
  for (const [index, testCase] of exactRelationshipCases.entries()) {
    let browserBoundaryReached = false;
    assert.throws(() => {
      const invalid = validateSummary(testCase.rejected, testCase.source);
      renderToStaticMarkup(createElement(ReportStream, { report: invalid }));
      browserBoundaryReached = true;
      return invalid.summary;
    }, /evidence grounding contract/, `${testCase.label} must fail before the primary browser claim`);
    assert.equal(browserBoundaryReached, false);

    const validated = validateSummary(testCase.accepted, testCase.source);
    const reportStreamHtml = renderToStaticMarkup(createElement(ReportStream, { report: validated }));
    const reportStreamText = reportStreamHtml.replaceAll("&gt;", ">").replaceAll("&amp;", "&");
    assert.ok(reportStreamText.includes(testCase.accepted), `${testCase.label} actual ReportStream SSR claim`);
    const receipt = makeValidatedReportReceipt(validated);
    assert.ok(validatedReportReceiptClaim(validated, receipt), `${testCase.label} validated receipt`);
    const wireReport = JSON.parse(JSON.stringify({ ...validated, report_receipt: receipt }));
    const { report_receipt: wireReceipt, ...wirePayload } = wireReport;
    assert.ok(validatedReportReceiptClaim(wirePayload, wireReceipt), `${testCase.label} receipt wire`);

    const reportId = `123e4567-e89b-42d3-a456-${String(426614174000 + index).padStart(12, "0")}`;
    const saved = await saveReceiptValidatedReport(wireReport, async (_input, init) => {
      const submitted = JSON.parse(String(init?.body || "{}"))?.report;
      const { report_receipt: submittedReceipt, ...submittedPayload } = submitted;
      assert.ok(validatedReportReceiptClaim(submittedPayload, submittedReceipt), `${testCase.label} save wire`);
      return Response.json({ ok: true, reportId });
    });
    assert.deepEqual(buildPdfExportRequest(saved), { report_id: reportId });
    const pdfReport = normalizeReportForPdf(saved);
    assert.ok(pdfReport);
    const pdfHtml = renderReportHtml(pdfReport);
    assert.ok(
      (testCase.accepted.match(/[\p{L}\p{N}%]+/gu) || []).every((token) => pdfHtml.includes(token)),
      `${testCase.label} PDF sink`,
    );
  }
}

assert.deepEqual(
  relationshipBindingIssues(
    "Reducing mean time to repair from 15 days to 11 hours gives the Kubernetes work a clear center.",
    "Executed an automated health check system for Kubernetes clusters that reduced mean time to repair from 15 days to 11\nhours.",
  ),
  [],
  "wrapped time units must retain their direction binding",
);
assert.equal(
  relationshipBindingIssues(
    "The resume includes 42+ recruiters onboarded.",
    "Onboarding 42+ non-AI/ML recruiters through a structured mentorship program resulted in 107 hires.",
  ).some((issue) => issue.includes("process-to-action mutation")),
  false,
  "quantified onboarding must be treated as an action while onboarding paperwork remains a noun",
);

const plannedExecutionCases = [
  {
    source: "Presented findings that influenced the decision to expand onboarding personalization to additional modules.",
    question: "What findings did you present before onboarding personalization expanded?",
    completed: "Expanded onboarding personalization to additional modules.",
  },
  {
    source: "Planned to launch customer billing.", question: "What did you monitor after customer billing was launched?",
    completed: "Customer billing was launched.",
  },
  {
    source: "Agreed to expand checkout support.", question: "What changed before checkout support expanded?",
    completed: "Checkout support expanded.",
  },
  {
    source: "Decided to launch checkout.", question: "What did you review after checkout launched?",
    completed: "Launched checkout.",
  },
];
for (const { source, question, completed } of plannedExecutionCases) {
  assert.ok(narrativeMeaningIssues(question, source).some(issue => issue.includes("decision or plan")));
  assert.ok(auditNarrativeClaim(question, source, { interpretationContext: "question" })
    .some(issue => issue.unsupportedFacts.some(fact => fact.includes("decision or plan"))));
  for (const actualSource of [completed, `${source} ${completed}`]) {
    assert.deepEqual(narrativeMeaningIssues(question, actualSource), [], "explicit execution supports the temporal question");
  }
}
assert.deepEqual(narrativeMeaningIssues("What findings supported the decision to expand onboarding personalization?", plannedExecutionCases[0].source), []);
assert.deepEqual(narrativeMeaningIssues("Did onboarding personalization expand after the decision?", plannedExecutionCases[0].source), []);
assert.ok(narrativeMeaningIssues("What changed after checkout launched?", "Planned to launch checkout and launched reporting.")
  .some(issue => issue.includes("decision or plan")), "an unrelated launch must not establish checkout execution");
const statusUpdateSource = "Participated in meetings and followed up on project statuses at Greenfield Logistics.";
assert.deepEqual(narrativeMeaningIssues("The Education year in the header conflicts with the Dec. 2013 date shown here.",
  "Header: 2012. Education: Dec. 2013."), [], "a written date discrepancy is not an interpersonal conflict");
assert.ok(narrativeMeaningIssues("How did feedback conflict with analytics during your graduation year?", statusUpdateSource)
  .some(issue => issue.includes("conflicting inputs")), "a date reference must not license invented disagreement");
assert.deepEqual(narrativeMeaningIssues("At Greenfield, did project-status updates ever conflict, and how did you help reconcile them?", statusUpdateSource), []);
assert.ok(narrativeMeaningIssues("At Greenfield, how did you resolve the conflict?", statusUpdateSource)
  .some(issue => issue.includes("conflicting inputs")), "a location lead-in must not license an assumed conflict");

assertReceiptWireSavePdfChain()
  .then(() => console.log("report relationship fidelity tests passed"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
