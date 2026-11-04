"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import home from "./HomePage.module.css";
import styles from "./CloseField.module.css";

const PILE = 244;
/** The sheet that is yours: near the end of the pile, where a late application lands. */
const YOURS = 229;

/**
 * The close: the pile from the top of the page comes back, pale, and one sheet takes an ink outline when the
 * section is in view, yours. No green, no promise. The ask is the one thing the product can do.
 */
export function CloseField() {
    const ref = useRef<HTMLElement>(null);
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setSeen(true); return; }
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) { setSeen(true); observer.disconnect(); }
        }, { threshold: 0.5 });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    return (
        <section ref={ref} className={cn(home.section, styles.close, seen && styles.seen)} aria-labelledby="close-title" data-testid="landing-close">
            <div className={styles.inner}>
                <div className={styles.copy}>
                    <h2 id="close-title" className={styles.title}>Before you apply for the next one.</h2>
                    <Button asChild size="lg">
                        <Link href="/workspace" data-analytics-cta="closing_report">Get your free report <ArrowRight weight="bold" aria-hidden="true" /></Link>
                    </Button>
                </div>
                <div className={styles.pile} role="img" aria-label="244 sheets of paper, one of them outlined: yours">
                    {Array.from({ length: PILE }, (_, index) => (
                        <span key={index} className={cn(styles.sheet, index === YOURS && styles.yours)} />
                    ))}
                </div>
            </div>
        </section>
    );
}
