"use client";

// SiteHeader removed — layout handles navigation
import Footer from "@/components/landing/Footer";
import { LegalNav } from "@/components/legal/LegalNav";
import { DATA_HANDLING_ROWS, LEGAL_LAST_UPDATED } from "@/lib/legal/dataHandling";

export default function PrivacyClient() {
    return (
        <>
            <main className="max-w-3xl mx-auto px-6 py-12">
                <LegalNav />

                {/* Header */}
                <header className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-4 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                        How we handle your data, in plain English.
                        <br />
                        <span className="text-xs font-mono mt-2 block text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED}</span>
                    </p>
                </header>

                {/* Content */}
                <article className="space-y-12 font-sans text-foreground/90 leading-relaxed">
                    <Section title="1. Scope">
                        This policy describes how Recruiter in Your Pocket processes resume and LinkedIn inputs,
                        account identity, usage data, and billing metadata across the web app.
                    </Section>

                    <Section title="2. Data handling table">
                        <div className="rounded-xl border border-border/50 bg-card p-4 overflow-x-auto mt-3">
                            <table className="min-w-[680px] w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                        <th className="py-2 pr-3">Data Type</th>
                                        <th className="py-2 pr-3">Purpose</th>
                                        <th className="py-2 pr-3">Retention</th>
                                        <th className="py-2">Control</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {DATA_HANDLING_ROWS.map((row) => (
                                        <tr key={row.dataType} className="border-b border-border/20 align-top">
                                            <td className="py-3 pr-3 text-foreground font-medium">{row.dataType}</td>
                                            <td className="py-3 pr-3 text-muted-foreground">{row.purpose}</td>
                                            <td className="py-3 pr-3 text-muted-foreground">{row.retention}</td>
                                            <td className="py-3 text-muted-foreground">{row.userControl}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    <Section title="3. Third-party processors">
                        We currently use OpenAI (model responses), Supabase (auth/database), Stripe (payments and invoices),
                        and Vercel (hosting and runtime infrastructure). Stripe controls card data and invoice retention in its own systems.
                    </Section>

                    <Section title="4. Your controls">
                        You can delete account data from Settings, export account data from Settings, manage billing in Stripe portal,
                        and request help through support.
                        This product does not sell candidate data.
                    </Section>

                    <Section title="5. Contact">
                        Questions about this policy can be sent to support@recruiterinyourpocket.com.
                    </Section>
                </article>
            </main >

            <Footer />
        </>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section>
            <h2 className="font-display text-xl font-medium text-foreground mb-4">{title}</h2>
            <div className="text-[15px] md:text-base text-muted-foreground leading-relaxed">
                {children}
            </div>
        </section>
    )
}
