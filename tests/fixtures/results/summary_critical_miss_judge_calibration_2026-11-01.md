# Critical Miss judge: calibration, November 1, 2026

Judge `critical-miss-judge-v3` (prompt SHA-256 `e36e7dae19536291b3f27275b66123f5583e960c4fb0f8c3636a8cf8870568bd`). Default model `gpt-6.1-sol`, medium reasoning, seed 20261101, also run on `gpt-6-astra`. Rubric: [critical-miss-rubric.md](../../../docs/evals/critical-miss-rubric.md). How to read results: [critical-miss-judge.md](../../../docs/evals/critical-miss-judge.md). Raw outputs are in [judge/](judge/).

Only synthetic and fictional resumes were sent: the ten synthetic blind-pick resumes and 30 hand-written fictional contrast pairs. No smoke fixture or real-person golden fixture reached a model.

## Result against the targets

| Target | `gpt-6.1-sol` (default) | `gpt-6-astra` |
| --- | --- | --- |
| Matt's 6 decisive picks: at least 5 reproduced | **5 of 6** | **5 of 6** |
| Never strongly prefer a side Matt rejected | **0 clear** (one slight, bp-04) | **0 clear** (one slight, bp-04) |
| Contrast pairs, as written before the run | **29 of 30** | **29 of 30** |
| Same-seed retest | **40 of 40** pairs, same winner and strength | not rerun |
| Different-seed retest | **24 of 24** pairs, same winner and strength | not rerun |
| Side-order flips | **0 of 104** pair-runs | 1 of 40 (bp-09) |
| Position: first-shown wins / second-shown wins | 89 / 89 of 208 calls | 34 / 36 of 80 calls |
| Self-preference (see below) | **+0.00** | n/a |

The two judges gave the same verdict and strength on 39 of 40 pairs. The one difference is bp-09: Astra's two side orders disagreed, which counts as a tie. Astra matched Sol and cost about 5.6 times as much ($2.49 for 80 calls, against about $0.44 for 80 Sol calls), so **Sol stays the default**. `--model gpt-6-astra` remains available.

The verdicts are stable, but the outputs aren't copies: no rerun's rationale repeated the first run's text.

### Matt's blind pick (both judges)

| Item | Matt | Judge (Sol; Astra where it differs) | Agrees |
| --- | --- | --- | --- |
| bp-01 UX manager | production (budget size) | production, clear | yes |
| bp-02 software engineer | production (AWS component) | production, clear | yes |
| bp-04 project manager | production, "Both are good though" | new, slight | **no, slight** |
| bp-05 HR manager | new (open gap) | new, clear | yes |
| bp-08 sales executive | production (account tasks) | production, slight | yes |
| bp-10 marketing executive | production (over "Nothing critical") | production, clear | yes |
| bp-03 data scientist | no difference | production, clear | tie item |
| bp-06 finance analyst | no difference | no difference | tie item |
| bp-07 product manager | no difference | no difference | tie item |
| bp-09 operations assistant | no difference | production, slight (Astra: tie, orders disagreed) | tie item |

Where Sol named a winner, it preferred the production prompt in 6 of 8 items. Matt preferred it in 5 of 6.

**Where it disagreed with Matt, and why:**

- **bp-04, project manager (decisive, slight, both judges).** The judges prefer the new side's "Name the product or infrastructure upgrade you directed" on the role's lead bullet, which already has the $12M budget. Matt preferred naming a priority behind the executive-collaboration bullet, and wrote "Both are good though". The judges apply C1 (the lead bullet over a supporting one). Nothing in his notes explains the other choice, so the rubric wasn't bent to fit. This is the weakest preference in the set, and it is in the right strength band.
- **bp-03, data scientist (tie item, clear).** The judges prefer the Critical Miss on the readmissions result over "Nothing critical" plus an optional mentoring edit. Matt saw no difference on November 1, but he has since decided there is no "Nothing critical" state. The judge follows that decision (C5), not the earlier tie.
- **bp-09, operations assistant (tie item).** Sol slightly prefers naming the records and reports over "Add any relevant activity after your Greenfield role ended.", reading that gap fix as giving no help (C4). Astra's two orders split.

### Contrast pairs

30 fictional pairs, each isolating one rubric rule. The rules covered:

| Rule | Pairs |
| --- | --- |
| C2, concrete fact over a structural move | 3 |
| C1, first-read stakes | 3 |
| C4, gaps | 7 |
| C7, honest ask | 2 |
| V, grounded (veto) | 4 |
| C3, specific ask | 2 |
| C5, always a top fix | 2 |
| C8, multiple Critical Misses | 2 |
| Not a Critical Miss (ATS keywords, a single typo) | 2 |
| Tie controls | 3 |

Both judges got 29 of 30 as originally labeled. The miss is **cp-26**. It was written so that a better *why* breaks a tie between two identical fixes. Both judges said "no real difference" on every run, because the fix itself is the same. Matt's finance-analyst note ("Same critical miss it looks like", where the two whys differed) supports the judges, so the rubric now says identical fixes are no real difference. The pair was relabeled to a tie control, with a `relabeled` note in the data. The judge prompt didn't change.

Pairs cp-23 to cp-25 were added after v1 to test the refined gap rule outside the blind-pick items. Pairs cp-26 to cp-30 were added in the final round, before any run.

## Self-preference

A judge may favor text from its own model. To measure that, Sol wrote its own Critical Miss for each of the ten blind-pick resumes, from a short instruction without the rubric. Sol and Astra then each compared it, in both orders, with the production report's Critical Miss (`gpt-6.1-terra`).

| Judge | Sol-written side preferred (win 1, tie 0.5) | Wins / ties / losses |
| --- | --- | --- |
| `gpt-6.1-sol` (the author) | 0.20 | 1 / 2 / 7 |
| `gpt-6-astra` | 0.20 | 1 / 2 / 7 |

Self-preference = 0.20 − 0.20 = **+0.00**. The two judges reached the same verdict on all ten items. Sol's own Critical Misses lost mostly because they rewrote summaries or Skills lines (C1). Both sides of a prompt comparison come from the same generator, so a family preference can't favor one prompt over the other anyway. Ten items can't rule out a small effect.

## Absolute mode (Sol)

26 single-report scores, 13 pairs × 2 sides:

- **Veto**: fired on all 5 sides written to be unsupported or dishonest: the invented trial count, the team size already stated, the misread end date, "led" for "supported", and the invented consulting role. It fired on none of the 21 grounded sides, including all 12 blind-pick sides (Matt recorded 0 vetoes).
- **Ranking of Matt's decisive picks**: his side scored higher in 4 of 6, tied in 1 (bp-08, 3 and 3), and lower in 1 (bp-04, 3 against 5). Absolute scores are coarser than pairwise; use `compare` to decide between prompts.
- Every quote behind a veto appeared in its report, and every resume line the judge cited was verbatim.

## The CLI on real run files

`compare` on the two live runs behind the blind pick: production `eval_1793553133997` (`83b2a2d1`) against the reverted candidate `eval_1793560808592` (`55bee48b`), both on `gpt-6.1-terra`.

- 9 synthetic fixtures were compared. The finance analyst had no shown report in both runs. Every non-synthetic fixture was skipped and never sent.
- Production was preferred in 6 (4 clear), the candidate in 2 (1 clear), and 1 was a tie: the same direction as Matt's 5 to 1.
- `score --limit 3` on the production run: no vetoes; mean right-thing-first 3.67.

## What changed between versions, and why

| Version | Blind pick, decisive | Contrast | Change that followed |
| --- | --- | --- | --- |
| v1 (Sol) | 3 of 6; **2 clear misses** (bp-02, bp-08), 1 slight (bp-04) | 22 of 22 | C4 read as "an open gap with no recent work always wins" |
| v2 (Sol) | 5 of 6; 0 clear misses | 24 of 25 | 2 false vetoes on missing-section markers; a fixture error |
| v3 (Sol, Astra) | 5 of 6; 0 clear misses | 29 of 30 as written | rubric wording on identical fixes (cp-26); prompt unchanged |

- **v1 → v2 (C4).** In v1 the judge picked the gap clearly in bp-02 and bp-08, where Matt picked the line edit. Two refinements followed from his picks and his HR note:
  - A dated, explained break, or a return the summary states, counts as answered on the page.
  - A gap fix that gives no help loses slightly to a concrete fix on the latest role's core work, but beats a narrow line edit. That ordering fits the HR pick and the sales pick at once.
- **v2 → v3 (veto).**
  - The judge vetoed the production contract's "No skills section present" marker twice, though neither resume had a Skills section. Missing-section markers are now shown as what they are.
  - Characterizations such as "your clearest result" count as judgment, not fact.
  - Two fixture errors of mine were caught by the veto ("your biggest project" in cp-23 and cp-13). Both are fixed and noted.

## Spend

Token-calculated at published standard rates. Total **$6.07** of the $8.00 cap:

| Run | Calls | Model | Spend |
| --- | --- | --- | --- |
| Access check | 1 | Sol | $0.0003 |
| Pilot, bp-01 | 2 | Sol | $0.0189 |
| v1, 32 pairs | 64 | Sol | $0.3974 |
| v2, 35 pairs | 70 | Sol | $0.4546 |
| v3, 35 pairs × 2 | 140 | Sol | $0.7742 |
| v3, 19 pairs, seed 7 | 38 | Sol | $0.1909 |
| v3, absolute, 26 sides | 26 | Sol | $0.2199 |
| `compare` on the two live runs | 18 | Sol | $0.1209 |
| `score --limit 3` | 3 | Sol | $0.0294 |
| Astra pilot, 2 pairs | 4 | Astra | $0.1698 |
| v3, 5 new pairs × 2 | 20 | Sol | $0.1024 |
| v3, all 40 pairs | 80 | Astra | $2.4946 |
| Self-preference: 10 written, 40 judged | 50 | Sol and Astra | $1.0534 |
| v3, 5 new pairs, seed 7 | 10 | Sol | $0.0476 |

A Sol `compare` of two 10-fixture golden runs costs about $0.12 and takes about a minute.

## Limits

- **In-sample.** The gap sub-rules were refined after v1 missed bp-02 and bp-08, so 5 of 6 is a training-set number. The contrast pairs were written from the same rubric. The first held-out test is prompt v3's blind pick: have the judge record its verdicts before Matt's picks are revealed.
- **Thin reasoning.** At medium effort, Sol used no reasoning tokens in 128 of 208 v3 calls (mean 25), and Astra in 60 of 80. The results held anyway. High effort is untested.
- **One vendor.** Both judges and the generator are OpenAI GPT-6 models, and no cross-vendor key was available. The self-preference probe found no own-model bias, on ten items.
