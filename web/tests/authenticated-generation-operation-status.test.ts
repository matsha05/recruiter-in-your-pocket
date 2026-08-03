import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { NextRequest } from "next/server";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};

const operationId = "10000000-0000-4000-8000-000000000001";
const reportId = "30000000-0000-4000-8000-000000000001";
const user = { id: "40000000-0000-4000-8000-000000000001" };
const trustedReport = { contract_version: "v2", score: 91, summary: "Trusted original report." };

async function run() {
  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  let authenticatedUser: { id: string } | null = user;
  let authError: unknown = null;
  let rpcData: Record<string, unknown> = { found: true, operation_state: "pending" };
  let rpcError: unknown = null;
  let rpcThrows = false;
  let reportLookup: Record<string, unknown> = { status: "found", report: trustedReport };
  const rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

  runtimeModule._load = function loadWithStatusMocks(request, parent, isMain) {
    if (request === "@/lib/supabase/serverClient") {
      const client = { auth: { getUser: async () => ({ data: { user: authenticatedUser }, error: authError }) } };
      return {
        createSupabaseServerClient: async () => client,
        maybeCreateSupabaseServerClient: async () => client,
      };
    }
    if (request === "@/lib/supabase/adminClient") {
      return { createSupabaseAdminClient: () => ({
        rpc: async (name: string, args: Record<string, unknown>) => {
          rpcCalls.push({ name, args });
          if (rpcThrows) throw new Error("synthetic operation status failure");
          return { data: rpcData, error: rpcError };
        },
      }) };
    }
    if (request === "@/lib/reports/generated-report-store") {
      return {
        lookupOwnedTrustedReport: async () => reportLookup,
        ownedStoredReportExists: async () => false,
        persistReceiptValidatedReport: async () => { throw new Error("unexpected persistence"); },
      };
    }
    if (request.startsWith("@/")) {
      return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
    }
    return originalLoad(request, parent, isMain);
  };

  try {
    const { GET } = require("../app/api/reports/recovery/route") as {
      GET: (request: NextRequest) => Promise<Response>;
    };
    const request = () => new NextRequest(
      `http://localhost/api/reports/recovery?recovery_id=${operationId}`,
    );

    const pending = await GET(request());
    assert.equal(pending.status, 202);
    assert.equal((await pending.json()).status, "pending");

    rpcData = { found: true, operation_state: "committed", report_id: reportId };
    const committed = await GET(request());
    const committedBody = await committed.json();
    assert.equal(committed.status, 200);
    assert.equal(committedBody.operation_id, operationId);
    assert.equal(committedBody.reportId, reportId);
    assert.deepEqual(committedBody.report, trustedReport);

    reportLookup = { status: "missing" };
    const deletedAfterStatus = await GET(request());
    assert.equal(deletedAfterStatus.status, 410);
    assert.equal((await deletedAfterStatus.json()).errorCode, "RECOVERED_REPORT_GONE");

    reportLookup = { status: "unavailable" };
    const readbackError = await GET(request());
    assert.equal(readbackError.status, 503);
    assert.equal((await readbackError.json()).errorCode, "OPERATION_STATUS_UNAVAILABLE");

    rpcData = { found: true, operation_state: "gone" };
    const gone = await GET(request());
    assert.equal(gone.status, 410);
    assert.equal((await gone.json()).errorCode, "RECOVERED_REPORT_GONE");

    rpcData = { found: true, operation_state: "terminal" };
    const terminal = await GET(request());
    assert.equal(terminal.status, 410);
    assert.equal((await terminal.json()).errorCode, "GENERATION_OPERATION_TERMINAL");

    rpcData = { found: false };
    const crossOwner = await GET(request());
    const crossOwnerBody = await crossOwner.json();
    assert.equal(crossOwner.status, 404);
    assert.equal(crossOwnerBody.errorCode, "RECOVERY_NOT_FOUND");
    assert.equal("operation_state" in crossOwnerBody, false, "cross-owner lookup must not leak operation status");

    rpcError = { code: "DATABASE_UNAVAILABLE" };
    const databaseError = await GET(request());
    assert.equal(databaseError.status, 503);
    rpcError = null;
    rpcThrows = true;
    const thrownDatabaseError = await GET(request());
    assert.equal(thrownDatabaseError.status, 503);
    rpcThrows = false;

    authenticatedUser = null;
    const anonymousNoEnvelope = await GET(request());
    assert.equal(anonymousNoEnvelope.status, 404);

    authError = { name: "AuthSessionMissingError" };
    const missingSession = await GET(request());
    assert.equal(missingSession.status, 404, "a missing auth cookie must preserve anonymous recovery behavior");
    authError = { code: "AUTH_BACKEND_UNAVAILABLE" };
    const authUnavailable = await GET(request());
    assert.equal(authUnavailable.status, 503);

    assert.ok(rpcCalls.length >= 8);
    assert.deepEqual(rpcCalls[0], {
      name: "get_generation_operation_status",
      args: { p_user_id: user.id, p_operation_id: operationId },
    });
  } finally {
    runtimeModule._load = originalLoad;
  }
}

run().then(() => console.log("authenticated generation operation status tests passed")).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
