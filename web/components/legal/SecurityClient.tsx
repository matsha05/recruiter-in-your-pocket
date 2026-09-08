"use client";

import Link from "next/link";
import { CheckCircle, LockKey, ShieldCheck } from "@phosphor-icons/react";
import { DATA_HANDLING_ROWS, LEGAL_LAST_UPDATED, TRUST_PROMISES } from "@/lib/legal/dataHandling";
import { LegalShell } from "@/components/legal/LegalShell";

export default function SecurityClient() {
    return (
        <LegalShell
            pageKey="security"
            eyebrow="Security & data"
            title="Security and data handling"
            description="What we collect, who processes it, how long we keep it, and how you can delete it."
            lastUpdated={LEGAL_LAST_UPDATED}
            contentClassName="max-w-5xl"
        >
            <section className="rounded-xl border border-border bg-muted p-4 sm:p-5 md:p-6" aria-labelledby="security-data-table-title">
                <h2 className="mb-5 flex items-center gap-2 font-display text-report-title text-foreground">
                    <LockKey className="size-5 text-brand" weight="bold" />
                    <span id="security-data-table-title">What we store and why</span>
                </h2>
                <div className="divide-y divide-line md:hidden">
                    {DATA_HANDLING_ROWS.map((row) => (
                        <article key={row.dataType} className="py-5 first:pt-1 last:pb-1">
                            <h3 className="text-base font-medium leading-6 text-foreground">{row.dataType}</h3>
                            <dl className="mt-4 grid gap-4">
                                {[
                                    ["Purpose", row.purpose],
                                    ["Retention", row.retention],
                                    ["Your control", row.userControl],
                                    ["Processor", row.processor],
                                ].map(([label, value]) => (
                                    <div key={label} className="grid gap-1">
                                        <dt className="text-label uppercase tracking-wider text-muted-foreground">{label}</dt>
                                        <dd className="text-sm leading-relaxed text-muted-foreground">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </article>
                    ))}
                </div>
                <table className="hidden w-full table-fixed text-sm leading-relaxed md:table">
                    <thead>
                        <tr className="border-b border-line text-left">
                            <th className="py-2 pr-3 text-label uppercase tracking-wider text-muted-foreground">Data type</th>
                            <th className="py-2 pr-3 text-label uppercase tracking-wider text-muted-foreground">Purpose</th>
                            <th className="py-2 pr-3 text-label uppercase tracking-wider text-muted-foreground">Retention</th>
                            <th className="py-2 pr-3 text-label uppercase tracking-wider text-muted-foreground">Your control</th>
                            <th className="py-2 text-label uppercase tracking-wider text-muted-foreground">Processor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DATA_HANDLING_ROWS.map((row) => (
                            <tr key={row.dataType} className="border-b border-line/70 align-top">
                                <td className="py-4 pr-3 font-medium text-foreground">{row.dataType}</td>
                                <td className="py-4 pr-3 text-sm leading-6 text-muted-foreground">{row.purpose}</td>
                                <td className="py-4 pr-3 text-sm leading-6 text-muted-foreground">{row.retention}</td>
                                <td className="py-4 pr-3 text-sm leading-6 text-muted-foreground">{row.userControl}</td>
                                <td className="py-4 text-sm leading-6 text-muted-foreground">{row.processor}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 md:py-9">
                <h2 className="mb-4 flex items-center gap-2 font-display text-report-title text-foreground">
                    <ShieldCheck className="size-5 text-brand" weight="bold" />
                    What we commit to
                </h2>
                <ul className="grid gap-x-8 gap-y-3 text-base text-muted-foreground md:grid-cols-2">
                    {TRUST_PROMISES.map((line) => (
                        <li key={line} className="flex items-start gap-2">
                            <CheckCircle className="mt-1 size-4 shrink-0 text-brand" weight="bold" />
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="rounded-xl border border-border bg-muted px-5 py-6 md:px-6">
                <h2 className="mb-3 flex items-center gap-2 font-display text-report-title text-foreground">
                    <ShieldCheck className="size-5 text-brand" weight="bold" />
                    Responsible disclosure
                </h2>
                <p className="text-base text-muted-foreground">
                    If you discover a security issue, please email <a href="mailto:support@recruiterinyourpocket.com" className="focus-ring rounded-sm text-foreground underline decoration-brand/45 underline-offset-4 hover:text-brand">support@recruiterinyourpocket.com</a> with steps to reproduce it. The same disclosure instructions are published at <Link href="/.well-known/security.txt" className="focus-ring rounded-sm text-foreground underline decoration-brand/45 underline-offset-4 hover:text-brand">/.well-known/security.txt</Link>.
                </p>
            </section>
        </LegalShell>
    );
}
