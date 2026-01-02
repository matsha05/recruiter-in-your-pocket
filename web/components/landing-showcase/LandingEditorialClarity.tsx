"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, Shield, Trash2, ArrowRight, Check, BookOpen, BarChart2, Users, FileText, Star, TrendingUp, Target, Quote, Zap, AlertCircle } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page Variation: Editorial Clarity
 * 
 * Style: Magazine-style editorial with strong typographic hierarchy
 * - Light theme with bold black typography
 * - Clear section breaks with rules/dividers
 * - Large, confident headlines
 * - Progress bars and data visualization
 * - Dark testimonial section with good contrast
 */

// Animated progress bar
function ProgressBar({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div ref={ref} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="font-mono font-bold text-slate-900">{value}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-teal-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: isInView ? `${value}%` : 0 }}
                    transition={{ duration: 1, delay: delay, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

// Citation component
function Citation({ text }: { text: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 text-[10px] font-mono font-medium text-teal-700 border border-teal-100">
            {text}
        </span>
    );
}

export function LandingEditorialClarity() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-6 h-6 text-teal-600" />
                        <span className="font-bold text-base tracking-tight">Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#methodology" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Methodology</a>
                        <a href="#research" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Research</a>
                        <button className="text-sm font-bold px-5 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="px-6 py-20 lg:py-28 border-b border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Copy */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Eyebrow */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="h-px flex-1 max-w-16 bg-slate-300" />
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                    Research-Backed Analysis
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                                See what
                                <br />
                                <span className="text-teal-600">recruiters see.</span>
                            </h1>

                            <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-lg">
                                A recruiter spends <strong className="text-slate-900">7.4 seconds</strong> on your resume. We show you exactly what they notice — and what they miss.
                            </p>

                            {/* CTA */}
                            <div className="flex flex-wrap items-center gap-4 mb-8">
                                <button className="group inline-flex items-center gap-2 px-7 py-4 rounded-lg bg-teal-600 text-white font-bold text-lg hover:bg-teal-700 transition-colors">
                                    Analyze My Resume
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <span className="text-sm text-slate-500">Free • No signup</span>
                            </div>

                            {/* Trust signals */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                    <Lock className="w-4 h-4 text-teal-600" />
                                    Encrypted
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                    <Trash2 className="w-4 h-4 text-slate-400" />
                                    Deleted in 24h
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                    Never trains AI
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Signal Preview Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                        >
                            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
                                <div className="flex items-center gap-2 mb-8">
                                    <BarChart2 className="w-5 h-5 text-teal-600" />
                                    <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Signal Strength</span>
                                </div>

                                <div className="space-y-6">
                                    <ProgressBar value={92} label="Story & Narrative" delay={0.2} />
                                    <ProgressBar value={78} label="Quantified Impact" delay={0.3} />
                                    <ProgressBar value={85} label="Role Clarity" delay={0.4} />
                                    <ProgressBar value={68} label="Visual Hierarchy" delay={0.5} />
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Overall Score</span>
                                    <span className="text-4xl font-bold text-teal-600">87</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Banner */}
            <section className="px-6 py-12 bg-slate-900 text-white">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: "7.4s", label: "Average review time" },
                            { value: "75%", label: "Rejected in <10 seconds" },
                            { value: "250+", label: "Applicants per role" },
                            { value: "3.2x", label: "More interviews with fixes" },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <div className="text-3xl md:text-4xl font-bold text-teal-400 mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-300">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What You Get */}
            <section className="px-6 py-20">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">What you'll discover</h2>
                        <p className="text-lg text-slate-600 max-w-xl mx-auto">
                            Not generic feedback. Specific, actionable insights based on how recruiters actually evaluate resumes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Target,
                                title: "7-Second Verdict",
                                description: "The recruiter's honest first impression. What they noticed, what they thought, what they'd do next.",
                                color: "bg-rose-50 text-rose-600 border-rose-100",
                            },
                            {
                                icon: AlertCircle,
                                title: "Critical Miss",
                                description: "The single most damaging gap in your resume. Not a list — the one thing that matters most.",
                                color: "bg-amber-50 text-amber-600 border-amber-100",
                            },
                            {
                                icon: Zap,
                                title: "Red Pen Rewrites",
                                description: "Before and after for every weak bullet. Copy, paste, and watch your score improve.",
                                color: "bg-teal-50 text-teal-600 border-teal-100",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="p-8 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className={`w-12 h-12 rounded-xl ${feature.color} border flex items-center justify-center mb-6`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Methodology Section */}
            <section id="methodology" className="px-6 py-20 bg-slate-50 border-y border-slate-200">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-bold text-slate-600 mb-4">
                            <FileText className="w-4 h-4" />
                            The 6-Second Signal Model
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight mb-4">How we analyze your resume</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Built on behavioral research from recruiting professionals. Not generic AI pattern matching.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: Target, title: "Story Signal", weight: "35%", source: "NBER, 2019" },
                            { icon: TrendingUp, title: "Impact Signal", weight: "30%", source: "Bock/Google, 2015" },
                            { icon: BarChart2, title: "Clarity Signal", weight: "20%", source: "Ladders, 2018" },
                            { icon: BookOpen, title: "Readability", weight: "15%", source: "Eye-tracking, 2018" },
                        ].map((signal, i) => (
                            <motion.div
                                key={signal.title}
                                className="p-6 rounded-xl bg-white border border-slate-200"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                                        <signal.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded border border-teal-100">
                                        {signal.weight}
                                    </span>
                                </div>
                                <h3 className="font-bold text-base mb-3">{signal.title}</h3>
                                <Citation text={signal.source} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Research Section */}
            <section id="research" className="px-6 py-20">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-2">The Hiring Research Library</h2>
                            <p className="text-slate-600">Primary sources behind our methodology</p>
                        </div>
                        <a href="#" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: BookOpen, category: "Eye-tracking", title: "How Recruiters Skim in 7.4 Seconds", time: "4 min" },
                            { icon: BarChart2, category: "Resume Writing", title: "The Laszlo Bock Formula", time: "5 min" },
                            { icon: Users, category: "Job Search", title: "The Referral Advantage", time: "4 min" },
                        ].map((article, i) => (
                            <motion.a
                                key={article.title}
                                href="#"
                                className="group p-6 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-lg transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <article.icon className="w-4 h-4 text-teal-600" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{article.category}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-3 group-hover:text-teal-600 transition-colors">{article.title}</h3>
                                <div className="text-sm font-mono text-slate-400">{article.time}</div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials - Dark Section */}
            <section className="px-6 py-20 bg-slate-900 text-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Trusted by 10,000+ job seekers</h2>
                        <p className="text-slate-300">Real results from real professionals</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                quote: "The data-backed approach made me trust the recommendations. This isn't guesswork.",
                                name: "Dr. Sarah Chen",
                                role: "Senior Data Scientist",
                                company: "Previously at Meta",
                            },
                            {
                                quote: "I've reviewed thousands of resumes as a hiring manager. This catches what we actually look for.",
                                name: "Marcus Williams",
                                role: "VP Engineering",
                                company: "Series C Startup",
                            },
                        ].map((t, i) => (
                            <motion.div
                                key={t.name}
                                className="p-8 rounded-2xl border border-white/10 bg-white/5"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-teal-400 text-teal-400" />
                                    ))}
                                </div>
                                <p className="text-xl font-medium text-white leading-relaxed mb-6">
                                    "{t.quote}"
                                </p>
                                <div>
                                    <div className="font-bold text-white">{t.name}</div>
                                    <div className="text-slate-300">{t.role} · {t.company}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">Simple pricing</h2>
                        <p className="text-lg text-slate-600">Start free. Upgrade when you need more.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        {/* Free */}
                        <div className="p-8 rounded-2xl border border-slate-200 bg-white">
                            <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Free</div>
                            <div className="text-5xl font-bold mb-6">$0</div>
                            <ul className="space-y-4 mb-8">
                                {["3 resume analyses", "Full 4-dimension scoring", "Critical Miss detection", "Red Pen rewrites"].map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-slate-600">
                                        <Check className="w-5 h-5 text-teal-600" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl border-2 border-slate-200 font-bold hover:bg-slate-50 transition-colors">
                                Start Free
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="p-8 rounded-2xl border-2 border-teal-600 bg-white relative">
                            <div className="absolute -top-3 left-6 px-3 py-1 bg-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                                Best Value
                            </div>
                            <div className="text-sm font-bold uppercase tracking-widest text-teal-600 mb-2">Pro</div>
                            <div className="text-5xl font-bold mb-6">$12<span className="text-xl text-slate-400 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                {["Unlimited analyses", "LinkedIn profile reviews", "Job-matched analysis", "Chrome extension", "Priority support"].map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-slate-600">
                                        <Check className="w-5 h-5 text-teal-600" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors">
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-12 bg-slate-50 border-t border-slate-200">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-8 mb-8 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-teal-600" />
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
                            <PocketMark className="w-5 h-5 text-teal-600" />
                            <span className="text-sm text-slate-500">© 2026 Recruiter in Your Pocket</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                            <a href="#" className="hover:text-slate-900 transition-colors">Research</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
