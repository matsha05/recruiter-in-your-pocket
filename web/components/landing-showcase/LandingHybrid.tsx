"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, Shield, Trash2, ArrowRight, BookOpen, BarChart2, Users, Quote } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * LandingHybrid - Best of Both Worlds
 * 
 * Merges:
 * - Production's functional hero (dropzone concept + LinkedIn)
 * - Original's animated stats (7.4s real-time, score bars)
 * - Original's $500 coach thesis testimonials
 * - Clean research cards
 */

// Count-up animation
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

// Animated progress bar
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
                    transition={{ duration: 7.4, delay: delay, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </div>
    );
}

export function LandingHybrid() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-5 h-5 text-teal-600" />
                        <span className="font-medium text-sm tracking-tight">Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#research" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Research</a>
                        <button className="text-sm font-medium px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                            Get Your Verdict
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero - Functional + Animated */}
            <section className="relative px-6 py-16 lg:py-24 overflow-hidden">
                {/* Subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.03] via-transparent to-violet-500/[0.02] pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/[0.05] rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Copy + Upload */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                            Recruiter First Impression
                        </div>

                        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.05]">
                            See what <span className="text-teal-600">they</span> see.
                        </h1>

                        <p className="text-xl text-slate-600 max-w-md">
                            <span className="font-mono font-medium text-teal-600"><CountUp end={7.4} decimals={1} suffix="s" duration={7400} /></span> — that's your window. We show what they notice first, then how to fix it.
                        </p>

                        {/* Key stats row */}
                        <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-teal-600 font-mono">7.4s</div>
                                <div className="text-xs text-slate-500">The window</div>
                            </div>
                            <div className="w-px h-10 bg-slate-200" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-rose-600 font-mono">75%</div>
                                <div className="text-xs text-slate-500">Rejected fast</div>
                            </div>
                            <div className="w-px h-10 bg-slate-200" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900 font-mono">250+</div>
                                <div className="text-xs text-slate-500">Your competition</div>
                            </div>
                        </div>

                        {/* Upload Zone (Styled Placeholder) */}
                        <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:border-teal-400 hover:bg-teal-50/30 transition-colors cursor-pointer">
                            <div className="text-center">
                                <div className="text-sm font-medium text-slate-700 mb-1">Drop your resume here</div>
                                <div className="text-xs text-slate-500">PDF or DOCX · Free · 60 seconds</div>
                            </div>
                        </div>

                        {/* LinkedIn option */}
                        <a href="#" className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0077B5]/10 border border-[#0077B5]/20 text-sm font-medium text-[#0077B5] hover:bg-[#0077B5]/20 transition-all">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            Review LinkedIn Profile
                            <span className="text-[#0077B5]/60">→</span>
                        </a>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
                                <Lock className="w-3 h-3 text-teal-600" />
                                Encrypted
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
                                <Trash2 className="w-3 h-3" />
                                Delete anytime
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
                                <Shield className="w-3 h-3" />
                                Never trains AI
                            </span>
                        </div>
                    </motion.div>

                    {/* Right: Score Panel */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                    >
                        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <BarChart2 className="w-4 h-4 text-teal-600" />
                                <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Resume Signal Strength</span>
                            </div>

                            <div className="space-y-5">
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

                        <div className="text-center text-xs text-slate-400">
                            Based on eye-tracking research from Ladders (2018)
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Research Section */}
            <section id="research" className="px-6 py-16 bg-slate-50 border-t border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="font-display text-3xl font-normal tracking-tight mb-2">
                                Built on how recruiters decide
                            </h2>
                            <p className="text-slate-600">Research-backed guidance behind our methodology.</p>
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

            {/* Testimonials - $500 Coach Thesis */}
            <section className="px-6 py-20 bg-slate-900">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
                            What people are saying
                        </h2>
                    </div>

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
