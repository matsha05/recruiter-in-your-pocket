import { notFound } from "next/navigation";
import rhythm from "@/components/materials/Rhythm.module.css";
import { Materials } from "./Materials";
import { AuthMockA, AuthMockB, HelpMock, MethodologyMock, ResearchMock } from "./Round2";
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
            <p className={styles.label}>Methodology · cut to the density rule · seven sections and a signed note</p>
            <MethodologyMock />
            <div className={styles.divider}><hr /></div>
            <p className={styles.label}>Research · an article&rsquo;s opening on the system, and the bridge two ways</p>
            <ResearchMock />
            <div className={styles.divider}><hr /></div>
            <p className={styles.label}>Help · plain questions, no accordion, a person at the end</p>
            <HelpMock />
            <div className={styles.divider}><hr /></div>
            <p className={styles.label}>Sign-in · A · under the site header, no card</p>
            <AuthMockA />
            <div className={styles.divider}><hr /></div>
            <p className={styles.label}>Sign-in · B · bare, wordmark only</p>
            <AuthMockB />
            <div className={rhythm.close} />
        </main>
    );
}
