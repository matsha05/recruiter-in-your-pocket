"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "../shared/ThemeToggle";

interface User {
    email?: string;
    firstName?: string;
}

interface WorkspaceHeaderProps {
    user?: User | null;
    onNewReport?: () => void;
    onSampleReport?: () => void;
    onSignIn?: () => void;
    onSignOut?: () => void;
    onHistory?: () => void;
}

export default function WorkspaceHeader({
    user,
    onNewReport,
    onSampleReport,
    onSignIn,
    onSignOut,
    onHistory
}: WorkspaceHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const userInitial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?";

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="font-display font-bold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Recruiter in Your Pocket
            </Link>

            <div className="flex items-center gap-3">
                <button className="btn-ghost" onClick={onSampleReport}>
                    📄 Sample Report
                </button>

                <button
                    onClick={onNewReport}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white 
                        font-semibold rounded-lg shadow-button hover:bg-emerald-600 
                        transition-all duration-200"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    New Report
                </button>

                {!user ? (
                    <button className="btn-ghost font-semibold" onClick={onSignIn}>
                        Sign In
                    </button>
                ) : (
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg 
                                hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="w-8 h-8 flex items-center justify-center 
                                bg-indigo-500 text-white rounded-full font-semibold text-sm">
                                {userInitial}
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white max-w-[120px] truncate">
                                {user.firstName || user.email}
                            </span>
                            <span className="text-gray-400 text-xs">▾</span>
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-56 
                                    bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-xl shadow-modal z-50 py-2">

                                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.email}
                                    </div>
                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                                    <button
                                        onClick={() => { onHistory?.(); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                                            text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 7C3 4.239 4.239 3 7 3H17C19.761 3 21 4.239 21 7V17C21 19.761 19.761 21 17 21H7C4.239 21 3 19.761 3 17V7Z" stroke="currentColor" strokeWidth="1.5" />
                                            <path d="M7 8H17M7 12H17M7 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        My Reports
                                    </button>

                                    <button
                                        onClick={() => { onNewReport?.(); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                                            text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        New Report
                                    </button>

                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                                    <Link
                                        href="/"
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                                            text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <path d="M11 6L5 12M5 12L11 18M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Home
                                    </Link>

                                    <Link
                                        href="/settings"
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                                            text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5" />
                                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        Settings
                                    </Link>

                                    <button
                                        onClick={() => { onSignOut?.(); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                                            text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <ThemeToggle />
            </div>
        </header>
    );
}
