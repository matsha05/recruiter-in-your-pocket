import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getCurrentMonthKey, type ParsedFreeMeta } from "../lib/backend/freeCookie";
import {
  anonymousGenerationAccessBackend,
  resolveAnonymousFreeUsesRemaining,
} from "../lib/billing/anonymousGenerationAccess";
import {
  REPORT_ACCESS_NOT_USED,
  REPORT_ACCESS_OUTCOME_UNKNOWN,
  REPORT_ACCESS_USED_BEFORE_DELIVERY,
  withGenerationAccessOutcome,
} from "../lib/billing/generationFailureCopy";
import {
  commitGenerationAccess,
  markGenerationProviderCallStarted,
  releaseGenerationAccess,
  releaseReasonForError,
  reserveGenerationAccess,
  type GenerationAccessRpcClient,
  type GenerationAccessReservation,
} from "../lib/billing/generationAccess";

const freeMeta: ParsedFreeMeta = {
  used: 0,
  last_free_ts: null,
  reset_month: getCurrentMonthKey(),
  needs_reset: false,
};

let uuidCounter = 1;
function nextUuid() {
  const suffix = String(uuidCounter++).padStart(12, "0");
  return `10000000-0000-4000-8000-${suffix}`;
}

async function reserveAnonymous(identityChar: string) {
  return reserveGenerationAccess({
    userId: null,
    admin: null,
    reportKind: "resume_feedback",
    bypass: false,
    freeMeta,
    anonymousIdentityHash: identityChar.repeat(64),
    randomUUID: nextUuid,
  });
}

async function anonymousStatus(reservation: GenerationAccessReservation) {
  return anonymousGenerationAccessBackend.status({
    identityHash: reservation.anonymousIdentityHash!,
    monthKey: reservation.anonymousMonthKey!,
  });
}

async function expectReleasedFailure(input: {
  identityChar: string;
  error: Error & { code?: string };
  label: string;
}) {
  const reservation = await reserveAnonymous(input.identityChar);
  assert.equal(reservation.access, "full", `${input.label}: initial access`);
  await markGenerationProviderCallStarted(reservation);
  assert.equal(await anonymousStatus(reservation), "reserved", `${input.label}: provider start stays pending`);
  assert.equal(reservation.anonymousCookieMeta, null, `${input.label}: no consumed cookie before validation`);

  await releaseGenerationAccess(
    reservation,
    null,
    releaseReasonForError(input.error)
  );
  assert.equal(await anonymousStatus(reservation), "available", `${input.label}: failure releases hold`);

  const retry = await reserveAnonymous(input.identityChar);
  assert.equal(retry.access, "full", `${input.label}: released access can retry`);
  await releaseGenerationAccess(retry, null, "internal_error");
}

type PaidState = "reserved" | "committed" | "released" | "refunded";

class PaidLifecycleRpc implements GenerationAccessRpcClient {
  credits = 1;
  commitMutations = 0;
  refundMutations = 0;
  releaseReasons: string[] = [];
  private reservations = new Map<string, PaidState>();

  async rpc(functionName: string, args: Record<string, unknown>) {
    const reservationId = String(args.p_reservation_id || "");
    const state = this.reservations.get(reservationId);

    if (functionName === "reserve_generation_access") {
      const liveHolds = Array.from(this.reservations.values()).filter(
        (value) => value === "reserved"
      ).length;
      if (this.credits <= liveHolds) {
        return {
          data: { allowed: false, reservation_id: null, status: "denied" },
          error: null,
        };
      }
      this.reservations.set(reservationId, "reserved");
      return {
        data: {
          allowed: true,
          reservation_id: reservationId,
          status: "reserved",
          access_tier: "pass_full",
          entitlement_kind: "pass_credit",
          free_uses_remaining: 0,
          pass: {
            id: "pass-delivery-test",
            tier: "single_use",
            expires_at: "2099-01-01T00:00:00.000Z",
            uses_remaining: this.credits,
          },
        },
        error: null,
      };
    }

    if (functionName === "commit_generation_access") {
      if (state === "committed") {
        return { data: { ok: true, status: "committed" }, error: null };
      }
      if (state !== "reserved") {
        return { data: { ok: false, status: state || "missing" }, error: null };
      }
      this.credits -= 1;
      this.commitMutations += 1;
      this.reservations.set(reservationId, "committed");
      return { data: { ok: true, status: "committed" }, error: null };
    }

    if (functionName === "get_generation_access_status") {
      return {
        data: state
          ? { ok: true, status: state, action: "none" }
          : { ok: false, status: "missing", action: "none" },
        error: null,
      };
    }

    if (functionName === "release_generation_access") {
      this.releaseReasons.push(String(args.p_reason_code || ""));
      if (state === "released" || state === "refunded" || state === "committed") {
        return { data: { ok: true, status: state, action: "none" }, error: null };
      }
      if (state === "reserved") {
        this.reservations.set(reservationId, "released");
        return { data: { ok: true, status: "released", action: "released" }, error: null };
      }
      return { data: { ok: false, status: "missing" }, error: null };
    }

    return { data: null, error: { code: "UNKNOWN_RPC" } };
  }
}

async function reservePaid(rpc: PaidLifecycleRpc) {
  return reserveGenerationAccess({
    userId: "20000000-0000-4000-8000-000000000001",
    admin: rpc,
    reportKind: "resume_feedback",
    bypass: false,
    freeMeta,
    randomUUID: nextUuid,
  });
}

async function run() {
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || "generation-delivery-test-secret";

  assert.match(withGenerationAccessOutcome("Provider failed.", false), new RegExp(REPORT_ACCESS_NOT_USED));
  assert.match(withGenerationAccessOutcome("Delivery failed.", true), new RegExp(REPORT_ACCESS_USED_BEFORE_DELIVERY));
  assert.match(withGenerationAccessOutcome("Release failed.", null), new RegExp(REPORT_ACCESS_OUTCOME_UNKNOWN));
  assert.equal(
    resolveAnonymousFreeUsesRemaining("reserved", 0, 1),
    0,
    "a pending hold must not present another anonymous report as available"
  );
  assert.equal(
    resolveAnonymousFreeUsesRemaining("committed", 0, 1),
    0,
    "a validated committed report consumes the anonymous allowance"
  );

  const originalNodeEnv = process.env.NODE_ENV;
  try {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    await assert.rejects(
      () => anonymousGenerationAccessBackend.status({
        identityHash: "c".repeat(64),
        monthKey: getCurrentMonthKey(),
      }),
      /Anonymous report access is temporarily unavailable/,
      "hosted anonymous status must fail closed without shared state"
    );
  } finally {
    if (originalNodeEnv === undefined) {
      delete (process.env as Record<string, string | undefined>).NODE_ENV;
    } else {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
    }
  }

  await expectReleasedFailure({
    identityChar: "d",
    error: Object.assign(new Error("provider failed"), { code: "OPENAI_NETWORK_ERROR" }),
    label: "provider failure",
  });
  await expectReleasedFailure({
    identityChar: "e",
    error: Object.assign(new Error("invalid payload"), { code: "OPENAI_RESPONSE_SHAPE_INVALID" }),
    label: "post-provider validation failure",
  });
  await expectReleasedFailure({
    identityChar: "f",
    error: Object.assign(new Error("stream interrupted"), { name: "AbortError" }),
    label: "streaming failure",
  });

  const successful = await reserveAnonymous("1");
  await markGenerationProviderCallStarted(successful);
  assert.equal(successful.anonymousCookieMeta, null);
  await commitGenerationAccess(successful, null);
  assert.equal(await anonymousStatus(successful), "committed");
  const committedCookie = successful.anonymousCookieMeta as { used: number } | null;
  assert.equal(committedCookie?.used, 1, "success exposes cookie metadata only after commit");
  assert.equal((await reserveAnonymous("1")).access, "preview", "successful delivery consumes anonymous access");

  const committedRelease = await releaseGenerationAccess(successful, null, "delivery_error");
  assert.deepEqual(committedRelease, { state: "committed", action: "none", accessConsumed: true });
  assert.equal(await anonymousStatus(successful), "committed", "cleanup cannot reopen committed anonymous access");
  assert.equal(committedCookie?.used, 1, "cleanup preserves committed cookie metadata");
  assert.equal((await reserveAnonymous("1")).access, "preview", "committed cleanup cannot mint another report");

  const [anonymousA, anonymousB] = await Promise.all([
    reserveAnonymous("2"),
    reserveAnonymous("2"),
  ]);
  assert.equal(
    [anonymousA, anonymousB].filter((reservation) => reservation.access === "full").length,
    1,
    "concurrent anonymous requests share one atomic hold"
  );
  await releaseGenerationAccess(
    [anonymousA, anonymousB].find((reservation) => reservation.access === "full")!,
    null,
    "client_disconnect"
  );

  const paidRpc = new PaidLifecycleRpc();
  const failedPaid = await reservePaid(paidRpc);
  await markGenerationProviderCallStarted(failedPaid);
  assert.equal(paidRpc.commitMutations, 0, "provider start does not consume paid credit");
  await releaseGenerationAccess(failedPaid, paidRpc, "provider_error");
  assert.equal(paidRpc.credits, 1, "provider failure leaves paid credit available");

  const successfulPaid = await reservePaid(paidRpc);
  await commitGenerationAccess(successfulPaid, paidRpc);
  assert.equal(paidRpc.credits, 0, "validated paid report consumes exactly one credit");
  await releaseGenerationAccess(successfulPaid, paidRpc, "delivery_error");
  await releaseGenerationAccess(successfulPaid, paidRpc, "delivery_error");
  assert.equal(paidRpc.credits, 0, "cleanup cannot restore a committed paid credit");
  assert.equal(paidRpc.refundMutations, 0);

  const route = readFileSync(path.join(process.cwd(), "app/api/resume-feedback/route.ts"), "utf8");
  const streamRoute = readFileSync(path.join(process.cwd(), "app/api/resume-feedback-stream/route.ts"), "utf8");
  const workspace = readFileSync(path.join(process.cwd(), "components/workspace/WorkspaceClient.tsx"), "utf8");
  const resumeAnalysis = readFileSync(
    path.join(process.cwd(), "components/workspace/hooks/useResumeAnalysis.ts"),
    "utf8"
  );
  const freeStatus = readFileSync(path.join(process.cwd(), "app/api/free-status/route.ts"), "utf8");

  for (const source of [route, streamRoute]) {
    assert.doesNotMatch(source, /report credit was restored/i);
    assert.match(source, /withGenerationAccessOutcome/);
  }
  assert.match(streamRoute, /access_consumed: accessConsumed/);
  assert.match(streamRoute, /cancel\(\) \{\s*clientDisconnected = true;/);
  assert.ok(
    streamRoute.lastIndexOf("throwIfClientDisconnected()", streamRoute.indexOf("await commitGenerationAccess"))
      > streamRoute.indexOf("await validateResumeStreamOutput"),
    "a canceled stream must abort and release access before the validated report commits"
  );
  assert.match(freeStatus, /anonymousGenerationAccessBackend\.status/);
  assert.match(freeStatus, /resolveAnonymousFreeUsesRemaining/);
  assert.match(freeStatus, /reconcileCommitted/);
  assert.equal(
    resumeAnalysis.match(/await reconcileAfterUnsuccessfulRun\(\)/g)?.length,
    3,
    "abort, terminal API failure, and thrown stream failure must all reconcile status"
  );
  assert.match(
    resumeAnalysis,
    /fallbackDecrement: false,[\s\S]+includeUserRefresh: true,[\s\S]+requireOk: true/,
    "failed and canceled reports must use authoritative status without a blind decrement"
  );
  assert.doesNotMatch(workspace, /Your free report was not used/);

  console.log("generation delivery lifecycle tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
