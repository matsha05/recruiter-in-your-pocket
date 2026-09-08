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
import { categories, evidenceGaps, featuredFindings, type FindingVisual, type ResearchArticle } from "@/components/research/ResearchHubData";

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
                density === "hero" && "px-5 pb-14 pt-20 md:px-8 md:pb-18 md:pt-24",
                density === "default" && "px-5 py-14 max-md:py-10 md:px-8 md:py-18",
                density === "tight" && "px-5 py-6 md:px-8 md:py-12",
                className
            )}
        >
            <div className={cn("mx-auto", containerClassName)}>{children}</div>
        </section>
    );
}
function ResearchArticleCard({ article, index, featured = false }: { article: ResearchArticle; index: number; featured?: boolean }) {
    return (
        <Link
            href={article.href}
            className={cn(
                "focus-ring group relative overflow-hidden rounded-2xl border border-line bg-card transition-colors hover:border-brand md:rounded-3xl",
                featured && "grid md:min-h-[21rem] md:grid-cols-[1.2fr_0.8fr] md:items-stretch lg:col-span-2"
            )}
        >
            <div className={cn("p-5 md:p-7", featured && "flex flex-col justify-between md:p-9") }>
                <div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                        {article.note ? <span className="riyp-evidence-label text-brand">{article.note}</span> : null}
                    </div>
                    <h4 className={cn("mt-5 font-display text-[1.375rem] leading-7 tracking-tight text-foreground transition-colors group-hover:text-brand md:mt-8 md:text-report-title md:tracking-tight", featured ? "max-w-[26ch]" : "max-w-[24ch]")}>{article.title}</h4>
                    <p className={cn("mt-3 max-w-[38rem] text-sm leading-6 text-muted-foreground md:mt-4", featured ? "md:text-base" : "md:text-sm")}>{article.description}</p>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted-foreground md:mt-8 md:gap-4">
                    <span>{article.readTime}</span>
                    <span className="inline-flex items-center gap-2 font-semibold text-brand">Read the research <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
                </div>
            </div>
            {featured ? (
                <div className="relative overflow-hidden border-t border-line bg-muted p-5 md:min-h-full md:border-l md:border-t-0 md:p-7">
                    <div className="relative grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-3 md:flex md:h-full md:flex-col md:items-stretch md:justify-end">
                        <FileMagnifyingGlass size={52} weight="duotone" className="size-7 text-brand md:size-[52px]" aria-hidden="true" />
                        <p className="riyp-evidence-label text-brand md:mt-6">Start here</p>
                        <p className="col-start-2 mt-2 text-sm leading-6 text-muted-foreground md:mt-3 md:max-w-[24ch]">Each article includes its sources and explains what the findings can tell you about your resume.</p>
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
        <div className="mt-5 grid gap-6 md:mt-10 md:gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
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
                                "focus-ring flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors md:min-h-12 md:gap-3",
                                active
                                    ? "border-brand/40 bg-surface-sky text-brand"
                                    : "border-line text-muted-foreground hover:border-brand hover:text-foreground"
                            )}
                        >
                            <span className={cn("h-0.5 w-3 shrink-0 md:w-5", active ? "bg-brand" : "bg-line")} />
                            <span><span className="mr-1.5 text-xs tabular-nums">{String(index + 1).padStart(2, "0")}</span>{category.navLabel}</span>
                        </button>
                    );
                })}
            </nav>

            <div>
                <span className="sr-only" role="status" aria-live="polite">Showing {activeCategory.title}</span>
                <p className="riyp-evidence-label text-brand">{activeCategory.descriptor}</p>
                <h3 className="mt-2 max-w-[28ch] font-display text-2xl font-normal text-foreground md:mt-3 md:text-section-title">{activeCategory.title}</h3>
                <p className="mt-3 max-w-reading text-base leading-6 text-muted-foreground md:mt-4 md:text-prose">{activeCategory.subtitle}</p>
                <div className="mt-5 grid gap-3 md:mt-8 md:grid-cols-2 md:gap-4">
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
            detail: "Selectable text and clear sections help software read your resume.",
            icon: FileMagnifyingGlass,
        },
        {
            index: "02",
            label: "The scan",
            title: "Can a recruiter find what matters?",
            detail: "Make your job titles, dates, responsibilities, and results easy to find.",
            icon: Scan,
        },
        {
            index: "03",
            label: "The judgment",
            title: "Is the experience relevant?",
            detail: "A recruiter looks for relevant experience, your part in the work, and the results.",
            icon: UserFocus,
        },
    ];

    return (
        <figure className="research-read-map" aria-labelledby="research-read-map-title">
            <figcaption className="research-read-map-intro">
                <p className="riyp-evidence-label text-brand">From file to feedback</p>
                <h2 id="research-read-map-title" className="mt-4 max-w-[22ch] font-display text-3xl font-normal text-foreground md:text-section-title">
                    Three things to check in a resume.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                    A file can be easy for software to read and still leave a recruiter unsure what you did. Check both the formatting and the content.
                </p>
            </figcaption>

            <ol className="research-read-map-steps">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <li key={step.index} className="research-read-map-step">
                            <div className="research-read-map-icon" aria-hidden="true"><Icon size={27} weight="duotone" /></div>
                            <div className="riyp-evidence-label mt-8 flex items-center gap-3 text-muted-foreground">
                                <span className="text-brand">{step.index}</span>
                                <span>{step.label}</span>
                            </div>
                            <h3 className="mt-3 max-w-[20ch] font-display text-report-title tracking-tight text-foreground">{step.title}</h3>
                            <p className="mt-4 max-w-[30ch] text-sm leading-6 text-muted-foreground">{step.detail}</p>
                            {index < steps.length - 1 ? <ArrowRight className="research-read-map-arrow" size={22} aria-hidden="true" /> : null}
                        </li>
                    );
                })}
            </ol>

            <div className="research-read-map-note">
                <MagnifyingGlass size={20} weight="duotone" aria-hidden="true" />
                <p><strong>Your report helps you revise.</strong> It points out details that are missing or hard to find and suggests what to change first.</p>
            </div>
        </figure>
    );
}

function FindingVisual({ visual }: { visual: FindingVisual }) {
    if (visual === "spelling") {
        return (
            <div className="research-finding-visual research-finding-spelling" role="img" aria-label="In a hypothetical hiring experiment, five spelling errors reduced the average invitation rating by 1.85 points on a zero-to-ten scale compared with error-free resumes">
                <div className="flex items-center justify-between gap-5">
                    <div>
                        <p className="riyp-evidence-label text-muted-foreground">Change in invitation rating</p>
                        <p className="mt-3 font-display text-section-title text-foreground md:text-page-title">−1.85<span className="ml-2 text-sm tracking-normal text-brand">points</span></p>
                    </div>
                    <TextAa size={58} weight="duotone" className="text-brand" aria-hidden="true" />
                </div>
                <p className="mt-5 max-w-[33rem] text-base leading-7 text-muted-foreground">Five spelling errors versus error-free resumes, rated on a 0–10 scale.</p>
                <p className="mt-6 border-t border-line pt-4 text-sm leading-6 text-muted-foreground">These were hypothetical invitation ratings. The study did not measure actual callbacks.</p>
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
                <p className="riyp-evidence-label text-muted-foreground">What parsing actually does</p>
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
            <div className="research-finding-visual" role="img" aria-label="Comparison between a simplified resume profile and the full resume">
                <p className="riyp-evidence-label text-muted-foreground">What the study compared</p>
                <div className="mt-7 grid gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-2">
                    <div className="bg-card p-6">
                        <ChartBarHorizontal size={34} weight="duotone" className="text-muted-foreground" aria-hidden="true" />
                        <p className="mt-6 font-display text-report-title text-foreground">Resume profile</p>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">A simplified profile made from selected resume details.</p>
                        <p className="riyp-evidence-label mt-7 border-t border-line pt-4 text-muted-foreground">More agreement between raters</p>
                    </div>
                    <div className="riyp-bg-sky p-6">
                        <FileText size={34} weight="duotone" className="text-brand" aria-hidden="true" />
                        <p className="mt-6 font-display text-report-title text-foreground">Actual resume</p>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">The full document, with its original layout and context.</p>
                        <p className="riyp-evidence-label mt-7 border-t border-line pt-4 text-brand">Different cues drove judgment</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="research-finding-visual" role="img" aria-label="Recruiters in the cited experiment trusted human expert recommendations more than algorithmic recommendations">
            <p className="riyp-evidence-label text-muted-foreground">Recommendation source</p>
            <div className="mt-7 space-y-4">
                <div className="research-trust-row research-trust-row-strong">
                    <UserFocus size={34} weight="duotone" aria-hidden="true" />
                    <div><p className="font-semibold text-foreground">Human expert</p><p className="mt-1 text-sm text-muted-foreground">Higher recruiter trust</p></div>
                    <span className="riyp-evidence-label ml-auto text-brand">Trusted more</span>
                </div>
                <div className="research-trust-row">
                    <Robot size={34} weight="duotone" aria-hidden="true" />
                    <div><p className="font-semibold text-foreground">Algorithmic recommendation</p><p className="mt-1 text-sm text-muted-foreground">Lower recruiter trust</p></div>
                </div>
            </div>
            <p className="mt-7 max-w-[35rem] text-sm leading-6 text-muted-foreground">Trust and influence were different: misleading algorithmic advice still affected ratings. Check the reasoning behind a recommendation before using it.</p>
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
                    <p className="riyp-evidence-label text-brand">Four findings worth acting on</p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">See what each source found, what it does not establish, and what to do with the advice.</p>
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
                    <p className="riyp-evidence-label text-brand">Finding {activeFinding.index}</p>
                    <h2 className="mt-5 max-w-[24ch] font-display text-3xl font-normal text-foreground md:text-section-title">{activeFinding.question}</h2>
                    <p className="mt-7 max-w-reading text-prose text-muted-foreground">{activeFinding.conclusion}</p>

                    <div className="mt-8 border-l-2 border-brand pl-5">
                        <p className="riyp-evidence-label text-muted-foreground">How to use this finding</p>
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
                        <p className="riyp-evidence-label text-muted-foreground">Source</p>
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
            <ResearchSection density="hero" className="!bg-paper !pb-6 !pt-24 md:!pb-12 md:!pt-28" containerClassName="max-w-screen-xl">
                <div className="grid gap-4 md:gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-16">
                    <div>
                        <p className="riyp-evidence-label text-brand">Evidence library</p>
                        <h1 className="mt-4 font-display text-workspace-title text-foreground md:text-page-title">Research</h1>
                    </div>
                    <div>
                        <p className="max-w-reading text-base leading-7 text-muted-foreground md:text-prose">
                            What does the evidence actually say? Find the studies, recruiter experiments, and platform documentation behind the advice.
                        </p>
                    </div>
                </div>

            </ResearchSection>

            <ResearchSection density="tight" className="!bg-paper" containerClassName="max-w-screen-xl">
                <h2 className="font-display text-report-title tracking-tight text-foreground">Find your question</h2>
                <ResearchLibrary />
            </ResearchSection>

            <ResearchSection density="default" className="!bg-card" containerClassName="max-w-screen-xl">
                <FirstReadMap />
            </ResearchSection>

            <ResearchSection density="default" className="!bg-paper" containerClassName="max-w-screen-xl">
                <ResearchEvidenceTrace />
            </ResearchSection>

            <ResearchSection density="default" className="!bg-proof" containerClassName="max-w-[72rem]">
                <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
                    <div>
                        <p className="riyp-evidence-label text-brand">Claims under review</p>
                        <h2 className="mt-4 max-w-[22ch] font-display text-3xl font-normal text-foreground md:text-section-title">Three resume rules that need to go.</h2>
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

            <ResearchSection density="tight" className="!bg-paper" divider={false} containerClassName="max-w-[72rem]">
                <div className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-6 md:flex-row md:items-end md:justify-between md:rounded-3xl md:p-8">
                    <div>
                        <p className="riyp-evidence-label text-brand">Apply it to your resume</p>
                        <p className="mt-2 max-w-[46rem] text-base leading-7 text-muted-foreground">Your report uses the same evidence standards to show what is clear, what needs more context, and what to fix first.</p>
                    </div>
                    <Link href="/workspace" className="focus-ring inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-foreground px-6 py-3 text-control text-background transition-colors hover:bg-foreground/90">
                        Get my free report <ArrowRight className="size-4" weight="bold" />
                    </Link>
                </div>
            </ResearchSection>

            <Footer />
        </div>
    );
}
