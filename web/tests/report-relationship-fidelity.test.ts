import assert from "node:assert/strict";
import { validateResumeModelPayload } from "../lib/backend/validation";
import { renderReportHtml } from "../lib/backend/pdf";
import { compareSourceBoundRewrite } from "../lib/llm/source-fidelity";
import { relationshipBindingIssues } from "../lib/llm/source-relationship-fidelity";
import { saveReceiptValidatedReport } from "../lib/reports/client-report-save";
import { buildPdfExportRequest, normalizeReportForPdf } from "../lib/reports/pdf-export";
import { makeValidatedReportReceipt, validatedReportReceiptClaim } from "../lib/reports/report-receipt";
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
    label: "passive actor assignment",
    source: "The migration was led by Alice and supported by Bob.",
    rejected: "The migration was led by Bob and supported by Alice.",
    accepted: "The migration was supported by Bob and led by Alice.",
  },
] as const;

function reportWithSummary(claim: string) {
  const report: any = structuredClone(schemaValidReport);
  report.summary = `HubSpot workflow context is visible. ${claim} The customer context needs detail.`;
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

async function assertReceiptWireSavePdfChain() {
  const testCase = exactRelationshipCases[0];
  const validated = validateSummary(testCase.accepted, testCase.source);
  const receipt = makeValidatedReportReceipt(validated);
  assert.ok(validatedReportReceiptClaim(validated, receipt), "validated relationship must mint a bound receipt");

  const wireReport = JSON.parse(JSON.stringify({ ...validated, report_receipt: receipt }));
  const { report_receipt: wireReceipt, ...wirePayload } = wireReport;
  assert.ok(validatedReportReceiptClaim(wirePayload, wireReceipt), "wire serialization must preserve the receipt binding");

  const reportId = "123e4567-e89b-42d3-a456-426614174000";
  let saves = 0;
  const fakeFetch: typeof fetch = async (_input, init) => {
    saves += 1;
    const submitted = JSON.parse(String(init?.body || "{}"))?.report;
    const { report_receipt: submittedReceipt, ...submittedPayload } = submitted;
    assert.ok(validatedReportReceiptClaim(submittedPayload, submittedReceipt), "save wire must carry the validated receipt");
    return Response.json({ ok: true, reportId });
  };
  const saved = await saveReceiptValidatedReport(wireReport, fakeFetch);
  assert.equal(saves, 1);
  assert.deepEqual(buildPdfExportRequest(saved), { report_id: reportId });
  const pdfReport = normalizeReportForPdf(saved);
  assert.ok(pdfReport);
  assert.match(renderReportHtml(pdfReport), /Bob implemented billing and Alice designed checkout\./u);
}

assertReceiptWireSavePdfChain()
  .then(() => console.log("report relationship fidelity tests passed"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
