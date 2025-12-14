"use client";

import Link from "next/link";
import { StudioShell } from "@/components/layout/StudioShell";
import { Button } from "@/components/ui/button";
import Footer from "@/components/landing/Footer";
import { ShieldCheck, Lock, Trash2, FileText, CheckCircle2 } from "lucide-react";

import { LegalNav } from "@/components/legal/LegalNav";

export default function TrustClient() {
    return (
        <StudioShell showSidebar={false} className="max-w-4xl mx-auto py-20">
            <LegalNav />

            {/* Hero */}
            <header className="mb-24 text-center max-w-2xl mx-auto">
                <h1 className="font-serif text-5xl md:text-6xl font-medium text-foreground mb-6 tracking-tight">
                    Your Data. Your Rules.
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    We built Recruiter in Your Pocket to serve candidates, not to feed data brokers.
                    Here is our promise to you.
                </p>
            </header>

            {/* Core Promises Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-24">
                <PromiseCard
                    icon={ShieldCheck}
                    iconColor="text-moss"
                    title="We verify, we don't sell."
                    description="Your resume is parsed solely to generate feedback. We do not sell your personal data to recruiters, job boards, or third-party advertisers. You are the customer, not the product."
                />
                <PromiseCard
                    icon={Lock}
                    iconColor="text-gold"
                    title="Bank-grade Encryption"
                    description="We use Supabase (Postgres) for data storage, which is encrypted at rest and in transit. Payments are processed by Stripe; we never touch your credit card numbers."
                />
                <PromiseCard
                    icon={Trash2}
                    iconColor="text-rose"
                    title="You own the delete button"
                    description="You can delete your account and all associated data at any time from the Settings page. When you say delete, we mean 'DELETE FROM users WHERE id = ...'."
                />
                <PromiseCard
                    icon={FileText}
                    iconColor="text-primary"
                    title="AI Analysis Policy"
                    description="We use OpenAI to generate resume feedback. Your data is sent to the LLM for analysis but is not used to train OpenAI's public models (via our API usage tier)."
                />
            </div>

            {/* Methodology Divider */}
            <div className="flex items-center justify-center mb-16">
                <div className="h-px bg-border w-24"></div>
                <span className="px-4 text-muted-foreground font-serif italic text-lg">The Philosophy</span>
                <div className="h-px bg-border w-24"></div>
            </div>

            {/* Methodology Section */}
            <section className="bg-surface border border-border/50 rounded-2xl p-8 md:p-12 shadow-sm">
                <div className="max-w-2xl mx-auto">
                    <h2 className="font-serif text-3xl font-medium text-foreground mb-8 text-center">
                        Evidence, then Advice.
                    </h2>
                    <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                        <p>
                            Most career tools use generic rules ("Don't use passive voice").
                            We rely on the <strong>6-Second Skim</strong> heuristic used by top-tier technical recruiters at FAANG companies.
                        </p>
                        <ul className="space-y-4 mt-6">
                            <li className="flex gap-3">
                                <CheckCircle2 className="w-6 h-6 text-moss flex-shrink-0" />
                                <span><strong>Quantification:</strong> Do you use numbers to prove impact? We count them.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 className="w-6 h-6 text-moss flex-shrink-0" />
                                <span><strong>Action Verbs:</strong> Do you lead or just participate? We measure density.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 className="w-6 h-6 text-moss flex-shrink-0" />
                                <span><strong>Brevity:</strong> Can you explain a complex project in 2 lines? We flag bloat.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <div className="mt-32">
                <Footer />
            </div>
        </StudioShell>
    );
}

function PromiseCard({ icon: Icon, iconColor, title, description }: { icon: any, iconColor: string, title: string, description: string }) {
    return (
        <div className="flex flex-col gap-4 p-8 rounded-2xl border border-border/40 bg-card/30 hover:bg-surface hover:border-border/80 hover:shadow-md transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl bg-surface border border-border/50 flex items-center justify-center ${iconColor} shadow-sm`}>
                <Icon className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
                <h3 className="font-medium text-lg text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
