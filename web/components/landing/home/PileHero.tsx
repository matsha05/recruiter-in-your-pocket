"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import styles from "./PileHero.module.css";

/** The other resumes in the pile: real text, set faintly, so only the top sheet is read. */
function OtherResume({ name, lines }: { name: string; lines: string[] }) {
    return (
        <div className={styles.faint}>
            <p className={styles.docName}>{name}</p>
            {lines.map((line) => <p key={line}>{line}</p>)}
        </div>
    );
}

const OTHER_LINES = [
    "Professional Summary",
    "Dedicated self-starter with strong attention to detail and a passion for excellence in fast-paced environments.",
    "Experience",
    "Operations Associate, 2020 – Present",
    "Coordinated schedules, vendors, and reporting for the regional team.",
    "Responsible for maintaining records and supporting day-to-day operations.",
    "Skills",
    "Excel, Communication, Problem Solving",
];

/**
 * The opening: your resume is one sheet in a pile, and the top one shows how a
 * recruiter reads it. The sheets settle and the marks land once; reduced motion
 * shows the finished pile.
 */
export function PileHero() {
    const sentinel = useRef<HTMLDivElement>(null);

    // The header sits on the ink until the visitor scrolls past this opening.
    useEffect(() => {
        const root = document.documentElement;
        const target = sentinel.current;
        if (!target) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Only "past" when the hero's end has moved above the header, not when it is still below the fold.
                const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 72;
                if (scrolledPast) root.dataset.headerSolid = "true";
                else delete root.dataset.headerSolid;
            },
            { rootMargin: "-72px 0px 0px 0px" },
        );
        observer.observe(target);
        return () => {
            observer.disconnect();
            delete root.dataset.headerSolid;
        };
    }, []);

    return (
        <section className={styles.hero} aria-labelledby="hero-title" data-testid="landing-pile-hero">
            <div className={styles.inner}>
                <div className={styles.copy}>
                    <h1 id="hero-title" className={styles.title}>See what a recruiter sees.</h1>
                    <p className={styles.deck}>
                        Your resume lands in a pile. See what a recruiter will stop on, what they&rsquo;ll skim past, and the one thing to fix first.
                    </p>
                    <div className={styles.actions}>
                        <Link href="/workspace" className={styles.primary} data-testid="landing-primary-cta" data-analytics-cta="hero_report">
                            Read my resume <ArrowRight weight="bold" aria-hidden="true" />
                        </Link>
                        <Link href="/sample-report" className={styles.secondary} data-analytics-cta="hero_sample">
                            See a full example
                        </Link>
                    </div>
                    <p className={styles.fine}>Your first report is free. No account or card.</p>
                </div>

                <div className={styles.pile} aria-hidden="true" data-testid="landing-pile">
                    <div className={`${styles.sheet} ${styles.under1}`}><OtherResume name="Priya Natarajan" lines={OTHER_LINES} /></div>
                    <div className={`${styles.sheet} ${styles.under2}`}><OtherResume name="Marcus Bell" lines={OTHER_LINES} /></div>
                    <div className={`${styles.sheet} ${styles.under3}`}><OtherResume name="Elena Ruiz" lines={OTHER_LINES} /></div>
                    <div className={`${styles.sheet} ${styles.top}`}>
                        {/* A real, ordinary resume, marked up in the margin the way a recruiter marks a printout.
                            Each row pairs a line with its margin, so a note always sits beside its own line. */}
                        <div className={styles.doc}>
                            <p className={styles.docName}>Jordan A. Miller</p>
                            <p className={styles.docContact}>Denver, CO · jmiller@example.com · linkedin.com/in/jmiller</p>

                            <p className={styles.docHead}>Objective</p>
                            <div className={styles.row}>
                                <p className={styles.docText}><span className={styles.skimmed}>Results-driven, detail-oriented professional seeking a challenging role where I can utilize my skills and grow with a dynamic company.</span></p>
                                <p className={`${styles.note} ${styles.note1}`}>Every resume says this. Cut it.</p>
                            </div>

                            <p className={styles.docHead}>Experience</p>
                            <p className={styles.docRole}><span><b>Customer Success Manager</b>, Northwind Analytics</span><span>2021 – Present</span></p>
                            <div className={styles.row}>
                                <p className={styles.bullet}><span className={styles.skimmed2}>Responsible for managing customer relationships and renewals</span></p>
                                <p className={`${styles.note} ${styles.note2}`}>What did <em>you</em> do?</p>
                            </div>
                            <div className={styles.row}>
                                <p className={styles.bullet}><span className={styles.kept}>Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue</span></p>
                                <p className={`${styles.note} ${styles.note3}`}>Don&rsquo;t touch this one.</p>
                            </div>
                            <div className={styles.row}>
                                <p className={styles.bullet}><span className={styles.marked}>Introduced monthly renewal-risk reviews across the portfolio</span></p>
                                <p className={`${styles.note} ${styles.miss}`}><span className={styles.missLabel}>Critical Miss</span>Did renewals go up?</p>
                            </div>
                            <div className={styles.row}><p className={styles.bullet}>Collaborated cross-functionally with Product and Support teams</p></div>
                            <div className={styles.row}><p className={styles.bullet}>Team player with excellent communication skills</p></div>

                            <p className={styles.docRole}><span><b>Account Coordinator</b>, Brightpath Logistics</span><span>2018 – 2021</span></p>
                            <div className={styles.row}><p className={styles.bullet}>Assisted account managers with various tasks as needed</p></div>
                            <div className={styles.row}><p className={styles.bullet}>Handled weekly reporting</p></div>

                            <p className={styles.docHead}>Skills</p>
                            <p className={styles.docText}>Microsoft Office, Salesforce, Communication, Leadership, Time Management</p>
                        </div>
                    </div>
                </div>
            </div>
            <div ref={sentinel} className={styles.sentinel} />
        </section>
    );
}
