import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  needsReceiptValidatedSave,
  saveReceiptValidatedReport,
} from "../lib/reports/client-report-save";
import { buildPdfExportRequest } from "../lib/reports/pdf-export";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

async function run() {
  const report = { ...structuredClone(schemaValidReport), report_receipt: "signed-receipt" };
  const reportId = "123e4567-e89b-42d3-a456-426614174000";
  let requests = 0;
  const fakeFetch: typeof fetch = async () => {
    requests += 1;
    return Response.json({ ok: true, reportId });
  };

  assert.equal(needsReceiptValidatedSave(report), true);
  const [restored, exportRetry] = await Promise.all([
    saveReceiptValidatedReport(report, fakeFetch),
    saveReceiptValidatedReport(report, fakeFetch),
  ]);
  assert.equal(requests, 1, "restoration and immediate export must share one in-flight receipt save");
  assert.deepEqual(buildPdfExportRequest(restored), { report_id: reportId });
  assert.deepEqual(buildPdfExportRequest(exportRetry), { report_id: reportId });
  assert.equal(needsReceiptValidatedSave(restored), false);

  const restorationHook = readFileSync(path.join(
    process.cwd(), "components/workspace/hooks/useCheckoutReportRestoration.ts",
  ), "utf8");
  const workspace = readFileSync(path.join(process.cwd(), "components/workspace/WorkspaceClient.tsx"), "utf8");
  assert.match(restorationHook, /takeCheckoutWorkspaceState/);
  assert.match(restorationHook, /saveReceiptValidatedReport\(original\)/);
  assert.match(workspace, /needsReceiptValidatedSave\(payload\)/);
  assert.match(workspace, /payload = await saveReceiptValidatedReport\(payload\)/);
}

run().then(() => console.log("client report save tests passed")).catch((error) => {
  console.error(error);
  process.exit(1);
});
