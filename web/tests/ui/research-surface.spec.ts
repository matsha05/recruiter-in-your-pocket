import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { hubEntryForHref } from "../../components/research/ResearchHubData";

const articles = [
  "/research/ats-myths",
  "/research/automation-and-bias",
  "/research/how-recruiters-read",
  "/methodology",
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
  "/research/who-you-are",
  "/research/gaps-and-pivots",
  "/research/writing-quality-hire-probability",
] as const;

const redirects = [
  ["/research/structured-interviews-why-star", "/research/star-method"],
  ["/research/automation-filter-points", "/research/automation-and-bias"],
  ["/research/bias-limits-optimization", "/research"],
  ["/research/hiring-discrimination-meta-analysis", "/research"],
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

        expect(audit.bodyFont, route).toContain("Schibsted Grotesk");
        expect(audit.headingFont, route).toContain("Schibsted Grotesk");
        expect(audit.overflow, route).toBeLessThanOrEqual(1);
        expect(audit.unlabeledFigures, route).toBe(0);
        expect(audit.uncaptionedFigures, route).toBe(0);
      }
    });
  }

  test("legacy research URLs return permanent redirects to their canonical destination", async ({ page, request }) => {
    for (const [from, to] of redirects) {
      const redirect = await request.get(from, { maxRedirects: 0 });
      expect(redirect.status(), from).toBe(308);
      expect(new URL(redirect.headers()["location"], "http://riyp.test").pathname, from).toBe(to);

      await page.goto(from, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`${to.replaceAll("/", "\\/")}/?$`));
      await expect(page.locator(`[data-visual-anchor='${to === "/research" ? "research-hub" : "research-article"}']`)).toBeVisible();
    }
  });

  test("the retired extension result permanently resolves to the active product", async ({ request }) => {
    const response = await request.get("/extension", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers()["location"], "http://riyp.test").pathname).toBe("/workspace");
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

  test("the report links each part of the score to the research behind it", async ({ page, request }) => {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/sample-report", { waitUntil: "domcontentloaded" });
      const receipts = page.getByTestId("research-receipts");
      await expect(receipts).toBeVisible();
      const links = receipts.locator("a");
      await expect(links).toHaveCount(5);
      for (const link of await links.all()) {
        const href = await link.getAttribute("href");
        expect(href).toMatch(/^\/(research\/[a-z-]+|methodology)$/);
        await expect(link).toHaveAttribute("target", "_blank");
        expect((await request.get(href ?? "")).status(), `${href}`).toBe(200);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });

  test("every article's rendered opening starts with its hub verdict", async ({ page }) => {
    test.setTimeout(120_000);
    for (const route of articles.filter((candidate) => candidate.startsWith("/research/"))) {
      const entry = hubEntryForHref(route);
      expect(entry?.verdict, route).toBeTruthy();
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const opening = (await page.getByTestId("article-answer").innerText()).replace(/\s+/g, " ").trim();
      expect(opening, route).toMatch(new RegExp(`^${entry!.verdict!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`));
      expect(opening.split(" ").length, `${route}: ${opening}`).toBeLessThanOrEqual(35);
    }
  });

  test("each article's method note leads to how we write the research", async ({ page }) => {
    await page.goto("/research/how-recruiters-read", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "The longer version" }).click();
    await expect(page).toHaveURL(/\/methodology#how-we-write-research$/);
    await expect(page.getByRole("heading", { name: "How we write the research" })).toBeVisible();
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
