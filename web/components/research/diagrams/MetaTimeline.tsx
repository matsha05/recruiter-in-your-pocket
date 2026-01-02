"use client";

import { motion } from "framer-motion";

/**
 * Meta Timeline / Control Sphere Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Concentric circles showing controllable vs systemic factors
 */
export function MetaTimeline() {
    return (
        <figure className="w-full max-w-[420px] mx-auto my-12 group select-none">
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
                        Sphere of control
                    </span>
                </div>

                <div className="p-6">
                    {/* Concentric circles visualization */}
                    <div className="relative w-64 h-64 mx-auto">
                        {/* Outer circle - Systemic */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true }}
                            className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/20 bg-muted/10"
                        />

                        {/* Inner circle - Controllable */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.6 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                            viewport={{ once: true }}
                            className="absolute inset-12 rounded-full border-2 border-brand/40 bg-brand/5 dark:bg-brand/10"
                        />

                        {/* Labels */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
                            viewport={{ once: true }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="text-center space-y-4">
                                <div className="px-3 py-1 rounded-full bg-brand/10 border border-brand/20">
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand font-medium">
                                        Controllable
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-foreground font-medium">Clarity</p>
                                    <p className="text-xs text-foreground font-medium">Structure</p>
                                    <p className="text-xs text-foreground font-medium">Proof</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Outer labels */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.7 }}
                            viewport={{ once: true }}
                            className="absolute -top-2 left-1/2 -translate-x-1/2"
                        >
                            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60">
                                Systemic
                            </span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
                            viewport={{ once: true }}
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-center"
                        >
                            <span className="text-[9px] text-muted-foreground/60">
                                Market bias · Gatekeeping · Algorithms
                            </span>
                        </motion.div>
                    </div>

                    {/* Key Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
                        viewport={{ once: true }}
                        className="mt-8 bg-muted/30 dark:bg-muted/10 rounded-lg p-4 border border-border/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            Focus on what you can control. A resume can&apos;t fix systemic issues, but it can maximize your signal within the system.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Bounded Control</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    What resumes can improve vs what they cannot
                </span>
            </figcaption>
        </figure>
    );
}
