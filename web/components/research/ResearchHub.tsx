import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { HubFindings } from "@/components/research/HubFindings";
import { ResearchIndex } from "@/components/research/ResearchIndex";
import { indexedAnswers } from "@/components/research/ResearchHubData";
import styles from "./ResearchHub.module.css";

export { ResearchAnswerRow } from "@/components/research/ResearchAnswerRow";

const COUNT_WORDS: Record<number, string> = { 14: "Fourteen", 15: "Fifteen", 16: "Sixteen", 17: "Seventeen", 18: "Eighteen", 19: "Nineteen", 20: "Twenty" };

/**
 * The research hub (rebuilt Nov 6, 2026, Matt: "people would go there looking for information mostly"): a
 * reference page. Three findings drawn from their articles' own numbers, then an index where every row is the
 * question, the short answer and what it rests on, with search and four plain topics.
 */
export default function ResearchHub() {
    const count = indexedAnswers.length;
    return (
        <div className={styles.page} data-visual-anchor="research-hub">
            <div className={styles.inner}>
                <header className={styles.opening}>
                    <h1 className={styles.title}>What the research says about getting hired.</h1>
                    <p className={styles.deck}>
                        {COUNT_WORDS[count] ?? count} questions job seekers ask, each answered from a named study or the platform&rsquo;s own documentation.
                        Open one for what it found, how it was done and what it can&rsquo;t tell you.
                    </p>
                </header>

                <ResearchIndex>
                    <HubFindings />
                </ResearchIndex>

                <p className={styles.after}>
                    Got the offer? The negotiation guides and the offer calculator are under <Link href="/resources" className="riyp-link">After the offer</Link>.
                </p>
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
