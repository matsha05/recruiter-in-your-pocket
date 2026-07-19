import * as React from "react"

interface ReportLayoutProps {
    children: React.ReactNode
    toc?: React.ReactNode
}

export function ReportLayout({ children, toc }: ReportLayoutProps) {
    return (
        <div className="relative mx-auto w-full max-w-6xl px-0 pb-8 sm:px-5 md:pb-14 lg:px-8">
            {toc && (
                <aside
                    aria-label="Report navigation"
                    className="riyp-border-paper-line sticky top-0 z-40 border-y bg-mineral/95 px-2 backdrop-blur-md sm:px-3 md:px-6"
                >
                    {toc}
                </aside>
            )}
            <article className="riyp-report-paper min-w-0 px-5 py-7 sm:px-9 sm:py-10 lg:px-16 lg:py-12">
                {children}
            </article>
        </div>
    )
}
