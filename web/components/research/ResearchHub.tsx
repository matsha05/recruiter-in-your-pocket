import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { categories, featuredArticles, type ResearchArticle } from "@/components/research/ResearchHubData";
import styles from "./ResearchHub.module.css";

function Answer({ article, size }: { article: ResearchArticle; size: "lead" | "list" }) {
    const Heading = size === "lead" ? "h2" : "h4";
    return (
        <article className={size === "lead" ? styles.lead : styles.row}>
            <Heading className={styles.question}>{article.question}</Heading>
            <p className={styles.answer}>{article.answer}</p>
            <Link href={article.href} className={styles.read}>
                {article.action ?? "Read"}<span className="sr-only">: {article.title}</span> <ArrowRight weight="bold" aria-hidden="true" />
            </Link>
        </article>
    );
}

/**
 * The questions people ask about getting hired, each answered in one line from
 * the research it links to. The most-asked lead; every other article follows by topic.
 */
export default function ResearchHub() {
    return (
        <div className={styles.page} data-visual-anchor="research-hub">
            <div className={styles.inner}>
                <h1 className={styles.title}>The questions you&rsquo;re asking at 1&nbsp;a.m.</h1>
                <p className={styles.deck}>Straight answers, and where each one comes from.</p>

                <section className={styles.leads} aria-label="The questions people ask most">
                    {featuredArticles.map((article) => <Answer key={article.id} article={article} size="lead" />)}
                </section>

                <section className={styles.library} aria-labelledby="research-library-title">
                    <h2 id="research-library-title" className={styles.libraryTitle}>Everything else we&rsquo;ve looked into.</h2>
                    {categories.map((category) => {
                        const rest = category.articles.filter((article) => !article.featured);
                        if (rest.length === 0) return null;
                        return (
                            <section key={category.id} className={styles.group} aria-labelledby={`research-${category.id}`}>
                                <h3 id={`research-${category.id}`} className={styles.groupTitle}>{category.title}</h3>
                                <div>{rest.map((article) => <Answer key={article.id} article={article} size="list" />)}</div>
                            </section>
                        );
                    })}
                </section>

                <section className={styles.close} aria-labelledby="research-close-title">
                    <h2 id="research-close-title" className={styles.closeTitle}>What would they think of yours?</h2>
                    <Button asChild size="lg" className="flex-none">
                        <Link href="/workspace" data-analytics-cta="research_report">
                            Read mine <ArrowRight weight="bold" aria-hidden="true" />
                        </Link>
                    </Button>
                </section>
            </div>
            <Footer />
        </div>
    );
}
