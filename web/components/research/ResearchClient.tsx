import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { LandingSectionTag } from "@/components/landing/sections/SectionPrimitives";
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
    accentBarClassName: string;
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
                "bg-background",
                divider && "border-b border-border/60",
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

const essentialReading: ResearchArticle[] = [
    {
        id: "how-recruiters-read",
        title: "How Recruiters Actually Read Resumes",
        description: "Start here: where recruiters look first, what they skip, and why hierarchy matters so much.",
        readTime: "6 min read",
        href: "/research/how-recruiters-read",
        note: "Start here",
    },
    {
        id: "quantifying-impact",
        title: "Quantifying Impact: The Laszlo Bock Formula",
        description: "How to turn vague work into visible results.",
        readTime: "7 min read",
        href: "/research/quantifying-impact",
        note: "Core craft",
    },
    {
        id: "how-we-score",
        title: "The 7.4-Second Signal Model",
        description: "How we turn this research into a report you can actually use.",
        readTime: "5 min read",
        href: "/research/how-we-score",
        note: "Methodology",
    },
];

const categories: ResearchCategory[] = [
    {
        accentBarClassName: "bg-teal-500/70",
        descriptor: "What gets noticed first.",
        id: "attention",
        navLabel: "Attention",
        title: "Attention and first-pass judgment",
        subtitle: "These pieces explain why hierarchy, page one, and small errors change first impression.",
        articles: [
            {
                id: "how-recruiters-read",
                title: "How Recruiters Actually Read Resumes",
                description: "The foundation: where recruiters look first, what they skip, and why hierarchy matters so much.",
                readTime: "6 min read",
                href: "/research/how-recruiters-read",
                note: "Start here",
            },
            {
                id: "how-people-scan",
                title: "How People Scan Resumes",
                description: "Skimming behavior, visual anchors, and why layout either helps or gets in the way.",
                readTime: "5 min read",
                href: "/research/how-people-scan",
            },
            {
                id: "page-two-gate",
                title: "The Page-2 Gate",
                description: "Page two only works if page one earns it.",
                readTime: "5 min read",
                href: "/research/page-two-gate",
            },
            {
                id: "resume-length-myths",
                title: "Resume Length: What Research Says",
                description: "A cleaner answer to the one-page debate.",
                readTime: "6 min read",
                href: "/research/resume-length-myths",
            },
            {
                id: "spelling-errors-impact",
                title: "Spelling Errors Carry Real Weight in Recruiter Judgment",
                description: "Small mistakes do bigger damage than people think.",
                readTime: "5 min read",
                href: "/research/spelling-errors-impact",
            },
            {
                id: "resume-error-tax",
                title: "The Resume Error Tax",
                description: "Tiny trust leaks add up.",
                readTime: "5 min read",
                href: "/research/resume-error-tax",
            },
        ],
    },
    {
        accentBarClassName: "bg-amber-500/70",
        descriptor: "What makes proof easy to trust.",
        id: "writing",
        navLabel: "Writing",
        title: "Writing, evidence, and structure",
        subtitle: "These pieces cover stronger bullets, better proof, and clearer structure.",
        articles: [
            {
                id: "quantifying-impact",
                title: "Quantifying Impact: The Laszlo Bock Formula",
                description: "How to turn vague work into visible results.",
                readTime: "7 min read",
                href: "/research/quantifying-impact",
            },
            {
                id: "writing-quality-hire-probability",
                title: "Writing Quality Changes Hiring Outcomes",
                description: "Clearer writing changes how competent you look.",
                readTime: "6 min read",
                href: "/research/writing-quality-hire-probability",
            },
            {
                id: "signal-vs-clarity",
                title: "Signal vs Clarity in Resumes",
                description: "Strong experience still gets lost when the writing is muddy.",
                readTime: "5 min read",
                href: "/research/signal-vs-clarity",
            },
            {
                id: "star-method",
                title: "The STAR Method: Structure That Works",
                description: "A clean structure for bullets that need a spine.",
                readTime: "5 min read",
                href: "/research/star-method",
            },
            {
                id: "structured-interviews-why-star",
                title: "Structured Interviews Beat Vibes",
                description: "Why evidence beats charisma in evaluation.",
                readTime: "6 min read",
                href: "/research/structured-interviews-why-star",
            },
            {
                id: "how-we-score",
                title: "The 7.4-Second Signal Model",
                description: "How we turn this research into a report you can actually use.",
                readTime: "5 min read",
                href: "/research/how-we-score",
                note: "Methodology",
            },
        ],
    },
    {
        accentBarClassName: "bg-sky-500/70",
        descriptor: "What gets you found before someone opens the resume.",
        id: "visibility",
        navLabel: "Visibility",
        title: "Search, LinkedIn, and referral visibility",
        subtitle: "These cover search, LinkedIn, referrals, and what happens before someone even opens the resume.",
        articles: [
            {
                id: "recruiter-search-behavior",
                title: "Recruiter Search Behavior: What We Can Cite",
                description: "What we can actually say about search, sourcing, and keyword matching.",
                readTime: "6 min read",
                href: "/research/recruiter-search-behavior",
            },
            {
                id: "linkedin-visibility",
                title: "LinkedIn Profile Visibility Research",
                description: "What makes a profile easier to find and easier to trust.",
                readTime: "5 min read",
                href: "/research/linkedin-visibility",
            },
            {
                id: "linkedin-vs-resume",
                title: "LinkedIn vs. Resume: What Gets Seen",
                description: "Same candidate, different surface.",
                readTime: "5 min read",
                href: "/research/linkedin-vs-resume",
            },
            {
                id: "social-screening",
                title: "Social Screening: What Recruiters Look For Online",
                description: "What recruiters check once they leave the resume.",
                readTime: "6 min read",
                href: "/research/social-screening",
            },
            {
                id: "referral-advantage",
                title: "The Referral Advantage",
                description: "Why referred candidates move differently.",
                readTime: "6 min read",
                href: "/research/referral-advantage",
            },
            {
                id: "referral-advantage-quantified",
                title: "Referral Advantage, Quantified",
                description: "A tighter look at the numbers behind that advantage.",
                readTime: "5 min read",
                href: "/research/referral-advantage-quantified",
            },
        ],
    },
    {
        accentBarClassName: "bg-rose-500/70",
        descriptor: "What the resume cannot control.",
        id: "systems",
        navLabel: "Systems",
        title: "Hiring systems, bias, and market context",
        subtitle: "These explain where the resume helps, where it does not, and where the rest of the process starts shaping the outcome.",
        articles: [
            {
                id: "ats-myths",
                title: "ATS: How Applicant Tracking Systems Actually Work",
                description: "What applicant tracking systems do, and what they do not.",
                readTime: "6 min read",
                href: "/research/ats-myths",
            },
            {
                id: "automation-filter-points",
                title: "Where Automation Filters You Out",
                description: "Where the process gets automated before a recruiter forms an opinion.",
                readTime: "6 min read",
                href: "/research/automation-filter-points",
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
                title: "Recruiters Trust Humans More Than Algorithms",
                description: "Readable usually beats over-optimized when a person makes the call.",
                readTime: "5 min read",
                href: "/research/human-vs-algorithm",
            },
            {
                id: "bias-limits-optimization",
                title: "Bias and the Limits of Resume Optimization",
                description: "A good resume helps, but it does not erase structural bias.",
                readTime: "5 min read",
                href: "/research/bias-limits-optimization",
            },
            {
                id: "hiring-discrimination-meta-analysis",
                title: "Meta-analysis: Discrimination in Hiring",
                description: "A broader reminder of what resumes cannot solve.",
                readTime: "6 min read",
                href: "/research/hiring-discrimination-meta-analysis",
            },
            {
                id: "skills-based-hiring",
                title: "The Skills-Based Hiring Shift",
                description: "What is actually changing, and what is mostly talk.",
                readTime: "6 min read",
                href: "/research/skills-based-hiring",
            },
            {
                id: "skills-first-promise-reality",
                title: "Skills-First Hiring: Promise vs Reality",
                description: "The gap between hiring rhetoric and hiring behavior.",
                readTime: "7 min read",
                href: "/research/skills-first-promise-reality",
            },
            {
                id: "salary-anchors",
                title: "Salary Anchors: Avoid Self-Discounting",
                description: "Early numbers change the whole conversation.",
                readTime: "5 min read",
                href: "/research/salary-anchors",
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

function ThemeJumpLink({
    accentBarClassName,
    description,
    href,
    index,
    title,
    className,
}: {
    href: string;
    index?: string;
    title: string;
    description?: string;
    accentBarClassName?: string;
    className?: string;
}) {
    return (
        <a
            href={href}
            className={cn(
                "group block text-sm text-slate-600 transition-colors hover:text-slate-950",
                className
            )}
        >
            <div className="flex items-center gap-3">
                {accentBarClassName ? <span className={cn("h-[3px] w-5 rounded-full", accentBarClassName)} /> : null}
                {index ? <span className="font-mono text-[11px] tracking-[0.16em] text-slate-400">{index}</span> : null}
                <span className="font-medium">{title}</span>
            </div>
            {description ? <p className="mt-1 pl-8 text-sm leading-6 text-slate-500">{description}</p> : null}
        </a>
    );
}

function EssentialReadingRow({ article }: { article: ResearchArticle }) {
    return (
        <Link
            href={article.href}
            className="group grid gap-3 border-t border-slate-200/90 py-5 transition-colors hover:border-slate-300 md:grid-cols-[minmax(0,1fr)_7rem]"
        >
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-display text-[1.35rem] leading-tight tracking-tight text-slate-950 transition-colors group-hover:text-brand">
                        {article.title}
                    </h3>
                    {article.note ? <span className="landing-label text-slate-500">{article.note}</span> : null}
                </div>
                <p className="mt-2 max-w-[38rem] text-sm leading-6 text-slate-600">{article.description}</p>
            </div>
            <div className="flex items-center justify-between gap-3 md:justify-end">
                <span className="text-xs tracking-[0.03em] text-slate-400">{article.readTime}</span>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
            </div>
        </Link>
    );
}

function ResearchArticleRow({ article }: { article: ResearchArticle }) {
    return (
        <Link
            href={article.href}
            className="group grid gap-3 border-t border-slate-200/90 py-4 transition-colors hover:border-slate-300 md:grid-cols-[minmax(0,1fr)_6.5rem] md:gap-6"
        >
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-display text-[1.08rem] leading-tight tracking-tight text-slate-950 transition-colors group-hover:text-brand">
                        {article.title}
                    </h3>
                    {article.note ? <span className="landing-label text-slate-500">{article.note}</span> : null}
                </div>
                <p className="mt-1.5 max-w-[42rem] text-sm leading-6 text-slate-600">{article.description}</p>
            </div>
            <div className="flex items-center justify-between gap-3 md:justify-end">
                <span className="text-xs tracking-[0.03em] text-slate-400">{article.readTime}</span>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
            </div>
        </Link>
    );
}

function ResearchThemeSection({ category, index }: { category: ResearchCategory; index: number }) {
    return (
        <section id={category.id} className="scroll-mt-28 border-t border-slate-200/85 pt-10 first:border-t-0 first:pt-0">
            <div className="landing-flow-sm">
                <div className="flex items-center gap-3">
                    <div className={cn("h-[3px] w-10 rounded-full", category.accentBarClassName)} />
                    <div className="font-mono text-[11px] font-semibold tracking-[0.16em] text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                    </div>
                </div>
                <h2 className="landing-title-lg max-w-[36rem] text-slate-950">{category.title}</h2>
            </div>

            <p className="mt-3 max-w-[44rem] text-[15px] leading-7 text-slate-600">{category.subtitle}</p>

            <div className="mt-6 border-b border-slate-200/90">
                {category.articles.map((article) => (
                    <ResearchArticleRow key={article.id} article={article} />
                ))}
            </div>
        </section>
    );
}

export default function ResearchClient() {
    return (
        <div className="landing-page selection:bg-teal-500/20" data-visual-anchor="research-hub">
            <ResearchSection density="hero" containerClassName="max-w-[68rem]">
                <div className="mx-auto max-w-[68rem]">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
                        <div className="landing-flow-lg">
                            <LandingSectionTag index="00" label="Research Hub" />

                            <div className="landing-flow-sm">
                                <h1 className="landing-headline max-w-[46rem] text-slate-950">
                                    What shapes the first impression
                                </h1>
                                <p className="landing-subhead max-w-[39rem]">
                                    A research library on what recruiters notice first, what gets missed, and why some resumes earn trust faster than others.
                                </p>
                            </div>

                            <div className="max-w-[42rem] border-t border-slate-200/85 pt-6">
                                <p className="text-[1.05rem] leading-8 text-slate-700">
                                    Start with the question that feels most familiar, then stop when you know what to change.
                                </p>
                            </div>
                        </div>

                        <aside className="lg:pt-14">
                            <div className="border-l border-slate-200 pl-5">
                                <div className="landing-label">How to use this</div>
                                <p className="mt-4 text-sm leading-6 text-slate-500">
                                    You do not need to read everything. Start with the part that explains what keeps getting missed.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </ResearchSection>

            <ResearchSection density="default" divider={false} containerClassName="max-w-[68rem]">
                <div className="mx-auto max-w-[68rem] grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
                    <aside className="hidden lg:block">
                        <div className="sticky top-24">
                            <div className="landing-label">Browse by theme</div>
                            <nav aria-label="Research theme rail" className="mt-5 border-l border-slate-200 pl-4">
                                <div className="space-y-5">
                                    {categories.map((category, index) => (
                                        <ThemeJumpLink
                                            key={category.id}
                                            href={`#${category.id}`}
                                            index={String(index + 1).padStart(2, "0")}
                                            title={category.navLabel}
                                            description={category.descriptor}
                                            accentBarClassName={category.accentBarClassName}
                                            className="w-full"
                                        />
                                    ))}
                                </div>
                            </nav>
                            <div className="mt-8 border-l border-slate-200 pl-4">
                                <div className="landing-label">How this becomes a report</div>
                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    This research shapes the report. The report applies it to your own resume.
                                </p>
                                <Link href="/research/how-we-score" className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-950">
                                    See methodology
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </aside>

                    <div className="landing-flow-lg">
                        <div className="border-t border-slate-200/85 pt-2">
                            <p className="max-w-[43rem] text-[0.95rem] leading-7 text-slate-500">
                                Short version: start with scan behavior, then read impact and clarity.
                            </p>
                            <div className="mt-4 border-b border-slate-200/90">
                                {essentialReading.map((article) => (
                                    <EssentialReadingRow key={article.id} article={article} />
                                ))}
                            </div>
                        </div>

                        {categories.map((category, index) => (
                            <ResearchThemeSection key={category.id} category={category} index={index} />
                        ))}

                        <div className="border-t border-slate-200/85 pt-8">
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <div className="landing-label">Take it back to your report</div>
                                    <p className="mt-2 max-w-[36rem] text-sm leading-6 text-slate-600">
                                        This is the thinking behind the report. Your report shows what it means for your resume.
                                    </p>
                                </div>
                                <Link href="/workspace" className="inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-950">
                                    Open workspace
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </ResearchSection>

            <Footer />
        </div>
    );
}
