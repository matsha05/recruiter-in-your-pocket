/** Offline replay of the complete November 7 upgrades3 cohort. No provider is imported or called. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { validateResumeFeedbackRequest } from "../backend/validation";
import { isRepairableResumeResponseError } from "../llm/reportRepair";
import { validateWorklistPayload } from "../llm/worklist-validator";
import { sanitizeUserInput } from "../security/inputSanitization";
import { resolveEffectiveJobDescription } from "../security/effectiveJobDescription";
import { runUncalibratedWorklistChecks, runWorklistChecks } from "./worklist-checks";
import type { CalibrationData, Fixture } from "./types";

export const WORKLIST_REPLAY_SOURCE = "docs/audits/2026-11-first-read/outputs/upgrades3";
export const WORKLIST_REPLAY_RECEIPT = "tests/fixtures/results/worklist_readiness_replay_2026-11-10.json";
const SOURCE_COMMIT = "c52ceb78df61e37d3dc5eabef090bed9b1a109c0";
const EXPECTED_REPORTS = 59;
const EXPECTED_REFUSALS = 1;
const sha256 = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

type Case = { id: string; resume: string; job_description?: string };
type Record = {
  case_id: string; run: number; outcome: string; resume_file: string; resume_sha256: string;
  job_description_file: string | null; resume_prompt_sha256?: string; model: string;
  reasoning_effort: string; severity_check: boolean; model_output?: unknown;
  model_output_repaired?: unknown; calls: Array<{ kind: string; model: string; usage?: unknown }>;
};

export function assertNoReplayErrors(results: Array<{ caseId: string; errors: Array<{ code?: string; message: string }> }>) {
  const failures = results.filter((result) => result.errors.length > 0);
  assert.equal(failures.length, 0, `The full cohort has replay errors, including uncalibrated cases: ${JSON.stringify(failures)}`);
}

export function verifySavedRunProvenance(record: Record, input: {
  resumeText: string; promptSha256: string; model: string; reasoningEffort: string;
}) {
  assert.equal(sha256(input.resumeText), record.resume_sha256, `${record.case_id}: resume bytes changed`);
  assert.equal(record.model, input.model, `${record.case_id}: model does not match`);
  assert.equal(record.reasoning_effort, input.reasoningEffort, `${record.case_id}: reasoning does not match`);
  assert.equal(record.severity_check, false, `${record.case_id}: this receipt does not cover a severity call`);
  if (record.outcome === "request_refused") {
    assert.equal(record.calls.length, 0, `${record.case_id}: refused request made a model call`);
    assert.equal(record.model_output, undefined, `${record.case_id}: refused request has a model output`);
    return;
  }
  assert.equal(record.resume_prompt_sha256, input.promptSha256, `${record.case_id}: prompt does not match`);
  assert.ok(record.model_output, `${record.case_id}: original model output is missing`);
  assert.ok(record.calls.length >= 1 && record.calls.length <= 2, `${record.case_id}: unexpected call count`);
  assert.equal(record.calls[0].kind, "report", `${record.case_id}: first call is not a report`);
  assert.equal(Boolean(record.model_output_repaired), record.calls.length === 2,
    `${record.case_id}: repair draft and call receipt disagree`);
  for (const call of record.calls) {
    assert.equal(call.model, input.model, `${record.case_id}: provider response model does not match`);
    assert.ok(call.usage, `${record.case_id}: provider usage receipt is missing`);
  }
}

/** Hash the local import closure as well as dependency versions, so validator/check changes invalidate a receipt. */
function validationSources(repoRoot: string) {
  const found = new Set<string>();
  function visit(relative: string) {
    if (found.has(relative)) return;
    found.add(relative);
    const content = fs.readFileSync(path.join(repoRoot, relative), "utf8");
    for (const match of content.matchAll(/(?:from\s*|import\s*|require\(\s*)["'](\.[^"']+)["']/gu)) {
      const base = path.resolve(repoRoot, path.dirname(relative), match[1]);
      const resolved = [base, ...[".ts", ".tsx", ".js", ".cjs", ".json", ".txt", "/index.ts"].map((ext) => `${base}${ext}`)]
        .find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (resolved) visit(path.relative(repoRoot, resolved));
    }
  }
  visit("web/lib/evals/worklist-readiness-replay.ts");
  found.add("web/package-lock.json");
  return [...found].sort().map((file) => ({ file, sha256: sha256(fs.readFileSync(path.join(repoRoot, file))) }));
}

export function replayWorklistReadiness(repoRoot: string) {
  const sourceFiles = new Map<string, string>();
  function read(relative: string) {
    const bytes = fs.readFileSync(path.join(repoRoot, relative));
    sourceFiles.set(relative, sha256(bytes));
    return bytes.toString("utf8");
  }
  const promptSha256 = sha256(read("web/prompts/resume_v3.txt").trim());
  const ideasPromptSha256 = sha256(read("web/prompts/resume_ideas_v1.txt").trim());
  const model = "gpt-6.1-terra";
  const reasoningEffort = "medium";
  const calibration = JSON.parse(read("tests/fixtures/calibration.json")) as CalibrationData;
  const byHash = new Map<string, Fixture>();
  // Prefer the existing golden contract when the same source also has a smoke/bulk entry.
  const rank = { smoke: 0, bulk: 1, golden: 2 };
  for (const fixture of [...calibration.fixtures].sort((a, b) => rank[a.tier] - rank[b.tier])) {
    byHash.set(sha256(read(`tests/resumes/${fixture.path}`)), fixture);
  }
  const results = [];
  for (const group of ["fullset", "targeted"]) {
    const manifestDir = group === "fullset" ? "docs/audits/2026-11-worklist-run" : "docs/audits/2026-11-first-read";
    const manifest = JSON.parse(read(`${manifestDir}/manifest.json`)) as { cases: Case[] };
    const cases = new Map(manifest.cases.map((item) => [item.id, item]));
    const outputDir = `${WORKLIST_REPLAY_SOURCE}/${group}`;
    const files = fs.readdirSync(path.join(repoRoot, outputDir)).filter((file) => file.endsWith(".json")).sort();
    for (const file of files) {
      const source = `${outputDir}/${file}`;
      const content = read(source);
      if (file.startsWith("_ledger")) continue;
      const record = JSON.parse(content) as Record;
      const testCase = cases.get(record.case_id);
      assert.ok(testCase, `${file}: missing manifest case`);
      assert.equal(record.resume_file, testCase.resume, `${file}: resume path disagrees with manifest`);
      assert.equal(record.job_description_file, testCase.job_description ?? null, `${file}: posting path disagrees with manifest`);
      const resumePath = path.normalize(path.join(manifestDir, testCase.resume));
      const resumeText = read(resumePath);
      const jobPath = testCase.job_description ? path.normalize(path.join(manifestDir, testCase.job_description)) : null;
      const jobDescription = jobPath ? read(jobPath) : undefined;
      verifySavedRunProvenance(record, { resumeText, promptSha256, model, reasoningEffort });
      const request = validateResumeFeedbackRequest({ text: resumeText, mode: "resume", ...(jobDescription ? { jobDescription } : {}) });
      const common = { source, sourceSha256: sha256(content), caseId: record.case_id, resumePath,
        resumeSha256: sha256(resumeText), jobPath, jobSha256: jobDescription ? sha256(jobDescription) : null };
      // Calibration fixtures are resume-only. A posting is a different complete input, even with the same resume.
      const fixture = jobPath ? undefined : byHash.get(record.resume_sha256);
      if (record.outcome === "request_refused") {
        assert.equal(request.ok, false, `${file}: previously oversized request is no longer refused`);
        results.push({ ...common, status: "REQUEST_REFUSED" as const, fixtureId: null, firstRefusal: null, repaired: false, errors: [], warnings: [] });
        continue;
      }
      assert.equal(request.ok, true, `${file}: current request contract refuses a previous report`);
      const sanitized = sanitizeUserInput(resumeText).sanitizedText;
      const options = { forceGrounding: true, ...resolveEffectiveJobDescription(jobDescription).validationOptions };
      let payload;
      let firstRefusal: string | null = null;
      let repaired = false;
      try {
        payload = validateWorklistPayload(structuredClone(record.model_output), sanitized, options);
      } catch (error) {
        firstRefusal = error instanceof Error ? error.message : String(error);
        if (record.model_output_repaired && isRepairableResumeResponseError(error)) {
          try {
            payload = validateWorklistPayload(structuredClone(record.model_output_repaired), sanitized, options);
            repaired = true;
          } catch (repairError) {
            results.push({ ...common, status: "FAIL" as const, fixtureId: fixture?.id ?? null,
              firstRefusal, repaired: false, errors: [{ code: "E_SCHEMA", message: String(repairError) }], warnings: [] });
            continue;
          }
        } else {
          results.push({ ...common, status: "FAIL" as const, fixtureId: fixture?.id ?? null,
            firstRefusal, repaired: false, errors: [{ code: "E_SCHEMA", message: firstRefusal }], warnings: [] });
          continue;
        }
      }
      if (!fixture) {
        // No invented score range, and no contribution to readiness's PASS denominator.
        const checks = runUncalibratedWorklistChecks({ output: payload, resumeText: sanitized,
          globalBanned: calibration.global_banned_phrases, globalDiscouraged: calibration.global_discouraged_phrases });
        results.push({ ...common, status: "UNCALIBRATED" as const, fixtureId: null, firstRefusal, repaired,
          score: payload.score, errors: checks.errors, warnings: checks.warnings });
        continue;
      }
      const checks = runWorklistChecks({ output: payload, resumeText: sanitized, fixture,
        globalBanned: calibration.global_banned_phrases, globalDiscouraged: calibration.global_discouraged_phrases });
      results.push({ ...common, status: checks.errors.length ? "FAIL" as const : checks.warnings.length ? "WARN" as const : "PASS" as const,
        fixtureId: fixture.id, tier: fixture.tier, expectedScore: fixture.expected_score, score: payload.score,
        firstRefusal, repaired, errors: checks.errors, warnings: checks.warnings });
    }
  }
  assert.equal(results.filter((result) => result.status === "REQUEST_REFUSED").length, EXPECTED_REFUSALS, "source refusal count changed");
  assert.equal(results.filter((result) => result.status !== "REQUEST_REFUSED").length, EXPECTED_REPORTS, "source report count changed");
  assertNoReplayErrors(results);
  const eligible = results.filter((result) => result.fixtureId !== null);
  const summary = { total: eligible.length, passed: eligible.filter((result) => result.status === "PASS").length,
    warned: eligible.filter((result) => result.status === "WARN").length, failed: eligible.filter((result) => result.status === "FAIL").length };
  const sources = [...sourceFiles].sort(([a], [b]) => a.localeCompare(b)).map(([file, digest]) => ({ file, sha256: digest }));
  const validators = validationSources(repoRoot);
  return { schemaVersion: 1, sourceCommit: SOURCE_COMMIT, source: WORKLIST_REPLAY_SOURCE,
    model, reasoningEffort, resumePromptSha256: promptSha256, resumeIdeasPromptSha256: ideasPromptSha256,
    sourceRunSha256: sha256(JSON.stringify(sources)), validationSourceSha256: sha256(JSON.stringify(validators)),
    summary, uncalibrated: results.filter((result) => result.status === "UNCALIBRATED").length,
    requestRefused: EXPECTED_REFUSALS, repaired: results.filter((result) => result.repaired).length,
    newProviderCalls: 0, sources, validators, results };
}
