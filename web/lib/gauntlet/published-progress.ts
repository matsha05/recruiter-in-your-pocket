import { createHash } from "node:crypto";
import publishedBundle from "../../gauntlet/published/progress.json";
import type { GauntletProgressSnapshot } from "./types";

const SAFE_COMPONENT = /^[a-z0-9][a-z0-9_-]*$/;
const SHA256 = /^[a-f0-9]{64}$/;

export type PublishedSnapshotEntry = {
  iterationId: string;
  sha256: string;
  snapshot: GauntletProgressSnapshot;
};

export type PublishedProgressBundle = {
  schemaVersion: "1";
  activeIterationId: string;
  snapshots: PublishedSnapshotEntry[];
};

export class UnknownPublishedGauntletIterationError extends Error {}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function assertSafeComponent(value: string, label: string) {
  if (!SAFE_COMPONENT.test(value)) throw new Error(`Unsafe ${label}: ${value}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validatePublishedProgressBundle(value: unknown): PublishedProgressBundle {
  if (!isRecord(value)
    || value.schemaVersion !== "1"
    || typeof value.activeIterationId !== "string"
    || !Array.isArray(value.snapshots)) {
    throw new Error("Published Gauntlet progress bundle is malformed");
  }
  assertSafeComponent(value.activeIterationId, "active iteration id");
  const seen = new Set<string>();
  const snapshots = value.snapshots.map((entry) => {
    if (!isRecord(entry)
      || typeof entry.iterationId !== "string"
      || typeof entry.sha256 !== "string"
      || !isRecord(entry.snapshot)) {
      throw new Error("Published Gauntlet bundle contains a malformed snapshot entry");
    }
    assertSafeComponent(entry.iterationId, "published iteration id");
    if (!SHA256.test(entry.sha256)
      || !isRecord(entry.snapshot.iteration)
      || entry.snapshot.iteration.id !== entry.iterationId
      || !isRecord(entry.snapshot.manifest)
      || entry.snapshot.manifest.activeIterationId !== value.activeIterationId
      || !Array.isArray(entry.snapshot.iterations)
      || !Array.isArray(entry.snapshot.gates)
      || !Array.isArray(entry.snapshot.cases)
      || !Array.isArray(entry.snapshot.baselineGaps)
      || !Array.isArray(entry.snapshot.dataIssues)) {
      throw new Error(`Published Gauntlet snapshot is malformed: ${entry.iterationId}`);
    }
    if (seen.has(entry.iterationId)) throw new Error(`Duplicate published Gauntlet iteration: ${entry.iterationId}`);
    seen.add(entry.iterationId);
    if (sha256(JSON.stringify(entry.snapshot)) !== entry.sha256) {
      throw new Error(`Published Gauntlet snapshot hash mismatch: ${entry.iterationId}`);
    }
    return {
      iterationId: entry.iterationId,
      sha256: entry.sha256,
      snapshot: entry.snapshot as unknown as GauntletProgressSnapshot,
    };
  });
  if (!seen.has(value.activeIterationId)) {
    throw new Error("Published Gauntlet bundle does not contain its active iteration");
  }
  return {
    schemaVersion: "1",
    activeIterationId: value.activeIterationId,
    snapshots,
  };
}

export async function getPublishedGauntletProgress(requestedIterationId?: string) {
  if (requestedIterationId !== undefined) assertSafeComponent(requestedIterationId, "iteration selector");
  const bundle = validatePublishedProgressBundle(publishedBundle as unknown);
  const iterationId = requestedIterationId ?? bundle.activeIterationId;
  const entry = bundle.snapshots.find((candidate) => candidate.iterationId === iterationId);
  if (!entry) {
    throw new UnknownPublishedGauntletIterationError(`Unknown published Gauntlet iteration: ${iterationId}`);
  }
  return entry.snapshot;
}
