# Critical Miss judge: count calibration

- Run: 2026-11-02T01:59:32.877Z
- Judge: `gpt-6.1-sol`, reasoning medium, seed 20261101
- Judge prompt SHA-256: `95d27089d35e661047483107105a0bee56465626b08698a2ac6e998e4f9d8d3b`
- Calls: 54; token-calculated spend: $0.1859

## Summary

- Gate outcome as labeled (keyed call on bad resumes, blind call on strong ones): 34 of 34 reports
- Labeled problem matched (keyed calls): 34 of 34 Critical Misses
- Critical on its own, as labeled (blind calls): 48 of 48 Critical Misses
  - Labeled critical, rated critical: 30 of 30
  - Labeled padding, rated not critical: 18 of 18
- Test-retest: 27 of 27 report-calls gave the same per-miss answers on every run

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
| cc-bad-2-a | blind | 1 | critical, critical | critical, critical | - | Two of three. |
| cc-bad-2-a | keyed | 1 | critical/P1, critical/P2 | critical/P1, critical/P2 | pass (pass) | Two of three. |
| cc-bad-2-b | blind | 1 | critical, padding | critical, not | - | One real problem plus padding on the older role. |
| cc-bad-2-b | keyed | 1 | critical/P1, padding/none | critical/P1, not/none | fail (fail) | One real problem plus padding on the older role. |
| cc-bad-2-c | blind | 1 | critical, critical | critical, critical | - | The brand target first, then results. |
| cc-bad-2-c | keyed | 1 | critical/P3, critical/P1 | critical/P3, critical/P1 | pass (pass) | The brand target first, then results. |
| cc-bad-2-d | blind | 1 | critical | critical | - | Stops at one. |
| cc-bad-2-d | keyed | 1 | critical/P1 | critical/P1 | fail (fail) | Stops at one. |
| cc-bad-2-e | blind | 1 | critical, padding | critical, not | - | One real problem plus a second ask on the same line. |
| cc-bad-2-e | keyed | 1 | critical/P1, padding/? | critical/P1, not/none | fail (fail) | One real problem plus a second ask on the same line. |
| cc-strong-1-a | blind | 1 | open | not | pass (pass) | The one first fix. |
| cc-strong-1-b | blind | 1 | open, padding | not, not | fail (fail) | Pads with a supporting duty. |
| cc-strong-1-c | blind | 1 | open, padding | not, not | fail (fail) | Pads with an optional Skills section. |
| cc-strong-1-d | blind | 1 | open | not | fail (fail) | The one first fix, but says there are more than three. |
| cc-strong-2-a | blind | 1 | open | not | pass (pass) | The one first fix. |
| cc-strong-2-b | blind | 1 | open, padding | not, not | fail (fail) | Pads with a detail on the older role. |
| cc-strong-2-c | blind | 1 | open, padding, padding | not, not, not | fail (fail) | Pads with a supporting duty, then the older role. |
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
| cc-bad-2-a | blind | 2 | critical, critical | critical, critical | - | Two of three. |
| cc-bad-2-a | keyed | 2 | critical/P1, critical/P2 | critical/P1, critical/P2 | pass (pass) | Two of three. |
| cc-bad-2-b | blind | 2 | critical, padding | critical, not | - | One real problem plus padding on the older role. |
| cc-bad-2-b | keyed | 2 | critical/P1, padding/none | critical/P1, not/none | fail (fail) | One real problem plus padding on the older role. |
| cc-bad-2-c | blind | 2 | critical, critical | critical, critical | - | The brand target first, then results. |
| cc-bad-2-c | keyed | 2 | critical/P3, critical/P1 | critical/P3, critical/P1 | pass (pass) | The brand target first, then results. |
| cc-bad-2-d | blind | 2 | critical | critical | - | Stops at one. |
| cc-bad-2-d | keyed | 2 | critical/P1 | critical/P1 | fail (fail) | Stops at one. |
| cc-bad-2-e | blind | 2 | critical, padding | critical, not | - | One real problem plus a second ask on the same line. |
| cc-bad-2-e | keyed | 2 | critical/P1, padding/? | critical/P1, not/none | fail (fail) | One real problem plus a second ask on the same line. |
| cc-strong-1-a | blind | 2 | open | not | pass (pass) | The one first fix. |
| cc-strong-1-b | blind | 2 | open, padding | not, not | fail (fail) | Pads with a supporting duty. |
| cc-strong-1-c | blind | 2 | open, padding | not, not | fail (fail) | Pads with an optional Skills section. |
| cc-strong-1-d | blind | 2 | open | not | fail (fail) | The one first fix, but says there are more than three. |
| cc-strong-2-a | blind | 2 | open | not | pass (pass) | The one first fix. |
| cc-strong-2-b | blind | 2 | open, padding | not, not | fail (fail) | Pads with a detail on the older role. |
| cc-strong-2-c | blind | 2 | open, padding, padding | not, not, not | fail (fail) | Pads with a supporting duty, then the older role. |
