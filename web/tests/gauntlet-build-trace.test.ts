import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

async function pathExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findRouteTraces(directory: string): Promise<string[]> {
  const traces: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) traces.push(...await findRouteTraces(filePath));
    else if (entry.name.endsWith(".nft.json") && filePath.includes(`${path.sep}launch${path.sep}gauntlet${path.sep}`)) {
      traces.push(filePath);
    }
  }
  return traces;
}

async function main() {
  const serverRoot = path.join(process.cwd(), ".next/server/app");
  if (!await pathExists(serverRoot)) {
    if (process.env.CI) throw new Error("CI must build Next.js before checking the Gauntlet route trace");
    console.log("Gauntlet build trace test skipped: run npm run build first.");
    return;
  }

  const traces = await findRouteTraces(serverRoot);
  assert.ok(traces.length > 0, "the production build must emit a /launch/gauntlet route trace");
  const tracedPaths = new Set<string>();
  let routeSource = "";
  for (const tracePath of traces) {
    const trace = JSON.parse(await readFile(tracePath, "utf8")) as { files?: unknown };
    assert.ok(Array.isArray(trace.files), `${tracePath} must contain a files array`);
    for (const entry of trace.files) {
      if (typeof entry === "string") tracedPaths.add(path.resolve(path.dirname(tracePath), entry));
    }
    routeSource += await readFile(tracePath.replace(/\.nft\.json$/, ""), "utf8");
  }

  assert.match(routeSource, /activeIterationId/, "the server bundle must include the Gauntlet manifest");
  assert.match(routeSource, /iteration-000-baseline/, "the server bundle must include the baseline definition");
  assert.match(routeSource, /iteration-002/, "the server bundle must include the active definition");

  for (const bundledDefinition of [
    "gauntlet/manifest.json",
    "gauntlet/iterations/iteration-000-baseline.json",
    "gauntlet/iterations/iteration-002.json",
  ]) {
    const looseFile = path.join(process.cwd(), bundledDefinition);
    assert.equal(
      tracedPaths.has(looseFile),
      false,
      `route trace must not depend on loose ${bundledDefinition}; the server bundle carries it`,
    );
  }
  assert.equal(
    [...tracedPaths].some((filePath) => filePath.includes(`${path.sep}gauntlet${path.sep}artifacts${path.sep}iteration-`)),
    false,
    "the hosted route must not bundle iteration evidence",
  );

  console.log("Gauntlet production route trace tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
