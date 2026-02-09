"use client";

import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LandingTrustContent } from "@/components/landing/landingConfig";
import { LandingSectionFrame, LandingSectionTag } from "@/components/landing/sections/SectionPrimitives";

type TrustSectionProps = {
    content: LandingTrustContent;
};

export function TrustSection({ content }: TrustSectionProps) {
    return (
        <LandingSectionFrame tone="ink" density="relaxed" divider="both" className="landing-deep-ink">
            <div className="grid items-start landing-grid-gap lg:grid-cols-[1.02fr_0.98fr]">
                <div className="landing-flow-md">
                    <LandingSectionTag index="03" label="Trust Signals" />
                    <div className="landing-label text-slate-400">{content.eyebrow}</div>
                    <h2 className="landing-title-xl text-slate-50 md:text-[3.1rem]">
                        {content.title}
                    </h2>
                    <p className="landing-copy-inverted max-w-[42rem]">
                        {content.copy}
                    </p>

                    <div className="grid max-w-2xl gap-4 md:grid-cols-2 md:gap-5">
                        {content.testimonials.map((testimonial, index) => (
                            <div
                                key={testimonial.name}
                                className={cn(
                                    "landing-deep-ink-quote",
                                    index === 0 && "md:col-span-2"
                                )}
                            >
                                <Quote className="w-5 h-5 text-brand mb-3" />
                                <p className="text-[16px] leading-[1.62] mb-3 text-slate-100">{testimonial.quote}</p>
                                <div className="text-sm text-slate-300">
                                    <div className="font-medium text-slate-100">{testimonial.name}</div>
                                    <div>{testimonial.role} · {testimonial.company}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="landing-deep-ink-panel landing-flow-md">
                    <div className="landing-label text-slate-400">{content.reasonsLabel}</div>
                    <div className="space-y-3.5">
                        {content.reasons.map((point, index) => (
                            <div key={point} className="flex items-start gap-3">
                                <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand/15 text-[11px] font-semibold text-brand">
                                    {index + 1}
                                </span>
                                <p className="text-[15px] leading-relaxed text-slate-200">{point}</p>
                            </div>
                        ))}
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5">
                        <div className="landing-label text-slate-400">{content.policyLabel}</div>
                        <div className="mt-1 text-sm text-slate-100">{content.policyCopy}</div>
                    </div>
                    <Link
                        href={content.cta.href}
                        className="landing-btn-primary w-fit"
                    >
                        {content.cta.label}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </LandingSectionFrame>
    );
}
