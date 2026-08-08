import { existsSync, readFileSync } from "fs";
import { createHash } from "node:crypto";
import path from "path";

export type LiveEvalEvidence = {
  runId: string;
  model?: string;
  reasoningEffort?: string;
  validationMode?: "in_run" | "saved_output_replay";
  sourceRunSha256?: string;
  resumePromptSha256?: string;
  resumeIdeasPromptSha256?: string;
  total: number;
  passed: number;
  warned: number;
  failed: number;
};

function metric(markdown: string, label: string) {
  const match = markdown.match(new RegExp(`\\|\\s*[^|]*${label}[^|]*\\|\\s*(\\d+)\\s*\\|`, "i"));
  return match ? Number(match[1]) : null;
}

export function parseLiveEvalEvidence(markdown: string): LiveEvalEvidence | null {
  if (!/^# PromptOps Live Eval Report/m.test(markdown)) return null;
  if (!/\*\*Execution Mode:\*\* Live model evaluation/i.test(markdown)) return null;

  const runId = markdown.match(/\*\*Run ID:\*\*\s*([^\n]+)/i)?.[1]?.trim() || "";
  const model = markdown.match(/\*\*Model:\*\*\s*([^\n]+)/i)?.[1]?.trim() || undefined;
  const reasoningEffort = markdown.match(/\*\*Reasoning effort:\*\*\s*([^\n]+)/i)?.[1]?.trim() || undefined;
  const validationMode = /\*\*Validation Mode:\*\* Saved output replay through current candidate/i.test(markdown)
    ? "saved_output_replay" as const
    : "in_run" as const;
  const sourceRunSha256 = markdown.match(/\*\*Source run SHA-256:\*\*\s*([a-f0-9]{64})/i)?.[1]?.toLowerCase();
  const resumePromptSha256 = markdown.match(/\*\*Resume prompt SHA-256:\*\*\s*([a-f0-9]{64})/i)?.[1]?.toLowerCase();
  const resumeIdeasPromptSha256 = markdown.match(/\*\*Resume ideas prompt SHA-256:\*\*\s*([a-f0-9]{64})/i)?.[1]?.toLowerCase();
  const total = metric(markdown, "Total Fixtures");
  const passed = metric(markdown, "Passed");
  const warned = metric(markdown, "Warned");
  const failed = metric(markdown, "Failed");

  if (!runId || total === null || passed === null || warned === null || failed === null) return null;
  if (passed + warned + failed !== total) return null;

  return {
    runId,
    model,
    reasoningEffort,
    validationMode,
    sourceRunSha256,
    resumePromptSha256,
    resumeIdeasPromptSha256,
    total,
    passed,
    warned,
    failed,
  };
}

export function readLiveEvalEvidence(repoRoot: string) {
  const evidencePath = path.join(repoRoot, "tests", "fixtures", "results", "summary_latest_live.md");
  if (!existsSync(evidencePath)) return null;

  try {
    return parseLiveEvalEvidence(readFileSync(evidencePath, "utf8"));
  } catch {
    return null;
  }
}

export function liveEvalMeetsLaunchBar(evidence: LiveEvalEvidence | null) {
  if (!evidence || evidence.total < 8 || evidence.failed > 0) return false;
  if (evidence.validationMode === "saved_output_replay" && !evidence.sourceRunSha256) return false;
  return evidence.passed / evidence.total >= 0.9;
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function liveEvalMatchesCandidate(
  evidence: LiveEvalEvidence | null,
  candidate: { model: string; reasoningEffort: string; resumePrompt: string; resumeIdeasPrompt: string },
) {
  if (!liveEvalMeetsLaunchBar(evidence) || !evidence) return false;
  return evidence.model === candidate.model
    && evidence.reasoningEffort === candidate.reasoningEffort
    && evidence.resumePromptSha256 === sha256(candidate.resumePrompt)
    && evidence.resumeIdeasPromptSha256 === sha256(candidate.resumeIdeasPrompt);
}
