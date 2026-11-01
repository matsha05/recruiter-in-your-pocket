# Critical Miss judge: calibration, November 1, 2026

Judge `critical-miss-judge-v3` (prompt SHA-256 `e36e7dae19536291b3f27275b66123f5583e960c4fb0f8c3636a8cf8870568bd`) on `gpt-6.1-sol`, medium reasoning, seed 20261101. Rubric: [critical-miss-rubric.md](../../../docs/evals/critical-miss-rubric.md). How to read results: [critical-miss-judge.md](../../../docs/evals/critical-miss-judge.md). Raw outputs are in [judge/](judge/).

Only synthetic and fictional resumes were sent: the ten synthetic blind-pick resumes and 25 hand-written fictional contrast pairs. No smoke fixture or real-person golden fixture reached a model.

## Result against the targets

| Target | Result |
| --- | --- |
| Matt's 6 decisive picks: at least 5 reproduced | **5 of 6** |
| Never strongly prefer a side Matt rejected | **0 clear picks against Matt** (one slight, bp-04) |
| Contrast pairs right | **25 of 25** (23 decisive, 2 tie controls) |
| Test-retest, same seed (35 pairs × 2) | **35 of 35** same winner and strength |
| Test-retest, different seed (19 pairs) | **19 of 19** same winner and strength |
| Side-order flips | **0 of 89** pair-runs |

The verdicts are stable, but the outputs aren't copies: none of the 70 same-seed repeat rationales, and none of the 38 different-seed ones, matched the first run's text. Across 140 single-order calls, the first-shown report won 62 times and the second 62 (the rest were ties), so there is no sign of position bias.

### Matt's blind pick (v3)

| Item | Matt | Judge | Agrees |
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
| bp-09 operations assistant | no difference | production, slight | tie item |

Where the judge named a winner, it preferred the production prompt in 6 of 8 items. Matt preferred it in 5 of 6.

**Where it disagreed with Matt, and why:**

- **bp-04, project manager (decisive, slight).** The judge prefers the new side's "Name the product or infrastructure upgrade you directed" on the role's lead bullet, which already carries the $12M budget. Matt preferred naming a priority behind the executive-collaboration bullet, and wrote "Both are good though". The judge applies C1 (lead bullet over a supporting one). Nothing in his notes says why the supporting bullet won, so the rubric wasn't bent to fit. Across runs, the side-order verdicts were "slight / clear", then "slight / slight" under another seed. That is the weakest preference in the set, and it is in the right strength band.
- **bp-03, data scientist (tie item, clear).** The judge prefers the Critical Miss on the readmissions result over "Nothing critical" plus an optional mentoring edit. Matt saw no difference on November 1, but he has since decided there is no "Nothing critical" state. The judge follows that decision (C5), not the earlier tie.
- **bp-09, operations assistant (tie item, slight).** The judge slightly prefers naming the records and reports over "Add any relevant activity after your Greenfield role ended." It reads that gap fix as giving no help (C4).

## Absolute mode (v3)

26 single-report scores, 13 pairs × 2 sides:

- **Veto**: fired on all 5 sides written to be unsupported or dishonest: the invented trial count, the team size already stated, the misread end date, "led" for "supported", and the invented consulting role. It fired on none of the 21 grounded sides, including all 12 blind-pick sides (Matt recorded 0 vetoes).
- **Ranking of Matt's decisive picks**: the side he preferred scored higher in 4 of 6, tied in 1 (bp-08, 3 and 3), and lower in 1 (bp-04, 3 against 5). Absolute scores are coarser than pairwise; use `compare` to decide between prompts.
- Every quote behind a veto appeared in its report, and every resume line the judge cited was verbatim.

## The CLI on real run files

`compare` on the two live runs behind the blind pick: production `eval_1793553133997` (`83b2a2d1`) against the reverted candidate `eval_1793560808592` (`55bee48b`).

- 9 synthetic fixtures were compared. The finance analyst had no shown report in both runs. Every non-synthetic fixture was skipped and never sent.
- Production was preferred in 6 (4 clear), the candidate in 2 (1 clear), and 1 was a tie. That is the same direction as Matt's 5 to 1. The candidate's two wins are the HR manager (as Matt) and the project manager (bp-04, as above).
- `score --limit 3` on the production run: no vetoes; mean right-thing-first 3.67.

## What changed between versions, and why

| Version | Blind pick, decisive | Contrast | Change that followed |
| --- | --- | --- | --- |
| v1 | 3 of 6; **2 clear misses** (bp-02, bp-08), 1 slight (bp-04) | 22 of 22 | C4 read as "an open gap with no recent work always wins" |
| v2 | 5 of 6; 0 clear misses | 24 of 25 | 2 false vetoes on missing-section markers; a fixture error |
| v3 | 5 of 6; 0 clear misses | 25 of 25 | none |

- **v1 → v2 (C4).** In v1 the judge picked the gap clearly in bp-02 and bp-08, where Matt picked the line edit. Two refinements followed from his picks and his HR note, and are written into the rubric:
  - A dated, explained break, or a return the summary states, counts as answered on the page.
  - A gap fix that gives no help ("say what you've done since") still beats a narrow line edit, but loses slightly to a concrete fix on the core work of the latest role. That ordering fits the HR pick and the sales pick at once.

  Three contrast pairs were added to test these outside the blind-pick items (cp-23 to cp-25).
- **v2 → v3 (veto).**
  - The judge vetoed the production contract's "No skills section present" marker twice, though neither resume had a Skills section. Missing-section markers are now shown as what they are, and the veto text says such a report is right when no section with that heading exists.
  - The veto text now treats characterizations ("your clearest result") as judgment, not fact.
  - The judge's one v2 contrast miss was a fixture error of mine: cp-23's correct side called a project "your biggest project", which the resume doesn't state, and the judge vetoed it. cp-13's losing side had the same error. Both fixtures are fixed and noted in the pair data.

## Spend

Token-calculated, `gpt-6.1-sol` at published standard rates. Total **$2.21** of the $3.00 budget:

| Run | Calls | Spend |
| --- | --- | --- |
| Access check | 1 | $0.0003 |
| Pilot, bp-01 | 2 | $0.0189 |
| v1, all 32 pairs | 64 | $0.3974 |
| v2, all 35 pairs | 70 | $0.4546 |
| v3, all 35 pairs × 2 | 140 | $0.7742 |
| v3, 19 pairs, seed 7 | 38 | $0.1909 |
| v3, absolute, 26 sides | 26 | $0.2199 |
| `compare` on the two live runs | 18 | $0.1209 |
| `score --limit 3` | 3 | $0.0294 |

A full `compare` of two 10-fixture golden runs costs about $0.12.

## Limits

- **In-sample.** The rubric's gap sub-rules were refined after seeing v1 miss bp-02 and bp-08, so 5 of 6 is a training-set number. The contrast pairs were written from the same rubric. The first held-out test is prompt v3's blind pick: have the judge record its verdicts before Matt's picks are revealed.
- **Thin reasoning.** At medium effort, Sol used no reasoning tokens in 96 of 140 calls (mean 21). The results held anyway; high effort is untested.
- **Same vendor and generation** as the generator, and no cross-vendor key was available.
