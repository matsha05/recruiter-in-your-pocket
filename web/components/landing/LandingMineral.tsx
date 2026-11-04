import Footer from "@/components/landing/Footer";
import { CloseField } from "./home/CloseField";
import { FounderNote } from "./home/FounderNote";
import { HiringTruths } from "./home/HiringTruths";
import { NoteSection } from "./home/NoteSection";
import { PileHero } from "./home/PileHero";
import { ReadBeat } from "./home/ReadBeat";
import { RecheckSection } from "./home/RecheckSection";
import { MobileReportCTA } from "./mineral/MobileReportCTA";
import styles from "./home/HomePage.module.css";

/**
 * The homepage (Matt, Nov 4, 2026). Seven beats, one column, one material system: the pile; the read; the
 * note Jordan never saw as a clipping; what we look for; the re-check as two clippings; the founder's note
 * beside his drawing; and the pile again at the close with one sheet outlined. The research, the sources and
 * the record of what was tried are in docs/design/2026-11-homepage-research.md.
 */
export function LandingMineral() {
    return (
        <div className={styles.page} data-visual-anchor="landing-home">
            <PileHero />
            <ReadBeat />
            <NoteSection />
            <HiringTruths />
            <RecheckSection />
            <FounderNote />
            <CloseField />
            <Footer />
            <MobileReportCTA />
        </div>
    );
}
