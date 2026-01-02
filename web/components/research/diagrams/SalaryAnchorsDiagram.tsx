"use client";

import { motion } from "framer-motion";

/**
 * Salary Anchors Diagram (v2.0)
 * 
 * Unique diagram for salary-anchors page
 * Shows anchoring effect in negotiations
 */
export function SalaryAnchorsDiagram() {
    const scenarios = [
        {
            scenario: "They anchor first",
            ask: "$120K",
            outcome: "Negotiation starts there",
            danger: true
        },
        {
            scenario: "You anchor first",
            ask: "$145K",
            outcome: "Higher midpoint likely",
            danger: false
        },
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
                        Anchoring effect
                    </span>
                </div>

                <div className="p-6 space-y-3">
                    {scenarios.map((item, i) => (
                        <motion.div
                            key={item.scenario}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.15 }}
                            viewport={{ once: true }}
                            className={`rounded-lg p-4 border ${item.danger
                                    ? "border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10"
                                    : "border-brand/30 bg-brand/5 dark:bg-brand/10"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className={`text-xs font-mono uppercase tracking-wider ${item.danger ? "text-rose-600 dark:text-rose-400" : "text-brand"
                                    }`}>
                                    {item.scenario}
                                </p>
                                <span className={`text-lg font-display font-bold ${item.danger ? "text-rose-600 dark:text-rose-400" : "text-brand"
                                    }`}>
                                    {item.ask}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.outcome}</p>
                        </motion.div>
                    ))}

                    {/* Key insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
                        viewport={{ once: true }}
                        className="mt-4 bg-muted/20 dark:bg-muted/10 rounded-lg p-4 border border-border/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            <span className="font-medium text-foreground">The first number wins.</span> Whoever sets the anchor shapes the negotiation range.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Anchor</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Why the first number shapes the outcome
                </span>
            </figcaption>
        </figure>
    );
}
