"use client";

import { motion } from "framer-motion";

/**
 * ScanPattern - F-Pattern Eye-Tracking Visualization
 * 
 * Design rationale from first principles:
 * - The F-pattern shows how recruiters scan resumes in 7.4 seconds
 * - Top horizontal bar: Eyes scan across the NAME and contact info
 * - Second horizontal bar: Eyes scan the FIRST JOB title and dates
 * - Third (shorter) bar: Brief scan of SECOND JOB
 * - Vertical stem: Eyes skim down the LEFT MARGIN (job titles, companies)
 * 
 * Visual approach:
 * - Clean heatmap showing the F-shape across the FULL page
 * - Single animated gaze dot tracing the path (simulating eye movement)
 * - NO cluttered arrows or numbered waypoints
 * - Premium, research-accurate visualization
 */

export function ScanPattern() {
    // The F-pattern path for the gaze dot animation
    // Traces: top-left → top-right → drop to job 1 → scan right → drop to job 2 → scan right (shorter) → down the stem
    const gazePath = `
        M 10 8
        L 90 8
        L 10 8
        L 10 25
        L 70 25
        L 10 25
        L 10 42
        L 45 42
        L 10 42
        L 10 92
    `;

    return (
        <div className="relative w-full max-w-[420px] aspect-[1/1.35] bg-card border border-border/20 rounded-md overflow-hidden mx-auto my-8 shadow-sm">

            {/* Resume Skeleton - Positioned for realistic F-pattern */}
            <div className="absolute inset-0 p-5 space-y-3">
                {/* Header Row - Top bar of F scans here */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                        <div className="h-5 w-32 bg-foreground/15 rounded-sm" /> {/* Name */}
                        <div className="h-2.5 w-24 bg-foreground/8 rounded-sm" /> {/* Title */}
                    </div>
                    <div className="space-y-1 text-right">
                        <div className="h-2 w-20 bg-foreground/6 rounded-sm" /> {/* Email */}
                        <div className="h-2 w-16 bg-foreground/6 rounded-sm" /> {/* Phone */}
                    </div>
                </div>

                <div className="h-px w-full bg-border/30 my-2" />

                {/* Experience 1 - Second bar of F scans here */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <div className="h-3.5 w-28 bg-foreground/12 rounded-sm" /> {/* Job Title */}
                        <div className="h-2 w-14 bg-foreground/6 rounded-sm" />    {/* Date */}
                    </div>
                    <div className="h-2.5 w-20 bg-foreground/8 rounded-sm" />     {/* Company */}
                    <div className="space-y-1 pt-1">
                        <div className="h-1.5 w-full bg-foreground/4 rounded-sm" />
                        <div className="h-1.5 w-[92%] bg-foreground/4 rounded-sm" />
                        <div className="h-1.5 w-[85%] bg-foreground/4 rounded-sm" />
                    </div>
                </div>

                {/* Experience 2 - Third (shorter) bar of F */}
                <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center">
                        <div className="h-3.5 w-24 bg-foreground/10 rounded-sm" />
                        <div className="h-2 w-14 bg-foreground/6 rounded-sm" />
                    </div>
                    <div className="h-2.5 w-18 bg-foreground/6 rounded-sm" />
                    <div className="space-y-1 pt-1">
                        <div className="h-1.5 w-full bg-foreground/4 rounded-sm" />
                        <div className="h-1.5 w-[78%] bg-foreground/4 rounded-sm" />
                    </div>
                </div>

                {/* Experience 3 - Stem of F (left margin only) */}
                <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center">
                        <div className="h-3.5 w-26 bg-foreground/10 rounded-sm" />
                        <div className="h-2 w-14 bg-foreground/6 rounded-sm" />
                    </div>
                    <div className="space-y-1 pt-1">
                        <div className="h-1.5 w-full bg-foreground/4 rounded-sm" />
                        <div className="h-1.5 w-[82%] bg-foreground/4 rounded-sm" />
                    </div>
                </div>

                {/* Education */}
                <div className="space-y-1.5 pt-3">
                    <div className="h-3 w-20 bg-foreground/8 rounded-sm" />
                    <div className="h-2 w-32 bg-foreground/5 rounded-sm" />
                </div>

                {/* Skills */}
                <div className="space-y-1.5 pt-2">
                    <div className="h-3 w-14 bg-foreground/8 rounded-sm" />
                    <div className="flex flex-wrap gap-1.5">
                        <div className="h-3 w-10 bg-foreground/4 rounded-sm" />
                        <div className="h-3 w-8 bg-foreground/4 rounded-sm" />
                        <div className="h-3 w-12 bg-foreground/4 rounded-sm" />
                        <div className="h-3 w-9 bg-foreground/4 rounded-sm" />
                    </div>
                </div>
            </div>

            {/* F-PATTERN HEATMAP - The actual F shape */}
            <div className="absolute inset-0 pointer-events-none">
                {/* TOP HORIZONTAL BAR - Full width scan across name/header */}
                <motion.div
                    className="absolute left-4 right-4 h-14 rounded-sm blur-xl"
                    style={{
                        top: '16px',
                        background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.45) 0%, rgba(249, 115, 22, 0.3) 50%, rgba(251, 191, 36, 0.15) 100%)'
                    }}
                    initial={{ opacity: 0, scaleX: 0, transformOrigin: 'left' }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                />

                {/* SECOND HORIZONTAL BAR - First job scan (shorter than top) */}
                <motion.div
                    className="absolute left-4 h-10 rounded-sm blur-lg"
                    style={{
                        top: '80px',
                        width: '70%',
                        background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.4) 0%, rgba(251, 191, 36, 0.2) 60%, rgba(253, 224, 71, 0.08) 100%)'
                    }}
                    initial={{ opacity: 0, scaleX: 0, transformOrigin: 'left' }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true }}
                />

                {/* THIRD HORIZONTAL BAR - Second job scan (even shorter) */}
                <motion.div
                    className="absolute left-4 h-8 rounded-sm blur-lg"
                    style={{
                        top: '145px',
                        width: '45%',
                        background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.35) 0%, rgba(253, 224, 71, 0.15) 70%, transparent 100%)'
                    }}
                    initial={{ opacity: 0, scaleX: 0, transformOrigin: 'left' }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 1.3 }}
                    viewport={{ once: true }}
                />

                {/* VERTICAL STEM - Full height down left margin */}
                <motion.div
                    className="absolute left-3 w-10 rounded-sm blur-lg"
                    style={{
                        top: '60px',
                        bottom: '40px',
                        background: 'linear-gradient(180deg, rgba(249, 115, 22, 0.25) 0%, rgba(251, 191, 36, 0.18) 30%, rgba(34, 197, 94, 0.12) 60%, rgba(59, 130, 246, 0.06) 100%)'
                    }}
                    initial={{ opacity: 0, scaleY: 0, transformOrigin: 'top' }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 1, delay: 1.6 }}
                    viewport={{ once: true }}
                />
            </div>



            {/* Legend Badge */}
            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm border border-brand/20 rounded-sm px-3 py-1.5 shadow-sm z-10">
                <span className="text-[10px] font-mono font-semibold text-brand uppercase tracking-widest">
                    F-Pattern
                </span>
            </div>

            {/* Figure Caption */}
            <div className="absolute bottom-2 left-0 right-0 text-center z-10">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    Fig 1. Eye-Tracking Gaze Path
                </span>
            </div>
        </div>
    );
}
