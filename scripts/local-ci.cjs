#!/usr/bin/env node
/**
 * Local CI: every check the GitHub Actions workflow ran, run on this machine,
 * then reported to GitHub as a commit status named "local-ci" on the commit.
 *
 *   npm run local-ci                    run everything; mark the commit on GitHub
 *   npm run local-ci -- --no-status     run without touching GitHub
 *   npm run local-ci -- --list          print the steps and exit
 *   npm run local-ci -- --from <n>      start at step n (a partial run never posts a status)
 *
 * Why it exists: in November 2026 GitHub Actions stopped starting jobs once the
 * account's free minutes ran out. The same checks run here, faster, and the
 * green status on the PR says which commit passed.
 *
 * It behaves like a fresh CI machine:
 * - Every variable named in an untracked .env file, and every known live
 *   credential, is passed as an empty string. Next.js and dotenv never fill a
 *   variable that is already set, so a local .env.local cannot reach a test.
 *   Only the two public Supabase values (the URL and anon key, which CI took
 *   from repository secrets and the browser bundle carries anyway) pass through.
 * - The synthetic values below are the ones the workflow set.
 * - A green status needs a committed, pushed candidate: a clean tracked tree
 *   and no untracked release inputs, unchanged from start to finish.
 *
 * Builds: the old workflow rebuilt the app before nearly every browser suite.
 * Suites that need the same build settings now share one Playwright run, so
 * one build serves them; only the paid and consent suites, whose public flags
 * differ, build again.
 */
const { createHash } = require("crypto");
const { existsSync, readFileSync, rmSync, writeFileSync } = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  candidateBindingIsValid,
  inspectReleaseCandidate,
  releaseCandidateIsUnchanged,
} = require("./release-evidence.cjs");

const repoRoot = path.join(__dirname, "..");
const dirs = {
  root: repoRoot,
  web: path.join(repoRoot, "web"),
  extension: path.join(repoRoot, "extension"),
};
const STATUS_CONTEXT = "local-ci";

// ---------------------------------------------------------------------------
// Environment

const ENV_FILE_NAMES = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.development.local",
  ".env.production",
  ".env.production.local",
  ".env.test",
  ".env.test.local",
  ".env.sentry-build-plugin",
];

// Credentials a shell may carry even without an env file.
const LIVE_CREDENTIAL_NAMES = [
  "ANONYMOUS_REPORT_RECOVERY_SECRET",
  "ANTHROPIC_API_KEY",
  "CRON_SECRET",
  "GH_TOKEN",
  "GITHUB_TOKEN",
  "INNGEST_EVENT_KEY",
  "INNGEST_SIGNING_KEY",
  "KV_REST_API_TOKEN",
  "KV_REST_API_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "OPENAI_API_KEY",
  "RESEND_API_KEY",
  "RESEND_WEBHOOK_SECRET",
  "RIYP_SENTRY_READ_TOKEN",
  "SENTRY_AUTH_TOKEN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "VERCEL_ENV",
  "VERCEL_URL",
];

const PUBLIC_SUPABASE_NAMES = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

function parseEnvFile(filePath) {
  const values = new Map();
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values.set(match[1], value);
  }
  return values;
}

function readEnvFiles() {
  const files = [];
  for (const dir of Object.values(dirs)) {
    for (const name of ENV_FILE_NAMES) {
      const filePath = path.join(dir, name);
      if (existsSync(filePath)) files.push({ filePath, values: parseEnvFile(filePath) });
    }
  }
  return files;
}

function publicSupabaseValue(name, envFiles) {
  if (process.env[name]) return process.env[name];
  const webLocal = envFiles.filter(({ filePath }) => path.dirname(filePath) === dirs.web);
  for (const preferred of [".env.local", ".env"]) {
    const file = webLocal.find(({ filePath }) => path.basename(filePath) === preferred);
    const value = file?.values.get(name)
      // The app prefers the newer publishable key; the workflow passed the anon key.
      || (name === "NEXT_PUBLIC_SUPABASE_ANON_KEY" ? file?.values.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") : "");
    if (value) return value;
  }
  return "";
}

function buildBaseEnv() {
  const envFiles = readEnvFiles();
  const env = { ...process.env, CI: "true", RIYP_ALLOW_PAID_EVALS: "false" };
  const blanked = new Set(LIVE_CREDENTIAL_NAMES);
  for (const { values } of envFiles) for (const key of values.keys()) blanked.add(key);
  for (const key of blanked) env[key] = "";
  for (const name of PUBLIC_SUPABASE_NAMES) env[name] = publicSupabaseValue(name, envFiles);
  return { env, blankedCount: blanked.size, envFileCount: envFiles.length };
}

// The web job's environment in the old workflow.
const WEB_ENV = {
  SENTRY_AUTH_TOKEN: "",
  SESSION_SECRET: "ci-web-session-secret",
  STRIPE_SECRET_KEY: "sk_test_ci_dummy",
  NEXT_PUBLIC_ENABLE_ANALYTICS: "false",
  NEXT_PUBLIC_ENABLE_BILLING_UNLOCK: "false",
  NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS: "false",
  NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE: "false",
};

// The launch gate's environment in the old workflow: synthetic values only.
const GATE_ENV = {
  USE_MOCK_OPENAI: "1",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  SESSION_SECRET: "test-session-secret",
  SUPABASE_SECRET_KEY: "sb_secret_ci_dummy",
  NEXT_PUBLIC_MIXPANEL_TOKEN: "test-token",
  NEXT_PUBLIC_ENABLE_ANALYTICS: "false",
  NEXT_PUBLIC_ENABLE_ERROR_REPLAY: "false",
  NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS: "false",
  NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE: "false",
  NEXT_PUBLIC_ENABLE_EXTENSION_SYNC: "false",
  NEXT_PUBLIC_ENABLE_BILLING_UNLOCK: "true",
  NEXT_PUBLIC_ENABLE_LIFETIME_PLAN: "false",
  RIYP_ALLOW_PAID_EVALS: "false",
  RIYP_MAX_DAILY_GENERATIONS: "250",
  RIYP_DISABLE_GENERATION: "false",
  RIYP_DISABLE_NEW_PURCHASES: "false",
  RIYP_SUPPORT_INBOX_VERIFIED: "true",
  RIYP_SUPPORT_FORWARDING_ENABLED: "true",
  RIYP_SUPPORT_FORWARD_TO: "operator@example.com",
  RIYP_SUPPORT_FORWARD_FROM: "noreply@example.com",
  RIYP_SUPPORT_OPERATOR_EMAILS: "operator@example.com",
  RIYP_SECONDARY_ALERT_VERIFIED: "true",
  RESEND_API_KEY: "re_test_ci_dummy",
  RESEND_WEBHOOK_SECRET: "whsec_ci_support_dummy",
  STRIPE_SECRET_KEY: "sk_test_ci_dummy",
  STRIPE_WEBHOOK_SECRET: "whsec_ci_dummy",
  STRIPE_PRICE_ID_30D: "price_ci_job_search_pass",
  STRIPE_PRODUCT_ID_30D: "prod_ci_job_search_pass",
  UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "ci-dummy-token",
};

// ---------------------------------------------------------------------------
// Steps

// Browser suites that build the app with identical settings. One Playwright run
// means one build for all of them (the old workflow built once per suite).
const SHARED_BUILD_SPECS = [
  "tests/ui/homepage-seo.spec.ts",
  "tests/ui/homepage-responsive.spec.ts",
  "tests/ui/mobile-landing.spec.ts",
  "tests/ui/mobile-resume-experience.spec.ts",
  "tests/ui/site-mobile-navigation.spec.ts",
  "tests/ui/legal-mobile-layout.spec.ts",
  "tests/ui/pocket-instrument.spec.ts",
  "tests/ui/landing-resilience.spec.ts",
  "tests/ui/landing-navigation.spec.ts",
  "tests/ui/free-status-lifecycle.spec.ts",
  "tests/ui/report-navigation.spec.ts",
  "tests/ui/pricing-mobile.spec.ts",
  "tests/ui/research-surface.spec.ts",
  "tests/ui/editorial-surfaces.spec.ts",
  "tests/ui/search-foundation.spec.ts",
  "tests/ui/status-states.spec.ts",
  "tests/ui/workspace-job-context.spec.ts",
  "tests/ui/jobs-pagination.spec.ts",
  "tests/ui/auth-code-retry.spec.ts",
  "tests/ui/auth-provider-lifecycle.spec.ts",
  "tests/ui/workspace-handoffs.spec.ts",
  "tests/ui/checkout-revision-return.spec.ts",
  "tests/ui/page-weight.spec.ts",
  "tests/ui/toaster-launcher.spec.ts",
  "tests/ui/public-header-account.spec.ts",
  "tests/ui/revised-line-polish.spec.ts",
  "tests/ui/gauntlet.spec.ts",
  "tests/ui/accessibility.spec.ts",
  "tests/ui/product-motion.spec.ts",
];

function installStep(name, dir, lockFiles, installedDirs) {
  const stamp = path.join(dir, "node_modules", ".local-ci-install");
  const digest = () => {
    const hash = createHash("sha256");
    for (const file of lockFiles) hash.update(readFileSync(file));
    return hash.digest("hex");
  };
  return {
    name,
    cwd: dir,
    command: ["npm", "ci"],
    skipIf: () =>
      installedDirs.every((installed) => existsSync(path.join(installed, "node_modules", ".package-lock.json")))
      && existsSync(stamp)
      && readFileSync(stamp, "utf8").trim() === digest(),
    after: () => writeFileSync(stamp, `${digest()}\n`),
  };
}

const onGitHubLinux = process.platform === "linux" && process.env.GITHUB_ACTIONS === "true";

const STEPS = [
  // Setup. Installs are skipped when the lockfiles match the last install.
  // The root install's postinstall runs `npm ci --prefix web`.
  installStep("Install root and web packages", dirs.root, [
    path.join(dirs.root, "package-lock.json"),
    path.join(dirs.web, "package-lock.json"),
  ], [dirs.root, dirs.web]),
  installStep(
    "Install extension packages",
    dirs.extension,
    [path.join(dirs.extension, "package-lock.json")],
    [dirs.extension],
  ),
  {
    name: "Install Chromium for browser checks",
    cwd: dirs.web,
    command: ["npx", "playwright", "install", ...(onGitHubLinux ? ["--with-deps"] : []), "chromium"],
  },
  { name: "Dependency audit: root", cwd: dirs.root, command: ["npm", "audit", "--omit=dev", "--audit-level=high"] },
  { name: "Dependency audit: web", cwd: dirs.web, command: ["npm", "audit", "--omit=dev", "--audit-level=high"] },
  { name: "Dependency audit: extension", cwd: dirs.extension, command: ["npm", "audit", "--omit=dev", "--audit-level=high"] },

  // The launch gate runs lint, typecheck, the security tests, search foundation,
  // the copy check, the migration manifest and clean replay, the web and
  // extension builds, the root contract suite and the eval dry run.
  { name: "Launch gate", cwd: dirs.root, command: ["npm", "run", "launch:gate"], env: GATE_ENV },

  // Unit and contract suites. The Gauntlet trace check reads the build above.
  { name: "Design system contract", cwd: dirs.web, command: ["npm", "run", "qa:design-system"], env: WEB_ENV },
  { name: "Release integrity tests", cwd: dirs.web, command: ["npm", "run", "test:release-integrity"], env: WEB_ENV },
  { name: "Source fidelity tests", cwd: dirs.web, command: ["npm", "run", "test:source-fidelity"], env: WEB_ENV },
  { name: "Streaming completion tests", cwd: dirs.web, command: ["npm", "run", "test:stream-contract"], env: WEB_ENV },
  { name: "Sample report content", cwd: dirs.web, command: ["npm", "run", "test:sample-report"], env: WEB_ENV },
  { name: "Research figure contracts", cwd: dirs.web, command: ["npm", "run", "test:research-figures"], env: WEB_ENV },
  { name: "Compensation model contracts", cwd: dirs.web, command: ["npm", "run", "test:compensation-model"], env: WEB_ENV },
  { name: "Saved report revision contracts", cwd: dirs.web, command: ["npm", "run", "test:saved-report-revision"], env: WEB_ENV },
  { name: "Saved job pagination contracts", cwd: dirs.web, command: ["npm", "run", "test:saved-jobs-pagination"], env: WEB_ENV },
  { name: "Critical matching coverage", cwd: dirs.web, command: ["npm", "run", "test:critical-coverage"], env: WEB_ENV },
  { name: "Release evidence contracts", cwd: dirs.root, command: ["npm", "run", "test:release-evidence"] },
  { name: "Contract-build marker test", cwd: dirs.root, command: ["node", "tests/next_server_marker.test.js"] },
  { name: "Extension saved job regressions", cwd: dirs.extension, command: ["npm", "test"] },

  // Browser suites.
  { name: "Launch UI smoke tests", cwd: dirs.web, command: ["npm", "run", "test:launch-smoke"], env: WEB_ENV },
  {
    name: "Red-team journeys",
    cwd: dirs.web,
    command: ["npm", "run", "test:redteam-journeys"],
    env: WEB_ENV,
    // A dev cache left by an earlier session can loop Fast Refresh; CI starts without one.
    before: () => rmSync(path.join(dirs.web, ".next", "dev"), { recursive: true, force: true }),
  },
  {
    name: "Browser suites on one build",
    cwd: dirs.web,
    command: ["npx", "playwright", "test", ...SHARED_BUILD_SPECS, "--project=chromium", "--workers=1"],
    env: WEB_ENV,
  },
  {
    name: "Paid decision UI",
    cwd: dirs.web,
    command: ["npx", "playwright", "test", "tests/ui/paid-decision.spec.ts", "--workers=1"],
    env: { ...WEB_ENV, NEXT_PUBLIC_ENABLE_BILLING_UNLOCK: "true" },
  },
  {
    name: "Consent and analytics browser contracts",
    cwd: dirs.web,
    command: ["npm", "run", "test:consent-ui", "--", "--workers=1"],
    env: WEB_ENV,
  },
  { name: "Extension popup regression", cwd: dirs.extension, command: ["npm", "run", "test:ui"] },
];

// ---------------------------------------------------------------------------
// GitHub status

function gh(args) {
  return spawnSync("gh", args, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function prepareStatus(candidate) {
  if (process.env.GITHUB_ACTIONS === "true") {
    return { enabled: false, reason: "running in GitHub Actions, which reports its own check" };
  }
  if (!candidateBindingIsValid(candidate)) {
    return {
      enabled: false,
      reason: "the checkout has uncommitted changes or untracked code files; commit them to get a status",
    };
  }
  if (gh(["auth", "status"]).status !== 0) {
    return { enabled: false, reason: "the GitHub CLI is not signed in (gh auth login)" };
  }
  const repo = gh(["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]).stdout.trim();
  if (!repo) return { enabled: false, reason: "could not read the GitHub repository name" };
  if (gh(["api", `repos/${repo}/commits/${candidate.sha}`, "--jq", ".sha"]).status !== 0) {
    return { enabled: false, reason: `commit ${candidate.sha.slice(0, 8)} is not on GitHub yet; push it, then rerun` };
  }
  return { enabled: true, repo, sha: candidate.sha };
}

function postStatus(status, state, description) {
  if (!status.enabled) return;
  const result = gh([
    "api",
    "--method",
    "POST",
    `repos/${status.repo}/statuses/${status.sha}`,
    "-f",
    `state=${state}`,
    "-f",
    `context=${STATUS_CONTEXT}`,
    "-f",
    `description=${description.slice(0, 140)}`,
  ]);
  if (result.status !== 0) {
    console.error(`local-ci: could not post the "${state}" status: ${(result.stderr || "").trim()}`);
  }
}

// ---------------------------------------------------------------------------
// Run

function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

function parseArgs(argv) {
  const args = { list: false, status: true, from: 1 };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--list") args.list = true;
    else if (argv[i] === "--no-status") args.status = false;
    else if (argv[i] === "--from") args.from = Number(argv[++i]);
    else throw new Error(`Unknown option: ${argv[i]}`);
  }
  if (!Number.isInteger(args.from) || args.from < 1 || args.from > STEPS.length) {
    throw new Error(`--from must be a step number from 1 to ${STEPS.length}`);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.list) {
    STEPS.forEach((step, index) => console.log(`${String(index + 1).padStart(2)}. ${step.name}`));
    return 0;
  }

  const { env: baseEnv, blankedCount, envFileCount } = buildBaseEnv();
  for (const name of PUBLIC_SUPABASE_NAMES) {
    if (!baseEnv[name]) {
      console.error(`local-ci: ${name} is not set. Export it, or keep it in web/.env.local (it is a public value).`);
      return 1;
    }
  }

  const candidate = inspectReleaseCandidate(repoRoot);
  const partial = args.from > 1;
  const status = !args.status
    ? { enabled: false, reason: "--no-status was passed" }
    : partial
      ? { enabled: false, reason: "a run that starts partway is not a full pass" }
      : prepareStatus(candidate);

  console.log(`local-ci: ${STEPS.length} steps on ${candidate.sha ? candidate.sha.slice(0, 8) : "an uncommitted checkout"}`);
  console.log(`local-ci: ${blankedCount} credential and env-file names are blanked (${envFileCount} env files found)`);
  console.log(status.enabled
    ? `local-ci: the result will be posted to GitHub as "${STATUS_CONTEXT}"`
    : `local-ci: no GitHub status, because ${status.reason}`);

  const startedAt = Date.now();
  postStatus(status, "pending", `Running ${STEPS.length} steps on a local machine`);

  let interrupted = false;
  const onSignal = (signal) => {
    if (interrupted) return;
    interrupted = true;
    postStatus(status, "error", "Stopped before it finished");
    process.exit(signal === "SIGINT" ? 130 : 143);
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  const timings = [];
  let failed = null;
  for (let index = args.from - 1; index < STEPS.length; index += 1) {
    const step = STEPS[index];
    const label = `[${index + 1}/${STEPS.length}] ${step.name}`;
    if (step.skipIf && step.skipIf()) {
      console.log(`\n${label}: skipped, already up to date`);
      timings.push({ name: step.name, ms: 0, skipped: true });
      continue;
    }
    console.log(`\n${label}\n${"-".repeat(label.length)}`);
    step.before?.();
    const stepStart = Date.now();
    const result = spawnSync(step.command[0], step.command.slice(1), {
      cwd: step.cwd,
      env: { ...baseEnv, ...(step.env || {}) },
      stdio: "inherit",
    });
    const ms = Date.now() - stepStart;
    timings.push({ name: step.name, ms });
    if (result.status !== 0) {
      failed = { index, step, code: result.status, signal: result.signal };
      break;
    }
    step.after?.();
  }

  const totalMs = Date.now() - startedAt;
  console.log("\nlocal-ci timings");
  for (const { name, ms, skipped } of timings) {
    console.log(`  ${skipped ? "skipped" : formatDuration(ms).padStart(7)}  ${name}`);
  }
  console.log(`  ${formatDuration(totalMs).padStart(7)}  total`);

  if (failed) {
    const why = failed.signal ? `signal ${failed.signal}` : `exit ${failed.code}`;
    console.error(`\nlocal-ci: FAILED at step ${failed.index + 1}, ${failed.step.name} (${why})`);
    postStatus(status, "failure", `Failed at: ${failed.step.name}`);
    return 1;
  }

  const candidateAtEnd = inspectReleaseCandidate(repoRoot);
  if (status.enabled && !releaseCandidateIsUnchanged(candidate, candidateAtEnd)) {
    console.error("\nlocal-ci: every step passed, but the checkout changed during the run, so no green status was posted.");
    postStatus(status, "error", "The checkout changed during the run; rerun it");
    return 1;
  }

  const ran = timings.filter(({ skipped }) => !skipped).length;
  console.log(`\nlocal-ci: PASSED, ${ran} steps in ${formatDuration(totalMs)}${partial ? " (partial run)" : ""}`);
  postStatus(status, "success", `All ${STEPS.length} steps passed in ${formatDuration(totalMs)} on ${os.platform() === "darwin" ? "a Mac" : os.platform()}`);
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`local-ci: ${error.message}`);
  process.exitCode = 1;
}
