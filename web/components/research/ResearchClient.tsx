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
            <main data-visual-anchor="research-hub" className="bg-paper pt-28 text-slate-900 selection:bg-brand/15 md:pt-36">
                <section className="px-6 pb-8 md:px-8 md:pb-12">
                    <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
                        <div>
                            <p className="editorial-kicker mb-4 text-slate-300">
                                Research library · {featuredArticles.length} essentials · {categories.length} themes · {totalArticles} articles
                            </p>
                            <h1
                                id="research-hub-title"
                                className="font-display text-slate-900"
                                style={{
                                    fontSize: "clamp(2.5rem, 6vw, 4.4rem)",
                                    lineHeight: 0.98,
                                    letterSpacing: "-0.04em",
                                    fontWeight: 400,
                                }}
                            >
                                The research behind the feedback
                            </h1>
                            <p className="editorial-copy-lg mt-5 max-w-[36rem] text-slate-500">
                                Real studies on how recruiters evaluate resumes, where hiring decisions form, and which edits actually improve your odds.
                            </p>
                        </div>

                        <div className="editorial-card-soft p-5">
                            <p className="editorial-kicker text-slate-300">
                                How to use this library
                            </p>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Start with the essentials</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">Read the featured pieces first, then go deeper by theme.</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Treat it like a playbook</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">Each article should help you make a concrete resume or job-search decision.</p>
                                </div>
                                <Link href="/workspace" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                                    Start free review
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-6 pb-12 md:px-8 md:pb-16">
                    <div className="mx-auto max-w-[1120px]">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <p className="editorial-kicker text-slate-300">
                                Essential reads
                            </p>
                            <Link href="/workspace" className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-700">
                                Start free review →
                            </Link>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                            <Link
                                href={featuredArticles[0].href}
                                className="editorial-card group p-7 md:p-8"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="editorial-kicker editorial-kicker-strong">
                                        {featuredArticles[0].label}
                                    </span>
                                    <span className="editorial-meta text-slate-300">{featuredArticles[0].readTime}</span>
                                </div>
                                <h2
                                    className="mt-5 max-w-[28rem] font-display text-slate-900 transition-colors group-hover:text-slate-700"
                                    style={{
                                        fontSize: "clamp(2rem, 3vw, 2.75rem)",
                                        lineHeight: 1.02,
                                        letterSpacing: "-0.03em",
                                        fontWeight: 400,
                                    }}
                                >
                                    {featuredArticles[0].title}
                                </h2>
                                <p className="editorial-copy mt-4 max-w-[30rem] text-slate-500">
                                    {featuredArticles[0].description}
                                </p>
                                <div className="mt-8 flex items-center gap-1.5 text-sm font-medium text-brand">
                                    Read article
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </Link>

                            <div className="grid gap-4">
                                {featuredArticles.slice(1).map((article) => (
                                    <Link
                                        key={article.id}
                                        href={article.href}
                                        className="editorial-card-subtle group p-6"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="editorial-kicker editorial-kicker-strong">
                                                {article.label}
                                            </span>
                                            <span className="editorial-meta text-slate-300">{article.readTime}</span>
                                        </div>
                                        <h3
                                            className="mt-4 font-display text-slate-900 transition-colors group-hover:text-slate-700"
                                            style={{
                                                fontSize: "clamp(1.35rem, 2vw, 1.8rem)",
                                                lineHeight: 1.08,
                                                letterSpacing: "-0.02em",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {article.title}
                                        </h3>
                                        <p className="mt-2.5 text-sm leading-7 text-slate-500">{article.description}</p>
                                        <div className="mt-5 flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors group-hover:text-slate-700">
                                            Read
                                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {categories.map((category, catIdx) => {
                    const [leadArticle, ...restArticles] = category.articles;
                    return (
                        <section
                            key={category.id}
                            className="px-6 md:px-8"
                            style={{
                                backgroundColor: catIdx % 2 === 0 ? "transparent" : "hsl(var(--paper-muted))",
                                paddingTop: "3.25rem",
                                paddingBottom: "3.4rem",
                            }}
                        >
                            <div className="mx-auto max-w-[1120px]">
                                <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                    <div className="max-w-[42rem]">
                                        <p className="editorial-kicker mb-2 text-slate-300">
                                            {category.id === "recruiter-psychology" && "Theme 1"}
                                            {category.id === "resume-craft" && "Theme 2"}
                                            {category.id === "job-search-strategy" && "Theme 3"}
                                        </p>
                                        <h2
                                            className="font-display text-slate-900"
                                            style={{
                                                fontSize: "clamp(1.6rem, 3vw, 2.35rem)",
                                                lineHeight: 1.05,
                                                letterSpacing: "-0.024em",
                                                fontWeight: 400,
                                            }}
                                        >
                                            {category.title}
                                        </h2>
                                        <p className="mt-2 text-sm leading-7 text-slate-500">{category.subtitle}</p>
                                    </div>
                                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                                        <span>{category.articles.length} articles</span>
                                    </div>
                                </div>

                                <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                                    <Link
                                        href={leadArticle.href}
                                        className="editorial-card group p-6 md:p-7"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="editorial-kicker editorial-kicker-strong tracking-wide">
                                                {leadArticle.tag}
                                            </span>
                                            <span className="editorial-meta text-slate-300">{leadArticle.readTime}</span>
                                        </div>
                                        <h3
                                            className="mt-4 font-display text-slate-900 transition-colors group-hover:text-slate-700"
                                            style={{
                                                fontSize: "clamp(1.6rem, 2.3vw, 2.1rem)",
                                                lineHeight: 1.06,
                                                letterSpacing: "-0.02em",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {leadArticle.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-7 text-slate-500">
                                            {leadArticle.description}
                                        </p>
                                        <div className="mt-6 flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors group-hover:text-slate-700">
                                            Read article
                                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </Link>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {restArticles.map((article) => (
                                            <Link
                                                key={article.id}
                                                href={article.href}
                                                className="group rounded-xl border border-slate-200/75 bg-white/92 p-4 transition-all hover:-translate-y-0.5"
                                                style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.02), 0 8px 20px -18px rgba(15,23,42,0.2)" }}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="editorial-kicker tracking-wide text-slate-300">
                                                        {article.tag}
                                                    </span>
                                                    <span className="text-xs text-slate-300">{article.readTime}</span>
                                                </div>
                                                <h3
                                                    className="mt-3 font-display text-slate-900 transition-colors group-hover:text-slate-700"
                                                    style={{
                                                        fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                                                        lineHeight: 1.16,
                                                        letterSpacing: "-0.012em",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {article.title}
                                                </h3>
                                                <p className="mt-1.5 text-sm leading-6 text-slate-400">
                                                    {article.description}
                                                </p>
                                                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-300 transition-colors group-hover:text-slate-500">
                                                    Read
                                                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                })}

                {/* Methodology — quiet authority signal at bottom */}
                <section
                    className="px-6 py-12 md:px-8 md:py-16"
                    style={{ backgroundColor: "hsl(var(--paper-muted))" }}
                >
                    <div className="mx-auto grid max-w-[1000px] gap-10 lg:grid-cols-[1fr_1fr]">
                        <div>
                            <p className="editorial-kicker mb-5 text-slate-400">
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
                            <p className="mt-3 max-w-[400px] text-base leading-7 text-slate-500">
                                We look at four things — based on how recruiters scan — and score each one. Then we tell you what to fix first.
                            </p>
                            <Link
                                href="/research/how-we-score"
                                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-700"
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
                                        <signal.icon className="h-4 w-4 text-brand" />
                                        <span className="text-sm font-medium text-slate-700">{signal.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold tabular-nums text-slate-400">{signal.weight}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Cross-link to guides */}
                <section className="px-6 py-8 md:px-8">
                    <div className="mx-auto max-w-[800px] text-center">
                        <p className="text-sm text-slate-400">
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
