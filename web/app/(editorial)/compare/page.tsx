import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { comparisons, formatChecked } from "@/components/compare/comparisons";
import styles from "@/components/compare/ComparisonPage.module.css";
import { pageMetadata } from "@/lib/seo/metadata";
import { publicPage } from "@/lib/seo/public-pages";
import { breadcrumbStructuredData, SECTION_NAMES } from "@/lib/seo/site";
import { formatMonth } from "@/lib/seo/structured-data";

const PATH = "/compare";

export const metadata = pageMetadata({
    path: PATH,
    title: "Resume review tools compared",
    description: "TopResume, Jobscan, Resume Worded, and Teal beside Recruiter in Your Pocket: what each one sells, what it costs, and when it's the better choice.",
});

const OUR_NAME = "Recruiter in Your Pocket";

const ourRow = {
    does: "Reads the resume you have the way a recruiter would: a Verdict, the Critical Misses to fix first, and rewrites from your facts.",
    costs: "$29 once for five more reports, good for 90 days. No renewal.",
    free: "The first complete report. No card, no account.",
};

const howToChoose = [
    { lead: "You want someone else to write it.", body: "TopResume. A writer produces the resume; the intake you give them decides how specific it is.", href: "/compare/topresume" },
    { lead: "You tailor keywords for many postings a week.", body: "Jobscan. Five free scans a month, then a subscription for unlimited matching.", href: "/compare/jobscan" },
    { lead: "You want a running score on your resume and LinkedIn.", body: "Resume Worded Pro. A checklist score on as many documents as you like, by the month, quarter, or year.", href: "/compare/resume-worded" },
    { lead: "You’re building a version for every application and tracking them.", body: "Teal. A builder and tracker, free, with Teal+ for the limits.", href: "/compare/teal" },
    { lead: "You want to know what a recruiter would question on the resume you have.", body: `${OUR_NAME}. One complete report free, then $29 once for five more. No subscription, and nothing written that you didn’t say.`, href: "/workspace" },
];

export default function ComparePage() {
    const { updated } = publicPage(PATH);

    return (
        <>
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    ...breadcrumbStructuredData([{ name: SECTION_NAMES[PATH], path: PATH }]),
                }}
            />
            <div className={styles.page} data-visual-anchor="comparison-hub">
                <div className={styles.inner}>
                    <header>
                        <h1 className={styles.title}>Resume review tools compared</h1>
                        <div className={styles.answerGrid}>
                            <p className={styles.answer}>
                                Four tools people weigh against ours, what each one sells, and what it costs. We quote each tool’s own pricing page and say where it’s the better choice, because a writer, a keyword scanner, a builder, and a recruiter’s read are different purchases.
                            </p>
                        </div>
                        <p className={styles.meta}>
                            <span>Prices read on {formatChecked()}</span>
                            <span>Updated <time dateTime={updated}>{formatMonth(updated)}</time></span>
                            <a href="#how-we-compare" className="focus-ring riyp-link-quiet">How we compare</a>
                        </p>
                    </header>

                    <section className={styles.tableSection} aria-labelledby="tools-title">
                        <h2 id="tools-title" className={styles.sectionTitle}>What each one sells</h2>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th scope="col"><span className="sr-only">Tool</span></th>
                                    <th scope="col">What it does</th>
                                    <th scope="col">What it costs</th>
                                    <th scope="col">Free version</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">{OUR_NAME}</th>
                                    <td data-label="What it does">{ourRow.does}</td>
                                    <td data-label="What it costs">{ourRow.costs}</td>
                                    <td data-label="Free version">{ourRow.free}</td>
                                </tr>
                                {comparisons.map((entry) => (
                                    <tr key={entry.slug}>
                                        <th scope="row">
                                            <Link href={entry.path} className="focus-ring riyp-link">{entry.name}</Link>
                                        </th>
                                        <td data-label="What it does">{entry.hub.does}</td>
                                        <td data-label="What it costs">{entry.hub.costs}</td>
                                        <td data-label="Free version">{entry.hub.free}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className={styles.section} aria-labelledby="choose-title">
                        <h2 id="choose-title" className={styles.sectionTitle}>How to choose</h2>
                        <div className={styles.others}>
                            {howToChoose.map((item) => (
                                <Link key={item.href} href={item.href} className={`focus-ring ${styles.otherRow} ${styles.chooseRow}`}>
                                    <span className={styles.otherName}>{item.lead}</span>
                                    <span className={styles.otherSummary}>{item.body}</span>
                                    <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className={styles.section} aria-labelledby="comparisons-title">
                        <h2 id="comparisons-title" className={styles.sectionTitle}>Each comparison</h2>
                        <div className={styles.others}>
                            {comparisons.map((entry) => (
                                <Link key={entry.slug} href={entry.path} className={`focus-ring ${styles.otherRow}`}>
                                    <span className={styles.otherName}>{entry.title}</span>
                                    <span className={styles.otherSummary}>{entry.summary}</span>
                                    <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section id="how-we-compare" tabIndex={-1} className={`riyp-jump-target ${styles.method}`} aria-labelledby="how-we-compare-title">
                        <h2 id="how-we-compare-title" className={styles.methodTitle}>How we compare</h2>
                        <p className={styles.methodBody}>
                            We read each tool’s own pricing page on the date above and quote what it says. We haven’t run the other tools and ours on the same resume, so these pages compare what each one sells, not the quality of what comes back. Prices change. If we have one wrong, email{" "}
                            <a href="mailto:support@recruiterinyourpocket.com" className="focus-ring riyp-link-quiet">support@recruiterinyourpocket.com</a> and we’ll fix it.
                        </p>
                    </section>

                    <section className={styles.close} aria-labelledby="compare-close-title">
                        <h2 id="compare-close-title" className={styles.closeTitle}>See what they see in yours.</h2>
                        <Button asChild size="lg" className="flex-none">
                            <Link href="/workspace" data-analytics-cta="compare_hub_close">
                                Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                            </Link>
                        </Button>
                    </section>
                </div>
                <Footer />
            </div>
        </>
    );
}
