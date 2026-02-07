"use client";

import type { ReactNode } from "react";
import { DATA_HANDLING_ROWS, LEGAL_LAST_UPDATED } from "@/lib/legal/dataHandling";
import { LegalShell } from "@/components/legal/LegalShell";

function PrivacySection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="landing-card landing-card-pad">
            <h2 className="legal-section-title">{title}</h2>
            <div className="landing-copy-muted">{children}</div>
        </section>
    );
}

export default function PrivacyClient() {
    return (
        <LegalShell
            eyebrow="Privacy policy"
            title="How we handle data, in plain English"
            description="What data flows through the product, why it exists, and how you can remove or export it."
            lastUpdated={LEGAL_LAST_UPDATED}
        >
            <PrivacySection title="1. Scope">
                This policy covers resume and LinkedIn inputs, account identity, usage metadata, and billing events used by the web app.
            </PrivacySection>

            <section className="landing-card landing-card-pad overflow-x-auto">
                <h2 className="legal-section-title">2. Data handling table</h2>
                <table className="min-w-[760px] w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/50 text-left text-label-mono text-muted-foreground">
                            <th className="py-2 pr-3">Data type</th>
                            <th className="py-2 pr-3">Purpose</th>
                            <th className="py-2 pr-3">Retention</th>
                            <th className="py-2">Control</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DATA_HANDLING_ROWS.map((row) => (
                            <tr key={row.dataType} className="border-b border-border/20 align-top">
                                <td className="py-3 pr-3 font-medium text-foreground">{row.dataType}</td>
                                <td className="py-3 pr-3 landing-copy-muted">{row.purpose}</td>
                                <td className="py-3 pr-3 landing-copy-muted">{row.retention}</td>
                                <td className="py-3 landing-copy-muted">{row.userControl}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <PrivacySection title="3. Third-party processors">
                OpenAI supports analysis generation, Supabase supports auth/database, Stripe handles billing, and Vercel provides hosting/runtime. Stripe controls card data and billing retention in Stripe systems.
            </PrivacySection>

            <PrivacySection title="4. Your controls">
                You can delete reports, export account data, and delete account data from Settings. The product does not sell candidate data.
            </PrivacySection>

            <PrivacySection title="5. Contact">
                Questions about this policy can be sent to support@recruiterinyourpocket.com.
            </PrivacySection>
        </LegalShell>
    );
}
