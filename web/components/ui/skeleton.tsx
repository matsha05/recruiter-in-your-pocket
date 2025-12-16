import { cn } from "@/lib/utils";

/**
 * Skeleton
 * 
 * Loading placeholder with subtle pulse animation.
 * V2.1 Design Spec: bg-muted/10, animate-pulse
 */
function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "rounded-sm bg-[var(--skeleton)] animate-pulse",
                className
            )}
            {...props}
        />
    );
}

export { Skeleton };
