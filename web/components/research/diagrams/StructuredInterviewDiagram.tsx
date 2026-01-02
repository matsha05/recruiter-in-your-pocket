"use client";

import { motion } from "framer-motion";

/**
 * Structured Interview Comparison Diagram (v2.0)
 * 
 * Unique diagram for structured-interviews-why-star page
 * Shows WHY structure beats "vibes" - different from the STAR method itself
 */
export function StructuredInterviewDiagram() {
    const comparisons = [
        {
            dimension: "Evaluation basis",
            unstructured: "Gut feeling",
            structured: "Defined criteria"
        },
        {
            dimension: "Question consistency",
            unstructured: "Varies per candidate",
            structured: "Same for all"
        },
        {
            dimension: "Predictive validity",
            unstructured: "~0.20 correlation",
            structured: "~0.51 correlation"
        },
        {
            dimension: "Bias exposure",
            unstructured: "High",
            structured: "Reduced"
        },
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
                        Why structure wins
                    </span>
                </div>

                <div className="p-6">
                    {/* Table header */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-3 gap-3 pb-3 border-b border-border/30"
                    >
                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                            Dimension
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-center">
                            <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">Unstructured</span>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-center">
                            <span className="px-2 py-1 rounded bg-brand/10 text-brand">Structured</span>
                        </div>
                    </motion.div>

                    {/* Table rows */}
                    <div className="divide-y divide-border/20">
                        {comparisons.map((row, i) => (
                            <motion.div
                                key={row.dimension}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 + i * 0.08 }}
                                viewport={{ once: true }}
                                className="grid grid-cols-3 gap-3 py-3"
                            >
                                <div className="text-sm text-muted-foreground">
                                    {row.dimension}
                                </div>
                                <div className="text-sm text-rose-600/80 dark:text-rose-400/80 text-center">
                                    {row.unstructured}
                                </div>
                                <div className="text-sm font-medium text-brand text-center">
                                    {row.structured}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Key Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-brand/5 dark:bg-brand/10 rounded-lg p-4 border border-brand/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-medium text-brand">STAR exists</span> because structured interviews require structured answers. It&apos;s the candidate-side complement to interviewer rubrics.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Structure vs Vibes</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Why evidence-based interviews outperform gut judgments
                </span>
            </figcaption>
        </figure>
    );
}
