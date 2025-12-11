import Link from "next/link";

export default function SampleReport() {
    return (
        <section className="section bg-gray-50">
            <div className="section-inner flex justify-center">
                <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-card border border-gray-100">
                    <div className="text-center mb-6">
                        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 rounded-full">
                            Sample Report Preview
                        </span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full">
                            <span className="text-3xl font-extrabold text-white">86</span>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Clarity Score</div>
                            <div className="font-display font-bold text-indigo-600">Strong foundation</div>
                        </div>
                    </div>

                    {/* Subscores */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                            <span className="text-gray-600">Impact</span>
                            <span className="font-semibold text-emerald-600">82</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                            <span className="text-gray-600">Clarity</span>
                            <span className="font-semibold text-emerald-600">88</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                            <span className="text-gray-600">Story</span>
                            <span className="font-semibold text-emerald-600">84</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                            <span className="text-gray-600">Readability</span>
                            <span className="font-semibold text-purple-600">90</span>
                        </div>
                    </div>

                    {/* Verdict */}
                    <blockquote className="text-gray-600 italic border-l-4 border-indigo-500 pl-4 mb-6">
                        &quot;You read as someone who takes messy workstreams and makes them shippable. Your edge is steady ownership: you keep leaders aligned, run the checklist, and make clear calls.&quot;
                    </blockquote>

                    {/* Best fit roles */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Best fit roles</h4>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full">Program Manager</span>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full">Technical PM</span>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full">Product Ops</span>
                        </div>
                    </div>

                    {/* Top fixes */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Top fixes</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500">→</span>
                                Add scope numbers to your top 2 bullets (teams, users, revenue)
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500">→</span>
                                State one before/after metric in your headline bullet
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500">→</span>
                                Add a summary that positions your PM style upfront
                            </li>
                        </ul>
                    </div>

                    <Link href="/workspace?sample=true" className="btn-primary w-full">
                        See full sample report →
                    </Link>
                </div>
            </div>
        </section>
    );
}
