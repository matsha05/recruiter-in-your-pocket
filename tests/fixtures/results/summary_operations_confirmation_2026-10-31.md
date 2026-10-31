# PromptOps Live Eval Report

**Run ID:** eval_1793469152573
**Timestamp:** 2026-10-31T17:53:36.916Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation
**Model:** gpt-6.1-terra
**Reasoning effort:** medium
**Resume prompt SHA-256:** 83b2a2d1f9cde086ebb28fc2e0596ed7c58e6c4f905c4f57fe56cc86e9665107
**Resume ideas prompt SHA-256:** 6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7
**Incomplete-response retry:** high reasoning

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 1 |
| ✅ Passed | 0 |
| ⚠️ Warned | 0 |
| ❌ Failed | 1 |
| Pass Rate | 0.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 2 |
| Token-calculated API Cost | $0.050490 |
| Input Tokens | 18,661 |
| Cached Input Tokens | 0 |
| Output Tokens | 5,433 |
| Reasoning Tokens | 1,758 |
| Budget | $1.00 |

## ❌ Blocking Failures

These must be fixed before shipping.

### synth_operations_manager_entry_weak_1

**Status:** FAIL
**Score:** 58 (expected: 55–68)

**Errors (ship blockers):**
- `E_SCHEMA`: Production validation failed after repair: The model response failed the evidence grounding contract at score_plain unsupported narrative facts: more, would, handled.
