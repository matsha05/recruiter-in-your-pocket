"use client";

import { motion } from "framer-motion";

/**
 * STAR Method Structure Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Type E: Framework/Process with connected cards and staggered reveal
 * 
 * Visualizes the Situation-Task-Action-Result framework
 */
export function StarStructureDiagram() {
    const steps = [
        { letter: "S", label: "Situation", desc: "Set the scene", color: "slate" },
        { letter: "T", label: "Task", desc: "Your challenge", color: "slate" },
        { letter: "A", label: "Action", desc: "What you did", color: "slate" },
        { letter: "R", label: "Result", desc: "The impact", color: "brand" },
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
                        Behavioral response framework
                    </span>
                </div>

                <div className="p-6">
                    {/* STAR Flow */}
                    <div className="relative">
                        {/* Connection Line */}
                        <motion.div
                            className="absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-brand/40 dark:from-slate-700 dark:via-slate-600 dark:to-brand/40 z-0"
                            initial={{ scaleX: 0, transformOrigin: "left" }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                            viewport={{ once: true }}
                        />

                        <div className="relative z-10 flex items-start justify-between gap-2">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={step.letter}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 + i * 0.15 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col items-center flex-1"
                                >
                                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-md ${step.color === "brand"
                                        ? "border-brand/50 bg-gradient-to-br from-brand/10 to-brand/5 dark:from-brand/20 dark:to-brand/10"
                                        : "border-border/40 bg-white dark:bg-card"
                                        }`}>
                                        <span className={`font-display text-2xl md:text-3xl font-medium ${step.color === "brand" ? "text-brand" : "text-foreground"
                                            }`}>
                                            {step.letter}
                                        </span>
                                    </div>
                                    <div className="mt-3 text-center">
                                        <p className={`text-xs md:text-sm font-semibold ${step.color === "brand" ? "text-brand" : "text-foreground"
                                            }`}>
                                            {step.label}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                                            {step.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Resume Translation */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
                        viewport={{ once: true }}
                        className="mt-8 bg-muted/30 dark:bg-muted/10 rounded-lg p-4 border border-border/20"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center">
                                <svg className="w-3 h-3 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M9 12l2 2 4-4" />
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                            </div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                                On a resume bullet
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-muted/50 dark:bg-muted/20 rounded text-muted-foreground text-xs">
                                S+T implied
                            </span>
                            <span className="text-muted-foreground/60">→</span>
                            <span className="px-2 py-1 bg-muted/50 dark:bg-muted/20 rounded text-foreground text-xs font-medium">
                                Action verb
                            </span>
                            <span className="text-muted-foreground/60">→</span>
                            <span className="px-2 py-1 bg-brand/10 dark:bg-brand/20 border border-brand/30 rounded text-brand text-xs font-semibold">
                                Result + metric
                            </span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — STAR Framework</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    The behavioral interview structure, optimized for resume bullets
                </span>
            </figcaption>
        </figure>
    );
}
