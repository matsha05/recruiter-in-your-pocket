const fs = require("fs");
const path = require("path");
const ts = require("typescript");

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
  console.error("Usage: node scripts/run-ts-script.cjs <path-to-script.ts> [...args]");
  process.exit(1);
}

const target = path.resolve(process.cwd(), input);
const passthroughArgs = process.argv.slice(3);

process.argv = [process.argv[0], target, ...passthroughArgs];
require(target);
