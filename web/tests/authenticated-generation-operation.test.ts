import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  GenerationAccessError,
  reserveGenerationAccess,
  type GenerationAccessRpcClient,
} from "../lib/billing/generationAccess";
import {
  generationOperationDigest,
  requireAuthenticatedGenerationOperationId,
} from "../lib/billing/generationOperation";

const operationId = "10000000-0000-4000-8000-000000000001";
const reservationId = "20000000-0000-4000-8000-000000000001";
const reportId = "30000000-0000-4000-8000-000000000001";
const userId = "40000000-0000-4000-8000-000000000001";
const freeMeta = { used: 0, last_free_ts: null, reset_month: "2026-08", needs_reset: false };

async function run() {
  const digest = generationOperationDigest({
    mode: "resume", text: "private resume", jobDescription: "private JD", savedJobId: null,
  });
  assert.match(digest, /^[0-9a-f]{64}$/u);
  assert.notEqual(digest, generationOperationDigest({
    mode: "resume", text: "different resume", jobDescription: "private JD", savedJobId: null,
  }));
  assert.equal(requireAuthenticatedGenerationOperationId({
    mode: "resume", userId, bypass: false, operationId,
  }), operationId);
  assert.throws(
    () => requireAuthenticatedGenerationOperationId({
      mode: "resume", userId, bypass: false, operationId: null,
    }),
    (error: any) => error?.code === "RECOVERY_STORAGE_REQUIRED"
      && error?.httpStatus === 409 && error?.accessConsumed === false,
    "signed-in generation must fail before reservation when its operation key is not durable",
  );

  let state: "new" | "executing" | "committed" = "new";
  let executionGrants = 0;
  let reportsCreated = 0;
  let creditsConsumed = 0;
  const rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const admin: GenerationAccessRpcClient = {
    async rpc(name, args) {
      rpcCalls.push({ name, args });
      assert.equal(name, "begin_generation_operation");
      assert.equal(args.p_operation_id, operationId);
      assert.equal(args.p_request_digest, digest);
      if (state === "new") {
        state = "executing";
        executionGrants += 1;
        return { data: {
          allowed: true, operation_state: "execute", status: "reserved",
          reservation_id: reservationId, access_tier: "pass_full",
          entitlement_kind: "pass_credit", free_uses_remaining: 0, pass: null,
        }, error: null };
      }
      if (state === "executing") {
        return { data: {
          allowed: false, operation_state: "pending", status: "reserved",
          reservation_id: reservationId, access_tier: "pass_full",
          entitlement_kind: "pass_credit",
        }, error: null };
      }
      return { data: {
        allowed: false, operation_state: "committed", status: "committed",
        reservation_id: reservationId, report_id: reportId, report_final: true,
        access_tier: "pass_full", entitlement_kind: "pass_credit",
      }, error: null };
    },
  };
  const begin = () => reserveGenerationAccess({
    userId, admin, reportKind: "resume_feedback", bypass: false, freeMeta,
    operationId, requestDigest: digest,
  });

  const first = await begin();
  assert.equal(first.reservationId, reservationId);
  assert.notEqual(first.reservationId, operationId, "the browser key must not become the reservation ID");
  await assert.rejects(
    begin,
    (error: unknown) => error instanceof GenerationAccessError
      && error.code === "GENERATION_OPERATION_PENDING"
      && error.accessConsumed === null,
    "a concurrent identical retry must not receive provider execution ownership",
  );
  reportsCreated += 1;
  creditsConsumed += 1;
  state = "committed";
  const recovered = await begin();
  assert.equal(recovered.recoveredReportId, reportId);
  assert.equal(recovered.operationId, operationId);
  assert.equal(executionGrants, 1);
  assert.equal(reportsCreated, 1, "response-loss recovery must not create a second report");
  assert.equal(creditsConsumed, 1, "response-loss recovery must not spend a second pass credit");
  assert.equal(rpcCalls.length, 3);

  const conflict = async () => reserveGenerationAccess({
    userId, reportKind: "resume_feedback", bypass: false, freeMeta,
    operationId, requestDigest: digest,
    admin: { rpc: async () => ({
      data: { allowed: false, operation_state: "conflict" }, error: null,
    }) },
  });
  await assert.rejects(
    conflict,
    (error: unknown) => error instanceof GenerationAccessError
      && error.code === "GENERATION_OPERATION_CONFLICT"
      && error.httpStatus === 409
      && error.accessConsumed === false,
    "owner or digest conflicts must be non-consuming and reveal no prior operation state",
  );

  const migration = readFileSync(path.join(
    process.cwd(), "database/migrations/020_authenticated_generation_operations.sql",
  ), "utf8");
  assert.match(migration, /operation_id UUID PRIMARY KEY/);
  assert.doesNotMatch(migration, /PRIMARY KEY \(user_id, operation_id\)/);
  assert.match(migration, /pg_advisory_xact_lock\([\s\S]+hashtextextended\(p_operation_id::TEXT, 0\)/);
  assert.doesNotMatch(migration, /hashtextextended\(p_user_id::TEXT \|\| ':' \|\| p_operation_id::TEXT/);
  assert.match(migration, /WHERE operation_id = p_operation_id\s+FOR UPDATE/);
  assert.match(migration, /v_operation\.user_id <> p_user_id[\s\S]+operation_state', 'conflict'/);
  assert.match(migration, /v_reservation_id := gen_random_uuid\(\)/);
  assert.match(migration, /'operation_state', 'pending'/);
  assert.match(migration, /CASE WHEN \(v_access->>'allowed'\)::BOOLEAN THEN 'executing' ELSE 'denied' END/);
  assert.match(migration, /v_operation\.status = 'denied'[\s\S]+operation_state', 'denied'/);
  assert.match(migration, /ALTER FUNCTION public\.reserve_generation_access\(UUID, UUID, TEXT\) SET SCHEMA private/);
  assert.match(migration, /direct resume feedback reservation is forbidden/);
  assert.match(migration, /private\.reserve_generation_access_internal/);
  assert.match(migration, /REVOKE ALL ON FUNCTION private\.reserve_generation_access_internal[\s\S]+service_role/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.get_generation_operation_status/);
  assert.match(migration, /IF NOT FOUND OR v_operation\.user_id <> p_user_id THEN[\s\S]+found', FALSE/);
  assert.match(migration, /SET status = 'committed', report_id = NEW\.report_id/);
  assert.match(migration, /NEW\.status IN \('released', 'refunded', 'expired'\)/);
  assert.doesNotMatch(migration, /resume_text|job_description|provider_output/iu);
}

run().then(() => console.log("authenticated generation operation tests passed")).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
