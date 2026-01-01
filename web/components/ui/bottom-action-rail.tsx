"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Command, Download, Share2, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DURATION } from "@/lib/animation"

/**
 * BottomActionRail - Persistent bar at bottom of report pages
 * Per design-principles.md: Raycast Pattern
 * 
 * Layout:
 * - Left: current section name (dense)
 * - Center: "Cmd+K" shortcut hint
 * - Right: primary next action
 * - Toasts appear inside this bar, not floating
 */

interface BottomActionRailProps {
    /** Current section name to display */
    sectionName?: string
    /** Primary action label */
    primaryActionLabel?: string
    /** Primary action callback */
    onPrimaryAction?: () => void
    /** Primary action loading state */
    isPrimaryLoading?: boolean
    /** Secondary action (export) callback */
    onExport?: () => void
    /** Share callback */
    onShare?: () => void
    /** Toast message to show */
    toast?: {
        message: string
        type?: "success" | "error" | "info"
    } | null
    /** Additional className */
    className?: string
}

export function BottomActionRail({
    sectionName,
    primaryActionLabel = "Continue",
    onPrimaryAction,
    isPrimaryLoading = false,
    onExport,
    onShare,
    toast,
    className,
}: BottomActionRailProps) {
    const [showToast, setShowToast] = React.useState(false)

    React.useEffect(() => {
        if (toast) {
            setShowToast(true)
            const timer = setTimeout(() => setShowToast(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-40",
                "border-t border-border/60 bg-background/95 backdrop-blur-sm",
                "px-4 py-3",
                "flex items-center justify-between gap-4",
                className
            )}
        >
            {/* Left: Section name */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
                {sectionName && (
                    <span className="text-caption text-muted-foreground truncate">
                        {sectionName}
                    </span>
                )}
            </div>

            {/* Center: Cmd+K hint + Toast */}
            <div className="flex items-center justify-center gap-2 flex-shrink-0">
                <AnimatePresence mode="wait">
                    {showToast && toast ? (
                        <motion.div
                            key="toast"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: DURATION.select }}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-sm font-medium",
                                toast.type === "success" && "bg-success/10 text-success",
                                toast.type === "error" && "bg-destructive/10 text-destructive",
                                (!toast.type || toast.type === "info") && "bg-brand/10 text-brand"
                            )}
                        >
                            {toast.message}
                        </motion.div>
                    ) : (
                        <motion.button
                            key="cmdk"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: DURATION.select }}
                            onClick={() => {
                                // Trigger Cmd+K programmatically
                                const event = new KeyboardEvent("keydown", {
                                    key: "k",
                                    metaKey: true,
                                    bubbles: true,
                                })
                                document.dispatchEvent(event)
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors duration-[90ms]"
                        >
                            <Command className="h-3.5 w-3.5" />
                            <span className="font-mono text-[11px] tracking-wider">K</span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {onShare && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onShare}
                        className="h-8 px-2"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                )}
                {onExport && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onExport}
                        className="h-8 px-2"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                )}
                {onPrimaryAction && (
                    <Button
                        size="sm"
                        onClick={onPrimaryAction}
                        disabled={isPrimaryLoading}
                        className="h-8"
                    >
                        {isPrimaryLoading ? (
                            <span className="animate-pulse">...</span>
                        ) : (
                            <>
                                {primaryActionLabel}
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}
