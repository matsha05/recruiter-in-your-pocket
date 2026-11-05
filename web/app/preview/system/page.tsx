import { notFound } from "next/navigation";
import rhythm from "@/components/materials/Rhythm.module.css";
import { Materials } from "./Materials";
import { GuideOpeningMock, OffersMock } from "./Round3";
import styles from "./Preview.module.css";

/**
 * Dev-only preview for the site system (Nov 4, 2026): the materials sheet, then page directions stacked
 * so one full-page shot shows them all. Deleted when the pages are built.
 */
export default function SystemPreviewPage() {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_INTERNAL_PAGES !== "true") notFound();
    return (
        <main className={rhythm.page}>
            <section className={rhythm.opening}>
                <h1 className={rhythm.title}>The materials.</h1>
                <p className={rhythm.deck}>Paper, the marker and the green pen, plus one red mark. Promoted from the homepage; every page below is made of these and nothing else.</p>
            </section>
            <Materials />

            <div className={styles.divider}><hr /></div>
            <p className={styles.label}>After the offer · rows on hairlines, no cards</p>
            <OffersMock />
            <div className={styles.divider}><hr /></div>
            <p className={styles.label}>A guide&rsquo;s opening · the quick start as rows, our take as the deck</p>
            <GuideOpeningMock />
            <div className={rhythm.close} />
        </main>
    );
}
