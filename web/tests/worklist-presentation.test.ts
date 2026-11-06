import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  blankAnswersFromStored,
  blankLabels,
  cardsHeading,
  compareWorklists,
  composeExample,
  exampleSegments,
  storedAnswersForCard,
  worklistTargetRole,
} from "../lib/reports/worklist-presentation";
import { normalizeReportForPdf } from "../lib/reports/pdf-export";
import { renderReportHtml } from "../lib/backend/pdf";
import { WorklistReportSchema, type WorklistReport } from "../lib/llm/worklist-schema";
import { parseStoredLineAnswers, LINE_ANSWER_LIMITS, parseLineAnswersPatch } from "../lib/reports/line-answers";
import { MOCK_WORKLIST_REPORT } from "../lib/backend/mock-worklist-report";

// The example's blanks, and the person's answers in them.
{
  const example = "Wrote and built the monthly member newsletter in [tool], sent to [number] members.";
  assert.deepEqual(blankLabels(example), ["tool", "number"]);
  assert.deepEqual(exampleSegments(example).map((segment) => segment.kind), ["text", "blank", "text", "blank", "text"]);
  assert.equal(composeExample(example, ["Mailchimp", ""]), null, "an open blank leaves the line unfinished");
  assert.equal(composeExample(example, ["Mailchimp", "4,000"]), "Wrote and built the monthly member newsletter in Mailchimp, sent to 4,000 members.");
  assert.equal(composeExample("[June 2024 - Present]  [Job search and marketing coursework]", ["June 2024 - Present", "Job search"]), "June 2024 - Present Job search");
  assert.equal(composeExample("No blanks here.", []), "No blanks here.");
}

// Stored answers keep each blank by its label, so a saved report reopened elsewhere fills the same blanks.
{
  const example = "Trained [number] new employees in [tasks]";
  const stored = storedAnswersForCard(example, ["12", ""], false);
  assert.deepEqual(stored, [{ question: "number", kind: "answered", text: "12" }]);
  const restored = blankAnswersFromStored(example, { answers: stored, line: null, source: "literal", updated_at: "2026-11-06T00:00:00.000Z" });
  assert.deepEqual(restored, { answers: ["12", ""], left: false });
  const left = storedAnswersForCard(example, ["", ""], true);
  assert.deepEqual(left, [{ question: "number", kind: "unknown" }, { question: "tasks", kind: "unknown" }]);
  assert.deepEqual(blankAnswersFromStored(example, { answers: left, line: null, source: "literal", updated_at: "x" }), { answers: ["", ""], left: true });
  assert.equal(blankAnswersFromStored(example, undefined), null);
  // The stored column takes a card per line, up to twelve, and the route's patch parser agrees.
  assert.equal(LINE_ANSWER_LIMITS.fixes, 12);
  assert.ok(parseLineAnswersPatch({ fix_index: 11, answers: stored, line: null, source: "literal" }));
  assert.equal(parseLineAnswersPatch({ fix_index: 12, answers: stored, line: null, source: "literal" }), null);
  const column = parseStoredLineAnswers({ "7": { answers: stored, line: "Trained 12 new employees in [tasks]", source: "literal", updated_at: "2026-11-06T00:00:00.000Z" } });
  assert.ok(column?.["7"]);
}

// Headings follow the card set.
{
  const mock = WorklistReportSchema.parse(MOCK_WORKLIST_REPORT);
  assert.equal(cardsHeading(mock).title, "Line by line, in the order a recruiter hits them.");
  assert.equal(cardsHeading({ cards: mock.cards.filter((card) => card.kind === "keep") }).title, "Nothing here needs work.");
  assert.equal(worklistTargetRole(mock), "Customer Operations");
}

// The re-check: lines off the list, still there, and new, with the score as a change.
{
  const mock = WorklistReportSchema.parse(MOCK_WORKLIST_REPORT);
  const later: WorklistReport = { ...mock, score: 74, cards: mock.cards.filter((card) => card.kind !== "structure") };
  const comparison = compareWorklists(mock, later);
  assert.equal(comparison.gone.length, 1);
  assert.equal(comparison.still.length, 1);
  assert.equal(comparison.added.length, 0);
  assert.equal(comparison.title, "1 line is off the list.");
  assert.equal(comparison.intro, "1 is still there.");
  assert.equal(comparison.sum, "Up 8 since last time.");
  const same = compareWorklists(mock, mock);
  assert.equal(same.title, "The same lines are on the list.");
  assert.equal(same.sum, null);
  const clean = compareWorklists(mock, { ...mock, score: 90, cards: [] });
  assert.equal(clean.title, "Every line you worked on is off the list.");
}

// The PDF prints the same report: the verdict, the write-up, every card with its blanks, the fit, and a filled line.
{
  const sample = JSON.parse(readFileSync(path.join(process.cwd(), "public/sample-report.json"), "utf8"));
  const report = WorklistReportSchema.parse(sample);
  const filledIndex = report.cards.findIndex((card) => card.kind === "line");
  const label = blankLabels(report.cards[filledIndex].example)[0];
  const normalized = normalizeReportForPdf(sample, { [String(filledIndex)]: { answers: [{ question: label, kind: "answered", text: "the renewal checklist" }], line: null, source: "literal", updated_at: "2026-11-06T00:00:00.000Z" } });
  assert.ok(normalized?.worklist, "a worklist report normalizes with its worklist content");
  assert.equal(normalized?.worklist?.cards.length, report.cards.length);
  const html = renderReportHtml(normalized!);
  assert.ok(html.includes(report.verdict.replace(/'/g, "&#39;")) || html.includes(report.verdict), "the verdict is the PDF's h1");
  for (const paragraph of report.write_up) assert.ok(html.includes(paragraph.slice(0, 40)), "every write-up paragraph prints");
  for (const card of report.cards) assert.ok(html.includes(card.line.slice(0, 40)), `card line prints: ${card.line.slice(0, 40)}`);
  assert.ok(html.includes('class="blank"'), "open blanks print in the candidate's blue");
  assert.ok(html.includes("the renewal checklist"), "a stored answer prints in its blank");
  assert.ok(!/Critical Miss/u.test(html), "the retired name never prints");
  assert.ok(html.includes("Keep as is"), "the keep card is labelled");
}

console.log("worklist-presentation tests passed");
