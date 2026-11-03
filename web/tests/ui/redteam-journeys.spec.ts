import { expect, test, type Page } from "@playwright/test";
import sampleReport from "../../public/sample-report.json";
import type { ReportData } from "../../components/workspace/report/ReportTypes";
import { reconcileReport } from "../../lib/reports/report-integrity";
import { liftQuestions, marginNoteFromFix } from "../../lib/reports/revised-line";
import { scoreBandFor } from "../../lib/reports/score-band";

// The sample's Critical Miss, read the way the report reads it, so these checks follow the sample's content.
const sampleMiss = reconcileReport(sampleReport as ReportData);
const sampleMissFix = sampleMiss.report.top_fixes![0];
const sampleMissLine = (typeof sampleMissFix.evidence === "string" ? sampleMissFix.evidence : sampleMissFix.evidence!.excerpt!)
  .trim().replace(/^[-•*]\s+/u, "").replace(/[.;,:\s]+$/u, "");
const sampleFirstQuestion = liftQuestions(sampleMiss.fixQuestions[0])[0] || "What would you add to this line?";

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
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
    await expect(page.getByTestId("landing-primary-cta")).toBeVisible();
    // The full example sits one step from the opening, and the way back still leads to a report.
    await page.getByRole("link", { name: "See Jordan’s report", exact: true }).click();
    await expect(page).toHaveURL(/\/sample-report$/, { timeout: 45_000 });
    await expect(page.getByText("Critical Miss", { exact: true }).first()).toBeVisible();
    await page.goBack();
    await expect(page.getByTestId("landing-primary-cta")).toHaveText("Get your free report");
    await page.getByTestId("landing-primary-cta").click();
    await expect(page).toHaveURL(/\/workspace$/, { timeout: 45_000 });
    await expect(page.getByRole("heading", { name: /Let’s see what they see/i })).toBeVisible();
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
    expect(securityText).toContain("Policy: https://recruiterinyourpocket.com/privacy");

    await page.goto("/status");
    await expect(page.getByRole("heading", { name: "Checks by feature", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Support and trust/i })).toBeVisible();
  });

  test("3. example report path feels complete and returns users to a fresh run", async ({ page }) => {
    // The approved workspace reference deliberately keeps its empty state focused
    // on starting a real review. Public sample CTAs deep-link into this mode.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/sample-report");
    await page.getByRole("button", { name: "Decline analytics", exact: true }).click();
    await expect(page.getByTestId("privacy-panel")).toBeHidden();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://www.recruiterinyourpocket.com/sample-report",
    );
    await expect(page.locator("[data-visual-anchor='workspace-resume-empty']")).toHaveCount(0);
    await expect(page.getByText("Sample report · Jordan is fictional", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#section-first-impression h1")).toBeVisible();

    const sampleCta = page.getByTestId("sample-start-report");
    await expect(sampleCta).toHaveText(/Get your free report/i);
    expect(await sampleCta.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    })).toBe(true);

    // The first screen: the Verdict, the score band, and the Critical Miss once with its first question (2.5).
    const firstRead = page.locator("#section-first-impression");
    await expect(firstRead.getByTestId("score-band")).toContainText(scoreBandFor(sampleReport.score).name);
    await expect(firstRead).not.toContainText("/100");
    await expect(firstRead).not.toContainText("Critical Miss");
    const miss = page.getByTestId("critical-miss");
    await expect(miss).toContainText(marginNoteFromFix(sampleMissFix.fix!));
    await expect(miss.getByTestId("lift-question").first().locator("input")).toBeInViewport({ ratio: 1 });
    await expect(page.getByText("Not a prediction of interviews or offers.", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("score-basis")).toContainText("It is not a simple average.");
    await expect(page.getByRole("heading", { name: "Fix these three first.", exact: true })).toHaveCount(1);

    // The section tabs wait until the opening has scrolled away, then sit under the header.
    const reportNavigation = page.getByRole("navigation", { name: "Resume report sections" });
    await expect(reportNavigation).toBeHidden();
    await page.locator("#section-fixes").evaluate((section) => {
      window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    });
    await expect(reportNavigation).toBeVisible();
    const navigationBoxes = await reportNavigation.getByRole("button").evaluateAll((buttons) => buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: Math.round(rect.top), height: rect.height };
    }));
    const headerBottom = await page.locator("header.site-header").evaluate((header) => (
      Math.round(header.getBoundingClientRect().bottom)
    ));
    expect(navigationBoxes).toHaveLength(4);
    expect(new Set(navigationBoxes.map((box) => box.top)).size).toBe(1);
    for (const box of navigationBoxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(390);
      expect(box.top).toBeGreaterThanOrEqual(headerBottom);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    // The sample's Critical Miss works like a real one: answers build the line, word for word.
    const questions = miss.getByTestId("lift-question");
    await expect(questions.first()).toContainText(sampleFirstQuestion);
    await questions.first().locator("input").fill("42 new hires on the support and sales teams");
    for (let index = (await questions.count()) - 1; index > 0; index -= 1) {
      await questions.nth(index).getByRole("button", { name: "I don't know", exact: true }).click();
    }
    await expect(miss.getByTestId("revised-line")).toHaveText(`${sampleMissLine}: 42 new hires on the support and sales teams.`);
    await expect(miss.getByRole("button", { name: "Copy", exact: true })).toBeEnabled();
    await expect(miss).toContainText("This example only has the part of the line it quotes.");
    await expect(miss.getByTestId("miss-feedback")).toHaveCount(0);

    // Bracketed drafts are never presented as writing; the other fixes ask for the details instead.
    await expect(page.locator("#section-fixes").getByText(/\[[^\]]+\]/)).toHaveCount(0);
    await expect(page.locator("#section-fixes")).not.toContainText("These are drafts.");
    await expect(page.locator('[id^="section-fix-"]').getByRole("button", { name: /Use these details|Not relevant/i })).toHaveCount(0);
    await expect(page.locator("#section-independent-advice button")).toHaveCount(0);

    const terminalCta = page.getByTestId("sample-terminal-cta");
    await expect(terminalCta).toContainText("What would they think of yours?");
    await terminalCta.getByRole("button", { name: "Get your free report", exact: true }).click();
    await expect(page).toHaveURL(/\/workspace$/, { timeout: 45_000 });
    await expect(page.getByTestId("workspace-run-report")).toBeVisible();
  });

  test("4. anonymous pasted resume report with a JD produces a usable result", async ({ page }) => {
    await runAnonymousReview(page, "198.51.100.4");
    await expect(page.locator("#section-role")).toBeVisible();
    await expect(page.locator("#section-first-impression h1")).toBeVisible();
    await expect(page.getByRole("button", { name: /Share report/i })).toHaveCount(0);
    await expect(page.getByTestId("sample-start-report")).toHaveCount(0);
    await expect(page.getByTestId("sample-terminal-cta")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Get your free report", exact: true })).toHaveCount(0);
    await expect(page.getByText("Not a prediction of interviews or offers.", { exact: true })).toHaveCount(0);

    const purchaseDecision = page.getByTestId("post-report-purchase-decision");
    await expect(purchaseDecision).toContainText("Everything in your free report is yours. Nothing is held back.");
    await expect(purchaseDecision).toContainText("The Job Search Pass is for what comes next: checking your revision, or tailoring your resume to another job.");
    await expect(purchaseDecision.getByRole("button")).toHaveText(/Get 5 more reports · \$29/);
    await expect(purchaseDecision).toContainText("5 more reports, good for 90 days. No automatic renewal.");
    await purchaseDecision.getByRole("button").click();
    const reportPaywall = page.getByRole("dialog", { name: /Passes are paused for now/i });
    await expect(reportPaywall).toContainText("Your existing report stays available");
    await expect(reportPaywall.getByRole("button", { name: "Back to my report" })).toBeVisible();
    await expect(reportPaywall.getByRole("button", { name: "Back to workspace" })).toHaveCount(0);
    await reportPaywall.getByRole("button", { name: "Back to my report" }).click();

    // The answer to revised line on a generated report: the candidate's line plus their answers only.
    const miss = page.getByTestId("critical-miss");
    const questions = miss.getByTestId("lift-question");
    await expect(miss.getByRole("button", { name: "Copy", exact: true })).toHaveCount(0);
    await questions.first().locator("input").fill("for 3 launch teams");
    for (let index = (await questions.count()) - 1; index > 0; index -= 1) {
      await questions.nth(index).getByRole("button", { name: "I don't know", exact: true }).click();
    }
    const revised = miss.getByTestId("revised-line");
    await expect(revised).toContainText("for 3 launch teams");
    await expect(miss.getByRole("button", { name: "Copy", exact: true })).toBeEnabled();
    await expect(miss).toContainText("Every word is from your resume or your answers.");
    // A number the candidate never gave can't be copied as theirs.
    await miss.getByRole("button", { name: "Edit", exact: true }).click();
    const edit = miss.getByLabel("Edit your revised line");
    await edit.fill(`${await edit.inputValue()} Saved 999 hours.`);
    await miss.getByRole("button", { name: "Done", exact: true }).click();
    await expect(miss.getByRole("button", { name: "Copy", exact: true })).toBeDisabled();
    await expect(miss).toContainText("isn't in your line or your answers");

    // "Was this right?" is answered in the report, not by email (2.6).
    await expect(page.getByRole("link", { name: "Send feedback", exact: true })).toHaveCount(0);
    const feedback = miss.getByTestId("miss-feedback");
    await expect(feedback).toContainText("Was this the right thing to fix first?");
    const feedbackSent = page.waitForResponse((response) => response.url().endsWith("/api/report-feedback"));
    await feedback.getByRole("button", { name: "Yes", exact: true }).click();
    expect((await feedbackSent).status()).toBe(200);
    await expect(miss.getByText("Thanks. This is how we find out when we picked the wrong thing.")).toBeVisible();
  });

  test("5. guest save prompt opens only after Save this version and requires verified sign-in", async ({ page }) => {
    await runAnonymousReview(page, "198.51.100.5");
    const saveDialog = page.getByRole("dialog", { name: /Save this report/i });
    const keepReport = page.getByTestId("workspace-keep-report");
    await expect(keepReport).toBeVisible();
    await page.waitForTimeout(5_500);
    await expect(saveDialog).toHaveCount(0);
    await keepReport.click();
    await expect(saveDialog.getByRole("heading", { name: "Save this report" })).toBeVisible({ timeout: 15_000 });
    await expect(saveDialog.getByText("Saving keeps the report, quoted resume excerpts, a short resume preview, and any job description you added in your account. You can delete the saved report at any time.", { exact: true })).toBeVisible();
    await saveDialog.getByRole("button", { name: /Sign in to save/i }).click();
    // The sign-in dialog is named for what the visitor is doing.
    const authDialog = page.getByRole("dialog").filter({ has: page.locator("#auth-email") });
    await expect(authDialog).toBeVisible();
    await expect(authDialog).toHaveAccessibleName("Save this report");
    await expect(authDialog).toHaveAccessibleDescription("Use your email to receive a secure one-time sign-in code.");
    await expect(authDialog.locator("#auth-email")).toBeVisible();
    await expect(authDialog.getByRole("button", { name: /Send sign-in code/i })).toBeVisible();
  });

  test("6. extension deep links land on the real auth flow with the intended next path", async ({ page }) => {
    await page.goto("/auth?from=extension&next=/jobs");
    await expect(page).toHaveURL(/\/auth\?from=extension&next=\/jobs/);
    // The sign-in form is client-rendered; before hydration settles a dev server can briefly show it twice.
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
    await expect(page.locator("#auth-email")).toBeVisible();
    await expect(page.getByRole("button", { name: /Send sign-in code/i })).toBeVisible();
  });

  test("7. report history sends anonymous users into an auth-protected flow", async ({ page }) => {
    await page.goto("/reports");
    await expect(page).toHaveURL(/\/auth\?from=reports&next=\/reports/);
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
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
    // The header carries its own Sign in link; the gate's action lives in the page body.
    const gate = page.locator("#main-content");
    await expect(gate.getByRole("link", { name: /^Sign in$/i })).toHaveAttribute("href", /next=%2Fsettings%2Faccount/);
    await expect(gate.getByRole("link", { name: /Back to workspace/i })).toBeVisible();
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

  test("11. exhausted free report offers a free account report before paid access", async ({ page }) => {
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
    // The anonymous allowance can be used by someone else on the same network;
    // every account still has its own free report, so that comes first.
    await expect(page.getByText("Sign in for your free report, or get a Job Search Pass")).toBeVisible();
    await page.getByTestId("workspace-resume-text").fill(RESUME_TEXT);
    await page.getByTestId("workspace-role-toggle").click();
    await page.getByTestId("workspace-job-description").fill(JOB_DESCRIPTION);
    await page.getByTestId("workspace-run-report").click();

    const paywall = page.getByRole("dialog", { name: "Your free report needs an account" });
    await expect(paywall).toBeVisible();
    await expect(paywall).not.toContainText("Your existing report stays available");
    await expect(paywall).toContainText("Each account gets its own, so sign in to get yours.");
    await expect(paywall.getByRole("button", { name: "Back to my resume" })).toBeVisible();
    await expect(paywall.getByRole("button", { name: "Back to my report" })).toHaveCount(0);

    await paywall.getByRole("button", { name: "Sign in for your free report" }).click();
    const signIn = page.getByRole("dialog", { name: "Get your free report" });
    await expect(signIn).toBeVisible();
    await expect(signIn.getByLabel("Email address", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(signIn).toHaveCount(0);
    await expect(page.getByTestId("workspace-resume-text")).toHaveValue(RESUME_TEXT);
  });
});
