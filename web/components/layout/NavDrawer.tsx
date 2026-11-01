"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { List } from "@phosphor-icons/react";
import { Wordmark } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type SheetContentProps = ComponentPropsWithoutRef<typeof SheetContent>;

/**
 * The one navigation drawer for the public site and the app (plan 3.7). It opens from the
 * right, under its trigger, at one width, with the same header, rows, and Phosphor icons.
 */
export function NavDrawer({
    open,
    onOpenChange,
    triggerClassName,
    description,
    onCloseAutoFocus,
    onNavClickCapture,
    footer,
    children,
}: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Hides the trigger where the full navigation shows, such as `md:hidden`. */
    triggerClassName?: string;
    description: string;
    onCloseAutoFocus?: SheetContentProps["onCloseAutoFocus"];
    onNavClickCapture?: ComponentPropsWithoutRef<"nav">["onClickCapture"];
    /** Account details that sit under the links. */
    footer?: ReactNode;
    children: ReactNode;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button type="button" variant="secondary" size="icon" aria-label="Open navigation" className={triggerClassName}>
                    <List className="size-5" weight="bold" aria-hidden="true" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[min(88vw,22rem)] flex-col gap-0 overflow-hidden bg-background" onCloseAutoFocus={onCloseAutoFocus}>
                <SheetHeader className="shrink-0 border-b border-border pb-5 text-left">
                    <SheetTitle><Wordmark className="text-foreground" /></SheetTitle>
                    <SheetDescription className="sr-only">{description}</SheetDescription>
                </SheetHeader>
                <nav
                    className="mt-8 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain"
                    aria-label="Mobile navigation"
                    onClickCapture={onNavClickCapture}
                >
                    {children}
                </nav>
                {footer ? <div className="-mx-6 -mb-6 mt-5 shrink-0 border-t border-border px-6 py-5">{footer}</div> : null}
            </SheetContent>
        </Sheet>
    );
}

export function NavDrawerLink({ href, active = false, children }: { href: string; active?: boolean; children: ReactNode }) {
    return (
        <SheetClose asChild>
            <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                    "focus-ring min-h-12 rounded-[10px] px-3 py-3 text-base font-medium riyp-surface-link hover:text-foreground",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground"
                )}
            >
                {children}
            </Link>
        </SheetClose>
    );
}

export function NavDrawerDivider() {
    return <div className="my-5 h-px bg-border" />;
}
