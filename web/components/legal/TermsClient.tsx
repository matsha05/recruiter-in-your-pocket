"use client";

import Link from "next/link";
import LegalHeader from "@/components/shared/LegalHeader";
import "@/styles/legal.css";

export default function TermsClient() {
    return (
        <div className="legal-page">
            <LegalHeader />

            <main className="legal-container">
                {/* Header */}
                <header className="legal-header">
                    <h1 className="legal-title">Terms of Service</h1>
                    <p className="legal-meta">Last updated: December 2025</p>
                </header>

                {/* Content */}
                <article className="legal-content">
                    <section className="legal-section">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Recruiter in Your Pocket (&quot;the Service&quot;), you agree to be
                            bound by these Terms of Service. If you do not agree to these terms, please do not
                            use the Service.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>2. Description of Service</h2>
                        <p>
                            Recruiter in Your Pocket provides AI-powered resume feedback designed to help you
                            understand how your resume is read by recruiters. The Service analyzes your resume
                            and provides suggestions for improvement based on research into recruiter behavior.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>3. User Responsibilities</h2>
                        <ul>
                            <li>You are responsible for all content you submit to the Service, including resume text and job descriptions.</li>
                            <li>You agree not to submit content that is illegal, harmful, or infringes on others&apos; rights.</li>
                            <li>You agree not to attempt to circumvent any security features or access restrictions.</li>
                            <li>You are responsible for evaluating the accuracy and appropriateness of any AI-generated output before using it.</li>
                            <li>You must be at least 18 years old to use this Service.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>4. Prohibited Uses</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Use the Service to develop competing products or models</li>
                            <li>Scrape, crawl, or extract data from the Service</li>
                            <li>Automate large-scale or bulk requests to the Service</li>
                            <li>Reverse engineer the Service or its underlying technology</li>
                            <li>Resell or redistribute the Service commercially without authorization</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>5. Privacy and Data</h2>
                        <p>
                            Your privacy matters to us. Please review our{" "}
                            <Link href="/privacy">Privacy Policy</Link> to understand how we collect, use,
                            and protect your information.
                        </p>
                        <p>
                            Resume text submitted through the Service is processed temporarily for generating
                            feedback and is deleted automatically after processing.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>6. Payment and Refunds</h2>
                        <ul>
                            <li>The Service offers both free and paid features.</li>
                            <li>Paid passes grant access to additional reports for a limited time.</li>
                            <li>All purchases are final. Refunds are not guaranteed but may be granted at our discretion in cases where the Service could not be accessed due to technical issues.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>7. Intellectual Property</h2>
                        <p>
                            The Service, including its design, features, and content (excluding user-submitted
                            content), is owned by Recruiter in Your Pocket. You retain ownership of your resume
                            content and any text you submit.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>8. Disclaimer of Warranties</h2>
                        <p>
                            The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
                            that our feedback will result in job offers, interviews, or any specific outcome.
                            AI-generated feedback represents one perspective and should be considered alongside
                            other sources.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>9. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, Recruiter in Your Pocket shall not be liable
                            for any indirect, incidental, special, consequential, or punitive damages resulting
                            from your use of the Service.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>10. Governing Law</h2>
                        <p>
                            These Terms shall be governed by the laws of the State of Colorado. Any disputes
                            arising under these Terms will be resolved in the courts of Colorado.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>11. Contact</h2>
                        <p>If you have questions about these Terms, please reach out via our website.</p>
                    </section>
                </article>

                {/* Footer */}
                <footer className="legal-footer">
                    <p>Made with care in Boulder, CO 🤍</p>
                    <p>
                        <Link href="/">Home</Link>
                        {" · "}
                        <Link href="/privacy">Privacy Policy</Link>
                    </p>
                </footer>
            </main>
        </div>
    );
}
