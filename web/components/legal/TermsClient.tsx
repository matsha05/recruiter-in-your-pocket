"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/dataHandling";
import { LegalShell } from "@/components/legal/LegalShell";

function TermsSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="landing-card landing-card-pad">
            <h2 className="legal-section-title">{title}</h2>
            <div className="landing-copy-muted">{children}</div>
        </section>
    );
}

export default function TermsClient() {
    return (
        <LegalShell
            eyebrow="Terms of service"
            title="Legal terms for using RIYP"
            description="The operating terms for product use, billing, and account behavior."
            lastUpdated={LEGAL_LAST_UPDATED}
        >
            <TermsSection title="1. Acceptance and service scope">
                By using Recruiter in Your Pocket, you agree to these terms. The service provides AI-assisted resume and LinkedIn feedback designed for iteration support, not guaranteed hiring outcomes.
            </TermsSection>

            <TermsSection title="2. User responsibilities">
                <ul className="list-disc space-y-2 pl-5">
                    <li>You are responsible for content submitted for analysis.</li>
                    <li>Do not upload illegal, harmful, or rights-infringing content.</li>
                    <li>Do not attempt to bypass security or abuse system limits.</li>
                    <li>Review AI output for factual and contextual accuracy before use.</li>
                </ul>
            </TermsSection>

            <TermsSection title="3. Privacy and data">
                Privacy behavior is documented at
                {" "}
                <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-brand">/privacy</Link>
                {" "}
                and
                {" "}
                <Link href="/security" className="text-foreground underline underline-offset-4 hover:text-brand">/security</Link>.
                Signed-in usage may store report history until removed by report deletion or account deletion.
            </TermsSection>

            <TermsSection title="4. Payment, unlocks, and refunds">
                One full review is free. Paid plans unlock additional capabilities. Stripe handles billing and invoices.
                If payment succeeds and access appears locked, use
                {" "}
                <Link href="/purchase/restore" className="text-foreground underline underline-offset-4 hover:text-brand">Restore Access</Link>
                {" "}
                before opening support. Refund requests are reviewed case by case.
            </TermsSection>

            <TermsSection title="5. Limits and liability">
                The service is provided as-is. We do not guarantee interviews, offers, or employment outcomes. To the extent permitted by law, liability is limited for indirect or consequential damages.
            </TermsSection>

            <TermsSection title="6. Governing law">
                These terms are governed by the laws of the State of Colorado.
            </TermsSection>
        </LegalShell>
    );
}
