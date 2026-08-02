import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderReportHtml } from "../lib/backend/pdf";
import { attachStoredReportId, buildPdfExportRequest, normalizeReportForPdf } from "../lib/reports/pdf-export";
import { assertSampleReportResponseOk } from "../lib/reports/sample-report";
import { getScoreLabel } from "../lib/score-utils";
import { makeValidatedReportReceipt, verifyValidatedReportReceipt } from "../lib/reports/report-receipt";
import { buildGroundedReportTrustMetadata, parseTrustedStoredReport } from "../lib/reports/report-trust";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

const sampleReportPath = path.join(process.cwd(), "public", "sample-report.json");
const sampleReport = JSON.parse(readFileSync(sampleReportPath, "utf8"));

const normalizedSample = normalizeReportForPdf(sampleReport);
assert.ok(normalizedSample, "sample report should normalize");
assert.equal(normalizedSample?.score, sampleReport.score);
assert.equal(normalizedSample?.summary, sampleReport.summary);
assert.deepEqual(normalizedSample?.next_steps, sampleReport.next_steps);
assert.equal(normalizedSample?.score_label, getScoreLabel(sampleReport.score));

const serializedSampleRewrites = JSON.stringify(sampleReport.rewrites);
assert.doesNotMatch(serializedSampleRewrites, /18 weekly hires|cutting ramp time 28%|six-team platform launch|14 to 3/i);
assert.match(sampleReport.rewrites[0].better, /\[program length\].*\[number of hires\].*\[teams\].*\[verified outcome\]/i);
assert.match(sampleReport.rewrites[1].better, /\[team count\].*\[verified before-and-after result\]/i);
for (const rewrite of sampleReport.rewrites) {
  assert.match(rewrite.enhancement_note, /^Add\b/, "sample rewrite notes must tell the candidate which fact to add");
}
assert.doesNotThrow(() => assertSampleReportResponseOk({ ok: true, status: 200 }));
assert.throws(
  () => assertSampleReportResponseOk({ ok: false, status: 503 }),
  /Sample report request failed with status 503/,
);

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

assert.equal(buildPdfExportRequest(legacyReport), null, "inline client reports must never become export payloads");
const reportId = "123e4567-e89b-42d3-a456-426614174000";
assert.deepEqual(buildPdfExportRequest({ ...legacyReport, report_id: reportId }), { report_id: reportId });
assert.deepEqual(buildPdfExportRequest({ ...legacyReport, id: reportId }), { report_id: reportId });
assert.equal(buildPdfExportRequest({ score: 42 }), null, "incomplete client payloads must fail closed");
const newlySavedReport = attachStoredReportId(schemaValidReport, reportId);
assert.deepEqual(
  buildPdfExportRequest(newlySavedReport),
  { report_id: reportId },
  "an anonymous report must export by the stored ID returned after sign-in save",
);

const originalSessionSecret = process.env.SESSION_SECRET;
process.env.SESSION_SECRET = "pdf-export-contract-test-secret";
const receipt = makeValidatedReportReceipt(schemaValidReport);
assert.equal(verifyValidatedReportReceipt(schemaValidReport, receipt), true);
assert.equal(verifyValidatedReportReceipt({ ...schemaValidReport, score: 99 }, receipt), false);
assert.equal(
  verifyValidatedReportReceipt(schemaValidReport, `${receipt}.ignored`),
  false,
  "anonymous receipts must contain exactly two segments",
);
const ownerId = "11111111-1111-4111-8111-111111111111";
const otherOwnerId = "22222222-2222-4222-8222-222222222222";
const trustMetadata = buildGroundedReportTrustMetadata(schemaValidReport, ownerId);
assert.ok(parseTrustedStoredReport(
  schemaValidReport,
  trustMetadata.evidence_version,
  trustMetadata.evidence_json,
  ownerId,
), "an exact server-signed stored report must be accepted");
assert.equal(parseTrustedStoredReport(
  schemaValidReport,
  trustMetadata.evidence_version,
  { items: trustMetadata.evidence_json.items },
  ownerId,
), null, "a marker-only stored report forgery must be rejected");
assert.equal(parseTrustedStoredReport(
  { ...schemaValidReport, score: 73 },
  trustMetadata.evidence_version,
  trustMetadata.evidence_json,
  ownerId,
), null, "post-sign report mutation must be rejected");
assert.equal(parseTrustedStoredReport(
  schemaValidReport,
  trustMetadata.evidence_version,
  trustMetadata.evidence_json,
  otherOwnerId,
), null, "a signed report must not replay across users");
assert.equal(parseTrustedStoredReport(
  schemaValidReport,
  "v2:source-grounded",
  trustMetadata.evidence_json,
  ownerId,
), null, "legacy marker-only rows must fail closed");
if (originalSessionSecret === undefined) delete process.env.SESSION_SECRET;
else process.env.SESSION_SECRET = originalSessionSecret;

assert.equal(normalizeReportForPdf({ summary: "Missing score" }), null);

const canonicalCeiling = normalizeReportForPdf({
  score: 100,
  score_label: "Recruiter Ready",
  summary: "A clear document.",
  subscores: { story: 100, impact: 100, clarity: 100, readability: 100 },
});
assert.equal(canonicalCeiling?.score, 99, "first-read score should never display 100");
assert.equal(canonicalCeiling?.score_label, "Clear and specific", "model labels must not override canonical bands");
assert.deepEqual(canonicalCeiling?.subscores, { story: 99, impact: 99, clarity: 99, readability: 99 });

const pdfRendererSource = ["pdf.ts", "pdf-styles.ts"]
  .map((fileName) => readFileSync(path.join(process.cwd(), "lib", "backend", fileName), "utf8"))
  .join("\n");
assert.match(pdfRendererSource, /Instrument Sans/);
assert.match(pdfRendererSource, /Space Grotesk Variable/);
assert.doesNotMatch(pdfRendererSource, /Sentient|Satoshi|Fraunces|Georgia|Newsreader/);

const renderedHtml = renderReportHtml(normalizedSample!);
assert.match(renderedHtml, /^<!DOCTYPE html>/);
assert.match(renderedHtml, /<html lang="en">/);
assert.match(renderedHtml, /Clarity summary/);
assert.match(renderedHtml, /78<span>\/100<\/span>/);
assert.match(renderedHtml, /Not a prediction of interviews or offers\./);
assert.match(renderedHtml, new RegExp(getScoreLabel(sampleReport.score)));
assert.match(renderedHtml, /What lands/);
assert.match(renderedHtml, /What stays unclear/);
assert.match(renderedHtml, /Strongest next wording/);
assert.doesNotMatch(renderedHtml, /PocketMark|#0d9488|#22c55e|#d97706|#dc2626/);
assert.doesNotMatch(renderedHtml, /[\u2010-\u2015\u2212]/, "PDF text should use ASCII hyphens");

const definedVariables = new Set(
  Array.from(renderedHtml.matchAll(/--([a-z0-9-]+)\s*:/gi), (match) => match[1])
);
const usedVariables = new Set(
  Array.from(renderedHtml.matchAll(/var\(--([a-z0-9-]+)\)/gi), (match) => match[1])
);
const undefinedVariables = Array.from(usedVariables).filter((name) => !definedVariables.has(name));
assert.deepEqual(undefinedVariables, [], "rendered PDF CSS should not reference undefined variables");

for (const tag of ["html", "head", "style", "body", "section", "div", "span", "ul", "li", "p", "h1", "h2", "strong"]) {
  const opens = (renderedHtml.match(new RegExp(`<${tag}(?:\\s|>)`, "gi")) || []).length;
  const closes = (renderedHtml.match(new RegExp(`</${tag}>`, "gi")) || []).length;
  assert.equal(opens, closes, `rendered PDF HTML should balance <${tag}> tags`);
}

const nextConfigSource = readFileSync(path.join(process.cwd(), "next.config.mjs"), "utf8");
const postbuildSource = readFileSync(path.join(process.cwd(), "scripts", "ensure-next-build-package.cjs"), "utf8");
for (const font of ["space-grotesk-latin-variable.ttf", "instrument-sans-latin-variable.ttf"]) {
  assert.match(nextConfigSource, new RegExp(font.replace(".", "\\.")), `${font} should be included in output tracing`);
  assert.match(postbuildSource, new RegExp(font.replace(".", "\\.")), `${font} should be asserted after build`);
}

const ogImage = readFileSync(path.join(process.cwd(), "public", "assets", "og-image.png"));
assert.equal(ogImage.subarray(1, 4).toString("ascii"), "PNG", "social image should be a real PNG");
assert.equal(ogImage.readUInt32BE(16), 1200, "social image should be 1200px wide");
assert.equal(ogImage.readUInt32BE(20), 630, "social image should be 630px tall");

console.log("pdf-export tests passed");
