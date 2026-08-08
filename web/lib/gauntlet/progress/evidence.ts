import {
  canonicalJsonSha256,
  hashArtifactTree,
  isAncestorCommit,
} from "../integrity";
import {
  GAUNTLET_CAPTURE_CONTRACT,
  GAUNTLET_FINALIZED_CAPTURE_STATEMENT,
  GAUNTLET_FINALIZER_PATH,
  GAUNTLET_VALIDATOR_PATH,
} from "../types";
import { validateGitAnchor, type GitAnchorValidation } from "./anchors";
import { runAutomatedChecks } from "./automated";
import { resolveArtifactRoot, type LoadedArtifact, type LoadedEvidence } from "./common";
import { validateCriticArtifact } from "./critic";
import { validateGauntletDefinition } from "./definition";
import { generationRunSetIssues } from "./generation";
import {
  loadPreparedArtifactInventory,
  validateExactArtifactInventory,
} from "./inventory";
import { loadOutputArtifacts } from "./outputs";
import {
  loadBlindJudgments,
  loadJourneys,
  loadMapping,
  loadReferenceAssessments,
  loadSourceAudits,
} from "./reviews";

export async function loadEvidence(
  validatedDefinition: Awaited<ReturnType<typeof validateGauntletDefinition>>,
): Promise<LoadedEvidence> {
  const {
    webRoot,
    repositoryRoot,
    repositoryAvailable,
    manifest,
    iteration,
    calibration,
  } = validatedDefinition;
  const dataIssues = [...validatedDefinition.issues];
  const artifactRoot = await resolveArtifactRoot(webRoot, iteration.id, dataIssues);
  let selectedAnchor: GitAnchorValidation | undefined;

  if (repositoryAvailable) {
    const completeLedgers = validatedDefinition.ledgers
      .filter((ledger) => ledger.iteration.status === "complete");
    const anchorResults = await Promise.all(completeLedgers.map(async (ledger) => {
      try {
        const ledgerArtifactRoot = ledger.iteration.id === iteration.id
          ? artifactRoot
          : await resolveArtifactRoot(webRoot, ledger.iteration.id, dataIssues);
        return {
          iterationId: ledger.iteration.id,
          validation: await validateGitAnchor({
            repositoryRoot,
            webRoot,
            iteration: ledger.iteration,
            ledgerSha256: ledger.sha256,
            artifactRoot: ledgerArtifactRoot,
          }),
        };
      } catch (error) {
        return {
          iterationId: ledger.iteration.id,
          validation: {
            valid: false,
            anchorCommit: null,
            evidenceCommit: null,
            issues: [`${ledger.iteration.id}: Git anchor invalid: ${(error as Error).message}`],
          } satisfies GitAnchorValidation,
        };
      }
    }));
    for (const result of anchorResults) dataIssues.push(...result.validation.issues);
    selectedAnchor = anchorResults.find((result) => result.iterationId === iteration.id)?.validation;
  }

  const [candidateOutputs, productionOutputs] = await Promise.all([
    loadOutputArtifacts(repositoryRoot, artifactRoot, "candidate", iteration, manifest, dataIssues),
    loadOutputArtifacts(repositoryRoot, artifactRoot, "production", iteration, manifest, dataIssues),
  ]);
  const generationArtifacts = [
    ...candidateOutputs.values(),
    ...productionOutputs.values(),
  ].map((loaded) => loaded.artifact);
  dataIssues.push(...generationRunSetIssues(generationArtifacts)
    .map((issue) => `${iteration.id}: ${issue}`));
  if (selectedAnchor?.evidenceCommit) {
    const sourceCommits = new Set([
      ...candidateOutputs.values(),
      ...productionOutputs.values(),
    ].map((loaded) => loaded.artifact.generation.sourceCommit));
    for (const sourceCommit of sourceCommits) {
      if (!await isAncestorCommit(repositoryRoot, sourceCommit, selectedAnchor.evidenceCommit)) {
        dataIssues.push(`${iteration.id}: generation source commit is outside the anchored evidence history`);
      }
    }
  }
  if ((candidateOutputs.size > 0 || productionOutputs.size > 0)
    && iteration.baselineStatement !== GAUNTLET_FINALIZED_CAPTURE_STATEMENT) {
    dataIssues.push(
      `${iteration.id}: baselineStatement must equal the exact finalized-v1 raw-source and commit-bound finalization disclosure`,
    );
  }
  if (candidateOutputs.size > 0 || productionOutputs.size > 0) {
    const archiveIdentities = (outputs: Map<string, LoadedArtifact>) => new Map(
      [...outputs.values()].map((loaded) => {
        const identity = loaded.artifact.presentation.captureReceipt.archiveIdentity;
        return [canonicalJsonSha256(identity), identity] as const;
      }),
    );
    const candidateIdentities = archiveIdentities(candidateOutputs);
    const productionIdentities = archiveIdentities(productionOutputs);
    if (candidateOutputs.size !== manifest.target.caseCount || candidateIdentities.size !== 1) {
      dataIssues.push(
        `${iteration.id}: candidate capture set must share exactly one archive identity across all ${manifest.target.caseCount} cases`,
      );
    }
    if (productionOutputs.size !== manifest.target.caseCount || productionIdentities.size !== 1) {
      dataIssues.push(
        `${iteration.id}: production capture set must share exactly one archive identity across all ${manifest.target.caseCount} cases`,
      );
    }
    if (candidateIdentities.size === 1 && productionIdentities.size === 1) {
      const candidateNonce = [...candidateIdentities.values()][0].nonce;
      const productionNonce = [...productionIdentities.values()][0].nonce;
      if (candidateNonce === productionNonce) {
        dataIssues.push(`${iteration.id}: candidate and production archive nonces must differ`);
      }
    }
  }
  for (const testCase of manifest.cases) {
    const candidate = candidateOutputs.get(testCase.id);
    const production = productionOutputs.get(testCase.id);
    if (candidate && production
      && canonicalJsonSha256(candidate.artifact.generation)
        !== canonicalJsonSha256(production.artifact.generation)) {
      dataIssues.push(`${testCase.id}: candidate and production do not share the same immutable generation receipt`);
    }
    if (!candidate || !production) continue;
    const candidateArtifact = candidate.artifact;
    const productionArtifact = production.artifact;
    const candidateDependencies = candidateArtifact.binding.dependencyClosure;
    const productionDependencies = productionArtifact.binding.dependencyClosure;
    if (candidateArtifact.captureContract !== GAUNTLET_CAPTURE_CONTRACT
      || productionArtifact.captureContract !== GAUNTLET_CAPTURE_CONTRACT
      || candidateArtifact.reportMode !== "candidate_commit_finalized"
      || productionArtifact.reportMode !== "historical_raw_unfinalized") {
      dataIssues.push(`${testCase.id}: finalized-v1 report modes are missing or inconsistent`);
    }
    if (!candidateDependencies
      || !productionDependencies
      || canonicalJsonSha256(candidateDependencies) !== canonicalJsonSha256(productionDependencies)
      || candidateDependencies.packageLock.productionCommit !== productionArtifact.binding.commit
      || candidateDependencies.packageLock.candidateCommit !== candidateArtifact.binding.commit) {
      dataIssues.push(`${testCase.id}: production and candidate do not share one commit-bound dependency closure`);
    }
    if (candidateArtifact.binding.commit === productionArtifact.binding.commit
      || candidateArtifact.binding.renderer?.sha256 === productionArtifact.binding.renderer?.sha256) {
      dataIssues.push(`${testCase.id}: finalized-v1 must compare a different candidate commit and renderer`);
    }
    if (!candidateArtifact.binding.runtimeClosure?.files.some(
      (receipt) => receipt.path === GAUNTLET_VALIDATOR_PATH,
    ) || !candidateArtifact.binding.runtimeClosure?.files.some(
      (receipt) => receipt.path === GAUNTLET_FINALIZER_PATH,
    )) {
      dataIssues.push(`${testCase.id}: candidate runtime closure omits its validator or finalizer`);
    }
  }
  const mapping = await loadMapping(
    artifactRoot,
    iteration,
    manifest,
    candidateOutputs,
    productionOutputs,
    dataIssues,
  );
  const prepared = await loadPreparedArtifactInventory({
    artifactRoot,
    iteration,
    manifest,
    mapping,
    candidateOutputs,
    productionOutputs,
    issues: dataIssues,
  });
  const [automatedChecks, blindJudgments, sourceAudits, referenceAssessments, journeys] = await Promise.all([
    runAutomatedChecks(
      repositoryRoot,
      manifest,
      calibration,
      candidateOutputs,
      iteration.candidate.runtimeClosure,
      dataIssues,
    ),
    loadBlindJudgments(artifactRoot, iteration, manifest, mapping, dataIssues),
    loadSourceAudits(artifactRoot, iteration, candidateOutputs, dataIssues),
    loadReferenceAssessments(
      artifactRoot,
      iteration,
      manifest,
      candidateOutputs,
      prepared.referencePacketSha256,
      dataIssues,
    ),
    loadJourneys(artifactRoot, iteration, manifest, dataIssues),
  ]);
  const criticValidation = await validateCriticArtifact(repositoryRoot, artifactRoot, iteration);
  dataIssues.push(...criticValidation.issues);
  await validateExactArtifactInventory({
    artifactRoot,
    iteration,
    prepared,
    evidence: {
      candidateOutputs,
      productionOutputs,
      blindJudgments,
      sourceAudits,
      referenceAssessments,
      journeys,
    },
    criticValid: criticValidation.valid,
    issues: dataIssues,
  });

  let sealValid = false;
  if (iteration.status === "complete" && iteration.seal) {
    try {
      const artifactSetSha256 = await hashArtifactTree(artifactRoot);
      sealValid = artifactSetSha256 === iteration.seal.artifactSetSha256;
      if (!sealValid) dataIssues.push(`${iteration.id}: artifact-set seal is stale; evidence changed after sealing`);
    } catch (error) {
      dataIssues.push(`${iteration.id}: artifact-set seal cannot be verified: ${(error as Error).message}`);
    }
  }
  if (iteration.status === "baseline_pending" && (
    candidateOutputs.size > 0
    || productionOutputs.size > 0
    || blindJudgments.size > 0
    || sourceAudits.size > 0
    || referenceAssessments.size > 0
    || journeys.size > 0
  )) {
    dataIssues.push(`${iteration.id}: pending baseline may not contain evaluation evidence`);
  }
  return {
    candidateOutputs,
    productionOutputs,
    automatedChecks,
    blindJudgments,
    sourceAudits,
    referenceAssessments,
    journeys,
    criticValid: criticValidation.valid,
    sealValid,
    gitAnchorValid: selectedAnchor?.valid ?? false,
    anchorCommit: selectedAnchor?.anchorCommit ?? null,
    evidenceCommit: selectedAnchor?.evidenceCommit ?? null,
    repositoryAvailable,
    dataIssues,
  };
}
