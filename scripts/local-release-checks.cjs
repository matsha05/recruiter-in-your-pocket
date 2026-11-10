#!/usr/bin/env node
/**
 * Execute the checked-in CI commands locally without publishing a GitHub status.
 * Prerequisites: Node 24 and the root/web npm bootstrap to read workflow YAML.
 * --only <comma-separated step ids> is diagnostic, never full release evidence.
 * A receipt binds HEAD, the tracked diff, and untracked source contents. A full
 * pass needs the same clean candidate throughout; it does not authorize deploy.
 */
const { createHash } = require("node:crypto");
const { spawn, spawnSync } = require("node:child_process");
const { existsSync, lstatSync, statSync, mkdirSync, readFileSync, readlinkSync, readdirSync, writeFileSync, createWriteStream } = require("node:fs");
const path = require("node:path");
const { candidateBindingIsValid, inspectReleaseCandidate } = require("./release-evidence.cjs");
const { localTestPort } = require("../web/scripts/local-test-port.cjs");

const ROOT = path.resolve(__dirname, "..");
const WORKFLOW = ".github/workflows/ci.yml";
const SETUP_COMMANDS = new Set([
  "npm ci", "npm ci --prefix ../extension", "npm ci --prefix extension",
  "npx playwright install --with-deps chromium",
]);
const OS_ENV_NAMES = ["PATH", "HOME", "USER", "LOGNAME", "SHELL", "TMPDIR", "TMP", "TEMP", "LANG", "LC_ALL", "TERM", "SystemRoot", "COMSPEC", "PATHEXT", "PLAYWRIGHT_BROWSERS_PATH", "npm_config_cache"];
const CREDENTIAL_NAMES = [
  "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "DATABASE_URL", "DIRECT_URL", "PGPASSWORD",
  "SUPABASE_URL", "SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY", "RESEND_WEBHOOK_SECRET",
  "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN",
  "ANONYMOUS_REPORT_RECOVERY_SECRET", "INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY",
  "SENTRY_AUTH_TOKEN", "SENTRY_DSN", "NEXT_PUBLIC_SENTRY_DSN", "RIYP_SENTRY_READ_TOKEN",
  "NEXT_PUBLIC_MIXPANEL_TOKEN", "GH_TOKEN", "GITHUB_TOKEN", "VERCEL_TOKEN", "VERCEL_ENV", "VERCEL_URL", "CRON_SECRET",
];
const SYNTHETIC_PUBLIC_ENV = {
  // The production CSP permits Supabase HTTPS origins. Browser auth requests
  // are fulfilled by the UI fixtures; this synthetic project has no live keys.
  NEXT_PUBLIC_SUPABASE_URL: "https://riyp-launch-test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "riyp-local-check-public-key",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
};

function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function git(repoRoot, args) {
  const result = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`Cannot inspect release candidate: git ${args[0]} failed.`);
  return result.stdout;
}
function fingerprint(repoRoot) {
  const candidate = inspectReleaseCandidate(repoRoot);
  const diffSha256 = sha256(git(repoRoot, ["diff", "--binary", "HEAD", "--"]));
  const untracked = git(repoRoot, ["ls-files", "--others", "--exclude-standard", "-z"])
    .split("\0").filter(Boolean).filter((name) => !name.startsWith("tests/fixtures/results/")).sort();
  const hash = createHash("sha256");
  for (const name of untracked) {
    const file = path.join(repoRoot, name);
    const content = lstatSync(file).isSymbolicLink() ? Buffer.from(readlinkSync(file)) : readFileSync(file);
    hash.update(`${Buffer.byteLength(name)}:${name}:${content.length}:`);
    hash.update(content);
  }
  const untrackedSha256 = hash.digest("hex");
  return { ...candidate, diffSha256, untrackedSha256, sourceDigest: sha256(JSON.stringify([candidate.sha, candidate.branch, diffSha256, untrackedSha256])) };
}

function envFileNames(repoRoot) {
  const names = new Set();
  for (const relative of ["", "web", "extension"]) {
    const directory = path.join(repoRoot, relative);
    if (!existsSync(directory)) continue;
    for (const name of readdirSync(directory)) {
      if (!/^\.env(?:\.|$)/.test(name)) continue;
      const file = path.join(directory, name);
      if (!statSync(file).isFile()) continue;
      for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
        if (match) names.add(match[1]);
      }
    }
  }
  return names;
}

function buildTestEnvironment(repoRoot, inherited = process.env) {
  const env = Object.fromEntries(OS_ENV_NAMES.flatMap((key) => inherited[key] === undefined ? [] : [[key, inherited[key]]]));
  // Empty is deliberate: Next/dotenv cannot fill a blank variable from a local
  // ignored .env file. No live credential is forwarded from the parent shell.
  for (const key of new Set([...CREDENTIAL_NAMES, ...envFileNames(repoRoot)])) env[key] = "";
  return {
    ...env, ...SYNTHETIC_PUBLIC_ENV,
    PATH: `${path.dirname(process.execPath)}${path.delimiter}${inherited.PATH || ""}`,
    RIYP_LOCAL_TEST_PORT: String(localTestPort(inherited.RIYP_LOCAL_TEST_PORT)),
    CI: "true", FORCE_COLOR: "0", NEXT_TELEMETRY_DISABLED: "1", DO_NOT_TRACK: "1",
    USE_MOCK_OPENAI: "1", RIYP_ALLOW_PAID_EVALS: "false", BYPASS_PAYWALL: "false",
  };
}

function resolveWorkflowEnv(values = {}) {
  return Object.fromEntries(Object.entries(values).map(([key, raw]) => {
    let value = String(raw);
    if (/\$\{\{/.test(value)) {
      if (value !== `\${{ secrets.${key} }}` || !(key in SYNTHETIC_PUBLIC_ENV)) {
        throw new Error(`Workflow environment ${key} needs explicit local handling.`);
      }
      value = SYNTHETIC_PUBLIC_ENV[key];
    }
    return [key, value];
  }));
}

function slug(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function workflowSteps(workflow, repoRoot) {
  const steps = [];
  const setup = [];
  for (const [jobName, job] of Object.entries(workflow.jobs || {})) {
    if (job.strategy?.matrix || job.container || job.services) throw new Error(`Workflow job ${jobName} needs explicit local handling for its matrix/container/services.`);
    for (const entry of job.steps || []) {
      if (entry.uses) {
        if (/^actions\/checkout@/.test(entry.uses)) continue;
        if (/^actions\/setup-node@/.test(entry.uses) && Number(entry.with?.["node-version"]) === 24) continue;
        throw new Error(`Workflow action ${entry.uses} needs explicit local handling.`);
      }
      if (!entry.run) continue;
      const command = String(entry.run).trim();
      const relativeCwd = entry["working-directory"] || job.defaults?.run?.["working-directory"] || ".";
      const cwd = path.resolve(repoRoot, relativeCwd);
      const relative = path.relative(repoRoot, cwd);
      if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Workflow check escapes the checkout.");
      const step = {
        id: `${jobName}-${slug(entry.name || command)}`, name: entry.name || command, job: jobName,
        cwd: relativeCwd, command,
        env: { ...resolveWorkflowEnv(workflow.env), ...resolveWorkflowEnv(job.env), ...resolveWorkflowEnv(entry.env) },
        setup: SETUP_COMMANDS.has(command),
      };
      steps.push(step);
      if (step.setup) setup.push(step);
    }
  }
  if (!steps.length) throw new Error("The CI workflow has no executable checks.");
  if (new Set(steps.map((step) => step.id)).size !== steps.length) throw new Error("Workflow step ids are not unique.");
  return { steps, setup };
}

function readWorkflow(repoRoot) {
  // js-yaml is already locked in the web toolchain; no new dependency is needed.
  const yaml = require(require.resolve("js-yaml", { paths: [path.join(repoRoot, "web")] }));
  const source = readFileSync(path.join(repoRoot, WORKFLOW), "utf8");
  return { ...workflowSteps(yaml.load(source), repoRoot), workflowSha256: sha256(source) };
}

function summarize({ steps, results, before, after, fullCoverage }) {
  const sourceUnchanged = before.sourceDigest === after.sourceDigest;
  const checksPassed = results.length === steps.length && results.every((result) => result.status === "passed") && sourceUnchanged;
  const exactCandidatePassed = checksPassed && fullCoverage && candidateBindingIsValid(before) && candidateBindingIsValid(after);
  return { checksPassed, sourceUnchanged, fullCoverage, exactCandidatePassed, releaseVerdict: exactCandidatePassed ? "manual_rehearsal_required" : "no_go", authorizesDeployment: false };
}

function argsFrom(argv) {
  const args = { list: false, only: null, output: null, keepGoing: false, skipInstall: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--list") args.list = true;
    else if (argv[i] === "--only") args.only = new Set(String(argv[++i] || "").split(",").filter(Boolean));
    else if (argv[i] === "--output") args.output = argv[++i];
    else if (argv[i] === "--keep-going") args.keepGoing = true;
    else if (argv[i] === "--skip-install") args.skipInstall = true;
    else throw new Error(`Unknown option: ${argv[i]}`);
  }
  if (args.only?.size === 0 || args.output === "") throw new Error("An option value is missing.");
  return args;
}

async function runStep(step, repoRoot, env, logPath) {
  return new Promise((resolve) => {
    const log = createWriteStream(logPath);
    const startedAt = new Date().toISOString();
    // Linux CI installs system packages with --with-deps; macOS Chromium does
    // not use that Linux package-manager step. The browser version is identical.
    const effectiveCommand = process.platform === "darwin" && step.command === "npx playwright install --with-deps chromium"
      ? "npx playwright install chromium" : step.command;
    const child = spawn("/bin/sh", ["-c", effectiveCommand], {
      cwd: path.resolve(repoRoot, step.cwd), env: { ...env, ...step.env, RIYP_ALLOW_PAID_EVALS: "false", USE_MOCK_OPENAI: "1" },
      detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"],
    });
    let spawnError = null;
    let interrupted = false;
    child.stdout.pipe(log, { end: false });
    child.stderr.pipe(log, { end: false });
    const stop = (signal) => {
      try { process.kill(process.platform === "win32" ? child.pid : -child.pid, signal); } catch {}
    };
    const interrupt = () => { interrupted = true; stop("SIGTERM"); };
    process.once("SIGINT", interrupt);
    process.once("SIGTERM", interrupt);
    child.once("error", (error) => { spawnError = error.message; });
    child.once("close", (code, signal) => {
      process.removeListener("SIGINT", interrupt);
      process.removeListener("SIGTERM", interrupt);
      log.end(() => resolve({ id: step.id, name: step.name, command: step.command, effectiveCommand, cwd: step.cwd, startedAt, completedAt: new Date().toISOString(), status: code === 0 && !spawnError && !interrupted ? "passed" : "failed", exitCode: code, signal, interrupted, error: spawnError, log: path.basename(logPath) }));
    });
  });
}

async function main(argv = process.argv.slice(2)) {
  const args = argsFrom(argv);
  const manifest = readWorkflow(ROOT);
  if (args.list) {
    for (const step of manifest.steps) console.log(`${step.id}\t${step.cwd}\t${step.command}`);
    return 0;
  }
  if (Number(process.versions.node.split(".")[0]) !== 24) throw new Error("Release checks require Node 24, matching CI and production.");
  if (args.only) for (const id of args.only) if (!manifest.steps.some((step) => step.id === id)) throw new Error(`Unknown step id: ${id}`);
  const steps = manifest.steps.filter((step) => (!args.only || args.only.has(step.id)) && (!args.skipInstall || !step.setup));
  if (!steps.length) throw new Error("The selected options leave no checks to run.");
  const output = path.resolve(args.output || path.join(ROOT, "docs/launch-readiness/generated/local-checks", new Date().toISOString().replace(/[:.]/g, "-")));
  mkdirSync(output, { recursive: true });
  const before = fingerprint(ROOT);
  const env = buildTestEnvironment(ROOT);
  const receipt = {
    version: 1, startedAt: new Date().toISOString(), node: process.version, platform: process.platform,
    workflow: WORKFLOW, workflowSha256: manifest.workflowSha256, candidate: before,
    localTestPort: Number(env.RIYP_LOCAL_TEST_PORT),
    setupSteps: manifest.setup.map(({ id, command, cwd }) => ({ id, command, cwd })),
    setupNote: args.skipInstall ? "Installations were skipped for diagnostics; this is not full release evidence." : "Locked installations are performed by the workflow setup commands and recorded with the other checks.",
    dependencyLockSha256: Object.fromEntries(["package-lock.json", "web/package-lock.json", "extension/package-lock.json"].map((name) => [name, sha256(readFileSync(path.join(ROOT, name)))])),
    environmentPolicy: "Synthetic services only; ambient secrets and local .env variables are blanked. No GitHub status, paid evaluation, or deployment is performed.",
    results: [], authorizesDeployment: false,
  };
  const receiptPath = path.join(output, "receipt.json");
  const save = () => writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  save();
  console.log(`Local release checks: ${steps.length}/${manifest.steps.length} commands, candidate ${before.sha?.slice(0, 12)}; logs ${output}`);
  for (const [index, step] of steps.entries()) {
    receipt.running = step.id;
    save();
    console.log(`[${index + 1}/${steps.length}] ${step.id}`);
    const result = await runStep(step, ROOT, env, path.join(output, `${String(index + 1).padStart(2, "0")}-${step.id}.log`));
    receipt.results.push(result);
    delete receipt.running;
    save();
    console.log(`${result.status.toUpperCase()} ${step.id}`);
    if (result.status !== "passed") {
      console.log(readFileSync(path.join(output, result.log), "utf8").split(/\r?\n/).slice(-35).join("\n"));
      if (!args.keepGoing || result.interrupted) break;
    }
  }
  receipt.candidateAtCompletion = fingerprint(ROOT);
  Object.assign(receipt, summarize({ steps, results: receipt.results, before, after: receipt.candidateAtCompletion, fullCoverage: !args.only && !args.skipInstall }));
  receipt.completedAt = new Date().toISOString();
  save();
  console.log(`Receipt: ${receiptPath}`);
  console.log(receipt.exactCandidatePassed ? "All local CI checks passed on the unchanged clean candidate. Hosted rehearsal and release approval remain required." : "This run does not establish a full clean-candidate release pass; inspect the receipt for failed, partial, dirty, or changing inputs.");
  return receipt.checksPassed ? 0 : 1;
}

module.exports = { argsFrom, buildTestEnvironment, fingerprint, readWorkflow, resolveWorkflowEnv, summarize, workflowSteps };
if (require.main === module) main().then((code) => { process.exitCode = code; }).catch((error) => { console.error(error.message); process.exitCode = 1; });
