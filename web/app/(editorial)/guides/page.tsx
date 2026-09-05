import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, ShieldCheck, Sparkle } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Career Resources",
    description: "Recruiter-grounded negotiation guides, compensation tools, and practical career resources.",
    alternates: { canonical: "/resources" },
};

const playbooks = [
    {
        title: "Offer Negotiation Playbook",
        subtitle: "All industries",
        readTime: "10 min",
        href: "/resources/offer-negotiation",
        points: [
            "A step-by-step sequence you can adapt to the employer",
            "Word-for-word scripts you can actually use",
            "What to ask for beyond base salary",
        ],
    },
    {
        title: "Tech Compensation Playbook",
        subtitle: "Engineering and product roles",
        readTime: "12 min",
        href: "/resources/tech-offer-negotiation",
        points: [
            "Questions that make equity and level easier to evaluate",
            "How to separate cash, target bonus, and equity",
            "How to make a clear counter without overstating leverage",
        ],
    },
];

const researchLinks = [
    {
        title: "The Referral Advantage",
        href: "/research/referral-advantage",
    },
    {
        title: "Salary History and Anchoring",
        href: "/research/salary-history-bans",
    },
    {
        title: "Why Structured Interviews Are More Reliable",
        href: "/research/structured-interviews-why-star",
    },
];

export default function GuidesPage() {
    return (
        <>
            <div className="bg-paper pt-28 text-foreground selection:bg-brand/15 md:pt-36">

                {/* ── Hero ── */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-6xl">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase riyp-track-010 text-ink">
                                <Sparkle aria-hidden="true" className="size-3.5 text-brand" weight="fill" />
                                Practical career advice
                            </div>
                            <h1 className="mt-5 max-w-4xl font-display text-5xl riyp-weight-520 leading-none tracking-tight text-foreground riyp-stretch-88 sm:text-6xl lg:text-7xl">
                                Work out what to ask for in your next offer
                            </h1>
                            <p className="editorial-copy-lg mt-5 max-w-2xl text-muted-foreground">
                                Compare the pay, understand the terms, and find words you can use with the recruiter.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Guide cards ── */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase riyp-track-010 text-ink">
                                    Guides
                                </p>
                                <h2 className="mt-2 font-display text-4xl riyp-weight-540 leading-none tracking-tight text-foreground riyp-stretch-92 sm:text-5xl">
                                    Choose your guide
                                </h2>
                            </div>
                            <Link
                                href="/workspace"
                                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Get free report
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            {playbooks.map((guide) => (
                                <Link
                                    key={guide.title}
                                    href={guide.href}
                                    className="group block border-y border-line bg-background p-6 transition-colors hover:bg-paper-muted"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                            <span className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">
                                                {guide.subtitle}
                                            </span>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">
                                            <Clock aria-hidden="true" className="size-3.5" />
                                            {guide.readTime}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 font-display text-2xl riyp-weight-560 leading-tight tracking-tight text-foreground riyp-stretch-96 transition-colors group-hover:text-brand sm:text-3xl">
                                        {guide.title}
                                    </h3>
                                    <ul className="mt-4 gap-y-2.5">
                                        {guide.points.map((point) => (
                                            <li key={point} className="flex items-center gap-2.5 text-base leading-7 text-muted-foreground">
                                                <span className="inline-block h-px w-3 shrink-0 bg-cyan-bright" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                        Open guide
                                    <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" weight="bold" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Compensation Calculator card */}
                        <div className="mt-5 border-y border-line bg-background p-6">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase riyp-track-010 text-ink">
                                        Tool
                                    </p>
                                    <h3 className="mt-2 font-display text-2xl riyp-weight-560 leading-tight tracking-tight text-foreground riyp-stretch-96 sm:text-3xl">
                                        Compensation Calculator
                                    </h3>
                                    <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
                                        Compare base salary, target bonus, equity, and one-time payments year by year. See which assumptions change the total.
                                    </p>
                                </div>
                                <Link
                                    href="/resources/tools/comp-calculator"
                                    className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-ink-deep"
                                >
                                    Open calculator
                                    <ArrowRight aria-hidden="true" className="size-4 text-citron" weight="bold" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Philosophy  -  dark section ── */}
                <section className="bg-foreground px-6 py-14 text-background md:px-8 md:py-20">
                    <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase riyp-track-010 text-cyan-bright">
                                The philosophy
                            </p>
                            <h2 className="mt-3 max-w-3xl font-display text-5xl riyp-weight-540 leading-none tracking-tight text-background riyp-stretch-90 lg:text-6xl">
                                Written from the recruiter&apos;s side of the table
                            </h2>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-background/70">
                                These guides explain how a request moves through a hiring team, which facts help someone evaluate it, and what you can say without overstating your leverage.
                            </p>
                        </div>

                        <div className="border-y border-background/15 bg-background/5 p-6">
                            <div className="gap-y-4">
                                <div>
                                    <p className="text-sm font-medium text-background">Examples you can adapt.</p>
                                    <p className="mt-1 text-sm leading-relaxed text-background/70">Use the sample wording to ask about pay, request more time, or make a counteroffer.</p>
                                </div>
                                <div className="border-t border-background/10 pt-4">
                                    <p className="text-sm font-medium text-background">Sources and limits included.</p>
                                    <p className="mt-1 text-sm leading-relaxed text-background/70">Research links are included where relevant, with source limits stated plainly.</p>
                                </div>
                                <div className="border-t border-background/10 pt-4">
                                    <p className="text-sm font-medium text-background">Built for your next conversation.</p>
                                    <p className="mt-1 text-sm leading-relaxed text-background/70">Go straight to the question you need help with, whether you have an offer or are still interviewing.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Connected research ── */}
                <section className="px-6 py-14 md:px-8 md:py-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase riyp-track-010 text-ink">
                                    Connected research
                                </p>
                                <h2 className="mt-2 font-display text-4xl riyp-weight-540 leading-none tracking-tight text-foreground riyp-stretch-92 sm:text-5xl">
                                    Related hiring research
                                </h2>
                            </div>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                View all research
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {researchLinks.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="group border-y border-line bg-background p-6 transition-colors hover:bg-paper-muted"
                                >
                                    <div className="mb-3 inline-flex size-8 items-center justify-center border border-cyan-bright/35 bg-surface-sky">
                                        <ShieldCheck aria-hidden="true" className="size-4 text-brand" weight="duotone" />
                                    </div>
                                    <h3 className="font-display text-2xl riyp-weight-560 leading-tight tracking-tight text-foreground riyp-stretch-96 transition-colors group-hover:text-brand">
                                        {item.title}
                                    </h3>
                                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                        Read
                                        <ArrowRight className="size-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
