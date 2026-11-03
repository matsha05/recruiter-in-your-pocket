import { expect, test, type Page } from "@playwright/test";
import { schemaValidReport } from "../helpers/report-fidelity-fixture";
import { ResumeFeedbackResponseSchema } from "../../lib/validation/resume-report-schema";
import { installSignedInSession } from "./signed-in-session";

// W3 (Nov 2026): the answer you can keep. The guard names the word it objects to and never suggests
// adding something untrue; a signed-in report leads with "Save this version"; the answers and the
// chosen line stay with a saved report and come back on another device.

const SOURCE = "Built customer workflows in HubSpot for 120 customers.";
const ANSWER = "for the onboarding team";
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

async function runReport(page: Page, options: { signedIn: boolean; reportId?: string; receipt?: string }) {
  if (options.signedIn) await installSignedInSession(page, { freeUsesLeft: 1 });
  else {
    await page.route("**/auth/v1/user", (route) => route.fulfill({ status: 401, json: { message: "Auth session missing" } }));
    await page.route("**/api/free-status", (route) => route.fulfill({ json: { ok: true, free_uses_left: 1 } }));
  }
  await page.route("**/api/revise-line", (route) => route.fulfill({ status: 500, body: "" }));
  await page.route("**/api/resume-feedback-stream", (route) => route.fulfill({
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
    body: `${JSON.stringify({ type: "complete", ok: true, data: REPORT, report_id: options.reportId ?? null, report_receipt: options.receipt ?? null, operation_id: route.request().postDataJSON().recovery_id, free_uses_remaining: 0 })}\n`,
  }));
  await page.goto("/workspace", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  const decline = page.getByRole("button", { name: "Decline analytics", exact: true });
  if (await decline.isVisible().catch(() => false)) await decline.click();
  await page.getByTestId("workspace-paste-mode").click();
  await page.getByTestId("workspace-resume-text").fill(RESUME);
  await page.getByTestId("workspace-run-report").click();
  const miss = page.getByTestId("critical-miss");
  await expect(miss).toBeVisible({ timeout: 30_000 });
  return miss;
}

async function answerFirstQuestion(miss: ReturnType<Page["getByTestId"]>) {
  const questions = miss.getByTestId("lift-question");
  await questions.first().locator("input").fill(ANSWER);
  for (let index = (await questions.count()) - 1; index > 0; index -= 1) {
    await questions.nth(index).getByRole("button", { name: "I don't know", exact: true }).click();
  }
  await expect(miss.getByRole("button", { name: "Copy", exact: true })).toBeEnabled();
}

test("the guard names the word it objects to, in the person's words, and ends with the if-it's-true clause", async ({ page }) => {
  const miss = await runReport(page, { signedIn: false });
  await answerFirstQuestion(miss);
  await miss.getByRole("button", { name: "Edit", exact: true }).click();
  const edit = miss.getByLabel("Edit your revised line");
  await edit.fill(`${await edit.inputValue()} Saved 999 hours.`);
  await miss.getByRole("button", { name: "Done", exact: true }).click();
  await expect(miss.getByRole("button", { name: "Copy", exact: true })).toBeDisabled();
  const note = miss.locator("p[aria-live='polite']");
  await expect(note).toContainText("999");
  await expect(note).toContainText("isn't in your line or your answers");
  await expect(note).toContainText("if it's true");
  await expect(note).not.toContainText("This changes a detail from your resume");
});

test("a signed-in report ends with Save this version, the re-check second, and no $29 button", async ({ page }) => {
  // A report with a receipt and no id is the one a signed-in person can still save (needsReceiptValidatedSave).
  const miss = await runReport(page, { signedIn: true, receipt: "receipt-for-this-report" });
  await answerFirstQuestion(miss);
  const ending = page.getByTestId("report-save-version");
  await expect(ending).toContainText("Save this version");
  await expect(ending.getByTestId("report-save-version-button")).toHaveText("Save this version");
  await expect(ending.getByRole("button", { name: /Compare my revision/ })).toBeVisible();
  await expect(ending).not.toContainText("$29");
  await expect(page.getByTestId("post-report-purchase-decision")).toHaveCount(0);

  const saves: unknown[] = [];
  await page.route("**/api/reports", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    saves.push(route.request().postDataJSON());
    await route.fulfill({ json: { ok: true, reportId: REPORT_ID } });
  });
  await ending.getByTestId("report-save-version-button").click();
  await expect.poll(() => saves.length).toBe(1);
});

test("answers and the chosen line are stored with a signed-in report once they check out", async ({ page }) => {
  const stored: unknown[] = [];
  await page.route(`**/api/reports/${REPORT_ID}/answers`, async (route) => {
    stored.push(route.request().postDataJSON());
    await route.fulfill({ json: { ok: true } });
  });
  const miss = await runReport(page, { signedIn: true, reportId: REPORT_ID });
  await answerFirstQuestion(miss);
  await expect.poll(() => stored.length, { timeout: 10_000 }).toBeGreaterThan(0);
  expect(stored.at(-1)).toMatchObject({
    fix_index: 0,
    line: `${SOURCE.replace(/\.$/u, "")}: ${ANSWER}.`,
    source: "literal",
    answers: expect.arrayContaining([expect.objectContaining({ kind: "open", text: ANSWER })]),
  });
});

test("a saved report reopened elsewhere shows the stored answer, its line and Addressed", async ({ page }) => {
  await installSignedInSession(page, { freeUsesLeft: 0 });
  const question = "What was the customer count?";
  await page.route(`**/api/reports/${REPORT_ID}`, (route) => route.fulfill({ json: {
    ok: true,
    report: { ...REPORT, report_id: REPORT_ID, top_fixes: [{ ...REPORT.top_fixes[0], why: undefined }] },
    jdPreview: null,
    targetRole: null,
    line_answers: [{ fix_index: 0, answers: [{ question: "What would you add to this line?", kind: "open", text: ANSWER }, { question, kind: "unknown" }], line: `${SOURCE.replace(/\.$/u, "")}: ${ANSWER}.`, source: "literal" }],
  } }));
  await page.goto(`/reports/${REPORT_ID}`, { waitUntil: "domcontentloaded" });
  const miss = page.getByTestId("critical-miss");
  await expect(miss).toBeVisible({ timeout: 30_000 });
  await expect(miss.getByTestId("revised-line")).toContainText(ANSWER);
  await expect(miss.getByRole("button", { name: "Copy", exact: true })).toBeEnabled();
  await expect(miss).toContainText("Addressed");
  // A saved report has no Save to offer; the re-check leads.
  await expect(page.getByTestId("report-save-version")).toHaveCount(0);
  await expect(page.getByTestId("report-next-step").getByRole("button", { name: /Compare my revision/ })).toBeVisible();
});
