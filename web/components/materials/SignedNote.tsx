import type { ReactNode } from "react";
import { Wordmark } from "@/components/icons/Wordmark";
import { cn } from "@/lib/utils";
import styles from "./SignedNote.module.css";

/**
 * The signed note (Nov 4, 2026): the recruiter speaking in the first person, in the pen, signed with the
 * wordmark rather than a name. It appears on the homepage beside the founder's drawing and once more on How
 * the report works, where the disclosure lives. Nowhere else, so the signature stays rare (Matt, Nov 4, 2026).
 */
export function SignedNote({ children, id, size = "lg", className }: { children: ReactNode; id?: string; size?: "lg" | "md"; className?: string }) {
    return (
        <div className={className}>
            <p id={id} className={cn(styles.note, size === "md" && styles.short)}>{children}</p>
            <p className={styles.signature} aria-label="Signed, Recruiter in Your Pocket">
                <span className={styles.dash} aria-hidden="true" />
                <Wordmark className={styles.mark} />
            </p>
        </div>
    );
}
