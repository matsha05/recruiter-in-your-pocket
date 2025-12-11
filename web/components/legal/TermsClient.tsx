"use client";

import Link from "next/link";
import LegalHeader from "@/components/shared/LegalHeader";

export default function TermsClient() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#020617]">
            <LegalHeader />

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
                    <p className="text-gray-500">Last updated: December 2024</p>
                </div>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                        <p className="text-gray-600">By accessing and using Recruiter in Your Pocket (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
                        <p className="text-gray-600">Recruiter in Your Pocket provides AI-powered resume feedback and analysis. The Service helps you understand how your resume reads to recruiters and provides suggestions for improvement.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">3. User Responsibilities</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>You are responsible for all content you submit to the Service, including resume text and job descriptions.</li>
                            <li>You agree not to submit content that is illegal, harmful, or infringes on others&apos; rights.</li>
                            <li>You agree not to attempt to circumvent any security features or access restrictions.</li>
                            <li>You are responsible for evaluating the accuracy and appropriateness of any AI-generated output before using it.</li>
                            <li>You must be at least 18 years old to use this Service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">4. Prohibited Uses</h2>
                        <p className="text-gray-600 mb-3">You agree not to:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Use the Service to develop competing products or models</li>
                            <li>Scrape, crawl, or extract data from the Service</li>
                            <li>Automate large-scale or bulk requests to the Service</li>
                            <li>Reverse engineer the Service or its underlying technology</li>
                            <li>Resell or redistribute the Service commercially without authorization</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">5. Privacy and Data</h2>
                        <p className="text-gray-600">
                            Your privacy matters to us. Please review our <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your information.
                        </p>
                        <p className="text-gray-600 mt-2">Resume text submitted through the Service is processed temporarily for generating feedback and is deleted automatically after processing.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">6. Payment and Refunds</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>The Service offers both free and paid features.</li>
                            <li>Paid passes grant access to additional reports for a limited time.</li>
                            <li>All purchases are final. Refunds are not guaranteed but may be granted at our discretion in cases where the Service could not be accessed due to technical issues.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">7. Intellectual Property</h2>
                        <p className="text-gray-600">The Service, including its design, features, and content (excluding user-submitted content), is owned by Recruiter in Your Pocket. You retain ownership of your resume content and any text you submit.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">8. Disclaimer of Warranties</h2>
                        <p className="text-gray-600">The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that our feedback will result in job offers, interviews, or any specific outcome. AI-generated feedback represents one perspective and should be considered alongside other sources.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">9. Limitation of Liability</h2>
                        <p className="text-gray-600">To the maximum extent permitted by law, Recruiter in Your Pocket shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">10. Governing Law</h2>
                        <p className="text-gray-600">These Terms shall be governed by the laws of the State of Colorado. Any disputes arising under these Terms will be resolved in the courts of Colorado.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-3">11. Contact</h2>
                        <p className="text-gray-600">If you have questions about these Terms, please reach out via our website.</p>
                    </section>
                </div>

                <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-[#1F2937] text-center text-sm text-gray-500">
                    <p>Made with care in Boulder, CO 🤍</p>
                    <p className="mt-2">
                        <Link href="/" className="hover:text-indigo-600">Home</Link>
                        {" · "}
                        <Link href="/privacy" className="hover:text-indigo-600">Privacy Policy</Link>
                    </p>
                </footer>
            </main>
        </div>
    );
}
