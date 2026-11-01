import { expect, test, type Page } from "@playwright/test";

// The wait for a first report on a phone: the progress screen opens where its
// controls are, and stopping tells a signed-out visitor something they can check.

const RESUME_TEXT = [
  "Alex Rivera",
  "Program Manager, Northwind Analytics",
  "Led cross-functional launches with product, operations, and support teams.",
  "Built review cadences and improved launch checklists across four regions.",
  "Coordinated stakeholder updates and clarified ownership across teams.",
].join("\n");

async function openWorkspaceAsGuest(page: Page) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) await page.route(`${new URL(supabaseUrl).origin}/**`, (route) => route.fulfill({ status: 401, json: { message: "Auth session missing" } }));
  await page.route("**/api/free-status", (route) => route.fulfill({ json: { ok: true, free_uses_left: 1 } }));
  // The report never arrives, so the progress screen stays up until Stop.
  await page.route("**/api/resume-feedback-stream", () => undefined);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/workspace");
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toBeVisible({ timeout: 30_000 });
  // On a phone the privacy choices sit over the form until answered.
  await page.getByRole("button", { name: "Decline analytics" }).click();
  await page.getByTestId("workspace-paste-mode").click();
  await page.getByTestId("workspace-resume-text").fill(RESUME_TEXT);
}

test("on a phone, the progress screen opens at its heading with Stop in view", async ({ page }) => {
  await openWorkspaceAsGuest(page);
  const run = page.getByTestId("workspace-run-report");
  await run.scrollIntoViewIfNeeded();
  await run.click();

  const heading = page.getByRole("heading", { name: "Reading your resume like a recruiter would." });
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport();
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeInViewport();
});

test("stopping a signed-out run points to the free report, not My reports", async ({ page }) => {
  await openWorkspaceAsGuest(page);
  await page.getByTestId("workspace-run-report").click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();

  const toast = page.locator("[data-sonner-toast]").filter({ hasText: "Report stopped" });
  await expect(toast).toHaveCount(1);
  await expect(toast).toContainText("your free report");
  await expect(toast).not.toContainText("My reports");
  await expect(page.getByText("Your first report is included")).toBeVisible();
});
