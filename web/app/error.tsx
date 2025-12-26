"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PocketMark, Wordmark } from "@/components/icons";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application error:", error);
    }, [error]);

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
                    {/* Error Icon */}
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-rose/10 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-rose" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Message */}
                    <h1 className="font-display text-3xl font-medium text-foreground mb-4">
                        Something went wrong
                    </h1>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                        We hit an unexpected error. This has been logged and we&apos;re looking into it.
                        Try refreshing, or head back home.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-brand-foreground font-medium rounded-md hover:bg-brand/90 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border/60 bg-background text-foreground font-medium rounded-md hover:bg-accent transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>

                    {/* Error digest for debugging */}
                    {error.digest && (
                        <p className="mt-8 text-xs text-muted-foreground/50 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
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
