"use client";

import { motion } from "framer-motion";

/**
 * Skills vs Credentials Shift Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Type B: Comparison with animated transition between states
 * 
 * Visualizes the industry trend toward skills-based hiring
 */
export function SkillsShiftDiagram() {
    const shifts = [
        { old: "Degree required", new: "Skills demonstrated" },
        { old: "X years required", new: "Relevant outcomes" },
        { old: "Pedigree and prestige", new: "Portfolio evidence" },
    ];

    return (
        <figure className="w-full max-w-[480px] mx-auto my-12 group select-none">
            <motion.div
                className="relative bg-white dark:bg-card border border-border/40 rounded-xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true, margin: "-50px" }}
            >
                {/* Header */}
                <div className="bg-muted/30 dark:bg-muted/10 px-6 py-4 border-b border-border/30">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                        Hiring paradigm shift
                    </span>
                </div>

                <div className="p-6">
                    {/* Column headers */}
                    <div className="flex items-center justify-between mb-6">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground/60">
                                Traditional
                            </span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2"
                        >
                            <span className="text-xs font-mono uppercase tracking-wider text-brand/80">
                                Emerging
                            </span>
                            <div className="w-3 h-3 rounded-full bg-brand/60" />
                        </motion.div>
                    </div>

                    {/* Shift rows */}
                    <div className="space-y-4">
                        {shifts.map((shift, i) => (
                            <motion.div
                                key={shift.old}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 + i * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-4"
                            >
                                <div className="flex-1 text-right">
                                    <span className="text-sm text-muted-foreground/50 line-through">
                                        {shift.old}
                                    </span>
                                </div>

                                {/* Arrow */}
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.5 + i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="w-12 flex items-center justify-center"
                                >
                                    <div className="h-px w-full bg-gradient-to-r from-muted-foreground/20 to-brand/40" />
                                    <svg className="w-4 h-4 text-brand/60 -ml-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </motion.div>

                                <div className="flex-1">
                                    <span className="text-sm font-medium text-foreground">
                                        {shift.new}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Key Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.7 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-brand/5 dark:bg-brand/10 rounded-lg p-4 border border-brand/20"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">
                                    Talent pools expand
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Skills-first filters broaden the candidate set compared to degree-only screens.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Paradigm Shift</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    The shift from credentials to skills-based signals
                </span>
            </figcaption>
        </figure>
    );
}
