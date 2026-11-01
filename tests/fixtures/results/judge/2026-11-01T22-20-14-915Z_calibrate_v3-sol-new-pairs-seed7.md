# Critical Miss judge: pairwise calibration

- Run: 2026-11-01T22:20:14.902Z
- Judge: `gpt-6.1-sol`, reasoning medium, seed 7
- Judge prompt SHA-256: `e36e7dae19536291b3f27275b66123f5583e960c4fb0f8c3636a8cf8870568bd`
- Calls: 10; token-calculated spend: $0.0476

## Contrast pairs

- Decisive: 4 of 5 right; 1 judged no real difference; 0 slight wrong; **0 clear wrong**.
- Side orders disagreed (counted as a tie): 0 of 5.

| Item | Rule | Expected | Judge | Orders (XY / YX) | Grade | Note |
| --- | --- | --- | --- | --- | --- | --- |
| cp-26 | C6_recruiter_consequence | B | no real difference | tie / tie | tie_on_decisive | Same fix on the same line; a role-specific consequence beats a why that only restates the  |
| cp-27 | C7_honest_ask | A | A (clear) | X clear / X clear | right | Same line; asking for verifiable figures beats telling the person to estimate a number if  |
| cp-28 | not_a_critical_miss | B | B (clear) | Y clear / Y clear | right | 'Add keywords so the ATS doesn't reject you' is not a Critical Miss; a concrete gap in cur |
| cp-29 | not_a_critical_miss | A | A (clear) | X clear / X clear | right | A single typo is not the thing to fix first when the current role's main responsibility ha |
| cp-30 | C1_first_read_stakes | B | B (clear) | Y clear / Y clear | right | A pattern across the latest role (a director title over bullets that all read as support)  |

## Judge self-checks

- Veto claims dropped because the quote wasn't in the report: 0.
- Resume lines the judge cited that aren't verbatim in the resume: 0.
