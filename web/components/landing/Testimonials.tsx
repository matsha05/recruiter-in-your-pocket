export default function Testimonials() {
    const testimonials = [
        {
            text: "I've rewritten my resume probably 20 times. This was the first time something actually told me WHY my bullets weren't landing. Fixed three of them and heard back from two places the same week.",
            author: "Marcus T., software engineer in Austin"
        },
        {
            text: "I was doing the thing where you stare at your resume at 11pm, change a word, change it back. This gave me a clear list and I just... did it. Got an offer three weeks later.",
            author: "Priya S., PM in NYC"
        },
        {
            text: "I hire engineers. I was skeptical, but honestly? This nailed my blind spots. My resume looked good to me because I wrote it. Someone else's eyes caught what I couldn't.",
            author: "David K., eng manager in Seattle"
        },
        {
            text: "I taught high school for 8 years and had no idea how to make that sound relevant for tech. This helped me see what was actually valuable and how to phrase it so recruiters would get it.",
            author: "Rachel M., former teacher, now in customer success"
        }
    ];

    return (
        <section className="section section-muted">
            <div className="section-inner">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-8 text-center">
                    What users are saying
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {testimonials.map((t, i) => (
                        <div key={i} className="card-sm bg-surface border border-subtle rounded-xl p-5">
                            <p className="text-secondary italic mb-4">&quot;{t.text}&quot;</p>
                            <cite className="text-sm text-muted not-italic font-medium">— {t.author}</cite>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
