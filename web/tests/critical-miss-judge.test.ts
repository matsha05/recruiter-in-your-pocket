import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gradePair, loadBlindPick, loadContrastPairs, unverifiedCitations } from "../lib/evals/judge/calibration";
import { callJudge, DEFAULT_JUDGE_CONFIG, GENERATOR_MODEL, SpendLedger } from "../lib/evals/judge/client";
import { combineOrders, countUserMessage, judgeCount, pairwiseUserMessage, resolveOrder } from "../lib/evals/judge/modes";
import { COUNT_SYSTEM_PROMPT, PAIRWISE_SYSTEM_PROMPT } from "../lib/evals/judge/prompt";
import { gateLines, gateVerdict, type CountGate } from "../lib/evals/judge/gate";
import {
  badResumeOutcome,
  keyCheckView,
  keyResumeErrors,
  loadCountCalibration,
  loadCountKey,
  strongResumeOutcome,
  type CountCheckOutcome,
} from "../lib/evals/judge/count";
import type { AbsoluteResult, CountKeyProblem, CountRawVerdict, CountResult, CriticalMissView, PairwiseRawVerdict, PairwiseResult } from "../lib/evals/judge/types";
import { containsQuote, isJudgeableFixture, renderView, shownView, viewFromReport, viewText } from "../lib/evals/judge/view";
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

// The prompt-change gate: candidate preferred on at least 80% of resumes, ties against, zero candidate vetoes,
// and the count checks on every labeled resume.
const countOutcome = (fixture_id: string, kind: "bad" | "strong", pass: boolean, extra: Partial<CountCheckOutcome> = {}): CountCheckOutcome =>
  ({ fixture_id, kind, pass, flagged: 1, ...extra });
const countOk: CountGate = {
  key_errors: [],
  outcomes: [
    ...Array.from({ length: 8 }, (_, index) => countOutcome(`synth_cc_bad_${index}`, "bad", true)),
    ...Array.from({ length: 4 }, (_, index) => countOutcome(`synth_cc_strong_${index}`, "strong", true)),
  ],
};
{
  const pair = (winner: "X" | "Y" | "tie") => ({ winner, strength: winner === "tie" ? "none" : "slight" }) as unknown as PairwiseResult;
  const alone = (veto = false) => ({ veto }) as unknown as AbsoluteResult;
  const resumes = (winners: Array<"X" | "Y" | "tie">, vetoAt = -1) =>
    winners.map((winner, index) => ({ fixture_id: `synth_${index}`, pairwise: pair(winner), candidate_absolute: alone(index === vetoAt) }));

  const pass = gateVerdict(resumes(["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "tie", "X"]), { count: countOk });
  assert.equal(pass.pass, true, "8 of 10 meets the bar");
  assert.equal(pass.share, 0.8);
  assert.equal(gateLines(pass)[0], "GATE: PASS");
  assert.ok(gateLines(pass).includes("- Under-count, labeled bad resumes: 8 of 8 flag at least 2 of 3 labeled problems (bar: all)"));
  assert.ok(gateLines(pass).includes("- Over-count, labeled strong resumes: 4 of 4 without padding (bar: all)"));

  const ties = gateVerdict(resumes(["Y", "Y", "Y", "Y", "Y", "Y", "Y", "tie", "tie", "tie"]), { count: countOk });
  assert.equal(ties.pass, false, "ties count against the candidate");
  assert.match(ties.reasons[0], /7 of 10/);

  const vetoed = gateVerdict(resumes(Array(10).fill("Y"), 4), { count: countOk });
  assert.equal(vetoed.pass, false, "one candidate veto fails the gate");
  assert.deepEqual(vetoed.candidate_vetoes, ["synth_4"]);

  assert.equal(gateVerdict(resumes(Array(7).fill("Y")), { count: countOk }).pass, false, "too few resumes to gate");
  assert.equal(gateVerdict(resumes(Array(10).fill("Y")), { limited: true, count: countOk }).pass, false, "a --limit run is not a gate run");

  const missing = gateVerdict([...resumes(Array(9).fill("Y")), { fixture_id: "synth_9", problem: "no shown candidate report" }], { count: countOk });
  assert.equal(missing.pass, false, "a resume the candidate didn't report on, or the judge didn't finish, fails the gate");
  assert.equal(missing.not_judged.length, 1);
  assert.equal(gateLines(missing)[0], "GATE: FAIL");

  // Count checks: required, and every labeled resume must pass.
  const all = resumes(Array(10).fill("Y"));
  const noCount = gateVerdict(all);
  assert.equal(noCount.pass, false, "a gate run without the count checks fails");
  assert.ok(noCount.reasons.some((reason) => /count checks can't run/.test(reason)));
  const keyMissing = gateVerdict(all, { count: { key_errors: ["count-check key not found at x"], outcomes: [] } });
  assert.equal(keyMissing.pass, false, "no key, no pass");
  assert.ok(gateLines(keyMissing).includes("- Key: count-check key not found at x"));

  const under = gateVerdict(all, { count: { ...countOk, outcomes: countOk.outcomes.map((outcome, index) => index === 2 ? { ...outcome, pass: false, caught: ["P1"] } : outcome) } });
  assert.equal(under.pass, false, "one bad resume with fewer than 2 of 3 labeled problems flagged fails the gate");
  assert.deepEqual(under.count.under_count, ["synth_cc_bad_2"]);
  assert.match(under.reasons.join(" "), /under-count on 1 bad resume/);

  const over = gateVerdict(all, { count: { ...countOk, outcomes: countOk.outcomes.map((outcome, index) => index === 9 ? { ...outcome, pass: false, padding: [2] } : outcome) } });
  assert.equal(over.pass, false, "padding on one strong resume fails the gate");
  assert.deepEqual(over.count.over_count, ["synth_cc_strong_1"]);

  const unjudged = gateVerdict(all, { count: { ...countOk, outcomes: countOk.outcomes.map((outcome, index) => index === 0 ? { ...outcome, pass: false, problem: "no shown candidate report" } : outcome) } });
  assert.equal(unjudged.pass, false, "a keyed resume missing from the candidate run fails the gate");
  assert.equal(unjudged.count.under_count.length, 0, "unjudged is reported as unjudged, not as an under-count");
  assert.ok(gateLines(unjudged).includes("- Not count-checked: synth_cc_bad_0: no shown candidate report"));
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

// What a reader sees: every flagged Critical Miss by default, or only the first fix of an unflagged report.
{
  const flaggedReport = {
    first_impression: "x",
    more_critical: true,
    top_fixes: [{ fix: "a", critical: true }, { fix: "b", critical: true }, { fix: "c", critical: false }],
  };
  assert.deepEqual(shownView(flaggedReport)?.misses.map((miss) => miss.fix), ["a", "b"]);
  assert.equal(shownView(flaggedReport)?.more_than_three, true);
  assert.deepEqual(shownView({ first_impression: "x", top_fixes: [{ fix: "a" }, { fix: "b" }] })?.misses.map((miss) => miss.fix), ["a"], "an unflagged report shows one Critical Miss, as production renders it");
  assert.equal(shownView({ first_impression: "x", top_fixes: [{ fix: "a" }, { fix: "b" }] }, 3)?.misses.length, 2, "--max-misses overrides");
  assert.equal(shownView({ first_impression: "x", top_fixes: [{ fix: "a", critical: true }] })?.more_than_three, undefined);
  const signal = renderView({ ...viewA, more_than_three: true });
  assert.match(signal, /more than three Critical Misses/);
  assert.ok(viewText({ ...viewA, more_than_three: true }).includes("more than three Critical Misses"), "a quote of the signal can back a veto");
}

// The count-check key: three verbatim, distinct problems per bad resume, none on a strong one, and enough of each.
{
  const resume = "Director of Operations\nMar 2021 - Aug 2024\n- Scheduled driver shifts\n- Answered calls";
  const problem = (id: CountKeyProblem["id"], line: string): CountKeyProblem => ({ id, problem: "p", why: "w", lines: [line] });
  const good = { fixture_id: "synth_cc_x_bad_1", kind: "bad" as const, problems: [problem("P1", "Mar 2021 - Aug 2024"), problem("P2", "Director of Operations"), problem("P3", "- Scheduled driver shifts")] };
  assert.deepEqual(keyResumeErrors(good, resume), []);
  assert.match(keyResumeErrors({ ...good, problems: good.problems.slice(0, 2) }, resume).join(), /exactly three problems/);
  assert.match(keyResumeErrors({ ...good, problems: [good.problems[0], good.problems[1], problem("P3", "- Invented line")] }, resume).join(), /isn't verbatim/);
  assert.match(keyResumeErrors({ ...good, problems: [good.problems[0], good.problems[1], problem("P3", "Director of Operations")] }, resume).join(), /shares a line/);
  assert.match(keyResumeErrors({ fixture_id: "synth_cc_y_strong_1", kind: "strong", problems: [good.problems[0]] }, resume).join(), /no labeled problems/);

  const dir = mkdtempSync(path.join(tmpdir(), "riyp-count-key-"));
  const fixtures = new Map<string, { id: string; tags: string[]; path: string }>();
  const resumes = [];
  for (let index = 0; index < 8; index++) {
    const id = `synth_cc_role${index}_bad_1`;
    fixtures.set(id, { id, tags: ["synthetic", "fictional", "count_check"], path: `countcheck/${id}.txt` });
    resumes.push({ ...good, fixture_id: id });
  }
  for (let index = 0; index < 4; index++) {
    const id = `synth_cc_role${index}_strong_1`;
    fixtures.set(id, { id, tags: ["synthetic", "fictional", "count_check"], path: `countcheck/${id}.txt` });
    resumes.push({ fixture_id: id, kind: "strong", problems: [] });
  }
  const keyPath = path.join(dir, "key.json");
  writeFileSync(keyPath, JSON.stringify({ version: 1, resumes }));
  assert.deepEqual(loadCountKey(keyPath, fixtures, () => resume).errors, []);
  writeFileSync(keyPath, JSON.stringify({ version: 1, resumes: resumes.slice(1) }));
  assert.match(loadCountKey(keyPath, fixtures, () => resume).errors.join(), /7 bad resumes; the gate needs at least 8/);
  fixtures.set("synth_cc_role0_bad_1", { id: "synth_cc_role0_bad_1", tags: ["golden"], path: "smoke/real_person_1.txt" });
  writeFileSync(keyPath, JSON.stringify({ version: 1, resumes }));
  assert.match(loadCountKey(keyPath, fixtures, () => resume).errors.join(), /can't be sent to the judge/, "a real person's resume is refused even when keyed");
  assert.match(loadCountKey(path.join(dir, "absent.json"), fixtures, () => resume).errors.join(), /not found/);
}

// Count outcomes: a bad resume needs 2 of 3 distinct labeled problems; a strong one, no padding after the first.
{
  const answer = (misses: Array<[boolean, CountRawVerdict["misses"][number]["matches"]]>): CountResult => ({
    case_id: "t", keyed: true, cost_usd: 0, latency_ms: 0,
    raw: { rationale: "", misses: misses.map(([critical, matches], index) => ({ number: index + 1, addresses: "", critical_on_its_own: critical, matches, note: "" })) },
  });
  const viewOf = (count: number, more = false): CriticalMissView => ({ ...viewA, misses: Array(count).fill(viewA.misses[0]), ...(more ? { more_than_three: true } : {}) });
  assert.equal(badResumeOutcome("b", viewOf(3), answer([[true, "P1"], [true, "P2"], [true, "P3"]])).pass, true);
  assert.equal(badResumeOutcome("b", viewOf(2), answer([[true, "P3"], [true, "P1"]])).pass, true);
  const duplicate = badResumeOutcome("b", viewOf(2), answer([[true, "P1"], [true, "P1"]]));
  assert.equal(duplicate.pass, false, "two Critical Misses on one labeled problem count once");
  assert.deepEqual(duplicate.caught, ["P1"]);
  assert.equal(badResumeOutcome("b", viewOf(1), answer([[true, "P1"]])).pass, false, "stopping at one fails");
  assert.equal(badResumeOutcome("b", viewOf(2), answer([[true, "P1"], [false, "none"]])).pass, false);

  assert.equal(strongResumeOutcome("s", viewOf(1), answer([[false, "none"]])).pass, true, "the first Critical Miss on a strong resume isn't rated");
  const padded = strongResumeOutcome("s", viewOf(3), answer([[true, "none"], [true, "none"], [false, "none"]]));
  assert.equal(padded.pass, false);
  assert.deepEqual(padded.padding, [3]);
  assert.equal(strongResumeOutcome("s", viewOf(2), answer([[true, "none"], [true, "none"]])).pass, true, "an extra the judge rates critical on its own isn't padding");
  assert.equal(strongResumeOutcome("s", viewOf(1, true), answer([[true, "none"]])).pass, false, "\"more than three\" on a strong resume is padding");

  // The blind call on a bad resume flags labels it doesn't rate critical on their own: a warning, not a fail.
  const disputed = badResumeOutcome("b", viewOf(3), answer([[true, "P1"], [true, "P2"], [true, "P3"]]), answer([[true, "none"], [false, "none"], [true, "none"]]));
  assert.equal(disputed.pass, true);
  assert.deepEqual(disputed.disputed, ["P2"]);
  assert.deepEqual(badResumeOutcome("b", viewOf(2), answer([[true, "P1"], [false, "none"]]), answer([[true, "none"], [false, "none"]])).disputed, [], "an unmatched Critical Miss isn't a disputed label");
  const warned = gateVerdict(Array.from({ length: 10 }, (_, index) => ({
    fixture_id: `synth_${index}`,
    pairwise: { winner: "Y", strength: "slight" } as unknown as PairwiseResult,
    candidate_absolute: { veto: false } as unknown as AbsoluteResult,
  })), { count: { ...countOk, outcomes: countOk.outcomes.map((outcome, index) => index === 1 ? { ...outcome, disputed: ["P3"] } : outcome) } });
  assert.equal(warned.pass, true, "a disputed label doesn't fail the gate");
  assert.deepEqual(warned.count.disputed, ["synth_cc_bad_1 P3"]);
  assert.ok(gateLines(warned).some((line) => line.startsWith("- Warning (not a fail)") && line.includes("synth_cc_bad_1 P3")));

  // The key check shows a bad resume's labeled problems as one report's Critical Misses.
  const keyView = keyCheckView({ fixture_id: "b", kind: "bad", problems: [{ id: "P1", problem: "No end date.", why: "w", lines: ["Jan 2020 -"] }] });
  assert.deepEqual(keyView.misses, [{ fix: "No end date.", why: "w", resume_lines: ["Jan 2020 -"] }]);
}

// The count calibration set: fictional, verbatim, and labeled for every Critical Miss.
{
  const sets = loadCountCalibration();
  assert.ok(sets.filter((resume) => resume.kind === "bad").length >= 2 && sets.filter((resume) => resume.kind === "strong").length >= 2);
  for (const resume of sets) {
    if (resume.kind === "bad") assert.deepEqual(keyResumeErrors({ fixture_id: resume.id, kind: "bad", problems: resume.problems }, resume.input.resume_text), [], resume.id);
    else assert.equal(resume.problems.length, 0);
    for (const report of resume.reports) {
      assert.equal(report.expected_critical.length, report.view.misses.length, report.id);
      if (resume.kind === "bad") assert.equal(report.expected_matches?.length, report.view.misses.length, report.id);
      for (const line of report.view.misses.flatMap((miss) => miss.resume_lines)) {
        assert.ok(line === "No skills section present" || containsQuote(resume.input.resume_text, line), `${report.id}: ${line}`);
      }
    }
  }
  const reports = sets.flatMap((resume) => resume.reports);
  assert.ok(reports.some((report) => report.expected_pass) && reports.some((report) => !report.expected_pass), "both outcomes are tested");
}

// The count prompt and message: the labeled problems appear only when given, and nothing about the run leaks.
{
  assert.match(COUNT_SYSTEM_PROMPT, /would cost an interview on its own/);
  assert.match(PAIRWISE_SYSTEM_PROMPT, /not padding just because it matters less than the first/);
  const labeled: CountKeyProblem[] = [{ id: "P1", problem: "No attainment.", why: "w", lines: ["- Exceeded quota"] }];
  const keyedMessage = countUserMessage({ id: "t", resume_text: "resume", review_date: "2026-11-01" }, viewA, labeled);
  assert.match(keyedMessage, /LABELED PROBLEMS/);
  assert.match(keyedMessage, /P1: No attainment\./);
  const blindMessage = countUserMessage({ id: "t", resume_text: "resume", review_date: "2026-11-01" }, viewA);
  assert.ok(!blindMessage.includes("LABELED PROBLEMS"), "a strong resume's call is blind");
  for (const leak of ["gpt-", "prompt", "sha", "run_id", "eval_", "candidate", "production"]) {
    assert.ok(!keyedMessage.toLowerCase().includes(leak), `the count message must not mention "${leak}"`);
  }
}

async function countCallTests() {
  const answerWith = (misses: unknown[]) => (async () => ({
    ok: true,
    json: async () => ({
      model: "gpt-6.1-sol",
      usage: { prompt_tokens: 1000, completion_tokens: 100 },
      choices: [{ finish_reason: "stop", message: { content: JSON.stringify({ misses, rationale: "r" }) } }],
    }),
  })) as unknown as typeof fetch;
  const input = { id: "t", resume_text: "- Exceeded quota", review_date: "2026-11-01" };
  const labeled: CountKeyProblem[] = [{ id: "P1", problem: "No attainment.", why: "w", lines: ["- Exceeded quota"] }];
  const entry = (number: number, matches: string) => ({ number, addresses: "a", critical_on_its_own: true, matches, note: "n" });
  const keyed = await judgeCount(input, viewA, { ledger: new SpendLedger(1), fetchImpl: answerWith([entry(1, "P1")]) }, labeled);
  assert.equal(keyed.keyed, true);
  assert.equal(keyed.raw.misses[0].matches, "P1");
  const unlisted = await judgeCount(input, viewA, { ledger: new SpendLedger(1), fetchImpl: answerWith([entry(1, "P2")]) }, labeled);
  assert.equal(unlisted.raw.misses[0].matches, "none", "a match to a problem that isn't labeled is dropped");
  const blind = await judgeCount(input, viewA, { ledger: new SpendLedger(1), fetchImpl: answerWith([entry(1, "P1")]) });
  assert.equal(blind.keyed, false);
  assert.equal(blind.raw.misses[0].matches, "none", "a blind call never matches");
  // A dropped connection is retried, like a 5xx: three tries in all.
  const dropping = (failures: number) => {
    let calls = 0;
    const impl = (async (...args: Parameters<typeof fetch>) => {
      if (calls++ < failures) throw new TypeError("fetch failed");
      return answerWith([entry(1, "P1")])(...args);
    }) as unknown as typeof fetch;
    return { impl, calls: () => calls };
  };
  const twice = dropping(2);
  assert.equal((await judgeCount(input, viewA, { ledger: new SpendLedger(1), fetchImpl: twice.impl, backoffMs: [0, 0] }, labeled)).raw.misses[0].matches, "P1");
  assert.equal(twice.calls(), 3);
  const thrice = dropping(3);
  await assert.rejects(judgeCount(input, viewA, { ledger: new SpendLedger(1), fetchImpl: thrice.impl, backoffMs: [0, 0] }, labeled), /fetch failed/);
  assert.equal(thrice.calls(), 3);
  await assert.rejects(
    judgeCount(input, viewA, { ledger: new SpendLedger(1), fetchImpl: answerWith([entry(1, "P1"), entry(2, "none")]) }),
    /covers 1,2 Critical Misses; the report has 1/,
    "an answer that doesn't cover each Critical Miss once, in order, is an error",
  );
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
  await countCallTests();
  if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = previousKey;
  console.log("critical-miss-judge tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
