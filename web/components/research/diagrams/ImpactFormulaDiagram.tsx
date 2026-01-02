"use client";

import { motion } from "framer-motion";

/**
 * Impact Formula Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Visualizes the X → Y → Z formula for resume bullets (Laszlo Bock)
 */
export function ImpactFormulaDiagram() {
    const formula = [
        { letter: "X", label: "Result", desc: "What you accomplished", color: "brand" },
        { letter: "Y", label: "Metric", desc: "How it was measured", color: "muted" },
        { letter: "Z", label: "Method", desc: "How you did it", color: "muted" },
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
                        The Bock formula
                    </span>
                </div>

                <div className="p-6">
                    {/* Formula visualization */}
                    <div className="flex items-center justify-center gap-3">
                        {formula.map((item, i) => (
                            <motion.div
                                key={item.letter}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.12 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-3"
                            >
                                <div className="text-center">
                                    <div className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center shadow-sm ${item.color === "brand"
                                            ? "border-brand/50 bg-brand/10 dark:bg-brand/20"
                                            : "border-border/40 bg-white dark:bg-card"
                                        }`}>
                                        <span className={`font-display text-2xl font-semibold ${item.color === "brand" ? "text-brand" : "text-foreground"
                                            }`}>
                                            {item.letter}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 mt-2">
                                        {item.label}
                                    </p>
                                </div>

                                {i < formula.length - 1 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="text-muted-foreground/40"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Example */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
                        viewport={{ once: true }}
                        className="mt-6 border-t border-border/20 pt-5"
                    >
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-3">
                            Example bullet
                        </p>
                        <div className="bg-muted/20 dark:bg-muted/10 rounded-lg p-4 text-sm leading-relaxed">
                            <span className="text-brand font-medium">&quot;Grew revenue by 40%</span>
                            <span className="text-muted-foreground"> as measured by </span>
                            <span className="text-foreground">quarterly MRR,</span>
                            <span className="text-muted-foreground"> by </span>
                            <span className="text-foreground">implementing usage-based pricing.&quot;</span>
                        </div>
                    </motion.div>

                    {/* Structure labels */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.8 }}
                        viewport={{ once: true }}
                        className="mt-4 flex justify-center gap-6 text-[10px] text-muted-foreground"
                    >
                        <span>Accomplished [X]</span>
                        <span>Measured by [Y]</span>
                        <span>By doing [Z]</span>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — X → Y → Z</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    The Laszlo Bock formula for high-impact resume bullets
                </span>
            </figcaption>
        </figure>
    );
}
