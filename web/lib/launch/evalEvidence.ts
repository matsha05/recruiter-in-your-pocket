import { existsSync, readFileSync } from "fs";
import path from "path";

export type LiveEvalEvidence = {
  runId: string;
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
  const total = metric(markdown, "Total Fixtures");
  const passed = metric(markdown, "Passed");
  const warned = metric(markdown, "Warned");
  const failed = metric(markdown, "Failed");

  if (!runId || total === null || passed === null || warned === null || failed === null) return null;
  if (passed + warned + failed !== total) return null;

  return { runId, total, passed, warned, failed };
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
  return evidence.passed / evidence.total >= 0.9;
}
