import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import manifestJson from "../gauntlet/manifest.json";
import { observedInstalledTreeReceipt } from "../lib/gauntlet/dependency-closure";
import { hashArtifactTree, isSafeComponent, readGitBlob, resolveContainedExistingPath, sha256, canonicalJsonSha256 } from "../lib/gauntlet/integrity";
import { prepareBlindPackets } from "../lib/gauntlet/packets";
import {
  buildGauntletAnchorRecord,
  caseSetSha256,
  currentCandidateCleanlinessIssue,
  dependencyTreeMatchesCurrentHost,
  getGauntletProgress,
  journeyDefinitionSha256,
  validateGauntletDefinition,
  writeGauntletAnchor,
} from "../lib/gauntlet/progress";
import {
  GAUNTLET_CAPTURE_CONTRACT,
  GAUNTLET_FINALIZED_CAPTURE_STATEMENT,
  GAUNTLET_RUNTIME_CLOSURE_PATHS,
  GAUNTLET_VALIDATOR_PATH,
  type BlindMapping,
  type CandidateBinding,
  type DependencyClosureReceipt,
  type GauntletIteration,
  type GauntletAnchor,
  type GauntletManifest,
  type GauntletOutputArtifact,
  type JourneyRun,
  type ReferenceAssessment,
  type SourceAudit,
  type Variant,
} from "../lib/gauntlet/types";
import { readGitBlob as readCaptureGitBlob } from "../scripts/gauntlet-evidence-capture/repository";

const repositoryRoot = path.resolve(process.cwd(), "..");
const promptPath = "web/prompts/resume_v2.txt";
const rendererPath = "web/components/workspace/report/ReportStream.tsx";
const manifest = manifestJson as GauntletManifest;
const TEST_PACKAGE_RECORD = {
  version: "1.0.0",
  resolved: "https://registry.invalid/fixture-dependency-1.0.0.tgz",
  integrity: "sha512-test-only-fixture-dependency",
};
const TEST_PACKAGE_LOCK = {
  name: "gauntlet-test",
  version: "1.0.0",
  lockfileVersion: 3,
  requires: true,
  packages: {
    "": {
      name: "gauntlet-test",
      version: "1.0.0",
      dependencies: { "fixture-dependency": "1.0.0" },
    },
    "node_modules/fixture-dependency": TEST_PACKAGE_RECORD,
  },
};
const TEST_HIDDEN_PACKAGE_LOCK = {
  name: "gauntlet-test",
  version: "1.0.0",
  lockfileVersion: 3,
  requires: true,
  packages: { "node_modules/fixture-dependency": TEST_PACKAGE_RECORD },
};

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

async function runtimeClosureForTest(root: string, commit: string) {
  const files = await Promise.all(GAUNTLET_RUNTIME_CLOSURE_PATHS.map(async (repositoryPath) => ({
    path: repositoryPath,
    sha256: sha256(await readGitBlob(root, commit, repositoryPath)),
  })));
  return { files, sha256: canonicalJsonSha256(files) };
}

async function dependencyClosureForTest(
  root: string,
  productionCommit: string,
  candidateCommit: string,
): Promise<DependencyClosureReceipt> {
  const packageLockPath = "web/package-lock.json";
  const hiddenLockPath = "web/node_modules/.package-lock.json";
  const [productionLock, candidateLock, worktreeLock, hiddenLock] = await Promise.all([
    readGitBlob(root, productionCommit, packageLockPath),
    readGitBlob(root, candidateCommit, packageLockPath),
    readFile(path.join(root, packageLockPath)),
    readFile(path.join(root, hiddenLockPath)),
  ]);
  const commonSha256 = sha256(productionLock);
  assert.equal(sha256(candidateLock), commonSha256);
  assert.equal(sha256(worktreeLock), commonSha256);
  const installed = await observedInstalledTreeReceipt({
    nodeModulesPath: path.join(root, "web/node_modules"),
    candidateLockBytes: candidateLock,
    hiddenLockBytes: hiddenLock,
  });
  return {
    packageLock: {
      path: packageLockPath,
      sha256: commonSha256,
      productionCommit,
      productionSha256: commonSha256,
      candidateCommit,
      candidateSha256: commonSha256,
      worktreeSha256: commonSha256,
    },
    hiddenLock: { path: hiddenLockPath, sha256: sha256(hiddenLock) },
    installedTree: {
      platform: process.platform,
      arch: process.arch,
      packageCount: installed.packageCount,
      sha256: installed.sha256,
    },
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
    ...GAUNTLET_RUNTIME_CLOSURE_PATHS.map(async (repositoryPath) => {
      await mkdir(path.dirname(path.join(root, repositoryPath)), { recursive: true });
      await copyFile(path.join(repositoryRoot, repositoryPath), path.join(root, repositoryPath));
    }),
    copyFile(
      path.join(repositoryRoot, "tests/fixtures/calibration.json"),
      path.join(root, "tests/fixtures/calibration.json"),
    ),
  ]);
  await writeFile(path.join(root, "web/package-lock.json"), serialize(TEST_PACKAGE_LOCK));
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
  const testDependencyRoot = path.join(root, "web/node_modules/fixture-dependency");
  const testNextBin = path.join(testDependencyRoot, "dist/bin/next");
  await mkdir(testDependencyRoot, { recursive: true });
  await mkdir(path.dirname(testNextBin), { recursive: true });
  await Promise.all([
    writeFile(
      path.join(root, "web/node_modules/.package-lock.json"),
      serialize(TEST_HIDDEN_PACKAGE_LOCK),
    ),
    writeFile(
      path.join(testDependencyRoot, "package.json"),
      serialize({ name: "fixture-dependency", version: "1.0.0" }),
    ),
    writeFile(testNextBin, "#!/usr/bin/env node\nconsole.log('fixture next');\n", { mode: 0o755 }),
  ]);
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
  const candidateValidator = iteration.candidate.runtimeClosure?.files.find(
    (receipt) => receipt.path === GAUNTLET_VALIDATOR_PATH,
  );
  if (!candidateValidator || !iteration.candidate.commit) {
    throw new Error("test candidate binding is missing its validator runtime receipt");
  }
  const validatorGitBlobOid = await execGit(
    ["rev-parse", `${iteration.candidate.commit}:${GAUNTLET_VALIDATOR_PATH}`],
    root,
  );
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
      const reportSha256 = canonicalJsonSha256(report);
      const archiveIdentity = {
        schemaVersion: "1" as const,
        nonce: (variant === "candidate"
          ? iterationNumber === 1 ? "a" : "c"
          : iterationNumber === 1 ? "b" : "d").repeat(48),
        variant,
        commit: binding.commit!,
      };
      const artifact: GauntletOutputArtifact = {
        schemaVersion: "2",
        iterationId: iteration.id,
        caseId: testCase.id,
        variant,
        captureContract: GAUNTLET_CAPTURE_CONTRACT,
        reportMode: variant === "candidate"
          ? "candidate_commit_finalized"
          : "historical_raw_unfinalized",
        binding,
        generation: {
          sourceCommit,
          sanitizedOutput: { path: sourcePath, sha256: sha256(sourceBlob) },
          runId: source.sourceRun.runId,
          fixtureId: selected.fixtureId,
          generatedAt: source.sourceRun.generatedAt,
          model: source.sourceRun.model,
          canonicalPromptSha256: source.sourceRun.canonicalPromptSha256,
          reportSha256,
        },
        finalization: variant === "candidate"
          ? {
            status: "finalized",
            forceGrounding: true,
            rawReportSha256: reportSha256,
            effectiveReportSha256: reportSha256,
            validator: {
              commit: iteration.candidate.commit,
              path: GAUNTLET_VALIDATOR_PATH,
              sha256: candidateValidator.sha256,
              gitBlobOid: validatorGitBlobOid,
            },
          }
          : {
            status: "unfinalized_raw",
            forceGrounding: false,
            rawReportSha256: reportSha256,
            effectiveReportSha256: reportSha256,
            validator: null,
          },
        fixture: { sha256: sha256(fixture) },
        reportSha256,
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
          captureReceipt: {
            archiveIdentity,
            renderedReport: {
              ...archiveIdentity,
              caseId: testCase.id,
              component: "ReportStream",
              reportSha256,
            },
          },
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
    baselineStatement: GAUNTLET_FINALIZED_CAPTURE_STATEMENT,
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
  const gitModeAttackRoot = await mkdtemp(path.join(os.tmpdir(), "riyp-gauntlet-git-mode-"));
  try {
    const attackedPath = path.join(gitModeAttackRoot, rendererPath);
    const symlinkBytes = "same-bytes-regular-worktree-file";
    await mkdir(path.dirname(attackedPath), { recursive: true });
    await symlink(symlinkBytes, attackedPath);
    await execGit(["init"], gitModeAttackRoot);
    await execGit(["config", "user.name", "Gauntlet Mode Test"], gitModeAttackRoot);
    await execGit(["config", "user.email", "gauntlet-mode@example.invalid"], gitModeAttackRoot);
    await execGit(["config", "commit.gpgsign", "false"], gitModeAttackRoot);
    await execGit(["add", rendererPath], gitModeAttackRoot);
    await execGit(["commit", "-m", "test: symlink-mode attack"], gitModeAttackRoot);
    const attackedCommit = await execGit(["rev-parse", "HEAD"], gitModeAttackRoot);
    await rm(attackedPath);
    await writeFile(attackedPath, symlinkBytes);
    assert.equal(await execGit(["show", `${attackedCommit}:${rendererPath}`], gitModeAttackRoot), symlinkBytes);
    await assert.rejects(
      () => readGitBlob(gitModeAttackRoot, attackedCommit, rendererPath),
      /regular 100644\/100755 blob/,
    );
    await assert.rejects(
      () => readCaptureGitBlob(gitModeAttackRoot, attackedCommit, rendererPath),
      /regular 100644\/100755 blob/,
    );
  } finally {
    await rm(gitModeAttackRoot, { recursive: true, force: true });
  }

  assert.equal(isSafeComponent("iteration-001"), true);
  for (const unsafe of ["../../outside", "a/b", "..\\outside", "__proto__", "constructor"]) {
    assert.equal(isSafeComponent(unsafe), false);
  }
  assert.equal(
    currentCandidateCleanlinessIssue("candidate", "a".repeat(40), "a".repeat(40), " M web/prompts/resume_v2.txt"),
    "candidate runtime, capture harness, or dependency inputs are dirty relative to the bound HEAD commit",
  );
  assert.equal(dependencyTreeMatchesCurrentHost({ platform: process.platform, arch: process.arch }), true);
  assert.equal(dependencyTreeMatchesCurrentHost({
    platform: process.platform === "linux" ? "darwin" : "linux",
    arch: process.arch,
  }), false);
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
  const legacySnapshot = await getGauntletProgress(process.cwd(), "iteration-001");
  assert.equal(
    legacySnapshot.dataIssues.some((issue) => /captureContract|reportMode|finalization receipt|dependency closure|runtime closure/.test(issue)),
    false,
    "the exact immutable iteration-001 evidence set is the sole finalized-v1 grandfather",
  );
  const legacyAttackRoot = await mkdtemp(path.join(os.tmpdir(), "riyp-gauntlet-legacy-attack-"));
  try {
    const legacyAttackWebRoot = path.join(legacyAttackRoot, "web");
    const legacyIterationDirectory = path.join(legacyAttackWebRoot, "gauntlet/iterations");
    const legacyArtifactRoot = path.join(
      legacyAttackWebRoot,
      "gauntlet/artifacts/iteration-001",
    );
    const legacyOutputDirectory = path.join(legacyArtifactRoot, "outputs/candidate");
    const legacyProductionOutputDirectory = path.join(legacyArtifactRoot, "outputs/production");
    await Promise.all([
      mkdir(legacyIterationDirectory, { recursive: true }),
      mkdir(legacyOutputDirectory, { recursive: true }),
      mkdir(legacyProductionOutputDirectory, { recursive: true }),
    ]);
    await Promise.all([
      copyFile(
        path.join(process.cwd(), "gauntlet/manifest.json"),
        path.join(legacyAttackWebRoot, "gauntlet/manifest.json"),
      ),
      copyFile(
        path.join(process.cwd(), "gauntlet/iterations/iteration-001.json"),
        path.join(legacyIterationDirectory, "iteration-001.json"),
      ),
    ]);
    for (const variant of ["candidate", "production"] as const) {
      const sourceDirectory = path.join(
        process.cwd(),
        `gauntlet/artifacts/iteration-001/outputs/${variant}`,
      );
      const targetDirectory = path.join(legacyArtifactRoot, `outputs/${variant}`);
      const names = await readdir(sourceDirectory);
      assert.equal(names.length, 12, `${variant} legacy fixture must contain exactly 12 artifacts`);
      assert.equal(names.every((name) => name.endsWith(".json")), true);
      await Promise.all(names.map((name) => copyFile(
        path.join(sourceDirectory, name),
        path.join(targetDirectory, name),
      )));
    }

    const assertLegacyDenied = async (label: string, expectedArtifactErrors: number) => {
      const snapshot = await getGauntletProgress(legacyAttackWebRoot, "iteration-001");
      const fingerprintIssues = snapshot.dataIssues.filter(
        (issue) => /legacy capture fingerprint does not match/.test(issue),
      );
      assert.equal(
        fingerprintIssues.length,
        1,
        `${label} must emit exactly one global legacy-authorization error`,
      );
      const finalizedContractIssues = snapshot.dataIssues.filter(
        (issue) => /: captureContract must be finalized-v1$/.test(issue),
      );
      assert.equal(
        finalizedContractIssues.length,
        expectedArtifactErrors,
        `${label} must deny the legacy carve-out once per surviving JSON artifact`,
      );
      const survivingJsonFilenames: string[] = [];
      for (const variant of ["candidate", "production"] as const) {
        const entries = await readdir(
          path.join(legacyArtifactRoot, `outputs/${variant}`),
          { withFileTypes: true },
        );
        survivingJsonFilenames.push(...entries
          .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
          .map((entry) => entry.name));
      }
      assert.equal(survivingJsonFilenames.length, expectedArtifactErrors);
      const deniedFilenames = finalizedContractIssues.map((issue) => (
        issue.slice(0, issue.indexOf(": captureContract must be finalized-v1"))
      ));
      // Both variants intentionally share filenames; multiset equality proves one error per path.
      assert.deepEqual(
        deniedFilenames.sort(),
        survivingJsonFilenames.sort(),
        `${label} must identify every surviving JSON artifact exactly once`,
      );
    };

    const exactCopySnapshot = await getGauntletProgress(legacyAttackWebRoot, "iteration-001");
    assert.equal(
      exactCopySnapshot.dataIssues.some((issue) => /legacy capture fingerprint does not match/.test(issue)),
      false,
      "the exact 24-file copy must retain the immutable legacy authorization",
    );
    assert.equal(
      exactCopySnapshot.dataIssues.some((issue) => /captureContract must be finalized-v1/.test(issue)),
      false,
      "the exact 24-file copy must remain the sole legacy capture-contract exception",
    );

    const attackedArtifactPath = path.join(legacyOutputDirectory, "staff-ml-elite.json");
    const attackedArtifactRaw = await readFile(attackedArtifactPath, "utf8");
    const legacyOutputsRoot = path.join(legacyArtifactRoot, "outputs");
    const rootExtraFile = path.join(legacyOutputsRoot, "README.txt");
    await writeFile(rootExtraFile, "not part of the exact output tree\n");
    await assertLegacyDenied("adding a file directly under outputs", 24);
    await rm(rootExtraFile);

    const rootExtraDirectory = path.join(legacyOutputsRoot, "attacker-variant");
    await mkdir(rootExtraDirectory);
    await assertLegacyDenied("adding a sibling variant directory under outputs", 24);
    await rm(rootExtraDirectory, { recursive: true });

    let afterLegacySnapshotHookRan = false;
    const afterAuthorizationMutation = JSON.parse(attackedArtifactRaw) as GauntletOutputArtifact;
    afterAuthorizationMutation.schemaVersion = "after-authorization-drift" as "2";
    afterAuthorizationMutation.captureContract = "tampered-v0" as typeof GAUNTLET_CAPTURE_CONTRACT;
    const afterAuthorizationRaw = serialize(afterAuthorizationMutation);
    const frozenSnapshot = await getGauntletProgress(
      legacyAttackWebRoot,
      "iteration-001",
      {
        afterLegacySnapshot: async () => {
          afterLegacySnapshotHookRan = true;
          await writeFile(attackedArtifactPath, afterAuthorizationRaw);
        },
      },
    );
    assert.equal(afterLegacySnapshotHookRan, true, "the deterministic post-authorization hook must run");
    assert.equal(await readFile(attackedArtifactPath, "utf8"), afterAuthorizationRaw);
    assert.equal(
      frozenSnapshot.dataIssues.some((issue) => /schemaVersion must be 2|captureContract must be finalized-v1/.test(issue)),
      false,
      "bytes replaced after authorization must not be reread or admitted through the legacy exception",
    );
    // The current scan uses its pinned, path-specific snapshot; the next scan rejects the changed bytes globally.
    await assertLegacyDenied("persisting a post-snapshot replacement into the next scan", 24);
    await writeFile(attackedArtifactPath, attackedArtifactRaw);

    const attackedLedgerPath = path.join(legacyIterationDirectory, "iteration-001.json");
    const attackedLedgerRaw = await readFile(attackedLedgerPath, "utf8");
    const contradictoryLedger = JSON.parse(attackedLedgerRaw) as GauntletIteration;
    contradictoryLedger.baselineStatement += " Candidate and production are actually equivalent.";
    await writeFile(attackedLedgerPath, serialize(contradictoryLedger));
    await assertLegacyDenied("changing baselineStatement under the legacy ID", 24);
    await writeFile(attackedLedgerPath, attackedLedgerRaw);

    const capturedAtAttack = JSON.parse(attackedArtifactRaw) as GauntletOutputArtifact;
    capturedAtAttack.presentation.capturedAt = "2026-07-31T16:01:00.000Z";
    capturedAtAttack.presentation.visibleText += "\nRecomputed attacker text.";
    capturedAtAttack.presentation.visibleTextSha256 = sha256(capturedAtAttack.presentation.visibleText);
    await writeFile(attackedArtifactPath, serialize(capturedAtAttack));
    await assertLegacyDenied("changing capturedAt and recomputing a downstream receipt", 24);
    await writeFile(attackedArtifactPath, attackedArtifactRaw);

    const reportAttack = JSON.parse(attackedArtifactRaw) as GauntletOutputArtifact;
    (reportAttack.report as Record<string, unknown>).summary = "Rewritten under the same legacy identity.";
    reportAttack.reportSha256 = canonicalJsonSha256(reportAttack.report);
    reportAttack.generation.reportSha256 = reportAttack.reportSha256;
    await writeFile(attackedArtifactPath, serialize(reportAttack));
    await assertLegacyDenied("recomputing report receipts", 24);
    await writeFile(attackedArtifactPath, attackedArtifactRaw);

    await rm(attackedArtifactPath);
    await assertLegacyDenied("deleting one artifact from the 24-file set", 23);
    await writeFile(attackedArtifactPath, attackedArtifactRaw);

    const extraOutputPath = path.join(legacyOutputDirectory, "README.txt");
    await writeFile(extraOutputPath, "not part of the immutable evidence set\n");
    await assertLegacyDenied("adding a non-JSON output entry", 24);
    await rm(extraOutputPath);

    const renamedArtifactPath = path.join(legacyOutputDirectory, "staff-ml-elite-renamed.json");
    await rename(attackedArtifactPath, renamedArtifactPath);
    await assertLegacyDenied("renaming one artifact in the 24-file set", 24);
    await rename(renamedArtifactPath, attackedArtifactPath);

    const swapArtifactPath = path.join(legacyOutputDirectory, "vp-talent-elite.json");
    const swapArtifactRaw = await readFile(swapArtifactPath, "utf8");
    await Promise.all([
      writeFile(attackedArtifactPath, swapArtifactRaw),
      writeFile(swapArtifactPath, attackedArtifactRaw),
    ]);
    await assertLegacyDenied("swapping two artifacts while preserving the filename set", 24);
    await Promise.all([
      writeFile(attackedArtifactPath, attackedArtifactRaw),
      writeFile(swapArtifactPath, swapArtifactRaw),
    ]);
  } finally {
    await rm(legacyAttackRoot, { recursive: true, force: true });
  }
  const nextConfigSource = await readFile(path.join(process.cwd(), "next.config.mjs"), "utf8");
  assert.match(nextConfigSource, /["']\/launch\/gauntlet["']:\s*\[["']\.\/gauntlet\/published\/progress\.json["']\]/);
  assert.doesNotMatch(nextConfigSource, /\.\/gauntlet\/\*\*\/\*/);

  const hostedRoot = await mkdtemp(path.join(os.tmpdir(), "riyp-gauntlet-hosted-"));
  try {
    const hostedWebRoot = path.join(hostedRoot, "web");
    const hostedGauntletRoot = path.join(hostedWebRoot, "gauntlet");
    await Promise.all([
      mkdir(path.join(hostedGauntletRoot, "iterations"), { recursive: true }),
      mkdir(path.join(hostedGauntletRoot, "artifacts"), { recursive: true }),
    ]);
    await writeFile(
      path.join(hostedGauntletRoot, "manifest.json"),
      serialize({ ...manifest, activeIterationId: "iteration-000-baseline" }),
    );
    await copyFile(
      path.join(process.cwd(), "gauntlet/iterations/iteration-000-baseline.json"),
      path.join(hostedGauntletRoot, "iterations/iteration-000-baseline.json"),
    );
    const hostedSnapshot = await getGauntletProgress(hostedWebRoot);
    assert.equal(hostedSnapshot.iteration.id, "iteration-000-baseline");
    assert.equal(hostedSnapshot.overallStatus, "pending");
    assert.equal(hostedSnapshot.pairedOutputCases, 0);
    assert.equal(hostedSnapshot.blindReviewedCases, 0);
    assert.equal(hostedSnapshot.iterations.length, 1);
    assert.equal(hostedSnapshot.iteration.critic.verdict, "pending");
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
  const [productionBindingBase, candidateBindingBase, candidateRuntimeClosure, dependencyClosure] = await Promise.all([
    bindingFor(productionCommit, "test-only-generation-model", testRepository.root),
    bindingFor(candidateCommit, "test-only-generation-model", testRepository.root),
    runtimeClosureForTest(testRepository.root, candidateCommit),
    dependencyClosureForTest(testRepository.root, productionCommit, candidateCommit),
  ]);
  const productionBinding: CandidateBinding = {
    ...productionBindingBase,
    runtimeClosure: null,
    dependencyClosure,
  };
  const candidateBinding: CandidateBinding = {
    ...candidateBindingBase,
    runtimeClosure: candidateRuntimeClosure,
    dependencyClosure,
  };
  const installedFixtureDependency = path.join(
    testRepository.root,
    "web/node_modules/fixture-dependency",
  );
  const installedFixturePackageJson = path.join(installedFixtureDependency, "package.json");
  const installedFixturePackageJsonRaw = await readFile(installedFixturePackageJson);
  const installedFixtureNextBin = path.join(installedFixtureDependency, "dist/bin/next");
  const installedFixtureNextBinRaw = await readFile(installedFixtureNextBin);
  await rm(installedFixtureDependency, { recursive: true });
  await assert.rejects(
    () => dependencyClosureForTest(
      testRepository.root,
      productionCommit,
      candidateCommit,
    ),
    /hidden dependency lock package is absent from node_modules/,
  );
  await mkdir(installedFixtureDependency);
  await mkdir(path.dirname(installedFixtureNextBin), { recursive: true });
  await writeFile(installedFixturePackageJson, installedFixturePackageJsonRaw);
  await writeFile(installedFixtureNextBin, installedFixtureNextBinRaw, { mode: 0o755 });
  await writeFile(
    installedFixturePackageJson,
    serialize({ name: "fixture-dependency", version: "tampered" }),
  );
  const tamperedInstalledTree = await dependencyClosureForTest(
    testRepository.root,
    productionCommit,
    candidateCommit,
  );
  assert.notEqual(tamperedInstalledTree.installedTree.sha256, dependencyClosure.installedTree.sha256);
  await writeFile(installedFixturePackageJson, installedFixturePackageJsonRaw);
  await writeFile(installedFixtureNextBin, "#!/usr/bin/env node\nconsole.log('tampered next');\n");
  const tamperedNextBinTree = await dependencyClosureForTest(
    testRepository.root,
    productionCommit,
    candidateCommit,
  );
  assert.notEqual(tamperedNextBinTree.installedTree.sha256, dependencyClosure.installedTree.sha256);
  await writeFile(installedFixtureNextBin, installedFixtureNextBinRaw);
  const extraInstalledFile = path.join(installedFixtureDependency, "unexpected-runtime.js");
  await writeFile(extraInstalledFile, "throw new Error('unexpected');\n");
  const extraFileTree = await dependencyClosureForTest(
    testRepository.root,
    productionCommit,
    candidateCommit,
  );
  assert.notEqual(extraFileTree.installedTree.sha256, dependencyClosure.installedTree.sha256);
  await rm(extraInstalledFile);
  const outsideSymlink = path.join(installedFixtureDependency, "outside-link");
  await symlink(testRepository.root, outsideSymlink, "dir");
  await assert.rejects(
    () => dependencyClosureForTest(
      testRepository.root,
      productionCommit,
      candidateCommit,
    ),
    /symlink escapes node_modules/,
  );
  await rm(outsideSymlink);
  const extraDependency = path.join(testRepository.root, "web/node_modules/unrecorded-package");
  await mkdir(extraDependency);
  await writeFile(
    path.join(extraDependency, "package.json"),
    serialize({ name: "unrecorded-package", version: "1.0.0" }),
  );
  await assert.rejects(
    () => dependencyClosureForTest(
      testRepository.root,
      productionCommit,
      candidateCommit,
    ),
    /unrecorded package/,
  );
  await rm(extraDependency, { recursive: true });

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

    const finalizedLedgerPath = path.join(testRoot, `gauntlet/iterations/${second.id}.json`);
    const finalizedLedgerRaw = await readFile(finalizedLedgerPath, "utf8");
    const contradictoryDisclosure = JSON.parse(finalizedLedgerRaw) as GauntletIteration;
    contradictoryDisclosure.baselineStatement += " This suffix contradicts that disclosure.";
    await writeFile(finalizedLedgerPath, serialize(contradictoryDisclosure));
    const contradictoryDisclosureSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(
      contradictoryDisclosureSnapshot.dataIssues.some((issue) => /baselineStatement must equal the exact finalized-v1/.test(issue)),
      true,
    );
    await writeFile(finalizedLedgerPath, finalizedLedgerRaw);

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

    await writeFile(installedFixtureNextBin, "#!/usr/bin/env node\nconsole.log('runtime tamper');\n");
    const installedTreeTamperSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(installedTreeTamperSnapshot.overallStatus, "fail");
    assert.equal(
      installedTreeTamperSnapshot.dataIssues.some((issue) => /installed dependency-tree receipt is stale or incomplete/.test(issue)),
      true,
    );
    await writeFile(installedFixtureNextBin, installedFixtureNextBinRaw);

    const pageSource = await readFile(path.join(process.cwd(), "app/(app)/launch/gauntlet/page.tsx"), "utf8");
    assert.match(pageSource, /name="iteration"/);
    assert.match(pageSource, /Builder and critic/);
    assert.match(pageSource, /Variant identity appears only after/);
    assert.doesNotMatch(pageSource, /Inspect generated report output|reportPreview/);
    assert.match(pageSource, /getPublishedGauntletProgress/);
    assert.match(pageSource, /UnknownPublishedGauntletIterationError/);
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

    const downgradedCapture = JSON.parse(outputRaw) as GauntletOutputArtifact;
    delete downgradedCapture.captureContract;
    delete downgradedCapture.reportMode;
    delete downgradedCapture.finalization;
    delete downgradedCapture.binding.runtimeClosure;
    delete downgradedCapture.binding.dependencyClosure;
    await writeFile(outputPath, serialize(downgradedCapture));
    const downgradedCaptureSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(downgradedCaptureSnapshot.overallStatus, "fail");
    assert.equal(
      downgradedCaptureSnapshot.dataIssues.some((issue) => /captureContract must be finalized-v1/.test(issue)),
      true,
      "a fresh artifact may not downgrade itself into the iteration-001 legacy carve-out",
    );
    await writeFile(outputPath, outputRaw);

    const tamperedMarker = JSON.parse(outputRaw) as GauntletOutputArtifact;
    tamperedMarker.captureContract = "tampered-v0" as typeof GAUNTLET_CAPTURE_CONTRACT;
    await writeFile(outputPath, serialize(tamperedMarker));
    const tamperedMarkerSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(tamperedMarkerSnapshot.overallStatus, "fail");
    assert.equal(tamperedMarkerSnapshot.dataIssues.some((issue) => /captureContract must be finalized-v1/.test(issue)), true);
    await writeFile(outputPath, outputRaw);

    const swappedCandidateMode = JSON.parse(outputRaw) as GauntletOutputArtifact;
    swappedCandidateMode.reportMode = "historical_raw_unfinalized";
    await writeFile(outputPath, serialize(swappedCandidateMode));
    const swappedCandidateModeSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(swappedCandidateModeSnapshot.overallStatus, "fail");
    assert.equal(
      swappedCandidateModeSnapshot.dataIssues.some((issue) => /candidate reportMode must be candidate_commit_finalized/.test(issue)),
      true,
    );
    await writeFile(outputPath, outputRaw);

    const missingCandidateFinalization = JSON.parse(outputRaw) as GauntletOutputArtifact;
    delete missingCandidateFinalization.finalization;
    await writeFile(outputPath, serialize(missingCandidateFinalization));
    const missingCandidateFinalizationSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(missingCandidateFinalizationSnapshot.overallStatus, "fail");
    assert.equal(
      missingCandidateFinalizationSnapshot.dataIssues.some((issue) => /finalization receipt is missing or invalid/.test(issue)),
      true,
    );
    await writeFile(outputPath, outputRaw);

    const missingCandidateRuntime = JSON.parse(outputRaw) as GauntletOutputArtifact;
    missingCandidateRuntime.binding.runtimeClosure = null;
    await writeFile(outputPath, serialize(missingCandidateRuntime));
    const missingCandidateRuntimeSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(missingCandidateRuntimeSnapshot.overallStatus, "fail");
    assert.equal(
      missingCandidateRuntimeSnapshot.dataIssues.some((issue) => /requires a complete runtime closure/.test(issue)),
      true,
    );
    await writeFile(outputPath, outputRaw);

    const tamperedDependencies = JSON.parse(outputRaw) as GauntletOutputArtifact;
    tamperedDependencies.binding.dependencyClosure!.installedTree.sha256 = "f".repeat(64);
    await writeFile(outputPath, serialize(tamperedDependencies));
    const tamperedDependenciesSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(tamperedDependenciesSnapshot.overallStatus, "fail");
    assert.equal(
      tamperedDependenciesSnapshot.dataIssues.some((issue) => /installed dependency-tree receipt|iteration binding/.test(issue)),
      true,
    );
    await writeFile(outputPath, outputRaw);

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

    const tamperedArchiveNonce = JSON.parse(outputRaw) as GauntletOutputArtifact;
    tamperedArchiveNonce.presentation.captureReceipt!.archiveIdentity.nonce = "f".repeat(48);
    await writeFile(outputPath, serialize(tamperedArchiveNonce));
    const tamperedArchiveNonceSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(tamperedArchiveNonceSnapshot.overallStatus, "fail");
    assert.equal(
      tamperedArchiveNonceSnapshot.dataIssues.some((issue) => /rendered-report receipt/.test(issue)),
      true,
    );
    await writeFile(outputPath, outputRaw);

    const divergentCaseArchiveIdentity = JSON.parse(outputRaw) as GauntletOutputArtifact;
    divergentCaseArchiveIdentity.presentation.captureReceipt!.archiveIdentity.nonce = "e".repeat(48);
    divergentCaseArchiveIdentity.presentation.captureReceipt!.renderedReport.nonce = "e".repeat(48);
    await writeFile(outputPath, serialize(divergentCaseArchiveIdentity));
    const divergentCaseArchiveSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(divergentCaseArchiveSnapshot.overallStatus, "fail");
    assert.equal(
      divergentCaseArchiveSnapshot.dataIssues.some((issue) => /candidate capture set must share exactly one archive identity/.test(issue)),
      true,
    );
    await writeFile(outputPath, outputRaw);

    const tamperedRenderedReport = JSON.parse(outputRaw) as GauntletOutputArtifact;
    tamperedRenderedReport.presentation.captureReceipt!.renderedReport.reportSha256 = "f".repeat(64);
    await writeFile(outputPath, serialize(tamperedRenderedReport));
    const tamperedRenderedReportSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(tamperedRenderedReportSnapshot.overallStatus, "fail");
    assert.equal(
      tamperedRenderedReportSnapshot.dataIssues.some((issue) => /exact ReportStream artifact/.test(issue)),
      true,
    );
    await writeFile(outputPath, outputRaw);

    const productionOutputPath = path.join(testRoot, `gauntlet/artifacts/${second.id}/outputs/production/${firstCaseId}.json`);
    const productionOutputRaw = await readFile(productionOutputPath, "utf8");
    const missingRawProductionReceipt = JSON.parse(productionOutputRaw) as GauntletOutputArtifact;
    delete missingRawProductionReceipt.finalization;
    await writeFile(productionOutputPath, serialize(missingRawProductionReceipt));
    const missingRawProductionSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(missingRawProductionSnapshot.overallStatus, "fail");
    assert.equal(
      missingRawProductionSnapshot.dataIssues.some((issue) => /finalization receipt is missing or invalid/.test(issue)),
      true,
    );
    await writeFile(productionOutputPath, productionOutputRaw);

    const productionIdentityOriginals = new Map<string, string>();
    for (const testCase of manifest.cases) {
      const caseOutputPath = path.join(
        testRoot,
        `gauntlet/artifacts/${second.id}/outputs/production/${testCase.id}.json`,
      );
      const raw = await readFile(caseOutputPath, "utf8");
      productionIdentityOriginals.set(caseOutputPath, raw);
      const artifact = JSON.parse(raw) as GauntletOutputArtifact;
      artifact.presentation.captureReceipt!.archiveIdentity.nonce = "c".repeat(48);
      artifact.presentation.captureReceipt!.renderedReport.nonce = "c".repeat(48);
      await writeFile(caseOutputPath, serialize(artifact));
    }
    const reusedCrossVariantNonceSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(reusedCrossVariantNonceSnapshot.overallStatus, "fail");
    assert.equal(
      reusedCrossVariantNonceSnapshot.dataIssues.some((issue) => /candidate and production archive nonces must differ/.test(issue)),
      true,
    );
    await Promise.all([...productionIdentityOriginals].map(([filePath, raw]) => writeFile(filePath, raw)));

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

    const dishonestLedger = JSON.parse(secondLedgerRaw) as GauntletIteration;
    dishonestLedger.baselineStatement = "Candidate and production are directly comparable.";
    await writeFile(secondLedgerPath, serialize(dishonestLedger));
    const dishonestLedgerSnapshot = await getGauntletProgress(testRoot, second.id);
    assert.equal(dishonestLedgerSnapshot.overallStatus, "fail");
    assert.equal(
      dishonestLedgerSnapshot.dataIssues.some((issue) => /baselineStatement must equal the exact finalized-v1/.test(issue)),
      true,
    );
    await writeFile(secondLedgerPath, secondLedgerRaw);

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
