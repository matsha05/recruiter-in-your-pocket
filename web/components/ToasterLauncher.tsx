"use client"

import * as React from "react"

type ToasterComponent = React.ComponentType

const loadToaster = () => import("@/components/ui/sonner").then((module) => module.Toaster)

/**
 * Keeps sonner (its toast renderer and stylesheet) out of every page's first
 * load. The Toaster loads right after hydration; a toast raised before it
 * arrives waits in sonner's store and appears when it mounts.
 */
export function ToasterLauncher() {
    const [Toaster, setToaster] = React.useState<ToasterComponent | null>(null)

    React.useEffect(() => {
        if (Toaster) return
        let active = true
        loadToaster().then(
            (component) => {
                if (active) setToaster(() => component)
            },
            () => {
                // Toasts are feedback, not content; a failed chunk load leaves the page as it is.
            }
        )
        return () => {
            active = false
        }
    }, [Toaster])

    return Toaster ? <Toaster /> : null
}
