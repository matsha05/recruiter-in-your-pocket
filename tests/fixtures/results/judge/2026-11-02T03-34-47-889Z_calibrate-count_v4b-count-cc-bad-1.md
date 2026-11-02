# Critical Miss judge: count calibration

- Run: 2026-11-02T03:34:47.886Z
- Judge: `gpt-6.1-sol`, reasoning medium, seed 20261101
- Judge prompt SHA-256: `e1860dbf0284d6b762c71ccc62cc1d2108ba9b22eff5b02ff8c3e2d8365c52e3`
- Calls: 20; token-calculated spend: $0.0761

## Summary

- Gate outcome as labeled (keyed call on bad resumes, blind call on strong ones): 10 of 10 reports
- Labeled problem matched (keyed calls): 18 of 18 Critical Misses
- Critical on its own, as labeled (blind calls): 20 of 20 Critical Misses
  - Labeled critical, rated critical: 16 of 16
  - Labeled padding, rated not critical: 4 of 4
- Test-retest: 10 of 10 report-calls gave the same per-miss answers on every run

| Report | Call | Run | Expected (per miss) | Judge (per miss) | Gate outcome (expected) | Note |
| --- | --- | --- | --- | --- | --- | --- |
| cc-bad-1-a | blind | 1 | critical, critical, critical | critical, critical, critical | - | All three, in order. |
| cc-bad-1-a | keyed | 1 | critical/P1, critical/P2, critical/P3 | critical/P1, critical/P2, critical/P3 | pass (pass) | All three, in order. |
| cc-bad-1-b | blind | 1 | critical | critical | - | Stops at one. |
| cc-bad-1-b | keyed | 1 | critical/P3 | critical/P3 | fail (fail) | Stops at one. |
| cc-bad-1-c | blind | 1 | critical, critical | critical, critical | - | The title problem worded differently and citing a bullet, then the gap. |
| cc-bad-1-c | keyed | 1 | critical/P2, critical/P1 | critical/P2, critical/P1 | pass (pass) | The title problem worded differently and citing a bullet, then the gap. |
| cc-bad-1-d | blind | 1 | critical, padding | critical, not | - | One real problem plus an optional Skills section. |
| cc-bad-1-d | keyed | 1 | critical/P3, padding/none | critical/P3, not/none | fail (fail) | One real problem plus an optional Skills section. |
| cc-bad-1-e | blind | 1 | critical, padding | critical, not | - | The scale problem twice: the second asks for a count on a supporting duty. |
| cc-bad-1-e | keyed | 1 | critical/P3, padding/? | critical/P3, not/none | fail (fail) | The scale problem twice: the second asks for a count on a supporting duty. |
| cc-bad-1-a | blind | 2 | critical, critical, critical | critical, critical, critical | - | All three, in order. |
| cc-bad-1-a | keyed | 2 | critical/P1, critical/P2, critical/P3 | critical/P1, critical/P2, critical/P3 | pass (pass) | All three, in order. |
| cc-bad-1-b | blind | 2 | critical | critical | - | Stops at one. |
| cc-bad-1-b | keyed | 2 | critical/P3 | critical/P3 | fail (fail) | Stops at one. |
| cc-bad-1-c | blind | 2 | critical, critical | critical, critical | - | The title problem worded differently and citing a bullet, then the gap. |
| cc-bad-1-c | keyed | 2 | critical/P2, critical/P1 | critical/P2, critical/P1 | pass (pass) | The title problem worded differently and citing a bullet, then the gap. |
| cc-bad-1-d | blind | 2 | critical, padding | critical, not | - | One real problem plus an optional Skills section. |
| cc-bad-1-d | keyed | 2 | critical/P3, padding/none | critical/P3, not/none | fail (fail) | One real problem plus an optional Skills section. |
| cc-bad-1-e | blind | 2 | critical, padding | critical, not | - | The scale problem twice: the second asks for a count on a supporting duty. |
| cc-bad-1-e | keyed | 2 | critical/P3, padding/? | critical/P3, not/none | fail (fail) | The scale problem twice: the second asks for a count on a supporting duty. |
