import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ensureLayoutAndContentFields, validateResumeModelPayload } from "../lib/backend/validation";
import { resumeTextFromFixture } from "../lib/evals/fixture-input";
import {
  requestSeverityCheck,
  SEVERITY_CHECK_PROMPT,
  SEVERITY_CHECK_PROMPT_SHA256,
  SEVERITY_CHECK_PROMPT_VERSION,
  SEVERITY_CHECK_RESPONSE_FORMAT,
  severityCheckMessages,
  type SeverityCheckAnswer,
  type SeverityCheckItem,
} from "../lib/llm/severity-check-model";
import { resolveOpenAIModel, resolveReasoningEffortForMode } from "../lib/llm/model-config";
import { sanitizeLaunchSignal } from "../lib/observability/launchSignals";
import { hasMoreCriticalMisses, isCriticalFix } from "../lib/reports/report-integrity";
import { criticalCount, isSeverityCheckEnabled, mergeSeverityCheck, sameFirstFix, SEVERITY_CHECK_DEFAULT } from "../lib/reports/severity-check";
import { applySeverityCheck, settleSeverityCheck } from "../lib/reports/severity-check-service";
import { ResumeFeedbackResponseSchema } from "../lib/validation/resume-report-schema";

// ---- The prompt and the call ----
assert.ok(SEVERITY_CHECK_PROMPT.includes("THE SERIOUS PROBLEMS"));
assert.equal(SEVERITY_CHECK_PROMPT_VERSION, `severity_check_v1:${SEVERITY_CHECK_PROMPT_SHA256.slice(0, 8)}`);
assert.equal(resolveOpenAIModel("severity_check"), resolveOpenAIModel("resume"), "the check runs on the resume model");
assert.equal(resolveReasoningEffortForMode("severity_check", "gpt-6.1-terra"), resolveReasoningEffortForMode("resume", "gpt-6.1-terra"));
const schema = SEVERITY_CHECK_RESPONSE_FORMAT.json_schema.schema;
assert.equal(schema.properties.critical_misses.maxItems, 2, "up to two Critical Misses besides the first fix");
assert.deepEqual([...schema.required].sort(), Object.keys(schema.properties).sort());
const itemSchema = schema.properties.critical_misses.items;
assert.deepEqual([...itemSchema.required].sort(), Object.keys(itemSchema.properties).sort(), "strict: every item field is required");

const fixtureRoot = path.resolve(process.cwd(), "..");
const resumeText = resumeTextFromFixture(fs.readFileSync(path.join(fixtureRoot, "tests/resumes/golden/synth_operations_manager_entry_weak_1766960246467.txt"), "utf8"));
const saved = JSON.parse(fs.readFileSync(path.join(process.cwd(), "tests/fixtures/report-integrity/live-outputs-83b2a2d1.json"), "utf8"));
const savedReport = saved.runs.find((run: any) => run.fixture_id === "synth_operations_manager_entry_weak_1").report;
const payload = ensureLayoutAndContentFields(validateResumeModelPayload(structuredClone(savedReport), resumeText));
assert.equal(payload.top_fixes.length, 3);

const messages = severityCheckMessages({ resumeText, report: payload, today: "2026-11-01" });
const user = messages[1].content;
assert.ok(user.startsWith("Today's date: 2026-11-01."), "the check judges recency against today");
assert.ok(user.includes("<USER_RESUME_START>") && user.includes("SOURCE CATALOG"));
assert.ok(user.includes(`Fix 1 (the Critical Miss; never change it)\nFix: ${payload.top_fixes[0].fix}`));
assert.ok(user.includes("Fix 3\nFix:"));
assert.ok(messages[0].content.startsWith(SEVERITY_CHECK_PROMPT));

// ---- The merge ----
const item = (overrides: Partial<SeverityCheckItem>): SeverityCheckItem => ({
  source: "new", kind: "no_recent_work", fix: "", why: "", excerpt: "", section: "Experience", effort: "quick", ...overrides,
});
const answer = (critical_misses: SeverityCheckItem[], more_critical = false): SeverityCheckAnswer => ({ critical_misses, more_critical });
const recent = item({
  fix: "Add one dated line covering Jul 2023 to today.",
  why: "The Greenfield Logistics role ends in July 2023, and nothing later is listed. Operations hiring managers usually look for current work. A dated line such as \"Job search and coursework\", or volunteer event logistics you actually did, would answer that.",
  excerpt: "Feb 2023 - Jul 2023",
});

const none = mergeSeverityCheck(payload, answer([]));
assert.deepEqual(none.report.top_fixes?.map((fix) => fix.critical), [true, false, false], "a strong resume keeps one Critical Miss, now flagged");
assert.equal(none.report.more_critical, false);
assert.equal(criticalCount(none.report), 1);

const one = mergeSeverityCheck(payload, answer([recent]));
assert.deepEqual(one.added, ["no_recent_work"]);
assert.equal(one.report.top_fixes?.[0].fix, payload.top_fixes[0].fix, "the first fix never changes");
assert.equal(one.report.top_fixes?.[1].fix, recent.fix, "an added Critical Miss follows the first fix");
assert.deepEqual(one.report.top_fixes?.map((fix) => fix.critical), [true, true, false]);
assert.equal(one.report.top_fixes?.[2].fix, payload.top_fixes[1].fix, "ordinary fixes follow, and the list keeps three");
assert.deepEqual(one.report.top_fixes?.[1].evidence, { excerpt: "Feb 2023 - Jul 2023", section: "Experience" });

const promoted = mergeSeverityCheck(payload, answer([item({ source: "fix_3", kind: "no_evidence_latest_role" })]));
assert.deepEqual(promoted.promoted, [2]);
assert.deepEqual(promoted.report.top_fixes?.map((fix) => fix.fix), [payload.top_fixes[0].fix, payload.top_fixes[2].fix, payload.top_fixes[1].fix],
  "Fix 3 promoted moves up; nothing is duplicated");
assert.deepEqual(promoted.report.top_fixes?.map((fix) => fix.critical), [true, true, false]);

const sameLine = mergeSeverityCheck(payload, answer([item({ kind: "no_evidence_latest_role", fix: "Name the departments.", why: "x", excerpt: payload.top_fixes[1].evidence.excerpt })]));
assert.deepEqual(sameLine.replaced, [1], "a new fix on Fix 2's line replaces Fix 2: one fix per line");
assert.deepEqual(sameLine.added, ["no_evidence_latest_role"]);
assert.deepEqual(sameLine.report.top_fixes?.map((fix) => fix.fix), [payload.top_fixes[0].fix, "Name the departments.", payload.top_fixes[2].fix]);
assert.deepEqual(sameLine.report.top_fixes?.map((fix) => fix.critical), [true, true, false]);
assert.deepEqual(mergeSeverityCheck(payload, answer([item({ kind: "no_evidence_latest_role", fix: "Name the departments.", why: "x", excerpt: payload.top_fixes[1].evidence.excerpt })]), 0)
  .report.top_fixes?.map((fix) => fix.critical), [true, false, false], "without the new fix, Fix 2 stays an ordinary fix rather than standing in for it");
const duplicate = mergeSeverityCheck(payload, answer([item({ kind: "no_evidence_latest_role", fix: "Name the reports.", why: "x", excerpt: payload.top_fixes[0].evidence.excerpt })]));
assert.deepEqual(duplicate.skipped, [{ kind: "no_evidence_latest_role", reason: "duplicates_first_fix" }]);
assert.equal(criticalCount(duplicate.report), 1);
const twice = mergeSeverityCheck(payload, answer([item({ source: "fix_2" }), item({ source: "fix_2", kind: "missing_dates" })]));
assert.deepEqual(twice.skipped, [{ kind: "missing_dates", reason: "already_flagged" }]);
assert.deepEqual(mergeSeverityCheck({ ...payload, top_fixes: payload.top_fixes.slice(0, 1) }, answer([item({ source: "fix_3" })])).skipped,
  [{ kind: "no_recent_work", reason: "no_such_fix" }]);

const title = item({ kind: "title_level_mismatch", fix: "Name the operations assistant work in your objective.", why: "y", excerpt: "Operations Assistant" });
const three = mergeSeverityCheck(payload, answer([recent, title], true));
assert.deepEqual(three.report.top_fixes?.map((fix) => fix.critical), [true, true, true]);
assert.equal(three.report.more_critical, true, "more than three exist, with three shown");
assert.equal(hasMoreCriticalMisses(three.report as any), true);
assert.equal(mergeSeverityCheck(payload, answer([recent], true)).report.more_critical, false, "two shown can't say more exist");
assert.equal(mergeSeverityCheck(payload, answer([recent, title]), 1).added.length, 1, "limitNew caps the new fixes");
for (const merged of [none, one, promoted, three]) {
  assert.equal(ResumeFeedbackResponseSchema.safeParse(merged.report).success, true, "every merge fits the report schema");
  assert.equal(isCriticalFix(merged.report as any, 0), true);
}
assert.equal(sameFirstFix(payload, one.report), true);
assert.equal(sameFirstFix(payload, { top_fixes: [payload.top_fixes[1]] }), false);

// ---- Validation of the merged report ----
const grounded = settleSeverityCheck({ payload, answer: answer([recent]), resumeText });
// A month the resume never names is refused, like any invented fact. Months are checked as names, so
// "July" is the resume's "Jul"; the month-year pair itself is the prompt's rule, not the validator's.
const computed = settleSeverityCheck({ payload, answer: answer([{ ...recent, fix: "Add one dated line covering October 2023 to today." }]), resumeText });
assert.equal(computed.outcome, "fallback");
assert.match(computed.detail || "", /Oct/);
assert.equal(grounded.outcome, "added", grounded.detail);
assert.equal(grounded.critical_count, 2);
assert.equal(grounded.validation_attempts, 1);
assert.equal(grounded.payload.top_fixes[0].fix, payload.top_fixes[0].fix);

const invented = item({
  kind: "no_evidence_latest_role",
  fix: "In the Greenfield scheduling bullet, add the size of the team you scheduled.",
  why: "You managed 14 coordinators across three warehouses, but the role never says how many people that was.",
  excerpt: "- Helped coordinate team meetings and schedules.",
});
const refused = settleSeverityCheck({ payload, answer: answer([invented]), resumeText });
assert.equal(refused.outcome, "fallback", "an invented fact fails the same fabrication guard");
assert.equal(refused.reason, "validation");
assert.equal(refused.payload, payload, "the report ships exactly as it was");
assert.equal(criticalCount(refused.payload), 1);

const partly = settleSeverityCheck({ payload, answer: answer([recent, invented]), resumeText });
assert.equal(partly.outcome, "added", "the grounded fix survives when the second one fails");
assert.deepEqual(partly.added, ["no_recent_work"]);
assert.equal(partly.validation_attempts, 2);

const promotionOnly = settleSeverityCheck({ payload, answer: answer([invented, item({ source: "fix_3", kind: "no_evidence_latest_role" })]), resumeText });
assert.equal(promotionOnly.outcome, "added");
assert.equal(promotionOnly.reason, "promoted", "a promotion still ships when the new fix fails");
assert.equal(promotionOnly.payload.top_fixes[1].fix, payload.top_fixes[2].fix);

console.log("severity check merge tests passed");

(async () => {
  // ---- The call and its failures ----
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-key";
  const reply = (content: unknown, extra: Record<string, unknown> = {}) => (async () => new Response(JSON.stringify({
    model: "gpt-6.1-terra",
    usage: { prompt_tokens: 3000, completion_tokens: 400 },
    choices: [{ finish_reason: "stop", message: { content: JSON.stringify(content) } }],
    ...extra,
  }), { status: 200 })) as unknown as typeof fetch;
  const response = await requestSeverityCheck({ resumeText, report: payload, today: "2026-11-01", fetchImpl: reply(answer([recent])) });
  assert.equal(response.answer.critical_misses.length, 1);
  assert.ok((response.cost_usd ?? 0) > 0, "the call's cost comes from its token usage");
  await assert.rejects(
    requestSeverityCheck({ resumeText, report: payload, today: "2026-11-01", fetchImpl: reply({ critical_misses: [{ source: "new" }], more_critical: false }) }),
    (error: any) => error.code === "OPENAI_RESPONSE_NOT_JSON",
  );

  const timedOut = await applySeverityCheck({
    payload, resumeText, today: "2026-11-01",
    request: async () => { throw Object.assign(new Error("slow"), { code: "OPENAI_TIMEOUT" }); },
  });
  assert.equal(timedOut.outcome, "error");
  assert.equal(timedOut.reason, "timeout");
  assert.equal(timedOut.payload, payload, "on any failure the report ships unchanged");
  const stuck = await applySeverityCheck({
    payload, resumeText, today: "2026-11-01", deadlineMs: 50,
    request: () => new Promise(() => undefined),
  });
  assert.equal(stuck.outcome, "error", "a request that never settles can't hold the report");
  assert.equal(stuck.reason, "timeout");
  assert.equal(stuck.payload, payload);
  const applied = await applySeverityCheck({
    payload, resumeText, today: "2026-11-01",
    request: async () => ({ answer: answer([recent]), model: "gpt-6.1-terra", usage: null, cost_usd: 0.004, latency_ms: 12 }),
  });
  assert.equal(applied.outcome, "added");
  assert.equal(applied.cost_usd, 0.004);
  assert.equal(applied.call_latency_ms, 12);
  assert.ok(applied.latency_ms >= 0);
  assert.equal(applied.prompt_version, SEVERITY_CHECK_PROMPT_VERSION);

  // ---- The flag and the counter ----
  assert.equal(SEVERITY_CHECK_DEFAULT, true, "on by default since the gate passed; RIYP_SEVERITY_CHECK=false turns it off");
  assert.equal(isSeverityCheckEnabled(undefined), SEVERITY_CHECK_DEFAULT);
  assert.equal(isSeverityCheckEnabled("true"), true);
  assert.equal(isSeverityCheckEnabled("1"), true);
  assert.equal(isSeverityCheckEnabled("0"), false);
  assert.equal(isSeverityCheckEnabled("false"), false);
  assert.deepEqual(
    sanitizeLaunchSignal("riyp.severity.outcome", { outcome: "added", reason: "promoted", critical: "3", more: "yes", endpoint: "stream", resume: "x" })?.attributes,
    { outcome: "added", reason: "promoted", critical: "3", more: "yes", endpoint: "stream" },
  );
  console.log("severity check service tests passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
