import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Module from "node:module";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { renderReportHtml } from "../lib/backend/pdf";
import {
  evaluateReportIntegrity,
  fixSlotIssues,
  scoreTestRetest,
} from "../lib/evals/integrity-checks";
import { generateMarkdownReport } from "../lib/evals/report";
import type { EvalRunOutput } from "../lib/evals/types";
import { normalizeReportForPdf } from "../lib/reports/pdf-export";
import {
  auditKeepFixCollisions,
  auditRepeats,
  criticalMissReason,
  fixCardSlots,
  reconcileReport,
  structuralGapKind,
} from "../lib/reports/report-integrity";
import { stemWord } from "../lib/reports/observation-tokens";

// Saved production-prompt outputs (resume prompt 83b2a2d1), validated by the current
// production validator. No model calls are made by this test.
const saved = JSON.parse(readFileSync(path.join(process.cwd(), "tests/fixtures/report-integrity/live-outputs-83b2a2d1.json"), "utf8")) as {
  resume_prompt_sha256: string;
  runs: Array<{ run_id: string; fixture_id: string; score: number; generation_status: string; replay_status: string; report: any }>;
};
const sample = JSON.parse(readFileSync(path.join(process.cwd(), "public/sample-report.json"), "utf8"));
assert.equal(saved.resume_prompt_sha256.slice(0, 8), "83b2a2d1");
assert.equal(saved.runs.length, 13);

function run(fixtureId: string, runId = "eval_1793463473819") {
  const match = saved.runs.find((item) => item.fixture_id === fixtureId && item.run_id === runId);
  assert.ok(match, `${fixtureId} in ${runId}`);
  return match.report;
}

const sales = run("synth_sales_executive_mid_foundation_1");
const dataScientist = run("synth_data_scientist_senior_elite_1");
const marketing = run("synth_marketing_manager_vp_elite_1");
const engineer = run("synth_software_engineer_mid_strong_1");
const ux = run("synth_ux_designer_director_strong_1");
const hr = run("synth_hr_manager_director_foundation_1");
const finance = run("synth_finance_analyst_senior_weak_1");
const product = run("synth_product_manager_entry_elite_1");
const operations = run("synth_operations_manager_entry_weak_1");

// ============================================
// Stemming keeps inflections together
// ============================================

for (const [left, right] of [
  ["evaluated", "evaluation"], ["proposals", "proposal"], ["presentations", "presentation"],
  ["coordinating", "coordination"], ["managed", "management"], ["mentoring", "mentorship"], ["tracking", "track"],
]) {
  assert.equal(stemWord(left), stemWord(right), `${left} and ${right} must compare equal`);
}

// ============================================
// Known contradictions from the audit
// ============================================

// Jordan's sample (real output, production prompt 83b2a2d1): the business-review strength sits on Fix 2's line.
const sampleIntegrity = reconcileReport(sample);
assert.deepEqual(
  auditKeepFixCollisions(sample).map(({ strength, line }) => [strength, line]),
  [["strengths[1]", "fix-1"]],
);
assert.deepEqual(sampleIntegrity.report.strengths, [sample.strengths[0], sample.strengths[2]],
  "strengths on lines the sample doesn't fix stay, in order");
// The Critical Miss gives its reason in the opening read and asks the model's own questions about its line.
assert.equal(criticalMissReason(sampleIntegrity), sample.top_fixes[0].why);
assert.deepEqual(fixCardSlots(sampleIntegrity, 0).whatToAdd, [
  "What factors did you review when identifying renewal risk across the portfolio?",
  "What changed in your renewal workflow after you introduced the monthly risk reviews?",
]);
assert.deepEqual(sampleIntegrity.structuralGaps, [], "the Verdict already mentions the objective, so it is not repeated before the bullets");

// Sales: the BrightWave proposal bullet is Keep #3 and the Critical Miss.
const salesIntegrity = reconcileReport(sales);
assert.deepEqual(auditKeepFixCollisions(sales), [{ strength: "strengths[2]", line: "fix-0", criticalMiss: true }]);
assert.ok(!salesIntegrity.report.strengths!.some((strength) => /BrightWave account, proposal/.test(strength)));
assert.deepEqual(fixCardSlots(salesIntegrity, 0), {
  why: undefined,
  whatToAdd: ["What did you personally prepare for a BrightWave proposal or presentation?"],
}, "the Critical Miss asks the question the model wrote for its own line");
assert.equal(criticalMissReason(salesIntegrity), sales.top_fixes[0].why, "the reason stays in the opening read");
assert.ok(!salesIntegrity.report.ideas!.questions!.some(({ question }) => /personally prepare/.test(question)),
  "a question that duplicates a fix leaves the open questions");

// Sales, HR, finance and product manager reports each bury an unexplained stretch since a 2023 end date.
for (const [name, report] of [["sales", sales], ["HR", hr], ["finance", finance], ["product manager", product]] as const) {
  const integrity = reconcileReport(report);
  assert.equal(integrity.structuralGaps.length, 1, `${name} surfaces its gap`);
  assert.equal(integrity.structuralGaps[0].kind, "employment_gap");
  assert.match(integrity.structuralGaps[0].text, /August 2023/);
  assert.ok(!integrity.report.gaps!.includes(integrity.structuralGaps[0].text), `${name}: the gap is not repeated in the notes`);
}
// The engineer's Verdict already says it, so it is not repeated.
const engineerIntegrity = reconcileReport(engineer);
assert.deepEqual(engineerIntegrity.structuralGaps, []);
assert.ok(engineerIntegrity.decisions.some((decision) => decision.kind === "repeat_dropped" && decision.path === "gaps[0]" && decision.of === "first_impression"));

// ============================================
// Precision: strengths on other lines stay
// ============================================

assert.ok(reconcileReport(dataScientist).report.strengths!.includes(dataScientist.strengths[0]),
  "the OptiMed deployment bullet is not the readmissions bullet");
assert.ok(reconcileReport(finance).report.strengths!.includes(finance.strengths[2]),
  "\"financial reporting\" in Skills is not the reporting bullet");
assert.ok(reconcileReport(marketing).report.strengths!.includes(marketing.strengths[0]),
  "the $25M budget in the Novara role is not the P&L skill line");
assert.ok(reconcileReport(engineer).report.strengths!.includes(engineer.strengths[2]),
  "the skills section is not the caregiving-break entry");
for (const index of [0, 1]) {
  assert.ok(reconcileReport(product).report.strengths!.includes(product.strengths[index]), `product strength ${index + 1} sits on another line`);
}
assert.ok(!reconcileReport(ux).report.strengths!.includes(ux.strengths[2]), "\"Own the UX budget\" is Fix 3's line");
assert.equal(structuralGapKind('The CAPM entry says "Learner level," but it is unclear whether that describes a credential.'), undefined);
assert.deepEqual(reconcileReport(sample).report.next_steps, [sample.next_steps[0], sample.next_steps[2]], "a next step that restates Fix 3 is dropped; the others stay");

// Streaming and stored reports can be partial or malformed; the pass must not throw on them.
for (const partial of [
  {},
  { top_fixes: [undefined, { fix: "Add the result." }], strengths: "not a list", gaps: [null], ideas: { questions: [undefined] } },
  { top_fixes: [{ evidence: { excerpt: "Led onboarding." } }], section_review: { Summary: null }, next_steps: [42] },
]) {
  assert.doesNotThrow(() => reconcileReport(partial as any));
  assert.doesNotThrow(() => evaluateReportIntegrity(partial));
}

// ============================================
// Invariants on every saved output
// ============================================

const allStrings = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
};

const outputs: Array<[string, any]> = [["sample", sample], ...saved.runs.map((item) => [`${item.fixture_id} ${item.run_id}`, item.report] as [string, any])];
let modelCollisions = 0;
let modelRepeats = 0;
for (const [label, report] of outputs) {
  const integrity = reconcileReport(report);
  modelCollisions += auditKeepFixCollisions(report).length;
  modelRepeats += auditRepeats(report).length;
  assert.deepEqual(auditKeepFixCollisions(integrity.report), [], `${label}: no line is both Keep and Fix`);
  assert.deepEqual(auditRepeats(integrity.report, integrity), [], `${label}: each observation renders once`);

  const source = new Set(allStrings(report));
  for (const text of [...allStrings(integrity.report), ...integrity.fixQuestions.flat(), ...integrity.structuralGaps.map(({ text }) => text)]) {
    assert.ok(source.has(text) || sentencesOf(report.top_fixes).includes(text), `${label}: the pass never writes new text: ${text}`);
  }
  const strengths = (report.strengths || []) as string[];
  assert.deepEqual(integrity.report.strengths, strengths.filter((strength) => integrity.report.strengths!.includes(strength)), `${label}: Keep order is preserved`);

  const remainingQuestions = (integrity.report.ideas?.questions || []).map(({ question }) => question);
  for (const [index] of (report.top_fixes || []).entries()) {
    const slots = fixCardSlots(integrity, index);
    assert.deepEqual(fixSlotIssues(index, slots, criticalMissReason(integrity)), [], `${label}: fix ${index + 1} slots`);
    for (const question of slots.whatToAdd) assert.ok(!remainingQuestions.includes(question), `${label}: a question renders once`);
  }
  const metrics = evaluateReportIntegrity(report);
  assert.equal(metrics.keep_fix_collisions.shown, 0);
  assert.equal(metrics.repeated_observations.shown, 0);
  assert.deepEqual(metrics.slot_mapping.shown, [], `${label}: rendered slots hold the right kind of text`);
}
assert.ok(modelCollisions >= 8, "the saved outputs and sample really do contain keep/fix collisions");
assert.ok(modelRepeats >= 60, "the saved outputs really do repeat observations");

function sentencesOf(fixes: any[] = []) {
  return fixes.flatMap((fix) => String(fix?.why || "").split(/(?<=[.!?])\s+/));
}

// The pre-fix mapping put the fix's reason in the Critical Miss "What to add" box. The slot check catches it.
for (const report of [sales, finance, operations]) {
  assert.ok(fixSlotIssues(0, { whatToAdd: [report.top_fixes[0].why] }, report.top_fixes[0].why).length > 0,
    "a reason shown as What to add is a slot-mapping failure");
}

// ============================================
// Eval metrics and output
// ============================================

const salesMetrics = evaluateReportIntegrity(sales);
assert.equal(salesMetrics.rewrites, 0);
assert.deepEqual(salesMetrics.keep_fix_collisions, { model: 1, shown: 0, critical_miss_in_keep: { model: true, shown: false } });
assert.equal(salesMetrics.critical_miss.category, "bullet_edit");
assert.deepEqual(salesMetrics.critical_miss.structural_flagged, ["employment_gap"]);
assert.equal(salesMetrics.critical_miss.outranked, true, "the August 2023 gap is outranked by a single-bullet edit");
assert.equal(evaluateReportIntegrity(dataScientist).verdict_critical_miss.agreement, "mismatch",
  "the Verdict worries about the target role; the Critical Miss edits one bullet");
assert.equal(evaluateReportIntegrity(marketing).verdict_critical_miss.agreement, "no_concern");
assert.match(evaluateReportIntegrity(finance).verdict_critical_miss.reasons.join(" "), /takeaway .* points at fix 2/);
assert.equal(evaluateReportIntegrity({
  ...sales,
  top_fixes: [{ ...sales.top_fixes[0], fix: "Explain what you have been doing since your BrightWave role ended in August 2023." }],
}).critical_miss.category, "structural");

// The Critical Miss kinds a first read turns on, however the model words them.
const withMiss = (fix: Record<string, unknown>, extra: Record<string, unknown> = {}) => evaluateReportIntegrity({
  ...sales,
  ...extra,
  top_fixes: [{ ...sales.top_fixes[0], ...fix }, ...sales.top_fixes.slice(1)],
});
assert.deepEqual(pickMiss(withMiss({ fix: "Say what you've done since Jul 2023.", why: "Your Greenfield role ends in Jul 2023 and nothing later is listed." })),
  { category: "structural", kind: "employment_gap" });
assert.deepEqual(pickMiss(withMiss({ fix: "Add a dated line for your current activity.", evidence: { excerpt: "March 2020 - August 2023", section: "Work Experience" } })),
  { category: "structural", kind: "employment_gap" }, "citing the last date range is a dates Critical Miss");
assert.deepEqual(pickMiss(withMiss({ fix: "Name the decisions you made as Sales Executive.", why: "Your Sales Executive title sits over bullets that only say you helped or supported." })),
  { category: "structural", kind: "level" });
assert.deepEqual(pickMiss(withMiss({ fix: "Lead with the 30% renewal result.", why: "It sits in your older Glenmark role, below generic BrightWave bullets." })),
  { category: "structural", kind: "buried_evidence" });
assert.deepEqual(pickMiss(withMiss({ fix: "Name the proposal sections you drafted.", why: "The BrightWave proposal bullet says you supported the team." })),
  { category: "bullet_edit" }, "an ordinary line edit stays a line edit");

// "Nothing critical": a low-impact Critical Miss under a Verdict with no concern is one story.
const polished = evaluateReportIntegrity({ ...marketing, top_fixes: [{ ...marketing.top_fixes[0], impact_level: "low" }] });
assert.equal(polished.critical_miss.nothing_critical, true);
assert.equal(polished.verdict_critical_miss.agreement, "agree");
assert.deepEqual(polished.verdict_critical_miss.notes, []);
assert.equal(evaluateReportIntegrity(marketing).critical_miss.nothing_critical, false);
assert.equal(withMiss({ impact_level: "low" }, {
  first_impression: "Your path moves into sales. The last listed role ends in August 2023, and no later activity is shown.",
}).verdict_critical_miss.agreement, "mismatch", "a structural concern can't sit over an optional Critical Miss");
assert.equal(withMiss({ fix: "Say what you've done since August 2023.", why: "Your BrightWave role ends in August 2023." }, {
  first_impression: "Your path moves into sales. Your summary doesn't say which role you want next.",
}).verdict_critical_miss.agreement, "mismatch", "a direction concern over a dates Critical Miss is two stories");

// 1.9: fix headings scan as one short instruction.
const dataScientistHeadings = evaluateReportIntegrity(dataScientist).fix_headings;
assert.equal(dataScientistHeadings.with_location, 2, "the saved headings open with \"In the ... bullet\"");
assert.equal(dataScientistHeadings.with_condition, 2);
assert.ok(dataScientistHeadings.over_12_words >= 1);
assert.deepEqual(withMiss({ fix: "Name the proposal sections you drafted." }).fix_headings.with_location, 2,
  "only the two saved headings still open with a location");

function pickMiss(metrics: ReturnType<typeof evaluateReportIntegrity>) {
  const { category, kind } = metrics.critical_miss;
  return kind ? { category, kind } : { category };
}

assert.deepEqual(scoreTestRetest([
  { fixture_id: "a", actual_score: 60, status: "PASS" },
  { fixture_id: "a", actual_score: 58, status: "FAIL" },
  { fixture_id: "a", actual_score: 60, status: "PASS" },
  { fixture_id: "b", actual_score: 80, status: "PASS" },
]), [{ fixture_id: "a", scores: [60, 58, 60], unvalidated: 1, range: 2, mean: 59.3, sd: 1.2 }]);

const replayRun: EvalRunOutput = {
  metadata: {
    run_id: "integrity_test_replay", timestamp: "2026-11-01T00:00:00.000Z", execution_mode: "live", model: "saved",
    temperature: null, top_p: null, reasoning_effort: "medium", max_completion_tokens: 8000, prompt_version_hash: "v1",
    contract_version: "v2", tier: "golden", budget_usd: 0, actual_cost_usd: 0,
    token_usage: { prompt_tokens: 0, completion_tokens: 0 }, pricing_basis: "none", calls_made: 0, max_calls: 0, concurrency: 1,
    validation_mode: "saved_output_replay",
  },
  summary: { total: saved.runs.length, passed: saved.runs.length, warned: 0, failed: 0 },
  results: saved.runs.map((item) => ({
    fixture_id: item.fixture_id, status: "PASS", errors: [], warnings: [], actual_score: item.score,
    expected_range: [0, 100], integrity: evaluateReportIntegrity(item.report),
  })),
};
const markdown = generateMarkdownReport(replayRun);
assert.match(markdown, /## Report Integrity/);
assert.match(markdown, /\| Reports with a rewrite \| 0 of 13 \(0 rewrites\) \| same \|/);
assert.match(markdown, /\| Keep\/fix collisions on one line \| \d+ in \d+ reports \| 0 \|/);
assert.match(markdown, /\| Repeated observations \| \d+ \| 0 \|/);
assert.match(markdown, /\| Field-slot mapping issues \| \d+ \| 0 \|/);
assert.match(markdown, /Critical Miss is a line edit \/ structural \| 13 \/ 0/);
assert.match(markdown, /Verdict and Critical Miss disagree/);
assert.match(markdown, /## Score Test-Retest[\s\S]*synth_operations_manager_entry_weak_1 \| 60, 58, 60, 58 \| 2 \| 59 \| 1\.2 \|/);
assert.match(generateMarkdownReport({ ...replayRun, results: replayRun.results.slice(0, 1) }), /test-retest was not measured/);

// ============================================
// The web report and the PDF agree
// ============================================

type RuntimeModule = typeof Module & { _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown };
const runtimeModule = Module as RuntimeModule;
const originalLoad = runtimeModule._load;
(require as any).extensions[".tsx"] = (require as any).extensions[".ts"];
runtimeModule._load = function loadReportStream(request, parent, isMain) {
  if (request.endsWith(".module.css")) return {};
  if (request === "@phosphor-icons/react") return new Proxy({}, { get: () => () => null });
  if (request.startsWith("@/")) return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
  return originalLoad(request, parent, isMain);
};
const { ReportStream } = require("../components/workspace/report/ReportStream.tsx") as { ReportStream: (props: any) => any };
const { FirstReadModelDiagram } = require("../components/research/diagrams/FirstReadModelDiagram.tsx") as { FirstReadModelDiagram: () => any };
runtimeModule._load = originalLoad;

const decode = (html: string) => html
  .replace(/<[^>]+>/g, " ")
  .replaceAll("&#x27;", "'").replaceAll("&quot;", "\"").replaceAll("&lt;", "<").replaceAll("&gt;", ">")
  .replaceAll("&rsquo;", "’").replaceAll("&amp;", "&")
  .replace(/[‐-―−]/g, "-")
  .replace(/\s+/g, " ");
const plain = (text: string) => text.replace(/[‐-―−]/g, "-").replace(/\s+/g, " ");
const occurrences = (haystack: string, needle: string) => haystack.split(plain(needle)).length - 1;

for (const [label, report] of outputs) {
  const integrity = reconcileReport(report);
  const webHtml = renderToStaticMarkup(createElement(ReportStream, { report, isSample: label === "sample" }));
  const web = decode(webHtml);
  const opening = decode(webHtml.slice(webHtml.indexOf('id="section-first-impression"'), webHtml.indexOf('id="section-fixes"')));
  const firstCard = decode(webHtml.slice(webHtml.indexOf('id="section-fix-1"'), webHtml.indexOf("</article>", webHtml.indexOf('id="section-fix-1"'))));
  const fullNotes = decode(webHtml.slice(webHtml.indexOf('id="section-full-notes"')));
  const pdfReport = normalizeReportForPdf(report);
  assert.ok(pdfReport, `${label}: PDF normalizes`);
  const pdf = decode(renderReportHtml(pdfReport));

  for (const strength of report.strengths || []) {
    const kept = integrity.report.strengths!.includes(strength);
    assert.equal(occurrences(web, strength), kept ? 1 : 0, `${label}: web Keep renders "${strength.slice(0, 40)}" ${kept ? "once" : "never"}`);
    assert.equal(occurrences(pdf, strength), kept ? 1 : 0, `${label}: PDF Keep matches the web report`);
  }
  const reason = criticalMissReason(integrity);
  if (reason) {
    assert.ok(opening.includes(plain(reason)), `${label}: the opening gives the Critical Miss reason`);
    assert.ok(!firstCard.includes(plain(reason)), `${label}: the Critical Miss card does not repeat it`);
    assert.equal(occurrences(pdf, reason), 1, `${label}: the PDF gives it once`);
  }
  for (const question of integrity.fixQuestions.flat()) {
    assert.equal(occurrences(web, question), 1, `${label}: "${question.slice(0, 40)}" renders once on the web`);
    assert.equal(occurrences(pdf, question), 1, `${label}: and once in the PDF`);
  }
  if (integrity.fixQuestions[0].length > 0) assert.ok(firstCard.includes("What to add"), `${label}: the Critical Miss asks what to add`);
  else assert.ok(!firstCard.includes("What to add") && !firstCard.includes("Start with the original sentence"),
    `${label}: no label, and no hint pointing at it, without questions`);
  if (integrity.structuralGaps.length > 0) {
    assert.ok(opening.includes("Before the bullets"), `${label}: the opening labels the structural gap`);
    assert.ok(pdf.includes("Before the bullets"), `${label}: and so does the PDF`);
  }
  for (const { text } of integrity.structuralGaps) {
    assert.ok(opening.includes(plain(text)), `${label}: the structural gap is in the opening read`);
    assert.ok(!fullNotes.includes(plain(text)), `${label}: and not again in the collapsed notes`);
    assert.equal(occurrences(pdf, text), 1, `${label}: the PDF shows it once`);
  }
  for (const note of [...(integrity.report.gaps || []), ...(integrity.report.ideas?.questions || []).map(({ question }) => question)]) {
    assert.equal(occurrences(web, note), 1, `${label}: "${note.slice(0, 40)}" renders once`);
  }
}

// The methodology figure quotes the sample report, so it may only quote lines the report still shows.
const sampleWeb = decode(renderToStaticMarkup(createElement(ReportStream, { report: sample, isSample: true })));
const figure = decode(renderToStaticMarkup(createElement(FirstReadModelDiagram)));
const quoted = [
  fixCardSlots(sampleIntegrity, 1).why,
  fixCardSlots(sampleIntegrity, 2).why,
  (sampleIntegrity.structuralGaps as Array<{ text: string }>)[0]?.text,
  sampleIntegrity.report.strengths![0],
].filter((line): line is string => Boolean(line));
assert.ok(quoted.length >= 3, "the figure quotes at least three lines from the sample");
for (const line of quoted) {
  assert.ok(figure.includes(plain(line)), `the figure quotes "${line.slice(0, 40)}"`);
  assert.ok(sampleWeb.includes(plain(line)), `and the sample report shows it`);
}
for (const removed of [sample.strengths[1], sample.gaps[1], sample.gaps[2]]) {
  assert.ok(!figure.includes(plain(removed)), `the figure must not quote a line the report no longer shows: "${removed.slice(0, 40)}"`);
}

console.log("report-integrity tests passed");
