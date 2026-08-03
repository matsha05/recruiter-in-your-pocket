import assert from "node:assert/strict";
import {
  finalizeGenerationCompletion,
  generationCancellationError,
  shouldSynthesizeGenerationCancellation,
} from "../lib/billing/generation-cancellation";
import { settleGenerationFailure } from "../lib/billing/generationFailure";
import type { GenerationAccessReservation } from "../lib/billing/generationAccess";
import { persistGeneratedReport, rollbackGeneratedReport } from "../lib/reports/generated-report-store";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

const userId = "11111111-1111-4111-8111-111111111111";
const reservation: GenerationAccessReservation = {
  access: "full",
  accessTier: "free_full",
  entitlementKind: "free",
  reservationId: "22222222-2222-4222-8222-222222222222",
  userId,
  activePass: null,
  freeUsesRemaining: 0,
  anonymousCookieMeta: null,
  anonymousIdentityHash: null,
  anonymousMonthKey: null,
};

class FaultingReportStore {
  reports = new Map<string, any>();
  insertDisconnects = false;
  rollbackFails = false;

  from(table: string) {
    assert.equal(table, "reports");
    return {
      insert: async (row: any) => {
        this.reports.set(row.id, row);
        if (this.insertDisconnects) {
          const error = new Error("socket reset after commit") as Error & { code: string };
          error.code = "ECONNRESET";
          throw error;
        }
        return { error: null };
      },
      delete: (options: { count: string }) => {
        assert.equal(options.count, "exact");
        const filters: Record<string, string> = {};
        const query: any = {
          eq: (field: string, value: string) => {
            filters[field] = value;
            return query;
          },
          then: (resolve: (value: any) => void, reject: (error: unknown) => void) => {
            if (this.rollbackFails) {
              resolve({ error: { code: "ECONNRESET" }, count: null });
              return;
            }
            const row = this.reports.get(filters.id);
            const matches = row?.user_id === filters.user_id;
            if (matches) this.reports.delete(filters.id);
            Promise.resolve({ error: null, count: matches ? 1 : 0 }).then(resolve, reject);
          },
        };
        return query;
      },
    };
  }
}

function persist(store: FaultingReportStore) {
  return persistGeneratedReport({
    supabase: store,
    userId,
    payload: schemaValidReport,
    resumeText: "Trusted resume source",
    context: { request_id: "request-test", route: "POST /api/resume-feedback" },
  });
}

function rollback(store: FaultingReportStore, reportId: string) {
  return rollbackGeneratedReport({
    supabase: store,
    userId,
    reportId,
    context: { request_id: "request-test", route: "POST /api/resume-feedback" },
  });
}

async function rejection(run: Promise<unknown>) {
  return run.then(
    () => { throw new Error("Expected operation to reject"); },
    (error) => error,
  );
}

async function settle(error: unknown, release: () => Promise<void>) {
  return settleGenerationFailure({ reservation, admin: null, error, attemptConsumed: false, release });
}

async function run() {
  process.env.SESSION_SECRET = "generated-report-lifecycle-test-secret";
  const ambiguousStore = new FaultingReportStore();
  ambiguousStore.insertDisconnects = true;
  let ambiguousCommitCalls = 0;
  const ambiguousError: any = await rejection(finalizeGenerationCompletion({
    persist: () => persist(ambiguousStore),
    commit: async () => { ambiguousCommitCalls += 1; },
    rollback: (reportId) => rollback(ambiguousStore, reportId),
  }));
  assert.equal(ambiguousError.code, "REPORT_PERSISTENCE_FAILED");
  assert.equal(ambiguousCommitCalls, 0, "an ambiguous insert must never advance to credit commit");
  assert.equal(ambiguousStore.reports.size, 0, "the tagged report ID must compensate a committed insert after ECONNRESET");
  let restoredReleases = 0;
  const restored = await settle(ambiguousError, async () => { restoredReleases += 1; });
  assert.equal(restoredReleases, 1);
  assert.equal(restored.attemptDisposition, "restored");

  const rollbackSuccessStore = new FaultingReportStore();
  const commitFailure = Object.assign(new Error("commit unavailable"), { code: "ACCESS_COMMIT_FAILED" });
  const rollbackSuccessError = await rejection(finalizeGenerationCompletion({
    persist: () => persist(rollbackSuccessStore),
    commit: async () => { throw commitFailure; },
    rollback: (reportId) => rollback(rollbackSuccessStore, reportId),
  }));
  assert.equal(rollbackSuccessError, commitFailure);
  assert.equal(rollbackSuccessStore.reports.size, 0, "confirmed rollback must remove the uncharged report");

  const rollbackFailureStore = new FaultingReportStore();
  rollbackFailureStore.rollbackFails = true;
  const cleanupError: any = await rejection(finalizeGenerationCompletion({
    persist: () => persist(rollbackFailureStore),
    commit: async () => { throw commitFailure; },
    rollback: (reportId) => rollback(rollbackFailureStore, reportId),
  }));
  assert.equal(cleanupError.code, "REPORT_CLEANUP_UNCONFIRMED");
  assert.equal(rollbackFailureStore.reports.size, 1, "fault injection must retain the orphaned report");
  let unsafeReleaseCalls = 0;
  const unknown = await settle(cleanupError, async () => { unsafeReleaseCalls += 1; });
  assert.equal(unsafeReleaseCalls, 0, "unconfirmed cleanup must suppress access release");
  assert.equal(unknown.attemptConsumed, undefined);
  assert.equal(unknown.creditRestored, false);
  assert.equal(unknown.attemptDisposition, "unknown");
  assert.match(unknown.retryMessage, /Check History and your remaining reports before retrying/i);
  const laterAbort = new AbortController();
  laterAbort.abort();
  const errorAfterLateAbort = laterAbort.signal.aborted && shouldSynthesizeGenerationCancellation(cleanupError)
    ? generationCancellationError()
    : cleanupError;
  assert.equal(errorAfterLateAbort, cleanupError, "a later request abort must preserve cleanup-unknown suppression");
}

const originalSecret = process.env.SESSION_SECRET;
run()
  .then(() => console.log("generated report lifecycle tests passed"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (originalSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = originalSecret;
  });
