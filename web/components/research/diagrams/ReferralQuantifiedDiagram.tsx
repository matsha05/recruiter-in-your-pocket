"use client";

import { motion } from "framer-motion";

/**
 * Referral Quantified Diagram (v2.0)
 * 
 * Unique diagram for referral-advantage-quantified page
 * Shows the empirical evidence: callback rates and conversion
 */
export function ReferralQuantifiedDiagram() {
    const stats = [
        { metric: "Callback rate", referral: "~40%", nonReferral: "~4%", factor: "10×" },
        { metric: "Hire conversion", referral: "Higher", nonReferral: "Baseline", factor: "—" },
        { metric: "Time to hire", referral: "Faster", nonReferral: "Standard", factor: "—" },
    ];

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
                        Field evidence
                    </span>
                </div>

                <div className="p-6">
                    {/* Table header */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-4 gap-3 pb-3 border-b border-border/30"
                    >
                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                            Metric
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-center">
                            <span className="px-2 py-1 rounded bg-brand/10 text-brand">Referral</span>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-center">
                            <span className="px-2 py-1 rounded bg-muted-foreground/10 text-muted-foreground">Non-Referral</span>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-center text-muted-foreground/60">
                            Lift
                        </div>
                    </motion.div>

                    {/* Table rows */}
                    <div className="divide-y divide-border/20">
                        {stats.map((row, i) => (
                            <motion.div
                                key={row.metric}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 + i * 0.08 }}
                                viewport={{ once: true }}
                                className="grid grid-cols-4 gap-3 py-3"
                            >
                                <div className="text-sm text-muted-foreground">
                                    {row.metric}
                                </div>
                                <div className="text-sm font-medium text-brand text-center">
                                    {row.referral}
                                </div>
                                <div className="text-sm text-muted-foreground text-center">
                                    {row.nonReferral}
                                </div>
                                <div className="text-sm font-mono font-medium text-emerald-600 dark:text-emerald-400 text-center">
                                    {row.factor}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Key insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-brand/5 dark:bg-brand/10 rounded-lg p-4 border border-brand/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            <span className="font-medium text-brand">Referrals reduce uncertainty.</span> Hiring managers trust signals from known sources.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Numbers</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Empirical evidence from field experiments
                </span>
            </figcaption>
        </figure>
    );
}
