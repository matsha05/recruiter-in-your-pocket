import { readFile } from "node:fs/promises";
import type { CalibrationData } from "../../evals/types";
import { runAllChecks } from "../../evals/checks";
import { readGitBlob, resolveContainedExistingPath, sha256 } from "../integrity";
import {
  GAUNTLET_AUTOMATED_CHECK_PATHS,
  type GauntletManifest,
  type RuntimeClosureReceipt,
} from "../types";
import {
  SOURCE_INTEGRITY_CODES,
  type AutomatedCheck,
  type LoadedArtifact,
} from "./common";

export async function automatedCheckClosureIssues(
  repositoryRoot: string,
  runtimeClosure: RuntimeClosureReceipt | null | undefined,
) {
  if (!runtimeClosure) return ["candidate runtime closure is unavailable for automated checks"];
  const receipts = new Map(runtimeClosure.files.map((receipt) => [receipt.path, receipt.sha256]));
  const issues: string[] = [];
  for (const repositoryPath of GAUNTLET_AUTOMATED_CHECK_PATHS) {
    const expectedSha256 = receipts.get(repositoryPath);
    if (!expectedSha256) {
      issues.push(`candidate runtime closure omits automated-check input ${repositoryPath}`);
      continue;
    }
    try {
      const currentPath = await resolveContainedExistingPath(repositoryRoot, repositoryPath);
      if (sha256(await readFile(currentPath)) !== expectedSha256) {
        issues.push(`current automated-check input differs from the candidate receipt: ${repositoryPath}`);
      }
    } catch (error) {
      issues.push(`automated-check input is not inspectable: ${repositoryPath}: ${(error as Error).message}`);
    }
  }
  return issues;
}

export async function runAutomatedChecks(
  repositoryRoot: string,
  manifest: GauntletManifest,
  calibration: CalibrationData | null,
  candidateOutputs: Map<string, LoadedArtifact>,
  runtimeClosure: RuntimeClosureReceipt | null | undefined,
  issues: string[],
) {
  const checks = new Map<string, AutomatedCheck>();
  if (!calibration) {
    if (candidateOutputs.size > 0) {
      issues.push("automated checks cannot run because repository calibration data is unavailable on this host");
    }
    return checks;
  }
  if (candidateOutputs.size > 0) {
    const closureIssues = await automatedCheckClosureIssues(repositoryRoot, runtimeClosure);
    if (closureIssues.length > 0) {
      issues.push(...closureIssues);
      return checks;
    }
  }
  const fixtures = new Map(calibration.fixtures.map((fixture) => [fixture.id, fixture]));
  await Promise.all(manifest.cases.map(async (testCase) => {
    const loaded = candidateOutputs.get(testCase.id);
    const fixture = fixtures.get(testCase.fixtureId);
    if (!loaded || !fixture) return;
    try {
      const resume = await readGitBlob(
        repositoryRoot,
        loaded.artifact.generation.sourceCommit,
        `tests/resumes/${testCase.resumePath}`,
      );
      if (sha256(resume) !== loaded.artifact.fixture.sha256) {
        throw new Error("generation-bound fixture receipt is stale");
      }
      const result = runAllChecks({
        output: loaded.artifact.report,
        resumeText: resume.toString("utf8"),
        fixture,
        globalBanned: calibration.global_banned_phrases,
        globalDiscouraged: calibration.global_discouraged_phrases,
        expectedContractVersion: calibration.contract_version,
      });
      checks.set(testCase.id, {
        caseId: testCase.id,
        errors: result.errors,
        sourceIntegrityErrors: result.errors.filter((error) => SOURCE_INTEGRITY_CODES.has(error.code)),
      });
    } catch (error) {
      issues.push(`automated checks failed for ${testCase.id}: ${(error as Error).message}`);
    }
  }));
  return checks;
}
