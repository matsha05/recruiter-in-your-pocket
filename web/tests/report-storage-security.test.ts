import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { persistReceiptValidatedReport } from "../lib/reports/generated-report-store";
import { makeValidatedReportReceipt, validatedReportReceiptHash } from "../lib/reports/report-receipt";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

class DurableReceiptAdmin {
  private claims = new Map<string, { userId: string; reportId: string }>();
  private reports = new Set<string>();

  async rpc(functionName: string, args: Record<string, any>) {
    assert.equal(functionName, "claim_anonymous_report_receipt");
    const hash = String(args.p_receipt_hash);
    const existing = this.claims.get(hash);
    if (!existing) {
      this.claims.set(hash, { userId: args.p_user_id, reportId: args.p_report_id });
      this.reports.add(args.p_report_id);
      return { data: { status: "created", report_id: args.p_report_id }, error: null };
    }
    if (existing.userId === args.p_user_id && this.reports.has(existing.reportId)) {
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
    const receiptHash = validatedReportReceiptHash(schemaValidReport, receipt);
    assert.ok(receiptHash);
    const admin = new DurableReceiptAdmin();
    const ownerId = "11111111-1111-4111-8111-111111111111";
    const attackerId = "22222222-2222-4222-8222-222222222222";
    const save = (userId: string) => persistReceiptValidatedReport({
      admin, userId, payload: schemaValidReport, receiptHash,
    });

    const firstId = await save(ownerId);
    assert.equal(await save(ownerId), firstId, "same-owner retry must return the original report");
    assert.equal(admin.claimCount, 1, "idempotency must not create another receipt claim");
    await expectConsumed(() => save(attackerId), "cross-owner receipt replay must fail");

    admin.deleteReport(firstId);
    await expectConsumed(() => save(ownerId), "deleting the report must not restore the receipt");
    await expectConsumed(() => save(attackerId), "deleted-report receipt must remain globally consumed");
    assert.equal(admin.claimCount, 1, "the append-only claim must outlive the report row");

    const migration = readFileSync(path.join(
      process.cwd(), "database/migrations/017_single_use_report_receipts.sql",
    ), "utf8");
    assert.match(migration, /private\.anonymous_report_receipt_claims/i);
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
    assert.match(feedbackRoute, /rollbackGeneratedReport\(\{\s*supabase:\s*admin,/s);
    const streamRoute = readFileSync(path.join(process.cwd(), "app/api/resume-feedback-stream/route.ts"), "utf8");
    assert.match(streamRoute, /persistGeneratedReport\(\{\s*supabase:\s*reportAdmin,/s);
    assert.match(streamRoute, /rollbackGeneratedReport\(\{\s*supabase:\s*reportAdmin,/s);
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
