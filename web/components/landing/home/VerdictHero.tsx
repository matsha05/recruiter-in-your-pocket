import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import styles from "./VerdictHero.module.css";

/**
 * The opening: somebody got the call, and it wasn't you. Beside it, an ordinary
 * resume with a recruiter's note clipped to it that nobody will ever send you.
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
                        <Link href="/workspace" className={styles.primary} data-testid="landing-primary-cta" data-analytics-cta="hero_report">
                            Read mine <ArrowRight weight="bold" aria-hidden="true" />
                        </Link>
                        <Link href="/sample-report" className={styles.secondary} data-analytics-cta="hero_sample">
                            See an example
                        </Link>
                    </div>
                    <p className={styles.fine}>Your first report is free. No account or card.</p>
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
                        <p className={styles.bullet}>Team player with excellent communication skills</p>
                        <p><b>Account Coordinator</b>, Brightpath Logistics</p>
                        <p className={styles.bullet}>Assisted account managers with various tasks as needed</p>
                        <p className={styles.head}>Skills</p>
                        <p>Microsoft Office, Communication, Leadership</p>
                        <p className={styles.head}>Education</p>
                        <p><b>B.A., Communications</b>, State University</p>
                    </div>
                    {/* The verdict exists. You just can't read it. */}
                    <div className={styles.note}>
                        <span className={styles.clip} />
                        <p className={styles.noteLabel}>Recruiter&rsquo;s note</p>
                        <p className={styles.verdict}>Solid book of business, but the best example stops right before the good part. Did renewals go up?</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
