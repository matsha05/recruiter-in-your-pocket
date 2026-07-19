"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { m as motion, useInView } from "motion/react";
import { Lock, Shield, Trash2, ArrowRight, Check, ExternalLink, BookOpen, BarChart2, Users, FileText, Award, TrendingUp, Target } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page Variation: Data-Driven Trust
 * 
 * Style: Research-heavy, stats prominent
 * - Academic credibility with visual data
 * - Methodology transparency
 * - Dense information architecture
 * - Authority through evidence
 */

// Count-up animation for numbers
function CountUp({ end, decimals = 0, suffix = "", duration = 1500 }: { end: number; decimals?: number; suffix?: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        const start = performance.now();
        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * end;
            setCount(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isInView, end, decimals, duration]);

    return <span ref={ref}>{decimals > 0 ? count.toFixed(decimals) : count}{suffix}</span>;
}

// Animated percentage bar
function ProgressBar({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div ref={ref} className="gap-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-mono font-medium text-slate-900">{value}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-teal-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: isInView ? `${value}%` : 0 }}
                    transition={{ duration: 1.2, delay: delay, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </div>
    );
}

// Citation badge
function Citation({ source, year }: { source: string; year: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-xs font-mono text-slate-600">
            {source}, {year}
        </span>
    );
}

export function LandingDataDriven() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="size-5 text-teal-600" />
                        <div>
                            <span className="font-medium text-sm tracking-tight">Recruiter in Your Pocket</span>
                            <span className="hidden sm:inline text-xs text-slate-400 ml-2">Research-backed career analysis</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#methodology" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Methodology</a>
                        <a href="#research" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Research</a>
                        <button type="button" className="text-sm font-medium px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                            Analyze Resume
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Data Forward */}
            <section className="px-6 py-16 lg:py-24 border-b border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Research badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-600 mb-6">
                                <BookOpen className="size-3.5" />
                                Methodology grounded in recruiting science
                            </div>

                            <h1 className="mb-6 font-display text-5xl riyp-weight-520 leading-[1.05] tracking-tight riyp-stretch-90 md:text-6xl lg:text-7xl">
                                Understand how you're <span className="text-teal-600">actually</span> being evaluated
                            </h1>

                            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                                See what the resume communicates, where a recruiter has to guess, and which changes are worth making first.
                            </p>

                            {/* Key stat callout */}
                            <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-8">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-teal-600 font-mono"><CountUp end={1} /></div>
                                    <div className="text-xs text-slate-500 mt-1">Complete report free</div>
                                </div>
                                <div className="w-px h-12 bg-slate-200" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-rose-600">3</div>
                                    <div className="text-xs text-slate-500 mt-1">Priorities to start</div>
                                </div>
                                <div className="w-px h-12 bg-slate-200" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-900">0</div>
                                    <div className="text-xs text-slate-500 mt-1">Invented wins</div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-wrap items-center gap-4">
                                <button type="button" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors">
                                    Get Your Analysis
                                    <ArrowRight className="size-4" />
                                </button>
                                <a href="#methodology" className="text-sm text-slate-600 hover:text-teal-600 transition-colors flex items-center gap-1">
                                    View our methodology
                                    <ExternalLink className="size-3" />
                                </a>
                            </div>
                        </motion.div>

                        {/* Right: Visual Data */}
                        <motion.div
                            className="gap-y-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart2 className="size-4 text-teal-600" />
                                    <span className="text-xs font-mono uppercase tracking-wide text-slate-500">Resume Signal Strength</span>
                                </div>

                                <div className="gap-y-5">
                                    <ProgressBar value={92} label="Story & Narrative" delay={0} />
                                    <ProgressBar value={78} label="Quantified Impact" delay={0.1} />
                                    <ProgressBar value={85} label="Role-Signal Clarity" delay={0.2} />
                                    <ProgressBar value={68} label="Visual Hierarchy" delay={0.3} />
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Overall Signal Score</span>
                                        <span className="text-2xl font-bold text-teal-600 font-mono">87/100</span>
                                    </div>
                                </div>
                            </div>

                            {/* Citation */}
                            <div className="text-center">
                                <span className="text-xs text-slate-400">The report shows its evidence and keeps research limits visible.</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Methodology Section */}
            <section id="methodology" className="px-6 py-20 bg-slate-50 border-b border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs text-slate-600 mb-4">
                            <FileText className="size-3.5" />
                            Recruiter opening-read framework
                        </div>
                        <h2 className="mb-4 font-display text-3xl riyp-weight-560 tracking-tight riyp-stretch-96 md:text-4xl">
                            How we analyze your resume
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Our scoring model is built on behavioral research from recruiting professionals, not generic AI pattern matching.
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
                                description: "Are achievements quantified with business outcomes?",
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
                                className="p-5 rounded-xl border border-slate-200 bg-white"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="size-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                        <signal.icon className="size-5" />
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

            {/* Research Library Section */}
            <section id="research" className="px-6 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="mb-2 font-display text-3xl riyp-weight-560 tracking-tight riyp-stretch-96">
                                Built on how recruiters decide
                            </h2>
                            <p className="text-slate-600">Research-backed guidance behind our methodology.</p>
                        </div>
                        <Link href="/workspace" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
                            View all research
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                category: "Eye-tracking Research",
                                title: "How recruiters actually read a resume",
                                description: "What peer-reviewed studies observed, what they did not prove, and what candidates can use.",
                                readTime: "4 min",
                                icon: BookOpen,
                            },
                            {
                                category: "Resume Writing",
                                title: "The Laszlo Bock Formula",
                                description: "Why measurable outcomes shape perceived impact in hiring decisions.",
                                readTime: "5 min",
                                icon: BarChart2,
                            },
                            {
                                category: "Job Search Strategy",
                                title: "The Referral Advantage",
                                description: "NBER research on how referrals shift interview rates by 6-10x.",
                                readTime: "4 min",
                                icon: Users,
                            },
                        ].map((article, i) => (
                            <motion.a
                                key={article.title}
                                href="/workspace"
                                className="group block p-6 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <article.icon className="size-4 text-teal-600" />
                                    <span className="text-xs font-mono uppercase tracking-wide text-slate-400">{article.category}</span>
                                </div>
                                <h3 className="font-medium text-base mb-2 group-hover:text-teal-600 transition-colors">{article.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-4">{article.description}</p>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-mono text-slate-400">{article.readTime}</span>
                                    <ArrowRight className="size-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founder authority */}
            <section className="px-6 py-20 bg-slate-900">
                <div className="max-w-5xl mx-auto">
                    <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:items-end">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">The recruiter behind the report</p>
                        <div>
                            <h2 className="font-display text-4xl tracking-tight text-white md:text-6xl">Built from the hiring side.</h2>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Matt Shaw has spent 14 years recruiting and leading hiring teams across OpenAI, Meta, Google, X-Team, and Robert Half. RIYP makes the questions recruiters ask privately useful before you apply.</p>
                            <a href="https://www.linkedin.com/in/mattrshaw" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-300 underline underline-offset-4">
                                Meet Matt on LinkedIn <ArrowRight className="size-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="mb-4 font-display text-3xl riyp-weight-560 tracking-tight riyp-stretch-96">
                            Transparent pricing
                        </h2>
                        <p className="text-slate-600">
                            Start with 1 free review. Full methodology access included.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* Free */}
                        <div className="p-6 rounded-xl border border-slate-200 bg-white">
                            <div className="text-xs font-mono uppercase tracking-wide text-slate-400 mb-2">Free</div>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-slate-400">1 review</span>
                            </div>
                            <ul className="gap-y-3 mb-6">
                                {[
                                    "1 full resume review",
                                    "Recruiter first-impression verdict",
                                    "Signal score and critical gaps",
                                    "Sample rewrites and next steps",
                                    "Research library access"
                                ].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                                        <Check className="size-4 text-teal-600 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button type="button" className="w-full py-3 rounded-md border border-slate-200 font-medium hover:bg-slate-50 transition-colors">
                                Run Free Review
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="p-6 rounded-xl border-2 border-teal-600 bg-white relative">
                            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-teal-600 text-white text-xs font-mono uppercase tracking-wider rounded">
                                Most Value
                            </div>
                            <div className="text-xs font-mono uppercase tracking-wide text-teal-600 mb-2">Pro</div>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$12</span>
                                <span className="text-slate-400">/month</span>
                            </div>
                            <ul className="gap-y-3 mb-6">
                                {[
                                    "Unlimited analyses",
                                    "LinkedIn profile review",
                                    "Job description matching",
                                    "Chrome extension access",
                                    "Priority email support",
                                    "Export to PDF/ATS formats",
                                ].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                                        <Check className="size-4 text-teal-600 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button type="button" className="w-full py-3 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors">
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Footer */}
            <section className="px-6 py-12 bg-slate-50 border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Lock className="size-4 text-teal-600" />
                            Encrypted in transit
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Trash2 className="size-4 text-slate-400" />
                            Delete anytime
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Shield className="size-4 text-slate-400" />
                            Not used to train public models
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Award className="size-4 text-slate-400" />
                            GDPR compliant
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
                        <PocketMark className="size-4 text-teal-600" />
                        <span className="text-sm text-slate-500">© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <Link href="/workspace" className="hover:text-slate-900 transition-colors">Privacy</Link>
                        <Link href="/workspace" className="hover:text-slate-900 transition-colors">Terms</Link>
                        <Link href="/workspace" className="hover:text-slate-900 transition-colors">Methodology</Link>
                        <Link href="/workspace" className="hover:text-slate-900 transition-colors">Research</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
