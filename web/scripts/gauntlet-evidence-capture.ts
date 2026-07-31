import path from "node:path";
import { mkdir, realpath } from "node:fs/promises";
import { captureGauntletEvidence } from "./gauntlet-evidence-capture/browser";
import { sanitizeHistoricalRunFiles } from "./gauntlet-evidence-capture/contracts";
import { createCapturePlan, gitText, safeCapturePlanSummary } from "./gauntlet-evidence-capture/repository";

type Command = "extract" | "capture";

export type CaptureCli = {
  command: Command;
  write: boolean;
  values: Record<string, string>;
};

const ALLOWED: Record<Command, Set<string>> = {
  extract: new Set(["source", "manifest", "output"]),
  capture: new Set([
    "repository-root",
    "manifest",
    "iteration",
    "candidate-commit",
    "source-commit",
    "source-path",
    "output",
  ]),
};

const REQUIRED: Record<Command, string[]> = {
  extract: ["source", "manifest"],
  capture: ["repository-root", "manifest", "iteration", "candidate-commit", "source-commit", "source-path"],
};

export function parseCaptureCli(argv: string[]): CaptureCli {
  const [commandValue, ...tokens] = argv;
  if (commandValue !== "extract" && commandValue !== "capture") {
    throw new Error("command must be extract or capture");
  }
  const command = commandValue as Command;
  const values: Record<string, string> = {};
  let write = false;
  for (const token of tokens) {
    if (token === "--write") {
      if (write) throw new Error("--write may only be supplied once");
      write = true;
      continue;
    }
    const match = /^--([a-z][a-z-]*)=(.+)$/.exec(token);
    if (!match) throw new Error(`invalid argument: ${token}`);
    const [, key, value] = match;
    if (!ALLOWED[command].has(key)) throw new Error(`unknown ${command} argument: --${key}`);
    if (Object.prototype.hasOwnProperty.call(values, key)) throw new Error(`duplicate argument: --${key}`);
    values[key] = value;
  }
  for (const key of REQUIRED[command]) {
    if (!values[key]) throw new Error(`--${key} is required`);
  }
  if (write && !values.output) throw new Error("--output is required with --write");
  return { command, write, values };
}

async function canonicalSourceOutput(manifestPath: string, outputPath: string) {
  const repositoryRoot = await gitText(path.dirname(manifestPath), ["rev-parse", "--show-toplevel"]);
  const canonicalManifest = await realpath(path.join(repositoryRoot, "web/gauntlet/manifest.json"));
  if (await realpath(manifestPath) !== canonicalManifest) {
    throw new Error("extract must use the repository's canonical Gauntlet manifest");
  }
  const expectedParentPath = path.join(repositoryRoot, "web/gauntlet/sources");
  await mkdir(expectedParentPath, { recursive: true });
  const expectedParent = await realpath(expectedParentPath);
  const resolved = path.resolve(outputPath);
  if (path.dirname(resolved) !== expectedParent || !/^[a-z0-9][a-z0-9-]*\.json$/.test(path.basename(resolved))) {
    throw new Error("extract output must be a web/gauntlet/sources lowercase JSON file");
  }
  return resolved;
}

export async function runCaptureCli(argv: string[]) {
  const parsed = parseCaptureCli(argv);
  if (parsed.command === "extract") {
    const sourcePath = path.resolve(parsed.values.source);
    const manifestPath = path.resolve(parsed.values.manifest);
    const outputPath = parsed.write
      ? await canonicalSourceOutput(manifestPath, parsed.values.output)
      : undefined;
    const result = await sanitizeHistoricalRunFiles({
      sourcePath,
      manifestPath,
      outputPath,
      write: parsed.write,
    });
    return {
      command: "extract",
      write: parsed.write,
      target: outputPath ?? null,
      sanitizedSha256: result.sha256,
      byteLength: result.byteLength,
      caseIds: result.sanitized.results.map((entry) => entry.caseId),
      excludedResultCount: result.sanitized.selection.excludedResultCount,
      runId: result.sanitized.sourceRun.runId,
    };
  }

  const repositoryRoot = path.resolve(parsed.values["repository-root"]);
  const plan = await createCapturePlan({
    repositoryRoot,
    manifestPath: path.resolve(parsed.values.manifest),
    iterationId: parsed.values.iteration,
    candidateCommit: parsed.values["candidate-commit"],
    sourceCommit: parsed.values["source-commit"],
    sourcePath: parsed.values["source-path"],
  });
  if (!parsed.write) return { command: "capture", ...safeCapturePlanSummary(plan) };
  const target = await captureGauntletEvidence(plan, path.resolve(parsed.values.output));
  return {
    command: "capture",
    write: true,
    target,
    casePairs: plan.manifest.cases.length,
    journeys: plan.manifest.requiredJourneys.length,
    productionCommit: plan.productionCommit,
    candidateCommit: plan.candidateCommit,
    sourceCommit: plan.sourceCommit,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runCaptureCli(process.argv.slice(2)).then(
    (summary) => console.log(JSON.stringify(summary, null, 2)),
    (error) => {
      console.error(`Gauntlet evidence capture failed: ${(error as Error).message}`);
      process.exitCode = 1;
    },
  );
}
