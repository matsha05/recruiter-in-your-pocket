"use client";

import { motion } from "framer-motion";

/**
 * ATS Decision Funnel Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Type C: Funnel/Stack with layered depth and animated build
 * 
 * Shows where automation vs human decisions happen in hiring
 */
export function ATSFunnel() {
    const layers = [
        {
            label: "Data Layer",
            title: "ATS Infrastructure",
            note: "Parsing, storage, search, workflow routing",
            intensity: 0.3,
            width: "100%"
        },
        {
            label: "Logic Layer",
            title: "Screening Automation",
            note: "Eligibility rules, assessments, ranking",
            intensity: 0.6,
            width: "75%"
        },
        {
            label: "Decision Layer",
            title: "Human Judgment",
            note: "Shortlist, interview selection, final hire",
            intensity: 1,
            width: "50%"
        }
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
                        Decision rights hierarchy
                    </span>
                </div>

                <div className="p-6 space-y-4">
                    {/* Funnel Layers */}
                    <div className="relative space-y-3">
                        {layers.map((layer, i) => (
                            <motion.div
                                key={layer.title}
                                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 + i * 0.15 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <div
                                    className="mx-auto transition-all duration-500"
                                    style={{ width: layer.width }}
                                >
                                    <div className={`relative border rounded-lg p-4 ${layer.intensity === 1
                                        ? "border-brand/40 bg-gradient-to-r from-brand/10 to-brand/5 dark:from-brand/20 dark:to-brand/10"
                                        : "border-border/40 bg-muted/20 dark:bg-muted/10"
                                        }`}>
                                        {/* Layer indicator */}
                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-card border border-border/40 shadow-sm flex items-center justify-center">
                                            <span className="text-[10px] font-mono font-bold text-muted-foreground">
                                                {i + 1}
                                            </span>
                                        </div>

                                        <div className="ml-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-mono text-[9px] uppercase tracking-widest ${layer.intensity === 1
                                                    ? "text-brand/70"
                                                    : "text-muted-foreground/60"
                                                    }`}>
                                                    {layer.label}
                                                </span>
                                            </div>
                                            <p className={`text-sm font-semibold mb-1 ${layer.intensity === 1 ? "text-brand" : "text-foreground"
                                                }`}>
                                                {layer.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {layer.note}
                                            </p>
                                        </div>

                                        {/* Intensity bar */}
                                        <div className="mt-3 h-1.5 bg-muted/30 dark:bg-muted/20 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${layer.intensity * 100}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 + i * 0.15 }}
                                                viewport={{ once: true }}
                                                className={`h-full rounded-full ${layer.intensity === 1
                                                    ? "bg-gradient-to-r from-brand/60 to-brand"
                                                    : "bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/40"
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Connector */}
                                {i < layers.length - 1 && (
                                    <div className="flex justify-center py-1">
                                        <div className="w-px h-3 bg-gradient-to-b from-border/40 to-border/20" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Key Takeaway */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.7 }}
                        viewport={{ once: true }}
                        className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4 border border-border/20"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                    Humans decide
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    The ATS organizes—humans choose. Understanding this hierarchy explains what you can and can&apos;t optimize for.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Decision Rights</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Where automation operates vs where humans decide
                </span>
            </figcaption>
        </figure>
    );
}
