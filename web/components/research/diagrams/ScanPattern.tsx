"use client";

import { motion } from "framer-motion";

export function ScanPattern() {
    // SVG path for the F-pattern - used for both the line and the gaze dot
    const fPath = "M 24 40 L 260 40 L 24 40 L 24 100 L 200 100 L 24 100 L 24 480";

    return (
        <div className="relative w-full max-w-[420px] aspect-[1/1.4] bg-card border border-border/20 rounded-md overflow-hidden mx-auto my-8 shadow-sm">
            {/* Resume Skeleton */}
            <div className="p-6 space-y-4">
                {/* Header - Name */}
                <div className="space-y-2">
                    <div className="h-7 w-3/5 bg-foreground/15 rounded-sm" />
                    <div className="h-3 w-2/5 bg-foreground/8 rounded-sm" />
                </div>
                <div className="h-px w-full bg-border/30 my-4" />

                {/* Experience Block 1 */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="h-4 w-2/5 bg-foreground/12 rounded-sm" />
                        <div className="h-3 w-16 bg-foreground/6 rounded-sm" />
                    </div>
                    <div className="h-3 w-1/3 bg-foreground/6 rounded-sm" />
                    <div className="space-y-1.5 pt-1">
                        <div className="h-2 w-full bg-foreground/5 rounded-sm" />
                        <div className="h-2 w-[95%] bg-foreground/5 rounded-sm" />
                        <div className="h-2 w-[85%] bg-foreground/5 rounded-sm" />
                    </div>
                </div>

                {/* Experience Block 2 */}
                <div className="space-y-2 pt-3">
                    <div className="flex justify-between items-center">
                        <div className="h-4 w-1/3 bg-foreground/12 rounded-sm" />
                        <div className="h-3 w-16 bg-foreground/6 rounded-sm" />
                    </div>
                    <div className="h-3 w-1/4 bg-foreground/6 rounded-sm" />
                    <div className="space-y-1.5 pt-1">
                        <div className="h-2 w-full bg-foreground/5 rounded-sm" />
                        <div className="h-2 w-[70%] bg-foreground/5 rounded-sm" />
                    </div>
                </div>

                {/* Experience Block 3 */}
                <div className="space-y-2 pt-3">
                    <div className="flex justify-between items-center">
                        <div className="h-4 w-2/5 bg-foreground/12 rounded-sm" />
                        <div className="h-3 w-16 bg-foreground/6 rounded-sm" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                        <div className="h-2 w-full bg-foreground/5 rounded-sm" />
                        <div className="h-2 w-[80%] bg-foreground/5 rounded-sm" />
                    </div>
                </div>

                {/* Education */}
                <div className="space-y-2 pt-4">
                    <div className="h-4 w-1/4 bg-foreground/12 rounded-sm" />
                    <div className="h-3 w-2/5 bg-foreground/6 rounded-sm" />
                </div>

                {/* Skills */}
                <div className="space-y-2 pt-4 pb-2">
                    <div className="h-4 w-1/5 bg-foreground/12 rounded-sm" />
                    <div className="flex flex-wrap gap-2">
                        <div className="h-5 w-14 bg-foreground/5 rounded-sm" />
                        <div className="h-5 w-12 bg-foreground/5 rounded-sm" />
                        <div className="h-5 w-16 bg-foreground/5 rounded-sm" />
                        <div className="h-5 w-10 bg-foreground/5 rounded-sm" />
                    </div>
                </div>
            </div>

            {/* F-Pattern Line Overlay */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ fill: "none" }}
            >
                <defs>
                    <linearGradient id="fPatternGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity="0.3" />
                    </linearGradient>
                </defs>
                <motion.path
                    d={fPath}
                    stroke="url(#fPatternGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                />
            </svg>

            {/* Animated Gaze Dot - Traces the F-pattern */}
            <motion.div
                className="absolute w-5 h-5 rounded-full z-20 pointer-events-none"
                style={{
                    background: "hsl(var(--brand))",
                    boxShadow: "0 0 16px 4px hsla(var(--brand), 0.4), 0 0 4px 1px hsla(var(--brand), 0.6)",
                    offsetPath: `path("${fPath}")`
                }}
                initial={{ offsetDistance: "0%", opacity: 0, scale: 0.5 }}
                whileInView={{
                    offsetDistance: "100%",
                    opacity: [0, 1, 1, 1, 0.8],
                    scale: [0.5, 1, 1, 1, 0.8]
                }}
                transition={{
                    duration: 3,
                    ease: [0.16, 1, 0.3, 1],
                    times: [0, 0.1, 0.5, 0.9, 1]
                }}
                viewport={{ once: true }}
            />

            {/* Legend Badge */}
            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border border-brand/20 rounded-sm px-3 py-1.5 shadow-sm">
                <span className="text-[10px] font-mono font-semibold text-brand uppercase tracking-widest">
                    F-Pattern
                </span>
            </div>

            {/* Figure Caption */}
            <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    Fig 1. Eye-Tracking Gaze Path
                </span>
            </div>
        </div>
    );
}
