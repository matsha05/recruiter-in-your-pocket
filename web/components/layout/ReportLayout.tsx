import * as React from "react"
import { cn } from "@/lib/utils"

interface ReportLayoutProps {
    children: React.ReactNode
    toc?: React.ReactNode
}

/**
 * ReportLayout
 * Implements the "Sticky Nav" pattern from V2.1 Blueprint.
 * - Desktop: Sticky sidebar (TOC) on the right (or left inner).
 * - Mobile: Children render normally, TOC via bottom sheet (to be implemented).
 */
export function ReportLayout({ children, toc }: ReportLayoutProps) {
    return (
        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8 md:gap-12">
                {/* Main Content */}
                <main className="min-w-0 space-y-12">
                    {children}
                </main>

                {/* Desktop Sticky TOC */}
                <aside className="hidden md:block relative">
                    <div className="sticky top-8 space-y-4">
                        {toc}
                    </div>
                </aside>
            </div>
        </div>
    )
}
