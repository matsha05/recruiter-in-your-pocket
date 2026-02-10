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
        <footer className="relative z-[2] border-t border-slate-200/50 bg-[#FAFAF8] px-6 py-8 md:px-8">
            <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[13px] text-slate-400">
                        <PocketMark className="h-4 w-4 text-slate-300" />
                        <span>© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <span className="text-[12px] text-slate-300 md:pl-6">
                        What recruiters think, before you hit send.
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px] text-slate-400">
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
            className="transition-colors hover:text-slate-600"
        >
            {children}
        </Link>
    );
}
