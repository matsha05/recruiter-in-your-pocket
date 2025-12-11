export default function ValueStrip() {
    const items = [
        {
            num: "01",
            title: "Clarity Score",
            desc: "See how clearly your story lands on a first read"
        },
        {
            num: "02",
            title: "Recruiter's honest read",
            desc: "What's working, what's buried and what's getting missed"
        },
        {
            num: "03",
            title: "Stronger bullets",
            desc: "Real rewrites you can copy, not generic advice"
        },
        {
            num: "04",
            title: "Clear next steps",
            desc: "Know exactly what to fix in your next editing session"
        }
    ];

    return (
        <section className="section bg-surface" aria-label="What you get">
            <div className="section-inner">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
                    {items.map((item, i) => (
                        <div key={i} className="bg-surface border border-subtle rounded-lg p-5 flex flex-col">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-brand-soft text-brand font-display font-bold text-sm mb-3">
                                {item.num}
                            </span>
                            <h3 className="font-display text-base font-bold text-primary mb-1">
                                {item.title}
                            </h3>
                            <p className="text-sm text-secondary leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
