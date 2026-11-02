/**
 * Critical Miss judge - calibration sets and scoring.
 *
 * Two sets, both synthetic or fictional:
 * - blind-pick: Matt's November 1 picks on ten synthetic resumes
 *   (tests/fixtures/results/blind-pick/). Sides are presented as the items
 *   file has them; the key is read only to score the judge afterwards.
 * - contrast: hand-written fictional pairs, each isolating one rubric rule
 *   (tests/fixtures/judge/contrast-pairs.json).
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import type { CriticalMissView, JudgeCase, PairwiseOutcome, PairwiseResult } from "./types";
import { containsQuote } from "./view";

export interface CalibrationPair {
    set: "blind-pick" | "contrast";
    id: string;
    rule: string;
    input: JudgeCase;
    /** X is side A, Y is side B. */
    views: { X: CriticalMissView; Y: CriticalMissView };
    /** The expected combined winner. */
    expected: PairwiseOutcome;
    note?: string;
    /** Blind pick only: which side came from the production prompt. Used after judging. */
    production_side?: "X" | "Y";
}

const repoRoot = () => path.resolve(process.cwd(), "..");

function readJson(relative: string) {
    return JSON.parse(readFileSync(path.join(repoRoot(), relative), "utf8"));
}

function blindPickView(side: any): CriticalMissView {
    return {
        label: String(side.label || "Critical Miss"),
        verdict: String(side.verdict || ""),
        misses: [{
            fix: String(side.fix || ""),
            why: String(side.why || ""),
            resume_lines: Array.isArray(side.resume_lines) ? side.resume_lines.map(String) : [],
        }],
    };
}

/** Matt's picks were made on November 1, 2026, the day both reports were generated. */
export const BLIND_PICK_REVIEW_DATE = "2026-11-01";

export function loadBlindPick(): CalibrationPair[] {
    const items = readJson("tests/fixtures/results/blind-pick/items.json").items as any[];
    const key = readJson("tests/fixtures/results/blind-pick/key.json").items as Record<string, any>;
    const result = readJson("tests/fixtures/results/blind-pick/result.json").items as Record<string, any>;
    return items.map((item) => {
        const pick = result[item.id];
        const newSide = key[item.id].new_side === "A" ? "X" : "Y";
        const oldSide = newSide === "X" ? "Y" : "X";
        const expected: PairwiseOutcome = pick.preferred === "new"
            ? newSide
            : pick.preferred === "old" ? oldSide : "tie";
        return {
            set: "blind-pick",
            id: item.id,
            rule: pick.preferred === "no difference" ? "matt_no_difference" : "matt_decisive",
            input: { id: item.id, resume_text: item.resume_text, review_date: BLIND_PICK_REVIEW_DATE },
            views: { X: blindPickView(item.A), Y: blindPickView(item.B) },
            expected,
            note: pick.note,
            production_side: oldSide,
        };
    });
}

export function loadContrastPairs(): CalibrationPair[] {
    const data = readJson("tests/fixtures/judge/contrast-pairs.json");
    return (data.pairs as any[]).map((pair) => ({
        set: "contrast",
        id: pair.id,
        rule: pair.rule,
        input: { id: pair.id, resume_text: pair.resume_text, review_date: data.review_date },
        views: { X: pair.A, Y: pair.B },
        expected: pair.expected === "A" ? "X" : pair.expected === "B" ? "Y" : "tie",
        note: pair.note,
    }));
}

/** Resume lines a view cites that aren't verbatim in the resume (absence markers excepted). */
export function unverifiedCitations(pair: CalibrationPair): string[] {
    const absence = /^No (?:summary|skills|education) section present$/;
    return [pair.views.X, pair.views.Y]
        .flatMap((view) => view.misses.flatMap((miss) => miss.resume_lines))
        .filter((line) => !absence.test(line) && !containsQuote(pair.input.resume_text, line));
}

// ============================================
// SCORING
// ============================================

export type Grade = "right" | "acceptable" | "tie_on_decisive" | "wrong_slight" | "wrong_clear";

/**
 * Decisive pair: right when the judge names the expected side; a tie misses
 * without favoring the rejected side; naming the rejected side is wrong, and
 * "wrong_clear" is the failure that must never happen.
 * Tie pair: right on a tie, acceptable on a slight preference, wrong on a clear one.
 */
export function gradePair(expected: PairwiseOutcome, result: Pick<PairwiseResult, "winner" | "strength">): Grade {
    if (expected === "tie") {
        if (result.winner === "tie") return "right";
        return result.strength === "clear" ? "wrong_clear" : "acceptable";
    }
    if (result.winner === expected) return "right";
    if (result.winner === "tie") return "tie_on_decisive";
    return result.strength === "clear" ? "wrong_clear" : "wrong_slight";
}

export interface CalibrationRecord {
    pair: Omit<CalibrationPair, "input" | "views"> & { resume_chars: number };
    repeat: number;
    result: PairwiseResult;
    grade: Grade;
}
