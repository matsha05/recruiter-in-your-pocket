export default function ATSEducation() {
    return (
        <section className="section section-muted">
            <div className="section-inner">
                <div className="text-center mb-10">
                    <span className="badge-warning inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full mb-4">
                        From a recruiter who&apos;s read 10,000+ resumes
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
                        The ATS doesn&apos;t reject you. Recruiters do.
                    </h2>
                    <p className="text-secondary max-w-2xl mx-auto">
                        After reviewing resumes at Google, Meta, and OpenAI, here&apos;s what I&apos;ve learned about how hiring actually works.
                    </p>
                </div>

                {/* Myth vs Reality Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <div className="p-5 bg-surface rounded-xl border-l-4 border-l-red-500 border border-subtle">
                        <div className="text-danger font-semibold mb-2">❌ The myth</div>
                        <p className="text-secondary italic text-sm">
                            &quot;75% of resumes are rejected by the Applicant Tracking System before a human ever sees them.&quot;
                        </p>
                    </div>
                    <div className="p-5 bg-surface rounded-xl border-l-4 border-l-success border border-subtle">
                        <div className="text-success font-semibold mb-2">✓ The reality</div>
                        <p className="text-secondary text-sm">
                            An ATS (Applicant Tracking System) is just a database — not a gatekeeper. The best recruiters don&apos;t wait for shortlists. We run keyword searches, pull resumes ourselves, and often share them with hiring managers before even reaching out.
                        </p>
                    </div>
                </div>

                {/* How it actually works - neutral panel with subtle color accents */}
                <div className="bg-muted rounded-xl border border-subtle p-6 mb-8">
                    <h3 className="font-display font-bold text-primary mb-5 text-center">How it actually works</h3>
                    <div className="space-y-3">
                        {/* Step 1 - white row with thin brand left border */}
                        <div className="flex gap-4 items-start p-4 bg-surface rounded-lg border-l-4 border-l-[var(--brand)]/80">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-soft text-brand text-xs font-bold flex-shrink-0">01</span>
                            <div className="flex-1 min-w-0">
                                <strong className="text-primary">The ATS stores applications.</strong>
                                <span className="text-secondary text-sm"> It&apos;s a searchable database, not a filter. High-volume roles may get 500+ applications, but they&apos;re all in there.</span>
                            </div>
                        </div>
                        {/* Step 2 - white row with thin success left border */}
                        <div className="flex gap-4 items-start p-4 bg-surface rounded-lg border-l-4 border-l-success/80">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-success/10 text-success text-xs font-bold flex-shrink-0">02</span>
                            <div className="flex-1 min-w-0">
                                <strong className="text-primary">Good recruiters search actively.</strong>
                                <span className="text-secondary text-sm"> We run keyword searches, skim the top results, and often share promising resumes with hiring managers before reaching out.</span>
                            </div>
                        </div>
                        {/* Step 3 - white row with thin premium left border */}
                        <div className="flex gap-4 items-start p-4 bg-surface rounded-lg border-l-4 border-l-premium/80">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-premium/10 text-premium text-xs font-bold flex-shrink-0">03</span>
                            <div className="flex-1 min-w-0">
                                <strong className="text-primary">Content is the table stakes.</strong>
                                <span className="text-secondary text-sm"> There&apos;s no magic &quot;ATS-ready&quot; formula. If your resume is clear, shows impact, and tells a story — that&apos;s what gets you noticed.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our approach callout */}
                <div className="bg-surface rounded-xl p-5 text-center max-w-2xl mx-auto border border-subtle">
                    <p className="text-secondary text-sm">
                        <strong>Our approach:</strong> We skip the keyword-stuffing theater and show you how a real recruiter reads your resume — what lands, what&apos;s buried, and what to fix. Because <em className="text-brand">clarity</em> is what actually gets you noticed.
                    </p>
                </div>
            </div>
        </section>
    );
}
