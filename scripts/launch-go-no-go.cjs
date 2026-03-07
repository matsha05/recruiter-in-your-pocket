#!/usr/bin/env node

const { existsSync, readFileSync, writeFileSync, mkdirSync } = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const webDir = path.join(repoRoot, "web");
const extensionDir = path.join(repoRoot, "extension");
const args = new Set(process.argv.slice(2));
const strict = args.has("--strict");
const json = args.has("--json");

const results = [];

function addResult(result) {
  results.push(result);
}

function normalizeFlag(value, fallback = false) {
  if (!value) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function runCommand(id, label, options) {
  const child = spawnSync(options.command, options.args, {
    cwd: options.cwd,
    env: options.env || process.env,
    encoding: "utf8",
    stdio: "pipe",
  });

  const stdout = child.stdout || "";
  const stderr = child.stderr || "";
  const combined = `${stdout}${stderr}`.trim();
  const status = child.status === 0 ? "pass" : "fail";

  addResult({
    id,
    label,
    severity: options.severity || "critical",
    status,
    details: status === "pass" ? options.passMessage : (combined || options.failMessage),
    command: [options.command, ...options.args].join(" "),
  });
}

function checkFile(id, label, relativePath, severity = "critical") {
  const absolutePath = path.join(repoRoot, relativePath);
  addResult({
    id,
    label,
    severity,
    status: existsSync(absolutePath) ? "pass" : "fail",
    details: existsSync(absolutePath)
      ? `Present: ${relativePath}`
      : `Missing required file: ${relativePath}`,
  });
}

function checkCondition(id, label, condition, passMessage, failMessage, severity = "critical") {
  addResult({
    id,
    label,
    severity,
    status: condition ? "pass" : "fail",
    details: condition ? passMessage : failMessage,
  });
}

function addInfo(id, label, details) {
  addResult({
    id,
    label,
    severity: "info",
    status: "info",
    details,
  });
}

const analyticsEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS, true);
const billingEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_BILLING_UNLOCK, true);
const extensionEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_EXTENSION_SYNC, true);
const guestSaveEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE, false);
const shareEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS, false);
const replayEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_ERROR_REPLAY, false);
const hasLiveEvalKey = Boolean(process.env.OPENAI_API_KEY);

checkFile("go_no_go_doc", "Go/no-go program doc", "docs/launch-readiness/80-go-no-go-program.md");
checkFile("vendor_review_doc", "Vendor privacy review doc", "docs/launch-readiness/85-vendor-privacy-review.md");
checkFile("incident_runbook_doc", "Incident runbook doc", "docs/launch-readiness/90-incident-runbook.md");
checkFile("launch_rehearsal_doc", "Launch rehearsal doc", "docs/launch-readiness/95-launch-rehearsal.md");

const finalAuditPath = path.join(repoRoot, "docs/final-prelaunch-competitive-audit.md");
if (existsSync(finalAuditPath)) {
  const finalAudit = readFileSync(finalAuditPath, "utf8");
  checkCondition(
    "stale_go_verdict_removed",
    "Historical GO verdict removed",
    !finalAudit.includes("FINAL VERDICT: GO"),
    "Historical audit no longer claims a live GO verdict.",
    "docs/final-prelaunch-competitive-audit.md still contains a live GO verdict."
  );
}

const extensionOrigins = (process.env.RIYP_EXTENSION_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

checkCondition(
  "app_url",
  "App URL configured",
  Boolean(process.env.NEXT_PUBLIC_APP_URL && /^https?:\/\//.test(process.env.NEXT_PUBLIC_APP_URL)),
  `NEXT_PUBLIC_APP_URL=${process.env.NEXT_PUBLIC_APP_URL}`,
  "NEXT_PUBLIC_APP_URL must be set to an absolute https URL."
);

checkCondition(
  "analytics_flag",
  "Analytics launch flag",
  !analyticsEnabled || Boolean(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN),
  analyticsEnabled ? "Analytics enabled with Mixpanel token present." : "Analytics intentionally disabled for launch.",
  "Analytics is enabled but NEXT_PUBLIC_MIXPANEL_TOKEN is missing.",
  "important"
);

checkCondition(
  "error_replay_flag",
  "Error replay launch flag",
  !replayEnabled,
  "Error replay remains disabled by default.",
  "NEXT_PUBLIC_ENABLE_ERROR_REPLAY should stay disabled until privacy review explicitly approves it.",
  "important"
);

checkCondition(
  "billing_flag",
  "Billing launch flag",
  !billingEnabled || Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_PRICE_ID_MONTHLY && process.env.STRIPE_PRICE_ID_LIFETIME),
  billingEnabled ? "Billing enabled with core Stripe env configured." : "Billing unlock intentionally disabled.",
  "Billing is enabled but core Stripe env is incomplete."
);

checkCondition(
  "extension_flag",
  "Extension launch flag",
  !extensionEnabled || extensionOrigins.length > 0,
  extensionEnabled
    ? `Extension sync enabled with ${extensionOrigins.length} exact origin(s).`
    : "Extension sync intentionally disabled.",
  "Extension sync is enabled but RIYP_EXTENSION_ORIGINS is empty."
);

checkCondition(
  "guest_save_flag",
  "Guest save launch flag",
  !guestSaveEnabled,
  "Guest save remains disabled until a verified ownership flow exists.",
  "Guest report save should remain disabled until a verified ownership flow ships.",
  "important"
);

checkCondition(
  "share_flag",
  "Public share launch flag",
  !shareEnabled,
  "Public share links remain disabled until a real share artifact exists.",
  "Public share links should remain disabled until a dedicated share model ships.",
  "important"
);

runCommand("web_lint", "Web lint", {
  command: "npm",
  args: ["run", "lint"],
  cwd: webDir,
  passMessage: "Web lint passed.",
});

runCommand("web_typecheck", "Web typecheck", {
  command: "npx",
  args: ["tsc", "--noEmit"],
  cwd: webDir,
  passMessage: "Web typecheck passed.",
});

runCommand("web_security", "Security tests", {
  command: "npm",
  args: ["run", "test:security"],
  cwd: webDir,
  passMessage: "Security tests passed.",
});

runCommand("web_build", "Web build", {
  command: "npm",
  args: ["run", "build"],
  cwd: webDir,
  passMessage: "Web build passed.",
});

runCommand("extension_build", "Extension build", {
  command: "npm",
  args: ["run", "build"],
  cwd: extensionDir,
  passMessage: "Extension build passed.",
});

runCommand("contract_smoke", "Root contract + readiness suite", {
  command: "npm",
  args: ["test"],
  cwd: repoRoot,
  passMessage: "Root contract suite passed.",
  severity: "important",
});

runCommand("eval_dry_run", "Eval dry run", {
  command: "npm",
  args: ["run", "eval:dry-run"],
  cwd: webDir,
  passMessage: "Eval dry run passed.",
});

if (hasLiveEvalKey) {
  runCommand("eval_smoke", "Live smoke eval", {
    command: "npm",
    args: ["run", "eval:smoke", "--", "--baseline", "../tests/fixtures/baselines/v2_baseline.json"],
    cwd: webDir,
    passMessage: "Live smoke eval passed.",
    severity: strict ? "critical" : "important",
  });

  if (strict) {
    runCommand("eval_golden", "Live golden eval", {
      command: "npm",
      args: ["run", "eval:golden", "--", "--baseline", "../tests/fixtures/baselines/v2_baseline.json"],
      cwd: webDir,
      passMessage: "Live golden eval passed.",
    });
  } else {
    addInfo("eval_golden", "Live golden eval", "Skipped in non-strict mode. Use `npm run launch:gate:strict` before a true go/no-go decision.");
  }
} else if (strict) {
  checkCondition(
    "live_eval_key",
    "OPENAI key for live evals",
    false,
    "",
    "OPENAI_API_KEY is required for strict go/no-go eval gates."
  );
} else {
  addInfo("live_eval_key", "OPENAI key for live evals", "OPENAI_API_KEY is not set, so live smoke/golden evals were skipped.");
}

const blockers = results.filter((result) => result.status === "fail");
const criticalBlockers = blockers.filter((result) => result.severity === "critical");
const goNoGo = criticalBlockers.length === 0;

const payload = {
  generatedAt: new Date().toISOString(),
  strict,
  goNoGo,
  blockers: blockers.map(({ id, label, severity, details }) => ({ id, label, severity, details })),
  results,
};

const outputDir = path.join(repoRoot, "docs", "launch-readiness", "generated");
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, "go-no-go-latest.json"), JSON.stringify(payload, null, 2));

if (json) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
} else {
  console.log("\nRIYP Launch Gate");
  console.log("================");
  console.log(`Mode: ${strict ? "STRICT" : "STANDARD"}`);
  console.log(`Verdict: ${goNoGo ? "GO" : "NO-GO"}`);
  console.log("");

  for (const result of results) {
    const icon = result.status === "pass" ? "PASS" : result.status === "fail" ? "FAIL" : "INFO";
    console.log(`[${icon}] ${result.label}`);
    console.log(`      ${result.details}`);
  }

  console.log("");
  console.log(`Saved report: docs/launch-readiness/generated/go-no-go-latest.json`);
}

process.exit(goNoGo ? 0 : 1);
