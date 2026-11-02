# Critical Miss judge: pairwise calibration

- Run: 2026-11-02T03:35:55.920Z
- Judge: `gpt-6.1-sol`, reasoning medium, seed 20261101
- Judge prompt SHA-256: `e1860dbf0284d6b762c71ccc62cc1d2108ba9b22eff5b02ff8c3e2d8365c52e3`
- Calls: 40; token-calculated spend: $0.3090

## Matt's blind pick

- Decisive: 4 of 6 right; 1 judged no real difference; 1 slight wrong; **0 clear wrong**.
- Expected no difference: 3 of 4 judged no real difference; 0 slight preference; 1 clear preference.
- Side orders disagreed (counted as a tie): 2 of 10.
- Judge preferred the production prompt in 4 of 6 items where it named a winner (Matt: 5 of 6).

| Item | Rule | Expected | Judge | Orders (XY / YX) | Grade | Note |
| --- | --- | --- | --- | --- | --- | --- |
| bp-01 | matt_decisive | B | B (clear) | Y clear / Y clear | right | Budget size is a tangible thing to grasp onto, it helps the recruiter understand the scale |
| bp-02 | matt_decisive | A | A (clear) | X clear / X clear | right |  |
| bp-03 | matt_no_difference | no difference | A (clear) | X clear / X clear | wrong_clear |  |
| bp-04 | matt_decisive | B | A (slight) | X slight / X clear | wrong_slight | Both are good though |
| bp-05 | matt_decisive | B | B (clear) | Y clear / Y clear | right | It's critical for sure if there is no more relevant work. This may be be a missing part of |
| bp-06 | matt_no_difference | no difference | no real difference | tie / tie | right | Same critical miss it looks like. Both are critical. Vague stuff |
| bp-07 | matt_no_difference | no difference | no real difference | tie / tie | right | Same issue |
| bp-08 | matt_decisive | B | no real difference | Y slight / X slight | tie_on_decisive |  |
| bp-09 | matt_no_difference | no difference | no real difference | Y slight / X clear | right |  |
| bp-10 | matt_decisive | B | B (clear) | Y clear / Y clear | right | Both critical and missing details. I think we should have multiple critical misses if they |

## Contrast pairs

- Decisive: 9 of 9 right; 0 judged no real difference; 0 slight wrong; **0 clear wrong**.
- Expected no difference: 1 of 1 judged no real difference; 0 slight preference; 0 clear preference.
- Side orders disagreed (counted as a tie): 0 of 10.

| Item | Rule | Expected | Judge | Orders (XY / YX) | Grade | Note |
| --- | --- | --- | --- | --- | --- | --- |
| cp-19 | C8_multiple_misses | A | A (slight) | X clear / X slight | right | Two critical issues exist (an open gap with no recent work, and an unsized budget); naming |
| cp-20 | C8_multiple_misses | A | A (clear) | X clear / X clear | right | Same first Critical Miss; B pads with two minor edits labeled critical. |
| cp-31 | C8_multiple_misses | B | B (clear) | Y clear / Y clear | right | A truly bad resume with three problems that would each cost an interview (open gap, unsupp |
| cp-32 | C8_multiple_misses | A | A (clear) | X clear / X clear | right | Same first Critical Miss. A's second is a real problem (an unsupported manager title); B's |
| cp-33 | C8_multiple_misses | A | A (clear) | X clear / X clear | right | A third real problem (no scale anywhere) is not padding just because it matters less than  |
| cp-34 | C8_multiple_misses | A | A (clear) | X clear / X clear | right | A strong resume: one first thing to fix. B adds a supporting-duty detail labeled critical, |
| cp-35 | tie_control | no difference | no real difference | tie / tie | right | Both flag the same two real problems, in the same order, worded differently. |
| cp-36 | C8_multiple_misses | B | B (clear) | Y clear / Y clear | right | More than three problems would each cost an interview (gap, no numbers, unsupported title, |
| cp-37 | C8_multiple_misses | B | B (clear) | Y clear / Y clear | right | A strong resume. A claims more than three Critical Misses; that is padding on a resume wit |
| cp-38 | C8_multiple_misses | B | B (clear) | Y clear / Y clear | right | A's second Critical Miss is a second ask on the line the first already covers (padding). S |

## Judge self-checks

- Veto claims dropped because the quote wasn't in the report: 0.
- Resume lines the judge cited that aren't verbatim in the resume: 0.
