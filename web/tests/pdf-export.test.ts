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
// W3: the reader's revised line, kept with the saved report, prints under its marked line.
const withAnswers = normalizeReportForPdf(sampleReport, {
  "0": { answers: [{ question: "What changed?", kind: "answered", text: "renewal churn fell from 9% to 6%" }], line: "Introduced monthly renewal-risk reviews across the portfolio: renewal churn fell from 9% to 6%.", source: "literal", updated_at: "2026-11-02T20:00:00.000Z" },
  "2": { answers: [{ question: "Scope?", kind: "not_mine" }], line: null, source: "literal", updated_at: "2026-11-02T20:00:00.000Z" },
});
assert.equal(withAnswers?.top_fixes?.[0]?.revised, "Introduced monthly renewal-risk reviews across the portfolio: renewal churn fell from 9% to 6%.");
assert.equal(withAnswers?.top_fixes?.[1]?.revised, undefined, "a fix without a kept line prints none");
assert.equal(withAnswers?.top_fixes?.[2]?.revised, undefined, "a cleared line prints none");
const answersHtml = renderReportHtml(withAnswers!);
assert.ok(answersHtml.includes("Your revised line"), "the PDF labels the revised line");
assert.ok(answersHtml.includes("renewal churn fell from 9% to 6%"), "the PDF prints the kept line");
assert.equal(normalizeReportForPdf(sampleReport, "garbage")?.top_fixes?.[0]?.revised, undefined, "a malformed column prints nothing and breaks nothing");
assert.ok(!renderedHtml.includes("Your revised line"), "no kept line, no label");

const draftHtml = renderReportHtml(normalizeReportForPdf({
  ...sampleReport,
  rewrites: [{
    label: "Scope",
    original: criticalLine,
    better: `${criticalLine}; [verified before-and-after result].`,
    enhancement_note: "Add a result you can verify.",
  }],
})!);
// Without the severity check the PDF names the first fix and states no count, as on the web.
assert.doesNotMatch(renderedHtml, /Critical Misses?\. |Critical Miss \d/);
assert.match(renderedHtml, /The one thing to fix first/);
// With it, the count leads, every Critical Miss is marked and numbered, and the flags reorder the fixes.
const lineOf = (index: number) => sampleReport.top_fixes[index].evidence.excerpt.replace(/^[-•*]\s+/u, "");
const flaggedPdf = normalizeReportForPdf({
  ...sampleReport,
  top_fixes: sampleReport.top_fixes.map((fix: object, index: number) => ({ ...fix, critical: index !== 1 })),
  more_critical: true,
})!;
assert.deepEqual(flaggedPdf.top_fixes?.map((fix) => fix.line), [lineOf(0), lineOf(2), lineOf(1)], "Critical Misses lead");
assert.equal(flaggedPdf.more_critical, true, "carried through; the renderer drops it without three flagged");
const flaggedHtml = renderReportHtml(flaggedPdf);
assert.match(flaggedHtml, /<h2>Two Critical Misses\. Start with this one\.<\/h2><p class="count-lead">Either one could cost you the interview on its own\.<\/p>/);
assert.doesNotMatch(flaggedHtml, /More than three|The one thing to fix first|Fix these three first/);
assert.ok(flaggedHtml.includes(`<span class="miss-mark">${lineOf(2)}</span>`), "every Critical Miss carries the highlighter");
assert.doesNotMatch(flaggedHtml, new RegExp(`<span class="miss-mark">${lineOf(1).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}`), "a plain fix doesn't");
assert.ok(flaggedHtml.indexOf("Critical Miss 1") < flaggedHtml.indexOf("Critical Miss 2") && flaggedHtml.indexOf("Critical Miss 2") < flaggedHtml.indexOf(">Fix 3<"));
const moreHtml = renderReportHtml(normalizeReportForPdf({
  ...sampleReport,
  top_fixes: sampleReport.top_fixes.map((fix: object) => ({ ...fix, critical: true })),
  more_critical: true,
})!);
assert.match(moreHtml, /<h2>More than three Critical Misses\. Here are the three that matter most\.<\/h2>/);
assert.equal(moreHtml.match(/class="miss-mark"/gu)?.length, 3);
// A Critical Miss about something the resume doesn't have shows what's missing: no quote, no highlighter.
const absentHtml = renderReportHtml(normalizeReportForPdf({
  ...sampleReport,
  top_fixes: sampleReport.top_fixes.map((fix: { evidence: object }, index: number) => ({
    ...fix,
    critical: index < 2,
    ...(index === 1 ? { evidence: { ...fix.evidence, excerpt: "No summary section present" } } : {}),
  })),
})!);
assert.match(absentHtml, /<div class="marked-missing miss">No summary section<\/div>/);
assert.doesNotMatch(absentHtml, /No summary section present/);
assert.equal(absentHtml.match(/class="miss-mark"/gu)?.length, 1);
assert.match(draftHtml, /More lines worth a second look\./);
assert.match(draftHtml, /Draft template/);
assert.match(draftHtml, /Fill in the brackets with your own facts before you use a draft\./);
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
