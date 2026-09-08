import { expect, test } from "@playwright/test";

for (const width of [320, 390, 430]) {
  test.describe(`phone landing at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true });

    test("the complete hero composition and main action fit the initial phone view", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
      await page.evaluate(() => document.fonts.ready);
      const title = await page.getByRole("heading", { level: 1 }).boundingBox();
      const art = await page.getByTestId("lion-hero-scene").boundingBox();
      const action = await page.getByTestId("landing-primary-cta").boundingBox();
      expect(title && art && action).toBeTruthy();
      expect(art!.y).toBeGreaterThanOrEqual(title!.y + title!.height);
      expect(art!.y + art!.height).toBeLessThan(action!.y);
      expect(action!.y + action!.height).toBeLessThanOrEqual(844);
      await expect(page.getByTestId("lion-hero-scene")).toHaveAttribute("data-motion-state", "still");
      await page.getByTestId("landing-primary-cta").click();
      await expect(page).toHaveURL(/\/workspace(?:[/?#]|$)/);
    });

    test("all trusted-company marks remain visible without overlapping", async ({ page }) => {
      await page.goto("/");
      const trust = page.getByRole("region", { name: "Trusted by people at", exact: true });
      const marks = trust.getByRole("img");
      await expect(marks).toHaveCount(6);
      await expect(trust.getByRole("img", { name: "Apple", exact: true })).toBeVisible();
      const rectangles = await marks.evaluateAll(elements => elements.map(element => {
        const r = element.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      }));
      for (let i = 0; i < rectangles.length; i++) {
        const a = rectangles[i];
        expect(a.left).toBeGreaterThanOrEqual(0);
        expect(a.right).toBeLessThanOrEqual(width);
        for (const b of rectangles.slice(i + 1)) {
          expect(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top).toBe(true);
        }
      }
    });
  });
}

test("small tablets see a complete pocket beside the copy", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const title = await page.getByRole("heading", { level: 1 }).boundingBox();
  const art = await page.getByTestId("lion-hero-scene").boundingBox();
  const composition = await page.getByTestId("lion-hero-composition").boundingBox();
  expect(art!.x).toBeGreaterThanOrEqual(title!.x + title!.width);
  expect(art!.y + art!.height).toBeLessThanOrEqual(1024);
  expect(composition!.height).toBeLessThanOrEqual(700);
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
