/**
 * Replays the live judgment run's saved outputs (docs/audits/2026-11-live-judgment/) through the current
 * validators and severity merge. No model calls.
 *
 *   node scripts/run-ts-test.cjs scripts/replay-live-judgment.ts [--dir ../docs/audits/2026-11-live-judgment]
 *       [--out <results.json>] [--compare <baseline results.json>] [--markdown <changes.md>] [--claims] [--check-saved]
 *
 * --out writes every run's decision; --compare prints what changed against an earlier --out file (refusals
 * by detector, runs that never shipped, and every run whose shipped result changed, old and new first fix
 * side by side); --claims lists each refused claim with its detector, for classifying refusals by cause;
 * --check-saved verifies that the replay reproduces the decisions the records say production made.
 */
import fs from "node:fs";
import path from "node:path";

import {
  outcomeCounts,
  refusalsByDetector,
  replaySavedRuns,
  savedDecisionMismatches,
  shippedChanges,
  type ReplayResult,
} from "../lib/evals/live-judgment-replay";

const args = process.argv.slice(2);
function flag(name: string) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}
const auditDir = path.resolve(process.cwd(), flag("--dir") || "../docs/audits/2026-11-live-judgment");
const outPath = flag("--out");
const comparePath = flag("--compare");
const markdownPath = flag("--markdown");
const showClaims = args.includes("--claims");
const checkSaved = args.includes("--check-saved");

const results = replaySavedRuns(auditDir);
const modelRuns = results.filter((result) => result.outcome !== "request_refused");

function table(counts: Record<string, number>) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([key, value]) => `   ${value.toString().padStart(3)}  ${key}`).join("\n") || "   none";
}

console.log(`Replayed ${results.length} saved runs (${modelRuns.length} reached the model).`);
console.log(`Outcomes:\n${table(outcomeCounts(results))}`);
console.log(`First drafts refused, by detector:\n${table(refusalsByDetector(results, "first_draft"))}`);
console.log(`Repaired drafts refused, by detector:\n${table(refusalsByDetector(results, "repaired_draft"))}`);
const led = results.filter((result) => result.severity?.led);
console.log(`Severity additions that lead the report: ${led.length}${led.length ? ` (${led.map((r) => r.stem).join(", ")})` : ""}`);

if (showClaims) {
  console.log("\nRefused claims:");
  for (const result of results) {
    for (const draft of ["first_draft", "repaired_draft"] as const) {
      const refusal = result[draft]?.refusal;
      if (!refusal) continue;
      console.log(`- ${result.stem} [${draft}] ${refusal.detector} ${refusal.path ?? ""}${refusal.facts.length ? `: ${refusal.facts.join(", ")}` : ""}`);
    }
  }
}

if (checkSaved) {
  const mismatches = savedDecisionMismatches(results);
  console.log(`\nAgainst the saved records: ${mismatches.length === 0 ? "every decision reproduced" : `${mismatches.length} differences`}`);
  for (const mismatch of mismatches) console.log(`- ${mismatch}`);
}

if (outPath) {
  fs.writeFileSync(path.resolve(process.cwd(), outPath), JSON.stringify(results, null, 2));
  console.log(`\nWrote ${outPath}`);
}

if (comparePath) {
  const before = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), comparePath), "utf8")) as ReplayResult[];
  console.log(`\nCompared with ${comparePath}:`);
  console.log(`Outcomes before:\n${table(outcomeCounts(before))}`);
  console.log(`First-draft refusals before:\n${table(refusalsByDetector(before, "first_draft"))}`);
  const changes = shippedChanges(before, results);
  if (markdownPath) {
    const cell = (value: string | null | undefined) => String(value ?? "none").replace(/\|/gu, "\\|").replace(/\s+/gu, " ");
    const fix = (summary: { fix: string; excerpt: string } | null) => (summary ? `${cell(summary.fix)} ← "${cell(summary.excerpt)}"` : "none");
    const rows = changes.map((change) => `| ${change.stem} | ${change.why} | ${change.before_outcome.replace(/_/gu, " ")}; ${change.before_critical} CM | ${fix(change.before_first_fix)} | ${change.after_outcome.replace(/_/gu, " ")}; ${change.after_critical} CM | ${fix(change.after_first_fix)} |`);
    fs.writeFileSync(path.resolve(process.cwd(), markdownPath), [
      "| Run | What changed | Before | First fix before | After | First fix after |",
      "| --- | --- | --- | --- | --- | --- |",
      ...rows,
      "",
    ].join("\n"));
    console.log(`Wrote ${markdownPath}`);
  }
  console.log(`\n${changes.length} runs whose shipped result changed:`);
  for (const change of changes) {
    console.log(`\n### ${change.stem}: ${change.why}`);
    console.log(`   before: ${change.before_outcome}; ${change.before_critical} Critical Miss(es); first fix: ${change.before_first_fix ? `${change.before_first_fix.fix} <- "${change.before_first_fix.excerpt}"` : "none"}`);
    console.log(`   after:  ${change.after_outcome}; ${change.after_critical} Critical Miss(es); first fix: ${change.after_first_fix ? `${change.after_first_fix.fix} <- "${change.after_first_fix.excerpt}"` : "none"}`);
    if (change.before_verdict !== change.after_verdict) {
      console.log(`   verdict before: ${change.before_verdict ?? "none"}`);
      console.log(`   verdict after:  ${change.after_verdict ?? "none"}`);
    }
  }
}
