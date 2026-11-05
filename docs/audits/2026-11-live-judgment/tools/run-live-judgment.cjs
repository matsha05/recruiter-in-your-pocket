#!/usr/bin/env node
/**
 * Launcher for run-live-judgment.ts. Run from web/:
 *
 *   RIYP_ALLOW_PAID_EVALS=true node ../docs/audits/2026-11-live-judgment/tools/run-live-judgment.cjs \
 *     --manifest ../docs/audits/2026-11-live-judgment/manifest.json --batch holes --runs 3 --budget-usd 3
 *
 * Mirrors what the production modules need outside Next: the "@/" alias, bundled .txt prompts,
 * the "server-only" marker, and .env.local (the OpenAI key only, in this worktree).
 */
const fs = require("fs");
const Module = require("module");
const path = require("path");
const WEB_ROOT = process.cwd();
if (!fs.existsSync(path.join(WEB_ROOT, "prompts", "resume_v2.txt"))) {
  console.error("Run this from web/.");
  process.exit(1);
}
const ts = require(path.join(WEB_ROOT, "node_modules", "typescript"));
require(path.join(WEB_ROOT, "node_modules", "dotenv")).config({ path: path.join(WEB_ROOT, ".env.local") });

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === "server-only") return {};
  const target = request.startsWith("@/") ? path.join(WEB_ROOT, request.slice(2)) : request;
  return originalLoad.call(this, target, parent, isMain);
};

require.extensions[".ts"] = function registerTs(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  });
  module._compile(outputText, filename);
};
require.extensions[".txt"] = function registerText(module, filename) {
  module.exports = fs.readFileSync(filename, "utf8");
};

require(path.join(__dirname, "run-live-judgment.ts"));
