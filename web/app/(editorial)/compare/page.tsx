import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { comparisons, formatChecked, SAME_RESUME_DATE } from "@/components/compare/comparisons";
import { ResearchLink } from "@/components/research/ResearchLink";
import styles from "@/components/compare/ComparisonPage.module.css";
import { pageMetadata } from "@/lib/seo/metadata";
import { publicPage } from "@/lib/seo/public-pages";
import { breadcrumbStructuredData, SECTION_NAMES } from "@/lib/seo/site";
import { formatMonth, itemListStructuredData } from "@/lib/seo/structured-data";

const PATH = "/compare";

export const metadata = pageMetadata({
    path: PATH,
    title: "Resume review tools compared",
    description: "Which resume tool should you use? Kickresume, Rezi, Enhancv, Teal, Jobscan, Resume Worded, and TopResume beside our report: what each sells and costs.",
});

const OUR_NAME = "Recruiter in Your Pocket";

const ourRow = {
    does: "Reads the resume you have the way a recruiter would: a Verdict, the Critical Misses to fix first, and rewrites from your facts.",
    costs: "$29 once for five more reports, good for 90 days. No renewal.",
    free: "The first complete report. No card, no account.",
};

const howToChoose = [
    { lead: "You’re starting from a blank page and want it to look finished fast.", body: "Kickresume. Templates and an AI writer that drafts from your job title, free with four templates.", href: "/compare/kickresume" },
    { lead: "You want a live score and keywords while you write.", body: "Rezi. An AI builder with its own score, free for one resume, then $29 a month or $149 once.", href: "/compare/rezi" },
    { lead: "You want the page designed.", body: "Enhancv. The most designed templates here, free for seven days with branding, then by the month, quarter, or half year.", href: "/compare/enhancv" },
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
                    "@graph": [
                        breadcrumbStructuredData([{ name: SECTION_NAMES[PATH], path: PATH }]),
                        // The comparisons in the order the table lists them.
                        itemListStructuredData(PATH, "Resume review tools compared", comparisons.map((entry) => ({ name: entry.title, path: entry.path }))),
                    ],
                }}
            />
            <div className={styles.page} data-visual-anchor="comparison-hub">
                <div className={styles.inner}>
                    <header>
                        <h1 className={styles.title}>Resume review tools compared</h1>
                        <div className={styles.answerGrid}>
                            <p className={styles.answer}>
                                Seven tools people weigh against ours, what each one sells, and what it costs. We quote each tool’s own pricing page and say where it’s the better choice, because a writer, a keyword scanner, a builder, and a recruiter’s read are different purchases.
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

                    <section id="which-tool" className={`${styles.section} ${styles.prose}`} aria-labelledby="which-tool-title">
                        <h2 id="which-tool-title" className={styles.sectionTitle}>Which resume tool should I use?</h2>
                        <p className={styles.proseBody}>
                            It depends on what you’re missing. If you don’t have a resume, or you want the page designed for you, you need a builder: Kickresume, Rezi, Enhancv, and Teal all do that, free with limits and by subscription for the rest. If you have a resume and you’re tailoring it to many postings, you need a keyword scanner: Jobscan, or the matching inside Teal and Rezi. If you want it written for you, TopResume. If you have a resume and want to know what a recruiter would question before you send it, you need a recruiter’s read, and that is what the report is.
                        </p>
                        <p className={styles.proseBody}>
                            The report’s limits, so you can weigh it fairly: it reads the words we pull from your file, not the design, and it is AI applying a recruiter’s criteria, not a person reading your resume. It gives no keyword score and no interview odds, and it won’t build, design, or track anything. In November 2026 we ran one resume through five of these tools and ours; each of those pages says what came back, under “How we compare”. It was one resume, one role, one day, so these pages still mostly compare what each tool sells. The research behind the read is linked where it applies: <ResearchLink to="how-recruiters-read">recruiters who spent longer on Experience were more likely to move a resume forward</ResearchLink>, and <ResearchLink to="ats-myths">applicant tracking systems pull your text into fields rather than rejecting it on a score</ResearchLink>.
                        </p>
                        <p className={styles.proseBody}>
                            Most people need one builder or none, a scanner only if they apply in volume, and one honest read of the resume before it goes out. The read is free here.
                        </p>
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
                            We read each tool’s own pricing page on the date above and quote what it says. On {formatChecked(SAME_RESUME_DATE)} we also ran one resume, a senior recruiter’s, and one posting through Jobscan, Resume Worded, Teal, Rezi, Kickresume and ours, on their free tiers; those five pages say what each tool said and what ours said. TopResume and Enhancv haven’t been run on the same resume yet. One resume, one role, one day: a record of what came back, not a verdict on quality. Prices change. If we have one wrong, email{" "}
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
