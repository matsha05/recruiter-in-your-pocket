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
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByTestId("landing-primary-cta")).toBeVisible();
    const heroFirstRead = page.getByRole("article", { name: /You led onboarding/i });
    await expect(heroFirstRead.getByText("Exact resume line", { exact: true })).toBeVisible();
    await page.getByTestId("landing-primary-cta").click();
    await expect(page).toHaveURL(/\/workspace$/, { timeout: 45_000 });
    await expect(page.getByRole("heading", { name: /Start with your resume/i })).toBeVisible();
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
    // The approved workspace reference deliberately keeps its empty state focused
    // on starting a real review. Public sample CTAs deep-link into this mode.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/sample-report");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://www.recruiterinyourpocket.com/sample-report",
    );
    await expect(page.locator("[data-visual-anchor='workspace-resume-empty']")).toHaveCount(0);
    await expect(page.getByText("Example report", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#section-first-impression h1")).toBeVisible();

    const sampleCta = page.getByTestId("sample-start-report");
    await expect(sampleCta).toHaveText(/Get my free report/i);
    expect(await sampleCta.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    })).toBe(true);

    const reportNavigation = page.getByRole("navigation", { name: "Resume report sections" });
    const navigationBoxes = await reportNavigation.getByRole("button").evaluateAll((buttons) => buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: Math.round(rect.top) };
    }));
    const headerBottom = await page.locator("header.site-header").evaluate((header) => (
      Math.round(header.getBoundingClientRect().bottom)
    ));
    expect(navigationBoxes).toHaveLength(4);
    expect(new Set(navigationBoxes.map((box) => box.top)).size).toBe(2);
    for (const box of navigationBoxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(390);
      expect(box.top).toBeGreaterThanOrEqual(headerBottom);
    }

    const firstRead = page.locator("#section-first-impression");
    await expect(firstRead.getByText("Clarity summary: 78/100", { exact: true })).toBeVisible();
    await expect(firstRead.getByText("Not a prediction of interviews or offers.", { exact: true })).toBeVisible();
    await expect(page.getByTestId("clarity-summary-basis")).toContainText(
      "it is not a simple average",
    );
    await expect(page.getByRole("heading", { name: "Three moves. In order.", exact: true })).toBeVisible();

    const evidenceJump = firstRead.getByRole("button", { name: "See the fixes", exact: true });
    await expect(evidenceJump).toBeVisible();
    await evidenceJump.click();

    const sampleFixes = page.locator('[id^="section-fix-"]');
    const firstFix = sampleFixes.first();
    await expect(firstFix).toContainText("Draft to complete with your facts");
    await expect(firstFix).toContainText("The brackets mark details missing from the original. Add only what you can verify.");
    await expect(sampleFixes.locator("input, textarea")).toHaveCount(0);
    await expect(sampleFixes.getByRole("button", { name: /Edit|Copy|Keep these facts|Not relevant|Original resume needed/i })).toHaveCount(0);
    await expect(page.locator("#section-independent-advice button")).toHaveCount(0);

    const terminalCta = page.getByTestId("sample-terminal-cta");
    await expect(terminalCta).toContainText("Let's look at your resume.");
    await terminalCta.getByRole("button", { name: "Get my free report", exact: true }).click();
    await expect(page).toHaveURL(/\/workspace$/, { timeout: 45_000 });
    await expect(page.getByTestId("workspace-run-report")).toBeVisible();
  });

  test("4. anonymous pasted resume report with a JD produces a usable result", async ({ page }) => {
    await runAnonymousReview(page, "198.51.100.4");
    await expect(page.locator("#section-role")).toBeVisible();
    await expect(page.locator("#section-first-impression h1")).toBeVisible();
    await expect(page.getByRole("button", { name: /Share report/i })).toHaveCount(0);

    const purchaseDecision = page.getByTestId("post-report-purchase-decision");
    await expect(purchaseDecision).toContainText("This free report is complete. You do not need to pay to see the rest.");
    await expect(purchaseDecision).toContainText("The Job Search Pass is there when you have a revision to compare or another application to review.");
    await expect(purchaseDecision.getByRole("button")).toHaveText(/Get 5 more reports · \$29/);
    await expect(purchaseDecision).toContainText("One payment. 30 days. No automatic renewal.");
    await purchaseDecision.getByRole("button").click();
    const reportPaywall = page.getByRole("dialog", { name: /Paid passes are currently unavailable/i });
    await expect(reportPaywall).toContainText("Your existing report stays available");
    await expect(reportPaywall.getByRole("button", { name: "Back to my report" })).toBeVisible();
    await expect(reportPaywall.getByRole("button", { name: "Back to workspace" })).toHaveCount(0);
    await reportPaywall.getByRole("button", { name: "Back to my report" }).click();

    const feedback = page.getByTestId("report-feedback");
    await expect(feedback).toContainText("Tell us which advice helped and which line needs another look.");
    await expect(feedback).not.toContainText("beta");
    await expect(feedback).toContainText("Your resume is never attached.");
    const feedbackLink = feedback.getByRole("link", { name: "Send feedback", exact: true });
    await expect(feedbackLink).toHaveAttribute("href", /subject=Report%20feedback/);

    const firstGeneratedFix = page.locator("#section-fix-1");
    const generatedFactInputs = firstGeneratedFix.locator('input[aria-label^="Fact for "]');
    const generatedFactCount = await generatedFactInputs.count();
    if (generatedFactCount > 0) {
      await expect(firstGeneratedFix.getByRole("button", { name: "Verify facts to copy" })).toBeDisabled();
      for (let index = 0; index < generatedFactCount; index += 1) {
        await generatedFactInputs.nth(index).fill(`Candidate supplied fact ${index + 1}`);
      }
      await firstGeneratedFix.getByRole("button", { name: "Keep these facts" }).click();
      const generatedDraft = firstGeneratedFix.getByLabel("Edit suggested line 1");
      for (let index = 0; index < generatedFactCount; index += 1) {
        await expect(generatedDraft).toHaveValue(new RegExp(`Candidate supplied fact ${index + 1}`));
      }
      await expect(firstGeneratedFix.getByRole("button", { name: "Copy", exact: true })).toBeEnabled();
      await generatedFactInputs.first().fill("Changed but not confirmed");
      await expect(firstGeneratedFix.getByRole("button", { name: "Verify facts to copy" })).toBeDisabled();
    } else {
      const copyButton = firstGeneratedFix.getByRole("button", { name: "Copy", exact: true });
      const verifyButton = firstGeneratedFix.getByRole("button", { name: "Verify facts to copy" });
      if (await copyButton.count()) await expect(copyButton).toBeEnabled();
      else if (await verifyButton.count()) await expect(verifyButton).toBeDisabled();
      else await expect(firstGeneratedFix.getByText("Question to answer")).toBeVisible();
    }
  });

  test("5. guest save prompt opens only after Keep report and requires verified sign-in", async ({ page }) => {
    await runAnonymousReview(page, "198.51.100.5");
    const saveDialog = page.getByRole("dialog", { name: /Keep this report/i });
    const keepReport = page.getByTestId("workspace-keep-report");
    await expect(keepReport).toBeVisible();
    await page.waitForTimeout(5_500);
    await expect(saveDialog).toHaveCount(0);
    await keepReport.click();
    await expect(saveDialog.getByRole("heading", { name: "Keep this report" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/We only save reports to verified signed-in accounts/i)).toBeVisible();
    await saveDialog.getByRole("button", { name: /Sign in and keep this report/i }).click();
    const authDialog = page.getByRole("dialog", { name: "Sign in to continue" });
    await expect(authDialog).toBeVisible();
    await expect(authDialog).toHaveAccessibleDescription("Use your email to receive a secure one-time sign-in code.");
    await expect(authDialog.locator("#auth-email")).toBeVisible();
    await expect(authDialog.getByRole("button", { name: /Send sign-in code/i })).toBeVisible();
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

    const paywall = page.getByRole("dialog", { name: /Paid passes are currently unavailable/i });
    await expect(paywall).toBeVisible();
    await expect(paywall).not.toContainText("Your existing report stays available");
    await expect(paywall).toContainText("You can return to your resume below");
    await expect(paywall.getByRole("button", { name: "Back to workspace" })).toBeVisible();
    await expect(paywall.getByRole("button", { name: "Back to my report" })).toHaveCount(0);
  });
});
