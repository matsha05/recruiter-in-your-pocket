import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, readlink, realpath, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  GAUNTLET_RUNTIME_CLOSURE_PATHS,
  GAUNTLET_VALIDATOR_PATH,
  type CandidateBinding,
  type GauntletManifest,
} from "../lib/gauntlet/types";
import {
  bindingPathsForCleanliness,
  currentCandidateCleanlinessIssue,
  hasCompleteBinding,
} from "../lib/gauntlet/progress";
import {
  assertNoHorizontalOverflow,
  assertArchiveIdentityBytes,
  assertArchiveServerIdentity,
  assertRenderedReportReceipt,
  buildArchiveIdentityChallenge,
  buildInteractionEvidence,
  captureAndBuildOutputArtifact,
  freeStatusUsesForRequest,
  hermeticContextOptions,
  inspectableViewportForElement,
  installHermeticWebSocketBlock,
  isProcessExited,
  nextBuildArguments,
  publishDirectoryNoReplace,
  waitForServer,
  writeArchiveIdentityChallenge,
} from "../scripts/gauntlet-evidence-capture/browser";
import {
  APPROVED_CASE_FIXTURES,
  APPROVED_JOURNEYS,
  assertApprovedCaptureManifest,
  canonicalJsonSha256,
  sanitizeHistoricalRun,
  sanitizeHistoricalRunFiles,
  serialize,
  sha256,
  writeFileAtomicNew,
  type LockedRunReceipt,
} from "../scripts/gauntlet-evidence-capture/contracts";
import { parseCaptureCli } from "../scripts/gauntlet-evidence-capture";
import {
  copyNodeModulesTree,
  loadApprovedFixtureBytes,
} from "../scripts/gauntlet-evidence-capture/repository";

function fixtureManifest(): GauntletManifest {
  const cases = Array.from({ length: 12 }, (_, index) => ({
    id: `synthetic-case-${String(index + 1).padStart(2, "0")}`,
    fixtureId: `synthetic_fixture_${String(index + 1).padStart(2, "0")}`,
    resumePath: `golden/synthetic-${String(index + 1).padStart(2, "0")}.txt`,
    provenance: "synthetic" as const,
    role: `Synthetic role ${index + 1}`,
    seniority: "Test",
    quality: "Test",
    tags: ["synthetic"],
  }));
  return {
    schemaVersion: "1",
    activeIterationId: "iteration-001",
    target: {
      caseCount: 12,
      minimumPreferenceRate: 0.7,
      minimumPreferredCases: 9,
      maxInventedFacts: 0,
      maxCriticalJourneyFailures: 0,
      dimensions: ["trust", "specificity", "actionability"],
    },
    competitorReferences: [],
    requiredJourneys: [
      { id: "free-review-desktop", label: "Synthetic desktop review", viewport: "desktop" },
      { id: "free-review-mobile", label: "Synthetic mobile review", viewport: "mobile" },
      { id: "five-more-value-desktop", label: "Synthetic desktop value", viewport: "desktop" },
      { id: "five-more-value-mobile", label: "Synthetic mobile value", viewport: "mobile" },
    ],
    cases,
  };
}

function fixtureRun(manifest: GauntletManifest) {
  return {
    metadata: {
      run_id: "eval_test_synthetic_only",
      timestamp: "2026-07-31T12:00:00.000Z",
      execution_mode: "live",
      model: "test-model",
      reasoning_effort: "low",
      prompt_version_hash: "test-prompt-v1",
      resume_prompt_sha256: "a".repeat(64),
      contract_version: "v2",
    },
    summary: { total: 13, passed: 13, warned: 0, failed: 0 },
    results: [
      ...manifest.cases.map((entry, index) => ({
        fixture_id: entry.fixtureId,
        status: "PASS",
        response_model: "test-model",
        raw_output: {
          contract_version: "v2",
          score: 70 + index,
          summary: `Synthetic report ${index + 1}`,
          strengths: ["Synthetic strength"],
          gaps: ["Synthetic gap"],
          top_fixes: [{ fix: "Synthetic fix", why: "Synthetic reason" }],
        },
      })),
      {
        fixture_id: "excluded_private_fixture",
        status: "PASS",
        response_model: "test-model",
        raw_output: { secretMarker: "MUST_NOT_ESCAPE_SANITIZER" },
      },
    ],
  };
}

function receiptFor(bytes: Buffer): LockedRunReceipt {
  return {
    fullRunSha256: sha256(bytes),
    runId: "eval_test_synthetic_only",
    generatedAt: "2026-07-31T12:00:00.000Z",
    executionMode: "live",
    model: "test-model",
    reasoningEffort: "low",
    promptVersion: "test-prompt-v1",
    canonicalPromptSha256: "a".repeat(64),
    contractVersion: "v2",
    totalResults: 13,
    selectedResults: 12,
  };
}

function execNode(args: string[], env: NodeJS.ProcessEnv) {
  return new Promise<{ code: number; output: string }>((resolve) => {
    execFile(process.execPath, args, { env, encoding: "utf8" }, (error, stdout, stderr) => {
      resolve({ code: error && typeof error.code === "number" ? error.code : 0, output: `${stdout}${stderr}` });
    });
  });
}

async function run() {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "riyp-capture-test-"));
  try {
    const overlaySource = path.join(temporary, "overlay-source");
    const overlayTarget = path.join(temporary, "overlay-target");
    await Promise.all([
      mkdir(path.join(overlaySource, ".bin"), { recursive: true }),
      mkdir(path.join(overlaySource, "fixture-package"), { recursive: true }),
    ]);
    await writeFile(path.join(overlaySource, "fixture-package/cli.js"), "#!/usr/bin/env node\n");
    await symlink("../fixture-package/cli.js", path.join(overlaySource, ".bin/fixture-cli"));
    await copyNodeModulesTree(overlaySource, overlayTarget);
    assert.equal(await readlink(path.join(overlayTarget, ".bin/fixture-cli")), "../fixture-package/cli.js");
    const overlayTargetReal = await realpath(overlayTarget);
    assert.equal(
      path.relative(overlayTargetReal, await realpath(path.join(overlayTarget, ".bin/fixture-cli"))).startsWith(".."),
      false,
    );

    const manifest = fixtureManifest();
    assert.deepEqual(hermeticContextOptions({ width: 390, height: 844 }), {
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
      serviceWorkers: "block",
    });
    type TestWebSocketHandler = (webSocket: {
      url(): string;
      close(options: { code?: number; reason?: string }): Promise<void>;
    }) => Promise<void>;
    const webSocketCapture: { handler?: TestWebSocketHandler } = {};
    const webSocketState = { blockedRequests: [] as string[] };
    await installHermeticWebSocketBlock({
      routeWebSocket: async (url, handler) => {
        assert.equal(url, "**/*");
        webSocketCapture.handler = handler as TestWebSocketHandler;
      },
    }, webSocketState);
    let closedWebSocket: { code?: number; reason?: string } | null = null;
    const webSocketHandler = webSocketCapture.handler;
    assert.ok(webSocketHandler);
    await webSocketHandler({
      url: () => "wss://example.invalid/private-channel",
      close: async (options: { code?: number; reason?: string }) => { closedWebSocket = options; },
    });
    assert.deepEqual(webSocketState.blockedRequests, ["WEBSOCKET wss://example.invalid/private-channel"]);
    assert.deepEqual(closedWebSocket, {
      code: 1008,
      reason: "Gauntlet hermetic capture blocks WebSockets",
    });
    const lockedManifest: GauntletManifest = {
      ...manifest,
      cases: APPROVED_CASE_FIXTURES.map((entry) => ({
        id: entry.caseId,
        fixtureId: entry.fixtureId,
        resumePath: entry.resumePath,
        provenance: "synthetic",
        role: "Synthetic locked role",
        seniority: "Test",
        quality: "Test",
        tags: ["synthetic"],
      })),
      requiredJourneys: APPROVED_JOURNEYS.map((entry) => ({ ...entry })),
    };
    assert.doesNotThrow(() => assertApprovedCaptureManifest(lockedManifest));
    const missingJourney = structuredClone(lockedManifest);
    missingJourney.requiredJourneys.pop();
    assert.throws(() => assertApprovedCaptureManifest(missingJourney), /locked four-journey set/);
    const substitutedJourney = structuredClone(lockedManifest);
    substitutedJourney.requiredJourneys[3] = { ...substitutedJourney.requiredJourneys[2] };
    assert.throws(() => assertApprovedCaptureManifest(substitutedJourney), /locked four-journey set/);
    const wrongViewport = structuredClone(lockedManifest);
    wrongViewport.requiredJourneys[1].viewport = "desktop";
    assert.throws(() => assertApprovedCaptureManifest(wrongViewport), /locked four-journey set/);
    const redirectedResume = structuredClone(lockedManifest);
    redirectedResume.cases[0].resumePath = "golden/private-resume.txt";
    assert.throws(() => assertApprovedCaptureManifest(redirectedResume), /locked approved case-to-fixture set/);
    await assert.rejects(
      loadApprovedFixtureBytes(
        lockedManifest,
        async (repositoryPath) => Buffer.from(`mutated source-commit fixture at ${repositoryPath}`),
      ),
      /fixture bytes do not match the locked synthetic source: staff-ml-elite/,
    );
    const rawRun = fixtureRun(manifest);
    const bytes = Buffer.from(serialize(rawRun));
    const receipt = receiptFor(bytes);
    const approvedCases = manifest.cases.map((entry) => ({
      caseId: entry.id,
      fixtureId: entry.fixtureId,
      resumePath: entry.resumePath,
      fixtureSha256: "a".repeat(64),
    }));
    const sanitized = sanitizeHistoricalRun(bytes, manifest, receipt, approvedCases);
    assert.equal(sanitized.results.length, 12);
    assert.equal(sanitized.selection.excludedResultCount, 1);
    assert.deepEqual(sanitized.results.map((entry) => entry.caseId), manifest.cases.map((entry) => entry.id));
    assert.equal(sanitized.results.every((entry) => entry.status === "PASS"), true);
    assert.equal(serialize(sanitized).includes("MUST_NOT_ESCAPE_SANITIZER"), false);

    assert.throws(
      () => sanitizeHistoricalRun(bytes, manifest, { ...receipt, fullRunSha256: "b".repeat(64) }, approvedCases),
      /full-run SHA-256/,
    );
    const warned = fixtureRun(manifest);
    warned.results[0].status = "WARN";
    const warnedBytes = Buffer.from(serialize(warned));
    assert.throws(
      () => sanitizeHistoricalRun(warnedBytes, manifest, receiptFor(warnedBytes), approvedCases),
      /is not PASS/,
    );
    const substitutedManifest = structuredClone(manifest);
    substitutedManifest.cases[0].fixtureId = "excluded_private_fixture";
    assert.throws(
      () => sanitizeHistoricalRun(bytes, substitutedManifest, receipt, approvedCases),
      /locked approved case-to-fixture set/,
    );

    const sourcePath = path.join(temporary, "synthetic-run.json");
    const manifestPath = path.join(temporary, "manifest.json");
    const outputPath = path.join(temporary, "sanitized.json");
    await Promise.all([
      writeFile(sourcePath, bytes),
      writeFile(manifestPath, serialize(manifest)),
    ]);
    const dryRun = await sanitizeHistoricalRunFiles({
      sourcePath,
      manifestPath,
      outputPath,
      write: false,
      receipt,
      approvedCases,
    });
    assert.equal(dryRun.sanitized.results.length, 12);
    await assert.rejects(readFile(outputPath), /ENOENT/);
    await sanitizeHistoricalRunFiles({ sourcePath, manifestPath, outputPath, write: true, receipt, approvedCases });
    assert.equal((await readFile(outputPath, "utf8")).includes("MUST_NOT_ESCAPE_SANITIZER"), false);

    const protectedPath = path.join(temporary, "protected.json");
    await writeFile(protectedPath, "original\n");
    await assert.rejects(writeFileAtomicNew(protectedPath, "replacement\n"), /EEXIST/);
    assert.equal(await readFile(protectedPath, "utf8"), "original\n");

    const racedPath = path.join(temporary, "raced.json");
    const raced = await Promise.allSettled([
      writeFileAtomicNew(racedPath, "first\n"),
      writeFileAtomicNew(racedPath, "second\n"),
    ]);
    assert.equal(raced.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(raced.filter((result) => result.status === "rejected").length, 1);
    assert.match(await readFile(racedPath, "utf8"), /^(first|second)\n$/);

    const staging = path.join(temporary, "staging");
    const target = path.join(temporary, "target");
    await Promise.all([mkdir(staging), mkdir(target)]);
    await Promise.all([
      writeFile(path.join(staging, "candidate.txt"), "candidate"),
      writeFile(path.join(target, "owner.txt"), "owner"),
    ]);
    await assert.rejects(publishDirectoryNoReplace(staging, target), /EEXIST/);
    assert.equal(await readFile(path.join(target, "owner.txt"), "utf8"), "owner");
    assert.equal(await readFile(path.join(staging, "candidate.txt"), "utf8"), "candidate");

    const raceStageA = path.join(temporary, "race-stage-a");
    const raceStageB = path.join(temporary, "race-stage-b");
    const raceTarget = path.join(temporary, "race-target");
    await Promise.all([mkdir(raceStageA), mkdir(raceStageB)]);
    await Promise.all([
      writeFile(path.join(raceStageA, "a.txt"), "a"),
      writeFile(path.join(raceStageB, "b.txt"), "b"),
    ]);
    const directoryRace = await Promise.allSettled([
      publishDirectoryNoReplace(raceStageA, raceTarget),
      publishDirectoryNoReplace(raceStageB, raceTarget),
    ]);
    assert.equal(directoryRace.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(directoryRace.filter((result) => result.status === "rejected").length, 1);
    const winningFiles = await import("node:fs/promises").then(({ readdir }) => readdir(raceTarget));
    assert.equal(winningFiles.length, 1);
    assert.match(winningFiles[0], /^[ab]\.txt$/);

    const archiveIdentity = buildArchiveIdentityChallenge({
      variant: "candidate",
      commit: "1".repeat(40),
      nonce: "a".repeat(48),
    });
    assert.deepEqual(JSON.parse(archiveIdentity.bytes.toString("utf8")), archiveIdentity.identity);
    assert.doesNotThrow(() => assertArchiveIdentityBytes(
      Buffer.from(archiveIdentity.bytes),
      archiveIdentity,
      "candidate",
    ));
    assert.throws(
      () => assertArchiveIdentityBytes(Buffer.from("{}\n"), archiveIdentity, "candidate"),
      /byte-for-byte/,
    );
    assert.throws(
      () => buildArchiveIdentityChallenge({ variant: "candidate", commit: "short", nonce: "a".repeat(48) }),
      /commit is invalid/,
    );
    assert.throws(
      () => buildArchiveIdentityChallenge({ variant: "candidate", commit: "1".repeat(40), nonce: "guessable" }),
      /nonce is invalid/,
    );
    const identityWebRoot = path.join(temporary, "identity-web");
    const identityFile = await writeArchiveIdentityChallenge(identityWebRoot, archiveIdentity);
    assert.equal(await readFile(identityFile, "utf8"), archiveIdentity.bytes.toString("utf8"));
    await assert.rejects(
      writeArchiveIdentityChallenge(identityWebRoot, archiveIdentity),
      /EEXIST/,
    );

    const archiveFetch: typeof fetch = async (request) => {
      assert.equal(String(request), `http://127.0.0.1:43210${archiveIdentity.publicPath}`);
      return new Response(archiveIdentity.bytes, { status: 200 });
    };
    await assertArchiveServerIdentity({
      origin: "http://127.0.0.1:43210",
      challenge: archiveIdentity,
      childExited: () => false,
      label: "candidate readiness",
      fetchImpl: archiveFetch,
    });
    await waitForServer({
      origin: "http://127.0.0.1:43210",
      challenge: archiveIdentity,
      childOutput: [],
      childExited: () => false,
      label: "candidate",
      fetchImpl: archiveFetch,
    });
    await assert.rejects(
      assertArchiveServerIdentity({
        origin: "http://127.0.0.1:43210",
        challenge: archiveIdentity,
        childExited: () => true,
        label: "candidate final recheck",
        fetchImpl: archiveFetch,
      }),
      /is not alive/,
    );
    const signaledChild = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
      stdio: "ignore",
    });
    assert.equal(isProcessExited(signaledChild), false);
    signaledChild.kill("SIGTERM");
    await new Promise<void>((resolve, reject) => {
      signaledChild.once("close", () => resolve());
      signaledChild.once("error", reject);
    });
    assert.equal(signaledChild.exitCode, null);
    assert.equal(signaledChild.signalCode, "SIGTERM");
    assert.equal(isProcessExited(signaledChild), true);
    assert.deepEqual(
      nextBuildArguments("/archive/web/node_modules/next/dist/bin/next"),
      ["/archive/web/node_modules/next/dist/bin/next", "build", "--webpack"],
    );
    await assert.rejects(
      assertArchiveServerIdentity({
        origin: "http://127.0.0.1:43210",
        challenge: { ...archiveIdentity, bytes: Buffer.from("{}\n") },
        childExited: () => false,
        label: "candidate wrong archive",
        fetchImpl: archiveFetch,
      }),
      /byte-for-byte/,
    );

    const layout = { scrollWidth: 390, clientWidth: 390, viewportWidth: 390, viewportHeight: 844 };
    assert.doesNotThrow(() => assertNoHorizontalOverflow(layout, "mobile fixture"));
    assert.doesNotThrow(() => assertNoHorizontalOverflow({ ...layout, scrollWidth: 391 }, "rounding tolerance"));
    assert.throws(
      () => assertNoHorizontalOverflow({ ...layout, scrollWidth: 392 }, "mobile fixture"),
      /horizontal overflow/,
    );
    const interactionEvidence = JSON.parse(buildInteractionEvidence({
      interactions: [{ action: "render report", path: "/workspace" }],
      layout,
      generationRequests: 1,
      checkoutRequests: 0,
    })) as { layout: typeof layout; checkoutRequests: number };
    assert.deepEqual(interactionEvidence.layout, layout);
    assert.equal(interactionEvidence.checkoutRequests, 0);
    assert.equal(freeStatusUsesForRequest(true, 1), 1);
    assert.equal(freeStatusUsesForRequest(true, 2), 0);
    assert.equal(freeStatusUsesForRequest(false, 1), 0);
    assert.throws(() => freeStatusUsesForRequest(true, 0), /invalid/);
    assert.deepEqual(
      inspectableViewportForElement({ width: 390, height: 844 }, 6_200.2),
      { width: 390, height: 6_217 },
    );
    assert.deepEqual(
      inspectableViewportForElement({ width: 1440, height: 1200 }, 800),
      { width: 1440, height: 1200 },
    );
    assert.throws(
      () => inspectableViewportForElement({ width: 1440, height: 1200 }, 10_000),
      /exceeds 10000px/,
    );

    assert.deepEqual(parseCaptureCli([
      "extract",
      "--source=/tmp/source.json",
      "--manifest=/tmp/manifest.json",
    ]), {
      command: "extract",
      write: false,
      values: { source: "/tmp/source.json", manifest: "/tmp/manifest.json" },
    });
    assert.throws(() => parseCaptureCli(["extract", "--source=a", "--manifest=b", "--write"]), /--output/);
    assert.throws(() => parseCaptureCli(["capture", "--unknown=x"]), /unknown capture argument/);
    assert.throws(() => parseCaptureCli(["extract", "--source=a", "--source=b", "--manifest=c"]), /duplicate/);

    const committedSource = JSON.parse(await readFile(
      path.resolve(process.cwd(), "gauntlet/sources/eval-1785271781375-synthetic-12.json"),
      "utf8",
    )) as {
      results: Array<{ caseId: string; fixtureId: string; report: Record<string, unknown> }>;
    };
    const finalizerCase = committedSource.results[0];
    const finalizerInputPath = path.join(temporary, "finalizer-input.json");
    const finalizerOutputPath = path.join(temporary, "finalizer-output.json");
    const finalizerInput = {
      schemaVersion: "1",
      cases: await Promise.all(committedSource.results.map(async (entry) => {
        const approved = APPROVED_CASE_FIXTURES.find((candidate) => candidate.caseId === entry.caseId);
        assert.ok(approved, `missing approved fixture for ${entry.caseId}`);
        return {
          caseId: entry.caseId,
          fixtureId: entry.fixtureId,
          resumeText: await readFile(
            path.resolve(process.cwd(), `../tests/resumes/${approved.resumePath}`),
            "utf8",
          ),
          report: entry.report,
        };
      })),
    };
    await writeFile(finalizerInputPath, serialize(finalizerInput));
    const finalizedProcess = await execNode([
      "scripts/run-ts-script.cjs",
      "scripts/gauntlet-report-finalizer.ts",
      `--input=${finalizerInputPath}`,
      `--output=${finalizerOutputPath}`,
    ], { ...process.env, USE_MOCK_OPENAI: "1" });
    assert.equal(finalizedProcess.code, 0, finalizedProcess.output);
    const finalized = JSON.parse(await readFile(finalizerOutputPath, "utf8")) as {
      strategy: string;
      cases: Array<{
        rawReportSha256: string;
        effectiveReportSha256: string;
        report: Record<string, unknown>;
      }>;
    };
    assert.equal(finalized.strategy, "validateResumeModelPayload(forceGrounding=true)");
    assert.equal(finalized.cases.length, APPROVED_CASE_FIXTURES.length);
    assert.equal(finalized.cases[0].rawReportSha256, canonicalJsonSha256(finalizerCase.report));
    assert.equal(finalized.cases[0].effectiveReportSha256, canonicalJsonSha256(finalized.cases[0].report));
    assert.equal(canonicalJsonSha256(finalizerCase.report), finalized.cases[0].rawReportSha256);
    for (const [index, output] of finalized.cases.entries()) {
      assert.equal(output.rawReportSha256, canonicalJsonSha256(committedSource.results[index].report));
      assert.equal(output.effectiveReportSha256, canonicalJsonSha256(output.report));
    }

    const commit = "1".repeat(40);
    const rawReport = { score: 70, summary: "raw historical report" };
    const effectiveReport = { score: 71, summary: "validated effective report" };
    const rawReportSha256 = canonicalJsonSha256(rawReport);
    const effectiveReportSha256 = canonicalJsonSha256(effectiveReport);
    const binding: CandidateBinding = {
      commit,
      model: "test-model",
      resumePrompt: { path: "web/prompts/resume_v2.txt", sha256: "a".repeat(64) },
      renderer: {
        path: "web/components/workspace/report/ReportStream.tsx",
        sha256: "b".repeat(64),
      },
    };
    const browserArchiveIdentity = buildArchiveIdentityChallenge({
      variant: "candidate",
      commit,
      nonce: "b".repeat(48),
    }).identity;
    const renderedReportReceipt = {
      ...browserArchiveIdentity,
      caseId: "synthetic-case-01",
      component: "ReportStream" as const,
      reportSha256: effectiveReportSha256,
    };
    assert.doesNotThrow(() => assertRenderedReportReceipt({
      receipt: renderedReportReceipt,
      identity: browserArchiveIdentity,
      caseId: "synthetic-case-01",
      effectiveReport,
    }));
    assert.throws(() => assertRenderedReportReceipt({
      receipt: { ...renderedReportReceipt, reportSha256: rawReportSha256 },
      identity: browserArchiveIdentity,
      caseId: "synthetic-case-01",
      effectiveReport,
    }), /rendered ReportStream report receipt mismatch/);
    let browserPayload: Record<string, unknown> | null = null;
    const captured = await captureAndBuildOutputArtifact({
      iterationId: "iteration-001",
      caseId: "synthetic-case-01",
      variant: "candidate",
      binding,
      generation: {
        sourceCommit: "2".repeat(40),
        sanitizedOutput: { path: "web/gauntlet/sources/source.json", sha256: "c".repeat(64) },
        runId: "run",
        fixtureId: "fixture_1",
        generatedAt: "2026-07-31T12:00:00.000Z",
        model: "test-model",
        canonicalPromptSha256: "d".repeat(64),
        reportSha256: rawReportSha256,
      },
      fixtureSha256: "e".repeat(64),
      materialized: {
        caseId: "synthetic-case-01",
        fixtureId: "fixture_1",
        rawReport,
        effectiveReport,
        finalization: {
          status: "finalized",
          forceGrounding: true,
          rawReportSha256,
          effectiveReportSha256,
          validator: {
            commit,
            path: GAUNTLET_VALIDATOR_PATH,
            sha256: "f".repeat(64),
            gitBlobOid: "3".repeat(40),
          },
        },
      },
      archiveIdentity: browserArchiveIdentity,
      screenshotPath: "presentations/candidate/synthetic-case-01.jpg",
      capture: async (report) => {
        browserPayload = report;
        return {
          visibleText: "x".repeat(240),
          screenshot: Buffer.from("screenshot"),
          route: "/workspace",
          viewport: { width: 1440, height: 1200 },
          capturedAt: "2026-07-31T13:00:00.000Z",
          captureReceipt: {
            archiveIdentity: browserArchiveIdentity,
            renderedReport: renderedReportReceipt,
          },
        };
      },
    });
    assert.strictEqual(browserPayload, effectiveReport);
    assert.strictEqual(captured.browserReport, effectiveReport);
    assert.strictEqual(captured.artifact.report, effectiveReport);
    assert.equal(captured.artifact.reportSha256, effectiveReportSha256);
    assert.equal(captured.artifact.generation.reportSha256, rawReportSha256);
    assert.deepEqual(captured.artifact.presentation.captureReceipt, {
      archiveIdentity: browserArchiveIdentity,
      renderedReport: renderedReportReceipt,
    });

    const runtimeFiles = GAUNTLET_RUNTIME_CLOSURE_PATHS.map((repositoryPath, index) => ({
      path: repositoryPath,
      sha256: String(index % 10).repeat(64),
    }));
    const runtimeBinding: CandidateBinding = {
      ...binding,
      runtimeClosure: {
        files: runtimeFiles,
        sha256: canonicalJsonSha256(runtimeFiles),
      },
    };
    assert.equal(hasCompleteBinding(runtimeBinding), true);
    assert.equal(hasCompleteBinding({
      ...runtimeBinding,
      runtimeClosure: { ...runtimeBinding.runtimeClosure!, sha256: "9".repeat(64) },
    }), false);
    assert.deepEqual(bindingPathsForCleanliness(runtimeBinding), Array.from(new Set([
      binding.resumePrompt!.path,
      binding.renderer!.path,
      ...GAUNTLET_RUNTIME_CLOSURE_PATHS,
    ])));
    assert.equal(
      currentCandidateCleanlinessIssue("candidate", commit, commit, ` M ${GAUNTLET_VALIDATOR_PATH}`),
      "candidate runtime, capture harness, or dependency inputs are dirty relative to the bound HEAD commit",
    );

    const guardPath = path.resolve(process.cwd(), "scripts/gauntlet-evidence-capture/network-guard.cjs");
    const guarded = await execNode([
      "--require",
      guardPath,
      "-e",
      "fetch('https://example.invalid').catch((error)=>{console.error(error.message);process.exit(7)})",
    ], { ...process.env, RIYP_GAUNTLET_NETWORK_GUARD: "1" });
    assert.notEqual(guarded.code, 0);
    assert.match(guarded.output, /blocked non-loopback host: example\.invalid/);

    const loopbackPositive = await execNode([
      "--require",
      guardPath,
      "-e",
      `
        const net = require("node:net");
        const http = require("node:http");
        function netProbe(host, label) {
          return new Promise((resolve, reject) => {
            let socket;
            try {
              socket = net.connect({ host, port: 1 });
            } catch (error) {
              reject(new Error(label + " synchronous failure: " + error.message));
              return;
            }
            const timer = setTimeout(() => { socket.destroy(); reject(new Error(label + " timed out")); }, 2000);
            socket.once("connect", () => { clearTimeout(timer); socket.destroy(); console.log(label + ":CONNECTED"); resolve(); });
            socket.once("error", (error) => { clearTimeout(timer); console.log(label + ":" + error.code); resolve(); });
          });
        }
        function httpProbe() {
          return new Promise((resolve, reject) => {
            let request;
            try {
              request = http.get("http://127.0.0.1:1");
            } catch (error) {
              reject(new Error("HTTP4 synchronous failure: " + error.message));
              return;
            }
            const timer = setTimeout(() => { request.destroy(); reject(new Error("HTTP4 timed out")); }, 2000);
            request.once("response", (response) => { clearTimeout(timer); response.resume(); console.log("HTTP4:CONNECTED"); resolve(); });
            request.once("error", (error) => { clearTimeout(timer); console.log("HTTP4:" + error.code); resolve(); });
          });
        }
        Promise.all([netProbe("127.0.0.1", "NET4"), httpProbe(), netProbe("::1", "NET6")])
          .catch((error) => { console.error(error.message); process.exit(25); });
      `,
    ], { ...process.env, RIYP_GAUNTLET_NETWORK_GUARD: "1" });
    assert.equal(loopbackPositive.code, 0, loopbackPositive.output);
    // This sandbox returns asynchronous EPERM; ordinary hosts return ECONNREFUSED.
    assert.match(loopbackPositive.output, /NET4:(?:ECONNREFUSED|EPERM|CONNECTED)/);
    assert.match(loopbackPositive.output, /HTTP4:(?:ECONNREFUSED|EPERM|CONNECTED)/);
    assert.match(loopbackPositive.output, /NET6:(?:ECONNREFUSED|EPERM|EAFNOSUPPORT|ENETUNREACH|CONNECTED)/);
    assert.doesNotMatch(loopbackPositive.output, /synchronous failure|blocked non-loopback/);

    const strippedChild = await execNode([
      "--require",
      guardPath,
      "-e",
      [
        "const {spawnSync}=require('node:child_process');",
        "const child=spawnSync(process.execPath,['-e',\"fetch('https://example.invalid')\"],{env:{RIYP_GAUNTLET_NETWORK_GUARD:'0',NODE_OPTIONS:''},encoding:'utf8'});",
        "process.stdout.write(String(child.stdout||'')+String(child.stderr||''));",
        "if(child.status===0)process.exit(19);",
      ].join(""),
    ], { ...process.env, RIYP_GAUNTLET_NETWORK_GUARD: "1" });
    assert.equal(strippedChild.code, 0, strippedChild.output);
    assert.match(strippedChild.output, /blocked non-loopback host: example\.invalid/);

    const nonNodeChild = await execNode([
      "--require",
      guardPath,
      "-e",
      "try{require('node:child_process').spawnSync('/bin/sh',['-c','true']);process.exit(20)}catch(error){console.error(error.message)}",
    ], { ...process.env, RIYP_GAUNTLET_NETWORK_GUARD: "1" });
    assert.equal(nonNodeChild.code, 0, nonNodeChild.output);
    assert.match(nonNodeChild.output, /blocked non-Node child command/);

    const prototypeBypass = await execNode([
      "--require",
      guardPath,
      "-e",
      [
        "const {ChildProcess}=require('node:child_process');",
        "try{new ChildProcess().spawn({file:'/usr/bin/true',args:['/usr/bin/true'],envPairs:[],stdio:'ignore'});process.exit(26)}",
        "catch(error){console.error(error.message)}",
      ].join(""),
    ], { ...process.env, RIYP_GAUNTLET_NETWORK_GUARD: "1" });
    assert.equal(prototypeBypass.code, 0, prototypeBypass.output);
    assert.match(prototypeBypass.output, /blocked non-Node child command: \/usr\/bin\/true/);

    const directNodeChild = await execNode([
      "--require",
      guardPath,
      "-e",
      [
        "const {ChildProcess}=require('node:child_process');",
        "const child=new ChildProcess();let output='';",
        "child.spawn({file:process.execPath,args:[process.execPath,'-e',",
        JSON.stringify([
          "console.log('FLAG='+process.env.RIYP_GAUNTLET_NETWORK_GUARD);",
          "console.log('OPTIONS='+process.env.NODE_OPTIONS);",
          "try{fetch('https://example.invalid');process.exit(27)}",
          "catch(error){console.error(error.message)}",
        ].join("")),
        "],cwd:process.cwd(),detached:false,envPairs:['RIYP_GAUNTLET_NETWORK_GUARD=0','NODE_OPTIONS='],stdio:'pipe'});",
        "child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>output+=chunk);",
        "child.on('error',error=>{console.error(error.message);process.exit(28)});",
        "child.on('close',code=>{process.stdout.write(output);if(code!==0)process.exit(29)});",
      ].join(""),
    ], { ...process.env, RIYP_GAUNTLET_NETWORK_GUARD: "1" });
    assert.equal(directNodeChild.code, 0, directNodeChild.output);
    assert.match(directNodeChild.output, /FLAG=1/);
    assert.match(directNodeChild.output, /OPTIONS=.*network-guard\.cjs/);
    assert.match(directNodeChild.output, /blocked non-loopback host: example\.invalid/);

    const lookupBypass = await execNode([
      "--require",
      guardPath,
      "-e",
      "try{require('node:http').request({hostname:'127.0.0.1',port:9,lookup(_h,_o,cb){cb(null,'203.0.113.1',4)}});process.exit(21)}catch(error){console.error(error.message)}",
    ], { ...process.env, RIYP_GAUNTLET_NETWORK_GUARD: "1" });
    assert.equal(lookupBypass.code, 0, lookupBypass.output);
    assert.match(lookupBypass.output, /blocked a custom DNS lookup/);

    const alternateOutbound = await execNode([
      "--require",
      guardPath,
      "-e",
      [
        "for(const probe of [",
        "()=>require('node:dns').lookup('example.invalid',()=>{}),",
        "()=>require('node:dgram').createSocket('udp4')",
        "]){try{probe();process.exit(22)}catch(error){console.error(error.message)}}",
      ].join(""),
    ], { ...process.env, RIYP_GAUNTLET_NETWORK_GUARD: "1" });
    assert.equal(alternateOutbound.code, 0, alternateOutbound.output);
    assert.match(alternateOutbound.output, /blocked DNS resolution/);
    assert.match(alternateOutbound.output, /blocked UDP\/dgram access/);

    const guardedWorker = await execNode([
      "--require",
      guardPath,
      "-e",
      [
        "const {Worker}=require('node:worker_threads');",
        "const worker=new Worker(\"fetch('https://example.invalid')\",{eval:true,env:{RIYP_GAUNTLET_NETWORK_GUARD:'0',NODE_OPTIONS:''},execArgv:[]});",
        "worker.once('error',error=>{console.error(error.message);process.exit(/blocked non-loopback/.test(error.message)?0:23)});",
        "worker.once('exit',code=>{if(code===0)process.exit(24)});",
      ].join(""),
    ], { ...process.env, RIYP_GAUNTLET_NETWORK_GUARD: "1" });
    assert.equal(guardedWorker.code, 0, guardedWorker.output);
    assert.match(guardedWorker.output, /blocked non-loopback host: example\.invalid/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

run().then(
  () => console.log("gauntlet evidence capture tests passed"),
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
