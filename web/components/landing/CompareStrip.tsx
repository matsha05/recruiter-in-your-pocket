export default function CompareStrip() {
    return (
        <section className="section bg-white">
            <div className="section-inner">
                <div className="text-center mb-10">
                    <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 rounded-full mb-4">
                        Recruiter-grade insight
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        How this compares to typical resume checkers
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Built by recruiters to show how your story really lands, not to chase keyword scores.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-xl">
                        <h3 className="font-display font-bold text-gray-900 mb-4">Most resume checkers</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="text-gray-400">•</span>
                                Focus on ATS keywords and formatting scores.
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="text-gray-400">•</span>
                                Give generic AI advice you&apos;ve seen before.
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="text-gray-400">•</span>
                                Often require an account before showing value.
                            </li>
                        </ul>
                    </div>

                    <div className="p-6 bg-indigo-50 rounded-xl border-2 border-indigo-200">
                        <h3 className="font-display font-bold text-gray-900 mb-4">Recruiter in Your Pocket</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-indigo-500">✓</span>
                                Shows how your story actually lands to a recruiter.
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-indigo-500">✓</span>
                                Surfaces what&apos;s working and what&apos;s easy to miss.
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-indigo-500">✓</span>
                                Gives before/after bullet upgrades in your own voice.
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-indigo-500">✓</span>
                                Provides clear next steps in plain language.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
