import { expect, test, type Page, type Route } from "@playwright/test";
import { schemaValidReport } from "../helpers/report-fidelity-fixture";
import { ResumeFeedbackResponseSchema } from "../../lib/validation/resume-report-schema";

// The guarded polish (Matt, Nov 1): the literal line shows at once; a smoother line from the server
// replaces it only when the browser's own guard also passes it; "Use my exact words" switches back.
const SOURCE = "Built customer workflows in HubSpot for 120 customers.";
const ANSWER = "for the onboarding team";
const LITERAL = `${SOURCE.replace(/\.$/, "")}: ${ANSWER}.`;
const POLISHED = "Built customer workflows in HubSpot for the onboarding team for 120 customers.";
const RESUME = `Alex Rivera\nCustomer Operations\nExperience\n${SOURCE}\nDocumented the workflow and trained the support team on customer onboarding.\nRan weekly onboarding reviews with account managers and kept the checklist current.`;
const REPORT_ID = "6f1c2b3a-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const REPORT = ResumeFeedbackResponseSchema.parse({
  ...schemaValidReport,
  top_fixes: [{
    ...schemaValidReport.top_fixes[0],
    fix: "Put the HubSpot workflow first in the customer bullet.",
    evidence: { excerpt: SOURCE, section: "Experience" },
  }],
  rewrites: [],
});

async function installClipboard(page: Page) {
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as unknown as { __clipboardCalls: string[] }).__clipboardCalls = calls;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: (text: string) => { calls.push(text); return Promise.resolve(); } },
    });
  });
}

async function openReport(page: Page, polish: (route: Route) => Promise<void>) {
  const requests: unknown[] = [];
  await page.route("**/api/revise-line", async (route) => {
    requests.push(route.request().postDataJSON());
    await polish(route);
  });
  await page.route("**/api/resume-feedback-stream", (route) => route.fulfill({
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
    body: `${JSON.stringify({ type: "complete", ok: true, data: REPORT, report_id: REPORT_ID, report_receipt: null, operation_id: route.request().postDataJSON().recovery_id, free_uses_remaining: 1 })}\n`,
  }));
  await page.goto("/workspace", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  await page.getByRole("button", { name: "Decline analytics", exact: true }).click();
  await page.getByTestId("workspace-paste-mode").click();
  await page.getByTestId("workspace-resume-text").fill(RESUME);
  await page.getByTestId("workspace-run-report").click();
  const miss = page.getByTestId("critical-miss");
  await expect(miss).toBeVisible({ timeout: 30_000 });
  const questions = miss.getByTestId("lift-question");
  await questions.first().locator("input").fill(ANSWER);
  for (let index = (await questions.count()) - 1; index > 0; index -= 1) {
    await questions.nth(index).getByRole("button", { name: "I don't know", exact: true }).click();
  }
  // The literal line is there at once, before any polish.
  await expect(miss.getByTestId("revised-line")).toHaveText(LITERAL);
  return { miss, requests };
}

test("a polished line that passes the guard replaces the literal one, and the exact words stay one click away", async ({ page }) => {
  await installClipboard(page);
  const { miss, requests } = await openReport(page, (route) => route.fulfill({ json: { ok: true, line: POLISHED } }));
  await expect(miss.getByTestId("revised-line")).toHaveText(POLISHED);
  expect(requests).toEqual([{ context: { reportId: REPORT_ID }, excerpt: SOURCE, line: SOURCE, answers: [ANSWER] }]);
  await expect(miss).toContainText("Every word is from your resume or your answers.");
  await miss.getByRole("button", { name: "Copy", exact: true }).click();
  await miss.getByRole("button", { name: "Use my exact words", exact: true }).click();
  await expect(miss.getByTestId("revised-line")).toHaveText(LITERAL);
  await miss.getByRole("button", { name: "Copy", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { __clipboardCalls: string[] }).__clipboardCalls)).toEqual([POLISHED, LITERAL]);
  await miss.getByRole("button", { name: "Use the smoothed line", exact: true }).click();
  await expect(miss.getByTestId("revised-line")).toHaveText(POLISHED);
});

test("a polished line that adds a word the candidate never gave is ignored; the literal line stays", async ({ page }) => {
  const { miss, requests } = await openReport(page, (route) => route.fulfill({
    json: { ok: true, line: "Built customer workflows in HubSpot for the onboarding team, significantly helping 120 customers." },
  }));
  await expect.poll(() => requests.length).toBe(1);
  await page.waitForTimeout(500);
  await expect(miss.getByTestId("revised-line")).toHaveText(LITERAL);
  await expect(miss.getByRole("button", { name: "Use my exact words", exact: true })).toHaveCount(0);
});

test("a failed polish is silent: the literal line stays and nothing reports an error", async ({ page }) => {
  const { miss, requests } = await openReport(page, (route) => route.fulfill({ status: 500, body: "" }));
  await expect.poll(() => requests.length).toBe(1);
  await page.waitForTimeout(500);
  await expect(miss.getByTestId("revised-line")).toHaveText(LITERAL);
  await expect(miss.getByRole("alert")).toHaveCount(0);
  await expect(miss.getByRole("button", { name: "Copy", exact: true })).toBeEnabled();
});
