import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { persistReceiptValidatedReport } from "../lib/reports/generated-report-store";
import { makeValidatedReportReceipt, validatedReportReceiptClaim } from "../lib/reports/report-receipt";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

class DurableReceiptAdmin {
  private claims = new Map<string, { reportId: string; expiresAt: string }>();
  private reports = new Map<string, string>();
  latestArgs: Record<string, any> | null = null;

  async rpc(functionName: string, args: Record<string, any>) {
    assert.equal(functionName, "claim_anonymous_report_receipt");
    this.latestArgs = args;
    const hash = String(args.p_receipt_hash);
    const existing = this.claims.get(hash);
    if (!existing) {
      this.claims.set(hash, { reportId: args.p_report_id, expiresAt: args.p_expires_at });
      this.reports.set(args.p_report_id, args.p_user_id);
      return { data: { status: "created", report_id: args.p_report_id }, error: null };
    }
    if (this.reports.get(existing.reportId) === args.p_user_id) {
      return { data: { status: "idempotent", report_id: existing.reportId }, error: null };
    }
    return { data: { status: "consumed" }, error: null };
  }

  deleteReport(reportId: string) {
    this.reports.delete(reportId);
  }

  get claimCount() {
    return this.claims.size;
  }
}

async function expectConsumed(run: () => Promise<unknown>, label: string) {
  await assert.rejects(
    run,
    (error: any) => error?.code === "REPORT_RECEIPT_CONSUMED" && error?.httpStatus === 409,
    label,
  );
}

async function run() {
  const originalSecret = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = "report-storage-security-test-secret";
  try {
    const receipt = makeValidatedReportReceipt(schemaValidReport);
    const receiptClaim = validatedReportReceiptClaim(schemaValidReport, receipt);
    assert.ok(receiptClaim);
    const admin = new DurableReceiptAdmin();
    const ownerId = "11111111-1111-4111-8111-111111111111";
    const attackerId = "22222222-2222-4222-8222-222222222222";
    const canonicalResumeHash = "d".repeat(64);
    const completionTime = "2026-08-03T12:34:56.789Z";
    const save = (userId: string) => persistReceiptValidatedReport({
      admin, userId, payload: schemaValidReport,
      receiptHash: receiptClaim.receiptHash,
      receiptExpiresAt: receiptClaim.expiresAt,
      resumeHash: canonicalResumeHash,
      createdAt: completionTime,
    });

    const firstId = await save(ownerId);
    assert.equal(admin.latestArgs?.p_resume_hash, canonicalResumeHash);
    assert.equal(admin.latestArgs?.p_created_at, completionTime);
    assert.equal(await save(ownerId), firstId, "same-owner retry must return the original report");
    assert.equal(admin.claimCount, 1, "idempotency must not create another receipt claim");
    await expectConsumed(() => save(attackerId), "cross-owner receipt replay must fail");

    admin.deleteReport(firstId);
    await expectConsumed(() => save(ownerId), "deleting the report must not restore the receipt");
    await expectConsumed(() => save(attackerId), "deleted-report receipt must remain globally consumed");
    assert.equal(admin.claimCount, 1, "the append-only claim must outlive the report row");

    const migration = readFileSync(path.join(
      process.cwd(), "database/migrations/018_single_use_report_receipts.sql",
    ), "utf8");
    assert.match(migration, /private\.anonymous_report_receipt_claims/i);
    const ledgerDefinition = migration.match(/CREATE TABLE IF NOT EXISTS private\.anonymous_report_receipt_claims \(([\s\S]+?)\n\);/)?.[1] || "";
    assert.doesNotMatch(ledgerDefinition, /user_id/i, "the replay ledger must not retain a user identifier");
    assert.match(ledgerDefinition, /expires_at TIMESTAMPTZ NOT NULL/i);
    assert.match(migration, /purge_expired_anonymous_report_receipt_claims/i);
    assert.match(migration, /riyp-purge-expired-anonymous-report-receipts/i);
    assert.match(migration, /SECURITY INVOKER/i);
    assert.match(migration, /SET search_path = ''/i);
    assert.match(migration, /REVOKE ALL ON FUNCTION[\s\S]+PUBLIC, anon, authenticated/i);
    assert.match(migration, /GRANT EXECUTE ON FUNCTION[\s\S]+service_role/i);
    assert.match(migration, /REVOKE INSERT, UPDATE ON TABLE public\.reports FROM anon, authenticated/i);
    assert.match(migration, /GRANT SELECT, DELETE ON TABLE public\.reports TO authenticated/i);
    assert.match(migration, /GRANT SELECT, INSERT, DELETE ON TABLE public\.reports TO service_role/i);
    assert.match(migration, /GRANT SELECT, INSERT ON TABLE private\.anonymous_report_receipt_claims TO service_role/i);
    assert.doesNotMatch(migration, /ADD COLUMN[\s\S]+anonymous_receipt_hash/i);

    const reportsRoute = readFileSync(path.join(process.cwd(), "app/api/reports/route.ts"), "utf8");
    assert.match(reportsRoute, /createSupabaseAdminClient\(\)/);
    assert.match(reportsRoute, /admin:\s*createSupabaseAdminClient\(\)/);

    const feedbackRoute = readFileSync(path.join(process.cwd(), "app/api/resume-feedback/route.ts"), "utf8");
    assert.match(feedbackRoute, /persistGeneratedReport\(\{\s*supabase:\s*admin,/s);
    assert.match(feedbackRoute, /finalizeAuthenticatedGeneratedReport\(\{/);
    assert.match(feedbackRoute, /finalizeAnonymousGeneratedReport\(\{/);
    assert.doesNotMatch(feedbackRoute, /rollbackGeneratedReport/);
    const streamRoute = readFileSync(path.join(process.cwd(), "app/api/resume-feedback-stream/route.ts"), "utf8");
    assert.match(streamRoute, /persistGeneratedReport\(\{\s*supabase:\s*reservationAdmin,/s);
    assert.match(streamRoute, /finalizeAuthenticatedGeneratedReport\(\{/);
    assert.match(streamRoute, /finalizeAnonymousGeneratedReport\(\{/);
    assert.doesNotMatch(streamRoute, /rollbackGeneratedReport/);
    const detailRoute = readFileSync(path.join(process.cwd(), "app/api/reports/[id]/route.ts"), "utf8");
    assert.match(detailRoute, /createSupabaseServerClient\(\)[\s\S]+\.from\("reports"\)[\s\S]+\.delete\(\)[\s\S]+\.eq\("user_id", user\.id\)/);
    const deleteRoute = readFileSync(path.join(process.cwd(), "app/api/account/delete/route.ts"), "utf8");
    assert.match(deleteRoute, /admin[\s\S]+\.from\("reports"\)[\s\S]+\.delete\(\{ count: "exact" \}\)/);
  } finally {
    if (originalSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = originalSecret;
  }
}

run().then(() => console.log("report storage security tests passed")).catch((error) => {
  console.error(error);
  process.exit(1);
});
