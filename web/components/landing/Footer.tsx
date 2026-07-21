import Link from "next/link";
import { PocketMark } from "@/components/icons";
import { FOOTER_NAV } from "@/lib/navigation";

export default function Footer() {
    return (
        <footer className="relative z-10 border-t border-background/20 bg-ink px-6 py-10 text-background/70 md:px-8">
            <div className="mx-auto flex max-w-[var(--page-max)] flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <div className="flex max-w-[27rem] flex-col gap-2">
                    <div className="flex items-center gap-2 font-display text-base font-semibold text-background">
                        <PocketMark className="size-4.5 text-citron" />
                        <span>© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <p className="text-sm leading-6 text-background/70">
                        See what recruiters are likely to notice before you apply. Start free, save your report if it helps, and add the job description when you want more specific feedback.
                    </p>
                    <p className="text-xs text-background/70">
                        Support:{" "}
                        <FooterLink href="mailto:support@recruiterinyourpocket.com">support@recruiterinyourpocket.com</FooterLink>
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:justify-end">
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
            className="focus-ring relative rounded-md px-2 py-1 text-background/70 transition-colors duration-150 hover:text-background after:absolute after:bottom-0 after:left-2 after:right-2 after:h-px after:origin-left after:scale-x-0 after:bg-cyan-bright after:transition-transform after:duration-150 hover:after:scale-x-100"
        >
            {children}
        </Link>
    );
}
