/**
 * Critical Miss judge - the prompt-change gate.
 *
 * Matt set this bar on November 1, 2026, matching the one he set for his own
 * blind pick: the candidate is preferred on at least 80% of compared resumes,
 * with ties counting against it, and the absolute-mode veto fires on no
 * candidate side. The existing 0-FAIL smoke and golden gate still applies
 * separately. See docs/promptops/shipping-gate.md.
 */

import type { AbsoluteResult, PairwiseResult } from "./types";

export const GATE_BAR = {
    /** Candidate preferred (clear or slight) on at least this share; ties and losses count against. */
    minPreferredShare: 0.8,
    /** Candidate reports whose Critical Miss makes a claim the resume doesn't support. */
    maxCandidateVetoes: 0,
    /** The launch readiness bar's minimum fixture count, so a small run can't pass on 2 of 2. */
    minResumes: 8,
} as const;

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
    reasons: string[];
}

export function gateVerdict(resumes: GateResume[], options: { limited?: boolean } = {}): GateVerdict {
    const compared = resumes.length;
    const preferred = resumes.filter((resume) => resume.pairwise?.winner === "Y").length;
    const share = compared === 0 ? 0 : preferred / compared;
    const candidateVetoes = resumes.filter((resume) => resume.candidate_absolute?.veto).map((resume) => resume.fixture_id);
    const notJudged = resumes
        .filter((resume) => resume.problem || !resume.pairwise || !resume.candidate_absolute)
        .map((resume) => `${resume.fixture_id}: ${resume.problem || "not fully judged"}`);

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
    return {
        pass: reasons.length === 0,
        compared,
        preferred,
        share,
        candidate_vetoes: candidateVetoes,
        not_judged: notJudged,
        reasons,
    };
}

export function gateLines(verdict: GateVerdict): string[] {
    const lines = [
        `GATE: ${verdict.pass ? "PASS" : "FAIL"}`,
        `- Candidate preferred: ${verdict.preferred} of ${verdict.compared} (${Math.round(verdict.share * 100)}%; bar ${GATE_BAR.minPreferredShare * 100}%, ties count against)`,
        `- Candidate vetoes (absolute mode): ${verdict.candidate_vetoes.length} (bar ${GATE_BAR.maxCandidateVetoes})`,
    ];
    for (const reason of verdict.reasons) lines.push(`- Fails: ${reason}`);
    for (const item of verdict.not_judged) lines.push(`- Not fully judged: ${item}`);
    lines.push("- The 0-FAIL smoke and golden gate still applies separately.");
    return lines;
}
