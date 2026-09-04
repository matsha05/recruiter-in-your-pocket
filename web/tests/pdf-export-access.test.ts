import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  getNextUsesRemaining,
  getTierDefaults,
  hasPdfExportAccess,
  isPassActive,
  type PassLike,
} from "../lib/billing/entitlements";
import { readAuthoritativePassAccess } from "../lib/billing/accountPassStatus";
import { buildGroundedReportTrustMetadata } from "../lib/reports/report-trust";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};

async function run() {
  const now = new Date();
  const ownerId = "11111111-1111-4111-8111-111111111111";
  const otherOwnerId = "22222222-2222-4222-8222-222222222222";
  const reportId = "33333333-3333-4333-8333-333333333333";
  const defaults = getTierDefaults("30d", { now });
  const lastCreditPass = {
    user_id: ownerId, tier: "30d", uses_remaining: 1,
    expires_at: defaults.expiresAt, revoked_at: null,
  };
  const exhaustedPass = { ...lastCreditPass, uses_remaining: getNextUsesRemaining(lastCreditPass) };
  assert.equal(exhaustedPass.uses_remaining, 0);
  assert.equal(isPassActive(exhaustedPass, now), false, "PDF access must not restore generation credits");
  assert.equal(hasPdfExportAccess(exhaustedPass, now), true);
  assert.deepEqual(
    readAuthoritativePassAccess(true, { ok: true, passes: [exhaustedPass] }, now),
    { membership: "free", canExportPdf: true },
    "the final credit changes generation membership without removing paid PDF access",
  );
  assert.deepEqual(
    readAuthoritativePassAccess(true, { ok: true, passes: [lastCreditPass] }, now),
    { membership: "credit", paidUsesLeft: 1, canExportPdf: true },
  );
  const invalidPasses: Array<PassLike | null> = [
    null, {}, { ...exhaustedPass, tier: "unknown" },
    { ...exhaustedPass, expires_at: null },
    { ...exhaustedPass, expires_at: "not-a-date" },
    { ...exhaustedPass, expires_at: now.toISOString() },
    { ...exhaustedPass, revoked_at: now.toISOString() },
  ];
  for (const pass of invalidPasses) {
    assert.equal(hasPdfExportAccess(pass, now), false, `invalid PDF entitlement: ${JSON.stringify(pass)}`);
  }
  for (const passes of [[], invalidPasses]) {
    assert.equal(readAuthoritativePassAccess(true, { ok: true, passes }, now).canExportPdf, false);
  }
  for (const tier of ["monthly", "lifetime", "single_use", "30d", "90d"]) {
    const pass = { ...exhaustedPass, tier };
    assert.equal(hasPdfExportAccess(pass, now), true, `${tier} exports survive credit exhaustion`);
    assert.equal(isPassActive(pass, now), tier === "monthly" || tier === "lifetime");
    assert.equal(hasPdfExportAccess({ ...pass, expires_at: now.toISOString() }, now), false);
    assert.equal(hasPdfExportAccess({ ...pass, revoked_at: now.toISOString() }, now), false);
  }

  const originalSecret = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = "pdf-export-entitlement-test-secret";
  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  const trustedRow = {
    id: reportId, user_id: ownerId, report_json: schemaValidReport,
    ...buildGroundedReportTrustMetadata(schemaValidReport, ownerId),
  };
  let passes: Array<PassLike & { user_id: string }> = [];
  let storedRows: any[] = [trustedRow];
  let signedIn = true;
  let passQueryError = false;
  let generatedPdfs = 0;
  let reportLookups = 0;
  const client = {
    auth: { getUser: async () => ({ data: { user: signedIn ? { id: ownerId } : null }, error: null }) },
    from(table: string) {
      assert.ok(table === "passes" || table === "reports", `unexpected table: ${table}`);
      const filters: Array<(row: any) => boolean> = [];
      let selected: string[] = [];
      const execute = () => {
        if (table === "reports") reportLookups += 1;
        const rows = (table === "passes" ? passes : storedRows)
          .filter((row) => filters.every((filter) => filter(row)))
          .map((row) => Object.fromEntries(selected.map((field) => [field, (row as any)[field]])));
        return { data: rows, error: table === "passes" && passQueryError ? new Error("Pass lookup unavailable") : null };
      };
      const query: any = {
        select(value: string) { selected = value.split(",").map((field) => field.trim()); return query; },
        eq(field: string, value: unknown) { filters.push((row) => row[field] === value); return query; },
        maybeSingle: async () => { const result = execute(); return { ...result, data: result.data[0] || null }; },
        then: (resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) => Promise.resolve().then(execute).then(resolve, reject),
      };
      return query;
    },
  };

  runtimeModule._load = function loadExportMocks(request, parent, isMain) {
    if (request === "@/lib/backend/pdf") return {
      generatePdfBuffer: async () => { generatedPdfs += 1; return Buffer.from("%PDF-entitlement-test"); },
    };
    if (request === "@/lib/supabase/serverClient") return { createSupabaseServerClient: async () => client };
    if (request === "@/lib/billing/access") return { isDevelopmentPaywallBypassEnabled: () => false };
    if (request === "@/lib/security/rateLimit") return { rateLimitAsync: async () => ({ ok: true }) };
    if (request === "@/lib/observability/logger") return { hashForLogs: () => "hash", logInfo() {}, logWarn() {}, logError() {} };
    if (request === "@/lib/observability/requestContext") return { getRequestId: () => "export_test", routeLabel: () => ({ method: "POST", path: "/api/export-pdf" }) };
    if (request.startsWith("@/")) return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
    return originalLoad(request, parent, isMain);
  };

  try {
    const { POST } = require("../app/api/export-pdf/route") as { POST: (request: NextRequest) => Promise<Response> };
    const exportRequest = (body: unknown = { report_id: reportId }) => POST(new NextRequest("http://localhost/api/export-pdf", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
    }));
    const assertDenied = async (status: number, errorCode: string, body?: unknown) => {
      const before = generatedPdfs;
      const response = await exportRequest(body);
      assert.equal(response.status, status);
      assert.equal((await response.json()).errorCode, errorCode);
      assert.equal(generatedPdfs, before, "denied requests must not invoke PDF rendering");
    };

    // Use actual request parsing, trusted stored-report signature checks, and
    // normalization. Only external services and the expensive renderer are fake.
    for (const pass of [lastCreditPass, exhaustedPass]) {
      passes = [pass];
      const response = await exportRequest();
      assert.equal(response.status, 200, "both the fourth and fifth paid reports can be exported");
      assert.equal(response.headers.get("content-type"), "application/pdf");
    }
    assert.equal(generatedPdfs, 2);
    assert.equal(reportLookups, 2);
    assert.equal(exhaustedPass.uses_remaining, 0, "export must not mutate the credit balance");

    for (const tier of ["monthly", "lifetime", "single_use", "30d", "90d"]) {
      passes = [{ ...exhaustedPass, tier }];
      assert.equal((await exportRequest()).status, 200, `unexpired ${tier} exports remain available`);
      const previousLookups: number = reportLookups;
      for (const invalid of [
        { ...exhaustedPass, tier, expires_at: now.toISOString() },
        { ...lastCreditPass, tier, revoked_at: now.toISOString() },
      ]) {
        passes = [invalid];
        await assertDenied(402, "PAID_ACCESS_REQUIRED");
      }
      assert.equal(reportLookups, previousLookups, "expiry and revocation must deny before report lookup");
    }
    for (const deniedPasses of [
      [], [{ ...lastCreditPass, user_id: otherOwnerId }],
      [{ ...lastCreditPass, tier: "unknown" }], [{ ...lastCreditPass, expires_at: "invalid" }],
    ]) {
      passes = deniedPasses;
      await assertDenied(402, "PAID_ACCESS_REQUIRED");
    }
    passes = [
      { ...lastCreditPass, revoked_at: now.toISOString() },
      { ...lastCreditPass, expires_at: now.toISOString() }, exhaustedPass,
    ];
    assert.equal((await exportRequest()).status, 200, "one valid exhausted purchase keeps exports available");

    passes = [exhaustedPass];
    signedIn = false;
    await assertDenied(401, "UNAUTHORIZED");
    signedIn = true;
    passQueryError = true;
    await assertDenied(500, "PDF_GENERATION_FAILED");
    passQueryError = false;
    await assertDenied(400, "REPORT_ID_REQUIRED", { report: schemaValidReport });
    await assertDenied(400, "REPORT_ID_REQUIRED", { report_id: "not-a-report-id" });
    await assertDenied(413, "PAYLOAD_TOO_LARGE", { report_id: reportId, oversized: "x".repeat(256 * 1024) });
    storedRows = [{ ...trustedRow, user_id: otherOwnerId }];
    await assertDenied(409, "UNTRUSTED_REPORT");
    storedRows = [{ ...trustedRow, report_json: { ...schemaValidReport, score: 99 } }];
    await assertDenied(409, "UNTRUSTED_REPORT");
    storedRows = [{ ...trustedRow, ...buildGroundedReportTrustMetadata(schemaValidReport, otherOwnerId) }];
    await assertDenied(409, "UNTRUSTED_REPORT");
    storedRows = [];
    await assertDenied(409, "UNTRUSTED_REPORT");
  } finally {
    runtimeModule._load = originalLoad;
    if (originalSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = originalSecret;
  }
  console.log("PDF export entitlement and stored-report access tests passed");
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
