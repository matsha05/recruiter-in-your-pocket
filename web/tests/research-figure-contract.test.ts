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
  const ratingFigure = renderToStaticMarkup(createElement(ErrorImpactDiagram, { figureNumber: 1 }));
  // Sterkens et al. (2023), Table 4 (1A), reports -0.730 and -1.850
  // on the 0–10 invitation-rating scale described in Methods 2.3.
  assert.match(ratingFigure, /0–10 interview rating/);
  assert.match(ratingFigure, /against the same resume without errors/);
  assert.match(ratingFigure, /Two errors[\s\S]*−0\.73[\s\S]*points/);
  assert.match(ratingFigure, /Five errors[\s\S]*−1\.85[\s\S]*points/);
  assert.match(ratingFigure, /recruiters rated fictional resumes; nobody was actually called/);
  assert.match(ratingFigure, /One error on its own wasn(?:'|&#x27;)t tested/);
  assert.doesNotMatch(ratingFigure, /81\.5|92\.7|100%|percentage points|<progress/,
    "an experimental rating difference must not become an invented baseline or callback rate");

  assert.doesNotMatch(ratingFigure, /one mistake|single signal|stricter screen|threshold tightens/i,
    "the figure should not invent a one-typo decision chain");
  // Five circled misspellings: the example line matches the five-error case the figure highlights.
  for (const typo of ["onbaording", "managd", "calender", "recieved", "excellance"]) assert.match(ratingFigure, new RegExp(`>${typo}<`));

  const article = readFileSync(path.join(process.cwd(), "app/(editorial)/research/spelling-errors-impact/page.tsx"), "utf8");
  assert.match(article, /Five errors: −1\.85 on a 0–10 interview rating/);
  assert.match(article, /hypothetical interview rating/);
  assert.doesNotMatch(article, /18\.5|81\.5|percentage-point/,
    "article and figure must use the same original rating units");
  // The perception finding stays in the text (its table was cut Nov 10, 2026: labels with no sizes).
  assert.match(article, /interpersonal skills, conscientiousness, and mental ability/);
  assert.match(article, /https:\/\/journals\.plos\.org\/plosone\/article\?id=10\.1371\/journal\.pone\.0283280/);
  console.log("Research figure evidence contracts passed");
} finally {
  runtimeModule._load = originalLoad;
  if (originalTsxLoader) require.extensions[".tsx"] = originalTsxLoader;
  else delete require.extensions[".tsx"];
}
