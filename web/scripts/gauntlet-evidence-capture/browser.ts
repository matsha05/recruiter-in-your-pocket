import { chromium, type Browser, type Locator, type Page } from "@playwright/test";
import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { GauntletCase, JourneyRun, RequiredJourney, Variant } from "../../lib/gauntlet/types";
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
  createStagingDirectory,
  hermeticEnvironment,
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

async function installHermeticPage(input: {
  page: Page;
  origin: string;
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
  testCase: GauntletCase;
  report: Record<string, unknown>;
  resumeText: string;
}): Promise<CapturePresentation> {
  const context = await input.browser.newContext({ viewport: REPORT_VIEWPORT, reducedMotion: "reduce" });
  const page = await context.newPage();
  const consoleRecords: ConsoleRecord[] = [];
  const state: RouteState = { generationRequests: 0, checkoutRequests: 0, freeStatusRequests: 0, blockedRequests: [] };
  try {
    await installHermeticPage({
      page,
      origin: input.origin,
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
    const capture = await captureInspectableElement({ page, element: reportRoot, baseViewport: REPORT_VIEWPORT });
    assertHealthyCapture(state, consoleRecords, input.testCase.id, 0);
    return {
      visibleText,
      screenshot: capture.screenshot,
      route: "/workspace",
      viewport: capture.viewport,
      capturedAt: new Date().toISOString(),
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
  journey: RequiredJourney;
  report: Record<string, unknown>;
  resumeText: string;
}): Promise<JourneyCapture> {
  const viewport = VIEWPORTS[input.journey.viewport];
  const context = await input.browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  const consoleRecords: ConsoleRecord[] = [];
  const state: RouteState = { generationRequests: 0, checkoutRequests: 0, freeStatusRequests: 0, blockedRequests: [] };
  const interactions: Array<{ action: string; path: string }> = [];
  try {
    await installHermeticPage({ page, origin: input.origin, expectedResume: input.resumeText, report: input.report, consoleRecords, state, journeyMode: true });
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

async function writeVariantOutputs(input: {
  plan: CapturePlan;
  browser: Browser;
  origin: string;
  variant: Variant;
  artifactRoot: string;
}) {
  const sourceByCase = new Map(input.plan.source.results.map((result) => [result.caseId, result]));
  const binding = input.plan[input.variant];
  for (const testCase of input.plan.manifest.cases) {
    const selected = sourceByCase.get(testCase.id);
    const fixture = input.plan.fixtureBytes.get(testCase.id);
    if (!selected || !fixture) throw new Error(`capture inputs are missing for ${testCase.id}`);
    const resumeText = fixture.toString("utf8");
    const presentation = await captureReport({ browser: input.browser, origin: input.origin, testCase, report: selected.report, resumeText });
    const screenshotPath = `presentations/${input.variant}/${testCase.id}.jpg`;
    await mkdir(path.join(input.artifactRoot, `presentations/${input.variant}`), { recursive: true });
    await writeFile(path.join(input.artifactRoot, screenshotPath), presentation.screenshot);
    const reportSha256 = canonicalJsonSha256(selected.report);
    const artifact = buildOutputArtifact({
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
        reportSha256,
      },
      fixtureSha256: sha256(fixture),
      report: selected.report,
      presentation,
      screenshotPath,
    });
    await mkdir(path.join(input.artifactRoot, `outputs/${input.variant}`), { recursive: true });
    await writeFile(path.join(input.artifactRoot, `outputs/${input.variant}/${testCase.id}.json`), serialize(artifact));
  }
}

async function writeJourneys(input: {
  plan: CapturePlan;
  browser: Browser;
  origin: string;
  artifactRoot: string;
}) {
  const firstCase = input.plan.manifest.cases[0];
  const selected = input.plan.source.results.find((result) => result.caseId === firstCase.id)!;
  const resumeText = input.plan.fixtureBytes.get(firstCase.id)!.toString("utf8");
  await mkdir(path.join(input.artifactRoot, "journeys/evidence"), { recursive: true });
  for (const journey of input.plan.manifest.requiredJourneys) {
    const capture = await captureJourney({ browser: input.browser, origin: input.origin, journey, report: selected.report, resumeText });
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

async function waitForServer(origin: string, childOutput: Buffer[], childExited: () => boolean) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (childExited()) throw new Error(`isolated server exited before readiness\n${Buffer.concat(childOutput).toString("utf8").slice(-8_000)}`);
    try {
      const response = await fetch(origin, { redirect: "manual" });
      if (response.status > 0) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("isolated server did not become ready in 90 seconds");
}

export async function captureGauntletEvidence(plan: CapturePlan, outputPath: string) {
  const target = await assertCaptureOutputTarget(plan.repositoryRoot, plan.iterationId, outputPath);
  const temporaryRoot = await mkdir(path.join(os.tmpdir(), "riyp-gauntlet-capture"), { recursive: true })
    .then(() => import("node:fs/promises").then(({ mkdtemp }) => mkdtemp(path.join(os.tmpdir(), "riyp-gauntlet-capture-"))));
  const staging = await createStagingDirectory(target);
  const nodeModulesPath = path.join(plan.repositoryRoot, "web/node_modules");
  const networkGuardPath = path.join(__dirname, "network-guard.cjs");
  let published = false;
  try {
    const productionPort = await allocateLoopbackPort();
    const candidatePort = await allocateLoopbackPort();
    const variants = [
      { variant: "production" as const, commit: plan.productionCommit, port: productionPort },
      { variant: "candidate" as const, commit: plan.candidateCommit, port: candidatePort },
    ];
    for (const item of variants) {
      const tree = await archiveCommit({
        repositoryRoot: plan.repositoryRoot,
        commit: item.commit,
        nodeModulesPath,
        parentDirectory: temporaryRoot,
        label: item.variant,
      });
      const webRoot = path.join(tree, "web");
      const env = hermeticEnvironment({ port: item.port, networkGuardPath, temporaryDirectory: temporaryRoot });
      await runProcess({ command: "npm", args: ["run", "build"], cwd: webRoot, env, label: `${item.variant} build`, timeoutMs: 240_000 });
      const nextBin = path.join(webRoot, "node_modules/next/dist/bin/next");
      const server = startProcess({ command: process.execPath, args: [nextBin, "start", "-H", "127.0.0.1", "-p", String(item.port)], cwd: webRoot, env });
      const origin = `http://127.0.0.1:${item.port}`;
      try {
        await waitForServer(origin, server.output, () => server.child.exitCode !== null);
        const browser = await chromium.launch({ headless: true });
        try {
          await writeVariantOutputs({ plan, browser, origin, variant: item.variant, artifactRoot: staging });
          if (item.variant === "candidate") await writeJourneys({ plan, browser, origin, artifactRoot: staging });
        } finally {
          await browser.close();
        }
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
