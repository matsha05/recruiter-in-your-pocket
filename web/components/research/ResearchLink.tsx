import type { ReactNode } from "react";
import Link from "next/link";
import { hubEntry } from "@/components/research/ResearchHubData";

// An in-sentence link from one research article to the sibling that holds the claim it leans on.
// The link text is the claim ("recruiters who spent longer on Experience were more likely to move
// a resume forward"), not the sibling's title, and it sits where a reader would want the evidence.
// The href is resolved through the hub, so a renamed or retired article fails the build the way a
// bad "Next questions" id does. Keep an article's body to four of these at most
// (docs/growth/2026-11-aeo-and-internal-linking.md, phase 1).

export function ResearchLink({ to, children }: { to: string; children: ReactNode }) {
    const entry = hubEntry(to);
    if (!entry) throw new Error(`A research link points at "${to}", but the hub has no such answer (ResearchHubData.ts).`);
    return (
        <Link href={entry.href} className="focus-ring riyp-link">
            {children}
        </Link>
    );
}

/** The path of a hub answer, for links built outside JSX (compare pages, Help). Fails the build on a bad id. */
export function researchHref(id: string) {
    const entry = hubEntry(id);
    if (!entry) throw new Error(`researchHref("${id}"): the hub has no such answer (ResearchHubData.ts).`);
    return entry.href;
}
