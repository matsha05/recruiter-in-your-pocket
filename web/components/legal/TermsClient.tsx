"use client";

import Link from "next/link";
import { StudioShell } from "@/components/layout/StudioShell";
import { Button } from "@/components/ui/button";
import Footer from "@/components/landing/Footer";

import { LegalNav } from "@/components/legal/LegalNav";

export default function TermsClient() {
    return (
        <StudioShell showSidebar={false} className="max-w-3xl mx-auto py-16">
            <LegalNav />

            {/* Header */}
            <header className="mb-20 text-center max-w-2xl mx-auto">
                <h1 className="font-display text-5xl md:text-6xl font-medium text-foreground mb-6 tracking-tight">
                    Terms of Service
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    The legal agreements that power our service.
                    <br />
                    <span className="text-sm font-mono mt-2 block opacity-70">Last updated: December 2025</span>
                </p>
            </header>

            {/* Content */}
            <article className="space-y-12 font-sans text-foreground/90 leading-relaxed">
                <Section title="1. Acceptance of Terms">
                    By accessing and using Recruiter in Your Pocket (&quot;the Service&quot;), you agree to be
                    bound by these Terms of Service. If you do not agree to these terms, please do not
                    use the Service.
                </Section>

                <Section title="2. Description of Service">
                    Recruiter in Your Pocket provides AI-powered resume feedback designed to help you
                    understand how your resume is read by recruiters. The Service analyzes your resume
                    and provides suggestions for improvement based on research into recruiter behavior.
                </Section>

                <Section title="3. User Responsibilities">
                    <ul className="list-disc pl-5 space-y-2 mt-4 ml-2 marker:text-muted-foreground">
                        <li>You are responsible for all content you submit to the Service.</li>
                        <li>You agree not to submit content that is illegal, harmful, or infringes on others&apos; rights.</li>
                        <li>You agree not to attempt to circumvent any security features.</li>
                        <li>You are responsible for evaluating the accuracy of any AI-generated output.</li>
                        <li>You must be at least 18 years old to use this Service.</li>
                    </ul>
                </Section>

                <Section title="4. Prohibited Uses">
                    You agree not to:
                    <ul className="list-disc pl-5 space-y-2 mt-4 ml-2 marker:text-muted-foreground">
                        <li>Use the Service to develop competing products or models.</li>
                        <li>Scrape, crawl, or extract data from the Service.</li>
                        <li>Automate large-scale or bulk requests.</li>
                        <li>Reverse engineer the Service.</li>
                    </ul>
                </Section>

                <Section title="5. Privacy and Data">
                    Your privacy matters to us. Please review our <Link href="/privacy" className="underline underline-offset-4 decoration-muted-foreground hover:decoration-primary transition-colors">Privacy Policy</Link>.
                    <br /><br />
                    Resume text submitted through the Service is processed temporarily for generating
                    feedback and is deleted automatically after processing.
                </Section>

                <Section title="6. Payment and Refunds">
                    The Service offers both free and paid features. All purchases are final. Refunds are not guaranteed but may be granted at our discretion.
                </Section>

                <Section title="7. Intellectual Property">
                    The Service is owned by Recruiter in Your Pocket. You retain ownership of your resume content.
                </Section>

                <Section title="8. Disclaimer">
                    The Service is provided &quot;as is&quot; without warranties. We do not guarantee job offers.
                </Section>

                <Section title="9. Limitation of Liability">
                    We shall not be liable for any indirect damages resulting from your use of the Service.
                </Section>

                <Section title="10. Governing Law">
                    These Terms shall be governed by the laws of the State of Colorado.
                </Section>
            </article>

            {/* Footer */}
            <div className="mt-20">
                <Footer />
            </div>
        </StudioShell>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section>
            <h2 className="font-display text-xl font-medium text-foreground mb-4">{title}</h2>
            <div className="text-[15px] md:text-base text-muted-foreground leading-relaxed">
                {children}
            </div>
        </section>
    )
}
