"use client";

import { useEffect, useState } from "react";
import { Scan, Brain, Ruler, Search } from "lucide-react";
import { InsightSparkleIcon, SixSecondIcon } from "@/components/icons";

const ANALYSIS_STEPS = [
    { text: "Scanning for impact verbs & ROI...", icon: Search },
    { text: "Measuring narrative clarity...", icon: Ruler },
    { text: "Checking pattern alignment...", icon: Scan },
    { text: "Analyzing visual hierarchy...", icon: Brain },
    { text: "Detecting passive voice...", icon: Search },
    { text: "Identifying hidden wins...", icon: InsightSparkleIcon },
    { text: "Formatting recruiter read...", icon: Brain },
    { text: "Wrapping up your feedback...", icon: Scan, isFinal: true },
];

// Witty end-stage messages for personality
const FINAL_STAGE_MESSAGES = [
    "Almost there...",
    "Polishing the advice...",
    "Double-checking the brutal honesty...",
    "Making sure we didn't miss any gems...",
    "Brewing some hot takes...",
    "Adding the finishing touches...",
    "Worth the wait, we promise...",
    "Just a few more seconds...",
];

export default function AnalysisScanning() {
    const [stepIndex, setStepIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [finalMessageIndex, setFinalMessageIndex] = useState(0);

    useEffect(() => {
        // Cycle through heuristics, but stop on final step
        const stepInterval = setInterval(() => {
            setStepIndex((prev) => {
                // If we've reached the final step, stay there
                if (prev >= ANALYSIS_STEPS.length - 1) return prev;
                return prev + 1;
            });
        }, 2000);

        // Eased progress bar (slows at end for perceived thoroughness)
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return prev;
                const increment = Math.max(0.3, (95 - prev) / 50);
                return prev + increment;
            });
        }, 80);

        return () => {
            clearInterval(stepInterval);
            clearInterval(progressInterval);
        };
    }, []);

    // Cycle through final stage messages when we're at the final step
    useEffect(() => {
        if (stepIndex < ANALYSIS_STEPS.length - 1) return;

        const finalInterval = setInterval(() => {
            setFinalMessageIndex((prev) => (prev + 1) % FINAL_STAGE_MESSAGES.length);
        }, 2500);

        return () => clearInterval(finalInterval);
    }, [stepIndex]);

    const currentStep = ANALYSIS_STEPS[stepIndex];
    const CurrentIcon = currentStep.icon;

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in duration-500">
            {/* Visual Scanner - Refined with V2.1 tokens */}
            <div className="relative w-28 h-28 mb-10">
                {/* Subtle pulse rings - brand color */}
                <div
                    className="absolute inset-0 border border-brand/30 rounded-full animate-ping"
                    style={{ animationDuration: '2.5s' }}
                />
                <div
                    className="absolute inset-3 border border-brand/20 rounded-full animate-ping"
                    style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
                />

                {/* Center Icon Container - clean, no glow */}
                <div className="absolute inset-0 flex items-center justify-center bg-card rounded-full border border-border z-10">
                    <CurrentIcon
                        className="w-10 h-10 text-brand transition-all duration-300"
                        strokeWidth={1.5}
                    />
                </div>

                {/* Rotating accent arc */}
                <svg
                    className="absolute inset-[-8px] w-[calc(100%+16px)] h-[calc(100%+16px)] animate-spin z-0"
                    style={{ animationDuration: '4s', animationTimingFunction: 'linear' }}
                >
                    <circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="40 200"
                        className="text-brand/40"
                    />
                </svg>
            </div>

            {/* Heuristic Text - refined typography */}
            <div className="flex flex-col items-center text-center h-16">
                <div
                    key={stepIndex}
                    className="animate-in slide-in-from-bottom-2 fade-in duration-300"
                >
                    <p className="text-base font-medium text-foreground mb-1 font-display tracking-tight">
                        {ANALYSIS_STEPS[stepIndex].text}
                    </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {currentStep.isFinal
                        ? FINAL_STAGE_MESSAGES[finalMessageIndex]
                        : `Analyzing pattern ${stepIndex + 1} of ${ANALYSIS_STEPS.length - 1}`}
                </p>
            </div>

            {/* Progress Bar - minimal, brand colored */}
            <div className="w-56 h-1 bg-secondary rounded-full mt-10 overflow-hidden">
                <div
                    className="h-full bg-brand rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Subtle reassurance with time estimate */}
            <p className="text-[11px] text-muted-foreground/60 mt-4 flex items-center gap-1.5">
                <SixSecondIcon className="w-3.5 h-3.5" />
                Usually takes 20-30 seconds
            </p>
        </div>
    );
}
