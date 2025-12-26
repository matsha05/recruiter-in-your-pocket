"use client";

import { Quote } from "lucide-react";

interface Testimonial {
    name: string;
    role: string;
    company: string;
    quote: string;
    outcome?: string;
}

const testimonials: Testimonial[] = [
    {
        name: "Marcus Chen",
        role: "Senior Product Manager",
        company: "Stripe → Figma",
        quote: "I'd been getting ghosted for months. Ran my resume through and realized I was burying my biggest wins in generic language. Made the changes, landed 3 interviews that week.",
        outcome: "3 interviews in 1 week"
    },
    {
        name: "Sarah Okonkwo",
        role: "Software Engineer",
        company: "Series B Startup",
        quote: "The 'recruiter first impression' section was brutal but accurate. I was leading with the wrong story. Fixed my top 3 bullets and heard back from a company I'd applied to twice before.",
        outcome: "Callback from dream company"
    },
    {
        name: "James Rivera",
        role: "Director of Engineering",
        company: "Meta",
        quote: "I've reviewed thousands of resumes. This catches what I'd catch in my first 10-second scan — and gives you the fix, not just the problem.",
        outcome: "Hiring manager verified"
    }
];

export function Testimonials() {
    return (
        <section className="py-16 px-6 bg-muted/30">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl md:text-4xl text-primary mb-3 tracking-tight">
                        Real feedback. Real results.
                    </h2>
                    <p className="text-muted-foreground">
                        From job seekers who fixed it before recruiters saw it.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="bg-card border border-border/40 rounded-lg p-6 space-y-4 hover:border-border/60 transition-colors"
                        >
                            <Quote className="w-6 h-6 text-brand/40" />

                            <p className="text-sm text-foreground/90 leading-relaxed">
                                "{t.quote}"
                            </p>

                            {t.outcome && (
                                <div className="inline-block text-xs font-medium text-brand bg-brand/10 px-2 py-1 rounded">
                                    {t.outcome}
                                </div>
                            )}

                            <div className="pt-2 border-t border-border/30">
                                <p className="text-sm font-medium text-foreground">
                                    {t.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t.role} · {t.company}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        <span className="text-foreground font-medium">2,400+</span> resumes reviewed ·
                        <span className="text-foreground font-medium ml-1">89%</span> report actionable changes
                    </p>
                </div>

                {/* Founder Credibility */}
                <div className="mt-6 pt-6 border-t border-border/30 text-center">
                    <p className="text-xs text-muted-foreground">
                        Created by hiring leaders from{' '}
                        <span className="text-foreground font-medium">Google, Meta, and OpenAI</span>{' '}
                        who've screened 100,000+ resumes and made thousands of hires across 15+ years of global recruiting.
                    </p>
                </div>
            </div>
        </section>
    );
}
