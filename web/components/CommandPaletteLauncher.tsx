"use client"

import * as React from "react"
import type { CommandPaletteProps } from "@/components/CommandPalette"

type PaletteComponent = React.ComponentType<CommandPaletteProps>

const loadPalette = () => import("@/components/CommandPalette").then((module) => module.CommandPalette)

/**
 * Keeps the command palette (cmdk, its dialog and icons) out of every page's
 * first load. Until the palette arrives, this listens for Cmd+K and the report
 * visibility signal; it loads the palette when the browser is idle, or at once
 * on Cmd+K, and hands both over when it mounts.
 */
export function CommandPaletteLauncher() {
    const [Palette, setPalette] = React.useState<PaletteComponent | null>(null)
    const [openOnLoad, setOpenOnLoad] = React.useState(false)
    const [reportVisible, setReportVisible] = React.useState(false)

    const load = React.useCallback(() => {
        loadPalette().then(
            (component) => setPalette(() => component),
            () => {
                // A failed chunk load leaves the shortcut armed for another try.
            }
        )
    }, [])

    React.useEffect(() => {
        if (Palette) return
        const down = (event: KeyboardEvent) => {
            if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                setOpenOnLoad(true)
                load()
            }
        }
        const handleReportVisibility = (event: Event) => {
            setReportVisible(Boolean((event as CustomEvent<{ visible?: boolean }>).detail?.visible))
        }
        document.addEventListener("keydown", down)
        window.addEventListener("riyp-report-visibility", handleReportVisibility)
        return () => {
            document.removeEventListener("keydown", down)
            window.removeEventListener("riyp-report-visibility", handleReportVisibility)
        }
    }, [Palette, load])

    React.useEffect(() => {
        if (Palette) return
        if (typeof window.requestIdleCallback === "function") {
            const handle = window.requestIdleCallback(load, { timeout: 4000 })
            return () => window.cancelIdleCallback(handle)
        }
        const timer = window.setTimeout(load, 2000)
        return () => window.clearTimeout(timer)
    }, [Palette, load])

    return Palette ? <Palette defaultOpen={openOnLoad} defaultReportVisible={reportVisible} /> : null
}
