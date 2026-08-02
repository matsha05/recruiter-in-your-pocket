import { chromium } from "@playwright/test";
import {
  mkdir,
  mkdtemp,
  readdir,
  rename,
  rm,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  materializeVariantReports,
  writeJourneys,
  writeVariantOutputs,
} from "./browser-artifacts";
import {
  assertArchiveServerIdentity,
  buildArchiveIdentityChallenge,
  isProcessExited,
  nextBuildArguments,
  waitForServer,
  writeArchiveIdentityChallenge,
} from "./browser-identity";
import { assertDependencyClosure } from "./repository-dependencies";
import {
  assertCaptureOutputTarget,
  type CapturePlan,
} from "./repository-plan";
import {
  allocateLoopbackPort,
  archiveCommit,
  createStagingDirectory,
  hermeticEnvironment,
  materializeCandidateNetworkGuard,
  runProcess,
  startProcess,
  stopProcess,
} from "./repository-runtime";

export async function captureGauntletEvidence(plan: CapturePlan, outputPath: string) {
  const target = await assertCaptureOutputTarget(plan.repositoryRoot, plan.iterationId, outputPath);
  await mkdir(path.join(os.tmpdir(), "riyp-gauntlet-capture"), { recursive: true });
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "riyp-gauntlet-capture-"));
  const staging = await createStagingDirectory(target);
  const nodeModulesPath = path.join(plan.repositoryRoot, "web/node_modules");
  const networkGuard = await materializeCandidateNetworkGuard({ plan, directory: temporaryRoot });
  let published = false;
  try {
    const productionPort = await allocateLoopbackPort();
    const candidatePort = await allocateLoopbackPort();
    const variants = [
      { variant: "production" as const, commit: plan.productionCommit, port: productionPort },
      { variant: "candidate" as const, commit: plan.candidateCommit, port: candidatePort },
    ];
    for (const item of variants) {
      const identityChallenge = buildArchiveIdentityChallenge({
        variant: item.variant,
        commit: item.commit,
      });
      const tree = await archiveCommit({
        repositoryRoot: plan.repositoryRoot,
        commit: item.commit,
        nodeModulesPath,
        parentDirectory: temporaryRoot,
        label: item.variant,
        dependencyClosure: plan.dependencyClosure,
      });
      const webRoot = path.join(tree, "web");
      await writeArchiveIdentityChallenge(webRoot, identityChallenge);
      const env = hermeticEnvironment({
        port: item.port,
        networkGuardPath: networkGuard.path,
        temporaryDirectory: temporaryRoot,
      });
      const reports = await materializeVariantReports({
        plan,
        variant: item.variant,
        webRoot,
        environment: env,
        temporaryRoot,
      });
      const nextBin = path.join(webRoot, "node_modules/next/dist/bin/next");
      await runProcess({
        command: process.execPath,
        args: nextBuildArguments(nextBin),
        cwd: webRoot,
        env,
        label: `${item.variant} build`,
        timeoutMs: 240_000,
      });
      const server = startProcess({ command: process.execPath, args: [nextBin, "start", "-H", "127.0.0.1", "-p", String(item.port)], cwd: webRoot, env });
      const origin = `http://127.0.0.1:${item.port}`;
      try {
        await waitForServer({
          origin,
          challenge: identityChallenge,
          childOutput: server.output,
          childExited: () => isProcessExited(server.child),
          label: item.variant,
        });
        const browser = await chromium.launch({ headless: true });
        try {
          await writeVariantOutputs({
            plan,
            browser,
            origin,
            variant: item.variant,
            archiveIdentity: identityChallenge.identity,
            artifactRoot: staging,
            reports,
          });
          if (item.variant === "candidate") {
            await writeJourneys({
              plan,
              browser,
              origin,
              archiveIdentity: identityChallenge.identity,
              artifactRoot: staging,
              reports,
            });
          }
        } finally {
          await browser.close();
        }
        await assertArchiveServerIdentity({
          origin,
          challenge: identityChallenge,
          childExited: () => isProcessExited(server.child),
          label: `${item.variant} final recheck`,
        });
        await assertDependencyClosure({
          repositoryRoot: plan.repositoryRoot,
          nodeModulesPath,
          expected: plan.dependencyClosure,
        });
      } finally {
        await stopProcess(server.child);
      }
    }
    await publishDirectoryNoReplace(staging, target);
    published = true;
    return target;
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
    if (!published) await rm(staging, { recursive: true, force: true });
  }
}
export async function publishDirectoryNoReplace(staging: string, target: string) {
  await mkdir(target);
  let complete = false;
  try {
    for (const entry of await readdir(staging)) {
      await rename(path.join(staging, entry), path.join(target, entry));
    }
    await rm(staging, { recursive: true });
    complete = true;
  } finally {
    if (!complete) await rm(target, { recursive: true, force: true });
  }
}
