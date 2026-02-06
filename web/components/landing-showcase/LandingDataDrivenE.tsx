"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, Trash2, ArrowRight, Check, BookOpen, Quote, Shield } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Data-Driven Variation E: Stacked Impact
 * 
 * Design Philosophy Alignment:
 * - Quiet Power: Vertical scroll with one signature moment per section
 * - Editorial Authority: Strong headlines, decisive copy
 * - Voice: Direct and warm ("your friend who's done thousands of interviews")
 * - No research-y tone, but keeps data credibility visually
 */

function StatBadge({ value, label }: { value: string; label: string }) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white">
            <span className="text-lg font-bold font-mono text-teal-600">{value}</span>
            <span className="text-xs text-slate-500">{label}</span>
        </div>
    );
}

export function LandingDataDrivenE() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20">
            {/* Nav */}
            <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-teal-600" />
                        <span className="text-sm font-medium">Recruiter in Your Pocket</span>
                    </div>
                    <button className="text-sm font-medium px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-200">
                        Get Your Verdict
                    </button>
                </div>
            </nav>

            {/* Hero - Stacked, bold */}
            <section className="px-6 py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        <h1 className="font-display text-4xl md:text-5xl font-normal tracking-tight leading-tight mb-6">
                            See what recruiters see.<br />
                            <span className="text-teal-600">Fix it before they do.</span>
                        </h1>

                        <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto">
                            You have 7.4 seconds. Most candidates never know what happens in that window.
                            We'll show you — and tell you exactly how to win it.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                            <StatBadge value="7.4s" label="to impress" />
                            <StatBadge value="75%" label="rejected fast" />
                            <StatBadge value="250+" label="your competition" />
                        </div>

                        <button className="inline-flex items-center gap-2 px-6 py-3 rounded bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors duration-200">
                            Get Your Verdict
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-slate-400 mt-3">Free · 60 seconds · No signup</p>
                    </motion.div>
                </div>
            </section>

            {/* The Problem */}
            <section className="px-6 py-16 bg-slate-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-medium mb-4 text-center">Here's what nobody tells you</h2>
                    <p className="text-slate-600 text-center mb-10 max-w-xl mx-auto">
                        You're not competing on qualifications. You're competing on how quickly your resume communicates value.
                    </p>
                    <div className="space-y-4">
                        {[
                            "Recruiters scan in an F-pattern — 80% of attention goes to the top third",
                            "Bullets without numbers are skipped. Literally skipped.",
                            "If they can't parse your level in 3 seconds, you're out",
                            "The 'skills' section? They spend 0.5 seconds there.",
                        ].map((item, i) => (
                            <motion.div
                                key={item}
                                className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white"
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05, duration: 0.2 }}
                            >
                                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {i + 1}
                                </div>
                                <span className="text-slate-700">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 text-center mt-6">
                        Based on eye-tracking research from Ladders (2018), NBER (2019), and Laszlo Bock
                    </p>
                </div>
            </section>

            {/* What you get */}
            <section className="px-6 py-16">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-medium mb-4 text-center">What you'll get in 60 seconds</h2>
                    <p className="text-slate-600 text-center mb-10">
                        Not generic tips. Specific fixes you can apply immediately.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: "The Verdict", desc: "How a recruiter actually sees you — in 7 seconds" },
                            { title: "The Critical Miss", desc: "The one thing that's holding you back" },
                            { title: "Red Pen Rewrites", desc: "Exact replacement text for your weakest bullets" },
                            { title: "4-Signal Score", desc: "Story, Impact, Clarity, Readability — ranked" },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                className="p-5 rounded-lg border border-slate-200"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05, duration: 0.2 }}
                            >
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium text-slate-900 mb-1">{item.title}</h3>
                                        <p className="text-sm text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            <section className="px-6 py-16 bg-slate-900 text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <Quote className="w-8 h-8 text-white/20 mx-auto mb-6" />
                    <p className="text-xl md:text-2xl leading-relaxed mb-6">
                        "The data-backed approach made me trust the recommendations. This isn't guesswork — it's exactly how I review resumes."
                    </p>
                    <div className="text-sm">
                        <span className="font-medium">Marcus Williams</span>
                        <span className="text-white/50"> · VP Engineering, Series C Startup</span>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-20">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-medium mb-4">Ready to see the truth?</h2>
                    <p className="text-slate-500 mb-8">
                        Your next application could be different.
                    </p>
                    <button className="inline-flex items-center gap-2 px-8 py-4 rounded bg-teal-600 text-white font-medium text-lg hover:bg-teal-700 transition-colors duration-200">
                        Get Your Verdict
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Encrypted</span>
                        <span className="flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete anytime</span>
                        <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Not used to train public models</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-6 border-t border-slate-100">
                <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4" />
                        <span>© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <div>Built on research from Google, Meta, and Stripe hiring teams</div>
                </div>
            </footer>
        </div>
    );
}
