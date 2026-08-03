import assert from "node:assert/strict";

const { withLaunchTestDefaults } = require("../../scripts/next_server") as {
  withLaunchTestDefaults: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv;
};

const defaults = withLaunchTestDefaults({
  NODE_ENV: "test",
  RIYP_ALLOW_TEST_INTERNAL_LAUNCH_BYPASS: "false",
});

assert.equal(
  defaults.RIYP_ALLOW_TEST_INTERNAL_LAUNCH_BYPASS,
  "true",
  "hermetic launch servers must expose local-only readiness surfaces without ambient shell state",
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

console.log("launch test defaults passed");
