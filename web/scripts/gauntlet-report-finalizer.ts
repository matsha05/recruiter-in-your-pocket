import { createHash } from "node:crypto";
import { lstat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateResumeModelPayload } from "../lib/backend/validation";

export type GauntletFinalizerCaseInput = {
  caseId: string;
  fixtureId: string;
  resumeText: string;
  report: Record<string, unknown>;
};

export type GauntletFinalizerInput = {
  schemaVersion: "1";
  cases: GauntletFinalizerCaseInput[];
};

export type GauntletFinalizerCaseOutput = {
  caseId: string;
  fixtureId: string;
  rawReportSha256: string;
  effectiveReportSha256: string;
  report: Record<string, unknown>;
};

export type GauntletFinalizerOutput = {
  schemaVersion: "1";
  strategy: "validateResumeModelPayload(forceGrounding=true)";
  cases: GauntletFinalizerCaseOutput[];
};

function sortedJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortedJsonValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, sortedJsonValue(nested)]));
  }
  return value;
}

function canonicalJsonSha256(value: unknown) {
  return createHash("sha256").update(JSON.stringify(sortedJsonValue(value))).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertSafeInput(value: unknown): asserts value is GauntletFinalizerInput {
  if (!isRecord(value)
    || value.schemaVersion !== "1"
    || !Array.isArray(value.cases)
    || value.cases.length === 0) {
    throw new Error("finalizer input envelope is invalid");
  }
  const caseIds = new Set<string>();
  const fixtureIds = new Set<string>();
  for (const entry of value.cases) {
    if (!isRecord(entry)
      || typeof entry.caseId !== "string"
      || !/^[a-z0-9][a-z0-9-]*$/.test(entry.caseId)
      || typeof entry.fixtureId !== "string"
      || !/^[a-z0-9][a-z0-9_-]*$/.test(entry.fixtureId)
      || typeof entry.resumeText !== "string"
      || entry.resumeText.trim().length === 0
      || !isRecord(entry.report)) {
      throw new Error("finalizer input contains a malformed case");
    }
    if (caseIds.has(entry.caseId) || fixtureIds.has(entry.fixtureId)) {
      throw new Error("finalizer input contains duplicate case or fixture ids");
    }
    caseIds.add(entry.caseId);
    fixtureIds.add(entry.fixtureId);
  }
}

/**
 * Runs the same commit-contained validation pipeline used by the live backend.
 * Cloning is deliberate: the historical raw report remains immutable evidence.
 */
export function finalizeGauntletReports(input: GauntletFinalizerInput): GauntletFinalizerOutput {
  assertSafeInput(input);
  return {
    schemaVersion: "1",
    strategy: "validateResumeModelPayload(forceGrounding=true)",
    cases: input.cases.map((entry) => {
      const rawReportSha256 = canonicalJsonSha256(entry.report);
      let validated: unknown;
      try {
        validated = validateResumeModelPayload(
          structuredClone(entry.report),
          entry.resumeText,
          { forceGrounding: true },
        );
      } catch (error) {
        throw new Error(`${entry.caseId}: ${(error as Error).message}`, { cause: error });
      }
      if (!isRecord(validated)) throw new Error(`finalizer returned a malformed report for ${entry.caseId}`);
      return {
        caseId: entry.caseId,
        fixtureId: entry.fixtureId,
        rawReportSha256,
        effectiveReportSha256: canonicalJsonSha256(validated),
        report: validated,
      };
    }),
  };
}

function parseCli(argv: string[]) {
  const values = new Map<string, string>();
  for (const token of argv) {
    const match = /^--(input|output)=(.+)$/.exec(token);
    if (!match) throw new Error(`invalid finalizer argument: ${token}`);
    if (values.has(match[1])) throw new Error(`duplicate finalizer argument: --${match[1]}`);
    values.set(match[1], match[2]);
  }
  const input = values.get("input");
  const output = values.get("output");
  if (!input || !output || values.size !== 2) throw new Error("--input and --output are required");
  return { input: path.resolve(input), output: path.resolve(output) };
}

export async function runGauntletReportFinalizerCli(argv: string[]) {
  const files = parseCli(argv);
  const stats = await lstat(files.input);
  if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("finalizer input must be a regular file");
  const parsed = JSON.parse(await readFile(files.input, "utf8")) as unknown;
  assertSafeInput(parsed);
  const output = finalizeGauntletReports(parsed);
  await writeFile(files.output, `${JSON.stringify(sortedJsonValue(output), null, 2)}\n`, { flag: "wx" });
  return output;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runGauntletReportFinalizerCli(process.argv.slice(2)).catch((error) => {
    console.error(`Gauntlet report finalization failed: ${(error as Error).message}`);
    process.exitCode = 1;
  });
}
