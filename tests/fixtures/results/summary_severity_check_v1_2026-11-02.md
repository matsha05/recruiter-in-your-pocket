# Severity check v1 (wave 3, the honesty add-on)

Date: 2026-11-02. Branch `claude/severity-check`, cut from `origin/main` 568b923a with the validator commits from `claude/validator-v34-main`. Not pushed or deployed.

Matt, November 1: "i dont want to lie to people and say they have one critical miss if there are more."

**Result: the gate passes, and `RIYP_SEVERITY_CHECK` now defaults to on.**
- Under-count: 8 of 8.
- Over-count: 4 of 4.
- No vetoes on added Critical Misses.
- No smoke or golden regressions.

## What it is

Production's prompt (`83b2a2d1`) and its first fix are unchanged. After a resume report is written and validated, a second call reads the resume and the finished report:
- **Model and prompt:** `gpt-6.1-terra` at the resume report's effort; prompt `severity_check_v1` (SHA-256 `f1bb4571…`).
- **What it returns:** up to two more problems that would each cost an interview on their own, in priority order, with `more_critical` when the page has more than three in all.
- **The serious problems:** the six from v3: no recent relevant work, a latest relevant role with no size and no result, a title or headline above the work, no target role, contradictory dates, and a role with no dates.

The merge (`lib/reports/severity-check.ts`):
- **First fix:** never changes or moves.
- **Promotion:** when the check says Fix 2 or Fix 3 already names a problem, that fix is promoted.
- **Same line:** a new Critical Miss on the line Fix 2 or Fix 3 cites replaces that fix, so each line keeps one fix and the new one asks for what makes it serious.
- **Order and limits:** Critical Misses lead, and a report keeps at most three fixes. `more_critical` is set only with three.

The service (`lib/reports/severity-check-service.ts`) runs the merged report through the same validator and fabrication guard as the report itself:
1. It tries with all the new fixes, then with the first only.
2. Then it ships promotions alone, which change only flags and order.
3. Anything else ships the report exactly as it was. That covers a timeout, a provider error, a failed validation, a changed first fix, or a call that passes its deadline.

**Wiring:**
- **Routes:** both report routes, stream and JSON, behind `RIYP_SEVERITY_CHECK`, on by default; `false` turns it off.
- **Monitoring:** the counter `riyp.severity.outcome`, plus `llm.severity_check.*` logs that carry its latency and cost. Eval run files carry both per report and in the metadata.

The schema shape was sent to the signature-report session and matches what it built against:
- `top_fixes[i].critical`, all or nothing, with Critical Misses first;
- `more_critical` only with three.

## Gate (the preference bar doesn't apply: the first fix never changes)

| Run | Severity answers | Under-count (bar 8/8) | Over-count (bar 4/4) | Vetoes on added Critical Misses | Judge spend |
|:--|:--|:--|:--|:--|--:|
| [First run](judge/2026-11-02T17-09-22-990Z_severity_severity_v1_gate52.md) | `2026-11-02T17-00-37-745Z_severity_run.json` | **6 of 8** | 4 of 4 | 0 in 23 | $0.4179 |
| [Same answers, fixed code](judge/2026-11-02T17-23-10-050Z_severity_severity_v1_gate52_rescore.md) | `2026-11-02T17-18-19-663Z` (rescore) | 8 of 8 | 4 of 4 | 0 in 23 | $0.3586 |
| [Fresh answers](judge/2026-11-02T17-50-05-199Z_severity_severity_v1_gate52_fresh.md) | `2026-11-02T17-45-07-062Z_severity_run.json` | **8 of 8** | **4 of 4** | **0 in 24** | $0.4264 |

All three ran on the 52 judgeable fictional resumes, on top of production's saved reports (`judge_production_83b2a2d1_52b_live_run.json`), with judge v4 (`e1860dbf…`, `gpt-6.1-sol`). The fresh answers re-scored through the final code (`2026-11-02T18-31-25-485Z`, free) are byte-identical to the ones judged.

**Why the first run failed.** Both causes were code, not the prompt.
- **Staff accountant.** `"Job search and coursework,"`, with a comma closed inside the quotes, wasn't read as a suggested label, so both new fixes were refused. The fallback then promoted Fix 2 only because it cited the same line, but it asked for a discrepancy example, not size or a result.
- **Career changer.** The canonicalizer dropped the target-role fix, "Add a one-line headline above Experience naming the role you want." The rule was that "No summary section present" supports only a fix that says "summary".
- **Fixes, with paired tests:** a suggested label may end in a comma or period inside its quotes; the summary marker also supports a headline fix; a new fix on Fix 2's or Fix 3's line replaces it.

**Not gated: padding outside the key.** On extended reports outside the key, the blind count call rates most additions critical on their own:
- **Fresh run:** 17 of 20.
- **Rescore:** 18 of 20.
- **Not rated critical on their own:**
  - a supporting "contributed to various projects" bullet (sales executive);
  - an FEA result on a supporting duty (mechanical engineer);
  - a recency miss on the event planner, whose break is dated and explained. That one breaks the prompt's own rule.

**Disputed labels (warning only).** The blind call rates admin generalist P2 (both runs) and marketing director P3 (rescore) not critical on their own. Those are the same labels the v3 runs flagged.

## No regressions on smoke and golden

Fresh production runs on this branch, then the check on top of the same reports:

| Tier | Production run | Production alone | With the check | Reports extended | Status changes |
|:--|:--|:--|:--|:--|:--|
| Smoke | `eval_1793640242308` | 3 / 0 / 0 | 3 / 0 / 0 (`2026-11-02T18-28-35-187Z`) | 1 | none |
| Golden | `eval_1793640409975` | 22 / 0 / 1 as generated; 23 / 0 / 0 replayed | 23 / 0 / 0 (`2026-11-02T18-27-49-472Z`) | 6 (3 with two Critical Misses, 3 with three) | none |

- **The golden FAIL as generated was production's own report.** Production's HR manager report was withheld because the validator read "Most HR bullets describe duties…" as a name. The fix: quantifiers that open a sentence (Most, Many, Several…) are common words.
- **The same long tail showed in the check.** "List HR coursework…" was read as a name, so instructions that open a sentence (List, Include, Mention…) are common words too.
- **Validator checks:** both fixes have paired controls. The 43 saved production outputs still pass 42 of 43, and production's 52 replays are unchanged.
- **Real-person fixtures** in smoke and golden went only to the generation model, as every golden run does, never to the judge.

## Latency and cost

| Run | Mean | p50 | p90 | Max | Cost per report |
|:--|--:|--:|--:|--:|--:|
| Fresh 52 (call + validation) | 12.8 s | 10.7 s | 24.9 s | 57.0 s | $0.0024 |
| Golden 23 | 10.8 s | 4.0 s | 40.3 s | 49.6 s | $0.0011 |

- **The check runs in series after the report validates, so it adds to every report's wait.**
- **Bounds:** the call has a 45-second timeout and a hard deadline 5 seconds later. Validating the merged report is synchronous after that.
- **Without additions:** reports that need nothing back from the check usually finish in 1 to 4 seconds.

## Spend

| What | Runs | Calls | Cost |
|:--|:--|--:|--:|
| Check, count-check pilot | `2026-11-02T16-57-32-289Z` | 12 | $0.03501475 |
| Check, first 52 | `2026-11-02T17-00-37-745Z` | 52 | $0.11040185 |
| Check, fresh 52 | `2026-11-02T17-45-07-062Z` | 52 | $0.12587125 |
| Check, smoke and golden | `18-17-44-665Z`, `18-20-37-527Z`, `18-27-49-472Z`, `18-28-35-187Z` | 30 | $0.04503395 |
| Check, first golden pass, stopped before saving | none | about 22 | about $0.024 (estimated from the rerun) |
| Production smoke and golden generation | `eval_1793640242308`, `eval_1793640409975` | 32 | $0.48010275 |
| Judge, three severity gates | above | 176 | $1.2029 |
| **Total** | | | **about $2.02 of $8** |

## Not done or not verified

- **Not pushed, not deployed.** No production traffic has run the check. Its latency is from eval runs.
- **The first golden pass exited silently mid-run**, with no error, at exit code 0. That was the HR manager report, and rerun alone it completed. The cause wasn't found. A request promise that never settles is the likely one, so the service now races the call against a hard deadline and the report ships unchanged when it passes. A unit test covers a call that never resolves.
- **Padding outside the key isn't gated.** That's 2 or 3 of 20 additions per run.
- **Production's own first fix sometimes cites "No summary section present"** for a headline that exists. That's production's canonicalizer, unchanged here.
