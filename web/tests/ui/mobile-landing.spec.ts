import { expect, test } from "@playwright/test";
import { JORDAN_EXAMPLE } from "../../lib/marketing/jordan-example";

for (const width of [320, 390, 430]) {
  test.describe(`phone landing at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true });

    test("the pile, the headline and the main action all fit the first screen on a phone", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
      await page.evaluate(() => document.fonts.ready);
      const pile = await page.getByTestId("landing-pile").boundingBox();
      const title = await page.getByRole("heading", { level: 1 }).boundingBox();
      const action = await page.getByTestId("landing-primary-cta").boundingBox();
      expect(pile && title && action).toBeTruthy();
      // On a phone the pile comes first, then the headline, then the button, all before the fold.
      expect(title!.y).toBeGreaterThan(pile!.y + pile!.height);
      expect(action!.y).toBeGreaterThan(title!.y + title!.height);
      expect(action!.y + action!.height).toBeLessThanOrEqual(844);
      expect(pile!.x).toBeGreaterThanOrEqual(0);
      expect(pile!.x + pile!.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByTestId("landing-primary-cta").click();
      await expect(page).toHaveURL(/\/workspace(?:[/?#]|$)/);
    });
  });
}

test("small tablets keep the pile and the copy in one readable column", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const title = await page.getByRole("heading", { level: 1 }).boundingBox();
  const pile = await page.getByTestId("landing-pile").boundingBox();
  expect(title!.y).toBeGreaterThan(pile!.y + pile!.height);
  expect(pile!.x).toBeGreaterThanOrEqual(0);
  expect(pile!.x + pile!.width).toBeLessThanOrEqual(768);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("phone visitors read the whole story without opening anything", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  const read = page.getByTestId("landing-read");
  await read.scrollIntoViewIfNeeded();
  await expect(read.getByRole("heading", { level: 2 })).toContainText("a recruiter has finished reading your resume.");
  const clipping = page.locator("#how-it-works figure").first();
  await clipping.scrollIntoViewIfNeeded();
  await expect(clipping).toContainText("Introduced monthly renewal-risk reviews across the portfolio");
  await expect(clipping.getByText(JORDAN_EXAMPLE.note, { exact: false })).toBeVisible();
  await expect(page.locator("#main-content").getByRole("button", { expanded: false })).toHaveCount(0);
});
