import * as React from "react"

interface ReportLayoutProps {
    children: React.ReactNode
    toc?: React.ReactNode
}

export function ReportLayout({ children, toc }: ReportLayoutProps) {
    return (
        <div className="report-layout-shell relative mx-auto w-full px-0 pb-8 md:pb-14">
            {toc && (
                <aside
                    aria-label="Report navigation"
                    className="riyp-border-paper-line sticky top-0 z-40 border-y bg-mineral px-2 sm:px-3 md:px-6"
                >
                    {toc}
                </aside>
            )}
            <article className="riyp-report-paper mt-4 min-w-0 px-5 py-5 sm:mt-8 sm:px-8 sm:py-7">
                {children}
            </article>
        </div>
    )
}
