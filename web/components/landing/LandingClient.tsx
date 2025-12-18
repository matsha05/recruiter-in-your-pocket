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
import { SampleReport } from "@/components/landing/SampleReport";
import { BackedByResearch } from "@/components/landing/BackedByResearch";
import { Pricing } from "@/components/landing/Pricing";
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
            const res = await fetch("/api/skim", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Failed to parse");

            const data = await res.json();

            if (data.ok && data.previewText) {
                // Store the parsed text and go directly to workspace
                sessionStorage.setItem("pending_resume_text", data.previewText);
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
            {/* Navbar: Minimal, Technical */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <PocketMark className="w-6 h-6 text-brand" />
                    <Wordmark className="h-6 text-foreground" />
                </div>
                <nav className="flex items-center gap-6">
                    <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Research</Link>
                    {isAuthLoading ? (
                        <div className="w-24 h-9" />
                    ) : user ? (
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <UserNav user={user} onSignOut={signOut} />
                            <Link href="/workspace">
                                <Button variant="brand" size="sm">Open Studio</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <Link href="/auth">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log In</Button>
                            </Link>
                            <Link href="/workspace">
                                <Button variant="brand" size="sm">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section — Product-First Design */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <section className="flex-1 flex items-center justify-center px-6 py-16 lg:py-24">
                    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-12">

                        {/* Centered Hero Header */}
                        <div className="text-center max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h1 className="text-hero text-5xl md:text-6xl lg:text-7xl text-primary mb-4">
                                See what recruiters see.
                            </h1>
                            <p className="text-memo text-xl text-muted-foreground mb-8">
                                6 seconds. One decision.
                            </p>

                            {/* Single CTA */}
                            <div className="flex flex-col items-center gap-4">
                                <ResumeDropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                                <div className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                                    <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted</span>
                                    <span>·</span>
                                    <span>Auto-deleted in 24h</span>
                                    <span>·</span>
                                    <span>Never trains AI</span>
                                </div>
                            </div>
                        </div>

                        {/* Product Preview - The Full Sample Report */}
                        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                            <SampleReport />
                        </div>

                    </div>
                </section>

                {/* Proof Section */}
                <BackedByResearch />

                {/* Pricing Section */}
                <Pricing />
            </main>


            {/* Footer */}
            <Footer />
        </div>
    );
}
