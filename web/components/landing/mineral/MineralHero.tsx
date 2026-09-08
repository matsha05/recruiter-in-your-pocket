"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { AlpineTrustRow } from "./AlpineTrustRow";
import { LionScene } from "./LionScene";
import styles from "./MineralHero.module.css";

export function MineralHero() {
    const compositionRef = useRef<HTMLDivElement>(null);

    return (
        <section className={styles.hero} aria-labelledby="mineral-hero-title">
            <div ref={compositionRef} className={styles.composition} data-testid="lion-hero-composition">
                <div className={styles.copy}>
                    <p className={styles.eyebrow}>AI feedback. Real recruiting experience.</p>
                    <h1 id="mineral-hero-title">You did the work.<br />Let&rsquo;s make sure<br /><span className={styles.lastLine}>they see it.</span></h1>
                    <p className={styles.deck}>Get a thorough, honest, and actionable resume diagnostic, shaped by real recruiting experience.</p>
                    <Link href="/workspace" className={styles.primary} data-testid="landing-primary-cta">Get your free report <ArrowRight aria-hidden="true" /></Link>
                    <p className={styles.free}>No account required. Your resume is private and secure.</p>
                </div>
                <div className={styles.visual}>
                    <LionScene compositionRef={compositionRef} />
                </div>
            </div>
            <AlpineTrustRow />
        </section>
    );
}
