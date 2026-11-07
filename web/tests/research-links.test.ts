import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import Module from "node:module";
import path from "node:path";

// Every research article cites the sibling that holds the claim it leans on, from inside its text:
// two to four links per body, through <ResearchLink to="hub-id"> (components/research/ResearchLink.tsx)
// or a comparison page, with the claim as the link text rather than the sibling's title. The rendered
// graph is measured by tests/ui/internal-links.spec.ts; this checks the sources without a build.
// Plan: docs/growth/2026-11-aeo-and-internal-linking.md, phase 1.

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};
const runtimeModule = Module as RuntimeModule;
const originalLoad = runtimeModule._load;
runtimeModule._load = function loadAliases(request, parent, isMain) {
  return originalLoad(request.startsWith("@/") ? path.join(process.cwd(), request.slice(2)) : request, parent, isMain);
};

const MIN_LINKS = 2;
const MAX_LINKS = 4;

try {
  const { categories } = require("../components/research/ResearchHubData");
  type HubArticle = { id: string; href: string; question: string; title?: string };
  const hub = new Map<string, HubArticle>(
    (categories as Array<{ articles: HubArticle[] }>).flatMap((category) => category.articles).map((article) => [article.id, article]),
  );
  const compareSource = readFileSync(path.join(process.cwd(), "components/compare/comparisons.tsx"), "utf8");
  const compareSlugs = new Set([...compareSource.matchAll(/^\s+slug: "([a-z-]+)",$/gm)].map((match) => match[1]));

  const researchDir = path.join(process.cwd(), "app/(editorial)/research");
  const articles = readdirSync(researchDir)
    .map((name) => ({ id: name, file: path.join(researchDir, name, "page.tsx") }))
    .filter(({ id, file }) => existsSync(file) && hub.has(id));
  assert.ok(articles.length >= 16, `expected the research articles under app/(editorial)/research, found ${articles.length}`);

  let total = 0;
  for (const { id, file } of articles) {
    const source = readFileSync(file, "utf8");
    const links = [...source.matchAll(/<ResearchLink to="([a-z-]+)">([\s\S]*?)<\/ResearchLink>/g)].map((match) => ({ to: match[1], text: match[2].replace(/\s+/g, " ").trim() }));
    const comparisons = [...source.matchAll(/comparison\("([a-z-]+)"\)\.path/g)].map((match) => match[1]);
    const count = links.length + comparisons.length;
    assert.ok(count >= MIN_LINKS, `${id}: ${count} in-text research link(s); each article cites at least ${MIN_LINKS} siblings from its text`);
    assert.ok(count <= MAX_LINKS, `${id}: ${count} in-text links; keep an article's body to ${MAX_LINKS} at most`);
    total += count;

    for (const link of links) {
      const target = hub.get(link.to);
      assert.ok(target, `${id} links "${link.to}", which is not on the Research hub (ResearchHubData.ts)`);
      assert.notEqual(link.to, id, `${id} links itself`);
      const title = (target.title ?? target.question).toLowerCase();
      assert.notEqual(link.text.toLowerCase(), title, `${id}: the link to ${link.to} uses the title as its text; make it the claim`);
      assert.ok(link.text.length >= 20, `${id}: the link to ${link.to} reads "${link.text}"; link the claim, not a word`);
    }
    for (const slug of comparisons) {
      assert.ok(compareSlugs.has(slug), `${id} links comparison "${slug}", which comparisons.tsx does not define`);
    }
    assert.equal(new Set(links.map((link) => link.to)).size, links.length, `${id} links the same sibling twice`);
  }

  // Every comparison page's "Is X worth it?" cites the research behind its claim.
  const worthIt = [...compareSource.matchAll(/id: "worth-it",[\s\S]*?\n {12}\},/g)];
  assert.equal(worthIt.length, compareSlugs.size, "every comparison has an \"Is X worth it?\" section");
  for (const section of worthIt) {
    assert.ok(/<ResearchLink to="/.test(section[0]), "each \"Is X worth it?\" section links the research behind its claim");
  }
  for (const match of compareSource.matchAll(/<ResearchLink to="([a-z-]+)">/g)) {
    assert.ok(hub.has(match[1]), `comparisons.tsx links "${match[1]}", which is not on the Research hub`);
  }

  console.log(`research links: ${articles.length} articles, ${total} in-text links, ${worthIt.length} comparisons cite the research`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
