import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Pile } from "@/components/materials/Pile";
import { Button } from "@/components/ui/button";
import styles from "./PileHero.module.css";

/**
 * The homepage's first screen (Matt, Nov 4, 2026): the pile. One sheet of paper for every application to one
 * role, 244 of them, and the eighteen that got past the first screen turn green. The number arrives as three
 * ticking digit flaps in step with the sheets. Everything moves on CSS from first paint, so there is no
 * hydration flash and reduced motion shows the finished pile.
 *
 * The figures are Greenhouse's, The Hire Standard, North America benchmark report, March 2026, page 7:
 * 244 applications per job in 2025 and a 7.6% stage-one progression rate. 18 of 244 is 7.4%, the nearest
 * whole number. The arithmetic and the sources are in docs/design/2026-11-homepage-research.md.
 */
const PILE = 244;
const REPLIED = [3, 17, 29, 41, 58, 66, 83, 97, 104, 121, 139, 150, 168, 177, 193, 206, 222, 238];

/* 244 as three flaps: each strip is the digits 0 to 9 repeated, and a flap ticks down `ticks` places. */
const STRIP = "0123456789012345678901234".split("");
const FLAPS = [
    { place: "hundreds", ticks: 2, ms: 500 },
    { place: "tens", ticks: 14, ms: 1000 },
    { place: "ones", ticks: 24, ms: 1500 },
];

export function PileHero() {
    return (
        <section className={styles.hero} aria-labelledby="hero-title" data-testid="landing-pile-hero">
            <div className={styles.inner}>
                <div className={styles.copy}>
                    <h1 id="hero-title" className={styles.title}>
                        <span className="sr-only">244</span>
                        <span className={styles.flaps} aria-hidden="true">
                            {FLAPS.map((flap) => (
                                <span key={flap.place} className={styles.flap} style={{ "--k": flap.ticks, "--dur": `${flap.ms}ms` } as React.CSSProperties}>
                                    <span className={styles.strip}>{STRIP.map((digit, index) => <span key={index}>{digit}</span>)}</span>
                                </span>
                            ))}
                        </span>
                        {" "}people<br />applied for the<br />job you wanted.
                    </h1>
                    <p className={styles.answer}>Eighteen got called back. The other 226 have no idea why the recruiter passed.</p>
                    <div className={styles.actions}>
                        <Button asChild size="lg">
                            <Link href="/workspace" data-testid="landing-primary-cta" data-analytics-cta="hero_report">
                                Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                            </Link>
                        </Button>
                        <Button asChild variant="quiet">
                            <Link href="/sample-report" data-analytics-cta="hero_sample">See Jordan&rsquo;s report</Link>
                        </Button>
                    </div>
                </div>
                <Pile
                    count={PILE}
                    marked={REPLIED}
                    motion="arrive"
                    replyAt="2.4s"
                    label="244 small sheets of paper, eighteen of them green"
                    testId="landing-pile"
                    className={styles.field}
                />
                <p className={styles.source}>Greenhouse, The Hire Standard, March 2026: 244 applications per role in 2025, 7.6% past the first screen.</p>
            </div>
        </section>
    );
}
