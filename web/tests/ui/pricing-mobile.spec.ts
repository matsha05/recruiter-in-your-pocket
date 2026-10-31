import { expect, test } from "@playwright/test";

const billingEnabled = process.env.NEXT_PUBLIC_ENABLE_BILLING_UNLOCK === "true";

test.describe("mobile pricing actions", () => {
  test("keeps both actions above the fold with checkout open", async ({ page }) => {
    test.skip(!billingEnabled, "Checkout is closed in this build.");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });

    const freeAction = page.getByTestId("pricing-hero-free-action");
    const paidAction = page.getByTestId("pricing-hero-paid-action");

    await expect(freeAction).toBeVisible();
    await expect(freeAction).toHaveAttribute("href", "/workspace");
    await expect(paidAction).toBeVisible();
    await expect(paidAction).toBeEnabled();
    await expect(paidAction).toContainText("Get 5 more reports · $29");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Your first report is free.");

    const actionsBottom = await paidAction.evaluate((element) => element.getBoundingClientRect().bottom);
    expect(actionsBottom).toBeLessThanOrEqual(820);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("keeps the free action above the fold and shows a truthful closed-checkout state", async ({ page }) => {
    test.skip(billingEnabled, "Checkout is open in this build.");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });

    const freeAction = page.getByTestId("pricing-hero-free-action");
    const paidState = page.getByTestId("pricing-hero-paid-action");

    await expect(freeAction).toBeVisible();
    await expect(freeAction).toHaveAttribute("href", "/workspace");
    await expect(paidState).toBeVisible();
    await expect(paidState).toBeDisabled();
    await expect(paidState).toContainText("Passes are paused for now");
    await expect(paidState).not.toHaveAttribute("href", /.+/);
    await expect(page.getByText(/Your first complete report is free\. No card required\./).first()).toBeVisible();
    await expect(page.getByText(/Daily capacity limits apply/).first()).toBeVisible();

    const actionsBottom = await paidState.evaluate((element) => element.getBoundingClientRect().bottom);
    expect(actionsBottom).toBeLessThanOrEqual(820);

    const mobileHeroPadding = await page.locator('[data-visual-anchor="pricing-page"]').evaluate((element) =>
      Number.parseFloat(window.getComputedStyle(element).paddingTop),
    );
    expect(mobileHeroPadding).toBeLessThan(152);
  });
});
