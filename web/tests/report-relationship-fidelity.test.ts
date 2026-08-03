import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
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

assertReceiptWireSavePdfChain()
  .then(() => console.log("report relationship fidelity tests passed"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
