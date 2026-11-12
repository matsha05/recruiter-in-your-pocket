import { expect, test } from "@playwright/test";
import { installSignedInSession } from "./signed-in-session";

// A resume kept on file for posting reads (Nov 11, 2026): a pass holder who opens a posting read from a saved
// report gets the resume filled in when the one on file is the one that report was written on, and can remove it.

const REPORT_ID = "6f1c2b3a-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const RESUME = "Alex Rivera\nCustomer Operations\nExperience\nBuilt customer workflows in HubSpot for 120 customers.\nDocumented the workflow and trained the support team on customer onboarding.\nRan weekly onboarding reviews with the sales team and cut handoff time from five days to two.";
const PASS = { id: "pass-1", tier: "job_search_pass", uses_remaining: 3, expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString(), created_at: new Date().toISOString(), revoked_at: null };

async function open(page: import("@playwright/test").Page, onFile: Record<string, unknown>) {
  await installSignedInSession(page, { freeUsesLeft: 0, passes: [PASS] });
  let removed = false;
  await page.route("**/api/user/default-resume**", async (route) => {
    if (route.request().method() === "DELETE") { removed = true; return route.fulfill({ json: { success: true } }); }
    if (route.request().method() === "POST") return route.fulfill({ json: { success: true, data: {} } });
    return route.fulfill({ json: { success: true, data: onFile } });
  });
  await page.goto(`/workspace?posting=${REPORT_ID}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  const decline = page.getByRole("button", { name: "Decline analytics", exact: true });
  if (await decline.isVisible().catch(() => false)) await decline.click();
  return { wasRemoved: () => removed };
}

test("a posting read from a saved report fills in the resume kept on file, and it can be removed", async ({ page }) => {
  const state = await open(page, { hasResume: true, resumeText: RESUME, resumeFilename: "alex-rivera.pdf", matchesReport: true });
  const notice = page.getByTestId("resume-on-file");
  await expect(notice).toHaveAttribute("data-state", "loaded");
  await expect(notice).toContainText("We filled in the resume you keep on file.");
  await expect(page.getByTestId("workspace-job-description")).toBeVisible();
  // The card shows the resume as a file instead of asking for one, and the line under the button says the read is included.
  await expect(page.getByText("alex-rivera.pdf")).toBeVisible();
  await expect(page.getByText("Add your resume.")).toHaveCount(0);
  await expect(page.getByText("Paste the posting and this read is included with your pass.")).toBeVisible();
  await expect(page.getByText("Another report needs a Job Search Pass")).toHaveCount(0);
  await page.getByTestId("workspace-job-description").fill("Customer Operations Manager. Requirements: HubSpot workflows, onboarding programs for B2B customers, weekly reporting to sales leadership.");
  await expect(page.getByText("Included with your pass. This one doesn't use a report.")).toBeVisible();
  await page.getByTestId("resume-on-file-remove").click();
  await expect(notice).toHaveAttribute("data-state", "removed");
  expect(state.wasRemoved()).toBe(true);
});

test("a resume kept without a file name still shows as the resume on file", async ({ page }) => {
  await open(page, { hasResume: true, resumeText: RESUME, resumeFilename: null, matchesReport: true });
  await expect(page.getByTestId("resume-on-file")).toHaveAttribute("data-state", "loaded");
  await expect(page.getByText("Your resume on file", { exact: true })).toBeVisible();
  await expect(page.getByText("Add your resume.")).toHaveCount(0);
  // Reading a different resume clears the field; the copy on file is not touched.
  await page.getByRole("button", { name: "Use a different resume" }).click();
  await expect(page.getByTestId("resume-on-file")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Choose a file" })).toBeVisible();
});

test("a resume on file that isn't the one the report was written on is not filled in", async ({ page }) => {
  await open(page, { hasResume: true, resumeText: RESUME, resumeFilename: "alex-rivera.pdf", matchesReport: false });
  await expect(page.getByTestId("workspace-posting-read-help")).toContainText("Add the resume that report was written on");
  await expect(page.getByTestId("resume-on-file")).toHaveCount(0);
});

test("with nothing on file, the person adds the resume and is offered to keep it", async ({ page }) => {
  await open(page, { hasResume: false });
  await expect(page.getByTestId("workspace-posting-read-help")).toBeVisible();
  await page.getByTestId("workspace-paste-mode").click();
  await page.getByTestId("workspace-resume-text").fill(RESUME);
  const notice = page.getByTestId("resume-on-file");
  await expect(notice).toContainText("Keep this resume on file");
  await page.getByTestId("resume-on-file-keep").click();
  await expect(notice).toHaveAttribute("data-state", "kept");
  await expect(notice).toContainText("until you remove it");
});
