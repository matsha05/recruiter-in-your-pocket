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

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center pt-24 pb-20 px-6 overflow-hidden">
                <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
                    <h1 className="text-hero text-6xl md:text-7xl lg:text-8xl text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        See what <br className="hidden md:block" /> they see.
                    </h1>
                    <p className="text-memo text-xl text-muted-foreground max-w-lg mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        In 7.4 seconds, a recruiter has already decided. <br />
                        <span className="text-foreground font-medium">This is what they saw.</span>
                    </p>

                    <div className="w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <ResumeDropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted</span>
                            <span>•</span>
                            <span>Auto-deleted in 24h</span>
                        </div>
                    </div>
                </div>

                {/* The Hero Artifact (Sample Preview) */}
                <div className="w-full flex justify-center mb-32 relative z-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <SampleReportPreview />
                </div>

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
