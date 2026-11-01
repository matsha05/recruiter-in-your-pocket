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

test("the wait shows the stage the stream reports and the time elapsed, never a timed step", async ({ page }) => {
  await page.addInitScript(() => {
    const realFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (!url.includes("/api/resume-feedback-stream")) return realFetch(input, init);
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        start(controller) {
          (window as unknown as { pushStage: (stage: string) => void }).pushStage = (stage) =>
            controller.enqueue(encoder.encode(`${JSON.stringify({ type: "stage", stage })}\n`));
          controller.enqueue(encoder.encode(`${JSON.stringify({ type: "meta", attempt_consumed: false })}\n`));
        },
      });
      return Promise.resolve(new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } }));
    };
  });
  await openWorkspaceAsGuest(page);
  await page.unroute("**/api/resume-feedback-stream");
  await page.getByTestId("workspace-run-report").click();

  const stages = page.getByTestId("analysis-stages");
  const current = stages.locator("[aria-current='step']");
  await expect(current).toContainText("Send your resume");
  await page.waitForTimeout(1500);
  // Time alone never advances a step.
  await expect(current).toContainText("Send your resume");
  await expect(page.getByTestId("analysis-elapsed")).toContainText(/0:0[1-9] elapsed/);

  const push = (stage: string) => page.evaluate((s) => (window as unknown as { pushStage: (stage: string) => void }).pushStage(s), stage);
  await push("reading");
  await expect(current).toContainText("Read your resume");
  await push("writing");
  await expect(current).toContainText("Write your report");
  await expect(stages.locator("li[data-state='done']")).toHaveCount(2);
  await expect(page.getByRole("status").filter({ hasText: "Writing your report." })).toBeAttached();
  await push("checking");
  await expect(current).toContainText("Check every quote");
});
