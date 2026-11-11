import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Pile } from "@/components/materials/Pile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./CloseField.module.css";

const PILE = 244;
/**
 * The sheet that is yours: late in the pile, where a late application lands, and in from the edge at every
 * width so the light around it isn't cut off.
 */
const YOURS = 204;

/**
 * The close: the pile from the top of the page comes back, pale, and when the section is in view a light finds
 * one sheet, yours: it turns paper white, the sheets around it catch the light, and the rest fall back (Matt,
 * Nov 11, 2026: "showcasing that one square better like a spotlight"). No green sheets, no promise. The ask is
 * the one thing the product can do. It sits on the deep pen, a band that runs into the footer.
 */
export function CloseField() {
    return (
        <section className={cn("riyp-inverted", styles.band)} aria-labelledby="close-title" data-testid="landing-close">
            <div className={styles.inner}>
                <div className={styles.copy}>
                    <h2 id="close-title" className={styles.title}>Before you apply for the next one.</h2>
                    <Button asChild size="lg">
                        <Link href="/workspace" data-analytics-cta="closing_report">Get your free report <ArrowRight weight="bold" aria-hidden="true" /></Link>
                    </Button>
                </div>
                <Pile count={PILE} pale size="sm" spotlit={YOURS} label="244 sheets of paper, and a light on one of them: yours" className={styles.pile} />
            </div>
        </section>
    );
}
