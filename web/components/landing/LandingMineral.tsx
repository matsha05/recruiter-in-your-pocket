import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { HiringTruths } from "./home/HiringTruths";
import { ProgressBeat } from "./home/ProgressBeat";
import { SilenceSection } from "./home/SilenceSection";
import { VerdictHero } from "./home/VerdictHero";
import { WorkedExample } from "./home/WorkedExample";
import { MobileReportCTA } from "./mineral/MobileReportCTA";
import styles from "./home/HomePage.module.css";

/** The verdict you never got, the note worked through, the silence, what we look for, the revision loop, who built it (anonymous by design), one last ask. */
export function LandingMineral() {
    return (
        <div className={styles.page} data-visual-anchor="landing-home">
            <VerdictHero />
            <WorkedExample />
            <SilenceSection />
            <HiringTruths />
            <ProgressBeat />

            <section id="about" className={styles.founder} aria-labelledby="founder-title">
                <div className={styles.founderCopy}>
                    <h2 id="founder-title">After 14 years in recruiting, it&apos;s obvious to me why one resume gets the call and another doesn&apos;t. It almost never is to the person who wrote it.</h2>
                    <p className={styles.disclosure}>
                        I wrote the review criteria, from hiring at some of the biggest names in tech. AI applies them; I don&apos;t read each report myself.
                    </p>
                    <div className={styles.founderLinks}>
                        <Link href="/methodology">How the report works <ArrowRight aria-hidden="true" /></Link>
                    </div>
                </div>
            </section>

            {/* An ink band: the dark theme tokens invert the shared Button with it. */}
            <section className={`${styles.close} dark`} aria-labelledby="close-title">
                <h2 id="close-title">Good work deserves a good read.</h2>
                <Button asChild size="lg">
                    <Link href="/workspace" data-analytics-cta="closing_report">
                        Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                    </Link>
                </Button>
            </section>

            <Footer />
            <MobileReportCTA />
        </div>
    );
}
