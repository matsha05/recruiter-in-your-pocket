import { hasSkillsSection } from "../lib/llm/source-sections";
import { assertReportGrounding } from "../lib/validation/schemas";
import { findNonActionableFix, findFixEvidenceMismatch, findAlreadySatisfiedFix } from "../lib/llm/grounding";
import assert from "node:assert/strict";
import { canonicalizeResumeReportEvidence } from "../lib/llm/evidence-canonicalizer";
import { isAllowedReportNarrativeException } from "../lib/llm/report-narrative-exceptions";
import { compareSourceBoundRewrite } from "../lib/llm/source-fidelity";
import { ResumeFeedbackResponseSchema } from "../lib/validation/resume-report-schema";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";
import { auditReportNarrative } from "../lib/llm/source-fidelity";
import { validateResumeModelPayload } from "../lib/backend/validation";
import { buildResumeRepairMessages } from "../lib/llm/reportRepair";
import { RESUME_REPORT_JSON_SCHEMA } from "../lib/llm/response-format";
import { resumeTextFromFixture } from "../lib/evals/fixture-input";
import { relationshipBindingIssues } from "../lib/llm/source-relationship-fidelity";
import { inferredIndustrySignals } from "../lib/llm/source-industry-signals";
import { runAllChecks } from "../lib/evals/checks";
import { narrativeMeaningIssues } from "../lib/llm/narrative-meaning";

const source = "Work Experience\n- Helped resolve customer complaints.";
const instruction = "In the customer-complaint bullet, explain what changed as a result of your work.";
const questionReport = canonicalizeResumeReportEvidence({
  top_fixes: [{
    fix: instruction,
    why: "The resume names the responsibility but does not explain the result.",
    evidence: { excerpt: "- Helped resolve customer complaints.", section: "Work Experience" },
    section_ref: "Work Experience",
  }],
}, source).report as any;
assert.equal(questionReport.top_fixes[0].fix, instruction,
  "a specific question about the result must not acquire an automatic metric placeholder");

const absentSection = canonicalizeResumeReportEvidence({
  section_review: { Skills: { grade: "N/A", priority: "Low", working: "", missing: "", fix: "" } },
}, source).report as any;
assert.equal(absentSection.section_review.Skills.fix,
  "Add this section if it helps explain why your experience fits the job.");
assert.equal(isAllowedReportNarrativeException(absentSection,
  "section_review.Skills.fix", absentSection.section_review.Skills.fix), true,
  "the updated canonical absence instruction must retain its narrow narrative exception");

const complaintSource = "- Helped resolve customer complaints.";
const workflowSource = "- Built customer workflows in HubSpot.";
const usefulDraft = "Created customer journeys using HubSpot for [specific scope].";
const mixedDrafts = canonicalizeResumeReportEvidence({
  top_fixes: questionReport.top_fixes,
  rewrites: [
    { original: complaintSource, better: "Led customer complaint resolution.", enhancement_note: "Add the decisions you made." },
    { original: complaintSource, better: "Helped resolve customer complaints, reducing escalations by 20%.", enhancement_note: "Add the result." },
    { original: complaintSource, better: complaintSource, enhancement_note: "Add what changed." },
    { original: workflowSource, better: usefulDraft, enhancement_note: "Add the customer group these workflows served." },
  ],
}, `${source}\n${workflowSource}`).report as any;
assert.deepEqual(mixedDrafts.rewrites, [{
  original: workflowSource,
  better: usefulDraft,
  enhancement_note: "Add the customer group these workflows served.",
}], "unsafe and unchanged drafts must be omitted while a useful factual template is preserved");
assert.equal(mixedDrafts.top_fixes[0].fix, instruction,
  "omitting unusable drafts must retain the grounded fact question");
assert.equal(mixedDrafts.top_fixes[0].evidence.excerpt, complaintSource,
  "omitting unusable drafts must retain the exact supporting quotation");
assert.equal(compareSourceBoundRewrite({
  sourceText: workflowSource,
  sourceLocator: workflowSource,
  candidate: usefulDraft,
}).safe, true, "the preserved draft must also pass the final source-fidelity guard");

const longVerdict = "Two strong classroom results anchor the resume, while several leadership bullets still lack scope or measurable outcomes.";
const completeVerdict = "Your classroom results are clear, but the committee work needs more detail.";
for (const [verdict, expectedValid] of [[longVerdict, false], [completeVerdict, true]] as const) {
  const result = canonicalizeResumeReportEvidence({ score_comment_short: verdict }, "Classroom teacher");
  assert.equal(result.report.score_comment_short, verdict, "canonicalization must preserve a verdict's complete wording");
  const validation = ResumeFeedbackResponseSchema.safeParse({
    ...schemaValidReport,
    score_comment_short: result.report.score_comment_short,
  });
  assert.equal(validation.success, expectedValid, "the unchanged 16-word limit must accept the short sentence and reject the overlength one");
  if (!validation.success) {
    assert.ok(validation.error.issues.some(issue => issue.path[0] === "score_comment_short"
      && issue.message.includes("16 words")), "the word-limit failure must reach the existing validation and repair path");
  }
}

console.log("report canonical copy tests passed");

assert.deepEqual(auditReportNarrative({ first_impression_takeaway: "Explain recent finance decisions" },
  "Controller\nFinancial reporting and audit preparation."), [], "Explain is an instruction, not an invented employer or fact");
assert.ok(auditReportNarrative({ first_impression_takeaway: "Explain Salesforce finance decisions" },
  "Controller\nFinancial reporting and audit preparation.").length > 0, "an instruction must still reject an invented named tool");

const longFix = "In the sales bullet, describe your responsibility during the deal stage involving Solutions Engineers, Value Management, and Customer Success, including the handoff you handled between those teams.";
const salesSource = "● Sales involved Solutions Engineers, Value Management, and Customer Success.";
const longFixReport = canonicalizeResumeReportEvidence({ top_fixes: [{
  fix: longFix, why: "The teams are named, but your part in the deal is not explained.",
  evidence: { excerpt: salesSource, section: "Work Experience" }, section_ref: "Work Experience",
}] }, salesSource).report as any;
assert.equal(longFixReport.top_fixes[0].fix, longFix, "a specific long instruction must not become a generic metrics template");

const datedRole = "Northline - Account Executive - July 2022 - Oct. 2023\n● Managed customer accounts.";
const workReview = { grade: "B", priority: "High", working: "Customer account work is described.", missing: "The account types are unclear.", fix: "Name the customer types in the account bullet." };
const datedReview = canonicalizeResumeReportEvidence({ section_review: { "Work Experience": workReview } }, datedRole).report as any;
assert.equal(datedReview.section_review["Work Experience"].grade, "B", "dated jobs do not require a Work Experience heading");
const educationOnly = canonicalizeResumeReportEvidence({ section_review: { "Work Experience": workReview } },
  "Education\nState University - Engineering - 2018 - 2022\n● Completed coursework.").report as any;
assert.equal(educationOnly.section_review["Work Experience"].grade, "N/A", "education dates alone are not work experience");

let schemaFailure: unknown;
try { validateResumeModelPayload({ ...structuredClone(schemaValidReport), score_comment_short: longVerdict }); }
catch (error) { schemaFailure = error; }
assert.ok(schemaFailure);
assert.match(buildResumeRepairMessages([], "{}", schemaFailure).at(-1)!.content,
  /Audit findings: score_comment_short:.*16 words/, "repair must receive the actual violated limit, not only a field name");

const oneRelevantRole = structuredClone(schemaValidReport);
oneRelevantRole.job_alignment.role_fit.best_fit_roles = ["Controller"];
oneRelevantRole.job_alignment.role_fit.stretch_roles = [];
assert.equal(ResumeFeedbackResponseSchema.safeParse(oneRelevantRole).success, true, "role lists must not require irrelevant filler");
assert.equal(RESUME_REPORT_JSON_SCHEMA.properties.job_alignment.properties.role_fit.properties.best_fit_roles.minItems, 1);
assert.equal(RESUME_REPORT_JSON_SCHEMA.properties.job_alignment.properties.role_fit.properties.stretch_roles.minItems, 0);
assert.equal(resumeTextFromFixture("# Test Person – sales anchor (strong_foundation 82–86)\n\nTEST PERSON\nExperience"), "TEST PERSON\nExperience");
assert.equal(resumeTextFromFixture("Elite anchor – Staff Engineer (rare_air 92–96)\nPERSON"), "PERSON");
assert.equal(resumeTextFromFixture("# PROFESSIONAL SUMMARY\nAccount executive."), "# PROFESSIONAL SUMMARY\nAccount executive.");
assert.equal(canonicalizeResumeReportEvidence({ first_impression_takeaway: "Verify unclear program language" }, source).report.first_impression_takeaway,
  "Verify unclear program language", "an ordinary imperative must not acquire a Show prefix");
assert.equal(canonicalizeResumeReportEvidence({ first_impression_takeaway: "Check the wording against the original resume file" }, source).report.first_impression_takeaway,
  "Check the wording against the original resume file", "an overlong takeaway must remain intact for validation");
assert.deepEqual(relationshipBindingIssues("The Encompass role combines US tax responsibilities, several audit types, $180M in annual sales, and a staff of 3.",
  "Encompass\nUS tax responsibilities with $180M in annual sales.\nManaged staff of 3.\n50 bank accounts."), [], "a reported staff count is not a new responsibility binding");
assert.ok(relationshipBindingIssues("Managed staff of 7.", "Managed staff of 3.\nSupported staff of 7.").length > 0,
  "an actual change to the managed staff count must still fail");
assert.deepEqual(inferredIndustrySignals("Coordinated volunteer logistics and managed bank accounts."), [],
  "ordinary duties do not establish the employer's industry");
assert.ok(inferredIndustrySignals("Worked for a logistics company.").includes("Logistics"));
for (const [fix, warned] of [
  ["Revise the financial-statement bullet to name the reporting cadence and audience.", false],
  ["Compare the meeting bullet with the original file and replace “over standups” with the correct wording.", false],
  ["Add more detail to the resume.", true],
  ["Add a two-sentence summary below the contact details naming your senior recruiting focus and target role.", false],
  ["Revise the Pierce process bullet to identify the accounting process you implemented and the specific change that followed.", false],
] as const) {
  const output = { ...structuredClone(schemaValidReport), top_fixes: [{ ...schemaValidReport.top_fixes[0], fix }] };
  const checks = runAllChecks({ output, resumeText: source, globalBanned: [], globalDiscouraged: [], expectedContractVersion: "v2",
    fixture: { id: "qualitative-detail", path: "unused", tier: "smoke", expected_score: { min: 60, max: 80 }, tags: [] } });
  assert.equal(checks.warnings.some(issue => issue.code === "W_SPECIFICITY_LOW"), warned,
    "specificity must distinguish a concrete non-numeric request from generic encouragement");
}

const mixedAssessmentSource = "Full-cycle recruiting across sales, product, operations and engineering.";
assert.deepEqual(auditReportNarrative({ biggest_gap_example:
  `“${mixedAssessmentSource}” shows breadth but not the searches or contribution behind it.` }, mixedAssessmentSource), [],
  "contrast clauses must distinguish a general assessment from a missing detail");
assert.ok(auditReportNarrative({ biggest_gap_example:
  `“${mixedAssessmentSource}” shows Salesforce expertise but not the searches behind it.` }, mixedAssessmentSource).length > 0,
  "a negative contrast must not hide an invented tool in its positive clause");
const strongFix = "In the retention bullet, describe the change that helped improve retention by 15%.";
const independentFix = canonicalizeResumeReportEvidence({ biggest_gap_example: '"- Helped resolve customer complaints." does not describe the contribution.', top_fixes: [{
  fix: strongFix, why: "The result is clear, but the change you made is missing.",
  evidence: { excerpt: "- Improved retention by 15%.", section: "Work Experience" }, section_ref: "Work Experience",
}] }, "Work Experience\n- Improved retention by 15%.\n- Helped resolve customer complaints.").report as any;
assert.equal(independentFix.top_fixes[0].fix, strongFix, "a useful recommendation must not be replaced with a template about a different bullet");

const summaryStep = "Add a summary section that connects your account management experience to the job you want.";
assert.equal((canonicalizeResumeReportEvidence({ next_steps: [summaryStep] }, "Account Manager").report as any).next_steps[0], summaryStep,
  "summary advice must not become an unrelated experience-bullet recommendation");

assert.deepEqual(auditReportNarrative({ ideas: { questions: [{ question: "How did the SI contribute?" }] } }, "Partnered with SIs."), [],
  "plural acronyms must support the same singular acronym");
assert.ok(auditReportNarrative({ ideas: { questions: [{ question: "How did the SI contribute?" }] } }, "Partnered with ISVs.").length > 0,
  "a different acronym must not support an invented partner category");

assert.deepEqual(inferredIndustrySignals("Controller at a pharmacy.\nSOFTWARE\nMicrosoft Excel | QuickBooks"), [],
  "a software skills heading does not establish the employer's industry");
const industryReport = canonicalizeResumeReportEvidence({ job_alignment: { role_fit: { industry_signals: ["Real Estate", "Pharmacy"] } } },
  "Controller at Real Estate Advisors. Chief Financial Officer at Pharmacy Management. SOFTWARE: Excel").report as any;
assert.deepEqual(industryReport.job_alignment.role_fit.industry_signals, ["Real Estate", "Pharmacy"],
  "normalization must preserve grounded model industries rather than replace them with a keyword guess");

for (const fix of [
  "On the ML Acceleration entry, compare “eos” with your original file and replace it with the intended program term.",
  "In the structured interview entry, name the interview materials or workflow introduced and the hiring group that used them.",
  "In the Workday sales-motion bullet, add one customer problem, the product areas involved, and your specific part in coordinating the listed internal teams.",
  "In the Workday partner bullet, add one deal example and state what a named partner contributed and what you handled.",
  "In the MuleSoft Book Club bullet, add who attended and describe one recurring activity or discussion format you created.",
]) assert.deepEqual(findNonActionableFix(fix), [], "a specific request must survive without a metric placeholder");
for (const fix of ["Revise the experience bullet to add more detail and show greater impact.", "Clarify each bullet with more specific scope and stronger results."]) {
  assert.ok(findNonActionableFix(fix).length > 0, "generic editing advice remains insufficient");
}
assert.ok(inferredIndustrySignals("Manager at Cingular Wireless").includes("Telecommunications"));
assert.ok(!inferredIndustrySignals("Set up a wireless keyboard.").includes("Telecommunications"));

assert.deepEqual(auditReportNarrative({ top_fixes: [{ fix: "In the sales bullet, add one customer problem and describe the product areas involved." }] }, "Sales involved product areas."), [],
  "asking for one example does not assert a historical customer count");
assert.ok(auditReportNarrative({ top_fixes: [{ fix: "Add that you managed one customer." }] }, "Sales involved product areas.").length > 0,
  "an instruction must still reject an invented customer count");
const optionalOnly = structuredClone(schemaValidReport);
optionalOnly.section_review["Work Experience"].priority = "high";
optionalOnly.top_fixes[0].evidence = { excerpt: "No summary section present", section: "Summary" };
optionalOnly.top_fixes[0].fix = "Add a summary naming the target role.";
assert.ok(assertReportGrounding(optionalOnly, source).missingEvidence.some(issue => issue.includes("actionable experience edit")),
  "a report cannot mark experience high priority then leave only an optional summary fix");

for (const claim of [
  "Correct the unclear wording and add implementation detail to the people-process bullets.",
  "Then revise the customer description around one specific customer situation and your contribution.",
  "In the customer project bullet, name one project and what you contributed.",
]) assert.deepEqual(auditReportNarrative({ next_steps: [claim] }, "- Supported customer projects."), [], claim);
assert.ok(auditReportNarrative({ next_steps: ["Add that you managed one customer."] }, "- Supported customer projects.").length > 0);
assert.deepEqual(findNonActionableFix("Under the CPA role, add bullets that name the accounting services you performed, the client types, and the work you delivered."), []);
assert.deepEqual(auditReportNarrative({ first_impression_takeaway: "Clarify LTV and productivity." }, "Improved lifetime value (LTV) and productivity."), []);
assert.deepEqual(auditReportNarrative({ next_steps: ["Complete the NovaSense KPI entry with a finding."] }, "NovaSense\nDefined key performance indicators."), []);
assert.ok(auditReportNarrative({ next_steps: ["Complete the NovaSense KPI entry with a finding."] }, "NovaSense\nPrepared invoices.").length > 0);
assert.deepEqual(auditReportNarrative({ score: 66, score_plain: "At 66, the resume gives a starting point." }, "Accounting duties."), []);
assert.ok(auditReportNarrative({ score: 66, score_plain: "At 99, the resume gives a starting point." }, "Accounting duties.").length > 0);
assert.deepEqual(auditReportNarrative({ score_comment_short: "Relevant experience is present, but duties rarely explain what you actually handled." }, "Supported operations."), []);
for (const [claim, text] of [
  ["The team covers 60% of hiring.", "The team covers over 60% of hiring."],
  ["The work saved $3.2M annually.", "The work saved over $3.2M annually."],
  ["The team has 50 people.", "The team has up to 50 people."],
]) assert.ok(auditReportNarrative({ first_impression: claim }, text).length > 0, "bounds cannot disappear from a report");
assert.deepEqual(auditReportNarrative({ first_impression: "The work saved over $3.2M annually." }, "The work saved over $3.2M annually."), []);

const purpose = "Designed processes to increase the effectiveness of daily operations.";
assert.ok(narrativeMeaningIssues("The entry says processes increased daily effectiveness.", purpose).length > 0);
assert.deepEqual(narrativeMeaningIssues("Did the processes increase daily effectiveness?", purpose), []);
assert.deepEqual(narrativeMeaningIssues("The processes increased daily effectiveness.", "The processes increased daily effectiveness."), []);
assert.deepEqual(narrativeMeaningIssues("Describe the process and whether it increased daily effectiveness.", purpose), []);
assert.ok(narrativeMeaningIssues("The pipeline ARR is useful.", "Created $2M pipeline and closed $400K ARR.").length > 0);
assert.deepEqual(narrativeMeaningIssues("The pipeline and ARR figures are useful.", "Created $2M pipeline and closed $400K ARR."), []);
assert.deepEqual(narrativeMeaningIssues("Created $2M in ARR pipeline.", "Created $2M in ARR pipeline."), []);
for (const claim of [
  "The process improved daily effectiveness, not customer satisfaction.",
  "The process improved daily effectiveness, which may help explain the role.",
]) assert.ok(narrativeMeaningIssues(claim, "Designed a process to improve daily effectiveness.").length > 0);
assert.ok(narrativeMeaningIssues("The process cut administrative costs.", "Designed a process to cut administrative costs.").length > 0);
assert.ok(narrativeMeaningIssues("The process reduced costs.", "Designed a process to reduce costs.").length > 0);
assert.deepEqual(narrativeMeaningIssues("The process cut administrative costs.", "The process cut administrative costs."), []);
assert.deepEqual(narrativeMeaningIssues("The process may have improved daily effectiveness.", purpose), []);

const fullSummary = "You led the research program. The studies covered three products. Explaining the adoption framework would show how teams used the research.";
const retainedSummary = canonicalizeResumeReportEvidence({ summary: fullSummary, gaps: ["The framework needs an example."] }, "Led research.").report as any;
assert.equal(retainedSummary.summary, fullSummary, "a complete summary must not acquire a copied gap");
const directHeading = "Define LTV and productivity.";
assert.equal((canonicalizeResumeReportEvidence({ first_impression_takeaway: directHeading }, "LTV and productivity").report as any).first_impression_takeaway, directHeading);
const separatedJob = "Product Manager Intern\nNorthline Technologies\nJune 2023 - August 2023\n- Prepared research findings.";
assert.equal((canonicalizeResumeReportEvidence({ section_review: { "Work Experience": workReview } }, separatedJob).report as any).section_review["Work Experience"].grade, "B");
const namedSkills = canonicalizeResumeReportEvidence({ section_review: { Skills: { ...workReview } } }, "Strengths and Technologies\n- Python\n- SQL").report as any;
assert.notEqual(namedSkills.section_review.Skills.missing, "No skills section present");

for (const fix of [
  "In the reporting bullet, add one decision or operating change that followed from the monthly review.",
  "In the sales bullet, replace the broad team list with one customer problem and the part you handled.",
  "Align the header's graduation date with the Education date and retain the verified degree wording.",
  "Replace the dual headline with the one target role for this version, either CFO or Controller.",
  "In the profile, replace the technical-background phrase with the discipline or project it refers to.",
]) assert.deepEqual(findNonActionableFix(fix), [], fix);
assert.ok(findNonActionableFix("Rewrite this bullet.").length > 0);
const managementFix = "In the team-lead bullet, add [ownership detail] covering whether you hired, set work priorities, conducted performance reviews, or managed delivery.";
const managementSource = "- Led a cross-functional team of 8 engineers.";
const managementReport = canonicalizeResumeReportEvidence({ top_fixes: [{ fix: managementFix, evidence: { excerpt: managementSource, section: "Experience" } }] }, managementSource).report as any;
assert.equal(managementReport.top_fixes[0].fix, managementFix, "stating leadership does not make a question about management duties redundant");

const specificReason = "The complaint bullet does not say whether customers received refunds or replacement orders.";
const placeholderQuestion = canonicalizeResumeReportEvidence({ top_fixes: [{
  fix: "Explain how you resolved the customer complaints and add [result].",
  why: specificReason,
  evidence: { excerpt: "- Helped resolve customer complaints.", section: "Work Experience" },
  section_ref: "Work Experience",
}] }, source).report as any;
assert.equal(placeholderQuestion.top_fixes[0].why, specificReason,
  "a placeholder must not replace the specific explanation with a stock sentence");

const additionalSkills = "Additional Information\n- Experienced in using various HRIS platforms.\n- Familiar with employment law.";
assert.equal(hasSkillsSection(additionalSkills), true);
assert.equal(hasSkillsSection("Additional Information\n- Enjoys hiking and travel."), false);
assert.equal(hasSkillsSection("Additional Information\n- Enjoys hiking.\nExperience\n- Taught software skills."), false,
  "work-history language must not turn an unrelated information section into Skills");
const hrSkillsReview = canonicalizeResumeReportEvidence({ section_review: { Skills: {
  grade: "B", priority: "Medium", working: "HRIS experience is included.",
  missing: "The HRIS platforms are not named.", fix: "Name the HRIS platforms you used.",
} } }, additionalSkills).report as any;
assert.equal(hrSkillsReview.section_review.Skills.grade, "B");
assert.equal(hrSkillsReview.section_review.Skills.missing, "The HRIS platforms are not named.");

const organizationSource = "Led a 45-person marketing organization for a SaaS platform serving users across 40 countries.";
assert.ok(narrativeMeaningIssues("How was the marketing organization structured across the 40 countries?", organizationSource).length > 0);
assert.deepEqual(narrativeMeaningIssues("How was the marketing organization structured to serve users across 40 countries?", organizationSource), []);
assert.deepEqual(narrativeMeaningIssues("How was the marketing organization structured across the 40 countries?",
  "Led a marketing organization across 40 countries."), []);
assert.deepEqual(narrativeMeaningIssues("How did you serve customers across 40 countries?", organizationSource), []);

for (const [claim, sourceText] of [
  ["Broad HR responsibilities are clear, but scope and results remain largely unspecified.", "Experience\n- Supported HR strategies."],
  ["Core finance duties are visible, but specific work products and context remain absent.", "Finance analyst\n- Supported financial reporting."],
  ["The degree, school, location, and dates are complete and readable.", "Education\nBA, State University, Denver, 2020"],
  ["Current lead responsibilities are broad, while their completed changes are less visible.", "Recruiting Lead\n- Led hiring."],
  ["In the projects bullet, name one customer-engagement or sales-strategy project and what you contributed.", "- Contributed to customer engagement and sales strategies."],
] as const) assert.deepEqual(auditReportNarrative({ first_impression: claim }, sourceText), [], claim);
assert.ok(auditReportNarrative({ first_impression: "Managed one customer." }, "Managed accounts.").length > 0);
assert.ok(auditReportNarrative({ first_impression: "Broad Salesforce responsibilities are clear." }, "HR responsibilities.").length > 0);
assert.deepEqual(relationshipBindingIssues("Reducing average time from 6 weeks to 9 days anchors the current role.",
  "Reduced average time from 6 weeks to 9 days."), []);
assert.ok(relationshipBindingIssues("Reducing average time from 9 days to 6 weeks anchors the current role.",
  "Reduced average time from 6 weeks to 9 days.").length > 0);
assert.ok(inferredIndustrySignals("Managed temporary-to-hire consulting services.").includes("Staffing"));
assert.ok(!inferredIndustrySignals("Led staffing discussions at a hospital.").includes("Staffing"));

const measurementSource = "Defined and tracked product KPIs for time-to-value and churn.";
assert.ok(narrativeMeaningIssues("The post-launch measurement work remains incomplete.", measurementSource).length > 0);
assert.deepEqual(narrativeMeaningIssues("The description of the measurement work is incomplete.", measurementSource), []);
assert.deepEqual(narrativeMeaningIssues("The measurement work remains incomplete.", "The measurement work remains incomplete."), []);
const feedbackSource = "Used beta-user feedback and analytics to prioritize features.";
assert.ok(narrativeMeaningIssues("When beta-user feedback and analytics pointed in different directions, how did you decide?", feedbackSource).length > 0);
assert.ok(narrativeMeaningIssues("This explains how you handled competing direction.", feedbackSource).length > 0);
assert.deepEqual(narrativeMeaningIssues("Did beta-user feedback and analytics point in different directions?", feedbackSource), []);
assert.deepEqual(narrativeMeaningIssues("If beta-user feedback and analytics pointed in different directions, how did you decide?", feedbackSource), []);
assert.deepEqual(narrativeMeaningIssues("When beta-user feedback and analytics pointed in different directions, how did you decide?",
  "Resolved conflicting feedback and analytics findings."), []);

const educationConflict = { grade: "C", priority: "Medium", working: "The degree is listed.", missing: "The header year conflicts with the degree date.", fix: "Verify the degree date against your records." };
const sourceWithDegree = "Education\nState University, degree completed in 2013";
assert.deepEqual((canonicalizeResumeReportEvidence({ section_review: { Education: educationConflict } }, sourceWithDegree).report as any).section_review.Education, educationConflict);
const objectiveMismatch = canonicalizeResumeReportEvidence({ section_review: { Summary: {
  grade: "N/A", priority: "Low", working: "", missing: "Section not present.", fix: "Add only if useful.",
} } }, "Objective\nSeeking operations work.");
assert.ok(objectiveMismatch.unresolved.some(issue => issue.startsWith("section_review.Summary")));
const portfolioInstruction = "Confirm the hospital portfolio size and add it beside the monthly patient figure.";
assert.equal((canonicalizeResumeReportEvidence({ next_steps: [portfolioInstruction] },
  "Served a hospital portfolio with 150K monthly patients.").report as any).next_steps[0], portfolioInstruction);

const toolInstruction = "In the analytical-tools bullet, name one tool or strategy and the prospecting task it changed.";
const unnamedTools = "Developed pipeline-generating analytical tools and strategies still used by SDRs.";
assert.deepEqual(findAlreadySatisfiedFix(toolInstruction, unnamedTools, `Workday\n${unnamedTools}`), []);
assert.ok(findAlreadySatisfiedFix("Name the tools in this bullet.", "Used Figma and Sketch.", "Used Figma and Sketch.").length > 0);
assert.deepEqual(findNonActionableFix("In the code-review entry, say how production bugs were tracked or name the review change you made."), []);
assert.deepEqual(findNonActionableFix("For the accessibility workshops, name one standard or guideline and the teams where it was adopted."), []);
assert.deepEqual(findFixEvidenceMismatch("In the Finance forecasting bullet, identify the hiring population affected by fewer backfills.",
  "Partnered with Finance on headcount forecasting and requisition approval.", "Partnered with Finance on headcount forecasting and requisition approval."), []);
assert.deepEqual(findFixEvidenceMismatch("Name the policy steps you used for returns and exchanges.", "Processed returns and exchanges.", "Processed returns and exchanges."), []);
assert.ok(findFixEvidenceMismatch("Add audit results to this transaction bullet.", "Processed returns and exchanges.", "Processed returns and exchanges.").length > 0);
const distinctTools = ["Replace the hackathon statement with a verified system example.", "Add environment context to the GitOps bullet without changing its tools."];
assert.deepEqual((canonicalizeResumeReportEvidence({ next_steps: distinctTools }, "Used GitOps tools and participated in hackathons.").report as any).next_steps, distinctTools);

assert.deepEqual(auditReportNarrative({ top_fixes: [{ why: "Supported budget management can mean several things, and your part is not yet visible." }] },
  "Supported the product team in managing a $150K budget."), []);
assert.ok(auditReportNarrative({ top_fixes: [{ why: "Supported a $900K budget." }] }, "Supported a $150K budget.").length > 0);
assert.ok(auditReportNarrative({ ideas: { questions: [{ question: "When beta-user feedback conflicted with analytics, how did you choose?" }] } }, feedbackSource).length > 0);
assert.ok(auditReportNarrative({ ideas: { questions: [{ why: "The resume does not say how conflicts were resolved." }] } }, feedbackSource).length > 0);

assert.deepEqual(findFixEvidenceMismatch("Name the policy, process, or program you helped implement in the HR strategies bullet.",
  "Supported the development and implementation of HR strategies.", "Supported the development and implementation of HR strategies."), []);
