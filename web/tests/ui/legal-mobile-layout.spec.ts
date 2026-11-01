import { expect, test } from "@playwright/test";

for (const width of [320, 390]) {
  for (const route of ["/privacy", "/security"]) {
    test(`${route} keeps long contact details inside a ${width}px phone`, async ({ page }) => {
      await page.setViewportSize({ width, height: 667 });
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);

      const geometry = () => page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        scrollX: window.scrollX,
      }));
      await expect.poll(geometry).toEqual({ width, scrollWidth: width, scrollX: 0 });

      const nav = page.getByRole("navigation", { name: "Trust and legal pages" });
      const current = nav.locator('[aria-current="page"]');
      await current.focus();
      await page.keyboard.press("Tab");
      const focused = nav.locator(":focus");
      await expect(focused).toHaveCount(1);
      const focusedBox = await focused.boundingBox();
      expect(focusedBox).not.toBeNull();
      expect(focusedBox!.height).toBeGreaterThanOrEqual(44);
      expect(focusedBox!.x).toBeGreaterThanOrEqual(0);
      expect(focusedBox!.x + focusedBox!.width).toBeLessThanOrEqual(width);
      await expect.poll(geometry).toEqual({ width, scrollWidth: width, scrollX: 0 });

      const footer = page.locator("footer");
      await footer.scrollIntoViewIfNeeded();
      await expect(footer.getByRole("link", { name: "support@recruiterinyourpocket.com", exact: true })).toBeVisible();
      await expect.poll(geometry).toEqual({ width, scrollWidth: width, scrollX: 0 });
    });
  }
}

test.describe("legal navigation pointer activation", () => {
  test.use({ isMobile: true, hasTouch: true });

  // Four tabs (plan 4.9) fit a 320px phone: every label is whole, and each opens with mouse or touch.
  for (const width of [320, 390]) {
    for (const pointer of ["mouse", "touch"] as const) {
      test(`${pointer} can activate a fully visible legal link at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 667 });
        await page.goto("/security");
        await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
        await page.evaluate(() => document.fonts.ready);

        const nav = page.getByRole("navigation", { name: "Trust and legal pages" });
        await expect(nav.getByRole("link")).toHaveText(["Privacy", "Terms", "Security", "Help"]);
        expect(await nav.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
        const help = nav.getByRole("link", { name: "Help", exact: true });
        const linkBox = (await help.boundingBox())!;
        const navBox = (await nav.boundingBox())!;
        expect(linkBox.x).toBeGreaterThanOrEqual(navBox.x - 1);
        expect(linkBox.x + linkBox.width).toBeLessThanOrEqual(navBox.x + navBox.width + 1);

        const x = linkBox.x + linkBox.width / 2;
        const y = linkBox.y + linkBox.height / 2;
        if (pointer === "touch") await page.touchscreen.tap(x, y);
        else await page.mouse.click(x, y);

        await expect(page).toHaveURL(/\/faq$/);
        await expect(nav.getByRole("link", { name: "Help", exact: true })).toHaveAttribute("aria-current", "page");
      });
    }
  }
});
