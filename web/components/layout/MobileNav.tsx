"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, FileText, Library, CreditCard, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] flex flex-col p-0">
                <SheetHeader className="p-6 border-b text-left">
                    <SheetTitle className="font-serif italic text-xl">Pocket</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <nav className="space-y-2">
                        <MobileNavLink href="/workspace" icon={FileText} setOpen={setOpen} active={pathname === "/workspace"}>
                            The Studio
                        </MobileNavLink>
                        <MobileNavLink href="/research" icon={Library} setOpen={setOpen} active={pathname?.startsWith("/research")}>
                            Research Library
                        </MobileNavLink>
                        <MobileNavLink href="/settings" icon={CreditCard} setOpen={setOpen} active={pathname === "/settings"}>
                            Passes & Billing
                        </MobileNavLink>
                    </nav>
                </div>

                <div className="p-6 border-t bg-secondary/20">
                    {user ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium truncate">{user.email}</p>
                                    <p className="text-xs text-muted-foreground capitalize flex items-center gap-1.5 mt-0.5">
                                        {user.membership === "pro" && (
                                            <span className="inline-flex items-center gap-1">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">Pro Member</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">• {user.daysLeft} days left</span>
                                            </span>
                                        )}
                                        {user.membership === "audit" && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600">1 Audit Available</span>
                                        )}
                                        {(user.membership === "free" || !user.membership) && (
                                            <span className="inline-flex items-center gap-1">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">Free Plan</span>
                                                {user.freeUsesLeft !== undefined && user.freeUsesLeft > 0 && (
                                                    <span className="text-[10px] text-emerald-600 font-medium">• {user.freeUsesLeft} Free Audit remaining</span>
                                                )}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => signOut()}>
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Link href="/auth" onClick={() => setOpen(false)}>
                                <Button className="w-full" variant="default">Sign In</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function MobileNavLink({ href, icon: Icon, children, setOpen, active }: any) {
    return (
        <Link
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                active
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
            {children}
        </Link>
    );
}
