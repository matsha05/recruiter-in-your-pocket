export default function CompareStrip() {
    return (
        <section className="section bg-surface">
            <div className="section-inner">
                <div className="text-center mb-10">
                    <span className="badge-brand inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full mb-4">
                        Recruiter-grade insight
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
                        How this compares to typical resume checkers
                    </h2>
                    <p className="text-secondary max-w-2xl mx-auto">
                        Built by recruiters to show how your story really lands, not to chase keyword scores.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-muted rounded-xl">
                        <h3 className="font-display font-bold text-primary mb-4">Most resume checkers</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-secondary">
                                <span className="text-muted">•</span>
                                Focus on ATS keywords and formatting scores.
                            </li>
                            <li className="flex items-start gap-3 text-secondary">
                                <span className="text-muted">•</span>
                                Give generic AI advice you&apos;ve seen before.
                            </li>
                            <li className="flex items-start gap-3 text-secondary">
                                <span className="text-muted">•</span>
                                Often require an account before showing value.
                            </li>
                        </ul>
                    </div>

                    <div className="p-6 bg-brand-soft rounded-xl border-2 border-brand">
                        <h3 className="font-display font-bold text-primary mb-4">Recruiter in Your Pocket</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-primary">
                                <span className="text-brand">✓</span>
                                Shows how your story actually lands to a recruiter.
                            </li>
                            <li className="flex items-start gap-3 text-primary">
                                <span className="text-brand">✓</span>
                                Surfaces what&apos;s working and what&apos;s easy to miss.
                            </li>
                            <li className="flex items-start gap-3 text-primary">
                                <span className="text-brand">✓</span>
                                Gives before/after bullet upgrades in your own voice.
                            </li>
                            <li className="flex items-start gap-3 text-primary">
                                <span className="text-brand">✓</span>
                                Provides clear next steps in plain language.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
