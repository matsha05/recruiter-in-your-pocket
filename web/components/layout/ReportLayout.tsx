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
function useTabsRevealed(enabled: boolean, tabsRef: React.RefObject<HTMLElement | null>) {
    const [revealed, setRevealed] = React.useState(false)
    React.useEffect(() => {
        if (!enabled) return
        const opening = document.getElementById("section-first-impression")
        if (!opening) {
            setRevealed(true)
            return
        }
        let frame = 0
        const update = () => {
            frame = 0
            // The tabs hang from the header; they appear once the opening has passed under where they end,
            // which is also where a tab jump lands a section, so a jump never hides the tabs it came from.
            const tabs = tabsRef.current
            const line = tabs ? (Number.parseFloat(getComputedStyle(tabs).top) || 0) + tabs.getBoundingClientRect().height : 0
            setRevealed(opening.getBoundingClientRect().bottom <= line + 1)
        }
        const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
        window.addEventListener("scroll", schedule, { capture: true, passive: true })
        window.addEventListener("resize", schedule)
        update()
        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener("scroll", schedule, true)
            window.removeEventListener("resize", schedule)
        }
    }, [enabled, tabsRef])
    return revealed
}

export function ReportLayout({ children, toc, mobileReading = false }: ReportLayoutProps) {
    const tabsRef = React.useRef<HTMLElement>(null)
    const revealed = useTabsRevealed(Boolean(toc && mobileReading), tabsRef)

    return (
        <div className={`${styles.shell} ${mobileReading ? styles.mobileReading : ""}`}>
            {toc && (
                <aside
                    ref={tabsRef}
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
