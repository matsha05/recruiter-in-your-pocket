"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ArrowSquareOut,
    BracketsAngle,
    ChartBarHorizontal,
    FileMagnifyingGlass,
    FileText,
    MagnifyingGlass,
    Robot,
    Scan,
    TextAa,
    UserFocus,
} from "@phosphor-icons/react";
import Footer from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

type ResearchArticle = {
    id: string;
    title: string;
    description: string;
    readTime: string;
    href: string;
    note?: string;
};

type ResearchCategory = {
    descriptor: string;
    id: string;
    navLabel: string;
    title: string;
    subtitle: string;
    articles: ResearchArticle[];
};

function ResearchSection({
    children,
    className,
    containerClassName,
    divider = true,
    density = "default",
}: {
    children: ReactNode;
    className?: string;
    containerClassName?: string;
    divider?: boolean;
    density?: "hero" | "default" | "tight";
}) {
    return (
        <section
            className={cn(
                density === "hero" ? "bg-paper" : "bg-proof",
                divider && "border-b border-line",
                density === "hero" && "px-6 pb-14 pt-20 md:px-8 md:pb-18 md:pt-24",
                density === "default" && "px-6 py-14 md:px-8 md:py-18",
                density === "tight" && "px-6 py-10 md:px-8 md:py-12",
                className
            )}
        >
            <div className={cn("mx-auto", containerClassName)}>{children}</div>
        </section>
    );
}

const categories: ResearchCategory[] = [
    {
        descriptor: "What recruiters may notice first.",
        id: "attention",
        navLabel: "First impressions",
        title: "What recruiters notice first",
        subtitle: "Research on first-pass attention, page length, structure, and visible errors.",
        articles: [
            {
                id: "how-recruiters-read",
                title: "What Recruiters Notice First—and What the Studies Actually Show",
                description: "What eye-tracking research observed, what it did not prove, and why structure still matters.",
                readTime: "6 min read",
                href: "/research/how-recruiters-read",
                note: "Start here",
            },
            {
                id: "resume-length-myths",
                title: "Should a Resume Be One Page?",
                description: "When one page is enough, and when a second page is worth it.",
                readTime: "6 min read",
                href: "/research/resume-length-myths",
            },
            {
                id: "spelling-errors-impact",
                title: "How Spelling Mistakes Affect Recruiter Judgment",
                description: "What controlled studies found about errors and recruiter evaluation.",
                readTime: "5 min read",
                href: "/research/spelling-errors-impact",
            },
        ],
    },
    {
        descriptor: "How to make your experience clear and credible.",
        id: "writing",
        navLabel: "Writing",
        title: "Clearer writing and stronger evidence",
        subtitle: "Research and practical guidance on bullets, context, outcomes, and structure.",
        articles: [
            {
                id: "quantifying-impact",
                title: "How to Describe a Result Without Making One Up",
                description: "How to connect what you did, the scope of the work, and what changed without manufacturing a metric.",
                readTime: "7 min read",
                href: "/research/quantifying-impact",
            },
            {
                id: "writing-quality-hire-probability",
                title: "How Writing Quality Affects Evaluation",
                description: "What research suggests about writing quality and perceived competence.",
                readTime: "6 min read",
                href: "/research/writing-quality-hire-probability",
            },
            {
                id: "star-method",
                title: "When the STAR Method Helps",
                description: "A simple way to add context, action, and results to an interview answer or resume bullet.",
                readTime: "5 min read",
                href: "/research/star-method",
            },
            {
                id: "structured-interviews-why-star",
                title: "Why Are Structured Interviews More Reliable?",
                description: "Why evidence beats charisma in evaluation.",
                readTime: "6 min read",
                href: "/research/structured-interviews-why-star",
            },
            {
                id: "how-we-score",
                title: "How We Review Your Resume",
                description: "What the report looks for, how the score is used, and what it cannot tell you.",
                readTime: "5 min read",
                href: "/research/how-we-score",
                note: "Methodology",
            },
        ],
    },
    {
        descriptor: "What gets you found before someone opens the resume.",
        id: "visibility",
        navLabel: "Getting found",
        title: "Search, LinkedIn, and referrals",
        subtitle: "What affects whether a recruiter finds you before they ever open the resume.",
        articles: [
            {
                id: "linkedin-visibility",
                title: "What Makes a LinkedIn Profile Easier to Find",
                description: "What the platform publishes, what you control, and what remains private.",
                readTime: "5 min read",
                href: "/research/linkedin-visibility",
            },
            {
                id: "social-screening",
                title: "What Recruiters Look For Beyond the Resume",
                description: "How public profiles help recruiters find candidates, review work, and check professional claims.",
                readTime: "6 min read",
                href: "/research/social-screening",
            },
            {
                id: "referral-advantage",
                title: "What a Referral Changes",
                description: "Why an application can be evaluated differently when someone adds context.",
                readTime: "6 min read",
                href: "/research/referral-advantage",
            },
        ],
    },
    {
        descriptor: "What the resume cannot control.",
        id: "systems",
        navLabel: "Hiring systems",
        title: "ATS, bias, and the hiring process",
        subtitle: "Where the resume can help, where it cannot, and how the rest of the hiring process shapes the outcome.",
        articles: [
            {
                id: "ats-myths",
                title: "What Applicant Tracking Systems Do",
                description: "How ATS software stores, searches, and routes applications—and what it usually does not do.",
                readTime: "6 min read",
                href: "/research/ats-myths",
            },
            {
                id: "automation-and-bias",
                title: "Hiring Algorithms, Equity, and Bias",
                description: "Why automated systems can reproduce bad inputs.",
                readTime: "6 min read",
                href: "/research/automation-and-bias",
            },
            {
                id: "human-vs-algorithm",
                title: "Why Algorithmic Mistakes Lose Trust Faster",
                description: "Why people judge mistakes differently when software makes them.",
                readTime: "5 min read",
                href: "/research/human-vs-algorithm",
            },
            {
                id: "hiring-discrimination-meta-analysis",
                title: "What Hiring Studies Show About Discrimination",
                description: "What resume advice cannot fix about bias in hiring.",
                readTime: "6 min read",
                href: "/research/hiring-discrimination-meta-analysis",
            },
            {
                id: "skills-first-promise-reality",
                title: "Skills-First Hiring: Promise vs Reality",
                description: "The gap between what employers say they value and how they actually hire.",
                readTime: "7 min read",
                href: "/research/skills-first-promise-reality",
            },
            {
                id: "salary-history-bans",
                title: "Salary History Bans and Negotiation Leverage",
                description: "Why the rules around disclosure matter.",
                readTime: "5 min read",
                href: "/research/salary-history-bans",
            },
        ],
    },
];

type FindingVisual = "spelling" | "parser" | "artifact" | "judgment";

const featuredFindings: Array<{
    index: string;
    slug: string;
    navLabel: string;
    question: string;
    conclusion: string;
    sourceName: string;
    sourceDetail: string;
    sourceHref: string;
    sourceLabel: string;
    reportUse: string;
    href: string;
    visual: FindingVisual;
}> = [
    {
        index: "01",
        slug: "spelling-mistakes",
        navLabel: "Spelling",
        question: "Do spelling mistakes actually change the decision?",
        conclusion: "Yes—when they pile up. In a 2023 experiment, resumes with five spelling errors received an 18.5 percentage-point lower interview probability than error-free versions.",
        sourceName: "Sterkens et al., PLOS ONE (2023)",
        sourceDetail: "Factorial survey experiment with 445 genuine recruiters evaluating resumes across eight occupations.",
        sourceHref: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0283280",
        sourceLabel: "Read the study",
        reportUse: "We flag visible errors because they can cast doubt on otherwise strong work—not because one typo predicts job performance.",
        href: "/research/spelling-errors-impact",
        visual: "spelling",
    },
    {
        index: "02",
        slug: "ats-parsing",
        navLabel: "ATS parsing",
        question: "What does an ATS do with the file?",
        conclusion: "It extracts text into fields. Greenhouse and Lever both document parsing failures caused by image files and hard-to-read formatting. Neither describes one universal score that decides every application.",
        sourceName: "Greenhouse + Lever product documentation (2025–2026)",
        sourceDetail: "Current operational documentation for two widely used applicant-tracking systems.",
        sourceHref: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse",
        sourceLabel: "Read Greenhouse documentation",
        reportUse: "We check for selectable text, conventional sections, and a reading order that survives extraction.",
        href: "/research/ats-myths",
        visual: "parser",
    },
    {
        index: "03",
        slug: "whole-resume",
        navLabel: "Whole resume",
        question: "Can a score or keyword profile stand in for the real resume?",
        conclusion: "Not safely. Recruiters changed how they judged candidates—and which cues they used—when they saw actual resumes instead of stripped-down profiles.",
        sourceName: "Fritzsche & Brannick, JOOP (2002)",
        sourceDetail: "Forty recruiters judged 60 actual resumes or corresponding resume profiles.",
        sourceHref: "https://stars.library.ucf.edu/facultybib2000/3203/",
        sourceLabel: "Read the study record",
        reportUse: "The written first read comes before the score. We keep role progression, ownership, and context attached to the evidence.",
        href: "/research/how-we-score",
        visual: "artifact",
    },
    {
        index: "04",
        slug: "human-judgment",
        navLabel: "Human judgment",
        question: "Do recruiters treat algorithmic advice like expert judgment?",
        conclusion: "No. In a 694-person resume-screening experiment, recruiting professionals trusted human expert recommendations more than algorithmic recommendations.",
        sourceName: "Lacroux & Martin-Lacroux, Frontiers in Psychology (2022)",
        sourceDetail: "Experiment with 694 professionals involved in screening job applications.",
        sourceHref: "https://pubmed.ncbi.nlm.nih.gov/35874355/",
        sourceLabel: "Read the study",
        reportUse: "We show the evidence and reasoning behind a recommendation instead of asking you to trust a black-box verdict.",
        href: "/research/human-vs-algorithm",
        visual: "judgment",
    },
];

const evidenceGaps = [
    {
        claim: "Every recruiter spends exactly six seconds on a resume.",
        correction: "Treat the opening as high-value space, but do not write for a stopwatch. No study establishes one universal timer or scan path.",
        href: "/research/how-recruiters-read",
    },
    {
        claim: "An ATS rejects a resume because it does not reach a magic score.",
        correction: "Make the file easy to parse and the evidence easy to find. There is no universal ATS score shared across employers and platforms.",
        href: "/research/ats-myths",
    },
    {
        claim: "A resume should always fit on one page.",
        correction: "Use the space your relevant evidence needs. The real rule is that page two must earn the read.",
        href: "/research/resume-length-myths",
    },
];

function ResearchArticleCard({ article, index, featured = false }: { article: ResearchArticle; index: number; featured?: boolean }) {
    return (
        <Link
            href={article.href}
            className={cn(
                "focus-ring group relative overflow-hidden rounded-sm border border-line bg-paper transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_18px_50px_rgba(48,45,38,0.08)]",
                featured && "grid min-h-[21rem] md:grid-cols-[1.2fr_0.8fr] md:items-stretch lg:col-span-2"
            )}
        >
            <div className={cn("p-6 md:p-7", featured && "flex flex-col justify-between md:p-9") }>
                <div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                        {article.note ? <span className="riyp-track-010 text-xs font-semibold uppercase text-brand">{article.note}</span> : null}
                    </div>
                    <h4 className={cn("mt-8 font-display leading-[1] tracking-[-0.03em] text-foreground transition-colors group-hover:text-brand", featured ? "max-w-[18ch] text-[clamp(2.25rem,4vw,4rem)]" : "max-w-[22ch] text-3xl")}>{article.title}</h4>
                    <p className={cn("mt-4 max-w-[38rem] leading-7 text-muted-foreground", featured ? "text-base" : "text-sm")}>{article.description}</p>
                </div>
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-4 text-xs text-muted-foreground">
                    <span>{article.readTime}</span>
                    <span className="inline-flex items-center gap-2 font-semibold text-brand">Read the research <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
                </div>
            </div>
            {featured ? (
                <div className="relative min-h-52 overflow-hidden border-t border-line bg-surface-sky p-7 md:min-h-full md:border-l md:border-t-0">
                    <div className="relative flex h-full flex-col justify-end">
                        <FileMagnifyingGlass size={52} weight="duotone" className="text-brand" aria-hidden="true" />
                        <p className="riyp-track-011 mt-6 text-xs font-semibold uppercase text-brand">Cornerstone read</p>
                        <p className="mt-3 max-w-[24ch] text-sm leading-6 text-muted-foreground">The evidence, the boundary, and the useful decision—kept together.</p>
                    </div>
                </div>
            ) : null}
        </Link>
    );
}

function ResearchLibrary() {
    const [activeCategoryId, setActiveCategoryId] = useState(categories[0].id);
    const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? categories[0];

    useEffect(() => {
        const syncFromUrl = () => {
            const topic = new URL(window.location.href).searchParams.get("topic");
            const nextCategoryId = topic && categories.some((category) => category.id === topic) ? topic : categories[0].id;
            setActiveCategoryId(nextCategoryId);
        };

        syncFromUrl();
        window.addEventListener("popstate", syncFromUrl);
        return () => window.removeEventListener("popstate", syncFromUrl);
    }, []);

    const selectCategory = (categoryId: string) => {
        setActiveCategoryId(categoryId);
        const url = new URL(window.location.href);
        url.searchParams.set("topic", categoryId);
        window.history.pushState({}, "", url);
    };

    return (
        <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
            <nav aria-label="Filter evidence by topic" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-col">
                {categories.map((category, index) => {
                    const active = category.id === activeCategory.id;
                    return (
                        <button
                            key={category.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => selectCategory(category.id)}
                            className={cn(
                                "focus-ring flex min-h-12 items-center gap-3 rounded-sm border px-3 py-2 text-left text-sm font-semibold transition-colors",
                                active
                                    ? "border-brand bg-brand text-white"
                                    : "border-line text-muted-foreground hover:border-brand hover:text-foreground"
                            )}
                        >
                            <span className={cn("h-px w-5 shrink-0", active ? "bg-white" : "bg-brand")} />
                            <span><span className="mr-1.5 text-xs tabular-nums">{String(index + 1).padStart(2, "0")}</span>{category.navLabel}</span>
                        </button>
                    );
                })}
            </nav>

            <div aria-live="polite">
                <p className="riyp-track-011 text-xs font-semibold uppercase text-brand">{activeCategory.descriptor}</p>
                <h3 className="mt-3 max-w-[28ch] font-display text-[clamp(2.25rem,4vw,3.75rem)] riyp-weight-540 leading-[1] tracking-[-0.035em] text-foreground riyp-stretch-91">{activeCategory.title}</h3>
                <p className="mt-4 max-w-prose text-base leading-7 text-muted-foreground">{activeCategory.subtitle}</p>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {activeCategory.articles.map((article, index) => <ResearchArticleCard key={article.id} article={article} index={index} featured={index === 0} />)}
                </div>
            </div>
        </div>
    );
}

function FirstReadMap() {
    const steps = [
        {
            index: "01",
            label: "The file",
            title: "Can the text be extracted?",
            detail: "Live text and clear sections give the parser something usable.",
            icon: FileMagnifyingGlass,
        },
        {
            index: "02",
            label: "The scan",
            title: "Can the evidence be found?",
            detail: "Role, scope, dates, and outcomes need a clear reading path.",
            icon: Scan,
        },
        {
            index: "03",
            label: "The judgment",
            title: "Is there enough proof to continue?",
            detail: "The reader weighs relevance, ownership, progression, and results.",
            icon: UserFocus,
        },
    ];

    return (
        <figure className="research-read-map" aria-labelledby="research-read-map-title">
            <figcaption className="research-read-map-intro">
                <p className="riyp-track-012 text-xs font-semibold uppercase text-brand">The first-read map</p>
                <h2 id="research-read-map-title" className="mt-4 max-w-[15ch] font-display text-[clamp(2.4rem,4.8vw,4.8rem)] leading-[0.96] tracking-[-0.04em] text-foreground">
                    A resume passes through three different reads.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                    Advice gets muddy when parsing, attention, and judgment are treated as the same problem. They are not.
                </p>
            </figcaption>

            <ol className="research-read-map-steps">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <li key={step.index} className="research-read-map-step">
                            <div className="research-read-map-icon" aria-hidden="true"><Icon size={27} weight="duotone" /></div>
                            <div className="riyp-track-012 mt-8 flex items-center gap-3 text-xs font-semibold uppercase text-muted-foreground">
                                <span className="text-brand">{step.index}</span>
                                <span>{step.label}</span>
                            </div>
                            <h3 className="mt-3 max-w-[16ch] font-display text-[clamp(1.8rem,2.4vw,2.6rem)] leading-[1] tracking-[-0.025em] text-foreground">{step.title}</h3>
                            <p className="mt-4 max-w-[30ch] text-sm leading-6 text-muted-foreground">{step.detail}</p>
                            {index < steps.length - 1 ? <ArrowRight className="research-read-map-arrow" size={22} aria-hidden="true" /> : null}
                        </li>
                    );
                })}
            </ol>

            <div className="research-read-map-note">
                <MagnifyingGlass size={20} weight="duotone" aria-hidden="true" />
                <p><strong>Your report works backward from the decision.</strong> It shows where real evidence becomes hard to find—and the first honest fix worth making.</p>
            </div>
        </figure>
    );
}

function FindingVisual({ visual }: { visual: FindingVisual }) {
    if (visual === "spelling") {
        return (
            <div className="research-finding-visual research-finding-spelling" role="img" aria-label="Five spelling errors were associated with an 18.5 percentage-point lower interview probability than an error-free resume in the cited experiment">
                <div className="flex items-center justify-between gap-5">
                    <div>
                        <p className="riyp-track-012 text-xs font-semibold uppercase text-muted-foreground">Interview probability</p>
                        <p className="mt-3 font-display text-[clamp(4.5rem,9vw,8rem)] leading-none tracking-[-0.06em] text-foreground">−18.5<span className="ml-1 text-[0.34em] tracking-normal text-brand">pp</span></p>
                    </div>
                    <TextAa size={58} weight="duotone" className="text-brand" aria-hidden="true" />
                </div>
                <p className="mt-5 max-w-[33rem] text-base leading-7 text-muted-foreground">Five spelling errors versus error-free resumes in the experiment.</p>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground"><span>0 errors</span><span>reference</span></div>
                        <progress className="research-progress mt-3" max="100" value="100">100%</progress>
                    </div>
                    <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground"><span>5 errors</span><span>−18.5 points</span></div>
                        <progress className="research-progress research-progress-warn mt-3" max="100" value="81.5">81.5%</progress>
                    </div>
                </div>
            </div>
        );
    }

    if (visual === "parser") {
        const parserSteps = [
            { label: "Resume file", detail: "Selectable text", icon: FileText },
            { label: "Parser", detail: "Extracts fields", icon: BracketsAngle },
            { label: "Candidate record", detail: "Recruiter reviews", icon: FileMagnifyingGlass },
        ];
        return (
            <div className="research-finding-visual" role="img" aria-label="Resume parsing flow from selectable resume text to extracted fields and a recruiter-facing candidate record">
                <p className="riyp-track-012 text-xs font-semibold uppercase text-muted-foreground">What parsing actually does</p>
                <div className="research-parser-flow mt-7">
                    {parserSteps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.label} className="contents">
                                <div className="research-parser-step">
                                    <Icon size={34} weight="duotone" aria-hidden="true" />
                                    <p className="mt-4 font-semibold text-foreground">{step.label}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{step.detail}</p>
                                </div>
                                {index < parserSteps.length - 1 ? <ArrowRight size={20} className="research-parser-arrow" aria-hidden="true" /> : null}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <p className="research-parser-note"><span className="text-brand">Works better:</span> live text, familiar headings, simple reading order.</p>
                    <p className="research-parser-note"><span className="font-semibold text-foreground">Can break:</span> images, word art, complex tables, headers, and footers.</p>
                </div>
            </div>
        );
    }

    if (visual === "artifact") {
        return (
            <div className="research-finding-visual" role="img" aria-label="Comparison between a stripped-down resume profile and the actual resume artifact">
                <p className="riyp-track-012 text-xs font-semibold uppercase text-muted-foreground">What the study compared</p>
                <div className="mt-7 grid gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-2">
                    <div className="bg-white p-6">
                        <ChartBarHorizontal size={34} weight="duotone" className="text-muted-foreground" aria-hidden="true" />
                        <p className="mt-6 font-display text-3xl leading-none text-foreground">Resume profile</p>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">Variables reduced to a clean set of cues.</p>
                        <p className="riyp-track-010 mt-7 border-t border-line pt-4 text-xs font-semibold uppercase text-muted-foreground">More agreement between raters</p>
                    </div>
                    <div className="riyp-bg-sky p-6">
                        <FileText size={34} weight="duotone" className="text-brand" aria-hidden="true" />
                        <p className="mt-6 font-display text-3xl leading-none text-foreground">Actual resume</p>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">The real document, hierarchy, context, and presentation.</p>
                        <p className="riyp-track-010 mt-7 border-t border-line pt-4 text-xs font-semibold uppercase text-brand">Different cues drove judgment</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="research-finding-visual" role="img" aria-label="Recruiters in the cited experiment trusted human expert recommendations more than algorithmic recommendations">
            <p className="riyp-track-012 text-xs font-semibold uppercase text-muted-foreground">Recommendation source</p>
            <div className="mt-7 space-y-4">
                <div className="research-trust-row research-trust-row-strong">
                    <UserFocus size={34} weight="duotone" aria-hidden="true" />
                    <div><p className="font-semibold text-foreground">Human expert</p><p className="mt-1 text-sm text-muted-foreground">Higher recruiter trust</p></div>
                    <span className="riyp-track-010 ml-auto text-xs font-semibold uppercase text-brand">Trusted more</span>
                </div>
                <div className="research-trust-row">
                    <Robot size={34} weight="duotone" aria-hidden="true" />
                    <div><p className="font-semibold text-foreground">Algorithmic recommendation</p><p className="mt-1 text-sm text-muted-foreground">Lower recruiter trust</p></div>
                </div>
            </div>
            <p className="mt-7 max-w-[35rem] text-sm leading-6 text-muted-foreground">The useful lesson is not “humans good, software bad.” It is that unexplained recommendations are harder to trust—especially when they conflict with the evidence.</p>
        </div>
    );
}

function ResearchEvidenceTrace() {
    const [activeIndex, setActiveIndex] = useState(0);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const activeFinding = featuredFindings[activeIndex];

    useEffect(() => {
        const syncFromUrl = () => {
            const finding = new URL(window.location.href).searchParams.get("finding");
            const nextIndex = featuredFindings.findIndex((item) => item.slug === finding);
            if (nextIndex >= 0) setActiveIndex(nextIndex);
        };

        syncFromUrl();
        window.addEventListener("popstate", syncFromUrl);
        return () => window.removeEventListener("popstate", syncFromUrl);
    }, []);

    useEffect(() => {
        tabRefs.current[activeIndex]?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, [activeIndex]);

    const selectFinding = (index: number) => {
        setActiveIndex(index);
        const url = new URL(window.location.href);
        url.searchParams.set("finding", featuredFindings[index].slug);
        window.history.replaceState({}, "", url);
    };

    const moveFindingFocus = (index: number, direction: -1 | 1) => {
        const nextIndex = (index + direction + featuredFindings.length) % featuredFindings.length;
        selectFinding(nextIndex);
        window.requestAnimationFrame(() => document.getElementById(`research-finding-tab-${nextIndex}`)?.focus());
    };

    return (
        <div className="research-evidence-stage" aria-label="Research findings you can use">
            <div className="research-evidence-stage-head">
                <div>
                    <p className="riyp-track-012 text-xs font-semibold uppercase text-brand">Four findings worth acting on</p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Strong enough to change what we check—or left out of the headline.</p>
                </div>
                <div className="research-evidence-tabs" role="tablist" aria-label="Research findings">
                    {featuredFindings.map((finding, index) => (
                        <button
                            ref={(element) => { tabRefs.current[index] = element; }}
                            key={finding.slug}
                            id={`research-finding-tab-${index}`}
                            type="button"
                            role="tab"
                            aria-selected={index === activeIndex}
                            aria-controls="research-finding-panel"
                            tabIndex={index === activeIndex ? 0 : -1}
                            onClick={() => selectFinding(index)}
                            onKeyDown={(event) => {
                                if (event.key === "ArrowRight") {
                                    event.preventDefault();
                                    moveFindingFocus(index, 1);
                                } else if (event.key === "ArrowLeft") {
                                    event.preventDefault();
                                    moveFindingFocus(index, -1);
                                }
                            }}
                            className={cn("research-evidence-tab focus-ring", index === activeIndex && "is-active")}
                        >
                            <span className="mr-2 tabular-nums text-brand">{finding.index}</span>
                            {finding.navLabel}
                        </button>
                    ))}
                </div>
            </div>

            <article
                key={activeFinding.slug}
                id="research-finding-panel"
                role="tabpanel"
                aria-labelledby={`research-finding-tab-${activeIndex}`}
                className="research-finding riyp-evidence-trace-enter"
            >
                <div className="research-finding-copy">
                    <p className="riyp-track-011 text-xs font-semibold uppercase text-brand">Finding {activeFinding.index}</p>
                    <h2 className="mt-5 max-w-[15ch] font-display text-[clamp(2.5rem,4.8vw,5rem)] leading-[0.94] tracking-[-0.045em] text-foreground">{activeFinding.question}</h2>
                    <p className="mt-7 max-w-2xl text-[clamp(1.05rem,1.7vw,1.35rem)] leading-7 text-muted-foreground">{activeFinding.conclusion}</p>

                    <div className="mt-8 border-l-2 border-brand pl-5">
                        <p className="riyp-track-010 text-xs font-semibold uppercase text-muted-foreground">What this changes in your report</p>
                        <p className="mt-3 max-w-[38rem] text-sm leading-6 text-muted-foreground">{activeFinding.reportUse}</p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                        <Link href={activeFinding.href} className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-brand">
                            See our explanation <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <a href={activeFinding.sourceHref} target="_blank" rel="noreferrer" className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-muted-foreground hover:text-foreground">
                            {activeFinding.sourceLabel} <ArrowSquareOut size={16} />
                        </a>
                    </div>
                </div>

                <div className="research-finding-proof">
                    <FindingVisual visual={activeFinding.visual} />
                    <div className="research-source-note">
                        <p className="riyp-track-010 text-xs font-semibold uppercase text-muted-foreground">Source</p>
                        <p className="mt-2 font-semibold text-foreground">{activeFinding.sourceName}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeFinding.sourceDetail}</p>
                    </div>
                </div>
            </article>
        </div>
    );
}

export default function ResearchClient() {
    return (
        <div className="lift-page research-page selection:bg-brand/15" data-visual-anchor="research-hub">
            <ResearchSection density="hero" className="!bg-paper !pb-12 !pt-24 md:!pb-16 md:!pt-32" containerClassName="max-w-screen-xl">
                <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-24">
                    <div>
                        <p className="riyp-track-012 text-xs font-semibold uppercase text-brand">Research, with the receipts</p>
                        <h1 className="mt-5 max-w-[8ch] font-display text-[clamp(4.5rem,9vw,9rem)] leading-[0.82] tracking-[-0.07em] text-foreground">Research</h1>
                    </div>
                    <div>
                        <p className="max-w-[18ch] font-display text-[clamp(2.5rem,5vw,5.4rem)] leading-[0.95] tracking-[-0.045em] text-foreground">
                            There is a lot of resume advice. Some of it is even true.
                        </p>
                        <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground">
                            We track down the studies, platform documentation, and recruiter experiments—then keep the part that changes what you should do.
                        </p>
                    </div>
                </div>

                <dl className="research-source-ledger">
                    <div><dt>445 recruiters</dt><dd>Spelling experiment</dd></div>
                    <div><dt>694 hiring professionals</dt><dd>Trust experiment</dd></div>
                    <div><dt>40 recruiters · 60 resumes</dt><dd>Real-document study</dd></div>
                    <div><dt>Greenhouse + Lever</dt><dd>Current parser documentation</dd></div>
                </dl>
            </ResearchSection>

            <ResearchSection density="default" className="!bg-surface-sky" containerClassName="max-w-screen-xl">
                <FirstReadMap />
            </ResearchSection>

            <ResearchSection density="default" className="!bg-paper" containerClassName="max-w-screen-xl">
                <ResearchEvidenceTrace />
            </ResearchSection>

            <ResearchSection density="default" className="!bg-proof" containerClassName="max-w-[72rem]">
                <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
                    <div>
                        <p className="riyp-track-011 text-xs font-semibold uppercase text-brand">Folklore, retired</p>
                        <h2 className="mt-4 max-w-[11ch] font-display text-[clamp(2.75rem,4.8vw,4.8rem)] leading-[0.97] tracking-[-0.04em] text-foreground">Three resume rules that need to go.</h2>
                        <p className="mt-5 max-w-[34rem] text-base leading-7 text-muted-foreground">Each sounds certain. The research is more specific.</p>
                    </div>
                    <div className="border-b border-line">
                        {evidenceGaps.map((gap, index) => (
                            <article key={gap.claim} className="border-t border-line py-7">
                                <div className="flex gap-5">
                                    <span className="text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                                    <div>
                                        <h3 className="text-base font-semibold leading-6 text-foreground">{gap.claim}</h3>
                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{gap.correction}</p>
                                        <Link href={gap.href} className="focus-ring group mt-4 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-brand">
                                            See the research <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </ResearchSection>

            <ResearchSection density="default" className="!bg-paper" divider={false} containerClassName="max-w-[72rem]">
                <div className="grid gap-5 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-12">
                    <p className="riyp-track-011 text-xs font-semibold uppercase text-brand">All research</p>
                    <div>
                        <h2 className="font-display text-[clamp(2.75rem,5vw,5rem)] leading-[0.96] tracking-[-0.04em] text-foreground">Keep digging.</h2>
                        <p className="mt-5 max-w-prose text-base leading-7 text-muted-foreground">Browse the underlying research on first impressions, writing, getting found, and hiring systems.</p>
                    </div>
                </div>
                <ResearchLibrary />

                <div className="mt-16 flex flex-col gap-5 border-t border-line bg-surface-sky p-6 md:flex-row md:items-end md:justify-between md:p-8">
                    <div>
                        <p className="riyp-track-011 text-xs font-semibold uppercase text-brand">Apply it to your resume</p>
                        <p className="mt-2 max-w-[46rem] text-base leading-7 text-muted-foreground">Your report uses the same evidence standards to show what is clear, what needs more context, and what to fix first.</p>
                    </div>
                    <Link href="/workspace" className="focus-ring inline-flex min-h-12 shrink-0 items-center gap-5 rounded-sm bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong">
                        See my first read <ArrowRight className="size-4" />
                    </Link>
                </div>
            </ResearchSection>

            <Footer />
        </div>
    );
}
