import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Module from "node:module";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};
const runtimeModule = Module as RuntimeModule;
const originalLoad = runtimeModule._load;
const originalTsxLoader = require.extensions[".tsx"];
require.extensions[".tsx"] = require.extensions[".ts"];
runtimeModule._load = function loadFigureAliases(request, parent, isMain) {
  // EvidenceVisuals also exports an unrelated flow renderer; its arrow icon
  // is not used by these tables and requires a bundler in this package version.
  if (request === "@phosphor-icons/react") return { ArrowRight: () => null };
  return originalLoad(request.startsWith("@/") ? path.join(process.cwd(), request.slice(2)) : request, parent, isMain);
};

try {
  const { ErrorImpactDiagram } = require("../components/research/diagrams/ErrorImpactDiagram");
  const { InferenceLadderDiagram } = require("../components/research/diagrams/InferenceLadderDiagram");
  const ratingFigure = renderToStaticMarkup(createElement(ErrorImpactDiagram, { figureNumber: 1 }));
  const perceptionFigure = renderToStaticMarkup(createElement(InferenceLadderDiagram, { figureNumber: 2 }));
  // Sterkens et al. (2023), Table 4 (1A), reports -0.730 and -1.850
  // on the 0–10 invitation-rating scale described in Methods 2.3.
  assert.match(ratingFigure, /0–10 interview rating/);
  assert.match(ratingFigure, /0 errors[\s\S]*Reference group/);
  assert.match(ratingFigure, /2 errors[\s\S]*−0\.73 points/);
  assert.match(ratingFigure, /5 errors[\s\S]*−1\.85 points/);
  assert.match(ratingFigure, /hypothetical interview ratings, not observed callback rates/);
  assert.match(ratingFigure, /A single error was not tested/);
  assert.doesNotMatch(ratingFigure, /81\.5|100%|percentage points|<progress/,
    "an experimental rating difference must not become an invented baseline or callback rate");

  assert.match(perceptionFigure, /Interpersonal skills/);
  assert.match(perceptionFigure, /Conscientiousness/);
  assert.match(perceptionFigure, /Mental abilities/);
  assert.match(perceptionFigure, /impressions, not measured job performance/);
  assert.doesNotMatch(`${ratingFigure} ${perceptionFigure}`, /one mistake|single signal|stricter screen|threshold tightens/i,
    "neither figure should invent a one-typo decision chain");
  assert.notEqual(ratingFigure, perceptionFigure, "the article separates measured ratings from applicant perceptions");

  const article = readFileSync(path.join(process.cwd(), "app/(editorial)/research/spelling-errors-impact/page.tsx"), "utf8");
  assert.match(article, /Five errors: −1\.85 on a 0–10 interview rating/);
  assert.match(article, /hypothetical judgments, not observed callbacks/);
  assert.doesNotMatch(article, /18\.5|81\.5|percentage-point/,
    "article and figure must use the same original rating units");
  assert.match(article, /https:\/\/journals\.plos\.org\/plosone\/article\?id=10\.1371\/journal\.pone\.0283280/);
  console.log("Research figure evidence contracts passed");
} finally {
  runtimeModule._load = originalLoad;
  if (originalTsxLoader) require.extensions[".tsx"] = originalTsxLoader;
  else delete require.extensions[".tsx"];
}
