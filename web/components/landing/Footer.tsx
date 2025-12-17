import Link from "next/link";
import { Lock, Trash2, ShieldOff } from "lucide-react";
import { PocketMark, Wordmark } from "@/components/icons";

export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-border/10 bg-background">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Trust Signals Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-border/10">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Lock className="w-4 h-4 text-brand" />
                        <span className="text-xs font-medium uppercase tracking-wide">End-to-End Encrypted</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium uppercase tracking-wide">Auto-Deleted in 24h</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <ShieldOff className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium uppercase tracking-wide">Your Data Never Trains AI</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <PocketMark className="w-5 h-5 text-brand" />
                        <Wordmark className="h-4 text-muted-foreground" />
                        <span className="text-sm">© 2025</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 -mx-3 -my-2 rounded-md">Terms</Link>
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 -mx-3 -my-2 rounded-md">Privacy</Link>
                        <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 -mx-3 -my-2 rounded-md">FAQ</Link>
                        <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 -mx-3 -my-2 rounded-md">Research</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
