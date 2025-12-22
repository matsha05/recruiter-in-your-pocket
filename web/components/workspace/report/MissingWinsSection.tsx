"use client";

import { useState } from "react";
import { ReportData } from "./ReportTypes";
import { Check, Lock, Sparkles } from "lucide-react";
import { HiddenGemIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { Button } from "@/components/ui/button";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { Analytics } from "@/lib/analytics";

interface MissingWinsSectionProps {
    data: ReportData;
    isGated?: boolean;
    onUpgrade?: () => void;
}

// Single neutral card style for all archetypes — let the label provide differentiation
const cardStyle = { border: "border-border", bg: "bg-secondary/5" };

export function MissingWinsSection({ data, isGated = false, onUpgrade }: MissingWinsSectionProps) {
    const questions = data.ideas?.questions || [];

    const [answeredIds, setAnsweredIds] = useState<Set<number>>(new Set());

    if (questions.length === 0) {
        return (
            <section className="space-y-6">
                <ReportSectionHeader
                    icon={<HiddenGemIcon className="w-4 h-4 text-brand" />}
                    number="04"
                    title="Missing Wins"
                    subtitle="The stories you forgot to tell."
                />
                <div className="rounded-lg border border-border bg-secondary/10 p-5 text-sm text-muted-foreground">
                    No missing wins this time. Either you've covered your bases, or we need more detail.
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

    return (
        <section className="space-y-8">
            <ReportSectionHeader
                icon={<HiddenGemIcon className="w-4 h-4 text-brand" />}
                number="04"
                title="Missing Wins"
                subtitle="The stories you forgot to tell."
            />

            {isGated ? (
                // GATED STATE: Show locked preview with teaser
                <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Lock className="w-5 h-5" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {questions.length} hidden win{questions.length > 1 ? 's' : ''} identified
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Questions to uncover achievements you forgot to highlight
                            </p>
                        </div>
                    </div>

                    {/* Teaser: Show first question title only, blurred */}
                    {questions[0] && (
                        <div className="rounded border border-border/50 bg-secondary/5 p-4 blur-[2px] select-none">
                            <p className="text-sm text-muted-foreground">
                                "{questions[0].question?.slice(0, 60)}..."
                            </p>
                        </div>
                    )}

                    {onUpgrade && (
                        <Button
                            variant="premium"
                            size="sm"
                            onClick={() => {
                                saveUnlockContext({ section: 'missing_wins' });
                                Analytics.paywallCtaClicked('missing_wins');
                                onUpgrade();
                            }}
                            className="w-full shadow-md"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Unlock Hidden Wins
                        </Button>
                    )}
                </div>
            ) : (
                // FULL ACCESS: Show progress and all questions
                <>
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand transition-all duration-500 ease-out"
                                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                            {answeredCount} / {questions.length}
                        </span>
                    </div>

                    {/* Questions Grid */}
                    <div className="space-y-4">
                        {questions.map((q, i) => {
                            const isAnswered = answeredIds.has(i);
                            // Format archetype label: "TENSION POINT" -> "Tension Point"
                            const archetypeLabel = q.archetype
                                ? q.archetype.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
                                : 'Question';

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "group border rounded-lg p-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
                                        cardStyle.border,
                                        isAnswered ? "opacity-50" : cardStyle.bg
                                    )}
                                    style={{ animationDelay: `${i * 75}ms` }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            {/* Archetype Tag */}
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
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
                                        <button
                                            onClick={() => toggleAnswered(i)}
                                            className={cn(
                                                "shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all",
                                                isAnswered
                                                    ? "bg-success border-success text-white"
                                                    : "border-border hover:border-success hover:bg-success/10"
                                            )}
                                            aria-label={isAnswered ? "Mark as unanswered" : "Mark as answered"}
                                        >
                                            <Check className={cn("w-4 h-4", isAnswered ? "opacity-100" : "opacity-0 group-hover:opacity-30")} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Completion Message */}
                    {answeredCount === questions.length && questions.length > 0 && (
                        <div className="text-center py-6 space-y-2 animate-in fade-in duration-500">
                            <p className="text-lg font-medium text-success">All questions answered.</p>
                            <p className="text-sm text-muted-foreground">
                                Go back to your resume and add these details. They'll make a difference.
                            </p>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
