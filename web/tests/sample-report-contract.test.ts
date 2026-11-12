import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { WorklistReportSchema } from "../lib/llm/worklist-schema";
import { resolveCardLine } from "../lib/llm/worklist-grounding";
import { JORDAN_EXAMPLE } from "../lib/marketing/jordan-example";

// The public sample is Jordan's report: real output from the production prompt on a fictional resume
// (tests/fixtures/sample). It must stay real output, in the shape the route writes (the worklist report,
// since November 6, 2026), and it must not promise what reports don't deliver.
const sample = WorklistReportSchema.parse(JSON.parse(readFileSync(
  path.join(process.cwd(), "public/sample-report.json"), "utf8",
)));
const resume = readFileSync(path.join(process.cwd(), "tests/fixtures/sample/jordan-miller-resume.txt"), "utf8");
const generated = JSON.parse(readFileSync(
  path.join(process.cwd(), "tests/fixtures/sample/jordan-miller-report.generated.json"), "utf8",
));

assert.deepEqual(JSON.parse(JSON.stringify(sample)), JSON.parse(JSON.stringify(WorklistReportSchema.parse(generated.payload))),
  "the sample is the generated payload, unedited");
assert.equal(generated.model, "gpt-6.1-terra", "the sample records the production model it was generated with");
assert.match(generated.prompt_sha256, /^[0-9a-f]{64}$/, "the sample records the prompt it was generated with");
assert.equal(generated.prompt_version, "resume_v3", "the sample is generated on the worklist prompt");
assert.match(generated.prompt_sha256, /^338ac33a/, "the sample is generated on the shipped worklist prompt");

// Every quoted line is on Jordan's resume, once; every example keeps its facts inside brackets or on the page.
for (const [index, card] of sample.cards.entries()) {
  if (card.kind === "line" || card.kind === "keep") {
    assert.equal(resolveCardLine(card.line, resume).status, "resolved", `card ${index + 1} quotes a line that is on Jordan's resume`);
  }
  if (card.kind !== "keep") {
    assert.ok(card.question, `card ${index + 1} asks the question that fills its blanks`);
  }
}
assert.ok(sample.cards.some((card) => card.kind === "keep"), "the sample shows the line the rest should read like");
assert.ok(!/critical miss|the read\b/iu.test(JSON.stringify(sample)), "the retired names never appear");

// The homepage hero draws Jordan's resume; the lines it shows must be the resume the sample read.
for (const line of [
  "Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue",
  "Introduced monthly renewal-risk reviews across the portfolio",
  "Ran quarterly business reviews with customer leadership teams",
  "Assisted account managers with various tasks as needed",
]) assert.ok(resume.includes(line), `Jordan's resume includes "${line}"`);

// The homepage and the methodology page quote this report word for word: the verdict, a card's line, that
// card's note, and its question.
assert.equal(sample.verdict, JORDAN_EXAMPLE.verdict, "the homepage's verdict is the sample's");
const quotedCard = sample.cards.find((card) => card.line === JORDAN_EXAMPLE.line);
assert.ok(quotedCard, "the homepage quotes a line the sample cards");
assert.equal(quotedCard?.cannot_tell, JORDAN_EXAMPLE.note, "the homepage's note is the card's own words");
assert.equal(quotedCard?.question, JORDAN_EXAMPLE.asks[0].question, "the methodology page asks the card's question");
const homepage = readFileSync(path.join(process.cwd(), "lib/marketing/jordan-example.ts"), "utf8");
for (const quote of [JORDAN_EXAMPLE.verdict, JORDAN_EXAMPLE.line, JORDAN_EXAMPLE.note, JORDAN_EXAMPLE.asks[0].question]) {
  assert.ok(JSON.stringify(sample).includes(quote.replace(/"/g, '\\"')), `the sample report says "${quote}"`);
  assert.ok(homepage.includes(quote.replace(/"/g, '\\"')), `the homepage example quotes "${quote}"`);
}

// ---- The samples by situation (Nov 11, 2026): each is real output on its own fictional resume, unedited ----
{
  const { SAMPLE_REPORTS, samplePath, sampleBySlug } = require("../lib/reports/sample-reports");
  const { PUBLIC_PAGES } = require("../lib/seo/public-pages");
  assert.equal(SAMPLE_REPORTS[0].slug, null, "Jordan's report stays at /sample-report");
  assert.equal(sampleBySlug("no-such-sample"), undefined);
  const REAL_ORGANIZATIONS = /ohio state|cardinal health|lake travis|kipp|general assembly|coursera|texas state|oracle|university of washington|jiao tong|st\. thomas/iu;
  for (const entry of SAMPLE_REPORTS.slice(1)) {
    const published = WorklistReportSchema.parse(JSON.parse(readFileSync(path.join(process.cwd(), `public/sample-reports/${entry.slug}.json`), "utf8")));
    const record = JSON.parse(readFileSync(path.join(process.cwd(), `tests/fixtures/sample/${entry.fixture}-report.generated.json`), "utf8"));
    const text = readFileSync(path.join(process.cwd(), `tests/fixtures/sample/${entry.fixture}-resume.txt`), "utf8");
    assert.deepEqual(JSON.parse(JSON.stringify(published)), JSON.parse(JSON.stringify(WorklistReportSchema.parse(record.payload))), `${entry.slug} is the generated payload, unedited`);
    assert.equal(record.model, "gpt-6.1-terra");
    assert.equal(record.prompt_version, "resume_v3");
    for (const [index, card] of published.cards.entries()) {
      if (card.kind === "line" || card.kind === "keep" || card.kind === "upgrade") {
        assert.equal(resolveCardLine(card.line, text).status, "resolved", `${entry.slug} card ${index + 1} quotes a line that is on the resume`);
      }
    }
    assert.ok(text.startsWith(entry.person.toUpperCase()) || text.startsWith(entry.person), `${entry.slug} is ${entry.person}'s resume`);
    assert.match(text, /@example\.com/u, `${entry.slug} uses a reserved example address`);
    assert.doesNotMatch(text + JSON.stringify(published), REAL_ORGANIZATIONS, `${entry.slug} names no real employer or school`);
    assert.ok(!/critical miss/iu.test(JSON.stringify(published)));
    assert.ok(PUBLIC_PAGES.some((page: { path: string }) => page.path === samplePath(entry)), `${samplePath(entry)} is listed as a public page`);
    assert.ok(entry.description.includes(entry.person) && /fictional/u.test(entry.description), `${entry.slug}'s description says the person is fictional`);
  }
}

console.log("Sample report content contracts passed");
