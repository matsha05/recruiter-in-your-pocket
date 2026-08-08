import {
  GAUNTLET_DIMENSIONS,
  type CaseProgress,
  type CaseVariantInspection,
  type DimensionProgress,
  type GauntletCase,
  type GauntletIteration,
  type GauntletManifest,
  type GauntletProgressSnapshot,
  type GateStatus,
  type IterationLedgerSummary,
} from "../types";
import {
  hasCompleteBinding,
  type IterationLedger,
  type LoadedArtifact,
  type LoadedEvidence,
} from "./common";

function statusForCoverage(count: number, total: number, failures = 0): GateStatus {
  if (failures > 0) return "fail";
  return count === total ? "pass" : "pending";
}

function summarizeBlindDimensions(manifest: GauntletManifest, evidence: LoadedEvidence): DimensionProgress[] {
  return GAUNTLET_DIMENSIONS.map((dimension) => {
    let candidateWins = 0;
    let productionWins = 0;
    let ties = 0;
    for (const judgment of evidence.blindJudgments.values()) {
      const preference = judgment.preferences[dimension];
      if (preference === "candidate") candidateWins += 1;
      else if (preference === "production") productionWins += 1;
      else ties += 1;
    }
    const reviewed = candidateWins + productionWins + ties;
    const complete = reviewed === manifest.target.caseCount;
    const rate = complete ? candidateWins / manifest.target.caseCount : null;
    return {
      dimension,
      candidateWins,
      productionWins,
      ties,
      reviewed,
      rate,
      targetWins: manifest.target.minimumPreferredCases,
      status: complete ? candidateWins >= manifest.target.minimumPreferredCases ? "pass" : "fail" : "pending",
    };
  });
}

function summarizeReferenceDimensions(manifest: GauntletManifest, evidence: LoadedEvidence): DimensionProgress[] {
  return GAUNTLET_DIMENSIONS.map((dimension) => {
    let candidateWins = 0;
    let productionWins = 0;
    let ties = 0;
    for (const assessment of evidence.referenceAssessments.values()) {
      const verdict = assessment.dimensions[dimension].verdict;
      if (verdict === "meets_or_beats") candidateWins += 1;
      else if (verdict === "trails") productionWins += 1;
      else ties += 1;
    }
    const reviewed = candidateWins + productionWins + ties;
    const complete = reviewed === manifest.target.caseCount;
    const rate = complete ? candidateWins / manifest.target.caseCount : null;
    return {
      dimension,
      candidateWins,
      productionWins,
      ties,
      reviewed,
      rate,
      targetWins: manifest.target.minimumPreferredCases,
      status: complete ? candidateWins >= manifest.target.minimumPreferredCases ? "pass" : "fail" : "pending",
    };
  });
}

function combineGateStatuses(gates: Array<{ status: GateStatus }>): GateStatus {
  if (gates.some((gate) => gate.status === "fail")) return "fail";
  if (gates.every((gate) => gate.status === "pass")) return "pass";
  return "pending";
}

function iterationSummaries(
  ledgers: IterationLedger[],
  selectedIterationId: string,
  activeIterationId: string,
): IterationLedgerSummary[] {
  return [...ledgers].reverse().map((ledger) => ({
    id: ledger.iteration.id,
    label: ledger.iteration.label,
    createdAt: ledger.iteration.createdAt,
    status: ledger.iteration.status,
    criticVerdict: ledger.iteration.critic.verdict,
    ledgerSha256: ledger.sha256,
    selected: ledger.iteration.id === selectedIterationId,
    active: ledger.iteration.id === activeIterationId,
  }));
}

function inspectVariant(testCase: GauntletCase, loaded: LoadedArtifact | undefined): CaseVariantInspection | null {
  if (!loaded) return null;
  const artifact = loaded.artifact;
  return {
    variant: artifact.variant,
    binding: artifact.binding,
    generation: artifact.generation,
    artifactSha256: loaded.sha256,
    fixtureSha256: artifact.fixture.sha256,
    reportSha256: artifact.reportSha256,
    presentation: {
      route: artifact.presentation.route,
      viewport: artifact.presentation.viewport,
      visibleText: testCase.provenance === "synthetic"
        ? artifact.presentation.visibleText
        : "Presentation withheld because this case is not synthetic.",
      visibleTextSha256: artifact.presentation.visibleTextSha256,
      screenshotSha256: artifact.presentation.screenshot.sha256,
    },
  };
}

export function summarizeGauntletProgress(
  manifest: GauntletManifest,
  iteration: GauntletIteration,
  evidence: LoadedEvidence,
  context?: { iterationLedgerSha256?: string; ledgers?: IterationLedger[] },
): GauntletProgressSnapshot {
  const total = manifest.target.caseCount;
  const pairedCaseIds = new Set(manifest.cases
    .filter((testCase) => evidence.candidateOutputs.has(testCase.id) && evidence.productionOutputs.has(testCase.id))
    .map((testCase) => testCase.id));
  const reportContractFailures = [...evidence.automatedChecks.values()]
    .filter((check) => check.errors.length > 0).length;
  const automatedSourceIntegrityViolations = [...evidence.automatedChecks.values()]
    .reduce((count, check) => count + check.sourceIntegrityErrors.length, 0);
  const manuallyInventedFacts = evidence.sourceAudits.size === 0
    ? null
    : [...evidence.sourceAudits.values()].reduce((count, audit) => count + audit.inventedFacts.length, 0);
  const completedJourneys = evidence.journeys.size;
  const criticalJourneyFailures = evidence.journeys.size === 0
    ? null
    : [...evidence.journeys.values()].reduce((count, journey) => count + journey.criticalFailures.length, 0);
  const dimensions = summarizeBlindDimensions(manifest, evidence);
  const referenceDimensions = summarizeReferenceDimensions(manifest, evidence);
  const candidateBindingComplete = hasCompleteBinding(iteration.candidate);
  const productionBindingComplete = hasCompleteBinding(iteration.production);
  const bindingsComplete = evidence.repositoryAvailable
    && candidateBindingComplete
    && productionBindingComplete;
  const bindingStatus: GateStatus = bindingsComplete
    ? "pass"
    : iteration.status === "complete" ? "fail" : "pending";
  const criticStatus: GateStatus = iteration.critic.verdict === "pending"
    ? "pending"
    : evidence.criticValid && iteration.critic.verdict === "pass" ? "pass" : "fail";
  const sealStatus: GateStatus = iteration.status === "complete"
    ? evidence.sealValid ? "pass" : "fail"
    : "pending";
  const gitAnchorStatus: GateStatus = iteration.status === "complete"
    ? evidence.gitAnchorValid ? "pass" : "fail"
    : "pending";
  const completeEvidenceReady = bindingsComplete
    && pairedCaseIds.size === total
    && evidence.automatedChecks.size === total
    && reportContractFailures === 0
    && dimensions.every((dimension) => dimension.status === "pass")
    && referenceDimensions.every((dimension) => dimension.status === "pass")
    && automatedSourceIntegrityViolations === 0
    && manuallyInventedFacts === 0
    && evidence.sourceAudits.size === total
    && completedJourneys === manifest.requiredJourneys.length
    && criticalJourneyFailures === 0
    && criticStatus === "pass"
    && evidence.sealValid
    && evidence.gitAnchorValid
    && evidence.dataIssues.length === 0;

  const gates = [
    {
      id: "case-set",
      label: "Twelve-case synthetic corpus",
      status: manifest.cases.length === total ? "pass" as const : "fail" as const,
      detail: `${manifest.cases.length}/${total} configured from existing eval fixtures`,
    },
    {
      id: "candidate-binding",
      label: "Real commit and canonical source receipts",
      status: bindingStatus,
      detail: bindingsComplete
        ? "Both variants resolve to real commits with prompt and renderer receipts"
        : evidence.repositoryAvailable
          ? candidateBindingComplete
            ? "Production commit, model, canonical prompt, or renderer receipt is still missing"
            : productionBindingComplete
              ? "Candidate commit, model, canonical prompt, or renderer receipt is still missing"
              : "Both variants still need complete commit, model, prompt, and renderer receipts"
          : "Git metadata is unavailable on this host; no repository-bound result is claimed",
    },
    {
      id: "paired-outputs",
      label: "Paired rendered presentations",
      status: statusForCoverage(pairedCaseIds.size, total),
      detail: `${pairedCaseIds.size}/${total} production/candidate report plus rendered-presentation pairs are present`,
    },
    {
      id: "report-contract",
      label: "Automated report contract",
      status: statusForCoverage(evidence.automatedChecks.size, total, reportContractFailures),
      detail: reportContractFailures > 0
        ? `${reportContractFailures} candidate reports have blocking eval errors`
        : `${evidence.automatedChecks.size}/${total} candidate reports checked`,
    },
    ...dimensions.map((dimension) => ({
      id: `blind-${dimension.dimension}`,
      label: `Blind ${dimension.dimension} preference`,
      status: dimension.status,
      detail: dimension.rate === null
        ? `${dimension.reviewed}/${total} reviewed; target ${dimension.targetWins} candidate wins`
        : `${dimension.candidateWins}/${total} candidate wins (${Math.round(dimension.rate * 100)}%)`,
    })),
    ...referenceDimensions.map((dimension) => ({
      id: `reference-${dimension.dimension}`,
      label: `Public-reference ${dimension.dimension}`,
      status: dimension.status,
      detail: dimension.rate === null
        ? `${dimension.reviewed}/${total} assessed; target ${dimension.targetWins} meets-or-beats verdicts`
        : `${dimension.candidateWins}/${total} meets or beats the inspected public bar`,
    })),
    {
      id: "source-integrity",
      label: "Zero invented facts",
      status: automatedSourceIntegrityViolations > 0 || (manuallyInventedFacts ?? 0) > 0
        ? "fail" as const
        : evidence.automatedChecks.size === total && evidence.sourceAudits.size === total
          ? "pass" as const
          : "pending" as const,
      detail: automatedSourceIntegrityViolations > 0 || (manuallyInventedFacts ?? 0) > 0
        ? `${automatedSourceIntegrityViolations} automated source violations; ${manuallyInventedFacts ?? 0} human-confirmed inventions`
        : `${evidence.sourceAudits.size}/${total} human source audits; ${evidence.automatedChecks.size}/${total} automated checks`,
    },
    {
      id: "journeys",
      label: "Fresh critical desktop/mobile journeys",
      status: (criticalJourneyFailures ?? 0) > manifest.target.maxCriticalJourneyFailures
        ? "fail" as const
        : completedJourneys === manifest.requiredJourneys.length ? "pass" as const : "pending" as const,
      detail: criticalJourneyFailures === null
        ? `0/${manifest.requiredJourneys.length} fresh journey receipts imported; failure count unavailable`
        : `${completedJourneys}/${manifest.requiredJourneys.length} complete; ${criticalJourneyFailures} critical failures`,
    },
    {
      id: "critic-verdict",
      label: "Independent critic verdict",
      status: criticStatus,
      detail: `${iteration.critic.verdict}: ${iteration.critic.rationale}`,
    },
    {
      id: "iteration-seal",
      label: "Immutable iteration seal",
      status: sealStatus,
      detail: sealStatus === "pass"
        ? "Ledger case set and complete artifact tree match their sealed hashes"
        : iteration.status === "complete"
          ? "Complete iteration seal is stale or invalid"
          : "Iteration has not been completed and sealed",
    },
    {
      id: "git-anchor",
      label: "Git-backed evidence anchor",
      status: gitAnchorStatus,
      detail: gitAnchorStatus === "pass"
        ? `Evidence commit ${evidence.evidenceCommit} is pinned by immutable anchor commit ${evidence.anchorCommit}`
        : iteration.status === "complete"
          ? "Complete ledger and every evidence file must match a dedicated post-evidence Git anchor"
          : evidence.repositoryAvailable
            ? "Incomplete iterations do not require a Git anchor"
            : "Git metadata is unavailable on this host; this incomplete iteration remains unverified",
    },
    {
      id: "completion-record",
      label: "Complete record is earned",
      status: iteration.status === "complete"
        ? completeEvidenceReady ? "pass" as const : "fail" as const
        : "pending" as const,
      detail: iteration.status === "complete"
        ? completeEvidenceReady
          ? "Every required gate was complete when this immutable record was sealed"
          : "Ledger says complete, but one or more required gates are absent, failing, or stale"
        : "Iteration remains an explicitly incomplete record",
    },
    {
      id: "evidence-integrity",
      label: "Evidence integrity",
      status: evidence.dataIssues.length > 0
        ? "fail" as const
        : evidence.sealValid ? "pass" as const : "pending" as const,
      detail: evidence.dataIssues.length > 0
        ? `${evidence.dataIssues.length} invalid, stale, unsafe, or mismatched evidence records`
        : evidence.sealValid
          ? "No stale hashes, unsafe paths, mismatched bindings, or malformed records detected"
          : "No sealed evidence tree exists to verify yet",
    },
  ];

  const cases: CaseProgress[] = manifest.cases.map((testCase) => {
    const judgment = evidence.blindJudgments.get(testCase.id);
    return {
      id: testCase.id,
      role: testCase.role,
      seniority: testCase.seniority,
      quality: testCase.quality,
      pairedOutputs: pairedCaseIds.has(testCase.id),
      blindReviewed: Boolean(judgment),
      automatedChecked: evidence.automatedChecks.has(testCase.id),
      sourceAudited: evidence.sourceAudits.has(testCase.id),
      referenceAssessed: evidence.referenceAssessments.has(testCase.id),
      blindVerdict: judgment ? {
        reviewer: judgment.reviewer,
        reviewedAt: judgment.reviewedAt,
        preferences: judgment.preferences,
        rationale: judgment.rationale,
      } : null,
      candidate: inspectVariant(testCase, evidence.candidateOutputs.get(testCase.id)),
      production: inspectVariant(testCase, evidence.productionOutputs.get(testCase.id)),
    };
  });

  const baselineGaps: string[] = [];
  if (!evidence.repositoryAvailable) {
    baselineGaps.push("Git metadata is unavailable on this host; run strict validation in the protected repository before treating evidence as verified.");
  }
  if (!bindingsComplete) {
    if (!candidateBindingComplete && productionBindingComplete) {
      baselineGaps.push("Bind the candidate to a real commit plus canonical prompt and renderer receipts.");
    } else if (candidateBindingComplete && !productionBindingComplete) {
      baselineGaps.push("Bind production to a real commit plus canonical prompt and renderer receipts.");
    } else {
      baselineGaps.push("Bind production and candidate to real commits plus canonical prompt and renderer receipts.");
    }
  }
  if (pairedCaseIds.size < total) {
    baselineGaps.push(`Import ${total - pairedCaseIds.size} remaining production/candidate report and rendered-presentation pairs.`);
  }
  if (evidence.blindJudgments.size < total) {
    baselineGaps.push(`Complete ${total - evidence.blindJudgments.size} remaining blind reviews.`);
  }
  if (evidence.sourceAudits.size < total) {
    baselineGaps.push(`Complete ${total - evidence.sourceAudits.size} remaining human source audits.`);
  }
  if (evidence.referenceAssessments.size < total) {
    baselineGaps.push(`Complete ${total - evidence.referenceAssessments.size} remaining structured public-reference assessments.`);
  }
  if (completedJourneys < manifest.requiredJourneys.length) {
    baselineGaps.push(`Import ${manifest.requiredJourneys.length - completedJourneys} remaining fresh cold-visitor journey receipts.`);
  }
  if (iteration.critic.verdict !== "pass") {
    baselineGaps.push(`Critic remaining gap: ${iteration.critic.remainingGap}`);
  }
  if (!evidence.sealValid) {
    baselineGaps.push("Complete and seal the immutable evidence tree before treating this iteration as a result.");
  }
  if (iteration.status === "complete" && !evidence.gitAnchorValid) {
    baselineGaps.push("Commit the sealed ledger and evidence, then add its immutable post-evidence Git anchor in a separate commit.");
  }
  baselineGaps.push("Same-resume Teal and Jobscan outputs are unavailable because no competitor account was created; external evidence is limited to their inspected public artifacts.");
  baselineGaps.push(...evidence.dataIssues);

  return {
    generatedAt: new Date().toISOString(),
    manifest,
    iteration,
    iterationLedgerSha256: context?.iterationLedgerSha256 ?? "unsealed-test-snapshot",
    iterations: iterationSummaries(context?.ledgers ?? [], iteration.id, manifest.activeIterationId),
    overallStatus: combineGateStatuses(gates),
    configuredCases: manifest.cases.length,
    pairedOutputCases: pairedCaseIds.size,
    blindReviewedCases: evidence.blindJudgments.size,
    sourceAuditedCases: evidence.sourceAudits.size,
    referenceAssessedCases: evidence.referenceAssessments.size,
    automatedCheckedCases: evidence.automatedChecks.size,
    reportContractFailures,
    automatedSourceIntegrityViolations,
    manuallyInventedFacts,
    criticalJourneyFailures,
    completedJourneys,
    dimensions,
    referenceDimensions,
    cases,
    gates,
    baselineGaps,
    dataIssues: evidence.dataIssues,
  };
}
