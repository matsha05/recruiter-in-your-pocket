"use strict";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

const RELEASE_READINESS_BYPASS_FLAGS = Object.freeze([
  "USE_MOCK_OPENAI",
  "SKIP_DB_READY_CHECK",
]);

function isTruthyFlag(value) {
  return TRUE_VALUES.has(String(value || "").trim().toLowerCase());
}

function getEnabledReleaseReadinessBypassFlags(env = process.env) {
  return RELEASE_READINESS_BYPASS_FLAGS.filter((flag) => isTruthyFlag(env[flag]));
}

function resolveReleaseReadinessBypassPolicy({ env = process.env, releaseState }) {
  const enabledFlags = getEnabledReleaseReadinessBypassFlags(env);
  const enforced = releaseState !== "local";

  return {
    enabledFlags,
    status: enabledFlags.length === 0 ? "ok" : enforced ? "missing" : "disabled",
  };
}

module.exports = {
  RELEASE_READINESS_BYPASS_FLAGS,
  getEnabledReleaseReadinessBypassFlags,
  resolveReleaseReadinessBypassPolicy,
};
