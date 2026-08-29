const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  computeContractBuildDigest,
  computeWebSourceDigest,
  markerMatchesCandidate,
  withLaunchTestDefaults,
} = require("../scripts/next_server");

const source = fs.readFileSync(
  path.join(__dirname, "..", "scripts", "next_server.js"),
  "utf8"
);

assert.match(
  source,
  /computeWebSourceDigest\(\)/,
  "contract runs must bind compiled output to the current web source candidate"
);
assert.match(
  source,
  /markerMatchesCandidate\(marker, currentBuildId, sourceDigest\)/,
  "contract runs may only reuse a build that matches both build id and source digest"
);
assert.doesNotMatch(
  source,
  /new Date\(\)\.toISOString\(\)/,
  "a timestamp-only marker cannot prove which compiled public flags were tested"
);
assert.match(
  source,
  /"\.env\.production\.local"[\s\S]*"\.env\.local"[\s\S]*"\.env\.production"[\s\S]*"\.env"/,
  "ignored Next environment files that can affect compilation must participate in the fingerprint"
);
assert.match(
  source,
  /sourceDigestAtCompletion\s*=\s*computeWebSourceDigest\(\)[\s\S]*sourceDigestAtCompletion !== sourceDigest/,
  "a contract-build marker must not survive source or environment changes during compilation"
);
assert.match(
  source,
  /:\(exclude\)web\/next-env\.d\.ts/,
  "the Next-generated type stub must not make an otherwise identical build candidate unstable"
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

const sourceDigest = computeWebSourceDigest();
assert.match(sourceDigest, /^[a-f0-9]{64}$/, "source fingerprint must be a SHA-256 digest");
assert.equal(
  sourceDigest,
  computeWebSourceDigest(),
  "unchanged source and public build flags must produce a stable fingerprint"
);
assert.notEqual(
  sourceDigest,
  computeWebSourceDigest({
    ...process.env,
    NEXT_PUBLIC_MARKER_TEST_VARIANT: "different-public-build-input",
  }),
  "a changed public build variable must invalidate the contract-build fingerprint"
);

const digestInputs = {
  head: "candidate-head\n",
  diff: "",
  environmentInputs: [],
  publicBuildEnv: {},
};
const firstBoundaryDigest = computeContractBuildDigest({
  ...digestInputs,
  untrackedInputs: [{ relativePath: "web/a", contents: Buffer.from("bc") }],
});
const secondBoundaryDigest = computeContractBuildDigest({
  ...digestInputs,
  untrackedInputs: [{ relativePath: "web/ab", contents: Buffer.from("c") }],
});
assert.notEqual(
  firstBoundaryDigest,
  secondBoundaryDigest,
  "path and content boundaries must be domain-separated before hashing"
);
assert.notEqual(
  computeContractBuildDigest({
    ...digestInputs,
    untrackedInputs: [],
    environmentInputs: [{ name: ".env.local", contents: Buffer.from("PRIVATE_BUILD_INPUT=one") }],
  }),
  computeContractBuildDigest({
    ...digestInputs,
    untrackedInputs: [],
    environmentInputs: [{ name: ".env.local", contents: Buffer.from("PRIVATE_BUILD_INPUT=two") }],
  }),
  "a changed Next environment file must invalidate the fingerprint without exposing its contents"
);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "riyp-build-marker-"));
try {
  const buildIdPath = path.join(tempDir, "BUILD_ID");
  const markerPath = path.join(tempDir, ".launch-test-build");
  fs.writeFileSync(buildIdPath, "contract-build\n");
  const marker = { buildId: "contract-build", sourceDigest };
  fs.writeFileSync(markerPath, `${JSON.stringify(marker)}\n`);
  assert.ok(
    markerMatchesCandidate(
      JSON.parse(fs.readFileSync(markerPath, "utf8")),
      fs.readFileSync(buildIdPath, "utf8").trim(),
      sourceDigest
    ),
    "matching build ids identify the already-tested contract build"
  );

  fs.writeFileSync(buildIdPath, "paid-production-build\n");
  assert.ok(
    !markerMatchesCandidate(
      JSON.parse(fs.readFileSync(markerPath, "utf8")),
      fs.readFileSync(buildIdPath, "utf8").trim(),
      sourceDigest
    ),
    "a later paid build invalidates the contract marker"
  );
  assert.ok(
    !markerMatchesCandidate(marker, "contract-build", "0".repeat(64)),
    "a source change invalidates the contract marker even when BUILD_ID is unchanged"
  );
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log("Next contract-build marker tests passed.");
