"use client";

import Link from "next/link";
import LegalHeader from "@/components/shared/LegalHeader";

export default function TermsClient() {
    return (
        <div className="min-h-screen bg-[var(--bg-body)]">
            <LegalHeader />

            <main className="max-w-[680px] mx-auto px-6 pt-12 pb-16 sm:px-4 sm:pt-8 sm:pb-12">
                {/* Header */}
                <header className="mb-10">
                    <h1 className="font-display text-[clamp(28px,5vw,36px)] font-semibold text-[var(--text-primary)] leading-tight mb-2">
                        Terms of Service
                    </h1>
                    <p className="text-[13px] text-[var(--text-muted)]">Last updated: December 2025</p>
                </header>

                {/* Content */}
                <article className="space-y-10">
                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            By accessing and using Recruiter in Your Pocket (&quot;the Service&quot;), you agree to be
                            bound by these Terms of Service. If you do not agree to these terms, please do not
                            use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            2. Description of Service
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            Recruiter in Your Pocket provides AI-powered resume feedback designed to help you
                            understand how your resume is read by recruiters. The Service analyzes your resume
                            and provides suggestions for improvement based on research into recruiter behavior.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            3. User Responsibilities
                        </h2>
                        <ul className="list-disc pl-5 space-y-2.5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            <li>You are responsible for all content you submit to the Service, including resume text and job descriptions.</li>
                            <li>You agree not to submit content that is illegal, harmful, or infringes on others&apos; rights.</li>
                            <li>You agree not to attempt to circumvent any security features or access restrictions.</li>
                            <li>You are responsible for evaluating the accuracy and appropriateness of any AI-generated output before using it.</li>
                            <li>You must be at least 18 years old to use this Service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            4. Prohibited Uses
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-4">You agree not to:</p>
                        <ul className="list-disc pl-5 space-y-2.5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            <li>Use the Service to develop competing products or models</li>
                            <li>Scrape, crawl, or extract data from the Service</li>
                            <li>Automate large-scale or bulk requests to the Service</li>
                            <li>Reverse engineer the Service or its underlying technology</li>
                            <li>Resell or redistribute the Service commercially without authorization</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            5. Privacy and Data
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-4">
                            Your privacy matters to us. Please review our{" "}
                            <Link href="/privacy" className="text-[var(--text-link)] hover:underline">Privacy Policy</Link> to understand how we collect, use,
                            and protect your information.
                        </p>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            Resume text submitted through the Service is processed temporarily for generating
                            feedback and is deleted automatically after processing.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            6. Payment and Refunds
                        </h2>
                        <ul className="list-disc pl-5 space-y-2.5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            <li>The Service offers both free and paid features.</li>
                            <li>Paid passes grant access to additional reports for a limited time.</li>
                            <li>All purchases are final. Refunds are not guaranteed but may be granted at our discretion in cases where the Service could not be accessed due to technical issues.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            7. Intellectual Property
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            The Service, including its design, features, and content (excluding user-submitted
                            content), is owned by Recruiter in Your Pocket. You retain ownership of your resume
                            content and any text you submit.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            8. Disclaimer of Warranties
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
                            that our feedback will result in job offers, interviews, or any specific outcome.
                            AI-generated feedback represents one perspective and should be considered alongside
                            other sources.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            9. Limitation of Liability
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            To the maximum extent permitted by law, Recruiter in Your Pocket shall not be liable
                            for any indirect, incidental, special, consequential, or punitive damages resulting
                            from your use of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            10. Governing Law
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            These Terms shall be governed by the laws of the State of Colorado. Any disputes
                            arising under these Terms will be resolved in the courts of Colorado.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            11. Contact
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            If you have questions about these Terms, please reach out via our website.
                        </p>
                    </section>
                </article>

                {/* Footer */}
                <footer className="mt-16 pt-6 border-t border-[var(--border-subtle)] text-center">
                    <p className="text-[14px] text-[var(--text-muted)] mb-2">Made with care in Boulder, CO 🤍</p>
                    <p className="text-[14px] text-[var(--text-muted)]">
                        <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
                        {" · "}
                        <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link>
                    </p>
                </footer>
            </main>
        </div>
    );
}
