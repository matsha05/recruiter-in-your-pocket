import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  canonicalJsonSha256,
  isSafeRepositoryPath,
  resolveContainedExistingPath,
  sha256,
} from "../integrity";
import {
  GAUNTLET_DIMENSIONS,
  type BlindArtifactBinding,
  type BlindJudgment,
  type BlindMapping,
  type BlindPacket,
  type GauntletDimension,
  type GauntletIteration,
  type GauntletManifest,
  type JourneyRun,
  type ReferenceAssessment,
  type SourceAudit,
  type Variant,
} from "../types";
import {
  JOURNEY_FRESHNESS_MS,
  hasExactKeys,
  isIsoTimestamp,
  isNonEmptyString,
  isRecord,
  isSha256,
  readJson,
  readJsonDirectory,
  timestampInsideIteration,
  type LoadedArtifact,
  type ResolvedBlindJudgment,
} from "./common";
import { blindArtifactBinding } from "./outputs";

export function validBlindArtifactBinding(value: unknown): value is BlindArtifactBinding {
  return isRecord(value) && hasExactKeys(value, [
    "artifactSha256",
    "reportSha256",
    "fixtureSha256",
    "generationSourceSha256",
    "canonicalPromptSha256",
    "promptSha256",
    "rendererSha256",
    "visibleTextSha256",
    "screenshotSha256",
    "finalizationSha256",
  ]) && [
    value.artifactSha256,
    value.reportSha256,
    value.fixtureSha256,
    value.generationSourceSha256,
    value.canonicalPromptSha256,
    value.promptSha256,
    value.rendererSha256,
    value.visibleTextSha256,
    value.screenshotSha256,
    value.finalizationSha256,
  ].every(isSha256);
}

function artifactBindingsMatch(left: BlindArtifactBinding, right: BlindArtifactBinding) {
  return canonicalJsonSha256(left) === canonicalJsonSha256(right);
}

export async function loadMapping(
  artifactRoot: string,
  iteration: GauntletIteration,
  manifest: GauntletManifest,
  candidateOutputs: Map<string, LoadedArtifact>,
  productionOutputs: Map<string, LoadedArtifact>,
  issues: string[],
) {
  const filePath = path.join(artifactRoot, "operator/mapping.json");
  if (!existsSync(filePath)) return null;
  try {
    const safePath = await resolveContainedExistingPath(artifactRoot, "operator/mapping.json");
    const mapping = await readJson<BlindMapping>(safePath);
    if (!isRecord(mapping)
      || !hasExactKeys(mapping, ["schemaVersion", "iterationId", "createdAt", "cases"])
      || mapping.schemaVersion !== "2"
      || mapping.iterationId !== iteration.id
      || !isIsoTimestamp(mapping.createdAt)
      || !timestampInsideIteration(mapping.createdAt, iteration)
      || !isRecord(mapping.cases)) {
      issues.push("operator/mapping.json does not match the selected iteration");
      return null;
    }
    const knownCases = new Set(manifest.cases.map((testCase) => testCase.id));
    const mappedCases = Object.keys(mapping.cases);
    if (mappedCases.length !== knownCases.size || [...knownCases].some((caseId) => !mappedCases.includes(caseId))) {
      issues.push("operator/mapping.json must contain the exact configured case set");
      return null;
    }
    for (const [caseId, entry] of Object.entries(mapping.cases)) {
      const candidate = candidateOutputs.get(caseId);
      const production = productionOutputs.get(caseId);
      if (!knownCases.has(caseId)
        || !isRecord(entry)
        || !hasExactKeys(entry, ["packetSha256", "labels", "artifacts"])
        || !isSha256(entry?.packetSha256)
        || !isRecord(entry?.labels)
        || !hasExactKeys(entry.labels, ["A", "B"])
        || !["candidate", "production"].includes(entry.labels.A)
        || !["candidate", "production"].includes(entry.labels.B)
        || entry.labels.A === entry.labels.B
        || !isRecord(entry.artifacts)
        || !hasExactKeys(entry.artifacts, ["candidate", "production"])
        || !validBlindArtifactBinding(entry.artifacts.candidate)
        || !validBlindArtifactBinding(entry.artifacts.production)
        || !candidate
        || !production
        || !artifactBindingsMatch(entry.artifacts.candidate, blindArtifactBinding(candidate))
        || !artifactBindingsMatch(entry.artifacts.production, blindArtifactBinding(production))) {
        issues.push(`operator/mapping.json has a stale or invalid entry for ${caseId}`);
        return null;
      }
    }
    return mapping;
  } catch (error) {
    issues.push(`operator/mapping.json is invalid: ${(error as Error).message}`);
    return null;
  }
}

export async function validateBlindPacketAssets(
  artifactRoot: string,
  packet: BlindPacket,
  mappingEntry: BlindMapping["cases"][string],
) {
  const issues: string[] = [];
  if (packet.resume.sha256 !== sha256(packet.resume.text)
    || packet.resume.sha256 !== mappingEntry.artifacts.candidate.fixtureSha256
    || packet.resume.sha256 !== mappingEntry.artifacts.production.fixtureSha256) {
    issues.push("resume receipt does not match the packet text and bound fixture pair");
  }
  for (const label of ["A", "B"] as const) {
    const presentation = packet.variants?.[label];
    const mappedVariant = mappingEntry.labels[label];
    const binding = mappingEntry.artifacts[mappedVariant];
    if (!isRecord(presentation)
      || presentation.kind !== "rendered_report"
      || !hasExactKeys(presentation, [
        "kind", "route", "viewport", "visibleText", "visibleTextSha256", "screenshot",
      ])
      || !isNonEmptyString(presentation.visibleText)
      || presentation.visibleText.length < 200
      || presentation.visibleTextSha256 !== sha256(presentation.visibleText)
      || presentation.visibleTextSha256 !== binding.visibleTextSha256
      || !isNonEmptyString(presentation.route)
      || !isRecord(presentation.viewport)
      || !hasExactKeys(presentation.viewport, ["width", "height"])
      || !Number.isInteger(presentation.viewport.width)
      || !Number.isInteger(presentation.viewport.height)
      || presentation.viewport.width < 320
      || presentation.viewport.height < 480) {
      issues.push(`variant ${label} is missing or stale rendered-presentation evidence`);
      continue;
    }
    const screenshot = presentation.screenshot;
    if (!isRecord(screenshot)
      || !hasExactKeys(screenshot, ["path", "sha256"])
      || !isSafeRepositoryPath(screenshot.path)
      || !isSha256(screenshot.sha256)
      || screenshot.sha256 !== binding.screenshotSha256) {
      issues.push(`variant ${label} is missing or stale screenshot evidence`);
      continue;
    }
    try {
      const resolved = await resolveContainedExistingPath(path.join(artifactRoot, "packets"), screenshot.path);
      if (sha256(await readFile(resolved)) !== screenshot.sha256) {
        issues.push(`variant ${label} screenshot hash does not match`);
      }
    } catch (error) {
      issues.push(`variant ${label} screenshot is not safely inspectable: ${(error as Error).message}`);
    }
  }
  return issues;
}

function validDimensionRecord(value: unknown, accepted: Set<string>, requireNarrative = false) {
  if (!isRecord(value) || !hasExactKeys(value, [...GAUNTLET_DIMENSIONS])) return false;
  return GAUNTLET_DIMENSIONS.every((dimension) => requireNarrative
    ? isNonEmptyString(value[dimension])
    : accepted.has(String(value[dimension])));
}

export async function loadBlindJudgments(
  artifactRoot: string,
  iteration: GauntletIteration,
  manifest: GauntletManifest,
  mapping: BlindMapping | null,
  issues: string[],
) {
  const output = new Map<string, ResolvedBlindJudgment>();
  const knownCases = new Set(manifest.cases.map((testCase) => testCase.id));
  const records = await readJsonDirectory<BlindJudgment>(artifactRoot, "judgments", issues);
  const accepted = new Set(["A", "B", "tie"]);
  for (const { filePath, value } of records) {
    const label = path.basename(filePath);
    if (value?.schemaVersion !== "2"
      || !isRecord(value)
      || !hasExactKeys(value, [
        "schemaVersion", "iterationId", "caseId", "packetSha256", "artifacts",
        "reviewer", "reviewedAt", "preferences", "rationale",
      ])
      || value.iterationId !== iteration.id
      || !knownCases.has(value.caseId)
      || path.basename(filePath) !== `${value.caseId}.json`
      || !isNonEmptyString(value.reviewer)
      || !isIsoTimestamp(value.reviewedAt)
      || !timestampInsideIteration(value.reviewedAt, iteration)
      || !validDimensionRecord(value.preferences, accepted)
      || !validDimensionRecord(value.rationale, new Set(), true)) {
      issues.push(`${label}: blind judgment is incomplete or invalid`);
      continue;
    }
    const mappingEntry = mapping?.cases[value.caseId];
    const packetRelative = `packets/${value.caseId}.json`;
    if (!mappingEntry || !existsSync(path.join(artifactRoot, packetRelative))) {
      issues.push(`${label}: no current packet and unblinding entry exist for this judgment`);
      continue;
    }
    let packetRaw: string;
    let packet: BlindPacket;
    try {
      const packetPath = await resolveContainedExistingPath(artifactRoot, packetRelative);
      packetRaw = await readFile(packetPath, "utf8");
      packet = JSON.parse(packetRaw) as BlindPacket;
    } catch (error) {
      issues.push(`${label}: blind packet is invalid: ${(error as Error).message}`);
      continue;
    }
    if (packet.schemaVersion !== "2" || packet.iterationId !== iteration.id || packet.caseId !== value.caseId) {
      issues.push(`${label}: blind packet does not match this judgment`);
      continue;
    }
    const packetIssues = await validateBlindPacketAssets(artifactRoot, packet, mappingEntry);
    if (packetIssues.length > 0) {
      issues.push(...packetIssues.map((issue) => `${label}: ${issue}`));
      continue;
    }
    const packetHash = sha256(packetRaw);
    const judgmentsBindArtifacts = isRecord(value.artifacts)
      && validBlindArtifactBinding(value.artifacts.candidate)
      && validBlindArtifactBinding(value.artifacts.production)
      && artifactBindingsMatch(value.artifacts.candidate, mappingEntry.artifacts.candidate)
      && artifactBindingsMatch(value.artifacts.production, mappingEntry.artifacts.production);
    if (packetHash !== mappingEntry.packetSha256
      || value.packetSha256 !== packetHash
      || !judgmentsBindArtifacts) {
      issues.push(`${label}: judgment is stale for the current output pair or blind packet`);
      continue;
    }
    if (output.has(value.caseId)) {
      issues.push(`duplicate blind judgment for ${value.caseId}`);
      continue;
    }
    output.set(value.caseId, {
      caseId: value.caseId,
      reviewer: value.reviewer,
      reviewedAt: value.reviewedAt,
      rationale: value.rationale,
      preferences: Object.fromEntries(GAUNTLET_DIMENSIONS.map((dimension) => {
        const preference = value.preferences[dimension];
        return [dimension, preference === "tie" ? "tie" : mappingEntry.labels[preference]];
      })) as Record<GauntletDimension, Variant | "tie">,
    });
  }
  return output;
}

export async function loadSourceAudits(
  artifactRoot: string,
  iteration: GauntletIteration,
  candidateOutputs: Map<string, LoadedArtifact>,
  issues: string[],
) {
  const output = new Map<string, SourceAudit>();
  const records = await readJsonDirectory<SourceAudit>(artifactRoot, "source-audits", issues);
  for (const { filePath, value } of records) {
    const candidate = candidateOutputs.get(value?.caseId);
    const factsValid = Array.isArray(value?.inventedFacts) && value.inventedFacts.every((fact) => isRecord(fact)
      && hasExactKeys(fact, ["claim", "reason"])
      && isNonEmptyString(fact.claim) && isNonEmptyString(fact.reason));
    if (value?.schemaVersion !== "2"
      || !isRecord(value)
      || !hasExactKeys(value, [
        "schemaVersion", "iterationId", "caseId", "candidateArtifactSha256",
        "auditor", "auditedAt", "inventedFacts", "notes",
      ])
      || value.iterationId !== iteration.id
      || path.basename(filePath) !== `${value.caseId}.json`
      || !candidate
      || candidate.sha256 !== value.candidateArtifactSha256
      || !isNonEmptyString(value.auditor)
      || !isIsoTimestamp(value.auditedAt)
      || !timestampInsideIteration(value.auditedAt, iteration)
      || !factsValid
      || !isNonEmptyString(value.notes)) {
      issues.push(`${path.basename(filePath)}: source audit is invalid or stale`);
      continue;
    }
    if (output.has(value.caseId)) issues.push(`duplicate source audit for ${value.caseId}`);
    else output.set(value.caseId, value);
  }
  return output;
}

export async function loadReferenceAssessments(
  artifactRoot: string,
  iteration: GauntletIteration,
  manifest: GauntletManifest,
  candidateOutputs: Map<string, LoadedArtifact>,
  referencePacketSha256: Map<string, string>,
  issues: string[],
) {
  const output = new Map<string, ReferenceAssessment>();
  const knownReferences = new Set(manifest.competitorReferences.map((reference) => reference.id));
  const acceptedVerdicts = new Set(["meets_or_beats", "trails", "inconclusive"]);
  const records = await readJsonDirectory<ReferenceAssessment>(artifactRoot, "reference-assessments", issues);
  for (const { filePath, value } of records) {
    const candidate = candidateOutputs.get(value?.caseId);
    let valid = value?.schemaVersion === "2"
      && isRecord(value)
      && hasExactKeys(value, [
        "schemaVersion", "iterationId", "caseId", "candidateArtifactSha256",
        "referencePacketSha256", "assessor", "assessedAt", "dimensions",
      ])
      && value.iterationId === iteration.id
      && path.basename(filePath) === `${value.caseId}.json`
      && Boolean(candidate)
      && candidate?.sha256 === value.candidateArtifactSha256
      && referencePacketSha256.get(value.caseId) === value.referencePacketSha256
      && isNonEmptyString(value.assessor)
      && isIsoTimestamp(value.assessedAt)
      && timestampInsideIteration(value.assessedAt, iteration)
      && isRecord(value.dimensions);
    if (valid) {
      valid = hasExactKeys(value.dimensions, [...GAUNTLET_DIMENSIONS]);
    }
    if (valid) {
      valid = GAUNTLET_DIMENSIONS.every((dimension) => {
        const assessment = value.dimensions[dimension];
        return isRecord(assessment)
          && hasExactKeys(assessment, ["verdict", "evidence", "referenceIds"])
          && acceptedVerdicts.has(String(assessment.verdict))
          && Array.isArray(assessment.referenceIds)
          && assessment.referenceIds.length > 0
          && assessment.referenceIds.every((id) => knownReferences.has(String(id)))
          && isNonEmptyString(assessment.evidence);
      });
    }
    if (!valid) issues.push(`${path.basename(filePath)}: reference assessment is invalid or stale`);
    else if (output.has(value.caseId)) issues.push(`duplicate reference assessment for ${value.caseId}`);
    else output.set(value.caseId, value);
  }
  return output;
}

async function validateJourneyEvidenceAsset(
  artifactRoot: string,
  journeyId: string,
  evidence: JourneyRun["evidence"][number],
) {
  if (!isSafeRepositoryPath(evidence.path)
    || !evidence.path.startsWith(`journeys/evidence/${journeyId}-`)
    || !isSha256(evidence.sha256)) return "journey evidence path or hash is invalid";
  try {
    const filePath = await resolveContainedExistingPath(artifactRoot, evidence.path);
    if (sha256(await readFile(filePath)) !== evidence.sha256) return "journey evidence hash does not match";
  } catch (error) {
    return `journey evidence is not safely inspectable: ${(error as Error).message}`;
  }
  return null;
}

export async function loadJourneys(
  artifactRoot: string,
  iteration: GauntletIteration,
  manifest: GauntletManifest,
  issues: string[],
) {
  const output = new Map<string, JourneyRun>();
  const journeyById = new Map(manifest.requiredJourneys.map((journey) => [journey.id, journey]));
  const records = await readJsonDirectory<JourneyRun>(artifactRoot, "journeys", issues);
  for (const { filePath, value } of records) {
    const journey = journeyById.get(value?.journeyId);
    let valid = value?.schemaVersion === "2"
      && isRecord(value)
      && hasExactKeys(value, [
        "schemaVersion", "iterationId", "journeyId", "candidateCommit",
        "journeyDefinitionSha256", "testedAt", "completed", "viewport", "entryPath",
        "finalPath", "steps", "evidence", "criticalFailures", "notes",
      ])
      && value.iterationId === iteration.id
      && path.basename(filePath) === `${value.journeyId}.json`
      && Boolean(journey)
      && value.candidateCommit === iteration.candidate.commit
      && value.journeyDefinitionSha256 === canonicalJsonSha256(journey)
      && value.viewport === journey?.viewport
      && value.completed === true
      && isIsoTimestamp(value.testedAt)
      && isNonEmptyString(value.entryPath) && value.entryPath.startsWith("/") && !value.entryPath.startsWith("//")
      && isNonEmptyString(value.finalPath) && value.finalPath.startsWith("/") && !value.finalPath.startsWith("//")
      && Array.isArray(value.steps) && value.steps.length > 0
      && value.steps.every((step) => isRecord(step)
        && hasExactKeys(step, ["label", "status", "evidence"])
        && isNonEmptyString(step.label)
        && ["pass", "fail"].includes(step.status)
        && isNonEmptyString(step.evidence))
      && Array.isArray(value.evidence)
      && value.evidence.every((item) => isRecord(item)
        && hasExactKeys(item, ["kind", "path", "sha256"]))
      && Array.isArray(value.criticalFailures)
      && value.criticalFailures.every((failure) => isRecord(failure)
        && hasExactKeys(failure, ["title", "evidence"])
        && isNonEmptyString(failure.title)
        && isNonEmptyString(failure.evidence))
      && isNonEmptyString(value.notes);
    if (valid) {
      const testedAt = Date.parse(value.testedAt);
      const lowerBound = Date.parse(iteration.createdAt);
      const upperBound = iteration.seal ? Date.parse(iteration.seal.sealedAt) : Date.now();
      valid = testedAt >= lowerBound
        && testedAt <= upperBound
        && upperBound - testedAt <= JOURNEY_FRESHNESS_MS;
    }
    if (valid) {
      const kinds = new Set(value.evidence.map((item) => item.kind));
      valid = ["screenshot", "dom", "console", "interaction"]
        .every((kind) => kinds.has(kind as JourneyRun["evidence"][number]["kind"]));
    }
    if (valid) {
      const evidencePaths = new Set<string>();
      for (const item of value.evidence) {
        if (evidencePaths.has(item.path)) {
          valid = false;
          break;
        }
        evidencePaths.add(item.path);
        const assetIssue = await validateJourneyEvidenceAsset(artifactRoot, value.journeyId, item);
        if (assetIssue) {
          issues.push(`${path.basename(filePath)}: ${assetIssue}`);
          valid = false;
        }
      }
    }
    if (valid && value.steps.some((step) => step.status === "fail") && value.criticalFailures.length === 0) {
      valid = false;
    }
    if (!valid) issues.push(`${path.basename(filePath)}: journey receipt is stale, incomplete, or invalid`);
    else if (output.has(value.journeyId)) issues.push(`duplicate journey receipt for ${value.journeyId}`);
    else output.set(value.journeyId, value);
  }
  return output;
}
