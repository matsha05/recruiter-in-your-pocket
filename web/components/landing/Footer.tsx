import Link from "next/link";
import { Lock, Trash2, ShieldOff } from "lucide-react";
import { PocketMark, Wordmark } from "@/components/icons";

/**
 * Footer v2 - Cleaner, premium layout
 * 
 * - Trust signals row
 * - Grouped navigation: Resources | Legal | FAQ
 */
export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-border/10 bg-background">
            <div className="max-w-5xl mx-auto space-y-10">

                {/* Trust Signals Row */}
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs font-medium uppercase tracking-wide">
                    <div className="flex items-center gap-2 text-foreground/70">
                        <Lock className="w-3.5 h-3.5 text-brand" />
                        <span>End-to-End Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground/70">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Auto-Deleted in 24h</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground/70">
                        <ShieldOff className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Never Trains AI</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border/10" />

                {/* Bottom Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                        <PocketMark className="w-5 h-5 text-brand group-hover:scale-105 transition-transform" />
                        <Wordmark className="h-4" />
                        <span className="text-sm ml-2">© 2026</span>
                    </Link>

                    {/* Navigation - Grouped */}
                    <nav className="flex items-center gap-1 text-sm">
                        <Link
                            href="/research"
                            className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
                        >
                            Research
                        </Link>
                        <Link
                            href="/guides"
                            className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
                        >
                            Resources
                        </Link>

                        <span className="text-border mx-1">|</span>

                        <Link
                            href="/faq"
                            className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/terms"
                            className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
                        >
                            Privacy
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
