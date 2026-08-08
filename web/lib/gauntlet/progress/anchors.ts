import { existsSync } from "node:fs";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  artifactFileReceipts,
  canonicalJsonSha256,
  gitCommitParents,
  gitDiffPaths,
  gitFileIntroductionCommits,
  gitHead,
  isAncestorCommit,
  isFullGitSha,
  isSafeRepositoryPath,
  listGitTree,
  readGitBlob,
  readGitObjects,
  resolveContainedExistingPath,
  resolveRealCommit,
  sha256,
} from "../integrity";
import type { GauntletAnchor, GauntletIteration } from "../types";
import {
  hasExactKeys,
  isRecord,
  isSha256,
  resolveArtifactRoot,
  resolveContainedRegularDirectory,
  resolveWebRoot,
} from "./common";
import { validateGauntletDefinition } from "./definition";
import { iterationEvidencePathAllowed } from "./generation";

export type GitAnchorValidation = {
  valid: boolean;
  anchorCommit: string | null;
  evidenceCommit: string | null;
  issues: string[];
};

function repositoryPathForAbsolute(repositoryRoot: string, absolutePath: string) {
  const relative = path.relative(repositoryRoot, absolutePath).split(path.sep).join("/");
  if (!isSafeRepositoryPath(relative)) throw new Error(`path is outside the repository: ${absolutePath}`);
  return relative;
}

function anchoredReceiptValid(value: unknown) {
  return isRecord(value)
    && hasExactKeys(value, ["path", "sha256", "gitBlobOid"])
    && isSafeRepositoryPath(value.path)
    && isSha256(value.sha256)
    && typeof value.gitBlobOid === "string"
    && /^[a-f0-9]{40,64}$/.test(value.gitBlobOid);
}

async function evidenceCommitReceipts(input: {
  repositoryRoot: string;
  artifactRoot: string;
  ledgerPath: string;
  evidenceCommit: string;
}) {
  const artifactRepositoryRoot = repositoryPathForAbsolute(input.repositoryRoot, input.artifactRoot);
  const ledgerRepositoryPath = repositoryPathForAbsolute(input.repositoryRoot, input.ledgerPath);
  const [currentArtifacts, artifactEntries, ledgerEntries] = await Promise.all([
    artifactFileReceipts(input.artifactRoot),
    listGitTree(input.repositoryRoot, input.evidenceCommit, artifactRepositoryRoot),
    listGitTree(input.repositoryRoot, input.evidenceCommit, ledgerRepositoryPath),
  ]);
  if (ledgerEntries.length !== 1 || ledgerEntries[0].path !== ledgerRepositoryPath) {
    throw new Error("evidence commit does not contain the exact iteration ledger");
  }
  const regularEntries = [...ledgerEntries, ...artifactEntries];
  if (regularEntries.some((entry) => entry.type !== "blob"
    || !["100644", "100755"].includes(entry.mode))) {
    throw new Error("evidence commit contains a symlink, submodule, or non-regular evidence entry");
  }
  const artifactEntryByPath = new Map(artifactEntries.map((entry) => [entry.path, entry]));
  const currentRepositoryReceipts = currentArtifacts.map((receipt) => ({
    path: `${artifactRepositoryRoot}/${receipt.path}`,
    sha256: receipt.sha256,
  }));
  if (artifactEntries.length !== currentRepositoryReceipts.length
    || currentRepositoryReceipts.some((receipt) => !artifactEntryByPath.has(receipt.path))) {
    throw new Error("current artifact file set does not exactly match the evidence commit tree");
  }
  const objects = await readGitObjects(
    input.repositoryRoot,
    regularEntries.map((entry) => entry.objectId),
  );
  const artifacts = currentRepositoryReceipts.map((receipt) => {
    const entry = artifactEntryByPath.get(receipt.path)!;
    const blob = objects.get(entry.objectId);
    if (!blob || sha256(blob) !== receipt.sha256) {
      throw new Error(`${receipt.path} differs from its evidence-commit blob`);
    }
    return { ...receipt, gitBlobOid: entry.objectId };
  }).sort((left, right) => left.path.localeCompare(right.path));
  const ledgerEntry = ledgerEntries[0];
  const ledgerRaw = await readFile(input.ledgerPath);
  const ledgerBlob = objects.get(ledgerEntry.objectId);
  if (!ledgerBlob || !ledgerRaw.equals(ledgerBlob)) {
    throw new Error("current iteration ledger differs from its evidence-commit blob");
  }
  return {
    artifactRepositoryRoot,
    ledger: {
      path: ledgerRepositoryPath,
      sha256: sha256(ledgerRaw),
      gitBlobOid: ledgerEntry.objectId,
    },
    artifacts,
  };
}

export async function buildGauntletAnchorRecord(
  explicitWebRoot?: string,
  requestedIterationId?: string,
  evidenceCommitOverride?: string,
) {
  const definition = await validateGauntletDefinition(explicitWebRoot, requestedIterationId);
  const { repositoryRoot, webRoot, iteration } = definition;
  if (definition.issues.length > 0) {
    throw new Error(`Gauntlet definition is invalid:\n- ${definition.issues.join("\n- ")}`);
  }
  if (iteration.status !== "complete" || !iteration.seal) {
    throw new Error("Only a complete sealed iteration can receive a Git anchor");
  }
  const evidenceCommit = evidenceCommitOverride ?? await gitHead(repositoryRoot);
  await resolveRealCommit(repositoryRoot, evidenceCommit);
  const artifactRoot = await resolveArtifactRoot(webRoot, iteration.id, []);
  const ledgerPath = await resolveContainedExistingPath(
    webRoot,
    `gauntlet/iterations/${iteration.id}.json`,
  );
  const receipts = await evidenceCommitReceipts({
    repositoryRoot,
    artifactRoot,
    ledgerPath,
    evidenceCommit,
  });
  const relativeArtifacts = receipts.artifacts.map((receipt) => ({
    path: receipt.path.slice(receipts.artifactRepositoryRoot.length + 1),
    sha256: receipt.sha256,
  }));
  const artifactSetSha256 = canonicalJsonSha256(relativeArtifacts);
  if (artifactSetSha256 !== iteration.seal.artifactSetSha256) {
    throw new Error("evidence commit artifact tree does not match the iteration seal");
  }
  return {
    schemaVersion: "1",
    iterationId: iteration.id,
    evidenceCommit,
    ledger: receipts.ledger,
    artifactSetSha256,
    artifacts: receipts.artifacts,
  } satisfies GauntletAnchor;
}

export async function writeGauntletAnchor(
  explicitWebRoot?: string,
  requestedIterationId?: string,
) {
  const record = await buildGauntletAnchorRecord(explicitWebRoot, requestedIterationId);
  const webRoot = resolveWebRoot(explicitWebRoot);
  const anchorsPath = path.join(webRoot, "gauntlet/anchors");
  if (!existsSync(anchorsPath)) await mkdir(anchorsPath);
  const anchorsRoot = await resolveContainedRegularDirectory(webRoot, "gauntlet/anchors", "gauntlet/anchors");
  const outputPath = path.join(anchorsRoot, `${record.iterationId}.json`);
  await writeFile(outputPath, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });
  return { record, outputPath };
}

export async function validateGitAnchor(input: {
  repositoryRoot: string;
  webRoot: string;
  iteration: GauntletIteration;
  ledgerSha256: string;
  artifactRoot: string;
}): Promise<GitAnchorValidation> {
  const issues: string[] = [];
  let anchorCommit: string | null = null;
  let evidenceCommit: string | null = null;
  try {
    const anchorsRoot = await resolveContainedRegularDirectory(
      input.webRoot,
      "gauntlet/anchors",
      "gauntlet/anchors",
    );
    const anchorPath = path.join(anchorsRoot, `${input.iteration.id}.json`);
    const anchorStats = await lstat(anchorPath);
    if (anchorStats.isSymbolicLink() || !anchorStats.isFile()) {
      throw new Error("anchor must be a regular file");
    }
    const anchorRaw = await readFile(anchorPath, "utf8");
    const anchor = JSON.parse(anchorRaw) as GauntletAnchor;
    if (!isRecord(anchor)
      || !hasExactKeys(anchor, [
        "schemaVersion",
        "iterationId",
        "evidenceCommit",
        "ledger",
        "artifactSetSha256",
        "artifacts",
      ])
      || anchor.schemaVersion !== "1"
      || anchor.iterationId !== input.iteration.id
      || !isFullGitSha(anchor.evidenceCommit)
      || !anchoredReceiptValid(anchor.ledger)
      || !isSha256(anchor.artifactSetSha256)
      || !Array.isArray(anchor.artifacts)
      || anchor.artifacts.length === 0
      || !anchor.artifacts.every(anchoredReceiptValid)) {
      throw new Error("anchor record shape is invalid");
    }
    evidenceCommit = anchor.evidenceCommit;
    if (!isFullGitSha(input.iteration.candidate.commit)
      || !await isAncestorCommit(
        input.repositoryRoot,
        input.iteration.candidate.commit,
        anchor.evidenceCommit,
      )) {
      throw new Error("evidence commit does not descend from the bound candidate commit");
    }
    const evidenceChangedPaths = await gitDiffPaths(
      input.repositoryRoot,
      input.iteration.candidate.commit,
      anchor.evidenceCommit,
    );
    const unauthorizedEvidencePaths = evidenceChangedPaths.filter(
      (repositoryPath) => !iterationEvidencePathAllowed(repositoryPath, input.iteration.id),
    );
    if (unauthorizedEvidencePaths.length > 0) {
      throw new Error(`evidence history changes non-evidence paths: ${unauthorizedEvidencePaths.join(", ")}`);
    }
    const anchorRepositoryPath = repositoryPathForAbsolute(input.repositoryRoot, anchorPath);
    const introductions = await gitFileIntroductionCommits(input.repositoryRoot, anchorRepositoryPath);
    if (introductions.length !== 1) {
      throw new Error("anchor must have exactly one immutable Git introduction commit");
    }
    [anchorCommit] = introductions;
    const introducedAnchor = await readGitBlob(
      input.repositoryRoot,
      anchorCommit,
      anchorRepositoryPath,
    );
    if (sha256(introducedAnchor) !== sha256(anchorRaw)) {
      throw new Error("current anchor differs from its immutable introduction blob");
    }
    const parents = await gitCommitParents(input.repositoryRoot, anchorCommit);
    if (parents.length !== 1 || parents[0] !== anchor.evidenceCommit) {
      throw new Error("anchor introduction commit must directly follow its named evidence commit");
    }
    const [changedPaths, addedPaths, anchorEntries] = await Promise.all([
      gitDiffPaths(input.repositoryRoot, anchor.evidenceCommit, anchorCommit),
      gitDiffPaths(input.repositoryRoot, anchor.evidenceCommit, anchorCommit, "A"),
      listGitTree(input.repositoryRoot, anchorCommit, anchorRepositoryPath),
    ]);
    if (changedPaths.length !== 1
      || changedPaths[0] !== anchorRepositoryPath
      || addedPaths.length !== 1
      || addedPaths[0] !== anchorRepositoryPath
      || anchorEntries.length !== 1
      || anchorEntries[0].path !== anchorRepositoryPath
      || anchorEntries[0].type !== "blob"
      || !["100644", "100755"].includes(anchorEntries[0].mode)) {
      throw new Error(`anchor introduction commit must add only ${anchorRepositoryPath} as a regular file`);
    }
    if (!await isAncestorCommit(input.repositoryRoot, anchorCommit, await gitHead(input.repositoryRoot))) {
      throw new Error("anchor introduction commit is not in the current Git history");
    }
    const ledgerPath = await resolveContainedExistingPath(
      input.webRoot,
      `gauntlet/iterations/${input.iteration.id}.json`,
    );
    const receipts = await evidenceCommitReceipts({
      repositoryRoot: input.repositoryRoot,
      artifactRoot: input.artifactRoot,
      ledgerPath,
      evidenceCommit: anchor.evidenceCommit,
    });
    if (anchor.ledger.path !== receipts.ledger.path
      || anchor.ledger.sha256 !== receipts.ledger.sha256
      || anchor.ledger.gitBlobOid !== receipts.ledger.gitBlobOid
      || anchor.ledger.sha256 !== input.ledgerSha256) {
      throw new Error("ledger does not match its Git anchor receipt");
    }
    const anchorArtifactPaths = anchor.artifacts.map((receipt) => receipt.path);
    if (new Set(anchorArtifactPaths).size !== anchorArtifactPaths.length
      || anchorArtifactPaths.some((entry, index) => index > 0
        && anchorArtifactPaths[index - 1].localeCompare(entry) >= 0)
      || canonicalJsonSha256(anchor.artifacts) !== canonicalJsonSha256(receipts.artifacts)) {
      throw new Error("artifact receipts are unsorted, duplicated, missing, extra, or stale");
    }
    const artifactPrefix = `${receipts.artifactRepositoryRoot}/`;
    if (anchor.artifacts.some((receipt) => !receipt.path.startsWith(artifactPrefix))) {
      throw new Error("anchor contains an artifact outside the selected iteration root");
    }
    const relativeArtifacts = anchor.artifacts.map((receipt) => ({
      path: receipt.path.slice(artifactPrefix.length),
      sha256: receipt.sha256,
    }));
    const artifactSetSha256 = canonicalJsonSha256(relativeArtifacts);
    if (artifactSetSha256 !== anchor.artifactSetSha256
      || artifactSetSha256 !== input.iteration.seal?.artifactSetSha256) {
      throw new Error("Git-anchored artifact tree does not match the iteration seal");
    }
  } catch (error) {
    issues.push(`${input.iteration.id}: Git anchor invalid: ${(error as Error).message}`);
  }
  return {
    valid: issues.length === 0,
    anchorCommit,
    evidenceCommit,
    issues,
  };
}
