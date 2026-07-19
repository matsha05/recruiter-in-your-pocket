const assert = require("node:assert/strict");
const { participants, renderMarkdown, summarize } = require("../scripts/simulate-founder-cohort.cjs");

const result = summarize();

assert.equal(participants.length, 20, "the rehearsal should represent a founder-sized cohort");
assert.equal(result.counts.invited, 20);
assert.equal(result.counts.completed, 18);
assert.equal(result.metrics.completionRate, 90);
assert.equal(result.metrics.genericRate, 16.7);
assert.equal(result.gates.completion, true);
assert.equal(result.gates.generic, false);
assert.equal(result.expansionDecision, "MODELED NO-GO");
assert.match(result.model, /not observed user data/i);
assert.match(renderMarkdown(), /Synthetic decision rehearsal, not observed user data or a forecast/);

console.log("founder cohort simulation tests passed");
