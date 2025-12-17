"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import Link from "next/link";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SkimView } from "@/components/workspace/SkimView";
import { ArrowRight, Lock } from "lucide-react";
import { PocketMark } from "@/components/icons";
import Footer from "@/components/landing/Footer";
import { SampleReportPreview } from "@/components/landing/SampleReportPreview";
import { BackedByResearch } from "@/components/landing/BackedByResearch";
import { Pricing } from "@/components/landing/Pricing";
import { HeroArtifact } from "@/components/landing/HeroArtifact";

export default function LandingClient() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading, signOut } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [skimData, setSkimData] = useState<any>(null);
    const [previewText, setPreviewText] = useState<string>("");
    const [isSkimOpen, setIsSkimOpen] = useState(false);

    const handleFileSelect = async (file: File) => {
        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/skim", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Failed to parse");

            const data = await res.json();

            if (data.ok) {
                setSkimData(data.skim);
                setPreviewText(data.previewText);
                setIsSkimOpen(true);
            }
        } catch (err) {
            console.error(err);
            router.push("/workspace");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFullAnalysis = () => {
        if (previewText) {
            sessionStorage.setItem("pending_resume_text", previewText);
        }
        router.push("/workspace");
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand/20">
            {/* Navbar: Minimal, Technical */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <PocketMark className="w-6 h-6 text-brand" />
                    <span className="text-xl font-display font-medium tracking-tight text-foreground">Recruiter in Your Pocket</span>
                </div>
                <nav className="flex items-center gap-6">
                    <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Research</Link>
                    {isAuthLoading ? (
                        <div className="w-24 h-9" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <UserNav user={user} onSignOut={signOut} />
                            <Link href="/workspace">
                                <Button variant="brand" size="sm">Open Studio</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
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

            {/* Hero Section — Split Layout: Proof + Action */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* 
                    Layout Rationale: Proof-before-ask pattern.
                    Left: HeroArtifact shows what recruiters actually see (evidence)
                    Right: Headline + Dropzone enables action
                    This layout places evidence *alongside* the CTA, not below it.
                */}
                {/* Hero Section — Centered Header + Side-by-Side Proof + Action */}
                <section className="flex-1 flex items-center justify-center px-6 py-16 lg:py-20">
                    <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-12 lg:gap-16">

                        {/* Centered Hero Header */}
                        <div className="text-center max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h1 className="text-hero text-5xl md:text-6xl lg:text-7xl text-primary mb-6">
                                See what they see.
                            </h1>
                            <p className="text-memo text-xl text-muted-foreground">
                                In 6 seconds, a recruiter has already decided. <br />
                                <span className="text-foreground font-medium">This is what they saw.</span>
                            </p>
                        </div>

                        {/* Side-by-Side: Proof (Left) + Action (Right) */}
                        <div className="w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                            {/* LEFT: The Proof (HeroArtifact) */}
                            <div className="flex justify-center lg:justify-end animate-in fade-in slide-in-from-left-8 duration-1000">
                                <HeroArtifact />
                            </div>

                            {/* RIGHT: The Action (Dropzone) */}
                            <div className="flex flex-col items-center lg:items-start animate-in fade-in slide-in-from-right-8 duration-1000">
                                <div className="w-full max-w-md">
                                    <ResumeDropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                                    <div className="mt-4 flex items-center justify-center lg:justify-start gap-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted</span>
                                        <span>•</span>
                                        <span>Auto-deleted in 24h</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Sample Report Preview - Full Report Context */}
                <section className="w-full flex justify-center pb-24 px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <SampleReportPreview />
                </section>

                {/* Proof Section */}
                <BackedByResearch />

                {/* Pricing Section */}
                <Pricing />
            </main>

            {/* Skim Result Modal */}
            <Dialog open={isSkimOpen} onOpenChange={setIsSkimOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border-black/5 dark:border-white/5 shadow-2xl">
                    <DialogHeader className="px-6 pt-6 border-b border-border/50 bg-secondary/20">
                        <DialogTitle className="font-display text-2xl tracking-tight">What They See in 6 Seconds</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-sans">
                            This is the moment. Before they read a single bullet, this is the impression.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 bg-background">
                        {skimData && (
                            <SkimView text={previewText} skimData={skimData} />
                        )}
                    </div>

                    <div className="p-6 flex items-center justify-between bg-background border-t border-border/50">
                        <div className="text-sm text-muted-foreground font-medium">
                            <p>Is this impression strong enough?</p>
                        </div>
                        <Button onClick={handleFullAnalysis} variant="brand" size="lg" className="gap-2">
                            Continue to Full Report <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Footer */}
            <Footer />
        </div>
    );
}
