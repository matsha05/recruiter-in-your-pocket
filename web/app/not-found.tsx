import Link from "next/link";
import { PocketMark, Wordmark } from "@/components/icons";
import { Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Simple Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-border/10">
                <Link href="/" className="flex items-center gap-2">
                    <PocketMark className="w-6 h-6 text-brand" />
                    <Wordmark className="h-5 text-foreground" />
                </Link>
            </header>

            {/* Error Content */}
            <main className="flex-1 flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    {/* 404 Display */}
                    <div className="mb-8">
                        <span className="text-8xl font-display font-medium text-brand/20">404</span>
                    </div>

                    {/* Message */}
                    <h1 className="font-display text-3xl font-medium text-foreground mb-4">
                        Page not found
                    </h1>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                        Let's get you back on track.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-brand-foreground font-medium rounded-md hover:bg-brand/90 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Link>
                        <Link
                            href="/research"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border bg-background text-foreground font-medium rounded-md hover:bg-accent transition-colors"
                        >
                            <Search className="w-4 h-4" />
                            Browse Research
                        </Link>
                    </div>
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/10">
                <Link href="/" className="hover:text-foreground transition-colors">
                    recruiterinyourpocket.com
                </Link>
            </footer>
        </div>
    );
}
