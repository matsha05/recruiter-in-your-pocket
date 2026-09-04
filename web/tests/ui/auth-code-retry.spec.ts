import { expect, test, type Page, type Route } from "@playwright/test";
import { createRequire } from "node:module";
import path from "node:path";

const WEB_ROOT = path.resolve(__dirname, "../..");
const requireExtension = createRequire(path.resolve(WEB_ROOT, "../extension/package.json"));
const { build } = requireExtension("esbuild");
interface HarnessPlugin {
  onResolve(options: { filter: RegExp }, callback: (args: { path: string }) => { path: string; namespace: string }): void;
  onLoad(options: { filter: RegExp; namespace: string }, callback: (args: { path: string }) => { contents: string; loader: string; resolveDir: string }): void;
}
const ORIGIN = "http://127.0.0.1:3100";
const REJECTED_CODE = "11112222";
const EDITED_CODE = "33334444";
let harnessScript = "";

async function buildAuthHarness() {
  const mocks: Record<string, string> = {
    "next/link": `import React from "react"; export default function Link({href, children, ...props}) { return <a href={href} {...props}>{children}</a>; }`,
    "next/navigation": `const router = { push(href) { window.history.pushState(null, "", href); }, refresh() {} }; export function useRouter() { return router; }`,
    "@/lib/supabase/browserClient": `export function createSupabaseBrowserClient() { throw new Error("Unexpected real account operation"); }`,
    "@/lib/launch/flags": `export function isLaunchFlagEnabled() { return false; }`,
  };
  const result = await build({
    absWorkingDir: WEB_ROOT,
    stdin: {
      contents: `import React, {StrictMode, useState} from "react";
        import {createRoot} from "react-dom/client";
        import {AuthFlow} from "@/components/auth/AuthFlow";
        window.__authSuccesses = 0;
        function Harness() {
          const [isOpen, setOpen] = useState(true);
          window.__authHarness = {setOpen};
          return <AuthFlow isOpen={isOpen} onSuccess={() => { window.__authSuccesses += 1; }} />;
        }
        createRoot(document.getElementById("root")).render(<StrictMode><Harness /></StrictMode>);`,
      loader: "tsx", resolveDir: WEB_ROOT, sourcefile: "auth-code-retry-harness.tsx",
    },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic",
    define: { "process.env.NODE_ENV": JSON.stringify("test") },
    plugins: [{
      name: "auth-browser-boundaries",
      setup(plugin: HarnessPlugin) {
        plugin.onResolve({ filter: /^(next\/(link|navigation)|@\/lib\/(supabase\/browserClient|launch\/flags))$/ }, ({ path: modulePath }) => ({
          path: modulePath, namespace: "auth-test-mock",
        }));
        plugin.onLoad({ filter: /.*/, namespace: "auth-test-mock" }, ({ path: modulePath }) => ({
          contents: mocks[modulePath], loader: "tsx", resolveDir: WEB_ROOT,
        }));
      },
    }],
  });
  harnessScript = result.outputFiles[0].text;
}

async function installAuthHarness(page: Page) {
  await page.clock.install();
  // The real React component and form controls run in Chromium. Every request
  // is intercepted, including the document; no Next server or email is used.
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) {
      await route.abort("blockedbyclient");
      throw new Error(`Unexpected external auth test request: ${url.origin}${url.pathname}`);
    }
    if (url.pathname === "/signin") return route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><title>Auth browser contract</title><style>
        body { font: 16px system-ui; margin: 24px; } button, input { margin: 5px; padding: 10px; }
        svg { width: 18px; height: 18px; } .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; }
      </style></head><body><main id="root"></main><script src="/auth-harness.js"></script></body></html>`,
    });
    if (url.pathname === "/auth-harness.js") return route.fulfill({ contentType: "text/javascript", body: harnessScript });
    if (url.pathname === "/favicon.ico") return route.fulfill({ status: 204 });
    await route.abort("blockedbyclient");
    throw new Error(`Unmocked auth test request: ${url.pathname}`);
  });
  await page.route("**/api/auth/send-code", (route) => route.fulfill({ json: { ok: true } }));
}

async function enterCodeStep(page: Page) {
  await page.goto(`${ORIGIN}/signin`);
  await expect(page.getByLabel("Email address", { exact: true })).toHaveAttribute("placeholder", "you@example.com");
  await page.getByLabel("Email address", { exact: true }).fill("candidate@example.test");
  await page.getByRole("button", { name: "Send sign-in code", exact: true }).click();
  await expect(page.getByLabel("Login code", { exact: true })).toBeVisible();
}

test.describe("one-time sign-in code verification", () => {
  let runtimeErrors: string[] = [];
  test.beforeAll(buildAuthHarness);
  test.beforeEach(({ page }) => {
    runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
  });
  test.afterEach(() => expect(runtimeErrors).toEqual([]));

  test("a rejected code stays idle and visible until a deliberate retry or an edit", async ({ page }) => {
    await installAuthHarness(page);
    const attempts: string[] = [];
    await page.route("**/api/auth/verify-code", (route) => {
      attempts.push(route.request().postDataJSON().code);
      return route.fulfill({ status: 400, json: { ok: false, message: "This code has expired." } });
    });
    await enterCodeStep(page);
    const input = page.getByLabel("Login code", { exact: true });
    const verify = page.getByRole("button", { name: "Verify Code", exact: true });
    await input.fill(REJECTED_CODE);
    await expect(page.getByRole("alert")).toHaveText("This code has expired.");
    await expect(page.getByRole("alert")).toBeFocused();
    await expect(verify).toBeEnabled();
    await page.clock.runFor(5_000);
    expect(attempts).toEqual([REJECTED_CODE]);
    await expect(page.getByRole("alert")).toHaveText("This code has expired.");
    await expect(verify.locator(".animate-spin")).toHaveCount(0);

    await verify.click();
    await expect.poll(() => attempts.length).toBe(2);
    await expect(page.getByRole("alert")).toHaveText("This code has expired.");
    await page.clock.runFor(3_000);
    expect(attempts).toEqual([REJECTED_CODE, REJECTED_CODE]);

    await input.fill(REJECTED_CODE.slice(0, 7));
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(verify).toBeDisabled();
    await input.fill(REJECTED_CODE);
    await expect.poll(() => attempts.length).toBe(3);
    await page.clock.runFor(3_000);
    expect(attempts).toEqual([REJECTED_CODE, REJECTED_CODE, REJECTED_CODE]);
    await expect(verify).toBeEnabled();
  });

  test("edits during verification wait for the current request and discard its stale error", async ({ page }) => {
    await installAuthHarness(page);
    const pending: Route[] = [];
    await page.route("**/api/auth/verify-code", (route) => { pending.push(route); });
    await enterCodeStep(page);
    await page.getByLabel("Login code", { exact: true }).fill(REJECTED_CODE);
    await expect.poll(() => pending.length).toBe(1);
    await page.locator("form").evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
    await page.getByLabel("Login code", { exact: true }).fill(EDITED_CODE);
    await expect(page.getByRole("button", { name: "Verify Code", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Use a different email", exact: true })).toBeDisabled();
    await page.clock.runFor(31_000);
    await expect(page.getByRole("button", { name: "Resend code", exact: true })).toBeDisabled();
    expect(pending).toHaveLength(1);
    await pending[0].fulfill({ status: 400, json: { ok: false, message: "The previous value was rejected." } });
    await expect.poll(() => pending.length).toBe(2);
    expect(pending.map((route) => route.request().postDataJSON().code)).toEqual([REJECTED_CODE, EDITED_CODE]);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await pending[1].fulfill({ status: 400, json: { ok: false, message: "Check the new code." } });
    await expect(page.getByRole("alert")).toHaveText("Check the new code.");
    await expect(page.getByRole("button", { name: "Verify Code", exact: true })).toBeEnabled();
    await page.clock.runFor(3_000);
    expect(pending).toHaveLength(2);
  });

  test("a successful in-flight code finishes once even if the candidate has edited the field", async ({ page }) => {
    await installAuthHarness(page);
    const pending: Route[] = [];
    await page.route("**/api/auth/verify-code", (route) => { pending.push(route); });
    await enterCodeStep(page);
    await page.getByLabel("Login code", { exact: true }).fill(REJECTED_CODE);
    await expect.poll(() => pending.length).toBe(1);
    await page.getByLabel("Login code", { exact: true }).fill(EDITED_CODE);
    await pending[0].fulfill({ json: { ok: true, user: { firstName: "Candidate" } } });
    await expect(page).toHaveURL(`${ORIGIN}/workspace`);
    await page.clock.runFor(3_000);
    expect(pending).toHaveLength(1);
    expect(await page.evaluate(() => (window as unknown as { __authSuccesses: number }).__authSuccesses)).toBe(1);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("resend failure stays recoverable and a successful resend clears the old attempt", async ({ page }) => {
    await installAuthHarness(page);
    let sendAttempts = 0;
    let verifyAttempts = 0;
    await page.route("**/api/auth/send-code", (route) => {
      sendAttempts += 1;
      return route.fulfill(sendAttempts === 2
        ? { status: 503, json: { ok: false, message: "Email is temporarily unavailable." } }
        : { json: { ok: true } });
    });
    await page.route("**/api/auth/verify-code", (route) => {
      verifyAttempts += 1;
      return route.fulfill(verifyAttempts === 1
        ? { status: 400, json: { ok: false, message: "This code has expired." } }
        : { json: { ok: true, user: {} } });
    });
    await enterCodeStep(page);
    const input = page.getByLabel("Login code", { exact: true });
    await input.fill(REJECTED_CODE);
    await expect(page.getByRole("alert")).toHaveText("This code has expired.");
    await page.clock.runFor(31_000);
    await page.getByRole("button", { name: "Resend code", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("Email is temporarily unavailable.");
    await expect(input).toHaveValue(REJECTED_CODE);
    expect(verifyAttempts).toBe(1);
    await page.getByRole("button", { name: "Resend code", exact: true }).click();
    await expect(input).toHaveValue("");
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Verify Code", exact: true })).toBeDisabled();
    await input.fill(REJECTED_CODE);
    await expect(page.getByLabel("First name", { exact: true })).toBeVisible();
    expect(verifyAttempts).toBe(2);
    expect(sendAttempts).toBe(3);
    await page.getByRole("button", { name: "Skip for now", exact: true }).click();
    await expect(page).toHaveURL(`${ORIGIN}/workspace`);
  });

  test("closing the flow ignores a delayed verification result", async ({ page }) => {
    await installAuthHarness(page);
    let pending: Route | undefined;
    await page.route("**/api/auth/verify-code", (route) => { pending = route; });
    await enterCodeStep(page);
    await page.getByLabel("Login code", { exact: true }).fill(REJECTED_CODE);
    await expect.poll(() => Boolean(pending)).toBe(true);
    await page.evaluate(() => (window as unknown as { __authHarness: { setOpen(value: boolean): void } }).__authHarness.setOpen(false));
    await expect(page.getByLabel("Email address", { exact: true })).toHaveValue("");
    await pending!.fulfill({ json: { ok: true, user: { firstName: "Candidate" } } });
    await page.clock.runFor(3_000);
    expect(await page.evaluate(() => (window as unknown as { __authSuccesses: number }).__authSuccesses)).toBe(0);
    await expect(page).toHaveURL(`${ORIGIN}/signin`);
    await page.evaluate(() => (window as unknown as { __authHarness: { setOpen(value: boolean): void } }).__authHarness.setOpen(true));
    await expect(page.getByRole("button", { name: "Send sign-in code", exact: true })).toBeEnabled();
  });
});
