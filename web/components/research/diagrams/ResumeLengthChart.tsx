"use client";

import { motion } from "framer-motion";

/**
 * Signal Density vs Scan Cost Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Conceptual curve showing how clarity affects first-pass scanning
 */
export function ResumeLengthChart() {
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
                        Signal vs scan cost
                    </span>
                </div>

                <div className="p-6">
                    <motion.svg
                        viewBox="0 0 240 160"
                        className="w-full h-40"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <defs>
                            <linearGradient id="scanCurveGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity="1" />
                            </linearGradient>
                        </defs>
                        {/* Axes */}
                        <line x1="30" y1="130" x2="220" y2="130" stroke="hsl(var(--border))" strokeWidth="1.5" />
                        <line x1="30" y1="130" x2="30" y2="20" stroke="hsl(var(--border))" strokeWidth="1.5" />

                        {/* Curve */}
                        <motion.path
                            d="M30 110 C 70 40, 140 30, 220 55"
                            fill="none"
                            stroke="url(#scanCurveGrad)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                            viewport={{ once: true }}
                        />

                        {/* Optimal point */}
                        <motion.circle
                            cx="120"
                            cy="35"
                            r="5"
                            fill="hsl(var(--brand))"
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut", delay: 1 }}
                            viewport={{ once: true }}
                        />

                        {/* Axis labels */}
                        <text x="35" y="145" fontSize="9" fill="hsl(var(--muted-foreground))" fontFamily="system-ui">Low cost</text>
                        <text x="180" y="145" fontSize="9" fill="hsl(var(--muted-foreground))" fontFamily="system-ui">High cost</text>
                        <text x="10" y="75" fontSize="9" fill="hsl(var(--muted-foreground))" fontFamily="system-ui" transform="rotate(-90 15 75)">Signal</text>
                    </motion.svg>

                    {/* Caption */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.8 }}
                        viewport={{ once: true }}
                        className="mt-4 text-xs text-muted-foreground text-center"
                    >
                        Clear structure raises signal quickly. Dense layouts add scan cost without adding signal.
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Curve</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Scan cost can outpace signal recovery
                </span>
            </figcaption>
        </figure>
    );
}
