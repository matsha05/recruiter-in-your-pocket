const { existsSync } = require("fs");
const { spawn, spawnSync } = require("child_process");
const path = require("path");
const net = require("net");

const repoRoot = path.join(__dirname, "..");
const webDir = path.join(repoRoot, "web");

function withLaunchTestDefaults(env) {
  return {
    ...env,
    USE_MOCK_OPENAI: env.USE_MOCK_OPENAI || "1",
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_ENABLE_ANALYTICS: env.NEXT_PUBLIC_ENABLE_ANALYTICS || "false",
    NEXT_PUBLIC_ENABLE_BILLING_UNLOCK: env.NEXT_PUBLIC_ENABLE_BILLING_UNLOCK || "false",
    NEXT_PUBLIC_ENABLE_EXTENSION_SYNC: env.NEXT_PUBLIC_ENABLE_EXTENSION_SYNC || "false",
    NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE: env.NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE || "false",
    NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS: env.NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS || "false",
    NEXT_PUBLIC_ENABLE_ERROR_REPLAY: env.NEXT_PUBLIC_ENABLE_ERROR_REPLAY || "false",
    RIYP_ALLOW_TEST_RATE_LIMIT_FALLBACK: "true",
    RIYP_ALLOW_TEST_ANONYMOUS_ACCESS_FALLBACK: "true",
    SKIP_DB_READY_CHECK: env.SKIP_DB_READY_CHECK || "1",
    // Contract tests must remain hermetic even when the parent launch shell
    // carries real or placeholder hosted Redis credentials.
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: "",
    KV_REST_API_URL: "",
    KV_REST_API_TOKEN: "",
  };
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

function ensureWebBuild() {
  const buildIdPath = path.join(webDir, ".next", "BUILD_ID");
  const hasProductionBuild = existsSync(buildIdPath);
  const shouldForce = process.env.FORCE_NEXT_BUILD === "1" || process.env.FORCE_NEXT_BUILD === "true";

  if (!shouldForce && hasProductionBuild) {
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
}

async function startNextServer({ ensureBuild = true } = {}) {
  if (ensureBuild) ensureWebBuild();

  const port = await findFreePort();
  const baseUrl = `http://localhost:${port}`;

  const nextBin = path.join(webDir, "node_modules", "next", "dist", "bin", "next");
  const proc = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: webDir,
    env: withLaunchTestDefaults(process.env),
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

module.exports = { startNextServer };
