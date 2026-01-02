"use client";

import { motion } from "framer-motion";

/**
 * Skills Promise vs Reality Diagram (v2.1)
 * 
 * Clearer side-by-side comparison showing the gap between
 * what companies say vs what research shows they do
 */
export function SkillsPromiseRealityDiagram() {
    return (
        <figure className="w-full max-w-[560px] mx-auto my-12 group select-none">
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
                        The Reality Check
                    </span>
                </div>

                <div className="p-6">
                    {/* Two-column comparison */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* What they say */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true }}
                            className="rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-4"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                    What They Say
                                </span>
                            </div>
                            <ul className="space-y-2">
                                <li className="text-sm text-emerald-700/80 dark:text-emerald-300/80 flex items-start gap-2">
                                    <span className="text-emerald-500 mt-1">✓</span>
                                    <span>&quot;Skills matter more than degrees&quot;</span>
                                </li>
                                <li className="text-sm text-emerald-700/80 dark:text-emerald-300/80 flex items-start gap-2">
                                    <span className="text-emerald-500 mt-1">✓</span>
                                    <span>&quot;We hire based on ability&quot;</span>
                                </li>
                                <li className="text-sm text-emerald-700/80 dark:text-emerald-300/80 flex items-start gap-2">
                                    <span className="text-emerald-500 mt-1">✓</span>
                                    <span>&quot;Wider talent pools&quot;</span>
                                </li>
                            </ul>
                        </motion.div>

                        {/* What research shows */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                            viewport={{ once: true }}
                            className="rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                                    What Research Shows
                                </span>
                            </div>
                            <ul className="space-y-2">
                                <li className="text-sm text-amber-700/80 dark:text-amber-300/80 flex items-start gap-2">
                                    <span className="text-amber-500 mt-1">→</span>
                                    <span>Degree requirements persist in practice</span>
                                </li>
                                <li className="text-sm text-amber-700/80 dark:text-amber-300/80 flex items-start gap-2">
                                    <span className="text-amber-500 mt-1">→</span>
                                    <span>Old filters still dominate hiring</span>
                                </li>
                                <li className="text-sm text-amber-700/80 dark:text-amber-300/80 flex items-start gap-2">
                                    <span className="text-amber-500 mt-1">→</span>
                                    <span>Adoption lags stated commitment</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Key insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-muted/20 dark:bg-muted/10 rounded-lg p-4 border border-border/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            <span className="font-semibold text-foreground">The gap is real.</span> Skills-first messaging has outpaced skills-first hiring. Write for both worlds.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Promise vs Reality</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Where skills-first claims diverge from hiring behavior
                </span>
            </figcaption>
        </figure>
    );
}
