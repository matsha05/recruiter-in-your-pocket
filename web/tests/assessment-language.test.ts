import assert from "node:assert/strict";
import { auditReportNarrative } from "../lib/llm/source-fidelity";
import { narrativeTokenPolicy } from "../lib/llm/narrative-token-policy";
for (const text of ['Other bullets leave your contribution or the resulting work less clear.', 'The market-share claim would be easier to evaluate if it distinguished relative growth from percentage-point change.', 'The result is not as clear.'])
    assert.equal(narrativeTokenPolicy(text, 'assessment', false, false).assertsPresence, false, text);
for (const text of ['The resume shows SQL ownership.', 'The resume makes SQL ownership clear.', 'Your contribution is less clear, but the resume shows SQL ownership.', 'The resume points to SQL ownership.', 'SQL ownership is explicit.', "The page doesn't yet show your contributions and clearly shows SQL ownership.", 'The page does not yet show your contributions and clearly shows SQL ownership.'])
    assert.equal(narrativeTokenPolicy(text, 'assessment', false, false).assertsPresence, true, text);
const positiveCases = [
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
];
const negativeCases = [
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
];
for (const c of positiveCases)
    assert.equal(auditReportNarrative({ summary: c.claim }, c.source).length, 0, JSON.stringify(c));
for (const c of negativeCases)
    assert.ok(auditReportNarrative({ summary: c.claim }, c.source).length > 0, JSON.stringify(c));
console.log("assessment language fidelity tests passed");
