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
import { ArrowRight, Loader2, Eye, Target, PenTool } from "lucide-react";
import Footer from "@/components/landing/Footer";

export default function LandingClient() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading, signOut } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [skimData, setSkimData] = useState<any>(null); // Ideally type this shared interface
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
            // Fallback: just go to workspace if quick skim fails
            router.push("/workspace");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFullAnalysis = () => {
        // Pass the preview text to the workspace via storage
        if (previewText) {
            sessionStorage.setItem("pending_resume_text", previewText);
        }
        router.push("/workspace");
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Navbar: Minimal, Technical */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-serif italic font-semibold tracking-tight text-foreground">Recruiter in Your Pocket</span>
                </div>
                <nav className="flex items-center gap-4">
                    <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Research</Link>
                    {isAuthLoading ? (
                        <div className="w-24 h-9" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <UserNav user={user} onSignOut={signOut} />
                            <Link href="/workspace">
                                <Button variant="studio" size="sm">Open Studio</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link href="/auth">
                                <Button variant="ghost" size="sm" className="text-muted-foreground">Log In</Button>
                            </Link>
                            <Link href="/workspace">
                                <Button variant="studio" size="sm">Get Started</Button>
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center pt-24 pb-20 px-6">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="font-serif text-5xl md:text-6xl font-medium tracking-tight text-primary mb-6 leading-[1.1]">
                        Stop guessing what <br />
                        recruiters see.
                    </h1>
                    <p className="font-sans text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
                        We simulate the 6-second recruiter skim to show you exactly why you aren't getting interviews. <span className="text-foreground font-medium">No generic advice. Just evidence.</span>
                    </p>
                </div>

                <div className="w-full max-w-xl mb-16 animate-fade-in-up">
                    <ResumeDropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                </div>

                {/* Social Proof */}
                <div className="text-center">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-6">
                        Analyzing resumes from candidates at
                    </p>
                    <div className="flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 dark:brightness-200 dark:contrast-200">
                        <span className="font-semibold text-sm">Google</span>
                        <span className="font-semibold text-sm">Linear</span>
                        <span className="font-semibold text-sm">OpenAI</span>
                        <span className="font-semibold text-sm">Netflix</span>
                    </div>
                </div>

                {/* Feature Showcase: "The Artifact" */}
                <div className="w-full max-w-5xl mx-auto mt-32 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="text-center mb-16">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-primary/40 mb-3 block"> The Output </span>
                        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">
                            See what they see. Fix what matters.
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            We don't just give you a generic score. We give you the exact feedback a hiring manager would give you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1: The Scan */}
                        <div className="bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl flex flex-col items-center text-center group hover:border-border transition-colors">
                            <div className="w-12 h-12 bg-rose/10 rounded-xl flex items-center justify-center mb-6 text-rose hover:scale-110 transition-transform">
                                <Eye className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-serif text-xl text-primary mb-3">The 6-Second Scan</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We simulate the quick glance used to filter candidates. See exactly what gets read and what gets skipped.
                            </p>
                        </div>

                        {/* Feature 2: The Score */}
                        <div className="bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl flex flex-col items-center text-center group hover:border-border transition-colors">
                            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-6 text-gold hover:scale-110 transition-transform">
                                <Target className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-serif text-xl text-primary mb-3">The Reality Check</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Get a clear valid signal on your resume's impact and clarity—not detailed grammar rules.
                            </p>
                        </div>

                        {/* Feature 3: The Fix */}
                        <div className="bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl flex flex-col items-center text-center group hover:border-border transition-colors">
                            <div className="w-12 h-12 bg-moss/10 rounded-xl flex items-center justify-center mb-6 text-moss hover:scale-110 transition-transform">
                                <PenTool className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-serif text-xl text-primary mb-3">The Rewrite</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We don't just give advice. We suggest specific text changes to make your experience stand out.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Skim Result Modal */}
            <Dialog open={isSkimOpen} onOpenChange={setIsSkimOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle className="font-serif text-2xl">The 6-Second First Impression</DialogTitle>
                        <DialogDescription>
                            This is what a recruiter sees before they decide to read or reject.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 bg-secondary/20 border-y">
                        {skimData && (
                            <SkimView text={previewText} skimData={skimData} />
                        )}
                    </div>

                    <div className="p-6 flex items-center justify-between bg-background">
                        <div className="text-sm text-muted-foreground">
                            <p>Is this impression strong enough?</p>
                        </div>
                        <Button onClick={handleFullAnalysis} size="lg" className="gap-2">
                            Get Full Audit & Fixes <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Footer */}
            <Footer />
        </div>
    );
}
