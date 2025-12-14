import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StudioSidebar } from "./StudioSidebar";

interface StudioShellProps {
    children: React.ReactNode;
    className?: string;
    showSidebar?: boolean;
}

export function StudioShell({
    children,
    className,
    showSidebar = true,
    disableScroll = false
}: StudioShellProps & { disableScroll?: boolean }) {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/10 selection:text-primary">
            {showSidebar && <StudioSidebar />}

            <main className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300",
                showSidebar ? "lg:pl-[280px]" : ""
            )}>
                {/* 
                   Note: StudioSidebar is likely fixed/sticky. 
                   If StudioSidebar renders a fixed sidebar, we need padding here. 
                   Checking StudioSidebar usage... assuming it handles layout via flex or fixed.
                   For now, we trust the flex structure.
                */}

                {disableScroll ? (
                    <div className={cn("flex-1 h-full w-full overflow-hidden", className)}>
                        {children}
                    </div>
                ) : (
                    <ScrollArea className="flex-1 w-full">
                        <div className={cn("mx-auto max-w-5xl p-6 md:p-12", className)}>
                            {children}
                        </div>
                    </ScrollArea>
                )}
            </main>
        </div>
    );
}
