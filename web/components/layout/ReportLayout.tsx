import * as React from "react"
import styles from "./ReportLayout.module.css"

interface ReportLayoutProps {
    children: React.ReactNode
    toc?: React.ReactNode
    mobileReading?: boolean
}

export function ReportLayout({ children, toc, mobileReading = false }: ReportLayoutProps) {
    return (
        <div className={`${styles.shell} ${mobileReading ? styles.mobileReading : ""}`}>
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
