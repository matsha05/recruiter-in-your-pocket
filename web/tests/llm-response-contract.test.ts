import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
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
  findAlreadySatisfiedFix,
  containsExactEvidence,
  isAcceptedAbsenceMarker,
} from "../lib/llm/grounding";
import { canonicalizeResumeReportEvidence } from "../lib/llm/evidence-canonicalizer";
import { reportSentences } from "../lib/llm/report-sentences";
import { ResumeFeedbackResponseSchema, TopFixesSchema } from "../lib/validation/resume-report-schema";
import { hasMoreCriticalMisses } from "../lib/reports/report-integrity";
import {
  buildResumeRepairMessages,
  isRepairableResumeResponseError,
} from "../lib/llm/reportRepair";
import {
  calculateCostUsd,
  estimateCostUsd,
  estimateMaximumCostUsd,
  normalizeTokenUsage,
} from "../lib/llm/cost";
import { findMechanicalCopyIssues } from "../lib/evals/checks";
import {
  getChatCompletionTuning,
  defaultReasoningEffortForModel,
  getProductionChatCompletionTuning,
  getTuningMetadata,
  increaseReasoningEffort,
  PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS,
  PRODUCTION_OPENAI_MAX_RETRIES,
  resolveOpenAIModel,
  resolveProductionOpenAIRetryLimit,
  resolveReasoningEffortForMode,
  resolveResumeRepairReasoningEffort,
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

// One to three Critical Misses, listed first. Reports saved before the flag existed still validate.
const fixAt = (critical?: boolean) => ({
  fix: "Name the reports you prepared and who used them.", why: "The Linton reporting bullet names the work but not its readers.",
  confidence: "high", evidence: { excerpt: "Prepared monthly reports", section: "Work Experience" }, impact_level: "high",
  effort: "quick", section_ref: "Work Experience", ...(critical === undefined ? {} : { critical }),
});
const topFixesField = TopFixesSchema;
assert.equal(topFixesField.safeParse([fixAt(), fixAt()]).success, true, "a legacy report without flags is valid");
assert.equal(topFixesField.safeParse([fixAt(true), fixAt(true), fixAt(false)]).success, true);
assert.equal(topFixesField.safeParse([fixAt(true), fixAt(true), fixAt(true)]).success, true, "up to three Critical Misses");
assert.equal(topFixesField.safeParse([fixAt(false), fixAt(true)]).success, false, "the first fix must be a Critical Miss");
assert.equal(topFixesField.safeParse([fixAt(true), fixAt(false), fixAt(true)]).success, false, "Critical Misses come first");
assert.equal(topFixesField.safeParse([fixAt(true), fixAt()]).success, false, "flags are all or nothing");

// The canonicalizer keeps flagged reports well formed after it drops or reorders fixes.
const flagSource = "- Prepared monthly reports for the finance team.\n- Supported the audit process.\n- Built a vendor tracking sheet.";
const flaggedFix = (fix: string, excerpt: string, critical: boolean) => ({
  fix, why: "A reviewer can't tell what this covered.", confidence: "high",
  evidence: { excerpt, section: "Work Experience" }, impact_level: "high", effort: "quick", section_ref: "Work Experience", critical,
});
const reordered = canonicalizeResumeReportEvidence({ top_fixes: [
  flaggedFix("Name the reports you prepared and who read them.", "Prepared monthly reports for the finance team.", false),
  flaggedFix("Name the audit steps you handled yourself.", "Supported the audit process.", true),
] }, flagSource);
assert.deepEqual(reordered.report.top_fixes.map((fix: any) => fix.critical), [true, false], "Critical Misses move to the front");
assert.ok(reordered.changes.includes("top_fixes.critical_reordered"));
const promoted = canonicalizeResumeReportEvidence({ top_fixes: [
  flaggedFix("Show what you built.", "Built a vendor tracking sheet.", true),
  flaggedFix("Name the reports you prepared and who read them.", "Prepared monthly reports for the finance team.", false),
] }, flagSource);
assert.equal(promoted.report.top_fixes.length, 1, "the vague Critical Miss is dropped");
assert.equal(promoted.report.top_fixes[0].critical, true, "the remaining fix becomes the Critical Miss");
assert.ok(promoted.changes.includes("top_fixes[0].critical_promoted"));
const legacy = canonicalizeResumeReportEvidence({ top_fixes: [
  { ...flaggedFix("Name the reports you prepared and who read them.", "Prepared monthly reports for the finance team.", true), critical: undefined },
] }, flagSource);
assert.equal("critical" in legacy.report.top_fixes[0] && legacy.report.top_fixes[0].critical !== undefined, false, "unflagged reports stay unflagged");

// "More than three serious problems" needs three listed Critical Misses (Matt, November 1).
const fourFixSource = flagSource + "\n- Answered vendor questions.";
const threeCritical = [
  flaggedFix("Name the reports you prepared and who read them.", "Prepared monthly reports for the finance team.", true),
  flaggedFix("Name the audit steps you handled yourself.", "Supported the audit process.", true),
  flaggedFix("Name the vendors the tracking sheet covered.", "Built a vendor tracking sheet.", true),
];
const kept = canonicalizeResumeReportEvidence({ top_fixes: threeCritical, more_critical: true }, fourFixSource);
assert.equal(kept.report.more_critical, true, "three Critical Misses can say more exist");
assert.ok(!kept.changes.includes("more_critical.cleared"));
const cleared = canonicalizeResumeReportEvidence({ top_fixes: threeCritical.slice(0, 2), more_critical: true }, fourFixSource);
assert.equal(cleared.report.more_critical, false, "fewer than three Critical Misses can't say more exist");
assert.ok(cleared.changes.includes("more_critical.cleared"));
const unsignalled = canonicalizeResumeReportEvidence({ top_fixes: threeCritical }, fourFixSource);
assert.equal("more_critical" in unsignalled.report, false, "a report without the field stays without it");
const sampleReport = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/sample-report.json"), "utf8"));
const asFlagged = (count: number) => sampleReport.top_fixes.slice(0, 3).map((fix: any, index: number) => ({ ...fix, critical: index < count }));
assert.equal(sampleReport.top_fixes.length >= 3, true, "the sample report has three fixes to flag");
assert.equal(ResumeFeedbackResponseSchema.safeParse({ ...sampleReport, top_fixes: asFlagged(3), more_critical: true }).success, true);
assert.equal(ResumeFeedbackResponseSchema.safeParse({ ...sampleReport, top_fixes: asFlagged(2), more_critical: true }).success, false,
  "the schema refuses more_critical without three Critical Misses");
assert.equal(ResumeFeedbackResponseSchema.safeParse({ ...sampleReport, top_fixes: asFlagged(1), more_critical: false }).success, true);
assert.equal(hasMoreCriticalMisses({ top_fixes: asFlagged(3), more_critical: true }), true);
assert.equal(hasMoreCriticalMisses({ top_fixes: asFlagged(2), more_critical: true }), false);
assert.equal(hasMoreCriticalMisses({ top_fixes: asFlagged(3) }), false);
assert.equal("more_critical" in RESUME_REPORT_JSON_SCHEMA.properties, false,
  "production's strict response format is unchanged; the severity check sets the flags");
assert.equal("critical" in topFixes.items.properties, false);
console.log("more-than-three tests passed");

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
    "Add the number of backend microservices you independently owned.",
    "- Independently owned several backend microservices, ensuring 99.9% uptime and improving API response times by approximately 20%.",
    "- Independently owned several backend microservices, ensuring 99.9% uptime and improving API response times by approximately 20%.",
  ),
  [],
  "a count of named things is missing when the line gives other figures but says 'several'",
);
assert.deepEqual(
  findAlreadySatisfiedFix(
    "Add the number of patients you see each day.",
    "- See 8 to 10 patients a day for cleanings, periodontal maintenance, and scaling and root planing",
    "- See 8 to 10 patients a day for cleanings, periodontal maintenance, and scaling and root planing",
  ),
  ["metric already present in cited bullet"],
  "a count the line already gives is still caught",
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
for (const instruction of [
  "In the customer-complaint bullet, name the problems you handled and the decisions you could make without a manager.",
  "Describe the deliverables you created for the launch.",
  "Explain which departments used the onboarding process.",
]) {
  assert.deepEqual(findNonActionableFix(instruction), [], "specific qualitative details are actionable without invented metrics");
}
assert.notDeepEqual(findNonActionableFix("Explain your value more clearly."), [], "general encouragement is not a concrete fact request");
// Live eval eval_1793560808592: short Critical Miss headings were dropped, so a weaker fix
// became the Critical Miss. Moving a named result and defining a measure are concrete edits.
for (const instruction of [
  "Move the Kubernetes repair-time result above the infrastructure bullets.",
  "Move the small-group expansion closer to the top.",
  "Define how you assessed product launch success rates.",
  "Move the flagship redesign's retention result above strategy responsibilities.",
]) {
  assert.deepEqual(findNonActionableFix(instruction), [], `a short heading that names its subject is actionable: ${instruction}`);
}
// eval_1793570024387: a sourcing playbook is recruiting work, and a self-paced module is learning.
const recruiterSource = "- Built a sourcing playbook for data engineering searches";
assert.deepEqual(findFixEvidenceMismatch("Add the recruiting result of your data engineering playbook.", recruiterSource, recruiterSource), []);
const teacherSource = "- Redesigned the Algebra II unit on functions into a self-paced online module in Canvas";
assert.deepEqual(findFixEvidenceMismatch("Add a learning result from the self-paced functions module.", teacherSource, teacherSource), []);
const procurementSource = "- Built a vendor playbook for procurement";
assert.deepEqual(findFixEvidenceMismatch("Add the recruiting result of your playbook.", procurementSource, procurementSource), ["cited evidence does not support the recruiting fix"]);
const salesSource = "- Closed $1.1M in new annual recurring revenue";
assert.deepEqual(findFixEvidenceMismatch("Add the training program you ran for new hires.", salesSource, salesSource), ["cited evidence does not support the training fix"]);
for (const instruction of ["Move it higher.", "Define the work better.", "Lead with your strengths."]) {
  assert.notDeepEqual(findNonActionableFix(instruction), [], `a move or define without a subject is still vague: ${instruction}`);
}
const qualitativeInstruction = "In the customer-complaint bullet, name the problems you handled and the decisions you could make without a manager.";
const qualitativeSource = "- Resolved customer complaints and processed returns.";
const qualitativeReport = canonicalizeResumeReportEvidence({ top_fixes: [{
  fix: qualitativeInstruction,
  why: "This would explain what you handled yourself and when you needed a manager.",
  evidence: { excerpt: qualitativeSource, section: "Work Experience" },
  section_ref: "Work Experience",
}] }, qualitativeSource);
assert.equal(qualitativeReport.report.top_fixes[0].fix, qualitativeInstruction,
  "useful requests for decisions must survive finalization instead of becoming generic metric placeholders");
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

import "./llm-canonicalizer-contract.test";
import "./report-canonical-copy.test";
import "./llm-calibration-contract.test";

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

const resumePromptText = fs.readFileSync(path.resolve(process.cwd(), "prompts/resume_v2.txt"), "utf8");
assert.match(
  resumePromptText,
  /Apply the 80-89 band when at least half of the important recent bullets show specific scope or outcomes/,
  "the score rubric must not demote evidence-dense resumes because a minority of bullets remain responsibility-based",
);
assert.match(
  resumePromptText,
  /do not score below 78 solely because coaching or process bullets lack outcomes/,
  "recruiting leadership scores must preserve strong quantified recruiting evidence",
);

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
for (const model of ["gpt-6.1-terra", "gpt-6.1-sol", "gpt-6-astra", "gpt-6-luna"]) {
  assert.equal(defaultReasoningEffortForModel(model), "medium");
  for (const modelId of [model, `${model}-2026-10-01`]) {
    assert.deepEqual(getProductionChatCompletionTuning(modelId, {
      reasoningEffort: "medium",
      temperature: 0.4,
    }), {
      reasoning_effort: "medium",
      verbosity: "medium",
      max_completion_tokens: 8_000,
    }, `${modelId} must use a capped reasoning request without incompatible sampling parameters`);
    const repairEffort = resolveResumeRepairReasoningEffort(modelId, "medium");
    assert.equal(repairEffort, "high");
    assert.equal(getProductionChatCompletionTuning(modelId, { reasoningEffort: repairEffort }).reasoning_effort, "high");
    assert.equal(getChatCompletionTuning(modelId, { reasoningEffort: "minimal" }).reasoning_effort, "low");
    assert.equal((getProductionChatCompletionTuning as any)(modelId, {
      reasoningEffort: "high", maxCompletionTokens: 80_000,
    }).max_completion_tokens, 8_000);
  }
}
for (const model of ["gpt-6.1-terra", "gpt-6-luna"]) {
  assert.equal(getChatCompletionTuning(model, { reasoningEffort: "none" }).reasoning_effort, "none");
}
for (const model of ["gpt-6.1-sol", "gpt-6-astra"]) {
  assert.equal(getChatCompletionTuning(model, { reasoningEffort: "none" }).reasoning_effort, "low");
}
assert.deepEqual(getChatCompletionTuning("gpt-6.2-unknown"), { temperature: 0 },
  "new family support must not assume parameters for undocumented future models");
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
assert.equal(Number.isInteger(PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS), true);
assert.ok(PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS > 0);
assert.ok(PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS <= 8_000);
assert.equal(PRODUCTION_OPENAI_MAX_RETRIES, 1);
assert.equal(resolveProductionOpenAIRetryLimit(undefined), 1);
assert.equal(resolveProductionOpenAIRetryLimit("not-a-number"), 1);
assert.equal(resolveProductionOpenAIRetryLimit(-2), 0);
assert.equal(resolveProductionOpenAIRetryLimit(0), 0);
assert.equal(resolveProductionOpenAIRetryLimit(1), 1);
assert.equal(
  resolveProductionOpenAIRetryLimit(50),
  1,
  "environment configuration must not raise the production retry ceiling",
);
assert.equal(
  getProductionChatCompletionTuning("gpt-5.6-luna", { reasoningEffort: "low" }).max_completion_tokens,
  PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS,
  "production reasoning-model requests must cap output tokens",
);
assert.equal(
  getProductionChatCompletionTuning("gpt-4o-mini", { temperature: 0 }).max_completion_tokens,
  PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS,
  "production non-reasoning-model requests must cap output tokens",
);
assert.equal(
  (getProductionChatCompletionTuning as any)("gpt-5.6-luna", {
    maxCompletionTokens: PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS * 10,
  }).max_completion_tokens,
  PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS,
  "callers must not be able to raise the production output-token ceiling",
);

const openAIBackendSource = fs.readFileSync(
  path.resolve(process.cwd(), "lib/backend/openai.ts"),
  "utf8",
);
const nonStreamingRequestSource = openAIBackendSource.slice(
  openAIBackendSource.indexOf("export async function callOpenAIChat("),
  openAIBackendSource.indexOf("export function callOpenAIChatStreamingWithUsage("),
);
const streamingRequestSource = openAIBackendSource.slice(
  openAIBackendSource.indexOf("export function callOpenAIChatStreamingWithUsage("),
);
assert.match(
  nonStreamingRequestSource,
  /getProductionChatCompletionTuning\(OPENAI_MODEL,/,
  "all non-streaming attempts, including repair and retry attempts, must use the production ceiling",
);
assert.match(
  nonStreamingRequestSource,
  /resolveProductionOpenAIRetryLimit\(process\.env\.OPENAI_MAX_RETRIES \?\? 1\)/,
  "production retry configuration must be clamped before any provider loop",
);
assert.match(
  streamingRequestSource,
  /getProductionChatCompletionTuning\(OPENAI_MODEL,/,
  "all main streaming attempts must use the production ceiling",
);
assert.doesNotMatch(
  openAIBackendSource,
  /getChatCompletionTuning\(/,
  "the production OpenAI backend must not retain an uncapped tuning path",
);
const originalModelEnv = {
  resume: process.env.OPENAI_RESUME_MODEL,
  general: process.env.OPENAI_MODEL,
};
try {
  delete process.env.OPENAI_RESUME_MODEL;
  process.env.OPENAI_MODEL = "gpt-4o-mini";
  assert.equal(resolveOpenAIModel("resume"), "gpt-6.1-terra",
    "the candidate resume default must not inherit the general-mode model");
  assert.equal(resolveOpenAIModel("linkedin"), "gpt-4o-mini");
  process.env.OPENAI_RESUME_MODEL = " gpt-5.6-terra ";
  assert.equal(resolveOpenAIModel("resume"), "gpt-5.6-terra", "explicit environment overrides remain supported");
  assert.equal(resolveOpenAIModel("resume", "gpt-6.1-sol"), "gpt-6.1-sol", "isolated eval models take precedence");
  process.env.OPENAI_RESUME_MODEL = " ";
  assert.equal(resolveOpenAIModel("resume"), "gpt-6.1-terra");
} finally {
  if (originalModelEnv.resume === undefined) delete process.env.OPENAI_RESUME_MODEL;
  else process.env.OPENAI_RESUME_MODEL = originalModelEnv.resume;
  if (originalModelEnv.general === undefined) delete process.env.OPENAI_MODEL;
  else process.env.OPENAI_MODEL = originalModelEnv.general;
}
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
  0.00368,
  "Luna cost must use its published standard token rates",
);
assert.equal(
  calculateCostUsd("gpt-5.6-terra", nanoUsage),
  0.0368,
  "Terra cost must use its published standard token rates",
);
for (const [model, expectedCost, expectedCeiling] of [
  ["gpt-6.1-terra", 0.0162, 0.065],
  ["gpt-6.1-sol", 0.0324, 0.13],
  ["gpt-6-astra", 0.164, 0.65],
  ["gpt-6-luna", 0.00164, 0.0065],
] as const) {
  assert.equal(calculateCostUsd(model, nanoUsage), expectedCost);
  assert.equal(calculateCostUsd(`${model}-2026-10-01`, nanoUsage), expectedCost,
    "dated snapshots must inherit only their documented family price");
  assert.equal(estimateMaximumCostUsd(model, 20_000, 8_000), expectedCeiling,
    "the budget ceiling must reserve cold-cache writes and the full output allowance");
  assert.equal(calculateCostUsd(`${model}-unknown`, nanoUsage), null,
    "unknown suffixes must not inherit a speculative price");
}
assert.equal(estimateCostUsd("unknown-model", nanoUsage), null);
assert.equal(estimateCostUsd("gpt-6.1-terra", null), null);
assert.equal(estimateMaximumCostUsd("unknown-model", 20_000, 8_000), null);
const cacheWriteUsage = normalizeTokenUsage({ usage: {
  prompt_tokens: 12_000,
  completion_tokens: 2_000,
  prompt_tokens_details: { cached_tokens: 4_000, cache_write_tokens: 7_000 },
  completion_tokens_details: { reasoning_tokens: 500 },
} });
assert.equal(cacheWriteUsage?.cache_write_prompt_tokens, 7_000);
assert.equal(calculateCostUsd("gpt-6.1-terra", cacheWriteUsage), 0.01995,
  "cached reads, writes, and ordinary input are disjoint; output already includes reasoning tokens");
assert.equal(normalizeTokenUsage({
  prompt_tokens: 100,
  completion_tokens: 10,
  prompt_tokens_details: { cached_tokens: 80, cache_write_tokens: 90 },
})?.cache_write_prompt_tokens, 20, "cache details must not exceed total prompt tokens");
assert.equal(calculateCostUsd("gpt-6.1-terra", {
  prompt_tokens: 272_000, completion_tokens: 1_000,
}), 0.277, "the long-context surcharge starts above 272K input tokens");
assert.equal(calculateCostUsd("gpt-6.1-terra", {
  prompt_tokens: 300_000, completion_tokens: 1_000,
  cached_prompt_tokens: 100_000, cache_write_prompt_tokens: 100_000,
}), 0.4675, "long context reprices every input category and output for the entire request");

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

assert.equal(resolveResumeRepairReasoningEffort("gpt-5.6-luna", "low"), "medium");
assert.equal(resolveResumeRepairReasoningEffort("gpt-5.6-luna", "high"), "high", "repair must not reduce a stronger configured effort");

assert.deepEqual(findMechanicalCopyIssues({ summary: "The roles include $180M in annual sales and $35M in annual sales." }), [],
  "a shared unit on two different measurements is not repetitive prose");
assert.ok(findMechanicalCopyIssues({ summary: "The resume needs more detail, because it needs more detail about the work." }).length > 0,
  "genuine repeated prose must still be detected");

// Sentence counts: decimals and initialisms don't end a sentence (eval_1793578314147, civil engineer).
assert.deepEqual(reportSentences("Your Ohio P.E. license helps. How large are the projects?"),
  ["Your Ohio P.E. license helps.", "How large are the projects?"], "an initialism is not a sentence end");
assert.equal(reportSentences("Stockouts fell from 6.5% to 3.8%, saving $3.2M a year. Forecast accuracy is missing.").length, 2,
  "a decimal point is not a sentence end");
assert.equal(reportSentences("Built it in Node.js for three teams. Then it shipped.").length, 2, "a dotted name is not a sentence end");
assert.equal(reportSentences("One. Two! Three? Four.").length, 4, "real sentence ends still split");
const civilSummary = "Roadway and stormwater design connect your current Project Engineer work for state and county clients. The 2.4-mile corridor reconstruction gives a reader a concrete sense of the stormwater assignment. Your Ohio P.E. license and progression from Engineer in Training help place you at the project engineer level. How large are the roadway and intersection projects you lead? Without that context, a reviewer has less to go on.";
const civilCanonical = canonicalizeResumeReportEvidence({ summary: civilSummary }, "Lead design for roadway widening and intersection projects for ODOT and Franklin County");
assert.equal((civilCanonical.report as any).summary, civilSummary, "a five-sentence summary with an initialism is not cut");
assert.ok(!civilCanonical.changes.includes("summary.capped_sentences"));
const sixSentences = "One role leads. Two results stand out. Three teams are named. Four tools appear. Five years are dated. Six is too many.";
const sixCanonical = canonicalizeResumeReportEvidence({ summary: sixSentences }, "Lead design for roadway projects");
assert.equal(reportSentences((sixCanonical.report as any).summary).length, 5, "a real sixth sentence is still capped");
assert.ok(sixCanonical.changes.includes("summary.capped_sentences"));
console.log("report sentence tests passed");

// A target-role fix keeps its own words, and a headline line's section is Summary (eval_1793596046745).
const headlineFixAt = (fix: string, excerpt: string, why: string, section = "Work Experience") => ({
  fix, why, confidence: "high", evidence: { excerpt, section }, impact_level: "high", effort: "quick", section_ref: section,
});
const noSummarySource = "EXPERIENCE\nShift Supervisor\n- Supervise cashiers and stockers on evening shifts\nFreelance Web Developer\n- Built small business websites in WordPress";
const headlineAsk = canonicalizeResumeReportEvidence({ top_fixes: [headlineFixAt("Add a headline naming the role you want next.", "Shift Supervisor",
  "With no summary or headline, a reader can't tell whether this is for retail management or web development.")] }, noSummarySource);
assert.equal((headlineAsk.report as any).top_fixes[0].fix, "Add a headline naming the role you want next.", "a target-role fix keeps its words");
assert.equal((headlineAsk.report as any).top_fixes[0].evidence.excerpt, "No summary section present");
const vagueAsk = canonicalizeResumeReportEvidence({ top_fixes: [headlineFixAt("Clarify your positioning for readers.", "Shift Supervisor",
  "A summary would help a reader place you.")] }, noSummarySource);
assert.match((vagueAsk.report as any).top_fixes[0].fix, /^Add a summary section/, "a vague positioning fix still gets the stock line");
const headedSource = "Director of Operations who runs multi-site distribution networks.\nEXPERIENCE\nOperations Supervisor\n- Supervised the day shift on the warehouse floor";
const headlineSection = canonicalizeResumeReportEvidence({ top_fixes: [headlineFixAt("Replace the director headline with your supervisor title.",
  "Director of Operations who runs multi-site distribution networks.", "The headline claims a director; the role is a shift supervisor.", "Headline")] }, headedSource);
assert.equal((headlineSection.report as any).top_fixes[0].evidence.section, "Summary", "a headline line's section is Summary");
assert.equal((headlineSection.report as any).top_fixes[0].section_ref, "Summary");
assert.ok(headlineSection.changes.includes("top_fixes[0].evidence.section_headline"));
console.log("headline and target-role tests passed");
