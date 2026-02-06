import Link from "next/link";
import { PocketMark, Wordmark } from "@/components/icons";

/**
 * Footer v3 — Premium "Quiet Authority" Footer
 * 
 * Research-informed design combining:
 * - Raycast: Clean simplicity, newsletter focus
 * - Cal.com: Trust indicators  
 * - Mercury: Sophisticated legal typography
 * - Your trust signals (encryption, transparent data handling, no data resale)
 * 
 * Key changes from v2:
 * - Removed dated pipe separators
 * - Added underline hover effect (consistent with header)
 * - Refined typography hierarchy
 * - Better visual grouping
 */
export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-border/10 bg-background">
            <div className="max-w-5xl mx-auto">

                {/* Single Clean Footer Row */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">

                    {/* Brand Column */}
                    <div className="flex flex-col items-center md:items-start gap-3">
                        <Link href="/" className="flex items-center gap-2 group">
                            <PocketMark className="w-5 h-5 text-brand group-hover:scale-105 transition-transform" />
                            <Wordmark className="h-4 text-foreground" />
                        </Link>
                        <p className="text-xs text-muted-foreground/60">
                            © 2026 Recruiter in Your Pocket
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    <div className="flex flex-wrap justify-center md:justify-end gap-12 md:gap-16">
                        {/* Product */}
                        <FooterColumn title="Product">
                            <FooterLink href="/workspace">Studio</FooterLink>
                            <FooterLink href="/pricing">Pricing</FooterLink>
                            <FooterLink href="/research">Research</FooterLink>
                            <FooterLink href="/guides">Resources</FooterLink>
                        </FooterColumn>

                        {/* Legal */}
                        <FooterColumn title="Legal">
                            <FooterLink href="/security">Data Handling</FooterLink>
                            <FooterLink href="/methodology">Methodology</FooterLink>
                            <FooterLink href="/privacy">Privacy</FooterLink>
                            <FooterLink href="/terms">Terms</FooterLink>
                            <FooterLink href="/trust">Trust</FooterLink>
                        </FooterColumn>

                        {/* Support */}
                        <FooterColumn title="Support">
                            <FooterLink href="/faq">FAQ</FooterLink>
                        </FooterColumn>
                    </div>
                </div>
            </div>
        </footer>
    );
}



/**
 * Footer Column — Section with title and links
 */
function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {title}
            </span>
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    );
}

/**
 * Footer Link — Text link with underline hover (matches header)
 */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="group relative text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
            <span>{children}</span>
            {/* Underline on hover — consistent with header */}
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-brand transition-all duration-200 group-hover:w-full" />
        </Link>
    );
}
