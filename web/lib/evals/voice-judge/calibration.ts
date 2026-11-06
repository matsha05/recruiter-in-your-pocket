/**
 * Voice judge - calibration against hand labels.
 *
 * The set (docs/copy/calibration/set-2026-11-06.json) holds forty real lines
 * from the site. Matt set the rating round aside on November 6, 2026 and gave
 * his own words instead, so the first labels (ratings-2026-11-06.json) are the
 * agent's, made by hand against the merged copy system before the judge ran.
 * When Matt rates the lines, his labels replace them.
 *
 * Agreement is reported three ways (exact, us-or-not, Cohen's kappa), on all
 * lines and on the held-out lines whose text the judge prompt doesn't
 * contain, with every disagreement listed so the prompt is tuned against the
 * misses rather than the score.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import type { Agreement, AgreementRow, CalibrationRatings, CalibrationSet, CopyString, StringScore, Verdict } from "./types";
import { VERDICTS } from "./types";
import { VOICE_JUDGE_SYSTEM_PROMPT } from "./prompt";

/** A calibration line whose text is in the judge prompt teaches the answer; it is reported, not counted as held out. */
export function inPrompt(text: string, prompt = VOICE_JUDGE_SYSTEM_PROMPT): boolean {
    const squash = (value: string) => value.replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
    return squash(prompt).includes(squash(text));
}

const repoRoot = () => path.resolve(process.cwd(), "..");

export const CALIBRATION_SET_PATH = "docs/copy/calibration/set-2026-11-06.json";
export const CALIBRATION_RATINGS_PATH = "docs/copy/calibration/ratings-2026-11-06.json";

export function loadCalibrationSet(relative = CALIBRATION_SET_PATH): CalibrationSet {
    return JSON.parse(readFileSync(path.join(repoRoot(), relative), "utf8"));
}

export function loadCalibrationRatings(relative = CALIBRATION_RATINGS_PATH): CalibrationRatings {
    return JSON.parse(readFileSync(path.join(repoRoot(), relative), "utf8"));
}

/** The forty lines as judge input. The judge never sees the ratings. */
export function calibrationStrings(set: CalibrationSet): CopyString[] {
    return set.real_lines.map((line) => ({
        id: `cal-${line.id}`,
        text: line.text,
        moment: line.moment,
        where: line.where,
    }));
}

/** Cohen's kappa over the labels both raters gave. */
export function cohensKappa(pairs: Array<[Verdict, Verdict]>): number {
    if (pairs.length === 0) return 0;
    const total = pairs.length;
    const observed = pairs.filter(([a, b]) => a === b).length / total;
    let expected = 0;
    for (const label of VERDICTS) {
        const a = pairs.filter(([x]) => x === label).length / total;
        const b = pairs.filter(([, y]) => y === label).length / total;
        expected += a * b;
    }
    if (expected === 1) return 1;
    return (observed - expected) / (1 - expected);
}

export function agreement(set: CalibrationSet, ratings: CalibrationRatings, scores: StringScore[]): Agreement {
    const byId = new Map(scores.map((score) => [score.id, score]));
    const rows: AgreementRow[] = [];
    for (const line of set.real_lines) {
        const rating = ratings.lines[String(line.id)];
        if (!rating) continue;
        const score = byId.get(`cal-${line.id}`) || null;
        const judge = score?.verdict ?? null;
        rows.push({
            id: String(line.id),
            text: line.text,
            human: rating.verdict,
            judge,
            agree: judge === rating.verdict,
            agree_us_or_not: judge !== null && (judge === "us") === (rating.verdict === "us"),
            judge_reason: score?.reason,
            judge_rewrite: score?.rewrite,
            human_note: rating.note,
            in_prompt: inPrompt(line.text),
        });
    }
    const judged = rows.filter((row) => row.judge !== null);
    const exact = judged.filter((row) => row.agree).length;
    const usOrNot = judged.filter((row) => row.agree_us_or_not).length;
    const heldOut = judged.filter((row) => !row.in_prompt);
    const judgeNo = judged.filter((row) => row.judge === "no");
    return {
        no_catch: {
            labelled_no: judged.filter((row) => row.human === "no").length,
            caught: judged.filter((row) => row.human === "no" && row.judge === "no").length,
            judge_no: judgeNo.length,
            correct: judgeNo.filter((row) => row.human === "no").length,
        },
        held_out: {
            judged: heldOut.length,
            exact: heldOut.filter((row) => row.agree).length,
            us_or_not: heldOut.filter((row) => row.agree_us_or_not).length,
            kappa: cohensKappa(heldOut.map((row) => [row.human, row.judge as Verdict])),
        },
        rated: rows.length,
        judged: judged.length,
        exact,
        exact_share: judged.length ? exact / judged.length : 0,
        us_or_not: usOrNot,
        us_or_not_share: judged.length ? usOrNot / judged.length : 0,
        kappa: cohensKappa(judged.map((row) => [row.human, row.judge as Verdict])),
        judge_too_kind: judged.filter((row) => row.judge === "us" && row.human !== "us"),
        judge_too_harsh: judged.filter((row) => row.judge !== "us" && row.human === "us"),
        rows,
    };
}

/**
 * What Matt's situation picks say about the style, in counts: how often he chose
 * the plain-literal version, the dry one, or the warm one. The set lists each
 * situation's versions in a fixed order per situation, so the mapping is explicit.
 */
export const SITUATION_STYLES: Record<string, Record<"A" | "B" | "C", "plain" | "dry" | "warm" | "corporate" | "cheerful" | "coach" | "literal">> = {
    H1: { A: "plain", B: "corporate", C: "cheerful" },
    H2: { A: "dry", B: "cheerful", C: "plain" },
    H3: { A: "plain", B: "corporate", C: "warm" },
    H4: { A: "plain", B: "coach", C: "dry" },
    H5: { A: "dry", B: "corporate", C: "warm" },
    H6: { A: "plain", B: "corporate", C: "dry" },
    H7: { A: "plain", B: "cheerful", C: "dry" },
    H8: { A: "dry", B: "coach", C: "literal" },
    H9: { A: "dry", B: "corporate", C: "literal" },
    H10: { A: "plain", B: "cheerful", C: "dry" },
    H11: { A: "warm", B: "corporate", C: "dry" },
    H12: { A: "plain", B: "cheerful", C: "dry" },
};

export function styleCounts(ratings: CalibrationRatings): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [id, { pick }] of Object.entries(ratings.situations)) {
        const style = SITUATION_STYLES[id]?.[pick];
        if (!style) continue;
        counts[style] = (counts[style] || 0) + 1;
    }
    return counts;
}
