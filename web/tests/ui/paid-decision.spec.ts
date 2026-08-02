import fs from "fs";
import path from "path";

import { expect, test, type Page } from "@playwright/test";

import type { UnlockSection } from "../../lib/unlock/unlockContext";

type UnlockExpectation = Readonly<{
  title: string;
  label: string;
}>;

const EXPECTED_UNLOCK_COPY = {
  evidence_ledger: {
    title: "Apply the evidence to your next report",
    label: "Evidence Ledger",
  },
  bullet_upgrades: {
    title: "Compare rewrites after you revise",
    label: "Suggested rewrites",
  },
  missing_wins: {
    title: "Check the details you add",
    label: "Details to add",
  },
  job_alignment: {
    title: "Review another role",
    label: "Fit for the role",
  },
  export_pdf: {
    title: "Add PDF exports to your search",
    label: "Export",
  },
} as const satisfies Record<UnlockSection, UnlockExpectation>;

const UNLOCK_SECTIONS = Object.keys(EXPECTED_UNLOCK_COPY) as UnlockSection[];
const PAYWALL_VIEWPORTS = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "mobile", width: 390, height: 844 },
] as const;

const RESUME_TEXT = `ALEX RIVERA
Senior Program Manager

Led cross-functional launches across product, operations, and support teams.
Built review cadences, clarified ownership, and kept deadlines on track.
Reduced rework by creating clearer launch checklists and decision logs.
Partnered with stakeholders to surface risks, unblock decisions, and drive execution.
`;

const JOB_DESCRIPTION = `We are hiring a Senior Program Manager to run complex B2B SaaS launches.
Coordinate cross-functional teams, manage stakeholder communication, track risks,
and improve launch operations with measurable process improvements.`;

const PAID_PASS_EXPIRES_AT = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const MOCK_USER = {
  id: "11111111-1111-4111-8111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "paid-candidate@example.test",
  email_confirmed_at: "2026-07-31T12:00:00.000Z",
  phone: "",
  confirmed_at: "2026-07-31T12:00:00.000Z",
  last_sign_in_at: "2026-07-31T12:00:00.000Z",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  identities: [],
  created_at: "2026-07-31T12:00:00.000Z",
  updated_at: "2026-07-31T12:00:00.000Z",
  is_anonymous: false,
};

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function createMockPaidSession() {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const accessToken = [
    encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    encodeBase64Url(JSON.stringify({
      sub: MOCK_USER.id,
      aud: "authenticated",
      role: "authenticated",
      email: MOCK_USER.email,
      iat: nowSeconds,
      exp: nowSeconds + 60 * 60,
      aal: "aal1",
      session_id: "22222222-2222-4222-8222-222222222222",
    })),
    "test-signature",
  ].join(".");

  return {
    access_token: accessToken,
    refresh_token: "mock-refresh-token",
    expires_in: 60 * 60,
    expires_at: nowSeconds + 60 * 60,
    token_type: "bearer",
    user: MOCK_USER,
  };
}

async function runAnonymousReview(page: Page) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.144" });
  await page.goto("/workspace");
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("workspace-paste-mode").click();
  await expect(page.getByTestId("workspace-resume-text")).toBeVisible();
  await page.getByTestId("workspace-resume-text").fill(RESUME_TEXT);
  await page.getByTestId("workspace-role-toggle").click();
  await page.getByTestId("workspace-job-description").fill(JOB_DESCRIPTION);
  await page.getByTestId("workspace-run-report").click();
  await expect(page.locator("#section-first-impression h1")).toBeVisible({ timeout: 35_000 });

  const maybeLater = page.getByRole("button", { name: "Maybe later" });
  if (await maybeLater.isVisible()) {
    await maybeLater.click();
  }
}

async function installPaidAuthMocks(page: Page) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for the paid-decision UI test");
  }

  const session = createMockPaidSession();
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const cookieValue = `base64-${encodeBase64Url(JSON.stringify(session))}`;

  await page.addInitScript(({ name, value }) => {
    document.cookie = `${name}=${value}; Path=/; SameSite=Lax`;
  }, { name: cookieName, value: cookieValue });

  await page.route("**/auth/v1/user", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_USER),
    });
  });
  await page.route("**/auth/v1/token*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(session),
    });
  });
  await page.route("**/api/passes", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        passes: [{
          id: "pass_test_job_search",
          tier: "30d",
          uses_remaining: 5,
          expires_at: PAID_PASS_EXPIRES_AT,
          revoked_at: null,
        }],
      }),
    });
  });
  await page.route("**/api/free-status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, free_uses_left: 0, free_uses_remaining: 0 }),
    });
  });
}

test.describe("paid decision boundary", () => {
  test.describe.configure({ timeout: 120_000 });

  test.beforeAll(() => {
    expect(process.env.NEXT_PUBLIC_ENABLE_BILLING_UNLOCK).toBe("true");
  });

  test("every retained unlock context renders its unique complete-report decision", async ({ page }) => {
    expect(new Set(UNLOCK_SECTIONS.map((section) => EXPECTED_UNLOCK_COPY[section].title)).size).toBe(UNLOCK_SECTIONS.length);
    expect(new Set(UNLOCK_SECTIONS.map((section) => EXPECTED_UNLOCK_COPY[section].label)).size).toBe(UNLOCK_SECTIONS.length);

    const checkoutRequests: string[] = [];
    page.on("request", (request) => {
      if (new URL(request.url()).pathname === "/api/checkout") {
        checkoutRequests.push(request.url());
      }
    });

    await runAnonymousReview(page);
    const purchaseButton = page
      .getByTestId("post-report-purchase-decision")
      .getByRole("button", { name: /Get 5 more reports · \$29/ });

    for (const viewport of PAYWALL_VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const section of UNLOCK_SECTIONS) {
        const expected = EXPECTED_UNLOCK_COPY[section];
        await page.evaluate((unlockSection) => {
          localStorage.setItem("riyp_unlock_context", JSON.stringify({
            section: unlockSection,
            timestamp: Date.now(),
          }));
        }, section);

        await purchaseButton.click();
        const dialog = page.getByRole("dialog", { name: expected.title });
        await expect(dialog, `${viewport.label}/${section}: unique modal opens`).toBeVisible();
        await expect(dialog.getByRole("heading", { name: expected.title, exact: true })).toBeVisible();
        await expect(dialog.getByTestId("paywall-context-label")).toHaveText(expected.label);
        await expect(dialog).toContainText("This free report is complete. You do not need to pay to see the rest.");
        await expect(dialog).toContainText("Buy the Job Search Pass only when you have a revised resume to compare or another important role to review.");
        await expect(dialog).toContainText("5 additional reports");
        await expect(dialog).toContainText("$29");
        await expect(dialog).toContainText("30 days");
        await expect(dialog).toContainText("no automatic renewal", { ignoreCase: true });

        const dialogText = await dialog.innerText();
        expect(dialogText).not.toMatch(/rest of|see all|full role|remaining (?:evidence|rewrites|questions)|anything looks locked/i);
        expect(checkoutRequests, `${viewport.label}/${section}: no checkout before submission`).toHaveLength(0);

        if (viewport.label === "mobile") {
          const scrollState = await dialog.evaluate((element) => {
            element.scrollTop = element.scrollHeight;
            return {
              canScroll: element.scrollHeight > element.clientHeight,
              atBottom: Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) <= 1,
            };
          });
          expect(scrollState.canScroll, `${section}: mobile dialog scrolls`).toBe(true);
          expect(scrollState.atBottom, `${section}: mobile dialog reaches legal controls`).toBe(true);
          await expect(dialog.getByRole("button", { name: "Restore purchase or manage billing" })).toBeVisible();
          await expect(dialog.getByText(/Stripe handles payment/)).toBeVisible();
        }

        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
      }
    }

    expect(checkoutRequests).toHaveLength(0);
  });

  test("mocked paid confirmation restores the unchanged report and shows truthful pass-ready copy", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await installPaidAuthMocks(page);

    const sampleReport = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "sample-report.json"), "utf8"));
    const existingReport = {
      ...sampleReport,
      score: 73,
      first_impression: "Existing report marker: the checkout round trip kept this recruiter read unchanged.",
      first_impression_takeaway: "Existing report takeaway marker: checkout preserved this exact opening read.",
      top_fixes: [
        {
          ...sampleReport.top_fixes[0],
          fix: "Existing report fix marker: preserve this exact recommendation after confirmation.",
        },
        ...sampleReport.top_fixes.slice(1),
      ],
    };

    await page.addInitScript((workspaceState) => {
      sessionStorage.setItem("riyp_checkout_workspace", JSON.stringify(workspaceState));
    }, {
      report: existingReport,
      resumeText: "Synthetic existing resume text",
      jobDescription: "Synthetic existing job description",
      timestamp: Date.now(),
    });

    let confirmationRequests = 0;
    let checkoutRequests = 0;
    let generationRequests = 0;
    page.on("request", (request) => {
      const pathname = new URL(request.url()).pathname;
      if (pathname === "/api/billing/confirm") confirmationRequests += 1;
      if (pathname === "/api/checkout") checkoutRequests += 1;
      if (pathname === "/api/resume-feedback" || pathname === "/api/resume-feedback-stream") {
        generationRequests += 1;
      }
    });

    await page.route("**/api/billing/confirm", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          state: "unlocked",
          pending: false,
          status: "complete",
          message: "Access unlocked.",
          pass: {
            id: "pass_test_job_search",
            tier: "30d",
            expires_at: PAID_PASS_EXPIRES_AT,
            uses_remaining: 5,
            active: true,
          },
        }),
      });
    });

    await page.goto("/purchase/confirmed?session_id=cs_test_mocked_confirmation&tier=30d&source=paywall&unlock=job_alignment");
    await expect(page.getByRole("heading", { name: "Purchase confirmed" })).toBeVisible();
    await expect(page.getByText("Access confirmed", { exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => {
      const stored = localStorage.getItem("riyp_unlock_context");
      return stored ? JSON.parse(stored).section : null;
    })).toBe("job_alignment");

    const openStudio = page.getByRole("link", { name: /Open the studio/i });
    await expect(openStudio).toBeVisible({ timeout: 15_000 });
    await Promise.all([
      page.waitForURL(/\/workspace$/, { timeout: 30_000 }),
      openStudio.click(),
    ]);
    await expect(page.getByText("Your report is back", { exact: true })).toBeVisible();
    await expect(page.getByText("Clarity summary: 73/100", { exact: true })).toBeVisible();
    await expect(page.locator("#section-first-impression h1")).toHaveText(existingReport.first_impression_takeaway);
    await expect(page.locator("#section-fix-1")).toContainText(existingReport.top_fixes[0].fix);

    const banner = page.getByTestId("pass-ready-banner");
    await expect(banner).toBeVisible({ timeout: 10_000 });
    await expect(banner.getByRole("heading", { name: "Your Job Search Pass is ready." })).toBeVisible();
    await expect(banner).toContainText("This report is unchanged.");
    await expect(banner).toContainText("5 additional reports");
    await expect(banner).not.toContainText("Full report unlocked");
    await expect(banner).not.toContainText(/(?:unlock|locked|see the rest|remaining content)/i);
    const bannerShell = page.getByTestId("pass-ready-banner-shell");
    await expect(bannerShell).toBeVisible();
    expect(await bannerShell.evaluate((element) => element.scrollHeight <= element.clientHeight)).toBe(true);

    await expect.poll(() => page.evaluate(() => localStorage.getItem("riyp_unlock_context"))).toBeNull();
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("riyp_checkout_workspace"))).toBeNull();
    expect(confirmationRequests).toBe(1);
    expect(checkoutRequests).toBe(0);
    expect(generationRequests).toBe(0);
  });
});
