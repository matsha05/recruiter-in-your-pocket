import Link from "next/link";
import { Lock, Trash2, ShieldOff } from "lucide-react";

export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-border/10 bg-background">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Trust Signals Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-border/10">
                    <div className="flex items-center gap-3 text-muted-foreground/80">
                        <Lock className="w-4 h-4 text-emerald-600/70" />
                        <span className="text-xs font-medium uppercase tracking-wide">End-to-End Encrypted</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground/80">
                        <Trash2 className="w-4 h-4 text-rose-600/70" />
                        <span className="text-xs font-medium uppercase tracking-wide">Auto-Deleted in 24h</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground/80">
                        <ShieldOff className="w-4 h-4 text-amber-600/70" />
                        <span className="text-xs font-medium uppercase tracking-wide">Your Data Never Trains AI</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground font-sans">
                        Recruiter in Your Pocket © 2025
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Research</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
