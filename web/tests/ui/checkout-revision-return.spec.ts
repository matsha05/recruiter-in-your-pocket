import { expect, test, type Page } from "@playwright/test";
import { createRequire } from "node:module";
import path from "node:path";

const WEB_ROOT = path.resolve(__dirname, "../..");
const requireExtension = createRequire(path.resolve(WEB_ROOT, "../extension/package.json"));
const { build } = requireExtension("esbuild");
interface HarnessPlugin {
  onResolve(options: { filter: RegExp }, callback: (args: { path: string }) => { path: string; namespace: string } | undefined): void;
  onLoad(options: { filter: RegExp; namespace: string }, callback: (args: { path: string }) => { contents: string; loader: string; resolveDir: string }): void;
}
const ORIGIN = "http://127.0.0.1:3100";
const REVISION_PATH = "/workspace?revision=16e8e371-607f-4f90-a677-37d87dc70b2a";
const RESTORE_PATH = `/purchase/restore?returnTo=${encodeURIComponent(REVISION_PATH)}`;
const PRICING_PATH = `/pricing?returnTo=${encodeURIComponent(REVISION_PATH)}`;
const SESSION_ID = "cs_test_revision_return";
const CONFIRMED_PATH = `/purchase/confirmed?session_id=${SESSION_ID}&tier=30d&returnTo=${encodeURIComponent(REVISION_PATH)}`;
let harnessScript = "";

async function buildCheckoutHarness() {
  const mocks: Record<string, string> = {
    "next/link": `import React from "react";
      export default function Link({href, children, ...props}) { return <a href={href} {...props}>{children}</a>; }`,
    "next/navigation": `import {useMemo} from "react";
      export function useSearchParams() { return useMemo(() => new URLSearchParams(window.location.search), []); }`,
    "@/components/providers/AuthProvider": `const user = JSON.parse(sessionStorage.getItem("checkout-harness-user") || "null");
      const refreshUser = async () => {
        sessionStorage.setItem("checkout-harness-refreshes", String(Number(sessionStorage.getItem("checkout-harness-refreshes") || 0) + 1));
        if (sessionStorage.getItem("checkout-harness-defer-refresh")) {
          await new Promise((resolve) => { window.completeCheckoutAccountRefresh = resolve; });
        }
      };
      export function useAuth() { return {user, isLoading: false, refreshUser}; }`,
    "@/lib/analytics": `export const Analytics = new Proxy({}, {get: () => () => {}});`,
  };
  const result = await build({
    absWorkingDir: WEB_ROOT,
    stdin: {
      contents: `import React from "react";
        import {createRoot} from "react-dom/client";
        import {Toaster} from "sonner";
        import PricingPageClient from "@/components/marketing/PricingPageClient";
        import PurchaseConfirmedClient from "@/components/purchase/PurchaseConfirmedClient";
        import PurchaseRestoreClient from "@/components/purchase/PurchaseRestoreClient";
        const params = new URLSearchParams(window.location.search);
        const component = window.location.pathname === "/pricing"
          ? <PricingPageClient returnTo={params.get("returnTo")} paymentCancelled={params.get("payment") === "cancelled"} />
          : window.location.pathname === "/purchase/confirmed"
            ? <PurchaseConfirmedClient />
            : <PurchaseRestoreClient />;
        createRoot(document.getElementById("root")).render(<>{component}<Toaster /></>);`,
      loader: "tsx", resolveDir: WEB_ROOT, sourcefile: "checkout-revision-return-harness.tsx",
    },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic",
    define: {
      "process.env.NODE_ENV": JSON.stringify("test"),
      "process.env": JSON.stringify({ NEXT_PUBLIC_ENABLE_BILLING_UNLOCK: "true" }),
    },
    plugins: [{
      name: "checkout-browser-boundaries",
      setup(plugin: HarnessPlugin) {
        plugin.onResolve({ filter: /^(next\/|@\/)/ }, ({ path: modulePath }) => (
          modulePath in mocks ? { path: modulePath, namespace: "checkout-test-mock" } : undefined
        ));
        plugin.onLoad({ filter: /.*/, namespace: "checkout-test-mock" }, ({ path: modulePath }) => ({
          contents: mocks[modulePath], loader: "tsx", resolveDir: WEB_ROOT,
        }));
      },
    }],
  });
  harnessScript = result.outputFiles[0].text;
}

async function installCheckoutHarness(page: Page) {
  // The pricing, confirmation, restoration, payment polling hook, and action
  // links are the production components. Only Next, auth, analytics, and HTTP
  // are mocked. This suite needs no app server, app build, account, or purchase.
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) {
      await route.abort("blockedbyclient");
      throw new Error(`Unexpected external request in checkout harness: ${url.origin}${url.pathname}`);
    }
    if (["/pricing", "/purchase/confirmed", "/purchase/restore"].includes(url.pathname)) {
      return route.fulfill({ contentType: "text/html; charset=utf-8", body: `<!doctype html><html><head><meta charset="utf-8">
        <title>Checkout revision return — browser contract</title><style>
          body { font: 16px system-ui; margin: 24px; } #root { max-width: 1050px; margin: auto; }
          button, input { padding: 8px; margin: 4px; } button { cursor: pointer; }
          svg { width: 20px; height: 20px; } a { display: inline-block; margin: 4px; }
        </style></head><body><main id="root"></main><script src="/checkout-return-harness.js"></script></body></html>` });
    }
    if (url.pathname === "/checkout-return-harness.js") return route.fulfill({ contentType: "text/javascript", body: harnessScript });
    if (url.pathname === "/favicon.ico") return route.fulfill({ status: 204 });
    await route.abort("blockedbyclient");
    throw new Error(`Unmocked checkout harness request: ${url.pathname}`);
  });
}

async function setUser(page: Page, membership: "free" | "30d") {
  await page.addInitScript((value) => {
    sessionStorage.setItem("checkout-harness-user", JSON.stringify({ id: "user_checkout_return", email: "checkout@example.test", membership: value }));
  }, membership);
}

async function confirmPayment(page: Page, ok = true) {
  await page.route("**/api/billing/confirm", (route) => {
    expect(route.request().postDataJSON()).toEqual({ sessionId: SESSION_ID });
    return route.fulfill({
      status: ok ? 200 : 400,
      json: ok
        ? { ok: true, state: "unlocked", message: "Access unlocked.", pass: { id: "pass_return", tier: "30d", active: true, uses_remaining: 5, expires_at: "2026-10-04T00:00:00.000Z" } }
        : { ok: false, state: "not_paid", message: "This checkout could not be confirmed." },
    });
  });
}

test.describe("saved-report checkout return", () => {
  let runtimeErrors: string[] = [];
  test.beforeAll(buildCheckoutHarness);
  test.beforeEach(async ({ page }) => {
    runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    await installCheckoutHarness(page);
  });
  test.afterEach(() => {
    expect(runtimeErrors, "Production purchase components must not throw browser runtime errors").toEqual([]);
  });

  test("cancelled pricing retains the comparison in its purchase and recovery actions", async ({ page }) => {
    let checkoutBody: Record<string, unknown> | undefined;
    await page.route("**/api/checkout", (route) => {
      checkoutBody = route.request().postDataJSON();
      return route.fulfill({ status: 503, json: { ok: false, message: "Checkout test stopped before purchase." } });
    });
    await page.goto(`${ORIGIN}${PRICING_PATH}&payment=cancelled`);
    await expect(page.getByRole("status").filter({ hasText: "Checkout canceled." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to my comparison", exact: true })).toHaveAttribute("href", REVISION_PATH);
    await expect(page.getByRole("link", { name: "Restore access", exact: true })).toHaveAttribute("href", RESTORE_PATH);
    await page.getByTestId("pricing-hero-paid-action").click();
    await expect.poll(() => checkoutBody).toMatchObject({ tier: "30d", source: "pricing", returnTo: REVISION_PATH });
    expect(checkoutBody?.idempotencyKey).toEqual(expect.any(String));
    expect(Object.keys(checkoutBody || {}).sort()).toEqual(["idempotencyKey", "returnTo", "source", "tier"]);
  });

  test("a paid signed-in confirmation returns to the saved comparison after refreshing access", async ({ page }) => {
    await setUser(page, "30d");
    await confirmPayment(page);
    await page.goto(`${ORIGIN}${CONFIRMED_PATH}`);
    await expect(page.getByRole("link", { name: "Compare my revision", exact: true })).toHaveAttribute("href", REVISION_PATH);
    await expect(page.getByRole("link", { name: "Restore access", exact: true })).toHaveAttribute("href", RESTORE_PATH);
    expect(await page.evaluate(() => sessionStorage.getItem("checkout-harness-refreshes"))).toBe("1");
    await expect(page.getByText("Access confirmed", { exact: true })).toBeVisible();
    await expect(page.getByText("Your account has paid access. You can return to your report.", { exact: true })).toBeVisible();
  });

  test("confirmed payment waits for the account refresh before claiming access is ready", async ({ page }) => {
    await setUser(page, "30d");
    await page.addInitScript(() => sessionStorage.setItem("checkout-harness-defer-refresh", "1"));
    await confirmPayment(page);
    await page.goto(`${ORIGIN}${CONFIRMED_PATH}`);
    await expect(page.getByText("Checking account access", { exact: true })).toBeVisible();
    await expect(page.getByText("Your payment is confirmed. We’re checking access for your account.", { exact: true })).toBeVisible();
    await expect(page.getByText("Checking your account", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Refreshing access…", exact: true })).toBeDisabled();
    await expect(page.getByText("Access confirmed", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Ready when you are", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/Your (?:pass is active|account has paid access)/)).toHaveCount(0);
    await page.evaluate(() => (window as any).completeCheckoutAccountRefresh());
    await expect(page.getByText("Access confirmed", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Compare my revision", exact: true })).toHaveAttribute("href", REVISION_PATH);
  });

  test("a signed-out confirmation carries the comparison through sign-in", async ({ page }) => {
    await confirmPayment(page);
    await page.goto(`${ORIGIN}${CONFIRMED_PATH}`);
    const signIn = page.getByRole("link", { name: "Sign in to use your pass", exact: true });
    await expect(signIn).toBeVisible();
    const signInUrl = new URL((await signIn.getAttribute("href"))!, ORIGIN);
    expect(signInUrl.pathname).toBe("/auth");
    expect(signInUrl.searchParams.get("next")).toBe(REVISION_PATH);
    expect(signInUrl.searchParams.get("from")).toBe("paywall");
    await expect(page.getByRole("link", { name: "Compare my revision", exact: true })).toHaveCount(0);
    await expect(page.getByText("Payment confirmed", { exact: true })).toBeVisible();
    await expect(page.getByText("Your payment is confirmed. Sign in with your checkout email to use the pass.", { exact: true })).toBeVisible();
    await expect(page.getByText("Sign in to continue", { exact: true })).toBeVisible();
    await expect(page.getByText("Access confirmed", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Ready when you are", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/Your (?:pass is active|account has paid access)/)).toHaveCount(0);
  });

  test("confirmation without paid account access preserves context while requesting verification", async ({ page }) => {
    await setUser(page, "free");
    await confirmPayment(page);
    await page.goto(`${ORIGIN}${CONFIRMED_PATH}`);
    await expect(page.getByRole("link", { name: "Verify purchase access", exact: true })).toHaveAttribute("href", RESTORE_PATH);
    await expect(page.getByRole("link", { name: "Compare my revision", exact: true })).toHaveCount(0);
    await expect(page.getByText("Payment confirmed", { exact: true })).toBeVisible();
    await expect(page.getByText("Your payment is confirmed, but this account does not show the pass yet.", { exact: true })).toBeVisible();
    await expect(page.getByText("Verify account access", { exact: true })).toBeVisible();
    await expect(page.getByText("Access confirmed", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Ready when you are", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/Your (?:pass is active|account has paid access)/)).toHaveCount(0);
  });

  test("a failed confirmation keeps its pricing and recovery continuations", async ({ page }) => {
    await confirmPayment(page, false);
    await page.goto(`${ORIGIN}${CONFIRMED_PATH}`);
    await expect(page.getByRole("link", { name: "Back to pricing", exact: true })).toHaveAttribute("href", PRICING_PATH);
    await expect(page.getByRole("link", { name: "Restore access", exact: true })).toHaveAttribute("href", RESTORE_PATH);
    await expect(page.getByRole("link", { name: "Compare my revision", exact: true })).toHaveCount(0);
  });

  test("restore sign-in and back links keep the saved comparison", async ({ page }) => {
    await page.goto(`${ORIGIN}${RESTORE_PATH}`);
    const signIn = page.getByRole("link", { name: "Sign in", exact: true });
    await expect(signIn).toBeVisible();
    const signInUrl = new URL((await signIn.getAttribute("href"))!, ORIGIN);
    expect(signInUrl.pathname).toBe("/auth");
    expect(signInUrl.searchParams.get("next")).toBe(RESTORE_PATH);
    expect(signInUrl.searchParams.get("from")).toBe("paywall");
    await expect(page.getByRole("link", { name: "Back to my comparison", exact: true })).toHaveAttribute("href", REVISION_PATH);
  });

  test("restoring signed-in access leaves the saved comparison available", async ({ page }) => {
    await setUser(page, "free");
    await page.route("**/api/billing/restore", (route) => route.fulfill({ json: { ok: true, restored: 1, message: "Purchase access restored." } }));
    await page.goto(`${ORIGIN}${RESTORE_PATH}`);
    await page.getByRole("button", { name: "Restore access", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Purchase access restored." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to my comparison", exact: true })).toHaveAttribute("href", REVISION_PATH);
  });

  test("untrusted return destinations fall back across pricing, confirmation, and restore", async ({ page }) => {
    const foreignReturnTo = encodeURIComponent(`https://example.org${REVISION_PATH}`);
    let checkoutBody: Record<string, unknown> | undefined;
    await page.route("**/api/checkout", (route) => {
      checkoutBody = route.request().postDataJSON();
      return route.fulfill({ status: 503, json: { ok: false, message: "Checkout test stopped before purchase." } });
    });
    await page.goto(`${ORIGIN}/pricing?returnTo=${foreignReturnTo}`);
    await expect(page.getByRole("link", { name: "Back to my comparison", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Restore access", exact: true })).toHaveAttribute("href", "/purchase/restore");
    await page.getByTestId("pricing-hero-paid-action").click();
    await expect.poll(() => checkoutBody).toBeTruthy();
    expect(checkoutBody).not.toHaveProperty("returnTo");

    await confirmPayment(page);
    await page.goto(`${ORIGIN}/purchase/confirmed?session_id=${SESSION_ID}&returnTo=${foreignReturnTo}`);
    await expect(page.getByRole("link", { name: "Sign in to use your pass", exact: true })).toHaveAttribute("href", "/auth?next=%2Fworkspace&from=paywall");
    await expect(page.getByRole("link", { name: "Restore access", exact: true })).toHaveAttribute("href", "/purchase/restore");

    await page.goto(`${ORIGIN}/purchase/restore?returnTo=${foreignReturnTo}`);
    await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute("href", "/auth?from=paywall&next=/purchase/restore");
    await expect(page.getByRole("link", { name: "Back to workspace", exact: true })).toHaveAttribute("href", "/workspace");
    await expect(page.locator('a[href*="example.org"]')).toHaveCount(0);
  });
});
