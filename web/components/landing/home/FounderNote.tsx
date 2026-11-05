import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import rhythm from "@/components/materials/Rhythm.module.css";
import { SignedNote } from "@/components/materials/SignedNote";
import styles from "./FounderNote.module.css";

/**
 * Who wrote the criteria (Matt, Nov 4, 2026): the founder as the recruiter. A note in the recruiter's green
 * hand beside a drawing of him, signed with the wordmark rather than a name. No name, no photograph, no
 * company names, no profile link. The disclosure that AI applies the criteria lives on How the report works,
 * the link under the note, and in the legal content; the note itself ends on its strongest line.
 *
 * The drawing (Nov 5, 2026) is the founder mark: a line drawing of a type, cap and round glasses and a smile,
 * with the cap in the pen's green. It replaced the green scribble likeness, which smudged at this size and
 * read as a face rather than a recruiter.
 */
export const FOUNDER_NOTE =
    "I’ve passed on more people than I can count. A few seconds a resume, fifteen years, at companies you’ve heard of and small ones around the world. The reasons were almost always the same, and nobody told you. I wrote them down.";

export function FounderNote() {
    return (
        <section id="about" className={`${rhythm.section} ${styles.beat}`} aria-labelledby="founder-note">
            <Image
                className={styles.portrait}
                src="/founder-mark.webp"
                width={1254}
                height={1254}
                sizes="(max-width: 720px) 8rem, 12rem"
                alt="A line drawing of the recruiter who wrote the review criteria: a cap, round glasses, and a smile."
            />
            <SignedNote id="founder-note" className={styles.note}>{FOUNDER_NOTE}</SignedNote>
            <div className={`${rhythm.link} ${styles.link}`}>
                <Link href="/methodology" className="riyp-link">How the report works <ArrowRight aria-hidden="true" /></Link>
            </div>
        </section>
    );
}
