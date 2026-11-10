import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import rhythm from "@/components/materials/Rhythm.module.css";
import help from "@/components/legal/HelpPage.module.css";
import Footer from "@/components/landing/Footer";
import { LegalNav } from "@/components/legal/LegalNav";

type LegalShellProps = {
    pageKey?: string;
    eyebrow?: string;
    title: string;
    description?: string;
    lastUpdated?: string;
    children: ReactNode;
    contentClassName?: string;
};

/** Shared reading layout for factual trust and legal surfaces. On the site's one column since Nov 10, 2026: the
 *  page starts where every page starts, and the text sits on the ground instead of inside a centered card. */
export function LegalShell({
    pageKey,
    eyebrow,
    title,
    description,
    lastUpdated,
    children,
    contentClassName,
}: LegalShellProps) {
    return (
        <>
            <div data-visual-anchor={pageKey ? `legal-${pageKey}` : undefined} className={cn(rhythm.page, "selection:bg-brand/15")}>
                <div className={help.nav}><LegalNav /></div>
                <section className={cn(rhythm.opening, help.opening)}>
                    {eyebrow ? <p className="mb-4 text-label text-muted-foreground">{eyebrow}</p> : null}
                    <h1 id={pageKey ? `legal-${pageKey}-title` : undefined} className={rhythm.title}>{title}</h1>
                    {description ? <p className="max-w-reading text-pretty text-prose text-muted-foreground">{description}</p> : null}
                    {lastUpdated ? <p className="mt-4 text-label font-medium text-muted-foreground">Last updated {lastUpdated}</p> : null}
                </section>
                <section className={cn(rhythm.section, "pb-20")}>
                    <div className={cn("max-w-form space-y-4 [overflow-wrap:anywhere]", contentClassName)}>
                        {children}
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
