import { createHash, randomUUID } from "node:crypto";
import { link, lstat, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  GAUNTLET_CAPTURE_CONTRACT,
  type CandidateBinding,
  type CaptureRuntimeReceipt,
  type GauntletManifest,
  type GauntletOutputArtifact,
  type JourneyRun,
  type OutputGenerationReceipt,
  type ReportFinalizationReceipt,
  type RequiredJourney,
  type Variant,
} from "../../lib/gauntlet/types";
import {
  parseRunnerAttestation,
  type LockedRunReceipt,
  type RunnerReceiptBinding,
} from "./runner-attestation";

export const PROMPT_PATH = "web/prompts/resume_v2.txt";
export const RENDERER_PATH = "web/components/workspace/report/ReportStream.tsx";
export const PACKAGE_LOCK_PATH = "web/package-lock.json";
export const HIDDEN_PACKAGE_LOCK_PATH = "web/node_modules/.package-lock.json";
export const NETWORK_GUARD_PATH = "web/scripts/gauntlet-evidence-capture/network-guard.cjs";
export { CAPTURE_HARNESS_PATHS } from "./capture-paths";
export const APPROVED_CASE_FIXTURES = Object.freeze([
  { caseId: "staff-ml-elite", fixtureId: "anchor_elite_ml_staff_1", resumePath: "golden/anchor_elite_ml_staff_1.txt", fixtureSha256: "210b1c14666b1df87a6eade18ac712507fcc8c89b3debb7c6fee76f71d33d6d1" },
  { caseId: "vp-talent-elite", fixtureId: "anchor_elite_vp_talent_1", resumePath: "golden/anchor_elite_vp_talent_1.txt", fixtureSha256: "7214ea9aa2becb29a6f49ae999438c457df2b9549b12c0ce0ca7dd5af7bce814" },
  { caseId: "data-science-senior-elite", fixtureId: "synth_data_scientist_senior_elite_1", resumePath: "golden/synth_data_scientist_senior_elite_1766960238522.txt", fixtureSha256: "49f38178878184f4dfe5aed0d35d4ee0520d9bc2bee4bdcf72f035908bacf648" },
  { caseId: "marketing-vp-elite", fixtureId: "synth_marketing_manager_vp_elite_1", resumePath: "golden/synth_marketing_manager_vp_elite_1766960221358.txt", fixtureSha256: "a5f6a1bba91362463218b3e6ea358e8bc5b470add84f7b5eee7d69f1078c2bf0" },
  { caseId: "software-engineering-mid-strong", fixtureId: "synth_software_engineer_mid_strong_1", resumePath: "golden/synth_software_engineer_mid_strong_1766960342929.txt", fixtureSha256: "f982ebe1395b510461a41d714f2db929a3678b7c94a04354344e5398e575ca0d" },
  { caseId: "ux-director-strong", fixtureId: "synth_ux_designer_director_strong_1", resumePath: "golden/synth_ux_designer_director_strong_1766960238902.txt", fixtureSha256: "f1b6bcd85dc9f75c88c8a1b07f21ce5870eed813511ef46218832813ede3dada" },
  { caseId: "project-management-vp-strong", fixtureId: "synth_project_manager_vp_strong_1", resumePath: "golden/synth_project_manager_vp_strong_1766957014608.txt", fixtureSha256: "8c194ebd43e24d69df1294477731ad9556c0c460cdad4b60b9cd46e33266430a" },
  { caseId: "sales-mid-foundation", fixtureId: "synth_sales_executive_mid_foundation_1", resumePath: "golden/synth_sales_executive_mid_foundation_1766960226693.txt", fixtureSha256: "516f07a0fad8255e071e9b24a3c96f4133560f97d75b2bdf235537bb10710231" },
  { caseId: "hr-director-foundation", fixtureId: "synth_hr_manager_director_foundation_1", resumePath: "golden/synth_hr_manager_director_foundation_1766960245321.txt", fixtureSha256: "430c7fe23a2b6ecf0000329b0786253c31d8ca23a71fdc74ab1f301f2b320b5c" },
  { caseId: "finance-senior-weak", fixtureId: "synth_finance_analyst_senior_weak_1", resumePath: "golden/synth_finance_analyst_senior_weak_1766960287359.txt", fixtureSha256: "093f72199c92dcb24bd9c63d6dee7f6cd306ee494dfc0d791e195d13be9f6817" },
  { caseId: "operations-entry-weak", fixtureId: "synth_operations_manager_entry_weak_1", resumePath: "golden/synth_operations_manager_entry_weak_1766960246467.txt", fixtureSha256: "eb1dd8ebee72b084bd5f7f90bcc431b9f882c02408ab79ad33c3b62d8ee03a86" },
  { caseId: "product-entry-elite", fixtureId: "synth_product_manager_entry_elite_1", resumePath: "golden/synth_product_manager_entry_elite_1766960255028.txt", fixtureSha256: "850a02b32bf5425eafbe3d7c7d1eb003d7eb039debee54c470ba0e406c1205a1" },
] as const);
export const APPROVED_JOURNEYS = Object.freeze([
  {
    id: "free-review-desktop",
    label: "Cold visitor reaches useful free review on desktop",
    viewport: "desktop",
  },
  {
    id: "free-review-mobile",
    label: "Cold visitor reaches useful free review on mobile",
    viewport: "mobile",
  },
  {
    id: "five-more-value-desktop",
    label: "Five-more-for-$29 value is clear on desktop",
    viewport: "desktop",
  },
  {
    id: "five-more-value-mobile",
    label: "Five-more-for-$29 value is clear on mobile",
    viewport: "mobile",
  },
] as const);

export type ApprovedCaseFixture = {
  caseId: string;
  fixtureId: string;
  resumePath: string;
  fixtureSha256: string;
};

export function assertApprovedCaptureManifest(manifest: GauntletManifest) {
  if (manifest.target.caseCount !== APPROVED_CASE_FIXTURES.length
    || manifest.cases.length !== APPROVED_CASE_FIXTURES.length) {
    throw new Error("manifest no longer defines the locked 12-case corpus");
  }
  if (manifest.cases.some((entry, index) => entry.id !== APPROVED_CASE_FIXTURES[index]?.caseId
    || entry.fixtureId !== APPROVED_CASE_FIXTURES[index]?.fixtureId
    || entry.resumePath !== APPROVED_CASE_FIXTURES[index]?.resumePath
    || entry.provenance !== "synthetic")) {
    throw new Error("manifest does not match the locked approved case-to-fixture set");
  }
  if (manifest.requiredJourneys.length !== APPROVED_JOURNEYS.length
    || manifest.requiredJourneys.some((entry, index) => {
      const approved = APPROVED_JOURNEYS[index];
      return entry.id !== approved?.id
        || entry.label !== approved.label
        || entry.viewport !== approved.viewport;
    })) {
    throw new Error("manifest does not match the locked four-journey set");
  }
}
type HistoricalResult = {
  fixture_id?: unknown;
  status?: unknown;
  response_model?: unknown;
  raw_output?: unknown;
};

type HistoricalRun = {
  metadata?: Record<string, unknown>;
  summary?: Record<string, unknown>;
  results?: unknown;
};

export type SanitizedHistoricalSource = {
  schemaVersion: "1";
  kind: "historical-live-eval-synthetic-subset";
  sourceRun: {
    fullRunSha256: string;
    runId: string;
    generatedAt: string;
    executionMode: "live";
    model: string;
    reasoningEffort: string;
    promptVersion: string;
    canonicalPromptSha256: string;
    contractVersion: "v2";
    runnerReceipt: RunnerReceiptBinding;
  };
  selection: {
    caseCount: number;
    provenance: "synthetic-only";
    excludedResultCount: number;
  };
  results: Array<{
    caseId: string;
    fixtureId: string;
    status: "PASS";
    report: Record<string, unknown>;
  }>;
};

export type CapturePresentation = {
  visibleText: string;
  screenshot: Buffer;
  route: string;
  viewport: { width: number; height: number };
  capturedAt: string;
  captureReceipt: CaptureRuntimeReceipt;
};

export type JourneyCapture = {
  journey: RequiredJourney;
  testedAt: string;
  entryPath: string;
  finalPath: string;
  steps: JourneyRun["steps"];
  screenshot: Buffer;
  dom: string;
  consoleLog: string;
  interactionLog: string;
  notes: string;
};

export function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, sortJson(nested)]));
  }
  return value;
}

export function stableJson(value: unknown) {
  return JSON.stringify(sortJson(value));
}

export function canonicalJsonSha256(value: unknown) {
  return sha256(stableJson(value));
}

export function serialize(value: unknown) {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function assertExact(value: unknown, expected: unknown, label: string) {
  if (value !== expected) throw new Error(`${label} does not match the source run receipt`);
}

function assertSafeManifest(
  manifest: GauntletManifest,
  expectedCount: number,
  approvedCases: readonly ApprovedCaseFixture[],
) {
  if (manifest.schemaVersion !== "1") throw new Error("manifest schemaVersion must be 1");
  if (manifest.target.caseCount !== expectedCount || manifest.cases.length !== expectedCount) {
    throw new Error(`manifest must contain exactly ${expectedCount} cases`);
  }
  if (approvedCases.length !== expectedCount) throw new Error("approved case allowlist has the wrong size");
  const caseIds = new Set<string>();
  const fixtureIds = new Set<string>();
  for (const [index, entry] of manifest.cases.entries()) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(entry.id) || !/^[a-z0-9][a-z0-9_-]*$/.test(entry.fixtureId)) {
      throw new Error("manifest contains an unsafe case or fixture id");
    }
    if (entry.provenance !== "synthetic") {
      throw new Error(`manifest case ${entry.id} is not synthetic`);
    }
    if (caseIds.has(entry.id) || fixtureIds.has(entry.fixtureId)) {
      throw new Error("manifest case and fixture ids must be unique");
    }
    const approved = approvedCases[index];
    if (entry.id !== approved.caseId
      || entry.fixtureId !== approved.fixtureId
      || entry.resumePath !== approved.resumePath) {
      throw new Error("manifest does not match the locked approved case-to-fixture set");
    }
    caseIds.add(entry.id);
    fixtureIds.add(entry.fixtureId);
  }
}

export function sanitizeHistoricalRun(
  bytes: Buffer,
  manifest: GauntletManifest,
  receipt: LockedRunReceipt,
  runnerReceipt: RunnerReceiptBinding,
  approvedCases: readonly ApprovedCaseFixture[] = APPROVED_CASE_FIXTURES,
): SanitizedHistoricalSource {
  let parsed: HistoricalRun;
  try {
    parsed = JSON.parse(bytes.toString("utf8")) as HistoricalRun;
  } catch {
    throw new Error("historical run is not valid JSON");
  }
  assertRecord(parsed, "historical run");
  assertRecord(parsed.metadata, "historical run metadata");
  assertRecord(parsed.summary, "historical run summary");
  if (!Array.isArray(parsed.results)) throw new Error("historical run results must be an array");
  const sourceReceipt = receipt;
  assertExact(sha256(bytes), sourceReceipt.fullRunSha256, "full-run SHA-256");
  assertSafeManifest(manifest, sourceReceipt.selectedResults, approvedCases);

  const metadata = parsed.metadata;
  assertExact(metadata.run_id, sourceReceipt.runId, "run id");
  assertExact(metadata.timestamp, sourceReceipt.generatedAt, "run timestamp");
  assertExact(metadata.execution_mode, sourceReceipt.executionMode, "execution mode");
  assertExact(metadata.model, sourceReceipt.model, "model");
  assertExact(metadata.reasoning_effort, sourceReceipt.reasoningEffort, "reasoning effort");
  assertExact(metadata.prompt_version_hash, sourceReceipt.promptVersion, "prompt version");
  assertExact(metadata.resume_prompt_sha256, sourceReceipt.canonicalPromptSha256, "resume prompt SHA-256");
  assertExact(metadata.contract_version, sourceReceipt.contractVersion, "contract version");
  assertExact(parsed.summary.total, sourceReceipt.totalResults, "summary total");
  assertExact(parsed.results.length, sourceReceipt.totalResults, "result count");

  const byFixture = new Map<string, HistoricalResult>();
  for (const value of parsed.results) {
    assertRecord(value, "historical result");
    const result = value as HistoricalResult;
    if (typeof result.fixture_id !== "string" || !/^[a-z0-9][a-z0-9_-]*$/.test(result.fixture_id)) {
      throw new Error("historical run contains an unsafe fixture id");
    }
    if (byFixture.has(result.fixture_id)) throw new Error(`duplicate historical fixture: ${result.fixture_id}`);
    byFixture.set(result.fixture_id, result);
  }

  const results = manifest.cases.map((testCase) => {
    const selected = byFixture.get(testCase.fixtureId);
    if (!selected) throw new Error(`approved fixture is missing: ${testCase.fixtureId}`);
    if (selected.status !== "PASS") throw new Error(`approved fixture is not PASS: ${testCase.fixtureId}`);
    if (selected.response_model !== sourceReceipt.model) {
      throw new Error(`approved fixture model drifted: ${testCase.fixtureId}`);
    }
    assertRecord(selected.raw_output, `approved fixture report ${testCase.fixtureId}`);
    return {
      caseId: testCase.id,
      fixtureId: testCase.fixtureId,
      status: "PASS" as const,
      report: sortJson(selected.raw_output) as Record<string, unknown>,
    };
  });

  if (new Set(results.map((result) => result.fixtureId)).size !== sourceReceipt.selectedResults) {
    throw new Error("selected fixture set does not exactly match the manifest");
  }
  return {
    schemaVersion: "1",
    kind: "historical-live-eval-synthetic-subset",
    sourceRun: {
      fullRunSha256: sourceReceipt.fullRunSha256,
      runId: sourceReceipt.runId,
      generatedAt: sourceReceipt.generatedAt,
      executionMode: "live",
      model: sourceReceipt.model,
      reasoningEffort: sourceReceipt.reasoningEffort,
      promptVersion: sourceReceipt.promptVersion,
      canonicalPromptSha256: sourceReceipt.canonicalPromptSha256,
      contractVersion: "v2",
      runnerReceipt,
    },
    selection: {
      caseCount: results.length,
      provenance: "synthetic-only",
      excludedResultCount: parsed.results.length - results.length,
    },
    results,
  };
}

export async function sanitizeHistoricalRunFiles(input: {
  sourcePath: string;
  attestationPath: string;
  attestationRepositoryPath: string;
  manifestPath: string;
  outputPath?: string;
  attestationOutputPath?: string;
  write: boolean;
  approvedCases?: readonly ApprovedCaseFixture[];
}) {
  const [sourceStats, attestationStats, manifestStats] = await Promise.all([
    lstat(input.sourcePath),
    lstat(input.attestationPath),
    lstat(input.manifestPath),
  ]);
  if (!sourceStats.isFile() || sourceStats.isSymbolicLink()) throw new Error("historical source must be a regular file");
  if (!attestationStats.isFile() || attestationStats.isSymbolicLink()) throw new Error("runner attestation must be a regular file");
  if (!manifestStats.isFile() || manifestStats.isSymbolicLink()) throw new Error("manifest must be a regular file");
  const [bytes, attestationBytes, manifestRaw] = await Promise.all([
    readFile(input.sourcePath),
    readFile(input.attestationPath),
    readFile(input.manifestPath, "utf8"),
  ]);
  const manifest = JSON.parse(manifestRaw) as GauntletManifest;
  const attestation = parseRunnerAttestation(attestationBytes, bytes, manifest.target.caseCount);
  const sanitized = sanitizeHistoricalRun(
    bytes,
    manifest,
    attestation.receipt,
    {
      path: input.attestationRepositoryPath,
      sha256: attestation.sha256,
      runnerCommit: attestation.receipt.runnerCommit,
      issuedAt: attestation.receipt.issuedAt,
    },
    input.approvedCases ?? APPROVED_CASE_FIXTURES,
  );
  const serialized = serialize(sanitized);
  if (input.write) {
    if (!input.outputPath || !input.attestationOutputPath) {
      throw new Error("source and attestation outputs are required with --write");
    }
    await writeFileAtomicNew(input.attestationOutputPath, attestationBytes);
    await writeFileAtomicNew(input.outputPath, serialized);
  }
  return { sanitized, sha256: sha256(serialized), byteLength: Buffer.byteLength(serialized) };
}

export async function writeFileAtomicNew(target: string, data: string | Buffer) {
  const resolved = path.resolve(target);
  const temporary = `${resolved}.tmp-${process.pid}-${randomUUID()}`;
  try {
    await writeFile(temporary, data, { flag: "wx" });
    // link(2) is the exclusive publication step: unlike rename(2), it cannot
    // replace an evidence source that appeared after our initial checks.
    await link(temporary, resolved);
    await rm(temporary);
  } catch (error) {
    try {
      await rm(temporary, { force: true });
    } catch {
      // Preserve the original write failure.
    }
    throw error;
  }
}

export function buildOutputArtifact(input: {
  iterationId: string;
  caseId: string;
  variant: Variant;
  binding: CandidateBinding;
  generation: OutputGenerationReceipt;
  finalization: ReportFinalizationReceipt;
  fixtureSha256: string;
  rawReport: Record<string, unknown>;
  effectiveReport: Record<string, unknown>;
  presentation: CapturePresentation;
  screenshotPath: string;
}): GauntletOutputArtifact {
  const rawReportSha256 = canonicalJsonSha256(input.rawReport);
  const effectiveReportSha256 = canonicalJsonSha256(input.effectiveReport);
  if (rawReportSha256 !== input.generation.reportSha256
    || rawReportSha256 !== input.finalization.rawReportSha256) {
    throw new Error(`raw report receipt mismatch for ${input.caseId}`);
  }
  if (effectiveReportSha256 !== input.finalization.effectiveReportSha256) {
    throw new Error(`effective report receipt mismatch for ${input.caseId}`);
  }
  if (input.finalization.status === "unfinalized_raw"
    && rawReportSha256 !== effectiveReportSha256) {
    throw new Error(`raw baseline was altered for ${input.caseId}`);
  }
  if ((input.variant === "candidate" && input.finalization.status !== "finalized")
    || (input.variant === "production" && input.finalization.status !== "unfinalized_raw")) {
    throw new Error(`finalization mode does not match ${input.variant} for ${input.caseId}`);
  }
  return {
    schemaVersion: "2",
    iterationId: input.iterationId,
    caseId: input.caseId,
    variant: input.variant,
    captureContract: GAUNTLET_CAPTURE_CONTRACT,
    reportMode: input.variant === "candidate"
      ? "candidate_commit_finalized"
      : "historical_raw_unfinalized",
    binding: input.binding,
    generation: input.generation,
    finalization: input.finalization,
    fixture: { sha256: input.fixtureSha256 },
    reportSha256: effectiveReportSha256,
    report: input.effectiveReport,
    presentation: {
      kind: "rendered_report",
      rendererCommit: input.binding.commit!,
      renderer: input.binding.renderer!,
      capturedAt: input.presentation.capturedAt,
      route: input.presentation.route,
      viewport: input.presentation.viewport,
      visibleText: input.presentation.visibleText,
      visibleTextSha256: sha256(input.presentation.visibleText),
      screenshot: { path: input.screenshotPath, sha256: sha256(input.presentation.screenshot) },
      captureReceipt: input.presentation.captureReceipt,
    },
  };
}

export function buildJourneyReceipt(input: {
  iterationId: string;
  candidateCommit: string;
  capture: JourneyCapture;
  evidence: JourneyRun["evidence"];
}): JourneyRun {
  return {
    schemaVersion: "2",
    iterationId: input.iterationId,
    journeyId: input.capture.journey.id,
    candidateCommit: input.candidateCommit,
    journeyDefinitionSha256: canonicalJsonSha256(input.capture.journey),
    testedAt: input.capture.testedAt,
    completed: true,
    viewport: input.capture.journey.viewport,
    entryPath: input.capture.entryPath,
    finalPath: input.capture.finalPath,
    steps: input.capture.steps,
    evidence: input.evidence,
    criticalFailures: [],
    notes: input.capture.notes,
  };
}
