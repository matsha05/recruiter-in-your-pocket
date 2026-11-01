import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderReportHtml } from "../lib/backend/pdf";
import { attachStoredReportId, buildPdfExportRequest, normalizeReportForPdf } from "../lib/reports/pdf-export";
import { reconcileReport } from "../lib/reports/report-integrity";
import { assertSampleReportResponseOk } from "../lib/reports/sample-report";
import { getScoreLabel } from "../lib/score-utils";
import { scoreBandFor } from "../lib/reports/score-band";
import { marginNoteFromFix } from "../lib/reports/revised-line";
import {
  makeValidatedReportReceipt,
  RECEIPT_TTL_MS,
  validatedReportReceiptClaim,
  verifyValidatedReportReceipt,
} from "../lib/reports/report-receipt";
import { buildGroundedReportTrustMetadata, parseTrustedStoredReport } from "../lib/reports/report-trust";
import { ResumeFeedbackResponseSchema } from "../lib/validation/schemas";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

const sampleReportPath = path.join(process.cwd(), "public", "sample-report.json");
const sampleReport = JSON.parse(readFileSync(sampleReportPath, "utf8"));
const parsedSampleReport = ResumeFeedbackResponseSchema.safeParse(sampleReport);
if (!parsedSampleReport.success) {
  assert.fail(`public sample must match the production report schema: ${parsedSampleReport.error.message}`);
}

const normalizedSample = normalizeReportForPdf(sampleReport);
assert.ok(normalizedSample, "sample report should normalize");
assert.equal(normalizedSample?.score, sampleReport.score);
assert.equal(normalizedSample?.summary, sampleReport.summary);
// The PDF applies the same integrity pass as the web report, so it shows the reconciled plan.
assert.deepEqual(normalizedSample?.next_steps, reconcileReport(sampleReport).report.next_steps);
assert.equal(normalizedSample?.score_label, getScoreLabel(sampleReport.score));

// Jordan's sample is real output and, like real reports today, carries no rewrites (D3).
assert.deepEqual(sampleReport.rewrites, [], "the sample must not promise rewrites reports don't deliver");
assert.equal(normalizedSample?.top_fixes?.length, sampleReport.top_fixes.length, "every fix reaches the PDF");
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
const mintedAt = Date.now();
const boundedReceipt = makeValidatedReportReceipt(schemaValidReport, mintedAt);
assert.equal(
  validatedReportReceiptClaim(schemaValidReport, boundedReceipt, mintedAt)?.expiresAt,
  new Date(mintedAt + RECEIPT_TTL_MS).toISOString(),
  "the storage expiry must come from the verified signed receipt payload",
);
assert.equal(
  validatedReportReceiptClaim(schemaValidReport, makeValidatedReportReceipt(schemaValidReport, mintedAt + 1), mintedAt),
  null,
  "a valid signature must not bypass the maximum receipt TTL",
);
assert.equal(validatedReportReceiptClaim(schemaValidReport, boundedReceipt, mintedAt + RECEIPT_TTL_MS), null);
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
assert.match(pdfRendererSource, /Schibsted Grotesk/);
assert.match(pdfRendererSource, /Literata/);
assert.doesNotMatch(pdfRendererSource, /Sentient|Satoshi|Fraunces|Space Grotesk|Newsreader|Instrument Sans|Source Serif/);

const renderedHtml = renderReportHtml(normalizedSample!);
assert.match(renderedHtml, /^<!DOCTYPE html>/);
assert.match(renderedHtml, /<html lang="en">/);
// D5: the first report shows the band and its anchor; the number is only for comparing revisions.
assert.ok(renderedHtml.includes(`<div class="band-name">${scoreBandFor(sampleReport.score).name}</div>`), "the PDF names the sample's band");
assert.ok(renderedHtml.includes(scoreBandFor(sampleReport.score).anchor), "and gives its anchor");
assert.doesNotMatch(renderedHtml, /\/100|score-value/, "the PDF must not show the number on a first report");
assert.match(renderedHtml, /It doesn't predict interviews or offers\./);
assert.match(renderedHtml, /<div class="verdict-label">Verdict<\/div>/);
assert.ok(renderedHtml.includes(sampleReport.first_impression), "the PDF must open with the same Verdict as the web report");
assert.match(renderedHtml, /Critical Miss/);
assert.ok(renderedHtml.includes(marginNoteFromFix(sampleReport.top_fixes[0].fix)), "the fix is the Critical Miss line's margin note, as on the web");
assert.ok(renderedHtml.includes(`<span class="miss-mark">${sampleReport.top_fixes[0].evidence.excerpt.replace(/^[-•*]\s+/u, "")}</span>`), "the Critical Miss line carries the highlighter, as on the web");
assert.match(renderedHtml, /Fix these three first\./);
assert.doesNotMatch(renderedHtml, /subscores-grid/, "the PDF must use one score system");
assert.match(renderedHtml, /Keep this one/);
assert.doesNotMatch(renderedHtml, /Leave these alone|Start here/, "retired names stay retired");
assert.doesNotMatch(renderedHtml, /What stays unclear/, "gaps already surface as the Critical Miss and fixes; the PDF must not repeat them");
// The sample has no drafts (D3), so the draft layout is checked on a copy with one source-bound draft.
const criticalLine = sampleReport.top_fixes[0].evidence.excerpt;
const draftHtml = renderReportHtml(normalizeReportForPdf({
  ...sampleReport,
  rewrites: [{
    label: "Scope",
    original: criticalLine,
    better: `${criticalLine}; [verified before-and-after result].`,
    enhancement_note: "Add a result you can verify.",
  }],
})!);
assert.match(draftHtml, /Suggested edits/);
assert.match(draftHtml, /Draft template/);
assert.match(draftHtml, /Complete the bracketed details with facts from your experience/);
assert.doesNotMatch(draftHtml, /Why this is stronger|<div class="col-label">After<\/div>/);
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
for (const font of ["Literata-Variable.woff2", "SchibstedGrotesk-Variable.woff2"]) {
  assert.match(nextConfigSource, new RegExp(font.replace(".", "\\.")), `${font} should be included in output tracing`);
  assert.match(postbuildSource, new RegExp(font.replace(".", "\\.")), `${font} should be asserted after build`);
}
for (const runtimeAsset of ["chromium.br", "fonts.tar.br", "swiftshader.tar.br", "al2023.tar.br"]) {
  const escapedAsset = runtimeAsset.replace(".", "\\.");
  assert.match(
    nextConfigSource,
    new RegExp(`@sparticuz/chromium/bin/${escapedAsset}`),
    `${runtimeAsset} should be included in the PDF route trace`,
  );
  assert.match(
    postbuildSource,
    new RegExp(escapedAsset),
    `${runtimeAsset} should be required by the postbuild trace assertion`,
  );
}

const ogImage = readFileSync(path.join(process.cwd(), "public", "assets", "og-image.png"));
assert.equal(ogImage.subarray(1, 4).toString("ascii"), "PNG", "social image should be a real PNG");
assert.equal(ogImage.readUInt32BE(16), 1200, "social image should be 1200px wide");
assert.equal(ogImage.readUInt32BE(20), 630, "social image should be 630px tall");

console.log("pdf-export tests passed");
