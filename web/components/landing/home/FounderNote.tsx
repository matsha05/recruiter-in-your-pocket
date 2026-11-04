import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/icons/Wordmark";
import home from "./HomePage.module.css";
import styles from "./FounderNote.module.css";

/**
 * Who wrote the criteria (Matt, Nov 4, 2026): the founder as the recruiter. A note in the recruiter's green
 * hand beside a pen drawing of him, signed with the wordmark rather than a name. No name, no photograph, no
 * company names, no profile link. The disclosure that AI applies the criteria lives on How the report works,
 * the link under the note, and in the legal content; the note itself ends on its strongest line.
 */
export const FOUNDER_NOTE =
    "I’ve passed on more people than I can count. A few seconds a resume, fifteen years, at companies you’ve heard of and small ones around the world. The reasons were almost always the same, and nobody told you. I wrote them down.";

export function FounderNote() {
    return (
        <section id="about" className={`${home.section} ${styles.beat}`} aria-labelledby="founder-note">
            <Image
                className={styles.portrait}
                src="/founder-portrait.webp"
                width={1033}
                height={997}
                sizes="(max-width: 720px) 8rem, 12rem"
                alt="A pen drawing of the recruiter who wrote the review criteria, smiling."
            />
            <p id="founder-note" className={styles.note}>{FOUNDER_NOTE}</p>
            <p className={styles.signature} aria-label="Signed, Recruiter in Your Pocket">
                <span className={styles.dash} aria-hidden="true" />
                <Wordmark className={styles.mark} />
            </p>
            <div className={`${home.link} ${styles.link}`}>
                <Link href="/methodology" className="riyp-link">How the report works <ArrowRight aria-hidden="true" /></Link>
            </div>
        </section>
    );
}
