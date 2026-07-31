export const GAUNTLET_DIMENSIONS = ["trust", "specificity", "actionability"] as const;

export type GauntletDimension = (typeof GAUNTLET_DIMENSIONS)[number];
export type GateStatus = "pass" | "fail" | "pending";
export type Variant = "candidate" | "production";
export type BlindLabel = "A" | "B";

export interface ContentReceipt {
  path: string;
  sha256: string;
}

export interface GauntletCase {
  id: string;
  fixtureId: string;
  resumePath: string;
  provenance: "synthetic" | "public" | "redacted";
  role: string;
  seniority: string;
  quality: string;
  tags: string[];
}

export interface CompetitorReference {
  id: string;
  name: string;
  role: "cold_entry" | "report_actionability";
  url: string;
  inspectedOn: string;
  inspectionStatus: "public_artifact_inspected";
  accountCreated: false;
  sameResumeOutputsAvailable: false;
  observedCapabilities: string[];
  limitation: string;
}

export interface RequiredJourney {
  id: string;
  label: string;
  viewport: "desktop" | "mobile";
}

export interface GauntletManifest {
  schemaVersion: "1";
  activeIterationId: string;
  target: {
    caseCount: number;
    minimumPreferenceRate: number;
    minimumPreferredCases: number;
    maxInventedFacts: number;
    maxCriticalJourneyFailures: number;
    dimensions: GauntletDimension[];
  };
  competitorReferences: CompetitorReference[];
  requiredJourneys: RequiredJourney[];
  cases: GauntletCase[];
}

export interface CandidateBinding {
  commit: string | null;
  model: string | null;
  resumePrompt: ContentReceipt | null;
  renderer: ContentReceipt | null;
}

export interface GauntletIteration {
  schemaVersion: "2";
  id: string;
  label: string;
  createdAt: string;
  status: "baseline_pending" | "collecting" | "complete";
  production: CandidateBinding;
  candidate: CandidateBinding;
  builder: {
    change: string;
    claim: string;
  };
  critic: {
    verdict: "pending" | "pass" | "fail";
    rationale: string;
    remainingGap: string;
  };
  previous: {
    iterationId: string;
    ledgerSha256: string;
  } | null;
  seal: {
    sealedAt: string;
    caseSetSha256: string;
    artifactSetSha256: string;
  } | null;
  baselineStatement: string;
}

export interface GitAnchoredFileReceipt {
  path: string;
  sha256: string;
  gitBlobOid: string;
}

export interface GauntletAnchor {
  schemaVersion: "1";
  iterationId: string;
  evidenceCommit: string;
  ledger: GitAnchoredFileReceipt;
  artifactSetSha256: string;
  artifacts: GitAnchoredFileReceipt[];
}

export interface OutputArtifactBinding extends CandidateBinding {}

export interface OutputGenerationReceipt {
  sourceCommit: string;
  sanitizedOutput: ContentReceipt;
  runId: string;
  fixtureId: string;
  generatedAt: string;
  model: string;
  canonicalPromptSha256: string;
  reportSha256: string;
}

export interface PresentationReceipt {
  kind: "rendered_report";
  rendererCommit: string;
  renderer: ContentReceipt;
  capturedAt: string;
  route: string;
  viewport: {
    width: number;
    height: number;
  };
  visibleText: string;
  visibleTextSha256: string;
  screenshot: {
    path: string;
    sha256: string;
  };
}

export interface GauntletOutputArtifact {
  schemaVersion: "2";
  iterationId: string;
  caseId: string;
  variant: Variant;
  binding: OutputArtifactBinding;
  generation: OutputGenerationReceipt;
  fixture: { sha256: string };
  reportSha256: string;
  report: unknown;
  presentation: PresentationReceipt;
}

export interface BlindPresentation {
  kind: "rendered_report";
  route: string;
  viewport: {
    width: number;
    height: number;
  };
  visibleText: string;
  visibleTextSha256: string;
  screenshot: {
    path: string;
    sha256: string;
  };
}

export interface BlindPacket {
  schemaVersion: "2";
  iterationId: string;
  caseId: string;
  resume: {
    sha256: string;
    text: string;
  };
  variants: Record<BlindLabel, BlindPresentation>;
}

export interface BlindArtifactBinding {
  artifactSha256: string;
  reportSha256: string;
  fixtureSha256: string;
  generationSourceSha256: string;
  canonicalPromptSha256: string;
  promptSha256: string;
  rendererSha256: string;
  visibleTextSha256: string;
  screenshotSha256: string;
}

export interface BlindMappingEntry {
  packetSha256: string;
  labels: Record<BlindLabel, Variant>;
  artifacts: Record<Variant, BlindArtifactBinding>;
}

export interface BlindMapping {
  schemaVersion: "2";
  iterationId: string;
  createdAt: string;
  cases: Record<string, BlindMappingEntry>;
}

export type BlindPreference = BlindLabel | "tie";

export interface BlindJudgment {
  schemaVersion: "2";
  iterationId: string;
  caseId: string;
  packetSha256: string;
  artifacts: Record<Variant, BlindArtifactBinding>;
  reviewer: string;
  reviewedAt: string;
  preferences: Record<GauntletDimension, BlindPreference>;
  rationale: Record<GauntletDimension, string>;
}

export interface SourceAudit {
  schemaVersion: "2";
  iterationId: string;
  caseId: string;
  candidateArtifactSha256: string;
  auditor: string;
  auditedAt: string;
  inventedFacts: Array<{
    claim: string;
    reason: string;
  }>;
  notes: string;
}

export type ReferenceVerdict = "meets_or_beats" | "trails" | "inconclusive";

export interface ReferenceAssessment {
  schemaVersion: "2";
  iterationId: string;
  caseId: string;
  candidateArtifactSha256: string;
  assessor: string;
  assessedAt: string;
  dimensions: Record<GauntletDimension, {
    verdict: ReferenceVerdict;
    evidence: string;
    referenceIds: string[];
  }>;
}

export interface JourneyRun {
  schemaVersion: "2";
  iterationId: string;
  journeyId: string;
  candidateCommit: string;
  journeyDefinitionSha256: string;
  testedAt: string;
  completed: true;
  viewport: "desktop" | "mobile";
  entryPath: string;
  finalPath: string;
  steps: Array<{
    label: string;
    status: "pass" | "fail";
    evidence: string;
  }>;
  evidence: Array<{
    kind: "screenshot" | "dom" | "console" | "interaction";
    path: string;
    sha256: string;
  }>;
  criticalFailures: Array<{
    title: string;
    evidence: string;
  }>;
  notes: string;
}

export interface DimensionProgress {
  dimension: GauntletDimension;
  candidateWins: number;
  productionWins: number;
  ties: number;
  reviewed: number;
  rate: number | null;
  targetWins: number;
  status: GateStatus;
}

export interface ResolvedCaseVerdict {
  reviewer: string;
  reviewedAt: string;
  preferences: Record<GauntletDimension, Variant | "tie">;
  rationale: Record<GauntletDimension, string>;
}

export interface CaseVariantInspection {
  variant: Variant;
  binding: OutputArtifactBinding;
  generation: OutputGenerationReceipt;
  artifactSha256: string;
  fixtureSha256: string;
  reportSha256: string;
  presentation: {
    route: string;
    viewport: { width: number; height: number };
    visibleText: string;
    visibleTextSha256: string;
    screenshotSha256: string;
  };
}

export interface CaseProgress {
  id: string;
  role: string;
  seniority: string;
  quality: string;
  pairedOutputs: boolean;
  blindReviewed: boolean;
  automatedChecked: boolean;
  sourceAudited: boolean;
  referenceAssessed: boolean;
  blindVerdict: ResolvedCaseVerdict | null;
  candidate: CaseVariantInspection | null;
  production: CaseVariantInspection | null;
}

export interface ProgressGate {
  id: string;
  label: string;
  status: GateStatus;
  detail: string;
}

export interface IterationLedgerSummary {
  id: string;
  label: string;
  createdAt: string;
  status: GauntletIteration["status"];
  criticVerdict: GauntletIteration["critic"]["verdict"];
  ledgerSha256: string;
  selected: boolean;
  active: boolean;
}

export interface GauntletProgressSnapshot {
  generatedAt: string;
  manifest: GauntletManifest;
  iteration: GauntletIteration;
  iterationLedgerSha256: string;
  iterations: IterationLedgerSummary[];
  overallStatus: GateStatus;
  configuredCases: number;
  pairedOutputCases: number;
  blindReviewedCases: number;
  sourceAuditedCases: number;
  referenceAssessedCases: number;
  automatedCheckedCases: number;
  reportContractFailures: number;
  automatedSourceIntegrityViolations: number;
  manuallyInventedFacts: number | null;
  criticalJourneyFailures: number | null;
  completedJourneys: number;
  dimensions: DimensionProgress[];
  referenceDimensions: DimensionProgress[];
  cases: CaseProgress[];
  gates: ProgressGate[];
  baselineGaps: string[];
  dataIssues: string[];
}
