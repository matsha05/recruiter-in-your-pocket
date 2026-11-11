import { expect, test, type Page, type Route } from "@playwright/test";
import { createRequire } from "node:module";
import path from "node:path";
import type { ReportData } from "../../components/workspace/report/ReportTypes";
import { parseLineAnswersPatch, type LineAnswersPatch, type StoredLineAnswersByFix } from "../../lib/reports/line-answers";

const WEB_ROOT = path.resolve(__dirname, "../..");
const requireExtension = createRequire(path.resolve(WEB_ROOT, "../extension/package.json"));
const { build } = requireExtension("esbuild");
interface HarnessPlugin {
  onResolve(options: { filter: RegExp }, callback: (args: { path: string }) => { path: string; namespace: string } | undefined): void;
  onLoad(options: { filter: RegExp; namespace: string }, callback: (args: { path: string }) => { contents: string; loader: string; resolveDir: string }): void;
}

const ORIGIN = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3100";
const REPORT_ID = "6f1c2b3a-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const SOURCE = "Built customer workflows in HubSpot for 120 customers.";
const SECOND_SOURCE = "Trained the support team on customer onboarding.";
const QUESTION = "Who used the workflow?";
const SECOND_QUESTION = "Which team joined the training?";
const ANSWER = "for the onboarding team";
const NEW_ANSWER = "for the support team";
const LITERAL = `${SOURCE.slice(0, -1)}: ${ANSWER}.`;
const POLISHED = "Built customer workflows in HubSpot for the onboarding team for 120 customers.";
const REPORT: ReportData = {
  id: REPORT_ID,
  contract_version: "v2",
  score: 72,
  first_impression: "The workflow is clear. Add who used it.",
  top_fixes: [
    { fix: "Name who used the workflow.", why: QUESTION, critical: true, evidence: { excerpt: SOURCE, section: "Experience" } },
    { fix: "Name the team you trained.", why: SECOND_QUESTION, critical: false, evidence: { excerpt: SECOND_SOURCE, section: "Experience" } },
  ],
};
const SAVED: StoredLineAnswersByFix = {
  "0": { answers: [{ question: QUESTION, kind: "answered", text: ANSWER }], line: LITERAL, source: "literal", updated_at: "2026-11-10T00:00:00.000Z" },
};
let harnessScript = "";
let harnessStyles = "";

async function buildLegacyHarness() {
  const mocks: Record<string, string> = {
    "next/link": `import React from "react"; export default function Link({href, children, ...props}) { return <a href={href} {...props}>{children}</a>; }`,
    "@/lib/analytics": `export const Analytics = new Proxy({}, {get: () => () => {}});`,
  };
  const result = await build({
    absWorkingDir: WEB_ROOT,
    stdin: {
      contents: `import React, {useEffect, useState} from "react";
        import {createRoot} from "react-dom/client";
        import {ReportStream} from "@/components/workspace/report/ReportStream";
        const initialReport = ${JSON.stringify(REPORT)};
        function Harness() {
          const [open, setOpen] = useState(false);
          const [answers, setAnswers] = useState(null);
          const [report, setReport] = useState(initialReport);
          async function reopen() {
            const response = await fetch("/api/reports/${REPORT_ID}");
            const body = await response.json();
            setAnswers(body.lineAnswers);
            setReport(body.report);
            setOpen(true);
          }
          useEffect(() => { void reopen(); }, []);
          return <>
            <nav aria-label="Test navigation">
              <button type="button" onClick={() => setOpen(false)}>Leave report</button>
              <button type="button" onClick={() => void reopen()}>Open report</button>
            </nav>
            {open ? <ReportStream report={report} storedLineAnswers={answers} isSignedIn hasPaidAccess resumeSource="saved" /> : <p>Report closed.</p>}
          </>;
        }
        createRoot(document.getElementById("root")).render(<Harness />);`,
      loader: "tsx", resolveDir: WEB_ROOT, sourcefile: "legacy-answer-save-harness.tsx",
    },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic",
    outdir: "/tmp/riyp-legacy-answer-save-bundle",
    define: { "process.env.NODE_ENV": JSON.stringify("test"), "process.env": JSON.stringify({}) },
    plugins: [{
      name: "legacy-answer-browser-boundaries",
      setup(plugin: HarnessPlugin) {
        plugin.onResolve({ filter: /^(next\/|@\/)/ }, ({ path: modulePath }) => (
          modulePath in mocks ? { path: modulePath, namespace: "legacy-answer-mock" } : undefined
        ));
        plugin.onLoad({ filter: /.*/, namespace: "legacy-answer-mock" }, ({ path: modulePath }) => ({
          contents: mocks[modulePath], loader: "tsx", resolveDir: WEB_ROOT,
        }));
      },
    }],
  });
  harnessScript = result.outputFiles.find((file: { path: string }) => file.path.endsWith(".js")).text;
  harnessStyles = result.outputFiles.find((file: { path: string }) => file.path.endsWith(".css"))?.text || "";
}

async function installLegacyHarness(page: Page, answers: StoredLineAnswersByFix | null = SAVED, report: ReportData = REPORT) {
  // The real v2 ReportStream, both MarkedRows adapters, LineLift, and shared writer run together.
  // Leaving unmounts the report as client navigation does; reopening supplies the server snapshot,
  // deliberately still old after a failed write. All requests are intercepted, including polish.
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) {
      await route.abort("blockedbyclient");
      throw new Error(`Unexpected external legacy-answer request: ${url.origin}${url.pathname}`);
    }
    if (url.pathname === "/legacy-answer-harness") return route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Legacy saved answer contract</title><style>${harnessStyles}
          body { font: 16px system-ui; margin: 24px; } #root { max-width: 1050px; margin: auto; }
          button, input, textarea { padding: 8px; margin: 4px; } button { cursor: pointer; }
          nav { position: sticky; top: 0; background: white; z-index: 100; }
          svg { width: 20px; height: 20px; }
        </style></head><body><main id="root"></main><script src="/legacy-answer-harness.js"></script></body></html>`,
    });
    if (url.pathname === "/legacy-answer-harness.js") return route.fulfill({ contentType: "text/javascript", body: harnessScript });
    if (url.pathname === "/favicon.ico") return route.fulfill({ status: 204 });
    await route.abort("blockedbyclient");
    throw new Error(`Unmocked legacy-answer request: ${url.pathname}`);
  });
  await page.route(`**/api/reports/${REPORT_ID}`, (route) => route.fulfill({ json: { ok: true, report, lineAnswers: answers } }));
  await page.route("**/api/revise-line", (route) => route.fulfill({ status: 503, json: { ok: false } }));
}

function firstCard(page: Page) { return page.getByTestId("critical-miss"); }
function firstAnswer(page: Page) { return firstCard(page).getByRole("textbox", { name: QUESTION, exact: true }); }

test.describe("legacy saved report answer lifecycle", () => {
  test.beforeAll(buildLegacyHarness);
  let runtimeErrors: string[] = [];
  test.beforeEach(({ page }) => {
    runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
  });
  test.afterEach(() => expect(runtimeErrors).toEqual([]));

  test("clearing the final saved answer can fail and retry without retyping", async ({ page }, testInfo) => {
    await installLegacyHarness(page);
    const writes: LineAnswersPatch[] = [];
    await page.route(`**/api/reports/${REPORT_ID}/answers`, async (route) => {
      writes.push(route.request().postDataJSON());
      await route.fulfill(writes.length === 1 ? { status: 500, json: { ok: false } } : { json: { ok: true } });
    });
    await page.goto(`${ORIGIN}/legacy-answer-harness`);
    await expect(firstAnswer(page)).toHaveValue(ANSWER);
    await firstAnswer(page).fill("");
    const retry = firstCard(page).getByRole("button", { name: "Try saving again", exact: true });
    await expect(retry).toBeVisible();
    await firstCard(page).screenshot({ path: testInfo.outputPath("failed-clear-retry.png") });
    expect(writes).toEqual([{ fix_index: 0, answers: [], line: null, source: "literal" }]);
    await retry.click();
    await expect(firstCard(page).getByTestId("line-kept")).toHaveText("Cleared from this report.");
    expect(writes).toEqual([writes[0], writes[0]]);
    await expect(firstAnswer(page)).toHaveValue("");
  });

  for (const value of [NEW_ANSWER, ""]) {
    test(`leaving during a ${value ? "new answer" : "clear"} debounce restores a failed draft on reopen`, async ({ page }) => {
      await installLegacyHarness(page);
      const writes: LineAnswersPatch[] = [];
      const requests: Route[] = [];
      await page.route(`**/api/reports/${REPORT_ID}/answers`, (route) => {
        writes.push(route.request().postDataJSON());
        requests.push(route);
      });
      await page.goto(`${ORIGIN}/legacy-answer-harness`);
      await expect(firstAnswer(page)).toHaveValue(ANSWER);
      await firstAnswer(page).fill(value);
      await page.getByRole("button", { name: "Leave report", exact: true }).click();
      await expect(firstCard(page)).toHaveCount(0);
      await expect.poll(() => requests.length).toBe(1);
      expect(writes[0]).toMatchObject(value
        ? { fix_index: 0, answers: [{ question: QUESTION, kind: "answered", text: value }] }
        : { fix_index: 0, answers: [], line: null, source: "literal" });
      await requests[0].fulfill({ status: 500, json: { ok: false } });
      await page.getByRole("button", { name: "Open report", exact: true }).click();
      await expect(firstAnswer(page)).toHaveValue(value);
      const retry = firstCard(page).getByRole("button", { name: "Try saving again", exact: true });
      await expect(retry).toBeVisible();
      expect(writes).toHaveLength(1);
      await retry.click();
      await expect.poll(() => requests.length).toBe(2);
      expect(writes[1]).toEqual(writes[0]);
      await requests[1].fulfill({ json: { ok: true } });
      await expect(firstCard(page).getByTestId("line-kept")).toHaveText(value ? "Kept with this report." : "Cleared from this report.");
    });
  }

  test("an older response cannot acknowledge a newer edit and a second fix has its own writer", async ({ page }) => {
    await installLegacyHarness(page, null);
    const writes: LineAnswersPatch[] = [];
    const requests: Route[] = [];
    await page.route(`**/api/reports/${REPORT_ID}/answers`, (route) => {
      writes.push(route.request().postDataJSON());
      requests.push(route);
    });
    await page.goto(`${ORIGIN}/legacy-answer-harness`);
    await firstAnswer(page).fill(ANSWER);
    await expect.poll(() => requests.length).toBe(1);
    await firstAnswer(page).fill(NEW_ANSWER);
    const second = page.getByTestId("fix-row");
    await second.getByRole("button", { name: "Work on this line", exact: true }).click();
    await second.getByRole("textbox", { name: SECOND_QUESTION, exact: true }).fill("the account managers");
    // While fix zero is held in flight, the other fix must save independently.
    await expect.poll(() => writes.some((write) => write.fix_index === 1)).toBe(true);
    expect(writes.filter((write) => write.fix_index === 0)).toHaveLength(1);
    const secondIndex = writes.findIndex((write) => write.fix_index === 1);
    await requests[secondIndex].fulfill({ json: { ok: true } });
    await expect(second.getByTestId("line-kept")).toHaveText("Kept with this report.");
    await requests[0].fulfill({ json: { ok: true } });
    await expect.poll(() => writes.filter((write) => write.fix_index === 0).length).toBe(2);
    await expect(firstCard(page).getByTestId("line-kept")).toHaveText("Keeping this with your report…");
    const latestIndex = writes.findLastIndex((write) => write.fix_index === 0);
    expect(writes[latestIndex].answers).toEqual([{ question: QUESTION, kind: "answered", text: NEW_ANSWER }]);
    await requests[latestIndex].fulfill({ status: 500, json: { ok: false } });
    await expect(firstCard(page).getByRole("button", { name: "Try saving again", exact: true })).toBeVisible();
    await expect(firstAnswer(page)).toHaveValue(NEW_ANSWER);
  });

  test("saved polished wording, exact words, and guarded edits retain their chosen source", async ({ page }) => {
    await installLegacyHarness(page, { "0": { ...SAVED["0"], line: POLISHED, source: "polished" } });
    const writes: LineAnswersPatch[] = [];
    await page.route(`**/api/reports/${REPORT_ID}/answers`, async (route) => {
      writes.push(route.request().postDataJSON());
      await route.fulfill({ json: { ok: true } });
    });
    await page.goto(`${ORIGIN}/legacy-answer-harness`);
    const card = firstCard(page);
    await expect(card.getByTestId("revised-line")).toHaveText(POLISHED);
    await expect(card.getByRole("button", { name: "Copy", exact: true })).toBeEnabled();
    await card.getByRole("button", { name: "Use my exact words", exact: true }).click();
    await expect.poll(() => writes.at(-1)?.source).toBe("literal");
    expect(writes.at(-1)?.line).toBe(LITERAL);
    await card.getByRole("button", { name: "Use the smoothed line", exact: true }).click();
    await expect.poll(() => writes.at(-1)?.source).toBe("polished");
    expect(writes.at(-1)?.line).toBe(POLISHED);
    await card.getByRole("button", { name: "Edit", exact: true }).click();
    await card.getByRole("textbox", { name: "Edit your revised line", exact: true }).fill(`${POLISHED} Saved 999 hours.`);
    await expect(card.getByRole("button", { name: "Copy", exact: true })).toBeDisabled();
    await expect.poll(() => writes.at(-1)?.source).toBe("edited");
    expect(writes.at(-1)).toMatchObject({ line: null, answers: SAVED["0"].answers });
    // A fabricated number asks the reader to edit it; the exact-words shortcut is
    // reserved for an ambiguous relationship, so correct the wording in place.
    await card.getByRole("textbox", { name: "Edit your revised line", exact: true }).fill(LITERAL);
    await expect(card.getByRole("button", { name: "Copy", exact: true })).toBeEnabled();
    await expect.poll(() => writes.at(-1)?.line).toBe(LITERAL);
    expect(writes.at(-1)?.source).toBe("edited");
    expect(writes.at(-1)?.line).toBe(LITERAL);
  });

  for (const value of [NEW_ANSWER, ""]) {
    test(`a confirmed ${value ? "answer" : "clear"} survives hiding and restoring its saved report suggestion`, async ({ page }) => {
      await installLegacyHarness(page);
      const writes: LineAnswersPatch[] = [];
      await page.route(`**/api/reports/${REPORT_ID}/answers`, async (route) => {
        writes.push(route.request().postDataJSON());
        await route.fulfill({ json: { ok: true } });
      });
      await page.goto(`${ORIGIN}/legacy-answer-harness`);
      await firstAnswer(page).fill(value);
      await expect.poll(() => writes.length).toBe(1);
      await expect(firstCard(page).getByTestId("line-kept")).toHaveText(value ? "Kept with this report." : "Cleared from this report.");
      await firstCard(page).getByRole("button", { name: /^Hide this suggestion:/ }).click();
      await expect(firstAnswer(page)).not.toBeVisible();
      await expect(page.getByTestId("line-lift")).toHaveCount(1);
      await expect(page.getByTestId("line-lift")).not.toBeVisible();
      await page.getByRole("button", { name: "Bring it back", exact: true }).click();
      await expect(firstAnswer(page)).toHaveValue(value);
      await expect(firstCard(page).getByTestId("line-kept")).toHaveText(value ? "Kept with this report." : "Cleared from this report.");
      if (value) await expect(firstCard(page).getByTestId("revised-line")).toContainText(value);
      else await expect(firstCard(page).getByTestId("revised-line")).toHaveCount(0);
      expect(writes).toHaveLength(1);
    });
  }

  test("the open second fix retains its confirmed edit when hidden and restored", async ({ page }) => {
    await installLegacyHarness(page);
    const writes: LineAnswersPatch[] = [];
    await page.route(`**/api/reports/${REPORT_ID}/answers`, async (route) => {
      writes.push(route.request().postDataJSON());
      await route.fulfill({ json: { ok: true } });
    });
    await page.goto(`${ORIGIN}/legacy-answer-harness`);
    const second = page.getByTestId("fix-row");
    await second.getByRole("button", { name: "Work on this line", exact: true }).click();
    const answer = second.getByRole("textbox", { name: SECOND_QUESTION, exact: true });
    await answer.fill("the account managers");
    await expect.poll(() => writes.length).toBe(1);
    await expect(second.getByTestId("line-kept")).toHaveText("Kept with this report.");
    await second.getByRole("button", { name: /^Hide this suggestion:/ }).click();
    await expect(answer).not.toBeVisible();
    await expect(page.getByTestId("line-lift")).toHaveCount(2);
    await expect(page.getByTestId("line-lift").nth(1)).not.toBeVisible();
    await page.getByRole("button", { name: "Bring it back", exact: true }).click();
    await expect(answer).toHaveValue("the account managers");
    await expect(second.getByTestId("revised-line")).toContainText("the account managers");
    await expect(second.getByTestId("line-kept")).toHaveText("Kept with this report.");
    expect(writes).toHaveLength(1);
    expect(writes[0].fix_index).toBe(1);
  });

  test("an overlong safe edit remains recoverable until shortened instead of saving a null line", async ({ page }, testInfo) => {
    const otherQuestion = "Which other team used the workflow?";
    const longAnswers = [
      { question: QUESTION, kind: "answered" as const, text: `${ANSWER} `.repeat(12).trim() },
      { question: otherQuestion, kind: "answered" as const, text: `${NEW_ANSWER} `.repeat(14).trim() },
    ];
    const longLiteral = `${SOURCE.slice(0, -1)}: ${longAnswers.map((answer) => answer.text).join("; ")}.`;
    expect(longAnswers.every((answer) => answer.text.length <= 300)).toBe(true);
    expect(longLiteral.length).toBeGreaterThan(600);
    const longReport: ReportData = { ...REPORT, top_fixes: [{ ...REPORT.top_fixes![0], why: `${QUESTION} ${otherQuestion}` }] };
    // Valid stored facts can compose a line longer than the line column permits.
    // The initial server value is null; the browser must retain the actual edited text on failure.
    await installLegacyHarness(page, { "0": { ...SAVED["0"], answers: longAnswers, line: null } }, longReport);
    const writes: LineAnswersPatch[] = [];
    await page.route(`**/api/reports/${REPORT_ID}/answers`, async (route) => {
      const patch = route.request().postDataJSON() as LineAnswersPatch;
      writes.push(patch);
      await route.fulfill(parseLineAnswersPatch(patch)
        ? { json: { ok: true } }
        : { status: 400, json: { ok: false, message: "Check your answers and try again." } });
    });
    await page.goto(`${ORIGIN}/legacy-answer-harness`);
    const card = firstCard(page);
    await expect(card.getByTestId("revised-line")).toHaveText(longLiteral);
    await card.getByRole("button", { name: "Edit", exact: true }).click();
    const editor = card.getByRole("textbox", { name: "Edit your revised line", exact: true });
    await expect(editor).toHaveValue(longLiteral);
    // A native textarea may start over its maxlength from existing composed text.
    // Backspace is a real user edit that remains over the limit; it must not be replaced with null.
    await editor.evaluate((element) => {
      const input = element as HTMLTextAreaElement;
      input.setSelectionRange(input.value.length, input.value.length);
    });
    await editor.press("Backspace");
    const edited = await editor.inputValue();
    expect(edited.length).toBe(longLiteral.length - 1);
    expect(edited.length).toBeGreaterThan(600);
    await expect.poll(() => writes.length).toBe(1);
    expect(writes[0]).toMatchObject({ fix_index: 0, answers: longAnswers, line: edited, source: "edited" });
    await expect(card.getByTestId("line-lift")).toHaveAttribute("data-kept", "failed");
    await expect(card.getByTestId("line-kept")).toHaveText("Shorten this line to 600 characters to save it.");
    await expect(card.getByRole("button", { name: "Try saving again", exact: true })).toHaveCount(0);
    await card.screenshot({ path: testInfo.outputPath("overlong-edited-line.png") });
    await page.getByRole("button", { name: "Leave report", exact: true }).click();
    await page.getByRole("button", { name: "Open report", exact: true }).click();
    await expect(card.getByTestId("revised-line")).toHaveText(edited);
    await expect(card.getByTestId("line-lift")).toHaveAttribute("data-kept", "failed");
    await expect(card.getByTestId("line-kept")).toHaveText("Shorten this line to 600 characters to save it.");
    expect(writes).toHaveLength(1);
    await card.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(editor).toHaveValue(edited);
    await editor.fill(LITERAL);
    await expect(card.getByTestId("line-kept")).toHaveText("Kept with this report.");
    expect(writes).toHaveLength(2);
    expect(writes[1]).toMatchObject({ answers: longAnswers, line: LITERAL, source: "edited" });
    await expect(card.getByRole("button", { name: "Copy", exact: true })).toBeEnabled();
  });
});
