/**
 * Times the grounded validator on saved model outputs: the first validation, and the severity
 * merge's re-validation of one added Critical Miss. No model calls. Medians over N timed runs per
 * report after one warm-up, on this machine; label the numbers as local, not production.
 *
 *   node scripts/run-ts-test.cjs scripts/time-validator.ts <saved-run.json | live-outputs.json> [--runs 3]
 */
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { ensureLayoutAndContentFields, validateResumeModelPayload } from "../lib/backend/validation";
import { resumeTextFromFixture } from "../lib/evals/fixture-input";
import { settleSeverityCheck } from "../lib/reports/severity-check-service";

const args = process.argv.slice(2).filter((value) => !value.endsWith("time-validator.ts"));
const file = args.find((value) => !value.startsWith("--"));
if (!file) throw new Error("Usage: time-validator.ts <saved-run.json> [--runs 3]");
const runs = args.includes("--runs") ? Number(args[args.indexOf("--runs") + 1]) : 3;
const root = path.resolve(process.cwd(), "..");
const calibration = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/calibration.json"), "utf8"));
const saved = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), "utf8"));
const goldenDir = path.join(root, "tests/resumes/golden");

type Item = { id: string; report: any; resume: string };
const items: Item[] = [];
if (Array.isArray(saved.runs)) {
  const files = fs.readdirSync(goldenDir);
  for (const run of saved.runs) {
    const match = files.find((name) => name.startsWith(run.fixture_id.replace(/_1$/u, "_")));
    if (!match) continue;
    items.push({ id: run.fixture_id, report: run.report, resume: resumeTextFromFixture(fs.readFileSync(path.join(goldenDir, match), "utf8")) });
  }
} else {
  for (const result of saved.results || []) {
    const fixture = calibration.fixtures.find((item: any) => item.id === result.fixture_id);
    const report = result.pre_severity_output ?? result.model_output ?? result.raw_output;
    if (!fixture || !report) continue;
    items.push({ id: result.fixture_id, report, resume: resumeTextFromFixture(fs.readFileSync(path.join(root, "tests/resumes", fixture.path), "utf8")) });
  }
}

const median = (values: number[]) => { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)] ?? 0; };
const p = (values: number[], q: number) => { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0; };
const time = (fn: () => unknown) => { fn(); const samples: number[] = []; for (let i = 0; i < runs; i += 1) { const start = performance.now(); fn(); samples.push(performance.now() - start); } return median(samples); };

const validateMs: number[] = [];
const settleMs: number[] = [];
let rejected = 0;
for (const item of items) {
  let validated: any;
  try {
    validated = ensureLayoutAndContentFields(validateResumeModelPayload(structuredClone(item.report), item.resume, { forceGrounding: true }));
  } catch {
    rejected += 1;
    continue;
  }
  const validate = time(() => ensureLayoutAndContentFields(validateResumeModelPayload(structuredClone(item.report), item.resume, { forceGrounding: true })));
  // One added Critical Miss on Fix 2's line, so the merged report runs the full grounded validator again.
  const second = validated.top_fixes?.[1];
  const excerpt = typeof second?.evidence === "string" ? second.evidence : second?.evidence?.excerpt || "";
  const answer = { critical_misses: [{ source: "new" as const, kind: "missing_dates" as const, fix: "Add the dates for this role.", why: "The line has no dates.", excerpt, section: "Experience", effort: "quick" as const }], more_critical: false };
  const settle = time(() => settleSeverityCheck({ payload: validated, answer, resumeText: item.resume }));
  validateMs.push(validate);
  settleMs.push(settle);
  console.log(`${item.id.padEnd(48)} validate ${Math.round(validate).toString().padStart(6)} ms   settle ${Math.round(settle).toString().padStart(6)} ms`);
}
const summary = (label: string, values: number[]) => `${label}: n=${values.length} p50 ${Math.round(median(values))} ms, p90 ${Math.round(p(values, 0.9))} ms, max ${Math.round(Math.max(...values))} ms`;
console.log(`\n${path.basename(file)} (${rejected} rejected by the validator, not timed)`);
console.log(summary("first validation      ", validateMs));
console.log(summary("severity re-validation", settleMs));
