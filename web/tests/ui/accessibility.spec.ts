import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function waitForAppHydration(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
}

const routes = [
  "/",
  "/pricing",
  "/sample-report",
  "/workspace",
  "/auth",
  "/settings/account",
  "/settings/billing",
  "/trust",
  "/security",
  "/privacy",
  "/terms",
  "/methodology",
  "/research",
  "/guides",
  "/faq",
  "/purchase/restore",
];

test.describe("a11y baseline", () => {
  for (const route of routes) {
    test(`axe has no serious violations on ${route}`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto(route, { waitUntil: "domcontentloaded" });
      await waitForAppHydration(page);

      const results = await new AxeBuilder({ page }).analyze();
      const blockingViolations = results.violations.filter((violation) =>
        violation.impact === "critical" || violation.impact === "serious"
      );

      expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
    });
  }
});

test("active navigation exposes the current page across site, app, mobile, and legal shells", async ({ page }) => {
  await page.goto("/pricing", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);
  const siteHeader = page.locator("header.site-header");
  await expect(siteHeader.getByRole("link", { name: "Pricing", exact: true })).toHaveAttribute("aria-current", "page");

  await page.setViewportSize({ width: 390, height: 844 });
  await siteHeader.getByRole("button", { name: "Open navigation" }).click();
  const siteMobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(siteMobileNav.getByRole("link", { name: "Pricing", exact: true })).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/workspace", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);
  const appHeader = page.locator("header.app-shell-header");
  await expect(appHeader.getByRole("link", { name: "Studio", exact: true })).toHaveAttribute("aria-current", "page");

  await page.goto("/privacy", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);
  const legalNav = page.getByRole("navigation", { name: "Trust and legal pages" });
  await expect(legalNav.getByRole("link", { name: "Privacy Policy", exact: true })).toHaveAttribute("aria-current", "page");
});

test("sign-in input keeps its visible default boundary and exposes its error state", async ({ page }) => {
  await page.goto("/auth", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);

  const emailInput = page.getByRole("textbox", { name: "Email address" });
  await expect(emailInput).toHaveClass(/border-muted-foreground\/70/);

  await page.getByRole("button", { name: "Send sign-in code" }).click();

  await expect(page.locator("#auth-error")).toHaveText("Please enter your email");
  await expect(emailInput).toHaveAttribute("aria-invalid", "true");
  await expect(emailInput).toHaveClass(/border-destructive\/50/);
  await expect(emailInput).toHaveClass(/bg-destructive\/5/);
  await expect(emailInput).not.toHaveClass(/border-muted-foreground\/70/);
  await expect(emailInput).not.toHaveClass(/bg-secondary\/10/);
});

test("production-protected internal routes render a stable not-found page", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto("/internal/system-lab", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
  await waitForAppHydration(page);

  await expect(page.getByRole("heading", { name: "This page is not here." })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("open mobile workspace navigation exposes the current page and has no serious axe violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/workspace", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);
  await page.getByRole("button", { name: "Toggle menu" }).click();

  const mobileSheet = page.getByRole("dialog");
  await expect(mobileSheet.getByRole("link", { name: "The Studio", exact: true })).toHaveAttribute("aria-current", "page");

  const results = await new AxeBuilder({ page }).analyze();
  const blockingViolations = results.violations.filter((violation) =>
    violation.impact === "critical" || violation.impact === "serious"
  );
  expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
});

test("keyboard resume upload announces success and moves focus to the file action", async ({ page }) => {
  await page.route("**/api/parse-resume", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        text: "Senior product manager who led onboarding improvements across product, sales, and support.",
      }),
    });
  });

  await page.goto("/workspace", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);
  const chooseFile = page.getByRole("button", { name: "Choose a file" });
  await chooseFile.focus();

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.keyboard.press("Enter");
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "candidate-resume.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 test resume"),
  });

  const readyStatus = page.getByRole("status").filter({ hasText: "Ready for a first read" });
  await expect(readyStatus).toContainText("candidate-resume.pdf");
  const removeFile = page.getByRole("button", { name: "Remove candidate-resume.pdf" });
  await expect(removeFile).toBeFocused();
});
