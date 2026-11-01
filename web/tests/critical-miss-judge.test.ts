import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { gradePair, loadBlindPick, loadContrastPairs, unverifiedCitations } from "../lib/evals/judge/calibration";
import { callJudge, DEFAULT_JUDGE_CONFIG, GENERATOR_MODEL, SpendLedger } from "../lib/evals/judge/client";
import { combineOrders, pairwiseUserMessage, resolveOrder } from "../lib/evals/judge/modes";
import { PAIRWISE_SYSTEM_PROMPT } from "../lib/evals/judge/prompt";
import { gateLines, gateVerdict } from "../lib/evals/judge/gate";
import type { AbsoluteResult, CriticalMissView, PairwiseRawVerdict, PairwiseResult } from "../lib/evals/judge/types";
import { isJudgeableFixture, renderView, viewFromReport } from "../lib/evals/judge/view";
import { judgeEvalReport } from "../lib/evals/judge";
import type { CalibrationData } from "../lib/evals/types";

const viewA: CriticalMissView = {
  label: "Critical Miss",
  verdict: "You lead a team of 9. The quota line has no attainment.",
  misses: [{ fix: "In the quota bullet, add your attainment.", why: "Sales leaders look for it.", resume_lines: ["- Exceeded quota"] }],
};
const viewB: CriticalMissView = {
  label: "Critical Miss",
  verdict: "The team size isn't stated.",
  misses: [{ fix: "Add how many account executives you manage.", why: "Leaders are sized by team.", resume_lines: ["- Lead a team of 9"] }],
};

function raw(overrides: Partial<PairwiseRawVerdict>): PairwiseRawVerdict {
  return {
    first_read: "",
    most_important_issue: "",
    first: { targets: "", unsupported_claims: [] },
    second: { targets: "", unsupported_claims: [] },
    same_issue: false,
    winner: "first",
    strength: "clear",
    deciding_criteria: ["C2_concrete_fact_over_move"],
    rationale: "",
    cited_resume_lines: [],
    ...overrides,
  };
}

// Side orders map back to report identities.
{
  const xy = resolveOrder("XY", raw({ winner: "first", strength: "clear" }), { X: viewA, Y: viewB });
  const yx = resolveOrder("YX", raw({ winner: "second", strength: "slight" }), { X: viewA, Y: viewB });
  assert.equal(xy.winner, "X");
  assert.equal(yx.winner, "X");
  const combined = combineOrders([xy, yx]);
  assert.equal(combined.winner, "X");
  assert.equal(combined.strength, "slight", "clear needs both orders to say clear");
  assert.equal(combined.orders_agree, true);
}

// Orders that disagree are a tie: position bias cancels instead of deciding.
{
  const xy = resolveOrder("XY", raw({ winner: "first" }), { X: viewA, Y: viewB });
  const yx = resolveOrder("YX", raw({ winner: "first" }), { X: viewA, Y: viewB });
  assert.equal(xy.winner, "X");
  assert.equal(yx.winner, "Y");
  const combined = combineOrders([xy, yx]);
  assert.equal(combined.winner, "tie");
  assert.equal(combined.orders_agree, false);
}

// A veto decides the order, but only when its quote is really in that report.
{
  const vetoed = resolveOrder("XY", raw({
    winner: "first",
    second: { targets: "", unsupported_claims: [{ quote: "Add how many account executives you manage", why: "The resume says 9." }] },
  }), { X: viewA, Y: viewB });
  assert.equal(vetoed.winner, "X");
  assert.equal(vetoed.strength, "clear");
  assert.equal(vetoed.vetoes.Y.length, 1);

  const invented = resolveOrder("XY", raw({
    winner: "second",
    strength: "slight",
    second: { targets: "", unsupported_claims: [{ quote: "a sentence report B never wrote", why: "" }] },
  }), { X: viewA, Y: viewB });
  assert.equal(invented.winner, "Y", "a claim quoting text the report never wrote is dropped");
  assert.equal(invented.vetoes.Y.length, 0);
  assert.equal(invented.dropped_claims.length, 1);

  const both = resolveOrder("YX", raw({
    first: { targets: "", unsupported_claims: [{ quote: "The team size isn't stated.", why: "" }] },
    second: { targets: "", unsupported_claims: [{ quote: "add your attainment", why: "" }] },
  }), { X: viewA, Y: viewB });
  assert.equal(both.winner, "tie");
}

// The prompt-change gate: candidate preferred on at least 80% of resumes, ties against, zero candidate vetoes.
{
  const pair = (winner: "X" | "Y" | "tie") => ({ winner, strength: winner === "tie" ? "none" : "slight" }) as unknown as PairwiseResult;
  const alone = (veto = false) => ({ veto }) as unknown as AbsoluteResult;
  const resumes = (winners: Array<"X" | "Y" | "tie">, vetoAt = -1) =>
    winners.map((winner, index) => ({ fixture_id: `synth_${index}`, pairwise: pair(winner), candidate_absolute: alone(index === vetoAt) }));

  const pass = gateVerdict(resumes(["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "tie", "X"]));
  assert.equal(pass.pass, true, "8 of 10 meets the bar");
  assert.equal(pass.share, 0.8);
  assert.equal(gateLines(pass)[0], "GATE: PASS");

  const ties = gateVerdict(resumes(["Y", "Y", "Y", "Y", "Y", "Y", "Y", "tie", "tie", "tie"]));
  assert.equal(ties.pass, false, "ties count against the candidate");
  assert.match(ties.reasons[0], /7 of 10/);

  const vetoed = gateVerdict(resumes(Array(10).fill("Y"), 4));
  assert.equal(vetoed.pass, false, "one candidate veto fails the gate");
  assert.deepEqual(vetoed.candidate_vetoes, ["synth_4"]);

  assert.equal(gateVerdict(resumes(Array(7).fill("Y"))).pass, false, "too few resumes to gate");
  assert.equal(gateVerdict(resumes(Array(10).fill("Y")), { limited: true }).pass, false, "a --limit run is not a gate run");

  const missing = gateVerdict([...resumes(Array(9).fill("Y")), { fixture_id: "synth_9", problem: "no shown candidate report" }]);
  assert.equal(missing.pass, false, "a resume the candidate didn't report on, or the judge didn't finish, fails the gate");
  assert.equal(missing.not_judged.length, 1);
  assert.equal(gateLines(missing)[0], "GATE: FAIL");
}

// Grading: a clear pick of the rejected side is the failure that must never happen.
assert.equal(gradePair("X", { winner: "X", strength: "slight" }), "right");
assert.equal(gradePair("X", { winner: "tie", strength: "none" }), "tie_on_decisive");
assert.equal(gradePair("X", { winner: "Y", strength: "slight" }), "wrong_slight");
assert.equal(gradePair("X", { winner: "Y", strength: "clear" }), "wrong_clear");
assert.equal(gradePair("tie", { winner: "tie", strength: "none" }), "right");
assert.equal(gradePair("tie", { winner: "Y", strength: "slight" }), "acceptable");
assert.equal(gradePair("tie", { winner: "Y", strength: "clear" }), "wrong_clear");

// The blind view shows what a reader sees, and nothing about the run.
{
  const view = viewFromReport({
    score: 81,
    first_impression: "Verdict text.",
    top_fixes: [
      { fix: "First fix.", why: "Why one.", impact_level: "low", evidence: { excerpt: "- line one", section: "Experience" } },
      { fix: "Second fix.", why: "Why two.", impact_level: "high", evidence: { excerpt: "- line two", section: "Experience" } },
    ],
  });
  assert.deepEqual(view, {
    label: "Nothing critical",
    verdict: "Verdict text.",
    misses: [{ fix: "First fix.", why: "Why one.", resume_lines: ["- line one"] }],
  });
  assert.equal(viewFromReport({ top_fixes: [] }), null);

  // A missing-section marker is shown as what it is, not as a quoted resume line.
  const rendered = renderView({ ...viewA, misses: [{ fix: "Add a Skills section.", why: "x", resume_lines: ["No skills section present"] }] });
  assert.ok(rendered.includes("the report says the resume has no skills section"));
  assert.ok(!rendered.includes("\"No skills section present\""));
  assert.equal(viewFromReport({ first_impression: "x", top_fixes: [{ fix: "a" }, { fix: "b" }] }, 3)?.misses.length, 2);

  const prompt = pairwiseUserMessage({ id: "t", resume_text: "resume", review_date: "2026-11-01" }, viewA, viewB);
  for (const leak of ["gpt-", "prompt", "sha", "run_id", "eval_", "83b2a2d1", "55bee48b", "old", "new"]) {
    assert.ok(!prompt.toLowerCase().includes(leak), `the judge message must not mention "${leak}"`);
  }
}

// Only synthetic fixtures may reach a judge model.
{
  const calibration = JSON.parse(readFileSync(path.resolve(process.cwd(), "../tests/fixtures/calibration.json"), "utf8")) as CalibrationData;
  const judgeable = calibration.fixtures.filter(isJudgeableFixture).map((fixture) => fixture.id);
  assert.equal(judgeable.length, 10);
  assert.ok(judgeable.every((id) => id.startsWith("synth_")));
  for (const id of ["talent_leader_high_bar_matt_shaw_current_1", "golden_finance_controller_strong_foundation_1", "anchor_elite_pm_ai_1", "frontline_retail_entry_1"]) {
    assert.equal(isJudgeableFixture(calibration.fixtures.find((fixture) => fixture.id === id)), false, id);
  }
}

// Calibration sets load, cite real resume lines, and keep Matt's tally.
{
  const blind = loadBlindPick();
  assert.equal(blind.length, 10);
  const decisive = blind.filter((pair) => pair.expected !== "tie");
  assert.equal(decisive.length, 6);
  assert.equal(decisive.filter((pair) => pair.expected === pair.production_side).length, 5);
  for (const pair of blind) assert.deepEqual(unverifiedCitations(pair), [], pair.id);

  const contrast = loadContrastPairs();
  assert.ok(contrast.length >= 20);
  assert.equal(new Set(contrast.map((pair) => pair.id)).size, contrast.length);
  for (const pair of contrast) assert.deepEqual(unverifiedCitations(pair), [], pair.id);
  const expectedSides = contrast.filter((pair) => pair.expected !== "tie").map((pair) => pair.expected);
  assert.ok(expectedSides.filter((side) => side === "X").length >= 8 && expectedSides.filter((side) => side === "Y").length >= 8, "expected winners are spread across both sides");
}

// The judge never runs on the generator's model, and the spend ceiling holds.
(async () => {
  assert.notEqual(DEFAULT_JUDGE_CONFIG.model, GENERATOR_MODEL);
  assert.ok(PAIRWISE_SYSTEM_PROMPT.length > 4000, "the system prompt is long enough to be cached");
  const previousKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key";
  let calls = 0;
  const fakeFetch = (async () => {
    calls++;
    return {
      ok: true,
      json: async () => ({
        model: "gpt-6.1-sol",
        usage: { prompt_tokens: 1000, completion_tokens: 500 },
        choices: [{ finish_reason: "stop", message: { content: "{\"ok\":true}" } }],
      }),
    };
  }) as unknown as typeof fetch;
  const ledger = new SpendLedger(0.006);
  const first = await callJudge<{ ok: boolean }>("s", "u", {}, DEFAULT_JUDGE_CONFIG, ledger, fakeFetch);
  assert.equal(first.output.ok, true);
  assert.ok(Math.abs(first.costUsd - 0.007) < 1e-9, "1,000 input + 500 output tokens on Sol");
  await assert.rejects(callJudge("s", "u", {}, DEFAULT_JUDGE_CONFIG, ledger, fakeFetch), /ceiling/);
  await assert.rejects(callJudge("s", "u", {}, { ...DEFAULT_JUDGE_CONFIG, model: GENERATOR_MODEL }, new SpendLedger(1), fakeFetch), /generator/);
  assert.equal(calls, 1);

  // The eval runner's hook judges synthetic, shown reports only; real-person fixtures never reach a model.
  const originalFetch = globalThis.fetch;
  let hookCalls = 0;
  globalThis.fetch = (async () => {
    hookCalls++;
    const content = JSON.stringify({
      first_read: "r", most_important_issue: "i", unsupported_claims: [],
      criteria: {
        first_read_stakes: { score: 4, note: "n" }, concrete_fact: { score: 5, note: "n" },
        specific_ask: { score: 5, note: "n" }, recruiter_consequence: { score: 4, note: "n" },
        honest_ask: { score: 5, note: "n" }, gap_handling: { applies: false, score: 3, note: "Not applicable" },
      },
      right_thing_first: 4, rationale: "why", cited_resume_lines: [],
    });
    return { ok: true, json: async () => ({ model: "gpt-6.1-sol", usage: { prompt_tokens: 1000, completion_tokens: 100 }, choices: [{ finish_reason: "stop", message: { content } }] }) };
  }) as unknown as typeof fetch;
  try {
    const report = { first_impression: "Verdict.", top_fixes: [{ fix: "Add the budget size.", why: "Scale.", impact_level: "high", evidence: { excerpt: "- Own the budget" } }] };
    const synthetic = { id: "synth_example_1", tags: ["synthetic"], path: "golden/synth_example_1.txt" };
    const realPerson = { id: "golden_finance_controller_strong_foundation_1", tags: ["finance", "golden"], path: "smoke/finance_controller_strong_foundation_suzanne_allman_1.txt" };
    const hookLedger = new SpendLedger(1);
    assert.equal(await judgeEvalReport({ fixture: realPerson, resumeText: "x", status: "PASS", report, ledger: hookLedger }), null);
    assert.equal(await judgeEvalReport({ fixture: synthetic, resumeText: "x", status: "FAIL", report, ledger: hookLedger }), null);
    assert.equal(hookCalls, 0);
    const judged = await judgeEvalReport({ fixture: synthetic, resumeText: "- Own the budget", status: "PASS", report, ledger: hookLedger, reviewDate: "2026-11-01" });
    assert.equal(hookCalls, 1);
    assert.equal(judged?.overall, 4);
    assert.equal(judged?.veto, false);
    assert.equal(judged?.model, "gpt-6.1-sol");
  } finally {
    globalThis.fetch = originalFetch;
  }
  if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = previousKey;
  console.log("critical-miss-judge tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
