import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildPdfExportRequest, normalizeReportForPdf } from "../lib/reports/pdf-export";

const sampleReportPath = path.join(process.cwd(), "public", "sample-report.json");
const sampleReport = JSON.parse(readFileSync(sampleReportPath, "utf8"));

const normalizedSample = normalizeReportForPdf(sampleReport);
assert.ok(normalizedSample, "sample report should normalize");
assert.equal(normalizedSample?.score, 86);
assert.equal(normalizedSample?.summary, sampleReport.summary);
assert.deepEqual(normalizedSample?.next_steps, sampleReport.next_steps);

const legacyReport = {
  score: 72,
  score_comment_long: "Clear ownership, but the scale of the work is hard to see.",
  strengths: ["Strong ownership language"],
  gaps: ["Missing scope"],
  rewrites: [
    {
      original: "Improved process.",
      better: "Improved onboarding process across three teams.",
    },
  ],
  top_fixes: [
    {
      fix: "Add one scope number to your strongest bullet",
      why: "It helps recruiters size the work faster.",
    },
  ],
  skim: { raw: "x".repeat(5000) },
  ideas: { questions: ["What changed?"], notes: ["Use metrics"] },
};

const normalizedLegacy = normalizeReportForPdf(legacyReport);
assert.ok(normalizedLegacy, "legacy report should normalize");
assert.equal(normalizedLegacy?.summary, legacyReport.score_comment_long);
assert.deepEqual(normalizedLegacy?.next_steps, ["Add one scope number to your strongest bullet"]);
assert.equal(normalizedLegacy?.rewrites.length, 1);

const request = buildPdfExportRequest(legacyReport);
assert.ok(request, "request payload should build");
assert.deepEqual(Object.keys(request ?? {}).sort(), ["report"]);
assert.equal("skim" in ((request as { report: Record<string, unknown> }).report), false);
assert.equal("ideas" in ((request as { report: Record<string, unknown> }).report), false);

assert.equal(normalizeReportForPdf({ summary: "Missing score" }), null);

console.log("pdf-export tests passed");
