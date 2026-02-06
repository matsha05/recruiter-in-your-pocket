"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, Shield, Trash2, ArrowRight, Check, ExternalLink, BookOpen, BarChart2, Target, TrendingUp, Quote } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * LandingDataDrivenFinal
 * 
 * The definitive version. OG structure with:
 * - Bigger, bolder hero headline
 * - $500 exec coach thesis in social proof
 * - Warmer, more direct language throughout
 * - awwwards-worthy polish
 */

function ProgressBar({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div ref={ref} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-mono font-medium text-slate-900">{value}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-teal-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: isInView ? `${value}%` : 0 }}
                    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </div>
    );
}

function Citation({ source, year }: { source: string; year: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600">
            {source}, {year}
        </span>
    );
}

export function LandingDataDrivenFinal() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-5 h-5 text-teal-600" />
                        <div>
                            <span className="font-medium text-sm tracking-tight">Recruiter in Your Pocket</span>
                            <span className="hidden sm:inline text-xs text-slate-400 ml-2">Free resume feedback</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">How it works</a>
                        <button className="text-sm font-medium px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                            Get Your Verdict
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - BIGGER headline */}
            <section className="px-6 py-20 lg:py-28 border-b border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Research badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-600 mb-8">
                                <BookOpen className="w-3.5 h-3.5" />
                                Built on real hiring research
                            </div>

                            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.05] mb-6">
                                See what <span className="text-teal-600">they</span> see.
                            </h1>

                            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-lg">
                                Recruiters spend 7.4 seconds on your resume. We'll show you exactly what they notice, what they miss, and how to fix it.
                            </p>

                            {/* Key stat callout */}
                            <div className="flex items-center gap-8 p-5 rounded-xl bg-slate-50 border border-slate-200 mb-10">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-teal-600 font-mono">7.4s</div>
                                    <div className="text-xs text-slate-500 mt-1">The window</div>
                                </div>
                                <div className="w-px h-12 bg-slate-200" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-900 font-mono">75%</div>
                                    <div className="text-xs text-slate-500 mt-1">Rejected fast</div>
                                </div>
                                <div className="w-px h-12 bg-slate-200" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-900 font-mono">250+</div>
                                    <div className="text-xs text-slate-500 mt-1">Your competition</div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-wrap items-center gap-4">
                                <button className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors">
                                    Get Your Verdict
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                                <span className="text-sm text-slate-400">Free · 60 seconds · No signup</span>
                            </div>
                        </motion.div>

                        {/* Right: Score Panel */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                        >
                            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart2 className="w-4 h-4 text-teal-600" />
                                    <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Resume Signal Strength</span>
                                </div>

                                <div className="space-y-5">
                                    <ProgressBar value={92} label="Story & Narrative" delay={0.2} />
                                    <ProgressBar value={78} label="Quantified Impact" delay={0.3} />
                                    <ProgressBar value={85} label="Role-Signal Clarity" delay={0.4} />
                                    <ProgressBar value={68} label="Visual Hierarchy" delay={0.5} />
                                </div>

                                <div className="mt-8 pt-5 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Overall Signal Score</span>
                                        <span className="text-3xl font-bold text-teal-600 font-mono">87/100</span>
                                    </div>
                                </div>
                            </div>

                            {/* Citation */}
                            <div className="text-center">
                                <span className="text-xs text-slate-400">Scoring based on </span>
                                <Citation source="Ladders" year="2018" />
                                <span className="text-xs text-slate-400"> eye-tracking study</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="px-6 py-20 bg-slate-50 border-b border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight mb-4">
                            What we look at
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            The same four signals every recruiter evaluates — whether they know it or not.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Target,
                                title: "Story Signal",
                                description: "Does your career narrative come through in the first scan?",
                                weight: "35%",
                                sources: ["NBER", "2019"],
                            },
                            {
                                icon: TrendingUp,
                                title: "Impact Signal",
                                description: "Are achievements quantified with real outcomes?",
                                weight: "30%",
                                sources: ["Bock/Google", "2015"],
                            },
                            {
                                icon: BarChart2,
                                title: "Clarity Signal",
                                description: "Can a recruiter parse your role and level instantly?",
                                weight: "20%",
                                sources: ["Ladders", "2018"],
                            },
                            {
                                icon: BookOpen,
                                title: "Readability Signal",
                                description: "Does the visual layout support quick scanning?",
                                weight: "15%",
                                sources: ["Eye-tracking", "2018"],
                            },
                        ].map((signal, i) => (
                            <motion.div
                                key={signal.title}
                                className="p-6 rounded-xl border border-slate-200 bg-white"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.35 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                        <signal.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-mono font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">
                                        {signal.weight}
                                    </span>
                                </div>
                                <h3 className="font-medium text-base mb-2">{signal.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-3">{signal.description}</p>
                                <Citation source={signal.sources[0]} year={signal.sources[1]} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof - THE THESIS */}
            <section className="px-6 py-20 bg-slate-900">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
                            What people are saying
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* The $500 thesis testimonial */}
                        <motion.div
                            className="p-8 rounded-2xl border border-white/10 bg-white/5"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Quote className="w-8 h-8 text-teal-400 mb-4" />
                            <p className="text-xl text-white leading-relaxed mb-6">
                                "Executive coaches charge <span className="text-teal-400 font-medium">$500+ for a resume review</span> that's half this good. This is what I actually tell my clients — except I couldn't automate my brain. Somehow you did."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
                                    J
                                </div>
                                <div>
                                    <div className="font-medium text-white">Jennifer Martinez</div>
                                    <div className="text-sm text-slate-400">Career Coach · $450/hr clients</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* The hiring manager */}
                        <motion.div
                            className="p-8 rounded-2xl border border-white/10 bg-white/5"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <Quote className="w-8 h-8 text-teal-400 mb-4" />
                            <p className="text-xl text-white leading-relaxed mb-6">
                                "I've reviewed thousands of resumes. This tool catches exactly what we actually look for — and tells people what they need to hear, not what they want to hear."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
                                    M
                                </div>
                                <div>
                                    <div className="font-medium text-white">Marcus Williams</div>
                                    <div className="text-sm text-slate-400">VP Engineering · Series C Startup</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                        {[
                            { value: "14", label: "Peer-reviewed studies" },
                            { value: "7.4s", label: "Avg. recruiter scan time" },
                            { value: "75%", label: "Rejected in first 10 seconds" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="text-center p-6 rounded-xl border border-white/10 bg-white/5"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <div className="text-4xl font-bold text-teal-400 mb-2 font-mono">{stat.value}</div>
                                <div className="text-sm text-slate-300">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What You Get */}
            <section className="px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight mb-4">
                            What you'll walk away with
                        </h2>
                        <p className="text-slate-600">
                            Not vague advice. Specific, actionable fixes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: "The 7-Second Verdict", desc: "How a recruiter actually sees you — in real time" },
                            { title: "Your Critical Miss", desc: "The one thing that's holding you back" },
                            { title: "Red Pen Rewrites", desc: "Exact replacement text for your weakest bullets" },
                            { title: "4-Dimension Score", desc: "Story, Impact, Clarity, Readability — with citations" },
                        ].map((item) => (
                            <div key={item.title} className="flex items-start gap-4 p-5 rounded-xl border border-slate-200">
                                <Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium text-slate-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-slate-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-20 bg-teal-600">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready for the truth?
                    </h2>
                    <p className="text-xl text-teal-100 mb-10">
                        Free. 60 seconds. No signup required.
                    </p>
                    <button className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-700 font-semibold text-lg rounded-md hover:bg-teal-50 transition-colors">
                        Get Your Verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Trust Footer */}
            <section className="px-6 py-10 bg-slate-50 border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Lock className="w-4 h-4 text-teal-600" />
                            End-to-end encrypted
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Trash2 className="w-4 h-4 text-slate-400" />
                            Delete anytime
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Shield className="w-4 h-4 text-slate-400" />
                            Never trains AI models
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-400">
                        Methodology reviewed by hiring professionals from Google, Meta, and Stripe
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-slate-100">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4 text-teal-600" />
                        <span className="text-sm text-slate-500">© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Research</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
