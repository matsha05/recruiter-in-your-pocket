#!/usr/bin/env node

const path = require("path");
const { mkdirSync, writeFileSync } = require("fs");

const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "docs", "launch-readiness", "generated");
mkdirSync(outputDir, { recursive: true });

const steps = [
  ["Public promise", "Verify the homepage, pricing, research, legal, support, and status surfaces, and confirm held-back product areas remain absent."],
  ["Anonymous first report", "Run upload and paste reviews in a clean profile, inspect the complete report, and confirm anonymous output does not create an account."],
  ["Account and history", "Create a fresh account, verify return-to-workspace, save a report, sign out and back in, and reopen it from history."],
  ["Job Search Pass", "Complete a Stripe test checkout, replay and retry the webhook, then verify unlock, restore, receipts, portal, refund, and revocation."],
  ["Export and deletion", "Export the same disposable account, inspect the package, delete the account, and confirm user-owned product data does not return."],
  ["Accessibility and visuals", "Complete the core journey by keyboard and review 390, 768, 1280, and 1440 px layouts with increased text size and reduced motion."],
  ["Operational recovery", "Exercise billing disablement, held-back route protection, health and status responses, and one simulated generation incident."],
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
