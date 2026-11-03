import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sampleReport from "../../public/sample-report.json";
import liveOutputs from "../fixtures/report-integrity/live-outputs-83b2a2d1.json";
import { splitVerdict } from "../../lib/reports/report-opening";

// W1 (Nov 2026): the report's first screen on a phone. At 390×844 the header row, the Verdict's first
// sentence, the band, the count and the first Critical Miss with its first question all fit without
// scrolling, for the sample and the five longest saved Verdicts.

type Report = typeof sampleReport;
const PHONE = { width: 390, height: 844 };

const longestSaved = [...liveOutputs.runs]
  .sort((a, b) => (b.report.first_impression?.length ?? 0) - (a.report.first_impression?.length ?? 0))
  .slice(0, 5)
  .map((run) => ({ name: `${run.fixture_id} (${run.report.first_impression?.length} characters)`, report: run.report as unknown as Report }));

// A saved output with the severity check's flags, so the count row is exercised too.
const flagged = (() => {
  const base = longestSaved[0].report;
  return {
    name: `${longestSaved[0].name}, two Critical Misses`,
    report: { ...base, top_fixes: base.top_fixes.map((fix, index) => ({ ...fix, critical: index < 2 })), more_critical: false } as Report,
  };
})();

const cases = [{ name: "the sample", report: sampleReport as Report }, ...longestSaved, flagged];

async function declinePrivacyChoice(page: Page) {
  const decline = page.getByRole("button", { name: "Decline analytics", exact: true });
  if (await decline.isVisible().catch(() => false)) await decline.click();
  await expect(page.getByTestId("privacy-panel")).toBeHidden();
}

const RECOVERY_ID = "33333333-3333-4333-8333-333333333333";
const RECOVERY_KEY = "riyp:anonymous-report-recovery:v1";

async function signedOut(page: Page) {
  await page.route("**/auth/v1/user", (route) => route.fulfill({ status: 401, json: { message: "Auth session missing" } }));
}

/** The sample renders from its own page; any other report arrives the way a reloaded anonymous report does. */
async function openReport(page: Page, report: Report) {
  await signedOut(page);
  if (report === sampleReport) {
    await page.goto("/sample-report", { waitUntil: "domcontentloaded" });
  } else {
    await page.addInitScript(({ key, id }) => {
      localStorage.setItem(key, JSON.stringify({ version: 1, recoveryId: id, createdAt: Date.now() }));
    }, { key: RECOVERY_KEY, id: RECOVERY_ID });
    await page.route("**/api/free-status", (route) => route.fulfill({ json: { ok: true, free_uses_left: 0 } }));
    await page.route("**/api/reports/recovery?*", (route) => route.fulfill({ json: { ok: true, recovery_id: RECOVERY_ID, report } }));
    await page.goto("/workspace", { waitUntil: "domcontentloaded" });
  }
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  await expect(page.locator("#section-first-impression h1")).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
  await declinePrivacyChoice(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

function viewportBottomOf(locator: ReturnType<Page["locator"]>) {
  return locator.evaluate((element) => Math.round(element.getBoundingClientRect().bottom));
}

test.describe("the report's first screen on a phone", () => {
  test.use({ viewport: PHONE, isMobile: true, hasTouch: true, contextOptions: { reducedMotion: "reduce" } });

  for (const { name, report } of cases) {
    test(`shows the Verdict, the band and the first question without scrolling for ${name}`, async ({ page }) => {
      await openReport(page, report);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);

      const opening = page.locator("#section-first-impression");
      const verdict = splitVerdict(report.first_impression);
      await expect(page.getByTestId("report-header-row")).toBeInViewport({ ratio: 1 });
      await expect(opening.locator("h1")).toHaveText(verdict.lead);
      if (verdict.rest) {
        // The rest of the Verdict is one tap away, and the whole Verdict is still on the page.
        await expect(page.getByRole("button", { name: "Read the rest", exact: true })).toBeInViewport({ ratio: 1 });
        await expect(page.getByTestId("verdict-rest")).toContainText(verdict.rest);
      }
      await expect(page.getByTestId("score-band")).toBeInViewport({ ratio: 1 });

      const miss = page.getByTestId("critical-miss");
      await expect(miss.locator("blockquote")).toBeInViewport({ ratio: 1 });
      const question = miss.getByTestId("lift-question").first();
      await expect(question.locator("label")).toBeInViewport({ ratio: 1 });
      await expect(question.locator("input")).toBeInViewport({ ratio: 1 });
      const inputBottom = await viewportBottomOf(question.locator("input"));
      expect(inputBottom, `first question field bottom for ${name}`).toBeLessThanOrEqual(PHONE.height);
      test.info().annotations.push({ type: "first question field bottom", description: `${inputBottom}px of ${PHONE.height}` });
    });
  }

  test("the count sits on one row and the fix cards say where they sit", async ({ page }) => {
    await openReport(page, flagged.report);
    const title = page.locator("#fixes-title");
    await expect(title).toHaveText("Two Critical Misses. Start with this one.");
    const lead = page.getByText("Either one could cost you the interview on its own.", { exact: true });
    const [titleBox, leadBox] = await Promise.all([title.boundingBox(), lead.boundingBox()]);
    expect(Math.abs(titleBox!.y - leadBox!.y)).toBeLessThan(12);
    await expect(page.getByTestId("critical-miss").getByText("Critical Miss 1", { exact: true })).toBeVisible();
    await expect(page.getByTestId("critical-fix").getByText("Critical Miss 2", { exact: true })).toBeVisible();
    await expect(page.getByTestId("fix-row").getByText("Fix 3 of 3", { exact: true })).toBeVisible();
  });

  test("Read the rest opens the Verdict in place and Save sits in the section row", async ({ page }) => {
    await openReport(page, sampleReport as Report);
    const rest = page.locator("#verdict-rest");
    await expect(rest).toBeHidden();
    await page.getByRole("button", { name: "Read the rest", exact: true }).click();
    await expect(rest).toBeVisible();
    await expect(rest).toContainText(sampleReport.score_comment_short);
    await expect(page.getByRole("button", { name: "Read the rest", exact: true })).toHaveCount(0);

    // The sample has no Save; the section row still carries the tabs with their full names (WCAG 2.5.3).
    await page.locator("#section-fixes").evaluate((section) => window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: "instant" }));
    const navigation = page.getByRole("navigation", { name: "Resume report sections" });
    await expect(navigation).toBeVisible();
    const fixTab = navigation.getByRole("button", { name: "Fix these first", exact: true });
    await expect(fixTab.locator("span.sr-only")).toHaveText("these first");
    expect(await fixTab.evaluate((button) => [...button.querySelectorAll("span")].filter((span) => getComputedStyle(span).display !== "none" && !span.classList.contains("sr-only") && span.childNodes[0]?.nodeType === Node.TEXT_NODE).map((span) => span.childNodes[0].textContent))).toEqual(["Fix"]);
  });
});

test.describe("the header row on every route", () => {
  const RESUME = "Daniel Okafor\nColumbus, OH · daniel.okafor@example.com\n\nEXPERIENCE\n" + sampleReport.top_fixes.map((fix) => fix.evidence.excerpt).join("\n") + "\n" + "Participated in daily stand-ups and sprint planning meetings as part of an Agile team. ".repeat(4);

  test("a fresh report names the person, the role and how long the read took", async ({ page }) => {
    await page.addInitScript((report) => {
      const realFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (!url.includes("/api/resume-feedback-stream")) return realFetch(input, init);
        const encoder = new TextEncoder();
        const body = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`${JSON.stringify({ type: "meta", attempt_consumed: true })}\n`));
            for (const stage of ["reading", "writing", "checking"]) controller.enqueue(encoder.encode(`${JSON.stringify({ type: "stage", stage })}\n`));
            setTimeout(() => {
              controller.enqueue(encoder.encode(`${JSON.stringify({ type: "complete", ok: true, data: report })}\n`));
              controller.close();
            }, 1500);
          },
        });
        return Promise.resolve(new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } }));
      };
    }, sampleReport);
    await signedOut(page);
    await page.route("**/api/free-status", (route) => route.fulfill({ json: { ok: true, free_uses_left: 1 } }));
    await page.goto("/workspace", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
    await declinePrivacyChoice(page);
    await page.getByTestId("workspace-paste-mode").click();
    await page.getByTestId("workspace-resume-text").fill(RESUME);
    await page.getByTestId("workspace-run-report").click();

    const head = page.getByTestId("report-header-row");
    await expect(head).toBeVisible({ timeout: 30_000 });
    await expect(head).toContainText("Daniel Okafor");
    await expect(head).toContainText("Customer Success Manager");
    await expect(head).toContainText(/read in \d+ s/);
    // The sample's seniority read is a sentence, not a level, so there is no "Read as" chip.
    await expect(page.getByTestId("report-read-as")).toHaveCount(0);
    await expect(head).not.toContainText("Your resume report");
  });

  test("a recovered report keeps the row without the name it no longer has", async ({ page }) => {
    await openReport(page, longestSaved[1].report);
    const head = page.getByTestId("report-header-row");
    await expect(head).toBeVisible({ timeout: 30_000 });
    await expect(head).toContainText("Your resume report");
    await expect(head).toContainText("Software Engineer");
    await expect(head).not.toContainText("read in");
  });

  test("a saved report shows the row and keeps Save and Export out of the sheet", async ({ page }) => {
    const reportId = "44444444-4444-4444-8444-444444444444";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for the saved-report route check");
    const user = {
      id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", email: "candidate@example.test",
      email_confirmed_at: "2026-07-31T12:00:00.000Z", confirmed_at: "2026-07-31T12:00:00.000Z", last_sign_in_at: "2026-07-31T12:00:00.000Z",
      app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [], created_at: "2026-07-31T12:00:00.000Z", updated_at: "2026-07-31T12:00:00.000Z", is_anonymous: false,
    };
    // A browser session the Supabase client accepts, the way the paid-decision spec signs in.
    const nowSeconds = Math.floor(Date.now() / 1000);
    const encode = (value: string) => Buffer.from(value).toString("base64url");
    const session = {
      access_token: [encode(JSON.stringify({ alg: "HS256", typ: "JWT" })), encode(JSON.stringify({ sub: user.id, aud: "authenticated", role: "authenticated", email: user.email, iat: nowSeconds, exp: nowSeconds + 3600, aal: "aal1", session_id: "22222222-2222-4222-8222-222222222222" })), "test-signature"].join("."),
      refresh_token: "mock-refresh-token", expires_in: 3600, expires_at: nowSeconds + 3600, token_type: "bearer", user,
    };
    const cookieName = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
    await page.addInitScript(({ name, value }) => { document.cookie = `${name}=${value}; Path=/; SameSite=Lax`; }, { name: cookieName, value: `base64-${encode(JSON.stringify(session))}` });
    await page.route("**/auth/v1/user", (route) => route.fulfill({ json: user }));
    await page.route("**/auth/v1/token*", (route) => route.fulfill({ json: session }));
    await page.route("**/api/passes", (route) => route.fulfill({ json: { ok: true, passes: [] } }));
    await page.route("**/api/free-status", (route) => route.fulfill({ json: { ok: true, free_uses_left: 0 } }));
    await page.route(`**/api/reports/${reportId}`, (route) => route.fulfill({ json: { ok: true, report: { ...sampleReport, report_id: reportId }, jdPreview: null, targetRole: "Customer Success Manager" } }));
    await page.goto(`/reports/${reportId}`, { waitUntil: "domcontentloaded" });
    const head = page.getByTestId("report-header-row");
    await expect(head).toBeVisible({ timeout: 30_000 });
    await expect(head).toContainText("Your resume report");
    await expect(head).toContainText("Customer Success Manager");
    await expect(page.locator("article").getByRole("button", { name: /Save this version|Export report as PDF/ })).toHaveCount(0);
  });
});

test("the report's first screen passes axe at 390px", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/sample-report", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  await declinePrivacyChoice(page);
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});
