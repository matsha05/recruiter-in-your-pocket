"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Lock, Shield, Trash2, ArrowRight, Check, ExternalLink, BookOpen, BarChart2, Users, FileText, Award, Quote, TrendingUp, Target } from "lucide-react";

import Footer from "@/components/landing/Footer";

/**
 * LandingContent — Main landing page content
 * 
 * V2.2 "Modern Editorial" design with:
 * - Data-forward hero (7.4s stat, progress bars)
 * - Research citations throughout
 * - 3-tier subscription pricing
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
        <div ref={ref} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{value}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-teal-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: isInView ? `${value}%` : 0 }}
                    transition={{ duration: 7.4, delay: delay, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </div>
    );
}

// Citation badge
function Citation({ source, year }: { source: string; year: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
            {source}, {year}
        </span>
    );
}

export default function LandingContent() {
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

    async function handleCheckout(tier: "monthly" | "lifetime") {
        setCheckoutLoading(tier);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tier }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCheckoutLoading(null);
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-teal-500/20">
            {/* Hero Section - Data Forward */}
            <section className="px-6 py-16 lg:py-24 border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Research badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 mb-6">
                                <BookOpen className="w-3.5 h-3.5" />
                                Methodology grounded in recruiting science
                            </div>

                            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.05] mb-6">
                                Understand how you're <span className="text-teal-600">actually</span> being evaluated
                            </h1>

                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-lg">
                                Recruiters spend an average of <strong className="text-slate-900 dark:text-white">7.4 seconds</strong> on initial resume review. We use eye-tracking research and hiring data to show you exactly what they see — and miss.
                            </p>

                            {/* Key stat callout */}
                            <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-8">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-teal-600 font-mono"><CountUp end={7.4} decimals={1} suffix="s" duration={7400} /></div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Avg. review time</div>
                                </div>
                                <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-rose-600">75%</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Rejected in &lt;10s</div>
                                </div>
                                <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-900 dark:text-white">250+</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Apps per role</div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-wrap items-center gap-4">
                                <Link href="/workspace" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors">
                                    Get Your Analysis
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/research/how-we-score" className="text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-1">
                                    View our methodology
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                        </motion.div>

                        {/* Right: Visual Data */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg shadow-slate-100 dark:shadow-none">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart2 className="w-4 h-4 text-teal-600" />
                                    <span className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">Resume Signal Strength</span>
                                </div>

                                <div className="space-y-5">
                                    <ProgressBar value={92} label="Story & Narrative" delay={0} />
                                    <ProgressBar value={78} label="Quantified Impact" delay={0.1} />
                                    <ProgressBar value={85} label="Role-Signal Clarity" delay={0.2} />
                                    <ProgressBar value={68} label="Visual Hierarchy" delay={0.3} />
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Overall Signal Score</span>
                                        <span className="text-2xl font-bold text-teal-600 font-mono">87/100</span>
                                    </div>
                                </div>
                            </div>

                            {/* Citation */}
                            <div className="text-center">
                                <span className="text-xs text-slate-400">Scoring methodology based on </span>
                                <Citation source="Ladders" year="2018" />
                                <span className="text-xs text-slate-400"> eye-tracking study</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Methodology Section */}
            <section id="methodology" className="px-6 py-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 mb-4">
                            <FileText className="w-3.5 h-3.5" />
                            The 6-Second Signal Model™
                        </div>
                        <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight mb-4">
                            How we analyze your resume
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
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
                                className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                                        <signal.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-mono font-medium text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">
                                        {signal.weight}
                                    </span>
                                </div>
                                <h3 className="font-medium text-base mb-2">{signal.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{signal.description}</p>
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
                            <h2 className="font-display text-3xl font-normal tracking-tight mb-2">
                                Built on how recruiters decide
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">Research-backed guidance behind our methodology.</p>
                        </div>
                        <Link href="/research" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
                            View all research
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                category: "Eye-tracking Research",
                                title: "How Recruiters Skim in 7.4 Seconds",
                                description: "Where attention goes first and which fields decide the pass.",
                                readTime: "4 min",
                                icon: BookOpen,
                                href: "/research/how-recruiters-read",
                            },
                            {
                                category: "Resume Writing",
                                title: "The Laszlo Bock Formula",
                                description: "Why measurable outcomes shape perceived impact in hiring decisions.",
                                readTime: "5 min",
                                icon: BarChart2,
                                href: "/research/quantifying-impact",
                            },
                            {
                                category: "Job Search Strategy",
                                title: "The Referral Advantage",
                                description: "NBER research on how referrals shift interview rates by 6-10x.",
                                readTime: "4 min",
                                icon: Users,
                                href: "/research/referral-advantage",
                            },
                        ].map((article, i) => (
                            <motion.div
                                key={article.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    href={article.href}
                                    className="group block p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <article.icon className="w-4 h-4 text-teal-600" />
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{article.category}</span>
                                    </div>
                                    <h3 className="font-medium text-base mb-2 group-hover:text-teal-600 transition-colors">{article.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{article.description}</p>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-mono text-slate-400">{article.readTime}</span>
                                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof with Data */}
            <section className="px-6 py-20 bg-slate-900 dark:bg-slate-950">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
                            What people are saying
                        </h2>
                    </div>

                    {/* Testimonials */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                quote: "Executive coaches charge $500+ for a resume review that's half this good. This is what I actually tell my clients — except I couldn't automate my brain. Somehow you did.",
                                name: "Jennifer Martinez",
                                role: "Career Coach",
                                company: "$450/hr clients",
                            },
                            {
                                quote: "I've reviewed thousands of resumes as a hiring manager. This tool catches what we actually look for.",
                                name: "Marcus Williams",
                                role: "VP Engineering",
                                company: "Series C Startup",
                            },
                        ].map((testimonial, i) => (
                            <motion.div
                                key={testimonial.name}
                                className="p-6 rounded-xl border border-white/20 bg-white/10"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Quote className="w-8 h-8 text-teal-400 mb-4" />
                                <p className="text-xl text-white leading-relaxed mb-6">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{testimonial.name}</div>
                                        <div className="text-base text-slate-200">{testimonial.role} · {testimonial.company}</div>
                                    </div>
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
                        <h2 className="font-display text-3xl font-normal tracking-tight mb-4">
                            Transparent pricing
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Start free. Upgrade when you're ready. Cancel anytime.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {/* Free */}
                        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">Free</div>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-slate-400">forever</span>
                            </div>
                            <ul className="space-y-3 mb-6">
                                {[
                                    "3 resume analyses",
                                    "Full 4-dimension scoring",
                                    "Critical Miss detection",
                                    "Red Pen rewrites",
                                    "Research library access",
                                ].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/workspace" className="block w-full py-3 rounded-md border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center">
                                Start Free Analysis
                            </Link>
                        </div>

                        {/* Full Access Monthly */}
                        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">Full Access</div>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$9</span>
                                <span className="text-slate-400">/month</span>
                            </div>
                            <ul className="space-y-3 mb-6">
                                {[
                                    "Unlimited analyses",
                                    "LinkedIn profile review",
                                    "Job description matching",
                                    "Chrome extension access",
                                    "Priority email support",
                                ].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleCheckout("monthly")}
                                disabled={checkoutLoading === "monthly"}
                                className="block w-full py-3 rounded-md border border-teal-600 text-teal-600 font-medium hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-center disabled:opacity-50"
                            >
                                {checkoutLoading === "monthly" ? "Loading..." : "Start Monthly"}
                            </button>
                        </div>

                        {/* Lifetime - Best Value */}
                        <div className="p-6 rounded-xl border-2 border-teal-600 bg-white dark:bg-slate-900 relative">
                            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-teal-600 text-white text-[10px] font-mono uppercase tracking-wider rounded">
                                Best Value
                            </div>
                            <div className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-2">Lifetime</div>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-4xl font-bold">$79</span>
                                <span className="text-slate-400">one-time</span>
                            </div>
                            <div className="text-xs text-teal-600 mb-6">Pay once, use forever</div>
                            <ul className="space-y-3 mb-6">
                                {[
                                    "Everything in Full Access",
                                    "Never pay again",
                                    "All future updates included",
                                    "Export to PDF/ATS formats",
                                    "Priority support forever",
                                ].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleCheckout("lifetime")}
                                disabled={checkoutLoading === "lifetime"}
                                className="block w-full py-3 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors text-center disabled:opacity-50"
                            >
                                {checkoutLoading === "lifetime" ? "Loading..." : "Get Lifetime Access"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Footer */}
            <section className="px-6 py-12 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Lock className="w-4 h-4 text-teal-600" />
                            End-to-end encrypted
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Trash2 className="w-4 h-4 text-slate-400" />
                            Auto-deleted in 24 hours
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Shield className="w-4 h-4 text-slate-400" />
                            Never trains AI models
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Award className="w-4 h-4 text-slate-400" />
                            GDPR compliant
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-400">
                        Methodology reviewed by hiring professionals from Google, Meta, and Stripe
                    </div>
                </div>
            </section>

            {/* Real Footer */}
            <Footer />
        </div>
    );
}
