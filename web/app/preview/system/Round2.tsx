"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { Wordmark } from "@/components/icons/Wordmark";
import { FictionalTag } from "@/components/marketing/FictionalTag";
import { Clipping } from "@/components/materials/Clipping";
import { PenArrow, PenNote } from "@/components/materials/Pen";
import rhythm from "@/components/materials/Rhythm.module.css";
import { SignedNote } from "@/components/materials/SignedNote";
import { Button } from "@/components/ui/button";
import { ScoreBand } from "@/components/workspace/report/markup/ScoreBand";
import { useSeen } from "@/hooks/use-seen";
import { JORDAN_EXAMPLE } from "@/lib/marketing/jordan-example";
import sampleReport from "@/public/sample-report.json";
import { cn } from "@/lib/utils";
import styles from "./Round2.module.css";

const DISCLOSURE = "A recruiter with fifteen years in hiring wrote these criteria. AI applies them, the same way to every resume, and nobody reads yours but you. Check every suggested edit against what you actually did.";

/** Methodology, cut to the density rule: one job per section, one object, one link. */
export function MethodologyMock() {
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <h1 className={rhythm.title}>How the report works.</h1>
                <p className={rhythm.deck}>A recruiter wrote the criteria. AI applies them to your resume, line by line, and quotes the line behind every note.</p>
                <div className={rhythm.link}><Link href="/sample-report" className="riyp-link">See Jordan&rsquo;s report <ArrowRight aria-hidden="true" /></Link></div>
            </section>

            <section className={rhythm.section}>
                <h2 className={rhythm.title}>The Verdict.</h2>
                <p className={rhythm.deck}>What your resume says first, in plain words, judged against the criteria.</p>
                <div className={styles.verdict}>
                    <span className={styles.verdictLabel}>Verdict</span>
                    <p className={styles.verdictText}>{sampleReport.first_impression}</p>
                </div>
                <div className={rhythm.link}><FictionalTag className={styles.tag} /></div>
            </section>

            <section className={rhythm.section}>
                <h2 className={rhythm.title}>Where your resume stands.</h2>
                <p className={rhythm.deck}>One of three bands, with a line on what it means. The number behind it appears only when two reads are compared.</p>
                <div className={styles.band}><ScoreBand score={sampleReport.score} /></div>
            </section>

            <section className={rhythm.section}>
                <h2 className={rhythm.title}>The Critical Miss.</h2>
                <p className={rhythm.deck}>A problem that could cost you the interview on its own. The report quotes the line, says what&rsquo;s missing, and asks for it instead of guessing. Up to three, the first to fix first.</p>
                <Clipping
                    line={JORDAN_EXAMPLE.line}
                    note={JORDAN_EXAMPLE.asks[0].question}
                    above="Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue"
                    below="Ran quarterly business reviews with customer leadership teams"
                />
                <div className={rhythm.link}>
                    <Link href="/sample-report" className="riyp-link">See Jordan&rsquo;s full report <ArrowRight aria-hidden="true" /></Link>
                    <FictionalTag className={styles.tag} />
                </div>
            </section>

            <section className={rhythm.section}>
                <h2 className={rhythm.title}>Only from your facts.</h2>
                <p className={rhythm.deck}>The revised line is your line plus your answers, word for word. Skip a question and it stays out. Add something that isn&rsquo;t in your answers and it can&rsquo;t be copied until you add it as one.</p>
            </section>

            <section className={rhythm.section}>
                <h2 className={rhythm.title}>What it can&rsquo;t tell you.</h2>
                <ul className={styles.cant}>
                    <li>Whether you&rsquo;ll get an interview or an offer.</li>
                    <li>How a specific employer, team, or hiring process weighs things.</li>
                    <li>How your file looks. The report reads the text we pull from it, not the layout, fonts, or columns.</li>
                    <li>Anything about referrals, the job market, or bias in hiring.</li>
                </ul>
            </section>

            <section className={rhythm.section}>
                <SignedNote>{DISCLOSURE}</SignedNote>
                <div className={rhythm.link}><Link href="/research" className="riyp-link">Read the research behind it <ArrowRight aria-hidden="true" /></Link></div>
            </section>

            <section className={cn(rhythm.section, rhythm.close)} id="how-we-write-research">
                <h2 className={rhythm.title}>How we write the research.</h2>
                <p className={styles.method}>Every page opens with the question you asked and a straight answer, with the study behind it linked right there. We link the full study when it&rsquo;s public and say so when we could only read the abstract. Each finding travels with its limits: who was studied, where, how many, and what the study can&rsquo;t tell you. When something is our advice rather than a finding, we label it. We&rsquo;d rather print a small, honest number than a big, round one. Each page shows when it last changed, and that date moves for a corrected claim or a new section, never for a redesign.</p>
                <ol className={styles.sources}>
                    <li><span>1</span><span>The Importance of Representative Design in Judgment Tasks: The Case of Resume Screening. Journal of Occupational and Organizational Psychology, 2002.</span></li>
                    <li><span>2</span><span>Using Machine Learning with Eye-Tracking Data to Predict if a Recruiter Will Approve a Resume. Machine Learning and Knowledge Extraction, 2023.</span></li>
                </ol>
            </section>
        </div>
    );
}

/** A research article's opening on the system: the question, the answer in pen, the line the study is about as a clipping, and the bridge as a note instead of a card. */
export function ResearchMock() {
    const { ref, seen } = useSeen<HTMLDivElement>(0.5);
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <h1 className={styles.question}>How do I write resume bullets that show results?</h1>
                <div className={styles.answerGrid}>
                    <div>
                        <p className={styles.answer}>The result, how you measured it, and what you did to get there. A line that stops at the activity leaves the reader to guess whether anything changed.</p>
                        <p className={styles.source}>From our reading of the eye-tracking study of 2,043 resume reviews (Pina et al., 2023). <a href="#" className="riyp-link">Read the study</a></p>
                    </div>
                    <PenNote>Most lines stop right before the good part.</PenNote>
                </div>
            </section>

            <section className={rhythm.section}>
                <h2 className={rhythm.title}>The line, before and after the question.</h2>
                <Clipping line={JORDAN_EXAMPLE.line} note="What did Jordan look for, and what changed?" above="Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue" below="Ran quarterly business reviews with customer leadership teams" />
                <div className={rhythm.link}><FictionalTag className={styles.tag} /></div>
            </section>

            <section className={rhythm.section}>
                <p className={styles.prose}>Put the result first when you have one, and the measure beside it. When you don&rsquo;t have a number, say what changed in words a stranger can picture: the review that used to take a week, the renewal that would otherwise have lapsed. The one thing never to do is add a number because a tool asked for one.</p>
                <div style={{ marginTop: "3rem", display: "grid", gap: "3rem" }}>
                    <div>
                        <p className={styles.verdictLabel}>The bridge, today</p>
                        <aside className={styles.bridgeOld}>
                            <p><strong>What does your line say after the activity?</strong>Your report opens with a Verdict and quotes the line behind every note. If a line stops before its result, a Critical Miss says so. It can&rsquo;t tell you how a particular reader will weigh it.</p>
                            <Button asChild variant="secondary"><Link href="/workspace">Get your free report <ArrowRight weight="bold" aria-hidden="true" /></Link></Button>
                        </aside>
                    </div>
                    <div ref={ref}>
                        <p className={styles.verdictLabel}>The bridge, proposed: a note in the margin</p>
                        <div className={styles.bridgeNew}>
                            <PenArrow drawn={seen} />
                            <PenNote>What does your line say after the activity? Your report quotes the line behind every note, and a Critical Miss says so when one stops before its result. It can&rsquo;t tell you how a particular reader will weigh it.</PenNote>
                            <Link href="/workspace" className="riyp-link">Get your free report <ArrowRight aria-hidden="true" /></Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

const HELP = [
    { category: "The report", questions: [
        { q: "What does the report cover?", a: "What a recruiter is likely to take from your resume, what comes through clearly, and where they’d need more detail. Every note quotes the line behind it, and each Critical Miss flags a problem that could cost you the interview, starting with the one to fix first. Add a job posting, and the report reads your resume against that role too." },
        { q: "Does a person read my resume?", a: "No. A recruiter with 15 years in hiring wrote the review criteria, and AI applies them to your resume. Nobody reads individual reports, so check every suggested edit against what you actually did." },
        { q: "What file formats are supported?", a: "PDF and Word documents (.docx), up to 4 MB. If we can’t read the file, paste the resume text instead. Formatting doesn’t matter; we only need the words." },
    ] },
    { category: "Privacy", questions: [
        { q: "What happens to uploaded resume data?", a: "We don't store the raw resume or job description from an anonymous run. A completed anonymous report can be recovered in the same browser for up to 24 hours, then expires. Sign in to save it; saved reports and your account can be deleted at any time." },
        { q: "How do I delete my data?", a: "Delete individual reports from Reports. In Settings, you can export your account data or delete your account entirely." },
    ] },
    { category: "Pricing", questions: [
        { q: "Is the first report really free?", a: "Yes, and nothing in it is held back. Your first complete report is free. No card required. Anonymous use is limited to one free report per calendar month." },
        { q: "Can I get a refund?", a: "You can request a full refund within 14 calendar days of purchase if you have not used any paid reports. Contact support from your checkout email with the purchase date and receipt ID." },
    ] },
];

/** Help on the rhythm: plain questions under plain headings, no accordion, and a person at the end. */
export function HelpMock() {
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <h1 className={rhythm.title}>Help.</h1>
            </section>
            {HELP.map((group) => (
                <section key={group.category} className={rhythm.section}>
                    <div className={styles.group}>
                        <h2>{group.category}</h2>
                        <div className={styles.qa}>
                            {group.questions.map((item) => (
                                <div key={item.q}><h3>{item.q}</h3><p>{item.a}</p></div>
                            ))}
                        </div>
                    </div>
                </section>
            ))}
            <section className={cn(rhythm.section, rhythm.close)}>
                <h2 className={rhythm.title}>Didn&rsquo;t find it? Write to a person.</h2>
                <div className={styles.contact}>
                    <a href="mailto:support@recruiterinyourpocket.com" className={cn("riyp-link", styles.mail)}>support@recruiterinyourpocket.com</a>
                    <p>Say what you were trying to do and what happened. A screenshot helps; remove personal details first, and don&rsquo;t send your resume unless we ask for it.</p>
                    <p>For sign-in, a purchase or a refund, include the email you used at checkout and the purchase date. We will never ask for your password or your full card number.</p>
                </div>
            </section>
        </div>
    );
}

function AuthForm() {
    return (
        <>
            <div className={styles.field}>
                <label htmlFor="mock-email" className="sr-only">Email address</label>
                <input id="mock-email" className={styles.input} type="email" placeholder="you@example.com" readOnly />
                <Button type="button">Email me a code <ArrowRight weight="bold" aria-hidden="true" /></Button>
            </div>
            <p className={styles.authQuiet}>No password. The code works once and expires in ten minutes.</p>
        </>
    );
}

/** Sign-in: A keeps the site header and drops the card; B is bare, wordmark only. */
export function AuthMockA() {
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <div className={styles.auth}>
                    <h1 className={styles.authTitle}>Sign in.</h1>
                    <p className={styles.authLine}>Your saved reports are on the other side of the desk.</p>
                    <AuthForm />
                </div>
            </section>
        </div>
    );
}

export function AuthMockB() {
    return (
        <div className={cn(rhythm.page, styles.bare)}>
            <div className={styles.auth}>
                <Wordmark className={styles.wordmark} />
                <h1 className={styles.authTitle}>What&rsquo;s your email?</h1>
                <AuthForm />
            </div>
        </div>
    );
}
