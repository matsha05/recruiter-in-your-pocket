import { expect, test } from "@playwright/test";

test.describe("mobile pricing actions", () => {
  test("keeps the free action above the fold and shows a truthful closed-checkout state", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });

    const freeAction = page.getByTestId("pricing-hero-free-action");
    const paidState = page.getByTestId("pricing-hero-paid-action");

    await expect(freeAction).toBeVisible();
    await expect(freeAction).toHaveAttribute("href", "/workspace");
    await expect(paidState).toBeVisible();
    await expect(paidState).toBeDisabled();
    await expect(paidState).toContainText("Checkout opens after beta verification");
    await expect(paidState).not.toHaveAttribute("href", /.+/);

    const actionsBottom = await paidState.evaluate((element) => element.getBoundingClientRect().bottom);
    expect(actionsBottom).toBeLessThanOrEqual(820);

    const mobileHeroPadding = await page.locator('[data-visual-anchor="pricing-page"]').evaluate((element) =>
      Number.parseFloat(window.getComputedStyle(element).paddingTop),
    );
    expect(mobileHeroPadding).toBeLessThan(152);
  });
});
