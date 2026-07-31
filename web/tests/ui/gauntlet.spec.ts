import { expect, test } from "@playwright/test";

test.describe("operator gauntlet", () => {
  test("renders an honest pending baseline on desktop", async ({ page }) => {
    await page.goto("/launch/gauntlet", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-visual-anchor='gauntlet-progress']", { timeout: 30_000 });

    await expect(page).toHaveTitle(/Gauntlet progress/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    await expect(page.getByRole("heading", { name: /can the first free review earn the second/i })).toBeVisible();
    await expect(page.getByText("BASELINE PENDING", { exact: true })).toBeVisible();
    await expect(page.getByText("0/12 production/candidate report plus rendered-presentation pairs are present", { exact: true })).toBeVisible();
    await expect(page.getByText("Not measured", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /official artifact/i })).toHaveCount(2);
    await expect(page.getByRole("combobox", { name: "Inspect iteration" })).toHaveValue("iteration-000-baseline");
    await expect(page.getByRole("button", { name: "View iteration" })).toBeVisible();
    await expect(page.getByText("No product-quality claim is made because no candidate or production evidence has been imported.", { exact: true })).toBeVisible();
    await expect(page.getByText("No sealed evidence tree exists to verify yet", { exact: true })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("golden/");

    await page.getByRole("link", { name: "Machine learning engineering" }).click();
    await expect(page).toHaveURL(/case=staff-ml-elite/);
    await expect(page.getByText(/Candidate and production remain hidden until this case has a valid blind judgment/)).toBeVisible();
    await expect(page.getByText("Inspect generated report output", { exact: true })).toHaveCount(0);
  });

  test("keeps the case board usable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/launch/gauntlet", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-visual-anchor='gauntlet-progress']", { timeout: 30_000 });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    await expect(page.getByText("Machine learning engineering", { exact: true })).toBeVisible();
    await expect(page.getByText("Product management", { exact: true })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Inspect iteration" })).toBeVisible();
  });

  test("rejects unsafe iteration selection", async ({ page }) => {
    const response = await page.goto("/launch/gauntlet?iteration=../../outside", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(404);
  });
});
