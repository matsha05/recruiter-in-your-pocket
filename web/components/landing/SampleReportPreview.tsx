"use client";

import { useState, useEffect } from "react";
import { PrincipalRecruiterIcon } from "@/components/icons";

export function SampleReportPreview() {
    const [score, setScore] = useState(0);
    // Animate score on mount
    useEffect(() => {
        const duration = 1500;
        const start = 0;
        const end = 87;
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setScore(Math.round(start + (end - start) * ease));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, []);

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="bg-card rounded border border-border/60 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <span className="w-5 h-px bg-border" />
                        Recruiter First Impression
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Example</span>
                </div>

                <div className="grid md:grid-cols-[1.5fr_0.8fr] gap-6 p-5">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-brand">
                            <PrincipalRecruiterIcon className="w-4 h-4" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Verdict</span>
                        </div>
                        <p className="font-display text-2xl md:text-3xl text-foreground leading-[1.15] tracking-tight">
                            &quot;You read like a Founder, but the outcome is buried.&quot;
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            I scanned your leadership section. Your strongest win is present, but it is not leading.
                            The first impression reads as responsibilities, not impact.
                        </p>
                        <div className="border-l-2 border-warning pl-3">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-warning">Critical Miss</div>
                            <p className="text-sm text-foreground/90 mt-1">
                                Your title signals strategy, but the evidence reads like execution.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 border border-border/40 rounded p-4">
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-28 h-28 transform -rotate-90">
                                <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-black/5 dark:text-white/5" />
                                <circle cx="56" cy="56" r="50" stroke="hsl(var(--success))" strokeWidth="2" fill="transparent" strokeDasharray={314} strokeDashoffset={314 - (314 * score) / 100} className="transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-4xl font-display font-medium tracking-tighter tabular-nums">{score}</span>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Score</span>
                            </div>
                        </div>
                        <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                            Strong signal
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
