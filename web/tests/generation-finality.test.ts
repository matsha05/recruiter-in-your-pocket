import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  ensureAnonymousIdentity,
  getCurrentMonthKey,
  makeAnonymousIdentityCookie,
  parseAnonymousIdentityCookie,
  type ParsedFreeMeta,
} from "../lib/backend/freeCookie";
import {
  anonymousGenerationAccessBackend,
  resolveAnonymousFreeUsesRemaining,
} from "../lib/billing/anonymousGenerationAccess";
import {
  anonymousIdentityHashFromCookie,
  hashAnonymousIdentity,
} from "../lib/billing/anonymousIdentity";
import {
  preservePaidReportAccess,
  readAuthoritativeFreeUses,
} from "../lib/billing/freeStatusClient";
import {
  commitGenerationAccess,
  releaseGenerationAccess,
  reserveGenerationAccess,
  type GenerationAccessRpcClient,
} from "../lib/billing/generationAccess";

const freeMeta: ParsedFreeMeta = {
  used: 0,
  last_free_ts: null,
  reset_month: getCurrentMonthKey(),
  needs_reset: false,
};

class AmbiguousCommitRpc implements GenerationAccessRpcClient {
  credits = 1;
  commitCalls = 0;
  statusCalls = 0;
  reservationId: string | null = null;
  state: "missing" | "reserved" | "committed" = "missing";

  async rpc(functionName: string, args: Record<string, unknown>) {
    const reservationId = String(args.p_reservation_id || "");
    if (functionName === "reserve_generation_access") {
      this.reservationId = reservationId;
      this.state = "reserved";
      return {
        data: {
          allowed: true,
          reservation_id: reservationId,
          status: "reserved",
          access_tier: "pass_full",
          entitlement_kind: "pass_credit",
          free_uses_remaining: 0,
          pass: {
            id: "pass-finality-test",
            tier: "single_use",
            expires_at: "2099-01-01T00:00:00.000Z",
            uses_remaining: this.credits,
          },
        },
        error: null,
      };
    }
    if (functionName === "commit_generation_access") {
      this.commitCalls += 1;
      if (this.state === "reserved") {
        this.state = "committed";
        this.credits -= 1;
      }
      throw new Error("transport ended after database commit");
    }
    if (functionName === "get_generation_access_status") {
      this.statusCalls += 1;
      return {
        data: { ok: true, status: this.state, action: "none" },
        error: null,
      };
    }
    if (functionName === "release_generation_access") {
      return {
        data: { ok: true, status: this.state, action: "none" },
        error: null,
      };
    }
    return { data: null, error: { code: "UNKNOWN_RPC" } };
  }
}

async function run() {
  process.env.SESSION_SECRET = "generation-finality-test-secret";

  const identity = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
  const signedIdentity = makeAnonymousIdentityCookie(identity);
  assert.deepEqual(parseAnonymousIdentityCookie(signedIdentity), identity);
  assert.equal(parseAnonymousIdentityCookie(`${signedIdentity}tampered`), null);
  assert.equal(anonymousIdentityHashFromCookie(undefined), null);
  assert.equal(anonymousIdentityHashFromCookie("invalid"), null);
  assert.equal(anonymousIdentityHashFromCookie(signedIdentity), hashAnonymousIdentity(identity));

  const existingIdentity = ensureAnonymousIdentity(signedIdentity);
  assert.deepEqual(existingIdentity.identity, identity);
  assert.equal(existingIdentity.cookieValue, null, "identity must remain stable across requests and IP changes");
  const mintedIdentity = ensureAnonymousIdentity(
    null,
    () => "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
  );
  assert.ok(mintedIdentity.cookieValue, "free-status must mint the durable identity before generation");
  assert.deepEqual(parseAnonymousIdentityCookie(mintedIdentity.cookieValue), mintedIdentity.identity);

  assert.equal(readAuthoritativeFreeUses(true, { ok: true, free_uses_left: 1 }), 1);
  assert.throws(() => readAuthoritativeFreeUses(false, { ok: true, free_uses_left: 1 }));
  assert.throws(() => readAuthoritativeFreeUses(true, { ok: false, free_uses_left: 1 }));
  assert.throws(() => readAuthoritativeFreeUses(true, { ok: true }));
  assert.equal(preservePaidReportAccess(0, true), 1, "status failure cannot downgrade paid access");
  assert.equal(preservePaidReportAccess(0, false), 0);

  const finalityMigration = readFileSync(
    path.join(process.cwd(), "database", "migrations", "017_generation_access_commit_finality.sql"),
    "utf8"
  );
  const finalRelease = finalityMigration.match(/CREATE OR REPLACE FUNCTION public\.release_generation_access[\s\S]+?\$\$;/i)?.[0] || "";
  assert.match(finalRelease, /v_reservation\.status <> 'reserved'/i);
  assert.match(finalRelease, /'status', v_reservation\.status,[\s\S]+'action', 'none'/i);
  assert.doesNotMatch(finalRelease, /free_report_used_at\s*=\s*NULL|uses_remaining\s*=\s*uses_remaining\s*\+\s*1/i);
  assert.doesNotMatch(finalRelease, /DELETE\s+FROM\s+private\.generation_access_reservations/i);

  const identityHash = crypto.createHash("sha256").update("finality-probe").digest("hex");
  const monthKey = getCurrentMonthKey();
  const reservationId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
  assert.equal(await anonymousGenerationAccessBackend.reserve({ identityHash, monthKey, reservationId }), true);
  assert.equal(resolveAnonymousFreeUsesRemaining("reserved", 0, 1), 0);
  assert.equal(await anonymousGenerationAccessBackend.commit({ identityHash, monthKey, reservationId }), true);
  assert.deepEqual(
    await anonymousGenerationAccessBackend.release({ identityHash, monthKey, reservationId }),
    { status: "committed", action: "none" }
  );
  assert.equal(await anonymousGenerationAccessBackend.status({ identityHash, monthKey }), "committed");
  assert.equal(
    await anonymousGenerationAccessBackend.reserve({
      identityHash,
      monthKey,
      reservationId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    }),
    false,
    "committed cleanup must not mint another anonymous report"
  );

  const staleIdentityHash = crypto.createHash("sha256").update("stale-used-cookie").digest("hex");
  assert.equal(await anonymousGenerationAccessBackend.status({ identityHash: staleIdentityHash, monthKey }), "available");
  assert.equal(
    await anonymousGenerationAccessBackend.reconcileCommitted({
      identityHash: staleIdentityHash,
      monthKey,
      receiptId: "stale-cookie-receipt",
    }),
    "committed"
  );
  assert.equal(await anonymousGenerationAccessBackend.status({ identityHash: staleIdentityHash, monthKey }), "committed");

  const rpc = new AmbiguousCommitRpc();
  const paid = await reserveGenerationAccess({
    userId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    admin: rpc,
    reportKind: "resume_feedback",
    bypass: false,
    freeMeta,
    randomUUID: () => "ffffffff-ffff-4fff-8fff-ffffffffffff",
  });
  assert.deepEqual(
    await commitGenerationAccess(paid, rpc),
    { state: "committed", action: "committed", accessConsumed: true }
  );
  assert.equal(rpc.commitCalls, 2);
  assert.equal(rpc.statusCalls, 1, "ambiguous commit must query authoritative state");
  assert.equal(rpc.credits, 0);
  assert.deepEqual(
    await releaseGenerationAccess(paid, rpc, "provider_error"),
    { state: "committed", action: "none", accessConsumed: true }
  );
  assert.equal(rpc.credits, 0, "post-commit provider cleanup cannot refund a credit");

  console.log("generation finality tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
