import assert from "node:assert/strict";
import { assertReportGrounding, ResumeFeedbackResponseSchema } from "../lib/validation/schemas";
import { hubspotSource, schemaValidReport, unsafePublicClaim } from "./helpers/report-fidelity-fixture";

const roleReport = (field: "best_fit_roles" | "stretch_roles", role: string) => {
  const report = structuredClone(schemaValidReport);
  report.job_alignment.role_fit[field][0] = role;
  const result = ResumeFeedbackResponseSchema.safeParse(report);
  assert.equal(result.success, true, `${field} ${role} probe must remain schema-valid`);
  return result.data;
};

const adversarialReport = roleReport("best_fit_roles", unsafePublicClaim);
const adversarialGrounding = assertReportGrounding(adversarialReport, hubspotSource);
assert.equal(adversarialGrounding.ok, false, "an unbound rendered role must fail grounding");
assert.ok(
  adversarialGrounding.inventedSpecifics.some((issue) => issue.includes("job_alignment.role_fit.best_fit_roles[0]")),
  "the grounding error must identify the rendered best-fit role",
);

const roleJobDescription = "We are hiring a Salesforce Administrator.";
assert.equal(
  assertReportGrounding(adversarialReport, hubspotSource, roleJobDescription).ok,
  true,
  "a best-fit role may be grounded independently in the job description",
);
const splitRoleGrounding = assertReportGrounding(
  adversarialReport,
  `${hubspotSource}\nSalesforce platform work.`,
  "We need an Administrator for the business systems team.",
);
assert.equal(splitRoleGrounding.ok, false, "role tokens split between sources must not be concatenated");
assert.ok(
  splitRoleGrounding.inventedSpecifics.some((issue) => issue.includes("job_alignment.role_fit.best_fit_roles[0]")),
  "the split-provenance error must identify the rendered best-fit role",
);

const compositeRoleJobDescription = "Salesforce platform experience is preferred. The Workday Administrator owns HR systems.";
const fragmentedRoleJobDescription = "Salesforce platform expertise.\nWorkday Administrator owns HR systems.";
for (const field of ["best_fit_roles", "stretch_roles"] as const) {
  for (const role of [
    "Salesforce. Administrator",
    "Salesforce; Administrator",
    "Salesforce / Administrator",
    "Salesforce—Administrator",
  ]) {
    const report = roleReport(field, role);
    assert.equal(
      assertReportGrounding(report, hubspotSource, fragmentedRoleJobDescription).ok,
      false,
      `${field} must require the full punctuated role in one evidence segment`,
    );
    assert.equal(
      assertReportGrounding(report, hubspotSource, "Primary role: Salesforce Administrator. Own CRM systems.").ok,
      true,
      `${field} candidate punctuation may ground in one ordered source phrase`,
    );
  }

  const abbreviatedReport = roleReport(field, "Sr. Salesforce Administrator");
  assert.equal(
    assertReportGrounding(abbreviatedReport, hubspotSource, "Primary role: Sr. Salesforce Administrator.").ok,
    true,
    `${field} must retain recognized title abbreviations inside one segment`,
  );
  assert.equal(
    assertReportGrounding(
      abbreviatedReport,
      hubspotSource,
      "Primary role: Sr. Salesforce platform lead. Workday Administrator owns HR systems.",
    ).ok,
    false,
    `${field} must not join an abbreviation to another clause's role tokens`,
  );

  const invertedReport = roleReport(field, "Administrator, Salesforce");
  assert.equal(
    assertReportGrounding(invertedReport, hubspotSource, "Primary role: Administrator, Salesforce. Own CRM systems.").ok,
    true,
    `${field} must allow an explicitly inverted role`,
  );
  assert.equal(
    assertReportGrounding(invertedReport, hubspotSource, "Primary role: Salesforce Administrator. Own CRM systems.").ok,
    false,
    `${field} role grounding must preserve token order`,
  );
}

const symbolRoleCases = [
  { candidate: "C++ Developer", exact: "Primary role: C++ Developer.", collision: "Primary role: C# Developer." },
  { candidate: "C# Developer", exact: "Primary role: C# Developer.", collision: "Primary role: F# Developer." },
  { candidate: "F# Engineer", exact: "Primary role: F# Engineer.", collision: "Primary role: F Engineer." },
  { candidate: ".NET Developer", exact: "Primary role: .NET Developer.", collision: "Primary role: NET Developer." },
  { candidate: "R&D Analyst", exact: "Primary role: R&D Analyst.", collision: "Primary role: RD Analyst." },
  { candidate: "A/B Testing Lead", exact: "Primary role: A/B Testing Lead.", collision: "Primary role: AB Testing Lead." },
  { candidate: "Node.js Developer", exact: "Primary role: Node.js Developer.", collision: "Primary role: Nodejs Developer." },
] as const;
for (const field of ["best_fit_roles", "stretch_roles"] as const) {
  for (const { candidate, exact, collision } of symbolRoleCases) {
    const report = roleReport(field, candidate);
    assert.equal(
      assertReportGrounding(report, hubspotSource, exact).ok,
      true,
      `${field} must preserve the exact symbol identity for ${candidate}`,
    );
    const collisionGrounding = assertReportGrounding(report, hubspotSource, collision);
    assert.equal(collisionGrounding.ok, false, `${field} must not collide ${candidate} with ${collision}`);
    assert.ok(
      collisionGrounding.inventedSpecifics.some((issue) => issue.includes(`job_alignment.role_fit.${field}[0]`)),
      `${field} collision must identify its rendered field`,
    );
  }

  for (const [candidate, normalizedSource] of [
    ["Ｃ＋＋ Developer", "Primary role: C++ Developer."],
    ["C♯ Developer", "Primary role: C# Developer."],
    ["De\u0301veloppeur .NET", "Primary role: Développeur .NET."],
  ] as const) {
    const report = roleReport(field, candidate);
    assert.equal(
      assertReportGrounding(report, hubspotSource, normalizedSource).ok,
      true,
      `${field} must apply compatibility and canonical Unicode normalization`,
    );
  }
}

for (const field of ["best_fit_roles", "stretch_roles"] as const) {
  const compositeReport = roleReport(field, unsafePublicClaim);
  const compositeGrounding = assertReportGrounding(compositeReport, hubspotSource, compositeRoleJobDescription);
  assert.equal(compositeGrounding.ok, false, `an unordered token bag must not manufacture a ${field} role`);
  assert.ok(
    compositeGrounding.inventedSpecifics.some((issue) => issue.includes(`job_alignment.role_fit.${field}[0]`)),
    `the composite ${field} error must identify the rendered field`,
  );
  assert.equal(
    assertReportGrounding(
      compositeReport,
      hubspotSource,
      compositeRoleJobDescription.replace(". The", ".\nThe"),
    ).ok,
    false,
    `newline formatting must not change the composite ${field} verdict`,
  );

  const fabricatedReport = roleReport(field, "Workday Administrator");
  const fabricatedGrounding = assertReportGrounding(fabricatedReport, hubspotSource, roleJobDescription);
  assert.equal(fabricatedGrounding.ok, false, `a ${field} role absent from both sources must fail`);
  assert.ok(
    fabricatedGrounding.inventedSpecifics.some((issue) => issue.includes(`job_alignment.role_fit.${field}[0]`)),
    `the fabricated ${field} error must identify the rendered field`,
  );

  for (const jobDescription of [
    "Primary role: Salesforce / Administrator; owns CRM systems.",
    "Primary role: Salesforce-Administrator; owns CRM systems.",
    "Primary role: Salesforce—Administrator; owns CRM systems.",
    "Role overview\nSalesforce Administrator\nOwn CRM systems.",
    "Role overview • Salesforce Administrator • Own CRM systems.",
  ]) {
    assert.equal(
      assertReportGrounding(compositeReport, hubspotSource, jobDescription).ok,
      true,
      `${field} legitimate evidence must survive punctuation and layout formatting`,
    );
  }
}

console.log("report role fidelity tests passed");
