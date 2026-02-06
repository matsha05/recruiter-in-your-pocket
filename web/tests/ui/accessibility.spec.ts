import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/pricing",
  "/workspace",
  "/auth",
  "/settings/account",
  "/settings/billing",
  "/trust",
  "/security",
  "/privacy",
  "/terms",
  "/methodology",
  "/research",
  "/guides",
  "/faq",
  "/purchase/restore",
];

test.describe("a11y baseline", () => {
  for (const route of routes) {
    test(`axe has no serious violations on ${route}`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("body", { timeout: 30_000 });
      await page.waitForTimeout(500);

      const results = await new AxeBuilder({ page }).analyze();
      const blockingViolations = results.violations.filter((violation) =>
        violation.impact === "critical" || violation.impact === "serious"
      );

      expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
    });
  }
});
