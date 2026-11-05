import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { FictionalTag } from "@/components/marketing/FictionalTag";
import { Clipping } from "@/components/materials/Clipping";
import rhythm from "@/components/materials/Rhythm.module.css";
import { SignedNote } from "@/components/materials/SignedNote";
import { ScoreBand } from "@/components/workspace/report/markup/ScoreBand";
import { JORDAN_EXAMPLE } from "@/lib/marketing/jordan-example";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";
import sampleReport from "@/public/sample-report.json";
import styles from "./Methodology.module.css";

const PATH = "/methodology";

export const metadata = pageMetadata({
    path: PATH,
    title: "How the resume report works: score, Verdict, Critical Miss",
    description: "How your report reaches its Verdict, where your resume stands, and its Critical Miss, what it can't tell you, and how suggested edits protect your facts.",
    type: "article",
});

/** The disclosure, in the recruiter's hand: the one other place the signed note appears (Matt, Nov 4, 2026). */
const DISCLOSURE =
    "A recruiter with fifteen years in hiring wrote these criteria. AI applies them, the same way to every resume, and nobody reads yours but you. Check every suggested edit against what you actually did.";

const PARTS = [
    "The results you show.",
    "How clearly each line reads.",
    "How your experience fits together.",
    "How easy the text is to follow.",
];

const SOURCES = [
    {
        id: "source-1",
        label: "The Importance of Representative Design in Judgment Tasks: The Case of Resume Screening. Journal of Occupational and Organizational Psychology, 2002.",
        href: "https://doi.org/10.1348/09631790260098749",
    },
    {
        id: "source-2",
        label: "Using Machine Learning with Eye-Tracking Data to Predict if a Recruiter Will Approve a Resume. Machine Learning and Knowledge Extraction, 2023.",
        href: "https://doi.org/10.3390/make5030038",
    },
];

/**
 * How the report works (Nov 4, 2026): cut to the density rule. One part of the report per section with one
 * object each (the Verdict as the report prints it, the band, the Critical Miss as a clipping), the facts rule,
 * what the report can't tell you, the disclosure as the signed note, and the research-method note that every
 * article links to. The methods explained by Linear's Method and Shape Up run 15 to 85 words a section with no
 * diagrams; the "what it can't tell you" section is the one no precedent has.
 */
export default function MethodologyPage() {
    return (
        <div className={rhythm.page} data-visual-anchor="research-article">
            <section className={rhythm.opening} aria-labelledby="methodology-title">
                <h1 id="methodology-title" className={rhythm.title}>How the report works.</h1>
                <p className={rhythm.deck}>A recruiter wrote the criteria. AI applies them to your resume, line by line, and quotes the line behind every note.</p>
                <div className={rhythm.link}><Link href="/sample-report" className="riyp-link" data-analytics-cta="methodology_sample">See Jordan&rsquo;s report <ArrowRight aria-hidden="true" /></Link></div>
            </section>

            <section className={rhythm.section} aria-labelledby="verdict-title">
                <h2 id="verdict-title" className={rhythm.title}>The Verdict.</h2>
                <p className={rhythm.deck}>What your resume says first, in plain words, judged against the criteria.</p>
                <div className={styles.verdict}>
                    <span className={styles.verdictLabel}>Verdict</span>
                    <p className={styles.verdictText}>{sampleReport.first_impression}</p>
                </div>
                <div className={rhythm.link}><FictionalTag className={styles.tag} /></div>
            </section>

            <section className={rhythm.section} aria-labelledby="band-title">
                <h2 id="band-title" className={rhythm.title}>Where your resume stands.</h2>
                <p className={rhythm.deck}>One of three bands, with a line on what it means. The number behind it appears only when two reads are compared.</p>
                <div className={styles.band}><ScoreBand score={sampleReport.score} /></div>
                <section aria-label="What goes into the band">
                    <ol className={styles.parts}>
                        {PARTS.map((part, index) => <li key={part}><span>{index + 1}</span><span>{part}</span></li>)}
                    </ol>
                </section>
            </section>

            <section className={rhythm.section} aria-labelledby="miss-title">
                <h2 id="miss-title" className={rhythm.title}>The Critical Miss.</h2>
                <p className={rhythm.deck}>A problem that could cost you the interview on its own. The report quotes the line, says what&rsquo;s missing, and asks for it instead of guessing. Up to three, the first to fix first.</p>
                <Clipping
                    caption="A line from Jordan’s resume, and the report’s question"
                    line={JORDAN_EXAMPLE.line}
                    note={JORDAN_EXAMPLE.asks[0].question}
                    above="Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue"
                    below="Ran quarterly business reviews with customer leadership teams"
                />
                <div className={rhythm.link}>
                    <Link href="/sample-report" className="riyp-link" data-analytics-cta="methodology_sample_miss">See Jordan&rsquo;s full report <ArrowRight aria-hidden="true" /></Link>
                    <FictionalTag className={styles.tag} />
                </div>
            </section>

            <section className={rhythm.section} aria-labelledby="facts-title">
                <h2 id="facts-title" className={rhythm.title}>Only from your facts.</h2>
                <p className={rhythm.deck}>The revised line is your line plus your answers, word for word. Skip a question and it stays out. Add something that isn&rsquo;t in your answers and it can&rsquo;t be copied until you add it as one.</p>
            </section>

            <section className={rhythm.section} aria-labelledby="cant-title">
                <h2 id="cant-title" className={rhythm.title}>What it can&rsquo;t tell you.</h2>
                <ul className={styles.cant}>
                    <li>Whether you&rsquo;ll get an interview or an offer.</li>
                    <li>How a specific employer, team, or hiring process weighs things.</li>
                    <li>How your file looks. The report reads the text we pull from it, not the layout, fonts, or columns.</li>
                    <li>Anything about referrals, the job market, or bias in hiring.</li>
                </ul>
            </section>

            <section className={rhythm.section} aria-labelledby="disclosure-note">
                <SignedNote id="disclosure-note">{DISCLOSURE}</SignedNote>
                <div className={rhythm.link}><Link href="/research" className="riyp-link" data-analytics-cta="methodology_research">Read the research behind it <ArrowRight aria-hidden="true" /></Link></div>
            </section>

            <section id="how-we-write-research" tabIndex={-1} className={cn(rhythm.section, rhythm.close, "riyp-jump-target")} aria-labelledby="method-title">
                <h2 id="method-title" className={rhythm.title}>How we write the research.</h2>
                <p className={styles.method}>
                    Every page opens with the question you asked and a straight answer, with the study behind it linked right there. We link the full study when it&rsquo;s public and say so when we could only read the abstract. Each finding travels with its limits: who was studied, where, how many, and what the study can&rsquo;t tell you. When something is our advice rather than a finding, we label it. We&rsquo;d rather print a small, honest number than a big, round one. Each page shows when it last changed, and that date moves for a corrected claim or a new section, never for a redesign.
                </p>
                <ol className={styles.sources} aria-label="Sources">
                    {SOURCES.map((source, index) => (
                        <li key={source.id} id={source.id}>
                            <span>{index + 1}</span>
                            <a href={source.href} target="_blank" rel="noopener noreferrer" className="focus-ring riyp-link-quiet">{source.label}<span className="sr-only"> (opens in a new tab)</span></a>
                        </li>
                    ))}
                </ol>
            </section>
            <Footer />
        </div>
    );
}
