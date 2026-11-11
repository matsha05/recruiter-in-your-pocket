import fs from "node:fs";
import path from "node:path";
import { replayWorklistReadiness, WORKLIST_REPLAY_RECEIPT } from "../lib/evals/worklist-readiness-replay";

const repoRoot = path.resolve(__dirname, "../..");
const receipt = replayWorklistReadiness(repoRoot);
if (process.argv.includes("--write")) {
  fs.writeFileSync(path.join(repoRoot, WORKLIST_REPLAY_RECEIPT), `${JSON.stringify(receipt, null, 2)}\n`);
}
console.log(JSON.stringify({ ...receipt.summary, uncalibrated: receipt.uncalibrated, requestRefused: receipt.requestRefused,
  repaired: receipt.repaired, newProviderCalls: receipt.newProviderCalls, sourceRunSha256: receipt.sourceRunSha256,
  validationSourceSha256: receipt.validationSourceSha256,
  findings: receipt.results.filter((result) => result.status === "WARN" || result.status === "FAIL") }, null, 2));
