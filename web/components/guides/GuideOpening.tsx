import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import styles from "./GuideOpening.module.css";

/**
 * A guide's opening on the site rhythm (Nov 4, 2026): the eyebrow, the title, our take as the one short
 * paragraph, the quick start as three rows on hairlines instead of three cards, and one link. The body of the
 * guide follows unchanged. Mocked and chosen by Matt from the Nov 4 preview.
 */
export function GuideOpening({ eyebrow, title, take, quick, link }: {
    eyebrow: string;
    title: ReactNode;
    take: ReactNode;
    quick: ReadonlyArray<readonly [string, string]>;
    link: { href: string; label: string };
}) {
    return (
        <header>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.deck}>{take}</p>
            <ol className={styles.quick} aria-label="Quick start">
                {quick.map(([lead, body]) => <li key={lead}><span><strong>{lead}.</strong> {body}</span></li>)}
            </ol>
            <div className={styles.link}>
                <Link href={link.href} className="riyp-link">{link.label} <ArrowRight aria-hidden="true" /></Link>
            </div>
        </header>
    );
}
