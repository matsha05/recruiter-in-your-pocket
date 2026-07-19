import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import Footer from "@/components/landing/Footer";

const playbooks = [
    {
        title: "Offer Negotiation Playbook",
        subtitle: "All industries",
        readTime: "12 min",
        href: "/resources/offer-negotiation",
        points: [
            "A step-by-step negotiation sequence that works everywhere",
            "Word-for-word scripts you can actually use",
            "What to ask for beyond base salary",
        ],
    },
    {
        title: "Tech Compensation Playbook",
        subtitle: "Engineering and product roles",
        readTime: "15 min",
        href: "/resources/tech-offer-negotiation",
        points: [
            "How equity and levels really work",
            "How to frame your total comp, not just salary",
            "How to counter without losing the offer",
        ],
    },
];

const researchLinks = [
    {
        title: "The Referral Advantage",
        href: "/research/referral-advantage",
    },
    {
        title: "Salary History and Anchoring",
        href: "/research/salary-history-bans",
    },
    {
        title: "Structured Interviews Beat Vibes",
        href: "/research/structured-interviews-why-star",
    },
];

export default function GuidesPage() {
    return (
        <>
            <div className="bg-paper pt-28 text-slate-900 selection:bg-brand/15 md:pt-36">

                {/* ── Hero ── */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-[72rem]">
                        <div className="max-w-[46rem]">
                            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase riyp-track-010 text-teal-800">
                                <Sparkles className="size-3.5 text-brand" />
                                Practical career advice
                            </div>
                            <h1 className="mt-5 max-w-[18ch] font-display text-[clamp(3rem,6vw,5.5rem)] riyp-weight-520 leading-[0.96] tracking-[-0.04em] text-slate-950 riyp-stretch-88">
                                Scripts, strategy, and tools for big career conversations
                            </h1>
                            <p className="editorial-copy-lg mt-5 max-w-[41rem] text-slate-500">
                                Negotiation help, compensation context, and straight answers you can use right away.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Guide cards ── */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-[72rem]">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase riyp-track-010 text-teal-800">
                                    Guides
                                </p>
                                <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3.5rem)] riyp-weight-540 leading-[1] tracking-[-0.035em] text-slate-950 riyp-stretch-92">
                                    Choose your guide
                                </h2>
                            </div>
                            <Link
                                href="/workspace"
                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Get free report
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            {playbooks.map((guide) => (
                                <Link
                                    key={guide.title}
                                    href={guide.href}
                                    className="group block border-y border-slate-300 bg-white p-6 transition-colors hover:bg-mineral"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                            <span className="text-xs font-semibold uppercase riyp-track-010 text-slate-500">
                                                {guide.subtitle}
                                            </span>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase riyp-track-010 text-slate-500">
                                            <Clock3 className="size-3.5" />
                                            {guide.readTime}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 font-display text-[clamp(1.5rem,3vw,2rem)] riyp-weight-560 leading-[1.08] tracking-[-0.025em] text-slate-950 riyp-stretch-96 transition-colors group-hover:text-teal-900">
                                        {guide.title}
                                    </h3>
                                    <ul className="mt-4 gap-y-2.5">
                                        {guide.points.map((point) => (
                                            <li key={point} className="flex items-center gap-2.5 text-base leading-7 text-slate-600">
                                                <span className="inline-block size-1.5 rounded-full bg-brand" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                                        Open guide
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Compensation Calculator card */}
                        <div className="mt-5 border-y border-slate-300 bg-white p-6">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase riyp-track-010 text-teal-800">
                                        Tool
                                    </p>
                                    <h3 className="mt-2 font-display text-[clamp(1.5rem,3vw,2rem)] riyp-weight-560 leading-[1.08] tracking-[-0.025em] text-slate-950 riyp-stretch-96">
                                        Compensation Calculator
                                    </h3>
                                    <p className="mt-2 max-w-[42rem] text-base leading-7 text-slate-600">
                                        Compare multiple offers side by side, see what equity is really worth, and figure out what actually matters to you over 1 and 4 years.
                                    </p>
                                </div>
                                <Link
                                    href="/resources/tools/comp-calculator"
                                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-deep"
                                >
                                    Open calculator
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Philosophy  -  dark section ── */}
                <section
                    className="px-6 py-14 md:px-8 md:py-20"
                    style={{ backgroundColor: "hsl(var(--surface-inverted))" }}
                >
                    <div className="mx-auto grid max-w-[72rem] items-start gap-10 lg:grid-cols-[1.02fr_0.98fr]">
                        <div>
                            <p className="text-xs font-semibold uppercase riyp-track-010 riyp-text-teal-bright">
                                The philosophy
                            </p>
                            <h2 className="mt-3 max-w-[14ch] font-display text-[clamp(2.5rem,5vw,4.5rem)] riyp-weight-540 leading-[0.98] tracking-[-0.04em] text-white riyp-stretch-90">
                                Written from the recruiter&apos;s side of the table
                            </h2>
                            <p className="mt-5 max-w-[42rem] text-base leading-7 text-slate-300">
                                Most career advice is either vague or weirdly theatrical. These guides stay grounded in how hiring actually works, what companies respond to, and what is actually worth saying.
                            </p>
                        </div>

                        <div
                            className="rounded-2xl border border-white/10 p-6"
                            style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                        >
                            <div className="gap-y-4">
                                <div>
                                    <p className="text-sm font-medium text-white">Real scripts, not theory.</p>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-300">Every conversation in these guides is something you could actually say out loud.</p>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-sm font-medium text-white">Backed by research.</p>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-300">Each strategy connects to peer-reviewed evidence on hiring behavior.</p>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-sm font-medium text-white">Built for your next conversation.</p>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-300">Not a course. Not a webinar. Pick what you need and use it this week.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Connected research ── */}
                <section className="px-6 py-14 md:px-8 md:py-20">
                    <div className="mx-auto max-w-[72rem]">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase riyp-track-010 text-teal-800">
                                    Connected research
                                </p>
                                <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3.5rem)] riyp-weight-540 leading-[1] tracking-[-0.035em] text-slate-950 riyp-stretch-92">
                                    Evidence behind the playbooks
                                </h2>
                            </div>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                View all research
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {researchLinks.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="group border-y border-slate-300 bg-white p-6 transition-colors hover:bg-mineral"
                                >
                                    <div className="mb-3 inline-flex size-8 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(13,115,119,0.08)" }}>
                                        <ShieldCheck className="size-4 text-brand" />
                                    </div>
                                    <h3 className="font-display text-2xl riyp-weight-560 leading-[1.08] tracking-[-0.025em] text-slate-950 riyp-stretch-96 transition-colors group-hover:text-teal-900">
                                        {item.title}
                                    </h3>
                                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                                        Read
                                        <ArrowRight className="size-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
