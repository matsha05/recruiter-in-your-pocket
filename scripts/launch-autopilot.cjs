#!/usr/bin/env node

const { mkdirSync, writeFileSync } = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  candidateBindingIsValid,
  describeReleaseCandidate,
  inspectReleaseCandidate,
  releaseCandidateIsUnchanged,
  summarizeAutopilot,
} = require("./release-evidence.cjs");

const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "docs", "launch-readiness", "generated");
mkdirSync(outputDir, { recursive: true });

const strict = process.argv.includes("--strict");
const candidate = inspectReleaseCandidate(repoRoot);
const steps = [
  { category: "artifact", label: "Launch environment report", command: "npm", args: ["run", "launch:env-report"] },
  { category: "check", label: strict ? "Strict launch gate" : "Launch gate", command: "npm", args: ["run", strict ? "launch:gate:strict" : "launch:gate"] },
  { category: "artifact", label: "Manual rehearsal checklist", command: "npm", args: ["run", "launch:rehearsal"] },
  { category: "check", label: "Launch smoke UI", command: "npm", args: ["run", "test:launch-smoke", "--prefix", "web"] },
];

const results = [];

if (!candidateBindingIsValid(candidate)) {
  results.push({
    step: "Immutable release candidate",
    category: "check",
    command: "git status --porcelain=v1 --untracked-files=no",
    outcome: "fail",
    output: "A Git commit with a clean tracked tree and no untracked release inputs is required. Untracked paths are never emitted.",
  });
}

for (const step of candidateBindingIsValid(candidate) ? steps : []) {
  const child = spawnSync(step.command, step.args, {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8",
    stdio: "pipe",
  });

  const output = `${child.stdout || ""}${child.stderr || ""}`.trim();
  const commandSucceeded = child.status === 0;
  const outcome = commandSucceeded
    ? step.category === "artifact" ? "generated" : "pass"
    : "fail";

  results.push({
    step: step.label,
    category: step.category,
    command: [step.command, ...step.args].join(" "),
    outcome,
    output,
  });

  if (!commandSucceeded) break;
}

const candidateAtCompletion = inspectReleaseCandidate(repoRoot);
if (candidateBindingIsValid(candidate) && !releaseCandidateIsUnchanged(candidate, candidateAtCompletion)) {
  results.push({
    step: "Immutable release candidate remained unchanged",
    category: "check",
    command: "git rev-parse HEAD && git status --porcelain=v1 --untracked-files=no",
    outcome: "fail",
    output: "The Git SHA, branch, tracked-tree cleanliness, or untracked release-input count changed while automated checks ran. Untracked paths are never emitted.",
  });
}

const summary = summarizeAutopilot(results, candidate, candidateAtCompletion);
const report = {
  generatedAt: new Date().toISOString(),
  candidate,
  candidateAtCompletion,
  strict,
  ...summary,
  results,
};

writeFileSync(path.join(outputDir, "launch-autopilot-latest.json"), JSON.stringify(report, null, 2));

const markdown = [
  "# Launch Autopilot Report",
  "",
  `Generated: ${report.generatedAt}`,
  `Mode: ${strict ? "STRICT" : "STANDARD"}`,
  `Candidate at start: ${describeReleaseCandidate(candidate)}`,
  `Candidate at completion: ${describeReleaseCandidate(candidateAtCompletion)}`,
  `Candidate remained unchanged: ${report.candidateStable ? "YES" : "NO"}`,
  `Automated checks: ${report.automatedChecksPassed ? "PASS" : "FAIL"}`,
  `Release verdict: ${report.releaseVerdict === "manual_rehearsal_required" ? "MANUAL REHEARSAL REQUIRED (NOT GO)" : "NO-GO"}`,
  "Manual rehearsal: Required. Generating its checklist is not evidence that the rehearsal passed.",
  "",
  ...results.flatMap((result) => [
    `## ${result.outcome.toUpperCase()} · ${result.step}`,
    "",
    `Command: \`${result.command}\``,
    "",
    "```text",
    result.output || "(no output)",
    "```",
    "",
  ]),
].join("\n");

writeFileSync(path.join(outputDir, "launch-autopilot-latest.md"), markdown);

console.log(markdown);
console.log("Saved reports: docs/launch-readiness/generated/launch-autopilot-latest.json and .md");

process.exit(report.automatedChecksPassed ? 0 : 1);
