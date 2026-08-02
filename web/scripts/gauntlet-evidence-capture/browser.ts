import { chromium, type Browser, type Locator, type Page } from "@playwright/test";
import type { ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  GAUNTLET_FINALIZER_PATH,
  type ArchiveServerIdentityReceipt,
  type CandidateBinding,
  type CaptureRuntimeReceipt,
  type GauntletCase,
  type JourneyRun,
  type OutputGenerationReceipt,
  type ReportFinalizationReceipt,
  type RenderedReportReceipt,
  type RequiredJourney,
  type Variant,
} from "../../lib/gauntlet/types";
import type {
  GauntletFinalizerInput,
  GauntletFinalizerOutput,
} from "../gauntlet-report-finalizer";
import {
  buildJourneyReceipt,
  buildOutputArtifact,
  canonicalJsonSha256,
  serialize,
  sha256,
  type CapturePresentation,
  type JourneyCapture,
} from "./contracts";
import {
  allocateLoopbackPort,
  archiveCommit,
  assertCaptureOutputTarget,
  assertDependencyClosure,
  createStagingDirectory,
  hermeticEnvironment,
  materializeCandidateNetworkGuard,
  runProcess,
  startProcess,
  stopProcess,
  type CapturePlan,
} from "./repository";

type ConsoleRecord = { type: string; text: string };
type RouteState = {
  generationRequests: number;
  checkoutRequests: number;
  freeStatusRequests: number;
  blockedRequests: string[];
};

export type ArchiveServerIdentity = ArchiveServerIdentityReceipt;

export type ArchiveIdentityChallenge = {
  identity: ArchiveServerIdentity;
  publicPath: string;
  bytes: Buffer;
};

export type CapturePresentationWithReceipt = CapturePresentation & {
  captureReceipt: CaptureRuntimeReceipt;
};

export type MaterializedVariantReport = {
  caseId: string;
  fixtureId: string;
  rawReport: Record<string, unknown>;
  effectiveReport: Record<string, unknown>;
  finalization: ReportFinalizationReceipt;
};

export type CaptureLayoutReceipt = {
  scrollWidth: number;
  clientWidth: number;
  viewportWidth: number;
  viewportHeight: number;
};

const REPORT_VIEWPORT = { width: 1440, height: 1200 };
const MAX_INSPECTABLE_CAPTURE_HEIGHT = 10_000;
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;
const FULL_GIT_SHA = /^[a-f0-9]{40}$/;
const CAPTURE_NONCE = /^[a-f0-9]{48}$/;

function captureBridgeKey(nonce: string) {
  if (!CAPTURE_NONCE.test(nonce)) throw new Error("archive capture nonce is invalid");
  return `__riyp_gauntlet_capture_${nonce}`;
}

export function buildArchiveIdentityChallenge(input: {
  variant: Variant;
  commit: string;
  nonce?: string;
}): ArchiveIdentityChallenge {
  if (!FULL_GIT_SHA.test(input.commit)) throw new Error("archive identity commit is invalid");
  const nonce = input.nonce ?? randomBytes(24).toString("hex");
  if (!CAPTURE_NONCE.test(nonce)) throw new Error("archive capture nonce is invalid");
  const identity: ArchiveServerIdentity = {
    schemaVersion: "1",
    nonce,
    variant: input.variant,
    commit: input.commit,
  };
  return {
    identity,
    publicPath: `/__gauntlet-${nonce}/archive-identity.json`,
    bytes: Buffer.from(serialize(identity)),
  };
}

export function assertArchiveIdentityBytes(
  actual: Buffer,
  challenge: ArchiveIdentityChallenge,
  label: string,
) {
  if (!actual.equals(challenge.bytes)) {
    throw new Error(`${label}: server archive identity did not match byte-for-byte`);
  }
}

export function assertRenderedReportReceipt(input: {
  receipt: RenderedReportReceipt;
  identity: ArchiveServerIdentity;
  caseId: string;
  effectiveReport: Record<string, unknown>;
}) {
  const expected = {
    ...input.identity,
    caseId: input.caseId,
    component: "ReportStream" as const,
    reportSha256: canonicalJsonSha256(input.effectiveReport),
  };
  if (canonicalJsonSha256(input.receipt) !== canonicalJsonSha256(expected)) {
    throw new Error(`${input.identity.variant}/${input.caseId}: rendered ReportStream report receipt mismatch`);
  }
}

export async function installCaptureBridge(input: {
  page: Page;
  identity: ArchiveServerIdentity;
  caseId: string;
}) {
  captureBridgeKey(input.identity.nonce);
  await input.page.addInitScript(({ identity, caseId }) => {
    const key = `__riyp_gauntlet_capture_${identity.nonce}`;
    Object.defineProperty(window, key, {
      value: { identity, caseId },
      configurable: false,
      enumerable: false,
      writable: false,
    });
  }, { identity: input.identity, caseId: input.caseId });
}

export function assertNoHorizontalOverflow(layout: CaptureLayoutReceipt, label: string) {
  if (![layout.scrollWidth, layout.clientWidth, layout.viewportWidth, layout.viewportHeight]
    .every((value) => Number.isInteger(value) && value > 0)) {
    throw new Error(`${label}: layout receipt is invalid`);
  }
  if (layout.scrollWidth > layout.clientWidth + 1) throw new Error(`${label}: horizontal overflow detected`);
}

export function buildInteractionEvidence(input: {
  interactions: Array<{ action: string; path: string }>;
  layout: CaptureLayoutReceipt;
  generationRequests: number;
  checkoutRequests: number;
}) {
  assertNoHorizontalOverflow(input.layout, "journey");
  return serialize(input);
}

export function freeStatusUsesForRequest(journeyMode: boolean, requestNumber: number) {
  if (!Number.isInteger(requestNumber) || requestNumber < 1) throw new Error("free-status request number is invalid");
  return journeyMode && requestNumber === 1 ? 1 : 0;
}

export function inspectableViewportForElement(
  baseViewport: { width: number; height: number },
  elementHeight: number,
) {
  if (!Number.isInteger(baseViewport.width) || baseViewport.width < 1
    || !Number.isInteger(baseViewport.height) || baseViewport.height < 1
    || !Number.isFinite(elementHeight) || elementHeight < 1) {
    throw new Error("inspectable capture dimensions are invalid");
  }
  const requiredHeight = Math.ceil(elementHeight) + 16;
  if (requiredHeight > MAX_INSPECTABLE_CAPTURE_HEIGHT) {
    throw new Error(`inspectable capture exceeds ${MAX_INSPECTABLE_CAPTURE_HEIGHT}px`);
  }
  return {
    width: baseViewport.width,
    height: Math.max(baseViewport.height, requiredHeight),
  };
}

async function captureInspectableElement(input: {
  page: Page;
  element: Locator;
  baseViewport: { width: number; height: number };
}) {
  const elementHeight = await input.element.evaluate((element) => element.getBoundingClientRect().height);
  const captureViewport = inspectableViewportForElement(input.baseViewport, elementHeight);
  if (captureViewport.height !== input.baseViewport.height) {
    await input.page.setViewportSize(captureViewport);
  }
  await input.element.scrollIntoViewIfNeeded();
  await input.page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
  const screenshot = await input.element.screenshot({ type: "jpeg", quality: 90, animations: "disabled" });
  return { screenshot, viewport: captureViewport };
}

function isAllowedUrl(url: URL, origin: string) {
  return ["data:", "blob:", "about:"].includes(url.protocol) || url.origin === origin;
}

export function hermeticContextOptions(viewport: { width: number; height: number }) {
  return { viewport, reducedMotion: "reduce" as const, serviceWorkers: "block" as const };
}

export async function installHermeticWebSocketBlock(
  page: Pick<Page, "routeWebSocket">,
  state: { blockedRequests: string[] },
) {
  await page.routeWebSocket("**/*", async (webSocket) => {
    const url = new URL(webSocket.url());
    state.blockedRequests.push(`WEBSOCKET ${url.protocol}//${url.host}${url.pathname}`);
    await webSocket.close({ code: 1008, reason: "Gauntlet hermetic capture blocks WebSockets" });
  });
}

async function installHermeticPage(input: {
  page: Page;
  origin: string;
  archiveIdentity: ArchiveServerIdentity;
  caseId: string;
  expectedResume: string;
  report: Record<string, unknown>;
  consoleRecords: ConsoleRecord[];
  state: RouteState;
  journeyMode: boolean;
  restoredWorkspace?: { report: Record<string, unknown>; resumeText: string };
}) {
  input.page.on("console", (message) => {
    input.consoleRecords.push({ type: message.type(), text: message.text().slice(0, 1_000) });
  });
  input.page.on("pageerror", (error) => {
    input.consoleRecords.push({ type: "pageerror", text: error.message.slice(0, 1_000) });
  });
  await installCaptureBridge({
    page: input.page,
    identity: input.archiveIdentity,
    caseId: input.caseId,
  });
  await input.page.addInitScript((restoredWorkspace) => {
    localStorage.clear();
    sessionStorage.clear();
    if (restoredWorkspace) {
      sessionStorage.setItem("riyp_checkout_workspace", JSON.stringify({
        report: restoredWorkspace.report,
        resumeText: restoredWorkspace.resumeText,
        jobDescription: "",
        timestamp: Date.now(),
      }));
    }
  }, input.restoredWorkspace);
  await input.page.emulateMedia({ reducedMotion: "reduce" });
  await installHermeticWebSocketBlock(input.page, input.state);
  await input.page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (!isAllowedUrl(url, input.origin)) {
      input.state.blockedRequests.push(`${request.method()} ${url.protocol}//${url.host}`);
      await route.abort("blockedbyclient");
      return;
    }
    if (url.pathname.startsWith("/__gauntlet-supabase/")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      return;
    }
    if (url.pathname === "/api/free-status") {
      input.state.freeStatusRequests += 1;
      const uses = freeStatusUsesForRequest(input.journeyMode, input.state.freeStatusRequests);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, free_uses_left: uses, free_uses_remaining: uses, source: "gauntlet-capture" }),
      });
      return;
    }
    if (url.pathname === "/api/resume-feedback-stream") {
      input.state.generationRequests += 1;
      const payload = request.postDataJSON() as Record<string, unknown>;
      if (payload.text !== input.expectedResume || payload.mode !== "resume") {
        await route.fulfill({ status: 400, contentType: "application/json", body: "{}" });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/x-ndjson",
        body: `${JSON.stringify({ type: "complete", data: input.report })}\n`,
      });
      return;
    }
    if (url.pathname === "/api/checkout") {
      input.state.checkoutRequests += 1;
      await route.abort("blockedbyclient");
      return;
    }
    if (url.pathname === "/api/resume-feedback" || url.pathname.includes("openai")) {
      input.state.blockedRequests.push(`${request.method()} ${url.pathname}`);
      await route.abort("blockedbyclient");
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      input.state.blockedRequests.push(`${request.method()} ${url.pathname}`);
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });
}

export async function observeRenderedReportReceipt(input: {
  page: Page;
  archiveIdentity: ArchiveServerIdentity;
  caseId: string;
  effectiveReport: Record<string, unknown>;
}) {
  const receipt = await input.page.evaluate(async ({ identity, caseId }) => {
    type ReactFiber = {
      memoizedProps?: unknown;
      return?: ReactFiber | null;
    };
    type CaptureBridge = {
      identity: typeof identity;
      caseId: string;
      receipt?: {
        schemaVersion: "1";
        nonce: string;
        variant: "candidate" | "production";
        commit: string;
        caseId: string;
        component: "ReportStream";
        reportSha256: string;
      };
    };
    const key = `__riyp_gauntlet_capture_${identity.nonce}`;
    const bridge = (window as unknown as Record<string, unknown>)[key] as CaptureBridge | undefined;
    if (!bridge
      || bridge.caseId !== caseId
      || bridge.identity.schemaVersion !== identity.schemaVersion
      || bridge.identity.nonce !== identity.nonce
      || bridge.identity.variant !== identity.variant
      || bridge.identity.commit !== identity.commit) {
      throw new Error("capture bridge identity mismatch");
    }

    // This section is emitted directly by ReportStream. Walking from its host
    // fiber to the first owner with a `report` prop observes the actual prop
    // React rendered, rather than trusting the capture callback's input.
    const reportSection = document.querySelector("#section-first-impression");
    if (!reportSection) throw new Error("ReportStream anchor is missing");
    const fiberKey = Object.getOwnPropertyNames(reportSection)
      .find((candidate) => candidate.startsWith("__reactFiber$"));
    if (!fiberKey) throw new Error("ReportStream React fiber is unavailable");
    let fiber = (reportSection as unknown as Record<string, unknown>)[fiberKey] as ReactFiber | undefined;
    let renderedReport: Record<string, unknown> | null = null;
    while (fiber) {
      const props = fiber.memoizedProps;
      if (props
        && typeof props === "object"
        && !Array.isArray(props)
        && Object.prototype.hasOwnProperty.call(props, "report")) {
        const candidate = (props as { report?: unknown }).report;
        if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
          renderedReport = candidate as Record<string, unknown>;
          break;
        }
      }
      fiber = fiber.return ?? undefined;
    }
    if (!renderedReport) throw new Error("ReportStream report prop is unavailable");

    const sortJson = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(sortJson);
      if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([nestedKey, nested]) => [nestedKey, sortJson(nested)]));
      }
      return value;
    };
    const canonicalBytes = new TextEncoder().encode(JSON.stringify(sortJson(renderedReport)));
    const digest = await crypto.subtle.digest("SHA-256", canonicalBytes);
    const reportSha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const nextReceipt = Object.freeze({
      ...identity,
      caseId,
      component: "ReportStream" as const,
      reportSha256,
    });
    Object.defineProperty(bridge, "receipt", {
      value: nextReceipt,
      configurable: false,
      enumerable: true,
      writable: false,
    });
    return nextReceipt;
  }, { identity: input.archiveIdentity, caseId: input.caseId });
  assertRenderedReportReceipt({
    receipt,
    identity: input.archiveIdentity,
    caseId: input.caseId,
    effectiveReport: input.effectiveReport,
  });
  return receipt;
}

function assertHealthyCapture(state: RouteState, consoleRecords: ConsoleRecord[], label: string, expectedGenerationRequests: number) {
  if (state.generationRequests !== expectedGenerationRequests) {
    throw new Error(`${label}: expected ${expectedGenerationRequests} intercepted report request(s)`);
  }
  if (state.checkoutRequests !== 0) throw new Error(`${label}: checkout was requested`);
  if (state.blockedRequests.length > 0) {
    throw new Error(`${label}: nonlocal or unexpected model requests were blocked (${state.blockedRequests.join(", ")})`);
  }
  const errors = consoleRecords.filter((entry) => entry.type === "error" || entry.type === "pageerror");
  if (errors.length > 0) throw new Error(`${label}: browser console contained ${errors.length} error(s)`);
}

async function captureReport(input: {
  browser: Browser;
  origin: string;
  archiveIdentity: ArchiveServerIdentity;
  testCase: GauntletCase;
  report: Record<string, unknown>;
  resumeText: string;
}): Promise<CapturePresentationWithReceipt> {
  const context = await input.browser.newContext(hermeticContextOptions(REPORT_VIEWPORT));
  const page = await context.newPage();
  const consoleRecords: ConsoleRecord[] = [];
  const state: RouteState = { generationRequests: 0, checkoutRequests: 0, freeStatusRequests: 0, blockedRequests: [] };
  try {
    await installHermeticPage({
      page,
      origin: input.origin,
      archiveIdentity: input.archiveIdentity,
      caseId: input.testCase.id,
      expectedResume: input.resumeText,
      report: input.report,
      consoleRecords,
      state,
      journeyMode: false,
      restoredWorkspace: { report: input.report, resumeText: input.resumeText },
    });
    await page.goto(`${input.origin}/workspace`, { waitUntil: "domcontentloaded" });
    await page.locator("#section-first-impression h1").waitFor({ state: "visible", timeout: 35_000 });
    await page.locator("[data-sonner-toast]").evaluateAll((elements) => elements.forEach((element) => element.remove()));
    await page.evaluate(() => document.fonts.ready);
    const reportRoot = page.locator(".report-layout-shell");
    const visibleText = (await reportRoot.innerText()).trim();
    if (visibleText.length < 200) throw new Error(`${input.testCase.id}: rendered report text is incomplete`);
    const reportReceipt = await observeRenderedReportReceipt({
      page,
      archiveIdentity: input.archiveIdentity,
      caseId: input.testCase.id,
      effectiveReport: input.report,
    });
    const capture = await captureInspectableElement({ page, element: reportRoot, baseViewport: REPORT_VIEWPORT });
    assertHealthyCapture(state, consoleRecords, input.testCase.id, 0);
    return {
      visibleText,
      screenshot: capture.screenshot,
      route: "/workspace",
      viewport: capture.viewport,
      capturedAt: new Date().toISOString(),
      captureReceipt: {
        archiveIdentity: input.archiveIdentity,
        renderedReport: reportReceipt,
      },
    };
  } finally {
    await context.close();
  }
}

function journeySteps(journey: RequiredJourney): JourneyRun["steps"] {
  if (journey.id.startsWith("free-review-")) {
    return [
      { label: "Open the cold-entry page", status: "pass", evidence: "The landing page rendered the primary free-report action." },
      { label: "Reach the anonymous workspace", status: "pass", evidence: "The primary action opened the paste-resume workspace." },
      { label: "Render the approved historical report", status: "pass", evidence: "The report showed the recruiter read and ranked fixes without a model call." },
    ];
  }
  return [
    { label: "Complete the free report", status: "pass", evidence: "The historical report rendered as a complete free report." },
    { label: "Inspect the five-more decision", status: "pass", evidence: "The decision named five additional reports, $29, 30 days, and no automatic renewal." },
    { label: "Open the purchase explanation", status: "pass", evidence: "The modal preserved the complete-free-report boundary and did not start checkout." },
  ];
}

async function captureJourney(input: {
  browser: Browser;
  origin: string;
  archiveIdentity: ArchiveServerIdentity;
  caseId: string;
  journey: RequiredJourney;
  report: Record<string, unknown>;
  resumeText: string;
}): Promise<JourneyCapture> {
  const viewport = VIEWPORTS[input.journey.viewport];
  const context = await input.browser.newContext(hermeticContextOptions(viewport));
  const page = await context.newPage();
  const consoleRecords: ConsoleRecord[] = [];
  const state: RouteState = { generationRequests: 0, checkoutRequests: 0, freeStatusRequests: 0, blockedRequests: [] };
  const interactions: Array<{ action: string; path: string }> = [];
  try {
    await installHermeticPage({
      page,
      origin: input.origin,
      archiveIdentity: input.archiveIdentity,
      caseId: input.caseId,
      expectedResume: input.resumeText,
      report: input.report,
      consoleRecords,
      state,
      journeyMode: true,
    });
    await page.goto(`${input.origin}/`, { waitUntil: "domcontentloaded" });
    interactions.push({ action: "open cold entry", path: "/" });
    const primary = page.getByTestId("landing-primary-cta");
    await primary.waitFor({ state: "visible", timeout: 30_000 });
    await primary.click();
    interactions.push({ action: "open anonymous workspace", path: "/workspace" });
    await page.getByTestId("workspace-paste-mode").click();
    await page.getByTestId("workspace-resume-text").fill(input.resumeText);
    await page.getByTestId("workspace-run-report").click();
    await page.locator("#section-first-impression h1").waitFor({ state: "visible", timeout: 35_000 });
    await page.evaluate(() => document.fonts.ready);
    await observeRenderedReportReceipt({
      page,
      archiveIdentity: input.archiveIdentity,
      caseId: input.caseId,
      effectiveReport: input.report,
    });
    interactions.push({ action: "render intercepted historical report", path: "/workspace" });

    let evidenceRoot = page.locator(".report-layout-shell");
    if (input.journey.id.startsWith("five-more-value-")) {
      const decision = page.getByTestId("post-report-purchase-decision");
      await decision.waitFor({ state: "visible", timeout: 15_000 });
      const decisionText = await decision.innerText();
      for (const required of ["complete", "5 more reports", "$29", "30 days", "no automatic renewal"]) {
        if (!decisionText.toLowerCase().includes(required.toLowerCase())) {
          throw new Error(`${input.journey.id}: purchase decision is missing ${required}`);
        }
      }
      await decision.getByRole("button").click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor({ state: "visible", timeout: 15_000 });
      const dialogText = await dialog.innerText();
      for (const required of ["complete", "5 additional reports", "$29", "30 days", "no automatic renewal"]) {
        if (!dialogText.toLowerCase().includes(required.toLowerCase())) {
          throw new Error(`${input.journey.id}: purchase explanation is missing ${required}`);
        }
      }
      if (input.journey.viewport === "mobile") {
        await dialog.evaluate((element) => { element.scrollTop = element.scrollHeight; });
        const atBottom = await dialog.evaluate((element) => Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) <= 1);
        if (!atBottom) throw new Error(`${input.journey.id}: mobile purchase explanation cannot reach its legal controls`);
      }
      interactions.push({ action: "open five-more purchase explanation without submitting", path: "/workspace" });
      evidenceRoot = dialog;
    }

    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }));
    assertNoHorizontalOverflow(layout, input.journey.id);
    const capture = await captureInspectableElement({ page, element: evidenceRoot, baseViewport: viewport });
    const dom = (await evidenceRoot.innerText()).trim();
    assertHealthyCapture(state, consoleRecords, input.journey.id, 1);
    return {
      journey: input.journey,
      testedAt: new Date().toISOString(),
      entryPath: "/",
      finalPath: new URL(page.url()).pathname,
      steps: journeySteps(input.journey),
      screenshot: capture.screenshot,
      dom,
      consoleLog: serialize({ errors: [], messages: consoleRecords }),
      interactionLog: buildInteractionEvidence({
        interactions,
        layout,
        generationRequests: state.generationRequests,
        checkoutRequests: state.checkoutRequests,
      }),
      notes: "Hermetic localhost capture. The report stream was fulfilled from the committed synthetic source; all non-loopback traffic and checkout were blocked.",
    };
  } finally {
    await context.close();
  }
}

function rawVariantReports(plan: CapturePlan) {
  return new Map(plan.source.results.map((selected) => {
    const rawReportSha256 = canonicalJsonSha256(selected.report);
    const materialized: MaterializedVariantReport = {
      caseId: selected.caseId,
      fixtureId: selected.fixtureId,
      rawReport: selected.report,
      effectiveReport: selected.report,
      finalization: {
        status: "unfinalized_raw",
        forceGrounding: false,
        rawReportSha256,
        effectiveReportSha256: rawReportSha256,
        validator: null,
      },
    };
    return [selected.caseId, materialized] as const;
  }));
}

export function validatedCandidateReports(input: {
  plan: CapturePlan;
  output: GauntletFinalizerOutput;
}) {
  if (input.output.schemaVersion !== "1"
    || input.output.strategy !== "validateResumeModelPayload(forceGrounding=true)"
    || !Array.isArray(input.output.cases)
    || input.output.cases.length !== input.plan.manifest.cases.length) {
    throw new Error("archived candidate finalizer returned an invalid envelope");
  }
  const outputByCase = new Map(input.output.cases.map((entry) => [entry.caseId, entry]));
  if (outputByCase.size !== input.output.cases.length) {
    throw new Error("archived candidate finalizer returned duplicate cases");
  }
  const rawByCase = new Map(input.plan.source.results.map((entry) => [entry.caseId, entry]));
  const materialized = new Map<string, MaterializedVariantReport>();
  for (const testCase of input.plan.manifest.cases) {
    const raw = rawByCase.get(testCase.id);
    const finalized = outputByCase.get(testCase.id);
    if (!raw
      || !finalized
      || finalized.fixtureId !== testCase.fixtureId
      || !finalized.report
      || typeof finalized.report !== "object"
      || Array.isArray(finalized.report)) {
      throw new Error(`archived candidate finalizer omitted or malformed ${testCase.id}`);
    }
    const rawReportSha256 = canonicalJsonSha256(raw.report);
    const effectiveReportSha256 = canonicalJsonSha256(finalized.report);
    if (finalized.rawReportSha256 !== rawReportSha256
      || finalized.effectiveReportSha256 !== effectiveReportSha256) {
      throw new Error(`archived candidate finalizer receipt mismatch for ${testCase.id}`);
    }
    materialized.set(testCase.id, {
      caseId: testCase.id,
      fixtureId: testCase.fixtureId,
      rawReport: raw.report,
      effectiveReport: finalized.report,
      finalization: {
        status: "finalized",
        forceGrounding: true,
        rawReportSha256,
        effectiveReportSha256,
        validator: input.plan.candidateValidator,
      },
    });
  }
  if (outputByCase.size !== materialized.size) {
    throw new Error("archived candidate finalizer returned an unknown case");
  }
  return materialized;
}

async function materializeVariantReports(input: {
  plan: CapturePlan;
  variant: Variant;
  webRoot: string;
  environment: NodeJS.ProcessEnv;
  temporaryRoot: string;
}) {
  if (input.variant === "production") return rawVariantReports(input.plan);
  const finalizerInput: GauntletFinalizerInput = {
    schemaVersion: "1",
    cases: input.plan.manifest.cases.map((testCase) => {
      const selected = input.plan.source.results.find((entry) => entry.caseId === testCase.id);
      const fixture = input.plan.fixtureBytes.get(testCase.id);
      if (!selected || !fixture) throw new Error(`candidate finalizer input is missing ${testCase.id}`);
      return {
        caseId: testCase.id,
        fixtureId: testCase.fixtureId,
        resumeText: fixture.toString("utf8"),
        report: selected.report,
      };
    }),
  };
  const inputPath = path.join(input.temporaryRoot, "candidate-finalizer-input.json");
  const outputPath = path.join(input.temporaryRoot, "candidate-finalizer-output.json");
  await writeFile(inputPath, serialize(finalizerInput), { flag: "wx" });
  const archivedFinalizerPath = GAUNTLET_FINALIZER_PATH.replace(/^web\//, "");
  await runProcess({
    command: process.execPath,
    args: [
      "scripts/run-ts-script.cjs",
      archivedFinalizerPath,
      `--input=${inputPath}`,
      `--output=${outputPath}`,
    ],
    cwd: input.webRoot,
    env: input.environment,
    label: "archived candidate report finalizer",
    timeoutMs: 120_000,
  });
  const output = JSON.parse(await readFile(outputPath, "utf8")) as GauntletFinalizerOutput;
  return validatedCandidateReports({ plan: input.plan, output });
}

export async function captureAndBuildOutputArtifact(input: {
  iterationId: string;
  caseId: string;
  variant: Variant;
  binding: CandidateBinding;
  generation: OutputGenerationReceipt;
  fixtureSha256: string;
  materialized: MaterializedVariantReport;
  archiveIdentity: ArchiveServerIdentity;
  screenshotPath: string;
  capture: (report: Record<string, unknown>) => Promise<CapturePresentationWithReceipt>;
}) {
  const browserReport = input.materialized.effectiveReport;
  const presentation = await input.capture(browserReport);
  if (canonicalJsonSha256(presentation.captureReceipt.archiveIdentity)
    !== canonicalJsonSha256(input.archiveIdentity)) {
    throw new Error(`${input.variant}/${input.caseId}: capture archive identity receipt mismatch`);
  }
  assertRenderedReportReceipt({
    receipt: presentation.captureReceipt.renderedReport,
    identity: input.archiveIdentity,
    caseId: input.caseId,
    effectiveReport: browserReport,
  });
  const artifact = buildOutputArtifact({
    iterationId: input.iterationId,
    caseId: input.caseId,
    variant: input.variant,
    binding: input.binding,
    generation: input.generation,
    finalization: input.materialized.finalization,
    fixtureSha256: input.fixtureSha256,
    rawReport: input.materialized.rawReport,
    effectiveReport: browserReport,
    presentation,
    screenshotPath: input.screenshotPath,
  });
  return { artifact, presentation, browserReport };
}

async function writeVariantOutputs(input: {
  plan: CapturePlan;
  browser: Browser;
  origin: string;
  variant: Variant;
  archiveIdentity: ArchiveServerIdentity;
  artifactRoot: string;
  reports: Map<string, MaterializedVariantReport>;
}) {
  const binding = input.plan[input.variant];
  for (const testCase of input.plan.manifest.cases) {
    const selected = input.reports.get(testCase.id);
    const fixture = input.plan.fixtureBytes.get(testCase.id);
    if (!selected || !fixture) throw new Error(`capture inputs are missing for ${testCase.id}`);
    const resumeText = fixture.toString("utf8");
    const screenshotPath = `presentations/${input.variant}/${testCase.id}.jpg`;
    const rawReportSha256 = canonicalJsonSha256(selected.rawReport);
    const { artifact, presentation } = await captureAndBuildOutputArtifact({
      iterationId: input.plan.iterationId,
      caseId: testCase.id,
      variant: input.variant,
      binding,
      generation: {
        sourceCommit: input.plan.sourceCommit,
        sanitizedOutput: { path: input.plan.sourcePath, sha256: sha256(input.plan.sourceBytes) },
        runId: input.plan.source.sourceRun.runId,
        fixtureId: testCase.fixtureId,
        generatedAt: input.plan.source.sourceRun.generatedAt,
        model: input.plan.source.sourceRun.model,
        canonicalPromptSha256: input.plan.source.sourceRun.canonicalPromptSha256,
        reportSha256: rawReportSha256,
      },
      fixtureSha256: sha256(fixture),
      materialized: selected,
      archiveIdentity: input.archiveIdentity,
      screenshotPath,
      capture: (effectiveReport) => captureReport({
        browser: input.browser,
        origin: input.origin,
        archiveIdentity: input.archiveIdentity,
        testCase,
        report: effectiveReport,
        resumeText,
      }),
    });
    await mkdir(path.join(input.artifactRoot, `presentations/${input.variant}`), { recursive: true });
    await writeFile(path.join(input.artifactRoot, screenshotPath), presentation.screenshot);
    await mkdir(path.join(input.artifactRoot, `outputs/${input.variant}`), { recursive: true });
    await writeFile(path.join(input.artifactRoot, `outputs/${input.variant}/${testCase.id}.json`), serialize(artifact));
  }
}

async function writeJourneys(input: {
  plan: CapturePlan;
  browser: Browser;
  origin: string;
  archiveIdentity: ArchiveServerIdentity;
  artifactRoot: string;
  reports: Map<string, MaterializedVariantReport>;
}) {
  const firstCase = input.plan.manifest.cases[0];
  const selected = input.reports.get(firstCase.id);
  if (!selected) throw new Error(`candidate journey report is missing for ${firstCase.id}`);
  const resumeText = input.plan.fixtureBytes.get(firstCase.id)!.toString("utf8");
  await mkdir(path.join(input.artifactRoot, "journeys/evidence"), { recursive: true });
  for (const journey of input.plan.manifest.requiredJourneys) {
    const capture = await captureJourney({
      browser: input.browser,
      origin: input.origin,
      archiveIdentity: input.archiveIdentity,
      caseId: firstCase.id,
      journey,
      report: selected.effectiveReport,
      resumeText,
    });
    const files = [
      { kind: "screenshot" as const, suffix: "screenshot.jpg", data: capture.screenshot },
      { kind: "dom" as const, suffix: "dom.txt", data: capture.dom },
      { kind: "console" as const, suffix: "console.log", data: capture.consoleLog },
      { kind: "interaction" as const, suffix: "interaction.json", data: capture.interactionLog },
    ];
    const evidence: JourneyRun["evidence"] = [];
    for (const file of files) {
      const relative = `journeys/evidence/${journey.id}-${file.suffix}`;
      await writeFile(path.join(input.artifactRoot, relative), file.data);
      evidence.push({ kind: file.kind, path: relative, sha256: sha256(file.data) });
    }
    const receipt = buildJourneyReceipt({ iterationId: input.plan.iterationId, candidateCommit: input.plan.candidateCommit, capture, evidence });
    await writeFile(path.join(input.artifactRoot, `journeys/${journey.id}.json`), serialize(receipt));
  }
}

export async function writeArchiveIdentityChallenge(
  webRoot: string,
  challenge: ArchiveIdentityChallenge,
) {
  const relative = challenge.publicPath.replace(/^\//, "");
  const destination = path.join(webRoot, "public", relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, challenge.bytes, { flag: "wx" });
  return destination;
}

export async function assertArchiveServerIdentity(input: {
  origin: string;
  challenge: ArchiveIdentityChallenge;
  childExited: () => boolean;
  label: string;
  fetchImpl?: typeof fetch;
}) {
  if (input.childExited()) throw new Error(`${input.label}: isolated server is not alive`);
  const response = await (input.fetchImpl ?? fetch)(`${input.origin}${input.challenge.publicPath}`, {
    cache: "no-store",
    redirect: "manual",
  });
  if (response.status !== 200) {
    throw new Error(`${input.label}: archive identity returned HTTP ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  assertArchiveIdentityBytes(bytes, input.challenge, input.label);
  if (input.childExited()) throw new Error(`${input.label}: isolated server exited during identity verification`);
}

/** `killed` only means a signal was sent; signalCode/exitCode prove termination. */
export function isProcessExited(child: Pick<ChildProcess, "exitCode" | "signalCode">) {
  return child.exitCode !== null || child.signalCode !== null;
}

export function nextBuildArguments(nextBin: string) {
  return [nextBin, "build", "--webpack"];
}

export async function waitForServer(input: {
  origin: string;
  challenge: ArchiveIdentityChallenge;
  childOutput: Buffer[];
  childExited: () => boolean;
  label: string;
  fetchImpl?: typeof fetch;
}) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (input.childExited()) {
      throw new Error(`${input.label}: isolated server exited before readiness\n${Buffer.concat(input.childOutput).toString("utf8").slice(-8_000)}`);
    }
    try {
      await assertArchiveServerIdentity({
        origin: input.origin,
        challenge: input.challenge,
        childExited: input.childExited,
        label: `${input.label} readiness`,
        fetchImpl: input.fetchImpl,
      });
      return;
    } catch (error) {
      if (error instanceof Error
        && (error.message.includes("did not match byte-for-byte")
          || error.message.includes("is not alive")
          || error.message.includes("exited during"))) {
        throw error;
      }
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`${input.label}: isolated server did not prove archive identity in 90 seconds`);
}

export async function captureGauntletEvidence(plan: CapturePlan, outputPath: string) {
  const target = await assertCaptureOutputTarget(plan.repositoryRoot, plan.iterationId, outputPath);
  const temporaryRoot = await mkdir(path.join(os.tmpdir(), "riyp-gauntlet-capture"), { recursive: true })
    .then(() => import("node:fs/promises").then(({ mkdtemp }) => mkdtemp(path.join(os.tmpdir(), "riyp-gauntlet-capture-"))));
  const staging = await createStagingDirectory(target);
  const nodeModulesPath = path.join(plan.repositoryRoot, "web/node_modules");
  const networkGuard = await materializeCandidateNetworkGuard({ plan, directory: temporaryRoot });
  let published = false;
  try {
    const productionPort = await allocateLoopbackPort();
    const candidatePort = await allocateLoopbackPort();
    const variants = [
      { variant: "production" as const, commit: plan.productionCommit, port: productionPort },
      { variant: "candidate" as const, commit: plan.candidateCommit, port: candidatePort },
    ];
    for (const item of variants) {
      const identityChallenge = buildArchiveIdentityChallenge({
        variant: item.variant,
        commit: item.commit,
      });
      const tree = await archiveCommit({
        repositoryRoot: plan.repositoryRoot,
        commit: item.commit,
        nodeModulesPath,
        parentDirectory: temporaryRoot,
        label: item.variant,
        dependencyClosure: plan.dependencyClosure,
      });
      const webRoot = path.join(tree, "web");
      await writeArchiveIdentityChallenge(webRoot, identityChallenge);
      const env = hermeticEnvironment({
        port: item.port,
        networkGuardPath: networkGuard.path,
        temporaryDirectory: temporaryRoot,
      });
      const reports = await materializeVariantReports({
        plan,
        variant: item.variant,
        webRoot,
        environment: env,
        temporaryRoot,
      });
      const nextBin = path.join(webRoot, "node_modules/next/dist/bin/next");
      await runProcess({
        command: process.execPath,
        args: nextBuildArguments(nextBin),
        cwd: webRoot,
        env,
        label: `${item.variant} build`,
        timeoutMs: 240_000,
      });
      const server = startProcess({ command: process.execPath, args: [nextBin, "start", "-H", "127.0.0.1", "-p", String(item.port)], cwd: webRoot, env });
      const origin = `http://127.0.0.1:${item.port}`;
      try {
        await waitForServer({
          origin,
          challenge: identityChallenge,
          childOutput: server.output,
          childExited: () => isProcessExited(server.child),
          label: item.variant,
        });
        const browser = await chromium.launch({ headless: true });
        try {
          await writeVariantOutputs({
            plan,
            browser,
            origin,
            variant: item.variant,
            archiveIdentity: identityChallenge.identity,
            artifactRoot: staging,
            reports,
          });
          if (item.variant === "candidate") {
            await writeJourneys({
              plan,
              browser,
              origin,
              archiveIdentity: identityChallenge.identity,
              artifactRoot: staging,
              reports,
            });
          }
        } finally {
          await browser.close();
        }
        await assertArchiveServerIdentity({
          origin,
          challenge: identityChallenge,
          childExited: () => isProcessExited(server.child),
          label: `${item.variant} final recheck`,
        });
        await assertDependencyClosure({
          repositoryRoot: plan.repositoryRoot,
          nodeModulesPath,
          expected: plan.dependencyClosure,
        });
      } finally {
        await stopProcess(server.child);
      }
    }
    await publishDirectoryNoReplace(staging, target);
    published = true;
    return target;
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
    if (!published) await rm(staging, { recursive: true, force: true });
  }
}

export async function publishDirectoryNoReplace(staging: string, target: string) {
  await mkdir(target);
  let complete = false;
  try {
    for (const entry of await readdir(staging)) {
      await rename(path.join(staging, entry), path.join(target, entry));
    }
    await rm(staging, { recursive: true });
    complete = true;
  } finally {
    if (!complete) await rm(target, { recursive: true, force: true });
  }
}
