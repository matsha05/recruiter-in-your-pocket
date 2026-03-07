"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { DATA_HANDLING_ROWS, LEGAL_LAST_UPDATED, TRUST_PROMISES } from "@/lib/legal/dataHandling";
import { LegalShell } from "@/components/legal/LegalShell";

/** Paper shadow matching all Editor's Desk cards */
const paperShadow =
    "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)";

export default function SecurityClient() {
    return (
        <LegalShell
            eyebrow="Security & data"
            title="How we handle your data"
            description="What we collect, why, how long we keep it, and what you can do about it."
            lastUpdated={LEGAL_LAST_UPDATED}
            contentClassName="max-w-5xl"
        >
            <section
                className="rounded-2xl bg-white p-6 md:p-8 overflow-x-auto"
                style={{ boxShadow: paperShadow }}
            >
                <h2 className="mb-4 flex items-center gap-2 font-display text-slate-900" style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.01em" }}>
                    <Lock className="h-4 w-4 text-slate-400" />
                    What we store and why
                </h2>
                <table className="min-w-[860px] w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-left">
                            <th className="py-2 pr-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Data type</th>
                            <th className="py-2 pr-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Purpose</th>
                            <th className="py-2 pr-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Retention</th>
                            <th className="py-2 pr-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Your control</th>
                            <th className="py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Processor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DATA_HANDLING_ROWS.map((row) => (
                            <tr key={row.dataType} className="border-b border-slate-50 align-top">
                                <td className="py-3 pr-3 font-medium text-slate-700">{row.dataType}</td>
                                <td className="py-3 pr-3 text-[14px] leading-[1.65] text-slate-500">{row.purpose}</td>
                                <td className="py-3 pr-3 text-[14px] leading-[1.65] text-slate-500">{row.retention}</td>
                                <td className="py-3 pr-3 text-[14px] leading-[1.65] text-slate-500">{row.userControl}</td>
                                <td className="py-3 text-[14px] leading-[1.65] text-slate-500">{row.processor}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section
                className="rounded-2xl border border-slate-100 p-6"
                style={{ backgroundColor: "hsl(40 20% 97%)" }}
            >
                <h2 className="mb-3 flex items-center gap-2 font-display text-slate-900" style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.01em" }}>
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    What we commit to
                </h2>
                <ul className="space-y-2.5 text-[14px] leading-[1.65] text-slate-500">
                    {TRUST_PROMISES.map((line) => (
                        <li key={line} className="flex items-start gap-2">
                            <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section
                className="rounded-2xl border border-slate-100 p-6"
                style={{ backgroundColor: "hsl(40 20% 99%)" }}
            >
                <h2 className="mb-3 flex items-center gap-2 font-display text-slate-900" style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.01em" }}>
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    Responsible disclosure
                </h2>
                <p className="text-[14px] leading-[1.65] text-slate-500">
                    If you discover a security issue, please email <a href="mailto:support@recruiterinyourpocket.com" className="underline underline-offset-4 hover:text-slate-900">support@recruiterinyourpocket.com</a> with steps to reproduce it. Our canonical disclosure instructions are also published at <a href="/.well-known/security.txt" className="underline underline-offset-4 hover:text-slate-900">/.well-known/security.txt</a>.
                </p>
            </section>
        </LegalShell>
    );
}
