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

console.log("launch test defaults passed");
