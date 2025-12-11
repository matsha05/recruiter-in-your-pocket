export default function CompareStrip() {
    return (
        <section className="section section-muted">
            <div className="section-inner">
                <div className="text-center mb-8">
                    <span className="badge-brand inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full mb-3">
                        Recruiter-grade insight
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-2">
                        How this compares to typical resume checkers
                    </h2>
                    <p className="text-secondary max-w-2xl mx-auto text-sm">
                        Built by recruiters to show how your story really lands, not to chase keyword scores.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    {/* Left card - Most resume checkers */}
                    <div className="bg-surface border border-subtle rounded-lg p-5 transition-all duration-200 ease-smooth hover:shadow-card hover:-translate-y-0.5">
                        <h3 className="font-display font-bold text-primary mb-4 text-base">Most resume checkers</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-secondary text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted mt-2 flex-shrink-0"></span>
                                Focus on ATS keywords and formatting scores.
                            </li>
                            <li className="flex items-start gap-3 text-secondary text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted mt-2 flex-shrink-0"></span>
                                Give generic AI advice you&apos;ve seen before.
                            </li>
                            <li className="flex items-start gap-3 text-secondary text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted mt-2 flex-shrink-0"></span>
                                Often require an account before showing value.
                            </li>
                        </ul>
                    </div>

                    {/* Right card - Recruiter in Your Pocket */}
                    <div className="bg-surface border border-subtle rounded-lg p-5 transition-all duration-200 ease-smooth hover:shadow-card hover:-translate-y-0.5">
                        <h3 className="font-display font-bold text-primary mb-4 text-base">Recruiter in Your Pocket</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-secondary text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0"></span>
                                Shows how your story actually lands to a recruiter.
                            </li>
                            <li className="flex items-start gap-3 text-secondary text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0"></span>
                                Surfaces what&apos;s working and what&apos;s easy to miss.
                            </li>
                            <li className="flex items-start gap-3 text-secondary text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0"></span>
                                Gives before/after bullet upgrades in your own voice.
                            </li>
                            <li className="flex items-start gap-3 text-secondary text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0"></span>
                                Provides clear next steps in plain language.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
