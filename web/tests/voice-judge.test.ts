import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SpendLedger } from "../lib/evals/judge/client";
import { agreement, cohensKappa, inPrompt, loadCalibrationRatings, loadCalibrationSet } from "../lib/evals/voice-judge/calibration";
import { batchUserMessage, batches, judgeStrings, mergeBatch } from "../lib/evals/voice-judge/judge";
import { lexicalTics, looksLikeCode } from "../lib/evals/voice-judge/lexical";
import { TIC_GUIDE, VOICE_JUDGE_SYSTEM_PROMPT, VOICE_RESPONSE_FORMAT, voiceJudgePromptSha256 } from "../lib/evals/voice-judge/prompt";
import { TICS, type StringScore } from "../lib/evals/voice-judge/types";

const repoRoot = path.resolve(process.cwd(), "..");
const copySystem = readFileSync(path.join(repoRoot, "docs/copy-system.md"), "utf8");

// The tic ids are the copy system's §4, in the same order, and the prompt explains every one.
{
  const section = copySystem.slice(copySystem.indexOf("## 4. The tics"), copySystem.indexOf("## 5. The glossary"));
  const docIds = [...section.matchAll(/^\| ([a-z_]+) \|/gm)].map((match) => match[1]).filter((id) => id !== "id");
  assert.deepEqual(docIds, [...TICS], "docs/copy-system.md §4 and TICS must list the same tics in the same order");
  assert.deepEqual(TIC_GUIDE.map((row) => row.id), [...TICS], "the prompt's tic guide covers every tic, in order");
  const schemaTics = (VOICE_RESPONSE_FORMAT.json_schema.schema.properties.results.items.properties.tics.items as unknown as { enum: string[] }).enum;
  assert.deepEqual(schemaTics, [...TICS]);
}

// A prompt change needs a fresh calibration on both sets: the shipped prompt is the one the held-out record measured.
{
  const record = JSON.parse(readFileSync(path.join(repoRoot, "docs/copy/judge/calibration-v4-heldout-2026-11-06.json"), "utf8"));
  assert.equal(voiceJudgePromptSha256(), record.meta.prompt_sha256, "the judge prompt changed: rerun npm run copy:judge -- calibrate on both sets and point this test at the new record");
}

// The prompt carries the voice decisions it judges by.
for (const phrase of ["a little bit coach", "one exclamation point on a real win", "never claim to know how someone feels", "No slang or swearing", "My reports", "Get your free report"]) {
  assert.ok(VOICE_JUDGE_SYSTEM_PROMPT.includes(phrase), `prompt mentions "${phrase}"`);
}

// No calibration line is in the prompt, so every one is a held-out test.
{
  const set = loadCalibrationSet();
  assert.equal(set.real_lines.length, 40);
  const leaked = set.real_lines.filter((line) => inPrompt(line.text));
  assert.deepEqual(leaked.map((line) => line.id), [], "calibration lines must not appear in the judge prompt");
  const ratings = loadCalibrationRatings();
  assert.equal(Object.keys(ratings.lines).length, 40, "every calibration line has a hand label");
  assert.match(ratings.rated_by, /by hand/);
  // The held-out set is the honest number: none of its lines, nor a distinctive phrase from them, may reach the prompt.
  const heldOut = loadCalibrationSet("docs/copy/calibration/heldout-2026-11-06.json");
  const heldOutRatings = loadCalibrationRatings("docs/copy/calibration/heldout-ratings-2026-11-06.json");
  assert.equal(heldOut.real_lines.length, 24);
  assert.equal(Object.keys(heldOutRatings.lines).length, 24);
  assert.deepEqual(heldOut.real_lines.filter((line) => inPrompt(line.text)).map((line) => line.id), []);
  for (const phrase of ["Maybe later", "were sent", "Weighing other tools", "Get pass", "Run Another", "Nothing here yet"]) {
    assert.ok(!VOICE_JUDGE_SYSTEM_PROMPT.includes(phrase), `held-out phrase "${phrase}" must not be in the prompt`);
  }
}

// Pattern checks: the coined and retired words.
const tics = (text: string, moment = "marketing", kind = "jsx-text") => lexicalTics({ text, moment, kind });
assert.ok(tics("A recruiter's read is the one that decides.").length === 0 || !tics("A recruiter's read is the one that decides.").includes("coined_word"), "a countable read is fine");
assert.ok(tics("You're in. Five more reads.").every((tic) => tic !== "coined_word"), "'five more reads' is fine (Matt, Nov 6)");
assert.ok(tics("It doesn't pass the read for you.").includes("coined_word"));
assert.ok(tics("The read moved after your revision.").includes("coined_word"));
assert.ok(tics("This is good. Why is it halfway down the page?").every((tic) => tic !== "coined_word"), "the page as the sheet is fine");
assert.ok(tics("What the page supports is unclear.").includes("coined_word"));
assert.ok(tics("What keeps tripping recruiters up, and what keeps landing.").includes("coined_word"));
assert.ok(tics("Your Verdict and where your resume stands").includes("retired_name"));
assert.ok(tics("One Critical Miss. Fix it first.", "report").includes("retired_name"));
assert.ok(tics("Review my resume", "extension").includes("retired_name"));
assert.ok(tics("A recruiter would bucket you fast.").includes("rejected_phrase"));

// Exclamation points: one earned on a win is the voice; overuse or the wrong moment is the tic.
assert.ok(!tics("You're in! Five more reads.", "pricing").includes("exclamation"));
assert.ok(!tics("Up 6 since last time. That's the right direction!", "account").includes("exclamation"));
assert.ok(tics("You're in!! Five more reads.", "pricing").includes("exclamation"));
assert.ok(tics("Great! Now upload it!", "upload").includes("exclamation"));
assert.ok(tics("Something broke!", "error").includes("exclamation"));
assert.ok(tics("We couldn't send a code. Try again!", "auth").includes("exclamation"));
assert.ok(tics("Full refund within 14 days!", "pricing").includes("exclamation"));

// Warmth without the costume.
assert.ok(tics("Dude, this is killer.").includes("slang"));
assert.ok(!tics("This is killer! You say what you did and what it changed.", "report").includes("slang"), "'killer' with a reason is allowed");
assert.ok(tics("Great job!", "report").includes("empty_praise"));
assert.ok(!tics("This is killer! You say what you did and what it changed.", "report").includes("empty_praise"));
assert.ok(tics("Don't worry, every strong resume started here.", "report").includes("invented_emotion"));
assert.ok(tics("You're probably feeling discouraged.", "report").includes("invented_emotion"));
assert.ok(!tics("Not hearing back is rough, and it doesn't mean you're not qualified.", "report").includes("invented_emotion"));

// Mechanics.
assert.ok(tics("Please upload a PDF, DOCX, or TXT file.", "upload").includes("please"));
assert.ok(tics("Upload Resume", "shared").includes("title_case"));
assert.ok(!tics("Job Search Pass", "pricing").includes("title_case"));
assert.ok(tics("Admin client not configured", "account", "key:message").includes("internal_term"));
assert.ok(tics("How the report works: the score, the write-up, the lines", "marketing", "key:title").includes("colon_fragment"));
assert.ok(tics("Not forty tips. Every line a recruiter trips on.").includes("not_x_but_y"));
assert.ok(tics("No ATS score. No interview odds. Just what reads clearly and what doesn't.").includes("not_x_but_y"));
assert.ok(tics("This result serves as proof of your leadership.").includes("copula_avoidance"));
assert.deepEqual(tics("Lines not listed are fine as written.", "report"), []);
assert.deepEqual(tics("Stripe handles your card. We never see or store the number.", "pricing"), []);

// Code that slipped into the inventory never reaches the judge.
assert.ok(looksLikeCode("border-brand/30 bg-card text-foreground"));
assert.ok(looksLikeCode("<div style=\"x\">Hi</div>"));
assert.ok(!looksLikeCode("Five more reads for $29."));

// Batching and merging.
{
  assert.deepEqual(batches([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  const items = [
    { id: "a", text: "Upload Resume", moment: "shared", kind: "jsx-text" },
    { id: "b", text: "Lines not listed are fine as written.", moment: "report" },
  ];
  assert.match(batchUserMessage(items), /\[a\] \(shared · text on the screen\) Upload Resume/);
  const merged = mergeBatch(items, {
    results: [
      { id: "b", names_subject: true, says_what_happens: true, recruiter_would_say: true, one_aside_at_most: true, tics: [], verdict: "us", rewrite: "Should be dropped", reason: "Plain." },
    ],
  });
  assert.deepEqual(merged.missing, ["a"], "an id the judge left out is reported, not scored");
  assert.equal(merged.scores[0].rewrite, "", "a passing string has no rewrite");
}

// Kappa: perfect agreement is 1; agreement no better than chance is 0.
assert.equal(cohensKappa([["us", "us"], ["no", "no"], ["flat", "flat"]]), 1);
assert.equal(Math.round(cohensKappa([["us", "us"], ["us", "no"], ["no", "us"], ["no", "no"]]) * 100) / 100, 0);

// Agreement uses the labels, never shows them to the judge, and splits out held-out lines.
{
  const set = loadCalibrationSet();
  const ratings = loadCalibrationRatings();
  const scores: StringScore[] = set.real_lines.map((line) => ({
    id: `cal-${line.id}`,
    text: line.text,
    moment: line.moment,
    names_subject: true,
    says_what_happens: true,
    recruiter_would_say: true,
    one_aside_at_most: true,
    tics: [],
    verdict: ratings.lines[String(line.id)].verdict,
    rewrite: "",
    reason: "",
    lexical_tics: [],
  }));
  const result = agreement(set, ratings, scores);
  assert.equal(result.exact, 40);
  assert.equal(result.kappa, 1);
  assert.equal(result.held_out.judged, 40);
}

// The paid path: a stubbed call, the spend ledger, and the generator model refused.
(async () => {
  process.env.OPENAI_API_KEY = "test-key";
  const items = [{ id: "a", text: "Upload Resume", moment: "shared" }];
  const body = {
    model: "gpt-6.1-sol",
    usage: { prompt_tokens: 3000, completion_tokens: 400 },
    choices: [{ finish_reason: "stop", message: { content: JSON.stringify({ results: [{ id: "a", names_subject: true, says_what_happens: true, recruiter_would_say: false, one_aside_at_most: true, tics: ["title_case"], verdict: "no", rewrite: "Upload a resume", reason: "Title Case on a control." }] }) } }],
  };
  const fetchImpl = (async () => new Response(JSON.stringify(body), { status: 200 })) as typeof fetch;
  const ledger = new SpendLedger(1);
  const run = await judgeStrings(items, { model: "gpt-6.1-sol", reasoningEffort: "low", seed: 1, maxCompletionTokens: 1000, batchSize: 12 }, ledger, { fetchImpl });
  assert.equal(run.scores[0].verdict, "no");
  assert.deepEqual(run.scores[0].lexical_tics, ["title_case"]);
  assert.ok(run.cost_usd > 0 && run.cost_usd < 0.02);
  const refused = await judgeStrings(items, { model: "gpt-6.1-terra", reasoningEffort: "low", seed: 1, maxCompletionTokens: 1000, batchSize: 12 }, new SpendLedger(1), { fetchImpl });
  assert.equal(refused.scores.length, 0);
  assert.match(refused.errors[0], /generator's model/);
  console.log("voice-judge tests passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
