#!/usr/bin/env npx tsx
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { config } from "dotenv";
import type { EvalOptions, EvalRunOutput } from "../lib/evals/types";
import { parseReasoningEffort } from "../lib/llm/model-config";
import { parseCommittedRunnerAttestation } from "./gauntlet-evidence-capture/runner-attestation";

config({ path: ".env.local" });

const execFileAsync = promisify(execFile);
const OPENAI_CHAT_COMPLETIONS = "https://api.openai.com/v1/chat/completions";

type ProviderIdentity = { id: string; createdAt: string; model: string };

function sha256(value: Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function positiveNumber(raw: string, label: string) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be a positive number`);
  return value;
}

function positiveInteger(raw: string, label: string) {
  const value = positiveNumber(raw, label);
  if (!Number.isInteger(value)) throw new Error(`${label} must be a positive integer`);
  return value;
}

export function parseGauntletEvalCli(argv: string[]) {
  const values: Record<string, string> = {};
  const allowed = new Set([
    "attestation",
    "model",
    "reasoning-effort",
    "budget-usd",
    "max-calls",
    "max-completion-tokens",
    "concurrency",
    "prompt-version",
  ]);
  for (const token of argv) {
    const match = /^--([a-z][a-z-]*)=(.+)$/.exec(token);
    if (!match) throw new Error(`invalid argument: ${token}`);
    const [, key, value] = match;
    if (!allowed.has(key)) throw new Error(`unknown argument: --${key}`);
    if (Object.prototype.hasOwnProperty.call(values, key)) throw new Error(`duplicate argument: --${key}`);
    values[key] = value;
  }
  if (!values.attestation) throw new Error("--attestation is required");
  const reasoningEffort = values["reasoning-effort"]
    ? parseReasoningEffort(values["reasoning-effort"])
    : undefined;
  if (values["reasoning-effort"] && !reasoningEffort) {
    throw new Error(`unsupported reasoning effort: ${values["reasoning-effort"]}`);
  }
  const options: EvalOptions = {
    tier: "golden",
    budgetUsd: positiveNumber(values["budget-usd"] || "5", "--budget-usd"),
    maxCalls: positiveInteger(values["max-calls"] || "100", "--max-calls"),
    maxCompletionTokens: positiveInteger(
      values["max-completion-tokens"] || "24000",
      "--max-completion-tokens",
    ),
    concurrency: positiveInteger(values.concurrency || "3", "--concurrency"),
    dryRun: false,
    model: values.model,
    reasoningEffort,
    promptVersion: values["prompt-version"],
    outputLabel: "gauntlet_iteration_002",
  };
  return { attestationPath: path.resolve(values.attestation), options };
}

async function gitText(repositoryRoot: string, args: string[]) {
  const result = await execFileAsync("git", ["-C", repositoryRoot, ...args], {
    env: { ...process.env, GIT_NO_REPLACE_OBJECTS: "1" },
    maxBuffer: 4 * 1024 * 1024,
  });
  return result.stdout.trim();
}

async function runnerCommitFor(repositoryRoot: string) {
  const commit = await gitText(repositoryRoot, ["rev-parse", "HEAD"]);
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("runner HEAD is not a full Git commit");
  const dirty = await gitText(repositoryRoot, [
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ]);
  if (dirty) throw new Error(`repository worktree differs from ${commit}; commit or remove every change before spending`);
  return commit;
}

function providerCreatedAt(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return new Date(value * 1000).toISOString();
  if (typeof value === "string" && Number.isFinite(Date.parse(value))) return new Date(value).toISOString();
  return null;
}

function installProviderIdentityRecorder(output: ProviderIdentity[]) {
  const nativeFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (request, init) => {
    const response = await nativeFetch(request, init);
    const url = typeof request === "string"
      ? request
      : request instanceof URL ? request.href : request.url;
    if (url === OPENAI_CHAT_COMPLETIONS && response.ok) {
      const body = await response.clone().json() as Record<string, unknown>;
      const createdAt = providerCreatedAt(body.created);
      if (typeof body.id !== "string" || !body.id || typeof body.model !== "string" || !body.model || !createdAt) {
        throw new Error("provider response omitted its immutable id, creation time, or model");
      }
      output.push({ id: body.id, createdAt, model: body.model });
    }
    return response;
  };
  return () => {
    globalThis.fetch = nativeFetch;
  };
}

async function assertSelectedCasesPassed(output: EvalRunOutput, caseCount: number, fixtureIds: string[]) {
  const byFixture = new Map(output.results.map((result) => [result.fixture_id, result]));
  if (fixtureIds.length !== caseCount || new Set(fixtureIds).size !== caseCount) {
    throw new Error("Gauntlet manifest does not contain the exact case target");
  }
  for (const fixtureId of fixtureIds) {
    const result = byFixture.get(fixtureId);
    if (!result || result.status !== "PASS" || result.response_model !== output.metadata.model) {
      throw new Error(`Gauntlet fixture did not pass on the bound model: ${fixtureId}`);
    }
  }
}

function rawRunPath(output: EvalRunOutput) {
  return path.resolve(
    process.cwd(),
    "../tests/fixtures/results",
    `${output.metadata.timestamp.replace(/[:.]/g, "-")}_${output.metadata.execution_mode}_run.json`,
  );
}

export async function runGauntletEval(argv: string[]) {
  const { attestationPath, options } = parseGauntletEvalCli(argv);
  if (existsSync(attestationPath)) throw new Error("attestation target already exists; refusing to overwrite it");
  const repositoryRoot = await gitText(process.cwd(), ["rev-parse", "--show-toplevel"]);
  const runnerCommit = await runnerCommitFor(repositoryRoot);
  const manifest = JSON.parse(await readFile(path.join(process.cwd(), "gauntlet/manifest.json"), "utf8")) as {
    target: { caseCount: number };
    cases: Array<{ fixtureId: string }>;
  };
  const providerResponses: ProviderIdentity[] = [];
  const restoreFetch = installProviderIdentityRecorder(providerResponses);
  let output: EvalRunOutput;
  try {
    const { runEval } = await import("../lib/evals/runner");
    output = await runEval(options);
  } finally {
    restoreFetch();
  }
  await assertSelectedCasesPassed(
    output,
    manifest.target.caseCount,
    manifest.cases.map((testCase) => testCase.fixtureId),
  );
  if (providerResponses.length < manifest.target.caseCount
    || new Set(providerResponses.map((response) => response.id)).size !== providerResponses.length) {
    throw new Error("provider response identity set is incomplete or duplicated");
  }
  const sourcePath = rawRunPath(output);
  const sourceBytes = await readFile(sourcePath);
  const expectedBytes = Buffer.from(JSON.stringify(output, null, 2));
  if (!sourceBytes.equals(expectedBytes)) throw new Error("saved raw run bytes differ from the returned eval run");
  const usage = output.metadata.token_usage;
  const attestation = {
    schemaVersion: "1",
    kind: "gauntlet-eval-runner-attestation",
    issuedAt: new Date().toISOString(),
    runnerCommit,
    fullRunSha256: sha256(sourceBytes),
    runId: output.metadata.run_id,
    generatedAt: output.metadata.timestamp,
    executionMode: "live",
    model: output.metadata.model,
    reasoningEffort: output.metadata.reasoning_effort,
    promptVersion: output.metadata.prompt_version_hash,
    canonicalPromptSha256: output.metadata.resume_prompt_sha256,
    contractVersion: "v2",
    totalResults: output.results.length,
    providerResponses,
    usage: {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.prompt_tokens + usage.completion_tokens,
    },
    costUsd: output.metadata.actual_cost_usd,
  };
  const attestationBytes = Buffer.from(`${JSON.stringify(attestation, null, 2)}\n`);
  parseCommittedRunnerAttestation(attestationBytes, sha256(sourceBytes), manifest.target.caseCount);
  await mkdir(path.dirname(attestationPath), { recursive: true });
  await writeFile(attestationPath, attestationBytes, { flag: "wx" });
  return {
    sourcePath,
    attestationPath,
    runnerCommit,
    runId: output.metadata.run_id,
    selectedCases: manifest.target.caseCount,
    providerResponses: providerResponses.length,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runGauntletEval(process.argv.slice(2)).then(
    (summary) => console.log(JSON.stringify(summary, null, 2)),
    (error) => {
      console.error(`Gauntlet eval failed: ${(error as Error).message}`);
      process.exitCode = 1;
    },
  );
}
