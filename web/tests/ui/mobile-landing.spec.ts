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

test("phone visitors can read additional assessment detail without losing the actionable example", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  const preview = page.getByRole("article", { name: "Sample resume report preview", exact: true });
  const toggle = preview.getByRole("button", { name: "First impression & strengths", exact: true });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(preview.getByRole("heading", { name: "The first impression", exact: true })).toBeHidden();
  await expect(preview.getByRole("tabpanel", { name: /Add the result of the launch/ }).locator("blockquote")).toContainText("clear owners and checkpoints");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(preview.getByRole("heading", { name: "The first impression", exact: true })).toBeVisible();
  await expect(preview.getByRole("heading", { name: "What’s already working", exact: true })).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(preview.getByRole("tab", { name: /Add the result of the launch/ })).toHaveAttribute("aria-selected", "true");
});
