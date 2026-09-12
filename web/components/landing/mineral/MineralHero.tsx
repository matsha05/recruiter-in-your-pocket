import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { AlpineTrustRow } from "./AlpineTrustRow";
import { PocketInstrument } from "../instrument/PocketInstrument";
import styles from "./MineralHero.module.css";

export function MineralHero() {
    return (
        <section className={styles.hero} aria-labelledby="mineral-hero-title">
            <div className={styles.composition} data-testid="instrument-hero-composition">
                <div className={styles.copy}>
                    <p className={styles.eyebrow}>AI feedback. Real recruiting experience.</p>
                    <h1 id="mineral-hero-title">You did the work.<br />Let&rsquo;s dial in<br /><span className={styles.lastLine}>your story.</span></h1>
                    <p className={styles.deck}>Get a thorough, honest, and actionable resume diagnostic, shaped by real recruiting experience.</p>
                    <Link href="/workspace" className={styles.primary} data-testid="landing-primary-cta">Get your free report <ArrowRight aria-hidden="true" /></Link>
                    <p className={styles.free}>No account required. Your resume is private and secure.</p>
                </div>
                <div className={styles.visual}>
                    <PocketInstrument />
                </div>
            </div>
            <AlpineTrustRow />
        </section>
    );
}
