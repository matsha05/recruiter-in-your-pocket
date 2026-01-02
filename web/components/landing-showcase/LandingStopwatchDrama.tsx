"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Stopwatch Drama
 * - Animated 7.4 second countdown that shows what happens in each second
 * - Visual storytelling of the recruiter's thought process
 * - Dramatic reveal of the verdict
 */

function AnimatedStopwatch() {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [hasCompleted, setHasCompleted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView && !isRunning && !hasCompleted) {
            setIsRunning(true);
        }
    }, [isInView, isRunning, hasCompleted]);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            setTime((prev) => {
                if (prev >= 7.4) {
                    setIsRunning(false);
                    setHasCompleted(true);
                    clearInterval(interval);
                    return 7.4;
                }
                return Math.min(prev + 0.1, 7.4);
            });
        }, 100);
        return () => clearInterval(interval);
    }, [isRunning]);

    const stages = [
        { time: 0, label: "Glance at name", icon: Eye },
        { time: 1.5, label: "Scan job title", icon: Eye },
        { time: 3, label: "Check company", icon: Eye },
        { time: 4.5, label: "Skim bullets", icon: Eye },
        { time: 6, label: "Look for red flags", icon: AlertTriangle },
        { time: 7.4, label: "DECISION MADE", icon: hasCompleted ? CheckCircle : Clock },
    ];

    const currentStage = stages.filter((s) => time >= s.time).pop();

    return (
        <div ref={ref} className="relative">
            {/* Stopwatch Circle */}
            <div className="relative w-64 h-64 mx-auto mb-8">
                {/* Background circle */}
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                    />
                    <motion.circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-orange-500"
                        strokeLinecap="round"
                        strokeDasharray={753.98}
                        initial={{ strokeDashoffset: 753.98 }}
                        animate={{ strokeDashoffset: 753.98 - (time / 7.4) * 753.98 }}
                        transition={{ duration: 0.1, ease: "linear" }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        className="font-mono text-5xl font-bold text-gray-900"
                        key={time.toFixed(1)}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.1 }}
                    >
                        {time.toFixed(1)}s
                    </motion.div>
                    <div className="text-sm text-gray-500 mt-1">of 7.4 seconds</div>
                </div>
            </div>

            {/* Current action */}
            <AnimatePresence mode="wait">
                {currentStage && (
                    <motion.div
                        key={currentStage.label}
                        className="flex items-center justify-center gap-3 text-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <currentStage.icon className={`w-5 h-5 ${hasCompleted ? "text-orange-500" : "text-gray-600"}`} />
                        <span className={hasCompleted ? "font-bold text-orange-600" : "text-gray-700"}>
                            {currentStage.label}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Verdict reveal */}
            <AnimatePresence>
                {hasCompleted && (
                    <motion.div
                        className="mt-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-xl"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-center">
                            <div className="text-sm uppercase tracking-wider text-orange-600 font-medium mb-2">
                                The Verdict Is In
                            </div>
                            <div className="text-lg text-gray-800">
                                In 7.4 seconds, your fate was decided.
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                Were you ready for it?
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ResumeIllustration() {
    return (
        <motion.div
            className="relative w-full max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            {/* Resume paper */}
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-8 aspect-[8.5/11]">
                {/* Header skeleton */}
                <div className="space-y-2 mb-6">
                    <motion.div
                        className="h-6 bg-gray-900 rounded w-48"
                        initial={{ width: 0 }}
                        whileInView={{ width: 192 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    />
                    <motion.div
                        className="h-3 bg-gray-300 rounded w-32"
                        initial={{ width: 0 }}
                        whileInView={{ width: 128 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    />
                </div>

                {/* Section */}
                <div className="space-y-3 mb-6">
                    <motion.div
                        className="h-4 bg-orange-500 rounded w-24"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                    />
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            className="h-2 bg-gray-200 rounded"
                            style={{ width: `${90 - i * 10}%` }}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                        />
                    ))}
                </div>

                {/* Another section */}
                <div className="space-y-3">
                    <motion.div
                        className="h-4 bg-orange-500 rounded w-28"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.9 }}
                    />
                    {[1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            className="h-2 bg-gray-200 rounded"
                            style={{ width: `${95 - i * 8}%` }}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1 + i * 0.1 }}
                        />
                    ))}
                </div>
            </div>

            {/* Floating annotations */}
            <motion.div
                className="absolute -right-4 top-8 bg-red-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.5 }}
            >
                Too generic?
            </motion.div>
            <motion.div
                className="absolute -left-4 top-1/3 bg-amber-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.7 }}
            >
                Missing impact
            </motion.div>
            <motion.div
                className="absolute -right-4 bottom-1/3 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.9 }}
            >
                Strong section!
            </motion.div>
        </motion.div>
    );
}

export function LandingStopwatchDrama() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-7 h-7 text-orange-600" />
                        <span className="font-bold text-lg">RIYP</span>
                    </div>
                    <button className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-full hover:bg-orange-700 transition-colors">
                        Get Your Verdict
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-gray-900">
                            Your resume has<br />
                            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                7.4 seconds
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                            That's not a metaphor. That's how long recruiters actually spend before deciding your fate.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Animated Stopwatch Section */}
            <section className="px-6 py-16">
                <div className="max-w-2xl mx-auto">
                    <AnimatedStopwatch />
                </div>
            </section>

            {/* Resume Illustration Section */}
            <section className="px-6 py-24 bg-gray-100">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <motion.h2
                                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                What are they <em>really</em> seeing?
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-600 mb-8 leading-relaxed"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                You've read your resume a hundred times. But you've never seen it through their eyes -
                                scanning for signals, spotting red flags, looking for reasons to say no.
                            </motion.p>
                            <motion.div
                                className="space-y-4"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                {[
                                    "The brutal 7-second first impression",
                                    "The critical miss you can't see",
                                    "Exact text to fix it",
                                ].map((item, i) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                        <ResumeIllustration />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            Stop wondering. Start knowing.
                        </h2>
                        <p className="text-gray-600 text-lg mb-10">
                            Free. 60 seconds. No signup required.
                        </p>
                        <button className="group inline-flex items-center gap-2 px-10 py-5 bg-orange-600 text-white font-semibold text-lg rounded-full hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/25">
                            Get Your Verdict
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-orange-500" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div>Encrypted · Private · Deleted after 24h</div>
                </div>
            </footer>
        </div>
    );
}
