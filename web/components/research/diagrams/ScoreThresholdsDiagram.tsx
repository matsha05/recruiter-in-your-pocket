"use client";

import { motion } from "framer-motion";

/**
 * Score Thresholds Diagram (v2.0)
 * 
 * Premium visualization of what score ranges mean
 * 85+, 70-84, <70 with visual indicators
 */
export function ScoreThresholdsDiagram() {
    const thresholds = [
        {
            range: "85+",
            label: "Strong Signal",
            desc: "Clear narrative, quantified impact, clean presentation. You're competing at the top.",
            color: "emerald",
            width: 100
        },
        {
            range: "70-84",
            label: "Solid",
            desc: "Good foundation, but opportunities to sharpen. Usually 1-2 key improvements will push you up.",
            color: "amber",
            width: 75
        },
        {
            range: "<70",
            label: "Needs Work",
            desc: "Significant friction points that may cause quick rejections. Focus on highest-leverage fixes first.",
            color: "rose",
            width: 50
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
                        Score interpretation
                    </span>
                </div>

                <div className="p-6 space-y-4">
                    {thresholds.map((threshold, i) => (
                        <motion.div
                            key={threshold.range}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.12 }}
                            viewport={{ once: true }}
                            className={`rounded-lg p-4 border ${threshold.color === "emerald"
                                    ? "border-emerald-500/30 bg-emerald-500/5"
                                    : threshold.color === "amber"
                                        ? "border-amber-500/30 bg-amber-500/5"
                                        : "border-rose-500/30 bg-rose-500/5"
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`text-3xl font-display font-bold ${threshold.color === "emerald"
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : threshold.color === "amber"
                                            ? "text-amber-600 dark:text-amber-400"
                                            : "text-rose-600 dark:text-rose-400"
                                    }`}>
                                    {threshold.range}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-sm ${threshold.color === "emerald"
                                            ? "text-emerald-700 dark:text-emerald-300"
                                            : threshold.color === "amber"
                                                ? "text-amber-700 dark:text-amber-300"
                                                : "text-rose-700 dark:text-rose-300"
                                        }`}>
                                        {threshold.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        {threshold.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Signal bar */}
                            <div className="mt-3 h-1.5 w-full bg-muted/30 dark:bg-muted/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${threshold.width}%` }}
                                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 + i * 0.1 }}
                                    viewport={{ once: true }}
                                    className={`h-full rounded-full ${threshold.color === "emerald"
                                            ? "bg-emerald-500"
                                            : threshold.color === "amber"
                                                ? "bg-amber-500"
                                                : "bg-rose-500"
                                        }`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 2 — What Scores Mean</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Thresholds based on recruiter feedback patterns
                </span>
            </figcaption>
        </figure>
    );
}
