import assert from "node:assert/strict";
import { buildAccountExportPayload } from "../lib/backend/accountExport";
import { runInlineExportJob } from "../lib/backend/accountExportJob";

type Row = Record<string, any>;

class ReadQuery {
  constructor(
    private readonly admin: FakeExportAdmin,
    private readonly table: string,
  ) {}

  select() { return this; }
  eq() { return this; }
  order() { return this; }

  range(from: number, to: number) {
    this.admin.rangeCalls[this.table] = (this.admin.rangeCalls[this.table] || 0) + 1;
    if (this.admin.failReadTable === this.table) {
      return Promise.resolve({ data: null, error: { message: "synthetic read failure" } });
    }
    return Promise.resolve({
      data: (this.admin.rows[this.table] || []).slice(from, to + 1),
      error: null,
    });
  }
}

class UpdateQuery {
  private allowedStatuses: string[] = [];

  constructor(
    private readonly admin: FakeExportAdmin,
    private readonly patch: Row,
  ) {}

  eq() { return this; }
  in(_column: string, values: string[]) {
    this.allowedStatuses = values;
    return this;
  }
  select() { return this; }

  maybeSingle() {
    if (this.admin.failTransitionTo === this.patch.status) {
      return Promise.resolve({ data: null, error: { message: "synthetic transition failure" } });
    }
    if (!this.allowedStatuses.includes(this.admin.job.status)) {
      return Promise.resolve({ data: null, error: null });
    }
    Object.assign(this.admin.job, this.patch);
    return Promise.resolve({ data: { id: this.admin.job.id }, error: null });
  }
}

class FakeExportAdmin {
  readonly rangeCalls: Record<string, number> = {};
  readonly job: Row = { id: "job-1", user_id: "user-1", status: "pending" };
  failReadTable?: string;
  failTransitionTo?: string;

  constructor(readonly rows: Record<string, Row[]>) {}

  from(table: string) {
    if (table === "account_export_jobs") {
      return { update: (patch: Row) => new UpdateQuery(this, patch) };
    }
    return new ReadQuery(this, table);
  }
}

const emptyTables = {
  passes: [],
  user_usage: [],
  user_profiles: [],
  saved_jobs: [],
  billing_receipts: [],
};

async function run() {
  const reports = Array.from({ length: 501 }, (_, index) => ({ id: `report-${index}` }));
  const paginatedAdmin = new FakeExportAdmin({ reports, ...emptyTables });
  const payload = await buildAccountExportPayload(paginatedAdmin as any, {
    id: "user-1",
    email: "person@example.com",
  });

  assert.equal(payload.data.reports.length, 501, "exports must retrieve every page");
  assert.equal(paginatedAdmin.rangeCalls.reports, 2, "a full first page must trigger another read");
  assert.deepEqual(payload.warnings, [], "complete exports do not conceal section errors");

  const readFailureAdmin = new FakeExportAdmin({ reports: [], ...emptyTables });
  readFailureAdmin.failReadTable = "saved_jobs";
  await assert.rejects(
    () => buildAccountExportPayload(readFailureAdmin as any, { id: "user-1" }),
    /Account export read failed for saved_jobs/,
    "a missing section must fail the portability export",
  );

  const successfulJobAdmin = new FakeExportAdmin({ reports, ...emptyTables });
  await runInlineExportJob(successfulJobAdmin as any, "job-1", { id: "user-1" });
  assert.equal(successfulJobAdmin.job.status, "completed");
  assert.equal(successfulJobAdmin.job.result_json.data.reports.length, 501);
  assert.ok(successfulJobAdmin.job.expires_at, "completed exports must receive a retention deadline");

  const completionFailureAdmin = new FakeExportAdmin({ reports: [], ...emptyTables });
  completionFailureAdmin.failTransitionTo = "completed";
  await assert.rejects(
    () => runInlineExportJob(completionFailureAdmin as any, "job-1", { id: "user-1" }),
    /state transition failed/,
  );
  assert.equal(
    completionFailureAdmin.job.status,
    "failed",
    "a failed completion write must never be reported as a completed export",
  );

  const startFailureAdmin = new FakeExportAdmin({ reports: [], ...emptyTables });
  startFailureAdmin.failTransitionTo = "running";
  await assert.rejects(
    () => runInlineExportJob(startFailureAdmin as any, "job-1", { id: "user-1" }),
    /state transition failed/,
  );
  assert.equal(startFailureAdmin.job.status, "pending");

  console.log("account-export-job tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
