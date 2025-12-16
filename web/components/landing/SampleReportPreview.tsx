"use client";

import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PrincipalRecruiterIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function SampleReportPreview() {
    const [score, setScore] = useState(0);
    const [fixed, setFixed] = useState(false);

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
        <div className="w-full max-w-4xl mx-auto">
            <div className="relative group perspective-1000">

                {/* Glow Effect behind */}
                <div className="absolute -inset-1 bg-gradient-to-r from-premium/20 via-brand/5 to-success/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000" />

                {/* Main Interface Card */}
                <div className="relative bg-white dark:bg-background rounded-xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden">

                    {/* Header - Clean, Report-style */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-secondary/30 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-px bg-border"></span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">01. Recruiter First Impression</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">Sample Report</span>
                    </div>

                    <div className="grid md:grid-cols-5 bg-background">

                        {/* LEFT: THE VERDICT (3 cols) */}
                        <div className="md:col-span-3 p-8 md:p-10 border-r border-black/5 dark:border-white/5 relative overflow-hidden">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-premium">
                                        <PrincipalRecruiterIcon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-foreground/60">First Impression</span>
                                    </div>
                                    <h3 className="font-display text-3xl md:text-4xl text-foreground leading-[1.1] tracking-tight">
                                        "You read like a Founder, but you're burying the outcome."
                                    </h3>
                                </div>

                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    I scanned your "Leadership" section. You list 12 responsibilities, but I had to dig line-by-line to find the $5M expansion. <span className="text-foreground font-medium bg-premium/10 px-1 rounded">Lead with the win.</span>
                                </p>

                                {/* The Critical Miss */}
                                <div className="p-4 bg-premium/10 border border-premium/20 rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-premium animate-pulse" />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-premium">Critical Miss</span>
                                    </div>
                                    <p className="text-sm text-foreground/90">
                                        Your skills section lists "Strategy" but your bullets only show "Execution." There is a mismatch between your title and your evidence.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: THE SCORE & ACTION (2 cols) */}
                        <div className="md:col-span-2 p-8 md:p-10 bg-secondary/20 flex flex-col justify-between space-y-8">

                            {/* Score Dial */}
                            <div className="text-center space-y-4">
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-black/5 dark:text-white/5" />
                                        <circle cx="64" cy="64" r="60" stroke="hsl(var(--success))" strokeWidth="2" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * score) / 100} className="transition-all duration-1000 ease-out" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-5xl font-display font-medium tracking-tighter tabular-nums">{score}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Score</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-success/10 border border-success/20 text-success text-[11px] font-bold uppercase tracking-wider">
                                        <CheckCircle2 className="w-3 h-3" /> Competes for Senior Roles
                                    </span>
                                </div>
                            </div>

                            {/* Interactive Rewrite Demo */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        <span>Bullet Upgrade</span>
                                        <span className="text-premium">{fixed ? "Applied" : "Try it"}</span>
                                    </div>

                                    <div
                                        className="group cursor-pointer bg-white dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-md p-4 transition-all hover:border-premium/50 relative overflow-hidden"
                                        onClick={() => setFixed(!fixed)}
                                    >
                                        <div className={cn("transition-all duration-500", fixed ? "opacity-40 blur-[1px] grayscale" : "opacity-100")}>
                                            <p className="text-xs text-destructive line-through decoration-destructive/50 mb-1">Managed a team of 5 PMs...</p>
                                        </div>

                                        <div className={cn("absolute inset-0 p-4 bg-white dark:bg-background flex flex-col justify-center transition-all duration-300", fixed ? "translate-y-0 opacity-100" : "translate-y-full opacity-0")}>
                                            <p className="text-sm font-medium text-success flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Scaled product org to 5 PMs...
                                            </p>
                                        </div>

                                        <div className={cn("mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors", fixed ? "text-success" : "text-premium")}>
                                            {fixed ? "Recruiter sees: Clear ownership" : "Tap to Rewrite"}
                                            {!fixed && <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Decorative Grid Lines behind */}
                <div className="absolute -z-10 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />

            </div>
        </div>
    );
}
