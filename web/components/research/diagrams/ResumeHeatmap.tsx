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

            {/* Heatmap Overlay - Real eye-tracking colors (red/orange/yellow/green) */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Hotspot 1: Name (PRIMARY FOCUS - RED/Intense) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="absolute top-3 left-3 w-52 h-28 rounded-full blur-xl"
                    style={{
                        background: "radial-gradient(ellipse at 30% 40%, rgba(239, 68, 68, 0.55) 0%, rgba(249, 115, 22, 0.3) 35%, rgba(251, 191, 36, 0.1) 60%, transparent 80%)"
                    }}
                />

                {/* Hotspot 2: Current Role Title (SECONDARY - ORANGE) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="absolute top-28 left-3 w-40 h-24 rounded-full blur-lg"
                    style={{
                        background: "radial-gradient(ellipse at 25% 50%, rgba(249, 115, 22, 0.5) 0%, rgba(251, 191, 36, 0.25) 45%, transparent 80%)"
                    }}
                />

                {/* Hotspot 3: Dates area (TERTIARY - YELLOW) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="absolute top-28 right-4 w-28 h-16 rounded-full blur-lg"
                    style={{
                        background: "radial-gradient(ellipse at center, rgba(251, 191, 36, 0.45) 0%, rgba(253, 224, 71, 0.15) 55%, transparent 80%)"
                    }}
                />

                {/* Hotspot 4: Second Role Header (TERTIARY - YELLOW) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="absolute top-48 left-3 w-32 h-16 rounded-full blur-lg"
                    style={{
                        background: "radial-gradient(ellipse at 25% 50%, rgba(251, 191, 36, 0.4) 0%, rgba(253, 224, 71, 0.15) 50%, transparent 80%)"
                    }}
                />

                {/* Hotspot 5: Second Role Date (FAINT - YELLOW) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                    className="absolute top-48 right-4 w-20 h-12 rounded-full blur-lg"
                    style={{
                        background: "radial-gradient(ellipse at center, rgba(251, 191, 36, 0.3) 0%, transparent 70%)"
                    }}
                />

                {/* Hotspot 6: Education Header (FAINT - YELLOW/GREEN) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.3 }}
                    className="absolute top-64 left-3 w-24 h-14 rounded-full blur-lg"
                    style={{
                        background: "radial-gradient(ellipse at 30% 50%, rgba(251, 191, 36, 0.3) 0%, rgba(34, 197, 94, 0.1) 60%, transparent 85%)"
                    }}
                />

                {/* Hotspot 7: Third Role (COOL - GREEN/BLUE) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    className="absolute bottom-32 left-3 w-28 h-14 rounded-full blur-lg"
                    style={{
                        background: "radial-gradient(ellipse at 25% 50%, rgba(34, 197, 94, 0.25) 0%, rgba(59, 130, 246, 0.08) 60%, transparent 85%)"
                    }}
                />

                {/* Hotspot 8: Skills Section (COOL - GREEN) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.7 }}
                    className="absolute bottom-12 left-3 w-20 h-16 rounded-full blur-lg"
                    style={{
                        background: "radial-gradient(ellipse at 30% 50%, rgba(34, 197, 94, 0.2) 0%, rgba(59, 130, 246, 0.05) 60%, transparent 85%)"
                    }}
                />

                {/* Left margin fade - continuous attention on left edge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.4 }}
                    className="absolute top-24 left-0 w-8 h-[70%] blur-md"
                    style={{
                        background: "linear-gradient(180deg, rgba(249, 115, 22, 0.2) 0%, rgba(251, 191, 36, 0.15) 30%, rgba(34, 197, 94, 0.1) 60%, rgba(59, 130, 246, 0.05) 100%)"
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
