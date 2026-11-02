import assert from "node:assert/strict";
import { narrativeMeaningIssues } from "../lib/llm/narrative-meaning";

const source = "Led a cross-departmental team coordinating product, marketing, and engineering to launch three major software releases in two years.";
const observed = "How did you coordinate product, marketing, and engineering when their priorities differed during a software release?";
const conflictIssue = (claim: string, evidence: string) => narrativeMeaningIssues(claim, evidence)
  .some((issue) => issue.includes("conflicting inputs"));

assert.equal(conflictIssue(observed, source), true, "a how/when question must not presuppose an unsourced priority disagreement");
for (const subject of ["priorities", "inputs", "feedback", "directions"]) {
  for (const predicate of ["differed", subject === "feedback" ? "was different" : "were different"]) {
    const claim = `How did you respond when the ${subject} ${predicate}?`;
    assert.equal(conflictIssue(claim, source), true, claim);
    assert.equal(conflictIssue(claim, `The ${subject} ${predicate}. Worked with teams to agree a direction.`), false,
      "an explicit positive source disagreement must support the question");
    for (const evidence of [
      `The ${subject} never ${predicate === "differed" ? "differed" : predicate}.`,
      `It was not true that the ${subject} ${predicate}.`,
      `If the ${subject} ${predicate}, we would discuss them.`,
      `Asked whether the ${subject} ${predicate}.`,
      `Considered a hypothetical scenario where the ${subject} ${predicate}.`,
      `Created a plan for when the ${subject} ${predicate}.`,
      `Training for when the ${subject} ${predicate} covered team discussion.`,
    ]) assert.equal(conflictIssue(claim, evidence), true, `negated or hypothetical source must not license conflict: ${evidence}`);
  }
}

for (const question of [
  "Did their priorities differ during a software release?",
  "Were the inputs different, and if so, how did you respond?",
  "If their priorities differed, how did you coordinate the team?",
  "How did you check whether feedback was different?",
  "During a software release, did their priorities differ?",
  "Did beta feedback and analytics ever point toward different onboarding priorities? If so, how did you respond?",
]) assert.equal(conflictIssue(question, source), false, `a question that establishes whether conflict occurred is allowed: ${question}`);

for (const evidence of [
  "Resolved conflicts between product and engineering priorities.",
  "Product and engineering priorities differed during the release.",
  "There was no conflict in scheduling, but product and engineering priorities differed during the release.",
  "Feedback pointed in different directions during the release.",
  "Resolved conflicts without escalation.",
  "Resolved conflicting priorities without escalation.",
  "The teams had conflicting priorities with no production delay.",
  "Resolved conflicts without errors.",
  "No conflict occurred in scheduling, however the product inputs differed.",
  "The teams supplied contradictory inputs.",
  "Worked with disagreeing stakeholders during the release.",
]) assert.equal(conflictIssue(observed, evidence), false, `positive conflict evidence remains allowed: ${evidence}`);

for (const evidence of [
  "No conflict occurred between product and engineering priorities.",
  "Priorities did not differ during the release.",
  "Feedback never pointed in different directions.",
  "If feedback pointed in different directions, we would meet.",
  "The team used different tools and released different products.",
  "Conflicts were absent.",
  "Conflicts were avoided.",
  "Conflict did not occur.",
  "Planned how to respond when priorities differed.",
  "Considered a scenario where priorities differed.",
]) assert.equal(conflictIssue(observed, evidence), true, `unrelated, negated or hypothetical difference is insufficient: ${evidence}`);

assert.deepEqual(narrativeMeaningIssues("Graduation timing conflicts between the top line and the Education entry.",
  "Header: 2017. Education: Dec. 2013."), [], "written education-date discrepancy must remain permitted");
assert.equal(conflictIssue("How did you coordinate the different teams during a software release?", source), false,
  "different teams does not itself assert a disagreement");

console.log("differing-input conflict presupposition tests passed");

// Live evals eval_1793553133997 and eval_1793560808592: a reason that disclaims the
// conflict was read as asserting one, and a grounded report was withheld.
for (const claim of [
  "A conditional example could show how you handled competing information without assuming a conflict occurred.",
  "This could add detail about your role without assuming priorities conflicted.",
]) assert.equal(conflictIssue(claim, source), false, `a reason that disclaims the conflict is allowed: ${claim}`);
// Paired controls: an asserted conflict stays unsupported when only something else is disclaimed.
for (const claim of [
  "This shows how you handled conflicting stakeholder priorities.",
  "You resolved conflicting priorities without assuming a manager would step in.",
  "How did you settle the conflict between teams, without assuming anyone's help?",
]) assert.equal(conflictIssue(claim, source), true, `an asserted conflict still needs source support: ${claim}`);
