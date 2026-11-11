const assert = require("node:assert/strict");
const { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { buildStepEnvironment, buildTestEnvironment, fingerprint, resolveWorkflowEnv, summarize, workflowSteps } = require("../scripts/local-release-checks.cjs");
const { localTestPort } = require("../web/scripts/local-test-port.cjs");

const directory = mkdtempSync(path.join(os.tmpdir(), "riyp-local-release-checks-"));
try {
  mkdirSync(path.join(directory, "web"));
  mkdirSync(path.join(directory, "scripts"));
  writeFileSync(path.join(directory, ".gitignore"), ".env*\n");
  writeFileSync(path.join(directory, "web/.env.local"), "OPENAI_API_KEY=never-forward\nUNFAMILIAR_PROVIDER_TOKEN=never-forward\nNEXT_PUBLIC_SUPABASE_URL=https://live.example\n");
  const env = buildTestEnvironment(directory, { PATH: "/bin", HOME: "/home/test", OPENAI_API_KEY: "secret", SOMETHING_PRIVATE: "secret", NEXT_PUBLIC_SUPABASE_URL: "https://live.example" });
  assert.equal(env.PATH, `${path.dirname(process.execPath)}${path.delimiter}/bin`);
  assert.equal(env.OPENAI_API_KEY, "");
  assert.equal(env.UNFAMILIAR_PROVIDER_TOKEN, "");
  assert.equal(env.SOMETHING_PRIVATE, undefined);
  assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, "https://riyp-launch-test.supabase.co");
  assert.equal(env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "riyp-local-check-public-key");
  assert.equal(env.RIYP_ALLOW_PAID_EVALS, "false");
  assert.equal(env.USE_MOCK_OPENAI, "", "ordinary contracts must not disable grounding through mock mode");
  assert.equal(buildStepEnvironment(env).USE_MOCK_OPENAI, "");
  assert.equal(buildStepEnvironment(env, { USE_MOCK_OPENAI: "1" }).USE_MOCK_OPENAI, "1", "the launch gate keeps its explicit mock setting");
  assert.equal(buildStepEnvironment(env, { RIYP_ALLOW_PAID_EVALS: "true" }).RIYP_ALLOW_PAID_EVALS, "false");
  assert.equal(env.RIYP_LOCAL_TEST_PORT, "3100");
  assert.equal(buildTestEnvironment(directory, { PATH: "/bin", RIYP_LOCAL_TEST_PORT: "3113" }).RIYP_LOCAL_TEST_PORT, "3113");
  assert.equal(localTestPort(), 3100);
  assert.equal(localTestPort("65535"), 65535);
  for (const invalid of ["0", "1023", "65536", "3113.5", "3113; echo bad", "abc"]) {
    assert.throws(() => buildTestEnvironment(directory, { RIYP_LOCAL_TEST_PORT: invalid }), /RIYP_LOCAL_TEST_PORT/);
  }
  writeFileSync(path.join(directory, "linked-env"), "ANOTHER_PROVIDER_TOKEN=never-forward\n");
  symlinkSync(path.join(directory, "linked-env"), path.join(directory, "web/.env.production.local"));
  assert.equal(buildTestEnvironment(directory, { PATH: "/bin" }).ANOTHER_PROVIDER_TOKEN, "", "linked env declarations must also be blanked");
  rmSync(path.join(directory, "linked-env"));
  rmSync(path.join(directory, "web/.env.production.local"));
  assert.throws(() => resolveWorkflowEnv({ TOKEN: "${{ secrets.TOKEN }}" }), /explicit local handling/);
  assert.equal(resolveWorkflowEnv({ NEXT_PUBLIC_SUPABASE_URL: "${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}" }).NEXT_PUBLIC_SUPABASE_URL, "https://riyp-launch-test.supabase.co");

  const planned = workflowSteps({ jobs: { web: { defaults: { run: { "working-directory": "web" } }, env: { SOME_FLAG: "false" }, steps: [{ name: "Install", run: "npm ci" }, { name: "Unit", run: "npm run test:unit" }, { name: "New check", run: "npm run future-check", env: { SOME_FLAG: "true" } }] } } }, directory);
  assert.equal(planned.setup.length, 1);
  assert.deepEqual(planned.steps.map((step) => step.command), ["npm ci", "npm run test:unit", "npm run future-check"]);
  assert.equal(planned.steps[2].env.SOME_FLAG, "true");
  assert.throws(() => workflowSteps({ jobs: { bad: { steps: [{ run: "npm test", "working-directory": ".." }] } } }, directory), /escapes/);
  assert.throws(() => workflowSteps({ jobs: { bad: { steps: [{ uses: "vendor/security-check@v1" }] } } }, directory), /explicit local handling/);
  assert.throws(() => workflowSteps({ jobs: { bad: { strategy: { matrix: { version: [24, 26] } }, steps: [{ run: "npm test" }] } } }, directory), /explicit local handling/);

  const runGit = (...args) => execFileSync("git", args, { cwd: directory, stdio: "ignore" });
  runGit("init");
  runGit("add", ".gitignore");
  runGit("-c", "user.name=Release Test", "-c", "user.email=test@example.com", "commit", "-m", "fixture");
  const clean = fingerprint(directory);
  writeFileSync(path.join(directory, "scripts/new.cjs"), "first");
  const first = fingerprint(directory);
  writeFileSync(path.join(directory, "scripts/new.cjs"), "second");
  const second = fingerprint(directory);
  assert.equal(first.untrackedReleaseInputCount, second.untrackedReleaseInputCount);
  assert.notEqual(first.sourceDigest, second.sourceDigest, "changing an untracked file without changing the count must invalidate evidence");
  const steps = [{}];
  const results = [{ status: "passed" }];
  assert.equal(summarize({ steps, results, before: clean, after: clean, fullCoverage: true }).exactCandidatePassed, true);
  assert.equal(summarize({ steps, results, before: clean, after: clean, fullCoverage: false }).exactCandidatePassed, false);
  assert.equal(summarize({ steps, results, before: first, after: first, fullCoverage: true }).exactCandidatePassed, false);
  assert.equal(summarize({ steps, results, before: first, after: second, fullCoverage: true }).checksPassed, false);
  assert.equal(summarize({ steps, results: [], before: clean, after: clean, fullCoverage: true }).checksPassed, false);
  assert.equal(summarize({ steps, results, before: clean, after: clean, fullCoverage: true }).authorizesDeployment, false);
  console.log("local release-check contracts passed");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
