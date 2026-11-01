import { expect, test } from "@playwright/test";

for (const width of [320, 390, 430]) {
  test.describe(`phone landing at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true });

    test("the main action is reachable before the example on a phone", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
      await page.evaluate(() => document.fonts.ready);
      const title = await page.getByRole("heading", { level: 1 }).boundingBox();
      const art = await page.getByTestId("landing-verdict-art").boundingBox();
      const action = await page.getByTestId("landing-primary-cta").boundingBox();
      expect(title && art && action).toBeTruthy();
      expect(art!.y).toBeGreaterThan(action!.y + action!.height);
      expect(art!.x).toBeGreaterThanOrEqual(0);
      expect(art!.x + art!.width).toBeLessThanOrEqual(width);
      expect(action!.y + action!.height).toBeLessThanOrEqual(844);
      // The page tilts, but the layout never scrolls sideways.
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByTestId("landing-primary-cta").click();
      await expect(page).toHaveURL(/\/workspace(?:[/?#]|$)/);
    });
  });
}

test("small tablets keep the copy and the example in one readable column", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const title = await page.getByRole("heading", { level: 1 }).boundingBox();
  const art = await page.getByTestId("landing-verdict-art").boundingBox();
  expect(art!.y).toBeGreaterThan(title!.y + title!.height);
  expect(art!.x).toBeGreaterThanOrEqual(0);
  expect(art!.x + art!.width).toBeLessThanOrEqual(768);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("phone visitors read the whole story without opening anything", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  await expect(page.getByTestId("landing-verdict-art").getByText("Not moving forward", { exact: true })).toBeVisible();
  const silence = page.getByRole("heading", { level: 2, name: "Not even a reply." });
  await silence.scrollIntoViewIfNeeded();
  await expect(silence).toBeVisible();
  const verdict = page.locator("blockquote");
  await verdict.scrollIntoViewIfNeeded();
  await expect(verdict).toContainText("What’s missing is proof Jordan changed the outcome.");
  await expect(page.locator("#main-content").getByRole("button", { expanded: false })).toHaveCount(0);
});
