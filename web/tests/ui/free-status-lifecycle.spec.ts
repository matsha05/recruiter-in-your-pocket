import { expect, test, type Page } from "@playwright/test";
import { createRequire } from "node:module";
import path from "node:path";

const WEB_ROOT = path.resolve(__dirname, "../..");
const requireExtension = createRequire(path.resolve(WEB_ROOT, "../extension/package.json"));
const { build } = requireExtension("esbuild");
const ORIGIN = "http://127.0.0.1:3100";
let script = "";

type Snapshot = {
  remaining: number;
  accountId: string | null;
  requests: Array<{ aborted: boolean; settled: boolean }>;
  refreshResult: boolean | null;
  userRefreshes: number;
};
type HarnessWindow = Window & {
  freeStatusHarness: {
    snapshot(): Snapshot;
    resolve(index: number, remaining: number): void;
  };
};

test.beforeAll(async () => {
  const result = await build({
    absWorkingDir: WEB_ROOT,
    stdin: {
      contents: `import React, {useState, useCallback} from "react";
        import {createRoot} from "react-dom/client";
        import {useFreeStatus} from "@/components/workspace/hooks/useFreeStatus";
        const requests = [];
        let state = {}, refreshResult = null, userRefreshes = 0;
        // Late responses deliberately ignore abort, so request ownership must
        // still prevent an obsolete read from mutating the current balance.
        window.fetch = (_url, init) => new Promise(resolve => requests.push({
          resolve, signal: init.signal, settled: false,
        }));
        window.freeStatusHarness = {
          snapshot: () => ({...state, refreshResult, userRefreshes,
            requests: requests.map(r => ({aborted: r.signal.aborted, settled: r.settled}))}),
          resolve(index, remaining) {
            const request = requests[index];
            request.settled = true;
            request.resolve(new Response(JSON.stringify({ok:true, free_uses_left:remaining})));
          },
        };
        function Probe() {
          const [remaining, setFreeUsesRemaining] = useState(1);
          const [accountId, setAccountId] = useState(null);
          const refreshUser = useCallback(async () => {userRefreshes += 1;}, []);
          const {refreshFreeStatus} = useFreeStatus({accountId, refreshUser, setFreeUsesRemaining, hasPaidAccess:false});
          state = {remaining, accountId};
          return <section><output data-testid="remaining">{remaining}</output>
            <button onClick={() => void refreshFreeStatus().then(value => {refreshResult=value;})}>Refresh</button>
            <button onClick={() => void refreshFreeStatus({fallbackDecrement:true, includeUserRefresh:true}).then(value => {refreshResult=value;})}>Settle consumed attempt</button>
            <button onClick={() => setAccountId("free-account-a")}>Sign in</button>
            <button onClick={() => setAccountId("free-account-b")}>Switch account</button>
          </section>;
        }
        function App() {
          const [mounted, setMounted] = useState(true);
          return <><button onClick={() => setMounted(false)}>Leave workspace</button>{mounted && <Probe/>}</>;
        }
        createRoot(document.getElementById("root")).render(<App/>);`,
      loader: "tsx", resolveDir: WEB_ROOT,
    },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic",
    define: { "process.env.NODE_ENV": JSON.stringify("test") },
  });
  script = result.outputFiles[0].text;
});

async function snapshot(page: Page) {
  return page.evaluate(() => (window as unknown as HarnessWindow).freeStatusHarness.snapshot());
}

async function resolve(page: Page, index: number, remaining: number) {
  await page.evaluate(({ index, remaining }) => {
    (window as unknown as HarnessWindow).freeStatusHarness.resolve(index, remaining);
  }, { index, remaining });
}

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.route("**/*", async (route) => {
    if (route.request().url() === `${ORIGIN}/balance-harness`) {
      return route.fulfill({ contentType: "text/html", body: '<!doctype html><div id="root"></div><script src="/balance-harness.js"></script>' });
    }
    if (route.request().url() === `${ORIGIN}/balance-harness.js`) {
      return route.fulfill({ contentType: "text/javascript", body: script });
    }
    return route.abort();
  });
  await page.goto(`${ORIGIN}/balance-harness`);
  await expect.poll(async () => (await snapshot(page)).requests.length).toBe(1);
});

test("a delayed mount response cannot restore a report consumed by a newer refresh", async ({ page }) => {
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect.poll(async () => (await snapshot(page)).requests.length).toBe(2);
  await resolve(page, 1, 0);
  await expect(page.getByTestId("remaining")).toHaveText("0");
  await resolve(page, 0, 1);
  await expect(page.getByTestId("remaining")).toHaveText("0");
  expect((await snapshot(page)).requests[0].aborted).toBe(true);
});

test("signing into a free account and switching between free accounts refreshes access", async ({ page }) => {
  await resolve(page, 0, 0);
  await expect(page.getByTestId("remaining")).toHaveText("0");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect.poll(async () => (await snapshot(page)).requests.length).toBe(2);
  await resolve(page, 1, 1);
  await expect(page.getByTestId("remaining")).toHaveText("1");
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect.poll(async () => (await snapshot(page)).requests.length).toBe(3);
  await page.getByRole("button", { name: "Switch account", exact: true }).click();
  await expect.poll(async () => (await snapshot(page)).requests.length).toBe(4);
  await resolve(page, 3, 0);
  await expect(page.getByTestId("remaining")).toHaveText("0");
  await resolve(page, 2, 1);
  await expect(page.getByTestId("remaining")).toHaveText("0");
});

test("a stalled status request settles conservatively and still refreshes the account", async ({ page }) => {
  await resolve(page, 0, 1);
  await page.getByRole("button", { name: "Settle consumed attempt" }).click();
  await expect.poll(async () => (await snapshot(page)).requests.length).toBe(2);
  await page.clock.fastForward(8_001);
  await expect.poll(async () => (await snapshot(page)).refreshResult).toBe(false);
  await expect(page.getByTestId("remaining")).toHaveText("0");
  expect((await snapshot(page)).userRefreshes).toBe(1);
  expect((await snapshot(page)).requests[1].aborted).toBe(true);
  await resolve(page, 1, 1);
  await expect(page.getByTestId("remaining")).toHaveText("0");
});

test("leaving the workspace cancels a pending settlement without a late account refresh", async ({ page }) => {
  await resolve(page, 0, 1);
  await page.getByRole("button", { name: "Settle consumed attempt" }).click();
  await expect.poll(async () => (await snapshot(page)).requests.length).toBe(2);
  await page.getByRole("button", { name: "Leave workspace" }).click();
  await expect.poll(async () => (await snapshot(page)).refreshResult).toBe(false);
  expect((await snapshot(page)).requests[1].aborted).toBe(true);
  await resolve(page, 1, 0);
  expect((await snapshot(page)).userRefreshes).toBe(0);
  expect((await snapshot(page)).remaining).toBe(1);
});
