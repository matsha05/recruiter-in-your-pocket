import { expect, test, type Page } from "@playwright/test";
import { createRequire } from "node:module";
import path from "node:path";
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
const REPORT_ID = "22222222-2222-4222-8222-222222222222";
const REPORT_PATH = `/reports/${REPORT_ID}`;
const REPORT = ResumeFeedbackResponseSchema.parse(schemaValidReport);
const USER = { id: "11111111-1111-4111-8111-111111111111", email: "candidate@example.test", user_metadata: { first_name: "Candidate" } };
let script = "";
let styles = "";

async function buildHarness() {
  const mocks: Record<string, string> = {
    "next/link": `import React from "react"; export default function Link({href, children, ...props}) { return <a href={href} {...props}>{children}</a>; }`,
    "next/navigation": `import {useMemo, useSyncExternalStore} from "react";
      const subscribe = callback => { window.addEventListener("popstate", callback); return () => window.removeEventListener("popstate", callback); };
      const snapshot = () => location.pathname + location.search;
      const navigate = (href, method) => { history[method](null, "", href); window.dispatchEvent(new PopStateEvent("popstate")); };
      const router = {push: href => navigate(href, "pushState"), replace: href => navigate(href, "replaceState"), refresh() {}};
      export function useRouter() { return router; }
      export function usePathname() { return useSyncExternalStore(subscribe, snapshot).split("?")[0]; }
      export function useSearchParams() { const href = useSyncExternalStore(subscribe, snapshot); return useMemo(() => new URLSearchParams(href.split("?")[1] || ""), [href]); }`,
    "@/lib/supabase/browserClient": `
      const client = {auth: {
        async getUser() { const response = await fetch("/test-session"); return {data: {user: await response.json()}, error: null}; },
        // Server OTP cookies do not dispatch a browser SDK auth event. This is
        // deliberate: a persistent signed-out provider must not magically heal.
        onAuthStateChange() { return {data: {subscription: {unsubscribe() {}}}}; },
        async updateUser() { return {error: null}; },
      }};
      export function createSupabaseBrowserClient() { return client; }`,
    "@/lib/analytics": `export function identifyUser() {} export function resetAnalytics() {} export const Analytics = new Proxy({}, {get: () => () => {}});`,
  };
  const result = await build({
    absWorkingDir: WEB_ROOT,
    stdin: {
      contents: `import React, {useState} from "react";
        import {createRoot} from "react-dom/client";
        import {AuthProvider, useAuth} from "@/components/providers/AuthProvider";
        import AuthClient from "@/components/auth/AuthClient";
        import AuthModal from "@/components/shared/AuthModal";
        import ReportDetailClient from "@/components/reports/ReportDetailClient";
        import {usePathname} from "next/navigation";
        function Harness() {
          const pathname = usePathname();
          const {user, isLoading, refreshUser} = useAuth();
          const [open, setOpen] = useState(true);
          const [successes, setSuccesses] = useState(0);
          const [closes, setCloses] = useState(0);
          return <>
            <header data-testid="account-header">{isLoading ? "Checking account" : user ? "Signed in" : "Log in"}</header>
            <output data-testid="modal-successes">{successes}</output><output data-testid="modal-closes">{closes}</output>
            {pathname === "/auth" ? <AuthClient />
              : pathname === "/modal" ? <AuthModal isOpen={open} onClose={() => {setOpen(false); setCloses(value => value + 1);}}
                onSuccess={async () => {await refreshUser(); setSuccesses(value => value + 1);}} />
              : pathname.startsWith("/reports/") ? <ReportDetailClient reportId={pathname.split("/")[2]} />
              : <h1>Workspace destination</h1>}
          </>;
        }
        createRoot(document.getElementById("root")).render(<AuthProvider><Harness /></AuthProvider>);`,
      loader: "tsx", resolveDir: WEB_ROOT, sourcefile: "auth-page-refresh-harness.tsx",
    },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic",
    outdir: "/tmp/riyp-auth-page-refresh-bundle",
    define: { "process.env.NODE_ENV": JSON.stringify("test"), "process.env": JSON.stringify({}) },
    plugins: [{ name: "auth-page-boundaries", setup(plugin: HarnessPlugin) {
      plugin.onResolve({filter: /^(next\/|@\/)/}, ({path: modulePath}) => modulePath in mocks ? {path: modulePath, namespace: "auth-page-mock"} : undefined);
      plugin.onLoad({filter: /.*/, namespace: "auth-page-mock"}, ({path: modulePath}) => ({contents: mocks[modulePath], loader: "tsx", resolveDir: WEB_ROOT}));
    }}],
  });
  script = result.outputFiles.find((file: {path: string}) => file.path.endsWith(".js")).text;
  styles = result.outputFiles.find((file: {path: string}) => file.path.endsWith(".css"))?.text || "";
}

async function installHarness(page: Page) {
  let serverSignedIn = false;
  const requests = { documents: [] as string[], users: 0, passes: 0, reports: 0, verifies: 0 };
  // Every document and API request is intercepted. A real window navigation
  // recreates the production provider from the simulated server-side session.
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== ORIGIN) {
      await route.abort("blockedbyclient");
      throw new Error(`Unexpected external auth request: ${url.origin}${url.pathname}`);
    }
    if (request.isNavigationRequest()) {
      requests.documents.push(`${url.pathname}${url.search}`);
      return route.fulfill({contentType: "text/html; charset=utf-8", body: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Auth document refresh contract</title>
        <style>${styles}body {font:16px system-ui; margin:24px} button,input {padding:10px;margin:5px} svg {width:20px;height:20px} .sr-only {position:absolute;width:1px;height:1px;overflow:hidden}</style>
        </head><body><main id="root"></main><script src="/auth-page-harness.js"></script></body></html>`});
    }
    if (url.pathname === "/auth-page-harness.js") return route.fulfill({contentType: "text/javascript", body: script});
    if (url.pathname === "/favicon.ico") return route.fulfill({status: 204});
    if (url.pathname === "/test-session") { requests.users += 1; return route.fulfill({json: serverSignedIn ? USER : null}); }
    if (url.pathname === "/api/auth/send-code") return route.fulfill({json: {ok: true}});
    if (url.pathname === "/api/auth/verify-code") {
      requests.verifies += 1;
      serverSignedIn = true;
      return route.fulfill({json: {ok: true, user: {firstName: "Candidate"}}});
    }
    if (url.pathname === "/api/passes") { requests.passes += 1; return route.fulfill({json: {ok: true, passes: []}}); }
    if (url.pathname === "/api/free-status") return route.fulfill({json: {ok: true, free_uses_left: 0}});
    if (url.pathname === `/api/reports/${REPORT_ID}`) {
      requests.reports += 1;
      return route.fulfill(serverSignedIn ? {json: {ok: true, report: REPORT}} : {status: 401, json: {ok: false}});
    }
    await route.abort("blockedbyclient");
    throw new Error(`Unmocked auth request: ${url.pathname}`);
  });
  return requests;
}

async function signIn(page: Page) {
  await expect(page.getByTestId("account-header")).toHaveText("Log in");
  await page.getByLabel("Email address", {exact: true}).fill("candidate@example.test");
  await page.getByRole("button", {name: "Send sign-in code", exact: true}).click();
  await page.getByLabel("Login code", {exact: true}).fill("12345678");
}

test.describe("page sign-in after server OTP verification", () => {
  let runtimeErrors: string[] = [];
  test.beforeAll(buildHarness);
  test.beforeEach(({page}) => {
    runtimeErrors = [];
    page.on("pageerror", error => runtimeErrors.push(error.message));
  });
  test.afterEach(() => expect(runtimeErrors).toEqual([]));

  test("returning from protected-report sign-in recreates auth and opens the report without a manual reload", async ({page}) => {
    const requests = await installHarness(page);
    await page.goto(`${ORIGIN}${REPORT_PATH}`);
    await expect(page.getByRole("heading", {name: "Sign in to view this report", exact: true})).toBeVisible();
    expect(requests.reports).toBe(0);
    await page.getByRole("link", {name: "Sign in", exact: true}).click();
    await expect(page).toHaveURL(`${ORIGIN}/auth?from=reports&next=${encodeURIComponent(REPORT_PATH)}`);
    await signIn(page);
    await expect(page).toHaveURL(`${ORIGIN}${REPORT_PATH}`);
    await expect(page.getByTestId("account-header")).toHaveText("Signed in");
    await expect(page.locator("#section-first-impression h1")).toHaveText(REPORT.first_impression);
    expect(requests.documents).toEqual([REPORT_PATH, `/auth?from=reports&next=${encodeURIComponent(REPORT_PATH)}`, REPORT_PATH]);
    expect(requests.users).toBe(3);
    expect(requests.passes).toBe(1);
    expect(requests.reports).toBe(1);
    expect(requests.verifies).toBe(1);
  });

  test("an external next destination falls back to the workspace document", async ({page}) => {
    const requests = await installHarness(page);
    await page.goto(`${ORIGIN}/auth?next=${encodeURIComponent("https://outside.example.test/private")}`);
    await signIn(page);
    await expect(page).toHaveURL(`${ORIGIN}/workspace`);
    await expect(page.getByTestId("account-header")).toHaveText("Signed in");
    await expect(page.getByRole("heading", {name: "Workspace destination"})).toBeVisible();
    expect(requests.documents).toHaveLength(2);
    expect(requests.documents[1]).toBe("/workspace");
    expect(requests.passes).toBe(1);
  });

  test("modal sign-in retains its parent refresh callback without replacing the document", async ({page}) => {
    const requests = await installHarness(page);
    await page.goto(`${ORIGIN}/modal`);
    await signIn(page);
    await expect(page.getByTestId("account-header")).toHaveText("Signed in");
    await expect(page.getByTestId("modal-successes")).toHaveText("1");
    await expect(page.getByTestId("modal-closes")).toHaveText("1");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(`${ORIGIN}/modal`);
    expect(requests.documents).toEqual(["/modal"]);
    expect(requests.passes).toBe(1);
    expect(requests.verifies).toBe(1);
  });
});
