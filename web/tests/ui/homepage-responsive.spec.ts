import { expect, test } from "@playwright/test";

for (const width of [320, 390, 640, 768, 960, 1024, 1280, 1440]) {
  test(`homepage controls and report excerpt stay inside the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("landing-primary-cta")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);

    // overflow-x:clip can hide an oversized child without increasing scrollWidth.
    // Measure the actual copy, controls, and report card rather than the body alone.
    const hero = page.locator("section[aria-labelledby='mineral-hero-title']");
    const report = page.getByRole("article", { name: "Sample resume report preview" });
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("article", { name: "Example resume assessment" })).toBeVisible();
    await expect(report).toBeVisible();
    await expect(report.getByRole("tablist", { name: "What to improve first" })).toBeVisible();

    const clipped = await page.locator([
      ".site-header a:visible", ".site-header button:visible", ".site-header .site-wordmark:visible",
      "section[aria-labelledby='mineral-hero-title'] h1", "section[aria-labelledby='mineral-hero-title'] p",
      "section[aria-labelledby='mineral-hero-title'] a", "section[aria-labelledby='mineral-hero-title'] summary",
      "section[aria-labelledby='mineral-hero-title'] li", "#how-it-works article",
      "section[aria-labelledby='alpine-trust-label'] :is(p, li, [role='img']):visible",
      "#how-it-works :is(h2, h3, h4, p, blockquote, button, a, li):visible",
    ].join(", ")).evaluateAll((elements) => {
      const viewportWidth = document.documentElement.clientWidth;
      return elements.flatMap((element) => {
        const bounds = element.getBoundingClientRect();
        if (bounds.left >= -1 && bounds.right <= viewportWidth + 1) return [];
        return [{ text: element.textContent?.trim().slice(0, 80), left: bounds.left, right: bounds.right, viewportWidth }];
      });
    });
    expect(clipped).toEqual([]);

    const limits = page.locator("#how-it-works details").filter({ hasText: "Free report limits" });
    const closedLimitsBounds = await limits.boundingBox();
    await limits.locator("summary").click();
    await expect(limits.locator("p")).toBeVisible();
    const limitsPosition = await limits.locator("p").evaluate((paragraph) => getComputedStyle(paragraph).position);
    expect(["absolute", "fixed"]).not.toContain(limitsPosition);
    const openLimitsBounds = await limits.boundingBox();
    expect(openLimitsBounds!.height).toBeGreaterThan(closedLimitsBounds!.height);
    const limitsBounds = await limits.locator("p").boundingBox();
    expect(limitsBounds!.x).toBeGreaterThanOrEqual(0);
    expect(limitsBounds!.x + limitsBounds!.width).toBeLessThanOrEqual(width);
    await limits.locator("summary").click();

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

test("report priorities can be explored with the keyboard and expose the matching evidence", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  const report = page.getByRole("article", { name: "Sample resume report preview" });
  const tabs = report.getByRole("tablist", { name: "What to improve first" });
  const onboarding = tabs.getByRole("tab", { name: /Explain how onboarding improved productivity/ });
  const launch = tabs.getByRole("tab", { name: /Add the result of the launch/ });
  const roadmap = tabs.getByRole("tab", { name: /Show your part in delivering the roadmap/ });

  await expect(launch).toHaveAttribute("aria-selected", "true");
  await expect(report.getByRole("tabpanel")).toHaveCount(1);
  await expect(report.getByRole("tabpanel").getByRole("blockquote")).toContainText("Ran a cross-team launch");
  await launch.focus();

  await page.keyboard.press("ArrowDown");
  await expect(roadmap).toBeFocused();
  await expect(roadmap).toHaveAttribute("aria-selected", "true");
  await expect(launch).toHaveAttribute("aria-selected", "false");
  await expect(report.getByRole("tabpanel").getByRole("blockquote")).toContainText("delivered quarterly roadmap on time");

  await page.keyboard.press("Home");
  await expect(onboarding).toBeFocused();
  await expect(report.getByRole("tabpanel").getByRole("blockquote")).toContainText("Led onboarding work across the company");

  await page.keyboard.press("End");
  await expect(roadmap).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(onboarding).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(roadmap).toBeFocused();

  await page.keyboard.press("Tab");
  const detail = report.getByRole("tabpanel");
  await expect(detail).toBeFocused();
  await expect(detail).toHaveAttribute("aria-labelledby", await roadmap.getAttribute("id") || "");
  await expect(roadmap).toHaveAttribute("aria-controls", await detail.getAttribute("id") || "");
  await expect(detail.getByRole("heading", { name: "Your next move" })).toBeVisible();
});
