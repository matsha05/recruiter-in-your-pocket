"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../providers/AuthProvider";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function LegalHeader() {
    const { user, signOut, refreshUser } = useAuth();
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (
        <>
            <header className="flex items-center justify-between px-6 py-4 bg-surface sticky top-0 z-50 border-b border-subtle">
                <Link
                    href="/"
                    className="font-serif italic font-semibold tracking-tight text-xl text-foreground hover:opacity-80 transition-opacity"
                >
                    Recruiter in Your Pocket
                </Link>

                <div className="flex items-center gap-3">
                    {!user ? (
                        <button
                            className="text-sm font-medium text-secondary hover:text-primary transition-colors"
                            onClick={() => setIsAuthOpen(true)}
                        >
                            Sign In
                        </button>
                    ) : (
                        <button
                            className="text-sm font-medium text-secondary hover:text-primary transition-colors"
                            onClick={signOut}
                        >
                            Sign Out
                        </button>
                    )}
                    <ThemeToggle />
                </div>
            </header>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onSuccess={async () => {
                    await refreshUser();
                    setIsAuthOpen(false);
                }}
            />
        </>
    );
}
