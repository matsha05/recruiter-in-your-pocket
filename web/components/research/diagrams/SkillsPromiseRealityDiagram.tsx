"use client";

import { motion } from "framer-motion";

/**
 * Skills Promise vs Reality Diagram (v2.0)
 * 
 * Unique diagram for skills-first-promise-reality page
 * Shows the gap between stated adoption and actual behavior
 */
export function SkillsPromiseRealityDiagram() {
    const gaps = [
        { aspect: "Stated priority", promise: "Skills-first", reality: "Degrees still dominate", gap: "wide" },
        { aspect: "Pool expansion", promise: "All talent", reality: "Similar filters apply", gap: "moderate" },
        { aspect: "Hire outcomes", promise: "Better matches", reality: "Adoption lags claims", gap: "moderate" },
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
                        Promise vs reality
                    </span>
                </div>

                <div className="p-6 space-y-3">
                    {gaps.map((item, i) => (
                        <motion.div
                            key={item.aspect}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                            viewport={{ once: true }}
                            className="rounded-lg border border-border/30 p-4"
                        >
                            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-2">
                                {item.aspect}
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 rounded bg-emerald-500/10 px-3 py-2">
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{item.promise}</p>
                                </div>
                                <svg className="w-4 h-4 text-muted-foreground/40 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                                <div className="flex-1 rounded bg-amber-500/10 px-3 py-2">
                                    <p className="text-xs text-amber-600 dark:text-amber-400">{item.reality}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Key insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
                        viewport={{ once: true }}
                        className="mt-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-lg p-4 border border-amber-500/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            <span className="font-medium text-amber-600 dark:text-amber-400">Be skeptical.</span> Skills-first messaging often outpaces actual hiring behavior change.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Gap</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Where skills-first claims diverge from reality
                </span>
            </figcaption>
        </figure>
    );
}
