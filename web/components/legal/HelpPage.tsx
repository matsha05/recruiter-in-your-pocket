// Rendered on the server: the answers reach the browser as HTML. Only the legal nav hydrates.
import Link from "next/link";
import Footer from "@/components/landing/Footer";
import { LegalNav } from "@/components/legal/LegalNav";
import rhythm from "@/components/materials/Rhythm.module.css";
import { ResearchLink } from "@/components/research/ResearchLink";
import { legalContent, type LegalInline, type LegalResearchNote } from "@/lib/legal/content";
import { cn } from "@/lib/utils";
import styles from "./HelpPage.module.css";

/** The answer as one plain string, for the FAQ structured data: the research sentence without its link. */
function answerText(a: string, more?: LegalResearchNote) {
    return more ? `${a} ${more.before}${more.claim}${more.after}` : a;
}

function renderInline(inline: LegalInline, index: number) {
    if (inline.type === "text") return <span key={`text-${index}`}>{inline.value}</span>;
    const mail = inline.href.startsWith("mailto:");
    return (
        <Link key={`link-${index}`} href={inline.href} className={cn("focus-ring riyp-link", mail && styles.mail)}>
            {inline.label}
        </Link>
    );
}

/**
 * Help (Nov 4, 2026): the questions people ask, every answer visible under a plain heading, and a person at
 * the end. The help indexes measured that day (HEY, Things, Linear, Basecamp, Raycast) use plain headings or
 * cards, never an accordion, and put contact at the bottom; none shows the address inline, so this page does.
 */
export function HelpPage() {
    const content = legalContent.help;
    const faq = content.sections.find((section) => section.type === "faq");
    const contact = content.sections.find((section) => section.type === "card");
    const schema = faq && faq.type === "faq"
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.categories.flatMap((category) =>
                category.questions.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: answerText(item.a, item.more) } }))
            ),
        }
        : null;

    return (
        <div className={rhythm.page} data-visual-anchor="legal-help">
            {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /> : null}
            <div className={styles.nav}><LegalNav /></div>
            <section className={cn(rhythm.opening, styles.opening)} aria-labelledby="legal-help-title">
                <h1 id="legal-help-title" className={rhythm.title}>{content.title}.</h1>
            </section>

            {faq && faq.type === "faq" ? faq.categories.map((category) => (
                <section key={category.category} className={rhythm.section} aria-labelledby={`help-${category.category.replace(/\W+/g, "-").toLowerCase()}`}>
                    <div className={styles.group}>
                        <h2 id={`help-${category.category.replace(/\W+/g, "-").toLowerCase()}`}>{category.category}</h2>
                        <div className={styles.qa}>
                            {category.questions.map((item) => (
                                <div key={item.q}>
                                    <h3>{item.q}</h3>
                                    <p>
                                        {item.a}
                                        {item.more ? <> {item.more.before}<ResearchLink to={item.more.research}>{item.more.claim}</ResearchLink>{item.more.after}</> : null}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )) : null}

            {contact && contact.type === "card" ? (
                <section className={cn(rhythm.section, rhythm.close)} aria-labelledby="help-contact-title">
                    <h2 id="help-contact-title" className={rhythm.sectionTitle}>Didn&rsquo;t find it? Write to a person.</h2>
                    <div className={styles.contact}>
                        {contact.paragraphs.map((paragraph, index) => <p key={index}>{paragraph.map(renderInline)}</p>)}
                    </div>
                </section>
            ) : null}
            <Footer />
        </div>
    );
}
