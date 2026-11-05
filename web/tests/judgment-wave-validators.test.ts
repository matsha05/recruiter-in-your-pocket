import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { hasSummarySection } from "../lib/llm/evidence-canonicalizer";
import { narrativeTokenPolicy } from "../lib/llm/narrative-token-policy";
import { canonicalizeOptionalReportMetadata } from "../lib/llm/optional-report-metadata";
import { ambiguousReportSourceLocators } from "../lib/llm/report-source-locators";
import { evidenceContainsRequirementLabel } from "../lib/llm/requirement-evidence";
import { semanticMissingDisposition } from "../lib/llm/semantic-missing-policy";
import { auditReportNarrative } from "../lib/llm/source-fidelity";

/**
 * The judgment wave (docs/audits/2026-11-judgment-wave.md): every validator rule loosened for the live
 * judgment run's refusals of true statements, each with the control that still catches the invention it
 * was written for. The resumes are the run's own synthetic resumes.
 */
const root = path.resolve(process.cwd(), "..");
const audit = path.join(root, "docs/audits/2026-11-live-judgment/resumes");
const read = (file: string) => fs.readFileSync(file, "utf8");
const student = read(path.join(audit, "h2_thin_resume.txt"));
const cv = read(path.join(audit, "h4b_academic_cv_under_cap.txt"));
const coo = read(path.join(audit, "b_coo_executive.txt"));
const analyst = read(path.join(audit, "h5_data_analyst.txt"));
const nursing = read(path.join(audit, "h5_nursing_posting.txt"));
const paragraph = read(path.join(audit, "h4c_one_paragraph.txt"));
const csmPosting = read(path.join(audit, "b_posting_customer_success_manager.txt"));
const csm = read(path.join(root, "tests/resumes/blindpick/synth_bp_customer_success_manager_1.txt"));
const james = read(path.join(root, "docs/design/2026-11-bar/resumes/3-layoff-gap-james.txt"));
const paralegal = read(path.join(root, "tests/resumes/blindpick/synth_bp_paralegal_1.txt"));
const kitchen = read(path.join(root, "tests/resumes/blindpick/synth_bp_kitchen_manager_1.txt"));
const teacher = read(path.join(root, "tests/resumes/blindpick/synth_bp_teacher_to_instructional_designer_1.txt"));
const recentGrad = read(path.join(root, "tests/resumes/countcheck/synth_cc_recent_grad_bad_1.txt"));
const socialWorker = read(path.join(root, "tests/resumes/blindpick/synth_bp_social_worker_1.txt"));

const passes = (report: any, source: string, jobDescription?: string) =>
  assert.deepEqual(auditReportNarrative(report, source, jobDescription), [], `must pass: ${JSON.stringify(report)}`);
const refuses = (report: any, source: string, jobDescription?: string) =>
  assert.ok(auditReportNarrative(report, source, jobDescription).length > 0, `must refuse: ${JSON.stringify(report)}`);
const asQuestion = (question: string) => ({ ideas: { questions: [{ question, why: "" }] } });

// ---- 1. The summary detector: a section is a section when the resume labels it or its shape is unambiguous ----
assert.equal(hasSummarySection(student), false, "a long 'Relevant coursework' line under Education is not a summary");
assert.equal(hasSummarySection(cv), false, "a Ph.D. line under Education is not a summary");
assert.equal(hasSummarySection(coo), true, "an unlabeled two-sentence opener before the first heading is a summary");
assert.equal(hasSummarySection(paragraph), false, "a resume pasted as one line has no detectable sections (its one line carries the email address)");
assert.equal(hasSummarySection("Jane Doe\nSUMMARY\nOperations leader.\nEXPERIENCE\n- Led a team"), true, "the resume's own label");
assert.equal(hasSummarySection("Jane Doe\nProfessional Profile\nOperations leader.\nEXPERIENCE\n- Led a team"), true);
assert.equal(
  hasSummarySection("JANE DOE\nSENIOR PRODUCT MANAGER\nProduct leader with twelve years building payments platforms for banks and fintechs, now leading a team of nine across two countries and three time zones.\nEXPERIENCE\n- Led a team"),
  true,
  "an all-capitals name and headline do not hide the paragraph under them",
);
assert.equal(
  hasSummarySection("Jane Doe\nEXPERIENCE\nSenior Analyst, Acme, 2019 - Present\n- Built weekly dashboards for sales, marketing and finance leaders across eleven regions and three business units and two brands"),
  false,
  "a long bullet under Experience is not a summary",
);
assert.equal(
  hasSummarySection("Jane Doe\njane@example.com\nSenior Analyst, Acme Corporation, Chicago, Illinois, United States of America, 2019 - Present, reporting to the CFO\n- Built dashboards"),
  false,
  "a long dated role line without a heading is not a summary",
);
assert.equal(
  hasSummarySection("Jane Doe\njane@example.com\nSeasoned operations leader with ten years of experience running multi-site teams, budgets and vendor programs for healthcare groups.\nSenior Analyst, Acme, 2019 - Present\n- Built dashboards"),
  true,
  "an unlabeled opener on a resume with no headings at all is still a summary",
);

// The narrative audit reads a section's absence from the same detectors the canonicalizer uses, not from the word
// "section" in a bullet (the welder's "pipe sections" is not a Skills section).
const welder = "Tom Brennan\nEXPERIENCE\nPipe Welder, Gulf Fabricators, 2019 - Present\n- Welded pipe sections to spec on plant shutdowns\nCERTIFICATIONS\n6G";
assert.equal(semanticMissingDisposition({ path: "section_review.Skills.missing", value: "Section not present.", resumeText: welder }), "supported_absence");
assert.equal(semanticMissingDisposition({ path: "section_review.Skills.missing", value: "Section not present.", resumeText: `SKILLS\nTIG, MIG\n${welder}` }), "contradicts_positive_source", "a labeled Skills section still contradicts the absence");
assert.equal(semanticMissingDisposition({ path: "section_review.Work Experience.missing", value: "Section not present.", resumeText: cv }), "supported_absence", "a CV with appointments and no dated bullets has no work experience section");
assert.equal(semanticMissingDisposition({ path: "section_review.Work Experience.missing", value: "Section not present.", resumeText: coo }), "contradicts_positive_source");
assert.equal(semanticMissingDisposition({ path: "section_review.Education.missing", value: "No education section present", resumeText: student }), "contradicts_positive_source");
passes({ section_review: { Skills: { missing: "Section not present." } } }, welder);
refuses({ section_review: { Skills: { missing: "Section not present." } } }, `SKILLS\nTIG, MIG\n${welder}`);
console.log("summary detector and section absence tests passed");

// ---- 2. Negated presence is absence, not presence ----
for (const text of ["Its dates aren't clear.", "The qualifications aren't shown here.", "The result is not stated.", "The owner isn't visible."]) {
  assert.equal(narrativeTokenPolicy(text, "assessment", false, false).assertsPresence, false, text);
}
for (const text of ["Its dates are clear.", "The qualifications are shown here.", "SQL ownership is explicit."]) {
  assert.equal(narrativeTokenPolicy(text, "assessment", false, false).assertsPresence, true, text);
}
assert.equal(narrativeTokenPolicy("For a role with explicit retention targets, it leaves an important comparison unanswered.", "assessment", false, false).assertsPresence, false,
  "'explicit' before a noun describes the posting; only the predicate asserts presence");
passes({ first_impression: "The nursing job calls for a different set of qualifications that aren't shown here." }, analyst, nursing);
passes({ first_impression: "The freelance work introduces a second direction, but its dates and relationship to your current job aren't clear." },
  "Shift Supervisor, Saguaro Market, 2022 - Present\n- Supervise cashiers and stockers on evening shifts\nFreelance website development");
refuses({ first_impression: "Your Epic certification is shown here." }, analyst, nursing);
refuses({ first_impression: "The nursing job calls for an Epic certification that is shown here." }, analyst, nursing);
console.log("negated presence tests passed");

// ---- 3. What the resume lacks may name the posting's terms; what it has may not ----
passes({ gaps: ["The resume does not list an RN license or BLS certification, both required for the posted role."] }, analyst, nursing);
passes({ gaps: ["The resume does not list an RN license or BLS certification, both required for the posted role."] }, analyst);
passes({ gaps: ["The resume does not list an RN license, which the posting requires."] }, analyst, nursing);
refuses({ gaps: ["Power BI dashboards are absent."] }, analyst, nursing);
refuses({ gaps: ["SQL is not shown."] }, analyst, nursing);
refuses({ strengths: ["Your RN license and BLS certification match the posting."] }, analyst, nursing);
refuses({ gaps: ["The managed $4M finance budget isn't named in the summary."] }, "Senior Finance Analyst. Managed project deliverables related to finance processes.");
passes({ gaps: ["Your $410M revenue responsibility isn't named in the opening."] }, coo);
passes({ job_alignment: { missing: ["Product usage analysis and an analysis tool such as Looker"] } }, csm, csmPosting);
refuses({ job_alignment: { missing: ["Product usage analysis and an analysis tool such as Tableau"] } }, csm, csmPosting);
passes({ next_steps: ["If you hold the required RN license or BLS certification, add their accurate details."] }, analyst, nursing);
passes({ section_review: { Skills: { fix: "Add an EHR only if you have actually used it; retain the analytics tools for analyst applications." } } }, analyst, nursing);
refuses({ next_steps: ["Add your RN license and BLS certification near the top."] }, analyst, nursing);
passes({ gaps: ["The resume doesn't state the ARR represented by your accounts, so the book cannot be compared financially with the job's approximately $4M portfolio."] }, csm, csmPosting);
refuses({ gaps: ["The resume doesn't state the ARR represented by your approximately $4M book of accounts."] }, csm, csmPosting);
refuses({ gaps: ["The resume doesn't state the ARR represented by your accounts, so the book cannot be compared with the job's approximately $9M portfolio."] }, csm, csmPosting);
refuses({ job_alignment: { strongly_aligned: ["EHR documentation"] } }, analyst, nursing);
// The missing-requirements list keeps a label that joins two of the posting's own lines.
assert.equal(evidenceContainsRequirementLabel("Acute care nursing experience or clinical rotations", nursing, { jobDescription: true }), true);
assert.equal(evidenceContainsRequirementLabel("Epic or comparable EHR", nursing, { jobDescription: true }), true);
assert.equal(evidenceContainsRequirementLabel("Acute care nursing experience or pediatric rotations", nursing, { jobDescription: true }), false);
assert.equal(evidenceContainsRequirementLabel("Epic or Cerner", nursing, { jobDescription: true }), false);
const missingList = canonicalizeOptionalReportMetadata({
  job_alignment: { jd_keywords: { matched: [], missing: ["BLS certification", "Acute care nursing experience or clinical rotations", "Epic or comparable EHR", "Cerner"], match_count: 0, total_count: 4 } },
}, analyst, { jobDescription: nursing });
assert.deepEqual((missingList.report as any).job_alignment.jd_keywords.missing, ["BLS certification", "Acute care nursing experience or clinical rotations", "Epic or comparable EHR"],
  "the posting's requirements stay; an invented one goes");
console.log("posting-aware absence tests passed");

// ---- 4. The report's own read vocabulary is not a resume fact, and anchors read word roots and aliases ----
passes({ score_plain: "The resume gives a reviewer a clear picture of your customer success work." }, csm);
refuses({ score_plain: "The resume gives a reviewer a clear picture of your Snowflake administration." }, csm);
passes({ section_review: { Education: { working: "Both degrees include schools and graduation years." } } }, socialWorker);
refuses({ section_review: { Education: { working: "Both degrees from Stanford include graduation years." } } }, socialWorker);
passes({ first_impression: "The role is clear, though the bullets leave the actual design choices largely out of view." },
  "Senior Mechanical Engineer\n- Lead mechanical design for the Arlo height-adjustable desk platform\n- Work with suppliers in Mexico and Taiwan");
passes({ job_alignment: { role_fit: { seniority_read: "The experience entries show internship and assistant-level roles." } } }, recentGrad);
refuses({ job_alignment: { role_fit: { seniority_read: "The experience entries show directorship and partner-level roles." } } }, recentGrad);
passes({ first_impression: "Your current consulting work is visible but much less specific." }, james);
passes({ summary: "Keeping both figures helps show that the COO role involves more than expansion." }, coo);
refuses({ summary: "Keeping both figures helps show that the CTO role involves more than expansion." }, coo);
passes({ biggest_gap_example: "\"Worked nights and weekends on plant shutdowns\" shows availability but not what welding work you handled during those shutdowns." },
  "Pipe Welder\n- Worked nights and weekends on plant shutdowns\n- Welded carbon steel pipe");
refuses({ first_impression: "The delivery-quality improvement is visible." }, "Improved delivery speed by 40% across two product lines.");
refuses({ first_impression: "Your plumbing work is visible but much less specific." }, james);
console.log("read vocabulary and anchor tests passed");

// ---- 5. Advice that picks one example is not a count ----
passes({ next_steps: ["Review the opening statement and move one relevant project detail into it for the roles you pursue."] }, james);
passes({ next_steps: ["Review the freelance bullets and identify one client presentation or design problem you can describe more specifically."] }, james);
passes({ top_fixes: [{ fix: "In the freelance project bullet, identify one client project and specify the work you personally provided.", why: "The bullet lists kinds of work, not an example.", evidence: { excerpt: "- Projects included website copy, email campaigns, and paid social setup", section: "Experience" } }] }, james);
refuses({ strengths: ["You completed one client project in the freelance role."] }, james);
refuses({ next_steps: ["Review the freelance bullets and identify the seven client projects you completed."] }, james);
console.log("requested example tests passed");

// ---- 6. A sentence-initial gerund or imperative is not part of a name ----
passes({ summary: "Growing Lakeshore from 38 to 140 practices while raising same-store EBITDA margin from 17% to 23% gives the COO story a useful financial dimension." }, coo);
refuses({ summary: "Growing Acme from 38 to 140 practices gives the COO story a useful financial dimension." }, coo);
passes({ summary: "Teaching Algebra II and AP Statistics alongside a self-paced Canvas module connects classroom work with digital learning design." }, teacher);
refuses({ summary: "Teaching Calculus BC alongside a self-paced Canvas module connects classroom work with digital learning design." }, teacher);
passes({ job_alignment: { positioning_suggestion: "Move DATA PROJECTS ahead of the teaching history to introduce your analytics work earlier." } },
  "Maria Lopez\nEXPERIENCE\nMathematics Teacher, Lincoln High School, 2018 - Present\nDATA PROJECTS\nStudent dashboard in Tableau");
refuses({ job_alignment: { positioning_suggestion: "Move the Kaggle Competitions section ahead of the teaching history." } },
  "Maria Lopez\nEXPERIENCE\nMathematics Teacher, Lincoln High School, 2018 - Present\nDATA PROJECTS\nStudent dashboard in Tableau");
console.log("sentence-initial word tests passed");

// ---- 7. Hyphens that join words are not minus signs or names ----
passes({ first_impression: "The up-to-250,000-page production figure is worth keeping because it gives the Relativity work a tangible scale." }, paralegal);
refuses({ first_impression: "The up-to-500,000-page production figure is worth keeping because it gives the Relativity work a tangible scale." }, paralegal);
refuses({ first_impression: "The 250,000-page production figure is worth keeping because it gives the Relativity work a tangible scale." }, paralegal);
passes(asQuestion("What had to remain working during the Marketo-to-HubSpot migration, and how did you handle it?"), james);
refuses(asQuestion("What had to remain working during the Marketo-to-Pardot migration, and how did you handle it?"), james);
console.log("hyphen tests passed");

// ---- 8. Scheduling, staffing and data conflicts are the job; a disagreement between people still needs the resume ----
passes(asQuestion("What staffing conflicts do you account for when building the kitchen schedule?"), kitchen);
passes(asQuestion("How did you coordinate dispatch between the two depots when schedules conflicted?"), paragraph);
passes(asQuestion("How did you handle conflicting policy records across the three legacy systems?"), analyst);
refuses(asQuestion("How did you resolve the conflict with the operations director?"), analyst);
refuses(asQuestion("How did you coordinate dispatch between the two depots when priorities conflicted?"), paragraph);
refuses(asQuestion("How did you handle conflicting feedback from the merchandising and finance teams?"), analyst);
console.log("conflict tests passed");

// ---- 9. "Results are absent" is the report's dimension, not a bullet that tracked results ----
const coordinator = "Marketing Coordinator\n- Managed the weekly email calendar in Mailchimp for 120,000 subscribers\n- Tracked campaign results in a monthly report for the marketing director";
passes({ score_comment_short: "The email list and event schedule give scale, but results are absent." }, coordinator);
refuses({ score_comment_short: "The email list gives scale, but Mailchimp is absent." }, coordinator);
console.log("dimension-word contradiction tests passed");

// ---- 10. A direction binding ends at its figure, even in a resume pasted without line breaks ----
passes({ summary: "Improving the on-time rate from 91% to 96% in 2024 is worth keeping prominent because it gives the dispatch work a concrete result." }, paragraph);
refuses({ summary: "Improving the on-time rate from 91% to 98% in 2024 is worth keeping prominent because it gives the dispatch work a concrete result." }, paragraph);
console.log("direction binding tests passed");

// ---- 11. A fix about repeated text may cite the text it says is repeated ----
const repeatedTitle = "Drp1 phosphorylation: a live-cell analysis in cultured fibroblasts.";
assert.deepEqual(ambiguousReportSourceLocators({ top_fixes: [{ fix: "Check the Drp1 publication entries against the original records and correct any repeated or inaccurate citation details.", evidence: { excerpt: repeatedTitle, section: "PUBLICATIONS" } }] }, cv), []);
assert.deepEqual(ambiguousReportSourceLocators({ top_fixes: [{ fix: "In the Drp1 publication, add the journal's impact factor.", evidence: { excerpt: repeatedTitle, section: "PUBLICATIONS" } }] }, cv), ["top_fixes[0].evidence.excerpt"],
  "any other fix on a line that appears more than once is still ambiguous");
assert.deepEqual(ambiguousReportSourceLocators({ rewrites: [{ original: repeatedTitle, better: repeatedTitle }] }, cv), ["rewrites[0].original"], "a rewrite never resolves a repeated line");
console.log("repeated text tests passed");

console.log("judgment wave validator tests passed");
