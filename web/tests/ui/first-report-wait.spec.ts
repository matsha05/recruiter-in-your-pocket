import { expect, test, type Page } from "@playwright/test";

// The wait for a first report on a phone (W2, Nov 2026): the screen opens at its heading, clear of the
// sticky header, with the clock, the five stages, the person's own resume on the sheet and Stop in view.
// The pen and the chips move only when the stream reports a stage, never on elapsed time.

const RESUME_TEXT = [
  "Alex Rivera",
  "Program Manager, Northwind Analytics",
  "",
  "EXPERIENCE",
  "Led cross-functional launches with product, operations, and support teams.",
  "Built review cadences and improved launch checklists across four regions.",
  "Coordinated stakeholder updates and clarified ownership across teams.",
  "",
  "EDUCATION",
  "B.S. Business Administration, State University",
].join("\n");

const STAGES = ["Sent", "Reading", "Writing the notes", "Checking every quote"];

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

/** A stream the test drives one stage at a time. */
async function driveStream(page: Page) {
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
  return (stage: string) => page.evaluate((s) => (window as unknown as { pushStage: (stage: string) => void }).pushStage(s), stage);
}

test("on a phone, the progress screen opens at its heading, clear of the header, with the sheet and Stop in view", async ({ page }) => {
  await openWorkspaceAsGuest(page);
  const run = page.getByTestId("workspace-run-report");
  await run.scrollIntoViewIfNeeded();
  await run.click();

  const heading = page.getByRole("heading", { name: "Reading your resume." });
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport({ ratio: 1 });
  // Nothing sticky covers the heading: its top sits below whatever header the route shows.
  const headerBottom = await page.locator("header").first().evaluate((header) => header.getBoundingClientRect().bottom);
  expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(headerBottom);
  await expect(page.getByTestId("analysis-sheet")).toBeInViewport();
  await expect(page.getByTestId("analysis-sheet")).toContainText("Led cross-functional launches");
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeInViewport({ ratio: 1 });
  await expect(page.getByText("usually under two minutes")).toBeVisible();
});

test("stopping a signed-out run points to the free report, not My reports", async ({ page }) => {
  await openWorkspaceAsGuest(page);
  await page.getByTestId("workspace-run-report").click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();

  const toast = page.locator("[data-sonner-toast]").filter({ hasText: "Report stopped" });
  await expect(toast).toHaveCount(1);
  await expect(toast).toContainText("your free report");
  await expect(toast).not.toContainText("My reports");
  await expect(page.getByTestId("workspace-run-report")).toHaveText(/Get your free report/);
});

test("the five chips and the pen follow the stream's stages, never the clock", async ({ page }) => {
  const push = await driveStream(page);

  const stages = page.getByTestId("analysis-stages");
  await expect(stages.getByRole("listitem")).toHaveText(STAGES.map((label) => new RegExp(label.replace("?", "\\?"))));
  const current = stages.locator("[aria-current='step']");
  const sheet = page.getByTestId("analysis-sheet");
  const penLine = sheet.locator("[data-state='current']");
  await expect(current).toContainText("Sent");
  await expect(penLine).toContainText("Alex Rivera");
  await expect(sheet).toHaveAttribute("data-stage", "sending");
  await page.waitForTimeout(1500);
  // Time alone never advances a chip or moves the pen.
  await expect(current).toContainText("Sent");
  await expect(penLine).toContainText("Alex Rivera");
  await expect(page.getByTestId("analysis-elapsed")).toContainText(/0:0[1-9] · usually under two minutes/);

  await push("reading");
  await expect(current).toContainText("Reading");
  await expect(sheet).toHaveAttribute("data-stage", "reading");
  await expect(penLine).toContainText("Program Manager");
  await push("writing");
  await expect(current).toContainText("Writing the notes");
  await expect(stages.locator("li[data-state='done']")).toHaveCount(2);
  await expect(page.getByRole("status").filter({ hasText: "Writing the notes." })).toBeAttached();
  await expect(penLine).toContainText("Built review cadences");
  await push("checking");
  await expect(current).toContainText("Checking every quote");
  await expect(penLine).toContainText("Coordinated stakeholder updates");
  await expect(stages.locator("li[data-state='done']")).toHaveCount(3);
});

test("with reduced motion the sheet is static and still shows the stage", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const push = await driveStream(page);
  const sheet = page.getByTestId("analysis-sheet");
  await expect(sheet).toBeVisible();
  await push("writing");
  await expect(sheet.locator("[data-state='current']")).toContainText("Built review cadences");
  expect(Number.parseFloat(await sheet.locator("[data-state='current']").evaluate((line) => getComputedStyle(line).transitionDuration))).toBeLessThan(0.01);
});
