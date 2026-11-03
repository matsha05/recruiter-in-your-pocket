/**
 * Replays every distinct saved production-prompt output through the current validator and lists what
 * it withholds. No model calls. The saved runs live in tests/fixtures/results/saved (gitignored; copy
 * them from an eval checkout), and only runs whose resume prompt hash matches are replayed.
 *
 *   node scripts/run-ts-test.cjs scripts/replay-saved-outputs.ts [--prompt 83b2a2d1]
 *
 * This is the "validator pass rate on the saved outputs" number in the hand-over: a validator change
 * must not withhold an output it accepted before, and a fabrication control must still reject its pairs.
 */
import fs from "node:fs";
import path from "node:path";
import { ensureLayoutAndContentFields, validateResumeModelPayload } from "../lib/backend/validation";
import { resumeTextFromFixture } from "../lib/evals/fixture-input";
const root = path.resolve(process.cwd(), "..");
const calibration = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/calibration.json"), "utf8"));
const dir = path.join(root, "tests/fixtures/results/saved");
const promptArg = process.argv.indexOf("--prompt");
const promptPrefix = promptArg >= 0 ? process.argv[promptArg + 1] : "83b2a2d1";
const seen = new Set<string>();
let total = 0, rejected = 0;
const reasons: Record<string, string[]> = {};
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const saved = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  if (!Array.isArray(saved.results) || !String(saved.metadata?.resume_prompt_sha256 || "").startsWith(promptPrefix)) continue;
  for (const result of saved.results) {
    const report = result.source_model_output ?? result.model_output ?? result.raw_output;
    if (!report) continue;
    const key = JSON.stringify(report).slice(0, 4000) + result.fixture_id;
    if (seen.has(key)) continue;
    seen.add(key);
    const fixture = calibration.fixtures.find((f: any) => f.id === result.fixture_id);
    if (!fixture) continue;
    const resume = resumeTextFromFixture(fs.readFileSync(path.join(root, "tests/resumes", fixture.path), "utf8"));
    total += 1;
    try {
      ensureLayoutAndContentFields(validateResumeModelPayload(structuredClone(report), resume, { forceGrounding: true }));
    } catch (error: any) {
      rejected += 1;
      const message = String(error?.message || error).slice(0, 400);
      (reasons[message] ||= []).push(`${file}#${result.fixture_id}`);
    }
  }
}
console.log(`prompt ${promptPrefix}: distinct outputs ${total}, withheld ${rejected} (${total ? ((100 * (total - rejected)) / total).toFixed(1) : "0"}% pass)`);
for (const [message, where] of Object.entries(reasons)) console.log(`\n[${where.length}] ${message}\n   ${where.join("\n   ")}`);
