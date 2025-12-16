"use client";

import { motion } from "framer-motion";

export function ScanPattern() {
    return (
    return (
        <div className="relative w-full max-w-[400px] aspect-[1/1.4] bg-neutral-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden mx-auto my-8">
            {/* Resume Skeleton (Background) */}
            <div className="p-6 space-y-4 opacity-40 grayscale blur-[0.5px]">
                {/* Header */}
                <div className="space-y-2">
                    <div className="h-6 w-1/2 bg-white/20 rounded-sm" />
                    <div className="h-3 w-1/3 bg-white/10 rounded-sm" />
                </div>
                <div className="h-px w-full bg-white/5 my-4" />
                {/* Exp 1 */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-4 w-1/3 bg-white/10 rounded-sm" />
                        <div className="h-3 w-16 bg-white/5 rounded-sm" />
                    </div>
                    <div className="space-y-1">
                        <div className="h-2 w-full bg-white/5 rounded-sm" />
                        <div className="h-2 w-full bg-white/5 rounded-sm" />
                        <div className="h-2 w-3/4 bg-white/5 rounded-sm" />
                    </div>
                </div>
                {/* Exp 2 */}
                <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                        <div className="h-4 w-1/3 bg-white/10 rounded-sm" />
                        <div className="h-3 w-16 bg-white/5 rounded-sm" />
                    </div>
                    <div className="space-y-1">
                        <div className="h-2 w-full bg-white/5 rounded-sm" />
                        <div className="h-2 w-1/2 bg-white/5 rounded-sm" />
                    </div>
                </div>
                {/* Exp 3 (Added to fill space) */}
                <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                        <div className="h-4 w-1/3 bg-white/10 rounded-sm" />
                        <div className="h-3 w-16 bg-white/5 rounded-sm" />
                    </div>
                    <div className="space-y-1">
                        <div className="h-2 w-full bg-white/5 rounded-sm" />
                        <div className="h-2 w-3/4 bg-white/5 rounded-sm" />
                    </div>
                </div>
                {/* Education */}
                <div className="space-y-2 pt-6">
                    <div className="h-4 w-1/4 bg-white/10 rounded-sm" />
                    <div className="h-3 w-1/3 bg-white/5 rounded-sm" />
                </div>
                {/* Skills / Footer (Added to reach true bottom) */}
                <div className="space-y-2 pt-6 pb-4">
                    <div className="h-4 w-1/5 bg-white/10 rounded-sm" />
                    <div className="h-2 w-full bg-white/5 rounded-sm" />
                    <div className="h-2 w-4/5 bg-white/5 rounded-sm" />
                </div>
            </div>

            {/* F-Pattern Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-gold" style={{ strokeWidth: 3, fill: "none", strokeLinecap: "round", strokeLinejoin: "round", filter: "drop-shadow(0 0 8px rgba(245, 178, 92, 0.5))" }}>
                {/* 
                   Path Explained:
                   1. Top Bar: 24,35 -> 200,35
                   2. Return: -> 24,100
                   3. Middle Bar: -> 150,100
                   4. Vertical Stem: -> 24,540 (The FULL length of the page)
                */}
                <motion.path
                    d="M 24 35 L 200 35 M 24 35 L 24 100 L 150 100 M 24 100 L 24 540"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.9 }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                />
            </svg>

            {/* Gaze Dot */}
            <motion.div
                className="absolute top-0 left-0 w-4 h-4 bg-gold rounded-full shadow-[0_0_15px_rgba(245,178,92,0.8)] z-10 border border-white/20"
                initial={{ offsetDistance: "0%", opacity: 0 }}
                whileInView={{ offsetDistance: "100%", opacity: 1 }}
                style={{ offsetPath: 'path("M 24 35 L 200 35 M 24 35 L 24 100 L 150 100 M 24 100 L 24 540")' }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
            />

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur border border-white/10 rounded px-3 py-1.5 shadow-xl">
                <span className="text-[10px] font-mono font-medium text-gold uppercase tracking-wider">
                    F-Pattern Scan
                </span>
            </div>
        </div>
    );
}
