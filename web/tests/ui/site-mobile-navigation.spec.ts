import { expect, test, type Locator, type Page } from "@playwright/test";

async function expectFullyInViewport(page: Page, locator: Locator) {
  await expect.poll(async () => {
    const bounds = await locator.boundingBox();
    const viewport = page.viewportSize();
    return {
      bounds,
      viewport,
      fullyVisible: Boolean(bounds && viewport && bounds.x >= 0 && bounds.y >= 0 &&
        bounds.x + bounds.width <= viewport.width + 1 && bounds.y + bounds.height <= viewport.height + 1),
    };
  }).toMatchObject({ fullyVisible: true });
}

for (const viewport of [{ width: 844, height: 390 }, { width: 640, height: 400 }]) {
  test.describe(`site navigation at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport, hasTouch: true, contextOptions: { reducedMotion: "reduce" } });

    for (const route of ["/", "/sample-report"]) {
      test(`all navigation actions remain reachable on ${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });

        const trigger = page.getByRole("button", { name: "Open navigation", exact: true });
        await trigger.focus();
        await page.keyboard.press("Enter");
        const dialog = page.getByRole("dialog");
        const navigation = dialog.getByRole("navigation", { name: "Mobile navigation", exact: true });
        const finalAction = navigation.getByRole("link", { name: "Get my free report", exact: true });
        const close = dialog.getByRole("button", { name: "Close", exact: true });
        await expect(dialog).toBeVisible();
        // Auth resolution replaces the account placeholder with these links.
        // Scroll the completed menu, not its shorter loading state.
        await expect(finalAction).toBeVisible();
        await expect(dialog).toHaveCSS("animation-name", "none");
        // Wait for stable, hit-tested coordinates instead of sampling a sheet
        // while it is entering, which can send the wheel outside the viewport.
        await navigation.hover();
        await page.mouse.wheel(0, 1000);
        await expectFullyInViewport(page, finalAction);
        await finalAction.click({ trial: true });
        await expectFullyInViewport(page, close);

        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();

        await page.keyboard.press("Space");
        await expect(dialog).toBeVisible();
        // Tab through the actual controls, ensuring focus stays in the dialog
        // and brings each item into view instead of visiting clipped links.
        let reachedFinalAction = false;
        for (let step = 0; step < 14; step += 1) {
          await page.keyboard.press("Tab");
          const focused = page.locator(":focus");
          await expect.poll(() => focused.evaluate(element => Boolean(element.closest('[role="dialog"]')))).toBe(true);
          await expectFullyInViewport(page, focused);
          if (await finalAction.evaluate(element => element === document.activeElement)) {
            reachedFinalAction = true;
            break;
          }
        }
        expect(reachedFinalAction).toBe(true);
        await close.focus();
        await page.keyboard.press("Enter");
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
      });
    }
  });
}
