"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Split Screen Reveal
 * - Left: "What you see" (clean resume)
 * - Right: "What recruiters see" (with problems highlighted)
 * - Scroll-triggered reveal of recruiter perspective
 */

function SplitResumePreview() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const revealProgress = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
    const [reveal, setReveal] = useState(0);

    useEffect(() => {
        return revealProgress.on("change", (v) => setReveal(v));
    }, [revealProgress]);

    const resumeLines = [
        { text: "Software Engineer", type: "title", problem: "Too generic" },
        { text: "5 years experience", type: "normal", problem: null },
        { text: "Worked on various projects", type: "weak", problem: "No impact" },
        { text: "Team player", type: "weak", problem: "Means nothing" },
        { text: "Led migration to microservices", type: "strong", problem: null },
        { text: "Responsible for code reviews", type: "weak", problem: "So what?" },
        { text: "Reduced deploy time by 80%", type: "strong", problem: null },
        { text: "Proficient in many languages", type: "weak", problem: "Which ones?" },
    ];

    return (
        <div ref={containerRef} className="relative min-h-[600px]">
            <div className="grid md:grid-cols-2 gap-0 h-full">
                {/* Left: What you see */}
                <div className="bg-white p-8 md:p-12 flex flex-col justify-center border-r border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Eye className="w-4 h-4" />
                        <span className="uppercase tracking-wider font-medium">What you see</span>
                    </div>

                    <div className="space-y-3">
                        {resumeLines.map((line, i) => (
                            <motion.div
                                key={i}
                                className={`p-3 rounded-lg border ${line.type === "title"
                                        ? "bg-gray-100 border-gray-200 font-semibold text-lg"
                                        : "bg-gray-50 border-gray-100"
                                    }`}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                {line.text}
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 text-sm text-gray-500">
                        Looks fine, right?
                    </div>
                </div>

                {/* Right: What recruiters see */}
                <div className="bg-gray-900 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                    {/* Scan line animation */}
                    <motion.div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
                        style={{
                            top: `${reveal * 100}%`,
                            opacity: reveal > 0 && reveal < 1 ? 1 : 0,
                        }}
                    />

                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <EyeOff className="w-4 h-4" />
                        <span className="uppercase tracking-wider font-medium">What recruiters see</span>
                    </div>

                    <div className="space-y-3">
                        {resumeLines.map((line, i) => {
                            const lineProgress = Math.max(0, Math.min(1, (reveal * resumeLines.length - i) / 1.5));
                            const isRevealed = lineProgress > 0;
                            const isWeak = line.type === "weak";
                            const isStrong = line.type === "strong";

                            return (
                                <motion.div
                                    key={i}
                                    className={`p-3 rounded-lg border relative ${line.type === "title"
                                            ? "bg-gray-800 border-gray-700 font-semibold text-lg text-white"
                                            : isRevealed && isWeak
                                                ? "bg-red-950/50 border-red-800/50 text-red-200"
                                                : isRevealed && isStrong
                                                    ? "bg-green-950/50 border-green-800/50 text-green-200"
                                                    : "bg-gray-800 border-gray-700 text-gray-300"
                                        }`}
                                    style={{ opacity: 0.5 + lineProgress * 0.5 }}
                                >
                                    <span className={isRevealed && isWeak ? "line-through opacity-60" : ""}>
                                        {line.text}
                                    </span>

                                    {/* Problem annotation */}
                                    {isRevealed && line.problem && (
                                        <motion.span
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-red-500 text-white font-medium"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            {line.problem}
                                        </motion.span>
                                    )}

                                    {/* Strong annotation */}
                                    {isRevealed && isStrong && (
                                        <motion.span
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-green-500 text-white font-medium"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            ✓ Great
                                        </motion.span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {reveal >= 0.9 && (
                        <motion.div
                            className="mt-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="text-red-200 text-sm font-medium">Verdict: 4 weak lines detected</div>
                            <div className="text-red-300/70 text-xs mt-1">This resume needs work.</div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const increment = end / 60;
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [isInView, end]);

    return <span ref={ref}>{count}{suffix}</span>;
}

export function LandingSplitReveal() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-7 h-7 text-gray-900" />
                        <span className="font-bold text-lg">RIYP</span>
                    </div>
                    <button className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 mb-8">
                            <Sparkles className="w-4 h-4" />
                            See what recruiters really see
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                            Two views.<br />
                            <span className="text-gray-400">Same resume.</span>
                        </h1>

                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                            Scroll down to reveal what a recruiter sees when they scan your resume in 7.4 seconds.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <button className="group flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                                Analyze My Resume
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Split Screen Demo */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-6 mb-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Scroll to reveal the recruiter's view →
                    </h2>
                    <p className="text-gray-500">Watch as problems emerge that you never noticed</p>
                </div>
                <SplitResumePreview />
            </section>

            {/* Stats */}
            <section className="px-6 py-24 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {[
                            { value: 7, suffix: "s", label: "Average resume scan time" },
                            { value: 75, suffix: "%", label: "Rejected in that window" },
                            { value: 3, suffix: "x", label: "More callbacks after fixing" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-gray-600">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Ready to see what they see?
                    </h2>
                    <p className="text-gray-600 text-lg mb-10">
                        Free analysis. 60 seconds. No signup.
                    </p>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 bg-gray-900 text-white font-semibold text-lg rounded-lg hover:bg-gray-800 transition-colors">
                        Get Your Verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div>Private · Secure · Not used to train public models</div>
                </div>
            </footer>
        </div>
    );
}
