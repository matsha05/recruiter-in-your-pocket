"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Check, Sparkles, Target, AlertCircle, TrendingUp, Star, ChevronDown } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page Variation: Gradient Impact
 * 
 * Style: Bold typography with vibrant gradients
 * - High-contrast dark mode with colorful gradient overlays
 * - Oversized expressive headlines
 * - Confident color palette with teal-to-violet spectrum
 * - Modern glassmorphism elements
 */

// Animated gradient text
function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent ${className}`}>
            {children}
        </span>
    );
}

// Floating orb background
function FloatingOrbs() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)",
                    top: "10%",
                    left: "20%",
                }}
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
                    bottom: "10%",
                    right: "10%",
                }}
                animate={{
                    x: [0, -30, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
}

export function LandingGradientImpact() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-violet-500/30">
            <FloatingOrbs />

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5" : ""
                }`}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <PocketMark className="w-6 h-6 text-teal-400" />
                        <span className="font-semibold text-sm tracking-tight">RIYP</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">How it works</a>
                        <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Research</a>
                        <button className="text-sm font-medium px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-black hover:opacity-90 transition-opacity">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Massive Typography */}
            <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
                <div className="relative max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Eyebrow badge */}
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Sparkles className="w-4 h-4 text-violet-400" />
                            <span className="text-sm text-white/70">AI-powered resume analysis</span>
                        </motion.div>

                        {/* Giant headline */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8">
                            Stop guessing.
                            <br />
                            <GradientText>Start knowing.</GradientText>
                        </h1>

                        {/* Subhead */}
                        <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
                            See exactly what recruiters see in 7 seconds.
                            Fix what matters. Land more interviews.
                        </p>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <button className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-violet-500 text-black font-semibold text-lg overflow-hidden">
                                <span className="relative z-10">Analyze My Resume</span>
                                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors">
                                See a demo
                            </button>
                        </div>

                        {/* Trust bar */}
                        <div className="flex items-center justify-center gap-8 text-sm text-white/30">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                <span>Encrypted in transit</span>
                            </div>
                            <div className="w-px h-4 bg-white/10" />
                            <div>10,000+ resumes analyzed</div>
                            <div className="w-px h-4 bg-white/10" />
                            <div>4.9/5 rating</div>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <ChevronDown className="w-6 h-6 text-white/20" />
                </motion.div>
            </section>

            {/* Stats Section - Glassmorphism */}
            <section className="px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-4">
                        {[
                            { value: "7.4", unit: "sec", label: "Average time recruiters spend" },
                            { value: "85", unit: "%", label: "Users find their critical gap" },
                            { value: "3.2", unit: "x", label: "More interview callbacks" },
                            { value: "60", unit: "sec", label: "Time to get your verdict" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-bold mb-1">
                                    <GradientText>{stat.value}</GradientText>
                                    <span className="text-xl text-white/40">{stat.unit}</span>
                                </div>
                                <div className="text-sm text-white/40">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            How it <GradientText>works</GradientText>
                        </h2>
                        <p className="text-white/50 text-lg max-w-xl mx-auto">
                            Three steps to a recruiter-proof resume
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                icon: Target,
                                title: "Upload",
                                description: "Drop your resume. We analyze 47 data points in under 60 seconds.",
                            },
                            {
                                step: "02",
                                icon: AlertCircle,
                                title: "Discover",
                                description: "See your 7-second verdict, critical gaps, and exactly what recruiters notice first.",
                            },
                            {
                                step: "03",
                                icon: TrendingUp,
                                title: "Improve",
                                description: "Apply Red Pen rewrites and watch your signal score climb.",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                className="relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                            >
                                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center text-sm font-bold text-black">
                                    {item.step}
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-violet-500/20 flex items-center justify-center mb-5">
                                    <item.icon className="w-6 h-6 text-teal-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-white/50 leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Showcase */}
            <section className="px-6 py-24 overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6">
                                Core Feature
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight mb-6">
                                The <GradientText>7-Second Verdict</GradientText>
                            </h2>
                            <p className="text-lg text-white/50 mb-8 leading-relaxed">
                                A recruiter's honest first impression — not a generic score, but the actual judgment that determines if you move forward.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Specific, actionable feedback — not vague suggestions",
                                    "Written in a recruiter's voice, based on real patterns",
                                    "Identifies your single biggest gap immediately",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="w-3 h-3 text-black" />
                                        </div>
                                        <span className="text-white/70">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-teal-400" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Sample Verdict</span>
                                </div>
                                <p className="text-2xl font-medium leading-snug mb-4">
                                    "You read like a <span className="text-teal-400">Founder</span>, but the outcome is buried. Lead with the $2M revenue win."
                                </p>
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <div className="text-xs font-mono uppercase text-amber-400 mb-1">Critical Miss</div>
                                    <p className="text-sm text-white/70">Your title signals strategy, but evidence reads like execution.</p>
                                </div>
                            </div>

                            {/* Glow effect */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-violet-500/10 rounded-3xl blur-2xl -z-10" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Loved by <GradientText>job seekers</GradientText>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { quote: "Finally understood why I wasn't getting callbacks. Fixed everything in an hour.", name: "Sarah K.", role: "PM at Google", rating: 5 },
                            { quote: "The Critical Miss feature found what 3 career coaches missed.", name: "James R.", role: "Eng Lead at Stripe", rating: 5 },
                            { quote: "Worth every penny. Landed my dream job within 3 weeks of using the rewrites.", name: "Emily T.", role: "Designer at Figma", rating: 5 },
                        ].map((t, i) => (
                            <motion.div
                                key={t.name}
                                className="p-6 rounded-2xl bg-white/[0.03] border border-white/5"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-teal-400 text-teal-400" />
                                    ))}
                                </div>
                                <p className="text-white/80 mb-4">&ldquo;{t.quote}&rdquo;</p>
                                <div>
                                    <div className="font-medium">{t.name}</div>
                                    <div className="text-sm text-white/40">{t.role}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="px-6 py-24">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">
                            Simple <GradientText>pricing</GradientText>
                        </h2>
                        <p className="text-white/50">Start free. Upgrade when ready.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        {/* Free */}
                        <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02]">
                            <div className="text-sm text-white/40 mb-2">Free</div>
                            <div className="text-5xl font-bold mb-6">$0</div>
                            <ul className="space-y-3 mb-8">
                                {["3 analyses", "Full verdict", "Red Pen rewrites", "Critical Miss"].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-white/60">
                                        <Check className="w-4 h-4 text-teal-400" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-full border border-white/10 font-medium hover:bg-white/5 transition-colors">
                                Start Free
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-violet-500/10 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-teal-500 to-violet-500 text-black text-xs font-bold uppercase rounded-bl-xl">
                                Best Value
                            </div>
                            <div className="text-sm text-teal-400 mb-2">Pro</div>
                            <div className="text-5xl font-bold mb-6">$12<span className="text-xl text-white/40">/mo</span></div>
                            <ul className="space-y-3 mb-8">
                                {["Unlimited analyses", "LinkedIn reviews", "Job matching", "Chrome extension", "Priority support"].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-white/60">
                                        <Check className="w-4 h-4 text-teal-400" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-full bg-gradient-to-r from-teal-500 to-violet-500 text-black font-semibold hover:opacity-90 transition-opacity">
                                Get Pro
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Ready to see what they see?
                    </h2>
                    <p className="text-lg text-white/50 mb-10">
                        Join 10,000+ professionals who've upgraded their resumes.
                    </p>
                    <button className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-violet-500 text-black font-semibold text-lg">
                        <span>Analyze My Resume Now</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4 text-teal-400" />
                        <span className="text-sm text-white/40">© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-white/40">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Research</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
