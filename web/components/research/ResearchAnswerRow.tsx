import Link from "next/link";
import type { ResearchArticle } from "@/components/research/ResearchHubData";
import styles from "./ResearchAnswerRow.module.css";

/**
 * One research answer as a row: the question (the link, its hit area stretched over the row), then the short
 * answer in bold ink and what it rests on. The hub's index, every article's next questions and the guides page
 * use this one row, so a question reads the same wherever it appears (Nov 6, 2026). Guides and tools, which have
 * no verdict, show their own one-line answer.
 */
export function ResearchAnswerRow({ article, heading = "h3", showEvidence = true }: { article: ResearchArticle; heading?: "h2" | "h3" | "h4"; showEvidence?: boolean }) {
    const Heading = heading;
    return (
        <article className={styles.row}>
            <Heading className={styles.question}>
                <Link href={article.href} className={styles.link}>{article.question}</Link>
            </Heading>
            <div className={styles.answer}>
                <p className={styles.text}>
                    {article.verdict ? <><strong className={styles.verdict}>{article.verdict}</strong> {article.finding}</> : article.answer}
                </p>
                {showEvidence && article.evidence ? (
                    <p className={styles.evidence}>
                        <span className={styles.kind}>{article.evidence.kind}</span> {article.evidence.cite}
                    </p>
                ) : null}
            </div>
        </article>
    );
}
