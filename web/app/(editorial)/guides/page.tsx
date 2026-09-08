import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, ShieldCheck, Sparkle } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import styles from "@/components/guides/GuidePresentation";

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
            <div className="bg-background pt-28 text-foreground selection:bg-brand/15 md:pt-36">

                {/* ── Hero ── */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-marketing">
                        <div className="max-w-4xl">
                            <div className={`${styles.label} inline-flex items-center gap-2 text-muted-foreground`}>
                                <Sparkle aria-hidden="true" className="size-3.5 text-brand" weight="fill" />
                                Practical career advice
                            </div>
                            <h1 className={`${styles.pageTitle} mt-5 max-w-4xl`}>
                                Work out what to ask for in your next offer
                            </h1>
                            <p className={`${styles.readingCopy} mt-5`}>
                                Compare the pay, understand the terms, and find words you can use with the recruiter.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Guide cards ── */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-marketing">
                        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
                            <div>
                                <p className={`${styles.label} text-muted-foreground`}>
                                    Guides
                                </p>
                                <h2 className={`${styles.sectionTitle} mt-3`}>
                                    Choose your guide
                                </h2>
                            </div>
                            <Link
                                href="/workspace"
                                className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
                                    className={`${styles.sheet} focus-ring group block p-6 transition-colors hover:border-brand/40 sm:p-8`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                            <span className={`${styles.label} text-muted-foreground`}>
                                                {guide.subtitle}
                                            </span>
                                        <span className={`${styles.label} inline-flex shrink-0 items-center gap-1.5 text-muted-foreground`}>
                                            <Clock aria-hidden="true" className="size-3.5" />
                                            {guide.readTime}
                                        </span>
                                    </div>
                                    <h3 className={`${styles.componentTitle} mt-5 transition-colors group-hover:text-brand`}>
                                        {guide.title}
                                    </h3>
                                    <ul className="mt-4 space-y-2.5">
                                        {guide.points.map((point) => (
                                            <li key={point} className={`${styles.readingCopy} flex items-start gap-2.5`}>
                                                <span className="mt-3.5 inline-block h-px w-3 shrink-0 bg-brand/50" />
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
                        <div className={`${styles.sheet} mt-5 p-6 sm:p-8`}>
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className={`${styles.label} text-muted-foreground`}>
                                        Tool
                                    </p>
                                    <h3 className={`${styles.componentTitle} mt-2`}>
                                        Compensation Calculator
                                    </h3>
                                    <p className={`${styles.readingCopy} mt-3`}>
                                        Compare base salary, target bonus, equity, and one-time payments year by year. See which assumptions change the total.
                                    </p>
                                </div>
                                <Link
                                    href="/resources/tools/comp-calculator"
                                    className={`${styles.primaryAction} focus-ring shrink-0`}
                                >
                                    Open calculator
                                    <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Philosophy ── */}
                <section className="border-y border-border bg-muted px-6 py-14 text-foreground md:px-8 md:py-20">
                    <div className="mx-auto grid max-w-marketing items-start gap-10 lg:grid-cols-2">
                        <div>
                            <p className={`${styles.label} text-brand`}>
                                The philosophy
                            </p>
                            <h2 className={`${styles.sectionTitle} mt-3 max-w-3xl`}>
                                Written from the recruiter&apos;s side of the table
                            </h2>
                            <p className={`${styles.readingCopy} mt-5`}>
                                These guides explain how a request moves through a hiring team, which facts help someone evaluate it, and what you can say without overstating your leverage.
                            </p>
                        </div>

                        <div className={`${styles.sheet} p-6 sm:p-8`}>
                            <div className="space-y-5">
                                <div>
                                    <p className="text-prose font-medium text-foreground">Examples you can adapt.</p>
                                    <p className={`${styles.readingCopy} mt-1`}>Use the sample wording to ask about pay, request more time, or make a counteroffer.</p>
                                </div>
                                <div className="border-t border-border pt-5">
                                    <p className="text-prose font-medium text-foreground">Sources and limits included.</p>
                                    <p className={`${styles.readingCopy} mt-1`}>Research links are included where relevant, with source limits stated plainly.</p>
                                </div>
                                <div className="border-t border-border pt-5">
                                    <p className="text-prose font-medium text-foreground">Built for your next conversation.</p>
                                    <p className={`${styles.readingCopy} mt-1`}>Go straight to the question you need help with, whether you have an offer or are still interviewing.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Connected research ── */}
                <section className="px-6 py-14 md:px-8 md:py-20">
                    <div className="mx-auto max-w-marketing">
                        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
                            <div>
                                <p className={`${styles.label} text-muted-foreground`}>
                                    Connected research
                                </p>
                                <h2 className={`${styles.sectionTitle} mt-3`}>
                                    Related hiring research
                                </h2>
                            </div>
                            <Link
                                href="/research"
                                className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
                                    className={`${styles.sheet} focus-ring group p-6 transition-colors hover:border-brand/40 sm:p-8`}
                                >
                                    <div className="mb-5 inline-flex size-11 items-center justify-center rounded-full border border-brand/15 bg-accent">
                                        <ShieldCheck aria-hidden="true" className="size-4 text-brand" weight="duotone" />
                                    </div>
                                    <h3 className={`${styles.componentTitle} transition-colors group-hover:text-brand`}>
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
