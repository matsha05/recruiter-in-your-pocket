import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  blankAnswersFromStored,
  blankLabels,
  cardPosition,
  cardsHeading,
  compareWorklists,
  composeExample,
  exampleSegments,
  storedAnswersForCard,
  upgradesLead,
  workCards,
  worklistTargetRole,
} from "../lib/reports/worklist-presentation";
import { normalizeReportForPdf } from "../lib/reports/pdf-export";
import { renderReportHtml } from "../lib/backend/pdf";
import { splitVerdict } from "../lib/reports/report-opening";
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
  assert.equal(cardsHeading(mock).title, "Lines that need work.");
  assert.equal(cardsHeading({ cards: mock.cards.filter((card) => card.kind === "keep") }).title, "Nothing here needs work.");
  assert.equal(worklistTargetRole(mock), "Customer Operations");

  // A strong resume's upgrades (Nov 7, 2026): the same list, optional, never counted as work.
  const keep = mock.cards.filter((card) => card.kind === "keep");
  const upgrade = { ...mock.cards.find((card) => card.kind === "line")!, kind: "upgrade" as const };
  assert.equal(cardsHeading({ cards: [...keep, upgrade] }).title, "Nothing here needs work.", "a strong resume keeps its heading; upgrades are their own group");
  assert.match(upgradesLead({ cards: [...keep, upgrade] }), /probably isn't what stands between you and the call/u, "with nothing to fix, the upgrades say the resume probably isn't the blocker");
  assert.equal(upgradesLead({ cards: [...mock.cards, upgrade] }), "Optional, once the lines above are done.");
  assert.equal(cardsHeading({ cards: [...mock.cards, upgrade] }).title, "Lines that need work.", "lines that need work keep their heading; upgrades follow them");
  assert.equal(workCards({ cards: [...keep, upgrade] }).length, 0, "an upgrade is not a line that needs work");
  assert.equal(cardPosition([upgrade, upgrade, upgrade, upgrade], 0), null, "upgrades carry no count");
  const pdf = renderReportHtml(normalizeReportForPdf({ ...mock, score: 95, cards: [...keep, upgrade] })!);
  assert.ok(pdf.includes("Ways to make it even better.") && pdf.includes("Nothing here needs work."), "the PDF prints the list, then the upgrades under their own heading");
  assert.ok(pdf.indexOf("Nothing here needs work.") < pdf.indexOf("Ways to make it even better."), "the upgrades follow the list");
  assert.equal((pdf.match(/<section/gu) || []).length, (pdf.match(/<\/section>/gu) || []).length, "every PDF section closes");
  const plain = renderReportHtml(normalizeReportForPdf(mock)!);
  assert.equal((plain.match(/<section/gu) || []).length, (plain.match(/<\/section>/gu) || []).length, "a PDF with no upgrades closes every section too");
  assert.ok(!pdf.includes(`<span class="miss-mark">${upgrade.line}`), "an upgrade's line carries no marker in the PDF");
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
  assert.equal(comparison.sum, "Up 8 since last time. That's the right direction!");
  const same = compareWorklists(mock, mock);
  assert.equal(same.title, "The same lines are on the list.");
  assert.equal(same.sum, null);
  // A page read twice lands up to 5 apart, so the score is said only past that: never "Down 3" on the model's wobble.
  for (const wobble of [-5, -3, 1, 4, 5]) {
    const reread = compareWorklists(mock, { ...later, score: mock.score + wobble });
    assert.equal(reread.sum, null, `${wobble} is within a re-read`);
    assert.equal(reread.title, "1 line is off the list.", "the lines still say what changed");
  }
  assert.equal(compareWorklists(mock, { ...later, score: mock.score + 6 }).sum, "Up 6 since last time. That's the right direction!");
  assert.equal(compareWorklists(mock, { ...later, score: mock.score - 6 }).sum, "Down 6 since last time.");
  const clean = compareWorklists(mock, { ...mock, score: 90, cards: [] });
  assert.equal(clean.title, "Every line you worked on is off the list.");
}

// The PDF prints the same report: the verdict, the write-up, every card with its blanks, the fit, and a filled line.
{
  const sample = JSON.parse(readFileSync(path.join(process.cwd(), "public/sample-report.json"), "utf8"));
  const report = WorklistReportSchema.parse(sample);
  // The first line card whose example has a blank: a card can carry a finished example with nothing to fill.
  const filledIndex = report.cards.findIndex((card) => card.kind === "line" && blankLabels(card.example).length > 0);
  // Every blank answered, the first with the text the PDF must show: a line prints filled once it is complete.
  const answers = blankLabels(report.cards[filledIndex].example).map((label, index) => ({ question: label, kind: "answered" as const, text: index === 0 ? "the renewal checklist" : `answer ${index + 1}` }));
  const normalized = normalizeReportForPdf(sample, { [String(filledIndex)]: { answers, line: null, source: "literal", updated_at: "2026-11-06T00:00:00.000Z" } });
  assert.ok(normalized?.worklist, "a worklist report normalizes with its worklist content");
  assert.equal(normalized?.worklist?.cards.length, report.cards.length);
  const html = renderReportHtml(normalized!);
  // The verdict's first sentence is the heading and the rest reads on under it, so the PDF holds each part.
  const verdictParts = splitVerdict(report.verdict);
  for (const part of [verdictParts.lead, verdictParts.rest].filter((value): value is string => Boolean(value))) {
    assert.ok(html.includes(part.replace(/'/g, "&#39;")) || html.includes(part), "the verdict is the PDF's h1, and the rest of it follows");
  }
  for (const paragraph of report.write_up) assert.ok(html.includes(paragraph.slice(0, 40)), "every write-up paragraph prints");
  for (const card of report.cards) assert.ok(html.includes(card.line.slice(0, 40)), `card line prints: ${card.line.slice(0, 40)}`);
  assert.ok(html.includes('class="blank"'), "open blanks print in the candidate's blue");
  assert.ok(html.includes("the renewal checklist"), "a stored answer prints in its blank");
  assert.ok(!/Critical Miss/u.test(html), "the retired name never prints");
  assert.ok(html.includes("Don't touch this one"), "the keep card is labelled");
}

console.log("worklist-presentation tests passed");
