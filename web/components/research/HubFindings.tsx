"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Mark, UnitGrid, useSeen } from "@/components/research/figures/FigureKit";
import { SECTION_FINDINGS } from "@/components/research/diagrams/SectionFindingsFigure";
import { ERROR_IMPACT } from "@/components/research/diagrams/ErrorImpactDiagram";
import styles from "./HubFindings.module.css";

// Applications that reached an interview, per 100: Ashby's customer data, 2021 to 2024, the referral article's
// opening answer and its source line (40% referred, 3% cold). The article's own figures draw the offer rates.
const REFERRAL_PER_100 = [
    { label: "Referred", reached: 40 },
    { label: "Applied cold", reached: 3 },
] as const;

/**
 * The three findings people ask about most, each drawn from its article's own numbers (Nov 6, 2026): two import
 * the article figures' data and the third states the article's opening answer, so the hub can't say something the
 * article doesn't. One highlighter or one
 * pen series per figure, the way the figure kit draws everything (design-system.md §8).
 */
export function HubFindings() {
    return (
        <section className={styles.findings} aria-labelledby="hub-findings-title">
            <h2 id="hub-findings-title" className="sr-only">Three findings, drawn</h2>
            <SixSeconds />
            <Typos />
            <Referrals />
        </section>
    );
}

function Finding({ id, question, takeaway, href, caption, children }: { id: string; question: string; takeaway: string; href: string; caption: ReactNode; children: ReactNode }) {
    return (
        <figure className={styles.figure} aria-labelledby={`${id}-question`}>
            <h3 id={`${id}-question`} className={styles.question}>{question}</h3>
            <p className={styles.takeaway}>{takeaway}</p>
            <div className={styles.visual}>{children}</div>
            <figcaption className={styles.caption}>{caption}</figcaption>
            <Link href={href} className={`${styles.read} riyp-link`}>
                Read the answer<span className="sr-only">: {question}</span>
            </Link>
        </figure>
    );
}

function SixSeconds() {
    const { ref, seen } = useSeen<HTMLDivElement>();
    return (
        <Finding
            id="six-seconds"
            question="Do recruiters only spend six seconds on a resume?"
            takeaway="No. Time on Experience went with moving forward."
            href="/research/how-recruiters-read"
            caption={<>What 2,043 resume reviews showed, section by section. &ldquo;No comparable result&rdquo; doesn&rsquo;t mean a section never matters. Pina et al., 2023.</>}
        >
            <div ref={ref} className={styles.sections} role="list" aria-label="Resume sections and what the study found for each">
                {SECTION_FINDINGS.map((section) => (
                    <div key={section.name} className={styles.section} role="listitem" data-tone={section.tone}>
                        <span className={styles.sectionName}>{section.tone === "strong" ? <Mark seen={seen}>{section.name}</Mark> : section.name}</span>
                        <span className={styles.sectionResult}><span className="sr-only">{section.name}: </span>{section.result}</span>
                    </div>
                ))}
            </div>
        </Finding>
    );
}

function Typos() {
    const { ref, seen } = useSeen<HTMLDivElement>();
    return (
        <Finding
            id="typos"
            question="Will one typo on my resume cost me the interview?"
            takeaway="Five typos cost almost two points out of ten."
            href="/research/spelling-errors-impact"
            caption={<>Against the same resume without errors. One typo wasn&rsquo;t tested. Sterkens et al., PLOS ONE, 2023, 445 hiring professionals.</>}
        >
            <div ref={ref} className={styles.rulers}>
                {ERROR_IMPACT.map((row) => (
                    <div key={row.label} className={styles.ruler}>
                        <p className={styles.rulerHead}>
                            <span>{row.label}<span className="sr-only">:</span></span>
                            <span className={styles.rulerValue}>&minus;{row.lost.toFixed(2)} <span className={styles.unit}>points</span></span>
                        </p>
                        <div className={styles.track} aria-hidden="true">
                            <span
                                className={styles.fill}
                                data-highlight={row.highlight ? "true" : undefined}
                                style={{ width: `${row.lost * 10}%`, transform: seen ? "scaleX(1)" : "scaleX(0)" }}
                            />
                        </div>
                    </div>
                ))}
                <p className={styles.scale} aria-hidden="true"><span>0</span> <span>10 points</span></p>
            </div>
        </Finding>
    );
}

function Referrals() {
    const { ref, seen } = useSeen<HTMLDivElement>();
    return (
        <Finding
            id="referrals"
            question="How much does a referral really help?"
            takeaway="A lot. 40 in 100 reached an interview, against 3 sent cold."
            href="/research/referral-advantage"
            caption={<>Applications that reached an interview, per 100. Ashby customer data, 2021 to 2024, 38 million applications.</>}
        >
            <div ref={ref} className={styles.piles}>
                {REFERRAL_PER_100.map((group) => (
                    <div key={group.label} className={styles.pile}>
                        <p className={styles.pileHead}>
                            <span>{group.label}<span className="sr-only">:</span></span>
                            <span className={styles.pileValue}>{group.reached} in 100</span>
                        </p>
                        <UnitGrid count={100} columns={10} seen={seen} toneAt={(index) => (index < group.reached ? "pen" : "faint")} />
                    </div>
                ))}
            </div>
        </Finding>
    );
}
