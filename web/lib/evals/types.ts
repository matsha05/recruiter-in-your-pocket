/**
 * PromptOps Eval Harness - Type Definitions
 */

// ============================================
// FAILURE CODES
// ============================================

export type ErrorCode =
    | "E_SCHEMA"
    | "E_CONTRACT_VERSION_MISMATCH"
    | "E_MISSING_REQUIRED_SECTION"
    | "E_EMPTY_REQUIRED_FIELD"
    | "E_NO_EVIDENCE"
    | "E_EVIDENCE_TOO_LONG"
    | "E_BANNED_PHRASE"
    | "E_SCORE_EXTREME";

export type WarningCode =
    | "W_SCORE_DRIFT"
    | "W_SUBSCORE_DRIFT"
    | "W_EVIDENCE_PARAPHRASE"
    | "W_SUMMARY_STRUCTURE"
    | "W_SPECIFICITY_LOW"
    | "W_DISCOURAGED_PHRASE";

export type FailureCode = ErrorCode | WarningCode;

export type Status = "PASS" | "WARN" | "FAIL";

// ============================================
// FIXTURE DEFINITIONS
// ============================================

export interface Fixture {
    id: string;
    path: string;
    tier: "smoke" | "golden" | "bulk";
    expected_score: { min: number; max: number };
    expected_band?: string;
    tags: string[];
    required_observations?: string[];
    banned_phrases?: string[];
    discouraged_phrases?: string[];
}

export interface CalibrationData {
    schema_version: string;
    contract_version: string;
    global_banned_phrases: string[];
    global_discouraged_phrases: string[];
    fixtures: Fixture[];
}

// ============================================
// BASELINE DEFINITIONS
// ============================================

export interface BaselineFixture {
    score: number;
    subscores?: {
        impact?: number;
        clarity?: number;
        story?: number;
        readability?: number;
    };
    top_fix_titles: string[];
    confidence_distribution?: { high: number; medium: number; low: number };
    contract_version: string;
}

export interface Baseline {
    contract_version: string;
    created_at: string;
    prompt_version_hash: string;
    fixtures: Record<string, BaselineFixture>;
}

// ============================================
// CHECK RESULTS
// ============================================

export interface CheckResult {
    passed: boolean;
    code?: FailureCode;
    message?: string;
    details?: Record<string, unknown>;
}

// ============================================
// FIXTURE RESULTS
// ============================================

export interface FixtureResult {
    fixture_id: string;
    status: Status;
    errors: Array<{ code: ErrorCode; message: string }>;
    warnings: Array<{ code: WarningCode; message: string }>;
    actual_score: number;
    expected_range: [number, number];
    score_drift?: number;
    subscores?: Record<string, number>;
    subscore_drifts?: Record<string, number>;
    evidence_flags?: Array<{ fix_index: number; issue: string }>;
    raw_output?: unknown;
    judge_result?: {
        evidence_score: number;
        actionability_score: number;
        tone_score: number;
        methodology_score: number;
        final_score: number;
    };
}

// ============================================
// RUN METADATA
// ============================================

export interface EvalRunMetadata {
    run_id: string;
    timestamp: string;
    model: string;
    temperature: number;
    top_p: number;
    prompt_version_hash: string;
    contract_version: string;
    tier: "smoke" | "golden" | "bulk";
    budget_usd: number;
    actual_cost_usd: number;
    calls_made: number;
    max_calls: number;
    concurrency: number;
    baseline_path?: string;
}

// ============================================
// EVAL RUN OUTPUT
// ============================================

export interface EvalRunOutput {
    metadata: EvalRunMetadata;
    summary: {
        total: number;
        passed: number;
        warned: number;
        failed: number;
    };
    results: FixtureResult[];
}

// ============================================
// CLI OPTIONS
// ============================================

export interface EvalOptions {
    tier: "smoke" | "golden" | "bulk";
    baseline?: string;
    budgetUsd: number;
    maxCalls: number;
    concurrency: number;
    dryRun: boolean;
    promptVersion?: string;
    fixtureFilter?: string;
    withJudge?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

export const EVIDENCE_MAX_LENGTH = 300;
export const SCORE_DRIFT_WARN_THRESHOLD = 5;
export const SCORE_DRIFT_ERROR_THRESHOLD = 12;
export const SUBSCORE_DRIFT_WARN_THRESHOLD = 10;
export const MIN_TOP_FIXES = 3;

export const CONCRETE_PATTERNS = [
    /\d+/,                                          // Digits
    /%/,                                            // Percentages
    /\b(team|users|revenue|pipeline|budget|ARR|MRR|NPS)\b/i,  // Measurable nouns
    /\b(Q[1-4]|20\d{2}|weekly|monthly|annually)\b/i,          // Time bounds
    /\[[^\]]+\]/,                                               // Bracket placeholders like [X%], [specific metric]
];
