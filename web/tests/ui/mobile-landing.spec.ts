import { expect, test } from "@playwright/test";

for (const width of [320, 390, 430]) {
  test.describe(`phone landing at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true });

    test("the main action is reachable before the pile on a phone", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
      await page.evaluate(() => document.fonts.ready);
      const title = await page.getByRole("heading", { level: 1 }).boundingBox();
      const pile = await page.getByTestId("landing-pile").boundingBox();
      const action = await page.getByTestId("landing-primary-cta").boundingBox();
      expect(title && pile && action).toBeTruthy();
      expect(pile!.y).toBeGreaterThan(action!.y + action!.height);
      expect(pile!.x).toBeGreaterThanOrEqual(0);
      expect(pile!.x + pile!.width).toBeLessThanOrEqual(width);
      expect(action!.y + action!.height).toBeLessThanOrEqual(844);
      // The sheets run off the edge like a pile on a desk, but the page never scrolls sideways.
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByTestId("landing-primary-cta").click();
      await expect(page).toHaveURL(/\/workspace(?:[/?#]|$)/);
    });
  });
}

test("small tablets keep the copy and the pile in one readable column", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const title = await page.getByRole("heading", { level: 1 }).boundingBox();
  const pile = await page.getByTestId("landing-pile").boundingBox();
  expect(pile!.y).toBeGreaterThan(title!.y + title!.height);
  expect(pile!.x).toBeGreaterThanOrEqual(0);
  expect(pile!.x + pile!.width).toBeLessThanOrEqual(768);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("phone visitors see the recruiter's marks on the example without opening anything", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  const pile = page.getByTestId("landing-pile");
  await pile.scrollIntoViewIfNeeded();
  await expect(pile.getByText("Critical Miss", { exact: true })).toBeVisible();
  await expect(pile.getByText(/Did renewals go up\?/)).toBeVisible();
  await expect(pile.getByText("Don’t touch this one.", { exact: true })).toBeVisible();
  await expect(pile.getByRole("button")).toHaveCount(0);
});
