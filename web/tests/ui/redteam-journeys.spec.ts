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
  await page.getByRole("button", { name: /Or paste text instead/i }).click();
  await expect(page.getByPlaceholder("Paste your resume content here...")).toBeVisible();
}

async function runAnonymousReview(page: Page) {
  await openPasteMode(page);
  await page.getByPlaceholder("Paste your resume content here...").fill(RESUME_TEXT);
  await page.getByRole("button", { name: /Check fit for a specific job/i }).click();
  await page.getByPlaceholder(/Paste the full job posting here/i).fill(JOB_DESCRIPTION);
  await page.getByRole("button", { name: /See What They See/i }).click();
  await expect(page.getByText("This is the read they get in seconds.")).toBeVisible({ timeout: 35_000 });
  await expect(page.locator("#section-evidence-ledger")).toBeVisible({ timeout: 35_000 });
}

test.describe("launch red-team journeys", () => {
  test("1. landing page drives users toward the workspace", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Run Your Free Review/i }).first()).toBeVisible();
    await page.getByRole("link", { name: /Run Your Free Review/i }).first().click();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.getByText("This is what they see.")).toBeVisible();
  });

  test("2. public trust surfaces publish readiness and disclosure details", async ({ page, request }) => {
    const statusResponse = await request.get("/api/status");
    expect(statusResponse.ok()).toBeTruthy();
    const statusJson = await statusResponse.json();
    expect(statusJson.ok).toBe(true);
    expect(Array.isArray(statusJson.services)).toBe(true);

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
    await page.getByRole("button", { name: /See example report/i }).click();
    await expect(page.getByText("Example", { exact: true }).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("This is the read they get in seconds.").first()).toBeVisible();
    await expect(page.getByText("Example", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: /Run Your Review/i }).first().click();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.getByRole("button", { name: /See What They See/i })).toBeVisible();
  });

  test("4. anonymous pasted resume review with a JD produces a usable report", async ({ page }) => {
    await runAnonymousReview(page);
    await expect(page.locator("#section-job-alignment")).toBeVisible();
    await expect(page.getByText("This is the read they get in seconds.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Copy Share Link/i })).toHaveCount(0);
  });

  test("5. guest save prompt forces verified sign-in instead of silent account capture", async ({ page }) => {
    await runAnonymousReview(page);
    await expect(page.getByRole("dialog").getByText("Save this review securely")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Nothing is created in the background/i)).toBeVisible();
    await page.getByRole("button", { name: /Sign in to save this review/i }).click();
    await expect(page.locator("#auth-email")).toBeVisible();
    await expect(page.getByRole("button", { name: /Email secure sign-in code/i })).toBeVisible();
  });

  test("6. extension deep links land on the real auth flow with the intended next path", async ({ page }) => {
    await page.goto("/auth?from=extension&next=/jobs");
    await expect(page).toHaveURL(/\/auth\?from=extension&next=\/jobs/);
    await expect(page.locator("#auth-email")).toBeVisible();
    await expect(page.getByRole("button", { name: /Email secure sign-in code/i })).toBeVisible();
  });

  test("7. report history sends anonymous users into an auth-protected flow", async ({ page }) => {
    await page.goto("/reports");
    await expect(page).toHaveURL(/\/auth\?from=reports&next=\/reports/);
    await expect(page.locator("#auth-email")).toBeVisible();
  });

  test("8. jobs tracker explains the signed-out state clearly", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.getByRole("heading", { name: "Jobs", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Sign in to see saved jobs/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Open Workspace" }).first()).toBeVisible();
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
        tier: "monthly",
        source: "pricing",
        email: "test@example.com",
      },
    });
    expect(checkoutResponse.status()).toBe(503);
    const checkoutJson = await checkoutResponse.json();
    expect(checkoutJson.ok).toBe(false);
    expect(checkoutJson.message).toMatch(/temporarily unavailable/i);
  });
});
