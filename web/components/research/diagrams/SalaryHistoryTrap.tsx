"use client";

import { motion } from "framer-motion";

/**
 * Salary History Trap Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Type B: Comparison between problem and solution
 */
export function SalaryHistoryTrap() {
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
                        Salary negotiation defense
                    </span>
                </div>

                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Problem side */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true }}
                            className="rounded-lg border border-border/40 bg-muted/10 p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 8v4M12 16h.01" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                                    Social pressure
                                </span>
                            </div>
                            <div className="text-4xl font-display font-semibold text-foreground mb-2">
                                47%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Disclose salary history because they assume everyone else does.
                            </p>
                        </motion.div>

                        {/* Solution side */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                            viewport={{ once: true }}
                            className="rounded-lg border border-brand/30 bg-brand/5 dark:bg-brand/10 p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-brand/70">
                                    Strategy
                                </span>
                            </div>
                            <div className="text-lg font-display font-semibold text-foreground mb-2">
                                The silence strategy
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">
                                Pivot to market value instead of salary history.
                            </p>
                            <div className="bg-white/50 dark:bg-black/20 rounded-lg border border-brand/20 p-3">
                                <p className="text-xs text-brand italic">
                                    &quot;I focus on market value, not history.&quot;
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Trap</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Salary history pressure and the recommended response
                </span>
            </figcaption>
        </figure>
    );
}
