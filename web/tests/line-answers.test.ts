import assert from "node:assert/strict";
import {
  liftAnswersFromStored,
  mergeLineAnswers,
  parseLineAnswersPatch,
  parseStoredLineAnswers,
  storedAnswersFromLift,
  sendLineAnswers,
  LINE_ANSWER_LIMITS,
} from "../lib/reports/line-answers";

// ============================================
// The request body: bounded, typed, and never the resume
// ============================================

const good = {
  fix_index: 0,
  answers: [
    { question: "Which inventory feature did you develop?", kind: "answered", text: "  the low-stock   alert view " },
    { question: "What task did it help users perform?", kind: "unknown" },
  ],
  line: "Responsible for developing features: the low-stock alert view.",
  source: "literal",
};
const parsed = parseLineAnswersPatch(good);
assert.ok(parsed);
assert.equal(parsed!.answers[0].kind, "answered");
assert.equal((parsed!.answers[0] as { text: string }).text, "the low-stock alert view", "whitespace is collapsed");
assert.equal(parsed!.answers[1].kind, "unknown");
assert.equal(parsed!.source, "literal");

assert.equal(parseLineAnswersPatch({ ...good, fix_index: 3 }), null, "only the three marked fixes");
assert.equal(parseLineAnswersPatch({ ...good, fix_index: "0" }), null);
assert.equal(parseLineAnswersPatch({ ...good, answers: [] }), null, "nothing to keep");
assert.equal(parseLineAnswersPatch({ ...good, answers: [{ question: "Q?", kind: "answered", text: "" }] }), null, "an empty answer is not an answer");
assert.equal(parseLineAnswersPatch({ ...good, answers: [{ question: "Q?", kind: "answered", text: "x".repeat(LINE_ANSWER_LIMITS.text + 1) }] }), null);
assert.equal(parseLineAnswersPatch({ ...good, answers: [{ question: "Q?", kind: "open" }] }), null, "open questions are not stored");
assert.equal(parseLineAnswersPatch({ ...good, source: "model" }), null);
assert.equal(parseLineAnswersPatch({ ...good, line: "" }), null, "an empty string is not a line; null clears it");
assert.ok(parseLineAnswersPatch({ ...good, line: null }));
assert.equal(parseLineAnswersPatch({ ...good, line: "x".repeat(LINE_ANSWER_LIMITS.line + 1) }), null);
assert.equal(parseLineAnswersPatch(null), null);

// ============================================
// The stored column: one entry per fix, merged without losing the others
// ============================================

const first = mergeLineAnswers(null, parsed!, new Date("2026-11-02T20:00:00Z"));
assert.deepEqual(Object.keys(first), ["0"]);
assert.equal(first["0"].updated_at, "2026-11-02T20:00:00.000Z");
const second = mergeLineAnswers(first, { fix_index: 2, answers: [{ question: "Scope?", kind: "not_mine" }], line: null, source: "literal" }, new Date("2026-11-02T20:05:00Z"));
assert.deepEqual(Object.keys(second).sort(), ["0", "2"]);
assert.equal(second["0"].line, good.line, "an earlier fix's answers survive a later fix's save");
const replaced = mergeLineAnswers(second, { fix_index: 0, answers: [{ question: "Q?", kind: "unknown" }], line: null, source: "literal" });
assert.equal(replaced["0"].line, null, "saving a fix again replaces its entry");

assert.deepEqual(parseStoredLineAnswers({ "0": { answers: [{ question: "Q?", kind: "answered", text: "a" }], line: "L", source: "edited", updated_at: "2026-11-02T20:00:00.000Z" }, junk: 1, "5": {} }),
  { "0": { answers: [{ question: "Q?", kind: "answered", text: "a" }], line: "L", source: "edited", updated_at: "2026-11-02T20:00:00.000Z" } },
  "unknown keys and malformed entries are dropped, not fatal");
assert.equal(parseStoredLineAnswers("nope"), null);
assert.equal(parseStoredLineAnswers({ "0": { answers: [], line: null, source: "literal" } }), null, "an entry with no answers reads as nothing kept");

// ============================================
// Back into the report: matched by question text, so a reworded question starts fresh
// ============================================

const stored = first["0"];
const lifted = liftAnswersFromStored(stored, ["Which inventory feature did you develop?", "What task did it help users perform?", "Which roles helped?"]);
assert.ok(lifted);
assert.deepEqual(lifted!.answers, [{ kind: "answered", value: "the low-stock alert view" }, { kind: "unknown" }, { kind: "open" }]);
assert.equal(lifted!.line, good.line);
assert.equal(liftAnswersFromStored(stored, ["A different question?"]), null, "nothing matches, nothing is restored");
assert.equal(liftAnswersFromStored(undefined, ["Q?"]), null);

assert.deepEqual(storedAnswersFromLift(["Q1?", "Q2?", "Q3?"], [{ kind: "answered", value: " a  b " }, { kind: "open" }, { kind: "not_mine" }]),
  [{ question: "Q1?", kind: "answered", text: "a b" }, { question: "Q3?", kind: "not_mine" }]);

// ============================================
// Sending: a bad id or a failed request resolves false, never throws
// ============================================

(async () => {
const calls: Array<{ url: string; body: unknown }> = [];
const fakeFetch = (async (url: string, init?: RequestInit) => {
  calls.push({ url, body: JSON.parse(String(init?.body)) });
  return new Response("{}", { status: 200 });
}) as unknown as typeof fetch;
assert.equal(await sendLineAnswers("not-a-uuid", parsed!, fakeFetch), false);
assert.equal(calls.length, 0, "no request for a bad id");
assert.equal(await sendLineAnswers("1ec2778f-9c09-42fd-9910-fc5ec3f47e44", parsed!, fakeFetch), true);
assert.equal(calls[0].url, "/api/reports/1ec2778f-9c09-42fd-9910-fc5ec3f47e44/answers");
assert.equal(await sendLineAnswers("1ec2778f-9c09-42fd-9910-fc5ec3f47e44", parsed!, (async () => new Response("{}", { status: 500 })) as unknown as typeof fetch), false);
assert.equal(await sendLineAnswers("1ec2778f-9c09-42fd-9910-fc5ec3f47e44", parsed!, (async () => { throw new Error("offline"); }) as unknown as typeof fetch), false);

console.log("line answers tests passed");
})().catch((error) => { console.error(error); process.exitCode = 1; });
