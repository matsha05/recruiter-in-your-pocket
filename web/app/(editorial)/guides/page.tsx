import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { hubLink } from "@/components/research/ResearchHubData";
import styles from "@/components/guides/GuidePresentation";

export const metadata: Metadata = {
    title: "After the offer",
    description: "Negotiation guides written from the recruiter’s side of the table, plus an offer calculator for comparing the pay.",
    alternates: { canonical: "/resources" },
};

// Each guide is its title; the guide itself says what it covers.
const playbooks = [
    { title: "How to negotiate a job offer", href: "/resources/offer-negotiation" },
    { title: "How to read and negotiate a tech offer", href: "/resources/tech-offer-negotiation" },
];

// Titled from the Research hub, the same string as each article's H1.
const researchLinks = ["/research/referral-advantage", "/research/salary-history-bans", "/research/star-method"].map(hubLink);

export default function GuidesPage() {
    return (
        <>
            <div className="bg-background pt-28 text-foreground selection:bg-brand/15 md:pt-36">
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-marketing">
                        <h1 className={`${styles.pageTitle} max-w-4xl`}>
                            Got the offer? Here&apos;s what to ask for, and how.
                        </h1>
                    </div>
                </section>

                <section className="px-6 pb-14 md:px-8 md:pb-20">
                    <div className="mx-auto max-w-marketing">
                        <div className="grid gap-5 lg:grid-cols-2">
                            {playbooks.map((guide) => (
                                <Link
                                    key={guide.title}
                                    href={guide.href}
                                    className={`${styles.sheet} focus-ring riyp-surface-link group block p-6 sm:p-8`}
                                >
                                    <h2 className={styles.componentTitle}>
                                        {guide.title}
                                    </h2>
                                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                        Open guide
                                        <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className={`${styles.sheet} mt-5 flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8`}>
                            <h2 className={styles.componentTitle}>
                                Compare job offers side by side
                            </h2>
                            <Button asChild className="shrink-0">
                                <Link href="/resources/tools/comp-calculator">
                                    Open calculator
                                    <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="border-t border-border px-6 py-14 md:px-8 md:py-20">
                    <div className="mx-auto max-w-marketing">
                        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
                            <h2 className={styles.sectionTitle}>
                                Related hiring research
                            </h2>
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
                                    className={`${styles.sheet} focus-ring riyp-surface-link group p-6 sm:p-8`}
                                >
                                    <h3 className={styles.componentTitle}>
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
