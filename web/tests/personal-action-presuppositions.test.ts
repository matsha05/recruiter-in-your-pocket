import assert from "node:assert/strict";
import { narrativeMeaningIssues } from "../lib/llm/narrative-meaning";
import { auditReportNarrative } from "../lib/llm/source-fidelity";

const presentation = "Presented product priorities to leadership. Supported customer projects and coordinated product requirements.";
const sharedResult = "Worked with engineering and design on an onboarding checklist that reduced setup time from 5 days to 3 days.";
const rejectsPersonalAction = (claim: string, source: string) => narrativeMeaningIssues(claim, source)
  .some(issue => issue.includes("contribution to developing priorities") || issue.includes("personally measured"));

for (const claim of [
  "The priorities bullet does not say how you developed them.",
  "How you developed and presented product priorities",
  "In the leadership priorities bullet, explain how you contributed to developing it.",
  "Which product priorities did you develop?",
  "How did you develop product priorities?",
  "If the role values leadership, explain how you developed product priorities.",
  "If possible, explain how you developed product priorities.",
  "Explain how you developed product priorities, if you have room.",
  "If you measured setup time, explain how you developed product priorities.",
]) {
  assert.equal(rejectsPersonalAction(claim, presentation), true, `unsupported priority development: ${claim}`);
}

for (const claim of [
  "How did you present product priorities?",
  "Which priorities did you present to leadership?",
  "Explain how you contributed to presenting product priorities.",
  "How were the product priorities developed?",
  "Explain how the product priorities were developed.",
  "Did you develop product priorities or present priorities developed by others?",
  "Explain whether you contributed to developing product priorities.",
  "If you developed product priorities, explain how you did it.",
  "If you helped develop product priorities, describe your contribution.",
  "The resume does not establish that you developed product priorities.",
]) {
  assert.equal(rejectsPersonalAction(claim, presentation), false, `neutral or conditional clarification: ${claim}`);
}

for (const source of [
  "Developed product priorities and presented them to leadership.",
  "I developed product priorities.",
  "We developed product priorities.",
  "Developed product priorities without changing the budget.",
  "No presentation was needed, but developed product priorities with design.",
]) {
  assert.equal(rejectsPersonalAction("How did you develop product priorities?", source), false, source);
}
assert.equal(rejectsPersonalAction("Explain how you contributed to developing product priorities.",
  "Helped develop product priorities with design and engineering."), false);
assert.equal(rejectsPersonalAction("How did you develop materials for the product priorities meeting?",
  "Developed presentation materials for the product priorities meeting."), false,
"a nearby priority noun must not change the object of development");

for (const source of [
  `${presentation} Developed product launch materials.`,
  `${presentation} Developed customer onboarding documentation.`,
  "Did not develop product priorities; presented priorities created by leadership.",
  "Planned to develop product priorities. Presented the current priorities.",
  "If asked, I would develop product priorities.",
  "Leadership developed product priorities; presented those priorities to customers.",
]) {
  assert.equal(rejectsPersonalAction("How did you develop product priorities?", source), true,
    `the source must establish the candidate's action on the same object: ${source}`);
}

for (const claim of [
  "How did you measure setup time for the onboarding checklist comparison?",
  "Explain how you measured setup time.",
  "Your approach to measuring setup time",
  "If the role values analytics, how did you measure setup time?",
  "If possible, explain how you measured setup time.",
  "How did you present priorities and measure setup time?",
]) {
  assert.equal(rejectsPersonalAction(claim, sharedResult), true, `unsupported personal measurement: ${claim}`);
}

for (const claim of [
  "How was setup time measured?",
  "Explain how setup time was measured.",
  "Did you measure setup time?",
  "Explain whether you measured setup time yourself.",
  "If you measured setup time, explain your method.",
  "If you helped measure setup time, describe your contribution.",
  "The resume does not say whether you measured setup time.",
  "What did you contribute to the checklist work with engineering and design?",
  "Explain your contribution to the checklist and how its results were measured.",
  "How did you present setup time measured by analysts?",
  "How did you explain how setup time was measured?",
]) {
  assert.equal(rejectsPersonalAction(claim, sharedResult), false, `neutral or conditional clarification: ${claim}`);
}

for (const source of [
  "Measured setup time before and after the onboarding change.",
  "I measured setup time.",
  "We measured setup time.",
  "Measured setup time without delaying the release.",
  "Never owned launch decisions, but measured setup time.",
]) {
  assert.equal(rejectsPersonalAction("How did you measure setup time?", source), false, source);
}
assert.equal(rejectsPersonalAction("Explain your contribution to measuring setup time.",
  "Helped measure setup time with the analytics team."), false);

for (const source of [
  `${sharedResult} Measured customer engagement.`,
  "Did not measure setup time; reported figures supplied by analysts.",
  "Planned to measure setup time after the release.",
  "If asked, I would measure setup time.",
  "Analysts measured setup time. Shared the results with the product team.",
  "Setup time was measured by the analytics team; supported the checklist work.",
]) {
  assert.equal(rejectsPersonalAction("How did you measure setup time?", source), true,
    `the source must establish the candidate's action on the same object: ${source}`);
}

const observed = {
  biggest_gap_example: '"Presented product priorities to leadership" does not say how you developed them.',
  top_fixes: [{ fix: "In the leadership priorities bullet, explain how you contributed to developing it." }],
  ideas: { questions: [
    { question: "How did you measure setup time for the onboarding checklist comparison?" },
    { question: "Which product priority did you present to leadership, and how did you contribute to developing it?" },
  ] },
  job_alignment: { underplayed: ["How you developed and presented product priorities"] },
};
const original = structuredClone(observed);
assert.deepEqual(auditReportNarrative(observed, `${presentation} ${sharedResult}`).map(issue => issue.path), [
  "biggest_gap_example",
  "top_fixes[0].fix",
  "ideas.questions[0].question",
  "ideas.questions[1].question",
  "job_alignment.underplayed[0]",
], "the guard must reach the rendered report fields before question/advice exemptions");
assert.deepEqual(observed, original, "a fidelity audit must not rewrite the model's prose");

const grammarControls: Array<{ claim: string; source: string; reject: boolean }> = [
  { claim: "How did you measure setup time?", source: "Measured customer satisfaction and setup time.", reject: false },
  { claim: "How did you measure setup time?", source: "Measured and reported setup time.", reject: false },
  { claim: "How did you develop product priorities?", source: "Developed launch plans and product priorities.", reject: false },
  { claim: "How did you develop product priorities?", source: "Developed and documented product priorities.", reject: false },
  { claim: "Explain how you measured setup time, if you measured it yourself.", source: sharedResult, reject: false },
  { claim: "Explain how you developed product priorities, if you helped develop them.", source: presentation, reject: false },
  { claim: "In the checklist project, did you measure setup time?", source: sharedResult, reject: false },
  { claim: "How did you measure setup time, if that was part of your role?", source: sharedResult, reject: false },
  { claim: "How did you measure setup time?", source: "Reported findings, and analysts measured setup time.", reject: true },
  { claim: "How did you develop product priorities?", source: "Presented the research, and leadership developed product priorities.", reject: true },
  { claim: "How did you measure setup time?", source: "Designed a plan to measure setup time.", reject: true },
  { claim: "How did you measure setup time?", source: "During onboarding research, I measured setup time.", reject: false },
  { claim: "How did you measure setup time?", source: "During onboarding research we measured setup time.", reject: false },
  { claim: "The resume does not explain your approach to measuring setup time.", source: sharedResult, reject: true },
  { claim: "How did you measure setup time?", source: "Developed a dashboard and had analysts measure setup time.", reject: true },
  { claim: "How did you measure setup time?", source: "Accurately measured setup time.", reject: false },
  { claim: "How did you measure setup time?", source: "Worked with analysts to learn how to measure setup time.", reject: true },
  { claim: "How did you measure setup time?", source: "Worked with analysts to train others to measure setup time.", reject: true },
  { claim: "How did you measure setup time?", source: "Worked with analysts to measure setup time.", reject: false },
  { claim: "How did you measure setup time?", source: "Measured engagement and reported setup time.", reject: true },
  { claim: "How did you develop product priorities?", source: "Developed materials and presented product priorities.", reject: true },
  { claim: "How did you measure setup time?", source: "Measured engagement and reported revenue and setup time.", reject: true },
  { claim: "How did you develop product priorities?", source: "Developed launch materials and presented roadmap updates and product priorities.", reject: true },
  { claim: "Explain how you measured setup time. Describe your leadership presentation, if that was part of your role.", source: sharedResult, reject: true },
  { claim: "How did you contribute to measuring setup time?", source: "Helped analysts measure setup time.", reject: false },
  { claim: "How did you measure setup time?", source: "Helped analysts measure setup time.", reject: true },
  { claim: "How did you contribute to developing product priorities?", source: "Helped leadership develop product priorities.", reject: false },
  { claim: "How did you develop product priorities?", source: "Helped leadership develop product priorities.", reject: true },
];
for (const control of grammarControls) {
  assert.equal(rejectsPersonalAction(control.claim, control.source), control.reject, JSON.stringify(control));
}

const expansionDecision = "Presented findings to leadership, influencing the decision to expand onboarding personalization.";
for (const claim of [
  "What finding or recommendation did you present before leadership expanded onboarding personalization?",
  "What did you present before onboarding personalization was expanded?",
  "What did you present before onboarding personalization was expanded further?",
  "What did you present before onboarding personalization was later expanded nationally?",
  "What did you present before onboarding personalization was gradually expanded?",
]) {
  assert.ok(narrativeMeaningIssues(claim, expansionDecision).some(issue => /decision or plan/.test(issue)),
    "a temporal question must not turn a decision into completed expansion");
  assert.deepEqual(narrativeMeaningIssues(claim, `${expansionDecision}\nLeadership expanded onboarding personalization.`), [],
    "the same-object completed expansion must remain supported");
  assert.ok(narrativeMeaningIssues(claim, `${expansionDecision}\nLeadership expanded the sales office.`).length > 0,
    "an unrelated completed expansion must not satisfy the planned object");
}
assert.deepEqual(narrativeMeaningIssues("If leadership expanded onboarding personalization, what did you contribute?", expansionDecision), [],
  "conditional questions do not presume completion");
assert.ok(narrativeMeaningIssues("What did you present before leadership launched onboarding?", "Planned to launch onboarding.").length > 0,
  "a one-word action object must not require overlap with the actor");
assert.deepEqual(narrativeMeaningIssues("What did you present before leadership launched onboarding?", "Planned to launch onboarding. Leadership launched onboarding."), []);
assert.ok(narrativeMeaningIssues("What did you present before onboarding was launched nationally?", "Planned to launch onboarding.").length > 0);
assert.ok(narrativeMeaningIssues("What did you present before onboarding was later launched nationally?", "Planned to launch onboarding.").length > 0);
assert.deepEqual(narrativeMeaningIssues("What did you present before onboarding was later launched nationally?", "Planned to launch onboarding. Leadership launched onboarding."), []);
// A wh-question that presupposes an outcome asserts it (plan row 1.10's open class). The resume must
// state the outcome's family; a question that asks whether it happened is fine; a count question is fine.
const noOutcome = "Owned the pricing page and the quarterly revenue forecast. Presented the forecast to leadership.";
const rejectsOutcome = (claim: string, source: string) => narrativeMeaningIssues(claim, source).some((issue) => issue.includes("presupposes an outcome"));
for (const claim of [
  "How did you triple revenue?",
  "How did you triple revenue at Acme?",
  "Why did you cut the forecast cycle?",
  "When did you first double the pricing page's conversion?",
  "How did you deliver the forecast on time?",
  "Where did you grow the pipeline the most?",
]) {
  assert.equal(rejectsOutcome(claim, noOutcome), true, `presupposed outcome with no source outcome: ${claim}`);
}
for (const claim of [
  "Did you triple revenue?",
  "Which quarter did the forecast cover?",
  "How many forecasts did you present?",
  "What changed in revenue after the pricing page?",
  "How did you present the forecast to leadership?",
  "How did you build the forecast?",
  "If you grew revenue, how did you measure it?",
  "How did you decide whether to cut the forecast cycle?",
  "Did you double conversion, or did it stay flat?",
]) {
  assert.equal(rejectsOutcome(claim, noOutcome), false, `asks rather than presupposes: ${claim}`);
}
for (const source of [
  "Tripled revenue in two years.",
  "Grew revenue from $2M to $6M.",
  "Revenue tripled after the pricing change I led.",
  "Scaled the subscription business to 3x.",
]) {
  assert.equal(rejectsOutcome("How did you triple revenue?", source), false, `the resume states the outcome: ${source}`);
}
for (const source of [
  "Planned to triple revenue in two years.",
  "Did not triple revenue; held it flat through the downturn.",
  "Revenue goal: triple the subscription business.",
]) {
  assert.equal(rejectsOutcome("How did you triple revenue?", source), true, `a plan, a goal or a negation is not the outcome: ${source}`);
}
assert.equal(rejectsOutcome("How did you reduce onboarding time?", "Cut onboarding time from 5 days to 3."), false, "the family, not the exact verb, is what the resume must state");
assert.equal(rejectsOutcome("How did you save the account?", "Generated $1.2M in renewals."), false, "a financial outcome in the resume covers a financial question");

console.log("personal-action presupposition tests passed");
