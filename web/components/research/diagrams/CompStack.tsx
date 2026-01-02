"use client";

import { motion } from "framer-motion";

/**
 * Compensation Stack Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Type C: Stack with 3D layered depth and animated build
 * 
 * Shows the total compensation hierarchy
 */
export function CompStack() {
    const stack = [
        { label: "Level & Title", value: "Multi-year trajectory", sub: "Scope promise", flexibility: 0.9 },
        { label: "Sign-on Bonus", value: "$20k - $50k", sub: "Flexible lever", flexibility: 1, highlight: true },
        { label: "Equity / RSUs", value: "$100k / 4yr", sub: "High variance", flexibility: 0.7 },
        { label: "Annual Bonus", value: "15% target", sub: "Performance tied", flexibility: 0.5 },
        { label: "Base Salary", value: "$165k", sub: "Hardest to move", flexibility: 0.2 },
    ];

    return (
        <figure className="w-full max-w-[400px] mx-auto my-12 group select-none">
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
                        Negotiation leverage
                    </span>
                </div>

                <div className="p-6">
                    {/* Stack */}
                    <div className="space-y-2">
                        {stack.map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 + i * 0.1 }}
                                viewport={{ once: true }}
                                className={`relative rounded-lg p-4 border transition-all ${item.highlight
                                    ? "border-brand/40 bg-gradient-to-r from-brand/10 to-brand/5 dark:from-brand/20 dark:to-brand/10 shadow-sm"
                                    : "border-border/30 bg-muted/10 dark:bg-muted/5"
                                    }`}
                                style={{
                                    // Create 3D stacking effect
                                    transform: `translateX(${i * 4}px)`,
                                }}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-semibold ${item.highlight ? "text-brand" : "text-foreground"
                                                }`}>
                                                {item.label}
                                            </p>
                                            {item.highlight && (
                                                <span className="px-1.5 py-0.5 bg-brand/20 text-brand text-[9px] font-mono font-bold uppercase rounded">
                                                    Best
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {item.sub}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-mono font-medium ${item.highlight ? "text-brand" : "text-muted-foreground"
                                            }`}>
                                            {item.value}
                                        </p>
                                    </div>
                                </div>

                                {/* Flexibility bar */}
                                <div className="mt-3 h-1 bg-muted/20 dark:bg-muted/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${item.flexibility * 100}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 + i * 0.1 }}
                                        viewport={{ once: true }}
                                        className={`h-full rounded-full ${item.highlight
                                            ? "bg-gradient-to-r from-brand/60 to-brand"
                                            : "bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/40"
                                            }`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Key Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-brand/5 dark:bg-brand/10 rounded-lg p-4 border border-brand/20"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                    Trade up, not down
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Focus negotiation on the most flexible components first. Sign-on is often the easiest lever.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Stack</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Negotiate the flexible components first
                </span>
            </figcaption>
        </figure>
    );
}
