"use client";

import { useSeen } from "@/hooks/use-seen";
import { Clipping } from "@/components/materials/Clipping";
import { Paper } from "@/components/materials/Paper";
import { MarkerStroke, PenArrow, PenCircle, PenNote, PenUnderline } from "@/components/materials/Pen";
import { Pile } from "@/components/materials/Pile";
import { SignedNote } from "@/components/materials/SignedNote";
import { FOUNDER_NOTE } from "@/components/landing/home/FounderNote";
import { JORDAN_EXAMPLE } from "@/lib/marketing/jordan-example";
import styles from "./Preview.module.css";

const REPLIED = [3, 17, 29, 41, 58, 66, 83, 97, 104, 121, 139, 150, 168, 177, 193, 206, 222, 238];

function Item({ name, rule, children }: { name: string; rule: string; children: React.ReactNode }) {
    return (
        <div className={styles.item}>
            <div><h3>{name}</h3><p>{rule}</p></div>
            <div className={styles.object}>{children}</div>
        </div>
    );
}

/** The pen's marks, drawn once when their row scrolls into view. */
function PenRow() {
    const { ref, seen } = useSeen<HTMLDivElement>(0.5);
    return (
        <div ref={ref}>
            <div className={styles.said}>
                <p className={styles.sentence}>A recruiter has finished reading your resume.</p>
                <PenUnderline drawn={seen} duration={2600} />
                <p className={styles.choices}>
                    <span className={seen ? styles.quiet : undefined}>Move forward</span>
                    <PenCircle drawn={seen} ink="reject" delay={2800}>Reject</PenCircle>
                </p>
            </div>
        </div>
    );
}

function PenCircleRow() {
    const { ref, seen } = useSeen<HTMLDivElement>(0.5);
    return (
        <div ref={ref} className={styles.choices} style={{ justifyContent: "flex-start" }}>
            <PenCircle drawn={seen} ink="pen" delay={200}>Customer Success Manager</PenCircle>
        </div>
    );
}

function MarkerRow() {
    const { ref, seen } = useSeen<HTMLDivElement>(0.5);
    return (
        <div ref={ref}>
            <Paper kind="strip" style={{ maxWidth: "38rem" }}>
                <span style={{ position: "relative", display: "inline-block" }}>
                    <MarkerStroke drawn={seen} filterId="preview-marker" />
                    {JORDAN_EXAMPLE.line}
                </span>
            </Paper>
        </div>
    );
}

function NoteRow() {
    const { ref, seen } = useSeen<HTMLDivElement>(0.5);
    return (
        <div ref={ref} style={{ display: "grid", gridTemplateColumns: "2.5rem minmax(0, 28rem)", gap: "0.75rem", alignItems: "start" }}>
            <PenArrow drawn={seen} />
            <PenNote>{JORDAN_EXAMPLE.note}</PenNote>
        </div>
    );
}

export function Materials() {
    return (
        <div className={styles.sheet}>
            <Item name="Paper" rule="Off-white, a 0.5px hairline edge, a soft shadow. Inside it, the document's own face. Only ever a real document or a real line from one.">
                <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "12rem minmax(0, 1fr)", alignItems: "start" }}>
                    <Paper kind="page" style={{ aspectRatio: "8.5 / 11" }} aria-hidden="true">
                        <p style={{ margin: 0, fontWeight: 600 }}>Jordan A. Miller</p>
                        <p style={{ margin: "0.75rem 0 0", color: "hsl(var(--document-ghost))", fontSize: "0.75rem" }}>Customer Success Manager</p>
                    </Paper>
                    <Paper kind="strip">Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue</Paper>
                </div>
            </Item>
            <Item name="The pile" rule="One sheet per thing counted; the last row is short because the number is real. Arrives once as the hero, stands still elsewhere, pale at a distance.">
                <div style={{ display: "grid", gap: "2.5rem" }}>
                    <Pile count={244} marked={REPLIED} motion="still" label="244 sheets, eighteen green" />
                    <Pile count={244} pale size="sm" outlined={229} label="244 pale sheets, one outlined" />
                    <Pile count={6} size="xl" outlined={0} label="Six sheets, the first outlined" />
                </div>
            </Item>
            <Item name="The marker" rule="Two rough passes under the one line a recruiter would miss. One per figure, never two.">
                <MarkerRow />
            </Item>
            <Item name="The pen: underline and circle" rule="Underlines at reading pace. Circles once. The red ink exists for one circle on the whole site: the decision, on the homepage. Everywhere else the pen is green.">
                <div style={{ display: "grid", gap: "3rem" }}>
                    <PenRow />
                    <PenCircleRow />
                </div>
            </Item>
            <Item name="The pen: margin note" rule="Literata italic in pen, a sentence or two, with the arrow back to the line. The recruiter's actual words, never ours.">
                <NoteRow />
            </Item>
            <Item name="The clipping" rule="The line on its strip, the neighbours fading off the cut edges, the marker, the note. Assembled from the three materials; the product's output in one object.">
                <Clipping
                    line={JORDAN_EXAMPLE.line}
                    note={JORDAN_EXAMPLE.note}
                    above="Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue"
                    below="Ran quarterly business reviews with customer leadership teams"
                />
            </Item>
            <Item name="The signed note" rule="The recruiter in the first person, signed with the wordmark. Homepage, and once more on How the report works. Nowhere else.">
                <SignedNote size="md">{FOUNDER_NOTE}</SignedNote>
            </Item>
            <Item name="Tokens" rule="paper-sheet, paper-edge, document-ink, document-ghost, marker, pen, reject-ink. The red is spent.">
                <div className={styles.swatches}>
                    {[["paper-sheet", "hsl(var(--paper-sheet))"], ["document-ink", "hsl(var(--document-ink))"], ["document-ghost", "hsl(var(--document-ghost))"], ["marker", "hsl(var(--marker))"], ["pen", "hsl(var(--pen))"], ["reject-ink", "hsl(var(--reject-ink))"]].map(([name, value]) => (
                        <div key={name} className={styles.swatch}><span style={{ background: value, boxShadow: "0 0 0 0.5px hsl(var(--paper-edge))" }} /><span>{name}</span></div>
                    ))}
                </div>
            </Item>
        </div>
    );
}
