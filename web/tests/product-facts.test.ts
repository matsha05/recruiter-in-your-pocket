import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { getTierDefaults, JOB_SEARCH_PASS_DAYS } from "../lib/billing/entitlements";
import { PRICING_PLANS, REFUND_WINDOW_DAYS } from "../lib/billing/pricing";

// Every sentence in the product that states what the Job Search Pass costs, how many reports it
// adds, how long it lasts, or how long a refund is open, checked against the code that decides it.
// The price, the length and the count are each typed out in a few dozen places: pages, the paywall,
// API messages, the Terms, llms.txt. When one of them changes, this fails on every sentence that
// still states the old one, with the file and line. (tests/compare-prices.test.ts does the same job
// for the other tools' prices; tests/billing-pricing.test.ts covers the pricing cards themselves.)
//
// The facts come from what enforces them, never from copy:
//   - length: JOB_SEARCH_PASS_DAYS, which sets the pass's expiry (lib/billing/entitlements.ts)
//   - reports: what a fulfilled pass is granted (getTierDefaults("30d"))
//   - price: the amount checkout is validated against (lib/billing/stripeOffers.ts)
//   - refund window: policy only, issued by hand; REFUND_WINDOW_DAYS in lib/billing/pricing.ts

const root = process.cwd();

const offers = readFileSync(path.join(root, "lib/billing/stripeOffers.ts"), "utf8");
const passOffer = offers.match(/\{\s*tier: "30d",[^}]*?expectedUnitAmount: ([\d_]+),/)?.[1];
assert.ok(passOffer, "stripeOffers.ts states the Job Search Pass's expected amount in cents");
const cents = Number(passOffer.replace(/_/g, ""));
assert.equal(cents % 100, 0, "a price with cents needs this test taught to read it");

const FACTS = {
  price: cents / 100,
  days: JOB_SEARCH_PASS_DAYS,
  reports: getTierDefaults("30d", { now: new Date("2026-11-11T12:00:00.000Z") }).usesRemaining,
  refundDays: REFUND_WINDOW_DAYS,
};
assert.equal(PRICING_PLANS["30d"].price, `$${FACTS.price}`, "the pricing card and the checkout amount agree");

// --- Where product copy lives ------------------------------------------------
// Skipped: tests; the other tools' prices on the compare pages (their own test); research articles
// and the offer guides, whose dollar figures and day counts are about hiring, not the pass; prompts
// and evals, which are not shown to anyone; internal tools.
const SKIP = /\.test\.|[\\/](tests|compare|research|internal|playground|evals|llm|gauntlet|guides)[\\/]|comp-calculator|negotiation|compensation/i;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}
const files = ["app", "components", "lib"]
  .flatMap((dir) => walk(path.join(root, dir)))
  .filter((file) => /\.tsx?$/.test(file) && !SKIP.test(path.relative(root, file)));

// --- The text a reader can be shown --------------------------------------------
// String literals, template literals and JSX text, read from the syntax tree so a code comment that
// mentions an old price ("90 days since Nov 2, was 30") is never mistaken for copy.
type Passage = { file: string; line: number; text: string };

function passages(file: string): Passage[] {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const found: Passage[] = [];
  const add = (node: ts.Node, text: string) => {
    const clean = text
      .replace(/&rsquo;|&apos;|&#x27;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&middot;/g, "·")
      .replace(/\s+/g, " ")
      .trim();
    if (clean) found.push({ file: path.relative(root, file), line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, text: clean });
  };
  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)) add(node, node.text);
    // `${promise} A $29 pass…`: the typed parts, with each substitution left as a gap.
    else if (ts.isTemplateExpression(node)) add(node, [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(" … "));
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

// --- What a sentence is about ----------------------------------------------------
const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  twelve: 12, fourteen: 14, fifteen: 15, twenty: 20, thirty: 30, sixty: 60, ninety: 90,
};
const NUMBER = `(\\d+|${Object.keys(NUMBER_WORDS).join("|")})`;
const toNumber = (value: string) => NUMBER_WORDS[value.toLowerCase()] ?? Number(value);

// "pass" alone is also what a recruiter does and what a first pass is, so the pass is recognized by
// its name, by "the pass", by the reports it adds, or by its own idioms ("good for", "renew").
const ABOUT_PASS = new RegExp(`Job Search Pass|\\bthe pass\\b|\\b(more|additional|paid) (complete |resume )*(reports?|reads?)\\b|\\b${NUMBER} more\\b|\\bgood for\\b|\\brenew`, "i");
const ABOUT_REFUND = /\brefund/i;
// Other products' terms that share a sentence shape: OpenAI's log retention, cookie lifetimes.
const NOT_OURS = /\bOpenAI\b|\bcookies?\b|abuse-monitoring/i;

const DAYS = new RegExp(`\\b${NUMBER}(?:[- ]calendar)?[- ]days?\\b`, "gi");
const PRICE = /\$(\d+(?:\.\d+)?)/g;
const REPORTS = new RegExp(`\\b${NUMBER} (?:more|additional|paid)(?: complete| resume)* (?:reports?|reads?)\\b`, "gi");

type Problem = Passage & { sentence: string; said: string; fact: string };
const problems: Problem[] = [];
const checked = { price: 0, days: 0, reports: 0, refund: 0 };

for (const file of files) {
  for (const passage of passages(file)) {
    for (const sentence of passage.text.split(/(?<=[.!?])\s+/)) {
      if (NOT_OURS.test(sentence)) continue;
      const refund = ABOUT_REFUND.test(sentence);
      const pass = ABOUT_PASS.test(sentence);
      if (!refund && !pass) continue;
      const wrong = (said: string, fact: string) => problems.push({ ...passage, sentence, said, fact });

      for (const match of sentence.matchAll(DAYS)) {
        const days = toNumber(match[1]);
        if (refund) {
          checked.refund += 1;
          if (days !== FACTS.refundDays) wrong(match[0], `the refund window is ${FACTS.refundDays} days (REFUND_WINDOW_DAYS, lib/billing/pricing.ts)`);
        } else {
          checked.days += 1;
          if (days !== FACTS.days) wrong(match[0], `the pass lasts ${FACTS.days} days (JOB_SEARCH_PASS_DAYS, lib/billing/entitlements.ts)`);
        }
      }
      if (!pass) continue;
      for (const match of sentence.matchAll(PRICE)) {
        checked.price += 1;
        // $0 is the free report, named beside the pass on the pricing cards.
        if (Number(match[1]) !== FACTS.price && Number(match[1]) !== 0) wrong(match[0], `the pass costs $${FACTS.price} (expectedUnitAmount, lib/billing/stripeOffers.ts)`);
      }
      for (const match of sentence.matchAll(REPORTS)) {
        checked.reports += 1;
        if (toNumber(match[1]) !== FACTS.reports) wrong(match[0], `the pass adds ${FACTS.reports} reports (getTierDefaults("30d"), lib/billing/entitlements.ts)`);
      }
    }
  }
}

assert.deepEqual(
  problems.map((problem) => `${problem.file}:${problem.line} says "${problem.said}" in "${problem.sentence}"; ${problem.fact}`),
  [],
  "a sentence states a product fact the code no longer enforces",
);

// The scan must keep finding the sentences it exists for. These floors are about half of what the
// product stated on November 11, 2026; a refactor that hides the copy from the scan fails here.
assert.ok(checked.price >= 8, `expected the price stated in at least 8 sentences, found ${checked.price}`);
assert.ok(checked.days >= 10, `expected the pass length stated in at least 10 sentences, found ${checked.days}`);
assert.ok(checked.reports >= 8, `expected the report count stated in at least 8 sentences, found ${checked.reports}`);
assert.ok(checked.refund >= 2, `expected the refund window stated in at least 2 sentences, found ${checked.refund}`);

console.log(
  `product facts: $${FACTS.price}, ${FACTS.reports} reports, ${FACTS.days} days, ${FACTS.refundDays}-day refund; ` +
  `${checked.price} price, ${checked.reports} count, ${checked.days} length and ${checked.refund} refund statements in ${files.length} files`,
);
