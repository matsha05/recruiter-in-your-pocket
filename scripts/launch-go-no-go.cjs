#!/usr/bin/env node

const { existsSync, readFileSync, writeFileSync, mkdirSync } = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  candidateBindingIsValid,
  describeReleaseCandidate,
  inspectReleaseCandidate,
  releaseCandidateIsUnchanged,
  summarizeLaunchGate,
} = require("./release-evidence.cjs");

const repoRoot = path.resolve(__dirname, "..");
const webDir = path.join(repoRoot, "web");
const extensionDir = path.join(repoRoot, "extension");
const { resolveReleaseReadinessBypassPolicy } = require(path.join(
  webDir,
  "lib/launch/releasePolicy.cjs"
));
const args = new Set(process.argv.slice(2));
const strict = args.has("--strict");
const json = args.has("--json");
const candidate = inspectReleaseCandidate(repoRoot);
const candidateReady = candidateBindingIsValid(candidate);

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
  const childEnv = { ...process.env, ...(options.env || {}) };
  // `npm --call` exports this implementation detail. Passing it into the
  // nested `npx tsc` command makes npm parse the outer call a second time.
  delete childEnv.npm_config_call;
  delete childEnv.NPM_CONFIG_CALL;

  const child = spawnSync(options.command, options.args, {
    cwd: options.cwd,
    env: childEnv,
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

function hasSharedRedis() {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  );
}

function hasSupportOperator() {
  return String(process.env.RIYP_SUPPORT_OPERATOR_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .some((email) => /^[^\s@]+@[^\s@]+$/.test(email));
}

const analyticsEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS, false);
const billingEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_BILLING_UNLOCK, false);
const extensionEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_EXTENSION_SYNC, false);
const guestSaveEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE, false);
const shareEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS, false);
const replayEnabled = normalizeFlag(process.env.NEXT_PUBLIC_ENABLE_ERROR_REPLAY, false);
const hasLiveEvalKey = Boolean(process.env.OPENAI_API_KEY);
const paidEvalsAllowed = normalizeFlag(process.env.RIYP_ALLOW_PAID_EVALS, false);
const generationDailyLimit = Number(process.env.RIYP_MAX_DAILY_GENERATIONS);
const releaseBypassPolicy = resolveReleaseReadinessBypassPolicy({
  env: process.env,
  releaseState: strict ? "strict" : "local",
});

checkFile("go_no_go_doc", "Go/no-go program doc", "docs/launch-readiness/80-go-no-go-program.md");
checkFile("vendor_review_doc", "Vendor privacy review doc", "docs/launch-readiness/85-vendor-privacy-review.md");
checkFile("operational_ownership_doc", "Operational ownership doc", "docs/launch-readiness/87-operational-ownership.md");
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
  "shared_rate_limit",
  "Shared production rate limiting",
  hasSharedRedis(),
  "Upstash Redis is configured for cross-instance rate limiting and idempotency.",
  "A compatible UPSTASH_REDIS_REST_* or KV_REST_API_* credential pair is required before paid traffic."
);

checkCondition(
  "auth_email_delivery",
  "Transactional auth email",
  Boolean(process.env.RESEND_API_KEY),
  "Resend is configured for exact OTP delivery.",
  "RESEND_API_KEY is required for the real sign-in code path."
);

checkCondition(
  "generation_cost_control",
  "Atomic generation cost ceiling",
  Number.isSafeInteger(generationDailyLimit) && generationDailyLimit > 0 && hasSharedRedis(),
  `Daily generation-request ceiling is ${generationDailyLimit} with shared Redis enforcement.`,
  "RIYP_MAX_DAILY_GENERATIONS must be a positive integer and shared Redis must be configured."
);

checkCondition(
  "support_delivery",
  "Primary support delivery",
  normalizeFlag(process.env.RIYP_SUPPORT_INBOX_VERIFIED, false) &&
    normalizeFlag(process.env.RIYP_SUPPORT_FORWARDING_ENABLED, false) &&
    Boolean(process.env.RESEND_API_KEY) &&
    Boolean(process.env.RESEND_WEBHOOK_SECRET) &&
    Boolean(process.env.RIYP_SUPPORT_FORWARD_TO) &&
    Boolean(process.env.RIYP_SUPPORT_FORWARD_FROM) &&
    hasSupportOperator(),
  "The support inbox passed a real receive-and-reply rehearsal.",
  "Support requires RIYP_SUPPORT_FORWARDING_ENABLED=true, RESEND_API_KEY, RESEND_WEBHOOK_SECRET, RIYP_SUPPORT_FORWARD_TO, RIYP_SUPPORT_FORWARD_FROM, RIYP_SUPPORT_OPERATOR_EMAILS, and RIYP_SUPPORT_INBOX_VERIFIED=true only after a real receive-and-reply rehearsal."
);

checkCondition(
  "secondary_alert",
  "Secondary operational alert",
  normalizeFlag(process.env.RIYP_SECONDARY_ALERT_VERIFIED, false),
  "A distinct backup alert destination passed a real delivery rehearsal.",
  "RIYP_SECONDARY_ALERT_VERIFIED is not true. A second destination, distinct from the primary inbox, still needs a delivery rehearsal.",
  "important"
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
  !billingEnabled || Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.STRIPE_PRICE_ID_30D &&
    process.env.STRIPE_PRODUCT_ID_30D
  ),
  billingEnabled ? "Billing enabled with the Job Search Pass Stripe environment configured." : "Billing unlock intentionally disabled.",
  "Billing is enabled but the canonical Stripe price/product pair or core Stripe env is incomplete."
);

if (strict) {
  checkCondition(
    "release_bypass_policy",
    "Test-only release bypasses disabled",
    releaseBypassPolicy.status === "ok",
    "No test-only release-readiness bypass flags are enabled.",
    `Strict launch readiness cannot run with test-only bypass flags enabled: ${releaseBypassPolicy.enabledFlags.join(", ")}.`
  );

  checkCondition(
    "paid_beta_billing_enabled",
    "Paid product billing enabled",
    billingEnabled,
    "Billing is explicitly enabled for the paid product.",
    "NEXT_PUBLIC_ENABLE_BILLING_UNLOCK=true is required for the strict paid-product gate."
  );
}

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

checkCondition(
  "candidate_binding",
  "Immutable release candidate",
  candidateReady,
  `Release receipt is bound to ${describeReleaseCandidate(candidate)}.`,
  "Release receipts require a Git commit, a clean tracked tree, and no untracked release inputs. Untracked paths are never emitted.",
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
  // Unit and contract tests must never consume production Redis state merely
  // because the parent launch shell is carrying deploy credentials. The gate
  // validates hosted Redis above; this child suite exercises deterministic
  // local fallbacks and explicit configuration parsing instead.
  env: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    USE_MOCK_OPENAI: "1",
    RIYP_ALLOW_TEST_RATE_LIMIT_FALLBACK: "true",
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: "",
    KV_REST_API_URL: "",
    KV_REST_API_TOKEN: "",
  },
  passMessage: "Security tests passed.",
});

runCommand("migration_manifest", "Database migration manifest", {
  command: "npm",
  args: ["run", "migrate:check"],
  cwd: repoRoot,
  passMessage: "Database migration manifest includes every ordered migration.",
});

runCommand("migration_replay", "Clean database migration replay", {
  command: "npm",
  args: ["run", "migrate:replay-check"],
  cwd: repoRoot,
  passMessage: "Database migrations replayed cleanly from an empty schema.",
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
  // The production candidate is intentionally built with production public
  // variables above. Contract readiness needs a separate local build so those
  // compile-time NEXT_PUBLIC values cannot make its loopback server masquerade
  // as the hosted deployment.
  env: { FORCE_NEXT_BUILD: "1" },
  passMessage: "Root contract suite passed.",
  severity: "important",
});

runCommand("eval_dry_run", "Eval dry run", {
  command: "npm",
  args: ["run", "eval:dry-run"],
  cwd: webDir,
  passMessage: "Eval dry run passed.",
});

const candidateBeforeLiveEval = inspectReleaseCandidate(repoRoot);
const paidEvalCandidateReady = releaseCandidateIsUnchanged(candidate, candidateBeforeLiveEval);

if (hasLiveEvalKey && paidEvalsAllowed && paidEvalCandidateReady) {
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
    "live_eval_authorization",
    "Live eval authorization",
    false,
    "",
    !paidEvalCandidateReady
      ? "The exact Git candidate must remain clean and unchanged before the strict gate may spend money on live evaluations."
      : !paidEvalsAllowed
        ? "RIYP_ALLOW_PAID_EVALS=true is required before the strict gate may spend money on live evaluations."
        : "OPENAI_API_KEY is required for strict go/no-go eval gates."
  );
} else {
  addInfo(
    "live_eval_authorization",
    "Live eval authorization",
    !paidEvalCandidateReady
      ? "Live evaluations were skipped because the exact Git candidate was not clean and unchanged."
      : paidEvalsAllowed
        ? "OPENAI_API_KEY is not set, so live smoke/golden evals were skipped."
        : "Paid evaluations are intentionally disabled; only zero-spend fixture validation ran."
  );
}

const candidateAtCompletion = inspectReleaseCandidate(repoRoot);
const candidateStable = releaseCandidateIsUnchanged(candidate, candidateAtCompletion);
checkCondition(
  "candidate_stability",
  "Immutable release candidate remained unchanged",
  candidateStable,
  `Release checks completed against ${describeReleaseCandidate(candidateAtCompletion)}.`,
  "The Git SHA, branch, tracked-tree cleanliness, or untracked release-input count changed while release checks ran. Untracked paths are never emitted.",
);

const blockers = results.filter((result) => result.status === "fail");
// This command proves only the automated slice of the release program. It must
// never authorize promotion or print GO without the exact-SHA remote CI,
// immutable preview rehearsal, hosted readiness, and human approval gates.
const gateSummary = summarizeLaunchGate(results);

const payload = {
  generatedAt: new Date().toISOString(),
  candidate,
  candidateAtCompletion,
  candidateStable,
  strict,
  ...gateSummary,
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
  console.log(
    `Verdict: ${gateSummary.automatedChecksPassed
      ? "AUTOMATED CHECKS PASSED; MANUAL REHEARSAL REQUIRED (NOT GO)"
      : "NO-GO"}`,
  );
  console.log("Exit status reflects automated checks only; it never authorizes production promotion.");
  console.log("");

  for (const result of results) {
    const icon = result.status === "pass" ? "PASS" : result.status === "fail" ? "FAIL" : "INFO";
    console.log(`[${icon}] ${result.label}`);
    console.log(`      ${result.details}`);
  }

  console.log("");
  console.log(`Saved report: docs/launch-readiness/generated/go-no-go-latest.json`);
}

process.exit(gateSummary.automatedChecksPassed ? 0 : 1);
