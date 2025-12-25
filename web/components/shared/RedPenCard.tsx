import * as React from "react"
import { cn } from "@/lib/utils"
import { Lock, ArrowRight, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RedPenCardProps {
    title: string
    before: string
    after: string
    onUnlock?: () => void
    isLocked?: boolean
    className?: string
}

/**
 * RedPenCard (The "Money" Component)
 * Visualizes a "Before vs After" rewrite with a clear visual hierarchy.
 * - Uses "Paper" metaphor (white card, subtle border)
 * - "After" state can be locked (blurred) to drive conversion
 * - Highlights the "Transformation" moment
 */
export function RedPenCard({
    title,
    before,
    after,
    onUnlock,
    isLocked = false,
    className
}: RedPenCardProps) {
    return (
        <div className={cn(
            "group relative overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm transition-all hover:border-brand/30",
            className
        )}>
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-border/10 bg-muted/30 px-4 py-3">
                <Wand2 className="h-4 w-4 text-brand" />
                <h3 className="font-display font-medium text-sm text-foreground">{title}</h3>
            </div>

            <div className="grid gap-0 md:grid-cols-2">
                {/* BEFORE Panel */}
                <div className="md:border-r border-border/10 p-5 bg-red-50/10">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original</div>
                    <p className="text-sm leading-relaxed text-muted-foreground line-through decoration-red-300 decoration-wavy decoration-from-font opacity-80">
                        {before}
                    </p>
                </div>

                {/* AFTER Panel */}
                <div className="relative p-5 bg-brand/5">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        Recruiter Version
                    </div>

                    <div className={cn("relative", isLocked && "select-none")}>
                        <p className={cn(
                            "text-sm font-medium leading-relaxed text-foreground",
                            isLocked && "blur-sm opacity-50"
                        )}>
                            {isLocked ? (
                                // If locked, show a generic length of text that matches 'before' roughly
                                before.split(' ').map(() => "█████").join(' ').slice(0, before.length * 1.2)
                            ) : after}
                        </p>

                        {isLocked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Button
                                    size="sm"
                                    variant="premium"
                                    onClick={onUnlock}
                                    className="scale-95 transition-transform group-hover:scale-100 shadow-md"
                                >
                                    <Lock className="mr-2 h-3.5 w-3.5" />
                                    Unlock Rewrite
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
