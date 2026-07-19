const fs = require("fs");
const Module = require("module");
const path = require("path");
const ts = require("typescript");

const originalLoad = Module._load;
Module._load = function loadTestModule(request, parent, isMain) {
  if (request === "server-only") return {};
  return originalLoad.call(this, request, parent, isMain);
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

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/run-ts-test.cjs <path-to-test.ts>");
  process.exit(1);
}

const target = path.resolve(process.cwd(), input);
require(target);
