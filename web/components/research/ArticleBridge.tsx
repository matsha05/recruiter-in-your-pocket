"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { PenArrow, PenNote } from "@/components/materials/Pen";
import { useSeen } from "@/hooks/use-seen";
import styles from "./ArticleBridge.module.css";

/**
 * The one turn to the reader's own resume inside an article (Nov 4, 2026): the recruiter's question in the
 * pen, where the advice is, with a text link. It replaced a bordered card with a button; the big button stays
 * at the article's close, as on the homepage, and a chapter never carries a second one. Matt chose the note
 * over the card from the Nov 4 mocks.
 */
export function ArticleBridge({ question, children, reportHref = "/workspace" }: {
    question: string;
    children: ReactNode;
    reportHref?: string;
}) {
    const { ref, seen } = useSeen<HTMLElement>(0.5);
    return (
        <aside ref={ref} className={`not-prose ${styles.bridge}`} aria-label={reportHref === "/workspace" ? "Apply this to your resume" : question}>
            <PenArrow drawn={seen} className={styles.arrow} />
            <PenNote as="div" className={styles.note}>
                <p className={styles.question}>{question}</p>
                <div className={styles.body}>{children}</div>
            </PenNote>
            <Link href={reportHref} className={`riyp-link ${styles.link}`} data-analytics-cta="research_bridge">
                Get your free report <ArrowRight aria-hidden="true" />
            </Link>
        </aside>
    );
}
