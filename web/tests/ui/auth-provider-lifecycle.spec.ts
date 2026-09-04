import { expect, test, type Page } from "@playwright/test";
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
const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";
let harnessScript = "";

type Account = {
  id: string;
  email: string | null;
  membership?: string;
  paidUsesLeft?: number;
  freeUsesLeft?: number;
  canExportPdf?: boolean;
};
type RequestRecord = { id: number; path: string; method: string; settled: boolean };
type AuthEvent = { event: string; returnedThenable: boolean; readsInsideCallback: number };
type Snapshot = {
  users: Array<{ settled: boolean; duringCallback: boolean }>;
  requests: RequestRecord[];
  events: AuthEvent[];
  analytics: Array<{ kind: string; id?: string }>;
  unsubscribes: number;
  renders: Array<{ user: Account | null; isLoading: boolean }>;
};
interface BrowserHarness {
  snapshot(): Snapshot;
  resolveUser(index: number, userId: string | null): void;
  resolveRequest(index: number, payload: unknown, status: number): void;
  emit(event: string, userId: string | null): AuthEvent;
  refreshUser(): Promise<void>;
  signOut(): Promise<void>;
}
type HarnessWindow = Window & { __authProviderHarness: BrowserHarness };

async function buildProviderHarness() {
  const mocks: Record<string, string> = {
    "@/lib/supabase/browserClient": `
      const reads = [], requests = [], events = [], analytics = [], renders = [];
      let callback = null, inCallback = false, unsubscribes = 0;
      const account = id => id ? {id, email: id + "@example.test", user_metadata: {first_name: id.slice(0, 8)}} : null;
      const api = window.__authProviderHarness = {
        analytics, renders,
        snapshot() {
          return {
            users: reads.map(({settled, duringCallback}) => ({settled, duringCallback})),
            requests: requests.map(({id, path, method, settled}) => ({id, path, method, settled})),
            events: [...events], analytics: [...analytics], renders: [...renders], unsubscribes,
          };
        },
        resolveUser(index, userId) {
          const request = reads[index];
          if (!request || request.settled) throw new Error("Missing or settled user request " + index);
          request.settled = true;
          request.resolve({data: {user: account(userId)}, error: null});
        },
        resolveRequest(index, payload, status = 200) {
          const request = requests[index];
          if (!request || request.settled) throw new Error("Missing or settled API request " + index);
          request.settled = true;
          request.resolve(new Response(JSON.stringify(payload), {
            status, headers: {"content-type": "application/json"},
          }));
        },
        emit(event, userId) {
          if (!callback) throw new Error("Auth callback is not subscribed");
          const priorReads = reads.length;
          let returned;
          inCallback = true;
          try { returned = callback(event, userId ? {user: account(userId)} : null); }
          finally { inCallback = false; }
          const observation = {
            event, returnedThenable: Boolean(returned && typeof returned.then === "function"),
            readsInsideCallback: reads.length - priorReads,
          };
          events.push(observation);
          return observation;
        },
      };
      // Deliberately allow an aborted response to arrive: revision guards must
      // protect state even when transport cancellation is too late.
      window.fetch = (input, init = {}) => {
        const url = new URL(typeof input === "string" ? input : input.url, location.href);
        if (url.origin !== location.origin || !["/api/passes", "/api/free-status", "/api/auth/sign-out"].includes(url.pathname)) {
          throw new Error("Unexpected provider request: " + url.href);
        }
        return new Promise(resolve => requests.push({
          id: requests.length, path: url.pathname, method: init.method || "GET", settled: false, resolve,
        }));
      };
      const client = {auth: {
        getUser() {
          return new Promise(resolve => reads.push({resolve, settled: false, duringCallback: inCallback}));
        },
        onAuthStateChange(listener) {
          callback = listener;
          return {data: {subscription: {unsubscribe() {unsubscribes += 1; callback = null;}}}};
        },
      }};
      export function createSupabaseBrowserClient() { return client; }
    `,
    "@/lib/analytics": `
      export function identifyUser(id) { window.__authProviderHarness.analytics.push({kind: "identify", id}); }
      export function resetAnalytics() { window.__authProviderHarness.analytics.push({kind: "reset"}); }
    `,
    sonner: `export const toast = {error(message) {
      const alert = document.createElement("div");
      alert.setAttribute("role", "alert"); alert.textContent = message;
      document.getElementById("toasts").appendChild(alert);
    }};`,
  };
  const result = await build({
    absWorkingDir: WEB_ROOT,
    stdin: {
      contents: `import React, {useEffect, useState} from "react";
        import {createRoot} from "react-dom/client";
        import {AuthProvider, useAuth} from "@/components/providers/AuthProvider";
        function AccountProbe() {
          const {user, isLoading, refreshUser, signOut} = useAuth();
          window.__authProviderHarness.refreshUser = refreshUser;
          window.__authProviderHarness.signOut = signOut;
          useEffect(() => {
            window.__authProviderHarness.renders.push({user: user ? {...user} : null, isLoading});
          }, [user, isLoading]);
          return <section>
            <h1>Account lifecycle</h1>
            <pre data-testid="account">{JSON.stringify(user)}</pre>
            <output data-testid="loading">{String(isLoading)}</output>
            <button onClick={() => void refreshUser()}>Refresh account</button>
            <button onClick={() => void signOut()}>Sign out</button>
          </section>;
        }
        function Harness() {
          const [mounted, setMounted] = useState(true);
          return <><button onClick={() => setMounted(false)}>Unmount provider</button>
            {mounted ? <AuthProvider><AccountProbe /></AuthProvider> : <h1>Provider unmounted</h1>}</>;
        }
        createRoot(document.getElementById("root")).render(<Harness />);`,
      loader: "tsx", resolveDir: WEB_ROOT, sourcefile: "auth-provider-lifecycle-harness.tsx",
    },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic",
    define: { "process.env.NODE_ENV": JSON.stringify("test") },
    plugins: [{
      name: "auth-provider-browser-boundaries",
      setup(plugin: HarnessPlugin) {
        plugin.onResolve({ filter: /^(@\/lib\/(supabase\/browserClient|analytics)|sonner)$/ }, ({ path: modulePath }) => ({
          path: modulePath, namespace: "auth-provider-test-mock",
        }));
        plugin.onLoad({ filter: /.*/, namespace: "auth-provider-test-mock" }, ({ path: modulePath }) => ({
          contents: mocks[modulePath], loader: "tsx", resolveDir: WEB_ROOT,
        }));
      },
    }],
  });
  harnessScript = result.outputFiles[0].text;
}

async function installHarness(page: Page) {
  await page.clock.install();
  // Run the actual provider and account-status helpers. Only Supabase, API
  // transport, analytics, and the toast renderer are replaced. No server,
  // account, remote service, or live session is involved.
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === ORIGIN && url.pathname === "/account-harness") return route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><title>Account provider browser contract</title></head>
        <body><main id="root"></main><aside id="toasts"></aside><script src="/account-harness.js"></script></body></html>`,
    });
    if (url.origin === ORIGIN && url.pathname === "/account-harness.js") {
      return route.fulfill({ contentType: "text/javascript", body: harnessScript });
    }
    if (url.origin === ORIGIN && url.pathname === "/") {
      return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Signed out</title><h1>Signed out</h1>" });
    }
    if (url.origin === ORIGIN && url.pathname === "/favicon.ico") return route.fulfill({ status: 204 });
    await route.abort("blockedbyclient");
    throw new Error(`Unexpected browser request in provider harness: ${url.origin}${url.pathname}`);
  });
  await page.goto(`${ORIGIN}/account-harness`);
  await expect(page).toHaveTitle("Account provider browser contract");
  await expect(page.getByRole("heading", { name: "Account lifecycle" })).toBeVisible();
  await expect.poll(async () => (await snapshot(page)).users.length).toBe(1);
}

function snapshot(page: Page) {
  return page.evaluate(() => (window as unknown as HarnessWindow).__authProviderHarness.snapshot());
}
function resolveUser(page: Page, index: number, userId: string | null) {
  return page.evaluate(({ index, userId }) => {
    (window as unknown as HarnessWindow).__authProviderHarness.resolveUser(index, userId);
  }, { index, userId });
}
function resolveRequest(page: Page, index: number, payload: unknown, status = 200) {
  return page.evaluate(({ index, payload, status }) => {
    (window as unknown as HarnessWindow).__authProviderHarness.resolveRequest(index, payload, status);
  }, { index, payload, status });
}
function emit(page: Page, event: string, userId: string | null) {
  return page.evaluate(({ event, userId }) => {
    return (window as unknown as HarnessWindow).__authProviderHarness.emit(event, userId);
  }, { event, userId });
}
async function settle(page: Page) {
  await page.clock.runFor(30);
}
async function expectAccount(page: Page, expected: Partial<Account> | null) {
  await expect.poll(async () => JSON.parse(await page.getByTestId("account").innerText())).toEqual(
    expected === null ? null : expect.objectContaining(expected),
  );
}
async function startStatusRequests(page: Page, userIndex: number, userId = USER_A) {
  const prior = (await snapshot(page)).requests.length;
  await resolveUser(page, userIndex, userId);
  await expect.poll(async () => (await snapshot(page)).requests.length).toBe(prior + 2);
  const requests = (await snapshot(page)).requests.slice(prior);
  expect(requests.map((request) => request.path).sort()).toEqual(["/api/free-status", "/api/passes"]);
  expect(requests.every((request) => request.method === "GET")).toBe(true);
  return requests;
}
async function finishStatusRequests(page: Page, requests: RequestRecord[], credits: number, free = 0) {
  for (const request of requests) {
    await resolveRequest(page, request.id, request.path === "/api/passes"
      ? { ok: true, passes: [{ tier: "30d", uses_remaining: credits, expires_at: "2099-01-01T00:00:00.000Z", revoked_at: null }] }
      : { ok: true, free_uses_left: free });
  }
  await settle(page);
}
async function signInInitially(page: Page, credits = 4) {
  await finishStatusRequests(page, await startStatusRequests(page, 0), credits);
  await expectAccount(page, { id: USER_A, membership: "credit", paidUsesLeft: credits, canExportPdf: true });
  await expect(page.getByTestId("loading")).toHaveText("false");
}

test.describe("account provider lifecycle", () => {
  let runtimeErrors: string[] = [];
  test.beforeAll(buildProviderHarness);
  test.beforeEach(({ page }) => {
    runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
  });
  test.afterEach(() => expect(runtimeErrors, "No unhandled provider errors").toEqual([]));

  test("auth callbacks return synchronously and defer verified reads until after the callback", async ({ page }) => {
    await installHarness(page);
    await resolveUser(page, 0, null);
    await expect(page.getByTestId("loading")).toHaveText("false");
    for (const event of ["INITIAL_SESSION", "SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"]) {
      const prior = (await snapshot(page)).users.length;
      expect(await emit(page, event, USER_A)).toEqual({ event, returnedThenable: false, readsInsideCallback: 0 });
      await settle(page);
      await expect.poll(async () => (await snapshot(page)).users.length).toBe(prior + 1);
      await finishStatusRequests(page, await startStatusRequests(page, prior), 3);
      await expectAccount(page, { id: USER_A, paidUsesLeft: 3 });
    }
    expect((await snapshot(page)).users.every((request) => !request.duringCallback)).toBe(true);
  });

  for (const pending of ["identity", "account status"] as const) {
    test(`a signed-out event rejects a late ${pending} response`, async ({ page }) => {
      await installHarness(page);
      const requests = pending === "account status" ? await startStatusRequests(page, 0) : [];
      await emit(page, "SIGNED_OUT", null);
      await expectAccount(page, null);
      if (pending === "identity") await resolveUser(page, 0, USER_A);
      else await finishStatusRequests(page, requests, 5, 1);
      await settle(page);
      await expectAccount(page, null);
      await expect(page.getByTestId("loading")).toHaveText("false");
      const state = await snapshot(page);
      expect(state.analytics.filter((event) => event.kind === "identify")).toEqual([]);
      expect(state.requests).toHaveLength(requests.length);
    });

    test(`an account switch rejects the previous account's late ${pending} response`, async ({ page }) => {
      await installHarness(page);
      const oldRequests = pending === "account status" ? await startStatusRequests(page, 0) : [];
      await emit(page, "SIGNED_IN", USER_B);
      await settle(page);
      await expect.poll(async () => (await snapshot(page)).users.length).toBe(2);
      await finishStatusRequests(page, await startStatusRequests(page, 1, USER_B), 2, 1);
      await expectAccount(page, { id: USER_B, paidUsesLeft: 2, freeUsesLeft: 1 });
      const beforeLate = (await snapshot(page)).requests.length;
      if (pending === "identity") await resolveUser(page, 0, USER_A);
      else await finishStatusRequests(page, oldRequests, 5);
      await settle(page);
      await expectAccount(page, { id: USER_B, paidUsesLeft: 2, freeUsesLeft: 1 });
      const state = await snapshot(page);
      expect(state.requests).toHaveLength(beforeLate);
      expect(state.analytics.filter((event) => event.kind === "identify").every((event) => event.id === USER_B)).toBe(true);
    });
  }

  test("a verified identity that disagrees with the latest auth event cannot replace that account", async ({ page }) => {
    await installHarness(page);
    await resolveUser(page, 0, null);
    await emit(page, "SIGNED_IN", USER_B);
    await settle(page);
    await expect.poll(async () => (await snapshot(page)).users.length).toBe(2);
    await resolveUser(page, 1, USER_A);
    await settle(page);
    const state = await snapshot(page);
    expect(state.renders.some((render) => render.user?.id === USER_A)).toBe(false);
    expect(state.analytics.filter((event) => event.kind === "identify")).toEqual([]);
    expect(state.requests).toEqual([]);
  });

  test("a manual refresh can discover a newly signed-in cookie session without an auth event", async ({ page }) => {
    await installHarness(page);
    await resolveUser(page, 0, null);
    await expect(page.getByTestId("loading")).toHaveText("false");
    await page.getByRole("button", { name: "Refresh account" }).click();
    await finishStatusRequests(page, await startStatusRequests(page, 1), 3);
    await expectAccount(page, { id: USER_A, paidUsesLeft: 3, canExportPdf: true });
  });

  for (const pending of ["identity", "account status"] as const) {
    test(`the newest same-account refresh wins when an older ${pending} response arrives last`, async ({ page }) => {
      await installHarness(page);
      await signInInitially(page);
      await page.getByRole("button", { name: "Refresh account" }).click();
      await expect.poll(async () => (await snapshot(page)).users.length).toBe(2);
      const oldRequests = pending === "account status" ? await startStatusRequests(page, 1) : [];
      await page.getByRole("button", { name: "Refresh account" }).click();
      const newRequests = await startStatusRequests(page, 2);
      await finishStatusRequests(page, newRequests, 0, 0);
      await expectAccount(page, { id: USER_A, membership: "free", canExportPdf: true, freeUsesLeft: 0 });
      const beforeLate = (await snapshot(page)).requests.length;
      if (pending === "identity") await resolveUser(page, 1, USER_A);
      else await finishStatusRequests(page, oldRequests, 5, 1);
      await settle(page);
      await expectAccount(page, { id: USER_A, membership: "free", canExportPdf: true, freeUsesLeft: 0 });
      expect(JSON.parse(await page.getByTestId("account").innerText()).paidUsesLeft).toBeUndefined();
      expect((await snapshot(page)).requests).toHaveLength(beforeLate);
    });
  }

  for (const pending of ["identity", "account status"] as const) {
    test(`unmount ignores an unfinished ${pending} request and unsubscribes`, async ({ page }) => {
      await installHarness(page);
      const requests = pending === "account status" ? await startStatusRequests(page, 0) : [];
      await page.getByRole("button", { name: "Unmount provider" }).click();
      await expect(page.getByRole("heading", { name: "Provider unmounted" })).toBeVisible();
      const unmounted = await snapshot(page);
      expect(unmounted.unsubscribes).toBe(1);
      if (pending === "identity") await resolveUser(page, 0, USER_A);
      else await finishStatusRequests(page, requests, 4);
      await settle(page);
      const after = await snapshot(page);
      expect(after.requests).toHaveLength(requests.length);
      expect(after.analytics).toEqual(unmounted.analytics);
      expect(after.renders).toEqual(unmounted.renders);
    });
  }

  for (const pending of ["identity", "account status"] as const) {
    test(`pending sign-out blocks duplicate requests and a late ${pending} refresh until navigation succeeds`, async ({ page }) => {
      await installHarness(page);
      await signInInitially(page);
      await page.getByRole("button", { name: "Refresh account" }).click();
      await expect.poll(async () => (await snapshot(page)).users.length).toBe(2);
      const oldRequests = pending === "account status" ? await startStatusRequests(page, 1) : [];
      const beforeSignOut = await snapshot(page);
      await page.evaluate(() => {
        const harness = (window as unknown as HarnessWindow).__authProviderHarness;
        void harness.signOut(); void harness.signOut(); void harness.refreshUser();
      });
      await emit(page, "TOKEN_REFRESHED", USER_A);
      if (pending === "identity") await resolveUser(page, 1, USER_A);
      else await finishStatusRequests(page, oldRequests, 5, 1);
      await settle(page);
      const state = await snapshot(page);
      expect(state.users).toHaveLength(2);
      expect(state.requests.filter((request) => request.path === "/api/passes")).toHaveLength(pending === "identity" ? 1 : 2);
      expect(state.analytics).toEqual(beforeSignOut.analytics);
      await expectAccount(page, { id: USER_A, paidUsesLeft: 4, freeUsesLeft: 0 });
      const signOuts = state.requests.filter((request) => request.path === "/api/auth/sign-out");
      expect(signOuts).toHaveLength(1);
      expect(signOuts[0].method).toBe("POST");
      await resolveRequest(page, signOuts[0].id, { ok: true });
      await expect(page).toHaveURL(`${ORIGIN}/`);
      await expect(page.getByRole("heading", { name: "Signed out" })).toBeVisible();
    });
  }

  test("failed sign-out preserves the account, shows an error, and permits a successful retry", async ({ page }) => {
    await installHarness(page);
    await signInInitially(page);
    const analyticsBeforeSignOut = (await snapshot(page)).analytics;
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect.poll(async () => (await snapshot(page)).requests.filter((request) => request.path === "/api/auth/sign-out").length).toBe(1);
    const failedRequest = (await snapshot(page)).requests.find((request) => request.path === "/api/auth/sign-out")!;
    await resolveRequest(page, failedRequest.id, { ok: false }, 503);
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("alert")).toContainText(/sign.?out|sign you out/i);
    await expectAccount(page, { id: USER_A, paidUsesLeft: 4, canExportPdf: true });
    await expect(page).toHaveURL(`${ORIGIN}/account-harness`);
    expect((await snapshot(page)).analytics).toEqual(analyticsBeforeSignOut);
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect.poll(async () => (await snapshot(page)).requests.filter((request) => request.path === "/api/auth/sign-out").length).toBe(2);
    const retried = (await snapshot(page)).requests.filter((request) => request.path === "/api/auth/sign-out")[1];
    await resolveRequest(page, retried.id, { ok: true });
    await expect(page.getByRole("heading", { name: "Signed out" })).toBeVisible();
  });

  test("initial account lookup timeout releases loading without inventing a signed-in account", async ({ page }) => {
    await installHarness(page);
    await expect(page.getByTestId("loading")).toHaveText("true");
    await page.clock.runFor(6_501);
    await expect(page.getByTestId("loading")).toHaveText("false");
    await expectAccount(page, null);
    await resolveUser(page, 0, USER_A);
    await settle(page);
    await expectAccount(page, null);
    expect((await snapshot(page)).requests).toEqual([]);
  });

  test("sign-out timeout retains the account, ignores a late success, and permits retry", async ({ page }) => {
    await installHarness(page);
    await signInInitially(page);
    const analyticsBeforeSignOut = (await snapshot(page)).analytics;
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page.getByTestId("loading")).toHaveText("true");
    const timedOut = (await snapshot(page)).requests.find((request) => request.path === "/api/auth/sign-out")!;
    await page.clock.runFor(6_501);
    await expect(page.getByTestId("loading")).toHaveText("false");
    await expect(page.getByRole("alert")).toContainText(/sign.?out|sign you out/i);
    await expectAccount(page, { id: USER_A, paidUsesLeft: 4, canExportPdf: true });
    await resolveRequest(page, timedOut.id, { ok: true });
    await settle(page);
    await expect(page).toHaveURL(`${ORIGIN}/account-harness`);
    await expectAccount(page, { id: USER_A, paidUsesLeft: 4 });
    expect((await snapshot(page)).analytics).toEqual(analyticsBeforeSignOut);
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect.poll(async () => (await snapshot(page)).requests.filter((request) => request.path === "/api/auth/sign-out").length).toBe(2);
    const retried = (await snapshot(page)).requests.filter((request) => request.path === "/api/auth/sign-out")[1];
    await resolveRequest(page, retried.id, { ok: true });
    await expect(page.getByRole("heading", { name: "Signed out" })).toBeVisible();
  });
});
