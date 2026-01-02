"use client";

import { motion } from "framer-motion";

/**
 * Automation Pipeline Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Type E: Process/Pipeline with connected stages and risk indicators
 * 
 * Shows where automation can introduce bias in hiring
 */
export function AutomationPipeline() {
    const steps = [
        {
            stage: "Sourcing",
            automation: "Ad Delivery",
            risk: "Old ads only shown to certain demographics",
            riskLevel: 0.4,
        },
        {
            stage: "Screening",
            automation: "Resume Parsing",
            risk: "Non-standard formats parsed incorrectly",
            riskLevel: 0.6,
        },
        {
            stage: "Selection",
            automation: "Ranking",
            risk: "Bias against gaps or 'non-target' schools",
            riskLevel: 0.8,
        },
        {
            stage: "Interview",
            automation: "AI Scoring",
            risk: "Standardized questions with biased grading",
            riskLevel: 1,
            highlight: true,
        }
    ];

    return (
        <figure className="w-full max-w-[680px] mx-auto my-12 group select-none">
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
                        Automation risk cascade
                    </span>
                </div>

                <div className="p-6 overflow-x-auto">
                    {/* Pipeline */}
                    <div className="relative min-w-[600px]">
                        {/* Connection Line */}
                        <motion.div
                            className="absolute top-12 left-8 right-8 h-0.5 bg-gradient-to-r from-muted/40 via-amber-400/40 to-rose-400/60 z-0"
                            initial={{ scaleX: 0, transformOrigin: "left" }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                            viewport={{ once: true }}
                        />

                        <div className="relative z-10 flex items-stretch gap-3">
                            {steps.map((s, i) => (
                                <motion.div
                                    key={s.stage}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 + i * 0.12 }}
                                    viewport={{ once: true }}
                                    className="flex-1"
                                >
                                    <div className={`h-full flex flex-col rounded-lg p-4 border transition-all ${s.highlight
                                        ? "border-rose-400/50 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20"
                                        : "border-border/40 bg-white dark:bg-card"
                                        } shadow-sm`}>
                                        {/* Stage number */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${s.highlight
                                                ? "bg-rose-400/20 text-rose-600 dark:text-rose-400"
                                                : "bg-muted/30 text-muted-foreground"
                                                }`}>
                                                {i + 1}
                                            </div>
                                            <span className={`font-mono text-[9px] uppercase tracking-widest ${s.highlight ? "text-rose-600/80 dark:text-rose-400/80" : "text-muted-foreground/60"
                                                }`}>
                                                {s.stage}
                                            </span>
                                        </div>

                                        {/* Automation */}
                                        <p className={`text-sm font-semibold mb-2 ${s.highlight ? "text-rose-700 dark:text-rose-300" : "text-foreground"
                                            }`}>
                                            {s.automation}
                                        </p>

                                        {/* Risk */}
                                        <div className="mt-auto">
                                            <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                                                {s.risk}
                                            </p>
                                            {/* Risk bar */}
                                            <div className="h-1 bg-muted/30 dark:bg-muted/20 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${s.riskLevel * 100}%` }}
                                                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 + i * 0.12 }}
                                                    viewport={{ once: true }}
                                                    className={`h-full rounded-full ${s.riskLevel >= 0.8
                                                        ? "bg-gradient-to-r from-rose-400 to-rose-500"
                                                        : s.riskLevel >= 0.5
                                                            ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                                            : "bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/50"
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Key Takeaway */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-muted/30 dark:bg-muted/10 rounded-lg p-4 border border-border/20"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                    Bias compounds downstream
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Each automation handoff can amplify bias from the previous stage. The human interview is where the most damage occurs.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Risk Cascade</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Automation handoffs where bias can compound
                </span>
            </figcaption>
        </figure>
    );
}
