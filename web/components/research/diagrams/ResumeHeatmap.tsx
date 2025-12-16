"use client";

import { motion } from "framer-motion";

export function ResumeHeatmap() {
    return (
        <div className="relative w-full max-w-[400px] aspect-[1/1.4] bg-card border border-border/20 rounded-md overflow-hidden mx-auto my-8 shadow-sm">
            {/* Resume Skeleton */}
            <div className="p-6 space-y-4">
                {/* Header - Name (Primary Focus Area) */}
                <div className="space-y-2">
                    <div className="h-6 w-1/2 bg-foreground/15 rounded-sm" />
                    <div className="h-3 w-1/3 bg-foreground/8 rounded-sm" />
                </div>

                <div className="h-px w-full bg-border/30 my-4" />

                {/* Experience Block 1 (Secondary Focus) */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-4 w-1/3 bg-foreground/10 rounded-sm" />
                        <div className="h-3 w-16 bg-foreground/5 rounded-sm" />
                    </div>
                    <div className="h-3 w-1/4 bg-foreground/5 rounded-sm" />
                    <div className="space-y-1 pt-1">
                        <div className="h-2 w-full bg-foreground/5 rounded-sm" />
                        <div className="h-2 w-11/12 bg-foreground/5 rounded-sm" />
                        <div className="h-2 w-10/12 bg-foreground/5 rounded-sm" />
                    </div>
                </div>

                {/* Experience Block 2 */}
                <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                        <div className="h-4 w-1/3 bg-foreground/10 rounded-sm" />
                        <div className="h-3 w-16 bg-foreground/5 rounded-sm" />
                    </div>
                    <div className="h-3 w-1/4 bg-foreground/5 rounded-sm" />
                    <div className="space-y-1 pt-1">
                        <div className="h-2 w-full bg-foreground/5 rounded-sm" />
                        <div className="h-2 w-11/12 bg-foreground/5 rounded-sm" />
                    </div>
                </div>

                {/* Education */}
                <div className="space-y-2 pt-4">
                    <div className="h-3 w-20 bg-foreground/10 rounded-sm" />
                    <div className="h-2 w-1/2 bg-foreground/5 rounded-sm" />
                </div>

                {/* Experience 3 */}
                <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                        <div className="h-4 w-1/3 bg-foreground/10 rounded-sm" />
                        <div className="h-3 w-16 bg-foreground/5 rounded-sm" />
                    </div>
                    <div className="space-y-1 pt-1">
                        <div className="h-2 w-full bg-foreground/5 rounded-sm" />
                        <div className="h-2 w-4/5 bg-foreground/5 rounded-sm" />
                    </div>
                </div>

                {/* Skills */}
                <div className="space-y-2 pt-6 pb-4">
                    <div className="h-4 w-1/5 bg-foreground/10 rounded-sm" />
                    <div className="h-2 w-full bg-foreground/5 rounded-sm" />
                    <div className="h-2 w-4/5 bg-foreground/5 rounded-sm" />
                </div>
            </div>

            {/* Heatmap Overlay - Real eye-tracking colors (red/orange/yellow) */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Hotspot: Name (Primary Focus - RED/Intense) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="absolute top-3 left-3 w-48 h-24 rounded-full blur-xl"
                    style={{
                        background: "radial-gradient(ellipse at center, rgba(239, 68, 68, 0.6) 0%, rgba(249, 115, 22, 0.3) 40%, transparent 70%)"
                    }}
                />

                {/* Hotspot: Current Role Title (Secondary - ORANGE) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="absolute top-28 left-3 w-36 h-20 rounded-full blur-lg"
                    style={{
                        background: "radial-gradient(ellipse at center, rgba(249, 115, 22, 0.5) 0%, rgba(251, 191, 36, 0.2) 50%, transparent 75%)"
                    }}
                />

                {/* Hotspot: Dates (Tertiary - YELLOW/Light) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="absolute top-28 right-4 w-24 h-14 rounded-full blur-lg"
                    style={{
                        background: "radial-gradient(ellipse at center, rgba(251, 191, 36, 0.45) 0%, rgba(253, 224, 71, 0.2) 50%, transparent 75%)"
                    }}
                />

                {/* Hotspot: Second Role Header (Tertiary - YELLOW) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="absolute top-48 left-3 w-28 h-12 rounded-full blur-lg"
                    style={{
                        background: "radial-gradient(ellipse at center, rgba(251, 191, 36, 0.4) 0%, transparent 70%)"
                    }}
                />
            </div>

            {/* Labels */}
            <div className="absolute bottom-2 left-0 right-0 text-center">
                <span className="text-[10px] font-mono text-brand uppercase tracking-widest">
                    Fig 1. Aggregated Gaze Duration
                </span>
            </div>
        </div>
    );
}
