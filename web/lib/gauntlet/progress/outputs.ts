import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  canonicalJsonSha256,
  isFullGitSha,
  isSafeRepositoryPath,
  listGitTree,
  readGitBlob,
  resolveContainedExistingPath,
  resolveRealCommit,
  sha256,
} from "../integrity";
import {
  GAUNTLET_CAPTURE_CONTRACT,
  GAUNTLET_VALIDATOR_PATH,
  type BlindArtifactBinding,
  type CandidateBinding,
  type GauntletCase,
  type GauntletIteration,
  type GauntletManifest,
  type GauntletOutputArtifact,
  type ReportFinalizationReceipt,
  type Variant,
} from "../types";
import {
  bindingsMatch,
  captureRuntimeReceiptIssues,
  hasCompleteBinding,
  hasExactKeys,
  isIsoTimestamp,
  isNonEmptyString,
  isRecord,
  isSafeFixtureId,
  isSha256,
  readJsonDirectory,
  receiptComplete,
  receiptMatches,
  timestampInsideIteration,
  type LoadedArtifact,
} from "./common";
import {
  generationEvidenceIssues,
  generationSourceLineageIssues,
} from "./generation";
import { parseCommittedRunnerAttestation } from "../../../scripts/gauntlet-evidence-capture/runner-attestation";

function finalizationReceiptValid(value: unknown): value is ReportFinalizationReceipt {
  if (!isRecord(value)
    || !hasExactKeys(value, [
      "status",
      "forceGrounding",
      "rawReportSha256",
      "effectiveReportSha256",
      "validator",
    ])
    || !isSha256(value.rawReportSha256)
    || !isSha256(value.effectiveReportSha256)) return false;
  if (value.status === "unfinalized_raw") {
    return value.forceGrounding === false
      && value.validator === null
      && value.rawReportSha256 === value.effectiveReportSha256;
  }
  if (value.status !== "finalized"
    || value.forceGrounding !== true
    || !isRecord(value.validator)
    || !hasExactKeys(value.validator, ["commit", "path", "sha256", "gitBlobOid"])) return false;
  return isFullGitSha(value.validator.commit)
    && value.validator.path === GAUNTLET_VALIDATOR_PATH
    && isSha256(value.validator.sha256)
    && typeof value.validator.gitBlobOid === "string"
    && /^[a-f0-9]{40,64}$/.test(value.validator.gitBlobOid);
}

function validateOutputEnvelope(
  value: unknown,
  variant: Variant,
  iteration: GauntletIteration,
  knownCaseIds: Set<string>,
) {
  const issues: string[] = [];
  if (!isRecord(value)) return ["artifact must be an object"];
  if (value.schemaVersion !== "2") issues.push("schemaVersion must be 2");
  if (value.iterationId !== iteration.id) issues.push(`iterationId must be ${iteration.id}`);
  if (!isSafeRepositoryPath(String(value.caseId)) || !knownCaseIds.has(String(value.caseId))) {
    issues.push("caseId is unsafe or absent from the manifest");
  }
  if (value.variant !== variant) issues.push(`variant must be ${variant}`);
  if (!isRecord(value.binding) || !hasCompleteBinding(value.binding as unknown as CandidateBinding)) {
    issues.push("binding is missing or incomplete");
  } else if (variant === "production" && value.binding.deploymentStatus !== "deployed_baseline") {
    issues.push("production artifact must bind the deployed baseline");
  } else if (variant === "candidate" && value.binding.deploymentStatus !== "not_deployed") {
    issues.push("candidate artifact may not claim baseline deployment");
  }
  const hasRuntimeClosure = isRecord(value.binding)
    && value.binding.runtimeClosure !== undefined
    && value.binding.runtimeClosure !== null;
  const hasDependencyClosure = isRecord(value.binding)
    && value.binding.dependencyClosure !== undefined
    && value.binding.dependencyClosure !== null;
  if (!isRecord(value.generation)) {
    issues.push("generation receipt is missing");
  } else {
    if (!isFullGitSha(value.generation.sourceCommit)) issues.push("generation.sourceCommit must be a full Git SHA");
    if (!receiptComplete(value.generation.sanitizedOutput)) issues.push("generation.sanitizedOutput receipt is invalid");
    if (!isNonEmptyString(value.generation.runId)) issues.push("generation.runId is required");
    if (!isSafeFixtureId(value.generation.fixtureId)) issues.push("generation.fixtureId is unsafe");
    if (!isIsoTimestamp(value.generation.generatedAt)) issues.push("generation.generatedAt must be an ISO timestamp");
    if (!isNonEmptyString(value.generation.model)) issues.push("generation.model is required");
    if (!isSha256(value.generation.canonicalPromptSha256)) issues.push("generation.canonicalPromptSha256 is required");
    if (!isSha256(value.generation.reportSha256)) issues.push("generation.reportSha256 is required");
  }
  const expectedMode = variant === "candidate"
    ? "candidate_commit_finalized"
    : "historical_raw_unfinalized";
  if (value.captureContract !== GAUNTLET_CAPTURE_CONTRACT) {
    issues.push(`captureContract must be ${GAUNTLET_CAPTURE_CONTRACT}`);
  }
  if (value.reportMode !== expectedMode) issues.push(`${variant} reportMode must be ${expectedMode}`);
  if (!finalizationReceiptValid(value.finalization)) {
    issues.push("finalization receipt is missing or invalid");
  } else if (variant === "candidate" && value.finalization.status !== "finalized") {
    issues.push("candidate report must be finalized before capture");
  } else if (variant === "production" && value.finalization.status !== "unfinalized_raw") {
    issues.push("production historical baseline must remain raw");
  }
  if (variant === "candidate" && !hasRuntimeClosure) {
    issues.push("finalized candidate capture requires a complete runtime closure");
  }
  if (variant === "production" && hasRuntimeClosure) {
    issues.push("historical raw production capture may not claim the candidate runtime closure");
  }
  if (!hasDependencyClosure) issues.push(`${variant} finalized-v1 capture requires a dependency closure`);
  if (!isRecord(value.fixture) || !hasExactKeys(value.fixture, ["sha256"]) || !isSha256(value.fixture.sha256)) {
    issues.push("fixture receipt is missing or invalid");
  }
  if (!isSha256(value.reportSha256)) issues.push("reportSha256 must be a SHA-256");
  if (!isRecord(value.report)) issues.push("report must be an object");
  if (!isRecord(value.presentation)) issues.push("presentation receipt is missing");
  else {
    if (value.presentation.kind !== "rendered_report") issues.push("presentation.kind must be rendered_report");
    if (!isFullGitSha(value.presentation.rendererCommit)) issues.push("presentation.rendererCommit must be a full Git SHA");
    if (!receiptComplete(value.presentation.renderer)) issues.push("presentation.renderer receipt is invalid");
    if (!isIsoTimestamp(value.presentation.capturedAt)) issues.push("presentation.capturedAt must be an ISO timestamp");
    if (!isNonEmptyString(value.presentation.route)
      || !value.presentation.route.startsWith("/")
      || value.presentation.route.startsWith("//")) issues.push("presentation.route must be an application path");
    if (!isRecord(value.presentation.viewport)
      || !Number.isInteger(value.presentation.viewport.width)
      || !Number.isInteger(value.presentation.viewport.height)
      || Number(value.presentation.viewport.width) < 320
      || Number(value.presentation.viewport.height) < 480) {
      issues.push("presentation.viewport must contain a usable integer width and height");
    }
    if (!isNonEmptyString(value.presentation.visibleText) || value.presentation.visibleText.length < 200) {
      issues.push("presentation.visibleText must contain the user-visible report");
    }
    if (!isSha256(value.presentation.visibleTextSha256)) issues.push("presentation.visibleTextSha256 is required");
    if (!isRecord(value.presentation.screenshot)
      || !isSafeRepositoryPath(value.presentation.screenshot.path)
      || !isSha256(value.presentation.screenshot.sha256)) {
      issues.push("presentation screenshot path and SHA-256 are required");
    }
    issues.push(...captureRuntimeReceiptIssues({
      value: value.presentation.captureReceipt,
      variant,
      caseId: value.caseId,
      bindingCommit: isRecord(value.binding) ? value.binding.commit : null,
      reportSha256: value.reportSha256,
    }));
  }
  return issues;
}

async function validateSanitizedGenerationSource(
  repositoryRoot: string,
  artifact: GauntletOutputArtifact,
  testCase: GauntletCase,
  manifest: GauntletManifest,
  iteration: GauntletIteration,
) {
  const issues: string[] = [];
  const generation = artifact.generation;
  if (!/^web\/gauntlet\/sources\/[a-z0-9][a-z0-9-]*\.json$/.test(generation.sanitizedOutput.path)) {
    return ["sanitized generation source must be a committed web/gauntlet/sources JSON artifact"];
  }
  try {
    await resolveRealCommit(repositoryRoot, generation.sourceCommit);
    const sourceBlob = await readGitBlob(
      repositoryRoot,
      generation.sourceCommit,
      generation.sanitizedOutput.path,
    );
    if (sha256(sourceBlob) !== generation.sanitizedOutput.sha256) {
      return ["sanitized generation source receipt does not match the committed blob"];
    }
    const source = JSON.parse(sourceBlob.toString("utf8")) as unknown;
    if (!isRecord(source)
      || !hasExactKeys(source, ["schemaVersion", "kind", "sourceRun", "selection", "results"])
      || source.schemaVersion !== "1"
      || source.kind !== "historical-live-eval-synthetic-subset"
      || !isRecord(source.sourceRun)
      || !isRecord(source.selection)
      || !Array.isArray(source.results)) {
      return ["sanitized generation source has an invalid or over-broad envelope"];
    }
    const sourceRun = source.sourceRun;
    const selection = source.selection;
    if (!hasExactKeys(sourceRun, [
      "fullRunSha256",
      "runId",
      "generatedAt",
      "executionMode",
      "model",
      "reasoningEffort",
      "promptVersion",
      "canonicalPromptSha256",
      "contractVersion",
      "runnerReceipt",
    ])
      || !isSha256(sourceRun.fullRunSha256)
      || sourceRun.executionMode !== "live"
      || !isNonEmptyString(sourceRun.reasoningEffort)
      || !isNonEmptyString(sourceRun.promptVersion)
      || sourceRun.contractVersion !== "v2"
      || !isRecord(sourceRun.runnerReceipt)
      || !hasExactKeys(sourceRun.runnerReceipt, ["path", "sha256", "runnerCommit", "issuedAt"])
      || sourceRun.runnerReceipt.path !== `web/gauntlet/runner-receipts/${iteration.id}.json`
      || !isSha256(sourceRun.runnerReceipt.sha256)
      || !isFullGitSha(sourceRun.runnerReceipt.runnerCommit)
      || sourceRun.runnerReceipt.runnerCommit !== iteration.candidate.commit
      || !isIsoTimestamp(sourceRun.runnerReceipt.issuedAt)) {
      issues.push("sanitized generation source metadata is incomplete");
    } else {
      const runnerReceiptBlob = await readGitBlob(
        repositoryRoot,
        generation.sourceCommit,
        sourceRun.runnerReceipt.path,
      );
      if (sha256(runnerReceiptBlob) !== sourceRun.runnerReceipt.sha256) {
        issues.push("runner attestation receipt does not match its committed blob");
      } else {
        const attestation = parseCommittedRunnerAttestation(
          runnerReceiptBlob,
          String(sourceRun.fullRunSha256),
          manifest.target.caseCount,
        ).receipt;
        if (attestation.runId !== sourceRun.runId
          || attestation.generatedAt !== sourceRun.generatedAt
          || attestation.model !== sourceRun.model
          || attestation.canonicalPromptSha256 !== sourceRun.canonicalPromptSha256
          || attestation.runnerCommit !== sourceRun.runnerReceipt.runnerCommit
          || attestation.issuedAt !== sourceRun.runnerReceipt.issuedAt) {
          issues.push("sanitized source metadata does not match the runner attestation");
        }
      }
    }
    if (!hasExactKeys(selection, ["caseCount", "provenance", "excludedResultCount"])
      || selection.caseCount !== manifest.target.caseCount
      || selection.provenance !== "synthetic-only"
      || !Number.isInteger(selection.excludedResultCount)
      || Number(selection.excludedResultCount) < 0) {
      issues.push("sanitized generation selection is not the exact synthetic-only corpus");
    }
    const expectedCases = new Map(manifest.cases.map((entry) => [entry.id, entry.fixtureId]));
    const seen = new Set<string>();
    let selectedReport: unknown;
    for (const result of source.results) {
      if (!isRecord(result)
        || !hasExactKeys(result, ["caseId", "fixtureId", "status", "report"])
        || !isSafeRepositoryPath(String(result.caseId))
        || !isSafeFixtureId(result.fixtureId)
        || result.status !== "PASS"
        || !isRecord(result.report)
        || expectedCases.get(String(result.caseId)) !== result.fixtureId
        || seen.has(String(result.caseId))) {
        issues.push("sanitized generation results contain an invalid, duplicate, private, or unknown entry");
        continue;
      }
      seen.add(String(result.caseId));
      if (result.caseId === testCase.id) selectedReport = result.report;
    }
    if (source.results.length !== manifest.target.caseCount
      || seen.size !== manifest.target.caseCount
      || [...expectedCases.keys()].some((caseId) => !seen.has(caseId))) {
      issues.push("sanitized generation result set does not exactly match the 12-case manifest");
    }
    if (sourceRun.runId !== generation.runId
      || sourceRun.generatedAt !== generation.generatedAt
      || sourceRun.model !== generation.model
      || sourceRun.canonicalPromptSha256 !== generation.canonicalPromptSha256) {
      issues.push("generation receipt does not match sanitized source-run metadata");
    }
    if (generation.fixtureId !== testCase.fixtureId) issues.push("generation fixtureId does not match the manifest case");
    if (generation.model !== artifact.binding.model) issues.push("generation model does not match the iteration binding");
    const selectedRawReportSha256 = selectedReport === undefined ? null : canonicalJsonSha256(selectedReport);
    const effectiveReportSha256 = canonicalJsonSha256(artifact.report);
    if (selectedRawReportSha256 === null
      || generation.reportSha256 !== selectedRawReportSha256
      || artifact.finalization.rawReportSha256 !== selectedRawReportSha256
      || artifact.finalization.effectiveReportSha256 !== artifact.reportSha256
      || effectiveReportSha256 !== artifact.reportSha256) {
      issues.push("raw or effective report receipt does not match the finalized output artifact");
    }
    const prompt = await readGitBlob(
      repositoryRoot,
      artifact.binding.commit!,
      artifact.binding.resumePrompt!.path,
    );
    if (sha256(prompt.toString("utf8").trim()) !== generation.canonicalPromptSha256) {
      issues.push("canonical trimmed prompt receipt does not match the bound prompt");
    }
  } catch (error) {
    issues.push(`sanitized generation source is not inspectable: ${(error as Error).message}`);
  }
  return issues;
}

async function validateOutputReceipts(
  repositoryRoot: string,
  artifactRoot: string,
  artifact: GauntletOutputArtifact,
  testCase: GauntletCase,
  variant: Variant,
  iteration: GauntletIteration,
  manifest: GauntletManifest,
) {
  const issues: string[] = [];
  const expectedFixturePath = `tests/resumes/${testCase.resumePath}`;
  issues.push(...generationEvidenceIssues(artifact, iteration));
  issues.push(...await generationSourceLineageIssues(repositoryRoot, artifact, iteration));
  if (artifact.reportSha256 !== canonicalJsonSha256(artifact.report)) issues.push("report receipt does not match report JSON");
  if (artifact.presentation.visibleTextSha256 !== sha256(artifact.presentation.visibleText)) {
    issues.push("visible-text receipt does not match the presentation");
  }
  if (artifact.presentation.rendererCommit !== artifact.binding.commit) {
    issues.push("presentation renderer commit does not match the output binding");
  }
  if (!receiptMatches(artifact.presentation.renderer, artifact.binding.renderer)) {
    issues.push("presentation renderer receipt does not match the output binding");
  }
  if (!timestampInsideIteration(artifact.presentation.capturedAt, iteration)) {
    issues.push("presentation capture falls outside the iteration window");
  }
  if (artifact.finalization.rawReportSha256 !== artifact.generation.reportSha256) {
    issues.push("finalization raw-report receipt does not match immutable generation evidence");
  }
  if (artifact.finalization.effectiveReportSha256 !== artifact.reportSha256) {
    issues.push("finalization effective-report receipt does not match the captured artifact");
  }
  if (artifact.finalization.status === "unfinalized_raw") {
    if (variant !== "production" || artifact.reportSha256 !== artifact.generation.reportSha256) {
      issues.push("only the production baseline may retain an unfinalized raw report");
    }
  } else {
    const validator = artifact.finalization.validator;
    if (variant !== "candidate"
      || validator.commit !== artifact.binding.commit
      || validator.path !== GAUNTLET_VALIDATOR_PATH) {
      issues.push("candidate finalizer is not bound to the candidate validator commit");
    }
    const closureValidator = artifact.binding.runtimeClosure?.files
      .find((receipt) => receipt.path === GAUNTLET_VALIDATOR_PATH);
    if (!artifact.binding.runtimeClosure || !closureValidator || closureValidator.sha256 !== validator.sha256) {
      issues.push("candidate finalizer validator is absent from the runtime closure");
    }
    try {
      const [validatorBlob, validatorEntries] = await Promise.all([
        readGitBlob(repositoryRoot, validator.commit, validator.path),
        listGitTree(repositoryRoot, validator.commit, validator.path),
      ]);
      if (sha256(validatorBlob) !== validator.sha256) {
        issues.push("candidate finalizer validator hash does not match its commit");
      }
      if (validatorEntries.length !== 1
        || validatorEntries[0].path !== validator.path
        || validatorEntries[0].type !== "blob"
        || validatorEntries[0].objectId !== validator.gitBlobOid) {
        issues.push("candidate finalizer validator Git blob receipt is stale");
      }
    } catch (error) {
      issues.push(`candidate finalizer validator is not inspectable: ${(error as Error).message}`);
    }
  }
  try {
    const fixture = await readGitBlob(repositoryRoot, artifact.generation.sourceCommit, expectedFixturePath);
    if (sha256(fixture) !== artifact.fixture.sha256) issues.push("fixture receipt does not match the bound commit");
  } catch (error) {
    issues.push(`fixture receipt is not inspectable at the bound commit: ${(error as Error).message}`);
  }
  issues.push(...await validateSanitizedGenerationSource(
    repositoryRoot,
    artifact,
    testCase,
    manifest,
    iteration,
  ));
  const expectedScreenshotPrefix = `presentations/${variant}/${testCase.id}.`;
  if (!artifact.presentation.screenshot.path.startsWith(expectedScreenshotPrefix)) {
    issues.push("presentation screenshot path does not match its case and variant");
    return issues;
  }
  try {
    const screenshotPath = await resolveContainedExistingPath(artifactRoot, artifact.presentation.screenshot.path);
    if (sha256(await readFile(screenshotPath)) !== artifact.presentation.screenshot.sha256) {
      issues.push("presentation screenshot hash does not match");
    }
  } catch (error) {
    issues.push(`presentation screenshot is not safely inspectable: ${(error as Error).message}`);
  }
  return issues;
}

export async function loadOutputArtifacts(
  repositoryRoot: string,
  artifactRoot: string,
  variant: Variant,
  iteration: GauntletIteration,
  manifest: GauntletManifest,
  issues: string[],
) {
  const output = new Map<string, LoadedArtifact>();
  const caseById = new Map(manifest.cases.map((testCase) => [testCase.id, testCase]));
  const records = await readJsonDirectory<GauntletOutputArtifact>(artifactRoot, `outputs/${variant}`, issues);
  for (const record of records) {
    const artifactSha256 = sha256(record.raw);
    const artifactIssues = validateOutputEnvelope(record.value, variant, iteration, new Set(caseById.keys()));
    if (artifactIssues.length > 0) {
      issues.push(...artifactIssues.map((issue) => `${path.basename(record.filePath)}: ${issue}`));
      continue;
    }
    const artifact = record.value;
    const testCase = caseById.get(artifact.caseId)!;
    if (path.basename(record.filePath) !== `${artifact.caseId}.json`) {
      issues.push(`${path.basename(record.filePath)}: filename does not match caseId`);
      continue;
    }
    if (output.has(artifact.caseId)) {
      issues.push(`duplicate ${variant} artifact for ${artifact.caseId}`);
      continue;
    }
    if (!bindingsMatch(iteration[variant], artifact.binding)) {
      issues.push(`${variant} artifact ${artifact.caseId} does not match the iteration binding`);
      continue;
    }
    const receiptIssues = await validateOutputReceipts(
      repositoryRoot,
      artifactRoot,
      artifact,
      testCase,
      variant,
      iteration,
      manifest,
    );
    if (receiptIssues.length > 0) {
      issues.push(...receiptIssues.map((issue) => `${path.basename(record.filePath)}: ${issue}`));
      continue;
    }
    output.set(artifact.caseId, { artifact, sha256: artifactSha256 });
  }
  return output;
}

export function blindArtifactBinding(loaded: LoadedArtifact): BlindArtifactBinding {
  const artifact = loaded.artifact;
  return {
    artifactSha256: loaded.sha256,
    reportSha256: artifact.reportSha256,
    fixtureSha256: artifact.fixture.sha256,
    generationSourceSha256: artifact.generation.sanitizedOutput.sha256,
    canonicalPromptSha256: artifact.generation.canonicalPromptSha256,
    promptSha256: artifact.binding.resumePrompt!.sha256,
    rendererSha256: artifact.binding.renderer!.sha256,
    visibleTextSha256: artifact.presentation.visibleTextSha256,
    screenshotSha256: artifact.presentation.screenshot.sha256,
    finalizationSha256: canonicalJsonSha256(artifact.finalization),
  };
}
