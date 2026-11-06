import { expect, test } from "@playwright/test";
import sampleReport from "../../public/sample-report.json";
import { scoreBandFor } from "../../lib/reports/score-band";

for (const width of [320, 390]) {
  test.describe(`resume experience at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, contextOptions: { reducedMotion: "reduce" } });

    test("file selection and the next step fit together, and paste/job inputs keep their behavior", async ({ page }) => {
      await page.goto("/workspace", { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      // Complete the fresh visitor's privacy choice before this resume journey.
      await page.getByRole("button", { name: "Decline analytics", exact: true }).click();
      await expect(page.getByTestId("privacy-panel")).toBeHidden();

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
      await expect(run).toContainText("Get your free report");

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

    test("a fragment can't start a report, and an upload shows what was read before the run", async ({ page }) => {
      const parsed = ["Alex Morgan", "Experience", "Led onboarding and documented the launch process for three regional teams.",
        "Ran the weekly launch review with product and support, and kept the checklist current.",
        "Trained new account managers on the customer handoff."].join("\n");
      await page.route("**/api/parse-resume", (route) => route.fulfill({ json: { ok: true, text: parsed } }));
      await page.goto("/workspace", { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
      await page.getByRole("button", { name: "Decline analytics", exact: true }).click();

      const run = page.getByTestId("workspace-run-report");
      await page.getByTestId("workspace-paste-mode").click();
      const resume = page.getByTestId("workspace-resume-text");
      await resume.fill("Alex Morgan\nProgram Manager\nLed launches.");
      await expect(run).toBeDisabled();
      await expect(run).toHaveAccessibleName("Add more of your resume to begin");
      await expect(page.getByTestId("workspace-resume-too-short")).toContainText("We need at least 200");
      await expect(resume).toHaveAttribute("aria-describedby", "workspace-resume-length");
      await resume.fill(parsed);
      await expect(run).toBeEnabled();
      await expect(page.getByTestId("workspace-resume-too-short")).toHaveCount(0);

      await page.getByTestId("workspace-upload-mode").click();
      await page.getByLabel("Upload resume file (PDF or DOCX)", { exact: true }).setInputFiles({ name: "alex-morgan.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 mocked") });
      const preview = page.getByTestId("workspace-read-preview");
      await expect(preview).toContainText("What we read");
      await expect(preview).toContainText(`${parsed.split(/\s+/).length} words`);
      await preview.locator("summary").click();
      await expect(preview.getByLabel("Text we read from your file")).toContainText("Ran the weekly launch review");
      await expect(page.getByTestId("workspace-privacy-line")).toContainText("We don’t store the resume or opt it into model training.");
      await expect(page.getByTestId("workspace-privacy-line").getByRole("link", { name: "How we handle your data" })).toHaveAttribute("href", "/privacy");

      await page.getByTestId("workspace-edit-read-text").click();
      await expect(resume).toHaveValue(parsed);
    });

    test("advice appears early and section jumps stay below the compact navigation", async ({ page }) => {
      await page.goto("/sample-report", { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.getByRole("button", { name: "Decline analytics", exact: true }).click();
      await expect(page.getByTestId("privacy-panel")).toBeHidden();

      const opening = page.getByRole("heading", { level: 1 });
      const openingBounds = await opening.boundingBox();
      expect(openingBounds!.y).toBeLessThan(300);
      expect(openingBounds!.width).toBeGreaterThanOrEqual(width - 36);
      await expect(page.getByTestId("score-band")).toContainText(scoreBandFor(sampleReport.score).name);
      await expect(page.getByTestId("score-band")).not.toContainText("/100");

      // The first screen holds the score, the verdict and the write-up's first lines; the cards follow the write-up.
      await expect(page.getByTestId("worklist-score")).toBeInViewport({ ratio: 1 });
      await expect(page.getByTestId("worklist-write-up").locator("p").first()).toBeInViewport({ ratio: 0.3 });
      await expect(page.getByTestId("worklist-report")).not.toContainText("Critical Miss");

      // The section tabs wait until the opening read has scrolled away, then sit under the header.
      const nav = page.getByRole("navigation", { name: "Resume report sections" });
      await expect(nav).toBeHidden();
      await page.locator("#section-fixes").evaluate((section) => {
        window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
      });
      await expect(nav).toBeVisible();
      const buttons = await nav.getByRole("button").all();
      const bounds = await Promise.all(buttons.map((button) => button.boundingBox()));
      // The worklist's three sections: Overview, Line by line, Role fit.
      expect(bounds.length).toBe(3);
      for (const box of bounds) {
        expect(box!.height).toBeGreaterThanOrEqual(44);
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(Math.abs(box!.y - bounds[0]!.y)).toBeLessThan(1);
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }

      for (const [label, section] of [["Lines", "section-fixes"], ["Role fit", "section-role"], ["Overview", "section-first-impression"]]) {
        // By section, through a CSS locator: back at Overview the tabs leave the screen again, and the check still reads them.
        const button = page.locator(`nav[aria-label="Resume report sections"] button[data-section="${section}"]`);
        await expect(button).toHaveAccessibleName(label);
        await button.click();
        await expect(button).toHaveAttribute("aria-current", "location");
        const heading = page.locator(`#${section}`).getByRole("heading").first();
        await expect(heading).toBeInViewport();
        // The selected section changes before the mobile scroll has settled.
        await expect.poll(() => heading.evaluate((element) => {
          const tabs = document.querySelector('nav[aria-label="Resume report sections"]')!.closest("aside")!;
          return element.getBoundingClientRect().top - tabs.getBoundingClientRect().bottom;
        }), { message: `${label} should finish below the sticky section navigation` }).toBeGreaterThanOrEqual(0);
      }
    });
  });
}
