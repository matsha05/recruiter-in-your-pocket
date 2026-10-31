import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { RecruiterViewHero } from "./hero/RecruiterViewHero";
import { ReportPreview } from "./home/ReportPreview";
import { MobileReportCTA } from "./mineral/MobileReportCTA";
import styles from "./home/HomePage.module.css";

const WORK_HISTORY = ["OpenAI", "Meta", "Google", "X-Team", "Robert Half"];

/** Four beats: the promise, the real report, the person behind the criteria, one last ask. */
export function LandingMineral() {
    return (
        <div className={styles.page} data-visual-anchor="landing-home">
            <RecruiterViewHero />
            <ReportPreview />

            <section id="about" className={styles.founder} aria-labelledby="founder-title">
                <div className={styles.portrait}>
                    <Image src="/assets/founder-avatar.jpg" alt="Matt Shaw, founder of Recruiter in Your Pocket" width={420} height={460} sizes="(max-width: 800px) 88px, 280px" />
                    <p>Matt Shaw <span>Founder</span></p>
                </div>
                <div className={styles.founderCopy}>
                    <h2 id="founder-title">I&apos;ve hired at OpenAI, Meta, and Google. This is how I read a resume.</h2>
                    <p className={styles.introduction}>
                        I&apos;m Matt. I&apos;ve spent 14 years recruiting and leading hiring teams. I built this so you get the honest read most candidates never hear, before you hit send.
                    </p>
                    <p className={styles.historyLabel}>Where I&apos;ve recruited and led hiring teams</p>
                    <ul className={styles.history} aria-label="Matt's work history">
                        {WORK_HISTORY.map((company) => <li key={company}>{company}</li>)}
                    </ul>
                    <p className={styles.disclosure}>
                        I wrote the review criteria. AI applies them to your resume, so I don&apos;t read individual reports. The companies above are my work history; none of them sponsor or endorse this product.
                    </p>
                    <div className={styles.founderLinks}>
                        <Link href="/methodology">How the report works <ArrowRight aria-hidden="true" /></Link>
                        <a href="https://www.linkedin.com/in/mattrshaw" target="_blank" rel="noopener noreferrer"><LinkedinLogo weight="fill" aria-hidden="true" /> Meet Matt</a>
                    </div>
                </div>
            </section>

            <section className={styles.close} aria-labelledby="close-title">
                <h2 id="close-title">Good work deserves a good read.</h2>
                <Link href="/workspace" data-analytics-cta="closing_report" className={styles.closeAction}>
                    Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                </Link>
            </section>

            <Footer />
            <MobileReportCTA />
        </div>
    );
}
