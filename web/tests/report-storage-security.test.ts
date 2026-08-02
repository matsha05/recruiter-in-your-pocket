import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { persistReceiptValidatedReport } from "../lib/reports/generated-report-store";
import { makeValidatedReportReceipt, validatedReportReceiptHash } from "../lib/reports/report-receipt";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

type StoredRow = Record<string, any>;

class ReportsQuery {
  private filters = new Map<string, unknown>();

  constructor(private rows: Map<string, StoredRow>) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.set(field, value);
    return this;
  }

  async maybeSingle() {
    const data = Array.from(this.rows.values()).find((row) => (
      Array.from(this.filters.entries()).every(([field, value]) => row[field] === value)
    )) || null;
    return { data, error: null };
  }
}

class ReceiptStoreClient {
  constructor(private rows: Map<string, StoredRow>) {}

  from(table: string) {
    assert.equal(table, "reports");
    return {
      insert: async (row: StoredRow) => {
        if (this.rows.has(row.anonymous_receipt_hash)) {
          return { error: { code: "23505" } };
        }
        this.rows.set(row.anonymous_receipt_hash, structuredClone(row));
        return { error: null };
      },
      select: () => new ReportsQuery(this.rows),
    };
  }
}

async function run() {
  const originalSecret = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = "report-storage-security-test-secret";
  try {
    const receipt = makeValidatedReportReceipt(schemaValidReport);
    const receiptHash = validatedReportReceiptHash(schemaValidReport, receipt);
    assert.ok(receiptHash);

    const rows = new Map<string, StoredRow>();
    const supabase = new ReceiptStoreClient(rows);
    const ownerId = "11111111-1111-4111-8111-111111111111";
    const attackerId = "22222222-2222-4222-8222-222222222222";
    const firstId = await persistReceiptValidatedReport({
      supabase,
      userId: ownerId,
      payload: schemaValidReport,
      receiptHash,
    });
    const retryId = await persistReceiptValidatedReport({
      supabase,
      userId: ownerId,
      payload: schemaValidReport,
      receiptHash,
    });
    assert.equal(retryId, firstId, "same-account receipt replay must be idempotent");
    assert.equal(rows.size, 1, "same-account replay must not create a second report");

    await assert.rejects(
      () => persistReceiptValidatedReport({
        supabase,
        userId: attackerId,
        payload: schemaValidReport,
        receiptHash,
      }),
      (error: any) => error?.code === "REPORT_RECEIPT_CONSUMED" && error?.httpStatus === 409,
      "a consumed bearer receipt must not replay into another account",
    );
    assert.equal(rows.size, 1, "cross-account replay must not create a report");

    const migration = readFileSync(path.join(
      process.cwd(),
      "database/migrations/017_single_use_report_receipts.sql",
    ), "utf8");
    assert.match(migration, /anonymous_receipt_hash VARCHAR\(64\)/i);
    assert.match(migration, /CREATE UNIQUE INDEX[\s\S]+anonymous_receipt_hash/i);
  } finally {
    if (originalSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = originalSecret;
  }
}

run().then(() => {
  console.log("report storage security tests passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
