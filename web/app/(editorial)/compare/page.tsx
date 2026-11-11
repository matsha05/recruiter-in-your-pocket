import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { comparison, comparisons, formatChecked, SAME_RESUME_DATE } from "@/components/compare/comparisons";
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

const ours = {
    costs: "$29 once for five more reports, good for 90 days. No renewal.",
    free: "The first complete report. No card, no account.",
};

// One row per need, in the order a job search usually meets them: no resume yet, then tailoring, then the read
// before it goes out. Each need names one tool; the price and free version come from that tool's own row
// (comparisons.tsx), so the hub can't quote a price its page doesn't.
const needs: Array<{ need: string; slug?: string }> = [
    { need: "You’re starting from a blank page and want it to look finished fast.", slug: "kickresume" },
    { need: "You want a live score and keywords while you write.", slug: "rezi" },
    { need: "You want the page designed.", slug: "enhancv" },
    { need: "You want someone else to write it.", slug: "topresume" },
    { need: "You tailor keywords for many postings a week.", slug: "jobscan" },
    { need: "You want a running score on your resume and LinkedIn.", slug: "resume-worded" },
    { need: "You’re building a version for every application and tracking them.", slug: "teal" },
    { need: "You want to know what a recruiter would question on the resume you have." },
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
                                A writer, a keyword scanner, a builder, and a recruiter’s read are different purchases. Find the line that sounds like you.
                            </p>
                        </div>
                        <p className={styles.meta}>
                            <span>Prices read on {formatChecked()}</span>
                            <span>Updated <time dateTime={updated}>{formatMonth(updated)}</time></span>
                            <a href="#how-we-compare" className="focus-ring riyp-link-quiet">How we compare</a>
                        </p>
                    </header>

                    <section className={styles.tableSection} aria-labelledby="tools-title">
                        <h2 id="tools-title" className={styles.sectionTitle}>What you need, and what it costs</h2>
                        <table className={`${styles.table} ${styles.needs}`}>
                            <thead>
                                <tr>
                                    <th scope="col">If this is you</th>
                                    <th scope="col">Use</th>
                                    <th scope="col">What it costs</th>
                                    <th scope="col">Free version</th>
                                </tr>
                            </thead>
                            <tbody>
                                {needs.map(({ need, slug }) => {
                                    const entry = slug ? comparison(slug) : null;
                                    return (
                                        <tr key={need}>
                                            <th scope="row">{need}</th>
                                            <td data-label="Use" className={styles.tool}>
                                                {entry
                                                    ? <Link href={entry.path} className="focus-ring riyp-link">{entry.name}</Link>
                                                    : <Link href="/workspace" className="focus-ring riyp-link" data-analytics-cta="compare_hub_table">{OUR_NAME}</Link>}
                                            </td>
                                            <td data-label="What it costs">{entry ? entry.hub.costs : ours.costs}</td>
                                            <td data-label="Free version">{entry ? entry.hub.free : ours.free}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <p className={styles.tableNote}>Each tool’s name opens its page, with its prices quoted from its own pricing page.</p>
                    </section>

                    <section id="which-tool" className={`${styles.section} ${styles.prose}`} aria-labelledby="which-tool-title">
                        <h2 id="which-tool-title" className={styles.sectionTitle}>Which resume tool should I use?</h2>
                        <p className={styles.proseBody}>
                            It depends on what you’re missing. Most people need one builder or none, a scanner only if they apply in volume, and one honest read of the resume before it goes out. The read is free here.
                        </p>
                        <ul className={styles.kinds}>
                            <li>If you don’t have a resume, or you want the page designed for you, <strong>you need a builder</strong>: Kickresume, Rezi, Enhancv, and Teal all do that, free with limits and by subscription for the rest.</li>
                            <li>If you have a resume and you’re tailoring it to many postings, <strong>you need a keyword scanner</strong>: Jobscan, or the matching inside Teal and Rezi.</li>
                            <li>If you want it written for you, <strong>you need a writer</strong>: TopResume.</li>
                            <li>If you have a resume and want to know what a recruiter would question before you send it, <strong>you need a recruiter’s read</strong>, and that is what the report is.</li>
                        </ul>
                        <h3 className={styles.proseHeading}>The report’s limits</h3>
                        <p className={styles.proseBody}>
                            It reads the words we pull from your file, not the design, and it is AI applying a recruiter’s criteria, not a person reading your resume. It gives no keyword score and no interview odds, and it won’t build, design, or track anything.
                        </p>
                        <p className={styles.proseBody}>
                            In November 2026 we ran one resume through five of these tools and ours; each of those pages says what came back, under “How we compare”. It was one resume, one role, one day, so these pages still mostly compare what each tool sells. The research behind the read is linked where it applies: <ResearchLink to="how-recruiters-read">recruiters who spent longer on Experience were more likely to move a resume forward</ResearchLink>, and <ResearchLink to="ats-myths">applicant tracking systems pull your text into fields rather than rejecting it on a score</ResearchLink>.
                        </p>
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
