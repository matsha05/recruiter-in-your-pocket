"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, Shield, Trash2, ArrowRight, Check, ExternalLink, BookOpen, BarChart2, Users, FileText, Award, Quote, Star, TrendingUp, Clock, Target } from "lucide-react";
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

// Animated percentage bar
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
                    transition={{ duration: 1, delay: delay, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

// Citation badge
function Citation({ source, year }: { source: string; year: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600">
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
                        <PocketMark className="w-5 h-5 text-teal-600" />
                        <div>
                            <span className="font-medium text-sm tracking-tight">Recruiter in Your Pocket</span>
                            <span className="hidden sm:inline text-xs text-slate-400 ml-2">Research-backed resume analysis</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#methodology" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Methodology</a>
                        <a href="#research" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Research</a>
                        <button className="text-sm font-medium px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors">
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
                                <BookOpen className="w-3.5 h-3.5" />
                                Based on 14 peer-reviewed studies
                            </div>

                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.1] mb-6">
                                Understand how you're <span className="text-teal-600">actually</span> being evaluated
                            </h1>

                            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                                Recruiters spend an average of <strong>7.4 seconds</strong> on initial resume review. We use eye-tracking research and hiring data to show you exactly what they see — and miss.
                            </p>

                            {/* Key stat callout */}
                            <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-8">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-teal-600">7.4s</div>
                                    <div className="text-xs text-slate-500 mt-1">Avg. review time</div>
                                </div>
                                <div className="w-px h-12 bg-slate-200" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-900">75%</div>
                                    <div className="text-xs text-slate-500 mt-1">Rejected in &lt;10s</div>
                                </div>
                                <div className="w-px h-12 bg-slate-200" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-900">250+</div>
                                    <div className="text-xs text-slate-500 mt-1">Apps per role</div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-wrap items-center gap-4">
                                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors">
                                    Get Your Analysis
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <a href="#methodology" className="text-sm text-slate-600 hover:text-teal-600 transition-colors flex items-center gap-1">
                                    View our methodology
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </motion.div>

                        {/* Right: Visual Data */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart2 className="w-4 h-4 text-teal-600" />
                                    <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Resume Signal Strength</span>
                                </div>

                                <div className="space-y-5">
                                    <ProgressBar value={92} label="Story & Narrative" delay={0.3} />
                                    <ProgressBar value={78} label="Quantified Impact" delay={0.4} />
                                    <ProgressBar value={85} label="Role-Signal Clarity" delay={0.5} />
                                    <ProgressBar value={68} label="Visual Hierarchy" delay={0.6} />
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
                                <span className="text-xs text-slate-400">Scoring methodology based on </span>
                                <Citation source="Ladders" year="2018" />
                                <span className="text-xs text-slate-400"> eye-tracking study</span>
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
                            <FileText className="w-3.5 h-3.5" />
                            The 6-Second Signal Model™
                        </div>
                        <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight mb-4">
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

            {/* Research Library Section */}
            <section id="research" className="px-6 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="font-display text-3xl font-normal tracking-tight mb-2">
                                The Hiring Research Library
                            </h2>
                            <p className="text-slate-600">Primary sources behind our methodology</p>
                        </div>
                        <a href="#" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
                            View all research
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                category: "Eye-tracking Research",
                                title: "How Recruiters Skim in 7.4 Seconds",
                                description: "Where attention goes first and which fields decide the pass.",
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
                                href="#"
                                className="group block p-6 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <article.icon className="w-4 h-4 text-teal-600" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{article.category}</span>
                                </div>
                                <h3 className="font-medium text-base mb-2 group-hover:text-teal-600 transition-colors">{article.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-4">{article.description}</p>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-mono text-slate-400">{article.readTime}</span>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof with Data */}
            <section className="px-6 py-20 bg-slate-900 text-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Measured results from 10,000+ analyses
                        </h2>
                        <p className="text-slate-300">Based on user-reported outcomes within 30 days of using our recommendations</p>
                    </div>

                    {/* Stats grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {[
                            { value: "3.2x", label: "Average increase in interview callbacks" },
                            { value: "67%", label: "Users improved score by 15+ points" },
                            { value: "94%", label: "Found at least one 'Critical Miss'" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="text-center p-6 rounded-xl border border-white/10 bg-white/5"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-bold text-teal-400 mb-2">{stat.value}</div>
                                <div className="text-sm text-slate-300">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Testimonials */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                quote: "The data-backed approach made me trust the recommendations. This isn't guesswork.",
                                name: "Dr. Sarah Chen",
                                role: "Senior Data Scientist",
                                company: "Previously at Meta",
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
                                className="p-6 rounded-xl border border-white/10 bg-white/5"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Quote className="w-8 h-8 text-teal-400/40 mb-4" />
                                <p className="text-lg text-white leading-relaxed mb-6">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-medium">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{testimonial.name}</div>
                                        <div className="text-sm text-slate-300">{testimonial.role} · {testimonial.company}</div>
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
                        <p className="text-slate-600">
                            Start with 3 free analyses. Full methodology access included.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* Free */}
                        <div className="p-6 rounded-xl border border-slate-200 bg-white">
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
                                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                                        <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 rounded-md border border-slate-200 font-medium hover:bg-slate-50 transition-colors">
                                Start Free Analysis
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="p-6 rounded-xl border-2 border-teal-600 bg-white relative">
                            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-teal-600 text-white text-[10px] font-mono uppercase tracking-wider rounded">
                                Most Value
                            </div>
                            <div className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-2">Pro</div>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$12</span>
                                <span className="text-slate-400">/month</span>
                            </div>
                            <ul className="space-y-3 mb-6">
                                {[
                                    "Unlimited analyses",
                                    "LinkedIn profile review",
                                    "Job description matching",
                                    "Chrome extension access",
                                    "Priority email support",
                                    "Export to PDF/ATS formats",
                                ].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                                        <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors">
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
                            <Lock className="w-4 h-4 text-teal-600" />
                            End-to-end encrypted
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Trash2 className="w-4 h-4 text-slate-400" />
                            Auto-deleted in 24 hours
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Shield className="w-4 h-4 text-slate-400" />
                            Never trains AI models
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Award className="w-4 h-4 text-slate-400" />
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
                        <PocketMark className="w-4 h-4 text-teal-600" />
                        <span className="text-sm text-slate-500">© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Methodology</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Research</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
