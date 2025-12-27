"use client";

import { motion } from "framer-motion";

/**
 * Impact Formula Diagram (Laszlo Bock)
 * Visualizes the X → Y → Z formula for resume bullets
 * Style: Research-grade formula breakdown
 */
export function ImpactFormulaDiagram() {
    return (
        <div className="w-full max-w-lg mx-auto my-8">
            <div className="relative bg-card border border-border/20 rounded-md p-4 md:p-8 shadow-sm">
                {/* Formula */}
                <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="text-center"
                    >
                        <div className="w-12 h-12 rounded-sm border border-brand/30 bg-brand/10 flex items-center justify-center">
                            <span className="font-serif text-xl font-medium text-brand">X</span>
                        </div>
                        <p className="text-[9px] font-mono uppercase text-muted-foreground mt-2">Result</p>
                    </motion.div>

                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="text-muted-foreground"
                    >
                        →
                    </motion.span>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="text-center"
                    >
                        <div className="w-12 h-12 rounded-sm border border-border/30 bg-secondary/30 flex items-center justify-center">
                            <span className="font-serif text-xl font-medium text-foreground">Y</span>
                        </div>
                        <p className="text-[9px] font-mono uppercase text-muted-foreground mt-2">Metric</p>
                    </motion.div>

                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                        className="text-muted-foreground"
                    >
                        →
                    </motion.span>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                        className="text-center"
                    >
                        <div className="w-12 h-12 rounded-sm border border-border/30 bg-secondary/30 flex items-center justify-center">
                            <span className="font-serif text-xl font-medium text-foreground">Z</span>
                        </div>
                        <p className="text-[9px] font-mono uppercase text-muted-foreground mt-2">Method</p>
                    </motion.div>
                </div>

                {/* Example breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1 }}
                    className="border-t border-border/20 pt-6"
                >
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3 text-center">
                        Example
                    </p>
                    <div className="bg-secondary/20 rounded-sm p-4 text-sm text-foreground leading-relaxed">
                        <span className="text-brand font-medium">&quot;Grew revenue by 40%</span>
                        <span className="text-muted-foreground"> as measured by </span>
                        <span className="text-foreground">quarterly MRR,</span>
                        <span className="text-muted-foreground"> by </span>
                        <span className="text-foreground">implementing a usage-based pricing model.&quot;</span>
                    </div>
                </motion.div>

                {/* Labels below formula */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 1.2 }}
                    className="flex justify-center gap-8 mt-6 text-[10px] text-muted-foreground"
                >
                    <span>Accomplished <span className="text-brand">[X]</span></span>
                    <span>measured by [Y]</span>
                    <span>by doing [Z]</span>
                </motion.div>
            </div>

            {/* Figure Caption */}
            <p className="text-center mt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Fig. 1 — The Laszlo Bock formula for high-impact bullets
                </span>
            </p>
        </div>
    );
}
