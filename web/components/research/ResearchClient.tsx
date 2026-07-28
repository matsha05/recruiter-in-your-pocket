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
function ResearchArticleCard({ article, index, featured = false }: { article: ResearchArticle; index: number; featured?: boolean }) {
    return (
        <Link
            href={article.href}
            className={cn(
                "focus-ring group relative overflow-hidden rounded-sm border border-line bg-paper transition-colors hover:border-brand",
                featured && "grid min-h-[21rem] md:grid-cols-[1.2fr_0.8fr] md:items-stretch lg:col-span-2"
            )}
        >
            <div className={cn("p-6 md:p-7", featured && "flex flex-col justify-between md:p-9") }>
                <div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                        {article.note ? <span className="riyp-track-010 text-xs font-semibold uppercase text-brand">{article.note}</span> : null}
                    </div>
                    <h4 className={cn("mt-8 font-display riyp-weight-620 leading-[1] tracking-[-0.03em] text-foreground transition-colors group-hover:text-brand", featured ? "max-w-[18ch] text-[clamp(2.25rem,4vw,4rem)]" : "max-w-[22ch] text-3xl")}>{article.title}</h4>
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
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-line text-muted-foreground hover:border-brand hover:text-foreground"
                            )}
                        >
                            <span className={cn("h-0.5 w-5 shrink-0", active ? "bg-citron" : "bg-cyan-bright")} />
                            <span><span className="mr-1.5 text-xs tabular-nums">{String(index + 1).padStart(2, "0")}</span>{category.navLabel}</span>
                        </button>
                    );
                })}
            </nav>

            <div>
                <span className="sr-only" role="status" aria-live="polite">Showing {activeCategory.title}</span>
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
            title: "Does the evidence support a closer look?",
            detail: "The reader weighs relevance, ownership, progression, and results.",
            icon: UserFocus,
        },
    ];

    return (
        <figure className="research-read-map" aria-labelledby="research-read-map-title">
            <figcaption className="research-read-map-intro">
                <p className="riyp-track-012 text-xs font-semibold uppercase text-brand">The first-read map</p>
                <h2 id="research-read-map-title" className="mt-4 max-w-[15ch] font-display text-[clamp(2.4rem,4.8vw,4.8rem)] riyp-weight-620 leading-[0.96] tracking-[-0.04em] text-foreground">
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
                            <h3 className="mt-3 max-w-[16ch] font-display text-[clamp(1.8rem,2.4vw,2.6rem)] riyp-weight-620 leading-[1] tracking-[-0.025em] text-foreground">{step.title}</h3>
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
                <div className="mt-7 grid gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-2">
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
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Strong evidence changes what we check. Weak evidence stays out of the headline.</p>
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
                    <h2 className="mt-5 max-w-[15ch] font-display text-[clamp(2.5rem,4.8vw,5rem)] riyp-weight-620 leading-[0.94] tracking-[-0.045em] text-foreground">{activeFinding.question}</h2>
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
                        <p className="riyp-track-012 text-xs font-semibold uppercase text-brand">Evidence library</p>
                        <h1 className="mt-5 max-w-[8ch] font-display text-[clamp(4.5rem,9vw,9rem)] riyp-weight-620 leading-[0.82] tracking-[-0.07em] text-foreground">Research</h1>
                    </div>
                    <div>
                        <p className="max-w-[18ch] font-display text-[clamp(2.5rem,5vw,5.4rem)] riyp-weight-540 leading-[0.95] tracking-[-0.045em] text-foreground">
                            Resume advice is plentiful. Reliable evidence is harder to find.
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
                        <p className="riyp-track-011 text-xs font-semibold uppercase text-brand">Claims under review</p>
                        <h2 className="mt-4 max-w-[11ch] font-display text-[clamp(2.75rem,4.8vw,4.8rem)] riyp-weight-620 leading-[0.97] tracking-[-0.04em] text-foreground">Three resume rules that need to go.</h2>
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
                        <h2 className="font-display text-[clamp(2.75rem,5vw,5rem)] riyp-weight-620 leading-[0.96] tracking-[-0.04em] text-foreground">Read the evidence behind the advice.</h2>
                        <p className="mt-5 max-w-prose text-base leading-7 text-muted-foreground">Browse the underlying research on first impressions, writing, getting found, and hiring systems.</p>
                    </div>
                </div>
                <ResearchLibrary />

                <div className="mt-16 flex flex-col gap-5 border-t border-line bg-surface-sky p-6 md:flex-row md:items-end md:justify-between md:p-8">
                    <div>
                        <p className="riyp-track-011 text-xs font-semibold uppercase text-brand">Apply it to your resume</p>
                        <p className="mt-2 max-w-[46rem] text-base leading-7 text-muted-foreground">Your report uses the same evidence standards to show what is clear, what needs more context, and what to fix first.</p>
                    </div>
                    <Link href="/workspace" className="focus-ring inline-flex min-h-12 shrink-0 items-center gap-5 rounded-sm bg-foreground px-5 py-3 font-display text-sm font-semibold text-background transition-colors hover:bg-foreground/90">
                        See my first read <ArrowRight className="size-4 text-citron" weight="bold" />
                    </Link>
                </div>
            </ResearchSection>

            <Footer />
        </div>
    );
}
