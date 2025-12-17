"use client";

import { motion } from "framer-motion";

/**
 * Resume Length Comparison Diagram
 * Visualizes the relationship between experience level and optimal resume length
 * Style: Research-grade bar chart, monochrome + teal accent
 */
export function ResumeLengthChart() {
    const data = [
        { label: "0-5 years", pages: 1, optimal: true, width: 35 },
        { label: "5-10 years", pages: 1.5, optimal: false, width: 52 },
        { label: "10+ years", pages: 2, optimal: true, width: 70 },
    ];

    return (
        <div className="w-full max-w-md mx-auto my-8">
            <div className="relative bg-card border border-border/20 rounded-md p-4 md:p-6 shadow-sm">
                {/* Mobile header (hidden on desktop) */}
                <p className="md:hidden text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4 text-center">
                    Resume length by experience
                </p>

                {/* Y-axis label (hidden on mobile to avoid clipping) */}
                <div className="hidden md:block absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        Experience
                    </span>
                </div>

                {/* Chart */}
                <div className="space-y-3 md:space-y-4 md:pl-4">
                    {data.map((row, i) => (
                        <motion.div
                            key={row.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
                            className="flex items-center gap-3"
                        >
                            <span className="font-mono text-[10px] text-muted-foreground w-16 text-right">
                                {row.label}
                            </span>
                            <div className="flex-1 h-6 bg-secondary/30 rounded-sm overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${row.width}%` }}
                                    transition={{ duration: 0.5, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                                    className={`h-full rounded-sm ${row.optimal ? "bg-brand" : "bg-muted-foreground/40"}`}
                                />
                            </div>
                            <span className={`font-mono text-xs w-10 ${row.optimal ? "text-brand font-medium" : "text-muted-foreground"}`}>
                                {row.pages}p
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* X-axis */}
                <div className="mt-6 pt-4 border-t border-border/20">
                    <div className="flex justify-between px-4">
                        <span className="font-mono text-[9px] text-muted-foreground">0</span>
                        <span className="font-mono text-[9px] text-muted-foreground">1 page</span>
                        <span className="font-mono text-[9px] text-muted-foreground">2 pages</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-4 text-[10px]">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-brand" />
                        <span className="text-muted-foreground">Optimal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-muted-foreground/40" />
                        <span className="text-muted-foreground">Variable</span>
                    </div>
                </div>
            </div>

            {/* Figure Caption */}
            <p className="text-center mt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Fig. 1 — Optimal resume length by experience level
                </span>
            </p>
        </div>
    );
}
