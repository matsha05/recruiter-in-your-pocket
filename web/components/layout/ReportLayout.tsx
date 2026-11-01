"use client"

import * as React from "react"
import styles from "./ReportLayout.module.css"

interface ReportLayoutProps {
    children: React.ReactNode
    toc?: React.ReactNode
    mobileReading?: boolean
}

/**
 * On phones the section tabs stay out of the first screen, so the Verdict and the Critical Miss come first
 * (plan item 2.5). They slide in under the header once the opening read has scrolled away.
 */
function useTabsRevealed(enabled: boolean) {
    const [revealed, setRevealed] = React.useState(false)
    React.useEffect(() => {
        if (!enabled) return
        const opening = document.getElementById("section-first-impression")
        if (!opening || typeof IntersectionObserver === "undefined") {
            setRevealed(true)
            return
        }
        const observer = new IntersectionObserver(([entry]) => {
            setRevealed(!entry.isIntersecting && entry.boundingClientRect.top < 0)
        })
        observer.observe(opening)
        return () => observer.disconnect()
    }, [enabled])
    return revealed
}

export function ReportLayout({ children, toc, mobileReading = false }: ReportLayoutProps) {
    const revealed = useTabsRevealed(Boolean(toc && mobileReading))

    return (
        <div className={`${styles.shell} ${mobileReading ? styles.mobileReading : ""}`}>
            {toc && (
                <aside
                    aria-label="Report navigation"
                    className={styles.navigation}
                    data-revealed={revealed || undefined}
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
