import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { MineralHero } from "./mineral/MineralHero";
import { WholeReportPreview } from "./mineral/WholeReportPreview";
import styles from "./mineral/MineralPage.module.css";

export function LandingMineral() {
    return (
        <div className={styles.page} data-visual-anchor="landing-home">
            <MineralHero />
            <WholeReportPreview />
            <section id="about" className={styles.founder} aria-labelledby="lift-credibility-title">
                <div className={styles.founderPortrait}>
                    <Image src="/assets/founder-avatar.jpg" alt="Matt Shaw, founder of Recruiter in Your Pocket" width={420} height={460} sizes="(max-width: 700px) 180px, 320px" />
                    <p>Matt Shaw <span>Founder</span></p>
                </div>
                <div className={styles.founderCopy}>
                    <p className={styles.eyebrow}>The recruiter behind the report</p>
                    <h2 id="lift-credibility-title">A human point of view.<br />Built into every review.</h2>
                    <p className={styles.introduction}>I&apos;m Matt. After 14 years in recruiting and hiring, I built this to give candidates useful feedback before they hit send.</p>
                    <p className={styles.careerLabel}>My recruiting and people leadership experience</p>
                    <ol className={styles.career} aria-label="Matt's selected work history">
                        {["Robert Half", "Google", "Meta", "X-Team", "OpenAI"].map(company => <li key={company}>{company}</li>)}
                    </ol>
                    <div className={styles.founderLinks}>
                        <Link href="/methodology">How the report works <ArrowRight aria-hidden="true" /></Link>
                        <a href="https://www.linkedin.com/in/mattrshaw" target="_blank" rel="noopener noreferrer"><LinkedinLogo weight="fill" aria-hidden="true" /> Meet Matt</a>
                    </div>
                    <p className={styles.finePrint}>AI generates the feedback using review criteria developed by Matt. Your report does not include a personal review from Matt.</p>
                    <p className={styles.finePrint}>Company names identify Matt&apos;s work history. No current or former employer sponsors or endorses Recruiter in Your Pocket.</p>
                </div>
            </section>
            <section className={styles.close} aria-labelledby="mineral-close-title">
                <div>
                    <p className={styles.eyebrow}>Before you hit send</p>
                    <h2 id="mineral-close-title">Give your work<br />a closer look.</h2>
                </div>
                <div className={styles.closeAction}>
                    <p>Your first complete report is free.<br />No account. No card required.</p>
                    <Link href="/workspace">Get your free report <ArrowRight weight="bold" aria-hidden="true" /></Link>
                </div>
            </section>
            <Footer />
        </div>
    );
}
