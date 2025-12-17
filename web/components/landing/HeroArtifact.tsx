"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

/**
 * HeroArtifact - Landing Page Hero Resume with Heatmap
 * 
 * Design principles (from first principles):
 * 1. Abstract resume skeleton (gray placeholder bars, not real text)
 * 2. Soft, diffuse heat gradients following F-pattern (red → orange → yellow → green)
 * 3. Timer animation showing the 6-second constraint
 * 4. Professional caption like research diagrams
 * 5. Design system tokens (bg-card, border, brand colors)
 */

export function HeroArtifact() {
    const [elapsed, setElapsed] = useState(0);
    const duration = 5.8;

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const current = (Date.now() - startTime) / 1000;
            if (current >= duration) {
                setElapsed(duration);
                clearInterval(interval);
            } else {
                setElapsed(current);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-[420px] mx-auto">
            {/* Timer Badge */}
            <div className="absolute -top-3 right-4 z-20">
                <div className="flex items-center gap-2 bg-neutral-900 text-white px-3 py-1.5 rounded-full text-sm font-mono shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                    {elapsed.toFixed(1)}s
                </div>
            </div>

            {/* Resume Card */}
            <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden border border-black/5">
                {/* Resume Skeleton */}
                <div className="p-6 md:p-8 space-y-5">
                    {/* Header - Name & Title */}
                    <div className="space-y-2 border-b border-black/5 pb-5">
                        <div className="h-7 w-3/5 bg-neutral-200 rounded-sm" />
                        <div className="h-4 w-2/5 bg-neutral-100 rounded-sm" />
                        <div className="flex gap-2 pt-1">
                            <div className="h-2.5 w-24 bg-neutral-100 rounded-sm" />
                            <div className="h-2.5 w-20 bg-neutral-100 rounded-sm" />
                        </div>
                    </div>

                    {/* Experience Section Label */}
                    <div className="h-3 w-20 bg-neutral-200 rounded-sm" />

                    {/* Job 1 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2 items-center">
                                <div className="h-4 w-16 bg-neutral-200 rounded-sm" />
                                <div className="h-3 w-28 bg-neutral-100 rounded-sm" />
                            </div>
                            <div className="h-3 w-24 bg-neutral-100 rounded-sm" />
                        </div>
                        <div className="space-y-1.5 pl-4">
                            <div className="h-2.5 w-full bg-neutral-100 rounded-sm" />
                            <div className="h-2.5 w-11/12 bg-neutral-50 rounded-sm" />
                            <div className="h-2.5 w-10/12 bg-neutral-50 rounded-sm" />
                            <div className="h-2.5 w-9/12 bg-neutral-50 rounded-sm" />
                        </div>
                    </div>

                    {/* Job 2 */}
                    <div className="space-y-2 pt-3">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2 items-center">
                                <div className="h-4 w-14 bg-neutral-200 rounded-sm" />
                                <div className="h-3 w-24 bg-neutral-100 rounded-sm" />
                            </div>
                            <div className="h-3 w-24 bg-neutral-100 rounded-sm" />
                        </div>
                        <div className="space-y-1.5 pl-4">
                            <div className="h-2.5 w-full bg-neutral-100 rounded-sm" />
                            <div className="h-2.5 w-11/12 bg-neutral-50 rounded-sm" />
                            <div className="h-2.5 w-10/12 bg-neutral-50 rounded-sm" />
                        </div>
                    </div>

                    {/* Education */}
                    <div className="space-y-2 pt-4">
                        <div className="h-3 w-16 bg-neutral-200 rounded-sm" />
                        <div className="flex justify-between items-center">
                            <div className="h-3 w-32 bg-neutral-100 rounded-sm" />
                            <div className="h-2.5 w-12 bg-neutral-50 rounded-sm" />
                        </div>
                    </div>
                </div>

                {/* Heatmap Overlay */}
                <HeatmapOverlay elapsed={elapsed} duration={duration} />

                {/* Caption */}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                        What a recruiter saw in 5.8 seconds
                    </span>
                </div>
            </div>
        </div>
    );
}

function HeatmapOverlay({ elapsed, duration }: { elapsed: number; duration: number }) {
    // Calculate visibility based on elapsed time
    const progress = Math.min(elapsed / duration, 1);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Hotspot 1: Name - PRIMARY FOCUS (Red/Intense) - CENTERED */}
            <motion.div
                className="absolute rounded-full blur-2xl"
                style={{
                    top: '2%',
                    left: '10%',
                    width: '80%',
                    height: '18%',
                    background: 'radial-gradient(ellipse at 50% 50%, rgba(239, 68, 68, 0.55) 0%, rgba(249, 115, 22, 0.3) 35%, rgba(251, 191, 36, 0.1) 65%, transparent 100%)',
                }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: progress > 0.05 ? 1 : 0, scale: 1 }}
                transition={{ duration: 0.8 }}
            />

            {/* Hotspot 2: Title - Secondary (Orange) */}
            <motion.div
                className="absolute rounded-full blur-xl"
                style={{
                    top: '10%',
                    left: '3%',
                    width: '45%',
                    height: '8%',
                    background: 'radial-gradient(ellipse at 25% 50%, rgba(249, 115, 22, 0.45) 0%, rgba(251, 191, 36, 0.2) 50%, transparent 85%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 0.1 ? 0.9 : 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            />

            {/* Hotspot 3: Job 1 Company (Orange/Yellow) */}
            <motion.div
                className="absolute rounded-full blur-xl"
                style={{
                    top: '24%',
                    left: '3%',
                    width: '55%',
                    height: '10%',
                    background: 'radial-gradient(ellipse at 20% 50%, rgba(249, 115, 22, 0.4) 0%, rgba(251, 191, 36, 0.2) 45%, transparent 80%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 0.2 ? 0.85 : 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            />

            {/* Hotspot 4: Job 1 Dates (Yellow) */}
            <motion.div
                className="absolute rounded-full blur-lg"
                style={{
                    top: '24%',
                    right: '4%',
                    width: '25%',
                    height: '6%',
                    background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.4) 0%, transparent 75%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 0.25 ? 0.7 : 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            />

            {/* Hotspot 5: Job 2 Company (Yellow/Green) */}
            <motion.div
                className="absolute rounded-full blur-xl"
                style={{
                    top: '52%',
                    left: '3%',
                    width: '50%',
                    height: '9%',
                    background: 'radial-gradient(ellipse at 20% 50%, rgba(251, 191, 36, 0.35) 0%, rgba(34, 197, 94, 0.12) 55%, transparent 85%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 0.45 ? 0.7 : 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
            />

            {/* Hotspot 6: Job 2 Dates (Yellow faint) */}
            <motion.div
                className="absolute rounded-full blur-lg"
                style={{
                    top: '53%',
                    right: '4%',
                    width: '22%',
                    height: '5%',
                    background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.28) 0%, transparent 70%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 0.5 ? 0.55 : 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
            />

            {/* Hotspot 7: Education (Green/Blue - cool) */}
            <motion.div
                className="absolute rounded-full blur-lg"
                style={{
                    top: '80%',
                    left: '3%',
                    width: '35%',
                    height: '8%',
                    background: 'radial-gradient(ellipse at 25% 50%, rgba(34, 197, 94, 0.2) 0%, rgba(59, 130, 246, 0.06) 60%, transparent 90%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 0.75 ? 0.5 : 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
            />

            {/* Left margin "stem" - continuous attention along left edge */}
            <motion.div
                className="absolute blur-md"
                style={{
                    top: '18%',
                    left: '0%',
                    width: '4%',
                    height: '70%',
                    background: 'linear-gradient(180deg, rgba(249, 115, 22, 0.18) 0%, rgba(251, 191, 36, 0.12) 35%, rgba(34, 197, 94, 0.08) 65%, rgba(59, 130, 246, 0.04) 100%)',
                    transformOrigin: 'top center',
                }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: progress > 0.15 ? 1 : 0, scaleY: progress > 0.15 ? 1 : 0 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
            />
        </div>
    );
}
