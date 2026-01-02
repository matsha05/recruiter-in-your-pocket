"use client";

import { motion } from "framer-motion";

/**
 * Salary Leverage / Before-After Ban Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Type B: Comparison showing the shift in negotiation dynamics
 */
export function SalaryLeverage() {
    return (
        <figure className="w-full max-w-[520px] mx-auto my-12 group select-none">
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
                        Salary history ban impact
                    </span>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-4">
                    {/* Before */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true }}
                        className="rounded-lg border border-border/40 bg-muted/10 p-5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                                <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                                Before ban
                            </span>
                        </div>
                        <div className="bg-muted/20 dark:bg-muted/10 rounded-lg p-3 mb-3 border border-border/20">
                            <p className="text-xs text-muted-foreground italic">
                                &quot;What is your current salary?&quot;
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Anchored to past compensation, perpetuating pay gaps.
                        </p>
                    </motion.div>

                    {/* After */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                        viewport={{ once: true }}
                        className="rounded-lg border border-brand/30 bg-brand/5 dark:bg-brand/10 p-5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                                <svg className="w-3 h-3 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-brand/70">
                                After ban
                            </span>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 mb-3 border border-brand/20">
                            <p className="text-xs text-brand italic">
                                &quot;What are your expectations?&quot;
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Anchored to market value and role-based data.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Shift</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Salary history bans change the negotiation anchor
                </span>
            </figcaption>
        </figure>
    );
}
