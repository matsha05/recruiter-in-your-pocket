"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { DATA_HANDLING_ROWS, LEGAL_LAST_UPDATED, TRUST_PROMISES } from "@/lib/legal/dataHandling";
import { LegalShell } from "@/components/legal/LegalShell";

export default function SecurityClient() {
    return (
        <LegalShell
            eyebrow="Security and data handling"
            title="Clear rules for data, retention, and control"
            description="What we collect, why we collect it, how long we keep it, and exactly what controls you have."
            lastUpdated={LEGAL_LAST_UPDATED}
            contentClassName="max-w-5xl"
        >
            <section className="landing-card landing-card-pad overflow-x-auto">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Lock className="h-4 w-4 text-brand" />
                    Data handling truth table
                </h2>
                <table className="min-w-[860px] w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/50 text-left text-label-mono text-muted-foreground">
                            <th className="py-2 pr-3 font-semibold">Data type</th>
                            <th className="py-2 pr-3 font-semibold">Purpose</th>
                            <th className="py-2 pr-3 font-semibold">Retention</th>
                            <th className="py-2 pr-3 font-semibold">Your control</th>
                            <th className="py-2 font-semibold">Processor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DATA_HANDLING_ROWS.map((row) => (
                            <tr key={row.dataType} className="border-b border-border/20 align-top">
                                <td className="py-3 pr-3 font-medium text-foreground">{row.dataType}</td>
                                <td className="py-3 pr-3 landing-copy-muted">{row.purpose}</td>
                                <td className="py-3 pr-3 landing-copy-muted">{row.retention}</td>
                                <td className="py-3 pr-3 landing-copy-muted">{row.userControl}</td>
                                <td className="py-3 landing-copy-muted">{row.processor}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="landing-card-soft landing-card-pad">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-brand" />
                    Operational commitments
                </h2>
                <ul className="space-y-2.5 landing-copy-muted">
                    {TRUST_PROMISES.map((line) => (
                        <li key={line} className="flex items-start gap-2">
                            <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </LegalShell>
    );
}
