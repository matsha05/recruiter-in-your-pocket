#!/usr/bin/env node

const { mkdirSync, writeFileSync } = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "docs", "launch-readiness", "generated");
mkdirSync(outputDir, { recursive: true });

const strict = process.argv.includes("--strict");
const steps = [
  { label: "Launch environment report", command: "npm", args: ["run", "launch:env-report"] },
  { label: strict ? "Strict launch gate" : "Launch gate", command: "npm", args: ["run", strict ? "launch:gate:strict" : "launch:gate"] },
  { label: "Launch rehearsal artifact", command: "npm", args: ["run", "launch:rehearsal"] },
  { label: "Launch smoke UI", command: "npm", args: ["run", "test:launch-smoke", "--prefix", "web"] },
];

const results = [];

for (const step of steps) {
  const child = spawnSync(step.command, step.args, {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8",
    stdio: "pipe",
  });

  const output = `${child.stdout || ""}${child.stderr || ""}`.trim();
  const passed = child.status === 0;

  results.push({
    step: step.label,
    command: [step.command, ...step.args].join(" "),
    passed,
    output,
  });

  if (!passed) break;
}

const succeeded = results.every((result) => result.passed);
const report = {
  generatedAt: new Date().toISOString(),
  strict,
  succeeded,
  results,
};

writeFileSync(path.join(outputDir, "launch-autopilot-latest.json"), JSON.stringify(report, null, 2));

const markdown = [
  "# Launch Autopilot Report",
  "",
  `Generated: ${report.generatedAt}`,
  `Mode: ${strict ? "STRICT" : "STANDARD"}`,
  `Verdict: ${succeeded ? "PASS" : "FAIL"}`,
  "",
  ...results.flatMap((result) => [
    `## ${result.passed ? "PASS" : "FAIL"} · ${result.step}`,
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

process.exit(succeeded ? 0 : 1);
