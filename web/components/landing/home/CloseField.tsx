import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Pile } from "@/components/materials/Pile";
import rhythm from "@/components/materials/Rhythm.module.css";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./CloseField.module.css";

const PILE = 244;
/** The sheet that is yours: near the end of the pile, where a late application lands. */
const YOURS = 229;

/**
 * The close: the pile from the top of the page comes back, pale, and one sheet takes an ink outline when the
 * section is in view, yours. No green, no promise. The ask is the one thing the product can do.
 */
export function CloseField() {
    return (
        <section className={cn(rhythm.section, rhythm.close)} aria-labelledby="close-title" data-testid="landing-close">
            <div className={styles.inner}>
                <div className={styles.copy}>
                    <h2 id="close-title" className={styles.title}>Before you apply for the next one.</h2>
                    <Button asChild size="lg">
                        <Link href="/workspace" data-analytics-cta="closing_report">Get your free report <ArrowRight weight="bold" aria-hidden="true" /></Link>
                    </Button>
                </div>
                <Pile count={PILE} pale size="sm" outlined={YOURS} label="244 sheets of paper, one of them outlined: yours" className={styles.pile} />
            </div>
        </section>
    );
}
