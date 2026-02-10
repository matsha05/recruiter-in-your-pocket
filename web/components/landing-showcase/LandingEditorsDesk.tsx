"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PocketMark } from "@/components/icons";
import Footer from "@/components/landing/Footer";

/**
 * Landing Page: The Editor's Desk — V6 (Pixel-Perfect)
 *
 * All 20 design critique items addressed:
 * 1.  Hero dead-space → social proof pill right-aligned
 * 2.  Hero → prose cliff → tighter spacing, section surface shift
 * 3.  Prose anchoring → section label kicker added
 * 4.  Vertical rhythm → all paddings tightened 20-30%
 * 5.  Report card shadow → layered box-shadow for paper-on-desk feel
 * 6.  Section numbering → contiguous 01, 02
 * 7.  Subscore row → color-coded + subtle dividers
 * 8.  Badge button-look → smaller, no border, muted label
 * 9.  Red pen drama → strikethrough animation inside card
 * 10. Footer teaser → hints remaining section names
 * 11. Caption beneath card → removed (confidence > hedging)
 * 12. Evidence differentiation → different visual frame
 * 13. Citation treatment → monospace-style, smaller, separated
 * 14. Section transitions → subtle background shifts
 * 15. Alignment strategy → left-dominant, centered only for close
 * 16. CTA differentiation → close CTA is larger, has glow
 * 17. Footer personality → tagline + better presence
 * 18. Social proof → "1,200+ resumes reviewed" pill
 * 19. Nav active state → scroll-spy with intersection observer
 * 20. Staggered reveal → score ring cascade animation
 */

/* ─── Scroll-reveal (spring-based, subtle) ─── */
function Reveal({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}

/* ─── Editorial markup — inline in prose ─── */
function RedPenMarkup({
    original,
    replacement,
}: {
    original: string;
    replacement: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });

    return (
        <span ref={ref} className="inline">
            <span
                className="transition-all duration-700"
                style={{
                    textDecoration: inView ? "line-through" : "none",
                    textDecorationColor: "rgb(148 163 184)",
                    textDecorationThickness: "1.5px",
                    color: inView ? "rgb(148 163 184)" : undefined,
                }}
            >
                {original}
            </span>{" "}
            <motion.span
                className="font-medium"
                style={{ color: "#0D7377" }}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
            >
                {replacement}
            </motion.span>
        </span>
    );
}

/* ─── Animated Red Pen (for inside report card) ─── */
function AnimatedRedPen() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });

    return (
        <div ref={ref} className="rounded-lg border border-slate-100 p-4" style={{ backgroundColor: "hsl(210 20% 99%)" }}>
            {/* Before */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-300">Original</span>
            </div>
            <motion.p
                className="text-[13px] leading-[1.65] text-slate-500"
                style={{
                    textDecoration: inView ? "line-through" : "none",
                    textDecorationColor: "rgb(203 213 225)",
                    textDecorationThickness: "1.5px",
                }}
                animate={{
                    color: inView ? "rgb(148 163 184)" : "rgb(100 116 139)",
                }}
                transition={{ duration: 0.7, delay: 0.3 }}
            >
                Responsible for managing service deployments
            </motion.p>

            {/* Arrow separator */}
            <div className="my-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-100" />
                <motion.span
                    className="text-[10px] text-slate-300"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                >
                    ↓
                </motion.span>
                <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* After */}
            <div className="flex items-center gap-2 mb-2">
                <motion.span
                    className="text-[9px] font-bold uppercase tracking-[0.15em]"
                    style={{ color: "#0D7377" }}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                >
                    Recruiter Version
                </motion.span>
            </div>
            <motion.p
                className="text-[13px] font-medium leading-[1.65]"
                style={{ color: "#0D7377" }}
                initial={{ opacity: 0, y: 4 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                Led cross-functional migration across 4
                services, reducing deploy time by 40%
                and cutting incidents 3×
            </motion.p>
        </div>
    );
}

/* ─── Score ring (SVG-based, draws on scroll) — with staggered reveal ─── */
function ScoreRing({ score, onComplete }: { score: number; onComplete?: () => void }) {
    const circumference = 2 * Math.PI * 38;
    const offset = circumference - (score / 100) * circumference;
    const ref = useRef<SVGCircleElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const inView = useInView(ringRef, { once: true, margin: "-60px" });

    return (
        <div ref={ringRef} className="relative inline-flex items-center justify-center">
            <svg width="96" height="96" viewBox="0 0 96 96">
                {/* Background track */}
                <circle
                    cx="48"
                    cy="48"
                    r="38"
                    fill="none"
                    stroke="hsl(215 20% 93%)"
                    strokeWidth="3"
                />
                {/* Score arc — draws itself on scroll */}
                <motion.circle
                    ref={ref}
                    cx="48"
                    cy="48"
                    r="38"
                    fill="none"
                    stroke="#0D7377"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={inView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
                    transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    transform="rotate(-90 48 48)"
                    onAnimationComplete={() => onComplete?.()}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="font-display tabular-nums"
                    style={{
                        fontSize: "28px",
                        fontWeight: 400,
                        letterSpacing: "-0.02em",
                        color: "#0D7377",
                    }}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    {score}
                </motion.span>
                <motion.span
                    className="text-[11px] text-slate-400"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                >
                    /100
                </motion.span>
            </div>
        </div>
    );
}

/* ─── Staggered Subscores ─── */
function SubscoreRow() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });

    const subscores = [
        { label: "Story", score: 68 },
        { label: "Impact", score: 74 },
        { label: "Clarity", score: 81 },
        { label: "Brevity", score: 65 },
    ];

    return (
        <div ref={ref} className="mt-6 grid grid-cols-4">
            {subscores.map((sub, i) => (
                <motion.div
                    key={sub.label}
                    className="flex flex-col items-center py-3"
                    style={{
                        borderRight: i < subscores.length - 1 ? "1px solid hsl(215 20% 95%)" : "none",
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    transition={{
                        duration: 0.5,
                        delay: 1.6 + i * 0.12,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <span
                        className="text-[24px] font-semibold tabular-nums tracking-tight"
                        style={{
                            color:
                                sub.score >= 80
                                    ? "hsl(160 60% 38%)"
                                    : sub.score >= 70
                                        ? "hsl(174 72% 32%)"
                                        : "hsl(30 75% 50%)",
                        }}
                    >
                        {sub.score}
                    </span>
                    <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
                        {sub.label}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}

export function LandingEditorsDesk() {

    return (
        <div className="bg-[#FAFAF8] text-slate-900 selection:bg-teal-700/15">

            {/* ═══════════════════════════════════════════════════════
                SECTION 1 — HERO
                Fix #1: Social proof pill balances right side
                Fix #4: Tighter bottom padding
            ═══════════════════════════════════════════════════════ */}
            <section className="relative z-[2] px-6 pt-36 pb-6 md:px-8 md:pt-44 md:pb-10">
                <div className="mx-auto max-w-[1120px]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            duration: 1.2,
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                    >
                        <h1
                            className="font-display max-w-[900px] text-slate-900"
                            style={{
                                fontSize: "clamp(3rem, 7.5vw, 6.5rem)",
                                lineHeight: 1.0,
                                letterSpacing: "-0.035em",
                                fontWeight: 400,
                            }}
                        >
                            They&apos;re not reading
                            <br className="hidden sm:block" /> your resume.
                        </h1>
                    </motion.div>

                    <motion.p
                        className="mt-7 max-w-[440px] text-[18px] leading-[1.7] text-slate-500 md:mt-8 md:text-[19px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            duration: 1,
                            delay: 0.15,
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                    >
                        In 7.4 seconds, they&apos;ve already made up their
                        mind about you. We&apos;ll show you what they
                        think. And what to fix so they keep reading.
                    </motion.p>

                    <motion.div
                        className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center md:mt-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            duration: 1,
                            delay: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                    >
                        <a
                            href="/workspace"
                            className="group inline-flex w-fit items-center gap-2.5 rounded-full bg-slate-900 px-7 py-3.5 text-[15px] font-medium text-white transition-all hover:bg-slate-800 active:scale-[0.97]"
                        >
                            Run Your Free Review
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </a>
                        <span className="text-[14px] text-slate-400">
                            No credit card, no catch.
                        </span>
                    </motion.div>

                    {/* Fix #18: Social proof pill — balances hero right side */}
                    <motion.div
                        className="mt-10 flex items-center gap-3 md:mt-14"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <div className="flex -space-x-1.5">
                            {[
                                "hsl(215 50% 65%)",
                                "hsl(174 50% 50%)",
                                "hsl(30 60% 55%)",
                                "hsl(280 40% 60%)",
                            ].map((bg, i) => (
                                <div
                                    key={i}
                                    className="h-6 w-6 rounded-full border-2 border-[#FAFAF8]"
                                    style={{ backgroundColor: bg }}
                                />
                            ))}
                        </div>
                        <span className="text-[13px] text-slate-400">
                            <span className="font-medium text-slate-500">1,200+</span> resumes reviewed this month
                        </span>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 2 — THE RED-PEN PROSE
                Fix #3: Kicker label anchors the blockquote
                Fix #4: Tighter vertical padding
                Fix #15: Left-aligned (consistent with hero)
            ═══════════════════════════════════════════════════════ */}
            <section className="relative z-[2] px-6 py-8 md:px-8 md:py-12">
                <div className="mx-auto max-w-[600px]">
                    <Reveal>
                        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                            What we actually do
                        </p>
                        <div className="border-l-2 border-slate-300 pl-6 md:pl-8">
                            <p
                                className="text-slate-600"
                                style={{
                                    fontSize: "clamp(1.05rem, 2vw, 1.2rem)",
                                    lineHeight: 1.8,
                                }}
                            >
                                Not a score. Not a checklist. A recruiter&apos;s
                                honest reaction, line by line.{" "}
                                <RedPenMarkup
                                    original="Responsible for managing service deployments"
                                    replacement="Led cross-functional migration across 4 services, reducing deploy time by 40%."
                                />
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 3 — THE REPORT
                Fix #5: Layered shadow for paper-on-desk feel
                Fix #6: Contiguous section numbers (01, 02)
                Fix #7: Subscore row with dividers + color coding
                Fix #8: Badge as label, not button
                Fix #9: Animated red pen reveal
                Fix #10: Teaser footer with section names
                Fix #11: Caption removed
                Fix #13: Staggered cascade animation
            ═══════════════════════════════════════════════════════ */}
            <section id="how-it-works" className="relative z-[2] px-6 pt-6 pb-8 md:px-8 md:pt-10 md:pb-12">
                <div className="mx-auto max-w-[720px]">
                    <Reveal>
                        <div
                            className="relative overflow-hidden rounded-2xl bg-white"
                            style={{
                                boxShadow:
                                    "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06), 0 24px 56px rgba(0,0,0,0.1)",
                            }}
                        >
                            {/* Report chrome — two-row header */}
                            <div className="border-b border-slate-100/80 px-6 py-4 md:px-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <PocketMark className="h-3.5 w-3.5 text-teal-700" />
                                        <span className="text-[12px] font-medium tracking-[-0.01em] text-slate-500">
                                            Recruiter Briefing
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            Analysis complete
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2.5 flex items-baseline justify-between">
                                    <p className="text-[15px] font-semibold tracking-[-0.01em] text-slate-700">
                                        Senior Software Engineer
                                    </p>
                                    <span className="text-[11px] text-slate-300">
                                        Feb 2025
                                    </span>
                                </div>
                            </div>

                            <div className="px-6 py-6 md:px-8 md:py-7">
                                {/* ── Section 01 ── */}
                                <div className="flex items-center gap-2.5">
                                    <div className="h-px w-4 bg-slate-200" />
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        01. Recruiter First Impression
                                    </p>
                                </div>

                                {/* ── Recruiter Quote + Score ── */}
                                <div className="mt-5 grid gap-6 md:grid-cols-[1fr_auto]">
                                    <div>
                                        <p
                                            className="text-[24px] leading-[1.35] text-slate-800"
                                            style={{ fontFamily: "var(--font-sentient, serif)" }}
                                        >
                                            &ldquo;Clear senior profile.
                                            Missing the numbers that make
                                            recruiters stop scrolling.&rdquo;
                                        </p>

                                        {/* Critical Miss */}
                                        <div
                                            className="mt-5 rounded-lg px-4 py-3.5"
                                            style={{
                                                backgroundColor: "hsl(30 60% 97%)",
                                                border: "1px solid hsl(30 40% 91%)",
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="inline-block h-1.5 w-1.5 rounded-full"
                                                    style={{ backgroundColor: "hsl(30 80% 55%)" }}
                                                />
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700/80">
                                                    Critical Miss
                                                </p>
                                            </div>
                                            <p className="mt-2 text-[13px] leading-[1.65] text-slate-600">
                                                Last two roles list responsibilities
                                                without outcomes. Recruiters skip
                                                these in under 2 seconds.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Score Dial + Band Label */}
                                    <div className="flex flex-col items-center justify-start gap-2">
                                        <ScoreRing score={72} />
                                        {/* Fix #8: Label, not button */}
                                        <motion.span
                                            className="text-[10px] font-semibold uppercase tracking-[0.06em]"
                                            style={{ color: "hsl(174 50% 42%)" }}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            transition={{ delay: 1.3, duration: 0.4 }}
                                            viewport={{ once: true }}
                                        >
                                            Solid Foundation
                                        </motion.span>
                                    </div>
                                </div>

                                {/* ── Subscores Row — staggered + color-coded + dividers ── */}
                                <SubscoreRow />

                                {/* ── Divider ── */}
                                <div className="my-6 h-px bg-slate-100" />

                                {/* ── Section 02: The Red Pen (Fix #6: contiguous) ── */}
                                <div className="flex items-center gap-2.5">
                                    <div className="h-px w-4 bg-slate-200" />
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        02. The Red Pen
                                    </p>
                                </div>

                                <div className="mt-4">
                                    {/* Priority label */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#0D7377" }} />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                            High-Priority Rewrite
                                        </span>
                                    </div>

                                    {/* Fix #9: Animated red pen with strikethrough reveal */}
                                    <AnimatedRedPen />
                                </div>
                            </div>

                            {/* ── Teaser footer: Fix #10 — hint remaining sections ── */}
                            <div
                                className="relative border-t border-slate-50 px-6 py-4 md:px-8"
                                style={{
                                    background: "linear-gradient(to bottom, white, hsl(45 20% 98%))",
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                                            Showing 2 of 6
                                        </span>
                                        <span className="text-[10px] text-slate-200">·</span>
                                        <span className="text-[10px] text-slate-300 hidden sm:inline">
                                            Story Arc · Impact · Clarity · Brevity
                                        </span>
                                    </div>
                                    <a
                                        href="/workspace"
                                        className="text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-700"
                                    >
                                        See your full report →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 4 — EVIDENCE
                Fix #12: Different visual frame (full-width band, no left border)
                Fix #13: Citation as monospace footnote
                Fix #14: Background surface shift
            ═══════════════════════════════════════════════════════ */}
            <section
                id="research"
                className="relative z-[2] px-6 py-12 md:px-8 md:py-16"
                style={{ backgroundColor: "hsl(40 20% 94%)" }}
            >
                <div className="mx-auto max-w-[640px]">
                    <Reveal>
                        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            The research
                        </p>
                        <blockquote>
                            <p
                                className="font-display text-slate-700"
                                style={{
                                    fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
                                    lineHeight: 1.45,
                                    letterSpacing: "-0.01em",
                                    fontWeight: 400,
                                    fontStyle: "italic",
                                }}
                            >
                                Recruiters spend an average of 7.4
                                seconds reviewing a resume before making
                                an initial fit/no-fit decision. The first
                                third of the page receives 80% of all
                                visual attention.
                            </p>
                            {/* Fix #13: Citation as a distinct footnote */}
                            <footer className="mt-6 border-t border-slate-200/60 pt-4">
                                <p
                                    className="text-[12px] font-medium text-slate-500"
                                    style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.01em" }}
                                >
                                    TheLadders Eye-Tracking Study
                                </p>
                                <p
                                    className="mt-0.5 text-[11px] text-slate-400"
                                    style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
                                >
                                    Confirmed by NBER Working Paper #26587, 2019
                                </p>
                            </footer>
                        </blockquote>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SECTION 5 — CLOSE
                Fix #15: Centered (intentional break from left-aligned flow)
                Fix #16: CTA is larger, has subtle glow, different label
            ═══════════════════════════════════════════════════════ */}
            <section className="relative z-[2] px-6 py-16 md:px-8 md:py-24">
                <div className="mx-auto max-w-[600px] text-center">
                    <Reveal>
                        <h2
                            className="font-display text-slate-900"
                            style={{
                                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                                lineHeight: 1.0,
                                letterSpacing: "-0.035em",
                                fontWeight: 400,
                            }}
                        >
                            Your move.
                        </h2>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <p className="mx-auto mt-5 max-w-[340px] text-[18px] leading-[1.7] text-slate-500">
                            See what they see. Fix what they skip.
                        </p>
                    </Reveal>
                    <Reveal delay={0.15}>
                        <div className="mt-8">
                            {/* Fix #16: Close CTA — larger, glow, payoff wording */}
                            <a
                                href="/workspace"
                                className="group relative inline-flex items-center gap-3 rounded-full bg-slate-900 px-10 py-[18px] text-[16px] font-medium text-white transition-all hover:bg-slate-800 active:scale-[0.97]"
                                style={{
                                    boxShadow: "0 0 0 1px rgba(0,0,0,0.1), 0 4px 20px rgba(13,115,119,0.2), 0 8px 32px rgba(0,0,0,0.12)",
                                }}
                            >
                                Start Your Free Review
                                <ArrowRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1" />
                            </a>
                        </div>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <p className="mt-6 text-[13px] text-slate-400">
                            AES-256 encrypted · No data stored ·
                            Delete anytime
                        </p>
                    </Reveal>
                </div>
            </section>

            <Footer />
        </div>
    );
}
