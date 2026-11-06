/**
 * Voice judge - type definitions.
 *
 * The judge reads product copy (never the model's report prose) against the
 * copy system in docs/copy-system.md: the voice chart, the tone table, and the
 * list of tics this codebase keeps producing. It never runs in production.
 */

import type { TokenUsage } from "../../llm/cost";

/** One string from the inventory (docs/copy/inventory/inventory.json). */
export interface CopyString {
    /** Stable id within a run: the inventory index, or a calibration id. */
    id: string;
    text: string;
    /** Where the reader is: marketing, upload, analysis, report, rewrite, research, pricing, auth, account, legal, error, email, pdf, extension, shared. */
    moment: string;
    /** What kind of string it is, as the inventory classifies it (jsx-text, attr:aria-label, key:title, call:toast.error, …). */
    kind?: string;
    /** `file:line`, for the report. */
    where?: string;
    /** The routes the string is reached from. */
    routes?: string[];
}

/** The tics the judge names. Ids match docs/copy-system.md §4, in the same order; tests/voice-judge.test.ts checks it. */
export const TICS = [
    "coined_word",
    "retired_name",
    "rejected_phrase",
    "colon_fragment",
    "tricolon",
    "not_x_but_y",
    "punch_fragments",
    "question_heading",
    "copula_avoidance",
    "ing_analysis",
    "invented_emotion",
    "please",
    "title_case",
    "generic_ai_word",
    "slogan",
    "hedge_stack",
    "invented_number",
    "exclamation",
    "empty_praise",
    "fake_intimacy",
    "slang",
    "joke_in_trust_moment",
    "product_about_itself",
    "two_names",
    "repeats_heading",
    "internal_term",
] as const;

export type TicId = typeof TICS[number];

/** The three ratings Matt uses, in his words (docs/copy/calibration/set-2026-11-06.json). */
export const VERDICTS = ["us", "flat", "no"] as const;
export type Verdict = typeof VERDICTS[number];

/** One string's score from the model. */
export interface StringRawScore {
    id: string;
    /** Names the actual subject (the resume, the line, the recruiter, the pass, the file), with no word the reader must translate. */
    names_subject: boolean;
    /** Says what happens or what to do: a button says what it does, an error what happened and the next step, a heading what the section is. */
    says_what_happens: boolean;
    /** An experienced recruiter would say this sentence, aloud, to a candidate, in this moment. */
    recruiter_would_say: boolean;
    /** At most one aside, and none inside a button, price, legal term or error. */
    one_aside_at_most: boolean;
    tics: TicId[];
    verdict: Verdict;
    /** The proposed line in the house voice. Empty when the verdict is "us". */
    rewrite: string;
    /** One sentence, quoting the words that decide it. */
    reason: string;
}

export interface BatchRawScore {
    results: StringRawScore[];
}

export interface StringScore extends StringRawScore {
    text: string;
    moment: string;
    where?: string;
    kind?: string;
    /** Tics the zero-cost lexical checks found, whether or not the model named them. */
    lexical_tics: TicId[];
}

export interface BatchResult {
    scores: StringScore[];
    usage?: TokenUsage;
    cost_usd: number;
    latency_ms: number;
    response_model: string;
    /** Ids the model left out of its answer; they are reported, not scored. */
    missing: string[];
}

export interface VoiceJudgeConfig {
    model: string;
    reasoningEffort: "low" | "medium" | "high";
    seed: number;
    maxCompletionTokens: number;
    /** Strings per call. */
    batchSize: number;
}

// ============================================
// CALIBRATION
// ============================================

export interface CalibrationLine {
    id: number;
    moment: string;
    where: string;
    text: string;
}

export interface CalibrationSituation {
    id: string;
    situation: string;
    A: string;
    B: string;
    C: string;
}

export interface CalibrationSet {
    version: number;
    date: string;
    purpose: string;
    scale: Record<Verdict, string>;
    real_lines: CalibrationLine[];
    situations: CalibrationSituation[];
}

/** Matt's ratings, as recorded from the rating widget. */
export interface CalibrationRatings {
    date: string;
    /** Who labelled the lines. Matt set the rating round aside on November 6, 2026, so the first labels are the agent's, against the copy system. */
    rated_by: string;
    note?: string;
    lines: Record<string, { verdict: Verdict; note?: string }>;
    situations: Record<string, { pick: "A" | "B" | "C"; note?: string }>;
}

export interface AgreementRow {
    id: string;
    text: string;
    human: Verdict;
    judge: Verdict | null;
    agree: boolean;
    /** Agree on the question that matters most: is the line ours (us) or not (flat/no)? */
    agree_us_or_not: boolean;
    judge_reason?: string;
    judge_rewrite?: string;
    human_note?: string;
    /** The line's text appears in the judge prompt, so agreement on it is not a fair test. */
    in_prompt: boolean;
}

export interface Agreement {
    rated: number;
    judged: number;
    exact: number;
    exact_share: number;
    us_or_not: number;
    us_or_not_share: number;
    /** Cohen's kappa over the three verdicts; chance-corrected agreement. */
    kappa: number;
    /** The call a gate depends on: of the lines labelled "no", how many the judge also failed, and how many of its "no"s were right. */
    no_catch: { labelled_no: number; caught: number; judge_no: number; correct: number };
    /** Agreement on the lines whose text the judge prompt does not contain. */
    held_out: { judged: number; exact: number; us_or_not: number; kappa: number };
    /** Lines the judge called "us" that the labeller did not: the misses that would let bad copy through. */
    judge_too_kind: AgreementRow[];
    /** Lines the labeller called "us" that the judge did not: the false alarms. */
    judge_too_harsh: AgreementRow[];
    rows: AgreementRow[];
}
