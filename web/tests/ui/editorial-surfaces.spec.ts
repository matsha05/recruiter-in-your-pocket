import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicEditorialRoutes = [
  { route: "/resources", canonical: "/resources" },
  { route: "/resources/offer-negotiation", canonical: "/resources/offer-negotiation" },
  { route: "/resources/tech-offer-negotiation", canonical: "/resources/tech-offer-negotiation" },
  { route: "/resources/tools/comp-calculator", canonical: "/resources/tools/comp-calculator" },
] as const;

test.describe("score language", () => {
  // A first report shows a band, never the number (D5); methodology and pricing must say the same.
  test("methodology shows the sample's band and all four parts, with no 0 to 100 score", async ({ page }) => {
    await page.goto("/methodology", { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).not.toContainText(/\/\s?100\b/);
    await expect(body).not.toContainText("First Impression score");
    await expect(page.getByTestId("score-band").first()).toBeVisible();
    await expect(page.getByTestId("score-band").first()).toContainText("Mostly clear");
    await expect(page.getByRole("region", { name: "What goes into the band" }).getByRole("listitem")).toHaveCount(4);
  });

  test("pricing names the band, not a First Impression score", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).not.toContainText("First Impression score");
    // Both the live and the paused pricing layouts describe the free report this way.
    await expect(page.locator("body")).toContainText("where your resume stands");
  });
});

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

    await page.getByLabel("Annual base salary").fill("100000");
    await page.getByLabel("Annual target bonus").fill("10");
    await page.getByLabel("Equity grant value").fill("100000");
    await page.getByRole("button", { name: /Vesting/ }).click();
    await page.getByLabel("Year 1 %").fill("0");
    await page.getByLabel("Year 2 %").fill("33");
    await page.getByLabel("Year 3 %").fill("33");
    await page.getByLabel("Year 4 %").fill("34");

    const offer = page.locator('section[aria-label="Offer 1 details"]');
    await expect(offer.getByText("$540,000", { exact: true })).toBeVisible();
    // One offer gets a single answer; the ranking caveat appears only when offers are compared.
    await expect(page.locator('aside[aria-label="Modeled comparison"]')).toContainText("Modeled four-year total");
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

  test("calculator preserves typed decimals in bonuses, payments, and vesting", async ({ page }) => {
    await page.goto("/resources/tools/comp-calculator", { waitUntil: "domcontentloaded" });
    await page.locator('[data-calculator-hydrated="true"]').waitFor();
    await page.getByLabel("Annual base salary").fill("100000");
    const bonus = page.getByLabel("Annual target bonus");
    await bonus.fill("");
    await bonus.pressSequentially("12.5");
    await expect(bonus).toHaveValue("12.5");
    await page.getByLabel("Equity grant value").fill("100000");
    await page.getByRole("button", { name: /Vesting/ }).click();
    for (const [index, value] of ["0", "33.3", "33.3", "33.4"].entries()) {
      await page.getByLabel(`Year ${index + 1} %`).fill(value);
    }
    const offer = page.locator('section[aria-label="Offer 1 details"]');
    await expect(offer.getByText("$550,000", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Advanced assumptions" }).click();
    const relocation = page.getByLabel("Relocation payment");
    await relocation.fill("1,000.50");
    await relocation.blur();
    await expect(relocation).toHaveValue("1,000.5");
    await expect(offer.getByText("$551,001", { exact: true })).toBeVisible();
    await expect(bonus).toHaveValue("12.5");
  });
});

const numberedResearchRoutes = [
  { route: "/research/how-recruiters-read", figures: [1] },
  { route: "/research/referral-advantage", figures: [1, 2, 3] },
  { route: "/research/spelling-errors-impact", figures: [1, 2] },
  { route: "/research/linkedin-visibility", figures: [1, 2] },
] as const;

test.describe("multi-figure research articles", () => {
  test("referral figures show the published numbers and fit on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/research/referral-advantage", { waitUntil: "domcontentloaded" });
    const share = page.getByRole("figure", { name: /6 in 100 were referred by an employee/ });
    await expect(share).toContainText("29%");
    const odds = page.getByRole("figure", { name: /about 1 in 14 referred applications got an offer/ });
    await expect(odds).toContainText("1 in 8");
    await expect(odds).toContainText("1 in 500");
    // Derived figures must say they are our arithmetic.
    await expect(odds).toContainText("our arithmetic");
    const chart = page.getByRole("figure", { name: /11 percentage points more likely to submit work on time and 20 points more likely to continue/ });
    await expect(chart).toContainText("+20");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

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
