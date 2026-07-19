# PromptOps Live Eval Report

**Run ID:** eval_1784470075604
**Timestamp:** 2026-07-19T14:08:57.985Z
**Tier:** golden
**Prompt Version:** v1
**Contract Version:** v2
**Execution Mode:** Live model evaluation

## Summary

| Metric | Value |
|:-------|:------|
| Total Fixtures | 8 |
| ✅ Passed | 0 |
| ⚠️ Warned | 1 |
| ❌ Failed | 7 |
| Pass Rate | 0.0% |

## Cost

| Metric | Value |
|:-------|:------|
| API Calls | 8 |
| Actual Cost | $0.2000 |
| Budget | $0.20 |

## ❌ Blocking Failures

These must be fixed before shipping.

### synth_data_scientist_senior_elite_1

**Status:** FAIL
**Score:** 88 (expected: 85–95)

**Errors (ship blockers):**
- `E_EVIDENCE_NOT_VERBATIM`: Fix 1 evidence must be a verbatim resume excerpt
- `E_EVIDENCE_NOT_VERBATIM`: Fix 2 evidence must be a verbatim resume excerpt
- `E_EVIDENCE_NOT_VERBATIM`: Fix 3 evidence must be a verbatim resume excerpt
- `E_REWRITE_ORIGINAL_NOT_VERBATIM`: Rewrite 1 original must be a verbatim resume excerpt
- `E_REWRITE_ORIGINAL_NOT_VERBATIM`: Rewrite 2 original must be a verbatim resume excerpt
- `E_REWRITE_ORIGINAL_NOT_VERBATIM`: Rewrite 3 original must be a verbatim resume excerpt

**Warnings:**
- `W_SUMMARY_STRUCTURE`: Summary missing: gap indicator

**Evidence Issues:**
- Fix 1: not_verbatim
- Fix 2: not_verbatim
- Fix 3: not_verbatim

### synth_marketing_manager_vp_elite_1

**Status:** FAIL
**Score:** 88 (expected: 85–95)

**Errors (ship blockers):**
- `E_EVIDENCE_NOT_VERBATIM`: Fix 1 evidence must be a verbatim resume excerpt
- `E_EVIDENCE_NOT_VERBATIM`: Fix 2 evidence must be a verbatim resume excerpt
- `E_EVIDENCE_NOT_VERBATIM`: Fix 3 evidence must be a verbatim resume excerpt
- `E_REWRITE_ORIGINAL_NOT_VERBATIM`: Rewrite 1 original must be a verbatim resume excerpt
- `E_REWRITE_ORIGINAL_NOT_VERBATIM`: Rewrite 2 original must be a verbatim resume excerpt
- `E_REWRITE_ORIGINAL_NOT_VERBATIM`: Rewrite 3 original must be a verbatim resume excerpt

**Evidence Issues:**
- Fix 1: not_verbatim
- Fix 2: not_verbatim
- Fix 3: not_verbatim

### synth_software_engineer_mid_strong_1

**Status:** FAIL
**Score:** 85 (expected: 78–88)

**Errors (ship blockers):**
- `E_EVIDENCE_NOT_VERBATIM`: Fix 2 evidence must be a verbatim resume excerpt
- `E_REWRITE_OUTCOME_INFLATION`: Rewrite 1 adds unsupported outcomes: resulting

**Evidence Issues:**
- Fix 2: not_verbatim

### synth_ux_designer_director_strong_1

**Status:** FAIL
**Score:** 85 (expected: 78–88)

**Errors (ship blockers):**
- `E_EVIDENCE_NOT_VERBATIM`: Fix 1 evidence must be a verbatim resume excerpt
- `E_EVIDENCE_NOT_VERBATIM`: Fix 2 evidence must be a verbatim resume excerpt
- `E_EVIDENCE_NOT_VERBATIM`: Fix 3 evidence must be a verbatim resume excerpt
- `E_REWRITE_ORIGINAL_NOT_VERBATIM`: Rewrite 1 original must be a verbatim resume excerpt
- `E_REWRITE_ORIGINAL_NOT_VERBATIM`: Rewrite 2 original must be a verbatim resume excerpt
- `E_REWRITE_ORIGINAL_NOT_VERBATIM`: Rewrite 3 original must be a verbatim resume excerpt
- `E_REWRITE_OUTCOME_INFLATION`: Rewrite 3 adds unsupported outcomes: enhancing

**Evidence Issues:**
- Fix 1: not_verbatim
- Fix 2: not_verbatim
- Fix 3: not_verbatim

### synth_hr_manager_director_foundation_1

**Status:** FAIL
**Score:** 75 (expected: 68–78)

**Errors (ship blockers):**
- `E_REWRITE_OUTCOME_INFLATION`: Rewrite 1 adds unsupported outcomes: resulting
- `E_REWRITE_OUTCOME_INFLATION`: Rewrite 2 adds unsupported outcomes: enhancing
- `E_REWRITE_OUTCOME_INFLATION`: Rewrite 3 adds unsupported outcomes: improving

### synth_finance_analyst_senior_weak_1

**Status:** FAIL
**Score:** 70 (expected: 55–68)

**Errors (ship blockers):**
- `E_REWRITE_OUTCOME_INFLATION`: Rewrite 1 adds unsupported outcomes: resulting
- `E_REWRITE_OUTCOME_INFLATION`: Rewrite 2 adds unsupported outcomes: improved

**Warnings:**
- `W_SCORE_DRIFT`: Score 70 outside expected range [55, 68]
- `W_DISCOURAGED_PHRASE`: Contains discouraged phrase: "solid experience"

### synth_operations_manager_entry_weak_1

**Status:** FAIL
**Score:** 60 (expected: 55–68)

**Errors (ship blockers):**
- `E_REWRITE_OUTCOME_INFLATION`: Rewrite 1 adds unsupported outcomes: improving
- `E_REWRITE_OUTCOME_INFLATION`: Rewrite 3 adds unsupported outcomes: enhancing

## ⚠️ Warnings (Review Recommended)

### synth_sales_executive_mid_foundation_1

**Status:** WARN
**Score:** 70 (expected: 68–78)

**Warnings:**
- `W_SPECIFICITY_LOW`: Fix 1 lacks concrete tokens (digits, %, measurable nouns, time bounds)
- `W_SPECIFICITY_LOW`: Fix 2 lacks concrete tokens (digits, %, measurable nouns, time bounds)
