import Link from "next/link";
import { ArrowRight, Check, HelpCircle, PenLine } from "lucide-react";
import { PocketMark } from "@/components/icons";
import { reportPreview, reportSections } from "./content";

const findings = [
    {
        icon: Check,
        label: "What’s working",
        title: "The recent roles read as senior",
        body: "The resume shows broad technical work and increasing responsibility.",
        tone: "text-teal-800",
    },
    {
        icon: HelpCircle,
        label: "One small mystery",
        title: "Recent outcomes are hard to find",
        body: reportPreview.gap,
        tone: "riyp-text-brass",
    },
    {
        icon: PenLine,
        label: "Start here",
        title: "Add the result to two recent lines",
        body: "Start with the work most relevant to the role you want next.",
        tone: "riyp-text-annotation",
    },
] as const;

export function LandingReportSection() {
    return (
        <section
            id="how-it-works"
            aria-labelledby="report-section-title"
            className="border-b border-slate-300 bg-mineral px-5 py-20 md:px-8 md:py-28"
        >
            <div className="mx-auto grid max-w-[1240px] items-start gap-14 lg:grid-cols-[0.48fr_1.52fr] lg:gap-16">
                <div className="lg:sticky lg:top-28">
                    <p className="font-mono text-xs font-semibold uppercase riyp-track-016 text-teal-800">Inside the report</p>
                    <h2 id="report-section-title" className="editors-section-title mt-5 max-w-[23rem] font-display text-slate-950">
                        Useful advice should show its work.
                    </h2>
                    <p className="mt-6 max-w-[27rem] text-base leading-7 text-slate-600">
                        Every finding points back to the page, explains the read, and gives you one useful next move.
                    </p>
                    <ol className="mt-8 border-y border-slate-300">
                        {reportSections.map((section, index) => (
                            <li key={section} className="grid grid-cols-[2.75rem_1fr] border-b border-slate-300/70 py-3.5 text-sm last:border-b-0">
                                <span className="font-mono riyp-type-11px font-semibold text-teal-800">{String(index + 1).padStart(2, "0")}</span>
                                <span className="font-medium text-slate-700">{section}</span>
                            </li>
                        ))}
                    </ol>
                    <Link
                        href="/workspace?sample=1"
                        className="focus-ring group mt-7 inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-400 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-ink hover:bg-ink hover:riyp-text-cream"
                    >
                        Read the complete sample
                        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <article aria-label="Example recruiter report" className="riyp-report-paper overflow-hidden text-ink">
                    <header className="riyp-report-rule flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-9 md:px-12">
                        <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center border border-ink font-display">R</span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <PocketMark className="size-3.5 text-teal-800" />
                                    <p className="riyp-type-0625 font-bold uppercase riyp-track-017">Resume report</p>
                                </div>
                                <p className="mt-1 text-xs text-slate-600">Example candidate · {reportPreview.role}</p>
                            </div>
                        </div>
                        <p className="riyp-type-0625 font-bold uppercase riyp-track-016 text-teal-800">Based only on the resume</p>
                    </header>

                    <div className="px-5 py-8 sm:px-9 md:px-12 md:py-10">
                        <div className="riyp-report-rule grid gap-8 border-b pb-9 md:grid-cols-[1fr_auto] md:gap-12">
                            <div>
                                    <p className="riyp-type-0625 font-bold uppercase riyp-track-017 text-teal-800">Likely takeaway</p>
                                <h3 className="mt-4 max-w-[16ch] font-display riyp-display-section riyp-weight-540 riyp-leading-101 riyp-track-n04 text-slate-950 riyp-stretch-92">
                                    {reportPreview.verdict}
                                </h3>
                            </div>
                            <div className="riyp-report-rule flex items-center justify-between border p-5 md:w-44 md:block md:p-6 md:text-center">
                                <div>
                                    <p className="riyp-type-058 font-bold uppercase riyp-track-015 text-slate-500">Review score</p>
                                    <p className="mt-2 font-display text-4xl leading-none tabular-nums text-slate-950">{reportPreview.score}<span className="text-base text-slate-500">/100</span></p>
                                </div>
                                <div className="md:mt-4">
                                    <p className="text-sm font-bold text-teal-800">{reportPreview.band}</p>
                                    <p className="mt-1 riyp-type-0625 leading-4 text-slate-500">Organizes the review</p>
                                </div>
                            </div>
                        </div>

                        <div className="riyp-report-rule grid border-b md:grid-cols-3 md:divide-x md:divide-[hsl(var(--paper-line))]">
                            {findings.map((finding, index) => (
                                <div
                                    key={finding.label}
                                    className={`riyp-report-rule border-b py-7 last:border-b-0 md:border-b-0 md:px-6 ${index === 0 ? "md:pl-0" : ""} ${index === findings.length - 1 ? "md:pr-0" : ""}`}
                                >
                                    <div className={`flex items-center gap-3 ${finding.tone}`}>
                                        <span className="flex size-7 items-center justify-center rounded-full border border-current">
                                            <finding.icon className="size-3.5" />
                                        </span>
                                        <p className="riyp-type-060 font-bold uppercase riyp-track-016">{finding.label}</p>
                                    </div>
                                    <p className="mt-5 font-display text-2xl leading-tight text-slate-950">{finding.title}</p>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{finding.body}</p>
                                </div>
                            ))}
                        </div>

                        <div className="py-9">
                            <div className="flex items-center justify-between gap-4">
                                <p className="riyp-type-0625 font-bold uppercase riyp-track-017 riyp-text-annotation">Suggested rewrite</p>
                                <span className="riyp-type-060 font-bold uppercase riyp-track-014 text-slate-500">Highest-leverage line</span>
                            </div>
                            <p className="mt-6 text-xs font-semibold uppercase riyp-track-012 text-slate-500">Original</p>
                            <p className="mt-2 font-display text-2xl leading-snug text-slate-500 line-through decoration-[hsl(var(--annotation))] decoration-2">
                                {reportPreview.original}
                            </p>
                            <div className="mt-6 border-l-2 border-teal-800 pl-5">
                                <p className="riyp-type-060 font-bold uppercase riyp-track-015 text-teal-800">Suggested rewrite</p>
                                <p className="mt-2 font-display text-2xl leading-snug text-slate-950">{reportPreview.rewrite}</p>
                            </div>
                        </div>

                        <footer className="riyp-report-rule flex flex-col gap-5 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <p className="max-w-[32rem] text-sm leading-6 text-slate-600">
                                Start with the first recommended edit. Keep only changes you can verify.
                            </p>
                            <Link
                                href="/workspace?sample=1"
                                className="focus-ring group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-bold riyp-text-cream transition-colors hover:bg-teal-900"
                            >
                                Open sample report
                                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>
                        </footer>
                    </div>
                </article>
            </div>
        </section>
    );
}
