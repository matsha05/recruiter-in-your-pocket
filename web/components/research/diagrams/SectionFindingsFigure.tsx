"use client";

import { Mark, PenNote, useSeen } from "@/components/research/figures/FigureKit";
import styles from "./SectionFindingsFigure.module.css";

// Pina et al. (2023), section-level results as the article states them. The sheet is drawn:
// the section names are the study's, the order and the gray lines are illustration.
export const SECTION_FINDINGS = [
    { name: "Address", lines: [44], result: "No comparable result", tone: "none" },
    { name: "Introduction", lines: [92, 70], result: "No comparable result", tone: "none" },
    { name: "Education", lines: [80, 52], result: "Mattered to a lesser extent", tone: "some" },
    { name: "Experience", lines: [96, 88, 72, 90, 64], result: "Longer looks went with moving forward", tone: "strong" },
    { name: "Projects", lines: [84, 58], result: "No comparable result", tone: "none" },
    { name: "Skills", lines: [76, 48], result: "No comparable result", tone: "none" },
] as const;

// The article's figure draws only the sections with a result (Nov 6, 2026): the four "No comparable result"
// rows became one muted line under the sheet. The hub's figure still lists all six.
const DRAWN = SECTION_FINDINGS.filter((section) => section.tone !== "none");
const NO_RESULT = SECTION_FINDINGS.filter((section) => section.tone === "none").map((section) => section.name);
const noResultLine = `No comparable result for ${NO_RESULT.slice(0, -1).join(", ")} or ${NO_RESULT.at(-1)}.`;

export function SectionFindingsFigure({ figureNumber = 1 }: { figureNumber?: number }) {
    const { ref, seen } = useSeen<HTMLElement>();
    return (
        <figure ref={ref} className={styles.figure} aria-labelledby="section-findings-title">
            <h2 id="section-findings-title" className={styles.title}>What the 2023 study found, section by section</h2>

            <div className={styles.rows} role="list" aria-label="Resume sections and what the study found for each">
                {DRAWN.map((section) => (
                    <div key={section.name} className={styles.row} role="listitem" data-tone={section.tone}>
                        <div className={styles.sheet}>
                            <p className={styles.heading}>
                                {section.tone === "strong" ? <Mark seen={seen}>{section.name}</Mark> : section.name}
                            </p>
                            <span className={styles.lines} aria-hidden="true">
                                {section.lines.map((width, index) => <span key={index} style={{ width: `${width}%` }} />)}
                            </span>
                        </div>
                        <p className={styles.result}>
                            <span className="sr-only">{section.name}: </span>{section.result}
                        </p>
                    </div>
                ))}
            </div>
            <p className={styles.noResult}>{noResultLine}</p>

            <PenNote className={styles.note}>Time here went with moving forward. Make it the easiest section to judge.</PenNote>

            <figcaption className={styles.caption}>
                Fig. {figureNumber} / Pina et al. (2023); the study&rsquo;s details are below. Drawn by us: the section names are the study&rsquo;s, and the order and lines are illustration.
                &ldquo;No comparable result&rdquo; doesn&rsquo;t mean a section never matters.
            </figcaption>
        </figure>
    );
}
