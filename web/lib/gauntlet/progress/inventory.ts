import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  artifactFileReceipts,
  canonicalJsonSha256,
  resolveContainedExistingPath,
  sha256,
} from "../integrity";
import { GAUNTLET_REFERENCE_RUBRIC } from "../reference-contract";
import type {
  BlindMapping,
  BlindPacket,
  GauntletIteration,
  GauntletManifest,
} from "../types";
import {
  hasExactKeys,
  isNonEmptyString,
  isRecord,
  isSha256,
  type LoadedArtifact,
  type LoadedEvidence,
} from "./common";
import { blindArtifactBinding } from "./outputs";
import { validateBlindPacketAssets } from "./reviews";

export type PreparedArtifactInventory = {
  paths: Set<string>;
  referencePacketSha256: Map<string, string>;
};

async function readArtifactJson(artifactRoot: string, relativePath: string) {
  const filePath = await resolveContainedExistingPath(artifactRoot, relativePath);
  const raw = await readFile(filePath, "utf8");
  return { raw, value: JSON.parse(raw) as unknown };
}

function blindPacketShapeValid(value: unknown, iterationId: string, caseId: string) {
  if (!isRecord(value)
    || !hasExactKeys(value, ["schemaVersion", "iterationId", "caseId", "resume", "variants"])
    || value.schemaVersion !== "2"
    || value.iterationId !== iterationId
    || value.caseId !== caseId
    || !isRecord(value.resume)
    || !hasExactKeys(value.resume, ["sha256", "text"])
    || !isSha256(value.resume.sha256)
    || !isNonEmptyString(value.resume.text)
    || sha256(value.resume.text) !== value.resume.sha256
    || !isRecord(value.variants)
    || !hasExactKeys(value.variants, ["A", "B"])) return false;
  return true;
}

function screenshotPathValid(caseId: string, label: "A" | "B", value: string) {
  const escaped = caseId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^assets/${escaped}-${label}\\.(?:jpg|jpeg|png)$`).test(value);
}

function referencePacketValid(input: {
  value: unknown;
  iteration: GauntletIteration;
  manifest: GauntletManifest;
  caseId: string;
  candidate: LoadedArtifact;
  packet: BlindPacket;
}) {
  const { value, iteration, manifest, caseId, candidate, packet } = input;
  if (!isRecord(value)
    || !hasExactKeys(value, [
      "schemaVersion",
      "iterationId",
      "caseId",
      "candidateArtifactSha256",
      "candidateEvidence",
      "resume",
      "candidatePresentation",
      "references",
      "rubric",
    ])
    || value.schemaVersion !== "2"
    || value.iterationId !== iteration.id
    || value.caseId !== caseId
    || value.candidateArtifactSha256 !== candidate.sha256) return false;
  return canonicalJsonSha256(value.candidateEvidence) === canonicalJsonSha256(blindArtifactBinding(candidate))
    && canonicalJsonSha256(value.resume) === canonicalJsonSha256(packet.resume)
    && canonicalJsonSha256(value.candidatePresentation)
      === canonicalJsonSha256(candidate.artifact.presentation)
    && canonicalJsonSha256(value.references) === canonicalJsonSha256(manifest.competitorReferences)
    && canonicalJsonSha256(value.rubric) === canonicalJsonSha256(GAUNTLET_REFERENCE_RUBRIC);
}

export async function loadPreparedArtifactInventory(input: {
  artifactRoot: string;
  iteration: GauntletIteration;
  manifest: GauntletManifest;
  mapping: BlindMapping | null;
  candidateOutputs: Map<string, LoadedArtifact>;
  productionOutputs: Map<string, LoadedArtifact>;
  issues: string[];
}): Promise<PreparedArtifactInventory> {
  const paths = new Set<string>();
  const referencePacketSha256 = new Map<string, string>();
  if (!input.mapping) return { paths, referencePacketSha256 };
  paths.add("operator/mapping.json");
  for (const testCase of input.manifest.cases) {
    const caseId = testCase.id;
    const mappingEntry = input.mapping.cases[caseId];
    const candidate = input.candidateOutputs.get(caseId);
    const production = input.productionOutputs.get(caseId);
    if (!mappingEntry || !candidate || !production) {
      input.issues.push(`${caseId}: prepared evidence lacks a current output pair or mapping`);
      continue;
    }
    try {
      const relativePath = `packets/${caseId}.json`;
      const { raw, value } = await readArtifactJson(input.artifactRoot, relativePath);
      if (!blindPacketShapeValid(value, input.iteration.id, caseId)) {
        throw new Error("blind packet shape or binding is invalid");
      }
      const packet = value as BlindPacket;
      if (sha256(raw) !== mappingEntry.packetSha256) {
        throw new Error("blind packet hash does not match the operator mapping");
      }
      const assetPaths = (["A", "B"] as const).map((label) => packet.variants[label].screenshot.path);
      if (new Set(assetPaths).size !== 2
        || !screenshotPathValid(caseId, "A", assetPaths[0])
        || !screenshotPathValid(caseId, "B", assetPaths[1])) {
        throw new Error("blind packet screenshot paths are not the exact case assets");
      }
      const assetIssues = await validateBlindPacketAssets(input.artifactRoot, packet, mappingEntry);
      if (assetIssues.length > 0) throw new Error(assetIssues.join("; "));
      paths.add(relativePath);
      assetPaths.forEach((assetPath) => paths.add(`packets/${assetPath}`));

      const referencePath = `reference-packets/${caseId}.json`;
      const reference = await readArtifactJson(input.artifactRoot, referencePath);
      if (!referencePacketValid({
        value: reference.value,
        iteration: input.iteration,
        manifest: input.manifest,
        caseId,
        candidate,
        packet,
      })) throw new Error("reference packet is stale or malformed");
      paths.add(referencePath);
      referencePacketSha256.set(caseId, sha256(reference.raw));
    } catch (error) {
      input.issues.push(`${caseId}: prepared evidence invalid: ${(error as Error).message}`);
    }
  }
  return { paths, referencePacketSha256 };
}

function addOutputPaths(
  expected: Set<string>,
  variant: "candidate" | "production",
  outputs: Map<string, LoadedArtifact>,
) {
  for (const [caseId, loaded] of outputs) {
    expected.add(`outputs/${variant}/${caseId}.json`);
    expected.add(loaded.artifact.presentation.screenshot.path);
  }
}

export async function validateExactArtifactInventory(input: {
  artifactRoot: string;
  iteration: GauntletIteration;
  prepared: PreparedArtifactInventory;
  evidence: Pick<LoadedEvidence,
    "candidateOutputs" | "productionOutputs" | "blindJudgments" | "sourceAudits"
    | "referenceAssessments" | "journeys">;
  criticValid: boolean;
  issues: string[];
}) {
  let actual: Array<{ path: string; sha256: string }>;
  try {
    actual = await artifactFileReceipts(input.artifactRoot);
  } catch (error) {
    input.issues.push(`${input.iteration.id}: artifact inventory is unsafe: ${(error as Error).message}`);
    return;
  }
  const expected = new Set(input.prepared.paths);
  addOutputPaths(expected, "candidate", input.evidence.candidateOutputs);
  addOutputPaths(expected, "production", input.evidence.productionOutputs);
  for (const caseId of input.evidence.blindJudgments.keys()) expected.add(`judgments/${caseId}.json`);
  for (const caseId of input.evidence.sourceAudits.keys()) expected.add(`source-audits/${caseId}.json`);
  for (const caseId of input.evidence.referenceAssessments.keys()) {
    expected.add(`reference-assessments/${caseId}.json`);
  }
  for (const [journeyId, journey] of input.evidence.journeys) {
    expected.add(`journeys/${journeyId}.json`);
    journey.evidence.forEach((receipt) => expected.add(receipt.path));
  }
  if (input.criticValid) expected.add("critic/verdict.json");

  const actualPaths = new Set(actual.map((receipt) => receipt.path));
  for (const actualPath of actualPaths) {
    if (!expected.has(actualPath)) {
      input.issues.push(`${input.iteration.id}: unreferenced or invalid evidence artifact: ${actualPath}`);
    }
  }
  for (const expectedPath of expected) {
    if (!actualPaths.has(expectedPath)) {
      input.issues.push(`${input.iteration.id}: referenced evidence artifact is missing: ${expectedPath}`);
    }
  }
  if (["pending", "baseline_pending", "retired"].includes(input.iteration.status) && actual.length > 0) {
    input.issues.push(`${input.iteration.id}: pending or retired iterations may not contain evidence artifacts`);
  }
}
