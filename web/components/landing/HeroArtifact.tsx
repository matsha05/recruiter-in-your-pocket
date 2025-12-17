"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * HeroArtifact — The "First 6 Seconds" Resume Preview
 * 
 * A realistic resume mockup with eye-tracking heatmap overlay demonstrating
 * where recruiters actually look in their initial scan.
 * 
 * Features:
 * - Fictional sample resume with realistic structure (month/year dates, 4-5 bullets)
 * - Animated heatmap zones showing fixation areas
 * - Blurred bullet text (focus on structure, not content)
 * - "6 seconds" timer visualization
 */

// Fictional sample resume data
const sampleResume = {
    name: "Alexandra Chen",
    title: "Senior Product Manager",
    email: "a.chen@email.com",
    location: "San Francisco, CA",
    experience: [
        {
            company: "Stripe",
            title: "Senior Product Manager",
            dates: "March 2022 — Present",
            bullets: [
                "Led the redesign of the merchant onboarding flow, reducing drop-off by 34% and increasing activation rate from 67% to 89%",
                "Managed cross-functional team of 8 engineers, 2 designers, and 1 data scientist to ship 3 major platform features",
                "Defined product strategy for SMB segment ($50M ARR), presenting quarterly roadmaps to executive leadership",
                "Partnered with sales to develop pricing model that increased average deal size by 22%",
            ]
        },
        {
            company: "Airbnb",
            title: "Product Manager",
            dates: "June 2019 — February 2022",
            bullets: [
                "Owned the host earnings dashboard, serving 4M+ active hosts with $5B in annual payouts",
                "Launched dynamic pricing recommendations that increased host revenue by 18% on average",
                "Built and maintained product analytics infrastructure using Amplitude and internal tools",
                "Collaborated with trust & safety team to reduce fraudulent listings by 45%",
                "Mentored 2 associate PMs through onboarding and first ship cycles",
            ]
        }
    ],
    education: {
        school: "UC Berkeley",
        degree: "B.S. Computer Science",
        year: "2019"
    }
};

// Heatmap zones - coordinates and intensity for eye fixation areas
const heatmapZones = [
    { id: "name", x: 24, y: 24, width: 200, height: 32, intensity: 1.0, delay: 0 },
    { id: "title", x: 24, y: 56, width: 180, height: 20, intensity: 0.9, delay: 0.3 },
    { id: "company1", x: 24, y: 110, width: 80, height: 18, intensity: 0.85, delay: 0.6 },
    { id: "dates1", x: 220, y: 110, width: 120, height: 18, intensity: 0.7, delay: 0.9 },
    { id: "role1", x: 24, y: 128, width: 160, height: 18, intensity: 0.8, delay: 1.2 },
    { id: "company2", x: 24, y: 240, width: 80, height: 18, intensity: 0.6, delay: 1.8 },
];

function HeatmapOverlay() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <defs>
                <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="hsl(0, 100%, 50%)" stopOpacity="0.6" />
                    <stop offset="40%" stopColor="hsl(30, 100%, 50%)" stopOpacity="0.4" />
                    <stop offset="70%" stopColor="hsl(60, 100%, 50%)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="hsl(60, 100%, 50%)" stopOpacity="0" />
                </radialGradient>
            </defs>

            {heatmapZones.map((zone) => (
                <motion.ellipse
                    key={zone.id}
                    cx={zone.x + zone.width / 2}
                    cy={zone.y + zone.height / 2}
                    rx={zone.width / 1.5}
                    ry={zone.height * 1.5}
                    fill="url(#heatGradient)"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isVisible ? { opacity: zone.intensity * 0.8, scale: 1 } : {}}
                    transition={{
                        delay: zone.delay,
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                />
            ))}
        </svg>
    );
}

function BlurredText({ children, intensity = 1 }: { children: string; intensity?: number }) {
    return (
        <span
            className="select-none"
            style={{
                filter: `blur(${2 * intensity}px)`,
                WebkitUserSelect: "none",
                userSelect: "none"
            }}
        >
            {children}
        </span>
    );
}

function ResumeMockup() {
    return (
        <div className="relative bg-white text-[#111] text-left p-6 md:p-8 font-sans text-[11px] md:text-[12px] leading-relaxed space-y-5 overflow-hidden">
            {/* Header */}
            <div className="space-y-1 border-b border-black/10 pb-4">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{sampleResume.name}</h2>
                <div className="text-sm text-[#666]">{sampleResume.title}</div>
                <div className="text-[10px] text-[#999] flex items-center gap-3">
                    <span>{sampleResume.email}</span>
                    <span>•</span>
                    <span>{sampleResume.location}</span>
                </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Experience</h3>

                {sampleResume.experience.map((job, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-2">
                                <span className="font-semibold">{job.company}</span>
                                <span className="text-[#666]">—</span>
                                <span className="text-[#666]">{job.title}</span>
                            </div>
                            <span className="text-[10px] text-[#999] tabular-nums">{job.dates}</span>
                        </div>
                        <ul className="space-y-0.5 text-[#444]">
                            {job.bullets.map((bullet, j) => (
                                <li key={j} className="flex items-start gap-2">
                                    <span className="text-[#999] mt-[2px]">•</span>
                                    <span>
                                        <BlurredText intensity={j > 0 ? 1.2 : 0.6}>{bullet}</BlurredText>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Education - more blurred since recruiters spend less time here */}
            <div className="space-y-2 opacity-60">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Education</h3>
                <div className="flex items-baseline justify-between">
                    <div>
                        <span className="font-semibold">{sampleResume.education.school}</span>
                        <span className="text-[#666] ml-2">— {sampleResume.education.degree}</span>
                    </div>
                    <span className="text-[10px] text-[#999]">{sampleResume.education.year}</span>
                </div>
            </div>

            {/* Heatmap Overlay */}
            <HeatmapOverlay />
        </div>
    );
}

function TimerBadge() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => {
                if (prev >= 5.8) {
                    clearInterval(interval);
                    return 5.8;
                }
                return Math.min(prev + 0.1, 5.8);
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10">
                <div className="w-2 h-2 rounded-full bg-premium animate-pulse" />
                <span className="text-white text-xs font-mono tabular-nums">
                    {seconds.toFixed(1)}s
                </span>
            </div>
        </div>
    );
}

export function HeroArtifact() {
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-brand/20 via-premium/10 to-brand/20 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-700" />

                {/* Main Card */}
                <motion.div
                    className="relative bg-white rounded-lg border border-black/10 shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Timer Badge */}
                    <TimerBadge />

                    {/* Resume Content */}
                    <ResumeMockup />

                    {/* Bottom Label */}
                    <div className="px-6 py-3 border-t border-black/5 bg-black/[0.02]">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-center text-muted-foreground">
                            What a recruiter saw in 5.8 seconds
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
