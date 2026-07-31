import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { GauntletManifest } from "../lib/gauntlet/types";
import {
  assertNoHorizontalOverflow,
  buildInteractionEvidence,
  freeStatusUsesForRequest,
  publishDirectoryNoReplace,
} from "../scripts/gauntlet-evidence-capture/browser";
import {
  APPROVED_CASE_FIXTURES,
  APPROVED_JOURNEYS,
  assertApprovedCaptureManifest,
  sanitizeHistoricalRun,
  sanitizeHistoricalRunFiles,
  serialize,
  sha256,
  writeFileAtomicNew,
  type LockedRunReceipt,
} from "../scripts/gauntlet-evidence-capture/contracts";
import { parseCaptureCli } from "../scripts/gauntlet-evidence-capture";
import { loadApprovedFixtureBytes } from "../scripts/gauntlet-evidence-capture/repository";

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
    const manifest = fixtureManifest();
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

    const guardPath = path.resolve(process.cwd(), "scripts/gauntlet-evidence-capture/network-guard.cjs");
    const guarded = await execNode([
      "--require",
      guardPath,
      "-e",
      "fetch('https://example.invalid').catch((error)=>{console.error(error.message);process.exit(7)})",
    ], { ...process.env, RIYP_GAUNTLET_NETWORK_GUARD: "1" });
    assert.notEqual(guarded.code, 0);
    assert.match(guarded.output, /blocked non-loopback host: example\.invalid/);
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
