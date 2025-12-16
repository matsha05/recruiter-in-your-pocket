"use client";

import { useState } from "react";
import { ReportData } from "./ReportTypes";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { HiddenGemIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ReportSectionHeader } from "./ReportSectionHeader";

interface MissingWinsSectionProps {
    data: ReportData;
}

// Single neutral card style for all archetypes — let the label provide differentiation
const cardStyle = { border: "border-border", bg: "bg-secondary/5" };

export function MissingWinsSection({ data }: MissingWinsSectionProps) {
    const questions = data.ideas?.questions || [];
    const notes = data.ideas?.notes || [];
    const howToUse = data.ideas?.how_to_use;

    const [answeredIds, setAnsweredIds] = useState<Set<number>>(new Set());
    const [showGuide, setShowGuide] = useState(false);

    if (questions.length === 0) return null;

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
                subtitle="What recruiters wish you'd told them."
            />

            {/* Progress Indicator */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gold transition-all duration-500 ease-out"
                        style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                    />
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                    {answeredCount} / {questions.length}
                </span>
            </div>

            {/* How To Use (Collapsible) */}
            {(howToUse || notes.length > 0) && (
                <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>How to use this section</span>
                </button>
            )}

            {showGuide && (
                <div className="bg-secondary/20 border border-border/50 rounded-lg p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {howToUse && (
                        <p className="text-sm text-foreground">{howToUse}</p>
                    )}
                    {notes.length > 0 && (
                        <ul className="space-y-2">
                            {notes.map((note, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-gold mt-0.5">•</span>
                                    <span>{note}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

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
                                "group border rounded-lg p-6 transition-all duration-300",
                                cardStyle.border,
                                isAnswered ? "opacity-50" : cardStyle.bg
                            )}
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
        </section>
    );
}
