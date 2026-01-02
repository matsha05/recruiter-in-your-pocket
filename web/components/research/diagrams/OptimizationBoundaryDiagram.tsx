"use client";

import { motion } from "framer-motion";

/**
 * Optimization Boundary Diagram (v2.0)
 * 
 * Unique diagram for bias-limits-optimization page
 * Shows what you CAN control vs what you CANNOT
 * Different from MetaTimeline (which is for discrimination page)
 */
export function OptimizationBoundaryDiagram() {
    const controllable = [
        { item: "Writing clarity", icon: "✓" },
        { item: "Evidence & proof", icon: "✓" },
        { item: "Structure & formatting", icon: "✓" },
        { item: "Keyword alignment", icon: "✓" },
    ];

    const uncontrollable = [
        { item: "Algorithmic bias", icon: "×" },
        { item: "Market conditions", icon: "×" },
        { item: "Recruiter preferences", icon: "×" },
        { item: "Company culture fit", icon: "×" },
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
                        Bounded optimization
                    </span>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-4">
                    {/* Controllable */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true }}
                        className="rounded-lg border border-brand/30 bg-brand/5 dark:bg-brand/10 p-4"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-brand">
                                You control
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {controllable.map((item, i) => (
                                <motion.li
                                    key={item.item}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-2 text-sm text-foreground"
                                >
                                    <span className="text-brand text-xs">✓</span>
                                    {item.item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Uncontrollable */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                        viewport={{ once: true }}
                        className="rounded-lg border border-border/30 bg-muted/10 p-4"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                                Outside control
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {uncontrollable.map((item, i) => (
                                <motion.li
                                    key={item.item}
                                    initial={{ opacity: 0, x: 10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                >
                                    <span className="text-muted-foreground/50 text-xs">×</span>
                                    {item.item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Key takeaway */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-6 mb-6 bg-muted/20 dark:bg-muted/10 rounded-lg p-4 border border-border/20"
                >
                    <p className="text-xs text-muted-foreground leading-relaxed text-center">
                        <span className="font-medium text-foreground">Focus:</span> Maximize signal within your control. A resume can&apos;t fix bias, but it can prevent avoidable noise.
                    </p>
                </motion.div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Boundary</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    What resumes can improve vs what they cannot
                </span>
            </figcaption>
        </figure>
    );
}
