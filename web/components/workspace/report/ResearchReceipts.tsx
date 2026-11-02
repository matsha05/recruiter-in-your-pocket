import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import styles from "./ResearchReceipts.module.css";

// The research behind the read: one note per part of the score, in the words /methodology uses
// for it, linked to the article that backs it (docs/research-library-strategy.md, §4). The
// mapping is ours; the studies didn't test the score, and /methodology says so.
const RECEIPTS = [
    { part: "How your experience fits together", note: "Why the first read of you sticks", href: "/research/who-you-are", cta: "report_research_story" },
    { part: "The results you show", note: "Why we keep asking what changed", href: "/research/quantifying-impact", cta: "report_research_impact" },
    { part: "How clearly each line reads", note: "Where a recruiter’s attention goes", href: "/research/how-recruiters-read", cta: "report_research_clarity" },
    { part: "How easy the text is to follow", note: "How much a typo really costs", href: "/research/spelling-errors-impact", cta: "report_research_readability" },
] as const;

/** Margin notes that open the research behind each part of the score, in a new tab so the report stays put. */
export function ResearchReceipts() {
    return (
        <aside className={styles.receipts} aria-labelledby="research-receipts-title" data-testid="research-receipts">
            <p id="research-receipts-title" className={styles.title}>Why we read it this way</p>
            <p className={styles.intro}>The score weighs four things. Here&rsquo;s the research behind each one.</p>
            <ul className={styles.notes}>
                {RECEIPTS.map((receipt) => (
                    <li key={receipt.href}>
                        <span className={styles.part}>{receipt.part}</span>
                        <a href={receipt.href} target="_blank" rel="noopener" className={`focus-ring ${styles.note}`} data-analytics-cta={receipt.cta}>
                            {receipt.note}<span className="sr-only"> (opens in a new tab)</span>
                            <ArrowUpRight className={styles.icon} weight="bold" aria-hidden="true" />
                        </a>
                    </li>
                ))}
            </ul>
            <Link href="/methodology" target="_blank" rel="noopener" className={`focus-ring riyp-link-quiet ${styles.method}`} data-analytics-cta="report_methodology">
                How the score is built<span className="sr-only"> (opens in a new tab)</span>
            </Link>
        </aside>
    );
}
