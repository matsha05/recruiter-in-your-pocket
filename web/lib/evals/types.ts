/**
 * PromptOps Eval Harness - Type Definitions
 */

import type { TokenUsage } from "../llm/cost";
import type { ReasoningEffort } from "../llm/model-config";

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
    | "E_EVIDENCE_NOT_VERBATIM"
    | "E_REWRITE_ORIGINAL_NOT_VERBATIM"
    | "E_REWRITE_INVENTED_SPECIFIC"
    | "E_REWRITE_OWNERSHIP_INFLATION"
    | "E_REWRITE_OUTCOME_INFLATION"
    | "E_REWRITE_SOURCE_DRIFT"
    | "E_REWRITE_NO_MATERIAL_CHANGE"
    | "E_REWRITE_DROPPED_EVIDENCE"
    | "E_FIX_ALREADY_SATISFIED"
    | "E_FIX_EVIDENCE_MISMATCH"
    | "E_FIX_NOT_ACTIONABLE"
    | "E_SOURCE_TAG_LEAK"
    | "E_BIGGEST_GAP_NOT_VERBATIM"
    | "E_BIGGEST_GAP_CONTRADICTS_SOURCE"
    | "E_BANNED_PHRASE"
    | "E_SCORE_EXTREME";

export type WarningCode =
    | "W_SCORE_DRIFT"
    | "W_SUBSCORE_DRIFT"
    | "W_EVIDENCE_PARAPHRASE"
    | "W_SUMMARY_STRUCTURE"
    | "W_SPECIFICITY_LOW"
    | "W_MECHANICAL_COPY"
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
    usage?: TokenUsage;
    cost_usd?: number;
    latency_ms?: number;
    provider_calls?: number;
    response_model?: string;
    raw_output?: unknown;
    model_output?: unknown;
    normalization_changes?: string[];
    generation_normalization_changes?: string[];
    initial_validation_error?: string;
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
    execution_mode: "dry_run" | "live";
    model: string;
    temperature: number | null;
    top_p: number | null;
    reasoning_effort: string | null;
    incomplete_retry_reasoning_effort?: string | null;
    repair_reasoning_effort?: string | null;
    max_completion_tokens: number | null;
    prompt_version_hash: string;
    resume_prompt_sha256?: string;
    resume_ideas_prompt_sha256?: string;
    contract_version: string;
    tier: "smoke" | "golden" | "bulk";
    budget_usd: number;
    actual_cost_usd: number;
    token_usage: TokenUsage;
    pricing_basis: "published_standard_token_rates" | "none";
    calls_made: number;
    max_calls: number;
    concurrency: number;
    baseline_path?: string;
    validation_mode?: "in_run" | "saved_output_replay";
    validation_input?: "model_output_when_available";
    validation_timestamp?: string;
    source_run_sha256?: string;
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
    model?: string;
    reasoningEffort?: ReasoningEffort;
    baseline?: string;
    budgetUsd: number;
    maxCalls: number;
    maxCompletionTokens?: number;
    concurrency: number;
    dryRun: boolean;
    promptVersion?: string;
    fixtureFilter?: string;
    limit?: number;
    withJudge?: boolean;
    outputLabel?: string;
}

// ============================================
// CONSTANTS
// ============================================

export const EVIDENCE_MAX_LENGTH = 140;
export const SCORE_DRIFT_WARN_THRESHOLD = 5;
export const SCORE_DRIFT_ERROR_THRESHOLD = 12;
export const SUBSCORE_DRIFT_WARN_THRESHOLD = 10;
export const MIN_TOP_FIXES = 1;

export const CONCRETE_PATTERNS = [
    /\d+/,                                          // Digits
    /%/,                                            // Percentages
    /\b(team|users|revenue|pipeline|budget|ARR|MRR|NPS|projects?|customers?|partners?|regions?|features?|volume|throughput|headcount)\b/i,  // Measurable nouns
    /\b(cycle[- ]?time|time[- ]?to[- ]?\w+|project count|conversion|retention|adoption|savings?|cost|quality|accuracy|latency)\b/i, // Measurable dimensions
    /\b(Q[1-4]|20\d{2}|weekly|monthly|annually)\b/i,          // Time bounds
    /\[[^\]]+\]/,                                               // Bracket placeholders like [X%], [specific metric]
];
