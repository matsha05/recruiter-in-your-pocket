"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Lock, Trash2, Shield, ArrowRight, Check, Star, AlertCircle, Zap, Target, BarChart2 } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page Variation: Asymmetric Confidence
 * 
 * Design principles applied:
 * - Breaking traditional layouts — asymmetric grids
 * - Bold left-aligned copy, offset visuals
 * - High contrast dark hero, light content
 * - Story-driven section reveals
 * - Single dramatic accent color
 */

// Progress bar with spring animation
function ProgressBar({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay }}
        >
            <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium text-white/70">{label}</span>
                <span className="text-2xl font-bold text-white">{value}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-teal-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${value}%` } : {}}
                    transition={{ duration: 1, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </motion.div>
    );
}

export function LandingAsymmetricConfidence() {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-teal-500/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-7 h-7 text-teal-400" />
                        <span className="font-semibold text-lg tracking-tight">RIYP</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Research</a>
                        <button className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-teal-400 transition-colors">
                            Try Free
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO — Asymmetric Layout */}
            <section className="min-h-screen flex items-center px-8 pt-24">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        {/* Left: Copy — Takes 7 columns */}
                        <motion.div
                            className="lg:col-span-7"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8">
                                Your resume.
                                <br />
                                <span className="text-teal-400">Their judgment.</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-white/60 max-w-xl mb-10 leading-relaxed">
                                Recruiters make decisions in <strong className="text-white">7.4 seconds</strong>. We show you exactly what they think — and what's costing you interviews.
                            </p>

                            <div className="flex flex-wrap items-center gap-6">
                                <motion.button
                                    className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-teal-400 text-slate-900 font-bold text-lg hover:bg-teal-300 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Get Your Verdict
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                                <span className="text-white/40 text-sm">Free · No signup required</span>
                            </div>

                            {/* Trust signals — inline */}
                            <div className="flex items-center gap-6 mt-12 text-sm text-white/40">
                                <span className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-teal-400" />
                                    Encrypted
                                </span>
                                <span className="flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Deleted in 24h
                                </span>
                            </div>
                        </motion.div>

                        {/* Right: Floating Stats — Takes 5 columns, offset up */}
                        <motion.div
                            className="lg:col-span-5 lg:-mt-20"
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                <div className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-8">
                                    Signal Breakdown
                                </div>
                                <div className="space-y-6">
                                    <ProgressBar value={92} label="Story & Narrative" delay={0.3} />
                                    <ProgressBar value={78} label="Quantified Impact" delay={0.4} />
                                    <ProgressBar value={85} label="Role Clarity" delay={0.5} />
                                    <ProgressBar value={68} label="Visual Hierarchy" delay={0.6} />
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-white/60">Overall</span>
                                    <span className="text-5xl font-bold text-teal-400">87</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* THE PROBLEM — Full Width Impact */}
            <section className="py-32 px-8 bg-white text-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Big number */}
                        <div>
                            <div className="text-[clamp(4rem,15vw,12rem)] font-bold leading-none text-slate-200 mb-2">
                                75%
                            </div>
                            <p className="text-3xl font-medium text-slate-800 leading-snug">
                                of resumes are rejected in the first 10 seconds of a recruiter scan.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { value: "7.4s", label: "Average review time" },
                                { value: "250+", label: "Apps per job posting" },
                                { value: "3.2x", label: "More callbacks with fixes" },
                                { value: "94%", label: "Find their Critical Miss" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    className="p-6 rounded-2xl bg-slate-50 border border-slate-200"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="text-3xl font-bold text-teal-600 mb-1">{stat.value}</div>
                                    <div className="text-sm text-slate-500">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* WHAT YOU GET — Asymmetric Cards */}
            <section className="py-32 px-8 bg-slate-950">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        className="text-5xl md:text-6xl font-bold tracking-tight mb-20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        What you'll discover.
                    </motion.h2>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Target,
                                title: "7-Second Verdict",
                                description: "The recruiter's honest first impression. What they noticed, what they thought, what they'd do next.",
                                accent: "from-rose-500 to-orange-500",
                            },
                            {
                                icon: AlertCircle,
                                title: "Critical Miss",
                                description: "The single most damaging gap in your resume. Not a list — the one thing that matters most.",
                                accent: "from-amber-500 to-yellow-500",
                            },
                            {
                                icon: Zap,
                                title: "Red Pen Rewrites",
                                description: "Before and after for every weak bullet. Copy, paste, and watch your score improve.",
                                accent: "from-teal-500 to-emerald-500",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-6`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-white/60 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SAMPLE VERDICT — Full Width Dark */}
            <section className="py-32 px-8 bg-slate-900 border-y border-white/5">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="rounded-3xl border border-white/10 bg-slate-950 overflow-hidden"
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02]">
                            <span className="text-xs font-mono uppercase tracking-widest text-teal-400">Sample Verdict</span>
                        </div>
                        <div className="p-10">
                            <div className="grid lg:grid-cols-5 gap-8 items-start">
                                <div className="lg:col-span-1">
                                    <div className="text-6xl font-bold text-teal-400">87</div>
                                    <div className="text-sm text-white/50 mt-1">Score</div>
                                </div>
                                <div className="lg:col-span-4 space-y-6">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">First Impression</div>
                                        <p className="text-2xl font-medium text-white leading-snug">
                                            "Strong founder energy, but your biggest win is buried in paragraph three."
                                        </p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-5 h-5 text-amber-400" />
                                            <span className="text-sm font-bold text-amber-400">Critical Miss</span>
                                        </div>
                                        <p className="text-lg text-white/80">
                                            You led a team of 12 to a $2M revenue increase — but it's positioned after three bullets about daily operations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* TESTIMONIALS — White Section */}
            <section className="py-32 px-8 bg-white text-slate-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold tracking-tight text-center mb-16">
                        Trusted by 10,000+ job seekers
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { quote: "Finally understood why I wasn't getting callbacks.", name: "Sarah K.", role: "PM at Google" },
                            { quote: "The Critical Miss feature found what 3 coaches missed.", name: "James R.", role: "Eng Lead at Stripe" },
                            { quote: "Worth every penny. Landed my dream job in 3 weeks.", name: "Emily T.", role: "Designer at Figma" },
                        ].map((t, i) => (
                            <motion.div
                                key={t.name}
                                className="p-8 rounded-2xl bg-slate-50 border border-slate-200"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-teal-500 text-teal-500" />
                                    ))}
                                </div>
                                <p className="text-lg text-slate-700 leading-relaxed mb-6">"{t.quote}"</p>
                                <div>
                                    <div className="font-semibold">{t.name}</div>
                                    <div className="text-sm text-slate-500">{t.role}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section className="py-32 px-8 bg-slate-950">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl font-bold tracking-tight mb-6">
                        Simple pricing.
                    </h2>
                    <p className="text-xl text-white/50 mb-16">
                        Start free. Upgrade when you need more.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto text-left">
                        {/* Free */}
                        <div className="p-10 rounded-3xl border border-white/10 bg-white/[0.02]">
                            <div className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Free</div>
                            <div className="text-6xl font-bold mb-8">$0</div>
                            <ul className="space-y-4 mb-10">
                                {["3 resume analyses", "Full verdict", "Critical Miss", "Red Pen rewrites"].map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-white/70">
                                        <Check className="w-5 h-5 text-teal-400 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl border border-white/20 font-bold text-lg hover:bg-white/5 transition-colors">
                                Start Free
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="p-10 rounded-3xl border-2 border-teal-400 bg-teal-400/5 relative">
                            <div className="absolute -top-4 left-8 px-4 py-1.5 bg-teal-400 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-full">
                                Best Value
                            </div>
                            <div className="text-sm font-bold uppercase tracking-widest text-teal-400 mb-2">Pro</div>
                            <div className="text-6xl font-bold mb-8">$12<span className="text-2xl text-white/40 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-10">
                                {["Unlimited analyses", "LinkedIn reviews", "Job matching", "Chrome extension", "Priority support"].map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-white/70">
                                        <Check className="w-5 h-5 text-teal-400 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl bg-teal-400 text-slate-900 font-bold text-lg hover:bg-teal-300 transition-colors">
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-8 py-12 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-8 mb-8 text-sm text-white/40">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-teal-400" />
                            End-to-end encrypted
                        </div>
                        <div className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Auto-deleted in 24h
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Never trains AI
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <PocketMark className="w-5 h-5 text-teal-400" />
                            <span className="text-sm text-white/40">© 2026 Recruiter in Your Pocket</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-white/40">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Research</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
