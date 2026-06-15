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
        <div className="relative mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 md:py-10 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_248px] md:gap-14">
                {/* Main Content */}
                <main className="min-w-0 space-y-10 md:space-y-12">
                    {children}
                </main>

                {/* Desktop Sticky TOC */}
                <aside className="relative hidden md:block">
                    <div className="sticky top-10 space-y-4 pl-2">
                        {toc}
                    </div>
                </aside>
            </div>
        </div>
    )
}
