"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Lock, ArrowRight, Copy, Check, Loader2 } from "lucide-react"
import { TransformArrowIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { ActionFeedback } from "@/components/ui/action-feedback"
import { useTransientFeedback } from "@/hooks/use-transient-feedback"
import { Analytics } from "@/lib/analytics"

interface RedPenCardProps {
    title: string
    before: string
    after: string
    onUnlock?: () => void
    isLocked?: boolean
    className?: string
}

/** Keeps the original beside its suggested revision. */
export function RedPenCard({
    title,
    before,
    after,
    onUnlock,
    isLocked = false,
    className
}: RedPenCardProps) {
    const copiedFeedback = useTransientFeedback();
    const [copiedText, setCopiedText] = React.useState<string | null>(null);
    const [copying, setCopying] = React.useState(false);
    const [copyError, setCopyError] = React.useState(false);
    const copyRequest = React.useRef(0);
    const copied = copiedFeedback.active && copiedText === after;

    React.useEffect(() => () => { copyRequest.current += 1; }, []);

    const handleCopy = async () => {
        if (isLocked || copying) return;
        const request = ++copyRequest.current;
        copiedFeedback.reset();
        setCopyError(false);
        setCopying(true);
        try {
            await navigator.clipboard.writeText(after);
            if (request !== copyRequest.current) return;
            setCopiedText(after);
            copiedFeedback.trigger();
            Analytics.track('sm1_fix_copied');
        } catch {
            if (request === copyRequest.current) setCopyError(true);
        } finally {
            if (request === copyRequest.current) setCopying(false);
        }
    };

    return (
        <div className={cn(
            "group relative overflow-hidden rounded border border-border/60 bg-card transition-colors duration-fast hover:border-brand/30 motion-reduce:transition-none",
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
                <div className="relative bg-brand/5 p-5">
                    <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-brand flex items-center gap-2">
                            <ArrowRight className="size-3" />
                            Recruiter Version
                        </div>
                        {!isLocked && (
                            <div className="flex items-center gap-2">
                                <button type="button"
                                    onClick={handleCopy}
                                    aria-disabled={copying || undefined}
                                    aria-busy={copying || undefined}
                                    className={cn(
                                        "inline-flex min-h-11 items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-busy:cursor-wait motion-reduce:transition-none",
                                        copied
                                            ? "bg-success/10 text-success"
                                            : "bg-muted/50 text-muted-foreground hover:bg-brand-tint hover:text-brand"
                                    )}
                                >
                                    <ActionFeedback state={copying ? "pending" : copied ? "success" : "idle"} states={{
                                        idle: { label: "Copy", icon: <Copy className="size-3" /> },
                                        pending: { label: "Copying", icon: <Loader2 className="size-3 motion-safe:animate-spin" /> },
                                        success: { label: "Copied", icon: <Check className="size-3" /> },
                                    }} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={cn("relative", isLocked && "select-none")}>
                        <div className="relative -mx-2 -my-1 rounded-md px-2 py-1">
                            <p className={cn(
                                "relative text-sm font-medium leading-relaxed text-foreground",
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
                                    className="relative overflow-hidden"
                                >
                                    <Lock className="mr-2 size-3.5" />
                                    See the Recruiter&apos;s Version
                                </Button>
                            </div>
                        )}
                    </div>
                    {copyError && <p role="status" className="mt-3 text-sm leading-6 text-muted-foreground">Couldn&apos;t copy. Select the text and copy it manually.</p>}
                </div>
            </div>
        </div>
    )
}
