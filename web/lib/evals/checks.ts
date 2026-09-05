import { namesConcreteEditDetail } from "../llm/grounding";
/**
 * PromptOps Eval Harness - Validation Checks
 */

import type {
    CheckResult,
    ErrorCode,
    WarningCode,
    Fixture,
    BaselineFixture
} from "./types";
import {
    checkSchema,
    checkScoreRange,
    checkSubscoreDrift,
} from "./contract-checks";
import {
    checkBiggestGapEvidence,
    checkEvidence,
    checkRewriteGrounding,
} from "./evidence-checks";
import {
    CONCRETE_PATTERNS as PATTERNS
} from "./types";

// ============================================
// TEXT NORMALIZATION
// ============================================

export function normalize(s: string): string {
    return s
        .toLowerCase()
        .replace(/[^\w\d%\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsLiteral(text: string, value: string): boolean {
    return new RegExp(escapeRegExp(value)).test(text);
}

function generatedLanguageForPhraseChecks(output: unknown): string {
    const values: string[] = [];

    function visit(value: unknown, path: string[]) {
        if (typeof value === "string") {
            const joined = path.join(".");
            if (joined.endsWith("evidence.excerpt") || /(?:^|\.)rewrites\.\d+\.original$/.test(joined)) return;
            values.push(joined === "biggest_gap_example"
                ? value.replace(/["“][^"”]+["”]/g, "")
                : value);
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((item, index) => visit(item, [...path, String(index)]));
            return;
        }
        if (value && typeof value === "object") {
            for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
                visit(child, [...path, key]);
            }
        }
    }

    visit(output, []);
    return values.join("\n");
}


// ============================================
// EVIDENCE CHECKS
// ============================================

// SUMMARY STRUCTURE CHECK
// ============================================

function checkSummaryStructure(summary: string): CheckResult {
    // Check for: role-level signal + strength + gap
    // This is heuristic: look for sentence count and key phrases

    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length < 3 || sentences.length > 5) {
        return {
            passed: false,
            code: "W_SUMMARY_STRUCTURE",
            message: `Summary has ${sentences.length} sentences (expected 3-5)`
        };
    }

    // Role interpretation, strengths, and missing detail need a source-aware review.
    // Keyword proxies rewarded stock phrases and rejected concrete factual summaries.
    // Keep sentence structure automatic; review meaning against the resume in the live eval.
    return { passed: true };
}

// ============================================
// PHRASE CHECKS
// ============================================

function checkBannedPhrases(
    output: string,
    globalBanned: string[],
    fixtureBanned: string[] = []
): CheckResult[] {
    const results: CheckResult[] = [];
    const normalizedOutput = output.toLowerCase();

    const allBanned = [...globalBanned, ...fixtureBanned];

    for (const phrase of allBanned) {
        if (containsLiteral(normalizedOutput, phrase.toLowerCase())) {
            results.push({
                passed: false,
                code: "E_BANNED_PHRASE",
                message: `Contains banned phrase: "${phrase}"`
            });
        }
    }

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

function checkDiscouragedPhrases(
    output: string,
    globalDiscouraged: string[]
): CheckResult[] {
    const results: CheckResult[] = [];
    const normalizedOutput = output.toLowerCase();

    for (const phrase of globalDiscouraged) {
        if (containsLiteral(normalizedOutput, phrase.toLowerCase())) {
            results.push({
                passed: false,
                code: "W_DISCOURAGED_PHRASE",
                message: `Contains discouraged phrase: "${phrase}"`
            });
        }
    }

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

// ============================================
// HUMAN COPY CHECK
// ============================================

export function findMechanicalCopyIssues(output: unknown): string[] {
    const prose: Array<{ path: string; value: string }> = [];

    function visit(value: unknown, path: string[]) {
        if (typeof value === "string") {
            const joined = path.join(".");
            const isSourceText = joined.endsWith("evidence.excerpt")
                || /(?:^|\.)rewrites\.\d+\.original$/.test(joined)
                || joined === "biggest_gap_example";
            const isRequiredBoilerplate = joined.startsWith("section_review.")
                || joined === "job_alignment.role_fit.company_stage_fit"
                || joined === "job_alignment.missing.0"
                || joined.endsWith(".section_ref")
                || joined.endsWith(".evidence.section")
                || joined.endsWith(".label")
                || joined.endsWith(".confidence")
                || joined.endsWith(".impact_level")
                || joined.endsWith(".effort")
                || joined.endsWith(".archetype");
            if (!isSourceText && !isRequiredBoilerplate) prose.push({ path: joined, value });
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((item, index) => visit(item, [...path, String(index)]));
            return;
        }
        if (value && typeof value === "object") {
            for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
                visit(child, [...path, key]);
            }
        }
    }

    visit(output, []);
    const issues: string[] = [];
    const sentences = new Map<string, string>();

    for (const item of prose) {
        if (/\.\.\./.test(item.value)) {
            issues.push(`${item.path} uses an ellipsis as connective tissue`);
        }

        const normalized = item.value.toLowerCase().replace(/[^a-z0-9' -]+/g, " ").replace(/\s+/g, " ").trim();
        const repeatedClause = normalized.match(/\b([a-z][a-z'-]+(?:\s+[a-z][a-z'-]+){2,5})\b.{0,140}\b\1\b/i)?.[1];
        const trailingWord = repeatedClause?.split(/\s+/).at(-1);
        const isProgressionPhrase = Boolean(trailingWord && ["to", "from", "through", "into"].includes(trailingWord));
        const isRepeatedRoleOrDomainLabel = Boolean(trailingWord && [
            "manager", "director", "executive", "engineer", "designer", "recruiter",
            "hiring", "recruiting",
        ].includes(trailingWord));
        const repeatedMetricLabel = repeatedClause ? Array.from(normalized.matchAll(new RegExp(`\\b${escapeRegExp(repeatedClause)}\\b`, "g"))) : [];
        const qualifiesDistinctMetrics = repeatedMetricLabel.length > 1 && repeatedMetricLabel.every(match =>
            /\d+(?:\.\d+)?[kmb]?\s+$/.test(normalized.slice(0, match.index)));
        if (repeatedClause && !isProgressionPhrase && !isRepeatedRoleOrDomainLabel && !qualifiesDistinctMetrics) {
            issues.push(`${item.path} repeats the clause "${repeatedClause}"`);
        }

        for (const sentence of item.value.split(/(?<=[.!?])\s+/)) {
            const key = normalize(sentence);
            if (key.split(/\s+/).length < 7) continue;
            const priorPath = sentences.get(key);
            if (priorPath && priorPath !== item.path) {
                issues.push(`${item.path} repeats a full sentence from ${priorPath}`);
            } else if (!priorPath) {
                sentences.set(key, item.path);
            }
        }
    }

    return Array.from(new Set(issues));
}

function checkMechanicalCopy(output: unknown): CheckResult[] {
    const issues = findMechanicalCopyIssues(output);
    if (issues.length === 0) return [{ passed: true }];
    return issues.map((issue) => ({
        passed: false,
        code: "W_MECHANICAL_COPY" as const,
        message: issue,
    }));
}

// ============================================
// SPECIFICITY CHECK
// ============================================

function checkSpecificity(
    topFixes: Array<{ fix: string }>
): CheckResult[] {
    const results: CheckResult[] = [];

    for (let i = 0; i < topFixes.length; i++) {
        const fixText = topFixes[i].fix;
        const namesConcreteSkillGroup = /\bskills?\s+section\b/i.test(fixText)
            && (fixText.match(/,/g) || []).length >= 2;
        const namesConcreteRemoval = /^(?:remove|delete)\b/i.test(fixText)
            && /["“][^"”]+["”]|\b(?:line|entry|phrase|label|header|headline|section)\b/i.test(fixText);
        const namesQuotedCorrection = /\b(?:compare|correct|replace|remove)\b/i.test(fixText)
            && /["“][^"”]{4,}["”]/.test(fixText);
        const namesTargetedSummary = /\bsummary\b/i.test(fixText)
            && /\btarget\b/i.test(fixText)
            && /\b(?:role|roles|account executive)\b/i.test(fixText);
        const namesQualitativeDetail = /\b(?:bullet|section|statement)\b/i.test(fixText)
            && /\b(?:reporting cadence|audience|recipients?|deal stage|customer problem|process(?:es)? you (?:changed|implemented|designed)|specific change that followed|decisions? you|deliverables? you|responsibilit(?:y|ies) you|what changed|what you (?:built|delivered|decided))\b/i.test(fixText);
        const hasConcreteToken = PATTERNS.some(p => p.test(fixText))
            || namesConcreteSkillGroup
            || namesConcreteRemoval
            || namesQuotedCorrection
            || namesTargetedSummary
            || namesQualitativeDetail
            || namesConcreteEditDetail(fixText);

        if (!hasConcreteToken) {
            results.push({
                passed: false,
                code: "W_SPECIFICITY_LOW",
                message: `Fix ${i + 1} lacks a specific detail, quoted correction, or concrete target`,
                details: { fix_index: i, fix_preview: fixText.slice(0, 50) }
            });
        }
    }

    if (results.length === 0) {
        results.push({ passed: true });
    }

    return results;
}

// ============================================
// RUN ALL CHECKS
// ============================================

export interface AllChecksInput {
    output: unknown;
    resumeText: string;
    fixture: Fixture;
    baseline?: BaselineFixture;
    globalBanned: string[];
    globalDiscouraged: string[];
    expectedContractVersion: string;
}

export interface AllChecksResult {
    errors: Array<{ code: ErrorCode; message: string }>;
    warnings: Array<{ code: WarningCode; message: string }>;
}

export function runAllChecks(input: AllChecksInput): AllChecksResult {
    const errors: Array<{ code: ErrorCode; message: string }> = [];
    const warnings: Array<{ code: WarningCode; message: string }> = [];

    function addResult(result: CheckResult) {
        if (!result.passed && result.code) {
            const entry = { code: result.code, message: result.message || "" };
            if (result.code.startsWith("E_")) {
                errors.push(entry as { code: ErrorCode; message: string });
            } else {
                warnings.push(entry as { code: WarningCode; message: string });
            }
        }
    }

    // Schema checks
    for (const r of checkSchema(input.output, input.expectedContractVersion)) {
        addResult(r);
    }

    // If schema failed badly, skip other checks
    if (errors.some(e => e.code === "E_SCHEMA")) {
        return { errors, warnings };
    }

    const obj = input.output as Record<string, unknown>;

    if (/\[?SOURCE_\d{3}\]?/i.test(JSON.stringify(obj))) {
        addResult({
            passed: false,
            code: "E_SOURCE_TAG_LEAK",
            message: "Output exposes an internal SOURCE catalog tag",
        });
    }

    // Score checks
    for (const r of checkScoreRange(
        obj.score as number,
        input.fixture.expected_score,
        input.baseline
    )) {
        addResult(r);
    }

    // Subscore drift
    for (const r of checkSubscoreDrift(
        obj.subscores as Record<string, number> | undefined,
        input.baseline
    )) {
        addResult(r);
    }

    // Evidence checks
    if (Array.isArray(obj.top_fixes)) {
        for (const r of checkEvidence(obj.top_fixes as any[], input.resumeText)) {
            addResult(r);
        }

        // Specificity
        for (const r of checkSpecificity(obj.top_fixes as any[])) {
            addResult(r);
        }
    }

    if (Array.isArray(obj.rewrites)) {
        for (const r of checkRewriteGrounding(obj.rewrites as any[], input.resumeText)) {
            addResult(r);
        }
    }

    if (typeof obj.biggest_gap_example === "string") {
        for (const r of checkBiggestGapEvidence(obj.biggest_gap_example, input.resumeText)) {
            addResult(r);
        }
    }

    // Summary structure
    if (typeof obj.summary === "string") {
        addResult(checkSummaryStructure(obj.summary));
    }

    // Phrase checks - serialize output for phrase checking
    const outputStr = generatedLanguageForPhraseChecks(obj);
    for (const r of checkBannedPhrases(outputStr, input.globalBanned, input.fixture.banned_phrases)) {
        addResult(r);
    }
    for (const r of checkDiscouragedPhrases(outputStr, input.globalDiscouraged)) {
        addResult(r);
    }
    for (const r of checkMechanicalCopy(obj)) {
        addResult(r);
    }

    return { errors, warnings };
}
