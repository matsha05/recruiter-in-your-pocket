import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicEditorialRoutes = [
  { route: "/resources", canonical: "/resources" },
  { route: "/resources/offer-negotiation", canonical: "/resources/offer-negotiation" },
  { route: "/resources/tech-offer-negotiation", canonical: "/resources/tech-offer-negotiation" },
  { route: "/resources/tools/comp-calculator", canonical: "/resources/tools/comp-calculator" },
] as const;

test.describe("editorial resources", () => {
  for (const { route, canonical } of publicEditorialRoutes) {
    test(`${route} has canonical metadata, a complete page ending, and no serious a11y violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${canonical.replaceAll("/", "\\/")}$`));

      const results = await new AxeBuilder({ page }).analyze();
      const blocking = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
      expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    });
  }

  test("calculator preserves a 0% vesting year and reflows without horizontal panning", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/resources/tools/comp-calculator", { waitUntil: "domcontentloaded" });
    await page.locator('[data-calculator-hydrated="true"]').waitFor();

    await page.getByLabel("Guaranteed annual base").fill("100000");
    await page.getByLabel("Annual target bonus").fill("10");
    await page.getByLabel("Equity grant value").fill("100000");
    await page.getByRole("button", { name: /Vesting/ }).click();
    await page.getByLabel("Year 1 %").fill("0");
    await page.getByLabel("Year 2 %").fill("33");
    await page.getByLabel("Year 3 %").fill("33");
    await page.getByLabel("Year 4 %").fill("34");

    const offer = page.locator('section[aria-label="Offer 1 details"]');
    await expect(offer.getByText("$540,000", { exact: true })).toBeVisible();
    await expect(page.locator('aside[aria-label="Modeled comparison"]')).toContainText("It is not a recommendation");
    await expect(page.locator("table")).toBeHidden();
    await expect(
      page.locator('section[aria-labelledby="year-breakdown-title"]')
        .getByText("Year 1", { exact: true })
        .first(),
    ).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("calculator example is explicitly read-only", async ({ page }) => {
    await page.goto("/resources/tools/comp-calculator", { waitUntil: "domcontentloaded" });
    await page.locator('[data-calculator-hydrated="true"]').waitFor();
    await page.getByRole("button", { name: "See a read-only example" }).click();
    await expect(page.getByText(/Read-only example/)).toBeVisible();

    const editableInputs = await page.locator('main input:not([readonly]):not([disabled])').count();
    expect(editableInputs).toBe(0);
    await expect(page.getByRole("button", { name: "Exit example" })).toBeVisible();
  });
});

const numberedResearchRoutes = [
  { route: "/research/how-recruiters-read", figures: [1, 2] },
  { route: "/research/referral-advantage", figures: [1, 2, 3] },
  { route: "/research/spelling-errors-impact", figures: [1, 2] },
  { route: "/research/linkedin-visibility", figures: [1, 2] },
] as const;

test.describe("multi-figure research articles", () => {
  for (const { route, figures } of numberedResearchRoutes) {
    test(`${route} numbers every figure in reading order`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const captions = await page.locator("figcaption").allTextContents();
      const numbers = captions.flatMap((caption) => {
        const match = caption.match(/Fig\.\s+(\d+)/i);
        return match ? [Number(match[1])] : [];
      });
      expect(numbers).toEqual(figures);
    });
  }
});
