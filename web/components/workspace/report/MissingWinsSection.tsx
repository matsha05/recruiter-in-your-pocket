"use client";

import { useState } from "react";
import { ReportData } from "./ReportTypes";
import { Check, Lock } from "lucide-react";
import { HiddenGemIcon, InsightSparkleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { Button } from "@/components/ui/button";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { Analytics } from "@/lib/analytics";
import { UnlockValueList } from "@/components/shared/UnlockValueList";

interface MissingWinsSectionProps {
    data: ReportData;
    isGated?: boolean;
    onUpgrade?: () => void;
}

// Single neutral card style for all archetypes  -  let the label provide differentiation
const cardStyle = { border: "border-border/60", bg: "bg-card hover:border-border/80" };

export function MissingWinsSection({ data, isGated = false, onUpgrade }: MissingWinsSectionProps) {
    const questions = data.ideas?.questions || [];

    const [answeredIds, setAnsweredIds] = useState<Set<number>>(new Set());

    if (questions.length === 0) {
        return (
            <section className="gap-y-6">
                <ReportSectionHeader
                    icon={<HiddenGemIcon className="size-4 text-brand" />}
                    number="05"
                    title="Missing Wins"
                    subtitle="Wins hiding between the lines."
                />
                <div className="rounded border border-border bg-secondary/10 p-5 text-sm text-muted-foreground">
                    No missing wins surfaced in this run. Either the story is complete, or the resume needs more detail.
                </div>
            </section>
        );
    }

    const toggleAnswered = (index: number) => {
        setAnsweredIds((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const answeredCount = answeredIds.size;
    const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
    const progressCopy = answeredCount === 0
        ? "The good material is usually hiding in the specifics."
        : answeredCount === questions.length
            ? "That is the material recruiters remember."
            : answeredCount >= Math.ceil(questions.length / 2)
                ? "Now we're getting somewhere."
                : `${answeredCount} of ${questions.length} found.`;

    return (
        <section className="gap-y-8">
            <ReportSectionHeader
                icon={<HiddenGemIcon className="size-4 text-brand" />}
                number="05"
                title="Missing Wins"
                subtitle="Wins hiding between the lines."
            />

            {isGated ? (
                // GATED STATE: Show locked preview with teaser
                <div className="rounded border border-border bg-card p-6 gap-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Lock className="size-5" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                We found {questions.length} win{questions.length > 1 ? 's' : ''} worth surfacing
                            </p>
                            <p className="text-xs text-muted-foreground">
                                These are the details that make recruiters stop and pay attention.
                            </p>
                        </div>
                    </div>

                    {/* Teaser: Show first question title only, blurred */}
                    {questions[0] && (
                        <div className="rounded border border-border/50 bg-secondary/5 p-4 blur-[2px] select-none">
                            <p className="text-sm text-muted-foreground">
                                &quot;{questions[0].question?.slice(0, 60)}...&quot;
                            </p>
                        </div>
                    )}

                    <UnlockValueList
                        items={[
                            "All the wins we found",
                            "Why each one matters",
                            "Track them as you add them back in"
                        ]}
                        dense
                    />

                    {onUpgrade && (
                        <Button
                            variant="premium"
                            size="sm"
                            onClick={() => {
                                saveUnlockContext({ section: 'missing_wins' });
                                Analytics.paywallCtaClicked('missing_wins');
                                onUpgrade();
                            }}
                            className="w-full"
                        >
                            <InsightSparkleIcon className="size-4 mr-2" />
                            Unlock Missing Wins
                        </Button>
                    )}
                </div>
            ) : (
                // FULL ACCESS: Show progress and all questions
                <>
                    {/* Progress Indicator */}
                    <div className="gap-y-3">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">
                                {answeredCount} / {questions.length}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {progressCopy}
                        </p>
                    </div>

                    {/* Questions Grid */}
                    <div className="gap-y-4">
                        {questions.map((q, i) => {
                            const isAnswered = answeredIds.has(i);
                            // Format archetype label: "TENSION POINT" -> "Tension Point"
                            const archetypeLabel = q.archetype
                                ? q.archetype.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
                                : 'Question';

                            return (
                                <div
                                    key={q.question}
                                    className={cn(
                                        "group border rounded p-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 transform-gpu",
                                        cardStyle.border,
                                        isAnswered
                                            ? "opacity-55 scale-[0.985] border-border/40 bg-secondary/20"
                                            : `${cardStyle.bg} hover:-translate-y-0.5`
                                    )}
                                    style={{ animationDelay: `${i * 75}ms` }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 gap-y-3">
                                            {/* Archetype Tag */}
                                            <span className="inline-block text-xs font-bold uppercase tracking-wide text-muted-foreground/60">
                                                {archetypeLabel}
                                            </span>

                                            {/* Question */}
                                            <p className={cn(
                                                "text-lg font-medium text-foreground leading-snug",
                                                isAnswered && "line-through decoration-muted-foreground/30"
                                            )}>
                                                {q.question}
                                            </p>

                                            {/* Why (Recruiter Perspective) */}
                                            {q.why && (
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    <span className="font-medium text-foreground/70">Why it matters:</span> {q.why}
                                                </p>
                                            )}
                                        </div>

                                        {/* Toggle Button */}
                                        <button type="button"
                                            onClick={() => toggleAnswered(i)}
                                            className={cn(
                                                "shrink-0 size-11 rounded-full border flex items-center justify-center transition-all duration-300",
                                                isAnswered
                                                    ? "bg-success border-success text-white shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                                                    : "border-border hover:border-success hover:bg-success/10"
                                            )}
                                            aria-label={isAnswered ? "Mark as unanswered" : "Mark as answered"}
                                        >
                                            <Check className={cn("size-4", isAnswered ? "opacity-100" : "opacity-0 group-hover:opacity-30")} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Completion Message */}
                    {answeredCount === questions.length && questions.length > 0 && (
                        <div className="text-center py-6 gap-y-2 animate-in fade-in duration-500">
                            <p className="text-lg font-medium text-success">That&apos;s the material recruiters remember.</p>
                            <p className="text-sm text-muted-foreground">
                                Good. Those belong back on the page.
                            </p>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
