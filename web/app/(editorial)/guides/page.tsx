import Link from "next/link";
import { ArrowRight, Calculator, Clock3, HandCoins, ShieldCheck, Sparkles, Target } from "lucide-react";
import Footer from "@/components/landing/Footer";

const playbooks = [
    {
        title: "Offer Negotiation Playbook",
        subtitle: "All industries",
        readTime: "12 min",
        href: "/guides/offer-negotiation",
        points: [
            "Universal negotiation sequence",
            "Copy-ready scripts for each stage",
            "Levers beyond base salary",
        ],
    },
    {
        title: "Tech Compensation Playbook",
        subtitle: "Engineering and product roles",
        readTime: "15 min",
        href: "/guides/tech-offer-negotiation",
        points: [
            "Equity and level strategy",
            "How to anchor total compensation",
            "Counteroffer structure that closes",
        ],
    },
];

const researchLinks = [
    {
        title: "The Referral Advantage",
        href: "/research/referral-advantage",
    },
    {
        title: "Salary Anchors",
        href: "/research/salary-anchors",
    },
    {
        title: "Structured Interviews Beat Vibes",
        href: "/research/structured-interviews-why-star",
    },
];

export default function GuidesPage() {
    return (
        <>
            <main className="landing-page">
                <section className="landing-section-pad landing-section-hero landing-section-divider">
                    <div className="landing-rail">
                        <div className="max-w-[46rem]">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-label-mono text-muted-foreground dark:border-slate-700 dark:bg-slate-900">
                                <Sparkles className="h-3.5 w-3.5 text-brand" />
                                Resources for higher-stakes decisions
                            </div>
                            <h1 className="mt-5 font-display text-4xl leading-[0.98] tracking-tight md:text-[56px]">
                                Practical playbooks you can use this week
                            </h1>
                            <p className="mt-4 max-w-[41rem] landing-copy">
                                Keep this simple: choose the guide that matches your situation, apply the scripts, and run the next review with clearer evidence.
                            </p>
                        </div>

                        <div className="mt-7 grid gap-4 sm:grid-cols-3">
                            <div className="landing-card landing-card-pad">
                                <div className="flex items-center gap-2 text-label-mono text-muted-foreground">
                                    <HandCoins className="h-3.5 w-3.5 text-brand" />
                                    Negotiation guides
                                </div>
                                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">2 playbooks</div>
                            </div>
                            <div className="landing-card landing-card-pad">
                                <div className="flex items-center gap-2 text-label-mono text-muted-foreground">
                                    <Calculator className="h-3.5 w-3.5 text-brand" />
                                    Compensation tool
                                </div>
                                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">1 calculator</div>
                            </div>
                            <div className="landing-card landing-card-pad">
                                <div className="flex items-center gap-2 text-label-mono text-muted-foreground">
                                    <Target className="h-3.5 w-3.5 text-brand" />
                                    Use outcome
                                </div>
                                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Faster close</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-section-pad landing-section landing-section-divider">
                    <div className="landing-rail">
                        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <div className="mb-2 landing-eyebrow">Guides</div>
                                <h2 className="font-display text-3xl leading-[0.98] tracking-tight md:text-[40px]">Choose your playbook</h2>
                            </div>
                            <Link href="/workspace" className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80">
                                Run free review
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            {playbooks.map((guide) => (
                                <Link key={guide.title} href={guide.href} className="group landing-card card-interactive landing-card-pad block">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-label-mono text-muted-foreground">{guide.subtitle}</div>
                                        <div className="inline-flex items-center gap-1.5 text-label-mono text-muted-foreground">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {guide.readTime}
                                        </div>
                                    </div>
                                    <h3 className="mt-3 font-display text-[30px] leading-[1.02] tracking-tight transition-colors group-hover:text-brand">
                                        {guide.title}
                                    </h3>
                                    <ul className="mt-4 space-y-2.5 landing-copy-muted">
                                        {guide.points.map((point) => (
                                            <li key={point} className="flex items-center gap-2.5">
                                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-5 inline-flex items-center gap-2 text-sm text-brand">
                                        Open guide
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-5 landing-card landing-card-pad">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <div className="mb-2 landing-eyebrow">Tool</div>
                                    <h3 className="font-display text-[30px] leading-[1.02] tracking-tight">Compensation Calculator</h3>
                                    <p className="mt-2 max-w-[42rem] landing-copy-muted">
                                        Compare multiple offers, normalize equity assumptions, and pressure-test year-one and four-year outcomes.
                                    </p>
                                </div>
                                <Link href="/guides/tools/comp-calculator" className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand/90">
                                    Open calculator
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-section-pad landing-deep-ink landing-section-divider">
                    <div className="landing-rail grid items-start gap-7 lg:grid-cols-[1.02fr_0.98fr]">
                        <div>
                            <div className="mb-4 text-label-mono text-slate-400">How to use this</div>
                            <h2 className="font-display text-3xl leading-[0.98] tracking-tight text-slate-50 md:text-[42px]">
                                One operating loop, every application cycle
                            </h2>
                            <p className="mt-4 max-w-[42rem] landing-copy-inverted">
                                Use the guide for strategy, use the calculator for tradeoffs, then run another review with the exact role requirements.
                            </p>
                        </div>

                        <div className="landing-deep-ink-panel">
                            <div className="space-y-3.5">
                                {[
                                    "Run a free review to expose the first-pass gap.",
                                    "Apply one guide script and one line-level rewrite.",
                                    "Re-run and verify stronger impact and clarity signals.",
                                ].map((step, index) => (
                                    <div key={step} className="flex items-start gap-3">
                                        <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand/15 text-[11px] font-semibold text-brand">
                                            {index + 1}
                                        </span>
                                        <p className="text-[15px] leading-relaxed text-slate-200">{step}</p>
                                    </div>
                                ))}
                            </div>
                            <Link href="/workspace" className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-white transition-colors hover:bg-brand/90">
                                Start free review
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="landing-section-pad landing-section">
                    <div className="landing-rail">
                        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <div className="mb-2 landing-eyebrow">Connected research</div>
                                <h2 className="font-display text-3xl leading-[0.98] tracking-tight md:text-[38px]">Evidence that supports the playbooks</h2>
                            </div>
                            <Link href="/research" className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80">
                                View all research
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {researchLinks.map((item) => (
                                <Link key={item.title} href={item.href} className="landing-card landing-card-pad card-interactive">
                                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-display text-[26px] leading-[1.05] tracking-tight">{item.title}</h3>
                                    <div className="mt-4 inline-flex items-center gap-2 text-sm text-brand">
                                        Read
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
