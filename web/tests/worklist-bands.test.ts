import assert from "node:assert/strict";
import { SCORE_BANDS, WORKLIST_BANDS, scoreBandFor, worklistBandFor, worklistBandIndex } from "../lib/reports/score-band";
import { CLEAR_AND_SPECIFIC_SCORE, CLEAR_AND_SPECIFIC_WORK_LIMIT, getScoreLabel, getWorklistScoreLabel, NOTHING_TO_FIX_FLOOR, READY_TO_SEND_SCORE, scoreHeldToCards } from "../lib/score-utils";

// The worklist's five bands (Matt, Nov 6, 2026): the v2 four, with Clear and specific ending at 92 and Ready to send
// from 93. The v2 report keeps its four, so a report saved before today reads as it did.
assert.equal(WORKLIST_BANDS.length, 5);
assert.equal(SCORE_BANDS.length, 4, "v2 keeps four bands");
assert.deepEqual(WORKLIST_BANDS.slice(0, 4), SCORE_BANDS, "the first four are the same bands");
assert.equal(WORKLIST_BANDS[4].name, "Ready to send");
assert.equal(READY_TO_SEND_SCORE, 93);
assert.equal(NOTHING_TO_FIX_FLOOR, 90);
// Clear and specific is held to the cards as well (Nov 13, 2026): at most three that need work, else the top of
// the band below.
assert.equal(worklistBandFor(CLEAR_AND_SPECIFIC_SCORE).name, "Clear and specific");
assert.equal(worklistBandFor(CLEAR_AND_SPECIFIC_SCORE - 1).name, "Mostly clear");
assert.equal(CLEAR_AND_SPECIFIC_WORK_LIMIT, 3);
assert.equal(worklistBandFor(scoreHeldToCards(88, 4)).name, "Mostly clear");
assert.equal(worklistBandFor(scoreHeldToCards(88, 3)).name, "Clear and specific");
for (const score of [0, 40, 60]) assert.equal(worklistBandFor(score).name, "Not ready yet", `${score} is not ready`);
for (const score of [61, 69]) assert.equal(worklistBandFor(score).name, "Needs more context");
for (const score of [70, 84]) assert.equal(worklistBandFor(score).name, "Mostly clear");
for (const score of [85, 90, 92]) assert.equal(worklistBandFor(score).name, "Clear and specific", `${score} is Clear and specific`);
for (const score of [93, 99]) assert.equal(worklistBandFor(score).name, "Ready to send", `${score} is Ready to send`);
assert.equal(worklistBandIndex(93), 4);
for (const score of [61, 70, 85, 92, 99]) {
  assert.equal(getScoreLabel(score), scoreBandFor(score).name, "v2's label is its band");
  assert.equal(getWorklistScoreLabel(score), worklistBandFor(score).name, "the worklist's label is its band");
}
assert.equal(getScoreLabel(99), "Clear and specific", "v2 never says Ready to send");
assert.equal(new Set(WORKLIST_BANDS.map((band) => band.anchor)).size, 5, "each band has its own anchor");
console.log("worklist bands passed");

import { displayedBand } from "../lib/reports/score-band";
for (const score of [59, 60, 61, 69, 70, 71, 84, 85, 86, 92, 93, 94, 95]) {
  const worklist = worklistBandFor(score);
  assert.equal(displayedBand(score, "worklist").band.name, worklist.name);
  assert.equal(displayedBand(score, "report").band.name, scoreBandFor(score).name);
  assert.equal(displayedBand(score, "profile").band.name, score >= 93 ? "Nothing left to fix" : worklist.name);
}
