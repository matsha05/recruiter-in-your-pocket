import { expect, test, type Page } from "@playwright/test";
import { ResumeFeedbackResponseSchema } from "../../lib/validation/schemas";
import { schemaValidReport } from "../helpers/report-fidelity-fixture";

const JOB_A = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Program Manager A",
  company: "Company A",
  jobDescription: "Lead cross-functional programs, coordinate launches, improve operations, and communicate progress to stakeholders.",
};
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

// These tests run against the production-default build, where the extension is held back.
// Enabled saved-job lifecycle cases live in workspace-handoffs.spec.ts, whose component
// harness explicitly sets extensionSync and its allowed origin without changing this build.
test.describe("launch workspace keeps extension context held back", () => {
  for (const [name, query] of [
    ["saved-job links", `job=${JOB_A.id}`],
    ["local extension captures", new URLSearchParams({ source: "extension-local", title: JOB_A.title, company: JOB_A.company, jd: JOB_A.jobDescription }).toString()],
  ]) {
    test(`${name} load no context and still allow a manually entered posting`, async ({ page }) => {
      await mockFreeStatus(page);
      let contextRequests = 0;
      await page.route("**/api/extension/**", (route) => {
        contextRequests += 1;
        return route.fulfill({ json: { success: true, data: JOB_A } });
      });
      await page.route("**/api/user/default-resume**", (route) => {
        contextRequests += 1;
        return route.fulfill({ json: { success: true, data: { resumeText: "An old saved resume" } } });
      });
      const submissions: Array<{ savedJobId?: string; jobDescription?: string }> = [];
      await page.route("**/api/resume-feedback-stream", async (route) => {
        const body = route.request().postDataJSON();
        submissions.push(body);
        await route.fulfill({
          headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
          body: `${JSON.stringify({ type: "complete", ok: true, data: COMPLETE_REPORT, report_id: null, report_receipt: null, operation_id: body.recovery_id, free_uses_remaining: 1 })}\n`,
        });
      });

      await page.goto(`/workspace?${query}`);
      await expect(page.getByTestId("workspace-run-report")).toBeVisible();
      await expect(page.getByText(JOB_A.title, { exact: true })).toHaveCount(0);
      await page.getByTestId("workspace-role-toggle").click();
      await expect(page.getByTestId("workspace-job-description")).toHaveValue("");
      const manualPosting = "Lead launch programs and coordinate product, operations, and support teams.";
      await page.getByTestId("workspace-job-description").fill(manualPosting);
      await pasteAndRun(page);
      expect(submissions).toHaveLength(1);
      expect(submissions[0].savedJobId).toBeUndefined();
      expect(submissions[0].jobDescription).toBe(manualPosting);
      expect(contextRequests, "held-back entry links must never fetch saved context or overwrite candidate input").toBe(0);
    });
  }
});
