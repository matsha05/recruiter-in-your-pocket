"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { ResearchAnswerRow } from "@/components/research/ResearchAnswerRow";
import { indexedCategories, type ResearchArticle } from "@/components/research/ResearchHubData";
import styles from "./ResearchIndex.module.css";

/** "typos" finds "typo", "referrals" finds "referral": each typed word matches the start of a word in the row. */
function tokens(text: string) {
    return text.toLowerCase().split(/[^a-z0-9%]+/).filter(Boolean);
}

function matches(article: ResearchArticle, words: string[]) {
    const haystack = tokens([article.question, article.answer, article.evidence?.kind, article.evidence?.cite, ...(article.keywords ?? [])].join(" "));
    return words.every((word) => haystack.some((token) => token.startsWith(word) || word.startsWith(token) && token.length >= 4));
}

/**
 * The hub's index (Nov 6, 2026): the search and the topic jumps first, so the tool for looking a question up is
 * under the deck at every width; then the page's findings; then four plain groups of rows, each the question, the
 * short answer and what it rests on. Typing narrows the rows and hides the findings until the box is cleared.
 */
export function ResearchIndex({ children }: { children?: ReactNode }) {
    const [query, setQuery] = useState("");
    const searchId = useId();
    const words = useMemo(() => tokens(query), [query]);
    const filtering = words.length > 0;
    const groups = useMemo(
        () => indexedCategories.map((category) => ({ ...category, shown: category.articles.filter((article) => matches(article, words)) })),
        [words],
    );
    const total = indexedCategories.reduce((sum, category) => sum + category.articles.length, 0);
    const shown = groups.reduce((sum, category) => sum + category.shown.length, 0);
    const count = (n: number) => (n === 1 ? "1 question" : `${n} questions`);

    return (
        <section className={styles.index} aria-labelledby="research-index-title">
            <h2 id="research-index-title" className="sr-only">Every question</h2>
            <div className={styles.tools}>
                <div className={styles.search}>
                    <label htmlFor={searchId} className="sr-only">Find a question</label>
                    <MagnifyingGlass className={styles.searchIcon} weight="bold" aria-hidden="true" />
                    <Input
                        id={searchId}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }}
                        placeholder="Try typo, gap or LinkedIn"
                        autoComplete="off"
                        className={styles.input}
                    />
                </div>
                <nav className={styles.jumps} aria-label="Topics">
                    {groups.map((category) => (
                        <a key={category.id} href={`#${category.id}`} className={styles.jump} hidden={category.shown.length === 0}>
                            {category.title} <span className={styles.count}><span className="sr-only">, </span>{category.shown.length}<span className="sr-only">{category.shown.length === 1 ? " question" : " questions"}</span></span>
                        </a>
                    ))}
                </nav>
            </div>
            <p className="sr-only" role="status" aria-live="polite">
                {filtering ? (shown === 1 ? "1 question matches." : `${shown} questions match.`) : ""}
            </p>

            {filtering ? null : children}

            <div className={styles.heads} aria-hidden="true">
                <span>The question</span>
                <span>The short answer, and what it rests on</span>
            </div>

            {groups.map((category) => category.shown.length === 0 ? null : (
                <section key={category.id} id={category.id} className={styles.group} aria-labelledby={`${category.id}-title`}>
                    <h3 id={`${category.id}-title`} className={styles.groupTitle}>
                        {category.title} <span className={styles.groupCount}>{count(category.shown.length)}</span>
                    </h3>
                    <div>
                        {category.shown.map((article) => <ResearchAnswerRow key={article.id} article={article} heading="h4" />)}
                    </div>
                </section>
            ))}

            {filtering && shown === 0 ? (
                <p className={styles.empty}>
                    None of the {total} questions match &ldquo;{query.trim()}&rdquo;. Try a word like typo, referral or LinkedIn.
                </p>
            ) : null}
        </section>
    );
}
