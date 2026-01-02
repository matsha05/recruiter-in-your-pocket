"use client";

import { motion } from "framer-motion";

/**
 * Salary Disclosure Diagram (v2.0)
 * 
 * Unique diagram for salary-history-bans page
 * Shows the trap: disclosure creates an unfavorable anchor
 */
export function SalaryDisclosureDiagram() {
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
                        The disclosure trap
                    </span>
                </div>

                <div className="p-6">
                    {/* Before: You disclose */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true }}
                        className="rounded-lg p-4 border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 mb-3"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
                            </svg>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                If you disclose
                            </span>
                        </div>
                        <p className="text-sm text-foreground mb-1">&quot;My current salary is $115K&quot;</p>
                        <p className="text-xs text-muted-foreground">Offer anchors at ~$120-125K (incremental)</p>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="flex justify-center py-1"
                    >
                        <span className="text-xs text-muted-foreground/50">vs</span>
                    </motion.div>

                    {/* After: You redirect */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                        viewport={{ once: true }}
                        className="rounded-lg p-4 border border-brand/30 bg-brand/5 dark:bg-brand/10 mt-3"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-brand">
                                If you redirect
                            </span>
                        </div>
                        <p className="text-sm text-foreground mb-1">&quot;I&apos;m targeting $145K based on the role&quot;</p>
                        <p className="text-xs text-muted-foreground">Offer anchors at market rate (value-based)</p>
                    </motion.div>

                    {/* Key insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-muted/20 dark:bg-muted/10 rounded-lg p-4 border border-border/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            <span className="font-medium text-foreground">Disclosure = self-anchoring.</span> In many jurisdictions, you&apos;re not required to disclose.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Trap</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    How salary disclosure shapes the first anchor
                </span>
            </figcaption>
        </figure>
    );
}
