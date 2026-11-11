import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { validateWorklistScore } from "./design-system-budgets.mjs";
import { evaluateMeasurements } from "./design-system-measure.mjs";

const scoreSource = fs.readFileSync(new URL("../../components/workspace/report/worklist/Worklist.module.css", import.meta.url), "utf8");
const score = { family: "Schibsted Grotesk", size: "44px", weight: "800", leading: "44px", text: "64", tag: "p", numericScore: true };
const evaluate = (style, width = 390) => evaluateMeasurements([{ route: "/sample-report", width, styles: [style], primaries: [], prose: [] }]).errors;

test("the approved score has exactly its scoped token, breakpoint and font", () => {
  assert.deepEqual(validateWorklistScore(scoreSource), []);
  for (const changed of [
    scoreSource.replace("--report-score-size: 2.75rem", "--report-score-size: 3rem"),
    scoreSource.replace("--report-score-size: 3.25rem", "--report-score-size: 4rem"),
    scoreSource.replace("@media (min-width: 640px)", "@media (min-width: 768px)"),
    scoreSource.replaceAll(".score {", ".other {"),
    scoreSource.replace("font: var(--weight-display) var(--report-score-size)", "font: var(--weight-body) var(--report-score-size)"),
    scoreSource.replace("--report-score-size: 2.75rem;", "--report-score-size: 2.75rem; font-size: var(--type-title-size);"),
  ]) assert.ok(validateWorklistScore(changed).length > 0);
});

test("rendered numeric allowance is limited to the real score and exact geometry", () => {
  assert.deepEqual(evaluate(score), []);
  assert.deepEqual(evaluate({ ...score, size: "52px", leading: "52px" }, 1440), []);
  for (const changed of [
    { ...score, numericScore: false },
    { ...score, text: "A headline" },
    { ...score, tag: "h1" },
    { ...score, weight: "600" },
    { ...score, family: "Literata" },
    { ...score, leading: "48px" },
    { ...score, size: "52px", leading: "52px" },
    { ...score, size: "36px", leading: "40px" },
  ]) assert.ok(evaluate(changed).length > 0);
  assert.ok(evaluate(score, 1440).length > 0);
});

test("canonical role sizes pass while retired and arbitrary sizes fail", () => {
  for (const size of ["22px", "60px"]) assert.deepEqual(evaluate({ ...score, numericScore: false, size }), []);
  for (const size of ["44px", "52px", "64px", "72px"]) assert.ok(evaluate({ ...score, numericScore: false, size }).length > 0);
});
