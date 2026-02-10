"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CircleGauge, ScanLine, Users } from "lucide-react";
import Footer from "@/components/landing/Footer";

const featuredArticles = [
    {
        id: "how-recruiters-read",
        title: "How Recruiters Actually Read Resumes",
        description: "Eye tracking research on how recruiters review resumes in real time.",
        readTime: "4 min",
        href: "/research/how-recruiters-read",
        label: "Start here",
    },
    {
        id: "quantifying-impact",
        title: "The Laszlo Bock Formula",
        description: "A structured formula for turning responsibilities into quantified impact.",
        readTime: "5 min",
        href: "/research/quantifying-impact",
        label: "Most actionable",
    },
    {
        id: "referral-advantage",
        title: "The Referral Advantage",
        description: "How referrals change hiring outcomes and where they create leverage.",
        readTime: "4 min",
        href: "/research/referral-advantage",
        label: "Highest leverage",
    },
];

const categories = [
    {
        id: "recruiter-psychology",
        title: "Inside the Recruiter's Mind",
        subtitle: "How early decisions are formed",
        articles: [
            { id: "how-people-scan", title: "How People Scan Text and Bullets", description: "How readers scan resumes for structure, signal, and proof.", tag: "Usability research", readTime: "4 min", href: "/research/how-people-scan" },
            { id: "how-recruiters-read", title: "How Recruiters Actually Read Resumes", description: "Eye tracking research on how recruiters review resumes in real time.", tag: "Eye-tracking research", readTime: "4 min", href: "/research/how-recruiters-read" },
            { id: "ats-myths", title: "ATS: What Actually Happens", description: "What applicant tracking systems do — and what they don't.", tag: "ATS research", readTime: "4 min", href: "/research/ats-myths" },
            { id: "automation-filter-points", title: "Where Automation Filters You Out", description: "Where automated screening decides who advances.", tag: "Screening research", readTime: "4 min", href: "/research/automation-filter-points" },
            { id: "automation-and-bias", title: "Hiring Algorithms and Bias", description: "How algorithmic aversion shapes recruiter trust and decision-making.", tag: "Algorithmic bias", readTime: "4 min", href: "/research/automation-and-bias" },
            { id: "human-vs-algorithm", title: "Humans vs. Algorithms", description: "Why recruiters often trust human judgment over opaque algorithms.", tag: "Algorithmic aversion", readTime: "4 min", href: "/research/human-vs-algorithm" },
            { id: "spelling-errors-impact", title: "Spelling Errors Carry Weight", description: "How form and content shape first impressions in screening.", tag: "Screening heuristics", readTime: "3 min", href: "/research/spelling-errors-impact" },
            { id: "resume-error-tax", title: "The Resume Error Tax", description: "Errors are read as risk signals. The penalty is not just about spelling.", tag: "Screening heuristics", readTime: "4 min", href: "/research/resume-error-tax" },
            { id: "hiring-discrimination-meta-analysis", title: "Discrimination in Hiring", description: "A meta-analysis of what resumes can and cannot control.", tag: "Meta-analysis", readTime: "5 min", href: "/research/hiring-discrimination-meta-analysis" },
            { id: "bias-limits-optimization", title: "Limits of Resume Optimization", description: "Where resume optimization ends and systemic factors begin.", tag: "Research context", readTime: "4 min", href: "/research/bias-limits-optimization" },
        ],
    },
    {
        id: "resume-craft",
        title: "Resume Craft",
        subtitle: "Writing and structure fundamentals",
        articles: [
            { id: "how-we-score", title: "The 7.4-Second Signal Model", description: "How we measure first-impression signal — and what you can do about it.", tag: "Methodology", readTime: "5 min", href: "/research/how-we-score" },
            { id: "star-method", title: "The STAR Method", description: "The STAR method structures behavioral answers for interviews and resumes.", tag: "Interview prep", readTime: "4 min", href: "/research/star-method" },
            { id: "structured-interviews-why-star", title: "Structured Interviews Beat Vibes", description: "Why structure outperforms intuition in hiring decisions.", tag: "Interview research", readTime: "4 min", href: "/research/structured-interviews-why-star" },
            { id: "quantifying-impact", title: "The Laszlo Bock Formula", description: "Turning responsibilities into quantified impact.", tag: "Resume writing", readTime: "5 min", href: "/research/quantifying-impact" },
            { id: "writing-quality-hire-probability", title: "Writing Quality Changes Hiring", description: "Clearer resumes change outcomes, even when experience stays the same.", tag: "Writing quality", readTime: "4 min", href: "/research/writing-quality-hire-probability" },
            { id: "signal-vs-clarity", title: "Signal vs. Clarity", description: "Two competing views of what a resume does — and why clarity wins.", tag: "Resume theory", readTime: "4 min", href: "/research/signal-vs-clarity" },
            { id: "resume-length-myths", title: "The One-Page Myth", description: "Why resume length depends on experience, relevance, and clarity.", tag: "Resume structure", readTime: "4 min", href: "/research/resume-length-myths" },
            { id: "page-two-gate", title: "The Page-2 Gate", description: "Page 2 is not forbidden. It is earned by clarity on page 1.", tag: "Resume structure", readTime: "3 min", href: "/research/page-two-gate" },
        ],
    },
    {
        id: "job-search-strategy",
        title: "Job Search Strategy",
        subtitle: "LinkedIn, networking, and negotiation",
        articles: [
            { id: "linkedin-vs-resume", title: "LinkedIn vs. Resume", description: "How LinkedIn and resumes serve different roles across hiring.", tag: "Sourcing research", readTime: "4 min", href: "/research/linkedin-vs-resume" },
            { id: "linkedin-visibility", title: "LinkedIn Visibility", description: "What actually affects whether recruiters find your profile.", tag: "LinkedIn optimization", readTime: "5 min", href: "/research/linkedin-visibility" },
            { id: "recruiter-search-behavior", title: "Recruiter Search Behavior", description: "LinkedIn does not disclose ranking weights. Here is what we know.", tag: "LinkedIn research", readTime: "4 min", href: "/research/recruiter-search-behavior" },
            { id: "social-screening", title: "Social Screening", description: "Recruiters use social channels for discovery and validation.", tag: "Social screening", readTime: "4 min", href: "/research/social-screening" },
            { id: "skills-based-hiring", title: "The Skills-Based Shift", description: "How skills-first hiring changes what employers look for.", tag: "Industry trends", readTime: "5 min", href: "/research/skills-based-hiring" },
            { id: "skills-first-promise-reality", title: "Skills-First: Promise vs Reality", description: "Skills-first expands talent pools, but adoption is uneven.", tag: "Industry trends", readTime: "4 min", href: "/research/skills-first-promise-reality" },
            { id: "salary-history-bans", title: "Salary History Disclosure", description: "How early disclosure affects leverage in negotiations.", tag: "Negotiation", readTime: "4 min", href: "/research/salary-history-bans" },
            { id: "salary-anchors", title: "Salary Anchors", description: "Why early disclosure anchors compensation — and how to avoid it.", tag: "Negotiation", readTime: "4 min", href: "/research/salary-anchors" },
            { id: "referral-advantage", title: "The Referral Advantage", description: "How referrals change hiring outcomes and where they create leverage.", tag: "Job search strategy", readTime: "4 min", href: "/research/referral-advantage" },
            { id: "referral-advantage-quantified", title: "Referral Advantage, Quantified", description: "How referrals reduce uncertainty and shift hiring odds.", tag: "Networking", readTime: "4 min", href: "/research/referral-advantage-quantified" },
        ],
    },
];

const totalArticles = categories.reduce((sum, category) => sum + category.articles.length, 0);

const signals = [
    { icon: ScanLine, name: "Story signal", weight: "35%" },
    { icon: CircleGauge, name: "Impact signal", weight: "30%" },
    { icon: BookOpen, name: "Clarity signal", weight: "20%" },
    { icon: Users, name: "Readability signal", weight: "15%" },
];

export default function ResearchClient() {
    return (
        <>
            <main className="bg-[#FAFAF8] text-slate-900 selection:bg-teal-700/15 pt-28 md:pt-36">
                {/* Hero */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-[640px]">
                        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                            Research library · {featuredArticles.length} essentials · {categories.length} themes · {totalArticles} articles
                        </p>
                        <h1
                            className="font-display text-slate-900"
                            style={{
                                fontSize: "clamp(2.4rem, 6vw, 4rem)",
                                lineHeight: 1.0,
                                letterSpacing: "-0.035em",
                                fontWeight: 400,
                            }}
                        >
                            The research behind the feedback
                        </h1>
                        <p className="mt-5 max-w-[460px] text-[17px] leading-[1.7] text-slate-500">
                            Real studies on how recruiters evaluate resumes — and which edits improve your odds.
                        </p>
                    </div>
                </section>

                {/* Featured articles */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-[1120px]">
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                                Essential reads
                            </p>
                            <Link href="/workspace" className="text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-700">
                                Start free review →
                            </Link>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {featuredArticles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={article.href}
                                    className="group rounded-2xl bg-white p-6 transition-all hover:-translate-y-0.5"
                                    style={{
                                        boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "#0D7377" }}>
                                            {article.label}
                                        </span>
                                        <span className="text-[11px] text-slate-300">{article.readTime}</span>
                                    </div>
                                    <h3
                                        className="mt-3 font-display text-slate-900 transition-colors group-hover:text-slate-700"
                                        style={{
                                            fontSize: "clamp(1.2rem, 2vw, 1.45rem)",
                                            lineHeight: 1.1,
                                            letterSpacing: "-0.015em",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {article.title}
                                    </h3>
                                    <p className="mt-2.5 text-[14px] leading-[1.65] text-slate-500">{article.description}</p>
                                    <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#0D7377" }}>
                                        Read article
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Full library — themed sections */}
                {categories.map((category, catIdx) => (
                    <section
                        key={category.id}
                        className="px-6 md:px-8"
                        style={{
                            backgroundColor: catIdx % 2 === 0 ? "transparent" : "hsl(40 20% 94%)",
                            paddingTop: "3rem",
                            paddingBottom: "3rem",
                        }}
                    >
                        <div className="mx-auto max-w-[1120px]">
                            <div className="mb-6">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                                    {category.id === "recruiter-psychology" && "Theme 1"}
                                    {category.id === "resume-craft" && "Theme 2"}
                                    {category.id === "job-search-strategy" && "Theme 3"}
                                </p>
                                <h2
                                    className="font-display text-slate-900"
                                    style={{
                                        fontSize: "clamp(1.5rem, 3vw, 2rem)",
                                        lineHeight: 1.1,
                                        letterSpacing: "-0.02em",
                                        fontWeight: 400,
                                    }}
                                >
                                    {category.title}
                                </h2>
                                <p className="mt-1.5 text-[15px] text-slate-400">{category.subtitle}</p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {category.articles.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={article.href}
                                        className="group flex flex-col justify-between rounded-xl bg-white p-5 transition-all hover:-translate-y-0.5"
                                        style={{
                                            boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
                                        }}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2.5">
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-300">
                                                    {article.tag}
                                                </span>
                                                <span className="text-[10px] text-slate-300">{article.readTime}</span>
                                            </div>
                                            <h3
                                                className="font-display text-slate-900 transition-colors group-hover:text-slate-700"
                                                style={{
                                                    fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
                                                    lineHeight: 1.15,
                                                    letterSpacing: "-0.01em",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {article.title}
                                            </h3>
                                            <p className="mt-1.5 text-[13px] leading-[1.55] text-slate-400">
                                                {article.description}
                                            </p>
                                        </div>
                                        <div className="mt-3 flex items-center gap-1 text-[12px] font-medium text-slate-300 transition-colors group-hover:text-slate-500">
                                            Read
                                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}

                {/* Methodology — quiet authority signal at bottom */}
                <section
                    className="px-6 py-12 md:px-8 md:py-16"
                    style={{ backgroundColor: "hsl(40 20% 94%)" }}
                >
                    <div className="mx-auto grid max-w-[1000px] gap-10 lg:grid-cols-[1fr_1fr]">
                        <div>
                            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                Methodology
                            </p>
                            <h2
                                className="font-display text-slate-900"
                                style={{
                                    fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                                    lineHeight: 1.1,
                                    letterSpacing: "-0.02em",
                                    fontWeight: 400,
                                }}
                            >
                                How we score your resume
                            </h2>
                            <p className="mt-3 max-w-[400px] text-[16px] leading-[1.65] text-slate-500">
                                We look at four things — based on how recruiters scan — and score each one. Then we tell you what to fix first.
                            </p>
                            <Link
                                href="/research/how-we-score"
                                className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-700"
                            >
                                See full methodology
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {signals.map((signal) => (
                                <div
                                    key={signal.name}
                                    className="flex items-center justify-between rounded-lg bg-white p-4"
                                    style={{
                                        boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)",
                                    }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <signal.icon className="h-4 w-4" style={{ color: "#0D7377" }} />
                                        <span className="text-[14px] font-medium text-slate-700">{signal.name}</span>
                                    </div>
                                    <span className="text-[12px] font-semibold tabular-nums text-slate-400">{signal.weight}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Cross-link to guides */}
                <section className="px-6 py-8 md:px-8">
                    <div className="mx-auto max-w-[800px] text-center">
                        <p className="text-[14px] text-slate-400">
                            Need practical scripts in addition to research?{" "}
                            <Link href="/guides" className="text-slate-600 underline underline-offset-4 hover:text-slate-900">
                                Open guides
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
