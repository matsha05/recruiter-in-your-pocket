"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import {
    FileText,
    Home,
    Upload,
    BookOpen,
    Download,
    Link2,
    Keyboard,
    Sparkles,
    Clock,
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"

/**
 * CommandPalette - Global command surface (Cmd+K)
 * Per design-principles.md: "Central command surface for pro users. 
 * This is the highest-leverage craft pattern."
 * 
 * Features:
 * - Opens with Cmd+K (or Ctrl+K on Windows)
 * - Opens in 0-90ms (no data fetch on open)
 * - Shows shortcut hints (Geist Mono 11px)
 * - Context-aware actions based on current route
 * - Recent commands (last 8, persisted to localStorage)
 */

// Action types that can be dispatched
export type CommandAction =
    | "upload"
    | "export-pdf"
    | "copy-link"
    | "run-analysis"
    | "keyboard-shortcuts"

interface RecentCommand {
    id: string
    label: string
    icon: string
    timestamp: number
}

// Global event for action dispatch
const ACTION_EVENT = "command-palette:action"

/**
 * Dispatch a command action that can be handled anywhere in the app
 */
export function dispatchCommandAction(action: CommandAction) {
    window.dispatchEvent(new CustomEvent(ACTION_EVENT, { detail: action }))
}

/**
 * Hook to listen for command palette actions
 */
export function useCommandAction(handler: (action: CommandAction) => void) {
    React.useEffect(() => {
        const listener = (e: CustomEvent<CommandAction>) => {
            handler(e.detail)
        }
        window.addEventListener(ACTION_EVENT as any, listener)
        return () => window.removeEventListener(ACTION_EVENT as any, listener)
    }, [handler])
}

// Persist recent commands
const RECENT_KEY = "riyp:recent-commands"
const MAX_RECENT = 8

function getRecentCommands(): RecentCommand[] {
    if (typeof window === "undefined") return []
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")
    } catch {
        return []
    }
}

function addRecentCommand(command: RecentCommand) {
    const recent = getRecentCommands().filter(c => c.id !== command.id)
    recent.unshift({ ...command, timestamp: Date.now() })
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

export function CommandPalette() {
    const [open, setOpen] = React.useState(false)
    const [recentCommands, setRecentCommands] = React.useState<RecentCommand[]>([])
    const router = useRouter()
    const pathname = usePathname()

    // Load recent commands on mount
    React.useEffect(() => {
        setRecentCommands(getRecentCommands())
    }, [open])

    // Global keyboard listener for Cmd+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    // Run command, add to recents, and close
    const runCommand = React.useCallback((
        command: () => void,
        recent?: { id: string; label: string; icon: string }
    ) => {
        setOpen(false)
        if (recent) {
            addRecentCommand({ ...recent, timestamp: Date.now() })
        }
        command()
    }, [])

    // Determine context-aware commands based on current route
    const isInWorkspace = pathname?.startsWith("/workspace")
    const isInReport = pathname?.includes("/report")

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {/* Recent Commands */}
                {recentCommands.length > 0 && (
                    <>
                        <CommandGroup heading="Recent">
                            {recentCommands.slice(0, 3).map((cmd) => (
                                <CommandItem
                                    key={cmd.id}
                                    onSelect={() => {
                                        // Re-run the recent command based on its ID
                                        if (cmd.id.startsWith("nav:")) {
                                            runCommand(() => router.push(cmd.id.replace("nav:", "")))
                                        } else {
                                            runCommand(() => dispatchCommandAction(cmd.id as CommandAction))
                                        }
                                    }}
                                >
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{cmd.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                {/* Context-aware actions */}
                {isInWorkspace && (
                    <>
                        <CommandGroup heading="Actions">
                            <CommandItem
                                onSelect={() => runCommand(
                                    () => dispatchCommandAction("upload"),
                                    { id: "upload", label: "Upload Resume", icon: "Upload" }
                                )}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                <span>Upload Resume</span>
                                <CommandShortcut>U</CommandShortcut>
                            </CommandItem>
                            {isInReport && (
                                <>
                                    <CommandItem
                                        onSelect={() => runCommand(
                                            () => dispatchCommandAction("export-pdf"),
                                            { id: "export-pdf", label: "Export PDF", icon: "Download" }
                                        )}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        <span>Export PDF</span>
                                        <CommandShortcut>E</CommandShortcut>
                                    </CommandItem>
                                    <CommandItem
                                        onSelect={() => runCommand(
                                            () => dispatchCommandAction("copy-link"),
                                            { id: "copy-link", label: "Copy Share Link", icon: "Link2" }
                                        )}
                                    >
                                        <Link2 className="mr-2 h-4 w-4" />
                                        <span>Copy Share Link</span>
                                        <CommandShortcut>C</CommandShortcut>
                                    </CommandItem>
                                    <CommandItem
                                        onSelect={() => runCommand(
                                            () => dispatchCommandAction("run-analysis"),
                                            { id: "run-analysis", label: "Run New Analysis", icon: "Sparkles" }
                                        )}
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        <span>Run New Analysis</span>
                                        <CommandShortcut>⏎</CommandShortcut>
                                    </CommandItem>
                                </>
                            )}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                {/* Navigation */}
                <CommandGroup heading="Navigation">
                    <CommandItem
                        onSelect={() => runCommand(
                            () => router.push("/"),
                            { id: "nav:/", label: "Go to Home", icon: "Home" }
                        )}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        <span>Go to Home</span>
                        <CommandShortcut>G H</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(
                            () => router.push("/workspace"),
                            { id: "nav:/workspace", label: "Go to Studio", icon: "FileText" }
                        )}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Go to Studio</span>
                        <CommandShortcut>G S</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(
                            () => router.push("/research"),
                            { id: "nav:/research", label: "Go to Research", icon: "BookOpen" }
                        )}
                    >
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Go to Research</span>
                        <CommandShortcut>G R</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Help */}
                <CommandGroup heading="Help">
                    <CommandItem
                        onSelect={() => runCommand(
                            () => dispatchCommandAction("keyboard-shortcuts"),
                            { id: "keyboard-shortcuts", label: "Keyboard Shortcuts", icon: "Keyboard" }
                        )}
                    >
                        <Keyboard className="mr-2 h-4 w-4" />
                        <span>Keyboard Shortcuts</span>
                        <CommandShortcut>?</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}

/**
 * Hook to programmatically open the command palette
 */
export function useCommandPaletteState() {
    const [open, setOpen] = React.useState(false)

    const toggle = React.useCallback(() => {
        setOpen(o => !o)
    }, [])

    return { open, setOpen, toggle }
}
