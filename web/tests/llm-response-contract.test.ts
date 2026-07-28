import assert from "node:assert/strict";
import {
  getOpenAIResponseFormat,
  RESUME_REPORT_JSON_SCHEMA,
  RESUME_REPORT_RESPONSE_FORMAT,
} from "../lib/llm/response-format";
import {
  findBiggestGapContradictions,
  findFixEvidenceMismatch,
  findNonActionableFix,
  findRewriteFidelityIssues,
  findUnsupportedAgencyUpgrade,
  findUnsupportedOutcomeClaims,
  findAlreadySatisfiedFix,
  containsExactEvidence,
  isAcceptedAbsenceMarker,
} from "../lib/llm/grounding";
import { canonicalizeResumeReportEvidence } from "../lib/llm/evidence-canonicalizer";
import { calibrateResumeScore } from "../lib/llm/resume-score-calibration";
import {
  buildResumeRepairMessages,
  isRepairableResumeResponseError,
} from "../lib/llm/reportRepair";
import {
  calculateCostUsd,
  normalizeTokenUsage,
} from "../lib/llm/cost";
import { findMechanicalCopyIssues } from "../lib/evals/checks";
import {
  getChatCompletionTuning,
  getTuningMetadata,
  increaseReasoningEffort,
  resolveOpenAIModel,
  resolveReasoningEffortForMode,
} from "../lib/llm/model-config";

type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: readonly string[];
  additionalProperties?: boolean;
  items?: JsonSchema;
  minItems?: number;
  maxItems?: number;
};

function assertStrictObjectContract(schema: JsonSchema, path = "root") {
  if (schema.type === "object") {
    assert.equal(schema.additionalProperties, false, `${path} must reject unknown fields`);
    const propertyNames = Object.keys(schema.properties || {}).sort();
    const requiredNames = [...(schema.required || [])].sort();
    assert.deepEqual(requiredNames, propertyNames, `${path} must require every declared field`);

    for (const [name, child] of Object.entries(schema.properties || {})) {
      assertStrictObjectContract(child, `${path}.${name}`);
    }
  }

  if (schema.type === "array" && schema.items) {
    assertStrictObjectContract(schema.items, `${path}[]`);
  }
}

assertStrictObjectContract(RESUME_REPORT_JSON_SCHEMA as JsonSchema);

assert.equal(RESUME_REPORT_RESPONSE_FORMAT.type, "json_schema");
assert.equal(RESUME_REPORT_RESPONSE_FORMAT.json_schema.strict, true);
assert.equal(getOpenAIResponseFormat("resume"), RESUME_REPORT_RESPONSE_FORMAT);
assert.deepEqual(getOpenAIResponseFormat("resume_ideas"), { type: "json_object" });

const topFixes = RESUME_REPORT_JSON_SCHEMA.properties.top_fixes;
assert.equal(topFixes.minItems, 1, "resume reports must have at least one grounded top fix");
assert.equal(topFixes.maxItems, 3, "resume reports must stay focused on at most three top fixes");

const rewrites = RESUME_REPORT_JSON_SCHEMA.properties.rewrites;
assert.equal(rewrites.minItems, 0, "resume reports must not force rewrites of already strong bullets");
assert.equal(rewrites.maxItems, 3, "resume reports must stay focused on at most three rewrites");

const questions = RESUME_REPORT_JSON_SCHEMA.properties.ideas.properties.questions;
assert.equal(questions.minItems, 5, "resume reports must have five discovery questions");
assert.equal(questions.maxItems, 5, "resume reports must have five discovery questions");

assert.equal(RESUME_REPORT_JSON_SCHEMA.properties.score.maximum, 99);
assert.equal(
  RESUME_REPORT_JSON_SCHEMA.properties.job_alignment.properties.jd_match_score.maximum,
  100,
  "job-description match remains a 0-100 percentage",
);

assert.deepEqual(
  findUnsupportedAgencyUpgrade("Supported the operations team.", "Led the operations team."),
  ["led"],
);
assert.equal(containsExactEvidence("- Managed a team of 8.", "Managed a team of 8."), true);
assert.equal(
  containsExactEvidence("- Manage a team of 8.", "Managed a team of 8."),
  false,
  "evidence wording and punctuation may not be silently rewritten",
);
assert.equal(
  containsExactEvidence("- Manage a team of 8.", "manage a team of 8."),
  false,
  "evidence capitalization must remain exact",
);
assert.deepEqual(
  findAlreadySatisfiedFix(
    "Add specific metrics for the launch outcome.",
    "revamped the launch process",
    "- I revamped the launch process, shortening time-to-market by 30% and increasing launch success to 90%.",
  ),
  ["metric already present in cited bullet"],
);
assert.deepEqual(
  findAlreadySatisfiedFix(
    "Add [retention metric] and [timeframe] to this redesign bullet.",
    "Spearheaded redesign of the flagship SaaS platform",
    "Spearheaded redesign of the flagship SaaS platform, improving user retention by 15% within six months of launch.",
  ),
  ["metric already present in cited bullet", "requested rate already present in cited bullet"],
  "placeholders must not excuse a fix that asks for an existing fact",
);
assert.deepEqual(
  findAlreadySatisfiedFix(
    "Add [measurable result] to this budget bullet.",
    "Managed a 30-person team with a $12M budget.",
    "Managed a 30-person team with a $12M budget.",
  ),
  [],
  "budget size is scope, not a business outcome",
);
assert.deepEqual(
  findAlreadySatisfiedFix(
    "Add [team size] and [budget] context to this bullet.",
    "Led a cross-functional team of 12 marketers, reducing CAC by 22%.",
    "Led a cross-functional team of 12 marketers, reducing CAC by 22%.",
  ),
  ["scope already present in cited bullet"],
  "team-of-N phrasing must count as existing scope",
);
assert.deepEqual(
  findAlreadySatisfiedFix(
    "Add explicit revenue impact to the product launch bullet.",
    "Revamped the product launch process, resulting in a $15M revenue increase.",
    "Revamped the product launch process, resulting in a $15M revenue increase.",
  ),
  ["outcome already present in cited bullet"],
);
assert.deepEqual(
  findAlreadySatisfiedFix(
    "I would add explicit ownership to this leadership bullet.",
    "I led a 45-person global marketing organization.",
    "I led a 45-person global marketing organization.",
  ),
  ["ownership already present in cited bullet"],
);
assert.deepEqual(
  findAlreadySatisfiedFix(
    "Add [KPI change] or [adoption result] to the AI platform success-framework bullet.",
    "Built an adoption framework with KPIs and reported progress monthly.",
    "Built an adoption framework with KPIs and reported progress monthly.\nSkills: Python, AWS",
  ),
  [],
  "a platform mentioned as the subject is not a request to add a missing tool",
);
assert.deepEqual(
  findBiggestGapContradictions(
    '"I built a campaign that grew leads 70% year-over-year" is strong but add ownership detail and timeframe.',
    "I built a campaign that grew leads 70% year-over-year.",
  ),
  ["quoted source already includes ownership", "quoted source already includes a timeframe"],
);
assert.deepEqual(
  findFixEvidenceMismatch(
    "Add [team size] and [cycle time] to the recruitment bullet.",
    "Supported the development and implementation of HR strategies across multiple departments.",
    "Supported the development and implementation of HR strategies across multiple departments.",
  ),
  ["cited evidence does not support the recruiting fix"],
);
assert.deepEqual(
  findNonActionableFix("Add clarified front of each bullet to show scope and potential outcome"),
  ["missing a specific fact or placeholder to add"],
);
assert.deepEqual(
  findNonActionableFix("Rewrite - Duties included analyzing budget data and forecasting trends"),
  ["does not say how to change the cited text"],
);
assert.deepEqual(
  findNonActionableFix('Bullet to rewrite: "Supported HR strategies across several departments."'),
  ["does not say how to change the cited text"],
);
assert.deepEqual(
  findNonActionableFix("Lead this cited bullet with its existing 10M+ transaction-record scale and result."),
  [],
);
assert.deepEqual(
  findNonActionableFix("Lead the summary with its strongest existing result."),
  [],
  "existing-result edits should remain actionable after copy naturalization",
);
assert.deepEqual(
  findNonActionableFix("Replace the generic opening with [target product lane], [target role level], and one verified result."),
  [],
  "replace-with instructions are actionable",
);
assert.deepEqual(
  findRewriteFidelityIssues(
    "Supported the development and implementation of HR strategies across multiple departments.",
    "Helped oversee recruitment efforts for various teams; outcome: [measurable result].",
  ),
  ["rewrite no longer describes the cited source bullet"],
);
assert.deepEqual(
  findRewriteFidelityIssues(
    "Was responsible for preparing financial reports and statements",
    "Was responsible for preparing financial reports and statements",
  ),
  ["rewrite makes no material change"],
);
assert.deepEqual(
  findRewriteFidelityIssues(
    "Spearheaded redesign of the flagship SaaS platform",
    "Spearheaded redesign of the flagship SaaS platform; outcome: [retention increase] within [timeframe]",
    "Spearheaded redesign of the flagship SaaS platform, improving user retention by 15% within six months of launch.",
  ),
  ["rewrite drops grounded specifics: 15%, sixmonths"],
);
assert.deepEqual(
  findBiggestGapContradictions(
    '"Led a cross-functional team of 8 engineers, reducing errors by 22%" is missing scope and outcome.',
    "Led a cross-functional team of 8 engineers, reducing errors by 22%.",
  ),
  ["quoted source already includes scope", "quoted source already includes an outcome"],
);
assert.equal(
  isAcceptedAbsenceMarker("No education section present", "EXPERIENCE\nBuilt products."),
  true,
);
assert.equal(
  isAcceptedAbsenceMarker("No education section present", "EDUCATION\nState University"),
  false,
);

const sourceResume = `EXPERIENCE
- Led a cross-functional team of 8 engineers to ship the platform.
- Improved retention by 15% within six months.`;
const canonicalized = canonicalizeResumeReportEvidence({
  top_fixes: [{ evidence: { excerpt: '"Led a cross functional team of 8 engineers"' } }],
  rewrites: [
    { original: "I Improved retention by 15% within six months." },
    {
      original: "Led a cross-functional team of 8 engineers to ship the platform.",
      better: "Led a cross-functional team of 8 engineers to ship the platform.",
      enhancement_note: "Add [measurable result] to show impact.",
    },
  ],
  biggest_gap_example: '"Led a cross functional team of eight engineers" needs an outcome.',
}, sourceResume);
assert.equal(
  (canonicalized.report as any).top_fixes[0].evidence.excerpt,
  "- Led a cross-functional team of 8 engineers to ship the platform.",
);
assert.equal(
  (canonicalized.report as any).rewrites[0].original,
  "- Improved retention by 15% within six months.",
);
assert.match(
  (canonicalized.report as any).rewrites[1].better,
  /outcome: \[measurable result\]/,
  "a weak no-op rewrite should become a safe fill-in template",
);
assert.match((canonicalized.report as any).biggest_gap_example, /Led a cross-functional team of 8 engineers/);

const normalizedRepairOutput = canonicalizeResumeReportEvidence({
  summary: "You read as a capable backend engineer. Outcomes are visible. The career break is explained. Some bullets lack scope. The level reads as mid-senior. More ownership detail would help.",
  first_impression_takeaway: "Missing summary and education; tie early actions to outcomes",
  top_fixes: [{
    fix: "Managed a 30-person team with a $12M budget; outcome: [measurable result]",
    evidence: {
      excerpt: "- Managed a 30-person team with a $12M budget across demand generation.",
      section: "Experience",
    },
    section_ref: "Experience",
  }],
}, "EXPERIENCE\n- Managed a 30-person team with a $12M budget across demand generation.");
assert.equal(
  (normalizedRepairOutput.report as any).summary,
  "You read as a capable backend engineer. Outcomes are visible. The career break is explained. Some bullets lack scope. The level reads as mid-senior.",
  "repair output must be capped at the five-sentence product contract",
);
assert.equal((normalizedRepairOutput.report as any).first_impression_takeaway, "Tie early actions to outcomes");
assert.equal(
  (normalizedRepairOutput.report as any).top_fixes[0].fix,
  "Add [measurable result] to the budgeting bullet and connect it to the work already named.",
  "a rewrite sentence in a top-fix slot must become a concrete edit instruction",
);

const partialFixRepair = canonicalizeResumeReportEvidence({
  top_fixes: [{
    fix: "Rewrite this cited bullet by adding [specific scope] and [measurable result].",
    why: "Strengthen evidence and improve score.",
    evidence: { excerpt: "- Designed portals serving 200,000 monthly users.", section: "Experience" },
    section_ref: "Experience",
  }],
}, "- Designed portals serving 200,000 monthly users.");
assert.equal(
  (partialFixRepair.report as any).top_fixes[0].fix,
  "Add [measurable result] to the experience bullet and connect it to the work already named.",
);
assert.doesNotMatch((partialFixRepair.report as any).top_fixes[0].why, /score/i);

const quotedGapRepair = canonicalizeResumeReportEvidence({
  biggest_gap_example: "Participated in sprint planning and retrospectives, helping the team improve delivery predictability. is missing scope and outcome.",
}, "- Participated in sprint planning and retrospectives, helping the team improve delivery predictability.");
assert.match(
  (quotedGapRepair.report as any).biggest_gap_example,
  /^"-?\s*Participated in sprint planning and retrospectives, helping the team improve delivery predictability\." shows a qualitative outcome but is missing clear scope/,
  "an exact unquoted gap citation should be recovered before strict grounding",
);

const unrecoverableGapRepair = canonicalizeResumeReportEvidence({
  biggest_gap_example: '"Led a 12-person global organization" lacks impact.',
}, "- Managed a 30-person marketing team with a $12M budget across global demand generation.");
assert.equal(
  (unrecoverableGapRepair.report as any).biggest_gap_example,
  '"- Managed a 30-person marketing team with a $12M budget across global demand generation." is missing a measurable outcome, so we cannot place the impact.',
);

const summaryEvidenceRepair = canonicalizeResumeReportEvidence({
  top_fixes: [{
    fix: "Rewrite this cited bullet by adding [specific scope] and [measurable result].",
    why: "The resume lacks a narrative bridge between education and the UX career.",
    evidence: { excerpt: "Bachelor of Arts in Graphic Design", section: "Education" },
    section_ref: "Education",
  }],
}, "EXPERIENCE\n- Designed customer workflows.\nEDUCATION\nBachelor of Arts in Graphic Design");
assert.deepEqual(
  (summaryEvidenceRepair.report as any).top_fixes[0],
  {
    fix: "Add a summary section with [target role], [leadership scope], and [measurable result].",
    why: "The resume lacks a narrative bridge between education and the UX career.",
    evidence: { excerpt: "No summary section present", section: "Summary" },
    section_ref: "Summary",
  },
  "a missing-summary fix must cite the absence marker instead of an unrelated education line",
);

const deduplicatedEducationFixes = canonicalizeResumeReportEvidence({
  top_fixes: [
    {
      fix: "Add Education section detailing degrees and years.",
      why: "Education is missing.",
      confidence: "high",
      evidence: { excerpt: "No education section present", section: "Education" },
      impact_level: "high",
      effort: "moderate",
      section_ref: "Education",
    },
    {
      fix: "Add Education details: [degree], [university], [year].",
      why: "Add formal credentials.",
      confidence: "high",
      evidence: { excerpt: "No education section present", section: "Education" },
      impact_level: "high",
      effort: "moderate",
      section_ref: "Education",
    },
  ],
}, "EXPERIENCE\n- Managed a 30-person team with a $12M budget across global marketing.");
assert.equal(
  (deduplicatedEducationFixes.report as any).top_fixes[0].fix,
  "Add an education section with [degree], [school], and [year], if applicable.",
);
assert.equal(
  (deduplicatedEducationFixes.report as any).top_fixes[1].evidence.excerpt,
  "- Managed a 30-person team with a $12M budget across global marketing.",
  "a duplicate absence fix must be replaced with a distinct grounded improvement",
);

const normalizedLanguage = canonicalizeResumeReportEvidence({
  score_comment_short: "Solid experience on high-impact work.",
  positioning_suggestion: "Lead strategic initiatives.",
  top_fixes: [{ evidence: { excerpt: "Strategic initiatives were listed verbatim." } }],
}, "Strategic initiatives were listed verbatim.");
assert.equal((normalizedLanguage.report as any).score_comment_short, "Relevant experience on consequential work.");
assert.equal((normalizedLanguage.report as any).positioning_suggestion, "Lead priority programs.");
assert.equal(
  (normalizedLanguage.report as any).top_fixes[0].evidence.excerpt,
  "Strategic initiatives were listed verbatim.",
  "verbatim evidence must never be style-normalized",
);

const cappedShortVerdict = canonicalizeResumeReportEvidence({
  score_comment_short: "Long CPA tenure is clear, but the work section lacks enough detail for CFO or Controller hiring.",
}, "Practicing Certified Public Accountant");
assert.equal(
  (cappedShortVerdict.report as any).score_comment_short,
  "Long CPA tenure is clear, but the work section lacks enough detail for CFO or Controller.",
  "minor word-limit overages should be corrected deterministically",
);

const duplicateSummaryGapRepair = canonicalizeResumeReportEvidence({
  summary: "Managing eight staff establishes senior leadership. The strongest results are measurable. The practical question is how much financial authority you held. One thing is still unresolved: your financial responsibility is not quantified.",
  gaps: ["Your financial responsibility is not quantified."],
}, "● Managed eight staff and led weekly services.");
assert.equal(
  (duplicateSummaryGapRepair.report as any).summary,
  "Managing eight staff establishes senior leadership. The strongest results are measurable. The practical question is how much financial authority you held.",
  "a human gap sentence should not be followed by a templated duplicate",
);

const earlyCareerFixes = canonicalizeResumeReportEvidence({
  top_fixes: [
    {
      fix: "Add [ownership detail] to an early career role.",
      why: "Earlier roles underplay ownership.",
      evidence: { excerpt: "- Led a senior platform team.", section: "Work Experience" },
      section_ref: "Work Experience",
    },
    {
      fix: "Add [impact metric] to an earlier role.",
      why: "Earlier roles need more impact.",
      evidence: { excerpt: "- Led a senior platform team.", section: "Work Experience" },
      section_ref: "Work Experience",
    },
  ],
}, "EXPERIENCE\n- Led a senior platform team.\n- Collaborated on customer-facing analytics tools.");
assert.equal((earlyCareerFixes.report as any).top_fixes.length, 1);
assert.equal(
  (earlyCareerFixes.report as any).top_fixes[0].evidence.excerpt,
  "- Collaborated on customer-facing analytics tools.",
  "early-career advice must cite an early-career bullet and duplicate evidence must collapse",
);

const sectionPresenceRepair = canonicalizeResumeReportEvidence({
  top_fixes: [
    {
      fix: "Add [quota result] to the sales bullet.",
      why: "Shows measurable impact.",
      confidence: "high",
      impact_level: "high",
      evidence: { excerpt: "- Supported sales campaigns.", section: "Work Experience" },
      section_ref: "Work Experience",
    },
    {
      fix: "Surface any certifications or courses.",
      why: "Shows continued learning.",
      confidence: "low",
      impact_level: "low",
      evidence: { excerpt: "Bachelor of Business Administration", section: "Education" },
      section_ref: "Education",
    },
  ],
  section_review: {
    Summary: { grade: "B", working: "", missing: "Section not present.", fix: "Add a summary section." },
    "Work Experience": { grade: "B", working: "", missing: "Section not present.", fix: "Add a work experience section." },
  },
}, "Professional Summary\nSales professional.\nWork Experience\n- Supported sales campaigns.\nEducation\nBachelor of Business Administration");
assert.equal((sectionPresenceRepair.report as any).top_fixes.length, 1);
assert.equal(
  (sectionPresenceRepair.report as any).section_review.Summary.missing,
  "The existing opening is generic and does not show verified impact.",
);
assert.equal(
  (sectionPresenceRepair.report as any).section_review["Work Experience"].missing,
  "No material section-specific gap identified.",
);

const humanReadResume = `Senior UX Designer with over 12 years of experience leading design teams and driving user-centered strategy for digital products while managing cross-functional teams and budgets.
PROFESSIONAL EXPERIENCE
- Spearheaded redesign of the flagship SaaS platform, improving user retention by 15% within six months of launch
- Led cross-team workshops to establish company-wide design standards and accessibility guidelines
EDUCATION
Bachelor of Arts in Graphic Design
SKILLS
Figma | Sketch | Accessibility Standards`;
const humanReadRepair = canonicalizeResumeReportEvidence({
  score: 82,
  summary: "You read as a senior UX leader. The resume would benefit from a concise executive summary and stronger outcome framing.",
  biggest_gap_example: '"- Led cross-team workshops to establish company-wide design standards and accessibility guidelines" is missing a measurable outcome.',
  gaps: [
    "Missing a concise executive summary tied to business outcomes.",
    "Some leadership bullets stop at activity.",
    "Education and certifications beyond a BA are not listed.",
  ],
  next_steps: [
    "Add a one-line executive summary at the top.",
    "Surface one more cross-functional metric.",
    "Add certifications if available.",
  ],
  top_fixes: [{
    fix: "Add [specific scope] to this redesign bullet.",
    why: "Clarify ownership and impact.",
    confidence: "high",
    evidence: {
      excerpt: "- Spearheaded redesign of the flagship SaaS platform, improving user retention by 15% within six months of launch",
      section: "Professional Experience",
    },
    impact_level: "high",
    effort: "quick",
    section_ref: "Professional Experience",
  }],
  section_review: {
    Summary: { grade: "", priority: "Medium", working: "", missing: "", fix: "" },
    "Work Experience": { grade: "", priority: "High", working: "", missing: "", fix: "" },
    Skills: { grade: "", priority: "Medium", working: "", missing: "", fix: "" },
    Education: { grade: "", priority: "Low", working: "", missing: "", fix: "" },
  },
  job_alignment: {
    jd_match_score: 0,
    jd_match_summary: "No job description provided.",
    strongly_aligned: ["- None -", "- None -", "- None -"],
    underplayed: ["- None -", "- None -"],
    missing: ["- None -"],
    role_fit: {
      seniority_read: "",
      industry_signals: [],
      company_stage_fit: "",
    },
  },
}, humanReadResume);
assert.match((humanReadRepair.report as any).top_fixes[0].evidence.excerpt, /Led cross-team workshops/);
assert.doesNotMatch((humanReadRepair.report as any).summary, /benefit from a concise executive summary/i);
assert.doesNotMatch((humanReadRepair.report as any).gaps.join(" "), /certification|beyond a BA/i);
assert.doesNotMatch((humanReadRepair.report as any).next_steps.join(" "), /add (?:an? )?(?:executive )?summary|certification/i);
assert.equal((humanReadRepair.report as any).section_review.Summary.grade, "B");
assert.ok((humanReadRepair.report as any).section_review.Education.fix.length > 0);
assert.deepEqual(
  (humanReadRepair.report as any).job_alignment.strongly_aligned,
  ["UX leadership", "Product design strategy", "Cross-functional design delivery"],
);
assert.equal((humanReadRepair.report as any).job_alignment.role_fit.seniority_read, "Senior or lead-level");
assert.deepEqual(
  (humanReadRepair.report as any).job_alignment.missing,
  ["No target-role requirements were provided for comparison"],
);

const clutteredFixRepair = canonicalizeResumeReportEvidence({
  top_fixes: [{
    fix: 'Bullet to rewrite: "Supported HR strategies across several departments."',
    why: "Needs impact.",
    evidence: { excerpt: "- Supported HR strategies across several departments.", section: "Work Experience" },
    section_ref: "Work Experience",
  }],
}, "Work Experience\n- Supported HR strategies across several departments.");
assert.equal(
  (clutteredFixRepair.report as any).top_fixes[0].fix,
  "Add [specific scope] and [measurable result] to the HR bullet.",
);

const genericExistingResultRepair = canonicalizeResumeReportEvidence({
  top_fixes: [
    {
      fix: "Lead the summary with its strongest existing result.",
      why: "Make the opening stronger.",
      confidence: "medium",
      evidence: { excerpt: "Summary line.", section: "Summary" },
      impact_level: "low",
      effort: "quick",
      section_ref: "Summary",
    },
    {
      fix: "Add [team size] to the hiring bullet.",
      why: "Show the scale of the work.",
      confidence: "high",
      evidence: { excerpt: "- Led hiring across teams.", section: "Work Experience" },
      impact_level: "high",
      effort: "quick",
      section_ref: "Work Experience",
    },
  ],
}, "Summary\nSummary line.\nWork Experience\n- Led hiring across teams.");
assert.equal(
  (genericExistingResultRepair.report as any).top_fixes.length,
  1,
  JSON.stringify((genericExistingResultRepair.report as any).top_fixes),
);
assert.match((genericExistingResultRepair.report as any).top_fixes[0].fix, /team size/i);

const lateGenericExistingResultRepair = canonicalizeResumeReportEvidence({
  top_fixes: [
    {
      fix: "Move its existing result to the start of the bullet.",
      why: "The result should be easier to see.",
      confidence: "medium",
      evidence: { excerpt: "- Helped ship new product updates.", section: "Work Experience" },
      impact_level: "medium",
      effort: "quick",
      section_ref: "Work Experience",
    },
    {
      fix: "Add [customer count] to the product-updates bullet.",
      why: "Show the scale of the work.",
      confidence: "high",
      evidence: { excerpt: "- Analyzed customer feedback.", section: "Work Experience" },
      impact_level: "high",
      effort: "quick",
      section_ref: "Work Experience",
    },
  ],
}, "Work Experience\n- Helped ship new product updates.\n- Analyzed customer feedback.");
assert.equal((lateGenericExistingResultRepair.report as any).top_fixes.length, 1);
assert.match((lateGenericExistingResultRepair.report as any).top_fixes[0].fix, /customer count/i);

const crossFieldDuplicateRepair = canonicalizeResumeReportEvidence({
  top_fixes: [{
    fix: "Add [team size] to the hiring bullet.",
    why: "Show the scale of the work.",
    confidence: "high",
    evidence: { excerpt: "- Led hiring across teams.", section: "Work Experience" },
    impact_level: "high",
    effort: "quick",
    section_ref: "Work Experience",
  }],
  next_steps: [
    "Choose one target job description and compare the current resume against it.",
    "Rewrite the weakest bullet with a verified scope or outcome.",
    "Add [team size] to the hiring bullet.",
  ],
}, "Work Experience\n- Led hiring across teams.");
assert.notEqual(
  (crossFieldDuplicateRepair.report as any).next_steps[2],
  (crossFieldDuplicateRepair.report as any).top_fixes[0].fix,
);
assert.equal(new Set((crossFieldDuplicateRepair.report as any).next_steps).size, 3);

const repeatedIdeaQuestionRepair = canonicalizeResumeReportEvidence({
  ideas: {
    questions: [{
      question: "Which departments did you coordinate between at Greenfield Logistics, and what did you coordinate?",
      archetype: "CROSS-FUNCTIONAL COMPLEXITY",
      why: "Show the coordination involved.",
    }],
  },
}, "Work Experience\n- Coordinated with different departments to support daily operations.");
assert.equal(
  (repeatedIdeaQuestionRepair.report as any).ideas.questions[0].question,
  "Which departments did you coordinate between at Greenfield Logistics, and what result followed?",
);
assert.deepEqual(findMechanicalCopyIssues((repeatedIdeaQuestionRepair.report as any).ideas), []);

const careerBreakFixRepair = canonicalizeResumeReportEvidence({
  top_fixes: [{
    fix: "Rewrite this cited line to show more impact.",
    why: "Shows recency.",
    evidence: {
      excerpt: "- Maintained technical skills through coursework and personal projects while preparing to return to software engineering.",
      section: "Career Break",
    },
    section_ref: "Career Break",
  }],
}, "Career Break\n- Maintained technical skills through coursework and personal projects while preparing to return to software engineering.");
assert.equal(
  (careerBreakFixRepair.report as any).top_fixes[0].fix,
  "Name one real recent course or personal project and the [completed artifact] it produced.",
);
assert.deepEqual(findNonActionableFix((careerBreakFixRepair.report as any).top_fixes[0].fix), []);

const weakWorkReviewRepair = canonicalizeResumeReportEvidence({
  score: 65,
  gaps: ["Most bullets lack measurable outcomes."],
  section_review: {
    "Work Experience": {
      grade: "N/A",
      priority: "Low",
      working: "",
      missing: "No",
      fix: "No",
    },
  },
}, "Work Experience\n- Was responsible for daily operational tasks.");
assert.equal((weakWorkReviewRepair.report as any).section_review["Work Experience"].grade, "C");
assert.equal(
  (weakWorkReviewRepair.report as any).section_review["Work Experience"].missing,
  "Most bullets do not yet show verified scope or results.",
);

const unsupportedFixRepair = canonicalizeResumeReportEvidence({
  top_fixes: [
    {
      fix: "Add [budget size] to the HR strategy bullet.",
      evidence: { excerpt: "- Supported HR strategies across departments.", section: "Work Experience" },
      section_ref: "Work Experience",
    },
    {
      fix: "Add [recruitment cycle time] to the recruiting bullet.",
      evidence: { excerpt: "- Supported recruiting and onboarding.", section: "Work Experience" },
      section_ref: "Work Experience",
    },
  ],
}, "- Supported HR strategies across departments.\n- Supported recruiting and onboarding.");
assert.equal((unsupportedFixRepair.report as any).top_fixes.length, 1);
assert.match((unsupportedFixRepair.report as any).top_fixes[0].fix, /recruitment cycle time/);

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
assert.match(String(calibratedElite.score_comment_short), /Dense outcome evidence/);
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
assert.doesNotMatch((exceptionalRepair.report as any).summary, /lack of explicit personal contribution/i);
assert.equal(
  (exceptionalRepair.report as any).section_review["Work Experience"].missing,
  "No material section-specific gap identified.",
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

const contributionGapLine = "- I collaborated on Agile teams serving 50K+ users, improving satisfaction by 15%.";
const contributionGap = canonicalizeResumeReportEvidence({
  biggest_gap_example: `"${contributionGapLine}" shows the result but not your specific contribution.`,
}, contributionGapLine).report as any;
assert.equal(
  contributionGap.biggest_gap_example,
  `"${contributionGapLine}" shows the result but not your specific contribution.`,
  "a contribution gap must not be flattened into a false missing-outcome claim",
);

const repairError = Object.assign(new Error("grounding failed"), {
  code: "OPENAI_RESPONSE_SHAPE_INVALID",
  internal: {
    grounding: {
      missingEvidence: ["top_fixes[0].evidence.excerpt"],
      inventedSpecifics: ["rewrites[0].better unsupported outcomes: improving"],
    },
  },
});
assert.equal(isRepairableResumeResponseError(repairError), true);
assert.equal(isRepairableResumeResponseError(Object.assign(new Error(), { code: "OPENAI_TIMEOUT" })), false);
const repairMessages = buildResumeRepairMessages(
  [{ role: "user", content: "Resume: Supported daily operations." }],
  '{"invalid":true}',
  repairError,
);
assert.equal(repairMessages.at(-2)?.role, "assistant");
assert.match(repairMessages.at(-1)?.content || "", /character-for-character/);
assert.match(repairMessages.at(-1)?.content || "", /top_fixes\[0\]\.evidence\.excerpt/);
assert.match(repairMessages.at(-1)?.content || "", /unsupported outcomes: improving/);

assert.deepEqual(getChatCompletionTuning("gpt-5-nano"), {
  reasoning_effort: "low",
  verbosity: "low",
});
assert.deepEqual(getChatCompletionTuning("gpt-5-nano", { reasoningEffort: "low" }), {
  reasoning_effort: "low",
  verbosity: "low",
});
assert.deepEqual(getChatCompletionTuning("gpt-5.6-luna", { reasoningEffort: "low" }), {
  reasoning_effort: "low",
  verbosity: "low",
});
assert.deepEqual(getChatCompletionTuning("gpt-5.6-luna", { reasoningEffort: "none" }), {
  reasoning_effort: "none",
  verbosity: "low",
});
assert.deepEqual(getChatCompletionTuning("gpt-5-nano", { reasoningEffort: "none" }), {
  reasoning_effort: "low",
  verbosity: "low",
});
assert.deepEqual(getChatCompletionTuning("gpt-5.6-terra", { reasoningEffort: "low" }), {
  reasoning_effort: "low",
  verbosity: "medium",
});
assert.equal(increaseReasoningEffort("low"), "medium");
assert.equal(increaseReasoningEffort("medium"), "high");
assert.deepEqual(getTuningMetadata(getChatCompletionTuning("gpt-5-nano")), {
  temperature: null,
  top_p: null,
  reasoning_effort: "low",
  max_completion_tokens: null,
});
assert.deepEqual(getChatCompletionTuning("gpt-4o-mini", { temperature: 0 }), {
  temperature: 0,
});
assert.equal(resolveOpenAIModel("resume"), process.env.OPENAI_RESUME_MODEL || "gpt-5.6-luna");
assert.equal(resolveReasoningEffortForMode("resume", "gpt-5-nano"), "low");

const nanoUsage = normalizeTokenUsage({
  usage: {
    prompt_tokens: 10_000,
    completion_tokens: 2_000,
    total_tokens: 12_000,
    prompt_tokens_details: { cached_tokens: 4_000 },
    completion_tokens_details: { reasoning_tokens: 500 },
  },
});
assert.deepEqual(nanoUsage, {
  prompt_tokens: 10_000,
  completion_tokens: 2_000,
  total_tokens: 12_000,
  cached_prompt_tokens: 4_000,
  reasoning_tokens: 500,
});
assert.equal(
  calculateCostUsd("gpt-5-nano-2025-08-07", nanoUsage),
  0.00112,
  "Nano cost must use separate uncached-input, cached-input, and output rates",
);
assert.equal(
  calculateCostUsd("unknown-model", nanoUsage),
  null,
  "unknown prices must not be reported as zero cost",
);
assert.equal(
  calculateCostUsd("gpt-5.6-luna", nanoUsage),
  0.0184,
  "Luna cost must use its published standard token rates",
);
assert.equal(
  calculateCostUsd("gpt-5.6-terra", nanoUsage),
  0.046,
  "Terra cost must use its published standard token rates",
);

assert.deepEqual(
  findMechanicalCopyIssues({
    summary: "There is a credible finance story here. The work shows a clear progression. The client mix is still missing.",
    gaps: ["The page does not name the industries served, which limits the read."],
  }),
  [],
);
assert.deepEqual(
  findMechanicalCopyIssues({
    top_fixes: [
      { section_ref: "Meta, Talent Acquisition Leader (AI and ML SWE)" },
      { section_ref: "Meta, Talent Acquisition Leader (AI and ML SWE)" },
    ],
  }),
  [],
  "repeated structural labels are not repeated prose",
);
assert.ok(
  findMechanicalCopyIssues({ summary: "You read as... an independent CPA. The work is broad. The client mix is missing." })
    .some((issue) => issue.includes("ellipsis")),
);
assert.ok(
  findMechanicalCopyIssues({
    summary: "The title supports senior management, but the work is harder to assess, which makes the story harder to assess.",
  }).some((issue) => issue.includes("repeats the clause")),
);
assert.deepEqual(
  findMechanicalCopyIssues({
    strengths: ["Progression from Junior Software Developer to Software Developer to Software Engineer makes the level trajectory clear."],
  }),
  [],
  "career progression language should not be treated as accidental clause repetition",
);
assert.deepEqual(
  findMechanicalCopyIssues({
    seniority_read: "The resume supports an Enterprise Account Executive profile, with recent Enterprise Account Executive experience.",
    positioning_suggestion: "Position around information security hiring. Lead with the information security hiring result.",
  }),
  [],
  "repeated factual role and recruiting-domain labels are not mechanical copy",
);
assert.ok(
  findMechanicalCopyIssues({
    summary: "The client mix is still missing, so the level remains difficult to judge.",
    gaps: ["The client mix is still missing, so the level remains difficult to judge."],
  }).some((issue) => issue.includes("repeats a full sentence")),
);

console.log("llm-response-contract tests passed");
