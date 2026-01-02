"use client";

import { motion } from "framer-motion";

/**
 * LinkedIn Visibility Diagram (v2.0)
 * 
 * Shows inputs (what you control) vs outcomes (what LinkedIn reports)
 * for profile discoverability
 */
export function LinkedInVisibilityDiagram() {
    const inputs = [
        "Headline keywords & titles",
        "Skills & endorsements",
        "Experience descriptions",
        "Profile completeness"
    ];

    const outputs = [
        "Higher InMail acceptance",
        "Skills-first search priority",
        "Role-aligned discovery"
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
                        Visibility equation
                    </span>
                </div>

                <div className="p-6">
                    <div className="flex items-stretch gap-4">
                        {/* Inputs */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true }}
                            className="flex-1 rounded-lg border border-brand/30 bg-brand/5 dark:bg-brand/10 p-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-brand">
                                    You control
                                </span>
                            </div>
                            <ul className="space-y-2">
                                {inputs.map((item, i) => (
                                    <motion.li
                                        key={item}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                                        viewport={{ once: true }}
                                        className="text-xs text-foreground flex items-center gap-2"
                                    >
                                        <span className="text-brand">→</span>
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Arrow */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                            viewport={{ once: true }}
                            className="flex items-center"
                        >
                            <svg className="w-6 h-6 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </motion.div>

                        {/* Outputs */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
                            viewport={{ once: true }}
                            className="flex-1 rounded-lg border border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10 p-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                    LinkedIn reports
                                </span>
                            </div>
                            <ul className="space-y-2">
                                {outputs.map((item, i) => (
                                    <motion.li
                                        key={item}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                                        viewport={{ once: true }}
                                        className="text-xs text-foreground flex items-center gap-2"
                                    >
                                        <span className="text-blue-500">✓</span>
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Visibility Model</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Inputs vs LinkedIn-reported sourcing outcomes
                </span>
            </figcaption>
        </figure>
    );
}
