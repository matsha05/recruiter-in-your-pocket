import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { linkReportRevision } from "../lib/reports/generated-report-store";

const USER = "user-1";
const NEW = "11111111-1111-4111-8111-111111111111";
const OLD = "22222222-2222-4222-8222-222222222222";
const context = { request_id: "req", route: "test" };

// A stand-in for the service client: one table of reports, and a record of every update it was asked for.
function fakeAdmin(rows: { id: string; user_id: string; revises_report_id?: string | null }[], failUpdate = false) {
  const updates: { values: Record<string, unknown>; filters: [string, string, unknown][] }[] = [];
  const admin = {
    updates,
    from(table: string) {
      assert.equal(table, "reports");
      return {
        select() {
          const filters: Record<string, unknown> = {};
          const query = {
            eq(column: string, value: unknown) { filters[column] = value; return query; },
            async maybeSingle() {
              const row = rows.find((candidate) => candidate.id === filters.id && candidate.user_id === filters.user_id);
              return { data: row ? { id: row.id } : null, error: null };
            },
          };
          return query;
        },
        update(values: Record<string, unknown>) {
          const filters: [string, string, unknown][] = [];
          const query = {
            eq(column: string, value: unknown) { filters.push(["eq", column, value]); return query; },
            is(column: string, value: unknown) { filters.push(["is", column, value]); return query; },
            then(resolve: (result: { error: unknown }) => void) {
              updates.push({ values, filters });
              resolve({ error: failUpdate ? { code: "42703" } : null });
            },
          };
          return query;
        },
      };
    },
  };
  return admin;
}

async function main() {
  // The earlier report is the same person's: the new one is linked to it, once.
  const owned = fakeAdmin([{ id: NEW, user_id: USER }, { id: OLD, user_id: USER }]);
  assert.equal(await linkReportRevision({ admin: owned, userId: USER, reportId: NEW, revisesReportId: OLD, context }), true);
  assert.deepEqual(owned.updates, [{
    values: { revises_report_id: OLD },
    filters: [["eq", "id", NEW], ["eq", "user_id", USER], ["is", "revises_report_id", null]],
  }], "only this person's report, and only while it has no link yet");

  // Someone else's report, or one that doesn't exist, is never linked.
  const foreign = fakeAdmin([{ id: NEW, user_id: USER }, { id: OLD, user_id: "someone-else" }]);
  assert.equal(await linkReportRevision({ admin: foreign, userId: USER, reportId: NEW, revisesReportId: OLD, context }), false);
  assert.deepEqual(foreign.updates, []);

  // Nothing to link, a malformed id, or a report named as its own revision: no query at all.
  const untouched = fakeAdmin([{ id: NEW, user_id: USER }]);
  for (const [reportId, revisesReportId] of [[NEW, null], [null, OLD], [NEW, "not-an-id"], [NEW, NEW], [NEW, NEW.toUpperCase()]] as const) {
    assert.equal(await linkReportRevision({ admin: untouched, userId: USER, reportId, revisesReportId, context }), false);
  }
  assert.equal(await linkReportRevision({ admin: null, userId: USER, reportId: NEW, revisesReportId: OLD, context }), false);
  assert.deepEqual(untouched.updates, []);

  // Where the column doesn't exist yet the update fails: the report is already saved, so this only reports false.
  const unmigrated = fakeAdmin([{ id: NEW, user_id: USER }, { id: OLD, user_id: USER }], true);
  assert.equal(await linkReportRevision({ admin: unmigrated, userId: USER, reportId: NEW, revisesReportId: OLD, context }), false);

  // The migration is in the manifest, and clears the link rather than deleting the later report.
  const sql = fs.readFileSync(path.join(process.cwd(), "database", "migrations", "026_report_revisions.sql"), "utf8");
  assert.match(sql, /revises_report_id UUID REFERENCES public\.reports\(id\) ON DELETE SET NULL/);
  const manifest = fs.readFileSync(path.join(process.cwd(), "..", "scripts", "migrate.js"), "utf8");
  assert.match(manifest, /\["026_report_revisions", "web\/database\/migrations\/026_report_revisions\.sql"\]/);

  console.log("report revision link: owner-checked, set once, never blocks a save");
}

main().catch((error) => { console.error(error); process.exit(1); });
