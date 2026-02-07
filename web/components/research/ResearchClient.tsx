"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CircleGauge, ScanLine, Users } from "lucide-react";
import Footer from "@/components/landing/Footer";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const featuredArticles = [
    {
        id: "how-recruiters-read",
        title: "How Recruiters Actually Read Resumes",
        thesis: "Eye-tracking findings on first-pass filtering cues.",
        readTime: "4 min",
        href: "/research/how-recruiters-read",
        label: "Start here",
    },
    {
        id: "quantifying-impact",
        title: "The Laszlo Bock Formula",
        thesis: "How quantified outcomes change perceived impact.",
        readTime: "5 min",
        href: "/research/quantifying-impact",
        label: "Most actionable",
    },
    {
        id: "referral-advantage",
        title: "The Referral Advantage",
        thesis: "How referrals change movement through hiring funnels",
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
            { id: "how-people-scan", title: "How People Scan Text and Bullets", readTime: "4 min", href: "/research/how-people-scan" },
            { id: "ats-myths", title: "ATS: What Actually Happens", readTime: "4 min", href: "/research/ats-myths" },
            { id: "automation-filter-points", title: "Where Automation Filters You Out", readTime: "4 min", href: "/research/automation-filter-points" },
            { id: "automation-and-bias", title: "Hiring Algorithms and Bias", readTime: "4 min", href: "/research/automation-and-bias" },
            { id: "human-vs-algorithm", title: "Humans vs. Algorithms", readTime: "4 min", href: "/research/human-vs-algorithm" },
            { id: "spelling-errors-impact", title: "Spelling Errors Carry Weight", readTime: "3 min", href: "/research/spelling-errors-impact" },
            { id: "resume-error-tax", title: "The Resume Error Tax", readTime: "4 min", href: "/research/resume-error-tax" },
            { id: "hiring-discrimination-meta-analysis", title: "Discrimination in Hiring", readTime: "5 min", href: "/research/hiring-discrimination-meta-analysis" },
            { id: "bias-limits-optimization", title: "Limits of Resume Optimization", readTime: "4 min", href: "/research/bias-limits-optimization" },
        ],
    },
    {
        id: "resume-craft",
        title: "Resume Craft",
        subtitle: "Writing and structure fundamentals",
        articles: [
            { id: "how-we-score", title: "The 7.4-Second Signal Model", readTime: "5 min", href: "/research/how-we-score" },
            { id: "star-method", title: "The STAR Method", readTime: "4 min", href: "/research/star-method" },
            { id: "structured-interviews-why-star", title: "Structured Interviews Beat Vibes", readTime: "4 min", href: "/research/structured-interviews-why-star" },
            { id: "quantifying-impact", title: "The Laszlo Bock Formula", readTime: "5 min", href: "/research/quantifying-impact" },
            { id: "writing-quality-hire-probability", title: "Writing Quality Changes Hiring", readTime: "4 min", href: "/research/writing-quality-hire-probability" },
            { id: "signal-vs-clarity", title: "Signal vs. Clarity", readTime: "4 min", href: "/research/signal-vs-clarity" },
            { id: "resume-length-myths", title: "The One-Page Myth", readTime: "4 min", href: "/research/resume-length-myths" },
            { id: "page-two-gate", title: "The Page-2 Gate", readTime: "3 min", href: "/research/page-two-gate" },
        ],
    },
    {
        id: "job-search-strategy",
        title: "Job Search Strategy",
        subtitle: "LinkedIn, networking, and negotiation",
        articles: [
            { id: "linkedin-vs-resume", title: "LinkedIn vs. Resume", readTime: "4 min", href: "/research/linkedin-vs-resume" },
            { id: "linkedin-visibility", title: "LinkedIn Visibility", readTime: "5 min", href: "/research/linkedin-visibility" },
            { id: "recruiter-search-behavior", title: "Recruiter Search Behavior", readTime: "4 min", href: "/research/recruiter-search-behavior" },
            { id: "social-screening", title: "Social Screening", readTime: "4 min", href: "/research/social-screening" },
            { id: "skills-based-hiring", title: "The Skills-Based Shift", readTime: "5 min", href: "/research/skills-based-hiring" },
            { id: "skills-first-promise-reality", title: "Skills-First: Promise vs Reality", readTime: "4 min", href: "/research/skills-first-promise-reality" },
            { id: "salary-history-bans", title: "Salary History Disclosure", readTime: "4 min", href: "/research/salary-history-bans" },
            { id: "salary-anchors", title: "Salary Anchors", readTime: "4 min", href: "/research/salary-anchors" },
            { id: "referral-advantage", title: "The Referral Advantage", readTime: "4 min", href: "/research/referral-advantage" },
            { id: "referral-advantage-quantified", title: "Referral Advantage, Quantified", readTime: "4 min", href: "/research/referral-advantage-quantified" },
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
            <main className="landing-page">
                <section className="landing-section-pad landing-section-divider landing-section-hero">
                    <div className="landing-rail">
                        <header className="landing-flow-md mx-auto max-w-3xl text-center">
                            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-label-mono text-muted-foreground dark:border-slate-700 dark:bg-slate-900">
                                Research library
                            </div>
                            <h1 className="landing-title-xl">
                                Evidence before advice
                            </h1>
                            <p className="mx-auto max-w-2xl landing-copy">
                                Research on how recruiters evaluate resumes and which edits improve first-pass signal.
                            </p>
                            <div className="mx-auto inline-flex flex-wrap items-center justify-center gap-5 rounded-xl border border-border/60 bg-white px-5 py-3 text-label-mono text-muted-foreground dark:bg-slate-900">
                                <span>{featuredArticles.length} essentials</span>
                                <span>{categories.length} themes</span>
                                <span>{totalArticles} articles</span>
                            </div>
                        </header>
                    </div>
                </section>

                <section className="landing-section-pad landing-section landing-section-tight landing-section-divider">
                    <div className="landing-rail">
                        <div className="landing-section-head">
                            <div>
                                <div className="landing-kicker">Essential reads</div>
                                <h2 className="landing-title-lg">
                                    Start with these three
                                </h2>
                            </div>
                            <Link href="/workspace" className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80">
                                Run a free review
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {featuredArticles.map((article) => (
                                <Link key={article.id} href={article.href} className="group landing-card landing-card-pad card-interactive landing-flow-sm">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="rounded-full bg-brand/10 px-2 py-1 text-label-mono text-brand">{article.label}</span>
                                        <span className="text-label-mono text-muted-foreground">{article.readTime}</span>
                                    </div>
                                    <h3 className="font-display text-[24px] leading-[1.06] tracking-tight transition-colors group-hover:text-brand">
                                        {article.title}
                                    </h3>
                                    <p className="landing-copy-muted">{article.thesis}</p>
                                    <div className="inline-flex items-center gap-2 text-sm text-brand">
                                        Read article
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="landing-section-pad landing-deep-ink">
                    <div className="landing-rail landing-grid-gap grid items-start lg:grid-cols-[1.02fr_0.98fr]">
                        <div className="landing-flow-md">
                            <div className="text-label-mono text-slate-400">Methodology</div>
                            <h2 className="landing-title-lg text-slate-50">
                                Model behind every recommendation
                            </h2>
                            <p className="landing-copy-inverted max-w-[40rem]">
                                We map scan behavior to a weighted rubric, then tie each signal to evidence and rewrite priority.
                            </p>
                            <Link href="/research/how-we-score" className="inline-flex items-center gap-2 text-sm text-teal-300 hover:text-teal-200">
                                See full methodology
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="landing-deep-ink-panel landing-flow-sm">
                            <div className="space-y-3">
                                {signals.map((signal) => (
                                    <div key={signal.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <signal.icon className="h-4 w-4 text-brand" />
                                            <span className="text-sm text-slate-100">{signal.name}</span>
                                        </div>
                                        <span className="text-label-mono text-slate-300">{signal.weight}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-section-pad landing-section landing-section-tight">
                    <div className="landing-rail">
                        <div className="landing-section-head">
                            <div>
                                <div className="landing-kicker">Full library</div>
                                <h2 className="landing-title-lg">
                                    Browse by theme
                                </h2>
                            </div>
                        </div>
                        <Accordion type="multiple" className="space-y-3">
                            {categories.map((category) => (
                                <AccordionItem key={category.id} value={category.id} className="landing-card landing-card-pad">
                                    <AccordionTrigger className="py-1 text-left hover:no-underline">
                                        <div>
                                            <h3 className="font-display text-2xl leading-tight tracking-tight">{category.title}</h3>
                                            <p className="mt-1 landing-copy-muted">{category.subtitle}</p>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-0 pt-4">
                                        <div className="divide-y divide-border/40 border-t border-border/40">
                                            {category.articles.map((article) => (
                                                <Link key={article.id} href={article.href} className="group flex items-center justify-between gap-4 py-3.5">
                                                    <span className="text-sm text-foreground transition-colors group-hover:text-brand">
                                                        {article.title}
                                                    </span>
                                                    <span className="text-label-mono text-muted-foreground">{article.readTime}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        <div className="mt-7 rounded-xl border border-border/60 bg-muted/15 px-5 py-4 text-center landing-copy-muted">
                            Need practical scripts in addition to research?
                            {" "}
                            <Link href="/guides" className="text-foreground underline underline-offset-4 hover:text-brand">
                                Open guides
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
