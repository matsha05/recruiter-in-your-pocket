const { existsSync } = require("fs");
const { spawn, spawnSync } = require("child_process");
const path = require("path");

const cwd = process.cwd();
const env = { ...process.env };
const buildIdPath = path.join(cwd, ".next", "BUILD_ID");

if (!existsSync(buildIdPath) || env.FORCE_NEXT_BUILD === "1" || env.FORCE_NEXT_BUILD === "true") {
  const build = spawnSync("npm", ["run", "build"], {
    cwd,
    env,
    stdio: "inherit",
  });

  if (build.status !== 0) {
    process.exit(build.status || 1);
  }
}

const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "start", "-p", "3100", "-H", "127.0.0.1"], {
  cwd,
  env,
  stdio: "inherit",
});

const shutdown = () => {
  if (!child.killed) {
    child.kill("SIGTERM");
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

child.on("exit", (code) => {
  process.exit(code || 0);
});
