import assert from "node:assert/strict";

const { withLaunchTestDefaults } = require("../../scripts/next_server") as {
  withLaunchTestDefaults: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv;
};

const defaults = withLaunchTestDefaults({
  NODE_ENV: "test",
  ANONYMOUS_REPORT_RECOVERY_SECRET: "hosted-recovery-signing-secret",
  BYPASS_PAYWALL: "true",
  SUPABASE_URL: "https://hosted-project.supabase.co",
  RIYP_ALLOW_TEST_INTERNAL_LAUNCH_BYPASS: "false",
});

assert.equal(
  defaults.RIYP_ALLOW_TEST_INTERNAL_LAUNCH_BYPASS,
  "true",
  "hermetic launch servers must expose local-only readiness surfaces without ambient shell state",
);
assert.equal(
  defaults.BYPASS_PAYWALL,
  "false",
  "hermetic launch servers must exercise real access decisions instead of inheriting a local paywall bypass",
);
assert.equal(
  defaults.NEXT_PUBLIC_SUPABASE_URL,
  "http://127.0.0.1:54321",
  "hermetic launch servers must not depend on a hosted Supabase project",
);
assert.equal(
  defaults.SESSION_SECRET,
  "riyp-launch-test-session-secret-at-least-32-bytes",
  "hermetic launch servers must provide local-only cookie signing",
);
assert.equal(
  defaults.ANONYMOUS_REPORT_RECOVERY_SECRET,
  "",
  "hermetic launch servers must not inherit hosted recovery-signing secrets",
);
assert.equal(
  defaults.SUPABASE_URL,
  "",
  "hermetic launch servers must not inherit a hosted server-side Supabase URL",
);

console.log("launch test defaults passed");
