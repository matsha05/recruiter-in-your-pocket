/**
 * Critical Miss judge - type definitions.
 *
 * The judge sees only a blind view of a report: the Verdict and its Critical
 * Miss(es). It never sees which prompt, model, or run produced the read.
 */

import type { TokenUsage } from "../../llm/cost";

/** One Critical Miss as the report renders it. */
export interface CriticalMissItem {
    /** The fix headline. */
    fix: string;
    /** Why it matters, as the report explains it. */
    why: string;
    /** The resume line(s) the fix cites, verbatim from the report. */
    resume_lines: string[];
}

/** What a reader sees of a report's first impression: everything the judge is shown. */
export interface CriticalMissView {
    /** "Critical Miss", or "Nothing critical" when the report says nothing needs fixing first. */
    label: string;
    /** The Verdict (first impression). */
    verdict: string;
    /** One to three Critical Misses, most important first. */
    misses: CriticalMissItem[];
}

/** A resume plus the date it is reviewed on, so recency and gaps can be judged. */
export interface JudgeCase {
    id: string;
    resume_text: string;
    /** ISO date (YYYY-MM-DD) the report is read on. */
    review_date: string;
}

// ============================================
// RUBRIC CRITERIA
// ============================================

/** Criterion IDs match docs/evals/critical-miss-rubric.md. */
export const CRITERIA = [
    "V_grounded",
    "C1_first_read_stakes",
    "C2_concrete_fact_over_move",
    "C3_specific_ask",
    "C4_gap_handling",
    "C5_always_a_top_fix",
    "C6_recruiter_consequence",
    "C7_honest_ask",
    "C8_multiple_misses",
] as const;

export type CriterionId = typeof CRITERIA[number];

// ============================================
// MODEL OUTPUTS
// ============================================

export interface UnsupportedClaim {
    /** Exact text from the report that the resume doesn't support. */
    quote: string;
    /** What the resume actually says, or why the claim is unsupported. */
    why: string;
}

export interface PairwiseSideNotes {
    /** What this report asks the person to fix first, in a few words. */
    targets: string;
    unsupported_claims: UnsupportedClaim[];
}

/** One call's answer, with sides as shown ("first"/"second"). */
export interface PairwiseRawVerdict {
    first_read: string;
    most_important_issue: string;
    first: PairwiseSideNotes;
    second: PairwiseSideNotes;
    same_issue: boolean;
    winner: "first" | "second" | "no_real_difference";
    strength: "clear" | "slight" | "none";
    deciding_criteria: CriterionId[];
    rationale: string;
    cited_resume_lines: string[];
}

export type PairwiseOutcome = "X" | "Y" | "tie";

/** One order's verdict mapped back to report identities X and Y. */
export interface PairwiseOrderResult {
    order: "XY" | "YX";
    winner: PairwiseOutcome;
    strength: "clear" | "slight" | "none";
    vetoes: { X: UnsupportedClaim[]; Y: UnsupportedClaim[] };
    raw: PairwiseRawVerdict;
    /** Report quotes in unsupported_claims that don't appear in that report: dropped, not counted. */
    dropped_claims: UnsupportedClaim[];
    /** Cited resume lines that aren't verbatim in the resume. */
    uncited_lines: string[];
    usage?: TokenUsage;
    cost_usd: number;
    latency_ms: number;
}

export interface PairwiseResult {
    case_id: string;
    /** Combined over both side orders. Orders that disagree make a tie. */
    winner: PairwiseOutcome;
    /** "clear" only when both orders say clear for the same winner. */
    strength: "clear" | "slight" | "none";
    /** Both orders named the same winner (or both said no real difference). */
    orders_agree: boolean;
    /** A side whose report makes a claim the resume doesn't support, in either order. */
    veto: { X: boolean; Y: boolean };
    orders: PairwiseOrderResult[];
    cost_usd: number;
}

export interface CriterionScore {
    /** 1 (poor) to 5 (excellent). */
    score: number;
    note: string;
}

export interface AbsoluteRawScore {
    first_read: string;
    most_important_issue: string;
    unsupported_claims: UnsupportedClaim[];
    criteria: {
        first_read_stakes: CriterionScore;
        concrete_fact: CriterionScore;
        specific_ask: CriterionScore;
        recruiter_consequence: CriterionScore;
        honest_ask: CriterionScore;
        gap_handling: { applies: boolean; score: number; note: string };
    };
    /** Is this the right thing to fix first? 1 to 5. */
    right_thing_first: number;
    rationale: string;
    cited_resume_lines: string[];
}

export interface AbsoluteResult {
    case_id: string;
    /** True when the report makes a claim the resume doesn't support. */
    veto: boolean;
    /** right_thing_first, forced to 1 on a veto. */
    overall: number;
    raw: AbsoluteRawScore;
    dropped_claims: UnsupportedClaim[];
    uncited_lines: string[];
    usage?: TokenUsage;
    cost_usd: number;
    latency_ms: number;
}

export interface JudgeConfig {
    model: string;
    reasoningEffort: "low" | "medium" | "high";
    seed: number;
    maxCompletionTokens: number;
}
