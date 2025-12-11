export default function ATSEducation() {
    return (
        <section className="section bg-white dark:bg-[#020617]">
            <div className="section-inner">
                <div className="text-center mb-10">
                    <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-[#FBBF77] bg-amber-50 dark:bg-amber-500/10 rounded-full mb-4">
                        From a recruiter who&apos;s read 10,000+ resumes
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        The ATS doesn&apos;t reject you. Recruiters do.
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        After reviewing resumes at Google, Meta, and OpenAI, here&apos;s what I&apos;ve learned about how hiring actually works.
                    </p>
                </div>

                {/* Myth vs Reality Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <div className="p-6 bg-white dark:bg-[#020617] rounded-xl border-l-4 border-l-red-500 border border-gray-200 dark:border-[#1F2937]">
                        <div className="text-red-600 dark:text-[#F87171] font-semibold mb-2">❌ The myth</div>
                        <p className="text-gray-700 italic">
                            &quot;75% of resumes are rejected by the Applicant Tracking System before a human ever sees them.&quot;
                        </p>
                    </div>
                    <div className="p-6 bg-white dark:bg-[#020617] rounded-xl border-l-4 border-l-emerald-500 border border-gray-200 dark:border-[#1F2937]">
                        <div className="text-emerald-600 dark:text-[#4ADE80] font-semibold mb-2">✓ The reality</div>
                        <p className="text-gray-700">
                            An ATS (Applicant Tracking System) is just a database — not a gatekeeper. The best recruiters don&apos;t wait for shortlists. We run keyword searches, pull resumes ourselves, and often share them with hiring managers before even reaching out.
                        </p>
                    </div>
                </div>

                {/* How it actually works */}
                <div className="bg-white dark:bg-[#020617] rounded-xl border border-gray-200 dark:border-[#1F2937] p-6 mb-8">
                    <h3 className="font-display font-bold text-gray-900 mb-6 text-center">How it actually works</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4 items-start p-4 rounded-lg border-l-4 border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10">
                            <span className="text-indigo-500 dark:text-[#818CF8] font-display font-bold text-lg shrink-0">01</span>
                            <div>
                                <strong className="text-gray-900">The ATS stores applications</strong>
                                <p className="text-sm text-gray-600 mt-1">It&apos;s a searchable database, not a filter. High-volume roles may get 500+ applications, but they&apos;re all in there.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start p-4 rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10">
                            <span className="text-emerald-600 dark:text-[#4ADE80] font-display font-bold text-lg shrink-0">02</span>
                            <div>
                                <strong className="text-gray-900">Good recruiters search actively</strong>
                                <p className="text-sm text-gray-600 mt-1">We run keyword searches, skim the top results, and often share promising resumes with hiring managers to gut-check fit before reaching out.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start p-4 rounded-lg border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-500/10">
                            <span className="text-amber-600 dark:text-[#FBBF24] font-display font-bold text-lg shrink-0">03</span>
                            <div>
                                <strong className="text-gray-900">Content is the table stakes</strong>
                                <p className="text-sm text-gray-600 mt-1">There&apos;s no magic &quot;ATS-ready&quot; formula. If your resume is clear, shows impact, and tells a story — that&apos;s what gets you noticed.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our approach callout */}
                <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-6 text-center max-w-2xl mx-auto border border-indigo-100 dark:border-indigo-500/20">
                    <p className="text-gray-700">
                        <strong>Our approach:</strong> We skip the keyword-stuffing theater and show you how a real recruiter reads your resume — what lands, what&apos;s buried, and what to fix. Because <em className="text-indigo-600 dark:text-[#A5B4FC]">clarity</em> is what actually gets you noticed.
                    </p>
                </div>
            </div>
        </section>
    );
}
