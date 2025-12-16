"use client";

import { useState } from "react";
import { ReportData } from "./ReportTypes";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { HiddenGemIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface MissingWinsSectionProps {
    data: ReportData;
}

// Archetype color mapping (subtle, semantic)
const archetypeStyles: Record<string, { label: string; border: string; bg: string }> = {
    "TENSION POINT": { label: "Tension Point", border: "border-premium/20", bg: "bg-premium/5" },
    "HIGH STAKES": { label: "High Stakes", border: "border-destructive/20", bg: "bg-destructive/5" },
    "SCALING": { label: "Scaling", border: "border-indigo-500/20", bg: "bg-indigo-500/5" },
    "LEARNING": { label: "Learning", border: "border-success/20", bg: "bg-success/5" },
    "DURABILITY": { label: "Durability", border: "border-sky-500/20", bg: "bg-sky-500/5" },
    "IMPROVEMENT": { label: "Improvement", border: "border-success/20", bg: "bg-success/5" },
    "QUALITY UNDER PRESSURE": { label: "Quality Under Pressure", border: "border-premium/20", bg: "bg-premium/5" },
    "CROSS-FUNCTIONAL COMPLEXITY": { label: "Cross-Functional", border: "border-violet-500/20", bg: "bg-violet-500/5" },
    "END-TO-END OWNERSHIP": { label: "End-to-End", border: "border-indigo-500/20", bg: "bg-indigo-500/5" },
    "DOMAIN LIFT": { label: "Domain Lift", border: "border-sky-500/20", bg: "bg-sky-500/5" },
};

const defaultStyle = { label: "Question", border: "border-border", bg: "bg-secondary/20" };

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
            {/* Section Header - Standardized */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <HiddenGemIcon className="w-4 h-4 text-brand" />
                    04. Missing Wins
                </h2>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                    {answeredCount} / {questions.length}
                </span>
            </div>

            {/* Content */}
            <div className="space-y-3">
                <h3 className="font-serif text-3xl text-foreground tracking-tight">
                    What recruiters wish you'd told them.
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xl">
                    These are the questions a recruiter asks after skimming your resume. If you have answers, they should be on the page.
                </p>
            </div>

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
                    const style = archetypeStyles[q.archetype || ""] || defaultStyle;
                    const isAnswered = answeredIds.has(i);

                    return (
                        <div
                            key={i}
                            className={cn(
                                "group border rounded-lg p-6 transition-all duration-300",
                                style.border,
                                isAnswered ? "opacity-50" : style.bg
                            )}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    {/* Archetype Tag */}
                                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                        {style.label}
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
                                            ? "bg-moss border-moss text-white"
                                            : "border-border hover:border-moss hover:bg-moss/10"
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
                    <p className="text-lg font-medium text-moss">All questions answered.</p>
                    <p className="text-sm text-muted-foreground">
                        Go back to your resume and add these details. They'll make a difference.
                    </p>
                </div>
            )}
        </section>
    );
}
