"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CaretDown } from "@phosphor-icons/react";
import sampleReport from "@/public/sample-report.json";
import { Button } from "@/components/ui/button";
import { FREE_REPORT_ENTITLEMENT } from "@/lib/billing/pricing";
import styles from "./WholeReportPreview.module.css";

const priorities = sampleReport.top_fixes;
// The selected visual uses an illustrative assessment above the working sample.
const illustrationPriorities = [
    "Strengthen impact with measurable results",
    "Clarify and tighten your core narrative",
    "Showcase more relevant skills",
    "Polish formatting for better readability",
];
const nextMoves = [
    sampleReport.next_steps[0],
    sampleReport.rewrites[0].enhancement_note,
    sampleReport.rewrites[1].enhancement_note,
];

function Arrow({ className }: { className?: string }) {
    return (
        <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** The selected reference overview, followed by the real interactive sample. */
export function WholeReportPreview() {
    // Open on the launch example so the report immediately shows more than onboarding.
    const [selectedPriority, setSelectedPriority] = useState(1);
    const [overviewExpanded, setOverviewExpanded] = useState(false);
    const priorityButtons = useRef<Array<HTMLButtonElement | null>>([]);
    const reportRef = useRef<HTMLElement>(null);
    const id = useId();
    const selected = priorities[selectedPriority];

    useEffect(() => {
        const report = reportRef.current;
        if (!report) return;
        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        let arrival: Animation | undefined;
        const stopArrival = () => { if (preference.matches) arrival?.cancel(); };
        // The reference overview stays still. This lower report remains readable
        // throughout its one-time arrival, with no pinned or additional scroll.
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            if (!preference.matches) {
                arrival = report.animate(
                    [{ transform: "translateY(18px)" }, { transform: "translateY(0)" }],
                    { duration: 850, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
                );
            }
        }, { rootMargin: "0px 0px -5% 0px", threshold: 0 });
        observer.observe(report);
        preference.addEventListener("change", stopArrival);
        return () => {
            observer.disconnect();
            arrival?.cancel();
            preference.removeEventListener("change", stopArrival);
        };
    }, []);

    function handlePriorityKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        let nextIndex = index;

        switch (event.key) {
            case "ArrowDown":
                nextIndex = (index + 1) % priorities.length;
                break;
            case "ArrowUp":
                nextIndex = (index - 1 + priorities.length) % priorities.length;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = priorities.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        setSelectedPriority(nextIndex);
        priorityButtons.current[nextIndex]?.focus();
    }

    return (
        <section id="how-it-works" className={styles.section} aria-labelledby={`${id}-heading`}>
            <div className={styles.shell}>
                <div className={styles.intro}>
                    <article className={styles.summaryPreview} aria-label="Example resume assessment">
                        <div className={styles.summaryPaper}>
                            <section className={styles.summaryAssessment} aria-labelledby={`${id}-assessment`}>
                                <div className={styles.assessmentHeading}>
                                    <div>
                                        <h3 id={`${id}-assessment`}>Overall Assessment</h3>
                                        <p className={styles.assessmentVerdict}>Strong foundation. Clear next steps.</p>
                                    </div>
                                    <div className={styles.scoreRing} role="img" aria-label={`Review score: ${sampleReport.score} out of 100`}>
                                        <svg viewBox="0 0 100 100" aria-hidden="true">
                                            <circle className={styles.scoreTrack} cx="50" cy="50" r="43" />
                                            <circle className={styles.scoreValue} cx="50" cy="50" r="43" pathLength="100" strokeDasharray={`${sampleReport.score} 100`} />
                                        </svg>
                                        <div aria-hidden="true"><strong>{sampleReport.score}</strong><span>out of 100</span></div>
                                    </div>
                                </div>
                                <p className={styles.assessmentCopy}>Your resume shows impressive experience and impact. A few key changes will make it even stronger and more aligned with what top companies look for.</p>
                            </section>
                            <section className={styles.summaryPriorities} aria-labelledby={`${id}-summary-priorities`}>
                                <h3 id={`${id}-summary-priorities`}>Top Priorities</h3>
                                <ol>
                                    {illustrationPriorities.map((priority, index) => (
                                        <li key={priority}>
                                            <span aria-hidden="true">{index + 1}</span>
                                            {priority}
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        </div>
                    </article>

                    <header className={styles.introHeading}>
                        <p className={styles.eyebrow}>A full picture, not just fixes.</p>
                        <h2 id={`${id}-heading`}>More than edits.<br />A clearer story.</h2>
                        <p className={styles.introCopy}>
                            See what comes through, what gets missed, and what to improve first—with candid, recruiter-informed feedback on your entire resume.
                        </p>
                        <Link href="/sample-report" className={styles.introLink}>Explore the sample report <Arrow /></Link>
                    </header>
                </div>

                <article ref={reportRef} className={styles.report} aria-label="Sample resume report preview">
                    <header className={styles.reportHeader}>
                        <div className={styles.reportIdentity}>
                            <span className={styles.reportMark} aria-hidden="true">R<span>.</span></span>
                            <div>
                                <p className={styles.reportName}>Resume review</p>
                                <p className={styles.reportContext}>Sample report · Program management</p>
                            </div>
                        </div>
                        <span className={styles.sampleLabel}>An example, from the full report</span>
                    </header>

                    <div className={styles.overviewGroup} data-expanded={overviewExpanded}>
                        <button
                            type="button"
                            className={styles.overviewToggle}
                            aria-expanded={overviewExpanded}
                            aria-controls={`${id}-overview`}
                            onClick={() => setOverviewExpanded(expanded => !expanded)}
                        >
                            First impression &amp; strengths <CaretDown aria-hidden="true" />
                        </button>
                        <div id={`${id}-overview`} className={styles.overview}>
                            <section className={styles.firstImpression} aria-labelledby={`${id}-impression`}>
                                <h3 id={`${id}-impression`} className={styles.label}>The first impression</h3>
                                <p>{sampleReport.first_impression}</p>
                                <div className={styles.overviewNote}>
                                    <span className={styles.noteMark} aria-hidden="true" />
                                    <p>{sampleReport.score_plain}</p>
                                </div>
                            </section>

                            <section className={styles.strengths} aria-labelledby={`${id}-strengths`}>
                                <h3 id={`${id}-strengths`} className={styles.label}>What’s already working</h3>
                                <ul>
                                    {sampleReport.strengths.map((strength) => (
                                        <li key={strength}><span aria-hidden="true">+</span>{strength}</li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>

                    <div className={styles.priorities}>
                        <section className={styles.priorityIndex} aria-labelledby={`${id}-priorities`}>
                            <div className={styles.priorityHeading}>
                                <h3 id={`${id}-priorities`} className={styles.label}>What to improve first</h3>
                                <p>Select a priority to see why.</p>
                            </div>
                            <div className={styles.priorityList} role="tablist" aria-labelledby={`${id}-priorities`} aria-orientation="vertical">
                                {priorities.map((priority, index) => (
                                    <Button
                                        variant="ghost"
                                        key={priority.fix}
                                        ref={(element) => { priorityButtons.current[index] = element; }}
                                        type="button"
                                        role="tab"
                                        id={`${id}-priority-${index}`}
                                        aria-controls={`${id}-detail-${index}`}
                                        aria-selected={selectedPriority === index}
                                        tabIndex={selectedPriority === index ? 0 : -1}
                                        className={styles.priorityButton}
                                        onClick={() => setSelectedPriority(index)}
                                        onKeyDown={(event) => handlePriorityKey(event, index)}
                                    >
                                        <span className={styles.priorityNumber}>{String(index + 1).padStart(2, "0")}</span>
                                        <span>{priority.fix}</span>
                                        <Arrow className={styles.priorityArrow} />
                                    </Button>
                                ))}
                            </div>
                        </section>

                        <div className={styles.detailArea}>
                            {priorities.map((priority, index) => (
                                <section
                                    key={priority.fix}
                                    role="tabpanel"
                                    id={`${id}-detail-${index}`}
                                    aria-labelledby={`${id}-priority-${index}`}
                                    tabIndex={0}
                                    hidden={selectedPriority !== index}
                                    className={styles.detailPanel}
                                >
                                    <div className={styles.detailMeta}>
                                        <span className={styles.label}>A closer look</span>
                                        <span>Priority {String(index + 1).padStart(2, "0")} / 03</span>
                                    </div>
                                    <div className={styles.evidence}>
                                        <p className={styles.evidenceLabel}>From the resume · {priority.evidence.section}</p>
                                        <blockquote>“{priority.evidence.excerpt}”</blockquote>
                                    </div>
                                    <div className={styles.interpretation}>
                                        <h4>What’s missing</h4>
                                        <p>{priority.why}</p>
                                    </div>
                                    <div className={styles.nextMove}>
                                        <span className={styles.nextMoveArrow} aria-hidden="true">↳</span>
                                        <div>
                                            <h4>Your next move</h4>
                                            <p>{nextMoves[index]}</p>
                                        </div>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>

                    <footer className={styles.reportFooter}>
                        <p>Also inside: section reviews, suggested edits, and role alignment.</p>
                        <Link href="/sample-report" className={styles.sampleLink}>
                            Read the complete sample <Arrow />
                        </Link>
                    </footer>
                </article>

                <div className={styles.handoff}>
                    <p>A full first report. Free.<span>No account or credit card needed.</span></p>
                    <Link href="/workspace" className={styles.primaryLink}>
                        Get your free report <Arrow />
                    </Link>
                </div>
                <details className={styles.reportLimits}>
                    <summary>Free report limits</summary>
                    <p>{FREE_REPORT_ENTITLEMENT.boundary}</p>
                </details>
                <span className={styles.visuallyHidden} aria-live="polite" aria-atomic="true">
                    Showing priority {selectedPriority + 1}: {selected.fix}
                </span>
            </div>
        </section>
    );
}
