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
    for (const phrase of ["you need a builder", "you need a keyword scanner", "you need a recruiter’s read", "The report’s limits", "no keyword score and no interview odds", "haven’t run these tools and ours on the same resume"]) {
      await expect(whichTool).toContainText(phrase);
    }
    await expect(whichTool.locator('a[href^="/research/"]')).toHaveCount(2);
    await expect(page.locator("#how-we-compare")).toContainText("We haven’t run the other tools and ours on the same resume");
    await expectNoSeriousAxeViolations(page, "/compare");
  });

  for (const route of comparePages) {
    test(`${route} quotes the tool's own prices, links the research, and has no serious a11y violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("[data-visual-anchor='comparison']")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toContainText("vs Recruiter in Your Pocket");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.recruiterinyourpocket.com${route}`);

      // The side-by-side table has both columns, and the price row is there.
      const table = page.getByRole("table");
      await expect(table.getByRole("columnheader", { name: "Recruiter in Your Pocket" })).toBeVisible();
      await expect(table.getByRole("rowheader", { name: "Price" })).toBeVisible();

      // The other tool's pricing page is the source, read on the stated date.
      await expect(page.locator('section:has(#sources-title) a[href^="https://"]').first()).toBeVisible();
      await expect(page.locator("header").filter({ hasText: /prices read on/i })).toHaveCount(1);
      await expect(page.locator("#how-we-compare")).toContainText("on the same resume");

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
