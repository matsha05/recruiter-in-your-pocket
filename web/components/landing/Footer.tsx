import Link from "next/link";
import { PocketMark } from "@/components/icons";
import { FOOTER_NAV } from "@/lib/navigation";

/**
 * Footer — Editor's Desk style
 *
 * Minimal, warm, with personality tagline.
 * Clean single-row layout, no heavy multi-column grids.
 */
export default function Footer() {
    return (
        <footer className="relative z-10 border-t border-border/50 bg-paper px-6 py-8 md:px-8">
            <div className="mx-auto flex max-w-[var(--page-max)] flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <div className="flex max-w-[27rem] flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <PocketMark className="h-4.5 w-4.5 text-brand/70" />
                        <span>© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-500">
                        What recruiters think, before you hit send. Start free, save deliberately, and carry job context back into the studio when it matters.
                    </p>
                    <p className="text-xs text-slate-400">
                        Support and security:{" "}
                        <FooterLink href="mailto:support@recruiterinyourpocket.com">support@recruiterinyourpocket.com</FooterLink>
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400 md:justify-end">
                    {FOOTER_NAV.pillLinks.map((link) => (
                        <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
                    ))}
                    <FooterLink href="/trust">Trust</FooterLink>
                    <FooterLink href="/privacy">Privacy</FooterLink>
                    <FooterLink href="/methodology">Methodology</FooterLink>
                    <FooterLink href="/faq">FAQ</FooterLink>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="relative rounded-md px-2 py-1 text-slate-400 transition-colors hover:text-slate-600 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-px after:origin-left after:scale-x-0 after:bg-slate-400/50 after:transition-transform after:duration-200 hover:after:scale-x-100"
        >
            {children}
        </Link>
    );
}
