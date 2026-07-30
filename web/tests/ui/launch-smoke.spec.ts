import { expect, test } from "@playwright/test";

test.describe("launch smoke", () => {
  test("health and public status endpoints report a coherent launch-safe snapshot", async ({ request }) => {
    const health = await request.get("/api/health");
    expect(health.status()).toBe(200);

    const status = await request.get("/api/status");
    expect(status.status()).toBe(200);

    const payload = await status.json();
    expect(Array.isArray(payload.services)).toBe(true);
    expect(Array.isArray(payload.incidents)).toBe(true);

    const hasLimitedService = payload.services.some(
      (service: { status: string }) => service.status === "limited"
    );
    const expectedOk = !hasLimitedService && payload.incidents.length === 0;

    expect(payload.ok).toBe(expectedOk);
    expect(payload.summary.status).toBe(expectedOk ? "configured" : "limited");
  });

  test("launch dashboard renders gate and rollback sections", async ({ page }) => {
    await page.goto("/launch", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-visual-anchor='launch-page']", { timeout: 30_000 });

    await expect(page.getByRole("heading", { name: /go or no-go, with receipts/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /rollback controls/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /vendor and privacy review/i })).toBeVisible();
  });

  test("public status page renders readiness checks", async ({ page }) => {
    await page.goto("/status", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-visual-anchor='legal-status']", { timeout: 30_000 });

    await expect(page.getByRole("heading", { name: /launch configuration status/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /customer-facing systems/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /support and trust/i })).toBeVisible();
  });

  test("critical launch routes render", async ({ page }) => {
    const routes = [
      ["/", "[data-visual-anchor='landing-home']"],
      ["/pricing", "[data-visual-anchor='pricing-page']"],
      ["/auth", "[data-visual-anchor='auth-page']"],
      ["/trust", "[data-visual-anchor='legal-trust']"],
      ["/security", "[data-visual-anchor='legal-security']"],
      ["/privacy", "[data-visual-anchor='legal-privacy']"],
      ["/support", "[data-visual-anchor='legal-support']"],
      ["/workspace", "[data-visual-anchor='workspace-resume-empty']"],
    ] as const;

    for (const [route, selector] of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(selector, { timeout: 30_000 });
    }
  });

  test("public typography uses the branded font stack", async ({ page }) => {
    await page.goto("/research", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const typography = await page.evaluate(() => {
      const body = getComputedStyle(document.body).fontFamily;
      const heading = getComputedStyle(document.querySelector("h1")!).fontFamily;
      return { body, heading };
    });

    expect(typography.body).toContain("Instrument Sans Variable");
    expect(typography.heading).toContain("Space Grotesk Variable");
    expect(typography.body).not.toMatch(/Times New Roman|Times/i);
    expect(typography.heading).not.toMatch(/Times New Roman|Times/i);
    expect(typography.heading).not.toMatch(/Times New Roman|Times/i);
  });

  test("private beta surfaces stay out of the public launch", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: "Extension", exact: true })).toHaveCount(0);

    await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /lifetime/i })).toHaveCount(0);

    const extension = await request.get("/extension", { maxRedirects: 0 });
    expect(extension.status()).toBe(308);
    expect(extension.headers().location).toBe("/workspace");

    const jobs = await request.get("/jobs");
    expect(jobs.status()).toBe(404);
  });
});
