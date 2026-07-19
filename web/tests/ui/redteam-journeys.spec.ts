import { expect, test, type Page } from "@playwright/test";

const RESUME_TEXT = `MATT SHAW
Senior Program Manager

Led cross-functional launches across product, operations, and support teams.
Built review cadences, clarified ownership, and kept deadlines on track.
Reduced rework by creating clearer launch checklists and decision logs.
Partnered with stakeholders to surface risks, unblock decisions, and drive execution.
`;

const JOB_DESCRIPTION = `We are hiring a Senior Program Manager to run complex B2B SaaS launches.
You will coordinate cross-functional teams, manage stakeholder communication, track risks,
and improve launch operations with measurable process improvements.`;

async function openPasteMode(page: Page) {
  await page.goto("/workspace");
  await page.getByTestId("workspace-paste-mode").click();
  await expect(page.getByTestId("workspace-resume-text")).toBeVisible();
}

async function runAnonymousReview(page: Page, testIp: string) {
  // Production Vercel requests receive a platform-controlled X-Forwarded-For.
  // Give each local browser journey its own documented test-net identity so
  // the shared anonymous-access ledger does not couple independent tests.
  await page.setExtraHTTPHeaders({ "x-forwarded-for": testIp });
  await openPasteMode(page);
  await page.getByTestId("workspace-resume-text").fill(RESUME_TEXT);
  await page.getByTestId("workspace-role-toggle").click();
  await page.getByTestId("workspace-job-description").fill(JOB_DESCRIPTION);
  await page.getByTestId("workspace-run-report").click();
  await expect(page.locator("#section-first-impression h1")).toBeVisible({ timeout: 35_000 });
  await expect(page.locator("#section-fixes")).toBeVisible({ timeout: 35_000 });
}

test.describe("launch red-team journeys", () => {
  test("1. landing page drives users toward the workspace", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("landing-primary-cta")).toBeVisible();
    await page.getByTestId("landing-primary-cta").click();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.getByRole("heading", { name: /Let’s see what lands/i })).toBeVisible();
  });

  test("2. public trust surfaces publish readiness and disclosure details", async ({ page, request }) => {
    const homepageResponse = await request.get("/");
    expect(homepageResponse.ok()).toBeTruthy();
    const contentSecurityPolicy = homepageResponse.headers()["content-security-policy"];
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");

    const statusResponse = await request.get("/api/status");
    expect(statusResponse.ok()).toBeTruthy();
    const statusJson = await statusResponse.json();
    expect(Array.isArray(statusJson.services)).toBe(true);
    expect(Array.isArray(statusJson.incidents)).toBe(true);

    const hasLimitedService = statusJson.services.some(
      (service: { status: string }) => service.status === "limited"
    );
    const expectedOk = !hasLimitedService && statusJson.incidents.length === 0;

    expect(statusJson.ok).toBe(expectedOk);
    expect(statusJson.summary.status).toBe(expectedOk ? "configured" : "limited");

    const securityTxt = await request.get("/.well-known/security.txt");
    expect(securityTxt.ok()).toBeTruthy();
    const securityText = await securityTxt.text();
    expect(securityText).toContain("Contact: mailto:support@recruiterinyourpocket.com");
    expect(securityText).toContain("Policy: https://recruiterinyourpocket.com/security");

    await page.goto("/status");
    await expect(page.getByRole("heading", { name: /Customer-facing systems/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Support and trust/i })).toBeVisible();
  });

  test("3. example report path feels complete and returns users to a fresh run", async ({ page }) => {
    await page.goto("/workspace");
    await page.getByTestId("workspace-sample-report").click();
    await expect(page.getByText("Example report", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#section-first-impression h1")).toBeVisible();
    await page.getByTestId("sample-start-report").click();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.getByTestId("workspace-run-report")).toBeVisible();
  });

  test("4. anonymous pasted resume report with a JD produces a usable result", async ({ page }) => {
    await runAnonymousReview(page, "198.51.100.4");
    await expect(page.locator("#section-role")).toBeVisible();
    await expect(page.locator("#section-first-impression h1")).toBeVisible();
    await expect(page.getByRole("button", { name: /Share report/i })).toHaveCount(0);

    const verifiedFact = "Six product, operations, and support partners used the launch cadence";
    await page.getByLabel("Answer the factual question for fix 1").fill(verifiedFact);
    await page.getByRole("button", { name: "Keep this fact" }).first().click();
    await expect(page.getByLabel("Edit suggested line 1")).toHaveValue(new RegExp(verifiedFact));
  });

  test("5. guest save prompt forces verified sign-in instead of silent account capture", async ({ page }) => {
    await runAnonymousReview(page, "198.51.100.5");
    const saveDialog = page.getByRole("dialog", { name: /Keep this report/i });
    await expect(saveDialog.getByRole("heading", { name: "Keep this report" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/We only save reports to verified signed-in accounts/i)).toBeVisible();
    await saveDialog.getByRole("button", { name: /Sign in and keep this report/i }).click();
    await expect(page.locator("#auth-email")).toBeVisible();
    await expect(page.getByRole("button", { name: /Send sign-in code/i })).toBeVisible();
  });

  test("6. extension deep links land on the real auth flow with the intended next path", async ({ page }) => {
    await page.goto("/auth?from=extension&next=/jobs");
    await expect(page).toHaveURL(/\/auth\?from=extension&next=\/jobs/);
    await expect(page.locator("#auth-email")).toBeVisible();
    await expect(page.getByRole("button", { name: /Send sign-in code/i })).toBeVisible();
  });

  test("7. report history sends anonymous users into an auth-protected flow", async ({ page }) => {
    await page.goto("/reports");
    await expect(page).toHaveURL(/\/auth\?from=reports&next=\/reports/);
    await expect(page.locator("#auth-email")).toBeVisible();
  });

  test("8. jobs tracker stays outside the public preview", async ({ request }) => {
    const [jobsResponse, jobDetailResponse] = await Promise.all([
      request.get("/jobs"),
      request.get("/jobs/sample-job-id"),
    ]);
    expect(jobsResponse.status()).toBe(404);
    expect(jobDetailResponse.status()).toBe(404);
  });

  test("9. settings keeps sensitive controls behind a sign-in gate", async ({ page }) => {
    await page.goto("/settings/account");
    await expect(page.getByRole("heading", { name: "Settings", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Sign in to open settings/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Sign in$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to workspace/i })).toBeVisible();
  });

  test("10. anonymous attack paths are blocked cleanly by save and checkout APIs", async ({ request }) => {
    const saveResponse = await request.post("/api/reports", {
      data: {
        report: {
          score: 86,
          summary: "mock",
        },
      },
    });
    expect(saveResponse.status()).toBe(401);
    const saveJson = await saveResponse.json();
    expect(saveJson.errorCode).toBe("AUTH_REQUIRED");
    expect(saveJson.message).toMatch(/sign-in/i);

    const checkoutResponse = await request.post("/api/checkout", {
      data: {
        tier: "30d",
        source: "pricing",
        email: "test@example.com",
      },
    });
    expect(checkoutResponse.status()).toBe(503);
    const checkoutJson = await checkoutResponse.json();
    expect(checkoutJson.ok).toBe(false);
    expect(checkoutJson.message).toMatch(/temporarily unavailable/i);
  });

  test("11. exhausted free report opens paid access before another run", async ({ page }) => {
    await page.route("**/api/free-status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          free_uses_left: 0,
          free_uses_remaining: 0,
          source: "test",
        }),
      });
    });

    await openPasteMode(page);
    await expect(page.getByText("A Job Search Pass is required for another report")).toBeVisible();
    await page.getByTestId("workspace-resume-text").fill(RESUME_TEXT);
    await page.getByTestId("workspace-role-toggle").click();
    await page.getByTestId("workspace-job-description").fill(JOB_DESCRIPTION);
    await page.getByTestId("workspace-run-report").click();

    const paywall = page.getByRole("dialog", { name: /reached the preview limit/i });
    await expect(paywall).toBeVisible();
    await expect(paywall.getByText(/Paid access is not open yet/i)).toBeVisible();
  });
});
