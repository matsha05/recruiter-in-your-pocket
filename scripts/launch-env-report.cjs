#!/usr/bin/env node

const { mkdirSync, writeFileSync } = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "docs", "launch-readiness", "generated");
mkdirSync(outputDir, { recursive: true });

function enabled(value, fallback = false) {
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function safeValue(key) {
  const value = process.env[key];
  if (!value) return "(missing)";
  if (key.includes("SECRET") || key.includes("KEY") || key.includes("TOKEN")) return "(set)";
  return value;
}

const flags = [
  ["NEXT_PUBLIC_ENABLE_ANALYTICS", enabled(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS, true)],
  ["NEXT_PUBLIC_ENABLE_BILLING_UNLOCK", enabled(process.env.NEXT_PUBLIC_ENABLE_BILLING_UNLOCK, true)],
  ["NEXT_PUBLIC_ENABLE_EXTENSION_SYNC", enabled(process.env.NEXT_PUBLIC_ENABLE_EXTENSION_SYNC, true)],
  ["NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE", enabled(process.env.NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE, false)],
  ["NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS", enabled(process.env.NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS, false)],
  ["NEXT_PUBLIC_ENABLE_ERROR_REPLAY", enabled(process.env.NEXT_PUBLIC_ENABLE_ERROR_REPLAY, false)],
];

const envRows = [
  "NEXT_PUBLIC_APP_URL",
  "SESSION_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID_MONTHLY",
  "STRIPE_PRICE_ID_LIFETIME",
  "RIYP_EXTENSION_ORIGINS",
];

const missingCritical = envRows.filter((key) => !process.env[key] && !["OPENAI_API_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_ID_MONTHLY", "STRIPE_PRICE_ID_LIFETIME", "RIYP_EXTENSION_ORIGINS"].includes(key));

const payload = {
  generatedAt: new Date().toISOString(),
  flags: Object.fromEntries(flags),
  env: Object.fromEntries(envRows.map((key) => [key, safeValue(key)])),
  missingCritical,
};

const markdown = [
  "# Launch Environment Report",
  "",
  `Generated: ${payload.generatedAt}`,
  "",
  "## Launch Flags",
  "",
  ...flags.map(([key, value]) => `- \`${key}\`: ${value ? "enabled" : "disabled"}`),
  "",
  "## Environment Snapshot",
  "",
  ...envRows.map((key) => `- \`${key}\`: ${safeValue(key)}`),
  "",
  "## Immediate Warnings",
  "",
  ...(missingCritical.length > 0 ? missingCritical.map((key) => `- Missing critical env: \`${key}\``) : ["- No critical env gaps detected in this environment snapshot."]),
  "",
].join("\n");

writeFileSync(path.join(outputDir, "launch-env-report.json"), JSON.stringify(payload, null, 2));
writeFileSync(path.join(outputDir, "launch-env-report.md"), markdown);

console.log(markdown);
console.log("Saved reports: docs/launch-readiness/generated/launch-env-report.json and .md");
