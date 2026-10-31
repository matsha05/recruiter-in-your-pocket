import { expect, test } from "@playwright/test";

for (const width of [320, 390, 430]) {
  test.describe(`phone landing at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true });

    test("the main action is reachable before the example on a phone", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
      await page.evaluate(() => document.fonts.ready);
      const title = await page.getByRole("heading", { level: 1 }).boundingBox();
      const art = await page.getByTestId("recruiter-view-demo").boundingBox();
      const action = await page.getByTestId("landing-primary-cta").boundingBox();
      expect(title && art && action).toBeTruthy();
      expect(art!.y).toBeGreaterThanOrEqual(title!.y + title!.height);
      expect(art!.y).toBeGreaterThan(action!.y + action!.height);
      expect(art!.x).toBeGreaterThanOrEqual(0);
      expect(art!.x + art!.width).toBeLessThanOrEqual(width);
      expect(action!.y + action!.height).toBeLessThanOrEqual(844);
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
  const demo = await page.getByTestId("recruiter-view-demo").boundingBox();
  expect(demo!.y).toBeGreaterThan(title!.y + title!.height);
  expect(demo!.x).toBeGreaterThanOrEqual(0);
  expect(demo!.x + demo!.width).toBeLessThanOrEqual(768);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("phone visitors see the Verdict, score, and Critical Miss without opening anything", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  const preview = page.getByRole("article", { name: "Sample resume report preview", exact: true });
  await expect(preview.getByText("Verdict", { exact: true })).toBeVisible();
  await expect(preview.getByText("First Impression score", { exact: true })).toBeVisible();
  await expect(preview.getByText("Critical Miss", { exact: true })).toBeVisible();
  await expect(preview.getByRole("button", { expanded: false })).toHaveCount(0);
  await expect(preview.getByRole("tabpanel").locator("blockquote")).toContainText("Led onboarding work across the company");
});
