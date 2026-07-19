const fs = require("node:fs");
const path = require("node:path");

const webRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webRoot, "..");
const nextDir = path.join(webRoot, ".next");
const nextPackage = path.join(nextDir, "package.json");

function bridgeMissingFiles(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) return;

  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      bridgeMissingFiles(sourcePath, targetPath);
    } else if (!fs.existsSync(targetPath)) {
      fs.symlinkSync(path.relative(path.dirname(targetPath), sourcePath), targetPath);
    }
  }
}

if (!fs.existsSync(nextDir)) {
  throw new Error(`Next build output is missing at ${nextDir}`);
}

if (!fs.existsSync(nextPackage)) {
  fs.writeFileSync(nextPackage, '{"type":"commonjs"}\n');
}

function assertTraceIncludes(tracePath, expectedSuffix) {
  if (!fs.existsSync(tracePath)) {
    throw new Error(`Required Next.js trace is missing at ${tracePath}`);
  }

  const trace = JSON.parse(fs.readFileSync(tracePath, "utf8"));
  const files = Array.isArray(trace.files) ? trace.files : [];
  if (!files.some((file) => String(file).replaceAll("\\", "/").endsWith(expectedSuffix))) {
    throw new Error(`${expectedSuffix} is missing from ${tracePath}`);
  }
}

assertTraceIncludes(
  path.join(nextDir, "server", "app", "api", "resume-feedback", "route.js.nft.json"),
  "/prompts/resume_v2.txt"
);
assertTraceIncludes(
  path.join(nextDir, "server", "app", "api", "export-pdf", "route.js.nft.json"),
  "/public/assets/fonts/newsreader-latin-variable.ttf"
);
assertTraceIncludes(
  path.join(nextDir, "server", "app", "api", "export-pdf", "route.js.nft.json"),
  "/public/assets/fonts/instrument-sans-latin-variable.ttf"
);

// Vercel's Next.js finalizer currently resolves this package marker from the
// repository root for this monorepo, even though the configured app root is
// web/. Keep the workaround limited to Vercel builds so local output stays put.
if (process.env.VERCEL) {
  const rootNextDir = path.join(repoRoot, ".next");
  const webModulesDir = path.join(webRoot, "node_modules");
  const rootModulesDir = path.join(repoRoot, "node_modules");
  const webPublicDir = path.join(webRoot, "public");
  const rootPublicDir = path.join(repoRoot, "public");

  if (!fs.existsSync(rootNextDir)) {
    fs.symlinkSync(path.relative(repoRoot, nextDir), rootNextDir, "dir");
  }

  // Once the finalizer follows the root .next marker, its traced dependency
  // paths are also resolved from the repository root.
  if (!fs.existsSync(rootModulesDir) && fs.existsSync(webModulesDir)) {
    fs.symlinkSync(path.relative(repoRoot, webModulesDir), rootModulesDir, "dir");
  }

  if (!fs.existsSync(rootPublicDir) && fs.existsSync(webPublicDir)) {
    fs.symlinkSync(path.relative(repoRoot, webPublicDir), rootPublicDir, "dir");
  }

  bridgeMissingFiles(path.join(webRoot, "prompts"), path.join(repoRoot, "prompts"));
  bridgeMissingFiles(path.join(webRoot, "docs"), path.join(repoRoot, "docs"));
  bridgeMissingFiles(path.join(webRoot, "tests"), path.join(repoRoot, "tests"));
}
