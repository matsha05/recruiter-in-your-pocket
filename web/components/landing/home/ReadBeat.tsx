"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./ReadBeat.module.css";

/**
 * The second beat (Matt, Nov 4, 2026): the read, in the time it takes to read the sentence. The recruiter's
 * green pen draws a line under the headline at reading pace, starting when a third of the section is in
 * view. When it reaches the end, the two choices a recruiter has appear where the pen stopped, and the pen
 * circles Reject in red: the one red mark on the site, spent on the decision. Then the ending and the button.
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
                        <p className={styles.pen} aria-hidden="true"><span className={styles.ink} /></p>
                        <p className={styles.choices} aria-label="Move forward or reject. Reject is circled.">
                            <span className={styles.choice}>Move forward</span>
                            <span className={cn(styles.choice, styles.rejected)}>
                                Reject
                                <svg className={styles.circle} viewBox="0 0 120 48" preserveAspectRatio="none" aria-hidden="true">
                                    {/* One loop, one pass: started at the left, closed just past its own start the way a quick hand does. */}
                                    <path d="M 18 18 C 20 4, 64 -2, 96 6 C 122 12, 124 36, 98 44 C 66 53, 14 52, 6 36 C 1 25, 10 14, 26 12" />
                                </svg>
                            </span>
                        </p>
                    </div>
                </div>
                <p className={styles.ending}>
                    {ENDING.map((sentence) => <span key={sentence} className={styles.sentence}>{sentence}</span>)}
                </p>
                <div className={styles.actions}>
                    <Button asChild size="lg">
                        <Link href="/workspace" data-analytics-cta="read_report">
                            Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
