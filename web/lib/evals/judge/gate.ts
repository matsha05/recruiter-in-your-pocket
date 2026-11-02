/**
 * Critical Miss judge - the prompt-change gate.
 *
 * Matt set this bar on November 1, 2026, matching the one he set for his own
 * blind pick: the candidate is preferred on at least 80% of compared resumes,
 * with ties counting against it, and the absolute-mode veto fires on no
 * candidate side. The existing 0-FAIL smoke and golden gate still applies
 * separately. See docs/promptops/shipping-gate.md.
 *
 * Matt added the count checks the same day (count.ts): every Critical Miss is
 * flagged, up to three, and a strong resume isn't padded. On every labeled bad
 * resume the candidate flags at least two of its three labeled problems, and on
 * every labeled strong resume each Critical Miss after the first is critical
 * on its own.
 */

import type { CountCheckOutcome } from "./count";
import type { AbsoluteResult, PairwiseResult } from "./types";

export const GATE_BAR = {
    /** Candidate preferred (clear or slight) on at least this share; ties and losses count against. */
    minPreferredShare: 0.8,
    /** Candidate reports whose Critical Miss makes a claim the resume doesn't support. */
    maxCandidateVetoes: 0,
    /** The launch readiness bar's minimum fixture count, so a small run can't pass on 2 of 2. */
    minResumes: 8,
    /** Under-count: labeled problems a bad resume's Critical Misses must address, of its three. */
    minCaughtPerBadResume: 2,
    /** The count-check key's minimum size, so a cut-down key can't pass. */
    minBadResumes: 8,
    minStrongResumes: 4,
} as const;

/** The count checks' input to the gate: the key's errors, and one outcome per keyed resume. */
export interface CountGate {
    key_errors: string[];
    outcomes: CountCheckOutcome[];
}

export interface GateResume {
    fixture_id: string;
    /** Production is X, the candidate is Y. Absent when the candidate has no shown report. */
    pairwise?: PairwiseResult | null;
    /** The candidate's Critical Miss scored alone, for the veto. */
    candidate_absolute?: AbsoluteResult | null;
    /** Why this resume wasn't fully judged (no candidate report, or a judge error). */
    problem?: string;
}

export interface GateVerdict {
    pass: boolean;
    compared: number;
    preferred: number;
    share: number;
    candidate_vetoes: string[];
    not_judged: string[];
    count: {
        bad: { judged: number; passed: number; total: number };
        strong: { judged: number; passed: number; total: number };
        /** Bad resumes that flagged fewer than two labeled problems. */
        under_count: string[];
        /** Strong resumes with padding or a "more than three" signal. */
        over_count: string[];
        not_judged: string[];
        key_errors: string[];
    };
    reasons: string[];
}

export function gateVerdict(resumes: GateResume[], options: { limited?: boolean; count?: CountGate } = {}): GateVerdict {
    const compared = resumes.length;
    const preferred = resumes.filter((resume) => resume.pairwise?.winner === "Y").length;
    const share = compared === 0 ? 0 : preferred / compared;
    const candidateVetoes = resumes.filter((resume) => resume.candidate_absolute?.veto).map((resume) => resume.fixture_id);
    const notJudged = resumes
        .filter((resume) => resume.problem || !resume.pairwise || !resume.candidate_absolute)
        .map((resume) => `${resume.fixture_id}: ${resume.problem || "not fully judged"}`);

    const outcomes = options.count?.outcomes || [];
    const keyErrors = options.count ? options.count.key_errors : ["count checks were not run"];
    const tally = (kind: "bad" | "strong") => {
        const list = outcomes.filter((outcome) => outcome.kind === kind);
        return {
            judged: list.filter((outcome) => !outcome.problem).length,
            passed: list.filter((outcome) => !outcome.problem && outcome.pass).length,
            total: list.length,
        };
    };
    const count = {
        bad: tally("bad"),
        strong: tally("strong"),
        under_count: outcomes.filter((outcome) => outcome.kind === "bad" && !outcome.problem && !outcome.pass).map((outcome) => outcome.fixture_id),
        over_count: outcomes.filter((outcome) => outcome.kind === "strong" && !outcome.problem && !outcome.pass).map((outcome) => outcome.fixture_id),
        not_judged: outcomes.filter((outcome) => outcome.problem).map((outcome) => `${outcome.fixture_id}: ${outcome.problem}`),
        key_errors: keyErrors,
    };

    const reasons: string[] = [];
    if (share < GATE_BAR.minPreferredShare) {
        reasons.push(`candidate preferred on ${preferred} of ${compared} resumes (${Math.round(share * 100)}%), below ${GATE_BAR.minPreferredShare * 100}%`);
    }
    if (candidateVetoes.length > GATE_BAR.maxCandidateVetoes) {
        reasons.push(`veto on ${candidateVetoes.length} candidate side(s): ${candidateVetoes.join(", ")}`);
    }
    if (compared < GATE_BAR.minResumes) {
        reasons.push(`only ${compared} resumes compared; the gate needs at least ${GATE_BAR.minResumes}`);
    }
    if (notJudged.length > 0) {
        reasons.push(`${notJudged.length} resume(s) not fully judged`);
    }
    if (options.limited) {
        reasons.push("--limit was set; a gate run compares every shared synthetic fixture");
    }
    if (count.key_errors.length > 0) {
        reasons.push(`count checks can't run: ${count.key_errors.length} key problem(s)`);
    }
    if (count.under_count.length > 0) {
        reasons.push(`under-count on ${count.under_count.length} bad resume(s), fewer than ${GATE_BAR.minCaughtPerBadResume} of 3 labeled problems flagged: ${count.under_count.join(", ")}`);
    }
    if (count.over_count.length > 0) {
        reasons.push(`over-count on ${count.over_count.length} strong resume(s): ${count.over_count.join(", ")}`);
    }
    if (count.not_judged.length > 0) {
        reasons.push(`${count.not_judged.length} keyed resume(s) not count-checked`);
    }
    return {
        pass: reasons.length === 0,
        compared,
        preferred,
        share,
        candidate_vetoes: candidateVetoes,
        not_judged: notJudged,
        count,
        reasons,
    };
}

export function gateLines(verdict: GateVerdict): string[] {
    const lines = [
        `GATE: ${verdict.pass ? "PASS" : "FAIL"}`,
        `- Candidate preferred: ${verdict.preferred} of ${verdict.compared} (${Math.round(verdict.share * 100)}%; bar ${GATE_BAR.minPreferredShare * 100}%, ties count against)`,
        `- Candidate vetoes (absolute mode): ${verdict.candidate_vetoes.length} (bar ${GATE_BAR.maxCandidateVetoes})`,
        `- Under-count, labeled bad resumes: ${verdict.count.bad.passed} of ${verdict.count.bad.total} flag at least ${GATE_BAR.minCaughtPerBadResume} of 3 labeled problems (bar: all)`,
        `- Over-count, labeled strong resumes: ${verdict.count.strong.passed} of ${verdict.count.strong.total} without padding (bar: all)`,
    ];
    for (const reason of verdict.reasons) lines.push(`- Fails: ${reason}`);
    for (const item of verdict.not_judged) lines.push(`- Not fully judged: ${item}`);
    for (const item of verdict.count.not_judged) lines.push(`- Not count-checked: ${item}`);
    for (const item of verdict.count.key_errors) lines.push(`- Key: ${item}`);
    lines.push("- The 0-FAIL smoke and golden gate still applies separately.");
    return lines;
}
