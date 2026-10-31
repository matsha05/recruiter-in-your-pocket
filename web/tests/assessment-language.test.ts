import assert from "node:assert/strict";
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
    // Live eval eval_1793463459213: a fair seniority read of a recent graduate was rejected, so no report shipped.
    { claim: 'The resume shows an entry-level operations direction, but gives a reviewer limited detail for comparing your work with an opening.', source: 'Recent business graduate aiming to start a career in operations management. Operations Assistant, Greenfield Logistics. Intern - Operations Department, MetroRetail Inc. Was responsible for assisting with daily operational tasks.' },
    { claim: 'The page reads as early-career operations work.', source: 'Recent graduate. Operations intern. Coordinated schedules.' },
    { claim: 'The resume reads at a mid-level for analytics roles.', source: 'Data Analyst, 2019 to 2024. Built weekly dashboards.' },
    // Same live run: a sentence-initial "Using" was read as part of the product name "Using Microsoft Office".
    { claim: 'Using Microsoft Office to create reports and presentations connects a named tool to actual documents.', source: 'Campus Events Office, University of Illinois. Used Microsoft Office tools to create reports and presentations.' },
    // Fresh confirmation run, same fixture: "would" was missing from the advice modals ("could help show" passed).
    { claim: 'A reviewer can see your interest in operations but may have trouble comparing your work with a particular opening. More specific descriptions would help show what you handled.', source: 'Recent business graduate aiming to start a career in operations management. Operations Assistant. Was responsible for assisting with daily operational tasks.' },
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
];
for (const c of positiveCases)
    assert.equal(auditReportNarrative({ summary: c.claim }, c.source).length, 0, JSON.stringify(c));
for (const c of negativeCases)
    assert.ok(auditReportNarrative({ summary: c.claim }, c.source).length > 0, JSON.stringify(c));
console.log("assessment language fidelity tests passed");
