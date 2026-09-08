import { test, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generatePdfBuffer, renderReportHtml } from "../../lib/backend/pdf";
import { normalizeReportForPdf } from "../../lib/reports/pdf-export";

test("PDF output embeds the approved type and preserves a real report", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const output = testInfo.outputPath("output-identity");
  await mkdir(output, { recursive: true });
  const sample = JSON.parse(await readFile(path.resolve("public/sample-report.json"), "utf8"));
  const report = normalizeReportForPdf(sample);
  expect(report).toBeTruthy();
  if (!report) throw new Error("Invalid public sample report");
  const html = renderReportHtml(report);
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.locator("h1").evaluate(el => getComputedStyle(el).fontFamily)).toContain("Source Serif 4");
  expect(await page.locator("body").evaluate(el => getComputedStyle(el).fontSize)).toBe("14.6667px");
  expect(await page.locator("body").evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgb(255, 255, 255)");
  expect(await page.evaluate(() => [...document.fonts].every(font => font.status === "loaded"))).toBe(true);
  await writeFile(path.join(output, "sample-report.html"), html);
  await writeFile(path.join(output, "sample-report.pdf"), await generatePdfBuffer(report));

  // Exercise wrapping/page fragmentation with deliberately long fixture text.
  const longText = "Long fixture evidence: clarify ownership, scope, and the verified outcome before using this wording. ";
  const longReport = {
    ...report,
    summary: `${report.summary} ${longText.repeat(4)}`,
    rewrites: [...report.rewrites, {
      original: longText.repeat(5),
      better: `For [verified scope], ${longText.repeat(6)}`,
      enhancement_note: `Add the missing source facts. ${longText.repeat(3)}`,
    }],
  };
  await writeFile(path.join(output, "long-fixture-report.pdf"), await generatePdfBuffer(longReport));
});
