"use client";

import { motion } from "framer-motion";

/**
 * Score Model Diagram (v2.0)
 * 
 * Premium visualization of the 4 scoring dimensions:
 * Story (highest weight), Impact, Clarity, Readability
 * 
 * Shows weighted bars with staggered animation
 */
export function ScoreModelDiagram() {
    const dimensions = [
        {
            name: "Story",
            weight: 35,
            color: "brand",
            desc: "Narrative coherence and career progression",
            highlight: true
        },
        {
            name: "Impact",
            weight: 25,
            color: "emerald",
            desc: "Quantified outcomes and evidence"
        },
        {
            name: "Clarity",
            weight: 22,
            color: "blue",
            desc: "Precise language, jargon-free"
        },
        {
            name: "Readability",
            weight: 18,
            color: "violet",
            desc: "Clean formatting and scan-flow"
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
                        Scoring dimensions
                    </span>
                </div>

                <div className="p-6 space-y-5">
                    {dimensions.map((dim, i) => (
                        <motion.div
                            key={dim.name}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                            viewport={{ once: true }}
                            className="space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`font-display text-base font-semibold ${dim.highlight ? "text-brand" : "text-foreground"
                                        }`}>
                                        {dim.name}
                                    </span>
                                    {dim.highlight && (
                                        <span className="px-2 py-0.5 rounded-full bg-brand/10 text-[9px] font-mono uppercase tracking-wider text-brand">
                                            Highest
                                        </span>
                                    )}
                                </div>
                                <span className="font-mono text-xs text-muted-foreground">
                                    {dim.weight}%
                                </span>
                            </div>

                            {/* Bar */}
                            <div className="h-3 w-full bg-muted/30 dark:bg-muted/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${dim.weight}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 + i * 0.1 }}
                                    viewport={{ once: true }}
                                    className={`h-full rounded-full ${dim.color === "brand" ? "bg-gradient-to-r from-brand/70 to-brand" :
                                            dim.color === "emerald" ? "bg-gradient-to-r from-emerald-500/70 to-emerald-500" :
                                                dim.color === "blue" ? "bg-gradient-to-r from-blue-500/70 to-blue-500" :
                                                    "bg-gradient-to-r from-violet-500/70 to-violet-500"
                                        }`}
                                />
                            </div>

                            <p className="text-[11px] text-muted-foreground">
                                {dim.desc}
                            </p>
                        </motion.div>
                    ))}

                    {/* Key Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
                        viewport={{ once: true }}
                        className="mt-6 pt-4 border-t border-border/20"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Story-first scoring
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    A coherent career narrative matters more than keyword density or formatting tricks.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Four Dimensions</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    How we weight signal strength in the 7.4-second window
                </span>
            </figcaption>
        </figure>
    );
}
