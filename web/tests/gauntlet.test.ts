import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  cp,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import manifestJson from "../gauntlet/manifest.json";
import { hashArtifactTree, isSafeComponent, readGitBlob, resolveContainedExistingPath, sha256, canonicalJsonSha256 } from "../lib/gauntlet/integrity";
import { prepareBlindPackets } from "../lib/gauntlet/packets";
import {
  buildGauntletAnchorRecord,
  caseSetSha256,
  currentCandidateCleanlinessIssue,
  getGauntletProgress,
  journeyDefinitionSha256,
  validateGauntletDefinition,
  writeGauntletAnchor,
} from "../lib/gauntlet/progress";
import type {
  BlindMapping,
  CandidateBinding,
  GauntletIteration,
  GauntletAnchor,
  GauntletManifest,
  GauntletOutputArtifact,
  JourneyRun,
  ReferenceAssessment,
  SourceAudit,
  Variant,
} from "../lib/gauntlet/types";

const repositoryRoot = path.resolve(process.cwd(), "..");
const promptPath = "web/prompts/resume_v2.txt";
const rendererPath = "web/components/workspace/report/ReportStream.tsx";
const manifest = manifestJson as GauntletManifest;

function serialize(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function execGit(args: string[], root = repositoryRoot) {
  return new Promise<string>((resolve, reject) => {
    execFile("git", ["-C", root, ...args], { encoding: "utf8" }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

function runStrictCli(webRoot: string, iterationId: string) {
  return new Promise<number>((resolve) => {
    execFile(
      process.execPath,
      [
        "scripts/run-ts-script.cjs",
        "scripts/run-gauntlet.ts",
        "strict",
        `--web-root=${webRoot}`,
        `--iteration=${iterationId}`,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
      (error) => resolve(error && typeof error.code === "number" ? error.code : 0),
    );
  });
}

function isGitIgnored(repositoryPath: string) {
  return new Promise<boolean>((resolve, reject) => {
    execFile(
      "git",
      ["-C", repositoryRoot, "check-ignore", "-q", "--no-index", "--", repositoryPath],
      { encoding: "utf8" },
      (error) => {
        if (!error) return resolve(true);
        if (typeof error.code === "number" && error.code === 1) return resolve(false);
        reject(error);
      },
    );
  });
}

async function bindingFor(commit: string, model: string, root = repositoryRoot): Promise<CandidateBinding> {
  const [prompt, renderer] = await Promise.all([
    readGitBlob(root, commit, promptPath),
    readGitBlob(root, commit, rendererPath),
  ]);
  return {
    commit,
    model,
    resumePrompt: { path: promptPath, sha256: sha256(prompt) },
    renderer: { path: rendererPath, sha256: sha256(renderer) },
  };
}

async function createTestRepository() {
  const root = await mkdtemp(path.join(os.tmpdir(), "riyp-gauntlet-repo-"));
  const webRoot = path.join(root, "web");
  const sourcePath = "web/gauntlet/sources/test-live-synthetic-12.json";
  await Promise.all([
    mkdir(path.join(root, "web/prompts"), { recursive: true }),
    mkdir(path.join(root, "web/components/workspace/report"), { recursive: true }),
    mkdir(path.join(root, "web/gauntlet/sources"), { recursive: true }),
    mkdir(path.join(root, "web/gauntlet/iterations"), { recursive: true }),
    mkdir(path.join(root, "web/gauntlet/artifacts"), { recursive: true }),
    mkdir(path.join(root, "tests/fixtures"), { recursive: true }),
  ]);
  await Promise.all([
    copyFile(path.join(repositoryRoot, promptPath), path.join(root, promptPath)),
    copyFile(path.join(repositoryRoot, rendererPath), path.join(root, rendererPath)),
    copyFile(
      path.join(repositoryRoot, "tests/fixtures/calibration.json"),
      path.join(root, "tests/fixtures/calibration.json"),
    ),
  ]);
  for (const testCase of manifest.cases) {
    const relative = `tests/resumes/${testCase.resumePath}`;
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await copyFile(path.join(repositoryRoot, relative), path.join(root, relative));
  }
  const calibration = JSON.parse(await readFile(path.join(root, "tests/fixtures/calibration.json"), "utf8"));
  const fixtureById = new Map<string, { expected_score: { min: number; max: number } }>(
    calibration.fixtures.map((fixture: { id: string; expected_score: { min: number; max: number } }) => [fixture.id, fixture]),
  );
  const prompt = await readFile(path.join(root, promptPath), "utf8");
  const source = {
    schemaVersion: "1",
    kind: "historical-live-eval-synthetic-subset",
    sourceRun: {
      fullRunSha256: sha256("test-only-private-run-never-imported"),
      runId: "eval_test_synthetic_12",
      generatedAt: "2026-07-30T20:51:41.424Z",
      executionMode: "live",
      model: "test-only-generation-model",
      reasoningEffort: "low",
      promptVersion: "test-only-human-voice-1",
      canonicalPromptSha256: sha256(prompt.trim()),
      contractVersion: "v2",
    },
    selection: {
      caseCount: manifest.target.caseCount,
      provenance: "synthetic-only",
      excludedResultCount: 11,
    },
    results: await Promise.all(manifest.cases.map(async (testCase) => {
      const resumeText = await readFile(path.join(root, `tests/resumes/${testCase.resumePath}`), "utf8");
      const expected = fixtureById.get(testCase.fixtureId)!.expected_score;
      return {
        caseId: testCase.id,
        fixtureId: testCase.fixtureId,
        status: "PASS",
        report: reportFor(resumeText, Math.round((expected.min + expected.max) / 2)),
      };
    })),
  };
  await writeFile(path.join(webRoot, "gauntlet/manifest.json"), serialize(manifest));
  await execGit(["init"], root);
  await execGit(["config", "user.name", "Gauntlet Test"], root);
  await execGit(["config", "user.email", "gauntlet-test@example.invalid"], root);
  await execGit(["config", "commit.gpgsign", "false"], root);
  await execGit(["add", "."], root);
  await execGit(["commit", "-m", "test: production evidence source"], root);
  const productionCommit = await execGit(["rev-parse", "HEAD"], root);
  await writeFile(path.join(root, sourcePath), serialize(source));
  await execGit(["add", sourcePath], root);
  await execGit(["commit", "-m", "test: sanitized historical evidence package"], root);
  const sourceCommit = await execGit(["rev-parse", "HEAD"], root);
  await writeFile(
    path.join(root, rendererPath),
    `${await readFile(path.join(root, rendererPath), "utf8")}\n// Test-only candidate renderer revision.\n`,
  );
  await execGit(["add", rendererPath], root);
  await execGit(["commit", "-m", "test: candidate renderer"], root);
  const candidateCommit = await execGit(["rev-parse", "HEAD"], root);
  return { root, webRoot, sourcePath, sourceCommit, productionCommit, candidateCommit };
}

function evidenceLine(resumeText: string) {
  const lines = resumeText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.find((line) => line.length >= 30
    && line.length <= 130
    && !/\d/.test(line)
    && /(?:led|built|maintained|supported|helped|managed|created|developed|coordinated|collaborated|partnered|drove|designed|assisted|owned|responsible)/i.test(line))
    ?? lines.find((line) => line.length >= 30 && line.length <= 130 && !/\d/.test(line))
    ?? lines[0];
}

function reportFor(resumeText: string, score: number) {
  const excerpt = evidenceLine(resumeText);
  return {
    contract_version: "v2",
    score,
    summary: "This resume reads as a credible fit for the target role. The experience shows useful ownership and results. One line is missing context, which limits confidence in the full scope.",
    strengths: ["The work history shows ownership that a recruiter can understand."],
    gaps: ["One responsibility needs verified scope and outcome context."],
    top_fixes: [{
      fix: "Add [number of people affected] and [verified measurable outcome] to this exact line.",
      why: "The current wording names the responsibility without showing its scale or result.",
      confidence: "high",
      impact_level: "high",
      effort: "quick",
      evidence: { excerpt, section: "Experience" },
    }],
    subscores: { impact: score, clarity: score, story: score, readability: score },
  };
}

async function writeManifest(webRoot: string, activeIterationId: string) {
  await writeFile(
    path.join(webRoot, "gauntlet/manifest.json"),
    serialize({ ...manifest, activeIterationId }),
  );
}

async function writeIteration(webRoot: string, iteration: GauntletIteration) {
  await writeFile(
    path.join(webRoot, `gauntlet/iterations/${iteration.id}.json`),
    serialize(iteration),
  );
}

async function writeOutputPair(
  root: string,
  webRoot: string,
  sourceCommit: string,
  sourcePath: string,
  iteration: GauntletIteration,
  iterationNumber: number,
) {
  const artifactRoot = path.join(webRoot, `gauntlet/artifacts/${iteration.id}`);
  for (const variant of ["candidate", "production"] as const) {
    await Promise.all([
      mkdir(path.join(artifactRoot, `outputs/${variant}`), { recursive: true }),
      mkdir(path.join(artifactRoot, `presentations/${variant}`), { recursive: true }),
    ]);
  }

  const sourceBlob = await readGitBlob(root, sourceCommit, sourcePath);
  const source = JSON.parse(sourceBlob.toString("utf8")) as {
    sourceRun: {
      runId: string;
      generatedAt: string;
      model: string;
      canonicalPromptSha256: string;
    };
    results: Array<{ caseId: string; fixtureId: string; report: unknown }>;
  };
  const reportByCase = new Map(source.results.map((result) => [result.caseId, result]));
  for (const testCase of manifest.cases) {
    for (const variant of ["candidate", "production"] as const) {
      const binding = iteration[variant];
      const fixturePath = `tests/resumes/${testCase.resumePath}`;
      const fixture = await readGitBlob(root, sourceCommit, fixturePath);
      const selected = reportByCase.get(testCase.id)!;
      const report = selected.report as ReturnType<typeof reportFor>;
      const visibleText = [
        `Test-only ${variant} presentation for immutable iteration ${iterationNumber}.`,
        report.summary,
        `Recruiter strength: ${report.strengths[0]}`,
        `Priority gap: ${report.gaps[0]}`,
        `First move: ${report.top_fixes[0].fix}`,
        "This presentation exists only inside the temporary gauntlet integration fixture and contains no customer data.",
      ].join("\n\n");
      const screenshotRelative = `presentations/${variant}/${testCase.id}.png`;
      const screenshot = Buffer.from(`test-only-png-${iteration.id}-${variant}-${testCase.id}`);
      await writeFile(path.join(artifactRoot, screenshotRelative), screenshot);
      const artifact: GauntletOutputArtifact = {
        schemaVersion: "2",
        iterationId: iteration.id,
        caseId: testCase.id,
        variant,
        binding,
        generation: {
          sourceCommit,
          sanitizedOutput: { path: sourcePath, sha256: sha256(sourceBlob) },
          runId: source.sourceRun.runId,
          fixtureId: selected.fixtureId,
          generatedAt: source.sourceRun.generatedAt,
          model: source.sourceRun.model,
          canonicalPromptSha256: source.sourceRun.canonicalPromptSha256,
          reportSha256: canonicalJsonSha256(report),
        },
        fixture: { sha256: sha256(fixture) },
        reportSha256: canonicalJsonSha256(report),
        report,
        presentation: {
          kind: "rendered_report",
          rendererCommit: binding.commit!,
          renderer: binding.renderer!,
          capturedAt: `2026-07-31T1${iterationNumber}:20:00.000Z`,
          route: `/reports/test-only-${iteration.id}-${testCase.id}`,
          viewport: { width: 1440, height: 1200 },
          visibleText,
          visibleTextSha256: sha256(visibleText),
          screenshot: { path: screenshotRelative, sha256: sha256(screenshot) },
        },
      };
      await writeFile(
        path.join(artifactRoot, `outputs/${variant}/${testCase.id}.json`),
        serialize(artifact),
      );
    }
  }
}

async function writeReviewsAndJourneys(webRoot: string, iteration: GauntletIteration, iterationNumber: number) {
  const artifactRoot = path.join(webRoot, `gauntlet/artifacts/${iteration.id}`);
  const mapping = JSON.parse(await readFile(path.join(artifactRoot, "operator/mapping.json"), "utf8")) as BlindMapping;
  await Promise.all([
    mkdir(path.join(artifactRoot, "judgments"), { recursive: true }),
    mkdir(path.join(artifactRoot, "source-audits"), { recursive: true }),
    mkdir(path.join(artifactRoot, "reference-assessments"), { recursive: true }),
    mkdir(path.join(artifactRoot, "journeys/evidence"), { recursive: true }),
  ]);

  for (const [index, testCase] of manifest.cases.entries()) {
    const entry = mapping.cases[testCase.id];
    const preferredVariant: Variant = index < 9 ? "candidate" : "production";
    const preferredLabel = entry.labels.A === preferredVariant ? "A" : "B";
    await writeFile(path.join(artifactRoot, `judgments/${testCase.id}.json`), serialize({
      schemaVersion: "2",
      iterationId: iteration.id,
      caseId: testCase.id,
      packetSha256: entry.packetSha256,
      artifacts: entry.artifacts,
      reviewer: "test-only blind reviewer",
      reviewedAt: `2026-07-31T1${iterationNumber}:30:00.000Z`,
      preferences: { trust: preferredLabel, specificity: preferredLabel, actionability: preferredLabel },
      rationale: {
        trust: "The preferred presentation makes its source limits clear.",
        specificity: "The preferred presentation identifies a concrete line-level gap.",
        actionability: "The preferred presentation supplies a bounded next move.",
      },
    }));
    const audit: SourceAudit = {
      schemaVersion: "2",
      iterationId: iteration.id,
      caseId: testCase.id,
      candidateArtifactSha256: entry.artifacts.candidate.artifactSha256,
      auditor: "test-only source auditor",
      auditedAt: `2026-07-31T1${iterationNumber}:35:00.000Z`,
      inventedFacts: [],
      notes: "Compared every generated claim with the synthetic fixture.",
    };
    await writeFile(path.join(artifactRoot, `source-audits/${testCase.id}.json`), serialize(audit));
    const assessment: ReferenceAssessment = {
      schemaVersion: "2",
      iterationId: iteration.id,
      caseId: testCase.id,
      candidateArtifactSha256: entry.artifacts.candidate.artifactSha256,
      assessor: "test-only reference assessor",
      assessedAt: `2026-07-31T1${iterationNumber}:40:00.000Z`,
      dimensions: {
        trust: { verdict: index < 9 ? "meets_or_beats" : "trails", evidence: "Compared the rendered candidate with the documented public trust bar.", referenceIds: [manifest.competitorReferences[0].id] },
        specificity: { verdict: index < 9 ? "meets_or_beats" : "trails", evidence: "Compared the rendered candidate with the documented public specificity bar.", referenceIds: [manifest.competitorReferences[0].id] },
        actionability: { verdict: index < 9 ? "meets_or_beats" : "trails", evidence: "Compared the rendered candidate with the documented public action loop.", referenceIds: [manifest.competitorReferences[1].id] },
      },
    };
    await writeFile(path.join(artifactRoot, `reference-assessments/${testCase.id}.json`), serialize(assessment));
  }

  for (const journey of manifest.requiredJourneys) {
    const evidence: JourneyRun["evidence"] = [];
    for (const [kind, extension] of [
      ["screenshot", "png"],
      ["dom", "txt"],
      ["console", "log"],
      ["interaction", "json"],
    ] as const) {
      const relative = `journeys/evidence/${journey.id}-${kind}.${extension}`;
      const content = Buffer.from(`test-only-${iteration.id}-${journey.id}-${kind}`);
      await writeFile(path.join(artifactRoot, relative), content);
      evidence.push({ kind, path: relative, sha256: sha256(content) });
    }
    const run: JourneyRun = {
      schemaVersion: "2",
      iterationId: iteration.id,
      journeyId: journey.id,
      candidateCommit: iteration.candidate.commit!,
      journeyDefinitionSha256: journeyDefinitionSha256(journey),
      testedAt: `2026-07-31T1${iterationNumber}:45:00.000Z`,
      completed: true,
      viewport: journey.viewport,
      entryPath: "/",
      finalPath: "/reports/test-only",
      steps: [{ label: "Complete the named cold-visitor flow", status: "pass", evidence: "Expected value and report state were visible." }],
      evidence,
      criticalFailures: [],
      notes: "Test-only journey receipt with screenshot, DOM, console, and interaction evidence.",
    };
    await writeFile(path.join(artifactRoot, `journeys/${journey.id}.json`), serialize(run));
  }
}

async function createCompleteIteration(input: {
  root: string;
  webRoot: string;
  sourceCommit: string;
  sourcePath: string;
  id: string;
  label: string;
  number: number;
  production: CandidateBinding;
  candidate: CandidateBinding;
  previous: GauntletIteration["previous"];
}) {
  const createdAt = `2026-07-31T1${input.number}:00:00.000Z`;
  let iteration: GauntletIteration = {
    schemaVersion: "2",
    id: input.id,
    label: input.label,
    createdAt,
    status: "collecting",
    production: input.production,
    candidate: input.candidate,
    builder: {
      change: `Test-only builder change ${input.number}`,
      claim: `Test-only candidate claim ${input.number}`,
    },
    critic: {
      verdict: "pending",
      rationale: "The test-only evidence has not been sealed yet.",
      remainingGap: "Finish the temporary evidence set.",
    },
    previous: input.previous,
    seal: null,
    baselineStatement: "This is an explicitly test-only integration ledger; it is never installed as production gauntlet evidence.",
  };
  await writeManifest(input.webRoot, input.id);
  await writeIteration(input.webRoot, iteration);
  await writeOutputPair(
    input.root,
    input.webRoot,
    input.sourceCommit,
    input.sourcePath,
    iteration,
    input.number,
  );
  await prepareBlindPackets(input.webRoot, input.id);
  await writeReviewsAndJourneys(input.webRoot, iteration, input.number);
  const artifactSetSha256 = await hashArtifactTree(path.join(input.webRoot, `gauntlet/artifacts/${input.id}`));
  iteration = {
    ...iteration,
    status: "complete",
    critic: {
      verdict: "pass",
      rationale: `The test-only evidence set ${input.number} is complete, current, and internally consistent.`,
      remainingGap: "No remaining gap inside this synthetic integration fixture.",
    },
    seal: {
      sealedAt: `2026-07-31T1${input.number}:50:00.000Z`,
      caseSetSha256: caseSetSha256(manifest),
      artifactSetSha256,
    },
  };
  await writeIteration(input.webRoot, iteration);
  return iteration;
}

async function commitEvidenceAndAnchors(
  root: string,
  webRoot: string,
  iterationIds: string[],
) {
  await execGit([
    "add",
    "web/gauntlet/manifest.json",
    "web/gauntlet/iterations",
    "web/gauntlet/artifacts",
  ], root);
  await execGit(["commit", "-m", "test: seal gauntlet evidence"], root);
  const evidenceCommit = await execGit(["rev-parse", "HEAD"], root);
  for (const iterationId of iterationIds) {
    await writeGauntletAnchor(webRoot, iterationId);
  }
  await execGit(["add", "web/gauntlet/anchors"], root);
  await execGit(["commit", "-m", "test: anchor sealed gauntlet evidence"], root);
  const anchorCommit = await execGit(["rev-parse", "HEAD"], root);
  return { evidenceCommit, anchorCommit };
}

async function run() {
  const productionBaseline = await getGauntletProgress(process.cwd());
  assert.equal(productionBaseline.iteration.id, "iteration-000-baseline");
  assert.equal(productionBaseline.overallStatus, "pending");
  assert.equal(productionBaseline.pairedOutputCases, 0);
  assert.equal(productionBaseline.blindReviewedCases, 0);
  assert.equal(productionBaseline.iterations.length, 1);
  assert.equal(productionBaseline.iteration.critic.verdict, "pending");

  assert.equal(isSafeComponent("iteration-001"), true);
  for (const unsafe of ["../../outside", "a/b", "..\\outside", "__proto__", "constructor"]) {
    assert.equal(isSafeComponent(unsafe), false);
  }
  assert.equal(
    currentCandidateCleanlinessIssue("candidate", "a".repeat(40), "a".repeat(40), " M web/prompts/resume_v2.txt"),
    "candidate canonical prompt or renderer is dirty relative to the bound HEAD commit",
  );
  for (const deployableEvidencePath of [
    "web/gauntlet/artifacts/iteration-001/outputs/candidate/staff-ml-elite.json",
    "web/gauntlet/artifacts/iteration-001/presentations/candidate/staff-ml-elite.jpg",
    "web/gauntlet/artifacts/iteration-001/operator/mapping.json",
    "web/gauntlet/artifacts/iteration-001/journeys/evidence/cold-entry-mobile-console.log",
  ]) {
    assert.equal(await isGitIgnored(deployableEvidencePath), false, `${deployableEvidencePath} must be deployable`);
  }
  assert.equal(
    await isGitIgnored("web/gauntlet/artifacts/iteration-001/private-live-run.json"),
    true,
  );
  const nextConfigSource = await readFile(path.join(process.cwd(), "next.config.mjs"), "utf8");
  assert.match(nextConfigSource, /["']\/launch\/gauntlet["']:\s*\[["']\.\/gauntlet\/\*\*\/\*["']\]/);

  const hostedRoot = await mkdtemp(path.join(os.tmpdir(), "riyp-gauntlet-hosted-"));
  try {
    const hostedWebRoot = path.join(hostedRoot, "web");
    await mkdir(hostedWebRoot);
    await cp(path.join(process.cwd(), "gauntlet"), path.join(hostedWebRoot, "gauntlet"), {
      recursive: true,
    });
    const hostedSnapshot = await getGauntletProgress(hostedWebRoot);
    assert.equal(hostedSnapshot.overallStatus, "pending");
    assert.deepEqual(hostedSnapshot.dataIssues, []);
    assert.match(
      hostedSnapshot.gates.find((gate) => gate.id === "candidate-binding")?.detail ?? "",
      /Git metadata is unavailable/,
    );
    assert.match(
      hostedSnapshot.gates.find((gate) => gate.id === "git-anchor")?.detail ?? "",
      /unverified/,
    );
    assert.notEqual(await runStrictCli(hostedWebRoot, "iteration-000-baseline"), 0);
  } finally {
    await rm(hostedRoot, { recursive: true, force: true });
  }

  const testRepository = await createTestRepository();
  const { productionCommit, sourceCommit, candidateCommit } = testRepository;
  assert.notEqual(sourceCommit, productionCommit);
  const [productionBinding, candidateBinding] = await Promise.all([
    bindingFor(productionCommit, "test-only-generation-model", testRepository.root),
    bindingFor(candidateCommit, "test-only-generation-model", testRepository.root),
  ]);

  const testRoot = testRepository.webRoot;
  try {
    await Promise.all([
      mkdir(path.join(testRoot, "gauntlet/iterations"), { recursive: true }),
      mkdir(path.join(testRoot, "gauntlet/artifacts"), { recursive: true }),
    ]);
    const first = await createCompleteIteration({
      root: testRepository.root,
      webRoot: testRoot,
      sourceCommit: testRepository.sourceCommit,
      sourcePath: testRepository.sourcePath,
      id: "iteration-test-001",
      label: "Test-only sealed iteration one",
      number: 1,
      production: productionBinding,
      candidate: candidateBinding,
      previous: null,
    });
    const firstLedgerRaw = await readFile(path.join(testRoot, `gauntlet/iterations/${first.id}.json`), "utf8");
    await commitEvidenceAndAnchors(
      testRepository.root,
      testRoot,
      [first.id],
    );
    const second = await createCompleteIteration({
      root: testRepository.root,
      webRoot: testRoot,
      sourceCommit: testRepository.sourceCommit,
      sourcePath: testRepository.sourcePath,
      id: "iteration-test-002",
      label: "Test-only sealed iteration two",
      number: 2,
      production: productionBinding,
      candidate: candidateBinding,
      previous: { iterationId: first.id, ledgerSha256: sha256(firstLedgerRaw) },
    });

    const unanchoredSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(unanchoredSnapshot.overallStatus, "fail");
    assert.equal(unanchoredSnapshot.dataIssues.some((issue) => /Git anchor invalid/.test(issue)), true);
    assert.notEqual(await runStrictCli(testRoot, second.id), 0);
    const commits = await commitEvidenceAndAnchors(
      testRepository.root,
      testRoot,
      [second.id],
    );

    const [firstSnapshot, secondSnapshot] = await Promise.all([
      getGauntletProgress(testRoot, first.id),
      getGauntletProgress(testRoot, second.id),
    ]);
    for (const snapshot of [firstSnapshot, secondSnapshot]) {
      assert.equal(snapshot.overallStatus, "pass", snapshot.dataIssues.join("\n"));
      assert.equal(snapshot.iterations.length, 2);
      assert.equal(snapshot.iterations.filter((entry) => entry.selected).length, 1);
      assert.equal(snapshot.iterations.filter((entry) => entry.active).length, 1);
      assert.equal(snapshot.pairedOutputCases, 12);
      assert.equal(snapshot.blindReviewedCases, 12);
      assert.equal(snapshot.completedJourneys, 4);
      assert.equal(snapshot.cases.every((testCase) => Boolean(testCase.candidate && testCase.production && testCase.blindVerdict)), true);
      assert.equal(snapshot.cases[0].candidate?.presentation.visibleText.includes("Test-only candidate presentation"), true);
      assert.match(snapshot.iteration.builder.change, /Test-only builder change/);
      assert.equal(snapshot.iteration.critic.verdict, "pass");
      assert.equal(snapshot.gates.find((gate) => gate.id === "git-anchor")?.status, "pass");
    }
    assert.notEqual(commits.evidenceCommit, commits.anchorCommit);
    assert.equal(firstSnapshot.iterations.find((entry) => entry.id === first.id)?.selected, true);
    assert.equal(secondSnapshot.iterations.find((entry) => entry.id === second.id)?.selected, true);

    await execGit([
      "switch",
      "-c",
      "test-malicious-anchor",
      commits.evidenceCommit,
    ], testRepository.root);
    await writeGauntletAnchor(testRoot, second.id);
    const anchorCommitRendererPath = path.join(testRepository.root, rendererPath);
    const anchorCommitRenderer = await readFile(anchorCommitRendererPath, "utf8");
    await writeFile(
      anchorCommitRendererPath,
      `${anchorCommitRenderer}\n// Unauthorized renderer change hidden in the anchor commit.\n`,
    );
    await execGit([
      "add",
      `web/gauntlet/anchors/${second.id}.json`,
      rendererPath,
    ], testRepository.root);
    await execGit([
      "commit",
      "-m",
      "test: smuggle renderer change into anchor commit",
    ], testRepository.root);
    const extraAnchorChangeSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(extraAnchorChangeSnapshot.overallStatus, "fail");
    assert.equal(
      extraAnchorChangeSnapshot.dataIssues.some((issue) => /anchor introduction commit must add only/.test(issue)),
      true,
    );
    assert.notEqual(await runStrictCli(testRoot, second.id), 0);
    await execGit(["switch", "--detach", commits.anchorCommit], testRepository.root);

    const workspaceFixturePath = path.join(
      testRepository.root,
      `tests/resumes/${manifest.cases[0].resumePath}`,
    );
    const workspaceFixtureRaw = await readFile(workspaceFixturePath);
    await writeFile(workspaceFixturePath, "MUTATED WORKTREE RESUME MUST NEVER DRIVE CHECKS\n");
    const generationBoundSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(generationBoundSnapshot.overallStatus, "pass", generationBoundSnapshot.dataIssues.join("\n"));
    await writeFile(workspaceFixturePath, workspaceFixtureRaw);

    const pageSource = await readFile(path.join(process.cwd(), "app/(app)/launch/gauntlet/page.tsx"), "utf8");
    assert.match(pageSource, /name="iteration"/);
    assert.match(pageSource, /Builder and critic/);
    assert.match(pageSource, /Variant identity appears only after/);
    assert.doesNotMatch(pageSource, /Inspect generated report output|reportPreview/);
    assert.match(pageSource, /UnknownGauntletIterationError/);
    assert.doesNotMatch(pageSource, /resumePath/);

    await assert.rejects(() => getGauntletProgress(testRoot, "../../outside"), /iteration selector/);
    const outside = path.join(testRoot, "outside.txt");
    const symlinkRoot = path.join(testRoot, "safe-root");
    await mkdir(symlinkRoot);
    await writeFile(outside, "outside");
    await symlink(outside, path.join(symlinkRoot, "escape"));
    await assert.rejects(() => resolveContainedExistingPath(symlinkRoot, "escape"), /escapes/);

    const iterationsDirectory = path.join(testRoot, "gauntlet/iterations");
    const escapedIterationsDirectory = path.join(testRepository.root, "escaped-iterations");
    await rename(iterationsDirectory, escapedIterationsDirectory);
    await symlink(escapedIterationsDirectory, iterationsDirectory, "dir");
    try {
      await assert.rejects(
        () => getGauntletProgress(testRoot, second.id),
        /gauntlet\/iterations.*approved root|path escapes/,
      );
    } finally {
      await rm(iterationsDirectory, { force: true });
      await rename(escapedIterationsDirectory, iterationsDirectory);
    }

    const artifactsDirectory = path.join(testRoot, "gauntlet/artifacts");
    const escapedArtifactsDirectory = path.join(testRepository.root, "escaped-artifacts");
    await rename(artifactsDirectory, escapedArtifactsDirectory);
    await symlink(escapedArtifactsDirectory, artifactsDirectory, "dir");
    try {
      await assert.rejects(
        () => getGauntletProgress(testRoot, second.id),
        /gauntlet\/artifacts.*approved root|path escapes/,
      );
      await assert.rejects(
        () => prepareBlindPackets(testRoot, second.id),
        /gauntlet\/artifacts.*approved root|path escapes/,
      );
    } finally {
      await rm(artifactsDirectory, { force: true });
      await rename(escapedArtifactsDirectory, artifactsDirectory);
    }

    const secondLedgerPath = path.join(testRoot, `gauntlet/iterations/${second.id}.json`);
    const secondLedgerRaw = await readFile(secondLedgerPath, "utf8");
    const nonexistentCommitIteration = JSON.parse(secondLedgerRaw) as GauntletIteration;
    nonexistentCommitIteration.candidate.commit = "f".repeat(40);
    await writeFile(secondLedgerPath, serialize(nonexistentCommitIteration));
    const nonexistentCommitValidation = await validateGauntletDefinition(testRoot, second.id);
    assert.equal(nonexistentCommitValidation.issues.some((issue) => /not a real inspectable Git commit/.test(issue)), true);
    await writeFile(secondLedgerPath, secondLedgerRaw);

    const journeyPath = path.join(testRoot, `gauntlet/artifacts/${second.id}/journeys/${manifest.requiredJourneys[0].id}.json`);
    const journeyRaw = await readFile(journeyPath, "utf8");
    const staleJourney = JSON.parse(journeyRaw) as JourneyRun;
    staleJourney.testedAt = "2020-01-01T00:00:00.000Z";
    await writeFile(journeyPath, serialize(staleJourney));
    const staleJourneySnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(staleJourneySnapshot.completedJourneys, 3);
    assert.equal(staleJourneySnapshot.overallStatus, "fail");
    assert.equal(staleJourneySnapshot.dataIssues.some((issue) => /journey receipt is stale/.test(issue)), true);
    await writeFile(journeyPath, journeyRaw);

    const firstCaseId = manifest.cases[0].id;
    const outputPath = path.join(testRoot, `gauntlet/artifacts/${second.id}/outputs/candidate/${firstCaseId}.json`);
    const outputRaw = await readFile(outputPath, "utf8");
    assert.doesNotMatch(outputRaw, /tests\/resumes\//);
    assert.equal((JSON.parse(outputRaw) as GauntletOutputArtifact).generation.sourceCommit, sourceCommit);
    const staleGenerationReceipt = JSON.parse(outputRaw) as GauntletOutputArtifact;
    staleGenerationReceipt.generation.generatedAt = "2026-07-30T20:52:41.424Z";
    await writeFile(outputPath, serialize(staleGenerationReceipt));
    const staleGenerationSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(staleGenerationSnapshot.overallStatus, "fail");
    assert.equal(staleGenerationSnapshot.cases[0].blindVerdict, null);
    assert.equal(staleGenerationSnapshot.dataIssues.some((issue) => /source-run metadata/.test(issue)), true);
    await writeFile(outputPath, outputRaw);

    const staleSanitizedSource = JSON.parse(outputRaw) as GauntletOutputArtifact;
    staleSanitizedSource.generation.sanitizedOutput.sha256 = "d".repeat(64);
    await writeFile(outputPath, serialize(staleSanitizedSource));
    const staleSanitizedSourceSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(staleSanitizedSourceSnapshot.overallStatus, "fail");
    assert.equal(staleSanitizedSourceSnapshot.cases[0].blindVerdict, null);
    assert.equal(staleSanitizedSourceSnapshot.dataIssues.some((issue) => /source receipt/.test(issue)), true);
    await writeFile(outputPath, outputRaw);

    const staleRendererReceipt = JSON.parse(outputRaw) as GauntletOutputArtifact;
    staleRendererReceipt.presentation.renderer.sha256 = "e".repeat(64);
    await writeFile(outputPath, serialize(staleRendererReceipt));
    const staleRendererSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(staleRendererSnapshot.overallStatus, "fail");
    assert.equal(staleRendererSnapshot.cases[0].blindVerdict, null);
    assert.equal(staleRendererSnapshot.dataIssues.some((issue) => /renderer receipt/.test(issue)), true);
    await writeFile(outputPath, outputRaw);

    const productionOutputPath = path.join(testRoot, `gauntlet/artifacts/${second.id}/outputs/production/${firstCaseId}.json`);
    const productionOutputRaw = await readFile(productionOutputPath, "utf8");
    const divergentSourceCommit = JSON.parse(productionOutputRaw) as GauntletOutputArtifact;
    divergentSourceCommit.generation.sourceCommit = candidateCommit;
    await writeFile(productionOutputPath, serialize(divergentSourceCommit));
    const divergentSourceSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(divergentSourceSnapshot.overallStatus, "fail");
    assert.equal(divergentSourceSnapshot.cases[0].blindVerdict, null);
    assert.equal(divergentSourceSnapshot.dataIssues.some((issue) => /same immutable generation receipt/.test(issue)), true);
    await writeFile(productionOutputPath, productionOutputRaw);

    const mutatedOutput = JSON.parse(outputRaw) as GauntletOutputArtifact;
    (mutatedOutput.report as Record<string, unknown>).summary = "Mutated after review.";
    await writeFile(outputPath, serialize(mutatedOutput));
    const mutatedOutputSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(mutatedOutputSnapshot.overallStatus, "fail");
    assert.equal(mutatedOutputSnapshot.cases[0].blindVerdict, null);
    assert.equal(mutatedOutputSnapshot.gates.find((gate) => gate.id === "evidence-integrity")?.status, "fail");
    assert.notEqual(await runStrictCli(testRoot, second.id), 0);
    await writeFile(outputPath, outputRaw);

    const screenshotPath = path.join(testRoot, `gauntlet/artifacts/${second.id}/presentations/candidate/${firstCaseId}.png`);
    const screenshotRaw = await readFile(screenshotPath);
    await writeFile(screenshotPath, Buffer.concat([screenshotRaw, Buffer.from("mutation")]));
    const mutatedScreenshotSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(mutatedScreenshotSnapshot.overallStatus, "fail");
    assert.equal(mutatedScreenshotSnapshot.cases[0].blindVerdict, null);
    await writeFile(screenshotPath, screenshotRaw);

    const mappingPath = path.join(testRoot, `gauntlet/artifacts/${second.id}/operator/mapping.json`);
    const mappingRaw = await readFile(mappingPath, "utf8");
    const swappedMapping = JSON.parse(mappingRaw) as BlindMapping;
    const originalA = swappedMapping.cases[firstCaseId].labels.A;
    swappedMapping.cases[firstCaseId].labels.A = swappedMapping.cases[firstCaseId].labels.B;
    swappedMapping.cases[firstCaseId].labels.B = originalA;
    await writeFile(mappingPath, serialize(swappedMapping));
    const swappedMappingSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(swappedMappingSnapshot.cases[0].blindVerdict, null);
    assert.equal(swappedMappingSnapshot.overallStatus, "fail");
    await writeFile(mappingPath, mappingRaw);

    const manifestPath = path.join(testRoot, "gauntlet/manifest.json");
    const manifestRaw = await readFile(manifestPath, "utf8");
    const weakenedManifest = JSON.parse(manifestRaw) as GauntletManifest;
    weakenedManifest.target.minimumPreferenceRate = 0.5;
    weakenedManifest.target.minimumPreferredCases = 6;
    await writeFile(manifestPath, serialize(weakenedManifest));
    const weakenedTargetSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(weakenedTargetSnapshot.overallStatus, "fail");
    assert.equal(weakenedTargetSnapshot.dataIssues.some((issue) => /non-negotiable quality bar/.test(issue)), true);
    await writeFile(manifestPath, manifestRaw);

    const restored = await getGauntletProgress(testRoot, second.id);
    assert.equal(restored.overallStatus, "pass", restored.dataIssues.join("\n"));

    const forgedJourneyPath = path.join(
      testRoot,
      `gauntlet/artifacts/${first.id}/journeys/${manifest.requiredJourneys[0].id}.json`,
    );
    const forgedJourney = JSON.parse(await readFile(forgedJourneyPath, "utf8")) as JourneyRun;
    forgedJourney.notes = "Self-consistent descendant rewrite with all mutable hashes recomputed.";
    await writeFile(forgedJourneyPath, serialize(forgedJourney));
    const firstLedgerPath = path.join(testRoot, `gauntlet/iterations/${first.id}.json`);
    const forgedFirstLedger = JSON.parse(await readFile(firstLedgerPath, "utf8")) as GauntletIteration;
    forgedFirstLedger.seal!.artifactSetSha256 = await hashArtifactTree(
      path.join(testRoot, `gauntlet/artifacts/${first.id}`),
    );
    await writeFile(firstLedgerPath, serialize(forgedFirstLedger));
    const forgedFirstLedgerRaw = await readFile(firstLedgerPath, "utf8");
    const forgedSecondLedger = JSON.parse(await readFile(secondLedgerPath, "utf8")) as GauntletIteration;
    forgedSecondLedger.previous!.ledgerSha256 = sha256(forgedFirstLedgerRaw);
    await writeFile(secondLedgerPath, serialize(forgedSecondLedger));
    assert.equal(
      forgedFirstLedger.seal!.artifactSetSha256,
      await hashArtifactTree(path.join(testRoot, `gauntlet/artifacts/${first.id}`)),
    );
    assert.equal(forgedSecondLedger.previous!.ledgerSha256, sha256(forgedFirstLedgerRaw));
    assert.notEqual(await runStrictCli(testRoot, second.id), 0);

    await execGit(["add", "web/gauntlet/iterations", "web/gauntlet/artifacts"], testRepository.root);
    await execGit(["commit", "-m", "test: forged self-consistent evidence rewrite"], testRepository.root);
    const forgedEvidenceCommit = await execGit(["rev-parse", "HEAD"], testRepository.root);
    const forgedAnchors: GauntletAnchor[] = [];
    for (const iterationId of [first.id, second.id]) {
      const forgedAnchor = await buildGauntletAnchorRecord(
        testRoot,
        iterationId,
        forgedEvidenceCommit,
      );
      forgedAnchors.push(forgedAnchor);
      await writeFile(
        path.join(testRoot, `gauntlet/anchors/${iterationId}.json`),
        serialize(forgedAnchor),
      );
    }
    assert.equal(forgedAnchors.every((anchor) => anchor.evidenceCommit === forgedEvidenceCommit), true);
    await execGit(["add", "web/gauntlet/anchors"], testRepository.root);
    await execGit(["commit", "-m", "test: forged recomputed anchor rewrite"], testRepository.root);
    const forgedCommittedSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(forgedCommittedSnapshot.overallStatus, "fail");
    assert.equal(
      forgedCommittedSnapshot.dataIssues.some((issue) => /immutable introduction blob/.test(issue)),
      true,
    );
    assert.notEqual(await runStrictCli(testRoot, second.id), 0);
  } finally {
    await rm(testRepository.root, { recursive: true, force: true });
  }

  console.log("gauntlet tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
