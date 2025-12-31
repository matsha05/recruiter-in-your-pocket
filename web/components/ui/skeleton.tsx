import { cn } from "@/lib/utils";

/**
 * Skeleton
 * 
 * Loading placeholder with subtle pulse animation.
 * V2.1 Design Spec: bg-muted/10, animate-pulse
 * 
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-[200px]" />
 * <Skeleton shimmer className="h-12 w-full" />
 * ```
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Use shimmer effect instead of pulse (for longer content) */
    shimmer?: boolean;
}

function Skeleton({
    className,
    shimmer = false,
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                "rounded-sm bg-[var(--skeleton)]",
                shimmer
                    ? "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
                    : "animate-pulse",
                className
            )}
            {...props}
        />
    );
}

export { Skeleton };

