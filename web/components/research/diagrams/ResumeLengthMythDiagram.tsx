"use client";

import { motion } from "framer-motion";

/**
 * Resume Length Myth Diagram (v2.0)
 * 
 * Unique diagram for resume-length-myths article
 * Shows the real rule: length should match experience level
 */
export function ResumeLengthMythDiagram() {
    const levels = [
        { years: "0-5 years", pages: "1 page", note: "Tight, focused", highlight: false },
        { years: "5-10 years", pages: "1-2 pages", note: "Earn page 2", highlight: true },
        { years: "10+ years", pages: "2 pages", note: "Depth expected", highlight: false },
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
                        Length guidelines
                    </span>
                </div>

                <div className="p-6">
                    <div className="space-y-3">
                        {levels.map((level, i) => (
                            <motion.div
                                key={level.years}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                                viewport={{ once: true }}
                                className={`rounded-lg p-4 border ${level.highlight
                                        ? "border-brand/30 bg-brand/5 dark:bg-brand/10"
                                        : "border-border/30 bg-muted/10"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${level.highlight ? "text-brand" : "text-foreground"
                                            }`}>
                                            {level.years}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {level.note}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-lg ${level.highlight
                                            ? "bg-brand/10 text-brand"
                                            : "bg-muted/30 text-muted-foreground"
                                        }`}>
                                        <span className="text-sm font-mono font-medium">
                                            {level.pages}
                                        </span>
                                    </div>
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
                        className="mt-6 bg-muted/20 dark:bg-muted/10 rounded-lg p-4 border border-border/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            <span className="font-medium text-foreground">The real rule:</span> Match length to experience depth, not arbitrary page limits.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Length Logic</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Resume length should scale with experience
                </span>
            </figcaption>
        </figure>
    );
}
