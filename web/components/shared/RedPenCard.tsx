import * as React from "react"
import { cn } from "@/lib/utils"
import { Lock, ArrowRight, Copy } from "lucide-react"
import { CheckIcon } from "@/components/ui/check"
import { TransformArrowIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Analytics } from "@/lib/analytics"

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
 * - Copy button for instant clipboard access
 */
export function RedPenCard({
    title,
    before,
    after,
    onUnlock,
    isLocked = false,
    className
}: RedPenCardProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(after);
            setCopied(true);
            Analytics.track('sm1_fix_copied', { title });
            setTimeout(() => setCopied(false), 1800);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={cn(
            "group relative overflow-hidden rounded border border-border/60 bg-card transition-all hover:border-brand/30",
            className
        )}>
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-border/10 bg-muted/20 px-4 py-3">
                <TransformArrowIcon className="size-4 text-brand" />
                <h3 className="font-display font-medium text-sm text-foreground">{title}</h3>
            </div>

            <div className="grid gap-0 md:grid-cols-2">
                {/* BEFORE Panel */}
                <div className="md:border-r border-border/10 p-5 bg-secondary/10">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original</div>
                    <p className="text-sm leading-relaxed text-muted-foreground line-through decoration-muted-foreground/40 opacity-80">
                        {before}
                    </p>
                </div>

                {/* AFTER Panel */}
                <div className={cn(
                    "relative p-5 transition-all duration-300",
                    copied ? "bg-brand/10 ring-1 ring-brand/15 shadow-[0_0_0_6px_rgba(13,148,136,0.06)]" : "bg-brand/5"
                )}>
                    <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-brand flex items-center gap-2">
                            <ArrowRight className="size-3" />
                            Recruiter Version
                        </div>
                        {!isLocked && (
                            <div className="flex items-center gap-2">
                                <button type="button"
                                    onClick={handleCopy}
                                    className={cn(
                                        "inline-flex min-h-11 min-w-[84px] items-center justify-center gap-1 rounded px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all",
                                        copied
                                            ? "bg-success/10 text-success"
                                            : "bg-muted/50 text-muted-foreground hover:bg-brand/10 hover:text-brand"
                                    )}
                                    aria-live="polite"
                                >
                                    {copied ? <CheckIcon size={12} /> : <Copy className="size-3" />}
                                    Copy
                                </button>
                                {copied ? (
                                    <span
                                        className="text-xs font-bold uppercase tracking-wider text-success transition-all duration-200"
                                        aria-live="polite"
                                    >
                                        Copied
                                    </span>
                                ) : null}
                            </div>
                        )}
                    </div>

                    <div className={cn("relative", isLocked && "select-none")}>
                        <div
                            className={cn(
                                "relative rounded-md -mx-2 -my-1 px-2 py-1 transition-all duration-300",
                                copied && !isLocked && "bg-white/75 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.12)]"
                            )}
                        >
                            <p className={cn(
                                "relative text-sm font-medium leading-relaxed text-foreground transition-all duration-300",
                                copied && !isLocked && "scale-[1.01]",
                                isLocked && "blur-sm opacity-50"
                            )}>
                                {isLocked ? (
                                    // If locked, show a generic length of text that matches 'before' roughly
                                    before.split(' ').map(() => "█████").join(' ').slice(0, before.length * 1.2)
                                ) : after}
                            </p>
                        </div>

                        {isLocked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Button
                                    size="sm"
                                    variant="premium"
                                    onClick={onUnlock}
                                    className="relative overflow-hidden scale-95 transition-transform group-hover:scale-100"
                                >
                                    <Lock className="mr-2 size-3.5" />
                                    See the Recruiter&apos;s Version
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
