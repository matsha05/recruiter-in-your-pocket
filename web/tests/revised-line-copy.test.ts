import assert from "node:assert/strict";
import { guardMessage, guardOffersExactWords, readGuardVerdict } from "../components/workspace/report/markup/guardCopy";

// The guard names the word it objects to, in the person's words, and every message ends with "if it's true".
const ending = /if (?:it's|that's what's) true/u;

const mismatch = readGuardVerdict({ ok: false, reason: "new_fact", tokens: ["web app"], nearest: ["web application"] });
assert.equal(
  guardMessage(mismatch),
  "“web app” isn't in your line or your answers, but “web application” is. Use the words you wrote, or add it as an answer if it's true.",
);
assert.equal(guardOffersExactWords(mismatch), false);

const newNumber = readGuardVerdict({ ok: false, reason: "new_fact", tokens: ["999 hours"] });
assert.equal(guardMessage(newNumber), "“999 hours” isn't in your line or your answers. Use the words you wrote, or add it as an answer if it's true.");

const several = readGuardVerdict({ ok: false, reason: "new_fact", tokens: ["999", "Acme"] });
assert.equal(guardMessage(several), "“999” (and 1 more) isn't in your line or your answers. Use the words you wrote, or add it as an answer if it's true.");

const relationship = readGuardVerdict({ ok: false, reason: "relationship" });
assert.equal(
  guardMessage(relationship),
  "We can't tell which number goes with which claim in this line. Use your exact words, or put each number next to what it describes, if that's what's true.",
);
assert.equal(guardOffersExactWords(relationship), true, "the relationship check offers the person's exact words as the fix");

const lost = readGuardVerdict({ ok: false, reason: "lost_answer", tokens: ["about 40 warehouse staff"] });
assert.equal(guardMessage(lost), "Your answer “about 40 warehouse staff” isn't in the line anymore. Put it back if it's true, or skip that question.");

assert.equal(guardMessage(readGuardVerdict({ ok: true })), null);
assert.equal(guardMessage(readGuardVerdict({ ok: false, reason: "empty" })), null);
assert.equal(guardMessage(readGuardVerdict(undefined)), null);

for (const verdict of [mismatch, newNumber, several, relationship, lost]) {
  assert.match(guardMessage(verdict)!, ending, "every message ends with the if-it's-true clause");
  assert.doesNotMatch(guardMessage(verdict)!, /\badd (?:a|the) (?:number|metric|result)\b/u, "never suggests adding something that may not be true");
}

// Today's guard shapes read the same way, so the copy never regresses while the contract ships.
assert.deepEqual(readGuardVerdict({ copyable: false, reason: "unsafe", newFacts: ["999 hours"] }), { ok: false, reason: "new_fact", tokens: ["999 hours"] });
assert.deepEqual(readGuardVerdict({ copyable: false, reason: "unsafe", newFacts: [], issues: [{ code: "unsupported_content", detail: "unresolved relationship binding: reduced" }] }), { ok: false, reason: "relationship" });
assert.deepEqual(readGuardVerdict({ copyable: true, reason: "ready" }), { ok: true });
assert.deepEqual(readGuardVerdict({ copyable: false, reason: "source_unavailable" }), { ok: false, reason: "empty" });
assert.deepEqual(readGuardVerdict({ ok: false, reason: "new_word", detail: "significantly, helping" }), { ok: false, reason: "new_fact", tokens: ["significantly", "helping"] });
assert.deepEqual(readGuardVerdict({ ok: false, reason: "dropped_answer", detail: "for the onboarding team" }), { ok: false, reason: "lost_answer", tokens: ["for the onboarding team"] });
assert.deepEqual(readGuardVerdict({ ok: false, reason: "guard", detail: "unsupported content: x" }), { ok: false, reason: "relationship" });
assert.deepEqual(readGuardVerdict({ ok: true, joiners: [] } as never), { ok: true });

console.log("revised-line copy tests passed");
