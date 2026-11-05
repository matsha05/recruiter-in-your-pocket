import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import rhythm from "@/components/materials/Rhythm.module.css";
import { ResearchAnswerRow } from "@/components/research/ResearchHub";
import { hubEntryForHref } from "@/components/research/ResearchHubData";
import styles from "./Guides.module.css";

export const metadata: Metadata = {
    title: "After the offer",
    description: "Negotiation guides written from the recruiter’s side of the table, plus an offer calculator for comparing the pay.",
    alternates: { canonical: "/resources" },
};

// Each guide is its title, one line on what it covers, and the way in.
const GUIDES = [
    { title: "How to negotiate a job offer", line: "The salary question, the offer call, your number, the counter, and the close.", href: "/resources/offer-negotiation", action: "Read" },
    { title: "How to read and negotiate a tech offer", line: "Base, bonus, equity and the vesting that decides what the number is worth.", href: "/resources/tech-offer-negotiation", action: "Read" },
    { title: "Which offer is actually better?", line: "Put salary, bonus, equity and one-time pay on the same footing and compare.", href: "/resources/tools/comp-calculator", action: "Compare" },
];

// Titled from the Research hub, the same string as each article's H1.
const RELATED = ["/research/referral-advantage", "/research/salary-history-bans", "/research/star-method"];

/**
 * After the offer (Nov 4, 2026): the three things as rows on hairlines, the way the research hub lists its
 * questions, then the questions behind them as hub rows. No cards; the restrained pages measured that day
 * list, they don't tile. Mocked and chosen by Matt from the Nov 4 preview.
 */
export default function GuidesPage() {
    return (
        <div className={rhythm.page} data-visual-anchor="offers-page">
            <section className={rhythm.opening} aria-labelledby="offers-title">
                <h1 id="offers-title" className={rhythm.title}>Got the offer? Here&rsquo;s what to ask for, and how.</h1>
                <div className={styles.rows}>
                    {GUIDES.map((guide) => (
                        <article key={guide.href} className={styles.row}>
                            <h2 className={styles.rowTitle}><Link href={guide.href} className={styles.rowLink}>{guide.title}</Link></h2>
                            <p className={styles.rowLine}>{guide.line}</p>
                            <span className={styles.read} aria-hidden="true">{guide.action} <ArrowRight weight="bold" /></span>
                        </article>
                    ))}
                </div>
            </section>
            <section className={`${rhythm.section} ${rhythm.close}`} aria-labelledby="offers-research-title">
                <h2 id="offers-research-title" className={rhythm.title}>The questions behind it.</h2>
                <div className={styles.related}>
                    {RELATED.map((href) => {
                        const entry = hubEntryForHref(href);
                        return entry ? <ResearchAnswerRow key={href} article={entry} size="list" heading="h3" /> : null;
                    })}
                </div>
                <div className={rhythm.link}><Link href="/research" className="riyp-link">All research <ArrowRight aria-hidden="true" /></Link></div>
            </section>
            <Footer />
        </div>
    );
}
