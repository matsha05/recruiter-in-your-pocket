import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { PillarIcon } from "@/components/research/PillarIcon";
import { pillar as pillarById, pillarHref } from "@/components/research/ResearchHubData";
import { pageMetadata } from "@/lib/seo/metadata";
import { SECTION_NAMES } from "@/lib/seo/site";
import { articleStructuredData } from "@/lib/seo/structured-data";
import styles from "./PillarPage.module.css";

// A belief's own page (Nov 10, 2026): the belief as the headline, why we hold it in our own experience, what the
// evidence says with each source labeled by kind, the articles that sit under it, and one tailored way forward.
// The hub shows the belief only; everything that backs it lives here (hub and spoke).

export type PillarEvidence = {
    /** What the source found, kept inside what it found. */
    finding: ReactNode;
    /** What kind of source it is, in plain words: "Randomized experiment", "Vendor documentation", "Practitioner advice, not a study". */
    kind: string;
    /** Who, when, and how many, the way the hub's rows cite. */
    cite: string;
    /** The source itself, for the citation link and the structured data. */
    source: { title: string; publisher: string; href: string };
    /** The page's figure already draws this finding with its source, so it is cited in the structured data but not
     *  written out again (one observation, said once). */
    drawn?: boolean;
};

type PillarPageProps = {
    id: string;
    /** Why we believe it: our experience on the hiring side, in the recruiters' "we". */
    why: ReactNode;
    /** A figure drawn from an article's own numbers, when one makes the belief easier to see. */
    figure?: ReactNode;
    evidence: PillarEvidence[];
    /** The one way forward that fits this belief: the report for the parts of a resume it reads, a guide otherwise. */
    handoff: { heading: string; href: string; label: string };
};

/** Search title (the question people type) and description for a belief's page. */
export function pillarMetadata(id: string, title: string, description: string) {
    return pageMetadata({ path: pillarHref(pillarById(id)), title, description });
}

export function PillarPage({ id, why, figure, evidence, handoff }: PillarPageProps) {
    const pillar = pillarById(id);
    const path = pillarHref(pillar);
    const written = evidence.filter((item) => !item.drawn);

    return (
        <>
            <JsonLd
                data={articleStructuredData({
                    path,
                    headline: pillar.belief,
                    description: pillar.belief,
                    trail: [{ name: SECTION_NAMES["/research"], path: "/research" }, { name: pillar.navLabel, path }],
                    citations: evidence.map((item) => item.source),
                })}
            />
            <div className={styles.page} data-visual-anchor="research-pillar">
                <div className={styles.inner}>
                    <Link href="/research" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground">
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        What we look for
                    </Link>

                    <header className={styles.opening}>
                        <p className={styles.eyebrow}>
                            <PillarIcon id={pillar.id} className={styles.icon} />
                            {pillar.navLabel}
                        </p>
                        <h1 className={styles.belief}>{pillar.belief}</h1>
                    </header>

                    <section className={styles.why} aria-labelledby="why-title">
                        <h2 id="why-title" className={styles.label}>Why we believe it</h2>
                        <div className={styles.whyBody}>{why}</div>
                    </section>

                    <section className={styles.section} aria-labelledby="evidence-title">
                        <h2 id="evidence-title" className={styles.sectionTitle}>What the evidence says</h2>
                        {figure ? <div className={styles.figure}>{figure}</div> : null}
                        {written.length > 0 ? <ul className={styles.evidence}>
                            {written.map((item) => (
                                <li key={item.source.href}>
                                    <p className={styles.finding}>{item.finding}</p>
                                    <p className={styles.cite}>
                                        <span className={styles.kind}>{item.kind}</span>
                                        {" · "}
                                        <a href={item.source.href} target="_blank" rel="noopener noreferrer" className="focus-ring riyp-link-quiet">
                                            {item.cite}<span className="sr-only"> (opens in a new tab)</span>
                                        </a>
                                    </p>
                                </li>
                            ))}
                        </ul> : null}
                    </section>

                    <section className={styles.section} aria-labelledby="more-title">
                        <h2 id="more-title" className={styles.sectionTitle}>More on this</h2>
                        <ul className={styles.more}>
                            {pillar.articles.map((article) => (
                                <li key={article.id}>
                                    <Link href={article.href} className="riyp-link">{article.title ?? article.question}</Link>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className={styles.close} aria-labelledby="pillar-close-title">
                        <h2 id="pillar-close-title" className={styles.closeTitle}>{handoff.heading}</h2>
                        <Button asChild size="lg" className="flex-none">
                            <Link href={handoff.href} data-analytics-cta={`research_pillar_${pillar.id}`}>
                                {handoff.label} <ArrowRight weight="bold" aria-hidden="true" />
                            </Link>
                        </Button>
                    </section>

                    <p className={styles.method}>
                        Our experience is our judgment, and we label it that way. Every study above is linked, and each article says what its study can&rsquo;t tell you.
                        {" "}<Link href="/methodology#how-we-write-research" className="riyp-link-quiet focus-ring">How we write research</Link>
                    </p>
                </div>
                <Footer />
            </div>
        </>
    );
}

/** Example lines inside "Why we believe it": the line we usually get, then the one we want. Never from a real resume. */
export function ExampleLines({ weak, strong }: { weak: string; strong: string }) {
    return (
        <p className={styles.example}>
            <span className={styles.weak}><span className="sr-only">Usual line: </span>{weak}</span>
            <span className={styles.strong}><span className="sr-only">Stronger line: </span>{strong}</span>
            <span className={styles.exampleNote}>Example lines, not from a real resume.</span>
        </p>
    );
}
