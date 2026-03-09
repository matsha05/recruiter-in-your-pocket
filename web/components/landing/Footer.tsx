import Link from "next/link";
import { PocketMark } from "@/components/icons";

/**
 * Footer — Editor's Desk style
 *
 * Minimal, warm, with personality tagline.
 * Clean single-row layout, no heavy multi-column grids.
 */
export default function Footer() {
    return (
        <footer className="relative z-10 border-t border-border/50 bg-paper px-6 py-8 md:px-8">
            <div className="mx-auto flex max-w-[var(--page-max)] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <PocketMark className="h-4 w-4 text-brand/65" />
                        <span>© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <span className="max-w-[22rem] text-xs leading-5 text-slate-400 md:pl-6">
                        What recruiters think, before you hit send.
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400 md:justify-end">
                    <FooterLink href="/pricing">Pricing</FooterLink>
                    <FooterLink href="/research">Research</FooterLink>
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
