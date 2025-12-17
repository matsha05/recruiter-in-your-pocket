"use client";

import { motion } from "framer-motion";

/**
 * Referral Funnel Diagram
 * Compares application source success rates
 * Style: Research-grade funnel/bar comparison
 */
export function ReferralFunnelDiagram() {
    const sources = [
        { label: "Job Board", rate: 3, interviews: "3-5%", hires: "~1%", width: 15 },
        { label: "Company Site", rate: 5, interviews: "5-8%", hires: "~2%", width: 25 },
        { label: "Referral", rate: 45, interviews: "40-60%", hires: "~15%", width: 100, highlight: true },
    ];

    return (
        <div className="w-full max-w-md mx-auto my-8">
            <div className="relative bg-card border border-border/20 rounded-md p-4 md:p-6 shadow-sm">
                {/* Header */}
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-4 md:mb-6">
                    <span>Source</span>
                    <span>Interview Rate</span>
                </div>

                {/* Bars */}
                <div className="space-y-4">
                    {sources.map((source, i) => (
                        <motion.div
                            key={source.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 * i }}
                            className="space-y-1"
                        >
                            <div className="flex justify-between items-center">
                                <span className={`text-xs ${source.highlight ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                    {source.label}
                                </span>
                                <span className={`text-xs font-mono ${source.highlight ? "text-brand font-medium" : "text-muted-foreground"}`}>
                                    {source.interviews}
                                </span>
                            </div>
                            <div className="h-4 bg-secondary/30 rounded-sm overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${source.width}%` }}
                                    transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                                    className={`h-full rounded-sm ${source.highlight ? "bg-brand" : "bg-muted-foreground/30"}`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Callout */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                    className="mt-8 pt-4 border-t border-border/20 text-center"
                >
                    <div className="inline-flex items-baseline gap-2">
                        <span className="font-serif text-4xl font-medium text-brand">5-10×</span>
                        <span className="text-xs text-muted-foreground">more likely to be hired</span>
                    </div>
                </motion.div>

                {/* Key insight */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 1.1 }}
                    className="text-center text-[10px] text-muted-foreground mt-4"
                >
                    Referrals are 7% of applicants but 40% of hires
                </motion.p>
            </div>

            {/* Figure Caption */}
            <p className="text-center mt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Fig. 1 — Interview success rate by application source
                </span>
            </p>
        </div>
    );
}
