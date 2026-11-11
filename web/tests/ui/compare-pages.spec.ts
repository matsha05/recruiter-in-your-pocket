import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The comparison pages (components/compare/comparisons.tsx): every one opens with the two names and
// the straight answer, quotes the other tool's own pricing page as a source, says how we compare,
// and cites the research behind its "Is X worth it?" claim through the hub.

const comparePages = [
  "/compare/topresume",
  "/compare/jobscan",
  "/compare/resume-worded",
  "/compare/teal",
  "/compare/kickresume",
  "/compare/rezi",
  "/compare/enhancv",
] as const;

async function expectNoSeriousAxeViolations(page: import("@playwright/test").Page, route: string) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
  expect(blocking, `${route}: ${JSON.stringify(blocking, null, 2)}`).toEqual([]);
}

test.describe("comparison pages", () => {
  test("the hub lists every comparison, says how we compare, and has no serious a11y violations", async ({ page }) => {
    await page.goto("/compare", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-visual-anchor='comparison-hub']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Resume review tools compared");
    const table = page.getByRole("table");
    for (const route of comparePages) {
      await expect(table.locator(`a[href="${route}"]`)).toHaveCount(1);
    }
    // The question people ask the engines, answered honestly: builder, scanner, or a recruiter's read, with the report's limits.
    const whichTool = page.locator("#which-tool");
    await expect(whichTool.getByRole("heading", { level: 2 })).toHaveText("Which resume tool should I use?");
    for (const phrase of ["you need a builder", "you need a keyword scanner", "you need a recruiter’s read", "The report’s limits", "no keyword score and no interview odds", "ran one resume through five of these tools and ours", "one resume, one role, one day"]) {
      await expect(whichTool).toContainText(phrase);
    }
    await expect(whichTool.locator('a[href^="/research/"]')).toHaveCount(2);
    // The hub names the five tools the same resume went through, dated, and the two it hasn't.
    await expect(page.locator("#how-we-compare")).toContainText("On November 5, 2026 we also ran one resume");
    await expect(page.locator("#how-we-compare")).toContainText("TopResume and Enhancv haven’t been run on the same resume yet");
    await expectNoSeriousAxeViolations(page, "/compare");
  });

  for (const route of comparePages) {
    test(`${route} quotes the tool's own prices, links the research, and has no serious a11y violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("[data-visual-anchor='comparison']")).toBeVisible();
      // The search title is the query; the h1 is the hook (docs/copy-system.md §8).
      await expect(page).toHaveTitle(/ vs Recruiter in Your Pocket/);
      await expect(page.getByRole("heading", { level: 1 })).not.toContainText("vs Recruiter in Your Pocket");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(/\S{3,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.recruiterinyourpocket.com${route}`);

      // The side-by-side table has both columns, and the price row is there.
      const table = page.getByRole("table");
      await expect(table.getByRole("columnheader", { name: "Recruiter in Your Pocket" })).toBeVisible();
      await expect(table.getByRole("rowheader", { name: "Price" })).toBeVisible();

      // The other tool's pricing page is the source, read on the stated date.
      await expect(page.locator('section:has(#sources-title) a[href^="https://"]').first()).toBeVisible();
      await expect(page.locator("header").filter({ hasText: /prices read on/i })).toHaveCount(1);
      // Five pages carry what the tool and ours said to the same resume, dated; the two not yet run say so.
      const method = page.locator("#how-we-compare");
      if (route === "/compare/topresume" || route === "/compare/enhancv") {
        await expect(method).toContainText("haven’t run");
        await expect(method).toContainText("on the same resume");
      } else {
        await expect(method).toContainText("On November 5, 2026 we ran the same resume and the same job posting through");
        await expect(method).toContainText("Ours led with the resume’s own numbers");
        await expect(method).toContainText("not a verdict on which is better");
      }

      // "Is X worth it?" cites the research behind its claim, resolved through the hub.
      const worthIt = page.locator("#worth-it");
      await expect(worthIt.getByRole("heading", { level: 2 })).toContainText("worth it?");
      await expect(worthIt.locator('a[href^="/research/"]').first()).toBeVisible();

      // The bridge sends readers to the sample report and the free report, never a signup wall.
      await expect(page.getByRole("link", { name: "See a complete report on a fictional resume" })).toHaveAttribute("href", "/sample-report");
      await expect(page.locator('a[data-analytics-cta="compare_close"]')).toHaveAttribute("href", "/workspace");

      await expectNoSeriousAxeViolations(page, route);
    });
  }
});
