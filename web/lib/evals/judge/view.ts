/**
 * Critical Miss judge - blind views and the synthetic-only guard.
 *
 * A view holds only what a reader sees: the label, the Verdict, and the
 * Critical Miss(es). Prompt hashes, model names, run IDs and scores never
 * reach the judge.
 */

import type { CalibrationData, Fixture } from "../types";
import type { CriticalMissView } from "./types";

type ReportLike = {
    first_impression?: unknown;
    top_fixes?: Array<{
        fix?: unknown;
        text?: unknown;
        why?: unknown;
        impact_level?: unknown;
        evidence?: unknown;
        critical?: unknown;
    }>;
    critical_misses?: unknown;
    more_critical?: unknown;
};

function text(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function excerptOf(evidence: unknown): string[] {
    if (typeof evidence === "string") return evidence.trim() ? [evidence.trim()] : [];
    if (evidence && typeof evidence === "object") {
        const excerpt = text((evidence as { excerpt?: unknown }).excerpt);
        return excerpt ? [excerpt] : [];
    }
    return [];
}

/**
 * The blind view of a generated report, as the report renders it.
 *
 * The production report shows the first top fix as the Critical Miss and
 * labels it "Nothing critical" when that fix is marked low impact (the same
 * rule as integrity-checks.ts and the blind-pick set). A future contract may
 * return up to three Critical Misses; `maxMisses` keeps that open without
 * showing the later top fixes the production report treats as ordinary fixes.
 */
export function viewFromReport(output: unknown, maxMisses = 1): CriticalMissView | null {
    const report = (output && typeof output === "object" ? output : {}) as ReportLike;
    const fixes = Array.isArray(report.top_fixes) ? report.top_fixes : [];
    // A report that flags its Critical Misses (`critical: true`, listed first) shows only those;
    // its other fixes are ordinary fixes. Unflagged reports show their first fixes, as before.
    const flagged = fixes.some((fix) => typeof fix?.critical === "boolean");
    const misses = (flagged ? fixes.filter((fix) => fix?.critical === true) : fixes)
        .slice(0, Math.max(1, Math.min(3, maxMisses)))
        .map((fix) => ({
            fix: text(fix?.fix) || text(fix?.text),
            why: text(fix?.why),
            resume_lines: excerptOf(fix?.evidence),
        }))
        .filter((miss) => miss.fix);
    if (misses.length === 0) return null;
    const nothingCritical = fixes[0]?.impact_level === "low";
    return {
        label: nothingCritical ? "Nothing critical" : "Critical Miss",
        verdict: text(report.first_impression),
        misses,
        ...(report.more_critical === true ? { more_than_three: true } : {}),
    };
}

/**
 * What a reader sees as the report's Critical Misses, the default for every
 * judge run: each flagged one (up to three) when the report flags them, or
 * only the first fix when it doesn't, as the production report renders it.
 * An explicit `maxMisses` overrides it, for instance `--max-misses 3` to show
 * an unflagged report's first three fixes.
 */
export function shownView(output: unknown, maxMisses?: number): CriticalMissView | null {
    const fixes = (output && typeof output === "object" ? (output as ReportLike).top_fixes : undefined);
    const flagged = Array.isArray(fixes) && fixes.some((fix) => typeof fix?.critical === "boolean");
    return viewFromReport(output, maxMisses ?? (flagged ? 3 : 1));
}

/** Every string in a view, for checking that a quoted claim really came from it. */
export function viewText(view: CriticalMissView): string {
    return [
        view.label,
        view.verdict,
        ...view.misses.flatMap((miss) => [miss.fix, miss.why, ...miss.resume_lines]),
        renderView(view),
    ].join("\n");
}

/** The production contract's markers for a fix that adds a missing section (resume_v2.txt, top_fixes). */
const ABSENCE_MARKER = /^No (summary|skills|education) section present$/i;

export function renderView(view: CriticalMissView): string {
    const lines = [`Label: ${view.label}`, `Verdict: ${view.verdict || "(none)"}`];
    view.misses.forEach((miss, index) => {
        lines.push(`${view.misses.length > 1 ? `Critical Miss ${index + 1}` : "Critical Miss"}:`);
        lines.push(`  Fix: ${miss.fix}`);
        lines.push(`  Why: ${miss.why || "(none)"}`);
        for (const line of miss.resume_lines) {
            const absent = line.trim().match(ABSENCE_MARKER);
            lines.push(absent
                ? `  Cites no line: the report says the resume has no ${absent[1].toLowerCase()} section.`
                : `  Resume line it cites: "${line}"`);
        }
    });
    if (view.more_than_three) lines.push("The report also says this resume has more than three Critical Misses and shows the first three.");
    return lines.join("\n");
}

// ============================================
// SYNTHETIC-ONLY GUARD
// ============================================

/**
 * Only synthetic or fictional resumes may be sent to a judge model. Smoke
 * fixtures and the non-synthetic golden fixtures include real people's
 * resumes, so they are refused here rather than trusted to a flag.
 */
export function isJudgeableFixture(fixture: Pick<Fixture, "id" | "tags" | "path"> | undefined): boolean {
    if (!fixture) return false;
    return fixture.id.startsWith("synth_")
        && fixture.tags.includes("synthetic")
        && /(^|\/)synth_[a-z0-9_]+\.txt$/i.test(fixture.path);
}

export function judgeableFixtureIds(calibration: CalibrationData): Set<string> {
    return new Set(calibration.fixtures.filter(isJudgeableFixture).map((fixture) => fixture.id));
}

/** Normalize whitespace so a quote can match across line wrapping and trailing spaces. */
export function squash(value: string): string {
    return value.replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/\s+/g, " ").trim().toLowerCase();
}

export function containsQuote(haystack: string, quote: string): boolean {
    const needle = squash(quote).replace(/^["'\-\s]+|["'\s.]+$/g, "");
    if (!needle) return false;
    return squash(haystack).includes(needle);
}
