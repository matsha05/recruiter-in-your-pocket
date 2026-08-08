import assert from "node:assert/strict";
import { findMechanicalCopyIssues } from "../lib/evals/checks";
import { canonicalizeResumeReportEvidence } from "../lib/llm/evidence-canonicalizer";
import { findNonActionableFix } from "../lib/llm/grounding";

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

const exactEvidenceDropRepair = canonicalizeResumeReportEvidence({
  top_fixes: [
    {
      fix: "Add [specific scope] to the support bullet.",
      evidence: { excerpt: "- Supported customer operations.", section: "Work Experience" },
      section_ref: "Work Experience",
    },
    {
      fix: "Add [verified outcome] to the Salesforce rollout bullet.",
      evidence: { excerpt: "Invented Salesforce rollout evidence", section: "Work Experience" },
      section_ref: "Work Experience",
    },
  ],
}, "Work Experience\n- Supported customer operations.");
assert.equal((exactEvidenceDropRepair.report as any).top_fixes.length, 1);
assert.equal((exactEvidenceDropRepair.report as any).top_fixes[0].evidence.excerpt, "- Supported customer operations.");

const compoundEducationHeadingRepair = canonicalizeResumeReportEvidence({
  section_review: {
    Education: {
      grade: "B",
      priority: "Low",
      working: "The accounting degree is easy to find.",
      missing: "Graduation timing is not listed.",
      fix: "Add the graduation year if useful.",
    },
  },
}, "EDUCATION, HONORS & ASSOCIATIONS\nBachelor of Business Administration in Accounting");
assert.notEqual((compoundEducationHeadingRepair.report as any).section_review.Education.missing, "No education section present");

const decimalSummaryRepair = canonicalizeResumeReportEvidence({
  summary: "The platform saved over $3.2M annually. The result is clear. The scope is credible.",
}, "Saved partner hospitals over $3.2M annually.");
assert.match((decimalSummaryRepair.report as any).summary, /\$3\.2M/);
assert.doesNotMatch((decimalSummaryRepair.report as any).summary, /\$3\. 2M/);

const projectSelectionRepair = canonicalizeResumeReportEvidence({
  next_steps: ["Add [specific scope] to one Nimbus project bullet."],
}, "Work Experience\nNimbus Media Group\n- Created wireframes for client projects.");
assert.equal((projectSelectionRepair.report as any).next_steps[0], "Add [specific scope] to a Nimbus project bullet.");

const unnamedOpeningRepair = canonicalizeResumeReportEvidence({
  top_fixes: [{
    fix: "Replace the opening summary with [target role].",
    why: "The opening is broad.",
    evidence: { excerpt: "Product manager with experience delivering SaaS features through customer research, product analytics, and cross-functional development for growing teams.", section: "Summary" },
    section_ref: "Summary",
  }],
}, "Candidate Name\ncandidate@example.com\nProduct manager with experience delivering SaaS features through customer research, product analytics, and cross-functional development for growing teams.\nProduct Manager Intern\n- Shipped an onboarding feature.");
assert.notEqual((unnamedOpeningRepair.report as any).top_fixes[0].evidence.excerpt, "No summary section present");

const sourceGatedLanguageRepair = canonicalizeResumeReportEvidence({
  first_impression_takeaway: "Target one finance lane",
  score_plain: "This resume can support CPA-focused searches.",
  section_review: { Education: { working: "The degree, school, location, and graduation date are clearly listed." } },
  job_alignment: { strongly_aligned: ["Scheduling"] },
}, "CFO or Controller\nCPA\nScheduling interviews\nEDUCATION\nBachelor of Business Administration\nState University, Denver, CO\nGraduated May 2023");
assert.equal((sourceGatedLanguageRepair.report as any).first_impression_takeaway, "Clarify the finance lane");
assert.equal((sourceGatedLanguageRepair.report as any).score_plain, "This resume can support CPA searches.");
assert.equal((sourceGatedLanguageRepair.report as any).section_review.Education.working, "The Education section is clear.");
assert.equal((sourceGatedLanguageRepair.report as any).job_alignment.strongly_aligned[0], "scheduling");

const ungatedLanguageControl = canonicalizeResumeReportEvidence({
  section_review: { Education: { working: "The degree, school, location, and graduation date are clearly listed." } },
}, "EXPERIENCE\nSupported customer operations.");
assert.notEqual((ungatedLanguageControl.report as any).section_review.Education.working, "The Education section is clear.");

const dotBulletGapRepair = canonicalizeResumeReportEvidence({
  biggest_gap_example: '“· Coach team to improve overall passthrough and close rates” gives no measured change, so the value of the coaching is difficult to assess.',
}, "PALANTIR TECHNOLOGIES\n· Coach team to improve overall passthrough and close rates\n· Hired over 60% of entire global Palantir Information Security team");
assert.match(
  (dotBulletGapRepair.report as any).biggest_gap_example,
  /Coach team to improve overall passthrough and close rates.*missing clearer scope or outcome evidence/,
  "middle-dot bullets must be eligible for a grounded gap replacement",
);

const vpQuestionRepair = canonicalizeResumeReportEvidence({
  ideas: { questions: [{ question: "Which structured interview changes cut the first six month mis hire rate by 35 percent?" }] },
}, "Introduced a structured interviewing program, cutting mis hire rate in the first six months by 35 percent.");
assert.equal(
  (vpQuestionRepair.report as any).ideas.questions[0].question,
  "Which structured interview changes cut the mis hire rate by 35 percent?",
);

const exactNarrativeRepairs = canonicalizeResumeReportEvidence({
  score_comment_long: "Several bullets remain broad responsibility statements, so the page does not consistently show what you personally changed inside each deal.",
  summary: "It does not yet show what changed because of your operational work, which limits the case for a broader operations position.",
}, "WORKDAY\ncross-functional and cross-product selling\ncustomer relationships\nCustomer Service Associate\nSeasonal Team Lead");
assert.equal(
  (exactNarrativeRepairs.report as any).score_comment_long,
  "Recent Workday bullets describe collaboration and relationship-building.",
);
assert.equal((exactNarrativeRepairs.report as any).summary, "The next role is unclear.");
