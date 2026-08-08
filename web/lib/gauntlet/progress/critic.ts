import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import {
  artifactFileReceipts,
  canonicalJsonSha256,
  isFullGitSha,
  resolveContainedExistingPath,
  sha256,
} from "../integrity";
import type {
  CriticVerdictArtifact,
  GauntletIteration,
} from "../types";
import {
  hasExactKeys,
  isIsoTimestamp,
  isNonEmptyString,
  isRecord,
  isSha256,
  timestampInsideIteration,
} from "./common";

const CRITIC_RELATIVE_PATH = "critic/verdict.json";

export async function criticEvidenceSetSha256(artifactRoot: string) {
  const receipts = (await artifactFileReceipts(artifactRoot))
    .filter((receipt) => receipt.path !== CRITIC_RELATIVE_PATH);
  return canonicalJsonSha256(receipts);
}

export async function validateCriticArtifact(
  repositoryRoot: string,
  artifactRoot: string,
  iteration: GauntletIteration,
) {
  if (iteration.critic.verdict === "pending") return { valid: false, issues: [] as string[] };
  const issues: string[] = [];
  try {
    const expectedRepositoryPath = `web/gauntlet/artifacts/${iteration.id}/${CRITIC_RELATIVE_PATH}`;
    if (iteration.critic.artifact?.path !== expectedRepositoryPath) {
      throw new Error(`critic artifact receipt must use ${expectedRepositoryPath}`);
    }
    const criticPath = path.join(artifactRoot, CRITIC_RELATIVE_PATH);
    const [criticReal, stats] = await Promise.all([
      resolveContainedExistingPath(repositoryRoot, expectedRepositoryPath),
      lstat(criticPath),
    ]);
    if (stats.isSymbolicLink() || !stats.isFile() || criticReal !== await resolveContainedExistingPath(artifactRoot, CRITIC_RELATIVE_PATH)) {
      throw new Error("critic verdict must be one regular file inside the active artifact root");
    }
    const raw = await readFile(criticReal);
    if (sha256(raw) !== iteration.critic.artifact.sha256) {
      throw new Error("critic artifact receipt does not match its bytes");
    }
    const value = JSON.parse(raw.toString("utf8")) as unknown;
    if (!isRecord(value)
      || !hasExactKeys(value, [
        "schemaVersion",
        "iterationId",
        "reviewer",
        "reviewerRole",
        "reviewedAt",
        "verdict",
        "candidateCommit",
        "evidenceSetSha256",
        "rationale",
        "remainingGap",
      ])
      || value.schemaVersion !== "1"
      || value.iterationId !== iteration.id
      || !isNonEmptyString(value.reviewer)
      || value.reviewerRole !== "independent_critic"
      || !isIsoTimestamp(value.reviewedAt)
      || !["pass", "fail"].includes(String(value.verdict))
      || !isFullGitSha(value.candidateCommit)
      || !isSha256(value.evidenceSetSha256)
      || !isNonEmptyString(value.rationale)
      || !isNonEmptyString(value.remainingGap)) {
      throw new Error("critic verdict artifact is malformed");
    }
    const artifact = value as unknown as CriticVerdictArtifact;
    if (artifact.reviewer !== iteration.critic.reviewer
      || artifact.reviewedAt !== iteration.critic.reviewedAt
      || artifact.verdict !== iteration.critic.verdict
      || artifact.candidateCommit !== iteration.candidate.commit
      || artifact.rationale !== iteration.critic.rationale
      || artifact.remainingGap !== iteration.critic.remainingGap
      || !timestampInsideIteration(artifact.reviewedAt, iteration)) {
      throw new Error("critic verdict does not match the candidate-bound ledger record");
    }
    if (artifact.evidenceSetSha256 !== await criticEvidenceSetSha256(artifactRoot)) {
      throw new Error("critic verdict is not bound to the exact non-critic evidence set");
    }
  } catch (error) {
    issues.push(`${iteration.id}: critic artifact invalid: ${(error as Error).message}`);
  }
  return { valid: issues.length === 0, issues };
}
