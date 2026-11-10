import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { PillarIcon } from "@/components/research/PillarIcon";
import { additionalResearch, pillarHref, pillars } from "@/components/research/ResearchHubData";
import styles from "./ResearchHub.module.css";

export { ResearchAnswerRow } from "@/components/research/ResearchAnswerRow";

/**
 * The research hub (rebuilt Nov 10, 2026, Matt: "nobody is going to look at 17 questions"): what we believe as
 * recruiters, six beliefs, each a card with its name, one icon and the belief in Matt's words. The evidence, the
 * articles and the way into the product live on each belief's own page. Research that backs no belief follows as
 * a short list.
 */
export default function ResearchHub() {
    return (
        <div className={styles.page} data-visual-anchor="research-hub">
            <div className={styles.inner}>
                <header className={styles.opening}>
                    <h1 className={styles.title}>What we look for.</h1>
                    <p className={styles.deck}>
                        We&rsquo;ve spent years on the hiring side. Here&rsquo;s what we believe, and the research behind it.
                    </p>
                </header>

                <ul className={styles.pillars} aria-label="What we believe">
                    {pillars.map((pillar) => (
                        <li key={pillar.id}>
                            <Link href={pillarHref(pillar)} className={`focus-ring ${styles.pillar}`} data-testid="research-pillar">
                                <PillarIcon id={pillar.id} className={styles.icon} />
                                <span className={styles.name}>
                                    {pillar.navLabel}
                                    <ArrowRight className={styles.arrow} aria-hidden="true" />
                                </span>
                                <span className={styles.belief}>{pillar.belief}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <section className={styles.more} aria-labelledby="additional-research-title">
                    <h2 id="additional-research-title" className={styles.moreTitle}>Additional research</h2>
                    <ul className={styles.moreList}>
                        {additionalResearch.map((article) => (
                            <li key={article.id}>
                                <Link href={article.href} className="riyp-link">{article.question}</Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <p className={styles.method}>
                    Every answer stays inside what its source found, and every page says what its study can&rsquo;t tell you.
                    {" "}<Link href="/methodology#how-we-write-research" className="riyp-link-quiet focus-ring">How we write research</Link>
                    {" "}and <Link href="/methodology" className="riyp-link-quiet focus-ring">how the report works</Link>.
                </p>

                <section className={styles.close} aria-labelledby="research-close-title">
                    <h2 id="research-close-title" className={styles.closeTitle}>Want this kind of read on your own resume?</h2>
                    <Button asChild size="lg" className="flex-none">
                        <Link href="/workspace" data-analytics-cta="research_report">
                            Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                        </Link>
                    </Button>
                </section>
            </div>
            <Footer />
        </div>
    );
}
