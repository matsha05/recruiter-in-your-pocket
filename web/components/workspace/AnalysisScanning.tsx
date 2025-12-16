"use client";

import { useEffect, useState, useRef } from "react";
import { Scan, Brain, Ruler, Search } from "lucide-react";
import { InsightSparkleIcon } from "@/components/icons";



const UNIVERSAL_HEURISTICS = [
    { text: "Scanning for impact verbs & ROI...", icon: Search },
    { text: "Measuring narrative clarity...", icon: Ruler },
    { text: "Checking pattern alignment...", icon: Scan },
    { text: "Analyzing visual hierarchy...", icon: Brain },
    { text: "Detecting passive voice...", icon: Search },
    { text: "Identifying hidden wins...", icon: InsightSparkleIcon },
    { text: "Formatting recruiter read...", icon: Brain },
];

export default function AnalysisScanning() {
    const [stepIndex, setStepIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Cycle through heuristics
        const stepInterval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % UNIVERSAL_HEURISTICS.length);
        }, 1800);

        // Simulated progress bar (slower at end)
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return prev;
                const increment = Math.max(0.5, (95 - prev) / 40);
                return prev + increment;
            });
        }, 100);

        return () => {
            clearInterval(stepInterval);
            clearInterval(progressInterval);
        };
    }, []);

    const CurrentIcon = UNIVERSAL_HEURISTICS[stepIndex].icon;

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in duration-500">
            {/* Visual Scanner */}
            <div className="relative w-24 h-24 mb-8">
                {/* Pulse rings */}
                <div className="absolute inset-0 border-2 border-[var(--brand)] rounded-full opacity-20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-2 border border-[var(--brand)] rounded-full opacity-40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s' }} />

                {/* Center Icon Container */}
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)] rounded-full border border-[var(--brand)] shadow-[0_0_30px_rgba(79,70,229,0.15)] z-10">
                    <CurrentIcon className="w-8 h-8 text-[var(--brand)] transition-all duration-300 animate-pulse" strokeWidth={1.5} />
                </div>

                {/* Rotating scanner line */}
                <div className="absolute inset-[-4px] rounded-full overflow-hidden z-0 opacity-40">
                    <div className="w-full h-1/2 bg-gradient-to-b from-transparent to-[var(--brand)] opacity-20 animate-spin origin-bottom" style={{ animationDuration: '3s', animationTimingFunction: 'linear' }} />
                </div>
            </div>

            {/* Heuristic Text */}
            <div className="flex flex-col items-center text-center h-[60px]">
                <div
                    key={stepIndex}
                    className="animate-in slide-in-from-bottom-2 fade-in duration-300"
                >
                    <p className="text-[15px] font-medium text-[var(--text-primary)] mb-1 font-display tracking-tight">
                        {UNIVERSAL_HEURISTICS[stepIndex].text}
                    </p>
                </div>
                <p className="text-[12px] text-[var(--text-muted)] mt-1">
                    Analyzing pattern {stepIndex + 1} of {UNIVERSAL_HEURISTICS.length}...
                </p>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-1 bg-[var(--bg-section-muted)] rounded-full mt-8 overflow-hidden">
                <div
                    className="h-full bg-[var(--brand)] rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
