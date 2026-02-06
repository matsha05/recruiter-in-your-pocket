"use client";

import Link from "next/link";
import { CheckCircle2, Lock, Receipt, ShieldCheck, Trash2 } from "lucide-react";
import { LEGAL_LAST_UPDATED, TRUST_PROMISES } from "@/lib/legal/dataHandling";
import { LegalShell } from "@/components/legal/LegalShell";

const trustBlocks = [
    {
        icon: ShieldCheck,
        title: "Evidence over overclaim",
        body: "Scores are presented as hiring-signal estimates, never guaranteed outcomes.",
    },
    {
        icon: Lock,
        title: "Clear data handling",
        body: "Retention and processor behavior is documented in plain language on Security and Privacy.",
    },
    {
        icon: Receipt,
        title: "Transparent billing controls",
        body: "Checkout, invoices, renewals, and cancellation are managed through Stripe.",
    },
    {
        icon: Trash2,
        title: "User-controlled deletion",
        body: "Delete account removes reports and usage history from our app database.",
    },
];

export default function TrustClient() {
    return (
        <LegalShell
            eyebrow="Trust"
            title="Trust, in operational terms"
            description="What we claim, where to verify it, and what controls you have in-product."
            lastUpdated={LEGAL_LAST_UPDATED}
        >
            <section className="grid gap-4 md:grid-cols-2">
                {trustBlocks.map((block) => (
                    <div key={block.title} className="landing-card landing-card-pad">
                        <div className="mb-2 flex items-center gap-2">
                            <block.icon className="h-4 w-4 text-brand" />
                            <h2 className="text-sm font-semibold text-foreground">{block.title}</h2>
                        </div>
                        <p className="landing-copy-muted">{block.body}</p>
                    </div>
                ))}
            </section>

            <section className="landing-card-soft landing-card-pad">
                <h2 className="mb-3 text-sm font-semibold text-foreground">Commitments</h2>
                <ul className="space-y-2.5 landing-copy-muted">
                    {TRUST_PROMISES.map((line) => (
                        <li key={line} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="landing-card landing-card-pad">
                <p className="landing-copy-muted">
                    Verify details in
                    {" "}
                    <Link href="/security" className="text-foreground underline underline-offset-4 hover:text-brand">Security</Link>
                    {" · "}
                    <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-brand">Privacy</Link>
                    {" · "}
                    <Link href="/terms" className="text-foreground underline underline-offset-4 hover:text-brand">Terms</Link>
                    {" · "}
                    <Link href="/methodology" className="text-foreground underline underline-offset-4 hover:text-brand">Methodology</Link>.
                </p>
            </section>
        </LegalShell>
    );
}
