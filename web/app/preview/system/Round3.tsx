import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ResearchAnswerRow } from "@/components/research/ResearchHub";
import { hubEntryForHref } from "@/components/research/ResearchHubData";
import rhythm from "@/components/materials/Rhythm.module.css";
import styles from "./Round3.module.css";

const GUIDES = [
    { title: "How to negotiate a job offer", line: "The salary question, the offer call, your number, the counter, and the close.", href: "/resources/offer-negotiation", action: "Read" },
    { title: "How to read and negotiate a tech offer", line: "Base, bonus, equity and the vesting that decides what the number is worth.", href: "/resources/tech-offer-negotiation", action: "Read" },
    { title: "Which offer is actually better?", line: "Put salary, bonus, equity and one-time pay on the same footing and compare.", href: "/resources/tools/comp-calculator", action: "Compare" },
];

const RELATED = ["/research/referral-advantage", "/research/salary-history-bans", "/research/star-method"];

/** After the offer: the three things, as rows on hairlines, then the related questions as hub rows. No cards. */
export function OffersMock() {
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <h1 className={rhythm.title}>Got the offer? Here&rsquo;s what to ask for, and how.</h1>
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
            <section className={rhythm.section}>
                <h2 className={rhythm.title}>The questions behind it.</h2>
                <div className={styles.related}>
                    {RELATED.map((href) => { const entry = hubEntryForHref(href); return entry ? <ResearchAnswerRow key={href} article={entry} size="list" heading="h3" /> : null; })}
                </div>
                <div className={rhythm.link}><Link href="/research" className="riyp-link">All research <ArrowRight aria-hidden="true" /></Link></div>
            </section>
        </div>
    );
}

/** A guide's opening on the rhythm: the title, our take as a pen note, and the quick start as three rows instead of three cards. */
export function GuideOpeningMock() {
    return (
        <div className={rhythm.page}>
            <section className={rhythm.opening}>
                <p className={styles.eyebrow}>After the offer · a twelve-minute guide</p>
                <h1 className={rhythm.title}>Most offers have some room. Here&rsquo;s how to find it.</h1>
                <p className={rhythm.deck}>Our take, from the recruiter&rsquo;s side of the table: there&rsquo;s usually some room, and recruiters expect a good candidate to ask. Most people don&rsquo;t.</p>
                <ol className={styles.quick}>
                    <li><strong>Say less on the offer call.</strong> Thank them, ask your questions, and take a few days. You don&rsquo;t have to react to the number on the spot.</li>
                    <li><strong>Pick one number.</strong> A total you would sign at, grounded in the level and the range. Hold that total and stay flexible on the mix.</li>
                    <li><strong>Ask live, confirm in writing.</strong> Make the counter on a call, where tone carries. Then send a short email that sums up what you discussed.</li>
                </ol>
                <div className={rhythm.link}><Link href="/resources/tech-offer-negotiation" className="riyp-link">Offer includes equity? Read the tech guide <ArrowRight aria-hidden="true" /></Link></div>
            </section>
        </div>
    );
}
