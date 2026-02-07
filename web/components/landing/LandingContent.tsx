"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Award,
    BarChart2,
    BookOpen,
    ExternalLink,
    Lock,
    Quote,
    Shield,
    Trash2,
    Users,
} from "lucide-react";
import { SixSecondIcon } from "@/components/icons";

import Footer from "@/components/landing/Footer";
import { HeroReportArtifact } from "@/components/landing/HeroReportArtifact";
import { PricingCard } from "@/components/shared/PricingCard";
import { Analytics } from "@/lib/analytics";
import type { ReportData } from "@/components/workspace/report/ReportTypes";

function HeroStat({
    value,
    label,
    sublabel,
    highlight = false,
    valueClassName,
}: {
    value: ReactNode;
    label: string;
    sublabel?: string;
    highlight?: boolean;
    valueClassName?: string;
}) {
    return (
        <div className="text-center">
            <div
                className={`font-mono ${highlight ? "text-brand" : "text-slate-900 dark:text-slate-100"} ${valueClassName ?? "text-3xl font-bold"}`}
            >
                {value}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</div>
            {sublabel ? <div className="text-[10px] text-slate-400 mt-1">{sublabel}</div> : null}
        </div>
    );
}

const HERO_REPORT_SAMPLE: ReportData = {
    score: 87,
    score_comment_short: "Strong story. Weak quantified impact.",
    biggest_gap_example: "Impact metrics missing in two recent roles.",
    top_fixes: [
        {
            fix: "Add one measurable business outcome per recent role.",
            evidence: {
                excerpt: "Led migration across 4 services.",
                section: "Work Experience",
            },
            confidence: "high",
        },
    ],
    subscores: {
        story: 92,
        impact: 78,
        clarity: 85,
        readability: 68,
    },
};

const signalCards = [
    {
        icon: BarChart2,
        title: "Story Signal",
        description: "Will they keep reading after first scan?",
        weight: "35%",
        citation: "NBER, 2019",
    },
    {
        icon: Users,
        title: "Impact Signal",
        description: "Are outcomes tied to business value?",
        weight: "30%",
        citation: "Bock/Google, 2015",
    },
    {
        icon: SixSecondIcon,
        title: "Clarity Signal",
        description: "Can role and level parse at a glance?",
        weight: "20%",
        citation: "Ladders, 2018",
    },
    {
        icon: BookOpen,
        title: "Readability Signal",
        description: "Is this easy to scan under time pressure?",
        weight: "15%",
        citation: "Eye-tracking, 2018",
    },
];

const curatedResearch = [
    {
        category: "Resume writing",
        title: "The Laszlo Bock Formula",
        readTime: "5 min",
        copy: "Quantified outcomes and perceived impact",
        icon: BarChart2,
        href: "/research/quantifying-impact",
    },
    {
        category: "Job search strategy",
        title: "The Referral Advantage",
        readTime: "4 min",
        copy: "Referral patterns that shift interview odds",
        icon: Users,
        href: "/research/referral-advantage",
    },
];

const testimonialCards = [
    {
        quote: "Executive coaches charge $500+ for less operational detail than this.",
        name: "Jennifer Martinez",
        role: "Career Coach",
        company: "$450/hr clients",
    },
    {
        quote: "I have reviewed thousands of resumes. This catches the same misses we flag in interview loops.",
        name: "Marcus Williams",
        role: "VP Engineering",
        company: "Series C Startup",
    },
];

export default function LandingContent() {
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const firstPassPlaybackSeconds = 7.4;

    async function handleCheckout(tier: "monthly" | "lifetime") {
        setCheckoutLoading(tier);
        try {
            Analytics.checkoutStarted(tier, tier === "monthly" ? 9 : 79);
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tier,
                    source: "landing",
                    idempotencyKey: crypto.randomUUID(),
                }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (e) {
            Analytics.track("checkout_start_failed", { source: "landing", tier });
            console.error(e);
        } finally {
            setCheckoutLoading(null);
        }
    }

    return (
        <div className="landing-page selection:bg-teal-500/20">
            <section className="landing-section-pad landing-section-divider landing-section-hero">
                <div className="landing-rail">
                    <div className="grid items-start landing-grid-gap lg:grid-cols-[0.98fr_1.02fr]">
                        <div className="landing-flow-lg">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                <BookOpen className="w-3.5 h-3.5" />
                                Methodology grounded in recruiting science
                            </div>

                            <h1 className="text-hero text-[46px] font-normal leading-[0.96] tracking-tight md:text-[58px] lg:text-[64px]">
                                See what they see before they move on.
                            </h1>

                            <p className="max-w-[33rem] landing-copy">
                                Get the first-pass verdict, the evidence behind it, and what to rewrite first.
                            </p>

                            <div className="overflow-hidden rounded-[12px] border border-border/60 bg-white/95 dark:bg-slate-900/65">
                                <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-5 py-3.5">
                                    <div className="flex items-center gap-2 text-label-mono">
                                        <SixSecondIcon className="w-4 h-4 text-brand" />
                                        7.4-Second Window
                                    </div>
                                    <span className="text-label-mono text-muted-foreground">First-pass filter</span>
                                </div>
                                <div className="grid sm:grid-cols-3 divide-x divide-border/60">
                                    <div className="px-5 py-5">
                                        <HeroStat
                                            value="7.4s"
                                            label="Avg first scan"
                                            sublabel="Ladders 2018"
                                            highlight
                                            valueClassName="text-[46px] leading-none font-semibold tracking-tight"
                                        />
                                    </div>
                                    <div className="px-5 py-5">
                                        <HeroStat
                                            value="250+"
                                            label="Applicants per role"
                                            sublabel="Large-market benchmark"
                                            valueClassName="text-[42px] leading-none font-semibold tracking-tight"
                                        />
                                    </div>
                                    <div className="px-5 py-5">
                                        <HeroStat
                                            value="3"
                                            label="Priority fixes"
                                            sublabel="First review"
                                            valueClassName="text-[42px] leading-none font-semibold tracking-tight"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="max-w-[34rem] landing-flow-sm landing-copy-muted">
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand" />
                                    Verdict and critical miss
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand" />
                                    Evidence-linked rewrite
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand" />
                                    Priority order for next iteration
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    href="/workspace"
                                    onClick={() => {
                                        Analytics.track("landing_cta_clicked", {
                                            cta: "hero_run_free_review",
                                            destination: "/workspace",
                                        });
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
                                >
                                    Run Free Review
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/research/how-we-score" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand transition-colors flex items-center gap-1">
                                    View methodology
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-500">
                                First review free. No card required. Reports save only if you choose.
                            </p>
                        </div>

                        <div className="lg:pt-0.5">
                            <HeroReportArtifact
                                data={HERO_REPORT_SAMPLE}
                                playbackSeconds={firstPassPlaybackSeconds}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section id="evidence" className="landing-section-pad landing-section landing-section-tight landing-section-divider">
                <div className="landing-rail">
                    <div className="grid items-start landing-grid-gap lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="landing-flow-md">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-label-mono text-muted-foreground dark:border-slate-700">
                                The 7.4-second signal model
                            </div>
                            <h2 className="landing-title-xl">
                                Evidence before advice
                            </h2>
                            <p className="max-w-[34rem] landing-copy">
                                Four weighted signals mapped to line-level evidence.
                            </p>

                            <div className="landing-card landing-card-pad landing-flow-sm">
                                <div className="landing-eyebrow">Decision contract</div>
                                <ol className="landing-flow-sm landing-copy">
                                    <li>1. Find what triggers the decision.</li>
                                    <li>2. Show the exact line that caused it.</li>
                                    <li>3. Rewrite in priority order.</li>
                                </ol>
                                <Link href="/research/how-we-score" className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80">
                                    See full methodology
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="grid landing-grid-gap sm:grid-cols-2">
                            {signalCards.map((card) => (
                                <div key={card.title} className="landing-card landing-card-pad-compact landing-flow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="w-8 h-8 rounded-md bg-brand/10 text-brand flex items-center justify-center">
                                            <card.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-label-mono text-muted-foreground">{card.weight}</span>
                                    </div>
                                    <h3 className="font-display text-[21px] leading-[1.08] tracking-tight">{card.title}</h3>
                                    <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">{card.description}</p>
                                    <div className="inline-flex items-center rounded bg-muted/25 px-2 py-0.5 text-label-mono text-muted-foreground">
                                        {card.citation}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="landing-section-split">
                        <div className="landing-section-head">
                            <div>
                                <div className="landing-kicker">Research-backed by design</div>
                                <h3 className="landing-title-lg">
                                    Built on how recruiters decide
                                </h3>
                                <p className="landing-copy-muted">
                                    Research translated into practical edits you can apply immediately.
                                </p>
                            </div>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80"
                            >
                                View all research
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid items-start gap-7 lg:grid-cols-[1.06fr_0.94fr] lg:gap-8">
                            <Link
                                href="/research/how-recruiters-read"
                                className="group card-interactive landing-card block rounded-2xl p-5 lg:p-6"
                            >
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <span className="text-label-mono">Featured: Eye-tracking research</span>
                                    <span className="text-label-mono text-muted-foreground">4 min read</span>
                                </div>
                                <h4 className="landing-title-md mb-3 transition-colors group-hover:text-brand">
                                    What recruiters actually read in the first 7.4 seconds
                                </h4>
                                <p className="landing-copy-muted">
                                    Eye-tracking evidence on the cues that drive pass versus reject.
                                </p>
                                <div className="mt-4 rounded-md border border-border/60 bg-muted/15 px-4 py-3 md:px-5 md:py-3.5">
                                    <div className="mb-0.5 text-label-mono text-muted-foreground">What this changes</div>
                                    <div className="landing-copy">
                                        Move your strongest quantified outcome into the first visible screen.
                                    </div>
                                </div>
                                <div className="mt-4 inline-flex items-center gap-2 text-sm text-brand">
                                    Read full breakdown
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>

                            <div className="landing-flow-sm">
                                <div className="landing-eyebrow">Curated next reads</div>
                                <div className="space-y-3">
                                    {curatedResearch.map((article) => (
                                        <Link
                                            key={article.title}
                                            href={article.href}
                                            className="group card-interactive block rounded-xl border border-border/60 bg-white px-4 py-3.5 dark:bg-slate-900"
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-4">
                                                <div className="text-label-mono">{article.category}</div>
                                                <span className="text-label-mono text-muted-foreground shrink-0">{article.readTime}</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0">
                                                    <article.icon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[20px] font-display leading-[1.1] tracking-tight text-slate-900 transition-colors group-hover:text-brand dark:text-slate-100">
                                                        {article.title}
                                                    </div>
                                                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{article.copy}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="landing-section-pad landing-deep-ink">
                <div className="landing-rail grid items-start landing-grid-gap lg:grid-cols-[1.02fr_0.98fr]">
                    <div className="landing-flow-md">
                        <div className="text-label-mono text-slate-400">Operator notes</div>
                        <h2 className="font-display text-4xl leading-[0.98] tracking-tight text-slate-50 md:text-[50px]">
                            Trusted by people making hiring decisions
                        </h2>
                        <p className="landing-copy-inverted max-w-[42rem]">
                            Built around the same first-pass judgment pattern used by coaches and hiring managers.
                        </p>

                        <div className="grid max-w-2xl gap-4 md:grid-cols-2 md:gap-5">
                            {testimonialCards.map((testimonial) => (
                                <div
                                    key={testimonial.name}
                                    className="landing-deep-ink-quote"
                                >
                                    <Quote className="w-5 h-5 text-brand mb-3" />
                                    <p className="text-base leading-relaxed mb-3 text-slate-100">{testimonial.quote}</p>
                                    <div className="text-sm text-slate-300">
                                        <div className="font-medium text-slate-100">{testimonial.name}</div>
                                        <div>{testimonial.role} · {testimonial.company}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="landing-deep-ink-panel landing-flow-md">
                        <div className="text-label-mono text-slate-400">Why people switch to RIYP</div>
                        <div className="space-y-3.5">
                            {[
                                "It surfaces the first-pass verdict, not just a score.",
                                "It links every recommendation to line-level evidence.",
                                "It gives paste-ready rewrites in priority order.",
                            ].map((point, index) => (
                                <div key={point} className="flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand/15 text-[11px] font-semibold text-brand">
                                        {index + 1}
                                    </span>
                                    <p className="text-[15px] leading-relaxed text-slate-200">{point}</p>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5">
                            <div className="text-label-mono text-slate-400">No-risk first run</div>
                            <div className="mt-1 text-sm text-slate-100">First full review is free. No card required.</div>
                        </div>
                        <Link
                            href="/workspace"
                            className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-white transition-colors hover:bg-brand/90"
                        >
                            Try the free review
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="landing-section-pad landing-section landing-section-tight landing-section-divider">
                <div className="landing-rail grid items-start landing-grid-gap xl:grid-cols-[0.72fr_1.28fr]">
                    <div className="landing-flow-md">
                        <div className="text-label-mono text-muted-foreground">Pricing with clear value boundaries</div>
                        <h2 className="landing-title-xl">
                            Start free, upgrade when iteration speed matters
                        </h2>
                        <p className="landing-copy">
                            One full review is free. Paid tiers unlock repeated role-specific runs, deeper rewrites, and history.
                        </p>

                        <div className="landing-card-soft landing-card-pad landing-flow-sm">
                            <div className="text-label-mono text-muted-foreground">Included in every plan</div>
                            <div className="space-y-2 landing-copy-muted">
                                <p>Evidence-first report structure</p>
                                <p>Clear priority rewrite sequence</p>
                                <p>Transparent billing and self-serve restore</p>
                            </div>
                            <Link href="/pricing" className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand/80">
                                View full pricing details
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
                        <PricingCard
                            tier="free"
                            allowFreeSelect
                            onSelect={() => {
                                Analytics.track("landing_cta_clicked", {
                                    cta: "pricing_run_free_review",
                                    destination: "/workspace",
                                });
                                window.location.href = "/workspace";
                            }}
                        />
                        <PricingCard
                            tier="monthly"
                            onSelect={() => handleCheckout("monthly")}
                            loading={checkoutLoading === "monthly"}
                        />
                        <PricingCard
                            tier="lifetime"
                            onSelect={() => handleCheckout("lifetime")}
                            loading={checkoutLoading === "lifetime"}
                        />
                    </div>
                </div>

                <div className="landing-rail landing-section-split">
                    <div className="landing-section-head">
                        <div>
                            <div className="landing-kicker">Trust, in plain English</div>
                            <h3 className="landing-title-lg">Clear rules for data, billing, and control</h3>
                        </div>
                        <Link href="/security" className="text-sm text-brand hover:text-brand/80 inline-flex items-center gap-1">
                            Review security and data handling
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid landing-grid-gap md:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: Lock, title: "Encrypted in transit", copy: "Files are encrypted during upload and processing." },
                                { icon: Trash2, title: "You control retention", copy: "Reports save when you choose and can be removed in Settings." },
                                { icon: Shield, title: "No public model training", copy: "Resume data is not used to train public models." },
                                { icon: Award, title: "Stripe handles billing", copy: "Receipts, renewals, and cancellation are self-serve." },
                            ].map((item) => (
                            <div key={item.title} className="landing-card landing-card-pad landing-flow-sm">
                                <div className="w-8 h-8 rounded-md bg-brand/10 text-brand flex items-center justify-center">
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div className="text-base font-medium">{item.title}</div>
                                <div className="landing-copy-muted">{item.copy}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
