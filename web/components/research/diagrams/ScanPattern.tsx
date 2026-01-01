"use client";

import { motion } from "framer-motion";

export function ScanPattern() {
    // Saccade path: More realistic eye movement with slight vertical adjustments
    // The "F" pattern: Top horizontal, lower horizontal, then vertical scan down left
    const pathSegments = [
        "M 40 50 L 280 50",   // Top scan
        "M 40 50 L 40 120",   // Down left
        "M 40 120 L 220 120", // Second horizontal scan
        "M 40 120 L 40 500"   // Vertical scan down the side
    ];

    // Combined for the trail
    const fullPath = "M 40 50 L 280 50 L 40 50 L 40 120 L 220 120 L 40 120 L 40 500";

    return (
        <figure className="w-full max-w-[420px] mx-auto my-12 group select-none">
            <div className="relative w-full aspect-[1/1.4] bg-white dark:bg-card border border-border/40 rounded-xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 hover:shadow-xl">

                {/* Premium Resume Skeleton */}
                <div className="absolute inset-0 p-8 space-y-6 opacity-80">
                    {/* Header */}
                    <div className="space-y-3 mb-8">
                        <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800/80 rounded-md" />
                        <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800/50 rounded-md" />
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

                    {/* Experience Block 1 */}
                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-start">
                            <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800/80 rounded-sm" />
                            <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800/50 rounded-sm" />
                        </div>
                        <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800/50 rounded-sm" />
                        <div className="space-y-2 pt-2">
                            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
                            <div className="h-2.5 w-[92%] bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
                            <div className="h-2.5 w-[98%] bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
                        </div>
                    </div>

                    {/* Experience Block 2 */}
                    <div className="space-y-3 pt-4 opacity-90">
                        <div className="flex justify-between items-start">
                            <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800/80 rounded-sm hover:ring-2 hover:ring-indigo-500/10 transition-all" />
                            <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800/50 rounded-sm" />
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="h-2.5 w-[88%] bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
                            <div className="h-2.5 w-[75%] bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
                        </div>
                    </div>

                    {/* Experience Block 3 */}
                    <div className="space-y-3 pt-4 opacity-75">
                        <div className="flex justify-between items-start">
                            <div className="h-5 w-1/4 bg-slate-200 dark:bg-slate-800/80 rounded-sm" />
                            <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800/50 rounded-sm" />
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
                            <div className="h-2.5 w-[65%] bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="pt-6 opacity-60">
                        <div className="h-4 w-1/6 bg-slate-200 dark:bg-slate-800/80 rounded-sm mb-3" />
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-6 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-md" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* SVG Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 420 588" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="1" />
                            <stop offset="100%" stopColor="hsl(var(--premium))" stopOpacity="0.8" />
                        </linearGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* The Path Trace */}
                    <motion.path
                        d={fullPath}
                        stroke="url(#scanGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        filter="url(#glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                        viewport={{ once: true }}
                    />
                </svg>

                {/* The "Eye" Tracker Dot */}
                <motion.div
                    className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full z-20 flex items-center justify-center"
                    style={{
                        offsetPath: `path("${fullPath}")`,
                    }}
                    initial={{ offsetDistance: "0%", opacity: 0, scale: 0 }}
                    whileInView={{
                        offsetDistance: "100%",
                        opacity: [0, 1, 1, 1, 0],
                        scale: [0.5, 1, 1, 1, 0.5]
                    }}
                    transition={{
                        duration: 2.5,
                        ease: "easeInOut",
                        delay: 0.5,
                        times: [0, 0.1, 0.8, 0.95, 1]
                    }}
                    viewport={{ once: true }}
                >
                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(13,148,136,0.8)] z-20" />
                    <div className="absolute w-full h-full bg-brand/30 rounded-full animate-ping" />
                </motion.div>

                {/* Meta Labels */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-brand/20 rounded-full px-3 py-1 shadow-sm flex items-center gap-2 z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    <span className="text-[10px] font-mono font-medium text-brand uppercase tracking-wider">
                        Eye Tracking
                    </span>
                </div>
            </div>

            <figcaption className="mt-4 text-center space-y-1">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">Fig. 1 — Gaze Plot</span>
                <span className="block text-sm text-foreground/80 font-medium">Typical &apos;F-Pattern&apos; Scanning Behavior</span>
            </figcaption>
        </figure>
    );
}
