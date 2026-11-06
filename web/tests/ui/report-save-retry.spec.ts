import { expect, test, type Page, type Route } from "@playwright/test";
import { createRequire } from "node:module";
import path from "node:path";
import { ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY } from "../../lib/reports/anonymous-report-recovery-client";
import { ResumeFeedbackResponseSchema } from "../../lib/validation/schemas";
import { schemaValidReport } from "../helpers/report-fidelity-fixture";

const WEB_ROOT = path.resolve(__dirname, "../..");
const requireExtension = createRequire(path.resolve(WEB_ROOT, "../extension/package.json"));
const { build } = requireExtension("esbuild");
interface HarnessPlugin {
  onResolve(options: { filter: RegExp }, callback: (args: { path: string }) => { path: string; namespace: string } | undefined): void;
  onLoad(options: { filter: RegExp; namespace: string }, callback: (args: { path: string }) => { contents: string; loader: string; resolveDir: string }): void;
}
const ORIGIN = "http://127.0.0.1:3100";
const RECOVERY_ID = "11111111-1111-4111-8111-111111111111";
const SAVED_REPORT_ID = "22222222-2222-4222-8222-222222222222";
const REPORT = ResumeFeedbackResponseSchema.parse(schemaValidReport);
let harnessScript = "";
let harnessStyles = "";

async function buildSaveHarness() {
  const mocks: Record<string, string> = {
    "next/link": `import React from "react"; export default function Link({href, children, ...props}) { return <a href={href} {...props}>{children}</a>; }`,
    "next/navigation": `import {useMemo, useSyncExternalStore} from "react";
      const subscribe = (callback) => { window.addEventListener("popstate", callback); return () => window.removeEventListener("popstate", callback); };
      const snapshot = () => window.location.pathname + window.location.search;
      const navigate = (href, method) => { window.history[method](null, "", href); window.dispatchEvent(new PopStateEvent("popstate")); };
      const router = { push: (href) => navigate(href, "pushState"), replace: (href) => navigate(href, "replaceState"), refresh() {} };
      export function useRouter() { return router; }
      export function usePathname() { return useSyncExternalStore(subscribe, snapshot).split("?")[0]; }
      export function useSearchParams() { const location = useSyncExternalStore(subscribe, snapshot); return useMemo(() => new URLSearchParams(location.split("?")[1] || ""), [location]); }`,
    "@/components/providers/AuthProvider": `import {useSyncExternalStore} from "react";
      const signedInUser = {id: "33333333-3333-4333-8333-333333333333", email: "candidate@example.test", membership: "free", canExportPdf: false};
      let user = sessionStorage.getItem("save-test-signed-in") === "true" ? signedInUser : null;
      const subscribe = (callback) => { window.addEventListener("test-auth-change", callback); return () => window.removeEventListener("test-auth-change", callback); };
      const snapshot = () => user;
      const refreshUser = async () => {
        if (!user) { user = signedInUser; window.dispatchEvent(new Event("test-auth-change")); }
      };
      export function useAuth() { return {user: useSyncExternalStore(subscribe, snapshot), isLoading: false, refreshUser}; }`,
    "@/components/shared/AuthModal": `import React from "react";
      export default function AuthModal({isOpen, onSuccess}) {
        return isOpen ? <section role="dialog" aria-label="Test sign-in boundary"><button type="button" onClick={() => void onSuccess()}>Complete test sign-in</button></section> : null;
      }`,
    "@/components/workspace/HistorySidebar": `export default function HistorySidebar() { return null; }`,
    "@/components/workspace/PaywallModal": `export default function PaywallModal() { return null; }`,
    "@/components/workspace/LinkedInModeSection": `export default function LinkedInModeSection() { return null; }`,
    "@/lib/analytics": `export const Analytics = new Proxy({}, {get: () => () => {}});`,
    "@/lib/supabase/browserClient": `export function createSupabaseBrowserClient() { throw new Error("Unexpected account mutation in save-retry test"); }`,
  };
  const result = await build({
    absWorkingDir: WEB_ROOT,
    stdin: {
      contents: `import React from "react";
        import {createRoot} from "react-dom/client";
        import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
        import {Toaster} from "sonner";
        import WorkspaceClient from "@/components/workspace/WorkspaceClient";
        createRoot(document.getElementById("root")).render(
          <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
            <WorkspaceClient /><Toaster />
          </QueryClientProvider>);`,
      loader: "tsx", resolveDir: WEB_ROOT, sourcefile: "report-save-retry-harness.tsx",
    },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic",
    outdir: "/tmp/riyp-report-save-retry-bundle",
    define: { "process.env.NODE_ENV": JSON.stringify("test"), "process.env": JSON.stringify({}) },
    plugins: [{
      name: "report-save-browser-boundaries",
      setup(plugin: HarnessPlugin) {
        plugin.onResolve({ filter: /^(next\/|@\/)/ }, ({ path: modulePath }) => (
          modulePath in mocks ? { path: modulePath, namespace: "save-test-mock" } : undefined
        ));
        plugin.onLoad({ filter: /.*/, namespace: "save-test-mock" }, ({ path: modulePath }) => ({
          contents: mocks[modulePath], loader: "tsx", resolveDir: WEB_ROOT,
        }));
      },
    }],
  });
  harnessScript = result.outputFiles.find((file: { path: string }) => file.path.endsWith(".js")).text;
  harnessStyles = result.outputFiles.find((file: { path: string }) => file.path.endsWith(".css"))?.text || "";
}

async function installSaveHarness(page: Page) {
  // Production workspace, report, save prompt, overlays, hooks, and save client
  // run together. Only account verification and unrelated surfaces are mocked;
  // all HTTP requests remain local and intercepted, with no model calls.
  await page.addInitScript(({ key, recoveryId }) => {
    localStorage.setItem(key, JSON.stringify({ version: 1, recoveryId, createdAt: Date.now() }));
  }, { key: ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY, recoveryId: RECOVERY_ID });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) {
      await route.abort("blockedbyclient");
      throw new Error(`Unexpected external save test request: ${url.origin}${url.pathname}`);
    }
    if (url.pathname === "/workspace") return route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Report save retry browser contract</title><style>${harnessStyles}
          body { font: 16px system-ui; margin: 24px; } #root { max-width: 1050px; margin: auto; }
          button, input, textarea { padding: 8px; margin: 4px; } button { cursor: pointer; }
          svg { width: 20px; height: 20px; }
          [role="dialog"] { position: fixed; inset: 8% 5% auto; background: white; padding: 24px; border: 1px solid #888; z-index: 100; }
          .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
          [hidden] { display: none !important; }
        </style></head><body><main id="root"></main><script src="/save-harness.js"></script></body></html>`,
    });
    if (url.pathname === "/save-harness.js") return route.fulfill({ contentType: "text/javascript", body: harnessScript });
    if (url.pathname === "/favicon.ico") return route.fulfill({ status: 204 });
    await route.abort("blockedbyclient");
    throw new Error(`Unmocked save test request: ${url.pathname}`);
  });
  await page.route("**/api/free-status", (route) => route.fulfill({ json: { ok: true, free_uses_left: 0 } }));
  await page.route("**/api/generation-status", (route) => route.fulfill({ json: { ok: true, paused: false } }));
  await page.route("**/api/reports/recovery?*", (route) => route.fulfill({ json: { ok: true, recovery_id: RECOVERY_ID, report: REPORT } }));
}

test.describe("saving an anonymous report after sign-in", () => {
  let runtimeErrors: string[] = [];
  test.beforeAll(buildSaveHarness);
  test.beforeEach(async ({ page }) => {
    runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    await installSaveHarness(page);
  });
  test.afterEach(() => expect(runtimeErrors).toEqual([]));

  test("a signed-in reload offers an explicit save and preserves retry after failure", async ({ page }) => {
    await page.addInitScript(() => { sessionStorage.setItem("save-test-signed-in", "true"); });
    const attempts: Route[] = [];
    await page.route("**/api/reports/recovery", async (route) => {
      expect(route.request().method()).toBe("POST");
      expect(route.request().postDataJSON()).toEqual({ recovery_id: RECOVERY_ID });
      attempts.push(route);
      await route.fulfill(attempts.length === 1
        ? { status: 403, json: { ok: false, errorCode: "INVALID_ORIGIN", message: "This recovery claim was not accepted." } }
        : { json: { ok: true, reportId: SAVED_REPORT_ID, recovery_id: RECOVERY_ID } });
    });
    await page.goto(`${ORIGIN}/workspace`);
    const heading = page.locator("#section-first-impression h1");
    const save = page.getByTestId("workspace-keep-report");
    await expect(heading).toHaveText(REPORT.first_impression);
    await expect(save).toHaveAccessibleName("Save this version");
    await expect(save).toBeEnabled();
    expect(attempts).toHaveLength(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await save.click();
    await expect(page.getByRole("alert")).toContainText("We couldn’t save this report to My reports. Keep this tab open and try again.");
    await expect(save).toHaveAccessibleName("Try saving again");
    await expect(heading).toHaveText(REPORT.first_impression);
    expect(attempts).toHaveLength(1);
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).recoveryId, ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY)).toBe(RECOVERY_ID);
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await save.click();
    await expect(save).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(heading).toHaveText(REPORT.first_impression);
    expect(attempts).toHaveLength(2);
    expect(await page.evaluate((key) => localStorage.getItem(key), ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY)).toBeNull();
  });

  for (const viewport of [{ label: "desktop", width: 1440, height: 900 }, { label: "mobile", width: 390, height: 844 }]) {
    test(`a failed claim stays visible and can be retried on ${viewport.label}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      const attempts: Route[] = [];
      await page.route("**/api/reports/recovery", async (route) => {
        expect(route.request().method()).toBe("POST");
        expect(route.request().postDataJSON()).toEqual({ recovery_id: RECOVERY_ID });
        attempts.push(route);
        if (attempts.length === 1) await route.fulfill({ status: 403, json: { ok: false, errorCode: "INVALID_ORIGIN", message: "This recovery claim was not accepted." } });
      });
      await page.goto(`${ORIGIN}/workspace`);
      const heading = page.locator("#section-first-impression h1");
      await expect(heading).toHaveText(REPORT.first_impression);
      // On a phone, Save rides in the section row, which slides in once the opening read has scrolled away.
      if (viewport.width < 640) {
        await page.locator("#section-fixes").evaluate((section) => window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: "instant" }));
      }
      await page.getByTestId("workspace-keep-report").click();
      await page.getByRole("button", { name: "Sign in to save", exact: true }).click();
      await page.getByRole("button", { name: "Complete test sign-in", exact: true }).click();

      const retry = page.getByTestId("workspace-keep-report");
      const error = page.getByRole("alert");
      await expect(error).toContainText("We couldn’t save this report to My reports. Keep this tab open and try again.");
      await expect(retry).toHaveAccessibleName("Try saving again");
      await expect(retry).toBeEnabled();
      await expect(heading).toHaveText(REPORT.first_impression);
      await expect(page.getByRole("dialog", { name: "Test sign-in boundary" })).toHaveCount(0);
      expect(attempts).toHaveLength(1);
      expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).recoveryId, ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY)).toBe(RECOVERY_ID);
      await error.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`report-save-error-${viewport.label}.png`) });

      // Two synchronous clicks arrive before React can paint the disabled state.
      // The production save client's in-flight guard must still post only once.
      await retry.evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
      await expect.poll(() => attempts.length).toBe(2);
      await expect(retry).toBeDisabled();
      await expect(retry).toHaveAttribute("aria-busy", "true");
      await expect(heading).toHaveText(REPORT.first_impression);
      await attempts[1].fulfill({ json: { ok: true, reportId: SAVED_REPORT_ID, recovery_id: RECOVERY_ID } });

      await expect(retry).toHaveCount(0);
      await expect(error).toHaveCount(0);
      await expect(heading).toHaveText(REPORT.first_impression);
      expect(attempts).toHaveLength(2);
      expect(await page.evaluate((key) => localStorage.getItem(key), ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY)).toBeNull();
    });
  }
});
