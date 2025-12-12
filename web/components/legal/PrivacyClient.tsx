"use client";

import Link from "next/link";
import LegalHeader from "@/components/shared/LegalHeader";

export default function PrivacyClient() {
    return (
        <div className="min-h-screen bg-[var(--bg-body)]">
            <LegalHeader />

            <main className="max-w-[680px] mx-auto px-6 pt-12 pb-16 sm:px-4 sm:pt-8 sm:pb-12">
                {/* Header */}
                <header className="mb-10">
                    <h1 className="font-display text-[clamp(28px,5vw,36px)] font-semibold text-[var(--text-primary)] leading-tight mb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-[13px] text-[var(--text-muted)]">Last updated: December 2025</p>
                </header>

                {/* TL;DR - understated summary */}
                <aside className="mb-10 p-5 bg-[var(--bg-section-muted)] rounded-[var(--radius-md)]">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-2">
                        TL;DR
                    </span>
                    <p className="text-[15px] text-[var(--text-primary)] leading-relaxed">
                        We only collect what we need to make the product work. Resume data is processed
                        for feedback and deleted after processing. We don&apos;t sell your info.
                    </p>
                </aside>

                {/* Content */}
                <article className="space-y-10">
                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            1. What We Collect
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-4">
                            When you use Recruiter in Your Pocket, we may collect:
                        </p>
                        <ul className="list-disc pl-5 space-y-2.5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            <li><strong className="text-[var(--text-primary)] font-semibold">Resume text:</strong> The content you paste or upload. This is sent to our AI provider for processing and is not stored on our servers after your feedback is generated.</li>
                            <li><strong className="text-[var(--text-primary)] font-semibold">Job descriptions:</strong> If you provide one for alignment analysis, it&apos;s processed along with your resume and handled the same way.</li>
                            <li><strong className="text-[var(--text-primary)] font-semibold">Email address:</strong> If you sign in, we collect your email to manage your account and purchased passes.</li>
                            <li><strong className="text-[var(--text-primary)] font-semibold">Technical data:</strong> IP address, browser type, device information, and timestamps for security and debugging.</li>
                            <li><strong className="text-[var(--text-primary)] font-semibold">Usage analytics:</strong> Page views and feature usage (via Mixpanel). This does not include your resume content.</li>
                            <li><strong className="text-[var(--text-primary)] font-semibold">Payment info:</strong> Handled securely by Stripe. We do not store your credit card details.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            2. Data Retention
                        </h2>
                        <ul className="list-disc pl-5 space-y-2.5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            <li><strong className="text-[var(--text-primary)] font-semibold">Without an account:</strong> Resume text is processed in memory and not stored after your feedback is generated.</li>
                            <li><strong className="text-[var(--text-primary)] font-semibold">With an account:</strong> Your email and account data are stored until you request deletion.</li>
                            <li><strong className="text-[var(--text-primary)] font-semibold">Logs and analytics:</strong> Technical logs are retained for up to 90 days for debugging and security.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            3. How We Use Your Data
                        </h2>
                        <ul className="list-disc pl-5 space-y-2.5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            <li>To generate AI-powered resume feedback</li>
                            <li>To manage your account and purchased passes</li>
                            <li>To send transactional emails (login codes, receipts)</li>
                            <li>To improve the product using aggregated, anonymized usage data</li>
                            <li>To maintain security and prevent abuse</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            4. What We Don&apos;t Do
                        </h2>
                        <ul className="list-disc pl-5 space-y-2.5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            <li>We don&apos;t sell your personal information</li>
                            <li>We don&apos;t use your resume content to train our own AI models</li>
                            <li>We don&apos;t share your data with third parties for marketing</li>
                        </ul>
                        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mt-4 pt-4 border-t border-[var(--border-subtle)]">
                            <strong className="text-[var(--text-primary)]">Note on AI processing:</strong> Resume content is processed using OpenAI&apos;s API
                            solely to generate feedback. OpenAI may process this data in accordance with their{" "}
                            <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--text-link)] hover:underline">
                                privacy policy
                            </a>. We do not use your resume content to train our own models.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            5. Cookies and Tracking
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-4">We use cookies to:</p>
                        <ul className="list-disc pl-5 space-y-2.5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            <li>Keep you logged in (session cookies)</li>
                            <li>Track your free report usage (persistent cookie)</li>
                            <li>Remember your preferences (like dark mode)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            6. Third-Party Services
                        </h2>
                        <ul className="list-disc pl-5 space-y-2.5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            <li><strong className="text-[var(--text-primary)] font-semibold">OpenAI:</strong> Powers our AI feedback</li>
                            <li><strong className="text-[var(--text-primary)] font-semibold">Stripe:</strong> Handles payments securely</li>
                            <li><strong className="text-[var(--text-primary)] font-semibold">Vercel:</strong> Hosts our application</li>
                            <li><strong className="text-[var(--text-primary)] font-semibold">Mixpanel:</strong> Provides usage analytics</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            7. Your Rights
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-4">You have the right to:</p>
                        <ul className="list-disc pl-5 space-y-2.5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            <li>Request a copy of the data we have about you</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your account and associated data</li>
                            <li>Opt out of marketing communications</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-[17px] font-semibold text-[var(--text-primary)] mb-4 leading-snug">
                            8. Contact
                        </h2>
                        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                            If you have questions about this Privacy Policy or want to exercise your data rights,
                            please reach out via our website.
                        </p>
                    </section>
                </article>

                {/* Footer */}
                <footer className="mt-16 pt-6 border-t border-[var(--border-subtle)] text-center">
                    <p className="text-[14px] text-[var(--text-muted)] mb-2">Made with care in Boulder, CO 🤍</p>
                    <p className="text-[14px] text-[var(--text-muted)]">
                        <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
                        {" · "}
                        <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms of Service</Link>
                    </p>
                </footer>
            </main>
        </div>
    );
}
