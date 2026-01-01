"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import ThemeToggle from "@/components/shared/ThemeToggle";
import Link from "next/link";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { PocketMark, Wordmark } from "@/components/icons";
import Footer from "@/components/landing/Footer";
import { SampleReportPreview } from "@/components/landing/SampleReportPreview";
import { BackedByResearch } from "@/components/landing/BackedByResearch";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { Analytics } from "@/lib/analytics";

export default function LandingClient() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading, signOut } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelect = async (file: File) => {
        setIsProcessing(true);
        Analytics.resumeUploaded("landing");

        try {
            const formData = new FormData();
            formData.append("file", file);

            // Parse the file and store the text for the workspace
            const res = await fetch("/api/parse-resume", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Failed to parse");

            const data = await res.json();

            if (data.ok && data.text) {
                // Store the parsed text and flag for auto-run
                sessionStorage.setItem("pending_resume_text", data.text);
                sessionStorage.setItem("pending_auto_run", "true");
            }

            router.push("/workspace");
        } catch (err) {
            console.error(err);
            router.push("/workspace");
        } finally {
            setIsProcessing(false);
        }
    };
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand/20">
            {/* Navbar: Mobile-first, responsive */}
            <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50 overflow-x-hidden safe-area-inset-x">
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <PocketMark className="w-6 h-6 text-brand" />
                    <Wordmark className="h-5 md:h-6 text-foreground hidden sm:block" />
                </Link>
                <nav className="flex items-center gap-3 md:gap-4">
                    {!user && <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium hidden md:block">Research</Link>}
                    {isAuthLoading ? (
                        <div className="w-20 h-9" />
                    ) : user ? (
                        <div className="flex items-center gap-2 md:gap-3">
                            {/* Nav hints matching sidebar structure */}
                            <Link href="/workspace" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium hidden md:block">The Studio</Link>
                            <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium hidden md:block">Research</Link>
                            <div className="hidden md:block w-px h-4 bg-border/50" />
                            <UserNav user={user} onSignOut={signOut} />
                            <Link href="/workspace" className="hidden sm:block md:hidden">
                                <Button variant="brand" size="sm">Open Studio</Button>
                            </Link>
                            <Link href="/workspace" className="sm:hidden">
                                <Button variant="brand" size="sm" className="px-3">Studio</Button>
                            </Link>
                            <ThemeToggle />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 md:gap-3">
                            <Link href="/auth" className="hidden sm:block">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log In</Button>
                            </Link>
                            <Link href="/workspace">
                                <Button variant="brand" size="sm" className="px-3 md:px-4">Get Started</Button>
                            </Link>
                            <ThemeToggle />
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section — Verdict First */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <section className="relative px-6 py-12 lg:py-20">
                    <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
                        <div className="space-y-6">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                Recruiter First Impression
                            </div>
                            <h1 className="text-hero text-5xl md:text-6xl lg:text-7xl text-primary">
                                See what recruiters see.
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                7.4 seconds. That&apos;s your window. We show what they notice first, then how to fix it.
                            </p>
                            <div className="text-xs text-muted-foreground">
                                <Link href="/research/how-recruiters-read" className="underline underline-offset-4 decoration-border hover:decoration-foreground">
                                    See the research behind the 7.4-second scan
                                </Link>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Encrypted</span>
                                <span className="text-muted-foreground/30">·</span>
                                <span>Auto-deleted in 24h</span>
                                <span className="text-muted-foreground/30">·</span>
                                <span>Never trains AI</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <SampleReportPreview />
                            <ResumeDropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                            <Link
                                href="/workspace?mode=linkedin"
                                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded border border-border/40 text-xs text-muted-foreground hover:text-foreground hover:border-brand/30 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5 text-brand" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn profiles
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Proof Section */}
                <BackedByResearch />

                {/* Social Proof Section */}
                <Testimonials />

                {/* Pricing Section */}
                <Pricing />
            </main>


            {/* Footer */}
            <Footer />
        </div>
    );
}
