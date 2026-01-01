"use client";

import { motion } from "framer-motion";

export function ResumeHeatmap() {
    return (
        <figure className="w-full max-w-[420px] mx-auto my-12 group select-none">
            <div className="relative w-full aspect-[1/1.4] bg-white dark:bg-card border border-border/40 rounded-xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 hover:shadow-xl">

                {/* Premium Resume Skeleton (Matching ScanPattern) */}
                <div className="absolute inset-0 p-8 space-y-6 opacity-60">
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
                    <div className="space-y-3 pt-4">
                        <div className="flex justify-between items-start">
                            <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800/80 rounded-sm" />
                            <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800/50 rounded-sm" />
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="h-2.5 w-[88%] bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
                            <div className="h-2.5 w-[75%] bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
                        </div>
                    </div>

                    {/* Experience Block 3 */}
                    <div className="space-y-3 pt-4">
                        <div className="flex justify-between items-start">
                            <div className="h-5 w-1/4 bg-slate-200 dark:bg-slate-800/80 rounded-sm" />
                            <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800/50 rounded-sm" />
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
                            <div className="h-2.5 w-[65%] bg-slate-100 dark:bg-slate-800/40 rounded-sm" />
                        </div>
                    </div>
                </div>

                {/* Heatmap Layer */}
                <div className="absolute inset-0 mix-blend-multiply dark:mix-blend-screen opacity-90 pointer-events-none">

                    {/* Hotspot 1: Name/Title (Intense Focus) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute top-6 left-6 w-64 h-32 rounded-[100%] blur-3xl bg-[radial-gradient(circle,rgba(225,29,72,0.8)_0%,rgba(245,158,11,0.5)_40%,transparent_70%)]"
                    />

                    {/* Hotspot 2: Recent Role (Strong Focus) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                        className="absolute top-48 left-6 w-56 h-24 rounded-[100%] blur-2xl bg-[radial-gradient(circle,rgba(245,158,11,0.7)_0%,rgba(13,148,136,0.4)_50%,transparent_70%)]"
                    />

                    {/* Hotspot 3: Scattered Scanning (Lower Focus) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 2, delay: 0.8 }}
                        className="absolute top-72 left-8 w-48 h-20 rounded-[100%] blur-2xl bg-[radial-gradient(circle,rgba(13,148,136,0.4)_0%,transparent_70%)]"
                    />

                    {/* Hotspot 4: Skills (Quick Check) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                        className="absolute bottom-12 left-6 w-64 h-16 rounded-[100%] blur-xl bg-[radial-gradient(circle,rgba(13,148,136,0.3)_0%,transparent_60%)]"
                    />
                </div>

                {/* Legend/Label */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-rose-500/20 rounded-full px-3 py-1 shadow-sm flex items-center gap-2 z-10">
                    <div className="flex space-x-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-mono font-medium text-rose-600 uppercase tracking-wider">
                        Heatmap
                    </span>
                </div>

            </div>

            <figcaption className="mt-4 text-center space-y-1">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">Fig. 2 — Attention Density</span>
                <span className="block text-sm text-foreground/80 font-medium">Aggregated Recruiter Fixation Points</span>
            </figcaption>
        </figure>
    );
}
