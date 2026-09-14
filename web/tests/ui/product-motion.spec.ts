import { expect, test, type Locator, type Page, type Route } from "@playwright/test";
import { schemaValidReport } from "../helpers/report-fidelity-fixture";
import { ResumeFeedbackResponseSchema } from "../../lib/validation/resume-report-schema";

const SOURCE = "Built customer workflows in HubSpot for 120 customers.";
const REWRITE = "Built HubSpot customer workflows for 120 customers.";
const RESUME = `Alex Rivera\nCustomer Operations\nExperience\n${SOURCE}\nDocumented the workflow and trained the support team on customer onboarding.`;
const REPORT = ResumeFeedbackResponseSchema.parse({
  ...schemaValidReport,
  top_fixes: [{
    ...schemaValidReport.top_fixes[0],
    fix: "Put the HubSpot workflow first in the customer bullet.",
    evidence: { excerpt: SOURCE, section: "Experience" },
  }],
  rewrites: [{ original: SOURCE, better: REWRITE, label: "Customer workflow", enhancement_note: "Add the workflow outcome if you can verify it." }],
});

type ClipboardProbe = {
  mode: "pending" | "success" | "error";
  calls: string[];
  resolve: Array<() => void>;
};

async function installClipboard(page: Page, mode: ClipboardProbe["mode"]) {
  await page.addInitScript((initialMode) => {
    const probe: ClipboardProbe = { mode: initialMode, calls: [], resolve: [] };
    (window as unknown as { __motionClipboard: ClipboardProbe }).__motionClipboard = probe;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText(text: string) {
          probe.calls.push(text);
          if (probe.mode === "pending") return new Promise<void>((resolve) => probe.resolve.push(resolve));
          if (probe.mode === "error") return Promise.reject(new DOMException("Clipboard permission denied", "NotAllowedError"));
          return Promise.resolve();
        },
      },
    });
  }, mode);
}

async function hydrate(page: Page, route: string) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
  // These contracts start after the visitor makes their privacy choice. Use the
  // real control rather than suppressing the consent UI or seeding storage.
  await page.getByRole("button", { name: "Decline analytics", exact: true }).click();
  await expect(page.getByTestId("privacy-panel")).toBeHidden();
}

async function completeReport(route: Route) {
  const request = route.request().postDataJSON();
  await route.fulfill({
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
    body: `${JSON.stringify({ type: "complete", ok: true, data: REPORT, report_id: null, report_receipt: null, operation_id: request.recovery_id, free_uses_remaining: 1 })}\n`,
  });
}

async function openEditableReport(page: Page) {
  await page.route("**/api/resume-feedback-stream", completeReport);
  await hydrate(page, "/workspace");
  await page.getByTestId("workspace-paste-mode").click();
  await page.getByTestId("workspace-resume-text").fill(RESUME);
  await page.getByTestId("workspace-run-report").click();
  await expect(page.locator("#section-first-impression h1")).toHaveText(REPORT.first_impression_takeaway);
  const fix = page.locator("#section-fix-1");
  await expect(fix.getByRole("button", { name: "Copy", exact: true })).toBeEnabled();
  await fix.scrollIntoViewIfNeeded();
  return fix;
}

async function boxSize(control: Locator) {
  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  return { width: box!.width, height: box!.height };
}

async function expectStableSize(control: Locator, initial: { width: number; height: number }) {
  await expect.poll(async () => {
    const current = await boxSize(control);
    return Math.max(Math.abs(initial.width - current.width), Math.abs(initial.height - current.height));
  }, { message: "Feedback must fit the original control without moving its neighboring actions" }).toBeLessThanOrEqual(1);
}

async function expectCurrent(navigation: Locator, name: string) {
  await expect(navigation.locator('[aria-current="location"]')).toHaveCount(1);
  await expect(navigation.getByRole("button", { name, exact: true })).toHaveAttribute("aria-current", "location");
}

test.describe("product motion contracts on real app routes", () => {
  let runtimeErrors: string[];
  test.beforeEach(async ({ page }) => {
    runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    // Keep these interaction checks independent of account balances and paid APIs.
    await page.route("**/api/free-status", (route) => route.fulfill({ json: { ok: true, free_uses_left: 1 } }));
  });
  test.afterEach(() => expect(runtimeErrors, "Motion must not introduce browser runtime errors").toEqual([]));

  test("copy feedback waits for the clipboard and keeps its original size", async ({ page }) => {
    await installClipboard(page, "pending");
    const fix = await openEditableReport(page);
    const copy = fix.getByRole("button", { name: "Copy", exact: true });
    const original = await boxSize(copy);
    await copy.click();
    const pending = fix.getByRole("button", { name: "Copying", exact: true });
    await expect(pending).toHaveAttribute("aria-busy", "true");
    await expect(pending).toBeDisabled();
    await expect(fix.getByRole("button", { name: "Copied", exact: true })).toHaveCount(0);
    await expectStableSize(pending, original);
    expect(await page.evaluate(() => (window as unknown as { __motionClipboard: ClipboardProbe }).__motionClipboard.calls)).toEqual([REWRITE]);
    await page.evaluate(() => (window as unknown as { __motionClipboard: ClipboardProbe }).__motionClipboard.resolve[0]());
    const success = fix.getByRole("button", { name: "Copied", exact: true });
    await expect(success).toBeEnabled();
    await expectStableSize(success, original);
  });

  test("clipboard denial reports failure and a deliberate retry can succeed", async ({ page }) => {
    await installClipboard(page, "error");
    const fix = await openEditableReport(page);
    const copy = fix.getByRole("button", { name: "Copy", exact: true });
    const original = await boxSize(copy);
    await copy.click();
    await expect(fix.getByRole("status")).toContainText("Couldn't copy");
    await expect(fix.getByRole("button", { name: "Copied", exact: true })).toHaveCount(0);
    await expect(copy).toBeEnabled();
    await expectStableSize(copy, original);
    await page.evaluate(() => { (window as unknown as { __motionClipboard: ClipboardProbe }).__motionClipboard.mode = "success"; });
    await copy.click();
    await expect(fix.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
    await expect(fix.getByText(/Couldn't copy/)).toHaveCount(0);
  });

  test("a repeat copy gets a complete confirmation interval instead of an old timer clearing it", async ({ page }) => {
    await installClipboard(page, "success");
    const fix = await openEditableReport(page);
    await page.clock.install();
    await fix.getByRole("button", { name: "Copy", exact: true }).click();
    await expect(fix.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
    await page.clock.runFor(1000);
    await fix.getByRole("button", { name: "Copied", exact: true }).click();
    await page.clock.runFor(800);
    await expect(fix.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
    await page.clock.runFor(1000);
    await expect(fix.getByRole("button", { name: "Copy", exact: true })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __motionClipboard: ClipboardProbe }).__motionClipboard.calls)).toEqual([REWRITE, REWRITE]);
  });

  test("mobile reduced-motion copy feedback is readable without animation or a layout jump", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await installClipboard(page, "success");
    const fix = await openEditableReport(page);
    const copy = fix.getByRole("button", { name: "Copy", exact: true });
    const original = await boxSize(copy);
    await copy.focus();
    await page.keyboard.press("Enter");
    const success = fix.getByRole("button", { name: "Copied", exact: true });
    await expect(success).toBeFocused();
    await expectStableSize(success, original);
    await expect.poll(() => success.evaluate((button) => button.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length)).toBe(0);
    const bounds = await success.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  });

  test("file parsing exposes pending state, then accepted state, and returns keyboard focus on remove", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let pending: Route | undefined;
    await page.route("**/api/parse-resume", (route) => { pending = route; });
    await hydrate(page, "/workspace");
    const choose = page.getByRole("button", { name: "Choose a file", exact: true });
    await choose.focus();
    const chooser = page.waitForEvent("filechooser");
    await page.keyboard.press("Enter");
    await (await chooser).setFiles({ name: "resume.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 mocked parse boundary") });
    await expect.poll(() => Boolean(pending)).toBe(true);
    await expect(page.getByRole("status").filter({ hasText: "Reading your resume file" })).toBeVisible();
    await expect(page.getByText("Ready to review", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("workspace-run-report")).toBeDisabled();
    await pending!.fulfill({ json: { ok: true, text: RESUME } });
    const remove = page.getByRole("button", { name: "Remove resume.pdf", exact: true });
    await expect(remove).toBeFocused();
    await expect(page.getByText("Ready to review", { exact: true })).toBeVisible();
    await expect(page.getByTestId("workspace-run-report")).toBeEnabled();
    await page.keyboard.press("Enter");
    await expect(choose).toBeFocused();
    await expect(page.getByText("Ready to review", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("workspace-run-report")).toBeDisabled();
  });

  test("a rejected parse never animates into a ready state and leaves an immediate recovery action", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/parse-resume", (route) => route.fulfill({ status: 422, json: { ok: false, message: "No readable text was found." } }));
    await hydrate(page, "/workspace");
    await page.getByLabel("Upload resume file (PDF or DOCX)", { exact: true }).setInputFiles({ name: "scan.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 mocked unreadable file") });
    await expect(page.getByRole("alert").filter({ hasText: "We couldn’t read this file" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Choose another file", exact: true })).toBeEnabled();
    await expect(page.getByText("Ready to review", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("workspace-run-report")).toBeDisabled();
  });

  test("sign-in loading keeps one stable busy button, then restores retry after a failed response", async ({ page }) => {
    let pending: Route | undefined;
    let requests = 0;
    await page.route("**/api/auth/send-code", (route) => { requests += 1; pending = route; });
    await hydrate(page, "/auth");
    await page.getByLabel("Email address", { exact: true }).fill("candidate@example.test");
    const send = page.getByRole("button", { name: "Send sign-in code", exact: true });
    const original = await boxSize(send);
    await expect.poll(() => send.evaluate((button) => button.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length), {
      message: "The reserved loading icon must not keep animating inside an idle button",
    }).toBe(0);
    await send.click();
    await expect.poll(() => Boolean(pending)).toBe(true);
    const busy = page.locator('button[aria-busy="true"]');
    await expect(busy).toHaveCount(1);
    await expect(busy).toBeDisabled();
    await expectStableSize(busy, original);
    await expect.poll(() => busy.evaluate((button) => button.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running" && animation.effect?.getTiming().iterations === Infinity).length), {
      message: "Only the visible pending spinner runs; hidden sizing copies stay inert",
    }).toBe(1);
    await expect(page.getByLabel("Login code", { exact: true })).toHaveCount(0);
    await page.locator("form").evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
    expect(requests).toBe(1);
    await pending!.fulfill({ status: 503, json: { ok: false, message: "Email is temporarily unavailable." } });
    await expect(page.getByRole("alert").filter({ hasText: "Email is temporarily unavailable." })).toBeVisible();
    await expect(send).toBeEnabled();
    await expect(send).not.toHaveAttribute("aria-busy", "true");
    await expectStableSize(send, original);
  });

  for (const reducedMotion of [false, true]) {
    test(`mobile navigation settles after interrupted toggles and restores focus${reducedMotion ? " with reduced motion" : ""}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: reducedMotion ? "reduce" : "no-preference" });
      await hydrate(page, "/");
      const trigger = page.getByRole("button", { name: "Open navigation", exact: true });
      const dialog = page.getByRole("dialog");
      for (let attempt = 0; attempt < 3; attempt += 1) {
        await trigger.focus();
        await page.keyboard.press("Enter");
        await expect(dialog).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
      }
      await page.keyboard.press("Enter");
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Tab");
      await expect.poll(() => page.locator(":focus").evaluate((element) => Boolean(element.closest('[role="dialog"]')))).toBe(true);
      if (reducedMotion) {
        await expect(dialog).toHaveCSS("animation-name", "none");
        await expect.poll(() => dialog.evaluate((element) => element.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length)).toBe(0);
      }
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
    });
  }

  test("changing the motion preference during a menu exit never strands the page behind a closed layer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await hydrate(page, "/");
    const trigger = page.getByRole("button", { name: "Open navigation", exact: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("animation-name", "none");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("the resume selection follows the last interrupted keyboard jump without moving report text", async ({ page }) => {
    await hydrate(page, "/sample-report");
    const navigation = page.getByRole("navigation", { name: "Resume report sections", exact: true });
    for (const name of ["Role fit", "Overview", "Keep these", "Fix these first"]) {
      await navigation.getByRole("button", { name, exact: true }).focus();
      await page.keyboard.press("Enter");
    }
    await expectCurrent(navigation, "Fix these first");
    await expect(navigation.getByRole("button", { name: "Fix these first", exact: true })).toBeFocused();
    await expect.poll(() => page.locator("#section-fixes").evaluate((section) => {
      const navBottom = document.querySelector('nav[aria-label="Resume report sections"]')!.closest("aside")!.getBoundingClientRect().bottom;
      return section.getBoundingClientRect().top - navBottom;
    })).toBeGreaterThanOrEqual(-1);
    await expect(page.locator("#section-fix-1 h3")).toHaveCSS("transform", "none");
  });

  test("LinkedIn section navigation tracks actual selection and keeps its mobile keyboard target visible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await hydrate(page, "/workspace");
    const linkedIn = page.getByRole("button", { name: "LinkedIn", exact: true });
    // The dedicated motion audit enables this launch flag. A production-safe
    // smoke build can keep LinkedIn review behind its existing launch flag.
    test.skip(await linkedIn.count() === 0, "LinkedIn review is disabled in this app build");
    await linkedIn.click();
    await page.getByRole("button", { name: "See example report", exact: true }).click();
    const navigation = page.getByRole("navigation", { name: "LinkedIn report sections", exact: true });
    await expectCurrent(navigation, "First impression");
    for (const name of ["Headline", "About section", "First impression"]) {
      const button = navigation.getByRole("button", { name, exact: true });
      await button.focus();
      await page.keyboard.press("Enter");
      await expectCurrent(navigation, name);
      await expect(button).toBeFocused();
      await expect.poll(() => button.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const nav = element.closest("nav")!.getBoundingClientRect();
        return rect.left >= nav.left - 1 && rect.right <= nav.right + 1;
      })).toBe(true);
    }
  });

  test("command navigation tolerates malformed recent items and blocked optional storage", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("riyp:recent-commands", JSON.stringify([null, { id: 42 }, { label: "Incomplete item" }]));
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key: string, value: string) {
        if (key === "riyp:recent-commands") throw new DOMException("Storage blocked", "SecurityError");
        return original.call(this, key, value);
      };
    });
    await hydrate(page, "/workspace");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Commands", exact: true });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("combobox").fill("Go to Home");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await expect(dialog).toBeHidden();
    await expect(page.locator('[data-visual-anchor="landing-home"]')).toBeVisible();
  });
});
