#!/usr/bin/env node

const path = require("path");
const { mkdirSync, writeFileSync } = require("fs");

const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "docs", "launch-readiness", "generated");
mkdirSync(outputDir, { recursive: true });

const steps = [
  ["Anonymous review", "Open the workspace in an incognito browser, run a review, confirm the report renders, and confirm anonymous output does not create an account."],
  ["Account creation", "Create a fresh account through the web auth flow and verify return-to-workspace works."],
  ["Report persistence", "Save the report while signed in, refresh, and confirm it appears in /reports."],
  ["Extension auth", "Install the unpacked extension, open the popup, and verify sign-in opens the real auth flow."],
  ["Extension capture", "Capture a LinkedIn job, refresh the popup, and confirm the job remains present."],
  ["Cross-device sync", "Open the same account in a second browser profile and confirm saved jobs appear there."],
  ["Purchase", "Complete a billing flow in test mode, confirm unlocks land, and verify restore + receipts + billing portal."],
  ["Export", "Export account data and verify the package includes reports and settings metadata."],
  ["Delete account", "Delete the account and confirm reports, saved jobs, and app data are removed from the product surface."],
];

const markdown = [
  "# Launch Rehearsal Checklist",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "Run this on a clean browser profile before any live launch decision.",
  "",
  ...steps.flatMap(([title, body], index) => [
    `${index + 1}. ${title}`,
    `   Evidence: ${body}`,
  ]),
  "",
].join("\n");

const outputPath = path.join(outputDir, "launch-rehearsal-latest.md");
writeFileSync(outputPath, markdown);

console.log(markdown);
console.log(`Saved rehearsal checklist: ${path.relative(repoRoot, outputPath)}`);
