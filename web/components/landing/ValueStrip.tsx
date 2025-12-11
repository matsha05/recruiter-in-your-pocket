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
        <section className="section bg-white" aria-label="What you get">
            <div className="section-inner">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-10 max-w-3xl mx-auto">
                    {items.map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <span className="font-display text-2xl font-bold text-gold">
                                {item.num}
                            </span>
                            <h3 className="font-display text-lg font-bold text-gray-900">
                                {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
