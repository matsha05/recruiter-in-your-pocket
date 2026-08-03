import type { GauntletIteration, GauntletManifest } from "./types";

declare const __RIYP_GAUNTLET_MANIFEST_JSON__: string;
declare const __RIYP_GAUNTLET_BASELINE_JSON__: string;
declare const __RIYP_GAUNTLET_ITERATION_002_JSON__: string;

function requiredSource(source: string | null, label: string) {
  if (!source) throw new Error(`Bundled Gauntlet ${label} is unavailable`);
  return source;
}

export function bundledGauntletManifest() {
  const source = typeof __RIYP_GAUNTLET_MANIFEST_JSON__ === "string"
    ? __RIYP_GAUNTLET_MANIFEST_JSON__ : null;
  return JSON.parse(requiredSource(source, "manifest")) as GauntletManifest;
}

export function bundledGauntletIterations() {
  const sources = [
    typeof __RIYP_GAUNTLET_BASELINE_JSON__ === "string" ? __RIYP_GAUNTLET_BASELINE_JSON__ : null,
    typeof __RIYP_GAUNTLET_ITERATION_002_JSON__ === "string" ? __RIYP_GAUNTLET_ITERATION_002_JSON__ : null,
  ];
  return sources.map((source) => {
    const raw = requiredSource(source, "iteration definition");
    return { raw, iteration: JSON.parse(raw) as GauntletIteration };
  });
}
