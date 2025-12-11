"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

        setIsDark(shouldBeDark);
        if (shouldBeDark) {
            document.documentElement.setAttribute("data-theme", "dark");
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);

        if (newIsDark) {
            document.documentElement.setAttribute("data-theme", "dark");
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <button
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                type="button"
                aria-label="Toggle dark mode"
                title="Toggle dark mode"
            >
                <span className="text-xl">🌙</span>
            </button>
        );
    }

    return (
        <button
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            type="button"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
            onClick={toggleTheme}
        >
            <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
        </button>
    );
}
