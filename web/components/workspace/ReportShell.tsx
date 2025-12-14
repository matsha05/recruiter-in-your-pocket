"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ReportShellProps {
    children: ReactNode;
    sidebar?: ReactNode; // Left rail (nav)
    aside?: ReactNode;   // Right rail (score)
    className?: string;
}

export function ReportShell({ children, sidebar, aside, className }: ReportShellProps) {
    return (
        <div className="min-h-screen bg-background text-foreground flex justify-center">

            <div className={cn("w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-8 py-8", className)}>

                {/* Left Rail (Nav) - Hidden on mobile, sticky on desktop */}
                {sidebar && (
                    <aside className="hidden lg:block lg:col-span-2 xl:col-span-2 relative">
                        <div className="sticky top-24 space-y-4">
                            {sidebar}
                        </div>
                    </aside>
                )}

                {/* Main Content (The Stream) */}
                <main className={cn(
                    "lg:col-span-7 xl:col-span-7 space-y-12 pb-20",
                    !aside && "lg:col-span-10" // Expand if no right rail
                )}>
                    {children}
                </main>

                {/* Right Rail (Score/Actions) - Sticky */}
                {aside && (
                    <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 relative">
                        <div className="sticky top-24 space-y-6">
                            {aside}
                        </div>
                    </aside>
                )}

            </div>
        </div>
    );
}
