import type { ReactNode } from "react";
import { FictionalTag } from "@/components/marketing/FictionalTag";
import { Paper } from "@/components/materials/Paper";
import { PenNote } from "@/components/research/figures/FigureKit";
import styles from "./CareerBreakMoves.module.css";

// The three moves for a career break (Nov 6, 2026): the line you write, the sentences you say, and the
// person who vouches. Each is a fictional example, one paragraph on what to do, and the evidence or our take
// in the margin, in the same column as the article's opening. Direction B, chosen by Matt from the Nov 6
// sketches. The resume line is a strip of paper (a real line from a document); what people say is plain
// type, since it isn't a document. No marker: nothing here is a line a recruiter would miss.

type Move = {
    title: string;
    example: ReactNode;
    body: ReactNode;
    note: ReactNode;
};

export function CareerBreakMoves({ moves }: { moves: Move[] }) {
    return (
        <ol className={styles.moves}>
            {moves.map((move, index) => (
                <li key={move.title} className={styles.move}>
                    <div>
                        <h2 className={styles.title}>
                            <span className={styles.number} aria-hidden="true">{index + 1}</span>
                            {move.title}
                        </h2>
                        <div className={styles.example}>
                            {move.example}
                            <FictionalTag className={styles.tag} />
                        </div>
                        <p className={styles.body}>{move.body}</p>
                    </div>
                    <PenNote className={styles.note}>{move.note}</PenNote>
                </li>
            ))}
        </ol>
    );
}

/** Lines cut from an example resume: the line that matters in ink, the one under it fading. */
export function ResumeStrip({ line, below }: { line: { dates: string; entry: ReactNode }; below: { dates: string; entry: ReactNode } }) {
    return (
        <Paper as="dl" kind="strip" className={styles.strip}>
            <div className={styles.resumeRow}>
                <dt className={styles.dates}>{line.dates}</dt>
                <dd className={styles.entry}>{line.entry}</dd>
            </div>
            <div className={`${styles.resumeRow} ${styles.ghost}`}>
                <dt className={styles.dates}>{below.dates}</dt>
                <dd className={styles.entry}>{below.entry}</dd>
            </div>
        </Paper>
    );
}

/** Something said out loud. */
export function Spoken({ children }: { children: ReactNode }) {
    return <blockquote className={styles.spoken}><p>{children}</p></blockquote>;
}
