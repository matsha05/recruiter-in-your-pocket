"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, Trash2, ArrowRight, Check, BookOpen, BarChart2, Target, TrendingUp, Quote, Shield } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Data-Driven Variation D: Warm Authority
 * 
 * Design Philosophy Alignment:
 * - Voice: Warm but direct ("Get Your Verdict" not "Get Your Analysis")
 * - Editorial Authority: Confident headlines, personality in copy
 * - Quiet Power: Research visuals, but human language
 */

function ProgressBar({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div ref={ref} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-mono text-slate-900">{value}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-teal-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: isInView ? `${value}%` : 0 }}
                    transition={{ duration: 0.35, delay, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

export function LandingDataDrivenD() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20">
            {/* Nav */}
            <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-teal-600" />
                        <span className="text-sm font-medium">RIYP</span>
                    </div>
                    <button className="text-sm font-medium px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-200">
                        Get Your Verdict
                    </button>
                </div>
            </nav>

            {/* Hero - Warm language, data visuals */}
            <section className="px-6 py-16 border-b border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                        >
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-slate-200 text-xs text-slate-500 mb-5">
                                <BookOpen className="w-3 h-3" />
                                Built on real hiring research
                            </div>

                            <h1 className="font-display text-3xl md:text-4xl font-normal tracking-tight leading-tight mb-5">
                                See what they see.<br />
                                <span className="text-teal-600">Then change it.</span>
                            </h1>

                            <p className="text-slate-600 leading-relaxed mb-6 max-w-lg">
                                Recruiters spend 7.4 seconds on your resume before deciding.
                                We'll show you exactly what they notice, what they miss, and how to fix it.
                            </p>

                            <div className="flex items-center gap-6 p-4 rounded-lg bg-slate-50 border border-slate-100 mb-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold font-mono text-teal-600">7.4s</div>
                                    <div className="text-[10px] text-slate-500">The window</div>
                                </div>
                                <div className="w-px h-10 bg-slate-200" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold font-mono text-slate-900">75%</div>
                                    <div className="text-[10px] text-slate-500">Rejected fast</div>
                                </div>
                                <div className="w-px h-10 bg-slate-200" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold font-mono text-slate-900">250+</div>
                                    <div className="text-[10px] text-slate-500">Your competition</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors duration-200">
                                    Get Your Verdict
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-slate-400">Free · 60 seconds · No signup</span>
                            </div>
                        </motion.div>

                        {/* Right: Score panel */}
                        <motion.div
                            className="p-6 rounded-lg border border-slate-200 bg-white shadow-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.1 }}
                        >
                            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-4">
                                Sample Verdict
                            </div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="text-sm text-slate-500 mb-1">Overall Score</div>
                                    <div className="text-4xl font-bold text-teal-600 font-mono">87</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400">Strong signals</div>
                                    <div className="text-sm font-medium text-slate-700">3 of 4</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <ProgressBar value={92} label="Your story comes through" delay={0.1} />
                                <ProgressBar value={78} label="Impact is quantified" delay={0.15} />
                                <ProgressBar value={85} label="Role level is clear" delay={0.2} />
                                <ProgressBar value={68} label="Easy to scan" delay={0.25} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* What we look at */}
            <section className="px-6 py-16 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl font-medium mb-2">What we look at</h2>
                    <p className="text-slate-500 mb-8">The same four things every recruiter notices first.</p>

                    <div className="grid md:grid-cols-4 gap-4">
                        {[
                            { icon: Target, title: "Your Story", desc: "Does your career narrative come through in seconds?" },
                            { icon: TrendingUp, title: "Your Impact", desc: "Are achievements quantified with outcomes?" },
                            { icon: BarChart2, title: "Your Level", desc: "Can they tell your seniority instantly?" },
                            { icon: BookOpen, title: "Your Layout", desc: "Is it easy to scan quickly?" },
                        ].map((signal, i) => (
                            <motion.div
                                key={signal.title}
                                className="p-4 rounded-lg border border-slate-200 bg-white"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05, duration: 0.2 }}
                            >
                                <signal.icon className="w-5 h-5 text-teal-600 mb-3" />
                                <h3 className="font-medium text-sm mb-1">{signal.title}</h3>
                                <p className="text-xs text-slate-500">{signal.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What you get */}
            <section className="px-6 py-16">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-xl font-medium mb-2">What you'll walk away with</h2>
                            <p className="text-slate-500 mb-6">Not vague advice. Specific, actionable fixes.</p>
                            <ul className="space-y-3">
                                {[
                                    "The 7-Second Verdict — how a recruiter actually sees you",
                                    "Your Critical Miss — the one thing holding you back",
                                    "Red Pen Rewrites — exact replacement text for weak bullets",
                                    "The Why Behind Each Score — with research citations",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-slate-600">
                                        <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6 rounded-lg border border-slate-100 bg-slate-50">
                            <Quote className="w-5 h-5 text-slate-300 mb-3" />
                            <p className="text-slate-700 mb-4 italic">
                                "I've reviewed thousands of resumes as a hiring manager. This tool catches what we actually look for."
                            </p>
                            <div className="text-sm">
                                <span className="font-medium text-slate-900">Marcus Williams</span>
                                <span className="text-slate-400"> · </span>
                                <span className="text-slate-500">VP Engineering, Series C</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-16 bg-teal-600 text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready for the truth?</h2>
                    <p className="text-teal-100 mb-8">Free. 60 seconds. No signup required.</p>
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-700 font-medium rounded hover:bg-teal-50 transition-colors duration-200">
                        Get Your Verdict
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-6 border-t border-slate-100">
                <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted</span>
                        <span className="flex items-center gap-1"><Trash2 className="w-3 h-3" /> Auto-deleted</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
