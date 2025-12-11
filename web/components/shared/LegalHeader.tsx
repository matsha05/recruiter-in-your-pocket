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
            <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#020617] sticky top-0 z-50 border-b border-gray-100 dark:border-[#1F2937]">
                <Link
                    href="/"
                    className="font-display font-extrabold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                >
                    Recruiter in Your Pocket
                </Link>

                <div className="flex items-center gap-3">
                    {!user ? (
                        <button
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            onClick={() => setIsAuthOpen(true)}
                        >
                            Sign In
                        </button>
                    ) : (
                        <button
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
