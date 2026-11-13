import { expect, test, type Page } from "@playwright/test";
import { MOCK_WORKLIST_REPORT } from "../../lib/backend/mock-worklist-report";
import { installSignedInSession } from "./signed-in-session";

// The signed-in holes wave (Nov 6, 2026; docs/audits/2026-11-report-and-signed-in-review.md): a returning person is
// offered their last report, isn't promised a free report the server hasn't confirmed, and is told a report was kept.

const RESUME = "Alex Rivera\nCustomer Operations\nExperience\nBuilt customer workflows in HubSpot for 120 customers.\nDocumented the workflow and trained the support team on customer onboarding.\nRan weekly onboarding reviews with account managers and kept the checklist current.";
const REPORT_ID = "6f1c2b3a-4d5e-4f60-8a7b-9c0d1e2f3a4b";

async function openWorkspace(page: Page) {
  await page.goto("/workspace", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  const decline = page.getByRole("button", { name: "Decline analytics", exact: true });
  if (await decline.isVisible().catch(() => false)) await decline.click();
}

test("a returning signed-in person is offered their last saved report", async ({ page }) => {
  await installSignedInSession(page, { freeUsesLeft: 0 });
  await page.route("**/api/reports?limit=1", (route) => route.fulfill({ json: { ok: true, reports: [{ id: REPORT_ID, score: 72, created_at: "2026-11-05T12:00:00.000Z" }] } }));
  await openWorkspace(page);
  const last = page.getByTestId("workspace-open-last-report");
  await expect(last).toBeVisible({ timeout: 15_000 });
  await last.click();
  await expect(page).toHaveURL(new RegExp(`/reports/${REPORT_ID}$`));
});

test("until the server answers, a signed-in person isn't promised a free report", async ({ page }) => {
  await installSignedInSession(page, { freeUsesLeft: 1 });
  // Hold the status call so the workspace renders before it knows what's left.
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/free-status", async (route) => { await held; await route.fulfill({ json: { ok: true, free_uses_left: 1, free_uses_remaining: 1 } }); });
  await page.route("**/api/reports?limit=1", (route) => route.fulfill({ json: { ok: true, reports: [] } }));
  await openWorkspace(page);
  await page.getByTestId("workspace-paste-mode").click();
  await page.getByTestId("workspace-resume-text").fill(RESUME);
  await expect(page.getByTestId("workspace-run-report")).toHaveAccessibleName("Get my report");
  release();
  await expect(page.getByTestId("workspace-run-report")).toHaveAccessibleName("Get your free report", { timeout: 15_000 });
});

test("a report the server kept says so at the end", async ({ page }) => {
  await installSignedInSession(page, { freeUsesLeft: 1 });
  await page.route("**/api/reports?limit=1", (route) => route.fulfill({ json: { ok: true, reports: [] } }));
  await page.route("**/api/resume-feedback-stream", (route) => route.fulfill({
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
    body: `${JSON.stringify({ type: "complete", ok: true, data: { ...MOCK_WORKLIST_REPORT, score_label: "Needs more context" }, report_id: REPORT_ID, report_receipt: null, operation_id: route.request().postDataJSON().recovery_id, free_uses_remaining: 0 })}\n`,
  }));
  await openWorkspace(page);
  await page.getByTestId("workspace-paste-mode").click();
  await page.getByTestId("workspace-resume-text").fill(RESUME);
  await page.getByTestId("workspace-run-report").click();
  await expect(page.getByTestId("worklist-report")).toBeVisible({ timeout: 30_000 });
  const kept = page.getByTestId("report-kept");
  await expect(kept).toContainText("Kept in My reports.");
  await expect(kept.getByRole("link", { name: "My reports" })).toHaveAttribute("href", "/reports");
});

test("Progress isn't open yet: /dashboard lands on My reports", async ({ request }) => {
  const response = await request.get("/dashboard", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(new URL(response.headers()["location"], "http://riyp.test").pathname).toBe("/reports");
});

// Live check, November 13, 2026: a pass with every report used read "0 free reports left" on My reports for about a
// second on every load, because the account's name arrives before its balance. Settings and the account menu wait
// for the balance, so there the same gap only shows when the balance can't be read at all.
async function openSettings(page: Page) {
  await page.goto("/settings/account", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  const decline = page.getByRole("button", { name: "Decline analytics", exact: true });
  if (await decline.isVisible().catch(() => false)) await decline.click();
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Open account menu" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
}

test("when the balance can't be read, nothing is claimed about a free report", async ({ page }) => {
  await installSignedInSession(page, { freeUsesLeft: 0 });
  await page.route("**/api/passes", (route) => route.fulfill({ status: 503, json: { ok: false } }));
  await page.route("**/api/free-status", (route) => route.fulfill({ status: 503, json: { ok: false } }));
  await openSettings(page);
  await expect(page.getByRole("menu")).toContainText("Sign out");
  await expect(page.locator("body")).not.toContainText(/free report/i);
});

test("a pass with every report used is named as that in Settings and the account menu", async ({ page }) => {
  const spentPass = { id: "33333333-3333-4333-8333-333333333333", tier: "30d", uses_remaining: 0, expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), created_at: "2026-11-05T21:00:00.000Z", price_id: null, revoked_at: null, revocation_reason: null };
  await installSignedInSession(page, { freeUsesLeft: 0, passes: [spentPass] });
  await openSettings(page);
  await expect(page.getByRole("menu")).toContainText("No reports left on your pass");
  await expect(page.locator("main")).toContainText("No reports left on your pass");
  await expect(page.locator("body")).not.toContainText(/free report/i);
});
