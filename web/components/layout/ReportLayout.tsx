import * as React from "react"
import styles from "./ReportLayout.module.css"

interface ReportLayoutProps {
    children: React.ReactNode
    toc?: React.ReactNode
}

export function ReportLayout({ children, toc }: ReportLayoutProps) {
    return (
        <div className={styles.shell}>
            {toc && (
                <aside
                    aria-label="Report navigation"
                    className={styles.navigation}
                >
                    {toc}
                </aside>
            )}
            <article className={styles.paper}>
                {children}
            </article>
        </div>
    )
}
