const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  candidateBindingIsValid,
  inspectReleaseCandidate,
  releaseCandidateIsUnchanged,
  summarizeAutopilot,
  summarizeLaunchGate,
} = require("../scripts/release-evidence.cjs");

function git(repo, args) {
  const result = spawnSync("git", args, {
    cwd: repo,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  assert.equal(result.status, 0, result.stderr || `git ${args.join(" ")} failed`);
}

function writeFixture(repo, relativePath, contents = "fixture\n") {
  const absolutePath = path.join(repo, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, contents);
  return absolutePath;
}

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "riyp-release-evidence-"));
try {
  git(repo, ["init", "--quiet"]);
  git(repo, ["config", "user.name", "RIYP release test"]);
  git(repo, ["config", "user.email", "release-test@example.test"]);
  fs.writeFileSync(path.join(repo, "tracked.txt"), "candidate\n");
  fs.writeFileSync(path.join(repo, ".gitignore"), ".superdesign/\nweb/generated-local/\n");
  git(repo, ["add", "tracked.txt", ".gitignore"]);
  git(repo, ["commit", "--quiet", "-m", "candidate"]);

  const clean = inspectReleaseCandidate(repo);
  assert.match(clean.sha, /^[a-f0-9]{40}$/);
  assert.equal(clean.trackedTreeClean, true);
  assert.equal(clean.hasUntrackedReleaseInputs, false);
  assert.equal(clean.untrackedReleaseInputCount, 0);
  assert.equal(candidateBindingIsValid(clean), true);

  fs.writeFileSync(path.join(repo, "private-local-note.txt"), "must not enter receipt\n");
  writeFixture(repo, "tests/fixtures/results/generated-evidence.json");
  writeFixture(repo, ".superdesign/private-design-artifact.json");
  writeFixture(repo, "web/generated-local/ignored-source.ts");
  const withUntracked = inspectReleaseCandidate(repo);
  assert.deepEqual(
    withUntracked,
    clean,
    "private, ignored, and generated evidence files must not dirty or leak into release evidence",
  );
  assert.equal(JSON.stringify(withUntracked).includes("private-local-note"), false);
  assert.equal(JSON.stringify(withUntracked).includes("generated-evidence"), false);
  assert.equal(JSON.stringify(withUntracked).includes("private-design-artifact"), false);
  assert.equal(JSON.stringify(withUntracked).includes("ignored-source"), false);
  assert.equal(releaseCandidateIsUnchanged(clean, withUntracked), true);

  const untrackedReleaseInputs = [
    ".env.example",
    ".github/workflows/untracked-release.yml",
    ".vercelignore",
    "next.config.mjs",
    "package.json",
    "scripts/untracked-gate.cjs",
    "web/app/untracked-route.tsx",
    "web/prompts/untracked-release-prompt.txt",
    "web/public/untracked-asset.svg",
    "tests/resumes/untracked-release-resume.txt",
  ];

  for (const relativePath of untrackedReleaseInputs) {
    const absolutePath = writeFixture(repo, relativePath);
    const candidate = inspectReleaseCandidate(repo);
    assert.equal(candidate.trackedTreeClean, true, `${relativePath} must not masquerade as a tracked edit`);
    assert.equal(candidate.hasUntrackedReleaseInputs, true, `${relativePath} must bind the candidate`);
    assert.equal(candidate.untrackedReleaseInputCount, 1, `${relativePath} must be counted once`);
    assert.equal(candidateBindingIsValid(candidate), false);
    assert.equal(JSON.stringify(candidate).includes(relativePath), false, "release-input paths must stay private");
    fs.rmSync(absolutePath);
    assert.equal(candidateBindingIsValid(inspectReleaseCandidate(repo)), true);
  }

  const automatedPass = summarizeAutopilot([
    { category: "artifact", outcome: "generated" },
    { category: "check", outcome: "pass" },
    { category: "artifact", outcome: "generated" },
    { category: "check", outcome: "pass" },
  ], clean);
  assert.equal(automatedPass.automatedChecksPassed, true);
  assert.equal(automatedPass.manualRehearsalRequired, true);
  assert.equal(automatedPass.releaseVerdict, "manual_rehearsal_required");

  fs.writeFileSync(path.join(repo, "tracked.txt"), "changed after commit\n");
  const dirty = inspectReleaseCandidate(repo);
  assert.equal(dirty.trackedTreeClean, false);
  assert.equal(candidateBindingIsValid(dirty), false);
  assert.equal(releaseCandidateIsUnchanged(clean, dirty), false);
  assert.equal(summarizeAutopilot([{ category: "check", outcome: "pass" }], dirty).releaseVerdict, "no_go");

  const automatedGatePass = summarizeLaunchGate([
    { status: "pass" },
    { status: "info" },
  ]);
  assert.equal(automatedGatePass.automatedChecksPassed, true);
  assert.equal(automatedGatePass.manualRehearsalRequired, true);
  assert.equal(automatedGatePass.goNoGo, false);
  assert.equal(automatedGatePass.releaseVerdict, "manual_rehearsal_required");

  const automatedGateFailure = summarizeLaunchGate([
    { status: "pass" },
    { status: "fail" },
  ]);
  assert.equal(automatedGateFailure.automatedChecksPassed, false);
  assert.equal(automatedGateFailure.goNoGo, false);
  assert.equal(automatedGateFailure.releaseVerdict, "no_go");
} finally {
  fs.rmSync(repo, { recursive: true, force: true });
}

const autopilotRepo = fs.mkdtempSync(path.join(os.tmpdir(), "riyp-launch-autopilot-"));
try {
  fs.mkdirSync(path.join(autopilotRepo, "scripts"), { recursive: true });
  fs.copyFileSync(
    path.join(__dirname, "..", "scripts", "release-evidence.cjs"),
    path.join(autopilotRepo, "scripts", "release-evidence.cjs"),
  );
  fs.copyFileSync(
    path.join(__dirname, "..", "scripts", "launch-autopilot.cjs"),
    path.join(autopilotRepo, "scripts", "launch-autopilot.cjs"),
  );

  const fakeBin = path.join(autopilotRepo, "fake-bin");
  fs.mkdirSync(fakeBin);
  const fakeNpm = path.join(fakeBin, "npm");
  fs.writeFileSync(fakeNpm, "#!/bin/sh\nprintf 'simulated npm success\\n'\n");
  fs.chmodSync(fakeNpm, 0o755);
  fs.writeFileSync(path.join(autopilotRepo, "release-sentinel.txt"), "clean candidate\n");

  git(autopilotRepo, ["init", "--quiet"]);
  git(autopilotRepo, ["config", "user.name", "RIYP release test"]);
  git(autopilotRepo, ["config", "user.email", "release-test@example.test"]);
  git(autopilotRepo, ["add", "scripts", "release-sentinel.txt"]);
  git(autopilotRepo, ["commit", "--quiet", "-m", "candidate"]);

  const autopilot = spawnSync(process.execPath, ["scripts/launch-autopilot.cjs"], {
    cwd: autopilotRepo,
    encoding: "utf8",
    env: { ...process.env, PATH: `${fakeBin}${path.delimiter}${process.env.PATH}` },
  });
  assert.equal(autopilot.status, 0, autopilot.stderr || autopilot.stdout);

  const reportPath = path.join(
    autopilotRepo,
    "docs",
    "launch-readiness",
    "generated",
    "launch-autopilot-latest.json",
  );
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  assert.equal(report.automatedChecksPassed, true);
  assert.equal(report.candidateStable, true);
  assert.equal(report.manualRehearsalRequired, true);
  assert.equal(report.releaseVerdict, "manual_rehearsal_required");
  assert.equal(report.results.find((result) => result.step === "Manual rehearsal checklist")?.outcome, "generated");
  assert.equal(report.results.some((result) => result.passed === true), false);

  const markdown = fs.readFileSync(reportPath.replace(/\.json$/, ".md"), "utf8");
  assert.match(markdown, /Release verdict: MANUAL REHEARSAL REQUIRED \(NOT GO\)/);
  assert.match(markdown, /## GENERATED · Manual rehearsal checklist/);
  assert.doesNotMatch(markdown, /## PASS · Manual rehearsal checklist/);

  fs.writeFileSync(
    fakeNpm,
    "#!/bin/sh\nmkdir -p web/app\nprintf 'export default function Injected() {}\\n' > web/app/runtime-injected.tsx\nprintf 'simulated npm success\\n'\n",
  );
  const mutatedCandidate = spawnSync(process.execPath, ["scripts/launch-autopilot.cjs"], {
    cwd: autopilotRepo,
    encoding: "utf8",
    env: { ...process.env, PATH: `${fakeBin}${path.delimiter}${process.env.PATH}` },
  });
  assert.equal(mutatedCandidate.status, 1, mutatedCandidate.stderr || mutatedCandidate.stdout);

  const mutatedReport = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  assert.equal(mutatedReport.candidate.trackedTreeClean, true);
  assert.equal(mutatedReport.candidate.hasUntrackedReleaseInputs, false);
  assert.equal(mutatedReport.candidateAtCompletion.trackedTreeClean, true);
  assert.equal(mutatedReport.candidateAtCompletion.hasUntrackedReleaseInputs, true);
  assert.equal(mutatedReport.candidateAtCompletion.untrackedReleaseInputCount, 1);
  assert.equal(mutatedReport.candidateStable, false);
  assert.equal(mutatedReport.automatedChecksPassed, false);
  assert.equal(mutatedReport.releaseVerdict, "no_go");
  assert.equal(JSON.stringify(mutatedReport).includes("runtime-injected"), false);
} finally {
  fs.rmSync(autopilotRepo, { recursive: true, force: true });
}

console.log("Release evidence tests passed.");
