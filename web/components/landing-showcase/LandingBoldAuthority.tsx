"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Shield, Trash2, ArrowRight, Check, Eye, BarChart3, Users, Sparkles, Star } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page Variation: Bold Authority
 * 
 * Style: Professional & sophisticated (Stripe/Linear inspired)
 * - Clean typography hierarchy
 * - Confident, direct messaging
 * - Subtle gradients and premium feel
 * - Editorial quality with structured density
 */

// Animated score component
function AnimatedScore({ target }: { target: number }) {
    const [score, setScore] = useState(0);

    useEffect(() => {
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setScore(Math.round(target * ease));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [target]);

    return <span className="tabular-nums">{score}</span>;
}

export function LandingBoldAuthority() {
    return (
        <div className="min-h-screen bg-[#fafafa] text-[#111] selection:bg-teal-500/20">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-black/5 bg-[#fafafa]/95 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <PocketMark className="w-5 h-5 text-teal-600" />
                        <span className="font-medium text-sm tracking-tight">Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-black/60 hover:text-black transition-colors">Research</a>
                        <a href="#" className="text-sm text-black/60 hover:text-black transition-colors">Resources</a>
                        <button className="text-sm font-medium px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative px-6 py-20 lg:py-28 overflow-hidden">
                {/* Subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-violet-50/30 pointer-events-none" />

                <div className="relative max-w-6xl mx-auto">
                    <motion.div
                        className="max-w-3xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Kicker */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-medium mb-6">
                            <Sparkles className="w-3 h-3" />
                            Recruiter-Grade Resume Analysis
                        </div>

                        {/* Headline */}
                        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.05] mb-6">
                            See what recruiters see.
                        </h1>

                        {/* Subhead */}
                        <p className="text-xl md:text-2xl text-black/60 leading-relaxed max-w-2xl mb-8">
                            In 7.4 seconds, a recruiter has already decided. We show you what they noticed first — then how to fix it.
                        </p>

                        {/* CTA Group */}
                        <div className="flex flex-wrap items-center gap-4 mb-10">
                            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors">
                                Upload Your Resume
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <a href="#" className="text-sm text-black/60 hover:text-teal-600 transition-colors underline underline-offset-4">
                                See a sample report
                            </a>
                        </div>

                        {/* Trust Signals */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 text-xs text-black/50">
                                <Lock className="w-3 h-3" />
                                Encrypted
                            </span>
                            <span className="w-px h-3 bg-black/10" />
                            <span className="inline-flex items-center gap-1.5 text-xs text-black/50">
                                <Trash2 className="w-3 h-3" />
                                Auto-deleted in 24h
                            </span>
                            <span className="w-px h-3 bg-black/10" />
                            <span className="inline-flex items-center gap-1.5 text-xs text-black/50">
                                <Shield className="w-3 h-3" />
                                Never trains AI
                            </span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Sample Report Section */}
            <section className="px-6 py-16 bg-white border-y border-black/5">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-3">What You'll Get</p>
                        <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight">
                            A recruiter's honest verdict
                        </h2>
                    </div>

                    {/* Report Preview Card */}
                    <motion.div
                        className="max-w-3xl mx-auto rounded-xl border border-black/10 bg-white shadow-xl shadow-black/5 overflow-hidden"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 bg-black/[0.02]">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">
                                Recruiter First Impression
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-black/30">
                                Example
                            </span>
                        </div>

                        <div className="grid md:grid-cols-[1.5fr_1fr] gap-8 p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-teal-600">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest">Verdict</span>
                                </div>
                                <p className="font-display text-2xl md:text-3xl leading-tight tracking-tight">
                                    "You read like a Founder, but the outcome is buried."
                                </p>
                                <p className="text-sm text-black/60 leading-relaxed">
                                    I scanned your leadership section. Your strongest win is present, but it is not leading. The first impression reads as responsibilities, not impact.
                                </p>
                                <div className="border-l-2 border-amber-500 pl-3 py-1">
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-amber-600">Critical Miss</div>
                                    <p className="text-sm text-black/80 mt-1">
                                        Your title signals strategy, but the evidence reads like execution.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center mb-3">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-black/5" />
                                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="352" strokeDashoffset="46" className="text-green-600" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-5xl font-display font-medium tracking-tighter">
                                                <AnimatedScore target={87} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-mono uppercase tracking-widest text-black/40">
                                        Strong signal
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Research Section */}
            <section className="px-6 py-20 bg-[#fafafa]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-3">The Hiring Playbook</p>
                        <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight mb-3">
                            Built on how recruiters decide
                        </h2>
                        <p className="text-black/60 max-w-xl mx-auto">
                            Research-backed guidance, presented like a document, not a marketing page.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6">
                        {[
                            { icon: Eye, title: "How Recruiters Skim in 7.4 Seconds", category: "Eye-tracking research", time: "4 min" },
                            { icon: BarChart3, title: "The Laszlo Bock Formula", category: "Resume writing", time: "5 min" },
                            { icon: Users, title: "The Referral Advantage", category: "Job search strategy", time: "4 min" },
                        ].map((study, i) => (
                            <motion.a
                                key={study.title}
                                href="#"
                                className="group p-5 rounded-xl border border-black/10 bg-white hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    <study.icon className="w-4 h-4" />
                                </div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1">
                                    {study.category}
                                </div>
                                <h3 className="font-medium text-base mb-2 group-hover:text-teal-600 transition-colors">
                                    {study.title}
                                </h3>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-black/30">
                                    {study.time}
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="px-6 py-20 bg-white border-y border-black/5">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight">
                            Trusted by job seekers
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { quote: "Finally, someone who tells me what's actually wrong instead of vague suggestions.", name: "Sarah K.", role: "Product Manager" },
                            { quote: "I landed 3x more interviews after following the Red Pen rewrites.", name: "Marcus T.", role: "Software Engineer" },
                            { quote: "The recruiter perspective was eye-opening. I had no idea my resume was being skimmed that way.", name: "Jennifer L.", role: "Marketing Director" },
                        ].map((testimonial, i) => (
                            <motion.div
                                key={testimonial.name}
                                className="p-6 rounded-xl border border-black/10 bg-white"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-black/70 leading-relaxed mb-4">
                                    "{testimonial.quote}"
                                </p>
                                <div>
                                    <div className="font-medium text-sm">{testimonial.name}</div>
                                    <div className="text-xs text-black/50">{testimonial.role}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="px-6 py-20 bg-[#fafafa]">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight mb-3">
                            Simple pricing
                        </h2>
                        <p className="text-black/60">
                            Start free. Upgrade when you need more.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* Free tier */}
                        <div className="p-6 rounded-xl border border-black/10 bg-white">
                            <div className="text-xs font-mono uppercase tracking-widest text-black/40 mb-2">Free</div>
                            <div className="text-3xl font-display mb-4">$0</div>
                            <ul className="space-y-2 mb-6">
                                {["3 resume scans", "Full report each time", "Red Pen rewrites"].map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm text-black/70">
                                        <Check className="w-4 h-4 text-teal-600" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-2.5 rounded-md border border-black/10 text-sm font-medium hover:bg-black/5 transition-colors">
                                Get Started
                            </button>
                        </div>

                        {/* Pro tier */}
                        <div className="p-6 rounded-xl border-2 border-teal-600 bg-white relative">
                            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-teal-600 text-white text-[10px] font-medium uppercase tracking-wider rounded">
                                Popular
                            </div>
                            <div className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-2">Pro</div>
                            <div className="text-3xl font-display mb-4">$12<span className="text-lg text-black/40">/mo</span></div>
                            <ul className="space-y-2 mb-6">
                                {["Unlimited scans", "LinkedIn profile reviews", "Job-matched analysis", "Priority support"].map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm text-black/70">
                                        <Check className="w-4 h-4 text-teal-600" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-2.5 rounded-md bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-12 bg-[#111] text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <PocketMark className="w-5 h-5 text-teal-400" />
                            <span className="text-sm text-white/60">© 2026 Recruiter in Your Pocket</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-white/80">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Trust</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
