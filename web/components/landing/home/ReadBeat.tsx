"use client";

import { useEffect, useRef, useState } from "react";
import { PenCircle, PenUnderline } from "@/components/materials/Pen";
import { cn } from "@/lib/utils";
import styles from "./ReadBeat.module.css";

/**
 * The second beat (Matt, Nov 4, 2026): the read, in the time it takes to read the sentence. The recruiter's
 * green pen draws a line under the headline at reading pace, starting when a third of the section is in
 * view. When it reaches the end, the two choices a recruiter has appear where the pen stopped, and the pen
 * circles Reject in red: the one red mark on the site, spent on the decision. The ending is on the page from
 * the start (Nov 10, 2026), so the section is never a blank band while the pen runs. It carries no button
 * (Matt, Nov 11, 2026): the hero's is one scroll up and the header's is still on screen, and this section's job
 * is to show the read, not to ask again.
 * Under reduced motion everything is simply there.
 */
const HEADLINE = "By the time you finish reading this sentence, a recruiter has finished reading your resume.";
const ENDING = ["Nobody tells you why.", "We do, before you apply for the next one."];

export function ReadBeat() {
    const ref = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const [lit, setLit] = useState(false);
    const [on, setOn] = useState(false);
    const [measure, setMeasure] = useState<number | null>(null);

    // The pen runs the width of the widest line as set, not the width of the box the text wraps in.
    useEffect(() => {
        const heading = headingRef.current;
        if (!heading) return;
        const read = () => {
            const range = document.createRange();
            range.selectNodeContents(heading);
            let widest = 0;
            for (const rect of Array.from(range.getClientRects())) widest = Math.max(widest, rect.width);
            setMeasure(widest > 0 ? Math.ceil(widest) : null);
        };
        read();
        const observer = new ResizeObserver(read);
        observer.observe(heading);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setLit(true); setOn(true); return; }
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) { setLit(true); observer.disconnect(); }
        }, { threshold: 0.3 });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!lit || on) return;
        const timer = window.setTimeout(() => setOn(true), 5400);
        return () => window.clearTimeout(timer);
    }, [lit, on]);

    return (
        <section
            ref={ref}
            className={cn(styles.beat, lit && styles.lit, on && styles.on)}
            aria-labelledby="read-title"
            data-testid="landing-read"
            data-lit={lit || undefined}
            data-on={on || undefined}
        >
            <div className={styles.inner}>
                <div className={styles.said}>
                    <h2 id="read-title" ref={headingRef} className={styles.line}>{HEADLINE}</h2>
                    <div className={styles.penRun} style={measure ? { width: `${measure}px` } : undefined}>
                        <PenUnderline drawn={lit} duration={5000} delay={400} className={styles.pen} />
                        <p className={styles.choices} aria-label="Move forward or reject. Reject is circled.">
                            <span className={styles.choice}>Move forward</span>
                            {/* The one red mark on the site (Matt, Nov 4, 2026): the recruiter's decision, nothing else. */}
                            <PenCircle drawn={on} ink="reject" delay={800} className={cn(styles.choice, styles.rejected)}>Reject</PenCircle>
                        </p>
                    </div>
                </div>
                <p className={styles.ending}>
                    {ENDING.map((sentence) => <span key={sentence} className={styles.sentence}>{sentence}</span>)}
                </p>
            </div>
        </section>
    );
}
