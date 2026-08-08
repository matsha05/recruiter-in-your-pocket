import assert from "node:assert/strict";
import {
  buildAtomicGeneratedReport,
  finalizeAuthenticatedGeneratedReport,
} from "../lib/reports/finalize-generated-report";
import type {
  GenerationAccessReservation,
  GenerationAccessRpcClient,
} from "../lib/billing/generationAccess";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

process.env.SESSION_SECRET = process.env.SESSION_SECRET || "atomic-report-finalization-test-secret";

const userId = "10000000-0000-4000-8000-000000000001";
const reservationId = "20000000-0000-4000-8000-000000000001";
const reportId = "30000000-0000-4000-8000-000000000001";
const reservation: GenerationAccessReservation = {
  access: "full",
  accessTier: "free_full",
  entitlementKind: "free",
  reservationId,
  userId,
  activePass: null,
  freeUsesRemaining: 0,
  anonymousCookieMeta: null,
  anonymousIdentityHash: null,
  anonymousMonthKey: null,
};
const input = {
  reservation,
  userId,
  payload: schemaValidReport,
  resumeText: "Built customer workflows in HubSpot.",
  savedJobId: null,
  jobDescriptionText: "The role requires HubSpot.",
};

function rpcClient(
  handler: (name: string, args: Record<string, unknown>, call: number) => {
    data: unknown;
    error: { code?: string; message?: string } | null;
  } | Promise<{ data: unknown; error: { code?: string; message?: string } | null }>,
) {
  let calls = 0;
  const client: GenerationAccessRpcClient = {
    rpc(name, args) {
      calls += 1;
      return Promise.resolve(handler(name, args, calls));
    },
  };
  return { client, calls: () => calls };
}

async function run() {
  const built = buildAtomicGeneratedReport(input);
  assert.match(built.reportDigest, /^[a-f0-9]{64}$/u);
  assert.match(String(built.args.p_resume_hash), /^[a-f0-9]{64}$/u);
  assert.deepEqual(built.args.p_report_json, schemaValidReport);
  assert.equal(built.args.p_reservation_id, reservationId);
  assert.equal(built.args.p_user_id, userId);

  const direct = rpcClient((name) => {
    assert.equal(name, "finalize_generation_report");
    return {
      data: {
        status: "committed",
        action: "committed",
        report_id: reportId,
        report_final: true,
      },
      error: null,
    };
  });
  assert.deepEqual(await finalizeAuthenticatedGeneratedReport({
    ...input,
    admin: direct.client,
  }), {
    reportId,
    reportDigest: built.reportDigest,
    idempotent: false,
  });
  assert.equal(direct.calls(), 1);

  const reconciled = rpcClient((name, _args, call) => {
    if (call <= 2) {
      assert.equal(name, "finalize_generation_report");
      return { data: null, error: { code: "NETWORK", message: "response lost" } };
    }
    assert.equal(name, "get_generation_access_status");
    return {
      data: {
        status: "committed",
        report_id: reportId,
        report_final: true,
        report_digest: built.reportDigest,
      },
      error: null,
    };
  });
  const recovered = await finalizeAuthenticatedGeneratedReport({
    ...input,
    admin: reconciled.client,
  });
  assert.equal(recovered.reportId, reportId);
  assert.equal(recovered.idempotent, true);
  assert.equal(reconciled.calls(), 3);

  const mismatched = rpcClient((name, _args, call) => call <= 2
    ? { data: null, error: { code: "NETWORK" } }
    : {
      data: {
        status: "committed",
        report_id: reportId,
        report_final: true,
        report_digest: "f".repeat(64),
      },
      error: null,
    });
  await assert.rejects(
    () => finalizeAuthenticatedGeneratedReport({ ...input, admin: mismatched.client }),
    (error: unknown) => {
      const candidate = error as { code?: unknown; accessConsumed?: unknown };
      return candidate.code === "REPORT_FINALIZATION_FAILED" && candidate.accessConsumed === true;
    },
    "a committed reservation with a different payload digest must fail closed as consumed",
  );

  const pending = rpcClient((_name, _args, call) => call <= 2
    ? { data: null, error: { code: "NETWORK" } }
    : { data: { status: "reserved", report_final: false }, error: null });
  await assert.rejects(
    () => finalizeAuthenticatedGeneratedReport({ ...input, admin: pending.client }),
    (error: unknown) => {
      const candidate = error as { code?: unknown; accessConsumed?: unknown };
      return candidate.code === "REPORT_FINALIZATION_FAILED" && candidate.accessConsumed === null;
    },
    "an unresolved reservation must not be presented as charged or restored",
  );

  assert.throws(() => buildAtomicGeneratedReport({
    ...input,
    reservation: { ...reservation, entitlementKind: "anonymous_free", userId: null },
  }), /cannot be finalized atomically/i);
}

run().then(() => {
  console.log("atomic report finalization tests passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
