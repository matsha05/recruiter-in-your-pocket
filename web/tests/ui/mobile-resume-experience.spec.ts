import { expect, test } from "@playwright/test";

for (const width of [320, 390]) {
  test.describe(`resume experience at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, contextOptions: { reducedMotion: "reduce" } });

    test("file selection and the next step fit together, and paste/job inputs keep their behavior", async ({ page }) => {
      await page.goto("/workspace", { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);

      const chooseFile = page.getByRole("button", { name: "Choose a file", exact: true });
      const run = page.getByTestId("workspace-run-report");
      const chooseBounds = await chooseFile.boundingBox();
      const runBounds = await run.boundingBox();
      expect(chooseBounds!.height).toBeGreaterThanOrEqual(44);
      expect(runBounds!.y + runBounds!.height).toBeLessThanOrEqual(844);
      await expect(run).toBeDisabled();

      // Exercise the real chooser without selecting or transmitting a file.
      const chooserPromise = page.waitForEvent("filechooser");
      await chooseFile.click();
      await (await chooserPromise).setFiles([]);

      await page.getByTestId("workspace-paste-mode").click();
      const resume = page.getByTestId("workspace-resume-text");
      await expect(resume).toBeFocused();
      const draft = "Alex Morgan\nExperience\n" + "Led onboarding and documented the launch process. ".repeat(35);
      await resume.fill(draft);
      await expect(run).toBeEnabled();
      await expect(run).toContainText("Get my report");

      const jobToggle = page.getByTestId("workspace-role-toggle");
      await jobToggle.click();
      const job = page.getByRole("textbox", { name: "Job posting", exact: true });
      await expect(job).toBeVisible();
      await job.fill("Program Manager: coordinate launches and improve onboarding.");
      await jobToggle.click();
      await expect(job).toBeHidden();
      await jobToggle.click();
      await expect(job).toHaveValue("Program Manager: coordinate launches and improve onboarding.");
      await expect(resume).toHaveValue(draft);
    });

    test("advice appears early and section jumps stay below the compact navigation", async ({ page }) => {
      await page.goto("/sample-report", { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);

      const opening = page.getByRole("heading", { level: 1 });
      const openingBounds = await opening.boundingBox();
      expect(openingBounds!.y).toBeLessThan(300);
      expect(openingBounds!.width).toBeGreaterThanOrEqual(width - 36);
      await expect(page.getByText("Clarity summary: 78/100", { exact: true })).toBeVisible();

      const nav = page.getByRole("navigation", { name: "Resume report sections" });
      const buttons = await nav.getByRole("button").all();
      const bounds = await Promise.all(buttons.map((button) => button.boundingBox()));
      expect(bounds).toHaveLength(4);
      for (const box of bounds) {
        expect(box!.height).toBeGreaterThanOrEqual(44);
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(Math.abs(box!.y - bounds[0]!.y)).toBeLessThan(1);
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }

      for (const [label, section] of [["Fix these first", "section-fixes"], ["Role fit", "section-role"], ["Overview", "section-first-impression"]]) {
        const button = nav.getByRole("button", { name: label, exact: true });
        await button.click();
        await expect(button).toHaveAttribute("aria-current", "location");
        const heading = page.locator(`#${section}`).getByRole("heading").first();
        await expect(heading).toBeInViewport();
        // The selected section changes before the mobile scroll has settled.
        await expect.poll(async () => {
          const headingBounds = await heading.boundingBox();
          const navBounds = await nav.boundingBox();
          return headingBounds!.y - navBounds!.y - navBounds!.height;
        }, { message: `${label} should finish below the sticky section navigation` }).toBeGreaterThanOrEqual(0);
      }
    });
  });
}
