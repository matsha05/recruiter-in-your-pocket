import Link from "next/link";

export default function SampleReport() {
    return (
        <section className="section bg-muted">
            <div className="section-inner flex justify-center">
                <div className="w-full max-w-lg p-8 bg-surface rounded-2xl shadow-card border border-subtle">
                    <div className="text-center mb-6">
                        <span className="badge-brand inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full">
                            Sample Report Preview
                        </span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-[var(--brand)] to-[var(--brand-strong)] rounded-full">
                            <span className="text-3xl font-extrabold text-white">86</span>
                        </div>
                        <div>
                            <div className="text-sm text-muted">Clarity Score</div>
                            <div className="font-display font-bold text-brand">Strong foundation</div>
                        </div>
                    </div>

                    {/* Subscores */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                            <span className="text-secondary">Impact</span>
                            <span className="font-semibold text-success">82</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                            <span className="text-secondary">Clarity</span>
                            <span className="font-semibold text-success">88</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                            <span className="text-secondary">Story</span>
                            <span className="font-semibold text-success">84</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                            <span className="text-secondary">Readability</span>
                            <span className="font-semibold text-brand">90</span>
                        </div>
                    </div>

                    {/* Verdict */}
                    <blockquote className="text-secondary italic border-l-4 border-brand pl-4 mb-6">
                        &quot;You read as someone who takes messy workstreams and makes them shippable. Your edge is steady ownership: you keep leaders aligned, run the checklist, and make clear calls.&quot;
                    </blockquote>

                    {/* Best fit roles */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-primary mb-2">Best fit roles</h4>
                        <div className="flex flex-wrap gap-2">
                            <span className="badge-brand px-3 py-1 text-sm rounded-full">Program Manager</span>
                            <span className="badge-brand px-3 py-1 text-sm rounded-full">Technical PM</span>
                            <span className="badge-brand px-3 py-1 text-sm rounded-full">Product Ops</span>
                        </div>
                    </div>

                    {/* Top fixes */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-primary mb-2">Top fixes</h4>
                        <ul className="space-y-2 text-sm text-secondary">
                            <li className="flex items-start gap-2">
                                <span className="text-warning">→</span>
                                Add scope numbers to your top 2 bullets (teams, users, revenue)
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-warning">→</span>
                                State one before/after metric in your headline bullet
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-warning">→</span>
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
