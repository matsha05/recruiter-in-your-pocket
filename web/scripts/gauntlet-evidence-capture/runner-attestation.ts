import { createHash } from "node:crypto";

const SHA256 = /^[a-f0-9]{64}$/;
const FULL_GIT_SHA = /^[a-f0-9]{40}$/;

export type LockedRunReceipt = {
  fullRunSha256: string;
  runId: string;
  generatedAt: string;
  executionMode: "live";
  model: string;
  reasoningEffort: string;
  promptVersion: string;
  canonicalPromptSha256: string;
  contractVersion: "v2";
  totalResults: number;
  selectedResults: number;
  runnerCommit: string;
  issuedAt: string;
};

export type RunnerReceiptBinding = {
  path: string;
  sha256: string;
  runnerCommit: string;
  issuedAt: string;
};

function sha256(value: Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

export function parseCommittedRunnerAttestation(
  attestationBytes: Buffer,
  expectedFullRunSha256: string,
  selectedResults: number,
) {
  let value: unknown;
  try {
    value = JSON.parse(attestationBytes.toString("utf8"));
  } catch {
    throw new Error("runner attestation is not valid JSON");
  }
  if (!record(value)
    || !exactKeys(value, [
      "schemaVersion",
      "kind",
      "issuedAt",
      "runnerCommit",
      "fullRunSha256",
      "runId",
      "generatedAt",
      "executionMode",
      "model",
      "reasoningEffort",
      "promptVersion",
      "canonicalPromptSha256",
      "contractVersion",
      "totalResults",
      "providerResponses",
      "usage",
      "costUsd",
    ])
    || value.schemaVersion !== "1"
    || value.kind !== "gauntlet-eval-runner-attestation"
    || typeof value.issuedAt !== "string"
    || !Number.isFinite(Date.parse(value.issuedAt))
    || typeof value.generatedAt !== "string"
    || !Number.isFinite(Date.parse(value.generatedAt))
    || Date.parse(value.issuedAt) < Date.parse(value.generatedAt)
    || Date.parse(value.issuedAt) - Date.parse(value.generatedAt) > 5 * 60 * 1000
    || typeof value.runnerCommit !== "string"
    || !FULL_GIT_SHA.test(value.runnerCommit)
    || typeof value.fullRunSha256 !== "string"
    || !SHA256.test(value.fullRunSha256)
    || value.fullRunSha256 !== expectedFullRunSha256
    || typeof value.runId !== "string"
    || value.runId.length === 0
    || value.executionMode !== "live"
    || typeof value.model !== "string"
    || value.model.length === 0
    || typeof value.reasoningEffort !== "string"
    || value.reasoningEffort.length === 0
    || typeof value.promptVersion !== "string"
    || value.promptVersion.length === 0
    || typeof value.canonicalPromptSha256 !== "string"
    || !SHA256.test(value.canonicalPromptSha256)
    || value.contractVersion !== "v2"
    || !Number.isInteger(value.totalResults)
    || Number(value.totalResults) < selectedResults
    || !Array.isArray(value.providerResponses)
    || value.providerResponses.length < selectedResults
    || value.providerResponses.some((response) => !record(response)
      || !exactKeys(response, ["id", "createdAt", "model"])
      || typeof response.id !== "string"
      || response.id.length === 0
      || typeof response.createdAt !== "string"
      || !Number.isFinite(Date.parse(response.createdAt))
      || Date.parse(response.createdAt) > Date.parse(String(value.issuedAt))
      || response.model !== value.model)
    || new Set(value.providerResponses.map((response) => (response as Record<string, unknown>).id)).size
      !== value.providerResponses.length
    || !record(value.usage)
    || !exactKeys(value.usage, ["promptTokens", "completionTokens", "totalTokens"])
    || !Number.isInteger(value.usage.promptTokens)
    || !Number.isInteger(value.usage.completionTokens)
    || !Number.isInteger(value.usage.totalTokens)
    || Number(value.usage.promptTokens) < 1
    || Number(value.usage.completionTokens) < 1
    || Number(value.usage.totalTokens) !== Number(value.usage.promptTokens) + Number(value.usage.completionTokens)
    || typeof value.costUsd !== "number"
    || !Number.isFinite(value.costUsd)
    || value.costUsd <= 0) {
    throw new Error("runner attestation is malformed or does not bind the full run bytes");
  }
  const receipt: LockedRunReceipt = {
    fullRunSha256: value.fullRunSha256,
    runId: value.runId,
    generatedAt: value.generatedAt,
    executionMode: "live",
    model: value.model,
    reasoningEffort: value.reasoningEffort,
    promptVersion: value.promptVersion,
    canonicalPromptSha256: value.canonicalPromptSha256,
    contractVersion: "v2",
    totalResults: Number(value.totalResults),
    selectedResults,
    runnerCommit: value.runnerCommit,
    issuedAt: value.issuedAt,
  };
  return { receipt, sha256: sha256(attestationBytes) };
}

export function parseRunnerAttestation(
  attestationBytes: Buffer,
  fullRunBytes: Buffer,
  selectedResults: number,
) {
  return parseCommittedRunnerAttestation(
    attestationBytes,
    sha256(fullRunBytes),
    selectedResults,
  );
}
