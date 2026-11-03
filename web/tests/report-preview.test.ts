import assert from "node:assert/strict";
import { withDeadline } from "../lib/backend/deadline";
import { reportPreview } from "../lib/reports/report-preview";
import { mergeSeverityCheck } from "../lib/reports/severity-check";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

async function run() {
  // The preview is the validated report's Verdict, band and first Critical Miss, and nothing else.
  const report = structuredClone(schemaValidReport) as any;
  const preview = reportPreview(report);
  assert.ok(preview);
  assert.deepEqual(Object.keys(preview!).sort(), ["critical_miss", "first_impression", "score", "score_label"]);
  assert.equal(preview!.first_impression, report.first_impression);
  assert.equal(preview!.score, report.score);
  assert.equal(preview!.score_label, report.score_label);
  assert.equal(preview!.critical_miss?.fix, report.top_fixes[0].fix);
  assert.equal(preview!.critical_miss?.why, report.top_fixes[0].why);
  assert.equal(preview!.critical_miss?.evidence.excerpt, report.top_fixes[0].evidence.excerpt);
  assert.equal(JSON.stringify(preview).includes(report.summary), false, "the rest of the report waits for complete");

  // What the preview shows is what the finished report shows: the severity check never changes the first fix.
  const merged = mergeSeverityCheck(report, {
    critical_misses: [
      { source: "new", kind: "no_recent_work", fix: "Add a dated line for this year.", why: "Nothing after 2023 is listed.", excerpt: "2023", section: "Experience", effort: "quick" },
      { source: "fix_3", kind: "missing_dates", fix: "", why: "", excerpt: "", section: "", effort: "quick" },
    ],
    more_critical: true,
  }).report;
  assert.deepEqual(reportPreview(merged), preview, "a preview sent before the severity check still matches the report after it");

  // Nothing that is not a validated report produces a preview.
  assert.equal(reportPreview(null), null);
  assert.equal(reportPreview({ first_impression: "x" }), null);
  assert.equal(reportPreview({ first_impression: "x", score: 70, score_label: "Clear", top_fixes: [] })?.critical_miss, null);

  // A dependency that never answers meets its deadline, and a prompt one is untouched.
  const startedAt = Date.now();
  await assert.rejects(
    withDeadline(new Promise(() => undefined), 20, () => Object.assign(new Error("slow"), { code: "SLOW" })),
    (error: any) => error.code === "SLOW",
  );
  assert.ok(Date.now() - startedAt < 1_000);
  assert.equal(await withDeadline(Promise.resolve("fast"), 1_000, () => new Error("never")), "fast");

  console.log("report preview and deadline tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
