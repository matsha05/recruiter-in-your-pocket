const { existsSync, readFileSync, realpathSync, statSync, writeFileSync } = require("fs");
const { spawn, spawnSync } = require("child_process");
const { createHash } = require("crypto");
const path = require("path");
const net = require("net");

const repoRoot = path.join(__dirname, "..");
const webDir = path.join(repoRoot, "web");

function withLaunchTestDefaults(env) {
  const testEnv = {
    ...env,
    USE_MOCK_OPENAI: "1",
    BYPASS_PAYWALL: "false",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    VERCEL_ENV: "development",
    VERCEL_URL: "",
    NEXT_PUBLIC_ENABLE_ANALYTICS: "false",
    NEXT_PUBLIC_ENABLE_BILLING_UNLOCK: "false",
    NEXT_PUBLIC_ENABLE_EXTENSION_SYNC: "false",
    NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE: "false",
    NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS: "false",
    NEXT_PUBLIC_ENABLE_ERROR_REPLAY: "false",
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "riyp-launch-test-public-key",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    SESSION_SECRET: "riyp-launch-test-session-secret-at-least-32-bytes",
    RIYP_ALLOW_TEST_RATE_LIMIT_FALLBACK: "true",
    RIYP_ALLOW_TEST_ANONYMOUS_ACCESS_FALLBACK: "true",
    RIYP_ALLOW_TEST_INTERNAL_LAUNCH_BYPASS: "true",
    SKIP_DB_READY_CHECK: env.SKIP_DB_READY_CHECK || "1",
    // Contract tests must remain hermetic even when the parent launch shell
    // carries real or placeholder hosted credentials. Explicit empty values
    // also prevent an untracked web/.env.local from supplying live secrets.
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: "",
    KV_REST_API_URL: "",
    KV_REST_API_TOKEN: "",
    ANONYMOUS_REPORT_RECOVERY_SECRET: "",
    SUPABASE_URL: "",
    SUPABASE_SECRET_KEY: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
    STRIPE_WEBHOOK_SECRET: "",
  };

  return testEnv;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitForHealth(baseUrl, maxWaitMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) return;
    } catch (_) {}
    await wait(250);
  }
  throw new Error("Next server did not become ready in time");
}

function runGit(args) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`Unable to fingerprint the contract-build candidate: git ${args.join(" ")} failed`);
  }
  return result.stdout;
}

function updateFingerprint(hash, label, value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8");
  hash.update(`${label}\0${buffer.length}\0`, "utf8");
  hash.update(buffer);
}

function computeContractBuildDigest({
  head,
  diff,
  untrackedInputs = [],
  environmentInputs = [],
  publicBuildEnv = {},
}) {
  const hash = createHash("sha256");
  updateFingerprint(hash, "git-head", head);
  updateFingerprint(hash, "tracked-web-diff", diff);

  for (const input of untrackedInputs) {
    updateFingerprint(hash, "untracked-web-path", input.relativePath);
    updateFingerprint(hash, "untracked-web-content", input.contents);
  }

  for (const input of environmentInputs) {
    updateFingerprint(hash, "next-environment-file", input.name);
    updateFingerprint(hash, "next-environment-content", input.contents);
  }

  updateFingerprint(hash, "public-build-environment", JSON.stringify(publicBuildEnv));
  return hash.digest("hex");
}

function readWebFingerprintInput(absolutePath) {
  try {
    const realWebDir = realpathSync(webDir);
    const realInputPath = realpathSync(absolutePath);
    const relativePath = path.relative(realWebDir, realInputPath);
    if (!relativePath || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
      throw new Error("outside web directory");
    }
    if (!statSync(realInputPath).isFile()) {
      throw new Error("not a regular file");
    }
    return readFileSync(realInputPath);
  } catch (_) {
    throw new Error("Unable to read a contract-build fingerprint input inside the web directory");
  }
}

function computeWebSourceDigest(env = process.env) {
  const head = runGit(["rev-parse", "HEAD"]);
  const diff = runGit([
    "diff",
    "--binary",
    "HEAD",
    "--",
    "web",
    ":(exclude)web/next-env.d.ts",
  ]);

  const untrackedFiles = runGit([
    "ls-files",
    "--others",
    "--exclude-standard",
    "-z",
    "--",
    "web",
    ":(exclude)web/next-env.d.ts",
  ]).split("\0").filter(Boolean).sort();
  const untrackedInputs = untrackedFiles.map((relativePath) => {
    const absolutePath = path.resolve(repoRoot, relativePath);
    if (!absolutePath.startsWith(`${webDir}${path.sep}`)) {
      throw new Error("Contract-build fingerprint escaped the web directory");
    }
    return {
      relativePath,
      contents: readWebFingerprintInput(absolutePath),
    };
  });

  const environmentInputs = [
    ".env.production.local",
    ".env.local",
    ".env.production",
    ".env",
    ".env.sentry-build-plugin",
  ].flatMap((name) => {
    const absolutePath = path.join(webDir, name);
    if (!existsSync(absolutePath)) return [];
    return [{ name, contents: readWebFingerprintInput(absolutePath) }];
  });

  const buildEnv = withLaunchTestDefaults(env);
  const publicBuildEnv = Object.fromEntries(
    Object.entries(buildEnv)
      .filter(([key]) => key.startsWith("NEXT_PUBLIC_") || key === "VERCEL_ENV")
      .sort(([left], [right]) => left.localeCompare(right))
  );
  return computeContractBuildDigest({
    head,
    diff,
    untrackedInputs,
    environmentInputs,
    publicBuildEnv,
  });
}

function readContractBuildMarker(markerPath) {
  if (!existsSync(markerPath)) return null;
  try {
    const marker = JSON.parse(readFileSync(markerPath, "utf8"));
    if (
      marker &&
      typeof marker.buildId === "string" &&
      typeof marker.sourceDigest === "string"
    ) {
      return marker;
    }
  } catch (_) {}
  return null;
}

function markerMatchesCandidate(marker, buildId, sourceDigest) {
  return Boolean(
    marker &&
    buildId &&
    marker.buildId === buildId &&
    marker.sourceDigest === sourceDigest
  );
}

function ensureWebBuild() {
  const buildIdPath = path.join(webDir, ".next", "BUILD_ID");
  const localContractBuildMarker = path.join(webDir, ".next", ".launch-test-build");
  const hasProductionBuild = existsSync(buildIdPath);
  const currentBuildId = hasProductionBuild ? readFileSync(buildIdPath, "utf8").trim() : "";
  const sourceDigest = computeWebSourceDigest();
  const marker = readContractBuildMarker(localContractBuildMarker);

  if (hasProductionBuild && markerMatchesCandidate(marker, currentBuildId, sourceDigest)) {
    return;
  }

  const nextBin = path.join(webDir, "node_modules", "next", "dist", "bin", "next");
  const r = spawnSync(process.execPath, [nextBin, "build", "--webpack"], {
    cwd: webDir,
    stdio: "inherit",
    env: withLaunchTestDefaults(process.env),
  });
  if (r.status !== 0) throw new Error("Failed to build web app");

  const postbuild = spawnSync(
    process.execPath,
    [path.join(webDir, "scripts", "ensure-next-build-package.cjs")],
    {
      cwd: webDir,
      stdio: "inherit",
      env: withLaunchTestDefaults(process.env),
    }
  );
  if (postbuild.status !== 0) throw new Error("Failed to validate web build output");
  if (!existsSync(buildIdPath)) {
    throw new Error("Build completed but BUILD_ID is missing");
  }
  const sourceDigestAtCompletion = computeWebSourceDigest();
  if (sourceDigestAtCompletion !== sourceDigest) {
    throw new Error("The web source or build environment changed while the contract build ran");
  }
  writeFileSync(
    localContractBuildMarker,
    `${JSON.stringify({
      buildId: readFileSync(buildIdPath, "utf8").trim(),
      sourceDigest: sourceDigestAtCompletion,
    })}\n`,
    "utf8"
  );
}

async function startNextServer({ ensureBuild = true, dev = false } = {}) {
  if (ensureBuild && !dev) ensureWebBuild();

  const port = await findFreePort();
  const baseUrl = `http://localhost:${port}`;

  const nextBin = path.join(webDir, "node_modules", "next", "dist", "bin", "next");
  const command = dev
    ? [nextBin, "dev", "--webpack", "-p", String(port)]
    : [nextBin, "start", "-p", String(port)];
  const proc = spawn(process.execPath, command, {
    cwd: webDir,
    env: {
      ...withLaunchTestDefaults(process.env),
      ...(dev ? { NODE_ENV: "development" } : {}),
    },
    stdio: ["ignore", "inherit", "inherit"]
  });

  let stopped = false;
  const stop = async () => {
    if (stopped) return;
    stopped = true;
    proc.kill("SIGTERM");
    await wait(250);
    if (!proc.killed) proc.kill("SIGKILL");
  };

  await waitForHealth(baseUrl);
  return { baseUrl, port, stop };
}

module.exports = {
  computeContractBuildDigest,
  computeWebSourceDigest,
  markerMatchesCandidate,
  startNextServer,
  withLaunchTestDefaults,
};
