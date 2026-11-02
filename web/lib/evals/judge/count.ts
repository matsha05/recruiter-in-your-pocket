/**
 * Critical Miss judge - count checks for the prompt-change gate.
 *
 * Matt, November 1, 2026: "some resumes are truly horrible. i dont want to lie
 * to people and say they have one critical miss if there are more." A Critical
 * Miss is any problem that would cost an interview on its own. A report flags
 * every one, up to three, in priority order, says so when there are more than
 * three, and doesn't pad a strong resume.
 *
 * The key labels fictional resumes in advance:
 * - bad: exactly three problems that would each cost an interview on its own.
 *   The candidate must flag at least two of them as Critical Misses
 *   (under-count). A keyed count call matches each flagged Critical Miss to a
 *   labeled problem. A blind call rates the same Critical Misses without the
 *   key; a matched problem it doesn't rate critical on its own is a disputed
 *   label, reported for the key's owner but not failed, since the pairwise
 *   half of the gate is blind too.
 * - strong: no such problem. A blind count call (no key) rates every Critical
 *   Miss after the first; one it doesn't rate critical on its own is padding,
 *   and so is a "more than three" signal (over-count).
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { GATE_BAR } from "./gate";
import type { CountKey, CountKeyProblem, CountKeyResume, CountResult, CriticalMissView, JudgeCase } from "./types";
import { containsQuote, isJudgeableFixture } from "./view";
import type { Fixture } from "../types";

/** Relative to the repository root. */
export const COUNT_KEY_PATH = "tests/fixtures/judge/count-check-key.json";
export const COUNT_CALIBRATION_PATH = "tests/fixtures/judge/count-calibration.json";

const PROBLEM_IDS = ["P1", "P2", "P3"] as const;

/** Problems a key resume must satisfy; the resume text is passed in so the lines can be checked. */
export function keyResumeErrors(resume: CountKeyResume, resumeText: string): string[] {
    const errors: string[] = [];
    const where = resume.fixture_id || "(no fixture_id)";
    if (resume.kind === "strong") {
        if ((resume.problems || []).length > 0) errors.push(`${where}: a strong resume has no labeled problems`);
        return errors;
    }
    if (resume.kind !== "bad") return [`${where}: kind must be "bad" or "strong"`];
    const problems = resume.problems || [];
    if (problems.length !== PROBLEM_IDS.length || problems.some((problem, index) => problem.id !== PROBLEM_IDS[index])) {
        errors.push(`${where}: a bad resume has exactly three problems, P1 to P3 in priority order`);
    }
    const seen = new Set<string>();
    for (const problem of problems) {
        if (!problem.problem?.trim() || !problem.why?.trim()) errors.push(`${where} ${problem.id}: problem and why are required`);
        if (!Array.isArray(problem.lines) || problem.lines.length === 0) errors.push(`${where} ${problem.id}: needs at least one resume line`);
        for (const line of problem.lines || []) {
            if (!containsQuote(resumeText, line)) errors.push(`${where} ${problem.id}: line isn't verbatim in the resume: "${line}"`);
            const key = line.trim().toLowerCase();
            if (seen.has(key)) errors.push(`${where} ${problem.id}: shares a line with another problem, so one fix could cover both: "${line}"`);
            seen.add(key);
        }
    }
    return errors;
}

export interface LoadedCountKey {
    key: CountKey | null;
    /** Any error fails the count checks: a key the gate can't trust isn't used. */
    errors: string[];
}

/**
 * Read and check the key against the fixture registry: every keyed resume is
 * judgeable (synthetic or fictional), bad resumes carry three verbatim,
 * distinct problems, and the key has at least the minimum number of each kind.
 */
export function loadCountKey(
    keyPath: string,
    fixtures: Map<string, Pick<Fixture, "id" | "tags" | "path">>,
    readResume: (fixture: Pick<Fixture, "id" | "tags" | "path">) => string,
): LoadedCountKey {
    if (!existsSync(keyPath)) return { key: null, errors: [`count-check key not found at ${keyPath}`] };
    let key: CountKey;
    try {
        key = JSON.parse(readFileSync(keyPath, "utf8"));
    } catch (error) {
        return { key: null, errors: [`count-check key isn't valid JSON: ${error instanceof Error ? error.message : String(error)}`] };
    }
    const errors: string[] = [];
    if (key.version !== 1 || !Array.isArray(key.resumes)) return { key: null, errors: ["count-check key needs version 1 and a resumes list"] };
    const ids = new Set<string>();
    for (const resume of key.resumes) {
        if (ids.has(resume.fixture_id)) errors.push(`${resume.fixture_id}: listed twice`);
        ids.add(resume.fixture_id);
        const fixture = fixtures.get(resume.fixture_id);
        if (!isJudgeableFixture(fixture)) {
            errors.push(`${resume.fixture_id}: not a registered synthetic fixture, so it can't be sent to the judge`);
            continue;
        }
        errors.push(...keyResumeErrors(resume, readResume(fixture!)));
    }
    const bad = key.resumes.filter((resume) => resume.kind === "bad").length;
    const strong = key.resumes.filter((resume) => resume.kind === "strong").length;
    if (bad < GATE_BAR.minBadResumes) errors.push(`count-check key has ${bad} bad resumes; the gate needs at least ${GATE_BAR.minBadResumes}`);
    if (strong < GATE_BAR.minStrongResumes) errors.push(`count-check key has ${strong} strong resumes; the gate needs at least ${GATE_BAR.minStrongResumes}`);
    return { key, errors };
}

// ============================================
// OUTCOMES
// ============================================

export interface CountCheckOutcome {
    fixture_id: string;
    kind: "bad" | "strong";
    pass: boolean;
    /** Critical Misses the candidate report shows. */
    flagged: number;
    /** Bad resumes: the labeled problems a flagged Critical Miss addresses. */
    caught?: string[];
    /** Strong resumes: Critical Misses after the first that the judge didn't rate critical on its own. */
    padding?: number[];
    /** The report says the resume has more than three Critical Misses. */
    more_than_three?: boolean;
    /** Bad resumes: caught problems whose Critical Miss the blind call didn't rate critical on its own. A warning. */
    disputed?: string[];
    /** Why this resume wasn't judged (no shown candidate report, or a judge error). Fails the check. */
    problem?: string;
    count?: CountResult;
    /** Bad resumes: the blind call on the same Critical Misses. */
    blind?: CountResult;
    /** The blind call failed; the outcome stands without the dispute check. */
    blind_error?: string;
}

export function badResumeOutcome(fixtureId: string, view: CriticalMissView, result: CountResult, blind?: CountResult): CountCheckOutcome {
    const caught = [...new Set(result.raw.misses.map((miss) => miss.matches).filter((id) => id !== "none"))].sort();
    const disputed = blind
        ? [...new Set(result.raw.misses
            .filter((miss, index) => miss.matches !== "none" && blind.raw.misses[index]?.critical_on_its_own === false)
            .map((miss) => miss.matches))].sort()
        : undefined;
    return {
        fixture_id: fixtureId,
        kind: "bad",
        pass: caught.length >= GATE_BAR.minCaughtPerBadResume,
        flagged: view.misses.length,
        caught,
        more_than_three: Boolean(view.more_than_three),
        ...(disputed ? { disputed } : {}),
        count: result,
        ...(blind ? { blind } : {}),
    };
}

export function strongResumeOutcome(fixtureId: string, view: CriticalMissView, result: CountResult): CountCheckOutcome {
    const padding = result.raw.misses.filter((miss) => miss.number > 1 && !miss.critical_on_its_own).map((miss) => miss.number);
    return {
        fixture_id: fixtureId,
        kind: "strong",
        pass: padding.length === 0 && !view.more_than_three,
        flagged: view.misses.length,
        padding,
        more_than_three: Boolean(view.more_than_three),
        count: result,
    };
}

export function outcomeFor(resume: CountKeyResume, view: CriticalMissView, result: CountResult, blind?: CountResult): CountCheckOutcome {
    return resume.kind === "bad" ? badResumeOutcome(resume.fixture_id, view, result, blind) : strongResumeOutcome(resume.fixture_id, view, result);
}

/** One line per resume, for the gate summary. */
export function outcomeLine(outcome: CountCheckOutcome): string {
    if (outcome.problem) return `${outcome.fixture_id}: not judged (${outcome.problem})`;
    if (outcome.kind === "bad") {
        const dispute = outcome.disputed?.length ? `; the blind judge rates ${outcome.disputed.join(", ")} not critical on its own` : "";
        return `${outcome.fixture_id}: flagged ${outcome.flagged}, caught ${outcome.caught?.length || 0} of 3 labeled problems${outcome.caught?.length ? ` (${outcome.caught.join(", ")})` : ""}${dispute}`;
    }
    const parts = [`flagged ${outcome.flagged}`];
    if (outcome.padding?.length) parts.push(`padding at Critical Miss ${outcome.padding.join(", ")}`);
    if (outcome.more_than_three) parts.push(`says "more than three"`);
    return `${outcome.fixture_id}: ${parts.join("; ")}`;
}

/**
 * The key's own labels as one report per bad resume, each labeled problem a
 * Critical Miss, for a blind count call: does the judge agree that each
 * would cost an interview on its own? Run before trusting a new key.
 */
export function keyCheckView(resume: CountKeyResume): CriticalMissView {
    return {
        label: "Critical Miss",
        verdict: "",
        misses: resume.problems.map((problem) => ({ fix: problem.problem, why: problem.why, resume_lines: problem.lines })),
    };
}

// ============================================
// CALIBRATION SET
// ============================================

export interface CountCalibrationReport {
    id: string;
    note?: string;
    view: CriticalMissView;
    /** Per Critical Miss, the labeled problem it addresses ("none" when it addresses none; null leaves it ungraded). Bad resumes only. */
    expected_matches?: Array<CountKeyProblem["id"] | "none" | null>;
    /** Per Critical Miss, whether it would cost an interview on its own; null where the label leaves it open. */
    expected_critical: Array<boolean | null>;
    /** What the gate check should conclude for this report. */
    expected_pass: boolean;
}

export interface CountCalibrationResume {
    id: string;
    kind: "bad" | "strong";
    input: JudgeCase;
    problems: CountKeyProblem[];
    reports: CountCalibrationReport[];
}

/** Hand-written fictional resumes, each with labeled problems and several reports to check (count-calibration.json). */
export function loadCountCalibration(root = path.resolve(process.cwd(), "..")): CountCalibrationResume[] {
    const data = JSON.parse(readFileSync(path.join(root, COUNT_CALIBRATION_PATH), "utf8"));
    return (data.resumes as any[]).map((resume) => ({
        id: resume.id,
        kind: resume.kind,
        input: { id: resume.id, resume_text: resume.resume_text, review_date: data.review_date },
        problems: resume.problems || [],
        reports: resume.reports,
    }));
}
