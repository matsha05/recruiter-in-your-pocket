"use client";

import { motion } from "framer-motion";

/**
 * Inference Ladder Diagram (v2.0)
 * 
 * Premium visualization for the resume-error-tax page
 * Shows how errors cascade into hiring risk
 */
export function InferenceLadderDiagram() {
    const steps = [
        {
            number: 1, text: "Error spotted", icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
                </svg>
            )
        },
        {
            number: 2, text: "Inference: low conscientiousness", icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
            )
        },
        {
            number: 3, text: "Risk assessment rises", icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
                </svg>
            )
        },
        {
            number: 4, text: "Screening threshold tightens", icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            )
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
                        The inference cascade
                    </span>
                </div>

                <div className="p-6">
                    {/* Ladder steps */}
                    <div className="space-y-3">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-4"
                            >
                                <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center shrink-0 ${i === 0
                                        ? "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                        : i === steps.length - 1
                                            ? "border-rose-500/30 bg-rose-500/5 text-rose-500/70"
                                            : "border-border/40 bg-muted/20 text-muted-foreground"
                                    }`}>
                                    {step.icon}
                                </div>

                                <div className="flex-1 flex items-center gap-3">
                                    <span className="font-mono text-xs text-muted-foreground/50">
                                        {String(step.number).padStart(2, "0")}
                                    </span>
                                    <span className={`text-sm ${i === 0 ? "font-medium text-foreground" : "text-muted-foreground"
                                        }`}>
                                        {step.text}
                                    </span>
                                </div>

                                {/* Arrow to next */}
                                {i < steps.length - 1 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="absolute right-6 text-muted-foreground/30"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 12H5M12 19l-7-7 7-7" />
                                        </svg>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Connection line on left */}
                    <motion.div
                        className="absolute left-[52px] top-[72px] bottom-[100px] w-0.5 bg-gradient-to-b from-rose-500/40 to-rose-500/10"
                        initial={{ scaleY: 0, transformOrigin: "top" }}
                        whileInView={{ scaleY: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                        viewport={{ once: true }}
                    />

                    {/* Key Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-rose-500/5 dark:bg-rose-500/10 rounded-lg p-4 border border-rose-500/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-medium text-rose-600 dark:text-rose-400">One error</span> can trigger this entire cascade in seconds.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Ladder</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    How small errors translate into higher perceived risk
                </span>
            </figcaption>
        </figure>
    );
}
