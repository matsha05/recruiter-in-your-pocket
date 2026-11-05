import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { publicPage } from "@/lib/seo/public-pages";
import { SECTION_NAMES } from "@/lib/seo/site";
import { articleStructuredData, formatMonth } from "@/lib/seo/structured-data";
import { comparisons, formatChecked, SAME_RESUME_DATE, type Comparison } from "./comparisons";
import styles from "./ComparisonPage.module.css";

// A comparison opens like a research article: the two names, then the straight answer about who
// each tool is for. Then the side-by-side table, the sections a searcher came for ("Is X worth
// it?"), the other tool's own pricing page as the source, and how we compare. One report action.

const OUR_NAME = "Recruiter in Your Pocket";

export function ComparisonPage({ entry }: { entry: Comparison }) {
    const { updated } = publicPage(entry.path);
    const others = comparisons.filter((candidate) => candidate.slug !== entry.slug);

    return (
        <>
            <JsonLd
                data={articleStructuredData({
                    path: entry.path,
                    headline: entry.title,
                    description: entry.summary,
                    trail: [{ name: SECTION_NAMES["/compare"], path: "/compare" }, { name: entry.title, path: entry.path }],
                    citations: entry.sources,
                })}
            />
            <div className={styles.page} data-visual-anchor="comparison">
                <div className={styles.inner}>
                    <Link href="/compare" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground">
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        All comparisons
                    </Link>

                    <header className={styles.opening}>
                        <h1 className={styles.title}>{entry.title}</h1>
                        <div className={styles.answerGrid}>
                            <p className={styles.answer}>{entry.answer}</p>
                        </div>
                        <p className={styles.meta}>
                            <span>{entry.name}’s prices read on {formatChecked()}</span>
                            <span>Updated <time dateTime={updated}>{formatMonth(updated)}</time></span>
                            <a href="#how-we-compare" className="focus-ring riyp-link-quiet">How we compare</a>
                        </p>
                    </header>

                    <section className={styles.tableSection} aria-labelledby="side-by-side-title">
                        <h2 id="side-by-side-title" className={styles.sectionTitle}>Side by side</h2>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th scope="col"><span className="sr-only">What we compared</span></th>
                                    <th scope="col">{entry.name}</th>
                                    <th scope="col">{OUR_NAME}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entry.rows.map((row) => (
                                    <tr key={row.label}>
                                        <th scope="row">{row.label}</th>
                                        <td data-label={entry.name}>{row.them}</td>
                                        <td data-label={OUR_NAME}>{row.us}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <div className={styles.body}>
                        {entry.sections.map((section, index) => (
                            <section key={section.id} id={section.id} className={styles.prose} aria-labelledby={`${section.id}-title`}>
                                <h2 id={`${section.id}-title`} className={styles.proseTitle}>{section.title}</h2>
                                {section.paragraphs.map((paragraph, paragraphIndex) => (
                                    <p key={paragraphIndex} className={styles.proseBody}>{paragraph}</p>
                                ))}
                                {index === 1 ? (
                                    <aside className={styles.bridge} aria-label="See it on your own resume">
                                        <div>
                                            <p className={styles.bridgeTitle}>What would a recruiter question on yours?</p>
                                            <p className={styles.bridgeBody}>
                                                The free report is the complete report: the Verdict, every Critical Miss, and the line behind each one. No card, no account, and nothing held back for the pass. <Link href="/sample-report" className="focus-ring riyp-link">See a complete report on a fictional resume</Link> before you run yours.
                                            </p>
                                        </div>
                                        <Button asChild variant="secondary" className="w-full shrink-0 sm:w-auto">
                                            <Link href="/workspace" data-analytics-cta="compare_bridge">
                                                Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                                            </Link>
                                        </Button>
                                    </aside>
                                ) : null}
                            </section>
                        ))}
                    </div>

                    <section className={styles.section} aria-labelledby="sources-title">
                        <h2 id="sources-title" className={styles.sectionTitle}>Sources</h2>
                        <ol className={styles.sources}>
                            {entry.sources.map((source, index) => {
                                const sourceId = source.id ?? `source-${index + 1}`;
                                const label = [source.title, source.publisher, source.year].filter(Boolean).join(". ").concat(".");
                                return (
                                    <li key={sourceId} id={sourceId} tabIndex={-1} className="riyp-jump-target">
                                        <span className={styles.sourceNumber}>{index + 1}</span>
                                        {source.href ? (
                                            <a href={source.href} target="_blank" rel="noopener noreferrer" className="focus-ring riyp-link-quiet">
                                                {label}<span className="sr-only"> (opens in a new tab)</span>
                                            </a>
                                        ) : <span>{label}</span>}
                                    </li>
                                );
                            })}
                        </ol>
                    </section>

                    <section className={styles.section} aria-labelledby="other-comparisons-title">
                        <h2 id="other-comparisons-title" className={styles.sectionTitle}>Other comparisons</h2>
                        <div className={styles.others}>
                            {others.map((other) => (
                                <Link key={other.slug} href={other.path} className={`focus-ring ${styles.otherRow}`}>
                                    <span className={styles.otherName}>{other.name}</span>
                                    <span className={styles.otherSummary}>{other.summary}</span>
                                    <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section id="how-we-compare" tabIndex={-1} className={`riyp-jump-target ${styles.method}`} aria-labelledby="how-we-compare-title">
                        <h2 id="how-we-compare-title" className={styles.methodTitle}>How we compare</h2>
                        <p className={styles.methodBody}>
                            We read {entry.name}’s own pricing page on the date above and quote what it says. Prices change. If we have one wrong, email{" "}
                            <a href="mailto:support@recruiterinyourpocket.com" className="focus-ring riyp-link-quiet">support@recruiterinyourpocket.com</a> and we’ll fix it.
                        </p>
                        {entry.sameResume ? (
                            <>
                                <p className={styles.methodBody}>
                                    On {formatChecked(SAME_RESUME_DATE)} we ran the same resume and the same job posting through {entry.name} and {OUR_NAME}, on {entry.name}’s free tier. {entry.sameResume.them}
                                </p>
                                <p className={styles.methodBody}>{entry.sameResume.us} That is what each one said, not a verdict on which is better.</p>
                            </>
                        ) : (
                            <p className={styles.methodBody}>
                                We haven’t run {entry.name} and {OUR_NAME} on the same resume, so this page compares what each one sells, not the quality of what comes back.
                            </p>
                        )}
                    </section>

                    <section className={styles.close} aria-labelledby="comparison-close-title">
                        <h2 id="comparison-close-title" className={styles.closeTitle}>See what they see in yours.</h2>
                        <Button asChild size="lg" className="flex-none">
                            <Link href="/workspace" data-analytics-cta="compare_close">
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
