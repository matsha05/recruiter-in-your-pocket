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
  getProductionChatCompletionTuning,
  getTuningMetadata,
  increaseReasoningEffort,
  PRODUCTION_OPENAI_MAX_COMPLETION_TOKENS,
  PRODUCTION_OPENAI_MAX_RETRIES,
  resolveOpenAIModel,
  resolveProductionOpenAIRetryLimit,
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

import "./llm-canonicalizer-contract.test";
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
