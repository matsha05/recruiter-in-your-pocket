const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { withLaunchTestDefaults } = require("../scripts/next_server");

const source = fs.readFileSync(
  path.join(__dirname, "..", "scripts", "next_server.js"),
  "utf8"
);

assert.match(
  source,
  /markedBuildId !== currentBuildId/,
  "a forced contract run must rebuild when a later production build replaced the marked build"
);
assert.match(
  source,
  /readFileSync\(buildIdPath, "utf8"\)\.trim\(\)/,
  "the contract marker must bind to the exact Next build id"
);
assert.doesNotMatch(
  source,
  /new Date\(\)\.toISOString\(\)/,
  "a timestamp-only marker cannot prove which compiled public flags were tested"
);

const hermeticEnv = withLaunchTestDefaults({
  SUPABASE_SECRET_KEY: "live-parent-secret",
  SUPABASE_SERVICE_ROLE_KEY: "legacy-live-parent-secret",
  STRIPE_WEBHOOK_SECRET: "live-webhook-secret",
  UPSTASH_REDIS_REST_URL: "https://live.example",
  UPSTASH_REDIS_REST_TOKEN: "live-token",
});
for (const key of [
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
]) {
  assert.equal(
    hermeticEnv[key],
    "",
    `contract server must not inherit hosted credential ${key}`
  );
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "riyp-build-marker-"));
try {
  const buildIdPath = path.join(tempDir, "BUILD_ID");
  const markerPath = path.join(tempDir, ".launch-test-build");
  fs.writeFileSync(buildIdPath, "contract-build\n");
  fs.writeFileSync(markerPath, "contract-build\n");
  assert.equal(
    fs.readFileSync(buildIdPath, "utf8").trim(),
    fs.readFileSync(markerPath, "utf8").trim(),
    "matching build ids identify the already-tested contract build"
  );

  fs.writeFileSync(buildIdPath, "paid-production-build\n");
  assert.notEqual(
    fs.readFileSync(buildIdPath, "utf8").trim(),
    fs.readFileSync(markerPath, "utf8").trim(),
    "a later paid build invalidates the contract marker"
  );
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log("Next contract-build marker tests passed.");
