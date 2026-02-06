"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, Trash2, ArrowRight, Check, BookOpen, BarChart2, Target, TrendingUp, Quote, Shield } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Data-Driven Variation B: Single Column Editorial
 * 
 * Design Philosophy Alignment:
 * - Editorial Authority: Magazine-style single column flow
 * - Quiet Power: Calm reading experience, one teal CTA
 * - Raycast Density: Well-spaced but not sparse
 * - Reference: Bear Notes, Medium article feel
 */

function ProgressBar({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div ref={ref} className="flex items-center gap-4">
            <span className="w-24 text-sm text-slate-600">{label}</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-teal-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: isInView ? `${value}%` : 0 }}
                    transition={{ duration: 0.35, delay, ease: "easeOut" }}
                />
            </div>
            <span className="w-12 text-right text-sm font-mono text-slate-900">{value}%</span>
        </div>
    );
}

export function LandingDataDrivenB() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20">
            {/* Nav */}
            <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
                <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-teal-600" />
                        <span className="text-sm font-medium">RIYP</span>
                    </div>
                    <button className="text-sm font-medium px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-200">
                        Analyze
                    </button>
                </div>
            </nav>

            {/* Article-style content */}
            <article className="max-w-2xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Based on 14 peer-reviewed studies</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-normal tracking-tight leading-tight mb-4">
                        Understand how you're actually being evaluated
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Recruiters spend an average of <strong>7.4 seconds</strong> on initial resume review.
                        We use eye-tracking research to show you exactly what they see — and miss.
                    </p>
                </header>

                {/* Key stats inline */}
                <section className="mb-12 p-6 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold font-mono text-teal-600">7.4s</div>
                            <div className="text-xs text-slate-500">Avg. review</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono text-slate-900">75%</div>
                            <div className="text-xs text-slate-500">Rejected &lt;10s</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono text-slate-900">250+</div>
                            <div className="text-xs text-slate-500">Apps/role</div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="mb-12">
                    <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors duration-200">
                        Get Your Free Analysis
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-3">60 seconds · No signup required</p>
                </section>

                {/* Methodology */}
                <section className="mb-12">
                    <h2 className="text-lg font-medium mb-4">The 6-Second Signal Model</h2>
                    <p className="text-slate-600 mb-6">
                        Our scoring is built on behavioral research from recruiting professionals, not generic AI pattern matching.
                    </p>
                    <div className="space-y-4">
                        <ProgressBar value={35} label="Story" delay={0} />
                        <ProgressBar value={30} label="Impact" delay={0.05} />
                        <ProgressBar value={20} label="Clarity" delay={0.1} />
                        <ProgressBar value={15} label="Readability" delay={0.15} />
                    </div>
                    <p className="text-xs text-slate-400 mt-4">
                        Signal weights based on Ladders (2018), NBER (2019), and Laszlo Bock research.
                    </p>
                </section>

                {/* What you get */}
                <section className="mb-12">
                    <h2 className="text-lg font-medium mb-4">What you'll receive</h2>
                    <ul className="space-y-3">
                        {[
                            "The 7-Second Verdict — how a recruiter actually sees you",
                            "Your Critical Miss — the one thing holding you back",
                            "Red Pen Rewrites — exact replacement text for weak lines",
                            "4-Dimension Score — with research citations",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-3 text-slate-600">
                                <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Testimonial */}
                <section className="mb-12 p-6 rounded-lg border border-slate-100">
                    <Quote className="w-5 h-5 text-slate-300 mb-3" />
                    <p className="text-slate-700 mb-4 italic">
                        "The data-backed approach made me trust the recommendations. This isn't guesswork."
                    </p>
                    <div className="text-sm">
                        <span className="font-medium text-slate-900">Dr. Sarah Chen</span>
                        <span className="text-slate-400"> · </span>
                        <span className="text-slate-500">Senior Data Scientist, prev. Meta</span>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="text-center p-8 rounded-lg bg-slate-50">
                    <h2 className="text-xl font-medium mb-2">Ready to see the truth?</h2>
                    <p className="text-slate-500 mb-6">Free. Research-backed. No signup.</p>
                    <button className="inline-flex items-center gap-2 px-6 py-3 rounded bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors duration-200">
                        Get Your Analysis
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </section>
            </article>

            {/* Footer */}
            <footer className="px-6 py-6 border-t border-slate-100">
                <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Lock className="w-3 h-3" /> Encrypted
                        <Trash2 className="w-3 h-3" /> Delete anytime
                    </div>
                </div>
            </footer>
        </div>
    );
}
