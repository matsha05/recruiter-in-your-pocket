"use client";

import { motion } from "framer-motion";
import { DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";

/**
 * Trust Choice Grid / Human vs Algorithm Table (v2.0)
 * 
 * Reverted to clear table format per user feedback
 * Shows how recruiters respond differently to human vs algorithm errors
 */
export function TrustChoiceGrid() {
    const comparisons = [
        { aspect: "Initial trust", human: "Higher", algorithm: "Lower" },
        { aspect: "Error tolerance", human: "More forgiving", algorithm: "Less forgiving" },
        { aspect: "Recovery after mistake", human: "Easier", algorithm: "Harder" },
        { aspect: "Perceived explainability", human: "Intuitive", algorithm: "Opaque" },
    ];

    return (
        <DiagramFigure className="w-full max-w-[520px] mx-auto my-12 group select-none">
            <DiagramFrame
                className="riyp-diagram-shell"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-50px" }}
            >
                {/* Header */}
                <div className="riyp-diagram-head">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                        Trust comparison
                    </span>
                </div>

                <div className="p-6">
                    {/* Table header */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-3 gap-4 pb-3 border-b border-border/30"
                    >
                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                            Dimension
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-center">
                            <span className="px-2 py-1 rounded bg-foreground/5 text-foreground">Human</span>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-center">
                            <span className="px-2 py-1 rounded bg-brand/10 text-brand">Algorithm</span>
                        </div>
                    </motion.div>

                    {/* Table rows */}
                    <div className="divide-y divide-border/20">
                        {comparisons.map((row, i) => (
                            <motion.div
                                key={row.aspect}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.08 }}
                                viewport={{ once: true }}
                                className="grid grid-cols-3 gap-4 py-3"
                            >
                                <div className="text-sm text-muted-foreground">
                                    {row.aspect}
                                </div>
                                <div className="text-sm font-medium text-foreground text-center">
                                    {row.human}
                                </div>
                                <div className="text-sm text-brand text-center">
                                    {row.algorithm}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Key Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-muted/30 dark:bg-muted/10 rounded-lg p-4 border border-border/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-medium text-foreground">Algorithm aversion:</span> Recruiters are quicker to distrust algorithms after errors, even when performance is similar.
                        </p>
                    </motion.div>
                </div>
            </DiagramFrame>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Trust Asymmetry</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    How recruiters respond to human vs algorithm recommendations
                </span>
            </figcaption>
        </DiagramFigure>
    );
}
