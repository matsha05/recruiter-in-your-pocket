import { PocketMark } from "@/components/icons";
import { trustPoints } from "./content";

export function LandingTrustSection() {
    return (
        <section aria-labelledby="trust-title" className="border-b border-slate-300 bg-mineral-strong px-6 py-20 md:px-8 md:py-28">
            <div className="mx-auto grid max-w-[1100px] gap-12 md:grid-cols-[0.72fr_1.28fr] md:gap-20">
                <div>
                    <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
                        <PocketMark className="size-4" />
                        No hidden tricks
                    </div>
                    <h2 id="trust-title" className="editors-section-title max-w-[19rem] font-display text-slate-900">
                        No tricks in the advice—or the fine print.
                    </h2>
                    <p className="mt-5 max-w-[24rem] text-[15px] leading-7 text-slate-600">
                        Your facts stay yours. We explain what is saved, what can be deleted,
                        and exactly when payment is required.
                    </p>
                </div>

                <ol className="border-y border-slate-400/70">
                    {trustPoints.map((point, index) => (
                        <li key={point.title} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-slate-300 py-6 last:border-b-0 sm:grid-cols-[3rem_1fr]">
                            <div className="pt-0.5">
                                <span className="mb-3 block font-mono text-[11px] font-semibold tracking-[0.12em] text-slate-500">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <point.icon aria-hidden="true" className="size-4 text-teal-700" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">{point.title}</h3>
                                <p className="mt-2 max-w-[36rem] text-sm leading-6 text-slate-600">{point.copy}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
