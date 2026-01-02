"use client";

import { motion } from "framer-motion";

/**
 * Form Content Split / Penalty Decomposition Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Shows how evaluators attribute error penalties
 */
export function FormContentSplit() {
    const categories = [
        { label: "Conscientiousness", desc: "Signals attention to detail and care", weight: 40 },
        { label: "Interpersonal", desc: "Raises doubts about professionalism", weight: 35 },
        { label: "Cognitive", desc: "Suggests weaker written communication", weight: 25 },
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
                        Penalty decomposition
                    </span>
                </div>

                <div className="p-6">
                    {/* Stacked bar */}
                    <div className="h-4 w-full rounded-full overflow-hidden flex border border-border/20">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat.label}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${cat.weight}%` }}
                                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                                viewport={{ once: true }}
                                className={`h-full ${i === 0 ? "bg-brand/50" : i === 1 ? "bg-brand/30" : "bg-muted-foreground/20"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Labels */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat.label}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 + i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className={`inline-block w-3 h-3 rounded-full mb-2 ${i === 0 ? "bg-brand/50" : i === 1 ? "bg-brand/30" : "bg-muted-foreground/20"
                                    }`} />
                                <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-1">
                                    {cat.label}
                                </p>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                    {cat.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Error Attribution</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    How evaluators may attribute error penalties
                </span>
            </figcaption>
        </figure>
    );
}
