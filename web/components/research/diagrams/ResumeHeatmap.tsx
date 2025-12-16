"use client";

import { motion } from "framer-motion";

export function ResumeHeatmap() {
    return (
        <div className="relative w-full max-w-[400px] aspect-[1/1.4] bg-neutral-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden mx-auto my-8">
            {/* Resume Skeleton */}
            <div className="p-6 space-y-4 opacity-40 grayscale blur-[0.5px]">
                {/* Header */}
                <div className="space-y-2">
                    <div className="h-6 w-1/2 bg-white/20 rounded-sm" />
                    <div className="h-3 w-1/3 bg-white/10 rounded-sm" />
                </div>

                <div className="h-px w-full bg-white/5 my-4" />

                {/* Experience Block 1 */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-4 w-1/3 bg-white/10 rounded-sm" />
                        <div className="h-3 w-16 bg-white/5 rounded-sm" />
                    </div>
                    <div className="h-3 w-1/4 bg-white/5 rounded-sm" />
                    <div className="space-y-1 pt-1">
                        <div className="h-2 w-full bg-white/5 rounded-sm" />
                        <div className="h-2 w-11/12 bg-white/5 rounded-sm" />
                        <div className="h-2 w-10/12 bg-white/5 rounded-sm" />
                    </div>
                </div>

                {/* Experience Block 2 */}
                <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                        <div className="h-4 w-1/3 bg-white/10 rounded-sm" />
                        <div className="h-3 w-16 bg-white/5 rounded-sm" />
                    </div>
                    <div className="h-3 w-1/4 bg-white/5 rounded-sm" />
                    <div className="space-y-1 pt-1">
                        <div className="h-2 w-full bg-white/5 rounded-sm" />
                        <div className="h-2 w-11/12 bg-white/5 rounded-sm" />
                    </div>
                </div>

                {/* Education */}
                <div className="space-y-2 pt-4">
                    <div className="h-3 w-20 bg-white/10 rounded-sm" />
                    <div className="h-2 w-1/2 bg-white/5 rounded-sm" />
                </div>

                {/* Experience 3 (Filler) */}
                <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                        <div className="h-4 w-1/3 bg-white/10 rounded-sm" />
                        <div className="h-3 w-16 bg-white/5 rounded-sm" />
                    </div>
                    <div className="space-y-1 pt-1">
                        <div className="h-2 w-full bg-white/5 rounded-sm" />
                        <div className="h-2 w-4/5 bg-white/5 rounded-sm" />
                    </div>
                </div>

                {/* Skills / Footer (Filler) */}
                <div className="space-y-2 pt-6 pb-4">
                    <div className="h-4 w-1/5 bg-white/10 rounded-sm" />
                    <div className="h-2 w-full bg-white/5 rounded-sm" />
                    <div className="h-2 w-4/5 bg-white/5 rounded-sm" />
                </div>
            </div>

            {/* Heatmap Overlay (The Science) - Luminous Gold Edition */}
            <div className="absolute inset-0 mix-blend-plus-lighter pointer-events-none">
                {/* Hotspot: Name (Primary Focus) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.4, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="absolute top-4 left-4 w-40 h-20 bg-gold blur-[40px] rounded-full"
                />
                {/* Hotspot: Current Role (Secondary Focus) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="absolute top-32 left-4 w-32 h-16 bg-amber-500 blur-[35px] rounded-full"
                />
                {/* Hotspot: Dates (Tertiary Focus) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="absolute top-32 right-4 w-20 h-10 bg-gold blur-[25px] rounded-full"
                />
            </div>

            {/* Labels */}
            <div className="absolute bottom-2 left-0 right-0 text-center">
                <span className="text-[10px] font-mono text-gold uppercase tracking-widest">
                    Fig 1. Aggregated Gaze Duration
                </span>
            </div>
        </div>
    );
}
