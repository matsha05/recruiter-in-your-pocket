import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderReportHtml } from "../lib/backend/pdf";
import { buildPdfExportRequest, normalizeReportForPdf } from "../lib/reports/pdf-export";
import { getScoreLabel } from "../lib/score-utils";

const sampleReportPath = path.join(process.cwd(), "public", "sample-report.json");
const sampleReport = JSON.parse(readFileSync(sampleReportPath, "utf8"));

const normalizedSample = normalizeReportForPdf(sampleReport);
assert.ok(normalizedSample, "sample report should normalize");
assert.equal(normalizedSample?.score, sampleReport.score);
assert.equal(normalizedSample?.summary, sampleReport.summary);
assert.deepEqual(normalizedSample?.next_steps, sampleReport.next_steps);
assert.equal(normalizedSample?.score_label, getScoreLabel(sampleReport.score));

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

const canonicalCeiling = normalizeReportForPdf({
  score: 100,
  score_label: "Recruiter Ready",
  summary: "A clear document.",
  subscores: { story: 100, impact: 100, clarity: 100, readability: 100 },
});
assert.equal(canonicalCeiling?.score, 99, "first-read score should never display 100");
assert.equal(canonicalCeiling?.score_label, "Clear and specific", "model labels must not override canonical bands");
assert.deepEqual(canonicalCeiling?.subscores, { story: 99, impact: 99, clarity: 99, readability: 99 });

const pdfRendererSource = readFileSync(path.join(process.cwd(), "lib", "backend", "pdf.ts"), "utf8");
assert.match(pdfRendererSource, /Instrument Sans/);
assert.match(pdfRendererSource, /Newsreader Variable/);
assert.doesNotMatch(pdfRendererSource, /Sentient|Satoshi|Fraunces|Georgia/);

const renderedHtml = renderReportHtml(normalizedSample!);
assert.match(renderedHtml, /^<!DOCTYPE html>/);
assert.match(renderedHtml, /<html lang="en">/);
assert.match(renderedHtml, /First-read score/);
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
for (const font of ["newsreader-latin-variable.ttf", "instrument-sans-latin-variable.ttf"]) {
  assert.match(nextConfigSource, new RegExp(font.replace(".", "\\.")), `${font} should be included in output tracing`);
  assert.match(postbuildSource, new RegExp(font.replace(".", "\\.")), `${font} should be asserted after build`);
}

const ogImage = readFileSync(path.join(process.cwd(), "public", "assets", "og-image.png"));
assert.equal(ogImage.subarray(1, 4).toString("ascii"), "PNG", "social image should be a real PNG");
assert.equal(ogImage.readUInt32BE(16), 1200, "social image should be 1200px wide");
assert.equal(ogImage.readUInt32BE(20), 630, "social image should be 630px tall");

console.log("pdf-export tests passed");
