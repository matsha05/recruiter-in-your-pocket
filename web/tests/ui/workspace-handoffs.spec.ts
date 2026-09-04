import { expect, test, type Page, type Route } from "@playwright/test";
import path from "node:path";
import { createRequire } from "node:module";
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
const RESUME_TEXT = "Alex Rivera\nProgram Manager\nLed cross-functional launches with product, operations, and support teams. Built review cadences and improved launch checklists. Coordinated stakeholder updates and clarified ownership across teams.";
const UPLOADED_TEXT = `${RESUME_TEXT}\nBuilt customer workflows in HubSpot for 120 customers.`;
const REPORT = ResumeFeedbackResponseSchema.parse(schemaValidReport);
const SAVED_REPORT_ID = "22222222-2222-4222-8222-222222222222";
const JOB = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Saved program manager role",
  company: "Company A",
  jobDescription: "Lead cross-functional programs, coordinate launches, improve operations, and communicate progress to stakeholders.",
};
let harnessScript = "";
let harnessStyles = "";

async function buildWorkspaceHarness() {
  const mocks: Record<string, string> = {
    "next/link": `import React from "react";
      export default function Link({href, children, ...props}) { return <a href={href} {...props}>{children}</a>; }`,
    "next/navigation": `import {useMemo, useSyncExternalStore} from "react";
      const subscribe = (callback) => { window.addEventListener("popstate", callback); return () => window.removeEventListener("popstate", callback); };
      const snapshot = () => window.location.pathname + window.location.search;
      const navigate = (href, method) => { window.history[method](null, "", href); window.dispatchEvent(new PopStateEvent("popstate")); };
      const router = { push: (href) => navigate(href, "pushState"), replace: (href) => navigate(href, "replaceState") };
      export function useRouter() { return router; }
      export function usePathname() { return useSyncExternalStore(subscribe, snapshot).split("?")[0]; }
      export function useSearchParams() {
        const location = useSyncExternalStore(subscribe, snapshot);
        return useMemo(() => new URLSearchParams(location.split("?")[1] || ""), [location]);
      }`,
    "@/components/providers/AuthProvider": `const refreshUser = async () => {};
      const user = JSON.parse(sessionStorage.getItem("workspace-harness-user") || "null");
      export function useAuth() { return {user, isLoading: false, refreshUser}; }`,
    "@/components/workspace/WorkspaceOverlays": `export default function WorkspaceOverlays() { return null; }`,
    "@/components/workspace/LinkedInModeSection": `export default function LinkedInModeSection() { return null; }`,
    "@/lib/analytics": `export const Analytics = new Proxy({}, {get: () => () => {}});`,
    "@/lib/supabase/browserClient": `export function createSupabaseBrowserClient() { throw new Error("Unexpected account mutation in browser harness"); }`,
  };
  const result = await build({
    absWorkingDir: WEB_ROOT,
    stdin: {
      contents: `import React from "react";
        import {createRoot} from "react-dom/client";
        import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
        import {Toaster} from "sonner";
        import {usePathname} from "next/navigation";
        import {CommandPalette} from "@/components/CommandPalette";
        import ReportDetailClient from "@/components/reports/ReportDetailClient";
        import WorkspaceClient from "@/components/workspace/WorkspaceClient";
        import SettingsClient from "@/components/workspace/SettingsClient";
        function HarnessApp() {
          const pathname = usePathname();
          return <>
            <button type="button" data-testid="outside-workspace-control">Account menu</button>
            {pathname.startsWith("/settings/")
              ? <SettingsClient initialTab={pathname.split("/")[2]} />
              : pathname.startsWith("/reports/")
                ? <ReportDetailClient reportId={pathname.split("/")[2]} />
                : <><CommandPalette /><WorkspaceClient /></>}
          </>;
        }
        createRoot(document.getElementById("root")).render(
          <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
            <HarnessApp />
            <Toaster />
          </QueryClientProvider>);`,
      loader: "tsx", resolveDir: WEB_ROOT, sourcefile: "workspace-handoffs-harness.tsx",
    },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic",
    outdir: "/tmp/riyp-workspace-handoffs-bundle",
    define: {
      "process.env.NODE_ENV": JSON.stringify("test"),
      "process.env": JSON.stringify({
        NEXT_PUBLIC_ENABLE_BILLING_UNLOCK: "true",
        NEXT_PUBLIC_ENABLE_EXTENSION_SYNC: "true",
        RIYP_EXTENSION_ORIGINS: "chrome-extension://test-extension",
      }),
    },
    plugins: [{
      name: "workspace-browser-boundaries",
      setup(plugin: HarnessPlugin) {
        plugin.onResolve({ filter: /^(next\/|@\/)/ }, ({ path: modulePath }) => (
          modulePath in mocks ? { path: modulePath, namespace: "workspace-test-mock" } : undefined
        ));
        plugin.onLoad({ filter: /.*/, namespace: "workspace-test-mock" }, ({ path: modulePath }) => ({
          contents: mocks[modulePath], loader: "tsx", resolveDir: WEB_ROOT,
        }));
      },
    }],
  });
  harnessScript = result.outputFiles.find((file: { path: string }) => file.path.endsWith(".js")).text;
  harnessStyles = result.outputFiles.find((file: { path: string }) => file.path.endsWith(".css"))?.text || "";
}

async function installWorkspaceHarness(page: Page) {
  // All workspace state, file parsing, stream consumption, the command palette,
  // scanning screen, and report heading run as production components. The mock
  // boundaries are auth, Next navigation, analytics, and unrelated modal/LinkedIn
  // surfaces. No Next server, generated app build, account, or remote API is used.
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) {
      await route.abort("blockedbyclient");
      throw new Error(`Unexpected external request in workspace harness: ${url.origin}${url.pathname}`);
    }
    if (url.pathname === "/workspace" || url.pathname.startsWith("/settings/") || url.pathname.startsWith("/reports/")) {
      return route.fulfill({ contentType: "text/html; charset=utf-8", body: `<!doctype html><html><head><meta charset="utf-8">
        <title>Workspace handoffs — browser contract</title><style>${harnessStyles}
          body { font: 16px system-ui; margin: 24px; } #root { max-width: 1050px; margin: auto; }
          button, input, textarea { padding: 8px; margin: 4px; } button { cursor: pointer; }
          svg { width: 20px; height: 20px; } textarea { display: block; width: 90%; min-height: 100px; }
          [role="dialog"] { position: fixed; inset: 12% 20% auto; background: white; padding: 24px;
            border: 1px solid #888; z-index: 100; } [cmdk-item] { padding: 8px; cursor: pointer; }
          .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden;
            clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
          [hidden] { display: none !important; }
        </style></head><body><main id="root"></main><script src="/workspace-harness.js"></script></body></html>` });
    }
    if (url.pathname === "/workspace-harness.js") return route.fulfill({ contentType: "text/javascript", body: harnessScript });
    if (url.pathname === "/favicon.ico") return route.fulfill({ status: 204 });
    await route.abort("blockedbyclient");
    throw new Error(`Unmocked workspace harness request: ${url.pathname}`);
  });
  await page.route("**/api/free-status", (route) => route.fulfill({ json: { ok: true, free_uses_left: 1 } }));
  await page.route("**/api/reports/recovery?*", (route) => route.fulfill({ status: 202, json: { ok: false, status: "pending" } }));
  await page.route(`**/api/extension/saved-jobs/${JOB.id}`, (route) => route.fulfill({ json: { success: true, data: JOB } }));
}

async function openUploadCommand(page: Page) {
  await page.keyboard.press("Control+k");
  const commands = page.getByRole("dialog", { name: "Commands", exact: true });
  await expect(commands).toBeVisible();
  const chooserPromise = page.waitForEvent("filechooser");
  // Recent commands can include Upload Resume too. The Actions group is the
  // canonical command and must remain usable even after a previous upload.
  await commands.locator('[cmdk-group][data-value="Actions"]').getByRole("option", { name: /Upload Resume/ }).click();
  const chooser = await chooserPromise;
  expect(await chooser.element().getAttribute("aria-label")).toBe("Upload resume file from commands");
  await expect(commands).toHaveCount(0);
  return chooser;
}

async function startReport(page: Page) {
  await page.getByTestId("workspace-paste-mode").click();
  await page.getByTestId("workspace-resume-text").fill(RESUME_TEXT);
  await expect(page.getByTestId("workspace-run-report")).toHaveText("Get my report");
  await page.getByTestId("workspace-run-report").click();
}

async function completeReport(route: Route, report = REPORT) {
  const body = route.request().postDataJSON();
  await route.fulfill({
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
    body: `${JSON.stringify({ type: "complete", ok: true, data: report, report_id: null, report_receipt: null, operation_id: body.recovery_id, free_uses_remaining: 1 })}\n`,
  });
}

function reportHeading(page: Page) { return page.locator("#section-first-impression h1"); }

test.describe("workspace command and completion handoffs", () => {
  let runtimeErrors: string[] = [];
  test.beforeAll(buildWorkspaceHarness);
  test.beforeEach(async ({ page }) => {
    runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    await installWorkspaceHarness(page);
  });
  test.afterEach(() => {
    expect(runtimeErrors, "Production workspace components must not throw browser runtime errors").toEqual([]);
  });

  test("Upload Resume opens the native picker from paste mode and applies parsed text", async ({ page }) => {
    let parsedFile = false;
    let submittedText: string | undefined;
    await page.route("**/api/resume-feedback-stream", async (route) => {
      submittedText = route.request().postDataJSON().text;
      await completeReport(route);
    });
    await page.route("**/api/parse-resume", (route) => {
      expect(route.request().method()).toBe("POST");
      expect(route.request().headers()["content-type"]).toContain("multipart/form-data");
      expect(route.request().postDataBuffer()?.toString()).toContain('filename="updated-resume.pdf"');
      parsedFile = true;
      return route.fulfill({ json: { ok: true, text: UPLOADED_TEXT } });
    });
    await page.goto(`${ORIGIN}/workspace`);
    await expect(page).toHaveTitle("Workspace handoffs — browser contract");
    await page.getByTestId("workspace-paste-mode").click();
    await page.getByTestId("workspace-resume-text").fill("Existing pasted draft");
    const chooser = await openUploadCommand(page);
    await chooser.setFiles({ name: "updated-resume.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-harness") });
    await expect(page.getByText("updated-resume.pdf", { exact: true })).toBeVisible();
    await expect(page.getByTestId("workspace-run-report")).toHaveText("Get my report");
    expect(parsedFile).toBe(true);
    await page.getByTestId("workspace-run-report").click();
    await expect(reportHeading(page)).toBeVisible();
    expect(submittedText).toBe(UPLOADED_TEXT);
  });

  test("cancelled and failed uploads preserve a completed report; a successful upload starts a clean report", async ({ page }) => {
    const submissions: Array<{ text: string; savedJobId?: string; jobDescription?: string }> = [];
    await page.route("**/api/resume-feedback-stream", async (route) => {
      submissions.push(route.request().postDataJSON());
      await completeReport(route);
    });
    const parseRequests: Route[] = [];
    await page.route("**/api/parse-resume", (route) => { parseRequests.push(route); });
    await page.goto(`${ORIGIN}/workspace?job=${JOB.id}`);
    await expect(page.getByText(JOB.title, { exact: true })).toBeVisible();
    await startReport(page);
    await expect(reportHeading(page)).toHaveText(REPORT.first_impression_takeaway);
    expect(submissions[0].savedJobId).toBe(JOB.id);

    const cancelled = await openUploadCommand(page);
    await cancelled.setFiles([]);
    await expect(reportHeading(page)).toBeVisible();
    await expect(page).toHaveURL(`${ORIGIN}/workspace?job=${JOB.id}`);
    expect(parseRequests).toHaveLength(0);

    const failed = await openUploadCommand(page);
    await failed.setFiles({ name: "unreadable.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-invalid") });
    await expect.poll(() => parseRequests.length).toBe(1);
    await expect(reportHeading(page)).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Reading your resume file." })).toHaveCount(1);
    await parseRequests[0].fulfill({ json: { ok: false, message: "This PDF did not contain readable text." } });
    await expect(page.getByText("Failed to parse resume", { exact: true })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Reading your resume file." })).toHaveCount(0);
    await expect(reportHeading(page)).toHaveText(REPORT.first_impression_takeaway);
    await expect(page).toHaveURL(`${ORIGIN}/workspace?job=${JOB.id}`);

    const successful = await openUploadCommand(page);
    await successful.setFiles({ name: "replacement.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer: Buffer.from("harness-docx") });
    await expect.poll(() => parseRequests.length).toBe(2);
    await expect(reportHeading(page)).toBeVisible();
    await parseRequests[1].fulfill({ json: { ok: true, text: UPLOADED_TEXT } });
    await expect(page).toHaveURL(`${ORIGIN}/workspace`);
    await expect(reportHeading(page)).toHaveCount(0);
    await expect(page.getByText(JOB.title, { exact: true })).toHaveCount(0);
    await expect(page.getByText("replacement.docx", { exact: true })).toBeVisible();
    await page.getByTestId("workspace-role-toggle").click();
    await expect(page.getByTestId("workspace-job-description")).toHaveValue("");
    await expect(page.getByTestId("workspace-run-report")).toHaveText("Get my report");
    await page.getByTestId("workspace-run-report").click();
    await expect(reportHeading(page)).toBeVisible();
    expect(submissions).toHaveLength(2);
    expect(submissions[1]).toMatchObject({ text: UPLOADED_TEXT });
    expect(submissions[1].savedJobId).toBeUndefined();
    expect(submissions[1].jobDescription).toBeUndefined();
  });

  test("report completion announces readiness and moves focus from Stop to the actual report heading", async ({ page }) => {
    let pendingReport: Route | undefined;
    await page.route("**/api/resume-feedback-stream", (route) => { pendingReport = route; });
    await page.goto(`${ORIGIN}/workspace`);
    await startReport(page);
    await expect.poll(() => Boolean(pendingReport)).toBe(true);
    await expect(page.getByRole("region", { name: "Reviewing your resume." })).toHaveAttribute("aria-busy", "true");
    const stop = page.getByRole("button", { name: "Stop", exact: true });
    await stop.focus();
    await expect(stop).toBeFocused();
    await completeReport(pendingReport!);
    await expect(reportHeading(page)).toBeVisible();
    await expect(reportHeading(page)).toBeFocused();
    await expect(reportHeading(page)).toHaveAttribute("tabindex", "-1");
    const announcement = page.getByRole("status").filter({ hasText: "Your report is ready." });
    await expect(announcement).toHaveCount(1);
    await expect(announcement).toHaveAttribute("aria-live", "polite");
    await expect(announcement).toHaveAttribute("aria-atomic", "true");
    await expect(stop).toHaveCount(0);

    await page.getByRole("button", { name: "Compare my revision", exact: true }).click();
    await expect(page).toHaveURL(`${ORIGIN}/workspace?revision=1`);
    await expect(page.getByRole("heading", { name: "Now let’s see what changed." })).toBeVisible();
    await page.getByTestId("workspace-paste-mode").click();
    await page.getByTestId("workspace-resume-text").fill(UPLOADED_TEXT);
    await expect(page.getByTestId("workspace-run-report")).toHaveText("Compare my revision");
    await expect(announcement).toHaveCount(0);
  });

  test("report completion preserves a control the reader focused outside the progress screen", async ({ page }) => {
    let pendingReport: Route | undefined;
    await page.route("**/api/resume-feedback-stream", (route) => { pendingReport = route; });
    await page.goto(`${ORIGIN}/workspace`);
    await startReport(page);
    await expect.poll(() => Boolean(pendingReport)).toBe(true);
    await page.getByRole("button", { name: "Stop", exact: true }).focus();
    const unrelated = page.getByTestId("outside-workspace-control");
    await unrelated.focus();
    await completeReport(pendingReport!);
    await expect(reportHeading(page)).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Your report is ready." })).toHaveCount(1);
    await expect(unrelated).toBeFocused();
    await expect(reportHeading(page)).not.toBeFocused();
  });

  test("a saved report opens a revision workspace and compares the original with the newly generated read", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("workspace-harness-user", JSON.stringify({
        id: "33333333-3333-4333-8333-333333333333", email: "candidate@example.test",
        membership: "credit", paidUsesLeft: 2, freeUsesLeft: 1, canExportPdf: true,
      }));
    });
    let savedReportRequests = 0;
    await page.route(`**/api/reports/${SAVED_REPORT_ID}`, (route) => {
      expect(route.request().method()).toBe("GET");
      savedReportRequests += 1;
      return route.fulfill({ json: {
        ok: true,
        report: { ...REPORT, report_id: SAVED_REPORT_ID, saved_job_id: JOB.id },
        resumePreview: RESUME_TEXT,
        jdPreview: JOB.jobDescription,
      } });
    });
    const revisedReport = ResumeFeedbackResponseSchema.parse({
      ...REPORT,
      first_impression_takeaway: "Customer scale now reads clearly",
      gaps: ["The time saved still needs context.", ...REPORT.gaps.slice(1)],
      top_fixes: [{ ...REPORT.top_fixes[0], fix: "Add the time saved by the workflow." }],
    });
    let submission: { text: string; savedJobId?: string; jobDescription?: string } | undefined;
    await page.route("**/api/resume-feedback-stream", async (route) => {
      submission = route.request().postDataJSON();
      await completeReport(route, revisedReport);
    });

    await page.goto(`${ORIGIN}/reports/${SAVED_REPORT_ID}`);
    await expect(reportHeading(page)).toHaveText(REPORT.first_impression_takeaway);
    await page.evaluate((oldReport) => {
      sessionStorage.setItem("riyp_checkout_workspace", JSON.stringify({
        report: oldReport, resumeText: "Unrelated old resume", jobDescription: "Unrelated old role", timestamp: Date.now(),
      }));
    }, { ...REPORT, first_impression_takeaway: "Unrelated old checkout report" });
    await page.getByRole("button", { name: "Compare my revision", exact: true }).click();
    await expect(page).toHaveURL(`${ORIGIN}/workspace?revision=${SAVED_REPORT_ID}`);
    await expect(page.getByRole("heading", { name: "Now let’s see what changed." })).toBeVisible();
    await expect.poll(() => savedReportRequests).toBe(2);
    await expect(page.getByText("Your report is back", { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("riyp_checkout_workspace"))).toBeNull();
    await page.getByTestId("workspace-paste-mode").click();
    await expect(page.getByTestId("workspace-resume-text")).toHaveValue("");
    await page.getByTestId("workspace-role-toggle").click();
    await expect(page.getByTestId("workspace-job-description")).toHaveValue("");
    await page.getByTestId("workspace-resume-text").fill(UPLOADED_TEXT);
    await expect(page.getByTestId("workspace-run-report")).toHaveText("Compare my revision");
    await page.getByTestId("workspace-run-report").click();

    const comparison = page.getByRole("region", { name: "Here's what changed in your feedback.", exact: true });
    await expect(comparison).toBeVisible();
    const previous = comparison.getByRole("article").filter({ hasText: "Previous report" });
    const current = comparison.getByRole("article").filter({ hasText: "Current report" });
    await expect(previous).toContainText(REPORT.first_impression_takeaway);
    await expect(previous).toContainText(REPORT.gaps[0]);
    await expect(previous).toContainText(REPORT.top_fixes[0].fix);
    await expect(current).toContainText(revisedReport.first_impression_takeaway);
    await expect(current).toContainText(revisedReport.gaps[0]);
    await expect(current).toContainText(revisedReport.top_fixes[0].fix);
    await expect(reportHeading(page)).toHaveText(revisedReport.first_impression_takeaway);
    expect(submission?.text).toBe(UPLOADED_TEXT);
    expect(submission?.savedJobId).toBeUndefined();
    expect(submission?.jobDescription).toBeUndefined();
  });

  for (const tab of ["account", "matching", "billing"] as const) {
    test(`settings sign-in returns to the requested ${tab} page`, async ({ page }) => {
      await page.goto(`${ORIGIN}/settings/${tab}`);
      await expect(page.getByText("Sign in to open settings", { exact: true })).toBeVisible();
      const signIn = page.getByRole("link", { name: "Sign in", exact: true });
      await expect(signIn).toHaveAttribute("href", `/auth?from=settings&next=${encodeURIComponent(`/settings/${tab}`)}`);
    });
  }
});
