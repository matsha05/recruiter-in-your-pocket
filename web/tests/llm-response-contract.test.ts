import assert from "node:assert/strict";
import {
  getOpenAIResponseFormat,
  RESUME_REPORT_JSON_SCHEMA,
  RESUME_REPORT_RESPONSE_FORMAT,
} from "../lib/llm/response-format";
import {
  findUnsupportedAgencyUpgrade,
  findUnsupportedOutcomeClaims,
  findAlreadySatisfiedFix,
  containsExactEvidence,
} from "../lib/llm/grounding";
import {
  buildResumeRepairMessages,
  isRepairableResumeResponseError,
} from "../lib/llm/reportRepair";

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
assert.equal(topFixes.minItems, 3, "resume reports must have at least three top fixes");
assert.equal(topFixes.maxItems, 5, "resume reports must have at most five top fixes");

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
  findUnsupportedOutcomeClaims(
    "Revamped the launch process",
    "Revamped the launch process, increasing revenue by 30%.",
    "Revamped the launch process, increasing revenue by 30% and cutting cycle time by 90%.",
  ),
  [],
  "a short original excerpt may restore an outcome from the full source line",
);
assert.deepEqual(
  findUnsupportedOutcomeClaims(
    "Prepared financial reports.",
    "Prepared financial reports, improving executive decision-making.",
  ),
  ["improving"],
);
assert.deepEqual(
  findUnsupportedOutcomeClaims(
    "Supported the launch process.",
    "Supported the launch process to deliver [cycle-time improvement].",
  ),
  [],
  "bracketed outcomes remain explicit candidate prompts",
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

console.log("llm-response-contract tests passed");
