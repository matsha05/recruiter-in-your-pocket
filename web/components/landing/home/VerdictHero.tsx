import Link from "next/link";
import { ArrowRight, LockSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { JORDAN_EXAMPLE } from "@/lib/marketing/jordan-example";
import { NoteReveal } from "./NoteReveal";
import styles from "./VerdictHero.module.css";

/**
 * The opening: somebody got the call, and it wasn't you. Beside it, an ordinary
 * resume and the recruiter's screen: the decision, and a note nobody will ever send you.
 * The note clears as the visitor scrolls into the worked example that explains it.
 */
export function VerdictHero() {
    return (
        <section className={styles.hero} aria-labelledby="hero-title" data-testid="landing-verdict-hero">
            <div className={styles.inner}>
                <div className={styles.copy}>
                    <h1 id="hero-title" className={styles.title}>They called someone back. It wasn&rsquo;t you.</h1>
                    <p className={styles.deck}>
                        See what a recruiter sees on your resume, and the one thing to fix first.
                    </p>
                    <div className={styles.actions}>
                        <Button asChild size="lg">
                            <Link href="/workspace" data-testid="landing-primary-cta" data-analytics-cta="hero_report">
                                Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                            </Link>
                        </Button>
                        <Button asChild variant="quiet">
                            <Link href="/sample-report" data-analytics-cta="hero_sample">
                                See Jordan&rsquo;s report
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className={styles.stage} aria-hidden="true" data-testid="landing-verdict-art">
                    {/* An ordinary resume, printed. Times belongs to the document, not to us. */}
                    <div className={styles.page}>
                        <p className={styles.name}>Jordan A. Miller</p>
                        <p className={styles.contact}>Denver, CO · jmiller@example.com</p>
                        <p className={styles.head}>Objective</p>
                        <p>Results-driven, detail-oriented professional seeking a challenging role where I can utilize my skills.</p>
                        <p className={styles.head}>Experience</p>
                        <p><b>Customer Success Manager</b>, Northwind Analytics</p>
                        <p className={styles.bullet}>Responsible for managing customer relationships and renewals</p>
                        <p className={styles.bullet}>Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue</p>
                        <p className={styles.bullet}>Introduced monthly renewal-risk reviews across the portfolio</p>
                        <p className={styles.bullet}>Ran quarterly business reviews with customer leadership teams</p>
                        <p className={styles.bullet}>Team player with excellent communication skills</p>
                        <p><b>Account Coordinator</b>, Brightpath Logistics</p>
                        <p className={styles.bullet}>Assisted account managers with various tasks as needed</p>
                        <p className={styles.head}>Skills</p>
                        <p>Microsoft Office, Communication, Leadership</p>
                        <p className={styles.head}>Education</p>
                        <p><b>B.A., Communications</b>, State University</p>
                    </div>
                    {/* The other side of the screen: the decision, and the note only the hiring team can read. */}
                    <NoteReveal className={styles.note} revealedClassName={styles.revealed}>
                        <p className={styles.req}>Customer Success Manager · Req 4471</p>
                        <p className={styles.candidate}>Jordan A. Miller</p>
                        <p className={styles.applied}>Applied 9 days ago</p>
                        <p className={styles.stageRow}>Stage <span className={styles.status}>Not moving forward</span></p>
                        <p className={styles.noteLabel}><LockSimple weight="bold" aria-hidden="true" /> Reviewer note · hiring team only</p>
                        <p className={styles.verdict}>{JORDAN_EXAMPLE.note}</p>
                    </NoteReveal>
                </div>
            </div>
        </section>
    );
}
