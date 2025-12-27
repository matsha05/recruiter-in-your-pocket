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
            <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50 overflow-x-hidden">
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <PocketMark className="w-6 h-6 text-brand" />
                    <Wordmark className="h-5 md:h-6 text-foreground hidden sm:block" />
                </Link>
                <nav className="flex items-center gap-2 md:gap-4">
                    <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium hidden md:block">Research</Link>
                    {isAuthLoading ? (
                        <div className="w-20 h-9" />
                    ) : user ? (
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <UserNav user={user} onSignOut={signOut} />
                            <Link href="/workspace" className="hidden sm:block">
                                <Button variant="brand" size="sm">Open Studio</Button>
                            </Link>
                            <Link href="/workspace" className="sm:hidden">
                                <Button variant="brand" size="sm">Studio</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <Link href="/auth">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground px-2 md:px-3">Log In</Button>
                            </Link>
                            <Link href="/workspace">
                                <Button variant="brand" size="sm" className="px-3 md:px-4">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section — Verdict First */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <section className="relative flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
                    {/* Ambient glow - Linear-style */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-radial from-brand/8 via-transparent to-transparent blur-3xl" />
                    </div>

                    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center gap-10">

                        {/* Centered Hero Header */}
                        <div className="text-center max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h1 className="text-hero text-5xl md:text-6xl lg:text-7xl text-primary mb-6">
                                See what recruiters see.
                            </h1>
                            <p className="text-xl text-muted-foreground mb-10">
                                Then fix it before they do.
                            </p>

                            {/* Dropzone — The Hero */}
                            <div className="flex flex-col items-center gap-6">
                                <ResumeDropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                                <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
                                    <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Encrypted</span>
                                    <span className="text-muted-foreground/30">·</span>
                                    <span>Auto-deleted in 24h</span>
                                    <span className="text-muted-foreground/30">·</span>
                                    <span>Never trains AI</span>
                                </div>
                            </div>
                        </div>

                        {/* Product Preview - Below the fold */}
                        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                            <SampleReportPreview />
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
