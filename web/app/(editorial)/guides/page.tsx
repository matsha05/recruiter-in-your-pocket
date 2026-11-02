import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { hubLink, pillarForHref } from "@/components/research/ResearchHubData";
import styles from "@/components/guides/GuidePresentation";

export const metadata: Metadata = {
    title: "After the offer",
    description: "Negotiation guides written from the recruiter’s side of the table, plus an offer calculator for comparing the pay.",
    alternates: { canonical: "/resources" },
};

const playbooks = [
    {
        title: "How to negotiate a job offer",
        subtitle: "All industries",
        readTime: "12 min",
        href: "/resources/offer-negotiation",
        points: [
            "What to say when they ask for your number",
            "How to handle the offer call, the counter, and the close",
            "Scripts for each step, and the research behind them",
        ],
    },
    {
        title: "How to read and negotiate a tech offer",
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

// Titled from the Research hub, the same string as each article's H1.
const researchLinks = ["/research/referral-advantage", "/research/salary-history-bans", "/research/star-method"].map(hubLink);

export default function GuidesPage() {
    return (
        <>
            <div className="bg-background pt-28 text-foreground selection:bg-brand/15 md:pt-36">

                {/* ── Hero ── */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-marketing">
                        <div className="max-w-4xl">
                            <p className={`${styles.label} text-muted-foreground`}>After the offer</p>
                            <h1 className={`${styles.pageTitle} mt-5 max-w-4xl`}>
                                Got the offer? Here&apos;s what to ask for, and how.
                            </h1>
                            <p className={`${styles.readingCopy} mt-5`}>
                                Most offers have some room, in our experience. Compare the pay, read the terms, and find words you can actually say to the recruiter.
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
                                Get your free report
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            {playbooks.map((guide) => (
                                <Link
                                    key={guide.title}
                                    href={guide.href}
                                    className={`${styles.sheet} focus-ring riyp-surface-link group block p-6 sm:p-8`}
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
                                    <h3 className={`${styles.componentTitle} mt-5`}>
                                        {guide.title}
                                    </h3>
                                    <ul className="mt-4 space-y-2.5">
                                        {guide.points.map((point) => (
                                            <li key={point} className={`${styles.readingCopy} flex items-start gap-2.5`}>
                                                <span className="mt-3.5 inline-block h-px w-3 shrink-0 bg-line" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                        Open guide
                                    <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
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
                                        Compare job offers side by side
                                    </h3>
                                    <p className={`${styles.readingCopy} mt-3`}>
                                        Compare base salary, target bonus, equity, and one-time payments year by year. See which assumptions change the total.
                                    </p>
                                </div>
                                <Button asChild className="shrink-0">
                                    <Link href="/resources/tools/comp-calculator">
                                        Open calculator
                                        <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Philosophy ── */}
                <section className="border-y border-border bg-muted px-6 py-14 text-foreground md:px-8 md:py-20">
                    <div className="mx-auto grid max-w-marketing items-start gap-10 lg:grid-cols-2">
                        <div>
                            <p className={`${styles.label} text-muted-foreground`}>
                                How these are written
                            </p>
                            <h2 className={`${styles.sectionTitle} mt-3 max-w-3xl`}>
                                Written from the recruiter&apos;s side of the table
                            </h2>
                            <p className={`${styles.readingCopy} mt-5`}>
                                Your counter doesn’t stop with the recruiter. It gets passed to a manager or a compensation team, so these guides show you how to ask in a way that survives the handoff, without overstating your leverage.
                            </p>
                        </div>

                        <div className={`${styles.sheet} p-6 sm:p-8`}>
                            <div className="space-y-5">
                                <div>
                                    <p className="text-prose font-medium text-foreground">Words you can actually say.</p>
                                    <p className={`${styles.readingCopy} mt-1`}>Sample lines for asking about pay, buying more time, and making the counter.</p>
                                </div>
                                <div className="border-t border-border pt-5">
                                    <p className="text-prose font-medium text-foreground">The research, with its limits.</p>
                                    <p className={`${styles.readingCopy} mt-1`}>Where a study helps, we link it and say what it can’t tell you.</p>
                                </div>
                                <div className="border-t border-border pt-5">
                                    <p className="text-prose font-medium text-foreground">Start with your question.</p>
                                    <p className={`${styles.readingCopy} mt-1`}>Jump to the part you need, whether the offer is in hand or you’re still interviewing.</p>
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
                            {researchLinks.map((item) => {
                                const pillar = pillarForHref(item.href);
                                return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={`${styles.sheet} focus-ring riyp-surface-link group p-6 sm:p-8`}
                                >
                                    {/* Which research pillar this belongs to: real information, where a generic icon was. */}
                                    {pillar ? <p className="mb-5 text-sm font-medium text-muted-foreground">{pillar}</p> : null}
                                    <h3 className={`${styles.componentTitle}`}>
                                        {item.title}
                                    </h3>
                                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                        Read
                                        <ArrowRight className="size-4" />
                                    </div>
                                </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
