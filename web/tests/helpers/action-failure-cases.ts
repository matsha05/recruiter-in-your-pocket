import { expect, test, type Page, type Route } from "@playwright/test";

type Failure = "network" | "malformed" | "api";
const FAILURES: Failure[] = ["network", "malformed", "api"];
const API_MESSAGE = "Please contact support with your checkout email.";

async function failResponse(route: Route, failure: Failure) {
  if (failure === "network") return route.abort("failed");
  if (failure === "malformed") return route.fulfill({ status: 502, contentType: "application/json", body: "not-json" });
  return route.fulfill({ status: 400, json: { ok: false, message: API_MESSAGE } });
}

async function signInHarness(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem("workspace-harness-user", JSON.stringify({
    id: "33333333-3333-4333-8333-333333333333", email: "candidate@example.test",
    membership: "credit", paidUsesLeft: 2, freeUsesLeft: 1, canExportPdf: true,
  })));
}

export function registerActionFailureCases({ origin, savedReportId, report }: {
  origin: string;
  savedReportId: string;
  report: { first_impression_takeaway?: string };
}) {
  for (const failure of FAILURES) {
    test(`history keeps a report name available to retry after ${failure} failure`, async ({ page }) => {
      let renames = 0;
      await page.route("**/api/reports", (route) => route.fulfill({ json: {
        ok: true, reports: [{ id: savedReportId, name: "Original name", score: 70, createdAt: "2026-09-04T10:00:00Z" }],
      } }));
      await page.route(`**/api/reports/${savedReportId}`, (route) => {
        renames += 1;
        return renames === 1 ? failResponse(route, failure) : route.fulfill({ json: { ok: true } });
      });
      await page.goto(`${origin}/history`);
      await page.getByRole("button", { name: "Rename Original name", exact: true }).click();
      const name = page.getByLabel("Name Original name", { exact: true });
      await name.fill("Operations resume");
      await name.press("Enter");
      await expect(page.getByText(failure === "api" ? API_MESSAGE : "The report couldn’t be renamed. Please try again.", { exact: true })).toBeVisible();
      await expect(name).toHaveValue("Operations resume");
      await name.press("Enter");
      await expect(page.getByRole("button", { name: "Rename Operations resume", exact: true })).toBeVisible();
      expect(renames).toBe(2);
    });

    test(`sign-in preserves the email and offers a retry after ${failure} failure`, async ({ page }) => {
      let requests = 0;
      await page.route("**/api/auth/send-code", (route) => {
        requests += 1;
        return requests === 1 ? failResponse(route, failure) : route.fulfill({ json: { ok: true } });
      });
      await page.goto(`${origin}/auth`);
      await page.getByLabel("Email address", { exact: true }).fill("candidate@example.test");
      await page.getByRole("button", { name: "Send sign-in code", exact: true }).click();
      await expect(page.getByRole("alert")).toHaveText(failure === "api" ? API_MESSAGE : "We couldn’t send a code. Please try again.");
      await expect(page.getByLabel("Email address", { exact: true })).toHaveValue("candidate@example.test");
      await page.getByRole("button", { name: "Send sign-in code", exact: true }).click();
      await expect(page.getByLabel("Login code", { exact: true })).toBeVisible();
      expect(requests).toBe(2);
    });

    test(`code verification preserves the code and retries after ${failure} failure`, async ({ page }) => {
      let requests = 0;
      await page.route("**/api/auth/send-code", (route) => route.fulfill({ json: { ok: true } }));
      await page.route("**/api/auth/verify-code", (route) => {
        requests += 1;
        return requests === 1 ? failResponse(route, failure) : route.fulfill({ json: { ok: true, user: {} } });
      });
      await page.goto(`${origin}/auth`);
      await page.getByLabel("Email address", { exact: true }).fill("candidate@example.test");
      await page.getByRole("button", { name: "Send sign-in code", exact: true }).click();
      await page.getByLabel("Login code", { exact: true }).fill("12345678");
      await expect(page.getByRole("alert")).toHaveText(failure === "api" ? API_MESSAGE : "We couldn’t verify that code. Please try again.");
      await expect(page.getByLabel("Login code", { exact: true })).toHaveValue("12345678");
      await page.getByRole("button", { name: "Verify Code", exact: true }).click();
      await expect(page.getByLabel("First name", { exact: true })).toBeVisible();
      expect(requests).toBe(2);
    });

    for (const action of [
      { button: "Restore access", endpoint: "restore", fallback: "We couldn’t restore your pass. Try again or contact support." },
      { button: "Billing portal", endpoint: "portal", fallback: "Stripe billing couldn’t open. Please try again." },
      { button: "View receipts", endpoint: "receipts", fallback: "We couldn’t load your receipts. Please try again." },
    ]) {
      test(`${action.button} recovers from ${failure} failure without exposing browser errors`, async ({ page }) => {
        await signInHarness(page);
        let requests = 0;
        await page.route(`**/api/billing/${action.endpoint}`, (route) => {
          requests += 1;
          if (requests === 1) return failResponse(route, failure);
          return route.fulfill({ json: {
            ok: true, restored: 1, message: "Your pass is available.", receipts: [], url: `${origin}/purchase/restore?billing=updated`,
          } });
        });
        await page.goto(`${origin}/purchase/restore`);
        const button = page.getByRole("button", { name: action.button, exact: true });
        await button.click();
        await expect(page.getByText(failure === "api" ? API_MESSAGE : action.fallback, { exact: true }).first()).toBeVisible();
        await expect(button).toBeEnabled();
        await button.click();
        if (action.endpoint === "restore") await expect(page.getByText("Your pass is available.", { exact: true })).toBeVisible();
        if (action.endpoint === "portal") await expect(page).toHaveURL(`${origin}/purchase/restore?billing=updated`);
        if (action.endpoint === "receipts") await expect(page.getByText(/No receipts were found for this account/)).toBeVisible();
        expect(requests).toBe(2);
      });
    }

    test(`saved-report PDF survives ${failure} failure and downloads on retry`, async ({ page }) => {
      await signInHarness(page);
      await page.route(`**/api/reports/${savedReportId}`, (route) => route.fulfill({ json: {
        ok: true, report: { ...report, report_id: savedReportId },
      } }));
      let exports = 0;
      await page.route("**/api/export-pdf", (route) => {
        exports += 1;
        return exports === 1 ? failResponse(route, failure) : route.fulfill({ contentType: "application/pdf", body: "%PDF-1.4\n%%EOF" });
      });
      await page.goto(`${origin}/reports/${savedReportId}`);
      const exportButton = page.getByRole("button", { name: "Export report as PDF", exact: true });
      await exportButton.click();
      await expect(page.getByText(failure === "api" ? API_MESSAGE : "The PDF couldn’t download. Try exporting again.", { exact: true })).toBeVisible();
      await expect(page.locator("#section-first-impression h1")).toHaveText(report.first_impression_takeaway || "");
      await expect(exportButton).toBeEnabled();
      const download = page.waitForEvent("download");
      await exportButton.click();
      expect((await download).suggestedFilename()).toBe("resume-report.pdf");
      expect(exports).toBe(2);
    });
  }
}
