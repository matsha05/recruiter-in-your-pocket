import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const articles = [
  "/research/ats-myths",
  "/research/automation-and-bias",
  "/research/hiring-discrimination-meta-analysis",
  "/research/how-recruiters-read",
  "/research/how-we-score",
  "/research/human-vs-algorithm",
  "/research/linkedin-visibility",
  "/research/quantifying-impact",
  "/research/referral-advantage",
  "/research/resume-length-myths",
  "/research/salary-history-bans",
  "/research/skills-first-promise-reality",
  "/research/social-screening",
  "/research/spelling-errors-impact",
  "/research/star-method",
  "/research/structured-interviews-why-star",
  "/research/writing-quality-hire-probability",
] as const;

const redirects = [
  ["/research/automation-filter-points", "/research/automation-and-bias"],
  ["/research/bias-limits-optimization", "/research/hiring-discrimination-meta-analysis"],
  ["/research/how-people-scan", "/research/how-recruiters-read"],
  ["/research/linkedin-vs-resume", "/research/linkedin-visibility"],
  ["/research/page-two-gate", "/research/resume-length-myths"],
  ["/research/recruiter-search-behavior", "/research/linkedin-visibility"],
  ["/research/referral-advantage-quantified", "/research/referral-advantage"],
  ["/research/resume-error-tax", "/research/spelling-errors-impact"],
  ["/research/salary-anchors", "/research/salary-history-bans"],
  ["/research/signal-vs-clarity", "/research/writing-quality-hire-probability"],
  ["/research/skills-based-hiring", "/research/skills-first-promise-reality"],
] as const;

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 1024, height: 900 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

test.describe("research system", () => {
  for (const viewport of viewports) {
    test(`hub and every article hold the Lifted Line contract at ${viewport.name}`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize(viewport);

      for (const route of ["/research", ...articles]) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.evaluate(() => document.fonts.ready);

        const anchor = route === "/research" ? "research-hub" : "research-article";
        await expect(page.locator(`[data-visual-anchor='${anchor}']`)).toBeVisible();
        await expect(page.locator("header.site-header")).toBeVisible();
        await expect(page.locator("footer")).toBeVisible();

        const audit = await page.evaluate(() => {
          const h1 = document.querySelector("h1");
          const figures = [...document.querySelectorAll("figure")];
          return {
            bodyFont: getComputedStyle(document.body).fontFamily,
            headingFont: h1 ? getComputedStyle(h1).fontFamily : "",
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            unlabeledFigures: figures.filter(
              (figure) => !figure.getAttribute("aria-label") && !figure.getAttribute("aria-labelledby")
            ).length,
            uncaptionedFigures: figures.filter((figure) => !figure.querySelector("figcaption")).length,
          };
        });

        expect(audit.bodyFont, route).toContain("Instrument Sans Variable");
        expect(audit.headingFont, route).toContain("Space Grotesk Variable");
        expect(audit.overflow, route).toBeLessThanOrEqual(1);
        expect(audit.unlabeledFigures, route).toBe(0);
        expect(audit.uncaptionedFigures, route).toBe(0);
      }
    });
  }

  test("legacy research URLs preserve their canonical destination", async ({ page }) => {
    for (const [from, to] of redirects) {
      await page.goto(from, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`${to.replaceAll("/", "\\/")}/?$`));
      await expect(page.locator("[data-visual-anchor='research-article']")).toBeVisible();
    }
  });

  test("hub and every canonical article have no serious accessibility violations", async ({ page }) => {
    test.setTimeout(180_000);

    for (const route of ["/research", ...articles]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const results = await new AxeBuilder({ page }).analyze();
      const blockingViolations = results.violations.filter(
        (violation) => violation.impact === "critical" || violation.impact === "serious"
      );
      expect(blockingViolations, `${route}\n${JSON.stringify(blockingViolations, null, 2)}`).toEqual([]);
    }
  });

  test("hub and every canonical article load without browser errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });

    for (const route of ["/research", ...articles]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("body");
    }

    expect(errors).toEqual([]);
  });
});
