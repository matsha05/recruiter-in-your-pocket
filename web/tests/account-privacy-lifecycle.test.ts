import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  accountExportExpirationPatch,
  expireAccountExportResults,
  resolveAccountExportAccess,
} from "../lib/backend/accountExportRetention";
import {
  buildAuthDeletionPendingResponse,
  buildIncompleteAccountDeletionResponse,
  finalizeAccountAuthDeletion,
} from "../lib/backend/accountDeletion";

const now = new Date("2026-07-19T18:00:00.000Z");
const expiredJob = {
  status: "completed",
  expires_at: "2026-07-19T17:59:59.000Z",
  result_json: { reports: [{ id: "private-report" }] },
};
const currentJob = {
  status: "completed",
  expires_at: "2026-07-19T18:00:01.000Z",
  result_json: { reports: [{ id: "current-report" }] },
};

assert.equal(
  resolveAccountExportAccess(expiredJob, now),
  "expired",
  "an elapsed export must never remain downloadable"
);
assert.equal(
  resolveAccountExportAccess(currentJob, now),
  "ready",
  "an unexpired completed export remains downloadable"
);
assert.equal(
  resolveAccountExportAccess({ ...currentJob, expires_at: null }, now),
  "expired",
  "a completed export without a valid TTL must fail closed"
);
assert.equal(
  resolveAccountExportAccess({ ...currentJob, status: "running" }, now),
  "not_ready",
  "an in-flight export keeps its existing not-ready behavior"
);

const expirationPatch = accountExportExpirationPatch(now);
assert.deepEqual(
  {
    status: expirationPatch.status,
    result_json: expirationPatch.result_json,
    file_path: expirationPatch.file_path,
    file_url: expirationPatch.file_url,
  },
  { status: "expired", result_json: null, file_path: null, file_url: null },
  "retention cleanup must remove every stored export result reference"
);

type FakeRow = Record<string, any>;

class FakeUpdateQuery {
  private readonly predicates: Array<(row: FakeRow) => boolean> = [];

  constructor(
    private readonly rows: FakeRow[],
    private readonly patch: Record<string, unknown>
  ) {}

  lte(field: string, value: string) {
    this.predicates.push((row) => typeof row[field] === "string" && row[field] <= value);
    return this;
  }

  eq(field: string, value: unknown) {
    this.predicates.push((row) => row[field] === value);
    return this;
  }

  neq(field: string, value: unknown) {
    this.predicates.push((row) => row[field] !== value);
    return this;
  }

  is(field: string, value: unknown) {
    this.predicates.push((row) => row[field] === value);
    return this;
  }

  then<TResult1 = { error: null; count: number }, TResult2 = never>(
    onfulfilled?: ((value: { error: null; count: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const matches = this.rows.filter((row) => this.predicates.every((predicate) => predicate(row)));
    for (const row of matches) Object.assign(row, this.patch);
    return Promise.resolve({ error: null, count: matches.length }).then(onfulfilled, onrejected);
  }
}

class FakeAdmin {
  constructor(private readonly rows: FakeRow[]) {}

  from(table: string) {
    assert.equal(table, "account_export_jobs");
    return {
      update: (patch: Record<string, unknown>) => new FakeUpdateQuery(this.rows, patch),
    };
  }
}

async function run() {
  const successfulAuthOperations: string[] = [];
  const successfulAuthDeletion = await finalizeAccountAuthDeletion({
    deleteUser: async () => {
      successfulAuthOperations.push("delete_user");
      return { error: null };
    },
    signOut: async () => {
      successfulAuthOperations.push("sign_out");
      return { error: null };
    },
  });
  assert.deepEqual(
    successfulAuthOperations,
    ["delete_user", "sign_out"],
    "the current session is cleared only after the auth identity is removed"
  );
  assert.equal(successfulAuthDeletion.deleted, true);
  assert.equal(successfulAuthDeletion.sessionSignOutError, null);

  const completedDeleteWithSessionCleanupFailure = await finalizeAccountAuthDeletion({
    deleteUser: async () => ({ error: null }),
    signOut: async () => {
      throw new Error("auth provider unavailable");
    },
  });
  assert.equal(completedDeleteWithSessionCleanupFailure.deleted, true);
  assert.match(
    completedDeleteWithSessionCleanupFailure.sessionSignOutError?.message || "",
    /provider unavailable/,
    "a cleanup failure cannot turn a deleted identity into an impossible retry"
  );

  let signOutCallsAfterFailedDelete = 0;
  const failedAuthDeletion = await finalizeAccountAuthDeletion({
    deleteUser: async () => ({ error: { message: "temporary auth provider failure" } }),
    signOut: async () => {
      signOutCallsAfterFailedDelete += 1;
      return { error: null };
    },
  });
  assert.equal(failedAuthDeletion.deleted, false);
  assert.equal(signOutCallsAfterFailedDelete, 0, "auth deletion retries retain the current session");

  const rows: FakeRow[] = [
    { id: "expired", user_id: "user-1", ...expiredJob, file_url: "https://private.example/export" },
    { id: "current", user_id: "user-1", ...currentJob },
    { id: "missing-ttl", user_id: "user-1", status: "completed", expires_at: null, result_json: { private: true } },
    { id: "other-user", user_id: "user-2", ...expiredJob },
  ];

  const expiredCount = await expireAccountExportResults(new FakeAdmin(rows), {
    now,
    userId: "user-1",
  });

  assert.equal(expiredCount, 2, "request-time cleanup is user scoped and clears both elapsed and missing TTL rows");
  assert.equal(rows[0].status, "expired");
  assert.equal(rows[0].result_json, null);
  assert.equal(rows[0].file_url, null);
  assert.equal(rows[1].status, "completed", "current export is preserved");
  assert.deepEqual(rows[1].result_json, currentJob.result_json);
  assert.equal(rows[2].status, "expired");
  assert.equal(rows[2].result_json, null);
  assert.equal(rows[3].status, "completed", "request-time cleanup cannot mutate another user");

  const completedAppDeletions = [
    { table: "reports", count: 2 },
    { table: "billing_receipts", count: 1 },
  ];
  const partial = buildAuthDeletionPendingResponse(completedAppDeletions, 1);
  assert.equal(partial.status, 503, "auth deletion failure is not a success response");
  assert.equal(partial.body.ok, false);
  assert.equal(partial.body.errorCode, "AUTH_DELETION_PENDING");
  assert.equal(partial.body.deletion_status, "auth_removal_pending");
  assert.equal(partial.body.retryable, true, "auth deletion failure must explicitly support retry");
  assert.doesNotMatch(partial.body.message, /all associated data have been deleted/i);
  assert.deepEqual(
    partial.body.deletions,
    completedAppDeletions,
    "pending auth removal still reports that RIYP's cached billing receipts were deleted"
  );

  const incomplete = buildIncompleteAccountDeletionResponse();
  assert.equal(incomplete.body.ok, false);
  assert.equal(incomplete.body.retryable, true);
  assert.match(incomplete.body.message, /may already be deleted/i);

  const exportRouteSource = fs.readFileSync(
    path.resolve(process.cwd(), "app/api/account/export/route.ts"),
    "utf8"
  );
  const deleteRouteSource = fs.readFileSync(
    path.resolve(process.cwd(), "app/api/account/delete/route.ts"),
    "utf8"
  );
  const settingsSource = fs.readFileSync(
    path.resolve(process.cwd(), "components/workspace/SettingsClient.tsx"),
    "utf8"
  );
  const inngestSource = fs.readFileSync(
    path.resolve(process.cwd(), "lib/inngest/functions.ts"),
    "utf8"
  );

  assert.match(exportRouteSource, /await expireAccountExportResults\(admin, \{ userId: user\.id \}\)/);
  assert.match(exportRouteSource, /errorCode: "EXPORT_EXPIRED"/);
  assert.match(exportRouteSource, /enforceExportRateLimit\(user\.id, "create"\)/);
  assert.match(exportRouteSource, /enforceExportRateLimit\(user\.id, "read"\)/);
  assert.match(inngestSource, /id: "expire-account-export-results"/);
  assert.match(inngestSource, /\{ cron: "17 \* \* \* \*" \}/);
  assert.match(deleteRouteSource, /buildAuthDeletionPendingResponse\(deletions, canceledSubscriptions\)/);
  assert.match(deleteRouteSource, /createSupabaseServerAction\(\)/);
  assert.match(deleteRouteSource, /supabase\.auth\.signOut\(\{ scope: "global" \}\)/);
  assert.match(deleteRouteSource, /response\.headers\.set\("Clear-Site-Data", '\"cookies\", \"storage\"'\)/);
  assert.ok(
    deleteRouteSource.indexOf("finalizeAccountAuthDeletion") <
      deleteRouteSource.indexOf('response.headers.set("Clear-Site-Data"'),
    "browser cookies and storage are cleared only on the completed-deletion path"
  );
  assert.match(settingsSource, /supabase\.auth\.signOut\(\{ scope: "local" \}\)/);
  assert.match(settingsSource, /queryClient\.clear\(\)/);
  assert.match(settingsSource, /window\.location\.replace\("\/"\)/);
  assert.doesNotMatch(settingsSource, /window\.location\.href = "\/"/);
  assert.match(
    deleteRouteSource,
    /select\("tier, checkout_session_id, stripe_payment_intent_id, stripe_subscription_id"\)/
  );
  assert.match(deleteRouteSource, /billing_entitlement_blocks/);
  assert.match(deleteRouteSource, /reason: "account_deleted"/);
  assert.match(deleteRouteSource, /delete_generation_access_reservations_for_user/);
  assert.match(
    deleteRouteSource,
    /from\("billing_receipts"\)[\s\S]*?\.delete\(\{ count: "exact" \}\)[\s\S]*?\.eq\("user_id", userId\)/,
    "account deletion explicitly removes RIYP's cached billing receipt rows"
  );
  assert.match(
    deleteRouteSource,
    /deletions\.push\(\{ table: "billing_receipts", count: billingReceiptsCount \}\)/,
    "billing receipt deletion is included in success and pending-auth receipts"
  );
  assert.ok(
    deleteRouteSource.indexOf('.from("billing_receipts")') <
      deleteRouteSource.indexOf("admin.auth.admin.deleteUser(userId)"),
    "cached billing receipts are removed even when the final auth deletion remains pending"
  );
  assert.match(deleteRouteSource, /\.map\(\(pass: any\) => pass\.stripe_subscription_id\)/);
  assert.doesNotMatch(deleteRouteSource, /stripe\.customers\.list/);
  assert.doesNotMatch(deleteRouteSource, /pass\.stripe_subscription_id \|\| pass\.price_id/);
  assert.doesNotMatch(deleteRouteSource, /Even if auth deletion fails, data is already deleted/);

  console.log("account privacy lifecycle tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
