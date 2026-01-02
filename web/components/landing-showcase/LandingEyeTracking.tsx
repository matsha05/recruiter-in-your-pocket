"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Target, Zap, PenLine } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Eye Tracking Heatmap
 * - Simulates how a recruiter's eye moves across a resume
 * - Animated heatmap zones
 * - Shows what gets attention and what gets ignored
 */

function EyeTrackingDemo() {
    const [activeZone, setActiveZone] = useState(-1);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hasStarted, setHasStarted] = useState(false);

    const zones = [
        { id: 0, label: "Name", x: 10, y: 5, w: 40, h: 8, heat: "high", time: 0.8 },
        { id: 1, label: "Title", x: 10, y: 14, w: 35, h: 6, heat: "high", time: 1.2 },
        { id: 2, label: "Company", x: 10, y: 22, w: 45, h: 6, heat: "medium", time: 0.9 },
        { id: 3, label: "First Bullet", x: 10, y: 32, w: 80, h: 5, heat: "high", time: 1.5 },
        { id: 4, label: "Second Bullet", x: 10, y: 39, w: 75, h: 5, heat: "medium", time: 0.8 },
        { id: 5, label: "Third Bullet", x: 10, y: 46, w: 70, h: 5, heat: "low", time: 0.4 },
        { id: 6, label: "Skills", x: 10, y: 56, w: 60, h: 5, heat: "medium", time: 0.6 },
        { id: 7, label: "Education", x: 10, y: 66, w: 50, h: 5, heat: "low", time: 0.5 },
    ];

    useEffect(() => {
        if (isInView && !hasStarted) {
            setHasStarted(true);
            let currentZone = 0;
            let timer: NodeJS.Timeout;

            const animateZone = () => {
                if (currentZone >= zones.length) {
                    setActiveZone(-1);
                    return;
                }
                setActiveZone(currentZone);
                timer = setTimeout(() => {
                    currentZone++;
                    animateZone();
                }, zones[currentZone].time * 1000);
            };

            setTimeout(animateZone, 500);

            return () => clearTimeout(timer);
        }
    }, [isInView, hasStarted, zones.length]);

    const heatColors = {
        high: "from-red-500/60 to-orange-500/40",
        medium: "from-yellow-500/50 to-amber-500/30",
        low: "from-blue-500/30 to-cyan-500/20",
    };

    return (
        <div ref={ref} className="relative max-w-lg mx-auto">
            {/* Resume container */}
            <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 aspect-[8.5/11] overflow-hidden">
                {/* Resume skeleton content */}
                <div className="absolute inset-0 p-8 space-y-4">
                    {/* Name */}
                    <div className="h-8 bg-gray-800 rounded w-48" />
                    {/* Title */}
                    <div className="h-5 bg-gray-400 rounded w-36" />
                    {/* Company */}
                    <div className="h-4 bg-gray-300 rounded w-44 mt-4" />
                    {/* Bullets */}
                    <div className="space-y-3 mt-6">
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-[90%]" />
                        <div className="h-3 bg-gray-200 rounded w-[85%]" />
                    </div>
                    {/* Skills */}
                    <div className="flex gap-2 mt-6 flex-wrap">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-6 bg-gray-100 rounded-full w-16" />
                        ))}
                    </div>
                    {/* Education */}
                    <div className="h-4 bg-gray-200 rounded w-40 mt-6" />
                </div>

                {/* Heatmap overlay */}
                <div className="absolute inset-0">
                    {zones.map((zone) => (
                        <motion.div
                            key={zone.id}
                            className={`absolute rounded-lg bg-gradient-to-br ${heatColors[zone.heat as keyof typeof heatColors]}`}
                            style={{
                                left: `${zone.x}%`,
                                top: `${zone.y}%`,
                                width: `${zone.w}%`,
                                height: `${zone.h}%`,
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: activeZone >= zone.id ? 0.8 : 0,
                                scale: activeZone === zone.id ? 1.05 : 1,
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    ))}
                </div>

                {/* Eye cursor */}
                <AnimatePresence>
                    {activeZone >= 0 && activeZone < zones.length && (
                        <motion.div
                            className="absolute w-8 h-8 rounded-full border-4 border-red-500 bg-red-500/20"
                            style={{
                                left: `${zones[activeZone].x + zones[activeZone].w / 2}%`,
                                top: `${zones[activeZone].y + zones[activeZone].h / 2}%`,
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500 to-orange-500" />
                    <span className="text-sm text-gray-600">High attention</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-500 to-amber-500" />
                    <span className="text-sm text-gray-600">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-cyan-500" />
                    <span className="text-sm text-gray-600">Skimmed</span>
                </div>
            </div>

            {/* Current zone label */}
            <AnimatePresence mode="wait">
                {activeZone >= 0 && activeZone < zones.length && (
                    <motion.div
                        className="absolute -right-4 md:-right-36 top-1/3 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        key={activeZone}
                    >
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Looking at</div>
                        <div className="font-semibold">{zones[activeZone].label}</div>
                        <div className="text-xs text-gray-400">{zones[activeZone].time}s</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) {
    return (
        <motion.div
            className="p-8 rounded-2xl bg-gradient-to-b from-gray-50 to-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
        >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </motion.div>
    );
}

export function LandingEyeTracking() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-7 h-7 text-orange-600" />
                        <span className="font-bold text-lg">RIYP</span>
                    </div>
                    <button className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-full hover:opacity-90 transition-opacity">
                        Get Started Free
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-8">
                            <Target className="w-4 h-4" />
                            Based on real eye-tracking studies
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                            Watch where they<br />
                            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                actually look
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                            This is how recruiters scan your resume. Some lines get 1.5 seconds. Others get 0.3. Know which is which.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Eye Tracking Demo */}
            <section className="px-6 py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-gray-900">
                            A recruiter's 7.4-second scan pattern
                        </h2>
                        <p className="text-gray-500 mt-2">Watch where attention goes - and where it doesn't</p>
                    </div>
                    <EyeTrackingDemo />
                </div>
            </section>

            {/* Features */}
            <section className="px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Get the complete picture
                        </h2>
                        <p className="text-gray-600 text-lg">Three insights that change everything</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Target}
                            title="The 7-Second Verdict"
                            description="The raw first impression. What a recruiter actually thinks in those critical seconds."
                            delay={0}
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Your Critical Miss"
                            description="The biggest gap holding you back. Often something you've never noticed."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={PenLine}
                            title="Red Pen Rewrites"
                            description="Exact replacement text for every weak line. Just copy, paste, improve."
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>

            {/* Social proof */}
            <section className="px-6 py-16 bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.blockquote
                        className="text-2xl md:text-3xl font-medium leading-relaxed mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        "I finally understood why I wasn't getting callbacks. The eye-tracking visualization was eye-opening."
                    </motion.blockquote>
                    <div className="text-gray-400">Marcus T. · Now at Google</div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        className="p-12 rounded-3xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Stop guessing what they see
                        </h2>
                        <p className="text-gray-600 text-lg mb-8">
                            Get your verdict. Free. 60 seconds. No signup.
                        </p>
                        <button className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold text-lg rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-orange-600/25">
                            Analyze My Resume
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-orange-500" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div>Based on 14 peer-reviewed studies</div>
                </div>
            </footer>
        </div>
    );
}
