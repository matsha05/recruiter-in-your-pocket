import { expect, test, type Page, type Route } from "@playwright/test";
import { ResumeFeedbackResponseSchema } from "../../lib/validation/schemas";
import { schemaValidReport } from "../helpers/report-fidelity-fixture";

const JOB_A = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Program Manager A",
  company: "Company A",
  jobDescription: "Lead cross-functional programs, coordinate launches, improve operations, and communicate progress to stakeholders.",
};
const JOB_B = { ...JOB_A, id: "22222222-2222-4222-8222-222222222222", title: "Program Manager B", company: "Company B" };
const RESUME_TEXT = "Alex Rivera\nProgram Manager\nLed cross-functional launches with product, operations, and support teams. Built review cadences and improved launch checklists. Coordinated stakeholder updates and clarified ownership across teams.";
const COMPLETE_REPORT = ResumeFeedbackResponseSchema.parse(schemaValidReport);

async function mockFreeStatus(page: Page) {
  await page.route("**/api/free-status", (route) => route.fulfill({
    json: { ok: true, free_uses_left: 1, free_uses_remaining: 1 },
  }));
}

async function pasteAndRun(page: Page) {
  await page.getByTestId("workspace-paste-mode").click();
  await page.getByTestId("workspace-resume-text").fill(RESUME_TEXT);
  await page.getByTestId("workspace-run-report").click();
  await expect(page.locator("#section-first-impression h1")).toBeVisible();
}

test.describe("workspace saved-job context", () => {
  test("a saved-job report can be revised without attaching the new report to its old job", async ({ page }) => {
    await mockFreeStatus(page);
    await page.route(`**/api/extension/saved-jobs/${JOB_A.id}`, (route) => route.fulfill({
      json: { success: true, data: JOB_A },
    }));
    const submissions: Array<{ savedJobId?: string; jobDescription?: string; recovery_id?: string }> = [];
    await page.route("**/api/resume-feedback-stream", async (route) => {
      const body = route.request().postDataJSON();
      submissions.push(body);
      await route.fulfill({
        headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
        body: [
          JSON.stringify({ type: "meta", request_id: "job-context-test", access: "free_full", access_tier: "free_full", user: null, has_job_description: Boolean(body.jobDescription), recovery_id: body.recovery_id }),
          JSON.stringify({ type: "complete", ok: true, data: COMPLETE_REPORT, report_id: null, report_receipt: null, recovery_id: body.recovery_id, operation_id: null, free_run_index: 1, free_uses_remaining: 1 }),
          "",
        ].join("\n"),
      });
    });

    await page.goto(`/workspace?job=${JOB_A.id}`);
    await expect(page.getByText(JOB_A.title, { exact: true })).toBeVisible();
    await expect(page.getByTestId("workspace-job-description")).toHaveValue(JOB_A.jobDescription);
    await pasteAndRun(page);
    expect(submissions[0].savedJobId).toBe(JOB_A.id);

    await page.getByRole("button", { name: "Review the revised resume", exact: true }).click();
    await expect(page).toHaveURL(/\/workspace\?revision=1$/);
    await expect(page.getByText(JOB_A.title, { exact: true })).toHaveCount(0);
    await page.getByTestId("workspace-paste-mode").click();
    await expect(page.getByTestId("workspace-resume-text")).toHaveValue("");
    await page.getByTestId("workspace-resume-text").fill(`${RESUME_TEXT}\nRevised with clearer examples.`);
    await expect(page.getByTestId("workspace-run-report")).toContainText("Compare the new read");
    await page.getByTestId("workspace-run-report").click();
    await expect(page.locator("#section-first-impression h1")).toBeVisible();
    expect(submissions).toHaveLength(2);
    expect(submissions[1].savedJobId).toBeUndefined();
    expect(submissions[1].jobDescription).toBeUndefined();
  });

  test("late saved-job replies cannot restore context after client navigation", async ({ page }) => {
    await mockFreeStatus(page);
    let firstRequest: Route | undefined;
    await page.route(`**/api/extension/saved-jobs/${JOB_A.id}`, (route) => { firstRequest = route; });
    await page.route(`**/api/extension/saved-jobs/${JOB_B.id}`, (route) => route.fulfill({
      json: { success: true, data: JOB_B },
    }));

    await page.goto(`/workspace?job=${JOB_A.id}`);
    await expect.poll(() => Boolean(firstRequest)).toBe(true);
    await page.evaluate((jobId) => window.history.pushState(null, "", `/workspace?job=${jobId}`), JOB_B.id);
    await expect(page.getByText(JOB_B.title, { exact: true })).toBeVisible();
    await firstRequest!.fulfill({ json: { success: true, data: JOB_A } });
    await expect(page.getByText(JOB_A.title, { exact: true })).toHaveCount(0);
    await expect(page.getByText(JOB_B.title, { exact: true })).toBeVisible();

    await page.evaluate(() => window.history.pushState(null, "", "/workspace"));
    await expect(page.getByText(JOB_B.title, { exact: true })).toHaveCount(0);
  });
});
