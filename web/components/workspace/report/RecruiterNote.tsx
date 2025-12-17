"use client";

import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";

interface RecruiterNoteProps {
    verdict: string;
    className?: string;
}

/**
 * RecruiterNote — The Singular Judgment Moment
 * 
 * A distinct callout styled like a handwritten annotation from a recruiter.
 * This creates the "screenshot moment" that differentiates RIYP from competitors.
 * 
 * Design principles:
 * - Serif italic for human voice
 * - Left border accent
 * - Subtle paper texture background
 * - Single sentence, not a paragraph
 * - Framed as direct recruiter judgment
 */
export function RecruiterNote({ verdict, className }: RecruiterNoteProps) {
    return (
        <div
            className={cn(
                "relative my-8 pl-5 pr-6 py-5",
                "border-l-2 border-premium/60",
                "bg-gradient-to-br from-premium/[0.03] to-transparent",
                "rounded-r-md",
                className
            )}
        >
            {/* Subtle paper texture */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-r-md"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <Quote className="w-3.5 h-3.5 text-premium/70" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-premium/80">
                    Recruiter's Take
                </span>
            </div>

            {/* Verdict */}
            <p className="font-serif text-lg md:text-xl italic text-foreground/90 leading-relaxed">
                "{verdict}"
            </p>

            {/* Subtle attribution */}
            <p className="mt-3 text-[10px] text-muted-foreground/60 font-medium">
                Based on your resume's first impression
            </p>
        </div>
    );
}

/**
 * Compact variant for inline use
 */
export function RecruiterNoteCompact({ verdict, className }: RecruiterNoteProps) {
    return (
        <div
            className={cn(
                "flex items-start gap-3 px-4 py-3",
                "border-l-2 border-premium/50",
                "bg-premium/[0.02]",
                className
            )}
        >
            <Quote className="w-3 h-3 text-premium/60 mt-1 shrink-0" />
            <p className="font-serif text-sm italic text-foreground/85 leading-relaxed">
                "{verdict}"
            </p>
        </div>
    );
}
