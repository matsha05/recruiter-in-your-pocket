import Link from "next/link";

export default function SampleReport() {
    return (
        <section className="section bg-section-muted">
            <div className="section-inner flex justify-center">
                <div className="card-lg w-full max-w-lg">
                    <div className="text-center mb-[var(--sp-l)]">
                        <span className="badge-brand inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full">
                            Sample Report Preview
                        </span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-[var(--sp-m)] mb-[var(--sp-l)]">
                        <div className="animate-score-in w-20 h-20 flex items-center justify-center bg-gradient-to-br from-[var(--brand)] to-[var(--brand-strong)] rounded-full shadow-button">
                            <span className="text-3xl font-extrabold text-white">86</span>
                        </div>
                        <div>
                            <div className="text-sm text-secondary">Clarity Score</div>
                            <div className="font-display font-bold text-brand">Strong foundation</div>
                        </div>
                    </div>

                    {/* Subscores */}
                    <div className="flex flex-wrap gap-[var(--sp-s)] mb-[var(--sp-l)]">
                        <div className="subscore-impact subscore-pill">
                            <span className="subscore-pill-label">Impact</span>
                            <span className="subscore-pill-value">82</span>
                        </div>
                        <div className="subscore-clarity subscore-pill">
                            <span className="subscore-pill-label">Clarity</span>
                            <span className="subscore-pill-value">88</span>
                        </div>
                        <div className="subscore-story subscore-pill">
                            <span className="subscore-pill-label">Story</span>
                            <span className="subscore-pill-value">84</span>
                        </div>
                        <div className="subscore-readability subscore-pill">
                            <span className="subscore-pill-label">Readability</span>
                            <span className="subscore-pill-value">90</span>
                        </div>
                    </div>

                    {/* Verdict */}
                    <blockquote className="text-secondary italic border-l-4 border-brand pl-[var(--sp-m)] mb-[var(--sp-l)] bg-[var(--bg-card-alt)] py-[var(--sp-s)] rounded-r-lg">
                        &quot;You read as someone who takes messy workstreams and makes them shippable. Your edge is steady ownership: you keep leaders aligned, run the checklist, and make clear calls.&quot;
                    </blockquote>

                    {/* Best fit roles */}
                    <div className="mb-[var(--sp-l)]">
                        <h4 className="text-sm font-semibold text-primary mb-[var(--sp-s)]">Best fit roles</h4>
                        <div className="flex flex-wrap gap-[var(--sp-s)]">
                            <span className="badge-brand px-3 py-1 text-sm rounded-full">Program Manager</span>
                            <span className="badge-brand px-3 py-1 text-sm rounded-full">Technical PM</span>
                            <span className="badge-brand px-3 py-1 text-sm rounded-full">Product Ops</span>
                        </div>
                    </div>

                    {/* Top fixes */}
                    <div className="mb-[var(--sp-l)]">
                        <h4 className="text-sm font-semibold text-primary mb-[var(--sp-s)]">Top fixes</h4>
                        <ul className="space-y-[var(--sp-s)] text-sm text-secondary">
                            <li className="flex items-start gap-[var(--sp-s)]">
                                <span className="text-warning">→</span>
                                Add scope numbers to your top 2 bullets (teams, users, revenue)
                            </li>
                            <li className="flex items-start gap-[var(--sp-s)]">
                                <span className="text-warning">→</span>
                                State one before/after metric in your headline bullet
                            </li>
                            <li className="flex items-start gap-[var(--sp-s)]">
                                <span className="text-warning">→</span>
                                Add a summary that positions your PM style upfront
                            </li>
                        </ul>
                    </div>

                    <Link href="/workspace?sample=true" className="btn-primary w-full text-center block">
                        See full sample report →
                    </Link>
                </div>
            </div>
        </section>
    );
}
