"use client";

import { motion } from "framer-motion";

/**
 * Error Impact Diagram (v2.1)
 * 
 * Shows how spelling errors cascade into hiring penalties
 * Redesigned with horizontal flow and stronger visual weight
 */
export function ErrorImpactDiagram() {
    const steps = [
        {
            stage: "Error Spotted",
            detail: "Typo, grammar, inconsistency",
            color: "rose",
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
                </svg>
            )
        },
        {
            stage: "Trait Inference",
            detail: "Low attention to detail, carelessness",
            color: "amber",
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v4M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
            )
        },
        {
            stage: "Risk Assessment",
            detail: "Higher perceived hiring risk",
            color: "orange",
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
                </svg>
            )
        },
        {
            stage: "Callback Penalty",
            detail: "Reduced interview chances",
            color: "red",
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                </svg>
            )
        }
    ];

    const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
        rose: { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800/50", text: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-100 dark:bg-rose-900/50" },
        amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800/50", text: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900/50" },
        orange: { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800/50", text: "text-orange-600 dark:text-orange-400", iconBg: "bg-orange-100 dark:bg-orange-900/50" },
        red: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800/50", text: "text-red-600 dark:text-red-400", iconBg: "bg-red-100 dark:bg-red-900/50" }
    };

    return (
        <figure className="w-full max-w-[640px] mx-auto my-12 group select-none">
            <motion.div
                className="relative bg-white dark:bg-card border border-border/40 rounded-xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true, margin: "-50px" }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20 px-6 py-4 border-b border-border/30">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-rose-600/70 dark:text-rose-400/70">
                        The Error Penalty Chain
                    </span>
                </div>

                <div className="p-6">
                    {/* Horizontal flow on desktop, vertical on mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {steps.map((step, i) => {
                            const colors = colorMap[step.color];
                            return (
                                <motion.div
                                    key={step.stage}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="relative"
                                >
                                    {/* Arrow connector (hidden on first item and mobile) */}
                                    {i > 0 && (
                                        <div className="hidden md:block absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-1/2">
                                            <svg className="w-4 h-4 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    )}

                                    <div className={`rounded-lg p-4 border ${colors.bg} ${colors.border} h-full`}>
                                        <div className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center ${colors.text} mb-3`}>
                                            {step.icon}
                                        </div>
                                        <p className={`text-sm font-semibold ${colors.text} mb-1`}>
                                            {step.stage}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            {step.detail}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Key insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200/50 dark:border-red-800/30"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            <span className="font-semibold text-red-600 dark:text-red-400">Small errors → Big inferences.</span> Recruiters treat typos as signals about work quality, not just carelessness.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Error Cascade</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    How spelling errors trigger trait inferences and hiring penalties
                </span>
            </figcaption>
        </figure>
    );
}
