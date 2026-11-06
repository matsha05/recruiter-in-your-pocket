import { expect, test, type Page } from "@playwright/test";
import sampleReport from "../../public/sample-report.json";
import { scoreBandFor } from "../../lib/reports/score-band";
import { blankLabels } from "../../lib/reports/worklist-presentation";

// The sample's first card that needs work, read the way the report reads it, so these checks follow the sample's content.
const sampleCards = sampleReport.cards as Array<{ kind: string; line: string; cannot_tell: string; example: string; question: string }>;
const sampleFirstWork = sampleCards.find((card) => card.kind !== "keep" && blankLabels(card.example).length > 0)!;
const sampleFirstWorkIndex = sampleCards.indexOf(sampleFirstWork);

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
    await expect(page.getByTestId("worklist-report")).toBeVisible();
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
    await expect(page.getByRole("link", { name: "Get help", exact: true })).toBeVisible();
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

    // The first screen: the score and its rung, the verdict and the write-up; never the retired name.
    const firstRead = page.locator("#section-first-impression");
    await expect(firstRead.getByTestId("score-band")).toContainText(scoreBandFor(sampleReport.score).name);
    await expect(firstRead).not.toContainText("/100");
    await expect(page.getByTestId("worklist-report")).not.toContainText("Critical Miss");
    await expect(firstRead.getByTestId("worklist-write-up")).toContainText(sampleReport.write_up[0].slice(0, 40));
    await expect(page.getByText("Not a prediction of interviews or offers.", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("score-basis")).toContainText("It doesn't predict interviews or offers.");
    await expect(page.getByRole("heading", { name: "Lines that need work.", exact: true })).toHaveCount(1);

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
    expect(navigationBoxes).toHaveLength(3);
    expect(new Set(navigationBoxes.map((box) => box.top)).size).toBe(1);
    for (const box of navigationBoxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(390);
      expect(box.top).toBeGreaterThanOrEqual(headerBottom);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    // The sample's cards work like a real one: the answers fill the blanks, word for word, and the line can be copied.
    const card = page.getByTestId("worklist-card").nth(sampleFirstWorkIndex);
    await expect(card).toContainText(sampleFirstWork.cannot_tell);
    await expect(card).toContainText(sampleFirstWork.question);
    const blanks = card.getByTestId("worklist-blank");
    const labels = blankLabels(sampleFirstWork.example);
    await expect(blanks).toHaveCount(labels.length);
    for (let index = 0; index < labels.length; index += 1) await blanks.nth(index).fill(`answer ${index + 1}`);
    await expect(card.getByTestId("worklist-copy")).toBeVisible();
    await expect(blanks.first()).toHaveValue("answer 1");
    await expect(card).toContainText("Every fact in it is from your resume or your answers.");
    // Brackets on the page are the person's blanks, never a draft presented as writing.
    await expect(page.locator("#section-fixes")).not.toContainText("These are drafts.");
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

    // The worklist report: no Critical Miss, nothing called "the read", one card per line with the line quoted.
    const report = page.getByTestId("worklist-report");
    await expect(report).not.toContainText("Critical Miss");
    await expect(report).not.toContainText(/\bthe read\b/);
    // (The mock model writes a fixed report, so the quoted lines are the validator's job on the live route, not this spec's.)
    const cards = page.getByTestId("worklist-card");
    expect(await cards.count()).toBeGreaterThan(0);

    // The example composes from the candidate's answers only: Copy appears once every blank is filled, and
    // the composed line is the example with the answers in its blanks, word for word.
    const card = cards.filter({ has: page.getByTestId("worklist-blank") }).first();
    const blanks = card.getByTestId("worklist-blank");
    const blankCount = await blanks.count();
    expect(blankCount).toBeGreaterThan(0);
    await expect(card.getByTestId("worklist-copy")).toHaveCount(0);
    await blanks.first().fill("3 launch teams");
    await expect(blanks.first()).toHaveValue("3 launch teams");
    if (blankCount > 1) await expect(card.getByTestId("worklist-copy")).toHaveCount(0);
    for (let index = 1; index < blankCount; index += 1) await blanks.nth(index).fill(`answer ${index}`);
    await expect(card.getByTestId("worklist-copy")).toBeVisible();
    await expect(card).toContainText("Every fact in it is from your resume or your answers.");

    // An anonymous report keeps nothing: no save-to-report notice, and no feedback mailto.
    await expect(card.getByTestId("worklist-kept")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Send feedback", exact: true })).toHaveCount(0);
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
