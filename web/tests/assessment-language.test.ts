import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { auditReportNarrative } from "../lib/llm/source-fidelity";
import { narrativeTokenPolicy } from "../lib/llm/narrative-token-policy";
for (const text of ['Other bullets leave your contribution or the resulting work less clear.', 'The market-share claim would be easier to evaluate if it distinguished relative growth from percentage-point change.', 'The result is not as clear.'])
    assert.equal(narrativeTokenPolicy(text, 'assessment', false, false).assertsPresence, false, text);
for (const text of ['The resume shows SQL ownership.', 'The resume makes SQL ownership clear.', 'Your contribution is less clear, but the resume shows SQL ownership.', 'The resume points to SQL ownership.', 'SQL ownership is explicit.', "The page doesn't yet show your contributions and clearly shows SQL ownership.", 'The page does not yet show your contributions and clearly shows SQL ownership.'])
    assert.equal(narrativeTokenPolicy(text, 'assessment', false, false).assertsPresence, true, text);
const positiveCases = [
    { claim: 'The descriptions make the work settings clear, but not always what you did within them.', source: 'Operations Assistant at Greenfield Logistics. Operations internship at MetroRetail. Coordinated campus event logistics.' },
    { claim: 'The description makes the work setting clear.', source: 'Supported logistics operations.' },
    { claim: 'The resume shows SQL reporting.', source: 'No SQL errors occurred during report generation.' },
    { claim: 'The resume shows SQL reporting.', source: 'Built SQL reports without supervision.' },
    { claim: 'The resume shows SQL reporting.', source: 'Built SQL reports without errors.' },
    { claim: 'The resume shows SQL reporting.', source: 'Built SQL reports with no downtime.' },
    { claim: 'The resume shows SQL reporting.', source: 'Built reports in SQL, not Excel.' },
    { claim: 'The resume shows ownership of SQL systems.', source: 'Owned SQL systems. No Excel experience.' },
    { claim: 'The resume shows SQL reporting.', source: 'No SQL experience in the first role. Built weekly SQL reports in the second role.' },
    { claim: "The page doesn't yet show what you handled within it.", source: 'Supported customer projects.' },
    { claim: 'The page does not yet show what you handled within it.', source: 'Supported customer projects.' },
    { claim: 'The page doesn’t show what you handled within it.', source: 'Supported customer projects.' },
    { claim: 'The page does not show what you handled within it.', source: 'Supported customer projects.' },
    { claim: 'Other bullets leave your contribution or the resulting work less clear.', source: 'Supported customer projects and coordinated product requirements. Presented product priorities to the leadership team.' },
    { claim: 'The market-share claim would be easier to evaluate if it distinguished relative growth from percentage-point change.', source: 'Expanded market share by 18% in fintech and healthcare.' },
    { claim: 'The market-share claim would be easier to evaluate if it distinguished relative growth from percentage–point change.', source: 'Expanded market share by 18% in fintech and healthcare.' },
    { claim: 'The reporting details are less clear.', source: 'Prepared weekly reports for the manager.' },
    { claim: 'The reporting details are not as clear.', source: 'Prepared weekly reports for the manager.' },
    // Live eval eval_1793463473819: a fair seniority read of a recent graduate was rejected, so no report shipped.
    { claim: 'The resume shows an entry-level operations direction, but gives a reviewer limited detail for comparing your work with an opening.', source: 'Recent business graduate aiming to start a career in operations management. Operations Assistant, Greenfield Logistics. Intern - Operations Department, MetroRetail Inc. Was responsible for assisting with daily operational tasks.' },
    { claim: 'The page reads as early-career operations work.', source: 'Recent graduate. Operations intern. Coordinated schedules.' },
    { claim: 'The resume reads at a mid-level for analytics roles.', source: 'Data Analyst, 2019 to 2024. Built weekly dashboards.' },
    // Same live run: a sentence-initial "Using" was read as part of the product name "Using Microsoft Office".
    { claim: 'Using Microsoft Office to create reports and presentations connects a named tool to actual documents.', source: 'Campus Events Office, University of Illinois. Used Microsoft Office tools to create reports and presentations.' },
    // Fresh confirmation run, same fixture: "would" was missing from the advice modals ("could help show" passed).
    { claim: 'A reviewer can see your interest in operations but may have trouble comparing your work with a particular opening. More specific descriptions would help show what you handled.', source: 'Recent business graduate aiming to start a career in operations management. Operations Assistant. Was responsible for assisting with daily operational tasks.' },
    // Live evals eval_1793553133997 to eval_1793560274286: grounded reports withheld after repair.
    // Removing the tracked "lead" from "team-lead" left an unmatched "team-".
    { claim: 'The mix of delivery and mentoring fits the senior and team-lead titles shown.', source: 'Senior Data Scientist & Team Lead. I mentored 5 junior data scientists.' },
    // "Naming", like "Using", was read as part of the product name "Naming Microsoft Office".
    { claim: 'Naming Microsoft Office for reports and presentations tells a reviewer which tool you used for those tasks.', source: 'Campus Events Office, University of Illinois. Used Microsoft Office tools to create reports and presentations.' },
    // The report's audience is not a resume fact.
    { claim: 'The resume gives a reader a starting point, but leaves substantial questions about your recent activity and day-to-day work.', source: 'Operations Assistant, Greenfield Logistics. Duties included maintaining records and updating reports.' },
    // A degree abbreviation names the degree the resume spells out.
    { claim: 'The MBA lists the University of Washington and a project management focus; the BS lists Virginia Military Institute.', source: 'Master of Business Administration (MBA), Project Management Focus. University of Washington. Bachelor of Science, Business Administration. Virginia Military Institute.' },
    // eval_1793560808592: "practice" is the resume's "Practicing" for the presence anchor.
    { claim: 'That description makes your role in the practice visible, but it does not describe the financial work you performed.', source: 'Practicing Certified Public Accountant as managing partner or sole practioner, always self-employed.' },
    // eval_1793567853525 (production prompt): "less developed" describes a quality, not work done.
    { claim: 'Your mentoring and rotation responsibilities are visible but less developed.', source: 'Mentor 3 engineers and run the payments on-call rotation. Designed and led the migration of card authorization.' },
    // Same run: "beyond one team" compares with the resume's own count of five teams.
    { claim: 'The Dovetail repository used by 5 product teams shows that your work reached beyond one team.', source: 'Built a research repository in Dovetail used by 5 product teams.' },
    // eval_1793569149611: a sentence-initial "Connect" was read as part of "Connect Storyline".
    { claim: 'Connect Storyline or Camtasia to a real piece of work elsewhere in the resume, if applicable.', source: 'Articulate Storyline 360 workshop, 2025. Canvas, Articulate Storyline, Camtasia, Google Classroom.' },
    // Same run: a clause about the reader is not a resume fact.
    { claim: 'You supported HR at a 400-employee plant across three shifts, which helps a reader picture the workforce.', source: 'Supported HR for a plant of 400 employees across three shifts.' },
    // Same run: "tasks" is a generic word for duties.
    { claim: 'Relevant support tasks are visible, but most lack detail about the work.', source: 'IT Help Desk Intern. Answered help desk tickets from teachers and staff. IT support specialist with help desk experience.' },
    // eval_1793570741684 (final v3 golden): a connective, a ", though" clause, and an outcome noun.
    { claim: 'You managed 17 Recruiters and Sourcers at Meta and contributed to an initiative tied to 1,000+ ML Gen hires.', source: "Managed a team of 17 Recruiters and Sourcers at Meta. Played a pivotal role in Boom of Funnel (BoF) initiatives, contributing to 1,000+ ML Gen hires. Implemented strategic talent identification and alignment processes to support the organization's mission and growth." },
    { claim: 'Recent work includes clear reach and growth, though some leadership details remain unstated.', source: 'Expanded small-group ministry from six to eighteen active groups.' },
    // eval_1793571168922 (final v3 blind-pick run), and a regression the ", though" split briefly caused.
    { claim: 'You come across as a data analyst working across sales, inventory and store operations. The weekly Tableau dashboards are a useful anchor, though their reach isn\'t clear.', source: 'Data Analyst, Lakeshore Grocers. Build weekly sales and inventory dashboards in Tableau for regional managers. Work with store operations on labor planning data.' },
    { claim: 'The titles and duties point to a generalist-level background.', source: 'HR Generalist, Northstar Plastics. HR Assistant, Northstar Plastics.' },
];
const negativeCases = [
    { claim: 'The description clearly shows SQL ownership.', source: 'No SQL experience. Built reports in Excel.' },
    { claim: 'The description clearly shows a team of 500 engineers.', source: 'Worked with an engineering team.' },
    { claim: 'The descriptions show $9M in revenue.', source: 'Prepared weekly reports for the manager.' },
    { claim: 'Owned SQL reporting described in the resume.', source: 'Assisted the manager with reports in Excel.' },
    { claim: 'The resume shows SQL reporting.', source: 'Lacks experience using SQL. Built reports in Excel.' },
    { claim: 'The resume shows SQL reporting.', source: 'Cannot use SQL. Built reports in Excel.' },
    { claim: 'The resume shows SQL reporting.', source: 'SQL was excluded from my responsibilities. Built reports in Excel.' },
    { claim: 'The resume shows ownership of SQL systems.', source: 'No SQL experience. Built reports in Excel.' },
    { claim: "The page doesn't yet show your contributions, but shows ownership of SQL systems.", source: 'No SQL experience. Built reports in Excel.' },
    { claim: "The page doesn't yet show your contributions and clearly shows ownership of SQL systems.", source: 'No SQL experience. Built reports in Excel.' },
    { claim: "The page doesn't yet show your contributions, but shows ownership of SQL systems.", source: 'Built reports in Excel.' },
    { claim: "The page doesn't yet show your contributions and clearly shows ownership of SQL systems.", source: 'Built reports in Excel.' },
    { claim: 'The page does not yet show your contributions and clearly shows ownership of SQL systems.', source: 'Built reports in Excel.' },
    { claim: "The page doesn't yet show your contributions and names revenue of $9M.", source: 'Prepared weekly reports.' },
    { claim: 'Generated resulting revenue growth of 18%.', source: 'Prepared weekly reports for the manager.' },
    { claim: 'The resume shows clear SQL ownership.', source: 'No SQL experience. Built reports in Excel.' },
    { claim: 'Your contribution is less clear, but the resume shows SQL ownership.', source: 'No SQL experience. Built reports in Excel.' },
    { claim: 'The resume points to SQL ownership.', source: 'No SQL experience. Built reports in Excel.' },
    { claim: 'The work is less clear after generating $9M in revenue.', source: 'Prepared weekly reports for the manager.' },
    { claim: 'The percentage-point increase of 18% shows a result.', source: 'Expanded market share by 8%.' },
    { claim: 'Clear ownership of a team of 45 engineers is shown.', source: 'Worked with an engineering team.' },
    { claim: 'The resume shows SQL ownership clearly.', source: 'No SQL experience. Built reports in Excel.' },
    // Paired controls: seniority words never launder invented scope, duties, or titles.
    { claim: 'Promoted to entry-level supervisor of a 12-person team.', source: 'Operations intern. Coordinated schedules.' },
    { claim: 'The resume shows director-level ownership of a $5M budget.', source: 'Operations assistant. Maintained records.' },
    { claim: 'Handled data entry for 40 clients.', source: 'Maintained records and updated reports.' },
    { claim: 'The resume shows junior analyst experience.', source: 'Operations assistant. Maintained records.' },
    { claim: 'Using Salesforce to track renewals connects a named tool to actual documents.', source: 'Used Microsoft Office tools to create reports and presentations.' },
    { claim: 'Using Microsoft Dynamics to create reports connects a named tool to actual documents.', source: 'Used Microsoft Office tools to create reports and presentations.' },
    { claim: 'Your migration would have saved $2M in annual costs.', source: 'Supported a system migration. Updated reports.' },
    { claim: 'Leading the 12-person Salesforce rollout would help show what you handled.', source: 'Supported a system migration. Updated reports.' },
    // Paired controls for the live fixes above: the new allowances never admit an unsourced fact.
    { claim: 'The mix of delivery and mentoring fits the senior and team-lead titles shown.', source: 'Data Analyst. Built weekly dashboards.' },
    { claim: 'Naming Salesforce for reports and presentations tells a reviewer which tool you used for those tasks.', source: 'Used Microsoft Office tools to create reports and presentations.' },
    { claim: 'Naming Microsoft Dynamics for reports tells a reviewer which tool you used.', source: 'Used Microsoft Office tools to create reports and presentations.' },
    { claim: 'The resume gives a reader 40 hires to compare.', source: 'Operations Assistant. Duties included maintaining records and updating reports.' },
    { claim: 'You coached 30 readers in a literacy program.', source: 'Operations Assistant. Duties included maintaining records and updating reports.' },
    { claim: 'The result is worth keeping because it shows $4M in savings.', source: 'Operations Assistant. Duties included maintaining records and updating reports.' },
    { claim: 'The BA lists Virginia Military Institute.', source: 'Bachelor of Science, Business Administration. Virginia Military Institute.' },
    { claim: 'The MBA lists the University of Washington.', source: 'Bachelor of Science, Business Administration. University of Washington.' },
    { claim: 'The PhD lists Virginia Military Institute.', source: 'Bachelor of Science, Business Administration. Virginia Military Institute.' },
    { claim: 'That description makes your role in the practice visible.', source: 'Data Analyst. Built weekly dashboards.' },
    { claim: 'The resume makes your mentoring visible.', source: 'Managed the department budget.' },
    { claim: 'Your work reached beyond one team.', source: 'Built a research repository in Dovetail for the team.' },
    { claim: 'Your work reached beyond one team of 12 engineers.', source: 'Built a research repository in Dovetail used by 5 product teams.' },
    { claim: 'Less experienced engineers relied on the Rust compiler you built.', source: 'Mentor 3 engineers. Built the invoicing API in Kotlin.' },
    { claim: 'Developed a Rust compiler for the payments team.', source: 'Mentor 3 engineers and run the payments on-call rotation.' },
    { claim: 'Connect Salesforce or Camtasia to a real piece of work elsewhere in the resume.', source: 'Canvas, Articulate Storyline, Camtasia, Google Classroom.' },
    { claim: 'You supported HR at a 900-employee plant across three shifts, which helps a reader picture the workforce.', source: 'Supported HR for a plant of 400 employees across three shifts.' },
    { claim: 'You led the HR migration, which helps a reader see the $2M you saved.', source: 'Supported HR for a plant of 400 employees across three shifts.' },
    { claim: 'Relevant SQL tasks are visible.', source: 'IT Help Desk Intern. Answered help desk tickets from teachers and staff.' },
    { claim: 'You managed 17 Recruiters at Meta and contributed to an initiative tied to 5,000+ ML Gen hires.', source: 'Managed a team of 17 Recruiters and Sourcers at Meta. Played a pivotal role in Boom of Funnel (BoF) initiatives, contributing to 1,000+ ML Gen hires.' },
    { claim: 'Recent work includes clear growth, though some leadership details remain unstated.', source: 'Led weekly small-group ministry meetings for active groups.' },
    { claim: 'The resume shows clear revenue growth, though the team size is unstated.', source: 'Expanded small-group ministry from six to eighteen active groups.' },
    { claim: 'The titles and duties point to an aerospace background.', source: 'HR Generalist, Northstar Plastics. HR Assistant, Northstar Plastics.' },
    { claim: 'You managed one team of 40 engineers.', source: 'HR Generalist, Northstar Plastics.' },
];
for (const c of positiveCases)
    assert.equal(auditReportNarrative({ summary: c.claim }, c.source).length, 0, JSON.stringify(c));
for (const c of negativeCases)
    assert.ok(auditReportNarrative({ summary: c.claim }, c.source).length > 0, JSON.stringify(c));
console.log("assessment language fidelity tests passed");

// Discovery questions. Live evals eval_1793553133997 (production prompt) and eval_1793570024387:
// "What led you to ..." was read as the factual claim "What led", and "one ... client" as a count.
const asQuestion = (question: string) => ({ ideas: { questions: [{ question, archetype: "TENSION POINT", why: "This asks for a detail the resume leaves out." }] } });
for (const c of [
  { claim: 'What led you to build the referral program with the two payroll partners?', source: 'Built a referral program with two payroll partners that sourced 9 deals.' },
  { claim: 'What led you to decide to integrate GPU-accelerated models into the FinEdge fraud pipeline?', source: 'FinEdge Analytics. I integrated GPU-accelerated deep learning models into the fraud detection pipeline.' },
  { claim: 'What did you create for one Brightpath client presentation prototype?', source: 'Brightpath Studio. Made prototypes for client presentations.' },
]) assert.equal(auditReportNarrative(asQuestion(c.claim), c.source).length, 0, JSON.stringify(c));
for (const c of [
  { claim: 'What led you to build the Salesforce referral program?', source: 'Built a referral program with two payroll partners.' },
  { claim: 'What did you create for the 40 Brightpath clients?', source: 'Brightpath Studio. Made prototypes for client presentations.' },
]) assert.ok(auditReportNarrative(asQuestion(c.claim), c.source).length > 0, JSON.stringify(c));
console.log("question fidelity tests passed");

// Possessives, examples and calendar conflicts (eval_1793571168922).
const fromPath = (report: any, source: string) => auditReportNarrative(report, source);
assert.equal(fromPath({ job_alignment: { underplayed: ['Activities led in the math department learning community'] } }, "Lead the math department's professional learning community").length, 0, "department's is the word department");
assert.ok(fromPath({ job_alignment: { underplayed: ['Activities led in the science department learning community'] } }, "Lead the math department's professional learning community").length > 0, "a different department is still unsupported");
assert.equal(fromPath({ top_fixes: [{ fix: 'Name one type of employee concern you handled.', why: 'The Northstar employee relations bullet says you handled questions but not which kinds.' }] }, 'HR Generalist, Northstar Plastics. Handled employee relations questions and investigations with the HR manager.').length, 0, "one example is not a count");
assert.equal(fromPath(asQuestion('During open enrollment, what was one employee question or problem you helped resolve, if any?'), 'Coordinated open enrollment for medical and dental benefits.').length, 0, "a question picking one example");
assert.equal(fromPath({ top_fixes: [{ fix: 'Add how much time your calendar support saved each founder.', why: 'The first freelance bullet lists the support but gives no change in scheduling time or conflicts.' }] }, 'Support three founders at early-stage companies with calendar, travel, and inbox management.').length, 0, "scheduling conflicts are calendar clashes");
assert.ok(fromPath({ top_fixes: [{ fix: 'Name the founders you supported.', why: 'This shows how you handled conflicts between the two founders.' }] }, 'Support three founders at early-stage companies with calendar, travel, and inbox management.').length > 0, "a conflict between people still needs source support");
console.log("possessive, example and calendar-conflict tests passed");

// A hypothetical example (eval_1793578314147, content writer).
const writerSource = 'Freelance Content Writer. Write blog posts, case studies, and email sequences for 6 software clients.';
assert.equal(fromPath({ score_comment_long: 'A verified result from one client project would make the recent work easier to assess.' }, writerSource).length, 0, "a hypothetical example is not a count");
assert.ok(fromPath({ score_comment_long: 'A verified result from two client projects would make the recent work easier to assess.' }, writerSource).length > 0, "a hypothetical count other than one still needs support");
assert.ok(fromPath({ score_comment_long: 'A verified result came from one client project.' }, writerSource).length > 0, "an asserted single project still needs support");
assert.ok(fromPath({ score_comment_long: 'A result from one client project that would make the recent work easier to assess is listed.' }, writerSource).length > 0, "a relative clause asserting the project still needs support");
console.log("hypothetical example tests passed");

// eval_1793553133997 (production prompt): "multidisciplinary" didn't match the resume's "multi-disciplinary".
const pmSource = 'Coordinated multi-disciplinary teams of up to 50 members, effectively translating military operational requirements into actionable civilian business processes.';
for (const c of [
  { claim: 'You coordinated multidisciplinary teams of up to 50 members while translating military operational requirements into civilian business processes.', source: pmSource },
  { claim: 'You coordinated multi-disciplinary teams of up to 50 members.', source: 'Coordinated multidisciplinary teams of up to 50 members.' },
]) assert.equal(auditReportNarrative({ strengths: [c.claim] }, c.source).length, 0, JSON.stringify(c));
for (const c of [
  { claim: 'You coordinated multidisciplinary teams of up to 90 members.', source: pmSource },
  { claim: 'You coordinated multinational teams of up to 50 members.', source: pmSource },
  { claim: 'You coordinated multi-disciplinary vendors across military procurement.', source: pmSource },
]) assert.ok(auditReportNarrative({ strengths: [c.claim] }, c.source).length > 0, JSON.stringify(c));
console.log("hyphenated spelling tests passed");

// Judge runs eval_1793576471840 (production prompt) and eval_1793576522281 / eval_1793576733207 (v3).
const gd = 'Graphic Designer, Blue Stem Creative. Designed packaging for regional food and beverage brands. Created brand identities, including logos and style guides. Prepared print-ready files for production.';
for (const [report, source] of [
  [{ first_impression: 'Your experience points toward entry-level operations work.' }, 'Operations Assistant, Greenfield Logistics. Intern - Operations Department, MetroRetail Inc.'],
  [{ score_comment_short: 'Design deliverables are clear, but project details remain thin across experience.' }, gd],
  [{ summary: 'The design bullets offer little detail about choices made on individual assignments, so your approach is less visible than the outputs.' }, gd],
  [{ gaps: ["The managed finance-process deliverables aren't named, making it difficult to understand what you delivered."] }, 'Senior Finance Analyst. Managed project deliverables related to finance processes.'],
  [{ section_review: { Education: { working: 'The degree, subject, school, and graduation year are listed clearly.' } } }, 'EDUCATION\nB.A., Communication, Ohio University, 2018'],
] as Array<[any, string]>) assert.equal(auditReportNarrative(report, source).length, 0, JSON.stringify(report));
for (const [report, source] of [
  [{ first_impression: 'Your experience points toward SQL engineering work.' }, 'Operations Assistant, Greenfield Logistics.'],
  [{ score_comment_short: 'Packaging deliverables for Coca-Cola are clear.' }, gd],
  [{ summary: 'Your Figma prototypes are less visible than the outputs.' }, gd],
  [{ gaps: ["The managed $4M finance budget isn't named in the summary."] }, 'Senior Finance Analyst. Managed project deliverables related to finance processes.'],
  [{ section_review: { Education: { working: 'The degree, subject, and honors are listed clearly.' } } }, 'EDUCATION\nB.A., Communication, Ohio University, 2018'],
] as Array<[any, string]>) assert.ok(auditReportNarrative(report, source).length > 0, JSON.stringify(report));
console.log("judge-run false rejection tests passed");

// Initialisms in the source are read whole (eval_1793578314147, civil engineer).
const engineerSource = "Megan O'Brien, P.E.\nProject Engineer\nLead design for roadway widening and intersection projects for ODOT and Franklin County\nLICENSE\nProfessional Engineer, Ohio, 2022";
assert.equal(fromPath({ summary: 'Your Ohio P.E. license helps place you at the project engineer level.' }, engineerSource).length, 0, "a P.E. in the source supports Ohio P.E.");
assert.ok(fromPath({ summary: 'Your Texas P.E. license helps place you at the project engineer level.' }, engineerSource).length > 0, "a state the source doesn't name is still unsupported");
assert.ok(fromPath({ summary: 'Your Ohio P.E. license helps place you at the project engineer level.' }, "Project Engineer\nLead design for roadway projects in Ohio").length > 0, "a P.E. the source doesn't state is still unsupported");
console.log("initialism tests passed");

// A quoted line as the subject, and suggested labels (eval_1793580600825, golden on the v3.3 candidate).
const funnelSource = "VP Talent\nRebuilt the engineering recruiting funnel, improving onsite to offer from 21 percent to 33 percent and offer acceptance from 76 percent to 89 percent.";
assert.equal(fromPath({ biggest_gap_example: '“Rebuilt the engineering recruiting funnel” reports improved offer acceptance but not candidate volume.' }, funnelSource).length, 0, "a leading quote is the line that reports");
assert.ok(fromPath({ biggest_gap_example: '“Rebuilt the engineering recruiting funnel” reports a 40% drop in cost per hire.' }, funnelSource).length > 0, "what the quoted line reports still needs support");
assert.ok(fromPath({ biggest_gap_example: '"June 2015 - August 2023" is the latest dated role at Google.' }, "HR Manager, BrightWave\nJune 2015 - August 2023").length > 0, "an employer after a quoted date still needs support");
assert.equal(fromPath({ biggest_gap_example: '"Feb 2023 - Jul 2023" is the latest relevant date range, with no later activity listed to show your current connection to operations.' }, "Operations Assistant, Greenfield\nFeb 2023 - Jul 2023").length, 0, "a quoted date described by \"is\" is still a description");
const breakSource = "HR Manager, BrightWave\nJune 2015 - August 2023";
const breakFix = (why: string) => ({ top_fixes: [{ fix: "Add one dated line covering August 2023 to today.", why }] });
assert.equal(fromPath(breakFix('After BrightWave, use a dated line such as "Career break" or "Job search and coursework" to account truthfully for the period.'), breakSource).length, 0, "a suggested sentence-case label claims nothing");
assert.ok(fromPath(breakFix('After BrightWave, use a dated line such as "Senior Director at Google" to account for the period.'), breakSource).length > 0, "a suggested title or employer is still checked");
assert.ok(fromPath(breakFix('Your resume already has a "Career break" line after BrightWave.'), breakSource).length > 0, "a label the resume is said to have still needs support");
console.log("quoted-subject and suggested-label tests passed");

// A question may open with an auxiliary (eval_1793584776603, count-check marketing director).
const candleSource = "Director of Marketing\nLumen Candle Co., Austin, TX\n- Post 3 to 5 times a week on the company Instagram, which has 2,100 followers";
const askIdea = (question: string) => ({ ideas: { questions: [{ question, archetype: "IMPROVEMENT" }] } });
assert.equal(fromPath(askIdea("Is there a verifiable change in engagement associated with the Instagram content?"), candleSource).length, 0, "Is opens a question");
assert.equal(fromPath(askIdea("Has the Instagram content changed engagement in a way you can verify?"), candleSource).length, 0, "Has opens a question");
assert.ok(fromPath(askIdea("Is there a change in Shopify sales?"), candleSource).length > 0, "a tool the resume doesn't name is still unsupported");
console.log("question auxiliary tests passed");

// Four false rejections from the v3.4 runs (eval_1793585506553, eval_1793585516970).
const speedSource = readFileSync(path.join(process.cwd(), "../tests/resumes/golden/synth_project_manager_vp_strong_1766957014608.txt"), "utf8");
assert.equal(fromPath({ first_impression: "The delivery-speed improvement stands out, though its comparison point isn't given." }, speedSource).length, 0, "adjacent source words support a hyphenated compound");
assert.ok(fromPath({ first_impression: "The delivery-quality improvement stands out, though its comparison point isn't given." }, speedSource).length > 0, "a compound the source doesn't contain is still unsupported");
const helpDeskSource = "Office Administrator\nIT Help Desk Technician, Commonwealth Credit Union\n- Resolved an average of 25 tickets a day for 300 employees across 9 branches";
assert.equal(fromPath({ score_plain: "The earlier help desk figures provide useful detail for an IT-focused application." }, helpDeskSource).length, 0, "IT-focused needs IT in the source");
assert.ok(fromPath({ score_plain: "The earlier help desk figures provide useful detail for an SAP-focused application." }, helpDeskSource).length > 0, "SAP-focused without SAP is still unsupported");
const headedSource = "EXPERIENCE\nOffice Administrator, Riverbend Dental Group\nIT Help Desk Technician, Commonwealth Credit Union";
const headlineFix = (why: string) => ({ top_fixes: [{ fix: "Add a headline naming the role you want.", why }] });
assert.equal(fromPath(headlineFix("Above EXPERIENCE, identify whether you are targeting Office Administrator or IT Help Desk Technician."), headedSource).length, 0, "Above opens a location");
assert.ok(fromPath(headlineFix("Above Acme Dental, identify the role you want."), headedSource).length > 0, "a place the resume doesn't name is still unsupported");
const candleRoles = "Director of Marketing\n- Posted 3 to 5 times a week on the company Instagram, which has 2,100 followers\nData Entry Clerk\n- Entered 150 property records a day into the county title system";
assert.equal(fromPath({ score_plain: "The score reflects the specific workloads shown across your roles." }, candleRoles).length, 0, "how the score reads the page");
assert.ok(fromPath({ score_plain: "The score reflects the specific workloads shown across your 14 stores." }, candleRoles).length > 0, "an invented count still needs support");
console.log("v3.4 false rejection tests passed");
