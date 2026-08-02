import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getGauntletProgress } from "../lib/gauntlet/progress";
import {
  getPublishedGauntletProgress,
  UnknownPublishedGauntletIterationError,
  validatePublishedProgressBundle,
} from "../lib/gauntlet/published-progress";

async function main() {
  const published = await getPublishedGauntletProgress("iteration-001");
  const validated = await getGauntletProgress(process.cwd(), "iteration-001");
  assert.deepEqual(
    { ...published, generatedAt: "normalized" },
    { ...validated, generatedAt: "normalized" },
    "published progress must match a fresh full evidence validation",
  );
  assert.equal(published.iteration.critic.verdict, "fail");
  assert.equal(published.overallStatus, "fail");

  const nextConfig = await readFile(path.join(process.cwd(), "next.config.mjs"), "utf8");
  assert.doesNotMatch(nextConfig, /["']\/launch\/gauntlet["']\s*:/);
  assert.doesNotMatch(nextConfig, /\.\/gauntlet\//);
  const vercelIgnore = await readFile(path.resolve(process.cwd(), "..", ".vercelignore"), "utf8");
  assert.match(vercelIgnore, /^web\/gauntlet\/artifacts\/$/m);

  await assert.rejects(
    () => getPublishedGauntletProgress("../../outside"),
    /Unsafe iteration selector/,
  );
  await assert.rejects(
    () => getPublishedGauntletProgress("iteration-999"),
    UnknownPublishedGauntletIterationError,
  );

  const rawBundle = JSON.parse(await readFile(
    path.join(process.cwd(), "gauntlet", "published", "progress.json"),
    "utf8",
  )) as { snapshots: Array<{ snapshot: { iteration: { label: string } } }> };
  rawBundle.snapshots[0].snapshot.iteration.label = "Tampered report journey";
  assert.throws(
    () => validatePublishedProgressBundle(rawBundle),
    /snapshot hash mismatch/,
  );

  console.log("Published Gauntlet progress tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
