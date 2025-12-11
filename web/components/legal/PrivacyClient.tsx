"use client";

import Link from "next/link";
import LegalHeader from "@/components/shared/LegalHeader";

export default function PrivacyClient() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#020617]">
            <LegalHeader />

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                    <p className="text-gray-500">Last updated: December 2024</p>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 mb-8 border border-indigo-100 dark:border-indigo-500/20">
                    <p className="text-gray-700">
                        <strong>TL;DR:</strong> We only collect what we need to make the product work. Resume data is processed for feedback
                        and deleted after processing. We don&apos;t sell your info.
                    </p>
                </div>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">1. What We Collect</h2>
                        <p className="text-gray-600 mb-3">When you use Recruiter in Your Pocket, we may collect:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li><strong>Resume text:</strong> The content you paste or upload. This is sent to our AI provider for processing and is not stored on our servers after your feedback is generated.</li>
                            <li><strong>Job descriptions:</strong> If you provide one for alignment analysis, it&apos;s processed along with your resume and handled the same way.</li>
                            <li><strong>Email address:</strong> If you sign in, we collect your email to manage your account and purchased passes.</li>
                            <li><strong>Technical data:</strong> IP address, browser type, device information, and timestamps for security and debugging.</li>
                            <li><strong>Usage analytics:</strong> Page views and feature usage (via Mixpanel). This does not include your resume content.</li>
                            <li><strong>Payment info:</strong> Handled securely by Stripe. We do not store your credit card details.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">2. Data Retention</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li><strong>Without an account:</strong> Resume text is processed in memory and not stored after your feedback is generated.</li>
                            <li><strong>With an account:</strong> Your email and account data are stored until you request deletion.</li>
                            <li><strong>Logs and analytics:</strong> Technical logs are retained for up to 90 days for debugging and security.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">3. How We Use Your Data</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>To generate AI-powered resume feedback</li>
                            <li>To manage your account and purchased passes</li>
                            <li>To send transactional emails (login codes, receipts)</li>
                            <li>To improve the product using aggregated, anonymized usage data</li>
                            <li>To maintain security and prevent abuse</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">4. What We Don&apos;t Do</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>We don&apos;t sell your personal information</li>
                            <li>We don&apos;t use your resume content to train our own AI models</li>
                            <li>We don&apos;t share your data with third parties for marketing</li>
                        </ul>
                        <p className="text-gray-600 mt-3">
                            <strong>Note on AI processing:</strong> Resume text is sent to OpenAI&apos;s API for analysis. OpenAI may process your data as described in their{" "}
                            <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">privacy policy</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">5. Cookies and Tracking</h2>
                        <p className="text-gray-600 mb-3">We use cookies to:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Keep you logged in (session cookies)</li>
                            <li>Track your free report usage (persistent cookie)</li>
                            <li>Remember your preferences (like dark mode)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">6. Third-Party Services</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li><strong>OpenAI:</strong> Powers our AI feedback</li>
                            <li><strong>Stripe:</strong> Handles payments securely</li>
                            <li><strong>Vercel:</strong> Hosts our application</li>
                            <li><strong>Mixpanel:</strong> Provides usage analytics</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">7. Your Rights</h2>
                        <p className="text-gray-600 mb-3">You have the right to:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Request a copy of the data we have about you</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your account and associated data</li>
                            <li>Opt out of marketing communications</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">8. Contact</h2>
                        <p className="text-gray-600">If you have questions about this Privacy Policy or want to exercise your data rights, please reach out via our website.</p>
                    </section>
                </div>

                <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-[#1F2937] text-center text-sm text-gray-500">
                    <p>Made with care in Boulder, CO 🤍</p>
                    <p className="mt-2">
                        <Link href="/" className="hover:text-indigo-600">Home</Link>
                        {" · "}
                        <Link href="/terms" className="hover:text-indigo-600">Terms of Service</Link>
                    </p>
                </footer>
            </main>
        </div>
    );
}
