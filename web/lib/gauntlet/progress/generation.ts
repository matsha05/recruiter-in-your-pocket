import {
  canonicalJsonSha256,
  gitDiffPaths,
  isAncestorCommit,
  isFullGitSha,
} from "../integrity";
import type {
  GauntletIteration,
  GauntletOutputArtifact,
} from "../types";

const SOURCE_CAPTURE_FRESHNESS_MS = 48 * 60 * 60 * 1000;

export function generationRunIdentity(artifact: GauntletOutputArtifact) {
  return canonicalJsonSha256({
    sourceCommit: artifact.generation.sourceCommit,
    sanitizedOutput: artifact.generation.sanitizedOutput,
    runId: artifact.generation.runId,
    generatedAt: artifact.generation.generatedAt,
    model: artifact.generation.model,
    canonicalPromptSha256: artifact.generation.canonicalPromptSha256,
  });
}

export function generationRunSetIssues(artifacts: Iterable<GauntletOutputArtifact>) {
  const identities = new Set([...artifacts].map(generationRunIdentity));
  return identities.size > 1
    ? ["all output pairs must share one immutable generation run"]
    : [];
}

export function iterationEvidencePathAllowed(
  repositoryPath: string,
  iterationId: string,
) {
  return repositoryPath === `web/gauntlet/iterations/${iterationId}.json`
    || repositoryPath === `web/gauntlet/sources/${iterationId}.json`
    || repositoryPath === `web/gauntlet/runner-receipts/${iterationId}.json`
    || repositoryPath.startsWith(`web/gauntlet/artifacts/${iterationId}/`);
}

export function generationEvidenceIssues(
  artifact: GauntletOutputArtifact,
  iteration: GauntletIteration,
) {
  const issues: string[] = [];
  const expectedSourcePath = `web/gauntlet/sources/${iteration.id}.json`;
  if (artifact.generation.sanitizedOutput.path !== expectedSourcePath) {
    issues.push(`sanitized generation source must be ${expectedSourcePath}`);
  }
  const iterationStartedAt = Date.parse(iteration.createdAt);
  const generatedAt = Date.parse(artifact.generation.generatedAt);
  const capturedAt = Date.parse(artifact.presentation.capturedAt);
  if (!Number.isFinite(iterationStartedAt)
    || !Number.isFinite(generatedAt)
    || generatedAt < iterationStartedAt) {
    issues.push("generation source predates the active iteration");
  }
  if (!Number.isFinite(capturedAt)
    || !Number.isFinite(generatedAt)
    || capturedAt < generatedAt
    || capturedAt - generatedAt > SOURCE_CAPTURE_FRESHNESS_MS) {
    issues.push("presentation must be captured within 48 hours after source generation");
  }
  return issues;
}

export async function generationSourceLineageIssues(
  repositoryRoot: string,
  artifact: GauntletOutputArtifact,
  iteration: GauntletIteration,
) {
  if (!isFullGitSha(iteration.candidate.commit)) {
    return ["iteration candidate commit is unavailable for generation-source ancestry verification"];
  }
  try {
    if (!await isAncestorCommit(
      repositoryRoot,
      iteration.candidate.commit,
      artifact.generation.sourceCommit,
    )) {
      return ["generation source commit does not descend from the bound candidate commit"];
    }
    const changedPaths = await gitDiffPaths(
      repositoryRoot,
      iteration.candidate.commit,
      artifact.generation.sourceCommit,
    );
    const unauthorized = changedPaths.filter(
      (repositoryPath) => !iterationEvidencePathAllowed(repositoryPath, iteration.id),
    );
    return unauthorized.length === 0
      ? []
      : [`generation source history changes non-evidence paths: ${unauthorized.join(", ")}`];
  } catch (error) {
    return [`generation-source ancestry is not inspectable: ${(error as Error).message}`];
  }
}
