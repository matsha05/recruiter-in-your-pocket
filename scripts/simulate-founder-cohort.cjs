const participants = [
  { id: 1, segment: "Senior product manager, targeted role", completed: true, trustedChange: true, generic: false, returned: true, wouldPay: true, termsUnderstood: true, friction: "None" },
  { id: 2, segment: "Senior engineer, targeted role", completed: true, trustedChange: true, generic: false, returned: true, wouldPay: true, termsUnderstood: true, friction: "Wants deeper technical-role calibration" },
  { id: 3, segment: "Career changer", completed: true, trustedChange: true, generic: false, returned: true, wouldPay: false, termsUnderstood: null, friction: "Needs stronger transferability guidance" },
  { id: 4, segment: "New graduate, thin resume", completed: true, trustedChange: true, generic: false, returned: false, wouldPay: false, termsUnderstood: null, friction: "Limited evidence constrains the report" },
  { id: 5, segment: "Operations manager, broad resume", completed: true, trustedChange: true, generic: false, returned: true, wouldPay: true, termsUnderstood: true, friction: "None" },
  { id: 6, segment: "Marketing director, strong resume", completed: true, trustedChange: true, generic: false, returned: true, wouldPay: true, termsUnderstood: true, friction: "Wants a stronger role-comparison summary" },
  { id: 7, segment: "Executive, dense two-page resume", completed: true, trustedChange: false, generic: true, returned: false, wouldPay: false, termsUnderstood: null, friction: "Advice may flatten executive scope" },
  { id: 8, segment: "Hourly operations candidate, mobile only", completed: false, trustedChange: false, generic: false, returned: false, wouldPay: false, termsUnderstood: null, friction: "File retrieval and upload abandonment" },
  { id: 9, segment: "Privacy-sensitive applicant, paste flow", completed: true, trustedChange: true, generic: false, returned: false, wouldPay: false, termsUnderstood: null, friction: "Reads every data-handling disclosure" },
  { id: 10, segment: "Career coach, power evaluator", completed: true, trustedChange: true, generic: false, returned: true, wouldPay: true, termsUnderstood: true, friction: "Wants clearer evidence provenance" },
  { id: 11, segment: "Designer with portfolio-led story", completed: true, trustedChange: false, generic: true, returned: false, wouldPay: false, termsUnderstood: null, friction: "Resume-only evidence misses portfolio context" },
  { id: 12, segment: "Sales manager, targeted role", completed: true, trustedChange: true, generic: false, returned: true, wouldPay: true, termsUnderstood: true, friction: "None" },
  { id: 13, segment: "Financial analyst, strong metrics", completed: true, trustedChange: true, generic: false, returned: false, wouldPay: false, termsUnderstood: null, friction: "One recommendation feels obvious" },
  { id: 14, segment: "International resume, unusual formatting", completed: false, trustedChange: false, generic: false, returned: false, wouldPay: false, termsUnderstood: null, friction: "Parser failure before paste fallback" },
  { id: 15, segment: "Resume novice, no target role", completed: true, trustedChange: true, generic: false, returned: false, wouldPay: false, termsUnderstood: null, friction: "Needs help deciding which fix to start with" },
  { id: 16, segment: "Active applicant comparing revisions", completed: true, trustedChange: true, generic: false, returned: true, wouldPay: true, termsUnderstood: true, friction: "None" },
  { id: 17, segment: "Skeptical ChatGPT comparison user", completed: true, trustedChange: true, generic: false, returned: false, wouldPay: false, termsUnderstood: null, friction: "Questions whether the judgment is worth paying for" },
  { id: 18, segment: "Mobile-only mid-career applicant", completed: true, trustedChange: true, generic: false, returned: false, wouldPay: false, termsUnderstood: null, friction: "Long report requires disciplined navigation" },
  { id: 19, segment: "Technical manager, dense role history", completed: true, trustedChange: true, generic: false, returned: true, wouldPay: true, termsUnderstood: true, friction: "None" },
  { id: 20, segment: "Long-tenured generalist, untargeted resume", completed: true, trustedChange: false, generic: true, returned: false, wouldPay: false, termsUnderstood: null, friction: "Broad input produces broad advice" },
];

function percentage(numerator, denominator) {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function summarize(rows = participants) {
  const completed = rows.filter((row) => row.completed);
  const paidIntent = completed.filter((row) => row.wouldPay);
  const counts = {
    invited: rows.length,
    completed: completed.length,
    trustedChange: completed.filter((row) => row.trustedChange).length,
    generic: completed.filter((row) => row.generic).length,
    returned: completed.filter((row) => row.returned).length,
    wouldPay: paidIntent.length,
    termsUnderstood: paidIntent.filter((row) => row.termsUnderstood).length,
    severeDefects: 0,
  };

  const metrics = {
    completionRate: percentage(counts.completed, counts.invited),
    trustedChangeRate: percentage(counts.trustedChange, counts.completed),
    genericRate: percentage(counts.generic, counts.completed),
    returnRate: percentage(counts.returned, counts.completed),
    willingnessToPayRate: percentage(counts.wouldPay, counts.completed),
    paidTermsComprehensionRate: percentage(counts.termsUnderstood, counts.wouldPay),
  };

  const gates = {
    completion: metrics.completionRate >= 80,
    trustedChange: metrics.trustedChangeRate >= 70,
    generic: metrics.genericRate < 10,
    returnUse: metrics.returnRate >= 30,
    paidTerms: metrics.paidTermsComprehensionRate === 100,
    severeDefects: counts.severeDefects === 0,
  };

  return {
    model: "Synthetic decision rehearsal, not observed user data or a forecast",
    counts,
    metrics,
    gates,
    expansionDecision: Object.values(gates).every(Boolean) ? "MODELED GO" : "MODELED NO-GO",
  };
}

function renderMarkdown(rows = participants) {
  const result = summarize(rows);
  const status = (value) => (value ? "PASS" : "FAIL");
  const lines = [
    "# Synthetic Founder Cohort Rehearsal",
    "",
    `> ${result.model}.`,
    "",
    `**Expansion decision:** ${result.expansionDecision}`,
    "",
    "| Metric | Modeled result | Gate | Status |",
    "|:--|--:|--:|:--|",
    `| First-report completion | ${result.metrics.completionRate}% (${result.counts.completed}/${result.counts.invited}) | >= 80% | ${status(result.gates.completion)} |`,
    `| Trusted specific change | ${result.metrics.trustedChangeRate}% (${result.counts.trustedChange}/${result.counts.completed}) | >= 70% | ${status(result.gates.trustedChange)} |`,
    `| Output described as generic | ${result.metrics.genericRate}% (${result.counts.generic}/${result.counts.completed}) | < 10% | ${status(result.gates.generic)} |`,
    `| Returned with revision or second role | ${result.metrics.returnRate}% (${result.counts.returned}/${result.counts.completed}) | >= 30% | ${status(result.gates.returnUse)} |`,
    `| Willing to buy the pass | ${result.metrics.willingnessToPayRate}% (${result.counts.wouldPay}/${result.counts.completed}) | Learn, no launch gate | INFO |`,
    `| Paid terms understood | ${result.metrics.paidTermsComprehensionRate}% (${result.counts.termsUnderstood}/${result.counts.wouldPay}) | 100% | ${status(result.gates.paidTerms)} |`,
    `| Severe trust defect | ${result.counts.severeDefects} | 0 | ${status(result.gates.severeDefects)} |`,
    "",
    "## Participant-level assumptions",
    "",
    "| # | Segment | Complete | Trusted change | Generic | Return | Buy | Primary friction |",
    "|--:|:--|:--:|:--:|:--:|:--:|:--:|:--|",
    ...rows.map((row) => `| ${row.id} | ${row.segment} | ${row.completed ? "Yes" : "No"} | ${row.trustedChange ? "Yes" : "No"} | ${row.generic ? "Yes" : "No"} | ${row.returned ? "Yes" : "No"} | ${row.wouldPay ? "Yes" : "No"} | ${row.friction} |`),
    "",
    "## Read",
    "",
    "The modeled funnel clears activation, trusted-action, return-use, payment-comprehension, and safety thresholds. It does not clear the generic-output threshold. The most likely expansion blocker after engineering hardening is report calibration for executive, portfolio-led, and broadly targeted resumes.",
  ];

  return lines.join("\n");
}

if (require.main === module) {
  if (process.argv.includes("--json")) console.log(JSON.stringify(summarize(), null, 2));
  else console.log(renderMarkdown());
}

module.exports = { participants, renderMarkdown, summarize };
