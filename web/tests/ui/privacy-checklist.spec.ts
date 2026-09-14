import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const consentKey = "riyp:analytics-consent:v1";

async function interceptAnalytics(page: Page) {
  const events: { event: string; properties: Record<string, unknown> }[] = [];
  await page.route(/https:\/\/[^/]*mixpanel\.com\//, async route => {
    const body = route.request().postData();
    if (body) {
      const encoded = new URLSearchParams(body).get("data");
      let payload: any;
      try { payload = JSON.parse(body); }
      catch {
        try { payload = JSON.parse(encoded || ""); }
        catch { payload = JSON.parse(Buffer.from(encoded || "", "base64").toString()); }
      }
      events.push(...(Array.isArray(payload) ? payload : [payload]).filter(item => item.event));
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "1" });
  });
  return events;
}

test("analytics needs consent, tracks the real funnel, and stops after withdrawal", async ({ page, context }) => {
  test.skip(process.env.RIYP_ANALYTICS_TEST_ENABLED !== "1", "Use npm run test:consent-ui against an analytics-enabled test build.");
  const events = await interceptAnalytics(page);
  await page.goto("/?candidate=private@example.com");
  await expect(page.getByTestId("privacy-panel")).toBeVisible();
  await page.getByRole("button", { name: "Decline analytics", exact: true }).click();
  await page.getByTestId("landing-primary-cta").click();
  await expect(page).toHaveURL(/\/workspace$/);
  await page.waitForTimeout(700);
  expect(events).toHaveLength(0);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("mp_") || key.startsWith("__mpq_")))).toEqual([]);
  await page.goto("/");
  await expect(page.getByTestId("privacy-panel")).toHaveCount(0);
  await page.getByRole("button", { name: "Privacy choices", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your privacy choices" })).toBeFocused();
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await page.getByTestId("landing-primary-cta").click();
  await expect.poll(() => events.some(item => item.event === "landing_cta_clicked"), { timeout: 15_000 }).toBe(true);
  expect(events.some(item => item.event === "page_viewed")).toBe(true);
  expect(JSON.stringify(events)).not.toContain("private@example.com");
  expect(events.every(item => !("$current_url" in item.properties))).toBe(true);
  await page.goto("/sample-report");
  await expect.poll(() => events.some(item => item.event === "sample_report_viewed"), { timeout: 15_000 }).toBe(true);
  // Revoke in a second tab. The first tab's queued and future events must stop.
  const other = await context.newPage();
  await interceptAnalytics(other);
  await other.goto("/privacy");
  await other.getByRole("button", { name: "Privacy choices", exact: true }).click();
  await other.getByRole("button", { name: "Decline analytics", exact: true }).click();
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), consentKey)).toBe("declined");
  const count = events.length;
  await page.goto("/");
  await page.getByTestId("landing-primary-cta").click();
  await page.waitForTimeout(6000);
  expect(events).toHaveLength(count);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("mp_") || key.startsWith("__mpq_")))).toEqual([]);
});

test("consented analytics excludes search terms from the referring page", async ({ page }) => {
  test.skip(process.env.RIYP_ANALYTICS_TEST_ENABLED !== "1", "Use the analytics-enabled test build.");
  const events = await interceptAnalytics(page);
  const fields = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "utm_source_platform", "utm_campaign_id", "utm_creative_format", "utm_marketing_tactic", "dclid", "fbclid", "gclid", "ko_click_id", "li_fat_id", "msclkid", "sccid", "ttclid", "twclid", "wbraid"];
  const query = new URLSearchParams(fields.map(key => [key, "private-resume-query"]));
  await page.goto(`/?${query}`, { referer: "https://www.google.com/search?q=private-resume-query" });
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await expect.poll(() => events.some(item => item.event === "page_viewed"), { timeout: 15_000 }).toBe(true);
  expect(JSON.stringify(events)).not.toContain("private-resume-query");
  expect(events.every(item => !("mp_keyword" in item.properties))).toBe(true);
});

for (const signal of ["doNotTrack", "globalPrivacyControl"]) {
  test(`${signal} overrides stored acceptance`, async ({ page }) => {
    const events = await interceptAnalytics(page);
    await page.addInitScript(({ signal, key }) => {
      localStorage.setItem(key, "accepted");
      Object.defineProperty(navigator, signal, { value: signal === "doNotTrack" ? "1" : true });
    }, { signal, key: consentKey });
    await page.goto("/");
    await page.getByRole("button", { name: "Privacy choices", exact: true }).click();
    await expect(page.getByTestId("privacy-panel")).toContainText("Optional analytics stays off");
    await expect(page.getByRole("button", { name: "Allow analytics", exact: true })).toHaveCount(0);
    expect(events).toHaveLength(0);
  });
}

test("withdrawal works when storage is readable but privacy writes fail", async ({ page }) => {
  const events = await interceptAnalytics(page);
  await page.addInitScript(key => {
    localStorage.setItem(key, "accepted");
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException("Storage full", "QuotaExceededError");
      return write.call(this, name, value);
    };
  }, consentKey);
  await page.goto("/");
  await page.getByRole("button", { name: "Privacy choices", exact: true }).click();
  await page.getByRole("button", { name: "Decline analytics", exact: true }).click();
  await expect(page.getByTestId("privacy-panel")).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), consentKey)).not.toBe("accepted");
  const count = events.length;
  await page.getByTestId("landing-primary-cta").click();
  await expect(page).toHaveURL(/\/workspace$/);
  await page.waitForTimeout(6000);
  expect(events).toHaveLength(count);
});

test("mobile CTA appears after the hero, yields to privacy choices, and opens the workspace", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByTestId("pocket-instrument")).toHaveAttribute("data-status", "ready");
  await expect(page.getByTestId("mobile-report-cta")).toHaveCount(0);
  await page.evaluate(() => scrollTo(0, 1100));
  await expect(page.getByTestId("mobile-report-cta")).toBeHidden();
  await page.getByRole("button", { name: "Decline analytics", exact: true }).click();
  await expect(page.getByTestId("mobile-report-cta")).toBeVisible();
  expect((await new AxeBuilder({ page }).include('[data-testid="mobile-report-cta"]').analyze()).violations).toEqual([]);
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const button = page.getByTestId("mobile-report-cta").getByRole("link");
    const bounds = await button.boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByTestId("mobile-report-cta").getByRole("link").click();
  await expect(page).toHaveURL(/\/workspace$/);
  await expect(page.getByRole("heading", { name: "Start with your resume." })).toBeVisible();
});

test("privacy choices remain readable and keyboard-accessible on phone and desktop", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByTestId("privacy-panel")).toBeVisible();
    expect((await new AxeBuilder({ page }).include('[data-testid="privacy-panel"]').analyze()).violations).toEqual([]);
    const buttons = page.getByTestId("privacy-panel").getByRole("button");
    for (const button of await buttons.all()) {
      const bounds = await button.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    }
  }
  await page.getByRole("button", { name: "Decline analytics", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("privacy-panel")).toHaveCount(0);
  const preferences = page.getByRole("button", { name: "Privacy choices", exact: true });
  await preferences.click();
  await expect(page.getByRole("heading", { name: "Your privacy choices" })).toBeFocused();
  await page.getByTestId("privacy-panel").getByRole("button", { name: "Close", exact: true }).click();
  await expect(preferences).toBeFocused();
});

test("compressed artwork stays sharp and the calibrated controls work", async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, "declined"), consentKey);
  await page.goto("/");
  const instrument = page.getByTestId("pocket-instrument");
  await expect(instrument).toHaveAttribute("data-status", "ready");
  const plate = page.locator('img[src*="clean-plate.v2.webp"]');
  expect(await plate.evaluate(image => ({ width: (image as HTMLImageElement).naturalWidth, height: (image as HTMLImageElement).naturalHeight }))).toEqual({ width: 1536, height: 1024 });
  const response = await page.request.get("/assets/instrument/clean-plate.v2.webp");
  expect((await response.body()).length).toBeLessThan(120_000);
  await instrument.locator('[data-instrument-mode="story"]').click();
  await expect(instrument).toHaveAttribute("data-mode", "story");
  await instrument.getByRole("slider").focus();
  await page.keyboard.press("End");
  await expect(instrument).toHaveAttribute("data-stage", "next");
  await instrument.getByRole("switch", { name: "Instrument power" }).click();
  await expect(instrument).toHaveAttribute("data-powered", "false");
});
