"use client";

import Link from "next/link";
import LegalHeader from "@/components/shared/LegalHeader";
import "@/styles/legal.css";

export default function PrivacyClient() {
    return (
        <div className="legal-page">
            <LegalHeader />

            <main className="legal-container">
                {/* Header */}
                <header className="legal-header">
                    <h1 className="legal-title">Privacy Policy</h1>
                    <p className="legal-meta">Last updated: December 2025</p>
                </header>

                {/* TL;DR - understated summary */}
                <aside className="legal-summary">
                    <span className="legal-summary-label">TL;DR</span>
                    <p>
                        We only collect what we need to make the product work. Resume data is processed
                        for feedback and deleted after processing. We don&apos;t sell your info.
                    </p>
                </aside>

                {/* Content */}
                <article className="legal-content">
                    <section className="legal-section">
                        <h2>1. What We Collect</h2>
                        <p>When you use Recruiter in Your Pocket, we may collect:</p>
                        <ul>
                            <li><strong>Resume text:</strong> The content you paste or upload. This is sent to our AI provider for processing and is not stored on our servers after your feedback is generated.</li>
                            <li><strong>Job descriptions:</strong> If you provide one for alignment analysis, it&apos;s processed along with your resume and handled the same way.</li>
                            <li><strong>Email address:</strong> If you sign in, we collect your email to manage your account and purchased passes.</li>
                            <li><strong>Technical data:</strong> IP address, browser type, device information, and timestamps for security and debugging.</li>
                            <li><strong>Usage analytics:</strong> Page views and feature usage (via Mixpanel). This does not include your resume content.</li>
                            <li><strong>Payment info:</strong> Handled securely by Stripe. We do not store your credit card details.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>2. Data Retention</h2>
                        <ul>
                            <li><strong>Without an account:</strong> Resume text is processed in memory and not stored after your feedback is generated.</li>
                            <li><strong>With an account:</strong> Your email and account data are stored until you request deletion.</li>
                            <li><strong>Logs and analytics:</strong> Technical logs are retained for up to 90 days for debugging and security.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>3. How We Use Your Data</h2>
                        <ul>
                            <li>To generate AI-powered resume feedback</li>
                            <li>To manage your account and purchased passes</li>
                            <li>To send transactional emails (login codes, receipts)</li>
                            <li>To improve the product using aggregated, anonymized usage data</li>
                            <li>To maintain security and prevent abuse</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>4. What We Don&apos;t Do</h2>
                        <ul>
                            <li>We don&apos;t sell your personal information</li>
                            <li>We don&apos;t use your resume content to train our own AI models</li>
                            <li>We don&apos;t share your data with third parties for marketing</li>
                        </ul>
                        <p className="legal-note">
                            <strong>Note on AI processing:</strong> Resume content is processed using OpenAI&apos;s API
                            solely to generate feedback. OpenAI may process this data in accordance with their{" "}
                            <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">
                                privacy policy
                            </a>. We do not use your resume content to train our own models.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>5. Cookies and Tracking</h2>
                        <p>We use cookies to:</p>
                        <ul>
                            <li>Keep you logged in (session cookies)</li>
                            <li>Track your free report usage (persistent cookie)</li>
                            <li>Remember your preferences (like dark mode)</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>6. Third-Party Services</h2>
                        <ul>
                            <li><strong>OpenAI:</strong> Powers our AI feedback</li>
                            <li><strong>Stripe:</strong> Handles payments securely</li>
                            <li><strong>Vercel:</strong> Hosts our application</li>
                            <li><strong>Mixpanel:</strong> Provides usage analytics</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>7. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Request a copy of the data we have about you</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your account and associated data</li>
                            <li>Opt out of marketing communications</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>8. Contact</h2>
                        <p>
                            If you have questions about this Privacy Policy or want to exercise your data rights,
                            please reach out via our website.
                        </p>
                    </section>
                </article>

                {/* Footer */}
                <footer className="legal-footer">
                    <p>Made with care in Boulder, CO 🤍</p>
                    <p>
                        <Link href="/">Home</Link>
                        {" · "}
                        <Link href="/terms">Terms of Service</Link>
                    </p>
                </footer>
            </main>
        </div>
    );
}
