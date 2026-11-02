# Critical Miss judge: pairwise calibration

- Run: 2026-11-01T22:01:43.643Z
- Judge: `gpt-6.1-sol`, reasoning medium, seed 7
- Judge prompt SHA-256: `e36e7dae19536291b3f27275b66123f5583e960c4fb0f8c3636a8cf8870568bd`
- Calls: 38; token-calculated spend: $0.1909

## Matt's blind pick

- Decisive: 5 of 6 right; 0 judged no real difference; 1 slight wrong; **0 clear wrong**.
- Expected no difference: 2 of 4 judged no real difference; 1 slight preference; 1 clear preference.
- Side orders disagreed (counted as a tie): 0 of 10.
- Judge preferred the production prompt in 6 of 8 items where it named a winner (Matt: 5 of 6).

| Item | Rule | Expected | Judge | Orders (XY / YX) | Grade | Note |
| --- | --- | --- | --- | --- | --- | --- |
| bp-01 | matt_decisive | B | B (clear) | Y clear / Y clear | right | Budget size is a tangible thing to grasp onto, it helps the recruiter understand the scale |
| bp-02 | matt_decisive | A | A (clear) | X clear / X clear | right |  |
| bp-03 | matt_no_difference | no difference | A (clear) | X clear / X clear | wrong_clear |  |
| bp-04 | matt_decisive | B | A (slight) | X slight / X slight | wrong_slight | Both are good though |
| bp-05 | matt_decisive | B | B (clear) | Y clear / Y clear | right | It's critical for sure if there is no more relevant work. This may be be a missing part of |
| bp-06 | matt_no_difference | no difference | no real difference | tie / tie | right | Same critical miss it looks like. Both are critical. Vague stuff |
| bp-07 | matt_no_difference | no difference | no real difference | tie / tie | right | Same issue |
| bp-08 | matt_decisive | B | B (slight) | Y slight / Y slight | right |  |
| bp-09 | matt_no_difference | no difference | B (slight) | Y slight / Y slight | acceptable |  |
| bp-10 | matt_decisive | B | B (clear) | Y clear / Y clear | right | Both critical and missing details. I think we should have multiple critical misses if they |

## Contrast pairs

- Decisive: 7 of 7 right; 0 judged no real difference; 0 slight wrong; **0 clear wrong**.
- Expected no difference: 2 of 2 judged no real difference; 0 slight preference; 0 clear preference.
- Side orders disagreed (counted as a tie): 0 of 9.

| Item | Rule | Expected | Judge | Orders (XY / YX) | Grade | Note |
| --- | --- | --- | --- | --- | --- | --- |
| cp-06 | C4_gap_handling | A | A (clear) | X clear / X clear | right | An open gap of more than two years with no recent work, handled with real help, beats a li |
| cp-07 | C4_gap_handling | B | B (clear) | Y clear / Y clear | right | A closed gap between two past roles, followed by nearly five years of relevant work, is no |
| cp-08 | C4_gap_handling | B | B (clear) | Y clear / Y clear | right | A dated, explained break followed by relevant current work is not the thing to fix first. |
| cp-09 | C4_gap_handling | A | A (clear) | X clear / X clear | right | Same open gap on both sides; real help (dating activity already on the page) beats 'say wh |
| cp-21 | tie_control | no difference | no real difference | tie / tie | right | The same fix on the same line, worded differently. |
| cp-22 | tie_control | no difference | no real difference | tie / tie | right | Two concrete asks on the same current-role line; a mild preference is acceptable, a clear  |
| cp-23 | C4_gap_handling | A | A (clear) | X clear / X clear | right | A dated, explained break with a stated return answers the gap on the page, even with nothi |
| cp-24 | C4_gap_handling | B | B (slight) | Y slight / Y slight | right | An open gap whose fix gives no help loses to a concrete, specific fix on the core work of  |
| cp-25 | C4_gap_handling | A | A (clear) | X clear / X clear | right | An open gap, even with a fix that gives no help, beats a narrow request for one example on |

## Judge self-checks

- Veto claims dropped because the quote wasn't in the report: 0.
- Resume lines the judge cited that aren't verbatim in the resume: 0.
