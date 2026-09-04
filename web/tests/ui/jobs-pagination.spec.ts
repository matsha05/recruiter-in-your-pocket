import { expect, test, type Page, type Route } from "@playwright/test";

import path from "node:path";
import { createRequire } from "node:module";

const WEB_ROOT = path.resolve(__dirname, "../..");
const requireExtension = createRequire(path.resolve(WEB_ROOT, "../extension/package.json"));
const { build } = requireExtension("esbuild");
// Keep production web typechecking independent of the extension install. The
// browser test resolves esbuild only when it runs, after extension dependencies.
interface HarnessPlugin {
  onResolve(options: { filter: RegExp }, callback: (args: { path: string }) => { path: string; namespace: string }): void;
  onLoad(options: { filter: RegExp; namespace: string }, callback: (args: { path: string }) => { contents: string; loader: string; resolveDir: string }): void;
}
const HARNESS_ORIGIN = "http://127.0.0.1:3100";
let harnessScript = "";
let detailHarnessScript = "";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";
const NEXT_CURSOR = "opaque page/2+?saved=20&older=yes";
const LOAD_MORE_ERROR = "We could not load more jobs. Your loaded jobs are still available.";
const RESUME_TEXT = "Alex Rivera\nProgram Manager\nLed cross-functional launches with product, operations, and support teams. Built review cadences and improved launch checklists. Coordinated stakeholder updates and clarified ownership across teams.";

type JobStatus = "saved" | "interested" | "applying" | "interviewing" | "archived";

function makeJobs(first: number, count: number, status: JobStatus = "saved") {
  return Array.from({ length: count }, (_, index) => {
    const number = String(first + index).padStart(2, "0");
    return {
      id: `00000000-0000-4000-8000-${String(first + index).padStart(12, "0")}`,
      externalId: `posting-${number}`,
      title: `Program Manager ${number}`,
      company: `Company ${number}`,
      location: "Remote (US)",
      url: `https://example.test/jobs/${number}`,
      source: "linkedin",
      status,
      score: null,
      capturedAt: Date.UTC(2026, 8, 1) - (first + index) * 60_000,
    };
  });
}

type MockJob = ReturnType<typeof makeJobs>[number];

async function buildJobsHarness(component: 'JobsClient' | 'JobDetailClient' = 'JobsClient') {
  const mocks: Record<string, string> = {
    "next/link": `import React from "react";
      export default function Link({href, children, ...props}) {
        return <a href={href} {...props}>{children}</a>;
      }`,
    "next/navigation": `export function useRouter() {
      return { push(href) { window.history.pushState(null, "", href); } };
    }`,
    "@/components/providers/AuthProvider": `import React, {createContext, useContext, useState} from "react";
      const AuthContext = createContext(null);
      export function TestAuthProvider({children}) {
        const [user, setUser] = useState({id: ${JSON.stringify(USER_A)}, email: "candidate@example.test"});
        window.__jobsHarness = {setAccount(id) { setUser(id ? {id, email: "candidate@example.test"} : null); }};
        return <AuthContext.Provider value={{user, isLoading: false}}>{children}</AuthContext.Provider>;
      }
      export function useAuth() { return useContext(AuthContext); }`,
  };
  const result = await build({
    absWorkingDir: WEB_ROOT,
    stdin: {
      contents: `import React from "react";
        import {createRoot} from "react-dom/client";
        import {TestAuthProvider} from "@/components/providers/AuthProvider";
        import Component from "@/components/jobs/${component}";
        function DetailHarness() {
          const [jobId, setJobId] = React.useState("00000000-0000-4000-8000-000000000001");
          window.__jobsDetailHarness = {setJobId};
          return <Component jobId={jobId} />;
        }
        createRoot(document.getElementById("root")).render(<TestAuthProvider>${component === 'JobsClient' ? '<Component />' : '<DetailHarness />'}</TestAuthProvider>);`,
      loader: "tsx",
      resolveDir: WEB_ROOT,
      sourcefile: "jobs-pagination-harness.tsx",
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": JSON.stringify("test") },
    plugins: [{
      name: "jobs-browser-boundaries",
      setup(plugin: HarnessPlugin) {
        plugin.onResolve({ filter: /^(next\/(link|navigation)|@\/components\/providers\/AuthProvider)$/ }, ({ path: modulePath }) => ({
          path: modulePath, namespace: "jobs-test-mock",
        }));
        plugin.onLoad({ filter: /.*/, namespace: "jobs-test-mock" }, ({ path: modulePath }) => ({
          contents: mocks[modulePath], loader: "tsx", resolveDir: WEB_ROOT,
        }));
      },
    }],
  });
  return result.outputFiles[0].text as string;
}

async function installJobsHarness(page: Page, script = harnessScript) {
  // Bundle the actual list, resume card, and delete dialog. Only the surrounding
  // auth and Next navigation boundaries are mocked; every request is fulfilled
  // in-process, so no Next server, real account, or remote service is involved.
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== HARNESS_ORIGIN) {
      await route.abort("blockedbyclient");
      throw new Error(`Unexpected external request in jobs harness: ${url.origin}${url.pathname}`);
    }
    if (url.pathname === "/jobs") {
      return route.fulfill({
        contentType: "text/html",
        body: `<!doctype html><html><head><title>Jobs — browser contract</title>
          <style>
            body { font: 16px system-ui; margin: 24px; }
            #root { max-width: 1000px; margin: auto; }
            article { padding: 8px; border-bottom: 1px solid #ddd; }
            button, input, select { padding: 8px; margin: 4px; }
            button { cursor: pointer; } svg { width: 20px; height: 20px; }
            [role="dialog"] { position: fixed; inset: 20% 20% auto; background: white;
              border: 1px solid #888; padding: 24px; z-index: 10; }
            .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; }
          </style></head><body><main id="root"></main><script src="/jobs-harness.js"></script></body></html>`,
      });
    }
    if (url.pathname === "/jobs-harness.js") {
      return route.fulfill({ contentType: "text/javascript", body: script });
    }
    if (url.pathname === "/favicon.ico") return route.fulfill({ status: 204 });
    await route.abort("blockedbyclient");
    throw new Error(`Unmocked jobs harness request: ${url.pathname}`);
  });
  await page.route("**/api/user/default-resume", (route) => route.fulfill({
    json: { success: true, data: { hasResume: false } },
  }));

  return {
    async switchAccount(userId: string) {
      await page.evaluate((id) => {
        (window as unknown as { __jobsHarness: { setAccount(id: string): void } }).__jobsHarness.setAccount(id);
      }, userId);
    },
  };
}

function fulfillPage(route: Route, jobs: MockJob[], nextCursor: string | null, userId = USER_A) {
  return route.fulfill({ json: { success: true, userId, jobs, nextCursor } });
}

function jobButtons(page: Page) {
  return page.getByRole("button", { name: /^Open Program Manager \d+ at Company \d+$/ });
}

function jobButton(page: Page, number: number) {
  const label = String(number).padStart(2, "0");
  return page.getByRole("button", { name: `Open Program Manager ${label} at Company ${label}`, exact: true });
}

test.describe("saved jobs pagination", () => {
  let runtimeErrors: string[];
  test.beforeAll(async () => {
    harnessScript = await buildJobsHarness();
    detailHarnessScript = await buildJobsHarness('JobDetailClient');
  });
  test.beforeEach(({ page }) => {
    runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
  });
  test.afterEach(() => {
    expect(runtimeErrors, "The actual jobs components should not throw browser runtime errors").toEqual([]);
  });

  test("loads beyond twenty jobs, preserves the opaque cursor, and deduplicates page overlap", async ({ page }) => {
    await installJobsHarness(page);
    const requestedCursors: Array<string | null> = [];
    await page.route("**/api/extension/saved-jobs*", (route) => {
      const url = new URL(route.request().url());
      const cursor = url.searchParams.get("cursor");
      requestedCursors.push(cursor);
      expect(route.request().method()).toBe("GET");
      expect([...url.searchParams.keys()]).toEqual(cursor === null ? [] : ["cursor"]);
      if (cursor === null) return fulfillPage(route, makeJobs(1, 20), NEXT_CURSOR);
      expect(cursor).toBe(NEXT_CURSOR);
      return fulfillPage(route, makeJobs(20, 6), null);
    });

    await page.goto(`${HARNESS_ORIGIN}/jobs`);
    await expect(page).toHaveTitle(/Jobs/);
    await expect(page.getByRole("heading", { name: "Jobs", exact: true })).toBeVisible();
    await expect(jobButtons(page)).toHaveCount(20);
    await expect(page.getByLabel("Search loaded jobs", { exact: true })).toBeVisible();
    await expect(page.getByText("20 jobs loaded", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Load more jobs", exact: true }).click();

    await expect(jobButtons(page)).toHaveCount(25);
    await expect(jobButton(page, 20)).toHaveCount(1);
    await expect(jobButton(page, 25)).toBeVisible();
    await expect(page.getByText("25 saved jobs", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Search saved jobs", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Load more jobs", exact: true })).toHaveCount(0);
    expect(requestedCursors).toEqual([null, NEXT_CURSOR]);
  });

  test("an overlapping delayed page cannot restore a successfully deleted job", async ({ page }) => {
    await installJobsHarness(page);
    let pendingPage: Route | undefined;
    await page.route("**/api/extension/saved-jobs*", (route) => {
      const cursor = new URL(route.request().url()).searchParams.get("cursor");
      if (cursor === null) return fulfillPage(route, makeJobs(1, 20), NEXT_CURSOR);
      expect(cursor).toBe(NEXT_CURSOR);
      pendingPage = route;
    });
    await page.route(`**/api/extension/saved-jobs/${makeJobs(20, 1)[0].id}`, (route) => {
      expect(route.request().method()).toBe("DELETE");
      return route.fulfill({ json: { success: true } });
    });

    await page.goto(`${HARNESS_ORIGIN}/jobs`);
    await expect(jobButtons(page)).toHaveCount(20);
    await page.getByRole("button", { name: "Load more jobs", exact: true }).click();
    await expect.poll(() => Boolean(pendingPage)).toBe(true);
    await page.getByRole("button", { name: "Delete Program Manager 20", exact: true }).click();
    const confirmation = page.getByRole("dialog", { name: "Delete Job", exact: true });
    await confirmation.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirmation).toHaveCount(0);
    await expect(jobButtons(page)).toHaveCount(19);
    await expect(jobButton(page, 20)).toHaveCount(0);

    await fulfillPage(pendingPage!, makeJobs(20, 4), null);
    await expect(jobButtons(page)).toHaveCount(22);
    await expect(jobButton(page, 20)).toHaveCount(0);
    await expect(jobButton(page, 23)).toBeVisible();
    await expect(page.getByText("22 saved jobs", { exact: true })).toBeVisible();
  });

  test("failed next page retains every loaded job and retries the same cursor without duplicates", async ({ page }) => {
    await installJobsHarness(page);
    const requestedCursors: Array<string | null> = [];
    let nextPageAttempts = 0;
    await page.route("**/api/extension/saved-jobs*", (route) => {
      const cursor = new URL(route.request().url()).searchParams.get("cursor");
      requestedCursors.push(cursor);
      if (cursor === null) return fulfillPage(route, makeJobs(1, 20), NEXT_CURSOR);
      expect(cursor).toBe(NEXT_CURSOR);
      nextPageAttempts += 1;
      if (nextPageAttempts === 1) {
        return route.fulfill({ status: 503, json: { success: false, error: "Temporary test failure" } });
      }
      return fulfillPage(route, makeJobs(20, 4), null);
    });

    await page.goto(`${HARNESS_ORIGIN}/jobs`);
    await expect(jobButtons(page)).toHaveCount(20);
    await page.getByRole("button", { name: "Load more jobs", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText(LOAD_MORE_ERROR);
    await expect(jobButtons(page)).toHaveCount(20);
    await expect(jobButton(page, 1)).toHaveCount(1);
    await expect(jobButton(page, 20)).toHaveCount(1);
    await expect(page.getByText("20 jobs loaded", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Retry loading jobs", exact: true }).click();

    await expect(jobButtons(page)).toHaveCount(23);
    await expect(jobButton(page, 20)).toHaveCount(1);
    await expect(jobButton(page, 23)).toBeVisible();
    await expect(page.getByText(LOAD_MORE_ERROR, { exact: true })).toHaveCount(0);
    await expect(page.getByText("23 saved jobs", { exact: true })).toBeVisible();
    expect(requestedCursors).toEqual([null, NEXT_CURSOR, NEXT_CURSOR]);
  });

  test("search and status describe loaded scope and can load matches from an empty filtered view", async ({ page }) => {
    await installJobsHarness(page);
    await page.route("**/api/extension/saved-jobs*", (route) => {
      const cursor = new URL(route.request().url()).searchParams.get("cursor");
      if (cursor === null) return fulfillPage(route, makeJobs(1, 20), NEXT_CURSOR);
      expect(cursor).toBe(NEXT_CURSOR);
      return fulfillPage(route, makeJobs(21, 3, "interviewing"), null);
    });

    await page.goto(`${HARNESS_ORIGIN}/jobs`);
    const search = page.getByLabel("Search loaded jobs", { exact: true });
    await expect(jobButtons(page)).toHaveCount(20);
    await search.fill("Company 01");
    await expect(jobButtons(page)).toHaveCount(1);
    await expect(jobButton(page, 1)).toBeVisible();
    await expect(page.getByText("20 jobs loaded", { exact: true })).toBeVisible();

    await search.fill("Company 21");
    await page.getByLabel("Status", { exact: true }).selectOption("interviewing");
    await expect(jobButtons(page)).toHaveCount(0);
    await expect(page.getByText(/No loaded jobs match your filters\./)).toBeVisible();
    await expect(page.getByRole("button", { name: "Load more jobs", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Load more jobs", exact: true }).click();

    await expect(jobButtons(page)).toHaveCount(1);
    await expect(jobButton(page, 21)).toBeVisible();
    await expect(page.getByLabel("Search saved jobs", { exact: true })).toHaveValue("Company 21");
    await expect(page.getByLabel("Status", { exact: true })).toHaveValue("interviewing");
    await expect(page.getByText("23 saved jobs", { exact: true })).toBeVisible();
    await page.getByLabel("Search saved jobs", { exact: true }).fill("");
    await expect(jobButtons(page)).toHaveCount(3);
    await page.getByLabel("Status", { exact: true }).selectOption("all");
    await expect(jobButtons(page)).toHaveCount(23);
  });

  test("reloading starts from the first page instead of retaining older pages or a cursor", async ({ page }) => {
    await installJobsHarness(page);
    const requestedCursors: Array<string | null> = [];
    await page.route("**/api/extension/saved-jobs*", (route) => {
      const cursor = new URL(route.request().url()).searchParams.get("cursor");
      requestedCursors.push(cursor);
      return cursor === null
        ? fulfillPage(route, makeJobs(1, 20), NEXT_CURSOR)
        : fulfillPage(route, makeJobs(21, 3), null);
    });

    await page.goto(`${HARNESS_ORIGIN}/jobs`);
    await expect(jobButtons(page)).toHaveCount(20);
    await page.getByRole("button", { name: "Load more jobs", exact: true }).click();
    await expect(jobButtons(page)).toHaveCount(23);
    await page.reload();

    await expect(jobButtons(page)).toHaveCount(20);
    await expect(jobButton(page, 21)).toHaveCount(0);
    await expect(page.getByText("20 jobs loaded", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Search loaded jobs", { exact: true })).toHaveValue("");
    await expect(page.getByRole("button", { name: "Load more jobs", exact: true })).toBeVisible();
    expect(requestedCursors).toEqual([null, NEXT_CURSOR, null]);
  });

  test("updating the matching resume resets pagination and ignores the older pending page", async ({ page }) => {
    await installJobsHarness(page);
    let resumeUpdated = false;
    let pendingPage: Route | undefined;
    const requestedCursors: Array<string | null> = [];
    await page.route("**/api/user/default-resume", (route) => {
      if (route.request().method() !== "POST") {
        return route.fulfill({ json: { success: true, data: { hasResume: false } } });
      }
      resumeUpdated = true;
      return route.fulfill({ json: { success: true, data: {
        hasResume: true, resumePreview: RESUME_TEXT, resumeFilename: "updated-resume.txt",
        skillsCount: 4, updatedAt: "2026-09-04T12:00:00.000Z", hasEmbedding: false,
      } } });
    });
    await page.route("**/api/extension/saved-jobs*", (route) => {
      const cursor = new URL(route.request().url()).searchParams.get("cursor");
      requestedCursors.push(cursor);
      if (cursor !== null) {
        expect(cursor).toBe(NEXT_CURSOR);
        pendingPage = route;
        return;
      }
      return fulfillPage(route, makeJobs(resumeUpdated ? 31 : 1, 20), NEXT_CURSOR);
    });

    await page.goto(`${HARNESS_ORIGIN}/jobs`);
    await expect(jobButtons(page)).toHaveCount(20);
    await page.getByRole("button", { name: "Load more jobs", exact: true }).click();
    await expect.poll(() => Boolean(pendingPage)).toBe(true);
    await page.getByLabel("Choose a resume for job matching", { exact: true }).setInputFiles({
      name: "updated-resume.txt", mimeType: "text/plain", buffer: Buffer.from(RESUME_TEXT),
    });
    await expect(jobButton(page, 31)).toBeVisible();
    await pendingPage!.fulfill({ json: { success: true, userId: USER_A, jobs: makeJobs(21, 3), nextCursor: null } });

    await expect(jobButtons(page)).toHaveCount(20);
    await expect(jobButton(page, 1)).toHaveCount(0);
    await expect(jobButton(page, 21)).toHaveCount(0);
    await expect(page.getByText("20 jobs loaded", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Load more jobs", exact: true })).toBeEnabled();
    expect(requestedCursors).toEqual([null, NEXT_CURSOR, null]);
  });

  test("an account change clears loaded jobs and cannot append a delayed page from the previous account", async ({ page }) => {
    const auth = await installJobsHarness(page);
    let accountId = USER_A;
    let pendingOldPage: Route | undefined;
    let pendingNewAccount: Route | undefined;
    await page.route("**/api/extension/saved-jobs*", (route) => {
      const cursor = new URL(route.request().url()).searchParams.get("cursor");
      if (accountId === USER_B) {
        expect(cursor).toBeNull();
        pendingNewAccount = route;
        return;
      }
      if (cursor !== null) {
        expect(cursor).toBe(NEXT_CURSOR);
        pendingOldPage = route;
        return;
      }
      return fulfillPage(route, makeJobs(1, 20), NEXT_CURSOR);
    });

    await page.goto(`${HARNESS_ORIGIN}/jobs`);
    await expect(jobButtons(page)).toHaveCount(20);
    await page.getByRole("button", { name: "Load more jobs", exact: true }).click();
    await expect.poll(() => Boolean(pendingOldPage)).toBe(true);
    accountId = USER_B;
    await auth.switchAccount(USER_B);
    await expect.poll(() => Boolean(pendingNewAccount)).toBe(true);
    await expect(jobButtons(page)).toHaveCount(0);
    await fulfillPage(pendingNewAccount!, makeJobs(51, 2), null, USER_B);
    await expect(jobButton(page, 51)).toBeVisible();
    await fulfillPage(pendingOldPage!, makeJobs(21, 3), null, USER_A);

    await expect(jobButtons(page)).toHaveCount(2);
    await expect(jobButton(page, 1)).toHaveCount(0);
    await expect(jobButton(page, 21)).toHaveCount(0);
    await expect(page.getByText("2 saved jobs", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Search saved jobs", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Load more jobs", exact: true })).toHaveCount(0);
  });

  test("job detail cannot show a previous account's delayed response after sign-out", async ({ page }) => {
    const auth = await installJobsHarness(page, detailHarnessScript);
    let pendingDetail: Route | undefined;
    await page.route('**/api/extension/saved-jobs/*', (route) => { pendingDetail = route; });
    await page.goto(`${HARNESS_ORIGIN}/jobs`);
    await expect.poll(() => Boolean(pendingDetail)).toBe(true);
    await auth.switchAccount('');
    await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
    await pendingDetail!.fulfill({ json: { success: true, data: makeJobs(1, 1)[0] } });
    await expect(page.getByRole('heading', { name: 'Program Manager 01', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
  });

  test("changing job detail IDs cannot let an older response replace the new job", async ({ page }) => {
    await installJobsHarness(page, detailHarnessScript);
    let firstDetail: Route | undefined;
    await page.route('**/api/extension/saved-jobs/*', (route) => {
      if (route.request().url().endsWith(makeJobs(1, 1)[0].id)) { firstDetail = route; return; }
      return route.fulfill({ json: { success: true, data: { ...makeJobs(2, 1)[0], matchedSkills: [], missingSkills: [], topGaps: [] } } });
    });
    await page.goto(`${HARNESS_ORIGIN}/jobs`);
    await expect.poll(() => Boolean(firstDetail)).toBe(true);
    await page.evaluate((jobId) => {
      (window as typeof window & { __jobsDetailHarness: { setJobId: (id: string) => void } }).__jobsDetailHarness.setJobId(jobId);
    }, makeJobs(2, 1)[0].id);
    await expect(page.getByRole('heading', { name: 'Program Manager 02', exact: true })).toBeVisible();
    await firstDetail!.fulfill({ json: { success: true, data: makeJobs(1, 1)[0] } });
    await expect(page.getByRole('heading', { name: 'Program Manager 01', exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Program Manager 02', exact: true })).toBeVisible();
  });

  test("deleted job detail offers recovery without claiming it was a browser-only save", async ({ page }) => {
    await installJobsHarness(page, detailHarnessScript);
    await page.route('**/api/extension/saved-jobs/*', (route) => route.fulfill({ status: 404, json: { success: false } }));
    await page.goto(`${HARNESS_ORIGIN}/jobs`);
    await expect(page.getByRole('alert')).toContainText('This saved job is no longer available.');
    await expect(page.getByRole('link', { name: 'Open studio instead', exact: true })).toHaveAttribute('href', '/workspace');
  });
});
