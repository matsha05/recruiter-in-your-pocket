import assert from "node:assert/strict";
import { canonicalizeResumeReportEvidence } from "../lib/llm/evidence-canonicalizer";
import { findUnsupportedOutcomeClaims } from "../lib/llm/grounding";
import { calibrateResumeScore } from "../lib/llm/resume-score-calibration";

const eliteResume = Array.from(
  { length: 8 },
  (_, index) => `- Delivered project ${index + 1}, increasing adoption by ${20 + index}%.`,
).join("\n");
const calibratedElite = calibrateResumeScore({
  score: 72,
  score_comment_short: "Needs work.",
  subscores: { impact: 72, clarity: 74, story: 70, readability: 76 },
}, eliteResume).report;
assert.equal(calibratedElite.score, 88);
assert.equal(calibratedElite.score_comment_short, "Needs work.", "calibration must preserve grounded narrative copy");
assert.ok(Object.values(calibratedElite.subscores || {}).every((value) => Number(value) >= 82));
const exceptionalResume = Array.from(
  { length: 10 },
  (_, index) => `- Led project ${index + 1}, increasing adoption by ${30 + index}%.`,
).join("\n");
assert.equal(calibrateResumeScore({ score: 88 }, exceptionalResume).report.score, 92);
const blackCircleStrongResume = [
  ...Array.from({ length: 5 }, (_, index) => `● Led initiative ${index + 1}, increasing adoption by ${20 + index}%.`),
  ...Array.from({ length: 15 }, (_, index) => `● Coordinated priority workstream ${index + 1} across the organization.`),
].join("\n");
assert.equal(
  calibrateResumeScore({ score: 72 }, blackCircleStrongResume).report.score,
  84,
  "black-circle bullets must participate in evidence-density calibration",
);
const qualitativeOutcomeResume = [
  "● Achieved a clean external compliance report.",
  "● Implemented new processes as the organization doubled in size.",
  ...Array.from({ length: 6 }, (_, index) => `● Negotiated commercial agreement ${index + 1}.`),
].join("\n");
assert.equal(
  calibrateResumeScore({ score: 64 }, qualitativeOutcomeResume).report.score,
  68,
  "clear qualitative outcomes should keep an otherwise duty-heavy resume at the top of mixed clarity",
);
const exceptionalRepair = canonicalizeResumeReportEvidence({
  summary: "You read as a senior leader. The work shows repeated results. A material gap is the lack of explicit personal contribution. Strengthen by surfacing your direct actions.",
  gaps: [
    "Some bullets describe outcomes but do not tie them to your direct actions.",
    "Early career bullets lack explicit ownership verbs.",
    "The opening does not prioritize the strongest result.",
  ],
  section_review: {
    "Work Experience": {
      grade: "A",
      priority: "Medium",
      working: "Repeated outcomes.",
      missing: "Some lower-signal bullets do not yet show verified scope or results.",
      fix: "Rewrite the highest-priority cited bullet.",
    },
  },
}, `Work Experience\n${exceptionalResume}`);
assert.match((exceptionalRepair.report as any).summary, /lack of explicit personal contribution/i, "numeric calibration must not manufacture a different editorial judgment");
assert.equal(
  (exceptionalRepair.report as any).section_review["Work Experience"].missing,
  "Some lower-signal bullets do not yet show verified scope or results.",
);
const strongResume = [
  "- Improved retention by 15%.",
  "- Reduced cycle time by 20%.",
  "- Saved $2M annually.",
  "- Collaborated with product leaders.",
  "- Mentored junior staff.",
].join("\n");
assert.equal(calibrateResumeScore({ score: 94 }, strongResume).report.score, 88);
const weakResume = Array.from(
  { length: 10 },
  (_, index) => `- Was responsible for routine task ${String.fromCharCode(65 + index)}.`,
).join("\n");
assert.equal(calibrateResumeScore({ score: 76 }, weakResume).report.score, 68);
assert.equal(calibrateResumeScore({ score: 60 }, weakResume).report.score, 60);
const qualitativeResume = Array.from(
  { length: 10 },
  (_, index) => `- Negotiated complex agreement ${String.fromCharCode(65 + index)} with executive stakeholders.`,
).join("\n");
assert.equal(calibrateResumeScore({ score: 82 }, qualitativeResume).report.score, 82);
assert.deepEqual(
  findUnsupportedOutcomeClaims(
    "Revamped the launch process",
    "Revamped the launch process, increasing revenue by 30%.",
    "Revamped the launch process, increasing revenue by 30% and cutting cycle time by 90%.",
  ),
  [],
  "a short original excerpt may restore an outcome from the full source line",
);
assert.deepEqual(
  findUnsupportedOutcomeClaims(
    "Prepared financial reports.",
    "Prepared financial reports, improving executive decision-making.",
  ),
  ["improving"],
);
assert.deepEqual(
  findUnsupportedOutcomeClaims(
    "Supported the launch process.",
    "Supported the launch process to deliver [cycle-time improvement].",
  ),
  [],
  "bracketed outcomes remain explicit candidate prompts",
);
assert.deepEqual(
  findUnsupportedOutcomeClaims(
    "Provided guidance for application deployments.",
    "Provided guidance across [application scope]; deployment result: [measurable result].",
  ),
  [],
  "a labelled bracket placeholder does not assert an outcome",
);
