const { spawn } = require("child_process");
const path = require("path");

const { startNextServer } = require(path.resolve(process.cwd(), "..", "scripts", "next_server"));

async function main() {
  const next = await startNextServer();

  try {
    const playwrightBin = path.join(process.cwd(), "node_modules", ".bin", "playwright");
    const child = spawn(playwrightBin, ["test", "tests/ui/launch-smoke.spec.ts", "--workers=1"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PLAYWRIGHT_SKIP_WEB_SERVER: "1",
        PLAYWRIGHT_TEST_BASE_URL: next.baseUrl,
      },
      stdio: "inherit",
    });

    const exitCode = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => {
        if (signal) {
          console.error(`Launch smoke browser exited on signal ${signal}.`);
          resolve(1);
          return;
        }
        resolve(code ?? 1);
      });
    });

    await next.stop();
    process.exit(exitCode);
  } catch (error) {
    await next.stop();
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
