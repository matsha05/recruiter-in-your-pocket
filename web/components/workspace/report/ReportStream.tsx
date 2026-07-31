"use client";

import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    CaretDown,
    Check,
    CheckCircle,
    ClipboardText,
    Copy,
    CornersOut,
    EnvelopeSimple,
    BracketsAngle,
    LockKey,
    MinusCircle,
    PencilSimple,
    PaperPlaneTilt,
    Target,
} from "@phosphor-icons/react";
import { LiftedTrace } from "@/components/shared/LiftedTrace";
import { ReportData } from "./ReportTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Analytics } from "@/lib/analytics";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { JOB_SEARCH_PASS_DECISION, PRICING_PLANS } from "@/lib/billing/pricing";
import {
    assessFallbackDraftSafety,
    buildIndependentQuestionPresentation,
    buildReportRewritePresentation,
    fixPlanHeadingForCount,
} from "@/lib/reports/report-presentation";
import { ReadComparison } from "./ReadComparison";
import styles from "./ReportStream.module.css";

interface ReportStreamProps {
    report: ReportData;
    className?: string;
    isSample?: boolean;
    freeUsesRemaining?: number;
    onUpgrade?: () => void;
    hasJobDescription?: boolean;
    isGated?: boolean;
    justUnlocked?: boolean;
    highlightSection?: string | null;
    hasPaidAccess?: boolean;
    comparisonBaseline?: ReportData | null;
    onStartRevision?: () => void;
}

type Fix = NonNullable<ReportData["top_fixes"]>[number];
type Rewrite = NonNullable<ReportData["rewrites"]>[number];

const fixTrace = [
    { label: "On the page" },
    { label: "Missing proof" },
    { label: "Your fact" },
    { label: "Clearer wording" },
];

const BETA_FEEDBACK_HREF = `mailto:support@recruiterinyourpocket.com?subject=${encodeURIComponent(
    "Paid beta report feedback",
)}&body=${encodeURIComponent(
    [
        "What felt immediately useful?",
        "",
        "What felt untrustworthy, generic, or wrong?",
        "",
        "What almost stopped you from finishing?",
        "",
        "Optional: Did the score feel like a document review, or did it mean something else to you?",
    ].join("\n"),
)}`;

const JOB_SEARCH_PASS = PRICING_PLANS["30d"];

function evidenceFor(fix?: Fix) {
    if (!fix?.evidence) return undefined;
    return typeof fix.evidence === "string" ? fix.evidence : fix.evidence.excerpt;
}

function sectionFor(fix?: Fix) {
    if (!fix?.evidence) return fix?.section_ref;
    return typeof fix.evidence === "string" ? fix.section_ref : fix.evidence.section || fix.section_ref;
}

function workingDraftFor(original?: string) {
    if (!original) return "Add [verified detail] to this line.";
    const clean = original.trim().replace(/^[-•*]\s+/, "").replace(/[.;]\s*$/, "");
    return `${clean}; [verified detail].`;
}

function placeholderKeysFor(value: string) {
    return Array.from(new Set(Array.from(value.matchAll(/\[([^\]]+)\]/g), (match) => match[1].trim())));
}

function placeholderLabel(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function confirmedFactAppearsIn(value: string, fact: string) {
    const normalizedFact = fact.trim().replace(/\s+/g, " ");
    if (!normalizedFact) return false;
    const escapedFact = normalizedFact.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapedFact}(?:$|[^\\p{L}\\p{N}])`, "iu")
        .test(value.replace(/\s+/g, " "));
}

const ONBOARDING_NO_NUMBER_DRAFT =
    "Improved cross-team onboarding by clarifying expectations, responsibilities, and coordination for new hires.";

function qualitativeFallbackFor(value: string) {
    const keys = placeholderKeysFor(value);
    const isOnboardingTemplate = /\bonboarding\b/i.test(value)
        && ["program length", "number of hires", "teams", "verified outcome"]
            .every((key) => keys.includes(key));
    return isOnboardingTemplate ? ONBOARDING_NO_NUMBER_DRAFT : null;
}

function MarkedTakeaway({ text }: { text: string }) {
    const match = text.match(/\bbigger\b/i);
    if (!match || match.index === undefined) return <>{text}</>;

    const start = match.index;
    const end = start + match[0].length;
    return <>{text.slice(0, start)}<span className="riyp-marker">{text.slice(start, end)}</span>{text.slice(end)}</>;
}

function FixCanvas({
    fix,
    rewrite,
    index,
    locked,
    onUnlock,
}: {
    fix: Fix;
    rewrite?: Rewrite;
    index: number;
    locked?: boolean;
    onUnlock?: () => void;
}) {
    const original = evidenceFor(fix) || rewrite?.original;
    const draftSource = rewrite?.original || original || "";
    const suggestedLine = rewrite?.better || workingDraftFor(original);
    const [draft, setDraft] = useState(suggestedLine);
    const [editing, setEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [answer, setAnswer] = useState("");
    const [factValues, setFactValues] = useState<Record<string, string>>({});
    const [answerApplied, setAnswerApplied] = useState(false);
    const [usingQualitativeFallback, setUsingQualitativeFallback] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const action = fix.fix || fix.text || "Make this part of the resume more specific";
    const factPrompt = `What verified detail from this exact line would support this change: “${action.replace(/[.?!]\s*$/, "")}”?`;
    const placeholderKeys = useMemo(() => placeholderKeysFor(suggestedLine), [suggestedLine]);
    const qualitativeFallback = useMemo(() => qualitativeFallbackFor(suggestedLine), [suggestedLine]);
    const requiresCandidateFacts = placeholderKeys.length > 0;
    const allRequiredFactsProvided = requiresCandidateFacts
        && placeholderKeys.every((key) => factValues[key]?.trim());
    const hasAnyCandidateFact = answer.trim().length > 0
        || placeholderKeys.some((key) => factValues[key]?.trim());
    const hasUnresolvedFactPlaceholders = /\[[^\]]+\]/.test(draft);
    const fallbackSafety = useMemo(
        () => rewrite && !usingQualitativeFallback
            ? { copyable: true, issues: [] }
            : assessFallbackDraftSafety(draftSource, draft),
        [draft, draftSource, rewrite, usingQualitativeFallback],
    );
    const allAppliedFactsPresent = usingQualitativeFallback || (requiresCandidateFacts
        ? answerApplied
            && placeholderKeys.every((key) => confirmedFactAppearsIn(draft, factValues[key] || ""))
        : !answerApplied || confirmedFactAppearsIn(draft, answer));
    const allowedNumberTokens = new Set(
        `${draftSource} ${answerApplied ? answer : ""} ${answerApplied ? placeholderKeys.map((key) => factValues[key] || "").join(" ") : ""}`
            .match(/\d[\d,.]*(?:%|[kmb])?/gi) || [],
    );
    const draftNumberTokens = draft.match(/\d[\d,.]*(?:%|[kmb])?/gi) || [];
    const hasUnsupportedNumber = draftNumberTokens.some((token) => !allowedNumberTokens.has(token));
    const copyBlocked = hasUnresolvedFactPlaceholders
        || (requiresCandidateFacts && !answerApplied && !usingQualitativeFallback)
        || !allAppliedFactsPresent
        || hasUnsupportedNumber
        || !fallbackSafety.copyable;
    const traceProgress = answerApplied || usingQualitativeFallback
        ? draft.trim() !== suggestedLine.trim() ? 100 : 82
        : hasAnyCandidateFact ? 68 : 50;
    let copyGuidance = "A working draft based on the facts already in your resume.";
    if (hasUnsupportedNumber) {
        copyGuidance = "A number in this draft is not in the facts you confirmed. Remove it or update the matching fact before copying.";
    } else if (hasUnresolvedFactPlaceholders && !answerApplied) {
        copyGuidance = "We don’t invent accomplishments. Add every supporting fact below or use the factual no-number draft.";
    } else if (hasUnresolvedFactPlaceholders) {
        copyGuidance = "Your supporting facts are saved. Replace every bracket with the matching fact before copying.";
    } else if (!allAppliedFactsPresent) {
        copyGuidance = "Keep every confirmed fact in the draft before copying.";
    } else if (requiresCandidateFacts && !answerApplied && !usingQualitativeFallback) {
        copyGuidance = "Confirm the supporting facts below before copying this quantified rewrite.";
    } else if (!fallbackSafety.copyable) {
        copyGuidance = "Guidance only—this draft is not faithful enough to the source line for one-click copy. Keep the same work, ownership, and supported outcome as you edit.";
    } else if (usingQualitativeFallback) {
        copyGuidance = "A factual no-number alternative, ready to adapt without inventing scale or results.";
    } else if (answerApplied) {
        copyGuidance = "Your verified fact is preserved. Edit the sentence until it sounds like you.";
    }

    useEffect(() => {
        setDraft(suggestedLine);
        setFactValues({});
        setAnswerApplied(false);
        setUsingQualitativeFallback(false);
    }, [suggestedLine]);

    const handleCopy = async () => {
        if (copyBlocked) return;
        await navigator.clipboard.writeText(draft);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const handleUseAnswer = () => {
        if (requiresCandidateFacts) {
            if (!allRequiredFactsProvided) return;
            const groundedDraft = suggestedLine.replace(/\[([^\]]+)\]/g, (match, rawKey: string) => {
                const value = factValues[rawKey.trim()]?.trim();
                return value || match;
            });
            setDraft(groundedDraft);
            setAnswerApplied(true);
            setUsingQualitativeFallback(false);
            setEditing(true);
            return;
        }

        const cleanAnswer = answer.trim().replace(/\s+/g, " ");
        if (!cleanAnswer) return;
        setAnswerApplied(true);
        setUsingQualitativeFallback(false);
        setEditing(true);
    };

    const handleUseQualitativeFallback = () => {
        if (!qualitativeFallback) return;
        setFactValues({});
        setAnswerApplied(false);
        setUsingQualitativeFallback(true);
        setDraft(qualitativeFallback);
        setEditing(true);
    };

    const handleFactChange = (key: string, value: string) => {
        setFactValues((current) => ({ ...current, [key]: value }));
        setAnswerApplied(false);
        setUsingQualitativeFallback(false);
        setDraft(suggestedLine);
    };

    if (locked) {
        return (
            <article className="relative overflow-hidden border-y border-[hsl(var(--paper-line))] py-8">
                <div className="pointer-events-none select-none opacity-20 blur-[3px]">
                    <p className="text-xs font-semibold uppercase riyp-track-015 text-brand">Fix {index + 1}</p>
                    <div className="mt-4 h-8 w-4/5 bg-foreground/30" />
                    <div className="mt-6 h-24 bg-brand/15" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Button variant="premium" onClick={onUnlock}>
                        <LockKey className="mr-2 size-4" /> See the full edit plan
                    </Button>
                </div>
            </article>
        );
    }

    if (dismissed) {
        return (
            <article className="riyp-border-paper-line border-t py-7 first:border-t-0">
                <div className="flex flex-col gap-4 bg-paper-muted px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <MinusCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" weight="duotone" />
                        <div>
                            <p className="text-sm font-semibold text-foreground">Fix {String(index + 1).padStart(2, "0")} marked not relevant.</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">The report is advice, not an instruction. Keep the call that matches your actual work.</p>
                        </div>
                    </div>
                    <button type="button" onClick={() => setDismissed(false)} className="min-h-11 self-start px-3 text-xs font-semibold text-brand hover:text-brand/75 sm:self-auto">
                        Bring it back
                    </button>
                </div>
            </article>
        );
    }

    return (
        <article id={`section-fix-${index + 1}`} className="scroll-mt-36 border-t border-[hsl(var(--paper-line))] py-9 first:border-t-0 sm:py-12">
            <div className="grid gap-7 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-10">
                <div>
                    <p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">Fix {String(index + 1).padStart(2, "0")}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {index === 0 ? "Start here" : index === 1 ? "Then this" : "One more pass"}
                    </p>
                </div>

                <div className="min-w-0">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="max-w-[28ch] font-display text-[clamp(1.85rem,4vw,3rem)] riyp-weight-520 leading-[1.02] tracking-[-0.025em] text-foreground">
                            {action}
                        </h3>
                        <button type="button" onClick={() => setDismissed(true)} className="min-h-11 shrink-0 self-start px-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
                            Not relevant
                        </button>
                    </div>

                    <div className="mt-7 bg-paper-muted/55 px-4 py-4 sm:px-5">
                        <LiftedTrace
                            items={fixTrace}
                            progress={traceProgress}
                            ariaLabel={`How fix ${index + 1} moves from resume evidence to clearer wording`}
                            compact
                        />
                    </div>

                    {original && (
                        <div className="riyp-border-annotation mt-7 border-l-2 pl-4 sm:pl-5">
                            <p className="text-[11px] font-semibold uppercase riyp-track-015 text-muted-foreground">
                                {sectionFor(fix) ? `On the page · ${sectionFor(fix)}` : "On the page"}
                            </p>
                            <p className="mt-2 font-display text-xl leading-7 text-foreground/85 sm:text-2xl sm:leading-8">
                                “{original}”
                            </p>
                        </div>
                    )}

                    <div className="mt-7 grid gap-px bg-[hsl(var(--paper-line))] sm:grid-cols-2">
                        <div className="bg-accent-apricot/20 p-5 sm:p-6">
                            <p className="riyp-text-annotation text-[11px] font-semibold uppercase riyp-track-015">What is missing</p>
                            <p className="mt-3 text-[0.95rem] leading-6 text-foreground/80">
                                {fix.why || "The resume asks the reader to guess at the scope, the decision, or the result."}
                            </p>
                        </div>
                        <div className="bg-accent-butter/20 p-5 sm:p-6">
                            <p className="text-[11px] font-semibold uppercase riyp-track-015 text-foreground/60">Add verified context</p>
                            <p className="mt-3 text-[0.95rem] font-medium leading-6 text-foreground">
                                {factPrompt}
                            </p>
                            {requiresCandidateFacts ? (
                                <div className="mt-4 grid gap-3">
                                    {placeholderKeys.map((key) => (
                                        <label key={key} className="grid gap-1.5 text-xs font-semibold text-foreground/75">
                                            <span>{placeholderLabel(key)}</span>
                                            <Input
                                                type="text"
                                                value={factValues[key] || ""}
                                                onChange={(event) => handleFactChange(key, event.target.value)}
                                                className="min-h-11 w-full border border-foreground/15 bg-paper/80 px-3 py-2 text-sm font-normal text-foreground placeholder:text-muted-foreground focus-visible:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15"
                                                placeholder={`Add the ${key} from your actual work`}
                                                aria-label={`Fact for ${key} in fix ${index + 1}`}
                                            />
                                        </label>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" className="mt-1 min-h-11 justify-self-start border-brand/30 bg-paper px-4" onClick={handleUseAnswer} disabled={!allRequiredFactsProvided}>
                                        Keep these facts
                                    </Button>
                                    {qualitativeFallback ? (
                                        <Button type="button" variant="ghost" size="sm" className="min-h-11 justify-self-start px-0 text-left text-brand hover:bg-transparent hover:text-brand/80" onClick={handleUseQualitativeFallback}>
                                            Use a factual no-number draft
                                        </Button>
                                    ) : null}
                                </div>
                            ) : (
                                <>
                                    <textarea
                                        value={answer}
                                        onChange={(event) => {
                                            setAnswer(event.target.value);
                                            setAnswerApplied(false);
                                        }}
                                        className="mt-4 min-h-28 w-full resize-y border border-foreground/15 bg-paper/80 px-3 py-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus-visible:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15"
                                        placeholder="Write the facts as you know them. Rough is fine."
                                        aria-label={`Verified context for fix ${index + 1}`}
                                    />
                                    <Button type="button" variant="outline" size="sm" className="mt-3 min-h-11 border-brand/30 bg-paper px-4" onClick={handleUseAnswer} disabled={!answer.trim()}>
                                        Keep this fact
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-px bg-brand/[0.065] p-5 sm:p-7">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">
                                    {!fallbackSafety.copyable ? "Guidance only" : "Try this"}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">{copyGuidance}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setEditing((current) => !current)}
                                    className="inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    <PencilSimple className="size-4" /> {editing ? "Done" : "Edit"}
                                </button>
                                {fallbackSafety.copyable ? (
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        disabled={copyBlocked}
                                        aria-label={copyBlocked ? "Add verified facts before copying" : copied ? "Copied" : "Copy suggested line"}
                                        className="inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-semibold text-brand hover:text-brand/75 disabled:cursor-not-allowed disabled:text-muted-foreground/60"
                                    >
                                        {copyBlocked
                                            ? <BracketsAngle className="size-4" />
                                            : copied
                                                ? <Check className="size-4" weight="bold" />
                                                : <Copy className="size-4" />}
                                        {copyBlocked ? "Add facts to copy" : copied ? "Copied" : "Copy"}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                        {answerApplied ? (
                            <div className="mt-5 border-l-2 border-brand/45 bg-paper/70 px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">{requiresCandidateFacts ? "Facts to preserve" : "Fact to preserve"}</p>
                                {requiresCandidateFacts ? (
                                    <dl className="mt-2 grid gap-2">
                                        {placeholderKeys.map((key) => (
                                            <div key={key} className="grid gap-0.5 sm:grid-cols-[9rem_1fr] sm:gap-3">
                                                <dt className="text-xs font-semibold text-muted-foreground">{placeholderLabel(key)}</dt>
                                                <dd className="text-sm font-medium leading-6 text-foreground">{factValues[key]?.trim()}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                ) : (
                                    <p className="mt-2 text-sm font-medium leading-6 text-foreground">{answer.trim()}</p>
                                )}
                            </div>
                        ) : null}
                        {editing ? (
                            <textarea
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                className="mt-5 min-h-[8rem] w-full resize-y border border-brand/25 bg-paper px-4 py-3 font-display text-xl leading-8 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                                aria-label={`Edit suggested line ${index + 1}`}
                            />
                        ) : (
                            <p className="mt-5 max-w-[42rem] font-display text-[1.45rem] riyp-weight-520 leading-[1.35] text-foreground sm:text-[1.7rem]">
                                {draft}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export function ReportStream({
    report,
    className,
    isSample = false,
    freeUsesRemaining = 1,
    onUpgrade,
    hasJobDescription = false,
    isGated = false,
    hasPaidAccess = false,
    comparisonBaseline = null,
    onStartRevision,
}: ReportStreamProps) {
    const fixes = useMemo(() => (report.top_fixes || []).slice(0, 3), [report.top_fixes]);
    const rewrites = useMemo(() => report.rewrites || [], [report.rewrites]);
    const rewritePresentation = useMemo(
        () => buildReportRewritePresentation(fixes, rewrites),
        [fixes, rewrites],
    );
    const groundedFixes = rewritePresentation.fixes;
    const independentRewrites = rewritePresentation.independentRewrites;
    const reportQuestions = report.ideas?.questions;
    const independentQuestions = useMemo(
        () => buildIndependentQuestionPresentation(reportQuestions || []),
        [reportQuestions],
    );
    const strengths = (report.strengths || []).slice(0, 3);
    const primaryFix = fixes[0];
    const primaryEvidence = evidenceFor(primaryFix);
    const roleFit = report.job_alignment?.role_fit;
    const isExhausted = !isSample && freeUsesRemaining <= 0 && !hasPaidAccess;

    useEffect(() => {
        if (rewrites.length > 0) Analytics.track("sm1_fixes_rendered", { count: rewrites.length });
    }, [rewrites.length]);

    const handleUnlock = () => {
        if (!onUpgrade) return;
        saveUnlockContext({ section: "bullet_upgrades" });
        Analytics.paywallCtaClicked("bullet_upgrades");
        onUpgrade();
    };

    return (
        <div className={cn("mx-auto max-w-[58rem] pb-16", className)}>
            {comparisonBaseline && <ReadComparison previous={comparisonBaseline} current={report} />}
            <section id="section-first-impression" className="scroll-mt-36 pb-10 pt-2 sm:pb-14 sm:pt-8">
                <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--paper-line))] pb-4">
                    <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">The read</p>
                    {typeof report.score === "number" ? (
                        <div className="max-w-[14rem] text-right">
                            <p className="riyp-tabular-label text-[11px] font-semibold uppercase riyp-track-015 text-foreground">
                                Clarity summary: {report.score}/100
                            </p>
                            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                                Not a prediction of interviews or offers.
                            </p>
                        </div>
                    ) : (
                        <p className="riyp-tabular-label text-[11px] uppercase riyp-track-015 text-muted-foreground">Opening read</p>
                    )}
                </div>

                <div className="pt-6 sm:pt-6">
                    <div className="border-l-2 border-cyan-bright pl-5 sm:pl-12">
                        <h1 className="report-opening-title font-display font-semibold tracking-[-0.055em] text-foreground">
                            <MarkedTakeaway text={report.first_impression_takeaway || "Make the proof easier to see."} />
                        </h1>
                    </div>
                    <p className="mt-5 max-w-[43rem] text-lg leading-8 text-foreground/80 sm:text-xl sm:leading-9">
                        {report.score_comment_short || report.first_impression || report.summary}
                    </p>
                </div>

                <div className="mt-4 grid border-y border-[hsl(var(--paper-line))] sm:grid-cols-3 sm:divide-x sm:divide-[hsl(var(--paper-line))]">
                    <div className="report-evidence-tile border-b border-[hsl(var(--paper-line))] bg-accent-butter/20 px-5 py-5 sm:border-b-0 sm:px-6 sm:py-7">
                        <div className="flex items-center gap-3 text-brand"><CornersOut className="size-5" weight="bold" aria-hidden="true" /><p className="text-[11px] font-semibold uppercase riyp-track-015 text-foreground/55">What lands</p></div>
                        <p className="mt-3 text-lg font-medium leading-7 text-foreground">{strengths[0] || "The core of your experience is easy to follow."}</p>
                    </div>
                    <div className="report-evidence-tile border-b border-[hsl(var(--paper-line))] bg-paper px-5 py-5 sm:border-b-0 sm:px-6 sm:py-7">
                        <div className="flex items-center gap-3 text-brand"><BracketsAngle className="size-5" weight="bold" aria-hidden="true" /><p className="riyp-text-annotation text-[11px] font-semibold uppercase riyp-track-015">Where doubt creeps in</p></div>
                        <p className="mt-3 text-lg font-medium leading-7 text-foreground">{report.gaps?.[0] || report.biggest_gap_example || "The scale and result need more proof."}</p>
                    </div>
                    <div className="report-evidence-tile bg-surface-sky px-5 py-5 sm:px-6 sm:py-7">
                        <div className="flex items-center gap-3 text-cyan-bright"><PaperPlaneTilt className="size-5" weight="bold" aria-hidden="true" /><p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">Fix first</p></div>
                        <p className="mt-3 text-lg font-medium leading-7 text-foreground">{primaryFix?.fix || primaryFix?.text || "Make the strongest part of the story more specific."}</p>
                    </div>
                </div>

                {primaryEvidence && (
                    <div className="mt-7 flex items-start gap-3 sm:ml-[3.75rem]">
                        <ClipboardText className="riyp-text-annotation mt-0.5 size-5 shrink-0" weight="duotone" />
                        <p className="text-sm leading-6 text-muted-foreground">
                            <span className="font-semibold text-foreground">What we saw on the page:</span> “{primaryEvidence}”
                        </p>
                    </div>
                )}

                <div className="mt-4 flex items-end justify-between gap-6 border-t border-foreground/70 pt-5">
                    <div>
                        <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">The evidence</p>
                        <p className="mt-2 text-sm text-muted-foreground">The specifics that support this read.</p>
                    </div>
                    <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand" onClick={() => {
                        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                        document.getElementById("section-fixes")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
                    }}>
                        See all evidence <ArrowRight className="size-4" weight="bold" />
                    </button>
                </div>
            </section>

            <section id="section-fixes" className="scroll-mt-36 border-t border-foreground/80 pt-6">
                <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">Fix these first</p>
                        <h2 className="mt-3 font-display text-[clamp(2.3rem,6vw,4.5rem)] riyp-weight-520 leading-none tracking-[-0.04em] text-foreground">
                            {fixPlanHeadingForCount(fixes.length)}
                        </h2>
                    </div>
                    <p className="max-w-[20rem] text-sm leading-6 text-muted-foreground">
                        Each one starts with evidence from the resume, then shows the context or proof that would make the story stronger.
                    </p>
                </div>

                <div>
                    {groundedFixes.map(({ fix, rewrite }, index) => (
                        <FixCanvas
                            key={`${fix.fix || fix.text}-${index}`}
                            fix={fix}
                            rewrite={rewrite}
                            index={index}
                            locked={isGated && index > 0}
                            onUnlock={handleUnlock}
                        />
                    ))}
                </div>

                {independentRewrites.length > 0 ? (
                    <div
                        id="section-independent-rewrites"
                        className="border-t border-foreground/80 py-11 sm:py-14"
                        data-testid="independent-rewrites"
                        aria-labelledby="independent-rewrites-title"
                    >
                        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
                            <div>
                                <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">Other line rewrites</p>
                                <h2 id="independent-rewrites-title" className="mt-3 font-display text-3xl riyp-weight-520 leading-tight text-foreground">
                                    Useful edits, kept with their own source.
                                </h2>
                                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                    These do not map uniquely to the ranked fixes above, so each stays beside the exact line it rewrites.
                                </p>
                            </div>

                            {isGated ? (
                                <div className="relative min-h-48 overflow-hidden border-y border-[hsl(var(--paper-line))]">
                                    <div className="pointer-events-none select-none space-y-4 px-5 py-6 opacity-20 blur-[3px]">
                                        <div className="h-5 w-2/3 bg-foreground/35" />
                                        <div className="h-16 bg-brand/15" />
                                        <div className="h-16 bg-paper-muted" />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Button variant="premium" onClick={handleUnlock}>
                                            <LockKey className="mr-2 size-4" /> See the remaining line edits
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <ol className="divide-y divide-[hsl(var(--paper-line))] border-y border-[hsl(var(--paper-line))]">
                                    {independentRewrites.map(({ rewrite, originalIndex }, index) => (
                                        <li
                                            key={`${originalIndex}-${rewrite.original}`}
                                            className="py-7"
                                            data-testid="independent-rewrite-artifact"
                                        >
                                            <p className="text-[11px] font-semibold uppercase riyp-track-015 text-muted-foreground">
                                                Line edit {String(index + 1).padStart(2, "0")} · Source line
                                            </p>
                                            <p className="mt-3 border-l-2 border-brand/30 pl-4 font-display text-lg leading-7 text-foreground/80">
                                                “{rewrite.original}”
                                            </p>
                                            <p className="mt-5 text-[11px] font-semibold uppercase riyp-track-015 text-brand">Rewrite</p>
                                            <p className="mt-2 font-display text-xl riyp-weight-520 leading-8 text-foreground">
                                                {rewrite.better}
                                            </p>
                                            {rewrite.enhancement_note ? (
                                                <p className="mt-3 text-xs leading-5 text-muted-foreground">{rewrite.enhancement_note}</p>
                                            ) : null}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </div>
                ) : null}
            </section>

            {independentQuestions.length > 0 ? (
                <section
                    id="section-questions"
                    className="scroll-mt-36 border-t border-foreground/80 py-11 sm:py-14"
                    data-testid="independent-questions"
                    aria-labelledby="independent-questions-title"
                >
                    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
                        <div>
                            <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">Questions worth answering</p>
                            <h2 id="independent-questions-title" className="mt-3 font-display text-3xl riyp-weight-520 leading-tight text-foreground">
                                Prompts for your next revision.
                            </h2>
                            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                These questions are not tied to a specific ranked fix. Use whichever ones surface a true, useful detail.
                            </p>
                        </div>
                        <ol className="divide-y divide-[hsl(var(--paper-line))] border-y border-[hsl(var(--paper-line))]">
                            {independentQuestions.map(({ question, originalIndex }, index) => (
                                <li
                                    key={`${originalIndex}-${question.question}`}
                                    className="py-6"
                                    data-testid="independent-question"
                                >
                                    <p className="riyp-tabular-label text-[11px] font-semibold uppercase riyp-track-015 text-brand">
                                        Question {String(index + 1).padStart(2, "0")}
                                    </p>
                                    <h3 className="mt-3 font-display text-xl riyp-weight-520 leading-8 text-foreground">
                                        {question.question}
                                    </h3>
                                    {question.why ? (
                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                            <span className="font-semibold text-foreground/75">Why it may help: </span>
                                            {question.why}
                                        </p>
                                    ) : null}
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            ) : null}

            {strengths.length > 0 && (
                <section id="section-keep" className="scroll-mt-36 border-t border-foreground/80 py-11 sm:py-14">
                    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
                        <div>
                            <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">Keep these</p>
                            <h2 className="mt-3 font-display text-3xl riyp-weight-520 leading-tight text-foreground">The parts already earning trust.</h2>
                        </div>
                        <ol className="divide-y divide-[hsl(var(--paper-line))] border-y border-[hsl(var(--paper-line))]">
                            {strengths.map((strength, index) => (
                                <li key={strength} className="grid grid-cols-[2rem_1fr] gap-3 py-5">
                                    <span className="riyp-tabular-label text-[11px] font-semibold text-brand">0{index + 1}</span>
                                    <p className="text-base leading-7 text-foreground/85">{strength}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}

            {report.job_alignment && (
                <section id="section-role" className="scroll-mt-36 border-t border-foreground/80 py-11 sm:py-14">
                    <div className="flex items-center gap-2 text-brand">
                        <Target className="size-5" weight="duotone" />
                        <p className="text-[11px] font-semibold uppercase riyp-track-017">Role direction</p>
                    </div>
                    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] lg:gap-12">
                        <div>
                            <h2 className="font-display text-[clamp(2rem,5vw,3.7rem)] riyp-weight-520 leading-[1.02] tracking-[-0.03em] text-foreground">
                                {hasJobDescription ? "How this resume meets the role." : "Where this story reads strongest."}
                            </h2>
                            <p className="mt-5 max-w-[42rem] text-base leading-7 text-foreground/80">
                                {report.job_alignment.positioning_suggestion || report.job_alignment.jd_match_summary}
                            </p>
                        </div>
                        <div className="border-l-2 border-brand/30 pl-5">
                            <p className="text-[11px] font-semibold uppercase riyp-track-015 text-muted-foreground">Best fit now</p>
                            <ul className="mt-4 space-y-3">
                                {(roleFit?.best_fit_roles || []).slice(0, 3).map((role) => (
                                    <li key={role} className="text-sm font-medium leading-6 text-foreground">{role}</li>
                                ))}
                            </ul>
                            {roleFit?.seniority_read && <p className="mt-5 text-xs leading-5 text-muted-foreground">Seniority read: {roleFit.seniority_read}</p>}
                        </div>
                    </div>
                </section>
            )}

            <details id="section-score" className="group scroll-mt-36 border-y border-[hsl(var(--paper-line))]">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                        <span className="text-sm font-semibold text-foreground">How the clarity summary breaks down</span>
                        {typeof report.score === "number" && <span className="text-xs text-muted-foreground">{report.score}/100</span>}
                    </div>
                    <CaretDown className="size-4 shrink-0 text-brand transition-transform group-open:rotate-180" />
                </summary>
                <div className="grid gap-6 border-t border-[hsl(var(--paper-line))] py-6 sm:grid-cols-[10rem_1fr]">
                    <div>
                        <p className="font-display text-5xl riyp-weight-520 leading-none text-foreground">{report.score ?? "—"}</p>
                        <p className="mt-2 text-xs text-muted-foreground">Not a prediction of interviews or offers.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                        {Object.entries(report.subscores || {}).map(([label, score]) => (
                            <div key={label}>
                                <p className="text-xl font-semibold tabular-nums text-foreground">{score}</p>
                                <p className="mt-1 text-xs capitalize text-muted-foreground">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </details>

            {!isSample && onStartRevision && (
                <section
                    className={styles.revisionSection}
                    aria-labelledby="revision-loop-title"
                    data-testid={isExhausted ? "post-report-purchase-decision" : undefined}
                >
                    <div className={styles.revisionPanel}>
                        <div>
                            <div className="flex items-center gap-2 text-brand">
                                <CheckCircle className="size-5" weight="duotone" />
                                <p className="text-xs font-semibold uppercase riyp-track-017">After you edit</p>
                            </div>
                            <h2 id="revision-loop-title" className={styles.revisionTitle}>
                                Run the new version. Compare the read.
                            </h2>
                            <p className={styles.revisionCopy}>
                                {isExhausted
                                    ? <>{JOB_SEARCH_PASS_DECISION.freeBoundary} {JOB_SEARCH_PASS_DECISION.whenToBuy}</>
                                    : <>Upload the revised resume and we&apos;ll place the two opening reads side by side—what changed, what still needs context, and what to fix next.</>}
                            </p>
                        </div>
                        <div className={styles.revisionAction}>
                            <Button variant={isExhausted ? "premium" : "brand"} size="lg" onClick={isExhausted && onUpgrade ? onUpgrade : onStartRevision}>
                                {isExhausted
                                    ? `Get ${JOB_SEARCH_PASS.reportCount} more reports · ${JOB_SEARCH_PASS.price}`
                                    : "Review the revised resume"}
                                <ArrowRight className="ml-2 size-4" weight="bold" />
                            </Button>
                            <p className={styles.revisionNote}>
                                {isExhausted ? JOB_SEARCH_PASS_DECISION.terms : "The comparison stays in this browser visit."}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {!isSample && (
                <section className={styles.feedbackSection} aria-labelledby="beta-feedback-title">
                    <div className={styles.feedbackRule} aria-hidden="true" />
                    <div className={styles.feedbackContent}>
                        <div>
                            <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">A note for the beta</p>
                            <h2 id="beta-feedback-title" className={styles.feedbackTitle}>
                                What did this report get right—or miss?
                            </h2>
                            <p className={styles.feedbackCopy}>
                                This is a small paid beta, and I read every note—especially the blunt ones. Tell me what felt useful, what felt off, and what nearly stopped you.
                            </p>
                        </div>
                        <div className={styles.feedbackAction}>
                            <Button asChild variant="outline" size="lg" className="border-foreground/35 bg-paper hover:border-brand/45 hover:bg-brand/5">
                                <a href={BETA_FEEDBACK_HREF}>
                                    Send a two-minute note
                                    <EnvelopeSimple className="ml-1 size-4 text-brand" weight="bold" />
                                </a>
                            </Button>
                            <p className={styles.feedbackNote}>Three prompts open in your email. Your resume is never attached.</p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
