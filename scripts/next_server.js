const { spawn, spawnSync } = require("child_process");
const path = require("path");
const net = require("net");

const repoRoot = path.join(__dirname, "..");
const webDir = path.join(repoRoot, "web");

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
  // Always rebuild to ensure route changes are included.
  const r = spawnSync("npm", ["run", "build"], { cwd: webDir, stdio: "inherit" });
  if (r.status !== 0) throw new Error("Failed to build web app");
}

async function startNextServer({ ensureBuild = true } = {}) {
  if (ensureBuild) ensureWebBuild();

  const port = await findFreePort();
  const baseUrl = `http://localhost:${port}`;

  const nextBin = path.join(webDir, "node_modules", "next", "dist", "bin", "next");
  const proc = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: webDir,
    env: process.env,
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

