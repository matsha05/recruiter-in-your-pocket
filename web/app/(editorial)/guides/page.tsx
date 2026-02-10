import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import Footer from "@/components/landing/Footer";

/** Paper shadow matching all Editor's Desk cards */
const paperShadow =
    "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)";

const playbooks = [
    {
        title: "Offer Negotiation Playbook",
        subtitle: "All industries",
        readTime: "12 min",
        href: "/guides/offer-negotiation",
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
        href: "/guides/tech-offer-negotiation",
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
        title: "Salary Anchors",
        href: "/research/salary-anchors",
    },
    {
        title: "Structured Interviews Beat Vibes",
        href: "/research/structured-interviews-why-star",
    },
];

export default function GuidesPage() {
    return (
        <>
            <main className="bg-[#FAFAF8] text-slate-900 selection:bg-teal-700/15 pt-28 md:pt-36">

                {/* ── Hero ── */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-[720px]">
                        <div className="max-w-[46rem]">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                <Sparkles className="h-3.5 w-3.5" style={{ color: "#0D7377" }} />
                                For when the stakes are higher
                            </div>
                            <h1
                                className="mt-5 font-display text-slate-900"
                                style={{
                                    fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                                    lineHeight: 1.0,
                                    letterSpacing: "-0.035em",
                                    fontWeight: 400,
                                }}
                            >
                                Scripts and strategies you can use this week
                            </h1>
                            <p className="mt-5 max-w-[41rem] text-[17px] leading-[1.7] text-slate-500">
                                Pick a guide, use the scripts, then run another review and see the difference.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Guide cards ── */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-[720px]">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Guides
                                </p>
                                <h2
                                    className="mt-1 font-display text-slate-900"
                                    style={{
                                        fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
                                        lineHeight: 1.1,
                                        letterSpacing: "-0.025em",
                                        fontWeight: 400,
                                    }}
                                >
                                    Choose your guide
                                </h2>
                            </div>
                            <Link
                                href="/workspace"
                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Start free review
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            {playbooks.map((guide) => (
                                <Link
                                    key={guide.title}
                                    href={guide.href}
                                    className="group rounded-2xl bg-white p-6 block transition-all duration-200 hover:-translate-y-0.5"
                                    style={{ boxShadow: paperShadow }}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            {guide.subtitle}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {guide.readTime}
                                        </span>
                                    </div>
                                    <h3
                                        className="mt-4 font-display text-slate-900 transition-colors group-hover:text-slate-600"
                                        style={{
                                            fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
                                            lineHeight: 1.1,
                                            letterSpacing: "-0.02em",
                                            fontWeight: 400,
                                        }}
                                    >
                                        {guide.title}
                                    </h3>
                                    <ul className="mt-4 space-y-2.5">
                                        {guide.points.map((point) => (
                                            <li key={point} className="flex items-center gap-2.5 text-[15px] leading-[1.65] text-slate-500">
                                                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#0D7377" }} />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                                        Open guide
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Compensation Calculator card */}
                        <div
                            className="mt-5 rounded-2xl bg-white p-6"
                            style={{ boxShadow: paperShadow }}
                        >
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        Tool
                                    </p>
                                    <h3
                                        className="mt-1 font-display text-slate-900"
                                        style={{
                                            fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
                                            lineHeight: 1.1,
                                            letterSpacing: "-0.02em",
                                            fontWeight: 400,
                                        }}
                                    >
                                        Compensation Calculator
                                    </h3>
                                    <p className="mt-2 max-w-[42rem] text-[15px] leading-[1.65] text-slate-500">
                                        Compare multiple offers side by side, see what equity is really worth, and figure out what actually matters to you over 1 and 4 years.
                                    </p>
                                </div>
                                <Link
                                    href="/guides/tools/comp-calculator"
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                                >
                                    Open calculator
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Philosophy — dark section ── */}
                <section
                    className="px-6 py-14 md:px-8 md:py-20"
                    style={{ backgroundColor: "#0F172A" }}
                >
                    <div className="mx-auto max-w-[720px] grid items-start gap-8 lg:grid-cols-[1.02fr_0.98fr]">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                The philosophy
                            </p>
                            <h2
                                className="mt-3 font-display text-white"
                                style={{
                                    fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                                    lineHeight: 1.1,
                                    letterSpacing: "-0.03em",
                                    fontWeight: 400,
                                }}
                            >
                                Written from the recruiter&apos;s side of the table
                            </h2>
                            <p className="mt-4 max-w-[42rem] text-[15px] leading-[1.65] text-slate-400">
                                Most career advice is recycled filler. These guides are grounded in how hiring actually works — the psychology, the incentives, and the language that moves recruiters to act.
                            </p>
                        </div>

                        <div
                            className="rounded-2xl border border-white/10 p-6"
                            style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                        >
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[15px] font-medium text-white">Real scripts, not theory.</p>
                                    <p className="mt-1 text-[14px] leading-relaxed text-slate-400">Every conversation in these guides is something you can actually say.</p>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-[15px] font-medium text-white">Backed by research.</p>
                                    <p className="mt-1 text-[14px] leading-relaxed text-slate-400">Each strategy connects to peer-reviewed evidence on hiring behavior.</p>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-[15px] font-medium text-white">Built for your next conversation.</p>
                                    <p className="mt-1 text-[14px] leading-relaxed text-slate-400">Not a course. Not a webinar. Pick a guide and use it this week.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Connected research ── */}
                <section className="px-6 py-14 md:px-8 md:py-20">
                    <div className="mx-auto max-w-[720px]">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Connected research
                                </p>
                                <h2
                                    className="mt-1 font-display text-slate-900"
                                    style={{
                                        fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
                                        lineHeight: 1.1,
                                        letterSpacing: "-0.025em",
                                        fontWeight: 400,
                                    }}
                                >
                                    Evidence behind the playbooks
                                </h2>
                            </div>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                View all research
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {researchLinks.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="group rounded-2xl bg-white p-6 transition-all duration-200 hover:-translate-y-0.5"
                                    style={{ boxShadow: paperShadow }}
                                >
                                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(13,115,119,0.08)" }}>
                                        <ShieldCheck className="h-4 w-4" style={{ color: "#0D7377" }} />
                                    </div>
                                    <h3
                                        className="font-display text-slate-900 transition-colors group-hover:text-slate-600"
                                        style={{
                                            fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                                            lineHeight: 1.1,
                                            letterSpacing: "-0.02em",
                                            fontWeight: 400,
                                        }}
                                    >
                                        {item.title}
                                    </h3>
                                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                                        Read
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
