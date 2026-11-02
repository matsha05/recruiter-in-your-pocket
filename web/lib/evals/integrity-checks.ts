/**
 * PromptOps Eval Harness - Report integrity checks
 *
 * The grounding and schema checks can pass while the report still contradicts
 * itself. These checks measure what a customer reads: whether there are any
 * rewrites, whether a line is both "keep" and "fix", how often one observation
 * repeats, whether each slot holds the right kind of text, what kind of issue
 * the Critical Miss is, and whether the Verdict and Critical Miss tell one story.
 *
 * Each count is reported twice where it applies: as the model wrote the report,
 * and as it renders after the deterministic post-generation pass. They are
 * reported, not gated, so the existing PASS/WARN/FAIL bar is unchanged.
 */

import type { ReportData } from "../../components/workspace/report/ReportTypes";
import {
    auditKeepFixCollisions,
    auditRepeats,
    criticalMissReason,
    fixCardSlots,
    fixLineOf,
    questionsInWhy,
    hasMoreCriticalMisses,
    isCriticalFix,
    reconcileReport,
    structuralGapKind,
    type StructuralGapKind,
} from "../reports/report-integrity";
import type { FixtureResult } from "./types";

export type CriticalMissKind = StructuralGapKind | "positioning" | "buried_evidence";

export interface ReportIntegrityMetrics {
    rewrites: number;
    keep_fix_collisions: { model: number; shown: number; critical_miss_in_keep: { model: boolean; shown: boolean } };
    repeated_observations: { model: number; shown: number; examples: string[] };
    slot_mapping: { model: string[]; shown: string[] };
    critical_miss: {
        category: "bullet_edit" | "structural" | "none";
        kind?: CriticalMissKind;
        /** The report says nothing needs fixing first: its only Critical Miss is marked low impact. */
        nothing_critical: boolean;
        /** Structural issues the report itself raises (gaps, Verdict, section notes). */
        structural_flagged: CriticalMissKind[];
        /** A structural issue was flagged, but the Critical Miss is a single-line edit. */
        outranked: boolean;
    };
    verdict_critical_miss: {
        agreement: "agree" | "mismatch" | "no_concern";
        reasons: string[];
        notes: string[];
    };
    /** Fix headings: one short instruction, with location and conditions left to `why`. */
    fix_headings: { count: number; max_words: number; over_12_words: number; with_location: number; with_condition: number };
    /** Every fix the report flags as a Critical Miss (the first fix alone for unflagged reports), by what it asks for. */
    critical_misses: { count: number; kinds: CriticalFixKind[]; more: boolean };
}

/** What one Critical Miss asks for: a concrete missing fact, a structural issue, or only moving text. */
export type CriticalFixKind = "concrete_fact" | "dates" | "direction" | "level" | "move" | "other";

const POSITIONING = /\b(?:(?:opening |professional )?summary|headline|objective|profile statement|section order)\b/i;
const MONTH = String.raw`(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*`;
// How a Critical Miss names the kinds the shared pass doesn't detect. Eval-only, so the
// rendered "Before the bullets" note is unchanged.
const DATES = new RegExp([
    String.raw`\b(?:nothing|no (?:role|work|activity|entry))(?: (?:is|on the page|on the resume|appears|listed))* (?:later|after|since|newer|current)\b`,
    String.raw`\b(?:done|doing|been up to)\b[^.]{0,20}\b(?:since|after) (?:${MONTH}\.? )?(?:19|20)\d{2}\b`,
    String.raw`\b(?:ends?|ended) in (?:${MONTH}\.? )?(?:19|20)\d{2}\b`,
    String.raw`\b(?:work|activity|activities|role|done|doing)\b[^.]{0,20}\b(?:since|after) (?:${MONTH}\.? )?(?:19|20)\d{2}\b`,
].join("|"), "i");
const DATE_RANGE = new RegExp(String.raw`^\s*(?:${MONTH}\.?\s+)?(?:19|20)\d{2}\s*[-–—]\s*(?:(?:${MONTH}\.?\s+)?(?:19|20)\d{2}|present|current)\s*$`, "i");
const LEVEL = /\btitles?\b[^.]{0,100}\b(?:helped|supported|assisted|contributed)\b|\b(?:helped|supported|assisted|contributed)\b[^.]{0,100}\btitles?\b|\b(?:decisions|calls) you (?:made|owned) as\b|\breads? (?:more )?junior\b/i;
const MOVES_EVIDENCE = /^(?:move|lead with|surface|bring)\b/i;
const LOW_ON_PAGE = /\b(?:buried|(?:older|earlier|previous) (?:\w+ )?(?:role|job|position)|last bullet|first bullet|bottom|further down|below|above|ahead of|in (?:your )?skills|to the top|near the top|up front|top of|sits (?:second|third|fourth|fifth|last)|(?:second|third|fourth|fifth) bullet)\b/i;
// A strong result placed where a first pass misses it, as the Verdict or a gap describes it.
const BURIED = /\b(?:appears|sits|is listed|comes)\b[^.]{0,40}\b(?:below|fourth|third|fifth|last|low on the page|further down)\b|\b(?:may|could|might) (?:not reach|miss) it\b|\bbe missed\b|\bburied\b/i;
const LOCATION = /^\s*(?:in|on|under|for) (?:the|your)\b/i;
// Asks for a fact a recruiter can hold onto: a size, a figure, or a named project, product or system.
const CONCRETE_FACT = /\b(?:budget|size|scale|count|number|how many|team|headcount|customers?|clients?|accounts?|users?|patients?|students?|stores?|skus?|revenue|arr|quota|deals?|pipeline|savings?|cost|volume|dollar|amount|result|outcome|figure|rate|percent|metric|measure|time|turnaround|project|product|system|component|feature|platform|program|tool|report|deliverable|campaign|launch|client name)s?\b|\$|%|\d/i;
const CONDITION = /\b(?:if you can|if known|if available|if that information|only if)\b/i;
const CONCERN = /\b(?:but|though|although|however|less|harder|unclear|isn't|aren't|doesn't|don't|does not|do not|not yet|little|few|no|without|broad|general terms|vague|missing|difficult|hard to|nothing (?:later|after|since|follows)|may not|cannot see|can't see|be missed|could miss)\b/i;
const KEEP_CLAIM = /\b(?:keep|worth keeping|leave (?:it|this|that|them) alone)\b/i;
const INSTRUCTION = /^(?:add|name|describe|explain|replace|remove|revise|clarify|specify|include|identify|quantify|rewrite|cut|move)\b/i;

type Fix = NonNullable<ReportData["top_fixes"]>[number];

function isCopy(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function list<T>(value: T[] | undefined | null): T[] {
    return Array.isArray(value) ? value : [];
}

function sentences(text: string | undefined) {
    return String(text || "").split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
}

function evidenceSection(fix: Fix | undefined) {
    return fix?.evidence && typeof fix.evidence === "object" ? fix.evidence.section || "" : fix?.section_ref || "";
}

function evidenceExcerpt(fix: Fix | undefined) {
    if (!fix?.evidence) return "";
    return typeof fix.evidence === "string" ? fix.evidence : fix.evidence.excerpt || "";
}

/** The shared pass's structural kinds, plus the date and level wording it doesn't detect. */
function structuralKind(text: string | null | undefined): CriticalMissKind | undefined {
    const value = String(text || "");
    return structuralGapKind(value)
        || (DATES.test(value) ? "employment_gap" : undefined)
        || (LEVEL.test(value) ? "level" : undefined)
        || (BURIED.test(value) ? "buried_evidence" : undefined);
}

function issueKind(text: string | undefined, section = ""): CriticalMissKind | undefined {
    return structuralKind(text) || (POSITIONING.test(String(text || "")) || /summary|objective|profile/i.test(section) ? "positioning" : undefined);
}

export function criticalMissCategory(fix: Fix | undefined): Pick<ReportIntegrityMetrics["critical_miss"], "category" | "kind"> {
    if (!fix || !isCopy(fix.fix || fix.text)) return { category: "none" };
    const action = String(fix.fix || fix.text).trim();
    const text = `${action} ${fix.why || ""}`;
    const kind = structuralKind(text)
        || (DATE_RANGE.test(evidenceExcerpt(fix)) ? "employment_gap" : undefined)
        || structuralGapKind(evidenceExcerpt(fix))
        || (MOVES_EVIDENCE.test(action) && LOW_ON_PAGE.test(text) ? "buried_evidence" : undefined)
        || issueKind(action, evidenceSection(fix));
    return kind ? { category: "structural", kind } : { category: "bullet_edit" };
}

function wordCount(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export function criticalFixKind(fix: Fix | undefined): CriticalFixKind {
    const action = String(fix?.fix || fix?.text || "").trim();
    const category = criticalMissCategory(fix);
    if (category.kind === "employment_gap") return "dates";
    if (category.kind === "target_role" || category.kind === "positioning") return "direction";
    if (category.kind === "level") return "level";
    if (MOVES_EVIDENCE.test(action)) return "move";
    return CONCRETE_FACT.test(action) ? "concrete_fact" : "other";
}

function criticalMisses(report: ReportData): ReportIntegrityMetrics["critical_misses"] {
    const fixes = list(report.top_fixes).filter((fix, index) => isCriticalFix(report, index) && isCopy(fix?.fix || fix?.text));
    return { count: fixes.length, kinds: fixes.map(criticalFixKind), more: hasMoreCriticalMisses(report) };
}

export function fixHeadings(report: ReportData): ReportIntegrityMetrics["fix_headings"] {
    const headings = list(report.top_fixes).map((fix) => String(fix?.fix || fix?.text || "")).filter(isCopy);
    return {
        count: headings.length,
        max_words: headings.reduce((max, heading) => Math.max(max, wordCount(heading)), 0),
        over_12_words: headings.filter((heading) => wordCount(heading) > 12).length,
        with_location: headings.filter((heading) => LOCATION.test(heading)).length,
        with_condition: headings.filter((heading) => CONDITION.test(heading)).length,
    };
}

function structuralFlagged(report: ReportData): CriticalMissKind[] {
    const kinds = new Set<CriticalMissKind>();
    for (const gap of list(report.gaps)) {
        const kind = structuralKind(gap);
        if (kind) kinds.add(kind);
    }
    for (const sentence of sentences(report.first_impression)) {
        if (!CONCERN.test(sentence)) continue;
        const kind = issueKind(sentence);
        if (kind) kinds.add(kind);
    }
    for (const review of Object.values(report.section_review || {})) {
        const kind = structuralKind(review?.missing);
        if (kind) kinds.add(kind);
    }
    return [...kinds];
}

/** The Verdict's concern is usually its last sentence that names a problem. */
function verdictConcern(report: ReportData) {
    return sentences(report.first_impression).filter((sentence) => CONCERN.test(sentence)).at(-1);
}

/** A target role and a positioning note are the same direction problem, named two ways. */
function sameIssue(left: CriticalMissKind, right: CriticalMissKind) {
    const direction = (kind: CriticalMissKind) => (kind === "target_role" || kind === "positioning" ? "direction" : kind);
    return direction(left) === direction(right);
}

function verdictAgreement(
    report: ReportData,
    category: ReturnType<typeof criticalMissCategory>,
    nothingCritical: boolean,
): ReportIntegrityMetrics["verdict_critical_miss"] {
    const reasons: string[] = [];
    const notes: string[] = [];
    const concern = verdictConcern(report);
    const concernKind = issueKind(concern);
    if (concern && concernKind && nothingCritical) {
        reasons.push(`The Verdict's concern is ${humanKind(concernKind)}, but the Critical Miss is marked optional.`);
    } else if (concern && concernKind && category.category === "bullet_edit") {
        reasons.push(`The Verdict's concern is ${humanKind(concernKind)}, but the Critical Miss is a single-line edit.`);
    } else if (concernKind && category.kind && !sameIssue(concernKind, category.kind)) {
        reasons.push(`The Verdict's concern is ${humanKind(concernKind)}, but the Critical Miss is ${humanKind(category.kind)}.`);
    }
    const concernFix = fixLineOf(report, concern);
    if (concernFix !== undefined && concernFix !== 0) {
        reasons.push(`The Verdict's concern is fix ${concernFix + 1}'s line, not the Critical Miss.`);
    }

    const takeawayFix = fixLineOf(report, report.first_impression_takeaway, true);
    if (takeawayFix !== undefined && takeawayFix !== 0) {
        reasons.push(`The takeaway ("${report.first_impression_takeaway}") points at fix ${takeawayFix + 1}, not the Critical Miss.`);
    }
    const exampleFix = fixLineOf(report, report.biggest_gap_example);
    if (exampleFix !== undefined && exampleFix !== 0) notes.push(`The biggest-gap example quotes fix ${exampleFix + 1}'s line.`);
    for (const sentence of sentences(report.first_impression)) {
        if (!KEEP_CLAIM.test(sentence)) continue;
        const fixIndex = fixLineOf(report, sentence);
        if (fixIndex !== undefined) notes.push(`The Verdict says to keep part of the line fix ${fixIndex + 1} changes.`);
    }

    // "Nothing critical" with a Verdict that raises no concern is one story.
    const agreement = reasons.length > 0 ? "mismatch" : concern || nothingCritical ? "agree" : "no_concern";
    if (agreement === "no_concern" && category.category !== "none") {
        notes.push("The Verdict raises no concern, yet the report still names a Critical Miss.");
    }
    return { agreement, reasons, notes };
}

function humanKind(kind: CriticalMissKind) {
    return kind.replace(/_/g, " ");
}

function slotIssuesInModelOutput(report: ReportData) {
    const issues: string[] = [];
    list(report.top_fixes).forEach((fix, index) => {
        if (questionsInWhy(fix?.why).length > 0) issues.push(`top_fixes[${index}].why is a list of questions, not a reason`);
    });
    list(report.ideas?.questions).forEach((question, index) => {
        if (isCopy(question?.question) && !question.question.trim().endsWith("?")) issues.push(`ideas.questions[${index}] is not a question`);
    });
    list(report.strengths).forEach((strength, index) => {
        if (INSTRUCTION.test(String(strength || "").trim())) issues.push(`strengths[${index}] reads as an instruction`);
    });
    list(report.gaps).forEach((gap, index) => {
        if (String(gap || "").trim().endsWith("?")) issues.push(`gaps[${index}] is a question`);
    });
    if (!isCopy(report.first_impression)) issues.push("first_impression is empty, so the Verdict falls back to another field");
    return issues;
}

/** Problems with what one fix card shows; `reason` is the Critical Miss reason in the opening read. */
export function fixSlotIssues(index: number, slots: { why?: string; whatToAdd: string[] }, reason?: string) {
    const issues: string[] = [];
    if (index === 0 && slots.why) issues.push("the Critical Miss card repeats the reason shown in the opening read");
    if (slots.why && questionsInWhy(slots.why).length > 0) issues.push(`fix ${index + 1}'s "Why it matters" holds questions`);
    for (const item of slots.whatToAdd) {
        if (!item.trim().endsWith("?")) issues.push(`fix ${index + 1}'s "What to add" holds a statement: "${item.slice(0, 60)}"`);
        if (index === 0 && reason && item === reason) issues.push(`the Critical Miss "What to add" repeats its reason`);
    }
    return issues;
}

function slotIssuesAsRendered(report: ReportData) {
    const integrity = reconcileReport(report);
    const reason = criticalMissReason(integrity);
    const issues: string[] = [];
    if (reason && questionsInWhy(reason).length > 0) issues.push("the Critical Miss reason is a list of questions");
    list(integrity.report.top_fixes).forEach((_, index) => issues.push(...fixSlotIssues(index, fixCardSlots(integrity, index), reason)));
    list(integrity.report.strengths).forEach((strength, index) => {
        if (INSTRUCTION.test(String(strength || "").trim())) issues.push(`Keep item ${index + 1} reads as an instruction`);
    });
    list(integrity.report.ideas?.questions).forEach((question, index) => {
        if (isCopy(question?.question) && !question.question.trim().endsWith("?")) issues.push(`Question ${index + 1} is not a question`);
    });
    return issues;
}

export function countRewrites(report: ReportData) {
    return list(report.rewrites).filter((rewrite) => isCopy(rewrite?.original) && isCopy(rewrite?.better)).length;
}

export function evaluateReportIntegrity(output: unknown): ReportIntegrityMetrics {
    const report = (output && typeof output === "object" ? output : {}) as ReportData;
    const integrity = reconcileReport(report);
    const modelCollisions = auditKeepFixCollisions(report);
    const shownCollisions = auditKeepFixCollisions(integrity.report);
    const modelRepeats = auditRepeats(report);
    const shownRepeats = auditRepeats(integrity.report, integrity);
    const category = criticalMissCategory(report.top_fixes?.[0]);
    const nothingCritical = category.category !== "none" && report.top_fixes?.[0]?.impact_level === "low";
    const flagged = structuralFlagged(report);

    return {
        rewrites: countRewrites(report),
        keep_fix_collisions: {
            model: modelCollisions.length,
            shown: shownCollisions.length,
            critical_miss_in_keep: {
                model: modelCollisions.some(({ criticalMiss }) => criticalMiss),
                shown: shownCollisions.some(({ criticalMiss }) => criticalMiss),
            },
        },
        repeated_observations: {
            model: modelRepeats.length,
            shown: shownRepeats.length,
            examples: (shownRepeats.length > 0 ? shownRepeats : modelRepeats).slice(0, 3).map(({ path, of }) => `${path} repeats ${of}`),
        },
        slot_mapping: { model: slotIssuesInModelOutput(report), shown: slotIssuesAsRendered(report) },
        critical_miss: {
            ...category,
            nothing_critical: nothingCritical,
            structural_flagged: flagged,
            outranked: category.category === "bullet_edit"
                && flagged.some((kind) => kind === "employment_gap" || kind === "target_role" || kind === "level"),
        },
        verdict_critical_miss: verdictAgreement(report, category, nothingCritical),
        fix_headings: fixHeadings(report),
        critical_misses: criticalMisses(report),
    };
}

// ============================================
// SCORE TEST-RETEST
// ============================================

export interface ScoreRetest {
    fixture_id: string;
    scores: number[];
    /** Scores from runs whose report then failed production validation. */
    unvalidated: number;
    range: number;
    mean: number;
    sd: number;
}

/** Score spread for every fixture that was generated more than once. */
export function scoreTestRetest(results: Array<Pick<FixtureResult, "fixture_id" | "actual_score" | "status">>): ScoreRetest[] {
    const byFixture = new Map<string, Array<{ score: number; failed: boolean }>>();
    for (const result of results) {
        if (!Number.isFinite(result.actual_score) || result.actual_score <= 0) continue;
        const samples = byFixture.get(result.fixture_id) || [];
        samples.push({ score: result.actual_score, failed: result.status === "FAIL" });
        byFixture.set(result.fixture_id, samples);
    }
    return [...byFixture.entries()]
        .filter(([, samples]) => samples.length > 1)
        .map(([fixture_id, samples]) => {
            const scores = samples.map(({ score }) => score);
            const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            const variance = scores.reduce((sum, score) => sum + (score - mean) ** 2, 0) / (scores.length - 1);
            return {
                fixture_id,
                scores,
                unvalidated: samples.filter(({ failed }) => failed).length,
                range: Math.max(...scores) - Math.min(...scores),
                mean: Math.round(mean * 10) / 10,
                sd: Math.round(Math.sqrt(variance) * 10) / 10,
            };
        });
}
