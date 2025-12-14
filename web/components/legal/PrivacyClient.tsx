"use client";

import Link from "next/link";
import { StudioShell } from "@/components/layout/StudioShell";
import { Button } from "@/components/ui/button";

export default function PrivacyClient() {
    return (
        <StudioShell showSidebar={false} className="max-w-3xl mx-auto py-16">
            {/* Nav */}
            <div className="mb-12">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2 -ml-4">
                        ← Back to Home
                    </Button>
                </Link>
            </div>

            {/* Header */}
            <header className="mb-12 border-b border-border/50 pb-8">
                <h1 className="font-serif text-4xl font-medium text-foreground mb-4 tracking-tight">
                    Privacy Policy
                </h1>
                <p className="text-sm text-muted-foreground font-mono">Last updated: December 2025</p>
            </header>

            {/* Content */}
            <article className="space-y-12 font-sans text-foreground/90 leading-relaxed">
                <Section title="1. Introduction">
                    Recruiter in Your Pocket (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy.
                    This Privacy Policy explains how we collect, use, and protect your personal information
                    when you use our resume feedback service.
                </Section>

                <Section title="2. Information We Collect">
                    <ul className="list-disc pl-5 space-y-2 mt-4 ml-2 marker:text-muted-foreground">
                        <li><strong>Resume Data:</strong> The text and content of resumes you upload.</li>
                        <li><strong>Account Info:</strong> Email address and name (if you sign up).</li>
                        <li><strong>Usage Data:</strong> How you interact with our reports and features.</li>
                        <li><strong>Payment Data:</strong> Processed securely by Stripe; we do not store card numbers.</li>
                    </ul>
                </Section>

                <Section title="3. How We Use Your Data">
                    <ul className="list-disc pl-5 space-y-2 mt-4 ml-2 marker:text-muted-foreground">
                        <li>To provide the Feedback and Skim analysis.</li>
                        <li>To allow you to access past reports.</li>
                        <li>To improve the accuracy of our parsing heuristics.</li>
                        <li>To communicate with you about your account (e.g., login codes).</li>
                    </ul>
                </Section>

                <Section title="4. Resume Data Retention">
                    We process resume uploads primarily in-memory for the &quot;Skim&quot; feature.
                    If you are logged in, we store the generated Report for your history.
                    You can delete your account and data at any time.
                </Section>

                <Section title="5. Third-Party Services">
                    We use trusted providers to run our service:
                    <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                        <li><strong>OpenAI:</strong> For generating feedback text.</li>
                        <li><strong>Stripe:</strong> For payment processing.</li>
                        <li><strong>Supabase:</strong> For database and authentication.</li>
                        <li><strong>Vercel:</strong> For hosting.</li>
                    </ul>
                </Section>

                <Section title="6. Your Rights">
                    You have the right to access, correct, or delete your personal data.
                    Contact us if you wish to exercise these rights.
                </Section>

                <Section title="7. Contact Us">
                    If you have questions about this Privacy Policy, please contact us via our website
                    or at support@recruiterinyourpocket.com.
                </Section>
            </article>

            {/* Footer */}
            <footer className="mt-20 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
                <p className="mb-2">Made with care in Boulder, CO 🤍</p>
                <div className="flex justify-center gap-4 text-xs font-medium uppercase tracking-wider">
                    <Link href="/" className="hover:text-foreground">Home</Link>
                    <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
                </div>
            </footer>
        </StudioShell>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section>
            <h2 className="font-serif text-xl font-medium text-foreground mb-4">{title}</h2>
            <div className="text-[15px] md:text-base text-muted-foreground leading-relaxed">
                {children}
            </div>
        </section>
    )
}
