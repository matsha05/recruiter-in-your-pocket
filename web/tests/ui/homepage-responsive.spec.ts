import { expect, test } from "@playwright/test";

for (const width of [320, 390, 640, 768, 960, 1024, 1280, 1440]) {
  test(`homepage controls and report excerpt stay inside the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("landing-primary-cta")).toBeVisible();
    await expect(page.locator(".site-header [role='status']")).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);

    // overflow-x:clip can hide an oversized child without increasing scrollWidth.
    // Measure the actual copy, controls, and report card rather than the body alone.
    const clipped = await page.locator([
      ".site-header a:visible", ".site-header button:visible", ".site-header .site-wordmark:visible",
      ".lift-hero-grid > *", ".lift-hero-grid h1", ".lift-hero-grid h2",
      ".lift-hero-grid p", ".lift-hero-grid a", ".lift-hero-grid blockquote",
    ].join(", ")).evaluateAll((elements) => {
      const viewportWidth = document.documentElement.clientWidth;
      return elements.flatMap((element) => {
        const bounds = element.getBoundingClientRect();
        if (bounds.left >= -1 && bounds.right <= viewportWidth + 1) return [];
        return [{ text: element.textContent?.trim().slice(0, 80), left: bounds.left, right: bounds.right, viewportWidth }];
      });
    });
    expect(clipped).toEqual([]);

    const headerSpacing = await page.locator(".site-header .app-shell-inner").evaluate((header) => {
      const brand = header.firstElementChild!.getBoundingClientRect();
      const nav = header.lastElementChild!.getBoundingClientRect();
      return nav.left - brand.right;
    });
    expect(headerSpacing).toBeGreaterThanOrEqual(8);

    const menu = page.getByRole("button", { name: "Open navigation", exact: true });
    if (width < 1280) {
      await expect(menu).toBeVisible();
      await menu.click();
      const navigation = page.getByRole("navigation", { name: "Mobile navigation", exact: true });
      await expect(navigation).toBeVisible();
      await navigation.getByRole("link", { name: "How it works", exact: true }).click();
      await expect(navigation).toBeHidden();
      await expect(page).toHaveURL(/\/#how-it-works$/);
    } else {
      await expect(menu).toBeHidden();
      const howItWorks = page.locator(".site-header").getByRole("link", { name: "How it works", exact: true });
      await expect(howItWorks).toBeVisible();
      const lineCount = await howItWorks.evaluate((link) => {
        const range = document.createRange();
        range.selectNodeContents(link);
        return new Set(Array.from(range.getClientRects(), (rect) => rect.top)).size;
      });
      expect(lineCount).toBe(1);
    }
  });
}
