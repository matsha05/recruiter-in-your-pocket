import { expect, test } from "@playwright/test";

test.describe("launch smoke", () => {
  test("health and public status endpoints report cleanly in launch-safe mode", async ({ request }) => {
    const health = await request.get("/api/health");
    expect(health.status()).toBe(200);

    const status = await request.get("/api/status");
    expect(status.status()).toBe(200);

    const payload = await status.json();
    expect(payload.ok).toBe(true);
    expect(payload.summary.status).toBe("operational");
    expect(Array.isArray(payload.services)).toBe(true);
  });

  test("launch dashboard renders gate and rollback sections", async ({ page }) => {
    await page.goto("/launch", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-visual-anchor='launch-page']", { timeout: 30_000 });

    await expect(page.getByRole("heading", { name: /go\/no-go launch program/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /rollback controls/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /vendor and privacy review/i })).toBeVisible();
  });

  test("public status page renders readiness checks", async ({ page }) => {
    await page.goto("/status", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-visual-anchor='legal-status']", { timeout: 30_000 });

    await expect(page.getByRole("heading", { name: /current product status/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /customer-facing systems/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /support and trust/i })).toBeVisible();
  });

  test("critical launch routes render", async ({ page }) => {
    const routes = [
      ["/", "[data-visual-anchor='landing-home']"],
      ["/pricing", "[data-visual-anchor='pricing-page']"],
      ["/auth", "[data-visual-anchor='auth-page']"],
      ["/extension", "[data-visual-anchor='extension-page']"],
      ["/trust", "[data-visual-anchor='legal-trust']"],
      ["/security", "[data-visual-anchor='legal-security']"],
      ["/privacy", "[data-visual-anchor='legal-privacy']"],
      ["/workspace", "[data-visual-anchor='workspace-resume-empty']"],
    ] as const;

    for (const [route, selector] of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(selector, { timeout: 30_000 });
    }
  });
});
