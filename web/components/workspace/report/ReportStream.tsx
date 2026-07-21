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
import { cn } from "@/lib/utils";
import { Analytics } from "@/lib/analytics";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { getScoreLabel } from "@/lib/score-utils";
import { ReadComparison } from "./ReadComparison";
import styles from "./ReportStream.module.css";

interface ReportStreamProps {
    report: ReportData;
    className?: string;
    isSample?: boolean;
    onNewReport?: () => void;
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
type Question = NonNullable<NonNullable<ReportData["ideas"]>["questions"]>[number];

const fixTrace = [
    { label: "On the page" },
    { label: "Open question" },
    { label: "Your fact" },
    { label: "Clearer wording" },
];

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

function applyVerifiedFactToDraft(draft: string, fact: string) {
    if (/\[[^\]]+\]/.test(draft)) {
        return draft.replace(/\[[^\]]+\]/, fact);
    }
    const cleanDraft = draft.trim().replace(/[.;]\s*$/, "");
    const cleanFact = fact.trim().replace(/^[.;]\s*/, "").replace(/[.;]\s*$/, "");
    return `${cleanDraft}; ${cleanFact}.`;
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
    question,
    index,
    locked,
    onUnlock,
}: {
    fix: Fix;
    rewrite?: Rewrite;
    question?: Question;
    index: number;
    locked?: boolean;
    onUnlock?: () => void;
}) {
    const original = evidenceFor(fix) || rewrite?.original;
    const suggestedLine = rewrite?.better || workingDraftFor(original);
    const [draft, setDraft] = useState(suggestedLine);
    const [editing, setEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [answer, setAnswer] = useState("");
    const [answerApplied, setAnswerApplied] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const action = fix.fix || fix.text || "Make this part of the resume more specific";
    const traceProgress = answerApplied
        ? draft.trim() !== suggestedLine.trim() ? 100 : 82
        : answer.trim() ? 68 : 50;

    useEffect(() => setDraft(suggestedLine), [suggestedLine]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(draft);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const handleUseAnswer = () => {
        const cleanAnswer = answer.trim().replace(/\s+/g, " ");
        if (!cleanAnswer) return;
        setDraft((current) => applyVerifiedFactToDraft(current, cleanAnswer));
        setAnswerApplied(true);
        setEditing(true);
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
                            <p className="text-[11px] font-semibold uppercase riyp-track-015 text-foreground/60">Answer before you edit</p>
                            <p className="mt-3 text-[0.95rem] font-medium leading-6 text-foreground">
                                {question?.question || "What specific detail would make this claim easier to believe?"}
                            </p>
                            <textarea
                                value={answer}
                                onChange={(event) => setAnswer(event.target.value)}
                                className="mt-4 min-h-28 w-full resize-y border border-foreground/15 bg-paper/80 px-3 py-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus-visible:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15"
                                placeholder="Write the facts as you know them. Rough is fine."
                                aria-label={`Answer the factual question for fix ${index + 1}`}
                            />
                            <Button type="button" variant="outline" size="sm" className="mt-3 min-h-11 border-brand/30 bg-paper px-4" onClick={handleUseAnswer} disabled={!answer.trim()}>
                                Keep this fact
                            </Button>
                        </div>
                    </div>

                    <div className="mt-px bg-brand/[0.065] p-5 sm:p-7">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">Try this</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {answerApplied ? "Your verified fact is now in the draft. Edit the sentence until it sounds like you." : "A working draft. Replace every bracket with a fact you can verify."}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setEditing((current) => !current)}
                                    className="inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    <PencilSimple className="size-4" /> {editing ? "Done" : "Edit"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-semibold text-brand hover:text-brand/75"
                                >
                                    {copied ? <Check className="size-4" weight="bold" /> : <Copy className="size-4" />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </div>
                        {answerApplied ? (
                            <div className="mt-5 border-l-2 border-brand/45 bg-paper/70 px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">Fact to preserve</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-foreground">{answer.trim()}</p>
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
    onNewReport,
    freeUsesRemaining = 1,
    onUpgrade,
    hasJobDescription = false,
    isGated = false,
    hasPaidAccess = false,
    comparisonBaseline = null,
    onStartRevision,
}: ReportStreamProps) {
    const fixes = useMemo(() => (report.top_fixes || []).slice(0, 3), [report.top_fixes]);
    const rewrites = report.rewrites || [];
    const questions = report.ideas?.questions || [];
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
                <div className="flex items-center justify-between gap-4 border-b border-[hsl(var(--paper-line))] pb-4">
                    <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">The read</p>
                    <p className="riyp-tabular-label text-[11px] uppercase riyp-track-015 text-muted-foreground">Opening read</p>
                </div>

                <div className="pt-8 sm:pt-6">
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
                        <p className="mt-3 text-base font-medium leading-6 text-foreground">{strengths[0] || "The core of your experience is easy to follow."}</p>
                    </div>
                    <div className="report-evidence-tile border-b border-[hsl(var(--paper-line))] bg-paper px-5 py-5 sm:border-b-0 sm:px-6 sm:py-7">
                        <div className="flex items-center gap-3 text-brand"><BracketsAngle className="size-5" weight="bold" aria-hidden="true" /><p className="riyp-text-annotation text-[11px] font-semibold uppercase riyp-track-015">Where doubt creeps in</p></div>
                        <p className="mt-3 text-base font-medium leading-6 text-foreground">{report.gaps?.[0] || report.biggest_gap_example || "The scale and result need more proof."}</p>
                    </div>
                    <div className="report-evidence-tile bg-surface-sky px-5 py-5 sm:px-6 sm:py-7">
                        <div className="flex items-center gap-3 text-cyan-bright"><PaperPlaneTilt className="size-5" weight="bold" aria-hidden="true" /><p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">Fix first</p></div>
                        <p className="mt-3 text-base font-medium leading-6 text-foreground">{primaryFix?.fix || primaryFix?.text || "Make the strongest part of the story more specific."}</p>
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

                {isSample && onNewReport && (
                    <div className="mt-8 flex justify-start sm:ml-[3.75rem]">
                        <Button data-testid="sample-start-report" variant="brand" size="lg" onClick={onNewReport}>
                            See what yours says <ArrowRight className="ml-2 size-4" weight="bold" />
                        </Button>
                    </div>
                )}

                <div className="mt-4 flex items-end justify-between gap-6 border-t border-foreground/70 pt-5">
                    <div>
                        <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">The evidence</p>
                        <p className="mt-2 text-sm text-muted-foreground">The specifics that support this read.</p>
                    </div>
                    <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand" onClick={() => document.getElementById("section-fixes")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                        See all evidence <ArrowRight className="size-4" weight="bold" />
                    </button>
                </div>
            </section>

            <section id="section-fixes" className="scroll-mt-36 border-t border-foreground/80 pt-6">
                <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">Fix these first</p>
                        <h2 className="mt-3 font-display text-[clamp(2.3rem,6vw,4.5rem)] riyp-weight-520 leading-none tracking-[-0.04em] text-foreground">
                            Three moves. In order.
                        </h2>
                    </div>
                    <p className="max-w-[20rem] text-sm leading-6 text-muted-foreground">
                        Each one starts with evidence from the resume, then shows the context or proof that would make the story stronger.
                    </p>
                </div>

                <div>
                    {fixes.map((fix, index) => (
                        <FixCanvas
                            key={`${fix.fix || fix.text}-${index}`}
                            fix={fix}
                            rewrite={rewrites[index]}
                            question={questions[index]}
                            index={index}
                            locked={isGated && index > 0}
                            onUnlock={handleUnlock}
                        />
                    ))}
                </div>
            </section>

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
                    <div className="flex items-baseline gap-3">
                        <span className="text-sm font-semibold text-foreground">How we summarized this review</span>
                        {typeof report.score === "number" && <span className="text-xs text-muted-foreground">{report.score}/100 · {getScoreLabel(report.score)}</span>}
                    </div>
                    <CaretDown className="size-4 shrink-0 text-brand transition-transform group-open:rotate-180" />
                </summary>
                <div className="grid gap-6 border-t border-[hsl(var(--paper-line))] py-6 sm:grid-cols-[10rem_1fr]">
                    <div>
                        <p className="font-display text-5xl riyp-weight-520 leading-none text-foreground">{report.score ?? "—"}</p>
                        <p className="mt-2 text-xs text-muted-foreground">A document review, not hiring odds.</p>
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
                <section className={styles.revisionSection} aria-labelledby="revision-loop-title">
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
                                Upload the revised resume and we&apos;ll place the two opening reads side by side—what changed, what still needs context, and what to fix next.
                            </p>
                        </div>
                        <div className={styles.revisionAction}>
                            <Button variant={isExhausted ? "premium" : "brand"} size="lg" onClick={isExhausted && onUpgrade ? onUpgrade : onStartRevision}>
                                {isExhausted ? "Unlock the second read" : "Review the revised resume"}
                                <ArrowRight className="ml-2 size-4" weight="bold" />
                            </Button>
                            <p className={styles.revisionNote}>
                                {isExhausted ? "Another report requires paid access." : "The comparison stays in this browser visit."}
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
